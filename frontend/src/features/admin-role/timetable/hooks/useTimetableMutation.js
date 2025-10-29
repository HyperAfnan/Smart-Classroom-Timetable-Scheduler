import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";
import axios from "axios";
import { times as TIMES, days as DAYS } from "../constants.js";
import {
	validateTimetableRows,
	ensureTeacherNamesExist,
} from "./useTimetableValidation.js";

const algoUrl = import.meta.env.VITE_BACKEND_URL;

// Transforms raw timetable data from API response into structured format
function transformTimetableData(response) {
	const result = {};
	if (!response || !response.student_timetables) {
		console.log("No response or student_timetables found.");
		return result;
	}
	for (const classObj of response.student_timetables) {
		const classId = String(classObj.class_id);
		result[classId] = {};
		for (let dayIdx = 0; dayIdx < DAYS.length; dayIdx++) {
			const dayName = DAYS[dayIdx];
			result[classId][dayName] = {};
			for (let slotIdx = 0; slotIdx < TIMES.length; slotIdx++) {
				const raw =
					classObj.timetable[dayIdx] && classObj.timetable[dayIdx][slotIdx]
						? classObj.timetable[dayIdx][slotIdx]
						: null;
				const slot = raw && raw.is_free ? null : raw;
				result[classId][dayName][TIMES[slotIdx]] = slot;
			}
		}
	}
	return result;
}

async function fetchTimeSlots(department_id) {
	const { data, error } = await supabase
		.from("time_slots")
		.select("*")
		.eq("department_id", department_id);

	if (error) {
		console.error("Error fetching time slots:", error);
		throw new Error("Failed to fetch time slots");
	}

	return data || [];
}

function useTimeSlots(department_id) {
	return useQuery({
		queryKey: queryKeys.timeSlots.detail(department_id),
		queryFn: () => fetchTimeSlots(department_id),
	});
}

async function fetchTeacheProfiles(department_id) {
	const { data, error } = await supabase
		.from("teacher_profile")
		.select("*")
		.eq("department_id", department_id);

	if (error) {
		console.error("Error fetching time slots:", error);
		throw new Error("Failed to fetch time slots");
	}

	return data || [];
}

function useTeacheProfiles(department_id) {
	return useQuery({
		queryKey: queryKeys.teachers.byDepartment(department_id),
		queryFn: () => fetchTeacheProfiles(department_id),
	});
}

/**
 * Transforms the raw output from the timetable generator directly into a flat
 * array of rows suitable for a display table or a simplified database schema.
 *
 * @param {Array<Object>} generatorOutput The JSON array data from the generator.
 * @param {Array<Object>} timeSlots The time slots data from the database, used to map
 *   (day, slot_index) to a specific time_slot_id.
 * @returns {Array<Object>} A flat array of timetable entry rows with names.
 */
function transformGeneratorOutputToRows(
	generatorOutput,
	timeSlots,
	teacherNameToEmpId,
	department_id,
) {
	console.log("Transforming generator output to rows:", timeSlots);
	const rows = [];
	const dayToIndex = {
		Monday: 0,
		Tuesday: 1,
		Wednesday: 2,
		Thursday: 3,
		Friday: 4,
		Saturday: 5,
		Sunday: 6,
	};

	const timeSlotIdMap = new Map();
	for (const ts of timeSlots || []) {
		if (ts.day === undefined || ts.slot === undefined) continue;
		const key = `${dayToIndex[ts.day]}::${ts.slot}`;
		timeSlotIdMap.set(key, ts.id);
	}

	for (const classData of generatorOutput || []) {
		for (const dayArray of classData.timetable || []) {
			for (const slotData of dayArray) {
				if (slotData.is_free || !slotData.class_name) {
					continue;
				}

				const timeSlotKey = `${slotData.day}::${slotData.slot}`;
				const time_slot_id = timeSlotIdMap.get(timeSlotKey);

				if (time_slot_id === undefined) {
					console.warn("Could not find time_slot_id for:", slotData);
					continue;
				}

				const teacherEmpId = teacherNameToEmpId?.[slotData.teacher_name];
				if (!teacherEmpId) {
					console.warn(
						`Could not find employee ID for teacher: "${slotData.teacher_name}". Skipping this entry.`,
					);
					continue;
				}

				const row = {
					class_name: slotData.class_name,
					time_slot_id: time_slot_id,
					subject_name: slotData.subject_name,
					teacher_name: slotData.teacher_name,
					room_id: String(slotData.room_name),
					type: slotData.session_type === "lecture" ? "Theory" : "Lab",
					department_id: department_id,
				};

				rows.push(row);
			}
		}
	}

	return rows;
}

// Function to create a timetable entry by calling the external API
async function createTimetableEntry(
	department_id,
	timeSlots,
	teacher_profiles,
	body,
) {
	let rawTimetable;
	try {
		const url = `${algoUrl.replace(/\/$/, "")}/generate-timetable/studentwise/department/${department_id}`;
		rawTimetable = (await axios.post(url, body)).data;
	} catch (timetableError) {
		console.error("Error while generating timetable:", timetableError);
		throw new Error(
			`Error while generating timetable: ${timetableError.message}`,
		);
	}

	const teacherNameToEmpId = {};
	for (const profile of teacher_profiles) {
		teacherNameToEmpId[profile.name] = profile.name;
	}
	// Transform the raw timetable data
	const timetableRows = transformGeneratorOutputToRows(
		rawTimetable.student_timetables,
		timeSlots,
		teacherNameToEmpId,
		department_id,
	);

	// Pre-insert validation: ensure teacher names exist, then detect conflicts
	ensureTeacherNamesExist(timetableRows, teacher_profiles, {
		throwOnMissing: true,
		log: true,
	});
	validateTimetableRows({
		rows: timetableRows,
		timeSlots,
		teacher_profiles,
		throwOnConflict: true,
		log: true,
	});
	console.log("Making the selection query to check existing entries");
	supabase
		.from("timetable_entries")
		.select("*")
		.eq("department_id", department_id)
		.then(({ data: selectionData, error: selectionError }) => {
			console.log("Selection Data:", selectionData);

			if (selectionError) {
				console.error(
					"Error checking existing timetable entries:",
					selectionError,
				);
				throw new Error("Failed to check existing timetable entries");
			}

			if (selectionData.length > 0) {
				console.log(
					`Existing timetable entries found for department_id ${department_id}. They will be deleted before inserting new entries.`,
				);
				// Delete existing entries for the department
				return supabase
					.from("timetable_entries")
					.delete("*")
					.eq("department_id", department_id);
			} else {
				console.log(
					`No existing timetable entries found for department_id ${department_id}. Proceeding to insert new entries.`,
				);
			}
			// If no entries to delete, resolve with null
			return Promise.resolve(null);
		})
		.then((deletionResult) => {
			if (deletionResult && deletionResult.error) {
				console.error(
					"Error deleting existing timetable entries:",
					deletionResult.error,
				);
				throw new Error("Failed to delete existing timetable entries");
			}
			// Upsert the transformed timetable data into the database
			return supabase
				.from("timetable_entries")
				.insert(timetableRows, { onConflict: "class_name,time_slot_id" })
				.select();
		})
		.then(({ error: insertionError }) => {
			if (insertionError) {
				console.error("Error upserting timetable entries:", insertionError);
				throw new Error("Failed to upsert timetable entries");
			}
		})
		.catch((err) => {
			// Handle any errors from the chain
			console.error("Error in timetable mutation:", err);
		});
	const transformedTimetable = transformTimetableData(rawTimetable);
	return transformedTimetable;
}

export default function useTimetableMutation(department_id) {
	const queryClient = useQueryClient();
	const {
		data: timeSlots,
		isLoading,
		isError,
		error,
	} = useTimeSlots(department_id);
	const {
		data: teacher_profiles,
		isLoading: teacher_profile_loading,
		isError: teacher_profile_iserror,
		error: teacher_profile_error,
	} = useTeacheProfiles(department_id);
	const {
		mutateAsync: createTimetableEntryAsync,
		isPending: creating,
		isError: isCreateError,
		error: createError,
	} = useMutation({
		mutationKey: [
			...queryKeys.timetableEntries.list(),
			"generate",
			String(department_id),
		],
		mutationFn: (body) =>
			// NOTE: Replace hardcoded values with dynamic input as needed, put thees setting in the
			//  department table in supabase, and have a ui for this to get from the user
			createTimetableEntry(department_id, timeSlots, teacher_profiles, {
				days: 5,
				slots_per_day: 7,
				max_hours_per_day: 7,
				max_hours_per_week: 35,
			}),
		onSuccess: () =>
			queryClient.invalidateQueries({
				queryKey: queryKeys.timetableEntries.list(),
			}),
	});

	return {
		createTimetableEntryAsync,
		isLoading: creating || isLoading || teacher_profile_loading,
		isError: isCreateError || isError || teacher_profile_iserror,
		error: createError || error || teacher_profile_error,
	};
}

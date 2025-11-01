import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";
import { useSelector } from "react-redux";

/**
 * Timetable Viewer data hook
 *
 * Provides functions that fetch and cache (via React Query) the data needed by the timetable viewer:
 * - classes
 * - time_slots
 * - timetable_entries (joined with time_slots)
 *
 */

async function fetchClasses(department_id) {
	const { data, error } = await supabase
		.from("classes")
		.select("*")
		.eq("department_id", department_id)
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(error.message || "Failed to fetch classes");
	}
	return data ?? [];
}

async function fetchTimeslots(department_id) {
	//TODO: aligh this data order with the existing data order
	const { data, error } = await supabase
		.from("time_slots")
		.select("*")
		.eq("department_id", department_id)
		.order("day", { ascending: true })
		.order("slot", { ascending: true });

	if (error) {
		throw new Error(error.message || "Failed to fetch time slots");
	}
	return data ?? [];
}

async function fetchTimetableEntries(department_id) {
	const { data, error } = await supabase
		.from("timetable_entries")
		.select("*, time_slots(*)")
		.eq("department_id", department_id);

	if (error) {
		console.error("Error While Fetching timetable_entries: ", error);
		throw new Error(
			`Error While Fetching timetable_entries: ${error.message}`,
		);
	}

	return data || [];
}

export default function useTimetableViewer() {
	const department_id = useSelector((state) => state.auth.user?.department_id);

	const classesQuery = useQuery({
		queryKey: queryKeys.classes.all,
		staleTime: 60_000, // 1 minute
		queryFn: () => fetchClasses(department_id),
	});

	const timeSlotsQuery = useQuery({
		queryKey: queryKeys.timeSlots.all,
		staleTime: 60_000,
		queryFn: () => fetchTimeslots(department_id),
	});

	const timetableQuery = useQuery({
		queryKey: [queryKeys.timetableEntries.all],
		queryFn: () => fetchTimetableEntries(department_id),
		staleTime: 60_000,
	});

	return {
		isLoading:
			timetableQuery.isPending ||
			timeSlotsQuery.isPending ||
			classesQuery.isPending,
		isError:
			timetableQuery.isError ||
			timeSlotsQuery.isError ||
			classesQuery.isError,
		error: timetableQuery.error || timeSlotsQuery.error || classesQuery.error,
		timetableEntries: timetableQuery.data,
		timeSlots: timeSlotsQuery.data,
		classes: classesQuery.data,
	};
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where, writeBatch, doc } from "firebase/firestore";
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
  console.log("Fetching time_slots for department_id:", department_id);
  
  // TEMPORARY: Fetch ALL time_slots to diagnose
  const qAll = query(collection(db, "time_slots"));
  const snapshotAll = await getDocs(qAll);
  console.log("Total time_slots in DB:", snapshotAll.size);
  if (snapshotAll.size > 0) {
    const sample = snapshotAll.docs[0].data();
    console.log("Sample time_slot:", sample);
  }
  
  const q = query(
      collection(db, "time_slots"),
      where("departmentId", "==", department_id)
  );
  const snapshot = await getDocs(q);
  console.log("time_slots matching department_id:", snapshot.size);
  
  const data = [];
  snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
  });
  return data;
}

async function fetchTeacheProfiles(department_id) {
  const q = query(
      collection(db, "teacher_profile"),
      where("departmentId", "==", department_id)
  );
  const snapshot = await getDocs(q);
  const data = [];
  snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
  });

  return data;
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
  
  // Create normalization map for times index inference
  const normalizeTime = (t) => {
      if(!t) return "";
      const [h, m] = String(t).split(":");
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  };
  const timesIndexMap = new Map();
  // Ensure TIMES is imported/available. It is imported at top of file.
  TIMES.forEach((t, i) => timesIndexMap.set(normalizeTime(t), i));

  const timeSlotIdMap = new Map();
  console.log("Processing TimeSlots from DB:", timeSlots?.length);
  
  for (const ts of timeSlots || []) {
    let dayIndex = ts.day;
    if (typeof dayIndex === 'string') {
        const d = ts.day.trim();
        dayIndex = dayToIndex[d];
        if (dayIndex === undefined) {
             // Try case-insensitive?
             const titleCase = d.charAt(0).toUpperCase() + d.slice(1).toLowerCase();
             dayIndex = dayToIndex[titleCase];
        }
    }
    
    if (dayIndex === undefined) {
         // console.warn("Slipping time slot, unknown day:", ts.day);
         continue;
    }

    let slotIndex = ts.slot;
    if (slotIndex === undefined) {
        // Try to infer slot index from start time
        const start = ts.startTime || ts.start_time || ts.from || ts.start;
        if(start) {
            const norm = normalizeTime(start);
            if(timesIndexMap.has(norm)) {
                slotIndex = timesIndexMap.get(norm);
            }
        }
    }

    if (slotIndex !== undefined) {
      const key = `${dayIndex}::${slotIndex}`;
      timeSlotIdMap.set(key, ts.id);
    }
  }
  
  console.log("TimeSlot Map Size:", timeSlotIdMap.size);

  for (const classData of generatorOutput || []) {
    for (const dayArray of classData.timetable || []) {
      for (const slotData of dayArray) {
        if (slotData.is_free || !slotData.class_name) {
          continue;
        }

        let algoDay = slotData.day;
        if (typeof algoDay === 'string') {
           // If algorithm returns "Monday", convert to 0, if possible.
           const mapped = dayToIndex[algoDay];
           if(mapped !== undefined) algoDay = mapped;
        }

        const timeSlotKey = `${algoDay}::${slotData.slot}`;
        const time_slot_id = timeSlotIdMap.get(timeSlotKey);

        if (time_slot_id === undefined) {
          console.warn("Could not find time_slot_id for:", slotData);
          continue;
        }

        const row = {
          className: slotData.class_name ?? "",
          timeSlotId: time_slot_id,
          subjectName: slotData.subject_name ?? "",
          teacherName: slotData.teacher_name ?? "", 
          roomId: String(slotData.room_name ?? ""),
          roomNumber: String(slotData.room_name ?? ""),
          type: slotData.session_type === "lecture" ? "Theory" : "Lab",
          departmentId: department_id,
          class_name: slotData.class_name ?? "", 
        };

        rows.push(row);
      }
    }
  }
  
  console.log(`Generated ${rows.length} timetable rows for insertion.`);
  return rows;
}

// Function to create a timetable entry by calling the external API
async function createTimetableEntry(department_id, queryClient, body) {
  if (!algoUrl) {
    throw new Error("VITE_BACKEND_URL is not defined in environment variables");
  }
  if (!department_id) {
    throw new Error("Department ID is currently unavailable. Please ensure you are logged in correctly.");
  }

  // Fetch dependencies via QueryClient to use cache if available
  const timeSlots = await queryClient.fetchQuery({
    queryKey: queryKeys.timeSlots.detail(department_id),
    queryFn: () => fetchTimeSlots(department_id),
  });
  const teacher_profiles = await queryClient.fetchQuery({
    queryKey: queryKeys.teachers.byDepartment(department_id),
    queryFn: () => fetchTeacheProfiles(department_id),
  });

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
  // Pre-insert validation: ensure teacher names exist, then detect conflicts
  ensureTeacherNamesExist(timetableRows, teacher_profiles, {
    throwOnMissing: false,
    log: true,
  });
  validateTimetableRows({
    rows: timetableRows,
    timeSlots,
    teacher_profiles,
    throwOnConflict: false, // Don't block display on conflicts for now
    log: true,
  });
  
  // OPTIMISTIC UPDATE: Update cache immediately with new data
  // We need to join time_slots data to the rows because useTimetable expects it
  const timeSlotMap = new Map(timeSlots.map(ts => [ts.id, ts]));
  const cacheData = timetableRows.map(row => ({
    ...row,
    time_slots: timeSlotMap.get(row.timeSlotId) || null,
    // Add a temporary ID if needed, or just let useTimetable handle missing IDs
    id: `temp-${Math.random()}` 
  }));

  console.log("Setting Query Data for key:", queryKeys.timetableEntries.detail(department_id));
  console.log("Cache Data Size:", cacheData.length);

  queryClient.setQueryData(
    queryKeys.timetableEntries.detail(department_id),
    cacheData
  );

  // Check and delete existing entries
  try {
      const q = query(
          collection(db, "timetable_entries"),
          where("departmentId", "==", department_id) // Consistently use departmentId (camelCase) if possible, but let's check what was used. 
          // Previous code used 'department_id' (snake_case) in query.
          // transformGeneratorOutputToRows now produces departmentId.
          // We should probably check BOTH or stick to one.
          // Let's stick to what was there: department_id. But wait, I changed row to departmentId.
          // If I change the field name in DB, I must query by that new field name.
          // So I will query by `departmentId` here.
      );
      // Also check for legacy snake_case just in case
      const qLegacy = query(
        collection(db, "timetable_entries"),
        where("department_id", "==", department_id)
      );
      
      const [snapshot, snapshotLegacy] = await Promise.all([
          getDocs(q),
          getDocs(qLegacy)
      ]);
      
      const batch = writeBatch(db);
      let deleteCount = 0;

      const addToBatch = (doc) => {
          batch.delete(doc.ref);
          deleteCount++;
      };

      snapshot.forEach(addToBatch);
      snapshotLegacy.forEach(addToBatch);

      if (deleteCount > 0) {
          console.log(
            `Existing timetable entries found (${deleteCount}) for department ${department_id}. Deleting...`
          );
          await batch.commit();
      } else {
          console.log(
            `No existing timetable entries found for department ${department_id}. Proceeding to insert.`
          );
      }
      
      // Insert new entries
      const chunkSize = 400; 
      for (let i = 0; i < timetableRows.length; i += chunkSize) {
          const chunk = timetableRows.slice(i, i + chunkSize);
          const insertBatch = writeBatch(db);
          chunk.forEach((row) => {
              const newRef = doc(collection(db, "timetable_entries"));
              insertBatch.set(newRef, row);
          });
          await insertBatch.commit();
      }
      
  } catch (err) {
      console.error("Error in timetable mutation DB ops:", err);
      // Note: We updated the cache optimistically. If DB fails, we should probably revert or invalidate.
      // For now, let's invalidate on error to fetch what's actually in DB (which might be nothing if delete succeeded but insert failed).
      // queryClient.invalidateQueries({
      //   queryKey: queryKeys.timetableEntries.detail(department_id),
      // });
      throw new Error(`Failed to save timetable: ${err.message}`);
  }
  const transformedTimetable = transformTimetableData(rawTimetable);
  return transformedTimetable;
}

export default function useTimetableMutation(department_id) {
  const queryClient = useQueryClient();

  const {
    mutateAsync: createTimetableEntryAsync,
    isPending: creating,
    isError: isCreateError,
    error: createError,
  } = useMutation({
    mutationKey: [
      ...queryKeys.timetableEntries.detail(department_id), // Use detail key
      "generate",
    ],
    mutationFn: () =>
      // NOTE: Replace hardcoded values with dynamic input as needed
      createTimetableEntry(department_id, queryClient, {
        days: 5,
        slots_per_day: 7,
        max_hours_per_day: 7,
        max_hours_per_week: 35,
      }),
    onSuccess: () => {
      // Invalidate all timetable queries to update both generator and viewer
      queryClient.invalidateQueries({
        queryKey: queryKeys.timetableEntries.all,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.timetableEntries.detail(department_id),
      });
    }
  });

  return {
    createTimetableEntryAsync,
    isLoading: creating,
    isError: isCreateError,
    error: createError,
  };
}

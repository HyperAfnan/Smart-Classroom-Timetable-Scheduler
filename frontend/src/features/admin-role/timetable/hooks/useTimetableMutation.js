import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";
import axios from "axios";
import { times as TIMES, days as DAYS } from "../constants.js";

const algoUrl = import.meta.env.VITE_BACKEND_URL;

// Transforms raw timetable data from API response into structured format
function transformTimetableData(response) {
   console.log("transformTimetableData called with:", { response, DAYS, TIMES });
   const result = {};
   if (!response || !response.student_timetables) {
      console.log("No response or student_timetables found.");
      return result;
   }
   for (const classObj of response.student_timetables) {
      const classId = String(classObj.class_id);
      console.log("Processing classObj:", classObj);
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
            console.log(
               `Class ${classId}, Day ${dayName}, Time ${TIMES[slotIdx]}:`,
               { raw, slot },
            );
            result[classId][dayName][TIMES[slotIdx]] = slot;
         }
      }
   }
   return result;
}

// Function to create a timetable entry by calling the external API
async function createTimetableEntry(department_id, body) {
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

   // Transform the raw timetable data
   const transformedTimetable = transformTimetableData(rawTimetable);
   return transformedTimetable;
}

export default function useTimetableMutation(department_id) {
   const queryClient = useQueryClient();
   const {
      mutateAsync: createTimetableEntryAsync,
      isLoading: creating,
      isError: isCreateError,
      error: createError,
   } = useMutation({
      mutationKey: [queryKeys.timetable, "create"],
      mutationFn: (body) =>
         createTimetableEntry(department_id, {
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
      creating,
      isCreateError,
      createError,
   };
}

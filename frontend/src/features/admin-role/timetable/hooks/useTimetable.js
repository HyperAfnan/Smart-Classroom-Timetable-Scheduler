import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import useClasses from "../../classes/hooks/useClasses.js";
import useTeachers from "../../teachers/hooks/useTeachers.js";
import { useRooms } from "../../rooms/hooks/useRoom.js";
import useSubjects from "../../subjects/hooks/useSubjects.js";
import { days as DEFAULT_DAYS, times as DEFAULT_TIMES } from "../constants.js";

const EMPTY = Object.freeze([]);

const timetableKeys = Object.freeze({
   timeSlots: ["time_slots"],
   generation: ["timetable", "generation"],
});

async function fetchTimeSlots() {
   const { data, error } = await supabase.from("time_slots").select("*");
   if (error) throw new Error(error.message || "Failed to load time slots");
   return data ?? [];
}

/**
 * organizeTimetable transforms various API response formats into:
 *  { [classId]: { [dayName]: { [timeString]: Slot } } }
 *
 * Supported inputs:
 * - { student_timetables: [{ class_id, timetable: dayIndex -> slots[] }] }
 * - { combined_view: [{ day: number, slot: number, assignments: [...] }] }
 * - Flat arrays: Slot[]
 */
function makeOrganizer(days = DEFAULT_DAYS, times = DEFAULT_TIMES) {
   return function organizeTimetable(data) {
      const organized = {};
      data.student_timetables.forEach((classData) => {
         const classId = String(classData.class_id);
         if (!organized[classId]) organized[classId] = {};

         classData.timetable.forEach((daySlots, dayIndex) => {
            const day = days[dayIndex] ?? String(dayIndex);
            if (!organized[classId][day]) organized[classId][day] = {};
            daySlots.forEach((slot, slotIndex) => {
               const time = times[slotIndex] ?? String(slotIndex);
               if (!slot.is_free) {
                  organized[classId][day][time] = {
                     ...slot,
                     class_id: classId,
                     day,
                     start_time: time,
                     type: "Theory",
                  };
               }
            });
         });
      });
      return organized;
   };
}

/**
 * Assemble the generation payload using fetched entities.
 * Ensures subject_hours and subject_teachers have string keys for FastAPI validation.
 */
function makePayloadAssembler(days = DEFAULT_DAYS, times = DEFAULT_TIMES) {
   return function assemblePayload({
      classes = EMPTY,
      teachers = EMPTY,
      subjects = EMPTY,
      rooms = EMPTY,
      timeSlots = EMPTY,
      subjectHours,
      subjectTeacherMap,
   } = {}) {
      const teacher_names = teachers.map((t) => t?.name ?? "Unknown");
      const subject_names = subjects.map((s) => s?.subject_name ?? "Subject");
      const class_names = classes.map(
         (c) =>
            c?.class_name ||
            `${c?.department || "Class"}-${c?.section || "A"}${c?.semester || ""}`,
      );
      const room_names = rooms.map((r) => String(r?.room_number ?? r?.id ?? ""));

      const uniqueDays =
         Array.isArray(timeSlots) && timeSlots.length > 0
            ? Array.from(new Set(timeSlots.map((s) => s.day)))
            : days.slice(0, 5).map((_, i) => i); // default indices [0..4]

      const slotsPerDay =
         Array.isArray(timeSlots) && timeSlots.length > 0
            ? timeSlots.filter((s) => s.day === timeSlots[0].day).length
            : Math.min(times.length, 6);

      let computedSubjectHours = {};
      if (subjectHours && typeof subjectHours === "object") {
         computedSubjectHours = subjectHours;
      } else {
         subjects.forEach((s, idx) => {
            const hours =
               typeof s?.hours_per_week === "number"
                  ? s.hours_per_week
                  : idx % 2 === 0
                     ? 3
                     : 4;
            computedSubjectHours["" + idx] = parseInt(hours, 10);
         });
      }

      // subject_teachers: by default map to teachers in same department or fallback [0]
      let computedSubjectTeachers = {};
      if (subjectTeacherMap && typeof subjectTeacherMap === "object") {
         Object.entries(subjectTeacherMap).forEach(([k, arr]) => {
            computedSubjectTeachers["" + k] = Array.isArray(arr)
               ? arr
                  .map((i) => parseInt(i, 10))
                  .filter((v) => Number.isFinite(v) && v >= 0)
               : [];
         });
      } else {
         const teacherByDept = new Map();
         teachers.forEach((t, idx) => {
            const dept = t?.department ?? "__unknown__";
            if (!teacherByDept.has(dept)) teacherByDept.set(dept, []);
            teacherByDept.get(dept).push(idx);
         });
         subjects.forEach((s, idx) => {
            const dept = s?.department ?? "__unknown__";
            const candidates = teacherByDept.get(dept) ?? [];
            const key = "" + idx;
            computedSubjectTeachers[key] = candidates.length > 0 ? candidates : [0];
         });
      }

      return {
         num_classes: parseInt(classes.length, 10) || 1,
         days: uniqueDays.length || 5,
         slots_per_day: slotsPerDay || 6,
         total_rooms: parseInt(rooms.length, 10) || 1,
         total_teachers: parseInt(teachers.length, 10) || 1,
         subject_hours: Object.fromEntries(
            Object.entries(computedSubjectHours).map(([k, v]) => ["" + k, v]),
         ),
         subject_teachers: Object.fromEntries(
            Object.entries(computedSubjectTeachers).map(([k, v]) => ["" + k, v]),
         ),
         subject_names,
         teacher_names,
         class_names: class_names.length > 0 ? class_names : ["Class A"],
         room_names,
      };
   };
}

/**
 * ID to display helpers
 */
function makeNameGetters({
   teachers = EMPTY,
   subjects = EMPTY,
   rooms = EMPTY,
} = {}) {
   const getTeacherName = (id) => {
      if (id === undefined || id === null) return "";
      const teacher = teachers.find((t) => String(t?.id) === String(id));
      return teacher?.name ?? `Teacher ${id}`;
   };
   const getSubjectName = (id) => {
      if (id === undefined || id === null) return "Free";
      const subject = subjects.find((s) => String(s?.id) === String(id));
      return subject?.subject_name ?? `Subject ${id}`;
   };
   const getRoomNumber = (id) => {
      if (id === undefined || id === null) return "";
      const room = rooms.find((r) => String(r?.id) === String(id));
      return room?.room_number ?? `Room ${id}`;
   };
   return { getTeacherName, getSubjectName, getRoomNumber };
}

// Transform backend timetable data to frontend format
function transformTimetableData(response, days, times) {
   const result = {};
   if (!response || !response.student_timetables) return result;
   for (const classObj of response.student_timetables) {
      const classId = String(classObj.class_id);
      result[classId] = {};
      for (let dayIdx = 0; dayIdx < days.length; dayIdx++) {
         const dayName = days[dayIdx];
         result[classId][dayName] = {};
         for (let slotIdx = 0; slotIdx < times.length; slotIdx++) {
            const raw =
               classObj.timetable[dayIdx] && classObj.timetable[dayIdx][slotIdx]
                  ? classObj.timetable[dayIdx][slotIdx]
                  : null;
            const slot = raw && raw.is_free ? null : raw;
            result[classId][dayName][times[slotIdx]] = slot;
         }
      }
   }
   return result;

}
/**
 * Main hook
 */
export default function useTimetable({
   days = DEFAULT_DAYS,
   times = DEFAULT_TIMES,
   endpointUrl = `${import.meta.env.VITE_BACKEND_URL}generate-timetable/studentwise`,
   classesQueryOptions = {},
   teachersQueryOptions = {},
   subjectsQueryOptions = {},
   roomsQueryOptions = {},
   timeSlotsQueryOptions = {},
   generationOptions,
} = {}) {
   const queryClient = useQueryClient();
   const { classesQuery } = useClasses({ ...classesQueryOptions });
   const { teachersQuery } = useTeachers({ ...teachersQueryOptions });
   const { subjectsQuery } = useSubjects({ ...subjectsQueryOptions });
   const { roomsQuery } = useRooms({ ...roomsQueryOptions });

   const timeSlotsQuery = useQuery({
      queryKey: timetableKeys.timeSlots,
      queryFn: fetchTimeSlots,
      staleTime: 10 * 60_000,
      ...timeSlotsQueryOptions,
   });

   const isLoading = Boolean(
      classesQuery.isLoading ||
      teachersQuery.isLoading ||
      subjectsQuery.isLoading ||
      roomsQuery.isLoading ||
      timeSlotsQuery.isLoading,
   );
   const isError = Boolean(
      classesQuery.isError ||
      teachersQuery.isError ||
      subjectsQuery.isError ||
      roomsQuery.isError ||
      timeSlotsQuery.isError,
   );
   const error =
      classesQuery.error ||
      teachersQuery.error ||
      subjectsQuery.error ||
      roomsQuery.error ||
      timeSlotsQuery.error ||
      null;

   const refetchAll = async () => {
      const [c, t, s, r, ts] = await Promise.all([
         classesQuery.refetch(),
         teachersQuery.refetch(),
         subjectsQuery.refetch(),
         roomsQuery.refetch(),
         timeSlotsQuery.refetch(),
      ]);
      return {
         classes: c.data ?? EMPTY,
         teachers: t.data ?? EMPTY,
         subjects: s.data ?? EMPTY,
         rooms: r.data ?? EMPTY,
         timeSlots: ts.data ?? EMPTY,
      };
   };

   const organizeTimetable = makeOrganizer(days, times);
   const assemblePayload = makePayloadAssembler(days, times);
   const { getTeacherName, getSubjectName, getRoomNumber } = makeNameGetters({
      teachers: teachersQuery.data ?? EMPTY,
      subjects: subjectsQuery.data ?? EMPTY,
      rooms: roomsQuery.data ?? EMPTY,
   });

   const generationStatus = useMutation({
      mutationKey: timetableKeys.generation,
      mutationFn: async (variables = {}) => {
         // variables can be: { payload?, overrides?, endpointUrl? }
         const {
            payload, // optional pre-built payload
            overrides, // optional partial overrides that will be shallow-merged into assembled payload
            endpoint = endpointUrl, // allow per-call override of endpoint
         } = variables;

         let body;
         if (payload && typeof payload === "object") {
            body = payload;
         } else {
            const assembled = assemblePayload({
               classes: classesQuery.data ?? EMPTY,
               teachers: teachersQuery.data ?? EMPTY,
               subjects: subjectsQuery.data ?? EMPTY,
               rooms: roomsQuery.data ?? EMPTY,
               timeSlots: timeSlotsQuery.data ?? EMPTY,
            });
            body = overrides ? { ...assembled, ...overrides } : assembled;
         }

         const resp = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
         });

         if (!resp.ok) {
            let message = `Backend error: ${resp.status}`;
            try {
               const errText = await resp.text();
               message = errText || message;
            } catch {
               // ignore parse errors
            }
            throw new Error(message);
         }

         const result = await resp.json();
         // Transform backend data to frontend format
         const organized = transformTimetableData(result, days, times);
         return {
            raw: result,
            organized,
         };
      },
      onSuccess: async (_, __, ___) => {
         // Invalidate any cache that depends on timetable after generation
         await Promise.all([
            queryClient.invalidateQueries({ queryKey: timetableKeys.timeSlots }),
            // Optionally: invalidate classes/rooms/teachers/subjects if generation can affect them
            // queryClient.invalidateQueries({ queryKey: timetableKeys.classes }),
            // queryClient.invalidateQueries({ queryKey: timetableKeys.rooms }),
            // queryClient.invalidateQueries({ queryKey: timetableKeys.teachers }),
            // queryClient.invalidateQueries({ queryKey: timetableKeys.subjects }),
         ]);
         if (generationOptions?.onSuccess) {
            generationOptions.onSuccess(...arguments);
         }
      },
      onError: (err, variables, context) => {
         if (generationOptions?.onError) {
            generationOptions.onError(err, variables, context);
         }
      },
      ...generationOptions,
   });

   return {
      data: {
         classes: classesQuery.data ?? EMPTY,
         teachers: teachersQuery.data ?? EMPTY,
         subjects: subjectsQuery.data ?? EMPTY,
         rooms: roomsQuery.data ?? EMPTY,
         timeSlots: timeSlotsQuery.data ?? EMPTY,
      },
      queries: {
         classesQuery,
         teachersQuery,
         subjectsQuery,
         roomsQuery,
         timeSlotsQuery,
      },
      isLoading,
      isError,
      error,
      refetchAll,
      // Helpers
      assemblePayload,
      organizeTimetable,
      getTeacherName,
      getSubjectName,
      getRoomNumber,
      // Mutation
      generate: generationStatus.mutate,
      generateAsync: generationStatus.mutateAsync,
      generationStatus,
   };
}

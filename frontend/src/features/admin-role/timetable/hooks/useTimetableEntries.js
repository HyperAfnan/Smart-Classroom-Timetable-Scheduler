/**
 * React Query powered hooks to fetch existing timetable entries from Supabase.
 *
 * Responsibilities:
 * - Query the `timetable_entries` table with optional filtering (by class, teacher, room, time_slot, subject, term).
 * - Optionally include the related `time_slots` row to expose day/slot_index/start_time/end_time in one round trip.
 * - Provide ergonomic hooks (byClass, byTeacher, byRoom, byTimeSlot) for common lookups.
 *
 * Requirements:
 * - Your app must be wrapped with React Query's QueryClientProvider.
 * - Supabase client must be configured and exported from "@/config/supabase".
 *
 * Table contract assumed:
 *   public.timetable_entries (
 *     id bigserial pk,
 *     class_id bigint fk -> classes(id),
 *     time_slot_id bigint fk -> time_slots(id),
 *     subject_id bigint fk -> subjects(id),
 *     teacher_id uuid|bigint fk -> teacher_profile(user_id|id)  <-- depends on your schema
 *     room_id bigint fk -> room(id),
 *     type text default 'Theory',
 *     created_at timestamptz default now()
 *   )
 *
 * Optional join:
 *   public.time_slots (
 *     id bigserial pk,
 *     day smallint, slot_index smallint, start_time time, end_time time
 *   )
 *
 * Example:
 *   const { entries, isLoading } = useTimetableEntries({
 *     filters: { classId: 12 },              // optional filters
 *     includeTimeSlot: true,                  // include joined time slot info
 *     queryOptions: { staleTime: 60_000 },    // react-query options
 *   });
 *
 *   // Specialized hook
 *   const { entries: teacherEntries } = useTimetableEntriesByTeacher("uuid-or-id");
 */

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

const EMPTY_ENTRIES = Object.freeze([]);

/**
 * @typedef {Object} TimeSlotRow
 * @property {number|string} id
 * @property {number} day           0..6
 * @property {number} slot_index    0..N within a day
 * @property {string} start_time    "HH:MM:SS" or "HH:MM"
 * @property {string} end_time      "HH:MM:SS" or "HH:MM"
 */

/**
 * @typedef {Object} TimetableEntry
 * @property {number|string} id
 * @property {number|string} class_id
 * @property {number|string} time_slot_id
 * @property {number|string} subject_id
 * @property {number|string} teacher_id   // could be bigint or uuid in your schema
 * @property {number|string} room_id
 * @property {string} type                // 'Theory' | 'Lab' | 'Tutorial' | ...
 * @property {string} created_at          // ISO timestamp
 * @property {TimeSlotRow=} time_slots    // present when includeTimeSlot = true
 */

/**
 * Fetch timetable entries with optional filters and optional time slot join.
 *
 * Notes:
 * - Filters are applied as equality checks.
 * - When includeTimeSlot = true, each entry will contain a `time_slots` property with the related row.
 *
 * @param {{
 *   filters?: {
 *     classId?: string|number,
 *     teacherId?: string|number,
 *     roomId?: string|number,
 *     timeSlotId?: string|number,
 *     subjectId?: string|number,
 *     termId?: string|number, // in case you scope timetables by academic term
 *   },
 *   includeTimeSlot?: boolean
 * }} params
 * @returns {Promise<TimetableEntry[]>}
 */
async function fetchTimetableEntries({
   filters = {},
   includeTimeSlot = true,
} = {}) {
   const baseColumns =
      "id, class_id, time_slot_id, subject_id, teacher_id, room_id, type, created_at";
   // Include related time slot info when requested.
   // The alias `time_slots:time_slot_id(...)` selects the referenced row by FK.
   const selectArg = includeTimeSlot
      ? `${baseColumns}, time_slots:time_slot_id(id, day, start_time, end_time)`
      : baseColumns;
   console.log(selectArg)
   let query = supabase.from("timetable_entries").select(selectArg);

   if (filters.classId !== undefined && filters.classId !== null) {
      query = query.eq("class_id", filters.classId);
   }
   if (filters.teacherId !== undefined && filters.teacherId !== null) {
      query = query.eq("teacher_id", filters.teacherId);
   }
   if (filters.roomId !== undefined && filters.roomId !== null) {
      query = query.eq("room_id", filters.roomId);
   }
   if (filters.timeSlotId !== undefined && filters.timeSlotId !== null) {
      query = query.eq("time_slot_id", filters.timeSlotId);
   }
   if (filters.subjectId !== undefined && filters.subjectId !== null) {
      query = query.eq("subject_id", filters.subjectId);
   }
   // if (filters.termId !== undefined && filters.termId !== null) {
   //    // Only apply if you actually added term_id to timetable_entries
   //    query = query.eq("term_id", filters.termId);
   // }

   // Stable ordering for UI rendering; time slot typically reflects the schedule order.
   query = query.order("time_slot_id", { ascending: true }).order("created_at", {
      ascending: true,
   });

   const { data, error } = await query;
   if (error) {
      throw new Error(error.message || "Failed to load timetable entries");
   }
   return data ?? [];
}

/**
 * Pick a query key that best matches the provided filter:
 * - If exactly one filter is present, use the specific key (byClass/byTeacher/byRoom/byTimeSlot).
 * - Otherwise, fall back to the general list key including a normalized filter object.
 */
function buildQueryKey(filters = {}, includeTimeSlot = true) {
   const defined = Object.entries(filters).filter(
      ([, v]) => v !== undefined && v !== null,
   );
   const onlyOne = defined.length === 1 ? defined[0][0] : null;

   if (onlyOne === "classId")
      return queryKeys.timetableEntries.byClass(filters.classId);
   if (onlyOne === "teacherId")
      return queryKeys.timetableEntries.byTeacher(filters.teacherId);
   if (onlyOne === "roomId")
      return queryKeys.timetableEntries.byRoom(filters.roomId);
   if (onlyOne === "timeSlotId")
      return queryKeys.timetableEntries.byTimeSlot(filters.timeSlotId);

   // Normalize values to strings to keep the key stable across number/uuid.
   const normalized = Object.fromEntries(
      Object.entries(filters)
         .filter(([, v]) => v !== undefined && v !== null)
         .map(([k, v]) => [k, String(v)]),
   );

   return [
      ...queryKeys.timetableEntries.list(),
      { ...normalized, includeTimeSlot },
   ];
}

/**
 * Primary hook: fetch timetable entries with optional filters.
 *
 * @param {{
 *   filters?: {
 *     classId?: string|number,
 *     teacherId?: string|number,
 *     roomId?: string|number,
 *     timeSlotId?: string|number,
 *     subjectId?: string|number,
 *     termId?: string|number,
 *   },
 *   includeTimeSlot?: boolean,
 *   queryOptions?: import('@tanstack/react-query').UseQueryOptions<TimetableEntry[], Error>
 * }} [options]
 */
export default function useTimetableEntries(options = {}) {
   const { filters = {}, includeTimeSlot = true, queryOptions = {} } = options;

   const queryKey = buildQueryKey(filters, includeTimeSlot);

   const query = useQuery({
      queryKey,
      queryFn: () => fetchTimetableEntries({ filters, includeTimeSlot }),
      staleTime: 60_000, // sensible default; tune per your needs
      ...queryOptions,
   });

   return {
      entries: query.data ?? EMPTY_ENTRIES,
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error ?? null,
      refetch: query.refetch,
      query,
   };
}

/**
 * Convenience hook: fetch entries by class.
 * @param {string|number} classId
 * @param {{ includeTimeSlot?: boolean, queryOptions?: import('@tanstack/react-query').UseQueryOptions<TimetableEntry[], Error> }} [options]
 */
export function useTimetableEntriesByClass(classId, options = {}) {
   return useTimetableEntries({
      filters: { classId },
      includeTimeSlot: options.includeTimeSlot ?? true,
      queryOptions: { enabled: !!classId, ...(options.queryOptions || {}) },
   });
}

/**
 * Convenience hook: fetch entries by teacher.
 * @param {string|number} teacherId
 * @param {{ includeTimeSlot?: boolean, queryOptions?: import('@tanstack/react-query').UseQueryOptions<TimetableEntry[], Error> }} [options]
 */
export function useTimetableEntriesByTeacher(teacherId, options = {}) {
   return useTimetableEntries({
      filters: { teacherId },
      includeTimeSlot: options.includeTimeSlot ?? true,
      queryOptions: { enabled: !!teacherId, ...(options.queryOptions || {}) },
   });
}

/**
 * Convenience hook: fetch entries by room.
 * @param {string|number} roomId
 * @param {{ includeTimeSlot?: boolean, queryOptions?: import('@tanstack/react-query').UseQueryOptions<TimetableEntry[], Error> }} [options]
 */
export function useTimetableEntriesByRoom(roomId, options = {}) {
   return useTimetableEntries({
      filters: { roomId },
      includeTimeSlot: options.includeTimeSlot ?? true,
      queryOptions: { enabled: !!roomId, ...(options.queryOptions || {}) },
   });
}

/**
 * Convenience hook: fetch entries by time slot.
 * @param {string|number} timeSlotId
 * @param {{ includeTimeSlot?: boolean, queryOptions?: import('@tanstack/react-query').UseQueryOptions<TimetableEntry[], Error> }} [options]
 */
export function useTimetableEntriesByTimeSlot(timeSlotId, options = {}) {
   return useTimetableEntries({
      filters: { timeSlotId },
      includeTimeSlot: options.includeTimeSlot ?? true,
      queryOptions: { enabled: !!timeSlotId, ...(options.queryOptions || {}) },
   });
}

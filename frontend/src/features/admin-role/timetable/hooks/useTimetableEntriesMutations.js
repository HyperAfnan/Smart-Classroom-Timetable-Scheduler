/**
 * React Query powered mutations to persist generated timetables into Supabase.
 *
 * What this provides:
 * - A helper to convert an "organized" timetable object (day/time grid) into DB rows.
 * - A mutation to insert (or upsert/replace) timetable entries into `timetable_entries`.
 * - A mutation to clear all timetable entries for one or more classes.
 *
 * Data model assumptions:
 * - public.timetable_entries(id, class_id, time_slot_id, subject_id, teacher_id, room_id, type, created_at)
 * - public.time_slots(id, day, slot_index, start_time, end_time)
 *
 * Typical usage after the generator returns its response:
 *   const { mapOrganizedToRows, insertEntriesAsync } = useTimetableEntriesMutations();
 *
 *   // 1) Build rows from the organized object your UI uses
 *   const rows = mapOrganizedToRows({
 *     organized,                // { [classKey]: { [dayName]: { [timeLabel]: slot } } }
 *     days,                     // e.g., ["Monday","Tuesday","Wednesday","Thursday","Friday"]
 *     timeSlots,                // fetched from Supabase: select * from time_slots
 *     // Optional when organized top-level keys are not real DB class IDs:
 *     classKeyToId: { "0": 101, "1": 102 } // map keyed class to actual class_id values
 *   });
 *
 *   // 2) Insert the rows into the database
 *   await insertEntriesAsync({
 *     rows,
 *     mode: "upsert", // or "replace": deletes existing rows for these classes, then inserts
 *   });
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Normalize a time string to "HH:MM" for matching "09:00" with "09:00:00".
 * Accepts "HH:MM" or "HH:MM:SS" and always returns "HH:MM".
 */
function normalizeToHHMM(value) {
  if (!value) return value;
  let str = String(value);
  if (str.length >= 5 && str[2] === ":") str = str.slice(0, 5);
  if (/^\d:\d{2}$/.test(str)) return "0" + str;
  return;
}

/**
 * Build a lookup from (day, "HH:MM") -> time_slot_id
 * @param {Array<{ id: number|string, day: number, start_time: string }>} timeSlots
 */
function buildTimeSlotIndex(timeSlots) {
  const index = new Map();
  for (const ts of timeSlots || []) {
    const key = `${ts.day}::${normalizeToHHMM(ts.start_time)}`;
    index.set(key, ts.id);
  }
  return index;
}

/**
 * Resolve class_id from an organized key.
 * Strategy:
 * - If classKeyToId is provided and contains the key -> use that.
 * - Else, if the key looks like a numeric ID -> use Number(key) to keep bigint fields happy.
 * - Else, assume it is already a valid ID (string or uuid).
 */
function resolveClassId(classKey, classKeyToId) {
  if (
    classKeyToId &&
    Object.prototype.hasOwnProperty.call(classKeyToId, classKey)
  ) {
    return classKeyToId[classKey];
  }
  // Numeric-like?
  if (/^\d+$/.test(String(classKey))) {
    return Number(classKey);
  }
  return classKey;
}

/**
 * Convert an "organized" timetable object into insertable rows.
 *
 * organized shape:
 * {
 *   [classKey]: {
 *     [dayName]: {
 *       [timeLabel]: {
 *          subject_id, teacher_id, room_id, type? (optional; default 'Theory'), ... // slot payload
 *       } | null
 *     }
 *   }
 * }
 *
 * @param {{
 *   organized: Record<string, Record<string, Record<string, any>>>,
 *   days: string[], // e.g., ["Monday","Tuesday","Wednesday","Thursday","Friday"]
 *   timeSlots: Array<{ id: number|string, day: number, start_time: string }>,
 *   classKeyToId?: Record<string, string|number>,
 * }} args
 * @returns {Array<{ class_id: any, time_slot_id: any, subject_id: any, teacher_id: any, room_id: any, type?: string }>}
 */
export function mapOrganizedToRows({
  organized,
  days,
  timeSlots,
  classKeyToId,
}) {
  if (!organized || typeof organized !== "object") return [];

  // Map day name to numeric day index (0..6) based on provided days array
  const dayNameToIndex = new Map(
    (days || []).map((d, i) => [String(d).toLowerCase(), i]),
  );

  // Build timeslot index by (dayIndex, "HH:MM")
  const tsIndex = buildTimeSlotIndex(timeSlots || []);

  const rows = [];

  for (const [classKey, dayObj] of Object.entries(organized)) {
    const class_id = resolveClassId(classKey, classKeyToId);

    for (const [dayName, timeObj] of Object.entries(dayObj || {})) {
      const dayIndex = dayNameToIndex.get(String(dayName).toLowerCase());

      // Skip unknown day names
      if (dayIndex === undefined) continue;

      for (const [timeLabel, slot] of Object.entries(timeObj || {})) {
        // Only create a row for a filled slot (non-null / non-free)
        if (!slot) continue;

        const hhmm = normalizeToHHMM(timeLabel);
        let time_slot_id = tsIndex.get(`${dayIndex}::${hhmm}`);
        if (!time_slot_id) {
          // Fallback: some schemas store Monday as 1..5 while UI uses 0..4
          time_slot_id = tsIndex.get(`${dayIndex + 1}::${hhmm}`);
        }

        if (!time_slot_id) {
          // If there's no exact time slot match, skip this cell gracefully.
          // You may want to collect these misses and report them to the UI.
          continue;
        }

        const { subject_id, teacher_id, room_id, type = "Theory" } = slot;

        // Minimal validation: ensure core FKs are present
        if (
          subject_id === undefined ||
          teacher_id === undefined ||
          room_id === undefined
        ) {
          // Skip incomplete rows; alternatively, throw an Error to fail fast:
          // throw new Error(`Missing FK in slot for class ${class_id} at day=${dayIndex} time=${hhmm}`);
          continue;
        }

        rows.push({
          class_id,
          time_slot_id,
          subject_id,
          teacher_id,
          room_id,
          type,
        });
      }
    }
  }

  return rows;
}

/**
 * Insert timetable entries into Supabase.
 *
 * Modes:
 * - "upsert" (default): upserts by (class_id, time_slot_id) so re-runs replace overlapping slots.
 * - "replace": deletes all existing entries for the affected classes, then inserts the rows fresh.
 *
 * Returns the inserted rows from Supabase (when available).
 *
 * @param {{
 *   rows?: Array<{ class_id:any, time_slot_id:any, subject_id:any, teacher_id:any, room_id:any, type?:string }>,
 *   organized?: Record<string, Record<string, Record<string, any>>>,
 *   days?: string[],
 *   timeSlots?: Array<{ id: number|string, day:number, start_time:string }>,
 *   classKeyToId?: Record<string, string|number>,
 *   mode?: "upsert"|"replace",
 * }} args
 */
async function insertEntriesInternal(args) {
  const {
    rows: inputRows,
    organized,
    days,
    timeSlots,
    classKeyToId,
    mode = "upsert",
  } = args || {};

  // Convert organized structure into rows when provided; otherwise use provided rows.
  const rows =
    inputRows && inputRows.length
      ? inputRows
      : organized
        ? mapOrganizedToRows({
            organized,
            days: days || [],
            timeSlots: timeSlots || [],
            classKeyToId,
          })
        : [];

  if (!rows.length) {
    return { data: [], error: null };
  }

  // Determine affected class_ids for optional cleanup
  const classIds = Array.from(new Set(rows.map((r) => r.class_id)));

  if (mode === "replace" && classIds.length) {
    // Delete existing rows for these classes before inserting
    const { error: delError } = await supabase
      .from("timetable_entries")
      .delete()
      .in("class_id", classIds);

    if (delError) {
      throw new Error(
        delError.message || "Failed to clear existing timetable entries",
      );
    }
  }

  // Insert or upsert rows
  let query = supabase.from("timetable_entries");
  if (mode === "upsert") {
    query = query.upsert(rows, { onConflict: "class_id,time_slot_id" });
  } else {
    query = query.insert(rows);
  }

  const { data, error } = await query.select();
  if (error) {
    throw new Error(error.message || "Failed to insert timetable entries");
  }
  return { data, error: null };
}

/**
 * Delete all timetable entries for provided class IDs.
 * @param {{ classIds: Array<string|number> }} args
 */
async function clearClassEntriesInternal({ classIds }) {
  const ids = Array.isArray(classIds)
    ? classIds.filter((v) => v !== null && v !== undefined)
    : [];
  if (!ids.length) return { data: [], error: null };

  const { data, error } = await supabase
    .from("timetable_entries")
    .delete()
    .in("class_id", ids)
    .select();

  if (error) {
    throw new Error(error.message || "Failed to clear class timetable entries");
  }
  return { data, error: null };
}

/**
 * Main hook: exposes mutations for inserting and clearing timetable entries.
 *
 * Exposed API:
 * - insertEntries: useMutation object
 * - insertEntriesAsync: promise-based helper (insert/upsert/replace)
 * - clearClassEntries: useMutation object
 * - clearClassEntriesAsync: promise-based helper (delete by class_ids)
 * - mapOrganizedToRows: helper to transform organized grid into rows
 */
export default function useTimetableEntriesMutations() {
  const queryClient = useQueryClient();

  const insertEntries = useMutation({
    mutationKey: [...queryKeys.timetableEntries.all, "insert"],
    mutationFn: insertEntriesInternal,
    onSuccess: async () => {
      // Invalidate timetable entries caches so UI reflects latest DB state
      await queryClient.invalidateQueries({
        queryKey: queryKeys.timetableEntries.all,
      });
    },
  });

  const clearClassEntries = useMutation({
    mutationKey: [...queryKeys.timetableEntries.all, "clearByClass"],
    mutationFn: clearClassEntriesInternal,
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.timetableEntries.all,
      });
    },
  });

  // Promise-style helpers for convenience
  const insertEntriesAsync = (args) => insertEntries.mutateAsync(args);
  const clearClassEntriesAsync = (args) => clearClassEntries.mutateAsync(args);

  return {
    // Mutations
    insertEntries,
    insertEntriesAsync,
    clearClassEntries,
    clearClassEntriesAsync,
    // Helper
    mapOrganizedToRows,
  };
}

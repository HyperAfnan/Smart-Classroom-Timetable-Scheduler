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
function buildTimeSlotIndex(timeSlots, dayNameToIndex) {
  const index = new Map();
  const toDayIndex = (d) => {
    if (d === undefined || d === null) return d;
    if (typeof d === "number") return d;
    const s = String(d).trim();
    if (/^\d+$/.test(s)) return Number(s);
    const k = s.toLowerCase();
    return dayNameToIndex?.get(k) ?? d;
  };
  for (const ts of timeSlots || []) {
    const dayKey = toDayIndex(ts.day);
    const key = `${dayKey}::${normalizeToHHMM(ts.start_time)}`;
    index.set(key, ts.id);
  }
  return index;
}

/**
 * Build a lookup from (day, slot_index) -> time_slot_id
 * Fallback when start_time-based matching fails.
 */
function buildTimeSlotIndexBySlot(timeSlots, dayNameToIndex) {
  const index = new Map();
  const toDayIndex = (d) => {
    if (d === undefined || d === null) return d;
    if (typeof d === "number") return d;
    const s = String(d).trim();
    if (/^\d+$/.test(s)) return Number(s);
    const k = s.toLowerCase();
    return dayNameToIndex?.get(k) ?? d;
  };
  for (const ts of timeSlots || []) {
    if (ts.slot_index === undefined || ts.slot_index === null) continue;
    const dayKey = toDayIndex(ts.day);
    const key = `${dayKey}::${ts.slot_index}`;
    index.set(key, ts.id);
  }
  return index;
}

/**
 * Build a lookup from (day, derived_rank) -> time_slot_id and capture the
 * sorted "HH:MM" order per day. This helps when time_slots lack slot_index
 * but have start_time that can be sorted consistently.
 */
function buildTimeSlotIndexByDerivedRank(timeSlots, dayNameToIndex) {
  const tsIndexByRank = new Map();
  const dayTimeOrder = new Map();

  const toDayIndex = (d) => {
    if (d === undefined || d === null) return d;
    if (typeof d === "number") return d;
    const s = String(d).trim();
    if (/^\d+$/.test(s)) return Number(s);
    const k = s.toLowerCase();
    return dayNameToIndex?.get(k) ?? d;
  };

  // Group by normalized day
  const byDay = new Map();
  for (const ts of timeSlots || []) {
    const dayKey = toDayIndex(ts.day);
    if (!byDay.has(dayKey)) byDay.set(dayKey, []);
    byDay.get(dayKey).push({
      id: ts.id,
      hhmm: normalizeToHHMM(ts.start_time),
    });
  }

  // For each day, sort by "HH:MM" and index the order
  for (const [dayKey, arr] of byDay.entries()) {
    arr.sort((a, b) => (a.hhmm || "").localeCompare(b.hhmm || ""));
    dayTimeOrder.set(
      dayKey,
      arr.map((x) => x.hhmm),
    );
    arr.forEach((item, idx) => {
      tsIndexByRank.set(`${dayKey}::${idx}`, item.id);
    });
  }

  return { tsIndexByRank, dayTimeOrder };
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
  subjectNameToId,
  teacherNameToEmpId,
  roomNameToId,
}) {
  if (!organized || typeof organized !== "object") return [];

  // Map day name to numeric day index (0..6) based on provided days array
  const dayNameToIndex = new Map(
    (days || []).map((d, i) => [String(d).toLowerCase(), i]),
  );

  // Build timeslot index by (dayIndex, "HH:MM") and by slot_index
  const tsIndex = buildTimeSlotIndex(timeSlots || [], dayNameToIndex);
  const tsIndexBySlot = buildTimeSlotIndexBySlot(
    timeSlots || [],
    dayNameToIndex,
  );
  // Also build a derived rank index per day from sorted start_time,
  // and keep the daily time order to infer rank from HH:MM labels.
  const { tsIndexByRank, dayTimeOrder } = buildTimeSlotIndexByDerivedRank(
    timeSlots || [],
    dayNameToIndex,
  );

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

        // Build candidate days to try: UI day index, +1 offset, and slot.day variants
        const toNumDay = (d) => {
          if (d === undefined || d === null) return undefined;
          if (typeof d === "number") return d;
          const str = String(d).trim();
          if (/^\d+$/.test(str)) return Number(str);
          return dayNameToIndex.get(str.toLowerCase());
        };

        const slotDayIdx = toNumDay(slot?.day);
        const candidateDays = Array.from(
          new Set(
            [
              dayIndex,
              dayIndex + 1,
              slotDayIdx,
              slotDayIdx != null ? slotDayIdx + 1 : undefined,
            ].filter((v) => v !== undefined),
          ),
        );

        // Build candidate times: label time, and slot.start_time if provided
        const candidateTimes = Array.from(
          new Set([hhmm, normalizeToHHMM(slot?.start_time)].filter((v) => v)),
        );

        let time_slot_id = null;

        // Try matching by day + start_time
        for (const d of candidateDays) {
          for (const t of candidateTimes) {
            time_slot_id = tsIndex.get(`${d}::${t}`);
            if (time_slot_id) break;
          }
          if (time_slot_id) break;
        }

        // Fallback: match by slot_index/slot if provided by the generator
        if (!time_slot_id) {
          const sIdx = slot?.slot_index ?? slot?.slot;
          if (sIdx !== undefined && sIdx !== null) {
            // Try direct slot_index -> time_slot_id mapping across candidate days
            for (const d of candidateDays) {
              time_slot_id = tsIndexBySlot.get(`${d}::${sIdx}`);
              if (time_slot_id) break;
            }
            // If not found, try derived rank mapping (0-based and 1-based)
            if (!time_slot_id) {
              const numIdx = Number(sIdx);
              if (Number.isFinite(numIdx)) {
                for (const d of candidateDays) {
                  // 0-based attempt
                  time_slot_id =
                    tsIndexByRank.get(`${d}::${numIdx}`) ??
                    // 1-based attempt
                    tsIndexByRank.get(`${d}::${numIdx - 1}`);
                  if (time_slot_id) break;
                }
              }
            }
          }
        }

        // Note: teacher_id and room_name do not exist in time_slots schema,
        // so we cannot derive time_slot_id from them. They are used only for row payload.

        if (!time_slot_id) {
          // Fallback: infer slot rank from "HH:MM" position in the day's sorted order
          for (const d of candidateDays) {
            const order = dayTimeOrder.get(d);
            if (Array.isArray(order) && order.length) {
              const rank = order.indexOf(hhmm);
              if (rank >= 0) {
                time_slot_id = tsIndexByRank.get(`${d}::${rank}`);
                if (time_slot_id) break;
              }
            }
          }
        }

        if (!time_slot_id) {
          // If there's still no exact time slot match, skip this cell gracefully.
          // Add diagnostics to help identify mismatches.
          try {
            // eslint-disable-next-line no-console
            console.warn(
              "[timetable] Skipping slot due to missing time_slot_id",
              {
                class_id,
                dayName,
                uiDayIndex: dayIndex,
                candidateDays,
                timeLabel: timeLabel,
                hhmm,
                candidateTimes,
                slot_index: slot?.slot_index ?? slot?.slot,
                slot_day: slot?.day,
                slot_start_time: slot?.start_time,
              },
            );
          } catch {}
          continue;
        }

        // Extract and normalize FKs; DB expects:
        // - subject_id: bigint (not null)
        // - teacher_id: text (emp_id in teacher_profile, not null)
        // - room_id: bigint (not null)
        // - type: text
        const rawSubjectId =
          (slot?.subject_name &&
            subjectNameToId?.[String(slot.subject_name)]) ??
          slot?.subject_id ??
          null;
        const rawTeacherId =
          (slot?.teacher_name &&
            teacherNameToEmpId?.[String(slot.teacher_name)]) ??
          slot?.teacher_id ??
          null;
        const rawRoomId =
          (slot?.room_name && roomNameToId?.[String(slot.room_name)]) ??
          slot?.room_id ??
          null;
        const type = slot?.type ?? "Theory";

        // Coerce teacher_id to string (DB column is text). This does not guarantee FK validity,
        // but prevents accidental null inserts when the value exists.
        const normalizedTeacherId =
          rawTeacherId == null ? null : String(rawTeacherId);

        // Minimal validation: ensure core FKs are present (treat null and undefined as missing)
        if (
          rawSubjectId == null ||
          normalizedTeacherId == null ||
          rawRoomId == null
        ) {
          // Skip incomplete rows; alternatively, throw an Error to fail fast.
          // eslint-disable-next-line no-console
          console.warn("[timetable] Skipping row due to missing FK", {
            class_id,
            dayIndex,
            hhmm,
            subject_id: rawSubjectId,
            teacher_id: rawTeacherId,
            room_id: rawRoomId,
          });
          continue;
        }

        rows.push({
          class_id,
          time_slot_id,
          subject_id: rawSubjectId,
          teacher_id: normalizedTeacherId,
          room_id: rawRoomId,
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
  // eslint-disable-next-line no-console
  console.info("[timetable] Upsert starting", { mode, rows: rows.length });
  let query = supabase.from("timetable_entries");
  if (mode === "upsert") {
    query = query.upsert(rows, { onConflict: "class_id,time_slot_id" });
  } else {
    query = query.insert(rows);
  }

  const { data, error } = await query.select();
  // eslint-disable-next-line no-console
  console.info("[timetable] Upsert finished", {
    requested: rows.length,
    inserted: Array.isArray(data) ? data.length : 0,
    hasError: !!error,
  });
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

import { useMemo } from "react";
import { DAY_ORDER } from "../constants";
import { normalizeToHHMM } from "../utils/time";

/**
 * useTimetableStructure
 *
 * Computes derived structure for rendering a timetable:
 * - Groups time slots by day
 * - Sorts slots within each day
 * - Orders days according to DAY_ORDER
 * - Determines a "break index" per day (which existing slot is marked as the break)
 *
 * Inputs:
 * - timeSlots: Array of time slot objects with shape:
 *    {
 *      id: string|number,
 *      day?: string,              // e.g. "Monday"
 *      slot?: number,             // optional ordinal index
 *      start_time?: string|Date,  // e.g. "09:15:00" or "09:15"
 *      end_time?: string|Date
 *    }
 * - options.breakAfterTime?: string|Date  (normalized to "HH:MM")
 * - options.breakAfterSlotIndex?: number  (0-based index)
 *
 * Output:
 * {
 *   days: string[],                             // ordered days present in timeSlots
 *   slotsByDay: Record<string, Array<Slot>>,    // grouped & sorted slots by day
 *   breakIndexByDay: Record<string, number>,    // per-day index of the slot marked as "break" (or -1 if none)
 * }
 *
 * Notes:
 * - The "break slot" does NOT insert a new column. It marks an existing slot index as the break.
 * - Consumers can render the corresponding header/body cell as a break, and shift mapping of entries if needed.
 *
 * Enhanced:
 * If timeSlots don't carry day information (or are empty),
 * we can derive the list of days from timetable entries and optionally
 * replicate the same slot timeline across those days so the UI can render.
 *
 * Pass entriesForFallback when available.
 */
export default function useTimetableStructure(
  timeSlots,
  {
    breakAfterTime,
    breakAfterSlotIndex,
    entriesForFallback,
    fallbackToDayOrder = true,
  } = {},
) {
  return useMemo(() => {
    // Helper: sort slots within a day
    const sortSlots = (a, b) => {
      const aHas = typeof a?.slot === "number";
      const bHas = typeof b?.slot === "number";

      if (aHas && bHas) return a.slot - b.slot;
      if (aHas && !bHas) return -1;
      if (!aHas && bHas) return 1;

      const aStart = normalizeToHHMM(a?.start_time);
      const bStart = normalizeToHHMM(b?.start_time);

      if (aStart && bStart && aStart !== bStart) {
        return aStart < bStart ? -1 : 1;
      }

      return String(a?.id ?? "").localeCompare(String(b?.id ?? ""));
    };

    // 1) Group slots by day
    const grouped = {};
    const allSlots = Array.isArray(timeSlots) ? timeSlots : [];

    for (const ts of allSlots) {
      const d =
        ts?.day ??
        ts?.Day ??
        ts?.day_name ??
        ts?.dayName ??
        ts?.weekday ??
        ts?.week_day;

      if (d) {
        if (!grouped[d]) grouped[d] = [];
        grouped[d].push(ts);
      }
    }

    // 2) Compute ordered days; if none, try fallbacks
    const dayOrderIndex = (d) => {
      const idx = DAY_ORDER.indexOf(d);
      return idx === -1 ? Number.MAX_SAFE_INTEGER : idx;
    };

    let days = Object.keys(grouped);

    // Fallback A: derive days from entries if provided
    if (
      days.length === 0 &&
      Array.isArray(entriesForFallback) &&
      entriesForFallback.length > 0
    ) {
      const derived = new Set();

      for (const e of entriesForFallback) {
        const d =
          e?.time_slots?.day ??
          e?.time_slots?.day_name ??
          e?.time_slots?.dayName ??
          e?.time_slots?.weekday ??
          e?.day;

        if (d) derived.add(d);
      }

      if (derived.size > 0) {
        days = Array.from(derived);

        // Replicate timeline across derived days
        const proto = [...allSlots].sort(sortSlots);
        for (const d of days) {
          grouped[d] = proto.map((s) => s);
        }

         
        console.warn(
          "[useTimetableStructure] timeSlots missing 'day'; derived days from entries and replicated slot timeline.",
          { days, protoCount: proto.length },
        );
      }
    }

    // Fallback B: default to DAY_ORDER (Mon–Fri) if still empty
    if (days.length === 0 && fallbackToDayOrder) {
      days = DAY_ORDER.slice(0, 5);
      const proto = [...allSlots].sort(sortSlots);

      for (const d of days) {
        grouped[d] = proto.map((s) => s);
      }

       
      console.warn(
        "[useTimetableStructure] No day info found in timeSlots or entries; defaulting to first 5 days of DAY_ORDER.",
        { days },
      );
    }

    // Ensure stable order by DAY_ORDER then alphabetically
    days.sort((a, b) => {
      const ia = dayOrderIndex(a);
      const ib = dayOrderIndex(b);

      if (ia !== ib) return ia - ib;
      return a.localeCompare(b);
    });

    // 3) Sort slots for each resolved day
    for (const d of days) {
      (grouped[d] ||= []).sort(sortSlots);
    }

    // 4) Determine break index per day
    const breakIndexByDay = {};
    const targetHHMM = breakAfterTime ? normalizeToHHMM(breakAfterTime) : null;

    for (const d of days) {
      const slots = grouped[d] || [];
      let idxToMark = -1;

      // Priority 1: match by start_time
      if (targetHHMM) {
        const foundIdx = slots.findIndex(
          (s) => normalizeToHHMM(s?.start_time) === targetHHMM,
        );
        if (foundIdx !== -1) idxToMark = foundIdx;
      }

      // Priority 2: by slot index
      if (
        idxToMark === -1 &&
        typeof breakAfterSlotIndex === "number" &&
        breakAfterSlotIndex >= 0
      ) {
        idxToMark = Math.min(
          Math.max(0, breakAfterSlotIndex),
          Math.max(0, slots.length - 1),
        );
      }

      // Priority 3: fallback to midpoint
      if (idxToMark === -1 && slots.length > 0) {
        idxToMark = Math.floor(slots.length / 2);
      }

      breakIndexByDay[d] = idxToMark;
    }

    return {
      days,
      slotsByDay: grouped,
      breakIndexByDay,
    };
  }, [
    timeSlots,
    breakAfterTime,
    breakAfterSlotIndex,
    entriesForFallback,
    fallbackToDayOrder,
  ]);
}

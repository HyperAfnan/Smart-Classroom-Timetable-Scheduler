import React, { memo, useMemo, useEffect } from "react";
import { normalizeToHHMM } from "../utils/time";
import { TimetableCell } from "./TimetableCell";
import { TableBody, TableCell, TableRow } from "@/components/ui/table";

/**
 * TimetableBody
 *
 * Renders the table body: class rows and per-slot cells.
 * - Break handling: a specific slot index per day is marked as "break".
 * - Shifted mapping after break: cells after the break show the entry from the previous slot time,
 *   ensuring the last real slot becomes empty (if no extra entry).
 *
 * Props:
 * - days: string[]
 * - slotsByDay: Record<string, Array<{ day?:string, slot?:number, start_time?:string|Date, end_time?:string|Date }>>
 * - breakIndexByDay: Record<string, number>  // -1 when no break
 * - classLabels: string[]                    // values used to display left-most labels and to match entries by class_name
 * - timetableEntries: Array<{ class_name?:string, time_slots?:{ day?:string, slot?:number, start_time?:string|Date } }>
 * - selectedDay: string | null
 */
function TimetableBody({
  days,
  slotsByDay,
  breakIndexByDay,
  classLabels,
  timetableEntries,
  classes,
  selectedDay,
  activeTeacherName,
}) {
  const isActiveDay = (day) => selectedDay === null || selectedDay === day;
  const toLecture = (entry) =>
    entry
      ? {
          subject:
             entry.subjectName ??
             entry.subject_name ??
             entry.subject ??
             "—",
          teacher:
             entry.teacherName ??
             entry.teacher_name ??
             entry.teacher ??
             "—",
          room:
             entry.roomNumber ??
             entry.room_name ??
             entry.room ??
             String(entry.room_id ?? entry.roomId ?? "—"),
          type: entry.type ?? "Lecture",
        }
      : null;

  // Helper to resolve canonical class name
  const resolveClassName = (e) => {
    if (!e) return "Unknown";
    // If e.class_name matches one of our labels directly, use it
    const rawName = e.class_name || e.className || e.name;
    if (rawName && classLabels.includes(rawName)) return rawName;

    // Otherwise try to lookup via classId
    if (e.classId && Array.isArray(classes)) {
      const cls = classes.find((c) => String(c.id) === String(e.classId));
      if (cls) {
        return (cls.class_name || cls.className || cls.name || "").trim();
      }
    }
    return rawName || "Unknown";
  };

  // Build fast lookup maps
  const entryByTime = useMemo(() => {
    const m = new Map();
    for (const e of Array.isArray(timetableEntries) ? timetableEntries : []) {
      const cls = resolveClassName(e);
      const day = e?.time_slots?.day;
      const start = normalizeToHHMM(e?.time_slots?.startTime || e?.time_slots?.start_time);
      if (!cls || !day || !start) continue;
      m.set(`${cls}|${day}|${start}`, e);
    }
    return m;
  }, [timetableEntries, classes, classLabels]);

  const entryBySlot = useMemo(() => {
    const m = new Map();
    for (const e of Array.isArray(timetableEntries) ? timetableEntries : []) {
      const cls = resolveClassName(e);
      const day = e?.time_slots?.day;
      const slotNum =
        typeof e?.time_slots?.slot === "number" ? e.time_slots.slot : null;
      if (!cls || !day || slotNum == null) continue;
      m.set(`${cls}|${day}|${slotNum}`, e);
    }
    return m;
  }, [timetableEntries, classes, classLabels]);



  const isTeacherFilterActive = Boolean(activeTeacherName);
  const norm = (s) =>
    String(s ?? "")
      .trim()
      .toLowerCase();

  return (
    <TableBody>
      {classLabels.map((className) => (
        <TableRow key={className}>
          {/* Class label cell */}
          <TableCell className="border border-border p-3 text-center">
            <span className="text-foreground">{className}</span>
          </TableCell>

          {/* Per-day cells for this class */}
          {days.flatMap((day) => {
            const slots = slotsByDay?.[day] || [];
            const breakIndex = breakIndexByDay?.[day] ?? -1;
            const active = isActiveDay(day);

            return slots.map((ts, idx) => {
              const isBreak = idx === breakIndex;

              if (isBreak) {
                return (
                  <TableCell
                    key={`${className}-${day}-${idx}`}
                    className={`border border-border text-xs h-[120px] transition-all duration-300 ${
                      active ? "dark:bg-amber-950/30" : "opacity-60"
                    }`}
                  >
                    <TimetableCell
                      lecture={null}
                      isBreak={true}
                      isDimmed={isTeacherFilterActive}
                    />
                  </TableCell>
                );
              }

              const matchHHMM =
                breakIndex !== -1 && idx > breakIndex
                  ? normalizeToHHMM(slots[idx - 1]?.startTime || slots[idx - 1]?.start_time)
                  : normalizeToHHMM(ts?.startTime || ts?.start_time);

              const matchSlot =
                breakIndex !== -1 && idx > breakIndex
                  ? slots[idx - 1]?.slot
                  : ts?.slot;

              const lookupKey = `${className}|${day}|${matchHHMM}`;
              
              const entry =
                (matchHHMM
                  ? entryByTime.get(lookupKey)
                  : null) ??
                (typeof matchSlot === "number"
                  ? entryBySlot.get(`${className}|${day}|${matchSlot}`)
                  : null) ??
                null;



              return (
                <TableCell
                  key={`${className}-${day}-${idx}`}
                  className={`border border-border text-xs h-[120px] transition-all duration-300 ${
                    active ? "" : "opacity-60"
                  }`}
                >
                  <TimetableCell
                    lecture={toLecture(entry)}
                    isBreak={false}
                    isDimmed={
                      isTeacherFilterActive &&
                      !(entry
                        ? norm(entry?.teacherName) === norm(activeTeacherName) ||
                          norm(entry?.teacher_name) === norm(activeTeacherName) ||
                          norm(entry?.teacher) === norm(activeTeacherName)
                        : false)
                    }
                  />
                </TableCell>
              );
            });
          })}
        </TableRow>
      ))}
    </TableBody>
  );
}

export default memo(TimetableBody);

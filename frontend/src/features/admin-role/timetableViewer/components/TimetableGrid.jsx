import { useState, useCallback, useMemo } from "react";
import useTimetableStructure from "../hooks/useTimetableStructure.js";
import TimetableHeader from "./TimetableHeader.jsx";
import TimetableBody from "./TimetableBody.jsx";
import useTimetableViewer from "../hooks/useTimetableViewer.js";
import useClassLabels from "../hooks/useClassLabels.js";
import {
  Table,
  TableRow,
  TableHead,
  TableHeader,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { TimetableCell, ClassWiseTimetableCell } from "./TimetableCell";
import { motion } from "framer-motion";
import { normalizeToHHMM } from "../utils/time.js";

/**
 * TimetableGrid
 *
 * Main container that composes:
 * - Data layer: useTimetableData to fetch classes, timeSlots, timetableEntries
 * - Logic layer: useTimetableStructure to compute days, slotsByDay, breakIndexByDay
 * - UI layer: TimetableHeader + TimetableBody for rendering
 *
 * Props:
 * - breakAfterTime?: string (e.g., "12:55")
 * - breakAfterSlotIndex?: number
 * - breakLabel?: string = "Break"
 */
export function CombinedTimetableGrid({
  ref,
  breakAfterTime,
  breakAfterSlotIndex,
  breakLabel = "Break",
  activeTeacherName,
}) {
  const { classes, timeSlots, timetableEntries, isLoading, isError, error } =
    useTimetableViewer();

  const { days, slotsByDay, breakIndexByDay } = useTimetableStructure(
    timeSlots,
    {
      breakAfterTime,
      breakAfterSlotIndex,
      entriesForFallback: timetableEntries,
    },
  );

  const [selectedDay, setSelectedDay] = useState(null);
  const handleDayClick = useCallback(
    (day) => setSelectedDay((prev) => (prev === day ? null : day)),
    [],
  );
  const isActiveDay = useCallback(
    (day) => selectedDay === null || selectedDay === day,
    [selectedDay],
  );

  const classLabels = useClassLabels(classes, timetableEntries);
  return (
    <>
      {isError ? (
        <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
          {error?.message ||
            "Something went wrong while loading the timetable."}
        </div>
      ) : isLoading ? (
        <div className="text-gray-600">Loading timetable...</div>
      ) : (
        <motion.div
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="overflow-x-auto" ref={ref}>
            <Table className="w-full border-collapse">
              <TimetableHeader
                days={days}
                slotsByDay={slotsByDay}
                breakIndexByDay={breakIndexByDay}
                selectedDay={selectedDay}
                onDayClick={handleDayClick}
                breakLabel={breakLabel}
              />
              <TimetableBody
                days={days}
                slotsByDay={slotsByDay}
                breakIndexByDay={breakIndexByDay}
                classLabels={classLabels}
                timetableEntries={timetableEntries}
                selectedDay={selectedDay}
                isActiveDay={isActiveDay}
                activeTeacherName={activeTeacherName}
              />
            </Table>
          </div>
        </motion.div>
      )}
    </>
  );
}

export function ClassTimetableGrid({
  selectedClass,
  breakAfterTime,
  breakAfterSlotIndex,
  breakLabel = "Break",
  activeTeacherName,
}) {
  const { classes, timetableEntries, timeSlots, isLoading, isError, error } =
    useTimetableViewer();
  const selectedClassObj = classes?.find((c) => String(c.id) === selectedClass);

  const { days, slotsByDay } = useTimetableStructure(timeSlots, {
    breakAfterTime,
    breakAfterSlotIndex,
    entriesForFallback: timetableEntries,
  });

  const norm = (s) =>
    String(s ?? "")
      .trim()
      .toLowerCase();

  const toLecture = (entry) =>
    entry
      ? {
          subject: entry?.subject_name ?? entry?.subject ?? "—",
          teacher: entry?.teacher_name ?? entry?.teacher ?? "—",
          room:
            entry?.room_name ?? entry?.room ?? String(entry?.room_id ?? "—"),
          type: entry?.type ?? "Lecture",
        }
      : null;

  const intervals = useMemo(() => {
    // Prefer the first resolved day's slots to form the header timeline
    const baseDay = Array.isArray(days) && days.length ? days[0] : null;
    const daySlots =
      baseDay && slotsByDay && Array.isArray(slotsByDay[baseDay])
        ? [...slotsByDay[baseDay]]
        : null;

    if (Array.isArray(daySlots) && daySlots.length) {
      // Map to start/end and dedupe within the day
      const mapped = daySlots
        .map((s) => ({
          start: normalizeToHHMM(s?.start_time),
          end: normalizeToHHMM(s?.end_time),
        }))
        .filter((it) => it.start && it.end);

      const seenInDay = new Set();
      const uniqueInDay = [];
      for (const it of mapped) {
        const key = `${it.start}|${it.end}`;
        if (!seenInDay.has(key)) {
          seenInDay.add(key);
          uniqueInDay.push(it);
        }
      }

      uniqueInDay.sort((a, b) =>
        String(a.start).localeCompare(String(b.start)),
      );

      return uniqueInDay.map((it) => ({
        type: "interval",
        start: it.start,
        end: it.end,
      }));
    }

    // Fallback: deduplicate across all timeSlots (in case day grouping is unavailable)
    const slots = Array.isArray(timeSlots) ? [...timeSlots] : [];
    const seen = new Set();
    const unique = [];
    for (const s of slots) {
      const start = normalizeToHHMM(s?.start_time);
      const end = normalizeToHHMM(s?.end_time);
      const key = `${start}|${end}`;
      if (start && end && !seen.has(key)) {
        seen.add(key);
        unique.push({ start, end });
      }
    }

    unique.sort((a, b) => String(a.start).localeCompare(String(b.start)));

    return unique.map((it) => ({
      type: "interval",
      start: it.start,
      end: it.end,
    }));
  }, [timeSlots, days, slotsByDay]);

  const timeline = useMemo(() => {
    const t = intervals.map((it) => ({ ...it }));
    if (breakAfterTime) {
      const idx = intervals.findIndex(
        (it) => it.start === normalizeToHHMM(breakAfterTime),
      );
      if (idx !== -1 && idx + 1 < intervals.length) {
        t[idx + 1] = { ...t[idx + 1], type: "break" };
      }
    } else if (
      typeof breakAfterSlotIndex === "number" &&
      breakAfterSlotIndex + 1 < intervals.length
    ) {
      t[breakAfterSlotIndex + 1] = {
        ...t[breakAfterSlotIndex + 1],
        type: "break",
      };
    }
    return t;
  }, [intervals, breakAfterTime, breakAfterSlotIndex]);

  const breakIndex = useMemo(
    () => timeline.findIndex((it) => it.type === "break"),
    [timeline],
  );

  const byKey = useMemo(() => {
    if (!selectedClassObj?.class_name || !Array.isArray(timetableEntries)) {
      return new Map();
    }
    return timetableEntries
      .filter(
        (e) => e?.class_name === selectedClassObj.class_name && e?.time_slots,
      )
      .reduce((acc, e) => {
        const day = e.time_slots?.day;
        const start = normalizeToHHMM(e.time_slots?.start_time);
        if (day && start) {
          acc.set(`${day}|${start}`, e);
        }
        return acc;
      }, new Map());
  }, [timetableEntries, selectedClassObj?.class_name]);

  if (isError) {
    return (
      <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
        {error?.message || "Something went wrong while loading the timetable."}
      </div>
    );
  }

  if (isLoading) {
    return <div className="text-gray-600">Loading timetable...</div>;
  }

  if (!selectedClassObj) {
    return (
      <div className="text-gray-600">Select a class to view the timetable.</div>
    );
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      initial={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="overflow-x-auto">
        <Table className="w-full border-collapse">
          <TableHeader className="border border-border ">
            <TableRow>
              <TableHead className="w-24">Day</TableHead>
              {timeline.map((item, idx) =>
                item.type === "interval" ? (
                  <TableHead
                    key={`${item.start}-${item.end}`}
                    className="text-center min-w-[150px]"
                  >
                    {`${item.start}-${item.end}`}
                  </TableHead>
                ) : (
                  <TableHead
                    key={`break-${idx}`}
                    className="text-center min-w-[100px] text-muted-foreground dark:bg-amber-950/30 dark:text-amber-300"
                  >
                    {breakLabel ?? "Break"}
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {days.map((day) => (
              <TableRow key={day}>
                <TableCell className="border border-border p-3 text-center">
                  <span className="text-foreground">{day}</span>
                </TableCell>

                {timeline.map((item, idx) => {
                  if (item.type === "break") {
                    return (
                      <TableCell
                        key={`break-${idx}`}
                        className={`border border-border text-xs h-[120px] transition-all duration-300 dark:bg-amber-950/30`}
                      >
                        <TimetableCell
                          lecture={null}
                          isBreak={true}
                          isDimmed={Boolean(activeTeacherName)}
                        />
                      </TableCell>
                    );
                  }

                  const time =
                    breakIndex !== -1 && idx > breakIndex
                      ? intervals[idx - 1].start
                      : item.start;

                  const hhmm = normalizeToHHMM(time);
                  const slot = byKey.size
                    ? (byKey.get(`${day}|${hhmm}`) ?? null)
                    : null;

                  return (
                    <TableCell
                      key={`${item.start}-${item.end}`}
                      className={`border border-border text-xs h-[140px] transition-all duration-300`}
                    >
                      <ClassWiseTimetableCell
                        lecture={toLecture(slot)}
                        isBreak={false}
                        isDimmed={
                          Boolean(activeTeacherName) &&
                          !(
                            slot &&
                            (norm(slot?.teacher_name) ===
                              norm(activeTeacherName) ||
                              norm(slot?.teacher) === norm(activeTeacherName))
                          )
                        }
                      />
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </motion.div>
  );
}

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
import Loader from "@/shared/components/Loader.jsx";

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
            <Loader />
         ) : (
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
                     classes={classes}
                     selectedDay={selectedDay}
                     isActiveDay={isActiveDay}
                     activeTeacherName={activeTeacherName}
                  />
               </Table>
            </div>
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
   const selectedClassObj = classes?.find(
      (c) => String(c.id) === selectedClass,
   );

   const classEntries = useMemo(() => {
      return timetableEntries?.filter(
         (e) => String(e.classId) === String(selectedClass),
      );
   }, [timetableEntries, selectedClass]);

   const { days, slotsByDay } = useTimetableStructure(timeSlots, {
      breakAfterTime,
      breakAfterSlotIndex,
      entriesForFallback: classEntries,
   });

   const normalizeToHHMM = (val) => {
      if (!val) return val;
      let str = String(val);
      if (str.length >= 5 && str[2] === ":") str = str.slice(0, 5);
      if (/^\d:\d{2}$/.test(str)) return "0" + str;
      return str;
   };
   const isTeacherFilterActive = Boolean(activeTeacherName);
   const norm = (s) =>
      String(s ?? "")
         .trim()
         .toLowerCase();

   const toLecture = (entry) => {
      return entry
         ? {
            subject:
               entry?.subjectName ??
               entry?.subject_name ??
               entry?.subject ??
               "—",
            teacher:
               entry?.teacherName ??
               entry?.teacher_name ??
               entry?.teacher ??
               "—",
            room:
               entry?.roomNumber ??
               entry?.room_name ??
               entry?.room ??
               String(entry?.room_id ?? entry?.roomId ?? "—"),
            type: entry?.type ?? "Lecture",
         }
         : null;
   };

   const intervals = useMemo(() => {
      const collected = [];

      const getStart = (s) =>
         normalizeToHHMM(
            s?.startTime ??
            s?.start_time ??
            s?.start ??
            s?.from
         );

      const getEnd = (s) =>
         normalizeToHHMM(
            s?.endTime ??
            s?.end_time ??
            s?.end ??
            s?.to
         );

      if (slotsByDay && typeof slotsByDay === "object") {
         for (const day of Object.keys(slotsByDay)) {
            for (const s of slotsByDay[day] || []) {
               const start = getStart(s);
               const end = getEnd(s);

               if (start && end) {
                  collected.push({ start, end });
               }
            }
         }
      }

      if (!collected.length && Array.isArray(timeSlots)) {
         for (const s of timeSlots) {
            const start = getStart(s);
            const end = getEnd(s);

            if (start && end) {
               collected.push({ start, end });
            }
         }
      }

      const seen = new Set();
      const unique = [];

      for (const it of collected) {
         const key = `${it.start}|${it.end}`;
         if (!seen.has(key)) {
            seen.add(key);
            unique.push(it);
         }
      }

      unique.sort((a, b) => a.start.localeCompare(b.start));

      return unique.map((it) => ({
         type: "interval",
         start: it.start,
         end: it.end,
      }));
   }, [slotsByDay, timeSlots]);

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
      const entries = Array.isArray(classEntries) ? classEntries : [];

      const getDay = (e) =>
         e?.day ??
         e?.time_slots?.day;

      const getStart = (e) =>
         normalizeToHHMM(
            e?.startTime ??
            e?.start_time ??
            e?.time_slots?.startTime ??
            e?.time_slots?.start_time
         );

      return entries.reduce((acc, e) => {
         const day = getDay(e);
         const start = getStart(e);

         if (day && start) {
            acc.set(`${day}|${start}`, e);
         }

         return acc;
      }, new Map());
   }, [classEntries]);


   if (isError) {
      return (
         <div className="mb-4 p-3 rounded-md bg-red-50 text-red-700 border border-red-200">
            {error?.message ||
               "Something went wrong while loading the timetable."}
         </div>
      );
   }

   if (isLoading) {
      return <div className="text-gray-600">Loading timetable...</div>;
   }

   if (!selectedClassObj) {
      return (
         <div className="text-gray-600">
            Select a class to view the timetable.
         </div>
      );
   }

   return (
      <div className="overflow-x-auto">
         <Table className="w-full border-collapse">
            <TableHeader className="border border-border ">
               <TableRow>
                  <TableHead className="w-24">Day</TableHead>
                  {timeline.map((item, idx) => {
                     return item.type === "interval" ? (
                        <TableHead
                           key={`${item.start}-${item.end}`}
                           className="text-center min-w-[150px]"
                        >
                           {`${item.start}-${item.end}`}
                        </TableHead>
                     ) : (
                        <TableHead
                           key={`break-${idx}`}
                           className="text-center min-w-[100px] text-muted-foreground dark:bg-amber-950/30"
                        >
                           {breakLabel ?? "Break"}
                        </TableHead>
                     )
                  }
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
                                    isDimmed={isTeacherFilterActive}
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
                                 isDimmed={isTeacherFilterActive && !(slot && (norm(slot?.teacher_name) === norm(activeTeacherName) || norm(slot?.teacher) === norm(activeTeacherName)))}
                              />
                           </TableCell>
                        );
                     })}
                  </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
   );
}

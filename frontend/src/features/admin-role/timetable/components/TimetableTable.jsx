import { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import TimetableSlot from "./TimetableSlot";
import FreeSlot from "./FreeSlot";
import BreakSlot from "./BreakSlot";
import useTimetable from "../hooks/useTimetable.js";

export default function TimetableTable({
  days,
  times,
  departmentId,
  className, // string: selected class name to filter entries by
  breakAfterTime,
  breakLabel = "Break",
}) {
  const { timetable } = useTimetable(departmentId, {
    enabled: !!departmentId,
  });

  const normalizeToHHMM = (val) => {
    if (!val) return val;
    let str = String(val);
    if (str.length >= 5 && str[2] === ":") str = str.slice(0, 5);
    if (/^\d:\d{2}$/.test(str)) return "0" + str;
    return str;
  };

  // Build intervals from times and insert an optional Break column after the specified start time.
  const intervals =
    Array.isArray(times) && times.length > 1
      ? times.slice(0, -1).map((t, i) => ({
          type: "interval",
          start: t,
          end: times[i + 1],
        }))
      : [];

  let timeline = intervals.map((it) => ({ ...it }));
  if (breakAfterTime) {
    const idx = intervals.findIndex((it) => it.start === breakAfterTime);
    if (idx !== -1 && idx + 1 < intervals.length) {
      timeline[idx + 1] = { ...timeline[idx + 1], type: "break" };
    }
  }
  const breakIndex = timeline.findIndex((it) => it.type === "break");

  // Build a lookup map for quick cell resolution: key = `${day}|${HH:MM}`
  const byKey = useMemo(() => {
    if (!className || !Array.isArray(timetable) || timetable.length === 0) {
      return new Map();
    }
    return timetable
      .filter((e) => e?.className === className && e?.time_slots)
      .reduce((acc, e) => {
        const day = e.time_slots?.day;
        const start = normalizeToHHMM(e.time_slots?.startTime);
        if (day && start) {
          acc.set(`${day}|${start}`, e);
        }
        return acc;
      }, new Map());
  }, [className, timetable]);

  return (
    <Table>
      <TableHeader>
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
          <tr key={day}>
            <TableCell className="font-medium">{day}</TableCell>

            {timeline.map((item, idx) => {
              if (item.type === "break") {
                const dayIndex = Math.max(0, days.indexOf(day));
                const letters = breakLabel ?? "Break";
                const displayChar =
                  letters.charAt(dayIndex % letters.length) ||
                  letters.charAt(0);
                return (
                  <TableCell
                    key={`break-${idx}`}
                    className="p-2 text-center dark:bg-amber-950/30"
                  >
                    <BreakSlot displayChar={displayChar} />
                  </TableCell>
                );
              }

              // Match entries using the start time of the interval
              const time =
                breakIndex !== -1 && idx > breakIndex
                  ? intervals[idx - 1].start
                  : item.start;

              const hhmm = normalizeToHHMM(time);
              const slot =
                className && byKey.size
                  ? (byKey.get(`${day}|${hhmm}`) ?? null)
                  : null;

              return (
                <TableCell
                  key={`${item.start}-${item.end}`}
                  className="p-2 text-center"
                >
                  {slot ? <TimetableSlot slot={slot} /> : <FreeSlot />}
                </TableCell>
              );
            })}
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}

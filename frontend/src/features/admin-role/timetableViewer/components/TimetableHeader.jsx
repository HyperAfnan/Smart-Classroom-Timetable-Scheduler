import React, { memo } from "react";
import { normalizeToHHMM } from "../utils/time";
import { TableHeader, TableHead, TableRow } from "@/components/ui/table";

/**
 * TimetableHeader
 *
 * Renders the table header for the timetable:
 * - First row: clickable day headers with gradient backgrounds.
 * - Second row: per-day slot headers, with the "Break" slot highlighted.
 *
 * Props:
 * - days: string[]                              Ordered list of day names to render.
 * - slotsByDay: Record<string, Array<Object>>   Grouped time slots by day.
 * - breakIndexByDay: Record<string, number>     Index of the slot to mark as "Break" for each day (-1 if none).
 * - selectedDay: string | null                  If set, only that day is highlighted; null highlights all.
 * - onDayClick: (day: string) => void           Click handler for day header cells.
 * - breakLabel?: string                         Label to show for Break (default: "Break").
 */
function TimetableHeader({
  days,
  slotsByDay,
  breakIndexByDay,
  selectedDay,
  onDayClick,
  breakLabel = "Break",
}) {
  const isActiveDay = (day) => selectedDay === null || selectedDay === day;
  const isBreakSlot = (day, idx) =>
    (breakIndexByDay?.[day] ?? -1) !== -1 && idx === breakIndexByDay[day];

  const labelForSlot = (slot) => {
    const start = normalizeToHHMM(slot?.start_time);
    const end = normalizeToHHMM(slot?.end_time);
    if (start && end) return `${start}-${end}`;
    if (typeof slot?.slot === "number") return `Slot ${slot.slot + 1}`;
    return "Time";
  };

  return (
    <TableHeader>
      {/* Day headers row */}
      <TableRow>
        <TableHead className="border border-border p-2 min-w-[80px]"></TableHead>
        {days.map((day) => {
          const colSpan = (slotsByDay?.[day] || []).length || 1;
          const active = isActiveDay(day);
          return (
            <TableHead
              key={day}
              colSpan={colSpan}
              onClick={() => onDayClick?.(day)}
              className={`border border-border p-3 text-center cursor-pointer transition-all duration-300 ${
                active
                  ? "bg-accent text-accent-foreground"
                  : "bg-muted text-muted-foreground opacity-60"
              }`}
            >
              <span>{day[0].toUpperCase() + day.slice(1, day.length)}</span>
            </TableHead>
          );
        })}
      </TableRow>

      {/* Time slot headers row */}
      <TableRow>
        <TableHead className="border border-border p-2"></TableHead>
        {days.flatMap((day) => {
          const slots = slotsByDay?.[day] || [];
          const active = isActiveDay(day);
          return slots.map((ts, idx) => {
            const isBreak = isBreakSlot(day, idx);
            return (
              <TableHead
                key={`${day}-${idx}`}
                className={`border border-border p-2 text-xs min-w-[100px] transition-all duration-300 ${
                  active
                    ? isBreak
                      ? "dark:bg-amber-950/30"
                      : ""
                    : "opacity-60"
                }`}
              >
                <div className="flex flex-col items-center gap-1">
                  <span
                    className={
                      isBreak
                        ? "text-muted-foreground text-[10px] dark:text-amber-300"
                        : "text-[10px]"
                    }
                  >
                    {isBreak ? breakLabel : labelForSlot(ts)}
                  </span>
                </div>
              </TableHead>
            );
          });
        })}
      </TableRow>
    </TableHeader>
  );
}

export default memo(TimetableHeader);

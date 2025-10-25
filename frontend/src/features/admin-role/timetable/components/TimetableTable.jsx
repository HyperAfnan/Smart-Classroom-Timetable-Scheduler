import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/**
 * TimetableTable
 * Renders a weekly timetable grid for provided days and times.
 *
 * Props:
 * - days: string[] - Array of weekday names (e.g., ["Monday", "Tuesday", ...])
 * - times: string[] - Array of time labels (e.g., ["09:00", "10:00", ...])
 * - getSlotData: (day: string, time: string) => Slot|null
 * - getSubjectName: (subjectId: string|number) => string
 * - getTeacherName: (teacherId: string|number) => string
 * - getRoomNumber: (roomId: string|number) => string
 * - className?: string - Optional class for the outer Table element
 * - showFreeLabel?: boolean - Whether to show the "Free" label for empty slots
 * - freeLabel?: string - Label for empty slots (default: "Free")
 * - onCellClick?: (args: { day: string, time: string, slot: any|null }) => void
 * - renderSlot?: (args: { slot: any, day: string, time: string }) => React.ReactNode
 * - breakAfterTime?: string - Insert a non-interactive Break column after the interval that starts at this time (e.g., "12:00")
 * - breakLabel?: string - Label to show for break cells (default: "Break")
 * - breakCellClassName?: string - Optional classes to style break cells
 */
export default function TimetableTable({
  days,
  times,
  getSlotData,
  getSubjectName,
  getTeacherName,
  getRoomNumber,
  className = "",
  showFreeLabel = true,
  freeLabel = "Free",
  renderSlot,
  breakAfterTime,
  breakLabel = "Break",
  breakCellClassName,
}) {
  const defaultRenderSlot = (slot) => {
    if (!slot) return null;
    return (
      <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left">
        <div className="font-semibold text-blue-900 text-sm">
          {getSubjectName?.(slot.subject_id) ?? String(slot.subject_id ?? "")}
        </div>
        <div className="text-xs text-blue-600 mt-1">
          {getTeacherName?.(slot.teacher_id) ?? String(slot.teacher_id ?? "")}
        </div>
        <div className="text-xs text-blue-500 mt-1">
          {getRoomNumber
            ? getRoomNumber(slot.room_id)
            : `Room: ${String(slot.room_id ?? "")}`}
        </div>
        {slot.type ? (
          <Badge
            variant="outline"
            className="bg-blue-200 text-blue-800 border-blue-300 text-xs mt-1"
          >
            {slot.type}
          </Badge>
        ) : null}
      </div>
    );
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

  return (
    <Table className={className}>
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
                className="text-center min-w-[100px] text-muted-foreground"
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
                  <TableCell key={`break-${idx}`} className="p-2 text-center">
                    <div
                      className={`p-8 bg-muted text-muted-foreground  ${breakCellClassName || ""}`.trim()}
                    >
                      {displayChar}
                    </div>
                  </TableCell>
                );
              }

              const time =
                breakIndex !== -1 && idx > breakIndex
                  ? intervals[idx - 1].start
                  : item.start;
              const slot = getSlotData?.(day, time) ?? null;
              return (
                <TableCell
                  key={`${item.start}-${item.end}`}
                  className="p-2 text-center"
                >
                  {slot ? (
                    renderSlot ? (
                      renderSlot({ slot, day, time })
                    ) : (
                      defaultRenderSlot(slot)
                    )
                  ) : (
                    <div className="p-3 rounded-lg border border-dashed bg-muted text-muted-foreground border-border">
                      {showFreeLabel ? freeLabel : null}
                    </div>
                  )}
                </TableCell>
              );
            })}
          </tr>
        ))}
      </TableBody>
    </Table>
  );
}

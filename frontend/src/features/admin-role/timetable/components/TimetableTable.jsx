import React from "react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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
 * - animate?: boolean - Enables row fade animation
 * - showFreeLabel?: boolean - Whether to show the "Free" label for empty slots
 * - freeLabel?: string - Label for empty slots (default: "Free")
 * - onCellClick?: (args: { day: string, time: string, slot: any|null }) => void
 * - renderSlot?: (args: { slot: any, day: string, time: string }) => React.ReactNode
 */
export default function TimetableTable({
  days,
  times,
  getSlotData,
  getSubjectName,
  getTeacherName,
  getRoomNumber,
  className = "",
  animate = true,
  showFreeLabel = true,
  freeLabel = "Free",
  onCellClick,
  renderSlot,
}) {
  const Row = animate ? motion.tr : "tr";

  const handleCellClick = (day, time, slot) => {
    if (typeof onCellClick === "function") {
      onCellClick({ day, time, slot });
    }
  };
  const isClickable = typeof onCellClick === "function";

  const defaultRenderSlot = (slot) => {
    if (!slot) return null;
    return (
      <motion.div
        initial={animate ? { scale: 0.95, opacity: 0 } : false}
        animate={animate ? { scale: 1, opacity: 1 } : false}
        className="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-lg border border-blue-200 text-left"
      >
        <div className="font-semibold text-blue-900 text-sm">
          {getSubjectName?.(slot.subject_id) ?? String(slot.subject_id ?? "")}
        </div>
        <div className="text-xs text-blue-600 mt-1">
          {getTeacherName?.(slot.teacher_id) ?? String(slot.teacher_id ?? "")}
        </div>
        <div className="text-xs text-blue-500 mt-1">
          Room: {getRoomNumber?.(slot.room_id) ?? String(slot.room_id ?? "")}
        </div>
        {slot.type ? (
          <Badge
            variant="outline"
            className="bg-blue-200 text-blue-800 border-blue-300 text-xs mt-1"
          >
            {slot.type}
          </Badge>
        ) : null}
      </motion.div>
    );
  };

  return (
    <Table className={className}>
      <TableHeader>
        <TableRow>
          <TableHead className="w-24">Time</TableHead>
          {days.map((day) => (
            <TableHead key={day} className="text-center min-w-[150px]">
              {day}
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>

      <TableBody>
        <AnimatePresence initial={false}>
          {times.map((time) => (
            <Row
              key={time}
              initial={animate ? { opacity: 0 } : false}
              animate={animate ? { opacity: 1 } : false}
              exit={animate ? { opacity: 0 } : false}
            >
              <TableCell className="font-medium bg-slate-50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {time}
                </div>
              </TableCell>

              {days.map((day) => {
                const slot = getSlotData?.(day, time) ?? null;
                const clickableProps = isClickable
                  ? {
                      onClick: () => handleCellClick(day, time, slot),
                      className:
                        "p-2 text-center cursor-pointer hover:bg-slate-50 transition-colors",
                      role: "button",
                      tabIndex: 0,
                      onKeyDown: (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          handleCellClick(day, time, slot);
                        }
                      },
                      "aria-label": slot
                        ? `Slot: ${getSubjectName?.(slot.subject_id) ?? "Subject"} at ${time} on ${day}`
                        : `Free slot at ${time} on ${day}`,
                    }
                  : { className: "p-2 text-center" };

                return (
                  <TableCell key={day} {...clickableProps}>
                    {slot ? (
                      renderSlot ? (
                        renderSlot({ slot, day, time })
                      ) : (
                        defaultRenderSlot(slot)
                      )
                    ) : (
                      <div className="p-3 rounded-lg border border-dashed border-slate-200 text-slate-400">
                        {showFreeLabel ? freeLabel : null}
                      </div>
                    )}
                  </TableCell>
                );
              })}
            </Row>
          ))}
        </AnimatePresence>
      </TableBody>
    </Table>
  );
}

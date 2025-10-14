import React, { useMemo } from "react";
import { MapPin, Users } from "lucide-react";
import {
  DAYS as DEFAULT_DAYS,
  TIME_SLOTS as DEFAULT_TIME_SLOTS,
  getEntryStyles,
  findClassAtTime,
} from "../constants";

/**
 * ScheduleGrid
 *
 * Generic timetable grid for the teacher schedule feature.
 * Renders a 2D matrix of time slots (rows) vs days (columns).
 *
 * Features:
 *  - Week or single-day view (via `activeDay` prop)
 *  - Customizable days & time slots (defaults imported constants)
 *  - Uses styling helpers for consistent coloring
 *  - Click handler per entry cell
 *  - Accessible semantics (table-like roles)
 *
 * Not (yet) implemented:
 *  - Multi-hour vertical spanning (duration > 1 is presently ignored visually)
 *  - Drag & drop
 *  - Conflict visualization
 *
 * Props:
 *  - schedule: Record<string, Array<{ time, subject, room, students, duration }>>
 *  - days?: string[] (defaults to working days)
 *  - timeSlots?: string[]
 *  - activeDay?: string | null (if provided and matches a day, only that day column is rendered)
 *  - onEntryClick?: (entry, context) => void
 *  - className?: string
 *  - emptyCellRenderer?: (context) => ReactNode (optional customization)
 *
 * Example:
 *  <ScheduleGrid
 *    schedule={schedule}
 *    activeDay={viewType === "day" ? "Monday" : null}
 *    onEntryClick={(entry) => console.log(entry)}
 *  />
 */
const ScheduleGrid = ({
  schedule,
  days = DEFAULT_DAYS,
  timeSlots = DEFAULT_TIME_SLOTS,
  activeDay = null,
  onEntryClick,
  className = "",
  emptyCellRenderer,
}) => {
  // Filter days if single-day (day view) is active
  const visibleDays = useMemo(() => {
    if (activeDay && days.includes(activeDay)) return [activeDay];
    return days;
  }, [activeDay, days]);

  const dateColumnCount = visibleDays.length + 1; // +1 for the time column

  return (
    <div
      className={[
        "bg-white rounded-xl shadow-sm border  border-border-200 overflow-hidden",
        className,
      ].join(" ")}
    >
      <GridHeader visibleDays={visibleDays} dateColumnCount={dateColumnCount} />
      <div role="rowgroup" className="divide-y divide-gray-200">
        {timeSlots.map((timeSlot) => (
          <TimeRow
            key={timeSlot}
            timeSlot={timeSlot}
            visibleDays={visibleDays}
            schedule={schedule}
            onEntryClick={onEntryClick}
            emptyCellRenderer={emptyCellRenderer}
          />
        ))}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

const GridHeader = ({ visibleDays }) => {
  return (
    <div
      role="row"
      className="grid"
      style={{
        gridTemplateColumns: `160px repeat(${visibleDays.length}, 1fr)`,
      }}
    >
      <div
        className="p-4 bg-gray-50 border-r  border-border-200"
        role="columnheader"
      >
        <span className="text-sm font-medium  text-muted-foreground">Time</span>
      </div>
      {visibleDays.map((day) => (
        <div
          key={day}
          role="columnheader"
          className="p-4 bg-gray-50 border-r  border-border-200 last:border-r-0"
        >
          <div className="text-center">
            <p className="text-sm font-medium text-card-foreground">{day}</p>
            {/* Date labels intentionally omitted; parent page can inject if needed */}
          </div>
        </div>
      ))}
    </div>
  );
};

const TimeRow = ({
  timeSlot,
  visibleDays,
  schedule,
  onEntryClick,
  emptyCellRenderer,
}) => {
  return (
    <div
      role="row"
      className="grid min-h-16"
      style={{
        gridTemplateColumns: `160px repeat(${visibleDays.length}, 1fr)`,
      }}
    >
      <div
        role="rowheader"
        className="p-4 bg-gray-50 border-r  border-border-200 flex items-center"
      >
        <span className="text-sm font-medium  text-muted-foreground">
          {timeSlot}
        </span>
      </div>
      {visibleDays.map((day) => {
        const entry = findClassAtTime(schedule, day, timeSlot);
        return (
          <Cell
            key={`${day}-${timeSlot}`}
            day={day}
            timeSlot={timeSlot}
            entry={entry}
            onEntryClick={onEntryClick}
            emptyCellRenderer={emptyCellRenderer}
          />
        );
      })}
    </div>
  );
};

const Cell = ({ day, timeSlot, entry, onEntryClick, emptyCellRenderer }) => {
  const handleClick = () => {
    if (entry && onEntryClick) {
      onEntryClick(entry, { day, timeSlot });
    }
  };

  if (!entry) {
    return (
      <div
        role="gridcell"
        className="border-r  border-border-200 last:border-r-0 p-2"
        data-empty="true"
      >
        {emptyCellRenderer ? emptyCellRenderer({ day, timeSlot }) : null}
      </div>
    );
  }

  const styles = getEntryStyles(entry);

  return (
    <div
      role="gridcell"
      className="border-r  border-border-200 last:border-r-0 p-2"
    >
      <button
        type="button"
        onClick={handleClick}
        className={[
          "w-full text-left p-3 rounded-lg cursor-pointer transition-shadow",
          styles.container,
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-1",
        ].join(" ")}
      >
        <div className="space-y-1">
          <p className={`text-sm font-medium ${styles.text}`}>
            {entry.subject}
          </p>
          <Detail icon={MapPin} text={entry.room} />
          {typeof entry.students === "number" && (
            <Detail
              icon={Users}
              text={`${entry.students} student${entry.students === 1 ? "" : "s"}`}
            />
          )}
        </div>
      </button>
    </div>
  );
};

const Detail = ({ icon: Icon, text }) => (
  <div className="flex items-center space-x-1 text-xs  text-muted-foreground">
    <Icon className="h-3 w-3" />
    <span className="truncate">{text}</span>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Exports                                                                    */
/* -------------------------------------------------------------------------- */

export default ScheduleGrid;

import React from "react";

/**
 * ScheduleHeader Component
 *
 * Displays the main heading and optional contextual meta for the schedule page.
 *
 * Props:
 *  - title?: string (default: "My Schedule")
 *  - subtitle?: string (default: "View and manage your teaching schedule")
 *  - weekLabel?: string (optional label like "This Week", "2 Weeks Ahead")
 *  - dateRange?: string (e.g. "Sep 02 - Sep 06")
 *  - rightContent?: ReactNode (optional slot on the right side for controls)
 *
 * Example:
 * <ScheduleHeader
 *   weekLabel={weekLabel}
 *   dateRange={`${weekDates[0]} - ${weekDates[4]}`}
 *   rightContent={<ViewToggle ... />}
 * />
 */
const ScheduleHeader = ({
  title = "My Schedule",
  subtitle = "View and manage your teaching schedule",
  weekLabel,
  dateRange,
  rightContent = null,
}) => {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-card-foreground">{title}</h1>
        <p className=" text-muted-foreground mt-1">{subtitle}</p>
        {(weekLabel || dateRange) && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
            {weekLabel && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                {weekLabel}
              </span>
            )}
            {dateRange && (
              <span className="text-xs text-gray-500 font-medium">
                {dateRange}
              </span>
            )}
          </div>
        )}
      </div>
      {rightContent && (
        <div className="flex items-center justify-start md:justify-end">
          {rightContent}
        </div>
      )}
    </div>
  );
};

export default ScheduleHeader;

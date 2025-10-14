import React from "react";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

/**
 * WeekNavigator
 *
 * Presentational component to navigate between schedule weeks.
 * Keeps logic outside; it just invokes provided callbacks.
 *
 * Props:
 *  - currentWeek: number (0 = this week, +/- n offset)
 *  - weekLabel: string (e.g. "This Week", "2 Weeks Ahead")
 *  - dateRange: string (e.g. "Sep 02 - Sep 06")
 *  - onPrev: () => void
 *  - onNext: () => void
 *  - onToday: () => void (resets to current week)
 *  - disablePrev?: boolean
 *  - disableNext?: boolean
 *  - className?: string
 *
 * Accessibility:
 *  - Buttons contain descriptive aria-label values.
 *  - Home button (reset) appears only if currentWeek !== 0.
 *
 * Future enhancements:
 *  - Add a week picker (popover calendar)
 *  - Support jump to specific week number
 *  - Add animated transitions
 */
const WeekNavigator = ({
  currentWeek,
  weekLabel,
  dateRange,
  onPrev,
  onNext,
  onToday,
  disablePrev = false,
  disableNext = false,
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-between w-full ${className}`}
      role="group"
      aria-label="Week navigation"
    >
      <div className="flex items-center space-x-2">
        <NavButton
          ariaLabel="Previous week"
          onClick={onPrev}
          disabled={disablePrev}
          icon={<ChevronLeft className="h-5 w-5" />}
        />
        <NavButton
          ariaLabel="Next week"
          onClick={onNext}
          disabled={disableNext}
          icon={<ChevronRight className="h-5 w-5" />}
          className="md:hidden"
        />
      </div>

      <div className="text-center px-2">
        <h2 className="text-lg font-semibold text-card-foreground select-none">
          {weekLabel}
        </h2>
        {dateRange && (
          <p className="text-sm  text-muted-foreground mt-0.5 select-none">
            {dateRange}
          </p>
        )}
      </div>

      <div className="flex items-center space-x-2">
        {currentWeek !== 0 && (
          <NavButton
            ariaLabel="Go to current week"
            onClick={onToday}
            icon={<RotateCcw className="h-5 w-5" />}
            title="Today"
          />
        )}
        <NavButton
          ariaLabel="Previous week"
          onClick={onPrev}
          disabled={disablePrev}
          icon={<ChevronLeft className="h-5 w-5" />}
          className="hidden md:inline-flex"
        />
        <NavButton
          ariaLabel="Next week"
          onClick={onNext}
          disabled={disableNext}
          icon={<ChevronRight className="h-5 w-5" />}
        />
      </div>
    </div>
  );
};

const NavButton = ({
  ariaLabel,
  onClick,
  icon,
  disabled = false,
  className = "",
  title,
}) => (
  <button
    type="button"
    aria-label={ariaLabel}
    title={title || ariaLabel}
    onClick={onClick}
    disabled={disabled}
    className={[
      "p-2 rounded-lg border border-transparent bg-white",
      " text-muted-foreground hover:text-card-foreground hover:bg-gray-50",
      "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
      "disabled:opacity-40 disabled:cursor-not-allowed",
      "transition-colors",
      className,
    ].join(" ")}
  >
    {icon}
  </button>
);

// PropTypes removed to avoid external dependency; rely on JSDoc + TypeScript migration later if desired.

// PropTypes removed.

export default WeekNavigator;

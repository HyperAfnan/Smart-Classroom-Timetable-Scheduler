import React, { useMemo, useCallback } from "react";
import ScheduleHeader from "./components/header.jsx";
import ViewToggle from "./components/viewToggle.jsx";
import WeekNavigator from "./components/weekNavigator.jsx";
import ScheduleGrid from "./components/scheduleGrid.jsx";
import MetricsCards from "./components/metricsCards.jsx";
import { useSchedule } from "./hooks/useSchedule";

/**
 * TeacherSchedule (Refactored)
 *
 * High-level orchestration component that wires together:
 *  - State & logic from useSchedule hook
 *  - Presentational components (header, navigator, grid, metrics)
 *
 * Responsibilities kept here:
 *  - Deciding which subset of days to show in "day" vs "week" views
 *  - Composing layout and passing derived props
 *
 * Not handled here:
 *  - Low-level state mutations (delegated to hook)
 *  - Styling details of individual UI pieces (delegated to components)
 *  - Data fetching (future enhancement)
 *
 * Future extension ideas:
 *  - Modal / drawer for class details on click
 *  - Inline editing / drag & drop to move sessions
 *  - Filters (subject, room, type)
 *  - Export / print view
 */

const TeacherSchedule = () => {
  const {
    currentWeek,
    viewType,
    schedule,
    weekDates,
    metrics,
    weekLabel,
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    changeView,
    DAYS,
    TIME_SLOTS,
  } = useSchedule();

  const activeDay = useMemo(() => {
    if (viewType !== "day") return null;
    const jsDay = new Date().getDay();
    const mondayIndexed = (jsDay + 6) % 7;
    const candidate = DAYS[mondayIndexed];
    return candidate || DAYS[0];
  }, [viewType, DAYS]);

  /**
   * Human-readable date range label (e.g. "Sep 02 - Sep 06")
   */
  const dateRange = useMemo(() => {
    if (!weekDates || weekDates.length === 0) return "";
    if (weekDates.length === 1) return weekDates[0];
    return `${weekDates[0]} - ${weekDates[weekDates.length - 1]}`;
  }, [weekDates]);

  /**
   * Handle click on a schedule entry (class block).
   * Placeholder for future modal / drawer with details or editing.
   */
  const handleEntryClick = useCallback(() => {
    // TODO: Integrate with a modal to show full details / edit form.
    // Placeholder: entry click handler (parameters removed to avoid unused warnings)
  }, []);

  /**
   * Optional empty cell rendering (currently disabled).
   * Could show a "+" button when in an "edit" mode.
   */
  const renderEmptyCell = useCallback(() => null, []);

  return (
    <div className="space-y-6">
      {/* Header + View Toggle */}
      <ScheduleHeader
        weekLabel={weekLabel}
        dateRange={dateRange}
        rightContent={<ViewToggle value={viewType} onChange={changeView} />}
      />

      {/* Week Navigator */}
      <div className="bg-white rounded-xl shadow-sm border  border-border-200 p-4">
        <WeekNavigator
          currentWeek={currentWeek}
          weekLabel={weekLabel}
          dateRange={dateRange}
          onPrev={goToPreviousWeek}
          onNext={goToNextWeek}
          onToday={goToCurrentWeek}
        />
      </div>

      {/* Metrics Summary */}
      <MetricsCards metrics={metrics} />

      {/* Schedule Grid */}
      <ScheduleGrid
        schedule={schedule}
        days={DAYS}
        timeSlots={TIME_SLOTS}
        activeDay={activeDay}
        onEntryClick={handleEntryClick}
        emptyCellRenderer={renderEmptyCell}
      />
    </div>
  );
};

export default TeacherSchedule;

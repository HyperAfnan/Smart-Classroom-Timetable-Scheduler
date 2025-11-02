import { useState, useCallback, useMemo } from "react";
import {
  DAYS,
  TIME_SLOTS,
  SAMPLE_SCHEDULE,
  getWeekDates,
  findClassAtTime,
  aggregateScheduleMetrics,
  getEntryStyles,
  cloneSchedule,
} from "../constants";

/**
 * useSchedule
 * Encapsulates all state & derived data for the Teacher Schedule feature.
 *
 * Responsibilities:
 *  - Hold mutable UI state (currentWeek, viewType, schedule data)
 *  - Expose memoized derived values (weekDates, metrics)
 *  - Provide helper methods for schedule querying & mutation
 *
 * Future enhancement ideas:
 *  - Integrate remote fetch (loading/error states)
 *  - Persist changes (API, local storage)
 *  - Conflict detection when adding sessions
 *  - Variable slot granularity (30m increments)
 *  - Filtering by subject / location / type
 */
export const useSchedule = (initialSchedule = SAMPLE_SCHEDULE) => {
  /* ------------------------------------------------------------------------ */
  /* Core State                                                               */
  /* ------------------------------------------------------------------------ */
  const [currentWeek, setCurrentWeek] = useState(0); // 0 = this week
  const [viewType, setViewType] = useState("week"); // "week" | "day"
  const [schedule, setSchedule] = useState(() =>
    cloneSchedule(initialSchedule),
  );

  /* ------------------------------------------------------------------------ */
  /* Derived Data                                                             */
  /* ------------------------------------------------------------------------ */

  /**
   * Week date labels for the currently viewed week.
   */
  const weekDates = useMemo(
    () => getWeekDates(currentWeek, "en-US", DAYS),
    [currentWeek],
  );

  /**
   * Aggregated metrics for dashboard cards.
   */
  const metrics = useMemo(() => aggregateScheduleMetrics(schedule), [schedule]);

  /**
   * Flattened list of all events with supplemental computed data.
   * (Useful for future features: exporting, analytics, search)
   */
  const flatEvents = useMemo(() => {
    const list = [];
    DAYS.forEach((day) => {
      (schedule[day] || []).forEach((entry) => {
        list.push({
          day,
          ...entry,
          styles: getEntryStyles(entry),
        });
      });
    });
    return list;
  }, [schedule]);

  /* ------------------------------------------------------------------------ */
  /* Accessors                                                                */
  /* ------------------------------------------------------------------------ */

  /**
   * Get the schedule entry at a specific day/time slot.
   */
  const getEntryAt = useCallback(
    (day, timeSlot) => findClassAtTime(schedule, day, timeSlot),
    [schedule],
  );

  /**
   * Determine if a slot is occupied (simple presence check).
   */
  const isOccupied = useCallback(
    (day, timeSlot) => !!getEntryAt(day, timeSlot),
    [getEntryAt],
  );

  /* ------------------------------------------------------------------------ */
  /* Navigation Actions                                                       */
  /* ------------------------------------------------------------------------ */

  const goToPreviousWeek = useCallback(() => setCurrentWeek((w) => w - 1), []);

  const goToNextWeek = useCallback(() => setCurrentWeek((w) => w + 1), []);

  const goToCurrentWeek = useCallback(() => setCurrentWeek(0), []);

  const changeView = useCallback((nextView) => setViewType(nextView), []);

  /* ------------------------------------------------------------------------ */
  /* Mutation Helpers                                                         */
  /* ------------------------------------------------------------------------ */

  /**
   * Add a new schedule entry (no overlap detection yet).
   * @param {string} day - One of DAYS
   * @param {object} entry - { time, subject, room, students, duration }
   */
  const addEntry = useCallback((day, entry) => {
    if (!DAYS.includes(day)) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: [...(prev[day] || []), { ...entry }],
    }));
  }, []);

  /**
   * Update an existing entry matched by time + subject.
   * (You may later want to use a unique id.)
   */
  const updateEntry = useCallback((day, time, subject, patch) => {
    if (!DAYS.includes(day)) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).map((e) =>
        e.time === time && e.subject === subject ? { ...e, ...patch } : e,
      ),
    }));
  }, []);

  /**
   * Remove entries matching the given predicate.
   * If no predicate, remove by day/time/subject.
   */
  const removeEntry = useCallback(({ day, time, subject, predicate }) => {
    if (!DAYS.includes(day)) return;
    setSchedule((prev) => ({
      ...prev,
      [day]: (prev[day] || []).filter((e) =>
        predicate ? !predicate(e) : !(e.time === time && e.subject === subject),
      ),
    }));
  }, []);

  /**
   * Replace the entire schedule (e.g., after fetch).
   */
  const replaceSchedule = useCallback((next) => {
    setSchedule(cloneSchedule(next || {}));
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Label Helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const weekLabel = useMemo(() => {
    if (currentWeek === 0) return "This Week";
    if (currentWeek > 0)
      return `${currentWeek} Week${currentWeek > 1 ? "s" : ""} Ahead`;
    const abs = Math.abs(currentWeek);
    return `${abs} Week${abs > 1 ? "s" : ""} Ago`;
  }, [currentWeek]);

  /* ------------------------------------------------------------------------ */
  /* Return API                                                               */
  /* ------------------------------------------------------------------------ */
  return {
    // State
    currentWeek,
    viewType,
    schedule,

    // Derived
    weekDates,
    metrics, // { teachingHours, sessionCount, totalStudents }
    flatEvents,
    weekLabel,

    // Accessors
    getEntryAt,
    isOccupied,

    // Navigation
    goToPreviousWeek,
    goToNextWeek,
    goToCurrentWeek,
    changeView,

    // Mutations
    addEntry,
    updateEntry,
    removeEntry,
    replaceSchedule,

    // Constants (re-export for convenience)
    DAYS,
    TIME_SLOTS,
  };
};

export default useSchedule;

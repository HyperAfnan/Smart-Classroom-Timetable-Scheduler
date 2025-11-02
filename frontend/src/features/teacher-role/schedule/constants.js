/**
 * Schedule Feature Constants & Utilities
 *
 * This module centralizes static schedule configuration and reusable helpers.
 * Having a single source of truth allows the UI (page, components, hooks)
 * to stay lean and focused on presentation & interaction logic.
 *
 * You can later replace SAMPLE_SCHEDULE with data fetched from an API
 * without touching most consumers, as long as the shape stays similar.
 */

/* -------------------------------------------------------------------------- */
/* Core Constants                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Ordered list of days displayed in the teacher schedule view.
 */
export const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];

/**
 * Ordered list of time slots (start times) used to build the grid.
 * Duration of a class determines how many vertical slots it spans.
 */
export const TIME_SLOTS = [
  "8:00 AM",
  "9:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "1:00 PM",
  "2:00 PM",
  "3:00 PM",
  "4:00 PM",
  "5:00 PM",
];

/**
 * Sample schedule data.
 *
 * Each day maps to an array of entries shaped as:
 * {
 *   time: "HH:MM AM/PM"   // must match a value in TIME_SLOTS for rendering alignment
 *   subject: string       // label of the event
 *   room: string          // physical or virtual location
 *   students: number|null // null for non-teaching events (office hours, meetings)
 *   duration: number      // number of hour blocks spanned
 * }
 *
 * NOTE: If you later switch to 30‑minute granularity, you'd adapt TIME_SLOTS and
 * interpret duration accordingly (e.g., duration units = slot size).
 */
export const SAMPLE_SCHEDULE = {
  Monday: [
    {
      time: "9:00 AM",
      subject: "Calculus I",
      room: "Room 301",
      students: 42,
      duration: 1,
    },
    {
      time: "11:00 AM",
      subject: "Office Hours",
      room: "Office 12B",
      students: null,
      duration: 2,
    },
    {
      time: "2:00 PM",
      subject: "Statistics",
      room: "Lab A",
      students: 28,
      duration: 1,
    },
  ],
  Tuesday: [
    {
      time: "10:00 AM",
      subject: "Algebra II",
      room: "Room 205",
      students: 35,
      duration: 1,
    },
    {
      time: "2:00 PM",
      subject: "Calculus I",
      room: "Room 301",
      students: 42,
      duration: 1,
    },
    {
      time: "4:00 PM",
      subject: "Faculty Meeting",
      room: "Conference Room",
      students: null,
      duration: 1,
    },
  ],
  Wednesday: [
    {
      time: "9:00 AM",
      subject: "Statistics",
      room: "Lab A",
      students: 28,
      duration: 2,
    },
    {
      time: "1:00 PM",
      subject: "Algebra II",
      room: "Room 205",
      students: 35,
      duration: 1,
    },
  ],
  Thursday: [
    {
      time: "10:00 AM",
      subject: "Calculus I",
      room: "Room 301",
      students: 42,
      duration: 1,
    },
    {
      time: "11:00 AM",
      subject: "Office Hours",
      room: "Office 12B",
      students: null,
      duration: 2,
    },
    {
      time: "3:00 PM",
      subject: "Statistics",
      room: "Lab A",
      students: 28,
      duration: 1,
    },
  ],
  Friday: [
    {
      time: "9:00 AM",
      subject: "Algebra II",
      room: "Room 205",
      students: 35,
      duration: 1,
    },
    {
      time: "11:00 AM",
      subject: "Calculus I",
      room: "Room 301",
      students: 42,
      duration: 1,
    },
  ],
};

/* -------------------------------------------------------------------------- */
/* Styling Helpers                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Mapping of special subjects → Tailwind style tokens.
 * Any subject not explicitly listed will use the "default" style.
 *
 * You can expand or convert this to a function if styles become more dynamic.
 */
export const SUBJECT_STYLE_MAP = {
  "Office Hours": {
    container: "bg-blue-50 border border-blue-200 hover:shadow-sm",
    text: "text-blue-700",
  },
  "Faculty Meeting": {
    container: "bg-purple-50 border border-purple-200 hover:shadow-sm",
    text: "text-purple-700",
  },
  default: {
    container: "bg-green-50 border border-green-200 hover:shadow-sm",
    text: "text-green-700",
  },
};

/**
 * Returns styling classes for a given schedule entry.
 * @param {object} entry - A schedule entry from SAMPLE_SCHEDULE
 * @returns {{ container: string, text: string }}
 */
export const getEntryStyles = (entry) => {
  if (!entry || !entry.subject) return SUBJECT_STYLE_MAP.default;
  return SUBJECT_STYLE_MAP[entry.subject] || SUBJECT_STYLE_MAP.default;
};

/* -------------------------------------------------------------------------- */
/* Utility Functions                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Compute the date labels for a given week offset.
 *
 * @param {number} weekOffset 0 = current week, +1 = next week, -1 = previous week
 * @param {string} locale e.g. "en-US"
 * @param {string[]} days reference days (defaults to DAYS)
 * @returns {string[]} formatted date labels (e.g. ["Sep 2", "Sep 3", ...])
 */
export const getWeekDates = (weekOffset = 0, locale = "en-US", days = DAYS) => {
  const today = new Date();
  // Determine Monday of the target week
  const currentDay = today.getDay(); // 0 (Sun) .. 6 (Sat)
  const distanceToMonday = (currentDay + 6) % 7; // convert so Monday = 0
  const monday = new Date(today);
  monday.setDate(today.getDate() - distanceToMonday + weekOffset * 7);

  return days.map((_, idx) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + idx);
    return d.toLocaleDateString(locale, {
      month: "short",
      day: "numeric",
    });
  });
};

/**
 * Find a class entry at a specific day/time combination.
 *
 * @param {Record<string, Array>} schedule
 * @param {string} day
 * @param {string} timeSlot
 * @returns {object|undefined}
 */
export const findClassAtTime = (schedule, day, timeSlot) => {
  const entries = schedule?.[day] || [];
  return entries.find((e) => e.time === timeSlot);
};

/**
 * Aggregate high-level metrics from a schedule.
 *
 * Logic (customize as needed):
 *  - teachingHours: sum of duration where students != null
 *  - sessionCount: count of entries where students != null (does not expand multi-hour into multiple units)
 *  - totalStudents: sum of students across unique sessions (no dedupe)
 *
 * @param {Record<string, Array>} schedule
 * @returns {{ teachingHours: number, sessionCount: number, totalStudents: number }}
 */
export const aggregateScheduleMetrics = (schedule) => {
  let teachingHours = 0;
  let sessionCount = 0;
  let totalStudents = 0;

  Object.values(schedule || {}).forEach((entries) => {
    entries.forEach((entry) => {
      const isTeaching =
        typeof entry.students === "number" && entry.students > 0;
      if (isTeaching) {
        teachingHours += entry.duration || 1;
        sessionCount += 1;
        totalStudents += entry.students;
      }
    });
  });

  return { teachingHours, sessionCount, totalStudents };
};

/**
 * Shallow clone of the schedule (useful if you need an immutable copy).
 * @param {Record<string, Array>} schedule
 */
export const cloneSchedule = (schedule) =>
  Object.fromEntries(
    Object.entries(schedule || {}).map(([day, entries]) => [
      day,
      entries.map((e) => ({ ...e })),
    ]),
  );

/* -------------------------------------------------------------------------- */
/* Default Export (optional aggregation)                                      */
/* -------------------------------------------------------------------------- */

export default {
  DAYS,
  TIME_SLOTS,
  SAMPLE_SCHEDULE,
  SUBJECT_STYLE_MAP,
  getEntryStyles,
  getWeekDates,
  findClassAtTime,
  aggregateScheduleMetrics,
  cloneSchedule,
};

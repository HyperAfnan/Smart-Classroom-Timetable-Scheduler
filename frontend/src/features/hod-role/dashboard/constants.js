/**
 * HOD Dashboard Constants & Utilities
 *
 * Centralized static data and helper functions used across the
 * Head Of Department dashboard feature. Keeping this separate
 * reduces duplication and makes future data source swaps (API)
 * straightforward.
 */

/* -------------------------------------------------------------------------- */
/* Seed / Mock Data                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Initial pending request items (acts as local mock data).
 * Replace with API fetch later (e.g. in a hook) without touching
 * presentation components.
 */
export const INITIAL_PENDING_REQUESTS = [
  {
    id: "1",
    type: "Leave Request",
    teacher: "Dr. Smith",
    subject: "Mathematics",
    date: "Sept 20, 2025",
    reason: "Medical appointment",
    priority: "high",
    submittedAt: "2 hours ago",
  },
  {
    id: "2",
    type: "Class Swap",
    teacher: "Prof. Johnson",
    subject: "Physics Lab",
    date: "Sept 22, 2025",
    reason: "Equipment maintenance",
    priority: "medium",
    submittedAt: "5 hours ago",
  },
  {
    id: "3",
    type: "Room Change",
    teacher: "Dr. Williams",
    subject: "Chemistry",
    date: "Sept 21, 2025",
    reason: "Lab renovation",
    priority: "low",
    submittedAt: "1 day ago",
  },
]

/**
 * Initial schedule conflicts mock dataset.
 */
export const INITIAL_CONFLICTS = [
  {
    id: "1",
    description: "Two classes scheduled in Room 201 at 10:00 AM",
    severity: "critical",
    affectedClasses: 2,
    suggestedAction: "Move Physics to Lab B",
  },
  {
    id: "2",
    description: "Teacher double-booked on Monday 2:00 PM",
    severity: "moderate",
    affectedClasses: 1,
    suggestedAction: "Request substitution",
  },
]

/**
 * System activity feed (static placeholder).
 */
export const INITIAL_ACTIVITY = [
  {
    id: "a1",
    color: "green",
    message:
      "Mathematics class automatically rescheduled due to Dr. Smith's leave",
    time: "2 hours ago",
  },
  {
    id: "a2",
    color: "blue",
    message: "Room conflict resolved automatically - Physics moved to Lab B",
    time: "4 hours ago",
  },
  {
    id: "a3",
    color: "amber",
    message: "Substitute teacher assigned for Chemistry Lab",
    time: "1 day ago",
  },
]

/* -------------------------------------------------------------------------- */
/* Visual Token Maps                                                          */
/* -------------------------------------------------------------------------- */

/**
 * Priority → Tailwind class mapping.
 */
export const PRIORITY_STYLES = {
  high: "bg-red-100 text-red-800 border-red-200",
  medium: "bg-amber-100 text-amber-800 border-amber-200",
  low: "bg-green-100 text-green-800 border-green-200",
  default: "bg-gray-100 text-gray-800 border-gray-200",
}

/**
 * Severity → Tailwind container style mapping.
 */
export const SEVERITY_STYLES = {
  critical: "bg-red-50 border-red-200",
  moderate: "bg-amber-50 border-amber-200",
  low: "bg-blue-50 border-blue-200",
  default: "bg-gray-50 border-gray-200",
}

/* -------------------------------------------------------------------------- */
/* Helper Functions                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Get composite classes for a priority badge.
 * @param {string} priority
 * @returns {string}
 */
export const getPriorityColor = (priority) =>
  PRIORITY_STYLES[priority] || PRIORITY_STYLES.default

/**
 * Get container classes for a conflict severity.
 * @param {string} severity
 * @returns {string}
 */
export const getSeverityColor = (severity) =>
  SEVERITY_STYLES[severity] || SEVERITY_STYLES.default

/**
 * Derive stats from current state (for cards).
 * If you later have dynamic metrics, replace this with real calculations.
 */
export const deriveDashboardMetrics = (pendingRequests) => ({
  pendingCount: pendingRequests.length,
  activeTeachers: 24, // placeholder
  classesToday: 42, // placeholder
  systemEfficiency: 94, // placeholder percent
})

/* -------------------------------------------------------------------------- */
/* Exports Aggregation (optional convenience)                                 */
/* -------------------------------------------------------------------------- */

export default {
  INITIAL_PENDING_REQUESTS,
  INITIAL_CONFLICTS,
  INITIAL_ACTIVITY,
  PRIORITY_STYLES,
  SEVERITY_STYLES,
  getPriorityColor,
  getSeverityColor,
  deriveDashboardMetrics,
}

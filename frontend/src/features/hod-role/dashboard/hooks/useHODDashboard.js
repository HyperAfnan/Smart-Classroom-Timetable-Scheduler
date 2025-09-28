import { useState, useCallback, useMemo } from "react"
import {
  INITIAL_PENDING_REQUESTS,
  INITIAL_CONFLICTS,
  INITIAL_ACTIVITY,
  deriveDashboardMetrics,
  getPriorityColor,
  getSeverityColor,
} from "../constants"

/**
 * useHODDashboard
 *
 * Encapsulates all Head Of Department dashboard state and derived logic.
 * Keeps the page component clean and focused on composition + layout.
 *
 * Responsibilities:
 *  - Manage mutable UI state (pending requests)
 *  - Provide approve / deny actions
 *  - Expose derived metrics (for stat cards)
 *  - Supply helper style getters (priority / severity)
 *  - Provide memoized lists for performant rendering
 *
 * Future Enhancements:
 *  - Replace local state with API integration (fetch requests / conflicts / activity)
 *  - Add optimistic updates + error rollback
 *  - Add pagination or infinite scroll for large activity feeds
 *  - Add filtering / sorting for requests (by priority, type, etc.)
 *  - Add toast notifications on approve/deny
 */
export const useHODDashboard = ({
  initialPending = INITIAL_PENDING_REQUESTS,
  initialConflicts = INITIAL_CONFLICTS,
  initialActivity = INITIAL_ACTIVITY,
} = {}) => {
  /* ------------------------------------------------------------------------ */
  /* State                                                                    */
  /* ------------------------------------------------------------------------ */
  const [pendingRequests, setPendingRequests] = useState(initialPending)
  const [conflicts] = useState(initialConflicts)
  const [activity] = useState(initialActivity)

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  /**
   * Approve a request (removes it from the pending list).
   * @param {string} requestId
   */
  const approveRequest = useCallback((requestId) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
    // Placeholder: trigger API call / toast
  }, [])

  /**
   * Deny a request (removes it from the pending list).
   * @param {string} requestId
   */
  const denyRequest = useCallback((requestId) => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
    // Placeholder: trigger API call / toast
  }, [])

  /**
   * Bulk resolve (example future function).
   * Accepts an array of IDs or predicate.
   */
  const bulkResolve = useCallback(({ ids, predicate }) => {
    setPendingRequests(prev =>
      prev.filter(req => {
        if (predicate) return !predicate(req)
        if (ids) return !ids.includes(req.id)
        return true
      })
    )
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Derived Data                                                             */
  /* ------------------------------------------------------------------------ */

  const metrics = useMemo(
    () => deriveDashboardMetrics(pendingRequests),
    [pendingRequests]
  )

  // Group requests by priority (for optional UI sections)
  const requestsByPriority = useMemo(() => {
    return pendingRequests.reduce(
      (acc, req) => {
        const bucket = req.priority || "other"
        if (!acc[bucket]) acc[bucket] = []
        acc[bucket].push(req)
        return acc
      },
      { high: [], medium: [], low: [], other: [] }
    )
  }, [pendingRequests])

  // Sort pending requests by a simple urgency heuristic (high → low)
  const sortedPendingRequests = useMemo(() => {
    const priorityRank = { high: 3, medium: 2, low: 1 }
    return [...pendingRequests].sort(
      (a, b) =>
        (priorityRank[b.priority] || 0) - (priorityRank[a.priority] || 0)
    )
  }, [pendingRequests])

  // Flag for empty states
  const hasNoRequests = pendingRequests.length === 0
  const hasConflicts = conflicts.length > 0

  /* ------------------------------------------------------------------------ */
  /* Style Helpers (re-exported for convenience)                              */
  /* ------------------------------------------------------------------------ */

  const priorityBadgeClass = useCallback(
    (priority) => getPriorityColor(priority),
    []
  )

  const conflictSeverityClass = useCallback(
    (severity) => getSeverityColor(severity),
    []
  )

  /* ------------------------------------------------------------------------ */
  /* API Placeholder Stubs                                                    */
  /* ------------------------------------------------------------------------ */
  // (Add real data fetching here later)
  const refreshData = useCallback(async () => {
    // Example:
    // const remote = await fetch('/api/dashboard')
    // setPendingRequests(remote.pending)
  }, [])

  /* ------------------------------------------------------------------------ */
  /* Return API                                                               */
  /* ------------------------------------------------------------------------ */
  return {
    // Raw State
    pendingRequests,
    conflicts,
    activity,

    // Derived
    metrics,                 // { pendingCount, activeTeachers, classesToday, systemEfficiency }
    sortedPendingRequests,
    requestsByPriority,
    hasNoRequests,
    hasConflicts,

    // Actions
    approveRequest,
    denyRequest,
    bulkResolve,
    refreshData,

    // Style Helpers
    priorityBadgeClass,
    conflictSeverityClass,
  }
}

export default useHODDashboard

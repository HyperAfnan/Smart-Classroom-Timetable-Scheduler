/**
 * React Query hook for admin dashboard stats with shared query keys and caching.
 *
 * This hook fetches counts for key entities used on the admin dashboard:
 * - Teachers
 * - Rooms
 * - Subjects
 * - Classes
 * - Time slots (generated schedules)
 *
 * Requirements:
 * - Wrap your app with React Query's QueryClientProvider.
 * - Ensure Firebase client is configured and exported from "@/config/firebase".
 *
 * Example:
 *   import useDashboardStats from "./hooks/useDashboardStats";
 *
 *   export default function AdminDashboard() {
 *     const { stats, isLoading, isError, error, refetch } = useDashboardStats({
 *       queryOptions: { staleTime: 60_000 }
 *     });
 *     // render using stats.teachers, stats.rooms, stats.subjects, stats.classes, stats.timeSlots
 *   }
 */

import { useQuery } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getCountFromServer } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";

/**
 * @typedef {Object} DashboardStats
 * @property {number} teachers
 * @property {number} rooms
 * @property {number} subjects
 * @property {number} classes
 * @property {number} timeSlots
 */
const DEFAULT_STATS = Object.freeze({
  teachers: 0,
  rooms: 0,
  subjects: 0,
  classes: 0,
  timeSlots: 0,
});

/**
 * Fetch counts for dashboard entities from Firebase in parallel.
 * @returns {Promise<DashboardStats>}
 */
async function fetchDashboardStats() {
  const [teachersRes, roomsRes, subjectsRes, classesRes, timeSlotsRes] =
    await Promise.all([
      getCountFromServer(collection(db, "teacher_profile")),
      getCountFromServer(collection(db, "rooms")),
      getCountFromServer(collection(db, "subjects")),
      getCountFromServer(collection(db, "classes")),
      getCountFromServer(collection(db, "time_slots")),
    ]);

  return {
    teachers: teachersRes.data().count,
    rooms: roomsRes.data().count,
    subjects: subjectsRes.data().count,
    classes: classesRes.data().count,
    timeSlots: timeSlotsRes.data().count,
  };
}

/**
 * @typedef {Object} UseDashboardStatsOptions
 * @property {import('@tanstack/react-query').UseQueryOptions<DashboardStats, Error>=} queryOptions
 *  Optional React Query options for the dashboard stats query (e.g., staleTime, enabled, select).
 */

/**
 * Hook: Fetches admin dashboard stats using React Query with sensible defaults.
 *
 * - Defaults: staleTime = 60s
 * - Returns stable DEFAULT_STATS when data isn't available to avoid unnecessary re-renders
 *
 * @param {UseDashboardStatsOptions=} options
 * @returns {{
 *   stats: DashboardStats,
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: unknown,
 *   refetch: import('@tanstack/react-query').UseQueryResult<DashboardStats, Error>["refetch"],
 *   statsQuery: import('@tanstack/react-query').UseQueryResult<DashboardStats, Error>,
 * }}
 */
export default function useDashboardStats(options = {}) {
  const { queryOptions = {} } = options;

  const statsQuery = useQuery({
    queryKey: queryKeys.dashboard.stats,
    queryFn: fetchDashboardStats,
    staleTime: 60_000,
    ...queryOptions,
  });

  return {
    stats: statsQuery.data ?? DEFAULT_STATS,
    isLoading: statsQuery.isLoading,
    isError: statsQuery.isError,
    error: statsQuery.error ?? null,
    refetch: statsQuery.refetch,
    statsQuery,
  };
}

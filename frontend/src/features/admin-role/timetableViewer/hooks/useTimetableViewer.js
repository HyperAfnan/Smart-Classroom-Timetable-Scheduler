import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Timetable Viewer data hook
 *
 * Provides functions that fetch and cache (via React Query) the data needed by the timetable viewer:
 * - classes
 * - time_slots
 * - timetable_entries (joined with time_slots)
 *
 * All fetchers use QueryClient.fetchQuery to leverage cached data when available.
 */
export default function useTimetableViewer() {
	const queryClient = useQueryClient();

	/**
	 * Fetch classes for a department.
	 * Uses query key: [...queryKeys.classes.list(), department_id]
	 */
	async function fetchClasses(department_id) {
		return queryClient.fetchQuery({
			queryKey: [...queryKeys.classes.list(), String(department_id)],
			staleTime: 60_000,
			queryFn: async () => {
				const { data, error } = await supabase
					.from("classes")
					.select("*")
					.eq("department_id", department_id)
					.order("created_at", { ascending: false });

				if (error) {
					throw new Error(error.message || "Failed to fetch classes");
				}
				return data ?? [];
			},
		});
	}

	/**
	 * Fetch time slots for a department.
	 * Uses query key: queryKeys.timeSlots.detail(department_id)
	 */
	async function fetchTimeSlots(department_id) {
		return queryClient.fetchQuery({
			queryKey: queryKeys.timeSlots.detail(department_id),
			staleTime: 60_000,
			queryFn: async () => {
				const { data, error } = await supabase
					.from("time_slots")
					.select("*")
					.eq("department_id", department_id)
					.order("day", { ascending: true })
					.order("slot", { ascending: true });

				if (error) {
					throw new Error(error.message || "Failed to fetch time slots");
				}
				return data ?? [];
			},
		});
	}

	/**
	 * Fetch timetable entries for a department (joined with time_slots).
	 * Uses query key: [...queryKeys.timetableEntries.list(), department_id]
	 */
	async function fetchTimetableEntries(department_id) {
		return queryClient.fetchQuery({
			queryKey: [
				...queryKeys.timetableEntries.list(),
				String(department_id),
			],
			staleTime: 60_000,
			queryFn: async () => {
				const { data, error } = await supabase
					.from("timetable_entries")
					.select("*, time_slots(*)")
					.eq("department_id", department_id);

				if (error) {
					throw new Error(
						error.message || "Failed to fetch timetable entries",
					);
				}
				return data ?? [];
			},
		});
	}

	/**
	 * Convenience function: fetch all required datasets in parallel.
	 */
	async function fetchAll(department_id) {
		const [classes, timeSlots, timetableEntries] = await Promise.all([
			fetchClasses(department_id),
			fetchTimeSlots(department_id),
			fetchTimetableEntries(department_id),
		]);

		return { classes, timeSlots, timetableEntries };
	}

	/**
	 * Backwards-compat function similar to previous API: prefetch timetable entries.
	 * Uses fetchQuery (so it returns the data) rather than prefetchQuery to meet requirements.
	 */
	async function prefetchTimetable(department_id) {
		return fetchTimetableEntries(department_id);
	}

	return {
		// Individual fetchers
		fetchClasses,
		fetchTimeSlots,
		fetchTimetableEntries,

		// Batch fetcher
		fetchAll,

		// Back-compat
		prefetchTimetable,

		// Expose the queryClient if the caller needs advanced control
		queryClient,
	};
}

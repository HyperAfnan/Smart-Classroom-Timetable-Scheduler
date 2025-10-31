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
 */

async function fetchClasses(department_id) {
	const { data, error } = await supabase
		.from("classes")
		.select("*")
		.eq("department_id", department_id)
		.order("created_at", { ascending: false });

	if (error) {
		throw new Error(error.message || "Failed to fetch classes");
	}
	return data ?? [];
}

async function fetchTimeslots(department_id) {
	//TODO: aligh this data order with the existing data order
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
}

async function fetchTimetableEntries(department_id) {
	const { data, error } = await supabase
		.from("timetable_entries")
		.select("*, time_slots(*)")
		.eq("department_id", department_id);

	if (error) {
		console.error("Error While Fetching timetable_entries: ", error);
		throw new Error(
			`Error While Fetching timetable_entries: ${error.message}`,
		);
	}

	return data || [];
}


export default function useTimetableViewer( { classesQueryOptions = {}, timeslotsQueryOptions = {}, timetableQueryOptions = {} }) {
	const queryClient = useQueryClient();

		const classesQuery =  useQuery({
			queryKey: queryKeys.classes.all,
			staleTime: 60_000,
			queryFn: () => fetchClasses(department_id),
			...classesQueryOptions,
		});

		const timeSlotsQuery = useQuery({
			queryKey: queryKeys.timeSlots.all,
			staleTime: 60_000,
			queryFn: () => fetchTimeSlots(department_id),
			...timeslotsQueryOptions,
		});

	const timetableQuery = useQuery({
		queryKey: [queryKeys.timetableEntries.all],
		queryFn: () => fetchTimetableEntries(department_id),
		staleTime: 60_000_000,
		...timetableQueryOptions,
	});


	return {
		isLoading: timetableQuery.isPending || timeSlotsQuery.isPending || classesQuery.isPending,
		isError: timetableQuery.isError || timeSlotsQuery.isError || classesQuery.isError,
		error: timetableQuery.error || timeSlotsQuery.error || classesQuery.error,
		timetable: timetableQuery.data,
		timeslots: timeSlotsQuery.data,
		classes: classesQuery.data

	};
}

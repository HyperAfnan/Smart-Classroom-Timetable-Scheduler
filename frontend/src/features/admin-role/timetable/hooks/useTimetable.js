import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import queryKeys from "@/shared/queryKeys.js";

const EMPTY = Object.freeze([]);

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

export default function useTimetable(department_id, options = {}) {
	const timetableQueries = useQuery({
		queryKey: [...queryKeys.timetableEntries.list(), String(department_id)],
		queryFn: () => fetchTimetableEntries(department_id),
		staleTime: 60_000_000,
		...options,
	});
	return {
		timetable: timetableQueries.data ?? EMPTY,
		isLoading: timetableQueries.isLoading,
		isError: timetableQueries.isError,
		error: timetableQueries.error,
		refresh: timetableQueries.refetch,
		timetableQueries,
	};
}

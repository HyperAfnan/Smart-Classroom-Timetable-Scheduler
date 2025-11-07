/**
 * Hook: useTeacherSubjects
 *
 * Purpose:
 *  Retrieve the subjects associated with a given teacher (rows from the
 *  pivot table `teacher_subjects`) using React Query.
 *
 * Design Notes:
 *  - Mirrors the query key structure defined globally in `queryKeys.teacherSubjects`.
 *  - Keeps teacher-centric components simple (e.g. teachers table, detail views).
 *  - Optional relational expansion to include full `subjects(*)` rows, which is
 *    useful for rendering subject names/codes directly without an additional query.
 *
 * Table reference:
 *  teacher_subjects {
 *    teacher: number
 *    subject: number
 *    created_at?: string
 *  }
 *
 * Usage:
 *    const {
 *      links,
 *      subjects,
 *      isLoading,
 *      isError,
 *      error,
 *      refetch,
 *      query,
 *    } = useTeacherSubjects({
 *      queryOptions: { staleTime: 60_000 },
 *    });
 *
 *    if (isLoading) return <Spinner />;
 *
 * Notes:
 *  - If teacher is null/undefined the query is disabled and returns empty arrays.
 *  - You can override any React Query option through `queryOptions`.
 */
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

const EMPTY_ARRAY = Object.freeze([]);

async function fetchTeacherSubjects() {
   const { data, error } = await supabase.from("teacher_subjects").select("*");

   if (error) {
     throw new Error(error.message || `Failed to load teacher subjects`);
   }
   return data ?? [];
}

/**
 * @typedef {Object} UseTeacherSubjectsOptions
 * @property {boolean=} includeSubjectDetails - When true, includes joined subject rows (subjects.*).
 * @property {import('@tanstack/react-query').UseQueryOptions<any[], Error>=} queryOptions - Extra React Query options.
 */

/**
 * React hook to retrieve the subject associations for a given teacher.
 *
 * @param {UseTeacherSubjectsOptions=} options
 * @returns {{
 *   teacherSubjects: any[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: unknown,
 *   refetch: () => Promise<import('@tanstack/react-query').QueryObserverResult<any[], Error>>,
 *   query: import('@tanstack/react-query').UseQueryResult<any[], Error>
 * }}
 */
export default function useTeacherSubjects(options = {}) {

  const { teachersSubjectQueryOptions = {} } = options;

  const teachersSubjectQuery = useQuery({
    queryKey: queryKeys.teacherSubjects.all,
    queryFn: fetchTeacherSubjects,
    staleTime: 10 * 60_000, 
    ...teachersSubjectQueryOptions,
  });

  const isLoading = Boolean( teachersSubjectQuery.isLoading);
  const isError = Boolean(teachersSubjectQuery.isError);
  const error = teachersSubjectQuery.error ?? null;

  const refetch = async () => {
    const [tRes] = await Promise.all([
      teachersSubjectQuery.refetch(),
    ]);
    return { teacherSubjects: tRes.data ?? [] };
  };

  return {
    teacherSubjects: teachersSubjectQuery.data ?? EMPTY_ARRAY,
    isLoading,
    isError,
    error,
    refetch,
    teachersSubjectQuery,
  };
}

/**
 * React Query powered hook to fetch teachers and departments from Supabase.
 *
 * Requirements:
 * - Your app must be wrapped with React Query's QueryClientProvider.
 * - Supabase client must be configured and exported from "@/config/supabase".
 *
 * Example:
 *   import useTeachers from "./hooks/useTeachers";
 *
 *   function TeachersPage() {
 *     const {
 *       teachers,
 *       departments,
 *       isLoading,
 *       isError,
 *       error,
 *       refetch,
 *     } = useTeachers({
 *       teachersQueryOptions: { staleTime: 60_000 },
 *       departmentsQueryOptions: { staleTime: 5 * 60_000 },
 *     });
 *
 *     if (isLoading) return <div>Loading...</div>;
 *     if (isError) return <div>Error: {String(error?.message || error)}</div>;
 *
 *     return (
 *       <div>
 *         <button onClick={() => refetch()}>Refresh</button>
 *         <pre>{JSON.stringify({ teachers, departments }, null, 2)}</pre>
 *       </div>
 *     );
 *   }
 */

import { useQuery } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getDocs } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Query keys for React Query caches related to teachers feature.
 * Use these keys to invalidate or refetch from other parts of the app.
 */
const EMPTY_TEACHERS = Object.freeze([]);
const EMPTY_DEPARTMENTS = Object.freeze([]);

/**
 * @typedef {Object} Teacher
 * @property {number|string} id
 * @property {string} name
 * @property {string} email
 * @property {string} emp_id
 * @property {string} department
 * @property {string} designation
 * @property {number=} max_hours
 * @property {any[]=} subjects
 */

/**
 * Fetch all teachers from Supabase.
 * @returns {Promise<Teacher[]>}
 */
// TODO: fetch only specific department teacher_profiles only,
// otherwise, the app will be slot and will fetch unnessesary teachers data
// TODO: fetch only specific department teacher_profiles only,
// otherwise, the app will be slot and will fetch unnessesary teachers data
async function fetchTeachers() {
  const snapshot = await getDocs(collection(db, "teacher_profile"));
  const teachers = [];
  snapshot.forEach((doc) => {
    teachers.push({ id: doc.id, ...doc.data() });
  });
  return teachers;
}

/**
 * Fetch department names from Supabase.
 * @returns {Promise<string[]>}
 */
async function fetchDepartments() {
  const snapshot = await getDocs(collection(db, "department"));
  const departments = [];
  snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) departments.push(data.name);
  });
  return departments;
}

/**
 * @typedef {Object} UseTeachersOptions
 * @property {import('@tanstack/react-query').UseQueryOptions<Teacher[], Error>=} teachersQueryOptions
 *  Optional React Query options for the teachers query (e.g., staleTime, select, enabled).
 * @property {import('@tanstack/react-query').UseQueryOptions<string[], Error>=} departmentsQueryOptions
 *  Optional React Query options for the departments query.
 */

/**
 * Fetches teachers and departments using React Query with sensible defaults.
 *
 * - Teachers query defaults to staleTime: 60s.
 * - Departments query defaults to staleTime: 10 minutes.
 * - Both queries can be customized via options.
 *
 * @param {UseTeachersOptions=} options
 * @returns {{
 *   teachers: Teacher[],
 *   departments: string[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: unknown,
 *   refetch: () => Promise<{ teachers: Teacher[], departments: string[] }>,
 *   teachersQuery: import('@tanstack/react-query').UseQueryResult<Teacher[], Error>,
 *   departmentsQuery: import('@tanstack/react-query').UseQueryResult<string[], Error>,
 * }}
 */
export default function useTeachers(options = {}) {
  const { teachersQueryOptions = {}, departmentsQueryOptions = {} } = options;

  const teachersQuery = useQuery({
    queryKey: queryKeys.teachers.all,
    queryFn: fetchTeachers,
    staleTime: 60_000, // 1 minute
    ...teachersQueryOptions,
  });

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: fetchDepartments,
    staleTime: 10 * 60_000, // 10 minutes
    ...departmentsQueryOptions,
  });

  const isLoading = Boolean(
    teachersQuery.isLoading || departmentsQuery.isLoading,
  );
  const isError = Boolean(teachersQuery.isError || departmentsQuery.isError);
  const error = teachersQuery.error ?? departmentsQuery.error ?? null;

  const refetch = async () => {
    const [tRes, dRes] = await Promise.all([
      teachersQuery.refetch(),
      departmentsQuery.refetch(),
    ]);
    return {
      teachers: tRes.data ?? [],
      departments: dRes.data ?? [],
    };
  };

  return {
    teachers: teachersQuery.data ?? EMPTY_TEACHERS,
    departments: departmentsQuery.data ?? EMPTY_DEPARTMENTS,
    isLoading,
    isError,
    error,
    refetch,
    teachersQuery,
    departmentsQuery,
  };
}

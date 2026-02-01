/**
 * React Query powered hook to fetch subjects and departments from Firebase.
 *
 * Requirements:
 * - Your app must be wrapped with React Query's QueryClientProvider.
 * - Firebase client must be configured and exported from "@/config/firebase".
 *
 * Example:
 *   import useSubjects, { queryKeys } from "./hooks/useSubjects";
 *
 *   export default function SubjectsPage() {
 *     const {
 *       subjects,
 *       departments,
 *       isLoading,
 *       isError,
 *       error,
 *       refetch,
 *     } = useSubjects({
 *       subjectsQueryOptions: { staleTime: 60_000 },
 *       departmentsQueryOptions: { staleTime: 10 * 60_000 },
 *     });
 *
 *     if (isLoading) return <div>Loading...</div>;
 *     if (isError) return <div>Error: {String(error?.message || error)}</div>;
 *
 *     return (
 *       <div>
 *         <button onClick={() => refetch()}>Refresh</button>
 *         <pre>{JSON.stringify({ subjects, departments }, null, 2)}</pre>
 *       </div>
 *     );
 *   }
 */

import { useQuery } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Query keys for React Query caches related to the subjects feature.
 * Use these keys to invalidate or refetch from other parts of the app.
 *
 * Note: The "departments" key matches other features to leverage a shared cache.
 */

const EMPTY_SUBJECTS = Object.freeze([]);
const EMPTY_DEPARTMENTS = Object.freeze([]);

/**
 * @typedef {Object} Subject
 * @property {number|string} id
 * @property {string} subject_name
 * @property {string} subject_code
 * @property {number} credits
 * @property {string} department
 * @property {number} semester
 * @property {string} type
 * @property {number} hours_per_week
 * @property {string=} created_at
 */

/**
 * Fetch subjects ordered by newest first.
 * @returns {Promise<Subject[]>}
 */
async function fetchSubjects() {
  const q = query(collection(db, "subjects"), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  const subjects = [];
  snapshot.forEach((doc) => {
    subjects.push({ id: doc.id, ...doc.data() });
  });
  return subjects;
}

/**
 * Fetch department names ordered alphabetically.
 * @returns {Promise<string[]>}
 */
async function fetchDepartments() {
  const q = query(collection(db, "departments"), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  const departments = [];
  snapshot.forEach((doc) => {
      const data = doc.data();
      if (data.name) departments.push(data.name);
  });
  return departments;
}

/**
 * @typedef {Object} UseSubjectsOptions
 * @property {import('@tanstack/react-query').UseQueryOptions<Subject[], Error>=} subjectsQueryOptions
 *  Optional React Query options for the subjects query (e.g., staleTime, enabled, select).
 * @property {import('@tanstack/react-query').UseQueryOptions<string[], Error>=} departmentsQueryOptions
 *  Optional React Query options for the departments query.
 */

/**
 * Fetches subjects and departments using React Query with sensible defaults.
 *
 * - Subjects query defaults to staleTime: 60s.
 * - Departments query defaults to staleTime: 10 minutes.
 * - Both queries can be customized via options.
 *
 * @param {UseSubjectsOptions=} options
 * @returns {{
 *   subjects: Subject[],
 *   departments: string[],
 *   isLoading: boolean,
 *   isError: boolean,
 *   error: unknown,
 *   refetch: () => Promise<{ subjects: Subject[], departments: string[] }>,
 *   subjectsQuery: import('@tanstack/react-query').UseQueryResult<Subject[], Error>,
 *   departmentsQuery: import('@tanstack/react-query').UseQueryResult<string[], Error>,
 * }}
 */
export default function useSubjects(options = {}) {
  const { subjectsQueryOptions = {}, departmentsQueryOptions = {} } = options;

  const subjectsQuery = useQuery({
    queryKey: queryKeys.subjects.all,
    queryFn: fetchSubjects,
    staleTime: 60_000, // 1 minute
    ...subjectsQueryOptions,
  });

  const departmentsQuery = useQuery({
    queryKey: queryKeys.departments.all,
    queryFn: fetchDepartments,
    staleTime: 10 * 60_000, // 10 minutes
    ...departmentsQueryOptions,
  });

  const isLoading = Boolean(
    subjectsQuery.isLoading || departmentsQuery.isLoading,
  );
  const isError = Boolean(subjectsQuery.isError || departmentsQuery.isError);
  const error = subjectsQuery.error ?? departmentsQuery.error ?? null;

  const refetch = async () => {
    const [sRes, dRes] = await Promise.all([
      subjectsQuery.refetch(),
      departmentsQuery.refetch(),
    ]);
    return {
      subjects: sRes.data ?? [],
      departments: dRes.data ?? [],
    };
  };

  return {
    subjects: subjectsQuery.data ?? EMPTY_SUBJECTS,
    departments: departmentsQuery.data ?? EMPTY_DEPARTMENTS,
    isLoading,
    isError,
    error,
    refetch,
    subjectsQuery,
    departmentsQuery,
  };
}

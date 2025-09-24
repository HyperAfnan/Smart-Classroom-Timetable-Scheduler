/**
 * Centralized React Query cache keys used across features.
 *
 * Why centralize:
 * - Prevents key drift between features (e.g., "department" vs "departments")
 * - Enables cross-feature cache sharing and invalidation
 * - Provides consistent factory helpers for entity-scoped keys
 *
 * Usage:
 *   import { queryKeys } from "@/shared/queryKeys";
 *   // useQuery
 *   useQuery({ queryKey: queryKeys.teachers.all, queryFn: fetchTeachers })
 *   // useMutation invalidate
 *   queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all })
 *
 *   // Entity-scoped
 *   useQuery({ queryKey: queryKeys.teachers.detail(id), queryFn: () => fetchTeacher(id) })
 */

export const queryKeys = Object.freeze({
  // Teachers feature
  teachers: Object.freeze({
    all: ["teachers"],
    list: () => ["teachers", "list"], // reserved for filtered lists if needed
    detail: (id) => ["teachers", "detail", String(id)],
  }),

  // Subjects feature
  subjects: Object.freeze({
    all: ["subjects"],
    list: () => ["subjects", "list"],
    detail: (id) => ["subjects", "detail", String(id)],
  }),

  // Departments are shared across features (teachers, subjects, rooms, etc.)
  departments: Object.freeze({
    all: ["departments"],
    // If you later fetch department by id or code:
    detail: (idOrCode) => ["departments", "detail", String(idOrCode)],
  }),
});

export default queryKeys;

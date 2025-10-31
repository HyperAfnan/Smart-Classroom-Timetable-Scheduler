/**
 * React Query hooks for Classes feature: fetching and mutations using shared query keys.
 *
 * - Centralizes reads (fetch) and writes (create/update/delete) to the Supabase "classes" table.
 * - Uses shared query keys when available for cross-feature cache alignment.
 * - Exposes mutation status flags to control UI (e.g., disable submit/delete while pending).
 *
 * Usage:
 *   import useClasses from "./hooks/useClasses";
 *
 *   function ClassesPage() {
 *     const {
 *       classes,
 *       isLoading,
 *       isError,
 *       error,
 *       refetch,
 *       // mutations
 *       createClassAsync,
 *       updateClassAsync,
 *       deleteClassAsync,
 *       // status flags
 *       createStatus,
 *       updateStatus,
 *       deleteStatus,
 *       isSubmitting,
 *       isDeleting,
 *     } = useClasses();
 *   }
 */

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

const EMPTY_CLASSES = Object.freeze([]);

/**
 * @typedef {Object} ClassEntity
 * @property {string|number} id
 * @property {string=} name
 * @property {string=} class_name
 * @property {string} department
 * @property {number} semester
 * @property {string} section
 * @property {number} students
 * @property {string} academic_year
 * @property {string=} created_at
 */

/**
 * Fetch classes from Supabase.
 * @returns {Promise<ClassEntity[]>}
 */
// TODO: fetch only department level classes
async function fetchClasses() {
	const { data, error } = await supabase
		.from("classes")
		.select("*")
		.order("created_at", { ascending: false });
	if (error) {
		throw new Error(error.message || "Failed to load classes");
	}
	return data ?? [];
}

/**
 * Insert a new class row.
 * @param {Omit<ClassEntity, 'id'>} classPayload
 * @returns {Promise<ClassEntity>}
 */
async function insertClass(classPayload) {
	const { data, error } = await supabase
		.from("classes")
		.insert([classPayload])
		.select("*")
		.single();
	if (error) {
		throw new Error(error.message || "Failed to create class");
	}
	return data;
}

/**
 * Update a class by id.
 * @param {{ id: string|number, updates: Partial<ClassEntity> }} params
 * @returns {Promise<ClassEntity>}
 */
async function updateClassById({ id, updates }) {
	const { data, error } = await supabase
		.from("classes")
		.update(updates)
		.eq("id", id)
		.select("*")
		.single();
	if (error) {
		throw new Error(error.message || "Failed to update class");
	}
	return data;
}

/**
 * Delete a class by id.
 * @param {string|number} id
 * @returns {Promise<{ id: string|number }>}
 */
async function deleteClassById(id) {
	const { error } = await supabase.from("classes").delete().eq("id", id);
	if (error) {
		throw new Error(error.message || "Failed to delete class");
	}
	return { id };
}

/**
 * @typedef {Object} UseClassesOptions
 * @property {import('@tanstack/react-query').UseQueryOptions<ClassEntity[], Error>=} classesQueryOptions
 *  Optional React Query options for the classes query (e.g., staleTime, enabled, select).
 * @property {import('@tanstack/react-query').UseMutationOptions<any, Error, any>=} createOptions
 *  Optional options for the create mutation (onSuccess, onError, etc.).
 * @property {import('@tanstack/react-query').UseMutationOptions<any, Error, {id:string|number,updates:Object}>=} updateOptions
 *  Optional options for the update mutation.
 * @property {import('@tanstack/react-query').UseMutationOptions<any, Error, string|number>=} deleteOptions
 *  Optional options for the delete mutation.
 */

/**
 * Main hook that provides:
 * - Query: classes data and states
 * - Mutations: create/update/delete with cache updates and invalidations
 *
 * @param {UseClassesOptions=} options
 */
export default function useClasses({
	classesQueryOptions = {},
	createOptions,
	updateOptions,
	deleteOptions,
} = {}) {
	const queryClient = useQueryClient();

	// Query: classes
	const classesQuery = useQuery({
		queryKey: queryKeys.classes.all,
		queryFn: fetchClasses,
		staleTime: 60_000, // 1 minute
		...classesQueryOptions,
	});

	// Create mutation
	const createStatus = useMutation({
		mutationFn: insertClass,
		onSuccess: async (created, variables, context) => {
			// Optimistically update list
			queryClient.setQueryData(queryKeys.classes.all, (prev) => {
				const list = Array.isArray(prev) ? prev : [];
				return [created, ...list];
			});
			// Ensure consistency by invalidating
			await queryClient.invalidateQueries({
				queryKey: queryKeys.classes.all,
			});
			if (createOptions?.onSuccess) {
				createOptions.onSuccess(created, variables, context);
			}
		},
		onError: (err, variables, context) => {
			if (createOptions?.onError) {
				createOptions.onError(err, variables, context);
			}
		},
		...createOptions,
	});

	// Update mutation
	const updateStatus = useMutation({
		mutationFn: updateClassById,
		onSuccess: async (updated, variables, context) => {
			queryClient.setQueryData(queryKeys.classes.all, (prev) => {
				if (!Array.isArray(prev)) return prev;
				return prev.map((c) =>
					c?.id === updated?.id ? { ...c, ...updated } : c,
				);
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.classes.all,
			});
			if (updateOptions?.onSuccess) {
				updateOptions.onSuccess(updated, variables, context);
			}
		},
		onError: (err, variables, context) => {
			if (updateOptions?.onError) {
				updateOptions.onError(err, variables, context);
			}
		},
		...updateOptions,
	});

	// Delete mutation
	const deleteStatus = useMutation({
		mutationFn: deleteClassById,
		onSuccess: async (result, variables, context) => {
			const deletedId = result?.id ?? variables;
			queryClient.setQueryData(queryKeys.classes.all, (prev) => {
				if (!Array.isArray(prev)) return prev;
				return prev.filter((c) => c?.id !== deletedId);
			});
			await queryClient.invalidateQueries({
				queryKey: queryKeys.classes.all,
			});
			if (deleteOptions?.onSuccess) {
				deleteOptions.onSuccess(result, variables, context);
			}
		},
		onError: (err, variables, context) => {
			if (deleteOptions?.onError) {
				deleteOptions.onError(err, variables, context);
			}
		},
		...deleteOptions,
	});

	// Derived helper flags
	const isSubmitting = Boolean(
		createStatus.isPending || updateStatus.isPending,
	);
	const isDeleting = Boolean(deleteStatus.isPending);

	// Helper mutateAsync aliases
	const createClassAsync = createStatus.mutateAsync;
	const updateClassAsync = updateStatus.mutateAsync;
	const deleteClassAsync = deleteStatus.mutateAsync;

	return {
		// Data
		classes: classesQuery.data ?? EMPTY_CLASSES,

		// Query state
		isLoading: classesQuery.isLoading,
		isError: classesQuery.isError,
		error: classesQuery.error ?? null,
		refetch: classesQuery.refetch,
		classesQuery,

		// Mutations
		createClassAsync,
		updateClassAsync,
		deleteClassAsync,

		// Mutation results
		createStatus,
		updateStatus,
		deleteStatus,

		// Derived flags
		isSubmitting,
		isDeleting,
	};
}

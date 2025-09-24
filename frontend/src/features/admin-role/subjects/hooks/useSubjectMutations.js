/**
 * React Query mutations for Subjects CRUD operations (create, update, delete).
 *
 * Goals:
 * - Centralize all write operations for the Subjects feature.
 * - Keep page components free of direct API calls.
 * - Ensure cache stays in sync by invalidating the subjects list after mutations.
 *
 * Requirements:
 * - App must be wrapped in React Query's QueryClientProvider.
 * - Supabase client must be configured and exported from "@/config/supabase".
 *
 * Usage example:
 *
 *   import useSubjectMutations, { queryKeys } from "./useSubjectMutations";
 *
 *   export default function SubjectsPage() {
 *     const {
 *       createSubjectAsync,
 *       updateSubjectAsync,
 *       deleteSubjectAsync,
 *       createStatus,
 *       updateStatus,
 *       deleteStatus,
 *     } = useSubjectMutations();
 *
 *     async function handleSave(subject, editingSubject) {
 *       if (editingSubject) {
 *         await updateSubjectAsync({ id: editingSubject.id, updates: subject });
 *       } else {
 *         await createSubjectAsync(subject);
 *       }
 *     }
 *
 *     async function handleDelete(id) {
 *       await deleteSubjectAsync(id);
 *     }
 *
 *     // render...
 *   }
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Insert a new subject row.
 * @param {Object} subject - The subject payload to insert.
 * @returns {Promise<Object>} Inserted subject row.
 */
async function insertSubject(subject) {
  const { data, error } = await supabase
    .from("subjects")
    .insert([subject])
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to create subject");
  }
  return data;
}

/**
 * Update a subject by id.
 * @param {{ id: string|number, updates: Object }} params
 * @returns {Promise<Object>} Updated subject row.
 */
async function updateSubjectById({ id, updates }) {
  const { data, error } = await supabase
    .from("subjects")
    .update(updates)
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message || "Failed to update subject");
  }
  return data;
}

/**
 * Delete a subject by id.
 * @param {string|number} id
 * @returns {Promise<{ id: string|number }>} Deleted id for convenience.
 */
async function deleteSubjectById(id) {
  const { error } = await supabase.from("subjects").delete().eq("id", id);
  if (error) {
    throw new Error(error.message || "Failed to delete subject");
  }
  return { id };
}

/**
 * Hook that exposes mutations for creating, updating, and deleting subjects.
 *
 * @param {Object} [options]
 * @param {import('@tanstack/react-query').UseMutationOptions<any, Error, any>} [options.createOptions]
 *  Additional options for the create mutation (onSuccess, onError, etc.).
 * @param {import('@tanstack/react-query').UseMutationOptions<any, Error, {id:string|number,updates:Object}>} [options.updateOptions]
 *  Additional options for the update mutation.
 * @param {import('@tanstack/react-query').UseMutationOptions<any, Error, string|number>} [options.deleteOptions]
 *  Additional options for the delete mutation.
 *
 * @returns {{
 *   createSubject: (variables: Object, options?: import('@tanstack/react-query').MutateOptions)=>void,
 *   createSubjectAsync: (variables: Object)=>Promise<any>,
 *   updateSubject: (variables: {id: string|number, updates: Object}, options?: import('@tanstack/react-query').MutateOptions)=>void,
 *   updateSubjectAsync: (variables: {id: string|number, updates: Object})=>Promise<any>,
 *   deleteSubject: (id: string|number, options?: import('@tanstack/react-query').MutateOptions)=>void,
 *   deleteSubjectAsync: (id: string|number)=>Promise<any>,
 *   createStatus: import('@tanstack/react-query').UseMutationResult<any, Error, any>,
 *   updateStatus: import('@tanstack/react-query').UseMutationResult<any, Error, {id: string|number, updates: Object}>,
 *   deleteStatus: import('@tanstack/react-query').UseMutationResult<any, Error, string|number>
 * }}
 */
export default function useSubjectMutations({
  createOptions,
  updateOptions,
  deleteOptions,
} = {}) {
  const queryClient = useQueryClient();

  const createStatus = useMutation({
    mutationFn: insertSubject,
    onSuccess: async (created, variables, context) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.subjects.all, (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return [created, ...list];
      });
      // Revalidate to ensure consistency with server
      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
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

  const updateStatus = useMutation({
    mutationFn: updateSubjectById,
    onSuccess: async (updated, variables, context) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.subjects.all, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((s) =>
          s?.id === updated?.id ? { ...s, ...updated } : s,
        );
      });
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
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

  const deleteStatus = useMutation({
    mutationFn: deleteSubjectById,
    onSuccess: async (result, variables, context) => {
      const deletedId = result?.id ?? variables;
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.subjects.all, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((s) => s?.id !== deletedId);
      });
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: queryKeys.subjects.all });
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

  return {
    // Create
    createSubject: createStatus.mutate,
    createSubjectAsync: createStatus.mutateAsync,
    // Update
    updateSubject: updateStatus.mutate,
    updateSubjectAsync: updateStatus.mutateAsync,
    // Delete
    deleteSubject: deleteStatus.mutate,
    deleteSubjectAsync: deleteStatus.mutateAsync,
    // Status objects for loading/error state
    createStatus,
    updateStatus,
    deleteStatus,
  };
}

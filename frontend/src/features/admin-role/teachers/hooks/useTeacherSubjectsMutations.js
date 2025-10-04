import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Insert a teacher-subject link.
 * @param {{ teacher: string, subject: string }} payload
 */
async function insertTeacherSubject(payload) {
   const { data, error } = await supabase
      .from("teacher_subjects")
      .insert([payload])
      .select("*")
      .single();

   if (error) {
      throw new Error(error.message || "Failed to link teacher with subject");
   }
   return data;
}

/**
 * Update a teacher subject by id.
 * @param {{ id: string|number, updates: Object }} params
 * @returns {Promise<Object>} Updated teacher row.
 */
async function updateTeacherSubjectById({ teacher, subject }) {
   const { data, error } = await supabase
      .from("teacher_subjects")
      .update({ subject })
      .eq("teacher", teacher)
      .select("*")
      .single();

   if (error) {
      throw new Error(error.message || "Failed to update teacher");
   }
   return data;
}

/**
 * Delete a teacher-subject link by teacher & subject.
 * @param {{ teacher: string, subject: string }}
 */
async function deleteTeacherSubject({ teacher, subject }) {
   const { error } = await supabase
      .from("teacher_subjects")
      .delete()
      .eq("teacher", teacher)
      .eq("subject", subject);

   if (error) {
      throw new Error(error.message || "Failed to unlink teacher from subject");
   }
   return { teacher, subject };
}

/**
 * Bulk replace subjects for a teacher (delete all old links, insert new).
 * @param {{ teacher: string, subject: string[] }}
 */
async function bulkReplaceTeacherSubjects({ teacher, subject }) {
   const { error: delError } = await supabase
      .from("teacher_subjects")
      .delete()
      .eq("teacher", teacher);

   if (delError) {
      throw new Error(delError.message || "Failed to reset teacher subjects");
   }

   if (!subject || subject.length === 0) return [];

   const { data, error } = await supabase
      .from("teacher_subjects")
      .insert(subject.map((s) => ({ teacher, subject: s })))
      .select("*");

   if (error) {
      throw new Error(error.message || "Failed to insert teacher subjects");
   }
   return data;
}
//
export default function useTeacherSubjectMutations({
   createOptions,
   editingOptions,
   deleteOptions,
   bulkReplaceOptions,
} = {}) {
   const queryClient = useQueryClient();

   const createStatus = useMutation({
      mutationFn: insertTeacherSubject,
      onSuccess: async (created, vars, ctx) => {
         queryClient.invalidateQueries({
            queryKey: queryKeys.teacherSubjects.all,
         });
         if (createOptions?.onSuccess) {
            createOptions.onSuccess(created, vars, ctx);
         }
      },
      onError: (err, vars, ctx) => {
         if (createOptions?.onError) createOptions.onError(err, vars, ctx);
      },
      ...createOptions,
   });

   const editStatus = useMutation({
      mutationFn: updateTeacherSubjectById,
      onSuccess: async (updated, vars, ctx) => {
         queryClient.invalidateQueries({
            queryKey: queryKeys.teacherSubjects.all,
         });
         if (editingOptions?.onSuccess) {
            editingOptions.onSuccess(updated, vars, ctx);
         }
      },
      onError: (err, vars, ctx) => {
         if (editingOptions?.onError) editingOptions.onError(err, vars, ctx);
      },
      ...editingOptions,
   });

   const deleteStatus = useMutation({
      mutationFn: deleteTeacherSubject,
      onSuccess: async (deleted, vars, ctx) => {
         queryClient.invalidateQueries({
            queryKey: queryKeys.teacherSubjects.all,
         });
         if (deleteOptions?.onSuccess) {
            deleteOptions.onSuccess(deleted, vars, ctx);
         }
      },
      onError: (err, vars, ctx) => {
         if (deleteOptions?.onError) deleteOptions.onError(err, vars, ctx);
      },
      ...deleteOptions,
   });

   const bulkReplaceStatus = useMutation({
      mutationFn: bulkReplaceTeacherSubjects,
      onSuccess: async (data, vars, ctx) => {
         queryClient.invalidateQueries({
            queryKey: queryKeys.teacherSubjects.all,
         });
         if (bulkReplaceOptions?.onSuccess) {
            bulkReplaceOptions.onSuccess(data, vars, ctx);
         }
      },
      onError: (err, vars, ctx) => {
         if (bulkReplaceOptions?.onError)
            bulkReplaceOptions.onError(err, vars, ctx);
      },
      ...bulkReplaceOptions,
   });

   return {
      createTeacherSubject: createStatus.mutate,
      createTeacherSubjectAsync: createStatus.mutateAsync,
      editTeacherSubject: editStatus.mutate,
      editTeacherSubjectAsync: editStatus.mutateAsync,
      deleteTeacherSubject: deleteStatus.mutate,
      deleteTeacherSubjectAsync: deleteStatus.mutateAsync,
      bulkReplaceTeacherSubjects: bulkReplaceStatus.mutate,
      bulkReplaceTeacherSubjectsAsync: bulkReplaceStatus.mutateAsync,
      createStatus,
      editStatus,
      deleteStatus,
      bulkReplaceStatus,
   };
}

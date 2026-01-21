/**
 * React Query mutations for teacher CRUD operations (create, update, delete).
 *
 * Goals:
 * - Centralize all write operations for the Teachers feature.
 * - Keep page components free of direct API calls.
 * - Ensure cache stays in sync by invalidating the teachers list after mutations.
 *
 * Requirements:
 * - App must be wrapped in React Query's QueryClientProvider.
 * - Supabase client must be configured and exported from "@/config/supabase".
 *
 * Usage example:
 *
 *   import useTeachers from "./useTeachers";
 *   import useTeacherMutations from "./useTeacherMutations";
 *
 *   export default function TeachersPage() {
 *     const { teachers, departments, isLoading } = useTeachers();
 *     const {
 *       createTeacherAsync,
 *       updateTeacherAsync,
 *       deleteTeacherAsync,
 *       createStatus,
 *       updateStatus,
 *       deleteStatus,
 *     } = useTeacherMutations();
 *
 *     async function handleSubmit(e) {
 *       e.preventDefault();
 *       if (editingTeacher) {
 *         await updateTeacherAsync({ id: editingTeacher.id, updates: formData });
 *       } else {
 *         await createTeacherAsync(formData);
 *       }
 *       resetForm();
 *     }
 *
 *     async function handleDelete(id) {
 *       await deleteTeacherAsync(id);
 *     }
 *
 *     // render...
 *   }
 */

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Generate a random password for new teachers
 */
function generatePassword() {
  const length = 12;
  const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let password = "";
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

/**
 * Insert a new teacher row.
 * Note: This only creates the teacher profile. The teacher will need to sign up separately.
 * 
 * @param {Object} teacher - The teacher payload to insert.
 * @returns {Promise<Object>} Inserted teacher row with signup instructions.
 */
async function insertTeacher(teacher) {
  if (!teacher || typeof teacher !== "object" || Array.isArray(teacher)) {
    throw new Error("Invalid teacher payload");
  }
  if (!teacher.email) {
    throw new Error("Teacher must include an email");
  }

  try {
    // Create teacher profile in Firestore
    const teacherData = {
      ...teacher,
      createdAt: serverTimestamp(),
    };
    
    const docRef = await addDoc(collection(db, "teacher_profile"), teacherData);
    
    // Fetch and return the created teacher
    const snapshot = await getDoc(docRef);
    return { 
      id: docRef.id, 
      ...snapshot.data(),
      // Return signup instructions
      signupInstructions: `Teacher account created. Please ask the teacher to sign up at the registration page using email: ${teacher.email}`,
    };
  } catch (error) {
    console.error("Teacher creation error:", error);
    throw error;
  }
}

/**
 * Update a teacher by id.
 * @param {{ id: string|number, updates: Object }} params
 * @returns {Promise<Object>} Updated teacher row.
 */
async function updateTeacherById({ id, updates }) {
  const teacherRef = doc(db, "teacher_profile", String(id));
  await updateDoc(teacherRef, updates);
  // Fetch updated data to return
  const snapshot = await getDoc(teacherRef);
  return { id, ...snapshot.data() };
}

/**
 * Delete a teacher by id.
 * @param {string|number} id
 * @returns {Promise<{ id: string|number }>} Deleted id for convenience.
 */
async function deleteTeacherById(id) {
  const teacherRef = doc(db, "teacher_profile", String(id));
  await deleteDoc(teacherRef);
  return { id };
}

/**
 * Hook that exposes mutations for creating, updating, and deleting teachers.
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
 *   createTeacher: (variables: Object, options?: import('@tanstack/react-query').MutateOptions)=>void,
 *   createTeacherAsync: (variables: Object)=>Promise<any>,
 *   updateTeacher: (variables: {id: string|number, updates: Object}, options?: import('@tanstack/react-query').MutateOptions)=>void,
 *   updateTeacherAsync: (variables: {id: string|number, updates: Object})=>Promise<any>,
 *   deleteTeacher: (id: string|number, options?: import('@tanstack/react-query').MutateOptions)=>void,
 *   deleteTeacherAsync: (id: string|number)=>Promise<any>,
 *   createStatus: import('@tanstack/react-query').UseMutationResult<any, Error, any>,
 *   updateStatus: import('@tanstack/react-query').UseMutationResult<any, Error, {id: string|number, updates: Object}>,
 *   deleteStatus: import('@tanstack/react-query').UseMutationResult<any, Error, string|number>
 * }}
 */
export default function useTeacherMutations({
  createOptions,
  updateOptions,
  deleteOptions,
} = {}) {
  const queryClient = useQueryClient();

  const createStatus = useMutation({
    mutationFn: insertTeacher,
    onSuccess: async (created, variables, context) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.teachers.all, (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return [created, ...list];
      });
      // Revalidate to ensure consistency with server
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
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
    mutationFn: updateTeacherById,
    onSuccess: async (updated, variables, context) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.teachers.all, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.map((t) =>
          t?.id === updated?.id ? { ...t, ...updated } : t,
        );
      });
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
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
    mutationFn: deleteTeacherById,
    onSuccess: async (result, variables, context) => {
      const deletedId = result?.id ?? variables;
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.teachers.all, (prev) => {
        if (!Array.isArray(prev)) return prev;
        return prev.filter((t) => t?.id !== deletedId);
      });
      // Revalidate
      await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
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
    createTeacher: createStatus.mutate,
    createTeacherAsync: createStatus.mutateAsync,
    // Update
    updateTeacher: updateStatus.mutate,
    updateTeacherAsync: updateStatus.mutateAsync,
    // Delete
    deleteTeacher: deleteStatus.mutate,
    deleteTeacherAsync: deleteStatus.mutateAsync,
    // Status objects for loading/error state
    createStatus,
    updateStatus,
    deleteStatus,
  };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";

// TODO: migration - avatar upload needs Firebase Storage
async function updateProfilePic(id, file) {
  console.warn("Profile picture upload is currently disabled during migration.");
  return null;
}

async function updateTeacherById({ id, updates }) {
  const teacherRef = doc(db, "teacher_profile", String(id));
  await updateDoc(teacherRef, updates);
  const snapshot = await getDoc(teacherRef);
  return { id, ...snapshot.data() };
}

export default function useTeacherProfileMutations({
  createOptions,
  updateOptions,
  // deleteOptions,
} = {}) {
  const queryClient = useQueryClient();

  const uploadProfilePicStatus = useMutation({
    mutationFn: updateProfilePic,
    onSuccess: async (created, variables, context) => {
      // Update cache optimistically
      queryClient.setQueryData(queryKeys.teachers.profile, (prev) => {
        const list = Array.isArray(prev) ? prev : [];
        return [created, ...list];
      });
      // Revalidate to ensure consistency with server
      await queryClient.invalidateQueries({
        queryKey: queryKeys.teachers.profile,
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

  // const deleteStatus = useMutation({
  //    mutationFn: deleteTeacherById,
  //    onSuccess: async (result, variables, context) => {
  //       const deletedId = result?.id ?? variables;
  //       // Update cache optimistically
  //       queryClient.setQueryData(queryKeys.teachers.all, (prev) => {
  //          if (!Array.isArray(prev)) return prev;
  //          return prev.filter((t) => t?.id !== deletedId);
  //       });
  //       // Revalidate
  //       await queryClient.invalidateQueries({ queryKey: queryKeys.teachers.all });
  //       if (deleteOptions?.onSuccess) {
  //          deleteOptions.onSuccess(result, variables, context);
  //       }
  //    },
  //    onError: (err, variables, context) => {
  //       if (deleteOptions?.onError) {
  //          deleteOptions.onError(err, variables, context);
  //       }
  //    },
  //    ...deleteOptions,
  // });

  return {
    uploadProfilePic: uploadProfilePicStatus.mutate,
    uploadProfilePicAsync: uploadProfilePicStatus.mutateAsync,
    updateTeacher: updateStatus.mutate,
    updateTeacherAsync: updateStatus.mutateAsync,
    // deleteTeacher: deleteStatus.mutate,
    // deleteTeacherAsync: deleteStatus.mutateAsync,
    uploadProfilePicStatus,
    updateStatus,
    // deleteStatus,
  };
}

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, addDoc, updateDoc, deleteDoc, getDocs, query, where, writeBatch, doc } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";

/**
 * Insert a teacher-subject link.
 * @param {{ teacher: string, subject: string }} payload
 */
async function insertTeacherSubject(payload) {
  const docRef = await addDoc(collection(db, "teacher_subjects"), payload);
  return { id: docRef.id, ...payload };
}

/**
 * Update a teacher subject by id.
 * @param {{ id: string|number, updates: Object }} params
 * @returns {Promise<Object>} Updated teacher row.
 */
async function updateTeacherSubjectById({ teacher, subject }) {
  // Logic from original code: update 'subject' for all docs where 'teacher' == teacher.
  // This seems odd (updating all subjects for a teacher to one subject?), but replicating.
  const q = query(collection(db, "teacher_subjects"), where("teacher", "==", teacher));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
      throw new Error("No teacher subject found to update");
  }

  const batch = writeBatch(db);
  snapshot.forEach((doc) => {
      batch.update(doc.ref, { subject });
  });
  await batch.commit();

  return { teacher, subject };
}

/**
 * Delete a teacher-subject link by teacher & subject.
 * @param {{ teacher: string, subject: string }}
 */
async function deleteTeacherSubject({ teacher, subject }) {
  const q = query(
      collection(db, "teacher_subjects"), 
      where("teacher", "==", teacher),
      where("subject", "==", subject)
  );
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.forEach((doc) => {
      batch.delete(doc.ref);
  });
  await batch.commit();

  return { teacher, subject };
}

/**
 * Bulk replace subjects for a teacher (delete all old links, insert new).
 * @param {{ teacher: string, subject: string[] }}
 */
async function bulkReplaceTeacherSubjects({ teacher, subject }) {
  // 1. Delete all existing for teacher
  const q = query(collection(db, "teacher_subjects"), where("teacher", "==", teacher));
  const snapshot = await getDocs(q);
  
  const batch = writeBatch(db);
  snapshot.forEach((doc) => {
      batch.delete(doc.ref);
  });
  
  // 2. Insert new ones
  if (subject && subject.length > 0) {
      subject.forEach((s) => {
          const newRef = doc(collection(db, "teacher_subjects"));
          batch.set(newRef, { teacher, subject: s });
      });
  }
  
  await batch.commit();
  return subject.map(s => ({ teacher, subject: s }));
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

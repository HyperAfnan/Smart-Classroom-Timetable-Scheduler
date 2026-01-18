import { useQuery } from "@tanstack/react-query";
import { db } from "@/config/firebase";
import { collection, getDocs, query, where, limit } from "firebase/firestore";
import { queryKeys } from "@/shared/queryKeys";
import {
  EMPTY_TEACHERSPROFILE,
  EMPTY_TEACHERSSUBJECT,
} from "@/features/teacher-role/settings/constants";

async function fetchTeacherProfile(email) {
  const q = query(
      collection(db, "teacher_profile"),
      where("email", "==", email),
      limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

async function fetchTeacherSubjects(name) {
  // teacher_subjects has 'teacher' field which is the name?
  const q = query(
      collection(db, "teacher_subjects"),
      where("teacher", "==", name),
      limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const doc = snapshot.docs[0];
  return { id: doc.id, ...doc.data() };
}

export default function useTeacherProfile(options = {}) {
  const {
    email,
    name,
    teachersProfileQueryOptions = {},
    teachersSubjectsQueryOptions = {},
  } = options;

  const teachersProfileQuery = useQuery({
    queryKey: queryKeys.teachers.profile(email),
    queryFn: () => fetchTeacherProfile(email),
    staleTime: 60_000,
    enabled: !!email,
    ...teachersProfileQueryOptions,
  });

  const teachersSubjectsQuery = useQuery({
    queryKey: queryKeys.teacherSubjects.byTeacher(name),
    queryFn: () => fetchTeacherSubjects(name),
    staleTime: 10 * 60_000,
    enabled: !!name,
    ...teachersSubjectsQueryOptions,
  });

  const isLoading = Boolean(
    teachersProfileQuery.isLoading || teachersSubjectsQuery.isLoading,
  );
  const isError = Boolean(
    teachersSubjectsQuery.isError || teachersProfileQuery.isError,
  );
  const error =
    teachersSubjectsQuery.error ?? teachersProfileQuery.error ?? null;

  const refetch = async () => {
    const [tpRes, tsRes] = await Promise.all([
      teachersProfileQuery.refetch(),
      teachersSubjectsQuery.refetch(),
    ]);
    return {
      teachersSubjects: tsRes.data ?? [],
      teachersProfile: tpRes.data ?? [],
    };
  };

  return {
    teachersSubjects: teachersSubjectsQuery.data ?? EMPTY_TEACHERSSUBJECT,
    teachersProfile: teachersProfileQuery.data ?? EMPTY_TEACHERSPROFILE,
    isLoading,
    isError,
    error,
    refetch,
    teachersSubjectsQuery,
    teachersProfileQuery,
  };
}

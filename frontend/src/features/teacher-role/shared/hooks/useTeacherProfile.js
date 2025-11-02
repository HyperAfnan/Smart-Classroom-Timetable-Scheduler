import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/config/supabase";
import { queryKeys } from "@/shared/queryKeys";
import {
  EMPTY_TEACHERSPROFILE,
  EMPTY_TEACHERSSUBJECT,
} from "@/features/teacher-role/settings/constants";

async function fetchTeacherProfile(email) {
  const { data, error } = await supabase
    .from("teacher_profile")
    .select("*")
    .eq("email", email)
    .single();
  if (error) {
    throw new Error(error.message || "Failed to fetch teacher profile");
  }
  return data ?? [];
}

async function fetchTeacherSubjects(name) {
  const { data, error } = await supabase
    .from("teacher_subjects")
    .select("*")
    .eq("teacher", name)
    .single();
  if (error) {
    throw new Error(error.message || "Failed to fetch teacher subjects");
  }
  return data ?? [];
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

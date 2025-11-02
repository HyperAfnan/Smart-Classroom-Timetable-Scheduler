import { useMemo } from "react";

export default function useFilteredTeachers(
  teachers,
  searchTerm,
  filterSubject,
) {
  return useMemo(() => {
    return teachers?.filter((t) => {
      const matchesSearch = t.name
        ?.toLowerCase()
        ?.includes(searchTerm?.toLowerCase());
      const matchesSubject = !filterSubject || t?.subject === filterSubject;
      return matchesSearch && matchesSubject;
    });
  }, [teachers, searchTerm, filterSubject]);
}

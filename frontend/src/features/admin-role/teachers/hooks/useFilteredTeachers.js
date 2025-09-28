import { useMemo } from "react";

export default function useFilteredTeachers(teachers, searchTerm, filterDept) {
  return useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch = t.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDept = !filterDept || t.department === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [teachers, searchTerm, filterDept]);
}

import React, { useState, useMemo } from "react";
import useSubjects from "./hooks/useSubjects";
import SubjectFilters from "./components/SubjectsFilters";
import SubjectsTable from "./components/SubjectsTable";

export default function Subjects() {
  const { subjects, departments } = useSubjects();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const matchesSearch =
        s.subjectName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subjectCode?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDept =
        !selectedDepartment || s.departmentId === selectedDepartment;
      return matchesSearch && matchesDept;
    });
  }, [subjects, searchTerm, selectedDepartment]);
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Subjects Management
            </h1>
            <p className="text-muted-foreground">
              Manage course subjects and curriculum
            </p>
          </div>
        </div>

        <SubjectFilters
          departments={departments}
          searchTerm={searchTerm}
          selectedDepartment={selectedDepartment}
          onSearchChange={setSearchTerm}
          onDepartmentChange={(dept) =>
            setSelectedDepartment(dept === "all" ? null : dept)
          }
        />

        <SubjectsTable subjects={filteredSubjects} />
      </div>
    </div>
  );
}

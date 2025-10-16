import React, { useState } from "react";
import Filters from "./components/teacherFilter.jsx";
import useTeacherMutations from "./hooks/useTeacherMutations";
import TeachersTable from "./components/teacherTable";
import useTeachers from "./hooks/useTeachers";
import useTeacherNotifications from "./hooks/useTeacherNotifications";
import useFilteredTeachers from "./hooks/useFilteredTeachers";
import useTeacherSubjects from "./hooks/useTeacherSubjects.js";

export default function Teachers() {
  const { teachers } = useTeachers();
  const { teacherSubjects } = useTeacherSubjects();
  const allTeachersWithSubjects = teachers.map((teacher) => {
    const subject = teacherSubjects.find((sub) => sub.teacher === teacher.name);
    return { ...teacher, subject: subject ? subject.subject : "Unknown" };
  });
  const { createStatus, updateStatus, deleteStatus } = useTeacherMutations();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSubject, setFilterSubject] = useState(null);

  useTeacherNotifications({ createStatus, updateStatus, deleteStatus });
  const filteredTeachers = useFilteredTeachers(
    allTeachersWithSubjects,
    searchTerm,
    filterSubject,
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Teachers Management
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage faculty members and their details
            </p>
          </div>
        </div>

        <Filters
          onSearchChange={setSearchTerm}
          onSubjectChange={setFilterSubject}
        />

        <TeachersTable filteredTeacher={filteredTeachers} />
      </div>
    </div>
  );
}

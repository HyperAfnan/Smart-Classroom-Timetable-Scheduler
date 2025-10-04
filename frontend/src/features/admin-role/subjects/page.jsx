import React, { useState, useMemo } from "react";
import useSubjects from "./hooks/useSubjects";
import SubjectFilters from "./components/SubjectsFilters";
import SubjectsTable from "./components/SubjectsTable";

export default function Subjects() {
   const { subjects, departments, } = useSubjects();
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedDepartment, setSelectedDepartment] = useState(null);

   const filteredSubjects = useMemo(() => {
      return subjects.filter((s) => {
         const matchesSearch =
            s.subject_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            s.subject_code.toLowerCase().includes(searchTerm.toLowerCase());
         const matchesDept =
            !selectedDepartment || s.department === selectedDepartment;
         return matchesSearch && matchesDept;
      });
   }, [subjects, searchTerm, selectedDepartment]);
   return (
      <div className="p-6 space-y-6">
         <div className="flex justify-between items-center">
            <div>
               <h1 className="text-3xl font-bold">Subjects Management</h1>
               <p className="text-slate-600">
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

         <SubjectsTable
            subjects={filteredSubjects}
         />
      </div>
   );
}

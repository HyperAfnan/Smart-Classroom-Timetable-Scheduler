import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import useClasses from "./hooks/useClasses";
import ClassFilters from "./components/ClassesFilter";
import InlineClassesTable from "./components/InlineClassesTable";
import { departments } from "./constants";

export default function Classes() {
  const { classes, isLoading } = useClasses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");

  // Filter classes. Note: students_count was renamed to students across the codebase.
  // For backward compatibility we still look at a legacy students_count field if present.
  const filteredClasses = classes.filter((c) => {
    const name = (c.class_name || c.name || "").toLowerCase();
    const studentsValue = c.students ?? c.students_count; // legacy fallback
    const searchLower = searchTerm.toLowerCase();

    // Allow searching by class name OR (numeric) students value
    const matchesSearch =
      name.includes(searchLower) ||
      (!!searchLower &&
        !isNaN(Number(searchLower)) &&
        studentsValue != null &&
        studentsValue.toString() === searchLower);

    const matchesDepartment =
      selectedDepartment === "all" || c.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Classes Management</h1>
        <p className="text-slate-600">Manage student classes and sections</p>
      </div>

      <ClassFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        departments={departments}
      />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Classes ({filteredClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <InlineClassesTable
            classes={filteredClasses}
            loading={isLoading}
            departments={departments}
          />
        </CardContent>
      </Card>
    </div>
  );
}

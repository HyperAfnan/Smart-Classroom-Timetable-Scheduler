import { useState } from "react";
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
    const name = (c.className || c.name || "").toLowerCase();
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">
            Classes Management
          </h1>
          <p className="text-muted-foreground">
            Manage student classes and sections
          </p>
        </div>

        <ClassFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          selectedDepartment={selectedDepartment}
          setSelectedDepartment={setSelectedDepartment}
          departments={departments}
        />

        <Card className="bg-card text-card-foreground border border-border shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-foreground">
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
    </div>
  );
}

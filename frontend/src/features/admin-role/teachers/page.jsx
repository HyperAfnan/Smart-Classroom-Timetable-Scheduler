import React, { useState, useMemo } from "react";
import Filters from "./components/teacherFilter.jsx";
import useTeacherMutations from "./hooks/useTeacherMutations";
import TeacherFormDialog from "./components/teacherFormDialog";
import TeachersTable from "./components/teacherTable";
import useTeachers from "./hooks/useTeachers";
import { toast } from "react-toastify";
import { DEFAULT_TEACHER } from "./constants";

export default function Teachers() {
  const { teachers, departments, isLoading } = useTeachers();
  const { createTeacherAsync, updateTeacherAsync } = useTeacherMutations();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState(DEFAULT_TEACHER);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDept, setFilterDept] = useState(null);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((t) => {
      const matchesSearch = t.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesDept = !filterDept || t.department === filterDept;
      return matchesSearch && matchesDept;
    });
  }, [teachers, searchTerm, filterDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTeacher) {
        await updateTeacherAsync({ id: editingTeacher.id, updates: formData });
        toast.success("Teacher updated successfully!");
      } else {
        await createTeacherAsync(formData);
        toast.success("Teacher created successfully!");
      }
      resetForm();
    } catch (err) {
      console.error(err);
      toast.error("Failed to save teacher. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData(DEFAULT_TEACHER);
    setEditingTeacher(null);
  };

  const handleEdit = (teacher) => {
    setFormData({
      ...DEFAULT_TEACHER,
      ...teacher,
      subjects: teacher.subjects || [],
      max_hours: teacher.max_hours ?? DEFAULT_TEACHER.max_hours,
    });
    setEditingTeacher(teacher);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Teachers Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage faculty members and their details
          </p>
        </div>

        <div className="flex gap-2">
          <TeacherFormDialog
            isOpen={isDialogOpen}
            onOpenChange={(open) => {
              if (!open) resetForm();
              setIsDialogOpen(open);
            }}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            resetForm={resetForm}
            editingTeacher={editingTeacher}
            departments={departments}
          />
        </div>
      </div>

      <Filters
        departments={departments}
        onSearchChange={setSearchTerm}
        onDepartmentChange={setFilterDept}
      />

      <TeachersTable
        teachers={filteredTeachers}
        loading={isLoading}
        onEdit={handleEdit}
      />
    </div>
  );
}

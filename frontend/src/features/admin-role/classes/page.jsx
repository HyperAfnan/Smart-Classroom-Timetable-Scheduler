import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GraduationCap } from "lucide-react";
import useClasses from "./hooks/useClasses";
import { toast } from "react-toastify";
import ClassFormDialog from "./components/ClassFormDialog";
import ClassFilters from "./components/ClassesFilter";
import ClassesTable from "./components/ClassesTable";
import { departments, ROOM_DEFAULT } from "./constants";

export default function Classes() {
  const {
    classes,
    isLoading,
    createClassAsync,
    updateClassAsync,
    deleteClassAsync,
    isSubmitting,
    isDeleting,
  } = useClasses();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState(ROOM_DEFAULT);

  const handleSave = async (classData) => {
    if (isSubmitting) return;
    try {
      if (editingClass) {
        await updateClassAsync({ id: editingClass.id, updates: classData });
        toast.success("Class updated successfully!");
      } else {
        await createClassAsync(classData);
        toast.success("Class created successfully!");
      }
      resetForm();
    } catch (err) {
      console.error("Error saving class:", err?.message || err);
      toast.error("Failed to save class. Please try again.");
    }
  };

  const handleEdit = (classItem) => {
    setFormData(classItem);
    setEditingClass(classItem);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this class?")) return;
    try {
      await deleteClassAsync(id);
      toast.success("Class deleted successfully!");
    } catch (err) {
      console.error("Error deleting class:", err?.message || err);
      toast.error("Failed to delete class. Please try again.");
    }
  };

  const resetForm = () => {
    setFormData(ROOM_DEFAULT);
    setEditingClass(null);
    setIsDialogOpen(false);
  };

  const filteredClasses = classes.filter((c) => {
    const matchesSearch =
      c.class_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || c.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Classes Management</h1>
          <p className="text-slate-600">Manage student classes and sections</p>
        </div>
        <Button onClick={() => setIsDialogOpen(true)} disabled={isSubmitting}>
          <Plus className="w-4 h-4 mr-2" /> Add Class
        </Button>
      </div>

      {/* Filters */}
      <ClassFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        departments={departments}
      />

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5" />
            Classes ({filteredClasses.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ClassesTable
            classes={filteredClasses}
            loading={isLoading}
            onEdit={handleEdit}
            onDelete={(id) => (!isDeleting ? handleDelete(id) : undefined)}
          />
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <ClassFormDialog
        isOpen={isDialogOpen}
        onClose={resetForm}
        formData={formData}
        setFormData={setFormData}
        onSave={handleSave}
        editingClass={editingClass}
        departments={departments}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

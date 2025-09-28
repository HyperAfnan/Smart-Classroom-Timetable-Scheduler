import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, BookOpen } from "lucide-react";
import useSubjects from "./hooks/useSubjects";
import useSubjectMutations from "./hooks/useSubjectMutations";
import SubjectFormDialog from "./components/SubjectFormDialog";
import SubjectFilters from "./components/SubjectsFilters";
import SubjectsTable from "./components/SubjectsTable";
import { DEFAULT_SUBJECT } from "./constants";
import { toast } from "react-toastify";

export default function Subjects() {
   const { subjects, departments, isLoading } = useSubjects();
   const {
      createSubjectAsync,
      updateSubjectAsync,
      deleteSubjectAsync,
      createStatus,
      updateStatus,
      deleteStatus,
   } = useSubjectMutations();
   const isSubmitting = createStatus.isPending || updateStatus.isPending;
   const isDeleting = deleteStatus.isPending;
   const [searchTerm, setSearchTerm] = useState("");
   const [selectedDepartment, setSelectedDepartment] = useState(null);
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [editingSubject, setEditingSubject] = useState(null);
   const [formData, setFormData] = useState(DEFAULT_SUBJECT);

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

   const handleSave = async (subject) => {
      if (isSubmitting) return;
      try {
         if (editingSubject) {
            await updateSubjectAsync({ id: editingSubject.id, updates: subject });
         } else {
            await createSubjectAsync(subject);
         }
         resetForm();
      } catch (err) {
         console.error("Error saving subject:", err.message);
      }
   };

   const handleEdit = (subject) => {
      setFormData({
         ...DEFAULT_SUBJECT,
         ...subject,
         credits: subject.credits ?? 3,
         semester: subject.semester ?? 1,
         hours_per_week: subject.hours_per_week ?? 3,
      });
      setEditingSubject(subject);
      setIsDialogOpen(true);
   };

   const handleDelete = async (id) => {
      if (confirm("Are you sure you want to delete this subject?")) {
         try {
            await deleteSubjectAsync(id);
            toast.success("Subject deleted successfully!");
         } catch (err) {
            console.error("Error deleting subject:", err.message);
            toast.error("Failed to delete subject. Please try again.");
         }
      }
   };

   const resetForm = () => {
      setFormData(DEFAULT_SUBJECT);
      setEditingSubject(null);
      setIsDialogOpen(false);
   };

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

         <Card>
            <CardHeader>
               <CardTitle className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                     <BookOpen className="w-5 h-5" />
                     Subjects ({filteredSubjects.length})
                  </div>
                  <div className="ml-auto">
                     <Button
                        onClick={() => setIsDialogOpen(true)}
                        disabled={isSubmitting}
                     >
                        <Plus className="w-4 h-4 mr-2" /> Add Subject
                     </Button>
                  </div>
               </CardTitle>
            </CardHeader>
            <CardContent>
               <SubjectsTable
                  subjects={filteredSubjects}
                  loading={isLoading}
                  onEdit={handleEdit}
                  onDelete={(id) => (!isDeleting ? handleDelete(id) : undefined)}
               />
            </CardContent>
         </Card>

         {/* Form Dialog */}
         <SubjectFormDialog
            isOpen={isDialogOpen}
            onClose={resetForm}
            formData={formData}
            setFormData={setFormData}
            onSave={handleSave}
            editingSubject={editingSubject}
            departments={departments}
            isSubmitting={isSubmitting}
         />
      </div>
   );
}

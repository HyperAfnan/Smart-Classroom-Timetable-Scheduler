import React from "react";
import {
   Table,
   TableHeader,
   TableHead,
   TableRow,
   TableBody,
   TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
   Edit,
   Trash2,
   Clock,
   Plus,
   BookOpen,
   X,
   Check,
   Mail,
} from "lucide-react";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { colors, columns, subjectTypes } from "../constants";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm, Controller } from "react-hook-form";
import useTeachers from "../../teachers/hooks/useTeachers.js";
import useSubjects from "../hooks/useSubjects.js";
import { useState } from "react";
import useSubjectMutations from "../hooks/useSubjectMutations.js";
import { toast } from "react-toastify";
import ExcelUploader from "./SubjectsExcelUploader.jsx";
import Loader from "@/shared/components/Loader.jsx";

const getTypeColor = (type) => {
   return colors[type] || "bg-muted text-muted-foreground border-border";
};

export default function SubjectsTable({ subjects }) {
   const {
      register,
      handleSubmit,
      reset,
      control,
      formState: { errors },
   } = useForm();
   const {
      register: editRegister,
      handleSubmit: handleEditSubmit,
      reset: resetEditForm,
      control: editControl,
      setValue,
      formState: { errors: editErrors },
   } = useForm();
   const { departments } = useTeachers();
   const { isLoading: loading } = useSubjects();
   const [hoveredRowId, setHoveredRowId] = useState(null);
   const [renderNewRow, setRenderNewRow] = useState(false);
   const [editingSubject, setEditingSubjectId] = useState(null);
   const { createSubjectAsync, updateSubjectAsync, deleteSubjectAsync } =
      useSubjectMutations();

   const EditButton = ({ subject }) => (
      <Button
         size="sm"
         variant="outline"
         onClick={() => {
            setEditingSubjectId(subject.id);
            setValue("subjectName", subject.subjectName);
            setValue("subjectCode", subject.subjectCode);
            setValue("department", subject.department);
            setValue("semester", subject.semester);
            setValue("type", subject.type);
            setValue("credits", subject.credits);
            setValue("hoursPerWeek", subject.hoursPerWeek);
         }}
      >
         <Edit className="w-3 h-3" />
      </Button>
   );
   const DeleteButton = ({ subjectId }) => (
      <Button
         size="sm"
         variant="outline"
         onClick={async () => {
             if(confirm("Are you sure you want to delete this subject?")) {
                 try {
                    await deleteSubjectAsync(subjectId);
                    toast.success("Subject deleted successfully");
                 } catch (err) {
                    toast.error("Failed to delete subject");
                 }
             }
         }}
         className="text-red-600 hover:text-red-700"
      >
         {" "}
         <Trash2 className="w-3 h-3" />{" "}
      </Button>
   );

   const onEditSubmit = async (data) => {
      try {
        await updateSubjectAsync({ id: editingSubject, updates: data });
        toast.success("Subject updated successfully");
        setEditingSubjectId(null);
        resetEditForm();
      } catch (err) {
        toast.error(`Failed to update subject: ${err.message}`);
      }
   };
   const onSubmit = async (data) => {
      try {
        await createSubjectAsync(data);
        toast.success("Subject created successfully");
        reset();
        setRenderNewRow(false);
      } catch (err) {
        toast.error(`Failed to create subject: ${err.message}`);
      }
   };

   return (
      <Card className="bg-card text-card-foreground border border-border shadow-sm">
         {loading ? (
            <Loader />
         ) : (
            <>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                     <div className="flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        Subjects ({subjects.length})
                     </div>
                     <div className="ml-auto flex items-center gap-2">
                        <Button
                           className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white dark:from-indigo-600 dark:to-indigo-700 dark:hover:from-indigo-500 dark:hover:to-indigo-600"
                           onClick={() => setRenderNewRow(true)}
                           disabled={false}
                        >
                           <Plus className="w-4 h-4 mr-2" /> Add Subject
                        </Button>
                        <ExcelUploader />
                     </div>
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <Table>
                        <TableHeader>
                           <TableRow>
                              {columns.map((col) => (
                                 <TableHead key={col.key} className={col.width}>
                                    {col.label}
                                 </TableHead>
                              ))}
                           </TableRow>
                        </TableHeader>
                        <TableBody>
                           <AnimatePresence>
                              {subjects.length === 0 ? (
                                 <TableRow>
                                    <TableCell
                                       colSpan={8}
                                       className="text-center py-8 text-muted-foreground"
                                    >
                                       No subjects found
                                    </TableCell>
                                 </TableRow>
                              ) : (
                                 subjects.map((subject, index) => (
                                    <motion.tr
                                       key={subject.id}
                                       initial={{ opacity: 0, y: 20 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, y: -20 }}
                                       transition={{ delay: index * 0.05 }}
                                       className="hover:bg-accent hover:text-accent-foreground transition-colors"
                                       onMouseEnter={() => setHoveredRowId(subject.id)}
                                       onMouseLeave={() => setHoveredRowId(null)}
                                    >
                                       {editingSubject === subject.id
                                          ? columns.map((col) => (
                                             <TableCell key={col.key}>
                                                {col.key === "subjectName" && (
                                                   <input
                                                      type="text"
                                                      placeholder="Subject Name"
                                                      className="w-full border px-2 py-1 rounded"
                                                      {...editRegister("subjectName", {
                                                         required: true,
                                                      })}
                                                   />
                                                )}
                                                {col.key === "subjectCode" && (
                                                   <input
                                                      type="text"
                                                      placeholder="Subject Code"
                                                      className="w-full border px-2 py-1 rounded"
                                                      {...editRegister("subjectCode", {
                                                         required: true,
                                                      })}
                                                   />
                                                )}
                                                {col.key === "department" && (
                                                   <Controller
                                                      name="department"
                                                      control={editControl}
                                                      rules={{ required: true }}
                                                      render={({ field }) => (
                                                         <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                         >
                                                            <SelectTrigger className="w-full">
                                                               <SelectValue placeholder="Department" />{" "}
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                               {departments.map((dept) => (
                                                                  <SelectItem
                                                                     key={dept}
                                                                     value={dept}
                                                                  >
                                                                     <Badge
                                                                        variant="outline"
                                                                        className="bg-muted text-muted-foreground border-border"
                                                                     >
                                                                        {dept}
                                                                     </Badge>
                                                                  </SelectItem>
                                                               ))}
                                                            </SelectContent>
                                                         </Select>
                                                      )}
                                                   />
                                                )}
                                                {col.key === "semester" && (
                                                   <input
                                                      type="text"
                                                      placeholder="Semester"
                                                      className="w-full border px-2 py-1 rounded"
                                                      {...editRegister("semester", {
                                                         required: true,
                                                      })}
                                                   />
                                                )}
                                                {col.key === "type" && (
                                                   <Controller
                                                      name="type"
                                                      control={editControl}
                                                      rules={{ required: true }}
                                                      render={({ field }) => (
                                                         <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                         >
                                                            <SelectTrigger className="w-full">
                                                               <SelectValue placeholder="Subject Type" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                               {subjectTypes.map((type) => (
                                                                  <SelectItem
                                                                     key={type}
                                                                     value={type}
                                                                  >
                                                                     <Badge
                                                                        variant="outline"
                                                                        className="bg-muted text-muted-foreground border-border"
                                                                     >
                                                                        {type}
                                                                     </Badge>
                                                                  </SelectItem>
                                                               ))}
                                                            </SelectContent>
                                                         </Select>
                                                      )}
                                                   />
                                                )}
                                                {col.key === "credits" && (
                                                   <input
                                                      placeholder="Credits"
                                                      className="w-full border px-2 py-1 rounded"
                                                      {...editRegister("credits", {
                                                         required: true,
                                                      })}
                                                   />
                                                )}
                                                {col.key === "hoursPerWeek" && (
                                                   <input
                                                      placeholder="Hr/week"
                                                      className="w-full border px-2 py-1 rounded"
                                                      {...editRegister("hoursPerWeek", {
                                                         required: true,
                                                      })}
                                                   />
                                                )}
                                                 {col.key === "actions" && (
                                                    <div className="flex gap-2">
                                                       <Button
                                                          size="sm"
                                                          variant="outline"
                                                          onClick={() => {
                                                             setEditingSubjectId(null);
                                                             resetEditForm();
                                                          }}
                                                       >
                                                          <X className="w-3 h-3" />
                                                       </Button>
                                                       <Button
                                                          size="sm"
                                                          className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                                          onClick={handleEditSubmit(onEditSubmit, (err) => {
                                                              console.error("Edit validation failed", err);
                                                              toast.error("Please fill all required fields");
                                                          })}
                                                       >
                                                          <Check className="w-3 h-3" />
                                                       </Button>
                                                    </div>
                                                 )}
                                              </TableCell>
                                           ))
                                           : columns.map((col) => (
                                              <TableCell key={col.key}>
                                                 {col.key === "subjectName" && (
                                                    <div className="font-medium">
                                                       {subject.subjectName}
                                                    </div>
                                                 )}
                                                 {col.key === "subjectCode" &&
                                                    subject.subjectCode}
                                                 {col.key === "department" && (
                                                    <Badge
                                                       variant="outline"
                                                       className="bg-muted text-muted-foreground border-border"
                                                    >
                                                       {subject.department}
                                                    </Badge>
                                                 )}
                                                 {col.key === "semester" && (
                                                    <div className="flex items-center gap-1">
                                                       <Mail className="w-3 h-3 text-muted-foreground" />
                                                       {subject.semester}
                                                    </div>
                                                 )}
                                                 {col.key === "type" && (
                                                    <Badge
                                                       variant="outline"
                                                       className={getTypeColor(subject.type)}
                                                    >
                                                       {" "}
                                                       {subject.type}{" "}
                                                    </Badge>
                                                 )}
                                                 {col.key === "credits" && subject.credits}
                                                 {col.key === "hoursPerWeek" && (
                                                    <div className="flex items-center gap-1">
                                                       <Clock className="w-3 h-3 text-muted-foreground" />
                                                       {subject.hoursPerWeek}h
                                                    </div>
                                                 )}
                                                 {col.key === "actions" && (
                                                    <div className="flex gap-2">
                                                       {hoveredRowId === subject.id ? (
                                                          <>
                                                             <EditButton subject={subject} />
                                                             <DeleteButton
                                                                subjectId={subject.id}
                                                             />
                                                          </>
                                                       ) : (
                                                          <>
                                                             <span
                                                                style={{ visibility: "hidden" }}
                                                             >
                                                                <Button size="sm" variant="outline">
                                                                   <Edit className="w-3 h-3" />
                                                                </Button>
                                                             </span>
                                                             <span
                                                                style={{ visibility: "hidden" }}
                                                             >
                                                                <Button size="sm" variant="outline">
                                                                   <Trash2 className="w-3 h-3" />
                                                                </Button>
                                                             </span>
                                                          </>
                                                       )}
                                                    </div>
                                                 )}
                                              </TableCell>
                                           ))}
                                     </motion.tr>
                                  ))
                               )}
                            </AnimatePresence>
                            {renderNewRow && (
                               <motion.tr
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -20 }}
                                  transition={{ duration: 0.3 }}
                               >
                                  {columns.map((col) => (
                                     <TableCell key={col.key}>
                                        {col.key === "subjectName" && (
                                           <input
                                              type="text"
                                              placeholder="Subject Name"
                                              className="w-full border px-2 py-1 rounded"
                                              {...register("subjectName", { required: true })}
                                           />
                                        )}
                                        {col.key === "subjectCode" && (
                                           <input
                                              type="text"
                                              placeholder="Subject Code"
                                              className="w-full border px-2 py-1 rounded"
                                              {...register("subjectCode", { required: true })}
                                           />
                                        )}
                                        {col.key === "department" && (
                                          <Controller
                                             name="department"
                                             control={control}
                                             rules={{ required: true }}
                                             render={({ field }) => (
                                                <Select
                                                   value={field.value}
                                                   onValueChange={field.onChange}
                                                >
                                                   <SelectTrigger className="w-full">
                                                      <SelectValue placeholder="Department" />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                      {departments.map((dept) => (
                                                         <SelectItem key={dept} value={dept}>
                                                            <Badge
                                                               variant="outline"
                                                               className="bg-muted text-muted-foreground border-border"
                                                            >
                                                               {dept}
                                                            </Badge>
                                                         </SelectItem>
                                                      ))}
                                                   </SelectContent>
                                                </Select>
                                             )}
                                          />
                                       )}
                                       {col.key === "semester" && (
                                          <input
                                             type="text"
                                             placeholder="Semester"
                                             className="w-full border px-2 py-1 rounded"
                                             {...register("semester", {
                                                required: true,
                                             })}
                                          />
                                       )}
                                       {col.key === "type" && (
                                          <Controller
                                             name="type"
                                             control={control}
                                             rules={{ required: true }}
                                             render={({ field }) => (
                                                <Select
                                                   value={field.value}
                                                   onValueChange={field.onChange}
                                                >
                                                   <SelectTrigger className="w-full">
                                                      <SelectValue placeholder="Subject Type" />
                                                   </SelectTrigger>
                                                   <SelectContent>
                                                      {subjectTypes.map((type) => (
                                                         <SelectItem key={type} value={type}>
                                                            <Badge
                                                               variant="outline"
                                                               className="bg-blue-50 text-blue-700 border-blue-200"
                                                            >
                                                               {type}
                                                            </Badge>
                                                         </SelectItem>
                                                      ))}
                                                   </SelectContent>
                                                </Select>
                                             )}
                                          />
                                       )}
                                       {col.key === "credits" && (
                                          <input
                                             placeholder="Credits"
                                             className="w-full border px-2 py-1 rounded"
                                             {...register("credits", { required: true })}
                                          />
                                       )}
                                       {col.key === "hoursPerWeek" && (
                                          <input
                                             placeholder="Hr/week"
                                             className="w-full border px-2 py-1 rounded"
                                             {...register("hoursPerWeek", {
                                                required: true,
                                             })}
                                          />
                                       )}
                                       {col.key === "actions" && (
                                          <div className="flex gap-2">
                                             <Button
                                                size="sm"
                                                variant="outline"
                                                onClick={() => {
                                                   reset();
                                                   setRenderNewRow(false);
                                                }}
                                             >
                                                <X className="w-3 h-3" />
                                             </Button>
                                             <Button
                                                size="sm"
                                                className="bg-indigo-600 hover:bg-indigo-700 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500"
                                                onClick={handleSubmit(onSubmit, (err) => {
                                                    console.error("Create validation failed", err);
                                                    toast.error("Please fill all required fields");
                                                })}
                                             >
                                                <Check className="w-3 h-3" />
                                             </Button>
                                          </div>
                                       )}
                                    </TableCell>
                                 ))}
                              </motion.tr>
                           )}
                        </TableBody>
                     </Table>
                  </div>
               </CardContent>
            </>
         )}
      </Card>
   );
}

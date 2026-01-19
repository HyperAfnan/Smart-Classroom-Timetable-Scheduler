import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Users, Mail, Edit, Trash2, Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useTeacherMutations from "../hooks/useTeacherMutations";
import { useState } from "react";
import {
   Select,
   SelectContent,
   SelectItem,
   SelectTrigger,
   SelectValue,
} from "@/components/ui/select";
import { DESIGNATIONS, columns } from "../constants";
import ExcelUploader from "./teacherExcelUploader.jsx";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import useTeacherSubjects from "../hooks/useTeacherSubjects";
import useTeacherSubjectMutations from "../hooks/useTeacherSubjectsMutations";
import useSubjects from "../../subjects/hooks/useSubjects.js";
import Loader from "@/shared/components/Loader.jsx";

function TeachersTable({ filteredTeacher }) {
   const { deleteTeacherAsync, createTeacherAsync, updateTeacherAsync } =
      useTeacherMutations();
   const [hoveredRowId, setHoveredRowId] = useState(null);
   const [renderNewRow, setRenderNewRow] = useState(false);
   const [editingTeacherId, setEditingTeacherId] = useState(null);
   const { teacherSubjects, isLoading } = useTeacherSubjects();
   const { subjects } = useSubjects();
   const {
      createTeacherSubjectAsync,
      deleteTeacherSubjectAsync,
      editTeacherSubjectAsync,
      // createStatus: linkCreateStatus,
      // deleteStatus: linkDeleteStatus,
      // editStatus: editStatus,
   } = useTeacherSubjectMutations();

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

   const handleDelete = async (teacher) => {
      if (!confirm(`Delete teacher "${teacher.name}"?`)) return;
      const link = teacherSubjects.find((ts) => ts.teacher === teacher.name);
      if (link)
         await deleteTeacherSubjectAsync({
            teacher: teacher.name,
            subject: link.subject,
         });
      await deleteTeacherAsync(teacher.id);
   };

   const handleEditClick = (teacher) => {
      setEditingTeacherId(teacher.id);
      setValue("name", teacher.name);
      setValue("empId", teacher.empId);
      
      // Fix: Try to find subject from teacherSubjects list if not on the teacher object
      const linkedSubject = teacherSubjects.find(ts => ts.teacher === teacher.name);
      setValue("subjects", teacher.subjects || linkedSubject?.subject || "");
      
      setValue("designation", teacher.designation);
      setValue("email", teacher.email);
      setValue("maxHours", teacher.maxHours);
   };

   const onSubmit = async (data) => {
      if (errors && Object.keys(errors).length > 0) {
         toast.error("Please fill all required fields correctly.");
         return;
      }
      try {
         const { subjects, ...teacherData } = data;
         const result = await createTeacherAsync(teacherData);
         await createTeacherSubjectAsync({ teacher: data.name, subject: subjects });
         
         // Display signup instructions
         toast.success(
            `Teacher profile created! Please ask ${data.name} to sign up at the registration page using email: ${data.email}`,
            {
               autoClose: 8000,
            }
         );
         
         reset();
         setRenderNewRow(false);
      } catch (error) {
         toast.error(`Failed to create teacher: ${error.message}`);
         console.error("Teacher creation error:", error);
      }
   };

   const onEditSubmit = async (data) => {
      // NOTE: editErrors check here is not reliable as handleSubmit prevents this function from running if there are errors.
      // We rely on the second argument of handleSubmit (onInvalid) for error handling.
      try {
         const { subjects: subject, ...teacherData } = data;
         await updateTeacherAsync({ id: editingTeacherId, updates: teacherData });
         // Update the subject link if changed
         // Note: proper implementation would check if subject changed, delete old, create new etc.
         // For now assuming simplified update behavior
         await editTeacherSubjectAsync({ teacher: data.name, subject: subject });
         
         toast.success("Teacher updated successfully");
         setEditingTeacherId(null);
         resetEditForm();
      } catch (error) {
         toast.error(`Failed to update teacher: ${error.message}`);
         console.error("Teacher update error:", error);
      }
   };

   const EditButton = ({ onClick }) => (
      <Button size="sm" variant="outline" onClick={onClick}>
         <Edit className="w-3 h-3" />
      </Button>
   );

   const DeleteButton = ({ onClick }) => (
      <Button
         size="sm"
         variant="outline"
         onClick={onClick}
         className="text-red-600 hover:text-red-700"
      >
         <Trash2 className="w-3 h-3" />
      </Button>
   );

   return (
      <Card className="bg-card text-card-foreground border border-border shadow-sm">
         {isLoading ? (
            <Loader />
         ) : (
            <>
               <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                     <Users className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                     Teachers ({filteredTeacher.length})
                     <div className="flex gap-2 ml-auto">
                        <Button
                           className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white dark:from-blue-600 dark:to-blue-700 dark:hover:from-blue-500 dark:hover:to-blue-600"
                           onClick={() => setRenderNewRow(true)}
                        >
                           <Plus className="w-4 h-4 mr-2" />
                           Add Teacher
                        </Button>
                        <ExcelUploader teachers={filteredTeacher} />
                     </div>
                  </CardTitle>
               </CardHeader>
               <CardContent>
                  <div className="overflow-x-auto">
                     <Table className="table-fixed w-full">
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
                              {filteredTeacher.length === 0 ? (
                                 <TableRow>
                                    <TableCell
                                       colSpan={columns.length}
                                       className="text-center py-8 text-muted-foreground"
                                    >
                                       No teachers found
                                    </TableCell>
                                 </TableRow>
                              ) : (
                                 filteredTeacher.map((teacher, index) => (
                                    <motion.tr
                                       key={teacher.id}
                                       initial={{ opacity: 0, y: 20 }}
                                       animate={{ opacity: 1, y: 0 }}
                                       exit={{ opacity: 0, y: -20 }}
                                       transition={{ delay: index * 0.05 }}
                                       className="hover:bg-accent hover:text-accent-foreground transition-colors"
                                       onMouseEnter={() => setHoveredRowId(teacher.id)}
                                       onMouseLeave={() => setHoveredRowId(null)}
                                    >
                                       {editingTeacherId === teacher.id
                                          ? columns.map((col) => (
                                             <TableCell key={col.key}>
                                                {col.key === "name" && (
                                                   <input
                                                      {...editRegister("name", {
                                                         required: true,
                                                      })}
                                                      className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                   />
                                                )}
                                                {col.key === "empId" && (
                                                   <input
                                                      {...editRegister("empId", {
                                                         required: true,
                                                      })}
                                                      className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                   />
                                                )}
                                                {col.key === "subjects" && (
                                                   <Controller
                                                      name="subjects"
                                                      control={editControl}
                                                      rules={{ required: true }}
                                                      render={({ field }) => (
                                                         <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                         >
                                                            <SelectTrigger className="w-full bg-background text-foreground border-border">
                                                               <SelectValue
                                                                  placeholder={
                                                                     <Badge
                                                                        variant="outline"
                                                                        className="bg-muted text-muted-foreground border-border"
                                                                     >
                                                                        {teacher.subject}
                                                                     </Badge>
                                                                  }
                                                               />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                               {subjects.map((subject) => (
                                                                  <SelectItem
                                                                     key={subject.subjectName}
                                                                     value={subject.subjectName}
                                                                  >
                                                                     <Badge
                                                                        key={subject.subjectName}
                                                                        variant="outline"
                                                                        className="bg-muted text-muted-foreground border-border"
                                                                     >
                                                                        {subject.subjectName}
                                                                     </Badge>
                                                                  </SelectItem>
                                                               ))}
                                                            </SelectContent>
                                                         </Select>
                                                      )}
                                                   />
                                                )}
                                                {col.key === "designation" && (
                                                   <Controller
                                                      name="designation"
                                                      control={editControl}
                                                      rules={{ required: true }}
                                                      render={({ field }) => (
                                                         <Select
                                                            value={field.value}
                                                            onValueChange={field.onChange}
                                                         >
                                                            <SelectTrigger className="w-full bg-background text-foreground border-border">
                                                               <SelectValue placeholder="Designation" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                               {DESIGNATIONS.map((d) => (
                                                                  <SelectItem key={d} value={d}>
                                                                     {d}
                                                                  </SelectItem>
                                                               ))}
                                                            </SelectContent>
                                                         </Select>
                                                      )}
                                                   />
                                                )}
                                                {col.key === "email" && (
                                                   <input
                                                      type="email"
                                                      {...editRegister("email", {
                                                         required: true,
                                                      })}
                                                      className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                   />
                                                )}
                                                {col.key === "maxHours" && (
                                                   <input
                                                      type="number"
                                                      {...editRegister("maxHours", {
                                                         required: true,
                                                      })}
                                                      className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                   />
                                                )}
                                                {col.key === "actions" && (
                                                   <div className="flex gap-2">
                                                      <Button
                                                         size="sm"
                                                         variant="outline"
                                                         onClick={() => {
                                                            setEditingTeacherId(null);
                                                            resetEditForm();
                                                         }}
                                                      >
                                                         <X className="w-3 h-3" />
                                                      </Button>
                                                      <Button
                                                         size="sm"
                                                         className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
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
                                                {col.key === "name" && (
                                                   <div className="font-medium">
                                                      {teacher.name}
                                                   </div>
                                                )}
                                                {col.key === "empId" && teacher.empId}
                                                {col.key === "subjects" && (
                                                   <div className="flex flex-wrap gap-1">
                                                      {teacherSubjects
                                                         .filter(
                                                            (teacherSubject) =>
                                                               teacher.name ===
                                                               teacherSubject.teacher,
                                                         )
                                                         .map((teacherSubject, idx) => (
                                                            <Badge
                                                               key={idx}
                                                               variant="outline"
                                                               className="bg-muted text-muted-foreground border-border"
                                                            >
                                                               {teacherSubject.subject}
                                                            </Badge>
                                                         ))}
                                                   </div>
                                                )}
                                                {col.key === "designation" &&
                                                   teacher.designation}
                                                {col.key === "email" && (
                                                   <div className="flex items-center gap-1">
                                                      <Mail className="w-3 h-3 text-muted-foreground" />
                                                      {teacher.email}
                                                   </div>
                                                )}
                                                {col.key === "maxHours" &&
                                                   `${teacher.maxHours} hrs`}
                                                {col.key === "actions" && (
                                                   <div className="flex gap-2">
                                                      {hoveredRowId === teacher.id ? (
                                                         <>
                                                            <EditButton
                                                               onClick={() =>
                                                                  handleEditClick(teacher)
                                                               }
                                                            />
                                                            <DeleteButton
                                                               onClick={() =>
                                                                  handleDelete(teacher)
                                                               }
                                                            />
                                                         </>
                                                      ) : (
                                                         <>
                                                            <span
                                                               style={{ visibility: "hidden" }}
                                                            >
                                                               <EditButton />
                                                            </span>
                                                            <span
                                                               style={{ visibility: "hidden" }}
                                                            >
                                                               <DeleteButton />
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
                              {renderNewRow && (
                                 <motion.tr
                                    key="new-row"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                 >
                                    {columns.map((col) => (
                                       <TableCell key={col.key}>
                                          {col.key === "name" && (
                                             <input
                                                type="text"
                                                placeholder="Name"
                                                className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                {...register("name", { required: true })}
                                             />
                                          )}
                                          {col.key === "empId" && (
                                             <input
                                                type="text"
                                                placeholder="Employee ID"
                                                className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                {...register("empId", { required: true })}
                                             />
                                          )}
                                          {col.key === "subjects" && (
                                             <Controller
                                                name="subjects"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                   <Select
                                                      value={field.value}
                                                      onValueChange={field.onChange}
                                                   >
                                                      <SelectTrigger className="w-full bg-background text-foreground border-border">
                                                         <SelectValue placeholder="Subject" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                         {subjects.map((subject) => (
                                                            <SelectItem
                                                               key={subject.subjectName}
                                                               value={subject.subjectName}
                                                            >
                                                               <Badge
                                                                  key={subject.subjectName}
                                                                  variant="outline"
                                                                  className="bg-muted text-muted-foreground border-border"
                                                               >
                                                                  {subject.subjectName}
                                                               </Badge>
                                                            </SelectItem>
                                                         ))}
                                                      </SelectContent>
                                                   </Select>
                                                )}
                                             />
                                          )}
                                          {col.key === "designation" && (
                                             <Controller
                                                name="designation"
                                                control={control}
                                                rules={{ required: true }}
                                                render={({ field }) => (
                                                   <Select
                                                      value={field.value}
                                                      onValueChange={field.onChange}
                                                   >
                                                      <SelectTrigger className="w-full bg-background text-foreground border-border">
                                                         <SelectValue placeholder="Designation" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                         {DESIGNATIONS.map((d) => (
                                                            <SelectItem key={d} value={d}>
                                                               {d}
                                                            </SelectItem>
                                                         ))}
                                                      </SelectContent>
                                                   </Select>
                                                )}
                                             />
                                          )}
                                          {col.key === "email" && (
                                             <input
                                                type="email"
                                                placeholder="Email"
                                                className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                {...register("email", {
                                                   required: true,
                                                   pattern: /^\S+@\S+$/i,
                                                })}
                                             />
                                          )}
                                          {col.key === "maxHours" && (
                                             <input
                                                placeholder="Max Hours"
                                                className="w-full border px-2 py-1 rounded bg-background text-foreground border-border"
                                                {...register("maxHours", {
                                                   required: true,
                                                   min: 1,
                                                   max: 40,
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
                                                   className="bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-600 dark:hover:bg-blue-500"
                                                   onClick={handleSubmit(onSubmit)}
                                                >
                                                   <Check className="w-3 h-3" />
                                                </Button>
                                             </div>
                                          )}
                                       </TableCell>
                                    ))}
                                 </motion.tr>
                              )}
                           </AnimatePresence>
                        </TableBody>
                     </Table>
                  </div>
               </CardContent>
            </>
         )}
      </Card>
   );
}

export default TeachersTable;

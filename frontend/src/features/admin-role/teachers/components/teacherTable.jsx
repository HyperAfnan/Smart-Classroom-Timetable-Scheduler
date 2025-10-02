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
import useTeachers from "../hooks/useTeachers.js";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";

function TeachersTable({ filteredTeacher }) {
   const { deleteTeacherAsync, createTeacherAsync, updateTeacherAsync } =
      useTeacherMutations();
   const { departments, isLoading } = useTeachers();
   const [hoveredRowId, setHoveredRowId] = useState(null);
   const [renderNewRow, setRenderNewRow] = useState(false);
   const [editingTeacherId, setEditingTeacherId] = useState(null);

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

   const handleDelete = async (id) => {
      if (confirm("Are you sure you want to delete this teacher?")) {
         await deleteTeacherAsync(id);
      }
   };

   const handleEditClick = (teacher) => {
      setEditingTeacherId(teacher.id);
      setValue("name", teacher.name);
      setValue("emp_id", teacher.emp_id);
      setValue("department", teacher.department);
      setValue("designation", teacher.designation);
      setValue("email", teacher.email);
      setValue("max_hours", teacher.max_hours);
   };

   const onSubmit = async (data) => {
      if (errors) toast.error("Please fill all required fields correctly.");
      await createTeacherAsync(data);
      reset();
      setRenderNewRow(false);
   };

   const onEditSubmit = async (data) => {
      if (editErrors) toast.error("Please fill all required fields correctly.");
      await updateTeacherAsync({ id: editingTeacherId, updates: data });
      setEditingTeacherId(null);
      resetEditForm();
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
      <Card>
         <CardHeader>
            <CardTitle className="flex items-center gap-2">
               <Users className="w-5 h-5" />
               Teachers ({filteredTeacher.length})
               <div className="flex gap-2 ml-auto">
                  <Button
                     className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
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
                        {isLoading ? (
                           <TableRow>
                              <TableCell
                                 colSpan={columns.length}
                                 className="text-center py-8"
                              >
                                 Loading teachers...
                              </TableCell>
                           </TableRow>
                        ) : filteredTeacher.length === 0 ? (
                           <TableRow>
                              <TableCell
                                 colSpan={columns.length}
                                 className="text-center py-8"
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
                                 className="hover:bg-slate-50"
                                 onMouseEnter={() => setHoveredRowId(teacher.id)}
                                 onMouseLeave={() => setHoveredRowId(null)}
                              >
                                 {editingTeacherId === teacher.id
                                    ? columns.map((col) => (
                                       <TableCell key={col.key}>
                                          {col.key === "name" && (
                                             <input
                                                {...editRegister("name", { required: true })}
                                                className="w-full border px-2 py-1 rounded"
                                             />
                                          )}
                                          {col.key === "emp_id" && (
                                             <input
                                                {...editRegister("emp_id", {
                                                   required: true,
                                                })}
                                                className="w-full border px-2 py-1 rounded"
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
                                                         <SelectValue placeholder="Department" />
                                                      </SelectTrigger>
                                                      <SelectContent>
                                                         {departments.map((dept) => (
                                                            <SelectItem key={dept} value={dept}>
                                                               <Badge
                                                                  variant="outline"
                                                                  className="bg-blue-50 text-blue-700 border-blue-200"
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
                                                      <SelectTrigger className="w-full">
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
                                                {...editRegister("email", { required: true })}
                                                className="w-full border px-2 py-1 rounded"
                                             />
                                          )}
                                          {col.key === "max_hours" && (
                                             <input
                                                type="number"
                                                {...editRegister("max_hours", {
                                                   required: true,
                                                })}
                                                className="w-full border px-2 py-1 rounded"
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
                                                   className="bg-blue-500 text-white"
                                                   onClick={handleEditSubmit(onEditSubmit)}
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
                                          {col.key === "emp_id" && teacher.emp_id}
                                          {col.key === "department" && (
                                             <Badge
                                                variant="outline"
                                                className="bg-blue-50 text-blue-700 border-blue-200"
                                             >
                                                {teacher.department}
                                             </Badge>
                                          )}
                                          {col.key === "designation" && teacher.designation}
                                          {col.key === "email" && (
                                             <div className="flex items-center gap-1">
                                                <Mail className="w-3 h-3 text-slate-400" />
                                                {teacher.email}
                                             </div>
                                          )}
                                          {col.key === "max_hours" &&
                                             `${teacher.max_hours} hrs`}
                                          {col.key === "actions" && (
                                             <div className="flex gap-2">
                                                {hoveredRowId === teacher.id ? (
                                                   <>
                                                      <EditButton
                                                         onClick={() => handleEditClick(teacher)}
                                                      />
                                                      <DeleteButton
                                                         onClick={() => handleDelete(teacher.id)}
                                                      />
                                                   </>
                                                ) : (
                                                   <>
                                                      <span style={{ visibility: "hidden" }}>
                                                         <EditButton />
                                                      </span>
                                                      <span style={{ visibility: "hidden" }}>
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
                                          className="w-full border px-2 py-1 rounded"
                                          {...register("name", { required: true })}
                                       />
                                    )}
                                    {col.key === "emp_id" && (
                                       <input
                                          type="text"
                                          placeholder="Employee ID"
                                          className="w-full border px-2 py-1 rounded"
                                          {...register("emp_id", { required: true })}
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
                                                         {dept}
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
                                                <SelectTrigger className="w-full">
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
                                          className="w-full border px-2 py-1 rounded"
                                          {...register("email", {
                                             required: true,
                                             pattern: /^\S+@\S+$/i,
                                          })}
                                       />
                                    )}
                                    {col.key === "max_hours" && (
                                       <input
                                          placeholder="Max Hours"
                                          className="w-full border px-2 py-1 rounded"
                                          {...register("max_hours", {
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
                                             className="bg-blue-500 text-white"
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
      </Card>
   );
}

export default TeachersTable;

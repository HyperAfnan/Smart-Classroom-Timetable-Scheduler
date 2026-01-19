import { useState } from "react";
import {
   Table,
   TableBody,
   TableCell,
   TableHead,
   TableHeader,
   TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
   Select,
   SelectTrigger,
   SelectValue,
   SelectContent,
   SelectItem,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
   Plus,
   Edit,
   Trash2,
   Check,
   X,
   GraduationCap,
   Users,
   Calendar,
   Building2,
   Layers,
} from "lucide-react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "react-toastify";
import useClasses from "../hooks/useClasses";
import { semesters as defaultSemesters } from "../constants";
import ClassExcelUploader from "./ClassExcelUploader";
import Loader from "@/shared/components/Loader.jsx";
import ClassTeachersPanel from "./TeacherSelector.jsx";

export default function InlineClassesTable({
   classes,
   loading,
   semesters = defaultSemesters,
}) {
   const { createClassAsync, updateClassAsync, deleteClassAsync } = useClasses();

   const [hoveredRowId, setHoveredRowId] = useState(null);
   const [renderNewRow, setRenderNewRow] = useState(false);
   const [editingClassId, setEditingClassId] = useState(null);

   // 👇 NEW STATE FOR TEACHERS PANEL
   const [selectedClass, setSelectedClass] = useState(null);
   const [isPanelOpen, setIsPanelOpen] = useState(false);

   // 👇 PANEL HANDLERS
   const handleOpenTeachersPanel = (cls) => {
      setSelectedClass(cls);
      setIsPanelOpen(true);
   };

   const handleCloseTeachersPanel = () => {
      setIsPanelOpen(false);
      setSelectedClass(null);
   };

   const {
      register,
      handleSubmit,
      control,
      reset,
      formState: { errors },
   } = useForm({
      defaultValues: {
         className: "",
         semester: undefined,
         section: "A",
         students: 30,
         academicYear: "2024-25",
      },
   });

   const {
      register: editRegister,
      handleSubmit: handleEditSubmit,
      control: editControl,
      reset: resetEditForm,
      setValue: setEditValue,
      formState: { errors: editErrors },
   } = useForm();

   const handleEditClick = (cls) => {
      setEditingClassId(cls.id);
      setEditValue("className", cls.className || "");
      setEditValue("semester", cls.semester?.toString() || "");
      setEditValue("section", cls.section || "");
      setEditValue("students", cls.students || 0);
      setEditValue("academicYear", cls.academicYear || "");
   };

   const handleDelete = async (id) => {
      if (!confirm("Are you sure you want to delete this class?")) return;
      try {
         await deleteClassAsync(id);
         toast.success("Class deleted successfully!");
      } catch (err) {
         toast.error(`Delete failed: ${err?.message || err}`);
      }
   };

   const onCreateSubmit = async (data) => {
      try {
         await createClassAsync({
            className: data.className.trim(),
            semester: parseInt(data.semester, 10),
            section: data.section.trim(),
            students: parseInt(data.students, 10),
            academicYear: data.academicYear.trim(),
         });
         toast.success("Class created successfully!");
         reset();
         setRenderNewRow(false);
      } catch (err) {
         toast.error(`Create failed: ${err?.message || err}`);
      }
   };

   const onEditSubmit = async (data) => {
      try {
         await updateClassAsync({
            id: editingClassId,
            updates: {
               className: data.className.trim(),
               semester: parseInt(data.semester, 10),
               section: data.section.trim(),
               students: parseInt(data.students, 10),
               academicYear: data.academicYear.trim(),
            },
         });
         toast.success("Class updated successfully!");
         setEditingClassId(null);
         resetEditForm();
      } catch (err) {
         toast.error(`Update failed: ${err?.message || err}`);
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
      <div className="overflow-x-auto relative">
         {loading ? (
            <Loader />
         ) : (
            <>
               {/* HEADER ACTIONS */}
               <div className="flex items-center gap-2 mb-4">
                  <div className="flex items-center gap-2 text-foreground font-semibold">
                     <GraduationCap className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                     Classes ({classes.length})
                  </div>
                  <div className="ml-auto flex gap-2">
                     <Button
                        className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700 text-white dark:from-violet-600 dark:to-violet-700 dark:hover:from-violet-500 dark:hover:to-violet-600"
                        onClick={() => {
                           setRenderNewRow(true);
                           setEditingClassId(null);
                        }}
                     >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Class
                     </Button>
                     <ClassExcelUploader />
                  </div>
               </div>

               {/* TABLE */}
               <Table className="table-fixed w-full">
                  <TableHeader>
                     <TableRow>
                        <TableHead className="w-[20%]">Class Name</TableHead>
                        <TableHead className="w-[10%]">Semester</TableHead>
                        <TableHead className="w-[10%]">Section</TableHead>
                        <TableHead className="w-[12%]">Students</TableHead>
                        <TableHead className="w-[16%]">Academic Year</TableHead>
                        <TableHead className="w-[16%]"></TableHead>
                     </TableRow>
                  </TableHeader>

                  <TableBody>
                     <AnimatePresence>
                        {renderNewRow && (
                           <motion.tr
                              initial={{ opacity: 0, y: -20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                           >
                              <TableCell>
                                 <Input
                                    {...register("className", { required: true })}
                                    placeholder="Class Name"
                                    className="bg-background text-foreground border-border"
                                    autoFocus
                                 />
                              </TableCell>
                              <TableCell>
                                 <Controller
                                    name="semester"
                                    control={control}
                                    rules={{ required: true }}
                                    render={({ field }) => (
                                       <Select
                                          value={field.value ? String(field.value) : ""}
                                          onValueChange={field.onChange}
                                       >
                                          <SelectTrigger className="bg-background text-foreground border-border">
                                             <SelectValue placeholder="Sem" />
                                          </SelectTrigger>
                                          <SelectContent className="bg-popover text-popover-foreground border border-border">
                                             {semesters.map((s) => (
                                                <SelectItem key={s} value={s.toString()}>
                                                   Sem {s}
                                                </SelectItem>
                                             ))}
                                          </SelectContent>
                                       </Select>
                                    )}
                                 />
                              </TableCell>
                              <TableCell>
                                 <Input
                                    {...register("section", { required: true })}
                                    placeholder="Section"
                                    className="bg-background text-foreground border-border"
                                 />
                              </TableCell>
                              <TableCell>
                                 <Input
                                    type="number"
                                    min={1}
                                    {...register("students", {
                                       required: true,
                                       min: 1,
                                    })}
                                    placeholder="Count"
                                    className="bg-background text-foreground border-border"
                                 />
                              </TableCell>
                              <TableCell>
                                 <Input
                                    {...register("academicYear", {
                                       required: true,
                                    })}
                                    placeholder="2024-25"
                                    className="bg-background text-foreground border-border"
                                 />
                              </TableCell>
                              <TableCell>
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
                                       className="bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500"
                                       onClick={handleSubmit(onCreateSubmit, (err) => {
                                           console.error("Create validation failed", err);
                                           toast.error("Please fill all required fields");
                                       })}
                                    >
                                       <Check className="w-3 h-3" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </motion.tr>
                        )}
                        
                        {classes.length === 0 && !renderNewRow ? (
                            <TableRow>
                                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                    No classes found. Click "Add Class" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            classes.map((cls, index) => (
                           <motion.tr
                              key={cls.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ delay: index * 0.05 }}
                              className="hover:bg-accent hover:text-accent-foreground transition-colors cursor-pointer"
                              onClick={(e) => {
                                 if (e.target.closest("button")) return; // Prevent trigger when clicking buttons
                                 if (e.target.closest("input")) return; // Prevent trigger when clicking inputs
                                 if (editingClassId === cls.id) return; // Prevent trigger when editing
                                 handleOpenTeachersPanel(cls);
                              }}
                              onMouseEnter={() => setHoveredRowId(cls.id)}
                              onMouseLeave={() => setHoveredRowId(null)}
                           >
                              {editingClassId === cls.id ? (
                                 <>
                                    <TableCell>
                                       <Input
                                          {...editRegister("className", {
                                             required: true,
                                          })}
                                          placeholder="Class Name"
                                          className="bg-background text-foreground border-border"
                                       />
                                    </TableCell>

                                    <TableCell>
                                       <Controller
                                          name="semester"
                                          control={editControl}
                                          rules={{ required: true }}
                                          render={({ field }) => (
                                             <Select
                                                value={field.value ? String(field.value) : ""}
                                                onValueChange={field.onChange}
                                             >
                                                <SelectTrigger className="bg-background text-foreground border-border">
                                                   <SelectValue placeholder="Sem" />
                                                </SelectTrigger>
                                                <SelectContent className="bg-popover text-popover-foreground border border-border">
                                                   {semesters.map((s) => (
                                                      <SelectItem key={s} value={s.toString()}>
                                                         Sem {s}
                                                      </SelectItem>
                                                   ))}
                                                </SelectContent>
                                             </Select>
                                          )}
                                       />
                                    </TableCell>

                                    <TableCell>
                                       <Input
                                          {...editRegister("section", { required: true })}
                                          placeholder="Section"
                                          className="bg-background text-foreground border-border"
                                       />
                                    </TableCell>

                                    <TableCell>
                                       <Input
                                          type="number"
                                          min={1}
                                          {...editRegister("students", {
                                             required: true,
                                             min: 1,
                                          })}
                                          placeholder="Count"
                                          className="bg-background text-foreground border-border"
                                       />
                                    </TableCell>

                                    <TableCell>
                                       <Input
                                          {...editRegister("academicYear", {
                                             required: true,
                                          })}
                                          placeholder="2024-25"
                                          className="bg-background text-foreground border-border"
                                       />
                                    </TableCell>

                                    <TableCell>
                                       <div className="flex gap-2">
                                          <Button
                                             size="sm"
                                             variant="outline"
                                             onClick={() => {
                                                setEditingClassId(null);
                                                resetEditForm();
                                             }}
                                          >
                                             <X className="w-3 h-3" />
                                          </Button>
                                          <Button
                                             size="sm"
                                             className="bg-violet-600 hover:bg-violet-700 text-white dark:bg-violet-600 dark:hover:bg-violet-500"
                                             onClick={handleEditSubmit(onEditSubmit, (err) => {
                                                 console.error("Edit validation failed", err);
                                                 toast.error("Please fill all required fields");
                                             })}
                                          >
                                             <Check className="w-3 h-3" />
                                          </Button>
                                       </div>
                                    </TableCell>
                                 </>
                              ) : (
                                 <>
                                    <TableCell>
                                       <div className="flex items-center gap-2">
                                          <Layers className="w-3 h-3 text-muted-foreground" />
                                          <span className="font-medium">
                                             {cls.className || cls.name}
                                          </span>
                                       </div>
                                    </TableCell>

                                    <TableCell>
                                       <div className="flex items-center gap-1">
                                          <Building2 className="w-3 h-3 text-muted-foreground" />
                                          Sem {cls.semester}
                                       </div>
                                    </TableCell>

                                    <TableCell>
                                       <Badge
                                          variant="outline"
                                          className="bg-muted text-muted-foreground border-border"
                                       >
                                          {cls.section}
                                       </Badge>
                                    </TableCell>

                                    <TableCell>
                                       <div className="flex items-center gap-1">
                                          <Users className="w-3 h-3 text-muted-foreground" />
                                          {cls.students}
                                       </div>
                                    </TableCell>

                                    <TableCell>
                                       <div className="flex items-center gap-1">
                                          <Calendar className="w-3 h-3 text-muted-foreground" />
                                          {cls.academicYear}
                                       </div>
                                    </TableCell>

                                    <TableCell>
                                       <div className="flex gap-2">
                                          {hoveredRowId === cls.id ? (
                                             <>
                                                <EditButton
                                                   onClick={() => handleEditClick(cls)}
                                                />
                                                <DeleteButton
                                                   onClick={() => handleDelete(cls.id)}
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
                                    </TableCell>
                                 </>
                              )}
                           </motion.tr>
                        )))
                        }
                     </AnimatePresence>
                  </TableBody>
               </Table>
            </>
         )}

         {/* 👇 NEW TEACHERS PANEL */}
         {selectedClass && (
            <ClassTeachersPanel
               classId={selectedClass.id}
               className={selectedClass.className}
               isOpen={isPanelOpen}
               onClose={handleCloseTeachersPanel}
            />
         )}
      </div>
   );
}

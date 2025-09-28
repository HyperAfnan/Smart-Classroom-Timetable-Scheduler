import React, { useState } from "react";
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
const __keepMotion = motion;
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

/**
 * InlineClassesTable
 *
 * Feature parity with Teachers / Rooms inline tables:
 * - Inline creation row
 * - Inline editing per row
 * - Hover-revealed action buttons (space preserved to avoid layout shift)
 * - Bulk Excel import button
 * - react-hook-form validation
 *
 * Expects filtered classes list via props so that external filters (search, department)
 * can be applied at a higher level without coupling this component to filter state.
 *
 * Required props:
 *  - classes: filtered array of class entities
 *  - loading: boolean (loading state of parent fetch)
 *  - departments: string[] list for department select
 * Optional props:
 *  - semesters: number[] override (defaults to constants)
 */
export default function InlineClassesTable({
  classes,
  loading,
  departments = [],
  semesters = defaultSemesters,
}) {
  const { createClassAsync, updateClassAsync, deleteClassAsync } = useClasses();

  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [renderNewRow, setRenderNewRow] = useState(false);
  const [editingClassId, setEditingClassId] = useState(null);

  // Creation form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      class_name: "",
      department: "",
      semester: undefined,
      section: "A",
      students: 30,
      academic_year: "2024-25",
    },
  });

  // Editing form
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
    setEditValue("class_name", cls.class_name || "");
    setEditValue("department", cls.department || "");
    setEditValue("semester", cls.semester?.toString() || "");
    setEditValue("section", cls.section || "");
    setEditValue("students", cls.students || 0);
    setEditValue("academic_year", cls.academic_year || "");
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
        class_name: data.class_name.trim(),
        department: data.department,
        semester: parseInt(data.semester, 10),
        section: data.section.trim(),
        students: parseInt(data.students, 10),
        academic_year: data.academic_year.trim(),
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
          class_name: data.class_name.trim(),
          department: data.department,
          semester: parseInt(data.semester, 10),
          section: data.section.trim(),
          students: parseInt(data.students, 10),
          academic_year: data.academic_year.trim(),
        },
      });
      toast.success("Class updated successfully!");
      setEditingClassId(null);
      resetEditForm();
    } catch (err) {
      toast.error(`Update failed: ${err?.message || err}`);
    }
  };

  // Optional: surface a single validation toast (avoid spamming)
  if (
    (errors && Object.keys(errors).length > 0) ||
    (editErrors && Object.keys(editErrors).length > 0)
  ) {
    // Intentionally silent (pattern followed in other tables)
  }

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
    <div className="overflow-x-auto">
      <div className="flex items-center gap-2 mb-4">
        <div className="flex items-center gap-2 text-slate-700 font-semibold">
          <GraduationCap className="w-5 h-5" />
          Classes ({classes.length})
        </div>
        <div className="ml-auto flex gap-2">
          <Button
            className="bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-600 hover:to-violet-700"
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
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[20%]">Class Name</TableHead>
            <TableHead className="w-[16%]">Department</TableHead>
            <TableHead className="w-[10%]">Semester</TableHead>
            <TableHead className="w-[10%]">Section</TableHead>
            <TableHead className="w-[12%]">Students</TableHead>
            <TableHead className="w-[16%]">Academic Year</TableHead>
            <TableHead className="w-[16%]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <AnimatePresence>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  Loading classes...
                </TableCell>
              </TableRow>
            ) : classes.length === 0 && !renderNewRow ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No classes found
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
                  className="hover:bg-slate-50"
                  onMouseEnter={() => setHoveredRowId(cls.id)}
                  onMouseLeave={() => setHoveredRowId(null)}
                >
                  {editingClassId === cls.id ? (
                    <>
                      <TableCell>
                        <Input
                          {...editRegister("class_name", { required: true })}
                          placeholder="Class Name"
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name="department"
                          control={editControl}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Department" />
                              </SelectTrigger>
                              <SelectContent>
                                {departments.map((d) => (
                                  <SelectItem key={d} value={d}>
                                    <Badge
                                      variant="outline"
                                      className="bg-orange-50 text-orange-700 border-orange-200"
                                    >
                                      {d}
                                    </Badge>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          )}
                        />
                      </TableCell>
                      <TableCell>
                        <Controller
                          name="semester"
                          control={editControl}
                          rules={{ required: true }}
                          render={({ field }) => (
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Sem" />
                              </SelectTrigger>
                              <SelectContent>
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
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...editRegister("academic_year", { required: true })}
                          placeholder="2024-25"
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
                            className="bg-violet-500 text-white"
                            onClick={handleEditSubmit(onEditSubmit)}
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
                          <Layers className="w-3 h-3 text-slate-400" />
                          <span className="font-medium">
                            {cls.class_name || cls.name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-orange-50 text-orange-700 border-orange-200"
                        >
                          {cls.department}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-400" />
                          Sem {cls.semester}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-slate-50 text-slate-700 border-slate-200"
                        >
                          {cls.section}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" />
                          {cls.students}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {cls.academic_year}
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
              ))
            )}
            {renderNewRow && (
              <motion.tr
                key="new-class-row"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <TableCell>
                  <Input
                    placeholder="Class Name"
                    {...register("class_name", { required: true })}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="department"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Department" />
                        </SelectTrigger>
                        <SelectContent>
                          {departments.map((d) => (
                            <SelectItem key={d} value={d}>
                              {d}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                </TableCell>
                <TableCell>
                  <Controller
                    name="semester"
                    control={control}
                    rules={{ required: true }}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sem" />
                        </SelectTrigger>
                        <SelectContent>
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
                    placeholder="Section"
                    {...register("section", { required: true })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    type="number"
                    min={1}
                    placeholder="Count"
                    {...register("students", { required: true, min: 1 })}
                  />
                </TableCell>
                <TableCell>
                  <Input
                    placeholder="2024-25"
                    {...register("academic_year", { required: true })}
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
                      className="bg-violet-500 text-white"
                      onClick={handleSubmit(onCreateSubmit)}
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  </div>
                </TableCell>
              </motion.tr>
            )}
          </AnimatePresence>
        </TableBody>
      </Table>
    </div>
  );
}

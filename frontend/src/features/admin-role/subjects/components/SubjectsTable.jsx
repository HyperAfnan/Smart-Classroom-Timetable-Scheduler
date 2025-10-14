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
// import { toast } from "react-toastify";
import ExcelUploader from "./SubjectsExcelUploader.jsx";

const getTypeColor = (type) => {
  return colors[type] || "bg-gray-50 text-gray-700  border-border-200";
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
        setValue("subject_name", subject.subject_name);
        setValue("subject_code", subject.subject_code);
        setValue("department", subject.department);
        setValue("semester", subject.semester);
        setValue("type", subject.type);
        setValue("credits", subject.credits);
        setValue("hours_per_week", subject.hours_per_week);
      }}
    >
      <Edit className="w-3 h-3" />
    </Button>
  );
  const DeleteButton = ({ subjectId }) => (
    <Button
      size="sm"
      variant="outline"
      onClick={async () => await deleteSubjectAsync(subjectId)}
      className="text-red-600 hover:text-red-700"
    >
      {" "}
      <Trash2 className="w-3 h-3" />{" "}
    </Button>
  );

  const onEditSubmit = async (data) => {
    await updateSubjectAsync({ id: editingSubject, updates: data });
    setEditingSubjectId(null);
    resetEditForm();
  };
  const onSubmit = async (data) => {
    await createSubjectAsync(data);
    reset();
    setRenderNewRow(false);
  };

  if (errors || editErrors) {
    // toast.error("Please fill all required fields correctly.");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subjects ({subjects.length})
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button onClick={() => setRenderNewRow(true)} disabled={false}>
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
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading subjects...
                    </TableCell>
                  </TableRow>
                ) : subjects.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
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
                      className="hover:bg-slate-50"
                      onMouseEnter={() => setHoveredRowId(subject.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      {editingSubject === subject.id
                        ? columns.map((col) => (
                            <TableCell key={col.key}>
                              {col.key === "subject_name" && (
                                <input
                                  type="text"
                                  placeholder="Subject Name"
                                  className="w-full border px-2 py-1 rounded"
                                  {...editRegister("subject_name", {
                                    required: true,
                                  })}
                                />
                              )}
                              {col.key === "subject_code" && (
                                <input
                                  type="text"
                                  placeholder="Subject Code"
                                  className="w-full border px-2 py-1 rounded"
                                  {...editRegister("subject_code", {
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
                                  {...editRegister("credits", {
                                    required: true,
                                  })}
                                />
                              )}
                              {col.key === "hours_per_week" && (
                                <input
                                  placeholder="Hr/week"
                                  className="w-full border px-2 py-1 rounded"
                                  {...editRegister("hours_per_week", {
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
                              {col.key === "subject_name" && (
                                <div className="font-medium">
                                  {subject.subject_name}
                                </div>
                              )}
                              {col.key === "subject_code" &&
                                subject.subject_code}
                              {col.key === "department" && (
                                <Badge
                                  variant="outline"
                                  className="bg-blue-50 text-blue-700 border-blue-200"
                                >
                                  {subject.department}
                                </Badge>
                              )}
                              {col.key === "semester" && (
                                <div className="flex items-center gap-1">
                                  <Mail className="w-3 h-3 text-slate-400" />
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
                              {col.key === "hours_per_week" && (
                                <div className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-400" />
                                  {subject.hours_per_week}h
                                </div>
                              )}
                              {col.key === "actions" && (
                                <div className="flex gap-2">
                                  {hoveredRowId === subject.id ? (
                                    <>
                                      <EditButton subject={subject} />
                                      <DeleteButton subjectId={subject.id} />
                                    </>
                                  ) : (
                                    <>
                                      <span style={{ visibility: "hidden" }}>
                                        <Button size="sm" variant="outline">
                                          <Edit className="w-3 h-3" />
                                        </Button>
                                      </span>
                                      <span style={{ visibility: "hidden" }}>
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
                      {col.key === "subject_name" && (
                        <input
                          type="text"
                          placeholder="Subject Name"
                          className="w-full border px-2 py-1 rounded"
                          {...register("subject_name", { required: true })}
                        />
                      )}
                      {col.key === "subject_code" && (
                        <input
                          type="text"
                          placeholder="Subject Code"
                          className="w-full border px-2 py-1 rounded"
                          {...register("subject_code", { required: true })}
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
                      {col.key === "hours_per_week" && (
                        <input
                          placeholder="Hr/week"
                          className="w-full border px-2 py-1 rounded"
                          {...register("hours_per_week", { required: true })}
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
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

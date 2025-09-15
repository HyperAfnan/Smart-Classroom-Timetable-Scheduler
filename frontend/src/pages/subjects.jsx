import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Plus,
  BookOpen,
  Code,
  Clock,
  Edit,
  Trash2,
  Search,
  GraduationCap,
  FileUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase";
import readXlsxFile from "read-excel-file";
import { Alert, AlertDescription } from "@/components/ui/alert";

const subjectTypes = ["Theory", "Practical", "Lab", "Seminar", "Project"];

export default function Subjects() {
  const [subjects, setSubjects] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    subject_name: "",
    subject_code: "",
    credits: 3,
    department: "",
    semester: 1,
    type: "Theory",
    hours_per_week: 3,
  });
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadSubjects();
    loadDepartments();
  }, []);

  const loadSubjects = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("subjects")
      .select("*")
      .order("created_at", { ascending: false });
    if (!error) {
      setSubjects(data || []);
      localStorage.setItem("subjects", JSON.stringify(data || []));
    }
    setLoading(false);
  };

  const loadDepartments = async () => {
    const { data, error } = await supabase
      .from("department")
      .select("name")
      .order("name", { ascending: true });
    if (!error && data) {
      setDepartments(data.map((d) => d.name));
      localStorage.setItem(
        "departments",
        JSON.stringify(data.map((d) => d.name)),
      );
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingSubject) {
      await supabase
        .from("subjects")
        .update(formData)
        .eq("id", editingSubject.id);
    } else {
      await supabase.from("subjects").insert([formData]);
    }
    resetForm();
    loadSubjects();
  };

  const resetForm = () => {
    setFormData({
      subject_name: "",
      subject_code: "",
      credits: 3,
      department: "",
      semester: 1,
      type: "Theory",
      hours_per_week: 3,
    });
    setEditingSubject(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (subject) => {
    setFormData(subject);
    setEditingSubject(subject);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this subject?")) {
      await supabase.from("subjects").delete().eq("id", id);
      loadSubjects();
    }
  };

  const handleExcelUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const rows = await readXlsxFile(file);

      // Check if the file has headers
      const headers = rows[0];
      const requiredColumns = [
        "subject_name",
        "subject_code",
        "credits",
        "department",
        "semester",
        "type",
        "hours_per_week",
      ];

      // Convert headers to lowercase for case-insensitive comparison
      const headerLower = headers.map((h) =>
        h && typeof h === "string" ? h.toLowerCase() : "",
      );

      // Check if all required columns are present
      const missingColumns = requiredColumns.filter(
        (col) => !headerLower.includes(col.toLowerCase()),
      );

      if (missingColumns.length > 0) {
        setUploadError(`Missing columns: ${missingColumns.join(", ")}`);
        setIsUploading(false);
        return;
      }

      // Create mapping from actual header case to index
      const columnMap = {};
      headerLower.forEach((header, index) => {
        columnMap[header] = index;
      });

      // Process data rows (skip header)
      const subjectsToAdd = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // Skip empty rows
        if (row.every((cell) => cell === null || cell === "")) continue;

        const subject = {
          subject_name: row[columnMap["subject_name"]] || "",
          subject_code: row[columnMap["subject_code"]] || "",
          credits: parseInt(row[columnMap["credits"]]) || 3,
          department: row[columnMap["department"]] || "",
          semester: parseInt(row[columnMap["semester"]]) || 1,
          type: row[columnMap["type"]] || "Theory",
          hours_per_week: parseInt(row[columnMap["hours_per_week"]]) || 3,
        };

        // Validate required fields
        if (
          !subject.subject_name ||
          !subject.subject_code ||
          !subject.department
        ) {
          continue; // Skip rows with missing required fields
        }

        subjectsToAdd.push(subject);
      }

      if (subjectsToAdd.length === 0) {
        setUploadError("No valid subject data found in the file");
        setIsUploading(false);
        return;
      }

      // Insert subjects into database
      const { error } = await supabase.from("subjects").insert(subjectsToAdd);

      if (error) {
        setUploadError(`Error uploading subjects: ${error.message}`);
      } else {
        alert(`Successfully imported ${subjectsToAdd.length} subjects`);
        // Reset file input
        e.target.value = null;
        loadSubjects();
      }
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }

    setIsUploading(false);
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject?.subject_name
        ?.toLowerCase()
        ?.includes(searchTerm.toLowerCase()) ||
      subject?.subject_code?.toLowerCase()?.includes(searchTerm.toLowerCase());
    const matchesDepartment =
      selectedDepartment === "all" || subject.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const getTypeColor = (type) => {
    const colors = {
      Theory: "bg-blue-50 text-blue-700 border-blue-200",
      Practical: "bg-green-50 text-green-700 border-green-200",
      Lab: "bg-purple-50 text-purple-700 border-purple-200",
      Seminar: "bg-orange-50 text-orange-700 border-orange-200",
      Project: "bg-red-50 text-red-700 border-red-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Subjects Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage course subjects and curriculum
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Subject
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingSubject ? "Edit Subject" : "Add New Subject"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Subject Name</Label>
                    <Input
                      value={formData.subject_name}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subject_name: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Subject Code</Label>
                    <Input
                      value={formData.subject_code}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subject_code: e.target.value,
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Credits</Label>
                    <Input
                      type="number"
                      min="1"
                      max="6"
                      value={formData.credits}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          credits: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Select
                      value={formData.department}
                      onValueChange={(value) =>
                        setFormData({ ...formData, department: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        {departments.map((dept) => (
                          <SelectItem key={dept} value={dept}>
                            {dept}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Semester</Label>
                    <Select
                      value={formData.semester.toString()}
                      onValueChange={(value) =>
                        setFormData({ ...formData, semester: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {subjectTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Hours per Week</Label>
                    <Input
                      type="number"
                      min="1"
                      max="10"
                      value={formData.hours_per_week}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          hours_per_week: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingSubject ? "Update Subject" : "Add Subject"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">
                  Bulk Import Subjects
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Upload an Excel file (.xlsx) with subject data. The file
                  should have columns: subject_name, subject_code, credits,
                  department, semester, type, hours_per_week.
                </p>

                {uploadError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{uploadError}</AlertDescription>
                  </Alert>
                )}

                <label className="flex flex-col items-center px-4 py-6 bg-white text-blue-600 rounded-lg border-2 border-dashed border-blue-300 hover:bg-blue-50 cursor-pointer transition-all">
                  <FileUp className="w-8 h-8" />
                  <span className="mt-2 text-base leading-normal">
                    Select Excel file
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept=".xlsx"
                    onChange={handleExcelUpload}
                    disabled={isUploading}
                  />
                </label>
                {isUploading && (
                  <div className="flex items-center justify-center mt-4">
                    <Loader2 className="w-5 h-5 animate-spin mr-2" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Button
            variant="outline"
            onClick={() =>
              document.getElementById("subjectExcelFileInput").click()
            }
            className="border-purple-300 hover:bg-purple-50"
            disabled={isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <FileUp className="w-4 h-4 mr-2" />
                Import Excel
              </>
            )}
          </Button>
          <input
            id="subjectExcelFileInput"
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleExcelUpload}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                <Input
                  placeholder="Search subjects..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select
              value={selectedDepartment}
              onValueChange={setSelectedDepartment}
            >
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Subjects Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Subjects ({filteredSubjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Semester</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Credits</TableHead>
                  <TableHead>Hours/Week</TableHead>
                  <TableHead>Actions</TableHead>
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
                  ) : filteredSubjects.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8">
                        No subjects found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSubjects.map((subject, index) => (
                      <motion.tr
                        key={subject?.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Code className="w-3 h-3 text-slate-400" />
                            {subject?.subject_code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className="bg-purple-50 text-purple-700 border-purple-200"
                          >
                            {subject?.department}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <GraduationCap className="w-3 h-3 text-slate-400" />
                            {subject?.semester}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getTypeColor(subject?.type)}
                          >
                            {subject?.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{subject?.credits}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {subject?.hours_per_week}h
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(subject)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(subject?.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

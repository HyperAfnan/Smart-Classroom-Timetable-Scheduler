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
  Users,
  Mail,
  Edit,
  Trash2,
  Search,
  FileUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase";
import readXlsxFile from "read-excel-file";
import { Alert, AlertDescription } from "@/components/ui/alert";

const designations = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Senior Lecturer",
];

export default function Teachers() {
  const [teachers, setTeachers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    employee_id: "",
    department: "",
    designation: "",
    subjects: [],
    max_hours: 20,
  });

  useEffect(() => {
    loadTeachers();
    loadDepartments();
  }, []);

  const loadTeachers = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("teacher_profile").select("*");

    if (!error) {
      setTeachers(data || []);
      setFilteredTeachers(data || []);
    }
    setLoading(false);
  };

  const loadDepartments = async () => {
    const { data, error } = await supabase.from("department").select("name");
    if (!error && data) {
      setDepartments(data.map((d) => d.name));
    }
  };

  useEffect(() => {
    // Filter teachers based on search term and department
    let filtered = [...teachers];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (teacher) =>
          teacher.name.toLowerCase().includes(searchLower) ||
          teacher.email.toLowerCase().includes(searchLower) ||
          teacher.employee_id.toLowerCase().includes(searchLower),
      );
    }

    if (selectedDepartment !== "all") {
      filtered = filtered.filter(
        (teacher) => teacher.department === selectedDepartment,
      );
    }

    setFilteredTeachers(filtered);
  }, [searchTerm, selectedDepartment, teachers]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingTeacher) {
      await supabase
        .from("teacher_profile")
        .update(formData)
        .eq("id", editingTeacher.id);
    } else {
      await supabase.from("teacher_profile").insert([formData]);
    }
    resetForm();
    loadTeachers();
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      employee_id: "",
      department: "",
      designation: "",
      subjects: [],
      max_hours: 20,
    });
    setEditingTeacher(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (teacher) => {
    setFormData(teacher);
    setEditingTeacher(teacher);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      await supabase.from("teacher_profile").delete().eq("id", id);
      loadTeachers();
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
        "name",
        "email",
        "employee_id",
        "department",
        "designation",
        "max_hours",
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
      const teachersToAdd = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // Skip empty rows
        if (row.every((cell) => cell === null || cell === "")) continue;

        const teacher = {
          name: row[columnMap["name"]] || "",
          email: row[columnMap["email"]] || "",
          employee_id: String(row[columnMap["employee_id"]] || ""),
          department: row[columnMap["department"]] || "",
          designation: row[columnMap["designation"]] || "",
          max_hours: parseInt(row[columnMap["max_hours"]]) || 20,
          subjects: [], // Default empty subjects array
        };

        // Validate required fields
        if (!teacher.name || !teacher.email || !teacher.employee_id) {
          continue; // Skip rows with missing required fields
        }

        teachersToAdd.push(teacher);
      }

      if (teachersToAdd.length === 0) {
        setUploadError("No valid teacher data found in the file");
        setIsUploading(false);
        return;
      }

      // Insert teachers into database
      const { error } = await supabase
        .from("teacher_profile")
        .insert(teachersToAdd);

      if (error) {
        setUploadError(`Error uploading teachers: ${error.message}`);
      } else {
        alert(`Successfully imported ${teachersToAdd.length} teachers`);
        // Reset file input
        e.target.value = null;
        loadTeachers();
      }
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }

    setIsUploading(false);
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
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingTeacher ? "Edit Teacher" : "Add New Teacher"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employee ID</Label>
                    <Input
                      value={formData.employee_id}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          employee_id: e.target.value,
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
                    <Label>Designation</Label>
                    <Select
                      value={formData.designation}
                      onValueChange={(value) =>
                        setFormData({ ...formData, designation: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select designation" />
                      </SelectTrigger>
                      <SelectContent>
                        {designations.map((designation) => (
                          <SelectItem key={designation} value={designation}>
                            {designation}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Max Hours/Week</Label>
                    <Input
                      type="number"
                      value={formData.max_hours}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          max_hours: parseInt(e.target.value),
                        })
                      }
                      min={1}
                      max={40}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingTeacher ? "Update Teacher" : "Add Teacher"}
                  </Button>
                </div>
              </form>
              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">
                  Bulk Import Teachers
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Upload an Excel file (.xlsx) with teacher data. The file
                  should have columns: name, email, employee_id, department,
                  designation, max_hours.
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
            onClick={() => document.getElementById("excelFileInput").click()}
            className="border-blue-300 hover:bg-blue-50"
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
            id="excelFileInput"
            type="file"
            className="hidden"
            accept=".xlsx"
            onChange={handleExcelUpload}
            disabled={isUploading}
          />
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input
            placeholder="Search teachers..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select
          value={selectedDepartment}
          onValueChange={setSelectedDepartment}
        >
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Department" />
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

      {loading ? (
        <div className="flex items-center justify-center p-8">
          <Loader2 className="w-6 h-6 animate-spin mr-2" />
          <span>Loading teachers...</span>
        </div>
      ) : (
        <>
          {filteredTeachers.length > 0 ? (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Employee ID</TableHead>
                      <TableHead>Department</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Max Hours</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredTeachers.map((teacher) => (
                        <tr key={teacher.id} className="hover:bg-slate-50">
                          <TableCell className="font-medium">
                            {teacher.name}
                          </TableCell>
                          <TableCell className="text-blue-600">
                            {teacher.email}
                          </TableCell>
                          <TableCell>{teacher.employee_id}</TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-slate-100">
                              {teacher.department}
                            </Badge>
                          </TableCell>
                          <TableCell>{teacher.designation}</TableCell>
                          <TableCell>{teacher.max_hours} hrs</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(teacher)}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(teacher.id)}
                                className="text-red-500 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </tr>
                      ))}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-8 text-center">
                <Users className="w-12 h-12 text-slate-300 mb-4" />
                <h3 className="text-lg font-medium mb-2">No teachers found</h3>
                <p className="text-slate-500 mb-4 max-w-md">
                  {searchTerm || selectedDepartment !== "all"
                    ? "No teachers match your search criteria. Try adjusting your filters."
                    : "There are no teachers in the system yet. Add your first teacher to get started."}
                </p>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {uploadError && (
        <Alert variant="destructive" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

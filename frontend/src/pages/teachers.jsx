import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
    Plus, 
    Users, 
    Mail, 
    Edit,
    Trash2,
    Search
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase";

const designations = [
    "Professor", "Associate Professor", "Assistant Professor", "Lecturer", "Senior Lecturer"
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
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        employee_id: "",
        department: "",
        designation: "",
        subjects: [],
        max_hours: 20
    });

    useEffect(() => {
        loadTeachers();
        loadDepartments();
    }, []);

    const loadTeachers = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("teacher_profile")
            .select("*");

      console.log("Data", data)
        if (!error) {
            setTeachers(data || []);
            localStorage.setItem("teachers", JSON.stringify(data || []));
        }
      console.log(data, error);
        setLoading(false);
    };

    const loadDepartments = async () => {
        const { data, error } = await supabase
            .from("department")
            .select("name");
        if (!error && data) {
            setDepartments(data.map(d => d.name));
            localStorage.setItem("departments", JSON.stringify(data.map(d => d.name)));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingTeacher) {
            await supabase
                .from("teacher_profile")
                .update(formData)
                .eq("id", editingTeacher.id);
        } else {
            await supabase
                .from("teacher_profile")
                .insert([formData]);
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
            max_hours: 20
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
            await supabase
                .from("teachers")
                .delete()
                .eq("id", id);
            loadTeachers();
        }
    };


    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Teachers Management</h1>
                    <p className="text-slate-600 mt-1">Manage faculty members and their details</p>
                </div>
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
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Email Address</Label>
                                    <Input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Employee ID</Label>
                                    <Input
                                        value={formData.employee_id}
                                        onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Department</Label>
                                    <Select
                                        value={formData.department}
                                        onValueChange={(value) => setFormData({...formData, department: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select department" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {departments.map((dept) => (
                                                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Designation</Label>
                                    <Select
                                        value={formData.designation}
                                        onValueChange={(value) => setFormData({...formData, designation: value})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select designation" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {designations.map((designation) => (
                                                <SelectItem key={designation} value={designation}>{designation}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Hours/Week</Label>
                                    <Input
                                        type="number"
                                        value={formData.max_hours}
                                        onChange={(e) => setFormData({...formData, max_hours: parseInt(e.target.value)})}
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
                    </DialogContent>
                </Dialog>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                                <Input
                                    placeholder="Search teachers..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10"
                                />
                            </div>
                        </div>
                        <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                            <SelectTrigger className="w-[200px]">
                                <SelectValue placeholder="All Departments" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Departments</SelectItem>
                                {departments.map((dept) => (
                                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Teachers Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Teachers ({teachers.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Employee ID</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Designation</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Max Hours</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <AnimatePresence>
                                    {loading ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                Loading teachers...
                                            </TableCell>
                                        </TableRow>
                                    ) : teachers.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No teachers found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        teachers.map((teacher, index) => (
                                            <motion.tr
                                                key={teacher.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-slate-50"
                                            >
                                                <TableCell>
                                                    <div className="font-medium">{teacher?.name}</div>
                                                </TableCell>
                                                <TableCell>{teacher?.employee_id}</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                                                        {teacher?.department}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{teacher?.designation}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Mail className="w-3 h-3 text-slate-400" />
                                                        {teacher?.email}
                                                    </div>
                                                </TableCell>
                                                <TableCell>{teacher?.max_hours} hrs</TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit("teacher")}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(teacher?.id)}
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
        </div>
    );
}

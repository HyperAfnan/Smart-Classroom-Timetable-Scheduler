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
    GraduationCap, 
    Users, 
    Calendar,
    Edit,
    Trash2,
    Search,
    Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase.js";

const departments = [
    "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology", 
    "English", "History", "Economics", "Business", "Engineering"
];

export default function Classes() {
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedDepartment, setSelectedDepartment] = useState("all");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingClass, setEditingClass] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        department: "",
        semester: 1,
        section: "A",
        students_count: 30,
        academic_year: "2024-25",
        subjects: [],
        class_coordinator: ""
    });

    useEffect(() => {
        loadClasses();
    }, []);

    const loadClasses = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from("classes")
            .select("*");
        if (error) {
            setClasses([]);
        } else {
            setClasses(data);
        }
        setLoading(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (editingClass) {
            await supabase.from("classes").update(formData).eq("id", editingClass.id);
        } else {
            await supabase.from("classes").insert([formData]);
        }
        resetForm();
        loadClasses();
    };

    const resetForm = () => {
        setFormData({
            name: "",
            department: "",
            semester: 1,
            section: "A",
            students_count: 30,
            academic_year: "2024-25",
            subjects: [],
            class_coordinator: ""
        });
        setEditingClass(null);
        setIsDialogOpen(false);
    };

    const handleEdit = (classItem) => {
        setFormData(classItem);
        setEditingClass(classItem);
        setIsDialogOpen(true);
    };

    const handleDelete = async (id) => {
        if (confirm("Are you sure you want to delete this class?")) {
            await supabase.from("classes").delete().eq("id", id);
            loadClasses();
        }
    };

    const filteredClasses = classes.filter(classItem => {
        const matchesSearch =
            (classItem.name && classItem.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (classItem.section && classItem.section.toLowerCase().includes(searchTerm.toLowerCase()));
        const matchesDepartment = selectedDepartment === "all" || classItem.department === selectedDepartment;
        return matchesSearch && matchesDepartment;
    });

    return (
        <div className="p-6 space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Classes Management</h1>
                    <p className="text-slate-600 mt-1">Manage student classes and sections</p>
                </div>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogTrigger asChild>
                        <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>
                                {editingClass ? "Edit Class" : "Add New Class"}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Class Name</Label>
                                    <Input
                                        value={formData.name}
                                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        required
                                        placeholder="e.g., CS-A1, MATH-B2"
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
                                    <Label>Semester</Label>
                                    <Select
                                        value={formData.semester.toString()}
                                        onValueChange={(value) => setFormData({...formData, semester: parseInt(value)})}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select semester" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {[1,2,3,4,5,6,7,8].map((sem) => (
                                                <SelectItem key={sem} value={sem.toString()}>Semester {sem}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Section</Label>
                                    <Input
                                        value={formData.section}
                                        onChange={(e) => setFormData({...formData, section: e.target.value})}
                                        required
                                        placeholder="A, B, C, etc."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Students Count</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={formData.students_count}
                                        onChange={(e) => setFormData({...formData, students_count: parseInt(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Academic Year</Label>
                                    <Input
                                        value={formData.academic_year}
                                        onChange={(e) => setFormData({...formData, academic_year: e.target.value})}
                                        required
                                        placeholder="e.g., 2024-25"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button type="button" variant="outline" onClick={resetForm}>
                                    Cancel
                                </Button>
                                <Button type="submit">
                                    {editingClass ? "Update Class" : "Add Class"}
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
                                    placeholder="Search classes..."
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

            {/* Classes Table */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <GraduationCap className="w-5 h-5" />
                        Classes ({filteredClasses.length})
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Class Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Semester</TableHead>
                                    <TableHead>Section</TableHead>
                                    <TableHead>Students</TableHead>
                                    <TableHead>Academic Year</TableHead>
                                    <TableHead>Actions</TableHead>
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
                                    ) : filteredClasses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={7} className="text-center py-8">
                                                No classes found
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        filteredClasses.map((classItem, index) => (
                                            <motion.tr
                                                key={classItem.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: -20 }}
                                                transition={{ delay: index * 0.05 }}
                                                className="hover:bg-slate-50"
                                            >
                                                <TableCell>
                                                    <div className="font-medium">{classItem.name}</div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                                                        {classItem.department}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3 text-slate-400" />
                                                        Sem {classItem.semester}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200">
                                                        Section {classItem.section}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Users className="w-3 h-3 text-slate-400" />
                                                        {classItem.students_count}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-1">
                                                        <Building className="w-3 h-3 text-slate-400" />
                                                        {classItem.academic_year}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleEdit(classItem)}
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleDelete(classItem.id)}
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

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  Users,
  Mail,
  Edit,
  Trash2,
  Search,
  Upload,
  FileSpreadsheet,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import useTeacherMutations from "../hooks/useTeacherMutations";

function TeachersTable({ teachers, loading, onEdit }) {
  const {  deleteTeacherAsync } = useTeacherMutations();

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this teacher?")) {
      await deleteTeacherAsync(id);
    }
  };

  return (
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
                      <TableCell>{teacher?.emp_id}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className="bg-blue-50 text-blue-700 border-blue-200"
                        >
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
                            onClick={() => onEdit(teacher)}
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
  );
}

export default TeachersTable;

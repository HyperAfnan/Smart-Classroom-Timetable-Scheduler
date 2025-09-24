import React from "react";
import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Code, Clock, GraduationCap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { colors } from "../constants";

const getTypeColor = (type) => {
  return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
};

export default function SubjectsTable({ subjects, loading, onEdit, onDelete }) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
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
                >
                  <TableCell>{subject.subject_name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Code className="w-3 h-3 text-slate-400" />
                      {subject.subject_code}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      {subject.department}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <GraduationCap className="w-3 h-3 text-slate-400" />
                      {subject.semester}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={getTypeColor(subject.type)}>
                      {subject.type}
                    </Badge>
                  </TableCell>
                  <TableCell>{subject.credits}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {subject.hours_per_week}h
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => onEdit(subject)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(subject.id)}
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
  );
}

/**
 * DEPRECATED COMPONENT: ClassesTable
 *
 * This component has been replaced by the inline editing version: InlineClassesTable.
 * It is retained temporarily for backward compatibility and will be removed in a future cleanup.
 * Please migrate any remaining usages to InlineClassesTable.
 */
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
import { Edit, Trash2, Users, Calendar, Building } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";

export default function ClassesTable({ classes, loading, onEdit, onDelete }) {
  if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
    // eslint-disable-next-line no-console
    console.warn("ClassesTable is deprecated. Use InlineClassesTable instead.");
  }
  return (
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
            ) : classes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8">
                  No classes found
                </TableCell>
              </TableRow>
            ) : (
              classes.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: i * 0.05 }}
                  className="hover:bg-slate-50"
                >
                  <TableCell>{c.class_name}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-orange-50 text-orange-700 border-orange-200"
                    >
                      {c.department}
                    </Badge>
                  </TableCell>
                  <TableCell>Sem {c.semester}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className="bg-slate-50 text-slate-700 border-slate-200"
                    >
                      {c.section}
                    </Badge>
                  </TableCell>
                  <TableCell>{c.students}</TableCell>
                  <TableCell>{c.academic_year}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEdit(c)}
                      >
                        <Edit className="w-3 h-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onDelete(c.id)}
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

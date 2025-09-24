import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TYPE_COLORS } from "../constants";
import { Button } from "@/components/ui/button";

export function RoomsTable({ rooms, loading, onEdit, onDelete }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" /> Rooms ({rooms.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Room</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">Loading rooms...</TableCell>
                  </TableRow>
                ) : rooms.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">No rooms found</TableCell>
                  </TableRow>
                ) : (
                  rooms.map((room, index) => (
                    <motion.tr
                      key={room.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-slate-50"
                    >
                      <TableCell>
                        <div className="font-medium">{room.room_number}</div>
                        {room.name && <div className="text-xs text-slate-500 mt-1">{room.name}</div>}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={TYPE_COLORS[room.room_type] || "bg-gray-50 text-gray-700 border-gray-200"}>
                          {room.room_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-slate-400" /> {room.capacity}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => onEdit(room)}>
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" onClick={() => onDelete(room.id)}>
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

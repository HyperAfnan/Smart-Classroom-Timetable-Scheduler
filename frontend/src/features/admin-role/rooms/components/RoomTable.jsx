import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, Users, MapPin, Plus, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
const __keepMotion = motion;
import { TYPE_COLORS, ROOM_TYPES } from "../constants";
import { Button } from "@/components/ui/button";
import { useRooms } from "../hooks/useRoom";
import { useForm, Controller } from "react-hook-form";
import RoomExcelUploader from "./RoomExcelUploader";
import { toast } from "react-toastify";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * Inline editable Rooms table (mirrors Teachers table UX):
 * - Inline creation row
 * - Inline editing row
 * - Hover-only action buttons (edit/delete)
 * - Excel upload button
 * - react-hook-form validation
 *
 * Props:
 *  rooms (filtered array provided by parent for search/filter)
 *  loading (boolean)
 *
 * Parent can keep passing onEdit/onDelete (ignored now) for backward compat.
 */
export function RoomsTable({ rooms, loading }) {
  const { createRoomAsync, updateRoomAsync, deleteRoomAsync } = useRooms();

  const [hoveredRowId, setHoveredRowId] = useState(null);
  const [renderNewRow, setRenderNewRow] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  // Creation form
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm();

  // Editing form
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: resetEditForm,
    control: editControl,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm();

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await deleteRoomAsync(id);
      toast.success("Room deleted successfully!");
    } catch (err) {
      toast.error(`Delete failed: ${err?.message || err}`);
    }
  };

  const handleEditClick = (room) => {
    setEditingRoomId(room.id);
    setEditValue("room_number", room.room_number);
    setEditValue("room_type", room.room_type);
    setEditValue("capacity", room.capacity);
  };

  const onCreateSubmit = async (data) => {
    try {
      await createRoomAsync({
        room_number: data.room_number.trim(),
        room_type: data.room_type,
        capacity: parseInt(data.capacity, 10),
      });
      toast.success("Room created successfully!");
      reset();
      setRenderNewRow(false);
    } catch (err) {
      toast.error(`Create failed: ${err?.message || err}`);
    }
  };

  const onEditSubmit = async (data) => {
    try {
      await updateRoomAsync({
        id: editingRoomId,
        updates: {
          room_number: data.room_number.trim(),
          room_type: data.room_type,
          capacity: parseInt(data.capacity, 10),
        },
      });
      toast.success("Room updated successfully!");
      setEditingRoomId(null);
      resetEditForm();
    } catch (err) {
      toast.error(`Update failed: ${err?.message || err}`);
    }
  };

  if (
    (errors && Object.keys(errors).length) ||
    (editErrors && Object.keys(editErrors).length)
  ) {
    // Avoid spamming; just a generic toast
    // (Teachers table pattern)
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Rooms ({rooms.length})
          <div className="flex gap-2 ml-auto">
            <Button
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
              onClick={() => {
                setRenderNewRow(true);
                setEditingRoomId(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Room
            </Button>
            <RoomExcelUploader />
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table className="table-fixed w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[25%]">Room</TableHead>
                <TableHead className="w-[25%]">Type</TableHead>
                <TableHead className="w-[20%]">Capacity</TableHead>
                <TableHead className="w-[20%]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading rooms...
                    </TableCell>
                  </TableRow>
                ) : rooms.length === 0 && !renderNewRow ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No rooms found
                    </TableCell>
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
                      onMouseEnter={() => setHoveredRowId(room.id)}
                      onMouseLeave={() => setHoveredRowId(null)}
                    >
                      {editingRoomId === room.id ? (
                        <>
                          <TableCell>
                            <input
                              {...editRegister("room_number", {
                                required: true,
                              })}
                              className="w-full border px-2 py-1 rounded"
                              placeholder="Room Number"
                            />
                          </TableCell>
                          <TableCell>
                            <Controller
                              name="room_type"
                              control={editControl}
                              rules={{ required: true }}
                              render={({ field }) => (
                                <Select
                                  value={field.value}
                                  onValueChange={field.onChange}
                                >
                                  <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Type" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {ROOM_TYPES.map((t) => (
                                      <SelectItem key={t} value={t}>
                                        <Badge
                                          variant="outline"
                                          className="bg-blue-50 text-blue-700 border-blue-200"
                                        >
                                          {t}
                                        </Badge>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <input
                              type="number"
                              min="1"
                              {...editRegister("capacity", {
                                required: true,
                                min: 1,
                              })}
                              className="w-full border px-2 py-1 rounded"
                              placeholder="Capacity"
                            />
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  setEditingRoomId(null);
                                  resetEditForm();
                                }}
                              >
                                <X className="w-3 h-3" />
                              </Button>
                              <Button
                                size="sm"
                                className="bg-green-500 text-white"
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
                            <div className="font-medium">
                              {room.room_number}
                            </div>
                            {room.name && (
                              <div className="text-xs text-slate-500 mt-1">
                                {room.name}
                              </div>
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                TYPE_COLORS[room.room_type] ||
                                "bg-gray-50 text-gray-700 border-gray-200"
                              }
                            >
                              {room.room_type}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3 text-slate-400" />{" "}
                              {room.capacity}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {hoveredRowId === room.id ? (
                                <>
                                  <EditButton
                                    onClick={() => handleEditClick(room)}
                                  />
                                  <DeleteButton
                                    onClick={() => handleDelete(room.id)}
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
                    key="new-row"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                  >
                    <TableCell>
                      <input
                        type="text"
                        placeholder="Room Number"
                        className="w-full border px-2 py-1 rounded"
                        {...register("room_number", { required: true })}
                      />
                    </TableCell>
                    <TableCell>
                      <Controller
                        name="room_type"
                        control={control}
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Type" />
                            </SelectTrigger>
                            <SelectContent>
                              {ROOM_TYPES.map((t) => (
                                <SelectItem key={t} value={t}>
                                  <Badge
                                    variant="outline"
                                    className="bg-blue-50 text-blue-700 border-blue-200"
                                  >
                                    {t}
                                  </Badge>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </TableCell>
                    <TableCell>
                      <input
                        type="number"
                        placeholder="Capacity"
                        className="w-full border px-2 py-1 rounded"
                        {...register("capacity", { required: true, min: 1 })}
                        min="1"
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
                          className="bg-green-500 text-white"
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
      </CardContent>
    </Card>
  );
}

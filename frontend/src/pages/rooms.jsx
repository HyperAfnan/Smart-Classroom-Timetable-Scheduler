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
  MapPin,
  Users,
  Edit,
  Trash2,
  Search,
  FileUp,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/config/supabase";
import readXlsxFile from "read-excel-file";
import { Alert, AlertDescription } from "@/components/ui/alert";

const roomTypes = ["Lecture", "Lab"];

export default function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState({
    room_number: "",
    capacity: 30,
    room_type: "",
  });
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    loadRooms();
  }, []);

  const loadRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("room").select("*");
    console.log(data);
    if (error) {
      setRooms([]);
    } else {
      setRooms(data);
    }
    setLoading(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editingRoom) {
      await supabase.from("room").update(formData).eq("id", editingRoom.id);
    } else {
      await supabase.from("room").insert([formData]);
    }
    resetForm();
    loadRooms();
  };

  const resetForm = () => {
    setFormData({
      room_number: "",
      capacity: 30,
      room_type: "",
    });
    setEditingRoom(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (room) => {
    setFormData({
      ...room,
      room_type: room.room_type || room.type || "",
    });
    setEditingRoom(room);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this room?")) {
      await supabase.from("room").delete().eq("id", id);
      loadRooms();
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
      const requiredColumns = ["room_number", "capacity", "room_type"];

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
      const roomsToAdd = [];
      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // Skip empty rows
        if (row.every((cell) => cell === null || cell === "")) continue;

        const room = {
          room_number: String(row[columnMap["room_number"]] || ""),
          capacity: parseInt(row[columnMap["capacity"]]) || 30,
          room_type: row[columnMap["room_type"]] || "",
        };

        // Validate required fields
        if (!room.room_number || !room.room_type) {
          continue; // Skip rows with missing required fields
        }

        roomsToAdd.push(room);
      }

      if (roomsToAdd.length === 0) {
        setUploadError("No valid room data found in the file");
        setIsUploading(false);
        return;
      }

      // Insert rooms into database
      const { error } = await supabase.from("room").insert(roomsToAdd);

      if (error) {
        setUploadError(`Error uploading rooms: ${error.message}`);
      } else {
        alert(`Successfully imported ${roomsToAdd.length} rooms`);
        // Reset file input
        e.target.value = null;
        loadRooms();
      }
    } catch (error) {
      setUploadError(`Error processing file: ${error.message}`);
    }

    setIsUploading(false);
  };

  const filteredRooms = rooms.filter((room) => {
    const roomNumber = (room.room_number ?? "").toString().toLowerCase();
    const roomName = (room.name ?? "").toString().toLowerCase();
    const matchesSearch =
      roomNumber.includes(searchTerm.toLowerCase()) ||
      roomName.includes(searchTerm.toLowerCase());
    const matchesType =
      selectedType === "all" || room.room_type === selectedType;
    return matchesSearch && matchesType;
  });

  const getTypeColor = (type) => {
    const colors = {
      "Lecture Hall": "bg-blue-50 text-blue-700 border-blue-200",
      Lab: "bg-green-50 text-green-700 border-green-200",
    };
    return colors[type] || "bg-gray-50 text-gray-700 border-gray-200";
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            Rooms Management
          </h1>
          <p className="text-slate-600 mt-1">
            Manage classroom and facility resources
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
                <Plus className="w-4 h-4 mr-2" />
                Add Room
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingRoom ? "Edit Room" : "Add New Room"}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Room Number</Label>
                    <Input
                      value={formData.room_number}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          room_number: e.target.value,
                        })
                      }
                      required
                      placeholder="e.g., A101, Lab-B2"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Capacity</Label>
                    <Input
                      type="number"
                      min="1"
                      value={formData.capacity}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          capacity: parseInt(e.target.value),
                        })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Room Type</Label>
                    <Select
                      value={formData.room_type}
                      onValueChange={(value) =>
                        setFormData({ ...formData, room_type: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select room type" />
                      </SelectTrigger>
                      <SelectContent>
                        {roomTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-4">
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                  <Button type="submit">
                    {editingRoom ? "Update Room" : "Add Room"}
                  </Button>
                </div>
              </form>

              <div className="mt-6 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Bulk Import Rooms</h3>
                <p className="text-xs text-slate-500 mb-4">
                  Upload an Excel file (.xlsx) with room data. The file should
                  have columns: room_number, capacity, room_type.
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
              document.getElementById("roomExcelFileInput").click()
            }
            className="border-green-300 hover:bg-green-50"
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
            id="roomExcelFileInput"
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
                  placeholder="Search rooms..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="All Room Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Room Types</SelectItem>
                {roomTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Rooms Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Rooms ({filteredRooms.length})
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
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading rooms...
                      </TableCell>
                    </TableRow>
                  ) : filteredRooms.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No rooms found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRooms.map((room, index) => (
                      <motion.tr
                        key={room.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-slate-50"
                      >
                        <TableCell>
                          <div className="font-medium">{room.room_number}</div>
                          {room.name && (
                            <div className="text-xs text-slate-500 mt-1">
                              {room.name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant="outline"
                            className={getTypeColor(room.room_type)}
                          >
                            {room.room_type}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3 text-slate-400" />
                            {room.capacity}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(room)}
                            >
                              <Edit className="w-3 h-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleDelete(room.id)}
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

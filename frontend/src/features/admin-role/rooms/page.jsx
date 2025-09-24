import React, { useState, useMemo } from "react";
import { useRooms } from "./hooks/useRoom";
import { RoomFilters } from "./components/Filter";
import { RoomFormDialog } from "./components/RoomFormDialog";
import { RoomsTable } from "./components/RoomTable";
import { toast } from "react-toastify";
import { ROOM_DEFAULTS } from "./constants";

export default function RoomsPage() {
  const {
    rooms,
    isLoading,
    createRoomAsync,
    updateRoomAsync,
    deleteRoomAsync,
    isSubmitting,
  } = useRooms();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [formData, setFormData] = useState(ROOM_DEFAULTS);

  const resetForm = () => {
    setFormData(ROOM_DEFAULTS);
    setEditingRoom(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (room) => {
    setFormData({ ...room, room_type: room.room_type || "" });
    setEditingRoom(room);
    setIsDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this room?")) return;
    try {
      await deleteRoomAsync(id);
      toast.success("Room deleted successfully!");
    } catch (err) {
      console.error("Error deleting room:", err?.message || err);
      toast.error("Failed to delete room. Please try again.");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    try {
      if (editingRoom) {
        await updateRoomAsync({ id: editingRoom.id, updates: formData });
        toast.success("Room updated successfully!");
      } else {
        await createRoomAsync(formData);
        toast.success("Room created successfully!");
      }
      resetForm();
    } catch (err) {
      console.error("Error saving room:", err?.message || err);
      toast.error("Failed to save room. Please try again.");
    }
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      const matchesSearch =
        (room.room_number ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (room.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || room.room_type === selectedType;
      return matchesSearch && matchesType;
    });
  }, [rooms, searchTerm, selectedType]);

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
        <RoomFormDialog
          isOpen={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          formData={formData}
          setFormData={setFormData}
          onSubmit={handleSubmit}
          resetForm={resetForm}
          editingRoom={editingRoom}
          isSubmitting={isSubmitting}
        />
      </div>

      <RoomFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <RoomsTable
        rooms={filteredRooms}
        loading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}

import React, { useState, useMemo } from "react";
import { useRooms } from "./hooks/useRoom";
import { RoomFilters } from "./components/Filter";
import { RoomsTable } from "./components/RoomTable";

export default function RoomsPage() {
  const { rooms, isLoading } = useRooms();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");

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
      </div>

      <RoomFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
      />

      <RoomsTable rooms={filteredRooms} loading={isLoading} />
    </div>
  );
}

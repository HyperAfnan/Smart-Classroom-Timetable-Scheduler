import { useState, useMemo } from "react";
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
        (room.roomNumber ?? "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        (room.name ?? "").toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType =
        selectedType === "all" || room.roomType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [rooms, searchTerm, selectedType]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Rooms Management
            </h1>
            <p className="text-muted-foreground mt-1">
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
    </div>
  );
}

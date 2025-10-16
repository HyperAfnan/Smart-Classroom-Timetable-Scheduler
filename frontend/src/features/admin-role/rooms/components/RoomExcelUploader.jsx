import React, { useState } from "react";
import readXlsxFile from "read-excel-file";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileUp, Loader2, AlertCircle } from "lucide-react";
import { ROOM_REQUIRED_COLUMNS, ROOM_TYPES } from "../constants";
import { useRooms } from "../hooks/useRoom";
import { toast } from "react-toastify";

/**
 * RoomExcelUploader
 *
 * Features:
 * - Validates presence of required columns: room_number, capacity, room_type
 * - Accepts optional "name" column if present
 * - Creates new rooms or updates existing rooms (matched by room_number, case-insensitive)
 * - Displays aggregated success + error feedback
 *
 * Usage:
 *   <RoomExcelUploader />
 */
export default function RoomExcelUploader() {
  const { rooms, createRoomAsync, updateRoomAsync } = useRooms();
  const [uploadError, setUploadError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const handleExcelUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const rows = await readXlsxFile(file);
      if (!rows.length) {
        setUploadError("The file appears to be empty.");
        setIsUploading(false);
        return;
      }

      const headers = rows[0];
      const headerLower = headers.map((h) =>
        h && typeof h === "string" ? h.trim().toLowerCase() : "",
      );

      // Validate required columns
      const missing = ROOM_REQUIRED_COLUMNS.filter(
        (col) => !headerLower.includes(col.toLowerCase()),
      );
      if (missing.length > 0) {
        setUploadError(`Missing required columns: ${missing.join(", ")}`);
        setIsUploading(false);
        return;
      }

      // Optional column support
      const hasName = headerLower.includes("name");

      // Build header index map
      const colIndex = {};
      headerLower.forEach((h, idx) => {
        if (h) colIndex[h] = idx;
      });

      const toCreate = [];
      const toUpdate = [];

      for (let i = 1; i < rows.length; i++) {
        const row = rows[i];

        // Skip blank lines
        if (!row || row.every((cell) => cell === null || cell === "")) continue;

        const rawRoomNumber = row[colIndex["room_number"]];
        const rawCapacity = row[colIndex["capacity"]];
        const rawType = row[colIndex["room_type"]];
        const rawName = hasName ? row[colIndex["name"]] : undefined;

        // Basic validation
        if (!rawRoomNumber || !rawType || (!rawCapacity && rawCapacity !== 0)) {
          // Skip invalid row silently
          continue;
        }

        const capacity = parseInt(rawCapacity, 10);
        if (isNaN(capacity) || capacity <= 0) {
          // Skip invalid capacity silently
          continue;
        }

        const room_type = String(rawType).trim();
        if (!ROOM_TYPES.includes(room_type)) {
          // Skip unknown room type
          continue;
        }

        const room_number = String(rawRoomNumber).trim();
        const roomPayload = {
          room_number,
          capacity,
          room_type,
        };

        if (hasName && rawName) {
          roomPayload.name = String(rawName).trim();
        }

        // Match existing by room_number (case-insensitive)
        const existing = rooms.find(
          (r) => r.room_number?.toLowerCase() === room_number.toLowerCase(),
        );

        if (existing) {
          toUpdate.push({ id: existing.id, updates: roomPayload });
        } else {
          toCreate.push(roomPayload);
        }
      }

      if (toCreate.length === 0 && toUpdate.length === 0) {
        setUploadError("No valid room rows found to import.");
        setIsUploading(false);
        return;
      }

      let createdCount = 0;
      let updatedCount = 0;
      const errorMessages = [];

      // Sequential to keep DB load simpler (could be Promise.allSettled if desired)
      for (const room of toCreate) {
        try {
          await createRoomAsync(room);
          createdCount++;
        } catch (err) {
          errorMessages.push(
            `Create error for ${room.room_number}: ${err?.message || err}`,
          );
        }
      }

      for (const { id, updates } of toUpdate) {
        try {
          await updateRoomAsync({ id, updates });
          updatedCount++;
        } catch (err) {
          errorMessages.push(
            `Update error for ${updates.room_number}: ${err?.message || err}`,
          );
        }
      }

      if (errorMessages.length > 0) {
        setUploadError(errorMessages.join("\n"));
      }

      if (createdCount || updatedCount) {
        toast.success(
          `Import complete: ${createdCount} created, ${updatedCount} updated.`,
        );
      }

      // Reset file input to allow re-uploading the same file if desired
      e.target.value = null;
    } catch (err) {
      setUploadError(`Error processing file: ${err?.message || String(err)}`);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <Button
        variant="outline"
        onClick={() => document.getElementById("roomExcelFileInput").click()}
        disabled={isUploading}
        className="border-border hover:bg-accent hover:text-accent-foreground transition-colors"
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

      {uploadError && (
        <Alert
          variant="destructive"
          className="mt-4 whitespace-pre-wrap bg-destructive/10 text-destructive border border-destructive/30 dark:bg-destructive/20"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

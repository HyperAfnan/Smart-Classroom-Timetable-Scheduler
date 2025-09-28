import React from "react";
/**
 * DEPRECATED COMPONENT (RoomFormDialog)
 *
 * This dialog-based form was originally used for creating and editing rooms.
 * The Rooms feature now supports:
 *   - Inline creation (new row) in RoomsTable
 *   - Inline editing (row transforms into editable inputs)
 *   - Excel bulk import via RoomExcelUploader
 *
 * This component is retained temporarily for backward compatibility and may be removed
 * in a future cleanup. Prefer using the inline UX instead of this dialog.
 */
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { ROOM_TYPES } from "../constants";

export function RoomFormDialog({
  isOpen,
  onOpenChange,
  formData,
  setFormData,
  onSubmit,
  resetForm,
  editingRoom,
  isSubmitting,
}) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700">
          <Plus className="w-4 h-4 mr-2" /> Add Room
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {editingRoom ? "Edit Room" : "Add New Room"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input
                placeholder="e.g., A101, Lab-B2"
                value={formData.room_number}
                onChange={(e) =>
                  setFormData({ ...formData, room_number: e.target.value })
                }
                required
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
                  {ROOM_TYPES.map((type) => (
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
            <Button type="submit" disabled={isSubmitting}>
              {editingRoom ? "Update Room" : "Add Room"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

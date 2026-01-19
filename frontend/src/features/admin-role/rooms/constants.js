export const ROOM_TYPES = ["Lecture", "Lab"];

export const TYPE_COLORS = {
  Lecture: "bg-blue-50 text-blue-700 border-blue-200",
  Lab: "bg-green-50 text-green-700 border-green-200",
};

export const ROOM_DEFAULTS = {
  roomNumber: "",
  capacity: 1,
  roomType: "",
};

export const ROOM_REQUIRED_COLUMNS = ["roomNumber", "capacity", "roomType"];

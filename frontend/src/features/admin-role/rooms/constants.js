export const ROOM_TYPES = ["Lecture", "Lab"];

export const TYPE_COLORS = {
  Lecture: "bg-blue-50 text-blue-700 border-blue-200",
  Lab: "bg-green-50 text-green-700 border-green-200",
};

export const ROOM_DEFAULTS = {
  room_number: "",
  capacity: 1,
  room_type: "",
};

export const ROOM_REQUIRED_COLUMNS = ["room_number", "capacity", "room_type"];

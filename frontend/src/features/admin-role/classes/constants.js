const departments = [
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Economics",
  "Business",
  "Engineering",
];

const ROOM_DEFAULT = {
  name: "",
  department: "",
  semester: 1,
  section: "A",
  students: 30,
  academicYear: "2024-25",
  subjects: [],
  class_coordinator: "",
};

const CLASS_DEFAULT = {
  className: "",
  department: "",
  semester: 1,
  section: "A",
  students: 30,
  academicYear: "2024-25",
  subjects: [],
  class_coordinator: "",
};

const CLASS_REQUIRED_COLUMNS = [
  "className",
  "department",
  "semester",
  "section",
  "students",
  "academicYear",
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export {
  departments,
  ROOM_DEFAULT,
  CLASS_DEFAULT,
  CLASS_REQUIRED_COLUMNS,
  semesters,
};

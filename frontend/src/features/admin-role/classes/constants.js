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
  academic_year: "2024-25",
  subjects: [],
  class_coordinator: "",
};

const CLASS_DEFAULT = {
  class_name: "",
  department: "",
  semester: 1,
  section: "A",
  students: 30,
  academic_year: "2024-25",
  subjects: [],
  class_coordinator: "",
};

const CLASS_REQUIRED_COLUMNS = [
  "class_name",
  "department",
  "semester",
  "section",
  "students",
  "academic_year",
];

const semesters = [1, 2, 3, 4, 5, 6, 7, 8];

export {
  departments,
  ROOM_DEFAULT,
  CLASS_DEFAULT,
  CLASS_REQUIRED_COLUMNS,
  semesters,
};

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Senior Lecturer",
];

const REQUIRED_COLUMNS = ["name", "email", "empId", "subjects", "designation"];

const queryKeys = {
  teachers: ["teachers"],
  departments: ["departments"],
};

const DEFAULT_TEACHER = {
  name: "",
  email: "",
  empId: "",
  designation: "",
  subjects: [],
  maxHours: 20,
};

const requiredColumns = [
  "name",
  "email",
  "empId",
  "subjects",
  "designation",
  "maxHours",
];

const columns = [
  { key: "name", label: "Name", width: "w-[20%]" },
  { key: "empId", label: "Employee ID", width: "w-[10%]" },
  { key: "subjects", label: "Subjects", width: "w-[15%]" },
  { key: "designation", label: "Designation", width: "w-[15%]" },
  { key: "email", label: "Email", width: "w-[20%]" },
  { key: "maxHours", label: "Max Hours", width: "w-[10%]" },
  { key: "actions", label: "", width: "w-[10%]" },
];

export {
  requiredColumns,
  DESIGNATIONS,
  REQUIRED_COLUMNS,
  queryKeys,
  DEFAULT_TEACHER,
  columns,
};

const DESIGNATIONS = [
  "Professor",
  "Associate Professor",
  "Assistant Professor",
  "Lecturer",
  "Senior Lecturer",
];

const REQUIRED_COLUMNS = [
  "name",
  "email",
  "emp_id",
  "subjects",
  "designation",
];

const queryKeys = {
  teachers: ["teachers"],
  departments: ["departments"],
};

const DEFAULT_TEACHER = {
  name: "",
  email: "",
  emp_id: "",
  designation: "",
  subjects: [],
  max_hours: 20,
};

const requiredColumns = [
  "name",
  "email",
  "emp_id",
  "subjects",
  "designation",
  "max_hours",
];

const columns = [
   { key: "name", label: "Name", width: "w-[20%]" },
   { key: "emp_id", label: "Employee ID", width: "w-[10%]" },
   { key: "subjects", label: "Subjects", width: "w-[15%]" },
   { key: "designation", label: "Designation", width: "w-[15%]" },
   { key: "email", label: "Email", width: "w-[20%]" },
   { key: "max_hours", label: "Max Hours", width: "w-[10%]" },
   { key: "actions", label: "", width: "w-[10%]" },
];


export {
  requiredColumns,
  DESIGNATIONS,
  REQUIRED_COLUMNS,
  queryKeys,
  DEFAULT_TEACHER,
   columns
};

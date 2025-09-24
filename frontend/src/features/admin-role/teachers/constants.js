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
  "department",
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
  department: "",
  designation: "",
  subjects: [],
  max_hours: 20,
};


export { DESIGNATIONS, REQUIRED_COLUMNS , queryKeys , DEFAULT_TEACHER };

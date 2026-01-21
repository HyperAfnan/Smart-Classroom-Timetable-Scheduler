const DEFAULT_SUBJECT = {
  subjectName: "",
  subjectCode: "",
  credits: 3,
  semester: 1,
  type: "Theory",
  hoursPerWeek: 3,
};

const colors = {
  Theory: "bg-blue-50 text-blue-700 border-blue-200",
  Lab: "bg-purple-50 text-purple-700 border-purple-200",
};

const subjectTypes = ["Theory", "Lab"];

const requiredColumns = [
  "subjectName",
  "subjectCode",
  "credits",
  "semester",
  "type",
  "hoursPerWeek",
];

const columns = [
  { key: "subjectName", label: "Name", width: "w-[18%]" },
  { key: "subjectCode", label: "Code", width: "w-[10%]" },
  { key: "department", label: "Department", width: "w-[15%]" },
  { key: "semester", label: "Semester", width: "w-[10%]" },
  { key: "type", label: "Type", width: "w-[12%]" },
  { key: "credits", label: "Credits", width: "w-[8%]" },
  { key: "hoursPerWeek", label: "Hours/Week", width: "w-[12%]" },
  { key: "actions", label: "", width: "w-[10%]" },
];

export { DEFAULT_SUBJECT, subjectTypes, colors, requiredColumns, columns };

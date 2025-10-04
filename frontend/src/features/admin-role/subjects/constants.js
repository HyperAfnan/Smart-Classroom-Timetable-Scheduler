const DEFAULT_SUBJECT = {
  subject_name: "",
  subject_code: "",
  credits: 3,
  semester: 1,
  type: "Theory",
  hours_per_week: 3,
};

const colors = {
  Theory: "bg-blue-50 text-blue-700 border-blue-200",
  Lab: "bg-purple-50 text-purple-700 border-purple-200",
};

const subjectTypes = ["Theory", "Lab"];

const requiredColumns = [
  "subject_name",
  "subject_code",
  "credits",
  "semester",
  "type",
  "hours_per_week",
];

const columns = [
  { key: "subject_name", label: "Name", width: "w-[18%]" },
  { key: "subject_code", label: "Code", width: "w-[10%]" },
  { key: "semester", label: "Semester", width: "w-[10%]" },
  { key: "type", label: "Type", width: "w-[12%]" },
  { key: "credits", label: "Credits", width: "w-[8%]" },
  { key: "hours_per_week", label: "Hours/Week", width: "w-[12%]" },
  { key: "actions", label: "", width: "w-[10%]" },
];

export { DEFAULT_SUBJECT, subjectTypes, colors, requiredColumns, columns };

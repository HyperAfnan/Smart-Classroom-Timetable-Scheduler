const DEFAULT_SUBJECT = {
  subject_name: "",
  subject_code: "",
  credits: 3,
  department: "",
  semester: 1,
  type: "Theory",
  hours_per_week: 3,
};
  const colors = {
    Theory: "bg-blue-50 text-blue-700 border-blue-200",
    Practical: "bg-green-50 text-green-700 border-green-200",
    Lab: "bg-purple-50 text-purple-700 border-purple-200",
    Seminar: "bg-orange-50 text-orange-700 border-orange-200",
    Project: "bg-red-50 text-red-700 border-red-200",
  };

const subjectTypes = ["Theory", "Practical", "Lab", "Seminar", "Project"];


export { DEFAULT_SUBJECT , subjectTypes, colors };

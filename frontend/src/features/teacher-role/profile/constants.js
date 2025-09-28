/**
 * Teacher Profile Feature Constants
 * Centralized initial data and option lists for the teacher profile.
 * This keeps the hook and components clean and makes it easy to plug in API data later.
 */

export const defaultProfileData = {
  firstName: "Jane",
  lastName: "Doe",
  title: "Dr.",
  email: "jane.doe@university.edu",
  phone: "+1 (555) 123-4567",
  department: "Mathematics",
  office: "Room 12B, Building A",
  specialization: "Applied Mathematics, Statistics",
  experience: "8 years",
  education: "Ph.D. in Mathematics, Stanford University",
  bio:
    "Passionate educator with expertise in calculus, statistics, and applied mathematics. Dedicated to making complex mathematical concepts accessible to students.",
  officeHours: "Monday & Thursday: 11:00 AM - 1:00 PM",
  researchInterests:
    "Optimization Theory, Statistical Modeling, Educational Technology",
}

export const defaultSubjects = [
  { name: "Calculus I", students: 42, semester: "Fall 2024" },
  { name: "Statistics", students: 35, semester: "Fall 2024" },
  { name: "Algebra II", students: 28, semester: "Fall 2024" },
]

export const titleOptions = ["Mr.", "Ms.", "Dr.", "Prof."]

/**
 * Utility to derive initials if you later accept arbitrary names.
 * Not currently used directly but handy for future avatar logic.
 */
export const getInitials = (firstName = "", lastName = "") =>
  `${firstName.charAt(0) || ""}${lastName.charAt(0) || ""}`.toUpperCase()

import React from "react"

/**
 * SubjectsList Component
 * Displays a list of currently taught subjects with student counts & semester info.
 *
 * Props:
 *  - subjects: Array<{ name: string, students: number, semester: string }>
 *
 * Future enhancements:
 *  - Add sorting / filtering (by semester, enrollment size)
 *  - Add clickable rows linking to subject detail
 *  - Add skeleton / loading state for async data
 *  - Convert to virtualized list if subject count becomes large
 */
const SubjectsList = ({ subjects = [] }) => {
  if (!Array.isArray(subjects)) {
    // Fail-soft: if consumers pass something unexpected
    return null
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Current Subjects
      </h3>
      {subjects.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="grid gap-4">
          {subjects.map((subject, idx) => (
            <li
              key={subject.name || idx}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors"
            >
              <div className="min-w-0">
                <p className="font-medium text-gray-800 truncate">
                  {subject.name || "Untitled"}
                </p>
                <p className="text-sm text-gray-600">
                  {subject.semester || "—"}
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-sm font-medium text-gray-800">
                  {typeof subject.students === "number"
                    ? `${subject.students} student${
                        subject.students === 1 ? "" : "s"
                      }`
                    : "—"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

const EmptyState = () => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-dashed border-gray-200">
    <p className="text-sm text-gray-500">
      No subjects assigned yet.
    </p>
  </div>
)

export default SubjectsList

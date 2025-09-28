import React from "react"

/**
 * AcademicInfo Component
 *
 * Displays and optionally edits academic-related profile fields.
 *
 * Props:
 *  - isEditing    : boolean
 *  - profileData  : persisted profile object
 *  - tempData     : draft profile object (used while editing)
 *  - updateField  : (field: string, value: any) => void
 *
 * Fields covered:
 *  - education
 *  - specialization
 *  - researchInterests
 *
 * Future enhancements:
 *  - Validation & inline error messages
 *  - Field-level helper text
 *  - Autosave / debounce logic
 *  - Split large text areas into tag editors (e.g. research interests)
 */
const AcademicInfo = ({
  isEditing,
  profileData,
  tempData,
  updateField,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Academic Information
      </h3>
      <div className="space-y-4">
        <Field
          label="Education"
          name="education"
          isEditing={isEditing}
          value={tempData.education}
          displayValue={profileData.education}
          onChange={v => updateField("education", v)}
        />
        <Field
          label="Specialization"
          name="specialization"
          isEditing={isEditing}
          value={tempData.specialization}
          displayValue={profileData.specialization}
          onChange={v => updateField("specialization", v)}
        />
        <TextareaField
          label="Research Interests"
          name="researchInterests"
          isEditing={isEditing}
          value={tempData.researchInterests}
          displayValue={profileData.researchInterests}
          onChange={v => updateField("researchInterests", v)}
          rows={3}
        />
      </div>
    </div>
  )
}

/* ---------- Internal Form Primitives (scoped) ---------- */

const baseInputClass =
  "w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"

const Label = ({ htmlFor, children }) => (
  <label
    htmlFor={htmlFor}
    className="block text-sm font-medium text-gray-700 mb-1"
  >
    {children}
  </label>
)

const Field = ({
  label,
  name,
  isEditing,
  value,
  displayValue,
  onChange,
  type = "text",
  placeholder,
}) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    {isEditing ? (
      <input
        id={name}
        name={name}
        type={type}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={baseInputClass}
        placeholder={placeholder || label}
        autoComplete="off"
      />
    ) : (
      <p className="text-gray-800">{displayValue || "—"}</p>
    )}
  </div>
)

const TextareaField = ({
  label,
  name,
  isEditing,
  value,
  displayValue,
  onChange,
  rows = 3,
  placeholder,
}) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    {isEditing ? (
      <textarea
        id={name}
        name={name}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={baseInputClass}
        placeholder={placeholder || label}
      />
    ) : (
      <p className="text-gray-800 whitespace-pre-line">
        {displayValue || "—"}
      </p>
    )}
  </div>
)

export default AcademicInfo

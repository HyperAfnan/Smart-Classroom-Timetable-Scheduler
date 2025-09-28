import React from "react"
import { titleOptions } from "../constants"

/**
 * PersonalInfo Component
 *
 * Renders the personal information section of the teacher profile with
 * editable fields when `isEditing` is true.
 *
 * Props:
 *  - isEditing    : boolean
 *  - profileData  : persisted profile object
 *  - tempData     : draft profile object (used while editing)
 *  - updateField  : (field: string, value: any) => void
 *
 * Future enhancements:
 *  - Validation (e.g. required fields, length constraints)
 *  - Error & helper text display per field
 *  - Field-level dirty indicators
 *  - Split out form primitives into shared UI library
 */

const PersonalInfo = ({
  isEditing,
  profileData,
  tempData,
  updateField,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Personal Information
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="First Name"
          name="firstName"
          isEditing={isEditing}
          value={tempData.firstName}
          displayValue={profileData.firstName}
          onChange={v => updateField("firstName", v)}
        />
        <Field
          label="Last Name"
          name="lastName"
          isEditing={isEditing}
          value={tempData.lastName}
          displayValue={profileData.lastName}
          onChange={v => updateField("lastName", v)}
        />
        <SelectField
          label="Title"
          name="title"
          isEditing={isEditing}
          value={tempData.title}
          displayValue={profileData.title}
          onChange={v => updateField("title", v)}
          options={titleOptions}
        />
        <Field
          label="Department"
          name="department"
          isEditing={isEditing}
          value={tempData.department}
          displayValue={profileData.department}
          onChange={v => updateField("department", v)}
        />
      </div>

      <div className="mt-4">
        <TextareaField
          label="Bio"
          name="bio"
          isEditing={isEditing}
          value={tempData.bio}
          displayValue={profileData.bio}
          onChange={v => updateField("bio", v)}
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
        placeholder={label}
        autoComplete="off"
      />
    ) : (
      <p className="text-gray-800">{displayValue || "—"}</p>
    )}
  </div>
)

const SelectField = ({
  label,
  name,
  isEditing,
  value,
  displayValue,
  onChange,
  options = [],
}) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    {isEditing ? (
      <select
        id={name}
        name={name}
        value={value || ""}
        onChange={e => onChange(e.target.value)}
        className={baseInputClass}
      >
        {options.map(opt => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
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
        placeholder={label}
      />
    ) : (
      <p className="text-gray-800 whitespace-pre-line">
        {displayValue || "—"}
      </p>
    )}
  </div>
)

export default PersonalInfo

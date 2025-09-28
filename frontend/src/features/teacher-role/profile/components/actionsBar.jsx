import { Edit, Save } from "lucide-react"
import React from "react"

/**
 * ActionsBar Component
 *
 * Renders contextual action buttons for the Teacher Profile page.
 * - When not editing: shows a single "Edit Profile" button.
 * - When editing: shows "Cancel" and "Save Changes" buttons.
 *
 * Props:
 *  - isEditing   : boolean        -> current editing state
 *  - onEdit      : () => void      -> invoked to enter edit mode
 *  - onCancel    : () => void      -> invoked to discard changes
 *  - onSave      : () => void      -> invoked to persist changes
 *  - disableSave : boolean         -> (optional) disables save button (e.g. not dirty or loading)
 *  - saving      : boolean         -> (optional) show saving state
 *
 * Usage example:
 * <ActionsBar
 *   isEditing={isEditing}
 *   onEdit={startEditing}
 *   onCancel={cancelEditing}
 *   onSave={saveChanges}
 *   disableSave={!isDirty}
 *   saving={isSaving}
 * />
 */

const ActionsBar = ({
  isEditing,
  onEdit,
  onCancel,
  onSave,
  disableSave = false,
  saving = false,
}) => {
  return (
    <div className="flex space-x-3">
      {isEditing ? (
        <>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={disableSave || saving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save Changes"}</span>
          </button>
        </>
      ) : (
        <button
          type="button"
            onClick={onEdit}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Edit className="h-4 w-4" />
          <span>Edit Profile</span>
        </button>
      )}
    </div>
  )
}

export default ActionsBar

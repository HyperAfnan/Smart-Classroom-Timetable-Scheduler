import { useState, useCallback } from "react"
import {
  defaultProfileData,
  defaultSubjects,
} from "../constants"

/**
 * useTeacherProfile
 * Encapsulates all teacher profile state & editing logic.
 * This separation keeps the page component focused on layout/composition.
 *
 * Future extension ideas:
 * - Integrate remote fetch (add loading/error state)
 * - Dirty state tracking (compare tempData vs profileData)
 * - Validation layer (return errors map)
 * - Async save with optimistic updates
 */
export const useTeacherProfile = () => {
  // Editing mode flag
  const [isEditing, setIsEditing] = useState(false)

  // Persisted profile data (source of truth)
  const [profileData, setProfileData] = useState(defaultProfileData)

  // Draft while editing
  const [tempData, setTempData] = useState(defaultProfileData)

  // Static subjects list (could later become dynamic / fetched)
  const [subjects] = useState(defaultSubjects)

  /**
   * Begin editing: clone current profile into draft state.
   */
  const startEditing = useCallback(() => {
    setTempData(profileData)
    setIsEditing(true)
  }, [profileData])

  /**
   * Cancel editing: discard draft and exit edit mode.
   */
  const cancelEditing = useCallback(() => {
    setTempData(profileData)
    setIsEditing(false)
  }, [profileData])

  /**
   * Save changes: commit draft to persisted profile and exit edit mode.
   * If you later make this async, return the promise and handle loading state.
   */
  const saveChanges = useCallback(() => {
    setProfileData(tempData)
    setIsEditing(false)
  }, [tempData])

  /**
   * Generic field updater for controlled inputs.
   * @param {string} field - key in the profile draft
   * @param {any} value - new value
   */
  const updateField = useCallback((field, value) => {
    setTempData(prev => ({ ...prev, [field]: value }))
  }, [])

  /**
   * Utility: determine if form is dirty (could drive disabling/enabling Save).
   */
  const isDirty = useCallback(() => {
    return Object.keys(profileData).some(
      key => profileData[key] !== tempData[key]
    )
  }, [profileData, tempData])

  return {
    // State
    isEditing,
    profileData,
    tempData,
    subjects,

    // Derived
    isDirty: isDirty(),

    // Actions
    startEditing,
    cancelEditing,
    saveChanges,
    updateField,
  }
}

export default useTeacherProfile

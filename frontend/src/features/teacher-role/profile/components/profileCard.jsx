import React from "react"
import { Camera, Clock, Book } from "lucide-react"
import { getInitials } from "../constants"

/**
 * ProfileCard
 * Displays avatar (initials), name, department, experience, subject count, and optional office hours.
 * The avatar change button is only visible while editing (future hook-up point for upload logic).
 *
 * Props:
 *  - profileData: object containing profile fields
 *  - subjects: array of subject objects (default: [])
 *  - isEditing: boolean flag controlling avatar edit button visibility
 */
const ProfileCard = ({ profileData, subjects = [], isEditing }) => {
  const initials = getInitials(profileData.firstName, profileData.lastName)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="text-center">
        <div className="relative mx-auto w-24 h-24 mb-4">
          <div
            className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center"
            aria-label={`${profileData.firstName} ${profileData.lastName} avatar`}
          >
            <span className="text-2xl font-bold text-white">{initials}</span>
          </div>
          {isEditing && (
            <button
              type="button"
              className="absolute bottom-0 right-0 p-1.5 bg-gray-800 text-white rounded-full hover:bg-gray-700 transition-colors"
              title="Change photo"
              onClick={() => {
                // Placeholder for future avatar upload handler
              }}
            >
              <Camera className="h-3 w-3" />
            </button>
          )}
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          {profileData.title} {profileData.firstName} {profileData.lastName}
        </h2>
        <p className="text-gray-600 mt-1">
          {profileData.department} Department
        </p>
        <div className="flex items-center justify-center space-x-4 mt-4 text-sm text-gray-600">
          <div className="flex items-center space-x-1">
            <Clock className="h-4 w-4" />
            <span>{profileData.experience}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Book className="h-4 w-4" />
            <span>{subjects.length} Subjects</span>
          </div>
        </div>
        {profileData.officeHours && (
          <p className="mt-4 text-xs text-gray-500">
            Office Hours: {profileData.officeHours}
          </p>
        )}
      </div>
    </div>
  )
}

export default ProfileCard

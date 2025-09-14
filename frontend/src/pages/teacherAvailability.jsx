import React, { useState } from "react"
import {
  Calendar,
  Clock,
  Plus,
  Trash2,
  AlertTriangle,
  CheckCircle
} from "lucide-react"

const TeacherAvailability = () => {
  const [activeTab, setActiveTab] = useState("preferences")
  const [showAddModal, setShowAddModal] = useState(false)
  const [newPreference, setNewPreference] = useState({
    day: "",
    timeSlot: "",
    type: "unavailable",
    reason: ""
  })

  const [timePreferences, setTimePreferences] = useState([
    {
      id: "1",
      day: "Monday",
      timeSlot: "8:00 AM",
      type: "unavailable",
      reason: "Personal commitment"
    },
    {
      id: "2",
      day: "Friday",
      timeSlot: "4:00 PM - 5:00 PM",
      type: "preferred",
      reason: "End of week preference"
    },
    {
      id: "3",
      day: "Wednesday",
      timeSlot: "12:00 PM - 1:00 PM",
      type: "avoid",
      reason: "Lunch break preference"
    }
  ])

  const [leaveRequests, setLeaveRequests] = useState([
    {
      id: "1",
      date: "2024-12-25",
      type: "full-day",
      reason: "Christmas Holiday",
      status: "approved"
    },
    {
      id: "2",
      date: "2024-12-31",
      type: "partial",
      startTime: "2:00 PM",
      endTime: "5:00 PM",
      reason: "New Year preparation",
      status: "pending"
    }
  ])

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]
  const timeSlots = [
    "8:00 AM",
    "9:00 AM",
    "10:00 AM",
    "11:00 AM",
    "12:00 PM",
    "1:00 PM",
    "2:00 PM",
    "3:00 PM",
    "4:00 PM",
    "5:00 PM"
  ]

  const handleAddPreference = () => {
    if (newPreference.day && newPreference.timeSlot && newPreference.reason) {
      const preference = {
        id: Date.now().toString(),
        ...newPreference
      }
      setTimePreferences([...timePreferences, preference])
      setNewPreference({
        day: "",
        timeSlot: "",
        type: "unavailable",
        reason: ""
      })
      setShowAddModal(false)
    }
  }

  const handleDeletePreference = id => {
    setTimePreferences(timePreferences.filter(pref => pref.id !== id))
  }

  const getPreferenceColor = type => {
    switch (type) {
      case "unavailable":
        return "bg-red-50 text-red-700 border-red-200"
      case "preferred":
        return "bg-green-50 text-green-700 border-green-200"
      case "avoid":
        return "bg-yellow-50 text-yellow-700 border-yellow-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  const getStatusColor = status => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Availability Management
          </h1>
          <p className="text-gray-600 mt-1">
            Set your teaching preferences and request time off
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Add Preference</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("preferences")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "preferences"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Time Preferences
            </button>
            <button
              onClick={() => setActiveTab("leaves")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "leaves"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Leave Requests
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === "preferences" && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {timePreferences.map(preference => (
                  <div
                    key={preference.id}
                    className={`p-4 rounded-lg border ${getPreferenceColor(
                      preference.type
                    )} flex items-center justify-between`}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <p className="font-medium">{preference.day}</p>
                        <p className="text-sm opacity-75">
                          {preference.timeSlot}
                        </p>
                      </div>
                      <div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize">
                          {preference.type}
                        </span>
                        <p className="text-sm mt-1 opacity-75">
                          {preference.reason}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDeletePreference(preference.id)}
                      className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>

              {timePreferences.length === 0 && (
                <div className="text-center py-12">
                  <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No preferences set
                  </h3>
                  <p className="text-gray-500">
                    Add your time preferences to help optimize your schedule
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === "leaves" && (
            <div className="space-y-4">
              <div className="grid gap-4">
                {leaveRequests.map(request => (
                  <div
                    key={request.id}
                    className="p-4 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Calendar className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-800">
                            {new Date(request.date).toLocaleDateString(
                              "en-US",
                              {
                                weekday: "long",
                                year: "numeric",
                                month: "long",
                                day: "numeric"
                              }
                            )}
                          </p>
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <span className="capitalize">{request.type}</span>
                            {request.type === "partial" && (
                              <span>
                                ({request.startTime} - {request.endTime})
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {request.reason}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                            request.status
                          )}`}
                        >
                          {request.status === "approved" && (
                            <CheckCircle className="h-3 w-3 mr-1" />
                          )}
                          {request.status === "pending" && (
                            <Clock className="h-3 w-3 mr-1" />
                          )}
                          {request.status === "rejected" && (
                            <AlertTriangle className="h-3 w-3 mr-1" />
                          )}
                          {request.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {leaveRequests.length === 0 && (
                <div className="text-center py-12">
                  <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    No leave requests
                  </h3>
                  <p className="text-gray-500">
                    Your leave requests will appear here
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Preference Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Add Time Preference
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Day
                </label>
                <select
                  value={newPreference.day}
                  onChange={e =>
                    setNewPreference({ ...newPreference, day: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a day</option>
                  {days.map(day => (
                    <option key={day} value={day}>
                      {day}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={newPreference.timeSlot}
                  onChange={e =>
                    setNewPreference({
                      ...newPreference,
                      timeSlot: e.target.value
                    })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select a time slot</option>
                  {timeSlots.map(slot => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newPreference.type}
                  onChange={e =>
                    setNewPreference({ ...newPreference, type: e.target.value })
                  }
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="unavailable">Unavailable</option>
                  <option value="preferred">Preferred</option>
                  <option value="avoid">Prefer to Avoid</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Reason
                </label>
                <input
                  type="text"
                  value={newPreference.reason}
                  onChange={e =>
                    setNewPreference({
                      ...newPreference,
                      reason: e.target.value
                    })
                  }
                  placeholder="Enter reason for this preference"
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddPreference}
                className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add Preference
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherAvailability

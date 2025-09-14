import React, { useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Clock,
  MapPin,
  Users
} from "lucide-react"

const TeacherSchedule = () => {
  const [currentWeek, setCurrentWeek] = useState(0)
  const [viewType, setViewType] = useState("week")

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

  const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

  const schedule = {
    Monday: [
      {
        time: "9:00 AM",
        subject: "Calculus I",
        room: "Room 301",
        students: 42,
        duration: 1
      },
      {
        time: "11:00 AM",
        subject: "Office Hours",
        room: "Office 12B",
        students: null,
        duration: 2
      },
      {
        time: "2:00 PM",
        subject: "Statistics",
        room: "Lab A",
        students: 28,
        duration: 1
      }
    ],
    Tuesday: [
      {
        time: "10:00 AM",
        subject: "Algebra II",
        room: "Room 205",
        students: 35,
        duration: 1
      },
      {
        time: "2:00 PM",
        subject: "Calculus I",
        room: "Room 301",
        students: 42,
        duration: 1
      },
      {
        time: "4:00 PM",
        subject: "Faculty Meeting",
        room: "Conference Room",
        students: null,
        duration: 1
      }
    ],
    Wednesday: [
      {
        time: "9:00 AM",
        subject: "Statistics",
        room: "Lab A",
        students: 28,
        duration: 2
      },
      {
        time: "1:00 PM",
        subject: "Algebra II",
        room: "Room 205",
        students: 35,
        duration: 1
      }
    ],
    Thursday: [
      {
        time: "10:00 AM",
        subject: "Calculus I",
        room: "Room 301",
        students: 42,
        duration: 1
      },
      {
        time: "11:00 AM",
        subject: "Office Hours",
        room: "Office 12B",
        students: null,
        duration: 2
      },
      {
        time: "3:00 PM",
        subject: "Statistics",
        room: "Lab A",
        students: 28,
        duration: 1
      }
    ],
    Friday: [
      {
        time: "9:00 AM",
        subject: "Algebra II",
        room: "Room 205",
        students: 35,
        duration: 1
      },
      {
        time: "11:00 AM",
        subject: "Calculus I",
        room: "Room 301",
        students: 42,
        duration: 1
      }
    ]
  }

  const getWeekDates = weekOffset => {
    const today = new Date()
    const monday = new Date(
      today.setDate(today.getDate() - today.getDay() + 1 + weekOffset * 7)
    )
    return days.map((_, index) => {
      const date = new Date(monday)
      date.setDate(monday.getDate() + index)
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric"
      })
    })
  }

  const weekDates = getWeekDates(currentWeek)

  const getClassAtTimeSlot = (day, timeSlot) => {
    const daySchedule = schedule[day] || []
    return daySchedule.find(class_ => class_.time === timeSlot)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">My Schedule</h1>
          <p className="text-gray-600 mt-1">
            View and manage your teaching schedule
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewType("week")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === "week"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setViewType("day")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                viewType === "day"
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              Day
            </button>
          </div>
        </div>
      </div>

      {/* Week Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setCurrentWeek(currentWeek - 1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </button>
          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-800">
              {currentWeek === 0
                ? "This Week"
                : currentWeek > 0
                ? `${currentWeek} Week${currentWeek > 1 ? "s" : ""} Ahead`
                : `${Math.abs(currentWeek)} Week${
                    Math.abs(currentWeek) > 1 ? "s" : ""
                  } Ago`}
            </h2>
            <p className="text-sm text-gray-600">
              {weekDates[0]} - {weekDates[4]}
            </p>
          </div>
          <button
            onClick={() => setCurrentWeek(currentWeek + 1)}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Schedule Grid */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="grid grid-cols-6 border-b border-gray-200">
          <div className="p-4 bg-gray-50 border-r border-gray-200">
            <span className="text-sm font-medium text-gray-600">Time</span>
          </div>
          {days.map((day, index) => (
            <div
              key={day}
              className="p-4 bg-gray-50 border-r border-gray-200 last:border-r-0"
            >
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800">{day}</p>
                <p className="text-xs text-gray-600 mt-1">{weekDates[index]}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="divide-y divide-gray-200">
          {timeSlots.map(timeSlot => (
            <div key={timeSlot} className="grid grid-cols-6 min-h-16">
              <div className="p-4 bg-gray-50 border-r border-gray-200 flex items-center">
                <span className="text-sm font-medium text-gray-600">
                  {timeSlot}
                </span>
              </div>
              {days.map(day => {
                const classInfo = getClassAtTimeSlot(day, timeSlot)
                return (
                  <div
                    key={`${day}-${timeSlot}`}
                    className="border-r border-gray-200 last:border-r-0 p-2"
                  >
                    {classInfo && (
                      <div
                        className={`p-3 rounded-lg ${
                          classInfo.subject === "Office Hours"
                            ? "bg-blue-50 border border-blue-200"
                            : classInfo.subject === "Faculty Meeting"
                            ? "bg-purple-50 border border-purple-200"
                            : "bg-green-50 border border-green-200"
                        } hover:shadow-sm transition-shadow cursor-pointer`}
                      >
                        <div className="space-y-1">
                          <p
                            className={`text-sm font-medium ${
                              classInfo.subject === "Office Hours"
                                ? "text-blue-700"
                                : classInfo.subject === "Faculty Meeting"
                                ? "text-purple-700"
                                : "text-green-700"
                            }`}
                          >
                            {classInfo.subject}
                          </p>
                          <div className="flex items-center space-x-1 text-xs text-gray-600">
                            <MapPin className="h-3 w-3" />
                            <span>{classInfo.room}</span>
                          </div>
                          {classInfo.students && (
                            <div className="flex items-center space-x-1 text-xs text-gray-600">
                              <Users className="h-3 w-3" />
                              <span>{classInfo.students} students</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Schedule Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Clock className="h-6 w-6 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">
              Weekly Hours
            </h3>
          </div>
          <p className="text-3xl font-bold text-blue-600">18</p>
          <p className="text-sm text-gray-600">Teaching hours this week</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Calendar className="h-6 w-6 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-800">Classes</h3>
          </div>
          <p className="text-3xl font-bold text-green-600">12</p>
          <p className="text-sm text-gray-600">Scheduled classes</p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Users className="h-6 w-6 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Students</h3>
          </div>
          <p className="text-3xl font-bold text-purple-600">105</p>
          <p className="text-sm text-gray-600">Total students taught</p>
        </div>
      </div>
    </div>
  )
}

export default TeacherSchedule

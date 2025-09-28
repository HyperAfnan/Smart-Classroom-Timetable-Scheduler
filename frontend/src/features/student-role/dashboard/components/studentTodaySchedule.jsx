import React from "react"
import { Clock, MapPin, User, BookOpen } from "lucide-react"

export default function StudentTodaySchedule({ classes, currentTime }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-900">Today's Classes</h2>
        <p className="text-sm text-gray-500 mt-1">
          Current time: {currentTime}
        </p>
      </div>

      <div className="p-6">
        {classes.length === 0 ? (
          <div className="text-center py-8">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No classes scheduled for today</p>
          </div>
        ) : (
          <div className="space-y-4">
            {classes.map(classItem => (
              <div
                key={classItem.id}
                className={`p-4 rounded-lg border-l-4 transition-all duration-200 ${
                  classItem.isNext
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-100"
                    : classItem.isCompleted
                    ? "bg-gray-50 border-gray-300 opacity-75"
                    : classItem.color
                } hover:shadow-md`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {classItem.subject}
                      </h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full font-medium ${
                          classItem.type === "lab"
                            ? "bg-purple-100 text-purple-800"
                            : classItem.type === "tutorial"
                            ? "bg-green-100 text-green-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {classItem.type.charAt(0).toUpperCase() +
                          classItem.type.slice(1)}
                      </span>
                      {classItem.isNext && (
                        <span className="px-2 py-1 text-xs rounded-full font-medium bg-orange-100 text-orange-800">
                          Next Class
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Clock className="w-4 h-4" />
                        <span>
                          {classItem.startTime} - {classItem.endTime}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4" />
                        <span>{classItem.teacher}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{classItem.room}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

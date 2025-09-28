
import React from "react"
import { Bell, User, Calendar } from "lucide-react"

export default function StudentHeader({ studentName, notifications }) {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Calendar className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Calvio</h1>
              <p className="text-sm text-gray-500">Student Dashboard</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-2 text-gray-600 hover:text-gray-900 transition-colors relative">
                <Bell className="w-5 h-5" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <div className="bg-gray-200 p-2 rounded-full">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {studentName || "Student Name"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

import React, { useState } from "react"
import {
  Calendar,
  Clock,
  Users,
  BookOpen,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Bell,
  TrendingUp,
  UserCheck,
  FileText
} from "lucide-react"

const HODDashboard = () => {
  const [pendingRequests, setPendingRequests] = useState([
    {
      id: "1",
      type: "Leave Request",
      teacher: "Dr. Smith",
      subject: "Mathematics",
      date: "Sept 20, 2025",
      reason: "Medical appointment",
      priority: "high",
      submittedAt: "2 hours ago"
    },
    {
      id: "2",
      type: "Class Swap",
      teacher: "Prof. Johnson",
      subject: "Physics Lab",
      date: "Sept 22, 2025",
      reason: "Equipment maintenance",
      priority: "medium",
      submittedAt: "5 hours ago"
    },
    {
      id: "3",
      type: "Room Change",
      teacher: "Dr. Williams",
      subject: "Chemistry",
      date: "Sept 21, 2025",
      reason: "Lab renovation",
      priority: "low",
      submittedAt: "1 day ago"
    }
  ])

  const [conflicts] = useState([
    {
      id: "1",
      description: "Two classes scheduled in Room 201 at 10:00 AM",
      severity: "critical",
      affectedClasses: 2,
      suggestedAction: "Move Physics to Lab B"
    },
    {
      id: "2",
      description: "Teacher double-booked on Monday 2:00 PM",
      severity: "moderate",
      affectedClasses: 1,
      suggestedAction: "Request substitution"
    }
  ])

  const handleApproveRequest = requestId => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
  }

  const handleDenyRequest = requestId => {
    setPendingRequests(prev => prev.filter(req => req.id !== requestId))
  }

  const getPriorityColor = priority => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 border-red-200"
      case "medium":
        return "bg-amber-100 text-amber-800 border-amber-200"
      case "low":
        return "bg-green-100 text-green-800 border-green-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getSeverityColor = severity => {
    switch (severity) {
      case "critical":
        return "bg-red-50 border-red-200"
      case "moderate":
        return "bg-amber-50 border-amber-200"
      case "low":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h1 className="text-xl font-semibold text-gray-900">
                  Calvio
                </h1>
                <span className="text-sm text-gray-500">HOD Portal</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              </button>
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">HD</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Dr. Thompson
                  </p>
                  <p className="text-xs text-gray-500">Computer Science HOD</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, Dr. Thompson!
          </h2>
          <p className="text-gray-600">
            Here's your department overview for today
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Monday, September 15, 2025
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Pending Requests
                </p>
                <p className="text-3xl font-bold text-red-600">
                  {pendingRequests.length}
                </p>
                <p className="text-sm text-gray-500 mt-1">Requires attention</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Active Teachers
                </p>
                <p className="text-3xl font-bold text-blue-600">24</p>
                <p className="text-sm text-gray-500 mt-1">Currently teaching</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Classes Today
                </p>
                <p className="text-3xl font-bold text-green-600">42</p>
                <p className="text-sm text-gray-500 mt-1">
                  Across all subjects
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  System Efficiency
                </p>
                <p className="text-3xl font-bold text-purple-600">94%</p>
                <p className="text-sm text-gray-500 mt-1">AI optimization</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Pending Requests
                  </h3>
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                    {pendingRequests.length} pending
                  </span>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {pendingRequests.map(request => (
                  <div
                    key={request.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="text-sm font-medium text-gray-900">
                            {request.type}
                          </h4>
                          <span
                            className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                              request.priority
                            )}`}
                          >
                            {request.priority}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600">
                          {request.teacher} - {request.subject}
                        </p>
                        <p className="text-sm text-gray-500">
                          {request.date} • {request.reason}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">
                        {request.submittedAt}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleApproveRequest(request.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleDenyRequest(request.id)}
                        className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Deny</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions & Conflicts */}
          <div className="space-y-6">
            {/* Schedule Conflicts */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Schedule Conflicts
                </h3>
              </div>
              <div className="p-6 space-y-3">
                {conflicts.map(conflict => (
                  <div
                    key={conflict.id}
                    className={`border rounded-lg p-3 ${getSeverityColor(
                      conflict.severity
                    )}`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                      <span className="text-xs text-gray-500">
                        {conflict.affectedClasses} classes
                      </span>
                    </div>
                    <p className="text-sm text-gray-800 mb-2">
                      {conflict.description}
                    </p>
                    <p className="text-xs text-gray-600">
                      Suggestion: {conflict.suggestedAction}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm border">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="p-6 grid grid-cols-2 gap-3">
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all">
                  <UserCheck className="w-6 h-6 text-blue-600 mb-2" />
                  <span className="text-sm text-gray-700">
                    Mark Unavailable
                  </span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-all">
                  <Clock className="w-6 h-6 text-green-600 mb-2" />
                  <span className="text-sm text-gray-700">
                    Request Substitution
                  </span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-purple-300 hover:bg-purple-50 transition-all">
                  <Calendar className="w-6 h-6 text-purple-600 mb-2" />
                  <span className="text-sm text-gray-700">
                    View Full Schedule
                  </span>
                </button>
                <button className="flex flex-col items-center p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-amber-300 hover:bg-amber-50 transition-all">
                  <FileText className="w-6 h-6 text-amber-600 mb-2" />
                  <span className="text-sm text-gray-700">Generate Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8">
          <div className="bg-white rounded-xl shadow-sm border">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Recent System Activity
              </h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Mathematics class automatically rescheduled due to Dr.
                      Smith's leave
                    </p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Room conflict resolved automatically - Physics moved to
                      Lab B
                    </p>
                    <p className="text-xs text-gray-500">4 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-800">
                      Substitute teacher assigned for Chemistry Lab
                    </p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HODDashboard

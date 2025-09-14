
import React from "react"
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  BookOpen,
  TrendingUp
} from "lucide-react"

const Dashboard = () => {
  const stats = [
    {
      label: "Classes This Week",
      value: "24",
      icon: Calendar,
      color: "bg-blue-500",
      change: "+2 from last week"
    },
    {
      label: "Teaching Hours",
      value: "18",
      icon: Clock,
      color: "bg-indigo-500",
      change: "Within optimal range"
    },
    {
      label: "Subjects",
      value: "3",
      icon: BookOpen,
      color: "bg-green-500",
      change: "Calculus, Algebra, Statistics"
    },
    {
      label: "Students",
      value: "127",
      icon: Users,
      color: "bg-purple-500",
      change: "Across all classes"
    }
  ]

  const recentChanges = [
    {
      type: "rescheduled",
      message: "Calculus II moved from Mon 9:00 AM to Mon 11:00 AM",
      time: "2 hours ago",
      status: "info"
    },
    {
      type: "conflict",
      message: "Schedule conflict resolved automatically",
      time: "4 hours ago",
      status: "success"
    },
    {
      type: "leave",
      message: "Leave request approved for Dec 25th",
      time: "1 day ago",
      status: "success"
    }
  ]

  const todaySchedule = [
    { time: "9:00 AM", subject: "Calculus I", room: "Room 301", students: 42 },
    { time: "11:00 AM", subject: "Statistics", room: "Room 205", students: 35 },
    { time: "2:00 PM", subject: "Algebra II", room: "Lab B", students: 28 }
  ]

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            Welcome back, Dr. Jane!
          </h1>
          <p className="text-gray-600 mt-1">
            Here's your teaching overview for today
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-lg font-semibold text-gray-800">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold text-gray-800 mt-1">
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{stat.change}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Schedule */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Today's Schedule
            </h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {todaySchedule.map((class_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <p className="text-sm font-semibold text-blue-600">
                      {class_.time}
                    </p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">
                      {class_.subject}
                    </p>
                    <p className="text-sm text-gray-600">
                      {class_.room} • {class_.students} students
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Confirmed
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Changes */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Recent Updates
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentChanges.map((change, index) => (
              <div key={index} className="flex space-x-3">
                <div
                  className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
                    change.status === "success"
                      ? "bg-green-400"
                      : change.status === "info"
                      ? "bg-blue-400"
                      : "bg-yellow-400"
                  }`}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-800">{change.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{change.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
            <AlertCircle className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">
              Mark Unavailable
            </span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">
              Request Substitution
            </span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
            <Calendar className="h-5 w-5 text-indigo-600" />
            <span className="text-sm font-medium text-indigo-700">
              View Full Schedule
            </span>
          </button>
          <button className="flex items-center space-x-3 p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
            <Users className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Student Reports
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default Dashboard

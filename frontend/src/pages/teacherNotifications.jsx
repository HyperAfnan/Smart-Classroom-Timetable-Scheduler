import React, { useState } from "react"
import {
  Bell,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Clock,
  Trash2
} from "lucide-react"

const TeacherNotifications = () => {
  const [filter, setFilter] = useState("all")
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      type: "schedule",
      title: "Schedule Updated",
      message:
        "Your Calculus II class has been moved from Monday 9:00 AM to Monday 11:00 AM due to room availability.",
      time: "2 hours ago",
      read: false,
      priority: "high"
    },
    {
      id: "2",
      type: "conflict",
      title: "Conflict Resolved",
      message:
        "The scheduling conflict for Tuesday 2:00 PM slot has been automatically resolved.",
      time: "4 hours ago",
      read: false,
      priority: "medium"
    },
    {
      id: "3",
      type: "approval",
      title: "Leave Request Approved",
      message:
        "Your leave request for December 25th has been approved by the administration.",
      time: "1 day ago",
      read: true,
      priority: "low"
    },
    {
      id: "4",
      type: "system",
      title: "System Maintenance",
      message:
        "Scheduled system maintenance will occur on Saturday from 2:00 AM to 4:00 AM.",
      time: "2 days ago",
      read: true,
      priority: "low"
    },
    {
      id: "5",
      type: "schedule",
      title: "New Class Assignment",
      message:
        "You have been assigned to teach Advanced Statistics starting next week.",
      time: "3 days ago",
      read: false,
      priority: "high"
    }
  ])

  const markAsRead = id => {
    setNotifications(
      notifications.map(notif =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map(notif => ({ ...notif, read: true })))
  }

  const deleteNotification = id => {
    setNotifications(notifications.filter(notif => notif.id !== id))
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "all") return true
    if (filter === "unread") return !notif.read
    return notif.type === filter
  })

  const unreadCount = notifications.filter(notif => !notif.read).length

  const getIcon = (type, priority) => {
    const iconClass =
      priority === "high"
        ? "text-red-500"
        : priority === "medium"
        ? "text-yellow-500"
        : "text-blue-500"

    switch (type) {
      case "schedule":
        return <Calendar className={`h-5 w-5 ${iconClass}`} />
      case "conflict":
        return <AlertCircle className={`h-5 w-5 ${iconClass}`} />
      case "approval":
        return <CheckCircle className={`h-5 w-5 ${iconClass}`} />
      case "system":
        return <Info className={`h-5 w-5 ${iconClass}`} />
      default:
        return <Bell className={`h-5 w-5 ${iconClass}`} />
    }
  }

  const getPriorityColor = (priority, read) => {
    if (read) return "bg-gray-50 border-gray-200"

    switch (priority) {
      case "high":
        return "bg-red-50 border-red-200"
      case "medium":
        return "bg-yellow-50 border-yellow-200"
      case "low":
        return "bg-blue-50 border-blue-200"
      default:
        return "bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
          <p className="text-gray-600 mt-1">
            Stay updated with schedule changes and important announcements
            {unreadCount > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {unreadCount} unread
              </span>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={markAllAsRead}
            className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Mark all as read</span>
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            {[
              { key: "all", label: "All", count: notifications.length },
              { key: "unread", label: "Unread", count: unreadCount },
              {
                key: "schedule",
                label: "Schedule",
                count: notifications.filter(n => n.type === "schedule").length
              },
              {
                key: "system",
                label: "System",
                count: notifications.filter(n => n.type === "system").length
              }
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setFilter(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
                  filter === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full ${
                    filter === tab.key
                      ? "bg-blue-100 text-blue-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {filteredNotifications.map(notification => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${getPriorityColor(
                  notification.priority,
                  notification.read
                )}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3 flex-1">
                    {getIcon(notification.type, notification.priority)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h3
                          className={`text-sm font-medium ${
                            notification.read
                              ? "text-gray-700"
                              : "text-gray-900"
                          }`}
                        >
                          {notification.title}
                        </h3>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                      </div>
                      <p
                        className={`mt-1 text-sm ${
                          notification.read ? "text-gray-500" : "text-gray-700"
                        }`}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="flex items-center text-xs text-gray-500">
                          <Clock className="h-3 w-3 mr-1" />
                          {notification.time}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                            notification.priority === "high"
                              ? "bg-red-100 text-red-700"
                              : notification.priority === "medium"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {notification.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    {!notification.read && (
                      <button
                        onClick={() => markAsRead(notification.id)}
                        className="text-blue-600 hover:text-blue-700 text-xs font-medium"
                      >
                        Mark as read
                      </button>
                    )}
                    <button
                      onClick={() => deleteNotification(notification.id)}
                      className="text-gray-400 hover:text-red-600 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredNotifications.length === 0 && (
            <div className="text-center py-12">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No notifications
              </h3>
              <p className="text-gray-500">
                {filter === "unread"
                  ? "You're all caught up! No unread notifications."
                  : `No ${
                      filter === "all" ? "" : filter + " "
                    }notifications to display.`}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Bell className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-lg font-semibold text-gray-800">
                {notifications.length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">High Priority</p>
              <p className="text-lg font-semibold text-gray-800">
                {notifications.filter(n => n.priority === "high").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Calendar className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Schedule</p>
              <p className="text-lg font-semibold text-gray-800">
                {notifications.filter(n => n.type === "schedule").length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <CheckCircle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Unread</p>
              <p className="text-lg font-semibold text-gray-800">
                {unreadCount}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TeacherNotifications

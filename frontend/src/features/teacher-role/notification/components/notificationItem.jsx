import { Clock, Trash2 } from "lucide-react"
import { getIcon, getPriorityColor } from "../constants.jsx"

const NotificationItem = ({ notification, markAsRead, deleteNotification }) => (
  <div
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
                notification.read ? "text-gray-700" : "text-gray-900"
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
)

export default NotificationItem

import React from "react";
import { AlertCircle, X } from "lucide-react";

export default function StudentNotificationBanner({
  notifications,
  onDismiss,
}) {
  if (notifications.length === 0) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="space-y-2">
        {notifications.map((notification) => (
          <div
            key={notification.id}
            className={`p-4 rounded-lg border-l-4 ${
              notification.type === "warning"
                ? "bg-orange-50 border-orange-400 dark:bg-destructive/20 dark:border-destructive"
                : notification.type === "success"
                  ? "bg-green-50 border-green-400 dark:bg-primary/20 dark:border-primary"
                  : "bg-blue-50 border-blue-400 dark:bg-primary/20 dark:border-primary"
            } transition-all duration-300 animate-in slide-in-from-top-2`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <AlertCircle
                  className={`w-5 h-5 mt-0.5 ${
                    notification.type === "warning"
                      ? "text-orange-600 dark:text-destructive"
                      : notification.type === "success"
                        ? "text-green-600 dark:text-primary"
                        : "text-blue-600 dark:text-primary"
                  }`}
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-card-foreground">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 dark:text-muted-foreground">
                    {notification.timestamp}
                  </p>
                </div>
              </div>
              <button
                onClick={() => onDismiss(notification.id)}
                className="text-gray-400 hover:text-gray-600 dark:text-muted-foreground dark:hover:text-foreground transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

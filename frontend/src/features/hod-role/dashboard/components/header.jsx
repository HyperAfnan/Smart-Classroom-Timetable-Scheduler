import React from "react"
import { Calendar, Bell } from "lucide-react"

/**
 * DashboardHeader
 *
 * Extracted from the original monolithic HOD dashboard page.
 * Maintains identical visual structure & Tailwind classes to avoid any UI drift.
 *
 * Props:
 *  - title?: string                -> Main product / app name (default: "Calvio")
 *  - portalLabel?: string          -> Context label (default: "HOD Portal")
 *  - notificationCount?: number    -> If > 0 shows a red badge
 *  - userInitials?: string         -> Avatar initials (default: "HD")
 *  - userName?: string             -> Display name under avatar (default: "Dr. Thompson")
 *  - userRole?: string             -> Role / position line (default: "Computer Science HOD")
 *  - onNotificationsClick?: fn     -> Callback for bell button
 *  - rightSlot?: ReactNode         -> Optional custom content to the right of notifications/avatar
 *
 * Usage:
 *  <DashboardHeader notificationCount={3} onNotificationsClick={() => setOpen(true)} />
 */
const DashboardHeader = ({
  title = "Calvio",
  portalLabel = "HOD Portal",
  notificationCount = 3,
  userInitials = "HD",
  userName = "Dr. Thompson",
  userRole = "Computer Science HOD",
  onNotificationsClick,
  rightSlot = null,
}) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left: Branding */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              <span className="text-sm text-gray-500">{portalLabel}</span>
            </div>
          </div>

            {/* Right: Notifications, Custom Slot, User */}
          <div className="flex items-center space-x-4">
            {/* Optional external slot (filters, theme toggle, etc.) */}
            {rightSlot}

            {/* Notifications */}
            <button
              type="button"
              onClick={onNotificationsClick}
              className="relative p-2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-md"
              aria-label="Notifications"
            >
              <Bell className="w-5 h-5" />
              {notificationCount > 0 && (
                <span
                  className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
                  aria-label={`${notificationCount} unread notifications`}
                />
              )}
            </button>

            {/* User Profile Summary */}
            <div className="flex items-center space-x-3">
              <div
                className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center"
                aria-label="User avatar"
              >
                <span className="text-white text-sm font-medium">
                  {userInitials}
                </span>
              </div>
              <div className="leading-tight">
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                <p className="text-xs text-gray-500">{userRole}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader

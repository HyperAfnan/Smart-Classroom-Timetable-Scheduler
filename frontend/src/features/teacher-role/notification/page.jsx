import FilterTabs from "./components/filterTabs.jsx"
import Header from "./components/header.jsx"
import NotificationList from "./components/notificationList.jsx"
import StatsGrid from "./components/statsGrid.jsx"
import { useNotifications } from "./hooks/useNotifications"

const TeacherNotifications = () => {
  const {
    filter,
    setFilter,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filteredNotifications,
    unreadCount,
  } = useNotifications()

  return (
    <div className="space-y-6">
      <Header unreadCount={unreadCount} markAllAsRead={markAllAsRead} />
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <FilterTabs
          filter={filter}
          setFilter={setFilter}
          notifications={notifications}
          unreadCount={unreadCount}
        />
        <div className="p-6">
          <NotificationList
            filteredNotifications={filteredNotifications}
            markAsRead={markAsRead}
            deleteNotification={deleteNotification}
            filter={filter}
          />
        </div>
      </div>
      <StatsGrid notifications={notifications} unreadCount={unreadCount} />
    </div>
  )
}

export default TeacherNotifications

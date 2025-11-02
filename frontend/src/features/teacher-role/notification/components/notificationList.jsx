import NotificationItem from "./notificationItem.jsx";
import EmptyState from "./emptyState.jsx";

const NotificationList = ({
  filteredNotifications,
  markAsRead,
  deleteNotification,
  filter,
}) =>
  filteredNotifications.length > 0 ? (
    <div className="space-y-4">
      {filteredNotifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          notification={notification}
          markAsRead={markAsRead}
          deleteNotification={deleteNotification}
        />
      ))}
    </div>
  ) : (
    <EmptyState filter={filter} />
  );

export default NotificationList;

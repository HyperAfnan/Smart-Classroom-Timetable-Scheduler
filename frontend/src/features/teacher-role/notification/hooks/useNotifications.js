import { useState } from "react";
import { notificationsData } from "../constants.jsx";

export const useNotifications = () => {
  const [filter, setFilter] = useState("all");
  const [notifications, setNotifications] = useState(notificationsData);

  const markAsRead = (id) =>
    setNotifications((n) =>
      n.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)),
    );

  const markAllAsRead = () =>
    setNotifications((n) => n.map((notif) => ({ ...notif, read: true })));

  const deleteNotification = (id) =>
    setNotifications((n) => n.filter((notif) => notif.id !== id));

  const filteredNotifications = notifications.filter((notif) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notif.read;
    return notif.type === filter;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  return {
    filter,
    setFilter,
    notifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    filteredNotifications,
    unreadCount,
  };
};

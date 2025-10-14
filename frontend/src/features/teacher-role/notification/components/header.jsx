import { CheckCircle } from "lucide-react";

const Header = ({ unreadCount, markAllAsRead }) => (
  <div className="flex justify-between items-center">
    <div>
      <h1 className="text-3xl font-bold text-card-foreground">Notifications</h1>
      <p className=" text-muted-foreground mt-1">
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
);

export default Header;

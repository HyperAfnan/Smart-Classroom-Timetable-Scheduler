import { Bell } from "lucide-react";

const EmptyState = ({ filter }) => (
  <div className="text-center py-12">
    <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
    <h3 className="text-lg font-medium text-card-foreground mb-2">
      No notifications
    </h3>
    <p className="text-gray-500">
      {filter === "unread"
        ? "You're all caught up! No unread notifications."
        : `No ${filter === "all" ? "" : filter + " "}notifications to display.`}
    </p>
  </div>
);

export default EmptyState;

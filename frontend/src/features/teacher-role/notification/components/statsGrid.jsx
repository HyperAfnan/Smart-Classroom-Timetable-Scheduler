import { Bell, AlertCircle, Calendar, CheckCircle } from "lucide-react";

const StatsGrid = ({ notifications, unreadCount }) => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    <StatCard
      icon={<Bell className="h-5 w-5 text-blue-600" />}
      bg="bg-blue-100"
      label="Total"
      value={notifications.length}
    />
    <StatCard
      icon={<AlertCircle className="h-5 w-5 text-red-600" />}
      bg="bg-red-100"
      label="High Priority"
      value={notifications.filter((n) => n.priority === "high").length}
    />
    <StatCard
      icon={<Calendar className="h-5 w-5 text-green-600" />}
      bg="bg-green-100"
      label="Schedule"
      value={notifications.filter((n) => n.type === "schedule").length}
    />
    <StatCard
      icon={<CheckCircle className="h-5 w-5 text-yellow-600" />}
      bg="bg-yellow-100"
      label="Unread"
      value={unreadCount}
    />
  </div>
);

const StatCard = ({ icon, bg, label, value }) => (
  <div className="bg-white p-4 rounded-lg shadow-sm border  border-border-200">
    <div className="flex items-center space-x-3">
      <div className={`p-2 ${bg} rounded-lg`}>{icon}</div>
      <div>
        <p className="text-sm  text-muted-foreground">{label}</p>
        <p className="text-lg font-semibold text-card-foreground">{value}</p>
      </div>
    </div>
  </div>
);

export default StatsGrid;

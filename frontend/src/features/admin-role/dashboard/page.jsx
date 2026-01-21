import useDashboardStats from "./hooks/useDashboardStats";
import { motion } from "framer-motion";
import StatCard from "./components/StatCard";
import QuickActions from "./components/QuickActions";
import SystemStatus from "./components/SystemStatus";
import { Users, MapPin, BookOpen, GraduationCap } from "lucide-react";
import { useUser } from "@/features/auth/hooks/useAuth";

export default function AdminDashboard() {
  const { stats, isLoading } = useDashboardStats();
  const { user: adminData } = useUser();

  const statCards = [
    {
      label: "Total Teachers",
      value: stats.teachers,
      icon: Users,
      color: "bg-blue-500",
    },
    {
      label: "Active Rooms",
      value: stats.rooms,
      icon: MapPin,
      color: "bg-green-500",
    },
    {
      label: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
      color: "bg-purple-500",
    },
    {
      label: "Classes",
      value: stats.classes,
      icon: GraduationCap,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-background dark:via-background dark:to-background">
      <div className="max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Welcome Back {adminData.name}
            </h1>
          </div>
          <div className="text-right">
            <p className="text-sm  text-muted-foreground">Today</p>
            <p className="text-lg font-semibold text-card-foreground">
              {new Date().toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, idx) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
            >
              <StatCard {...stat} loading={isLoading} statKey={stat.label} />
            </motion.div>
          ))}
        </div>

        {/* Quick Actions & System Status */}
        <div className="grid md:grid-cols-2 gap-6">
          <QuickActions />
          <SystemStatus timeSlots={stats.timeSlots} />
        </div>
      </div>
    </div>
  );
}

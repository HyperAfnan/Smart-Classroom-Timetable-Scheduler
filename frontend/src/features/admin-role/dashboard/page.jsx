import React from "react";
import useDashboardStats from "./hooks/useDashboardStats";
import { motion } from "framer-motion";
import StatCard from "./components/StatCard";
import QuickActions from "./components/QuickActions";
import SystemStatus from "./components/SystemStatus";
import { Users, MapPin, BookOpen, GraduationCap } from "lucide-react";
import { useSelector } from "react-redux";

export default function AdminDashboard() {
  const { stats, isLoading } = useDashboardStats();
   const adminData = useSelector(state => state.auth.user);
   console.log(adminData)

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
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome Back {adminData.name}</h1>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Today</p>
          <p className="text-lg font-semibold text-gray-800">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
         <StatCard {...stat} loading={isLoading} statKey={stat.title} />
          </motion.div>
        ))}
      </div>

      {/* Quick Actions & System Status */}
      <div className="grid md:grid-cols-2 gap-6">
        <QuickActions />
        <SystemStatus timeSlots={stats.timeSlots} />
      </div>
    </div>
  );
}

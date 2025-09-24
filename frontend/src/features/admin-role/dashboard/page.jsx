import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useDashboardStats from "./hooks/useDashboardStats";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import StatCard from "./components/StatCard";
import QuickActions from "./components/QuickActions";
import SystemStatus from "./components/SystemStatus";
import { Users, MapPin, BookOpen, GraduationCap, Calendar } from "lucide-react";

export default function AdminDashboard() {
  const { stats, isLoading } = useDashboardStats();

  const statCards = [
    {
      title: "Total Teachers",
      value: stats.teachers,
      icon: Users,
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      link: "/dashboard/teachers",
    },
    {
      title: "Active Rooms",
      value: stats.rooms,
      icon: MapPin,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      link: "/dashboard/rooms",
    },
    {
      title: "Subjects",
      value: stats.subjects,
      icon: BookOpen,
      bgColor: "bg-purple-50",
      textColor: "text-purple-700",
      link: "/dashboard/subjects",
    },
    {
      title: "Classes",
      value: stats.classes,
      icon: GraduationCap,
      bgColor: "bg-orange-50",
      textColor: "text-orange-700",
      link: "/dashboard/classes",
    },
  ];

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-600 mt-1">
            University Timetable Management System
          </p>
        </div>
        <div className="flex gap-3">
          <Link to="/dashboard/timetable">
            <Card className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white cursor-pointer p-0">
              <CardContent className="flex items-center gap-1 px-6 py-3">
                <Calendar className="w-3 h-3" />
                <span className="text-base">View Timetable</span>
              </CardContent>
            </Card>
          </Link>
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
            <StatCard {...stat} loading={isLoading} />
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

import React from "react";
import {
  Calendar,
  Clock,
  Users,
  AlertCircle,
  CheckCircle,
  BookOpen,
  TrendingUp,
} from "lucide-react";
import StatCard from "./components/statcard.jsx";
import ScheduleCard from "./components/schedulecard.jsx";
import UpdateItem from "./components/updateitem.jsx";
import QuickAction from "./components/quickActions.jsx";
import { recentChanges, todaySchedule } from "./constants";
import { useUser } from "@/features/auth/hooks/useAuth";

const Dashboard = () => {
  const { user } = useUser();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-card-foreground">
            Welcome back, Dr. {user?.name || "Educator"}!
          </h1>
          <p className=" text-muted-foreground mt-1">
            Here's your teaching overview for today
          </p>
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

      {/* Stats Section (no loops) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          label="Classes This Week"
          value="24"
          Icon={Calendar}
          color="bg-blue-500"
          change="+2 from last week"
        />
        <StatCard
          label="Teaching Hours"
          value={user.max_hours || "69"}
          Icon={Clock}
          color="bg-indigo-500"
          change="Within optimal range"
        />
        <StatCard
          label="Subjects"
          value={user.subjects ? user.subjects.length : "3"}
          Icon={BookOpen}
          color="bg-green-500"
          change="Calculus, Algebra, Statistics"
        />
        <StatCard
          label="Students"
          value="127"
          Icon={Users}
          color="bg-purple-500"
          change="Across all classes"
        />
      </div>

      {/* Schedule + Updates */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border  border-border-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">
              Today's Schedule
            </h2>
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {todaySchedule.map((c, i) => (
              <ScheduleCard key={i} {...c} />
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border  border-border-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-card-foreground">
              Recent Updates
            </h2>
            <TrendingUp className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {recentChanges.map((c, i) => (
              <UpdateItem key={i} {...c} />
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-sm border  border-border-200 p-6">
        <h2 className="text-xl font-semibold text-card-foreground mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <QuickAction
            Icon={AlertCircle}
            label="Mark Unavailable"
            bgColor="bg-blue-50"
            textColor="text-blue-600"
          />
          <QuickAction
            Icon={CheckCircle}
            label="Request Substitution"
            bgColor="bg-green-50"
            textColor="text-green-600"
          />
          <QuickAction
            Icon={Calendar}
            label="View Full Schedule"
            bgColor="bg-indigo-50"
            textColor="text-indigo-600"
          />
          <QuickAction
            Icon={Users}
            label="Student Reports"
            bgColor="bg-purple-50"
            textColor="text-purple-600"
          />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

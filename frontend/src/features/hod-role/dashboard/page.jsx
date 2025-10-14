import PendingRequestsList from "./components/pendingRequestsList.jsx";
import ConflictsList from "./components/conflictsList.jsx";
import QuickActions from "./components/quickActions.jsx";
import ActivityFeed from "./components/activityFeed.jsx";
import { useHODDashboard } from "./hooks/useHODDashboard.js";
import { useSelector } from "react-redux";
import { AlertTriangle, Users, BookOpen } from "lucide-react";
import { MetricCard } from "./components/statsCards.jsx";
import useTeachers from "@/features/admin-role/teachers/hooks/useTeachers.js";
import useClasses from "@/features/admin-role/classes/hooks/useClasses.js";

const HODDashboard = () => {
  const {
    conflicts,
    activity,
    sortedPendingRequests,
    approveRequest,
    denyRequest,
    priorityBadgeClass,
    conflictSeverityClass,
  } = useHODDashboard();

  const { user } = useSelector((state) => state.auth);
  const { teachers } = useTeachers();
  const { classes } = useClasses();

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-card-foreground">
            Welcome back, Dr. {user?.name || user?.first_name}!
          </h2>
          <p className="text-muted-foreground">
            Here's your department overview for today
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </section>

        <section className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              key="pending"
              label="Pending Requests"
              value="3"
              description="Requires attention"
              icon={<AlertTriangle className="w-6 h-6" />}
              accentColorClasses="text-destructive"
              iconBgClasses="bg-destructive/10"
            />

            <MetricCard
              key="teachers"
              label="Active Teachers"
              value={teachers.length.toString()}
              description="Currently teaching"
              icon={<Users className="w-6 h-6" />}
              accentColorClasses="text-primary"
              iconBgClasses="bg-primary/10"
            />

            <MetricCard
              key="classes"
              label="Classes Today"
              value={classes.length.toString()}
              description="Across all subjects"
              icon={<BookOpen className="w-6 h-6" />}
              accentColorClasses="text-primary"
              iconBgClasses="bg-primary/10"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <PendingRequestsList
              requests={sortedPendingRequests}
              onApprove={approveRequest}
              onDeny={denyRequest}
              priorityBadgeClass={priorityBadgeClass}
            />
          </div>

          <div className="space-y-6">
            <ConflictsList
              conflicts={conflicts}
              severityClass={conflictSeverityClass}
            />
            <QuickActions
              onMarkUnavailable={() => {}}
              onRequestSubstitution={() => {}}
              onViewFullSchedule={() => {}}
              onGenerateReport={() => {}}
            />
          </div>
        </section>

        <section className="mt-8">
          <ActivityFeed activities={activity} />
        </section>
      </main>
    </div>
  );
};

export default HODDashboard;

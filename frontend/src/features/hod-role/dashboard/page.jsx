import React from "react";
import DashboardHeader from "./components/header.jsx";
import StatsCards from "./components/statsCards.jsx";
import PendingRequestsList from "./components/pendingRequestsList.jsx";
import ConflictsList from "./components/conflictsList.jsx";
import QuickActions from "./components/quickActions.jsx";
import ActivityFeed from "./components/activityFeed.jsx";
import { useHODDashboard } from "./hooks/useHODDashboard.js";

/**
 * HODDashboard
 *
 * Refactored Head Of Department dashboard page composed from
 * modular components + a dedicated state/logic hook.
 *
 * Visual design intentionally mirrors the original monolithic implementation.
 * All Tailwind classes preserved so there should be no UI regression.
 *
 * Future enhancements (hook already prepared for):
 *  - API integration (fetch pending requests / conflicts / activity)
 *  - Toast notifications on approve / deny
 *  - Modals for deeper inspection / resolution of conflicts
 *  - Filtering & sorting for requests
 */
const HODDashboard = () => {
  const {
    // State
    pendingRequests,
    conflicts,
    activity,

    // Derived
    metrics,
    sortedPendingRequests,

    // Actions
    approveRequest,
    denyRequest,

    // Style helpers
    priorityBadgeClass,
    conflictSeverityClass,
  } = useHODDashboard();

  // Placeholder notification count (could derive from pending / conflicts)
  const notificationCount = pendingRequests.length;

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader
        notificationCount={notificationCount}
        onNotificationsClick={() => {
          /* integrate notifications panel later */
        }}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            Welcome back, Dr. Thompson!
          </h2>
          <p className="text-gray-600">
            Here's your department overview for today
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Monday, September 15, 2025
          </p>
        </section>

        {/* Stats Cards */}
        <section className="mb-8">
          <StatsCards metrics={metrics} />
        </section>

        {/* Main Grid */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pending Requests */}
          <div className="lg:col-span-2">
            <PendingRequestsList
              requests={sortedPendingRequests}
              onApprove={approveRequest}
              onDeny={denyRequest}
              priorityBadgeClass={priorityBadgeClass}
            />
          </div>

          {/* Right Column: Conflicts + Quick Actions */}
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

        {/* Activity Feed */}
        <section className="mt-8">
          <ActivityFeed activities={activity} />
        </section>
      </main>
    </div>
  );
};

export default HODDashboard;

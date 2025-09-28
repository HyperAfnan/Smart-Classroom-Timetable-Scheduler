import React from "react";
import { CheckCircle, XCircle, Inbox } from "lucide-react";

/**
 * PendingRequestsList
 *
 * Replicates the original "Pending Requests" card UI from the monolithic HOD dashboard,
 * now extracted as a reusable component. Maintains identical Tailwind classes to
 * preserve the existing look & feel.
 *
 * Props:
 *  - requests: Array<{
 *        id: string
 *        type: string
 *        teacher: string
 *        subject: string
 *        date: string
 *        reason: string
 *        priority: 'high' | 'medium' | 'low' | string
 *        submittedAt: string
 *    }>
 *  - onApprove: (id: string) => void
 *  - onDeny: (id: string) => void
 *  - priorityBadgeClass?: (priority: string) => string  (maps priority -> class names)
 *  - title?: string (default: "Pending Requests")
 *  - showCountBadge?: boolean (default: true)
 *  - loading?: boolean (optional skeleton state)
 *  - emptyMessage?: string (custom empty state text)
 *
 * Example:
 *  <PendingRequestsList
 *     requests={pendingRequests}
 *     onApprove={approveRequest}
 *     onDeny={denyRequest}
 *     priorityBadgeClass={priorityBadgeClass}
 *  />
 */

const PendingRequestsList = ({
  requests = [],
  onApprove,
  onDeny,
  priorityBadgeClass,
  title = "Pending Requests",
  showCountBadge = true,
  loading = false,
  emptyMessage = "No pending requests 🎉",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border">
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {showCountBadge && !loading && (
            <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {requests.length} {requests.length === 1 ? "pending" : "pending"}
            </span>
          )}
          {loading && (
            <span className="h-5 w-16 rounded-full bg-gray-200 animate-pulse" />
          )}
        </div>
      </div>

      <div className="p-6 space-y-4">
        {loading ? (
          <SkeletonList />
        ) : requests.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          requests.map((request) => (
            <RequestCard
              key={request.id}
              request={request}
              onApprove={onApprove}
              onDeny={onDeny}
              priorityBadgeClass={priorityBadgeClass}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

const RequestCard = ({ request, onApprove, onDeny, priorityBadgeClass }) => {
  const {
    id,
    type,
    teacher,
    subject,
    date,
    reason,
    priority,
    submittedAt,
  } = request;

  const badgeClasses =
    (priorityBadgeClass && priorityBadgeClass(priority)) ||
    defaultPriorityClass(priority);

  return (
    <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <h4 className="text-sm font-medium text-gray-900">{type}</h4>
            <span
              className={`text-xs px-2 py-1 rounded-full border ${badgeClasses}`}
            >
              {priority}
            </span>
          </div>
          <p className="text-sm text-gray-600">
            {teacher} - {subject}
          </p>
          <p className="text-sm text-gray-500">
            {date} • {reason}
          </p>
        </div>
        <p className="text-xs text-gray-400 whitespace-nowrap">{submittedAt}</p>
      </div>
      <div className="flex items-center space-x-2">
        <button
          onClick={() => onApprove && onApprove(id)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
        >
          <CheckCircle className="w-4 h-4" />
          <span>Approve</span>
        </button>
        <button
          onClick={() => onDeny && onDeny(id)}
          className="flex items-center space-x-1 px-3 py-1.5 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
        >
          <XCircle className="w-4 h-4" />
          <span>Deny</span>
        </button>
      </div>
    </div>
  );
};

const EmptyState = ({ message }) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <Inbox className="w-6 h-6 text-gray-400" />
    </div>
    <p className="text-sm font-medium text-gray-700">{message}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Skeleton State                                                             */
/* -------------------------------------------------------------------------- */

const SkeletonList = ({ count = 3 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="border rounded-lg p-4 animate-pulse bg-white space-y-4"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2">
            <div className="h-4 w-40 bg-gray-200 rounded" />
            <div className="h-3 w-56 bg-gray-200 rounded" />
            <div className="h-3 w-48 bg-gray-200 rounded" />
          </div>
          <div className="h-3 w-16 bg-gray-200 rounded" />
        </div>
        <div className="flex space-x-2">
            <div className="h-8 w-24 bg-gray-200 rounded-md" />
          <div className="h-8 w-20 bg-gray-200 rounded-md" />
        </div>
      </div>
    ))}
  </>
);

/* -------------------------------------------------------------------------- */
/* Fallback Priority Style Helper                                             */
/* -------------------------------------------------------------------------- */

const defaultPriorityClass = (priority) => {
  switch (priority) {
    case "high":
      return "bg-red-100 text-red-800 border-red-200";
    case "medium":
      return "bg-amber-100 text-amber-800 border-amber-200";
    case "low":
      return "bg-green-100 text-green-800 border-green-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

export default PendingRequestsList;

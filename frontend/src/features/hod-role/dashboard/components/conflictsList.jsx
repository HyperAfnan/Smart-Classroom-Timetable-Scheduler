import React from "react";
import { AlertTriangle, Lightbulb, CheckCircle2, ShieldAlert } from "lucide-react";

/**
 * ConflictsList
 *
 * Renders the "Schedule Conflicts" card extracted from the monolithic HOD dashboard.
 * Visual styling matches the original implementation to preserve UI consistency.
 *
 * Props:
 *  - conflicts: Array<{
 *        id: string
 *        description: string
 *        severity: 'critical' | 'moderate' | 'low' | string
 *        affectedClasses: number
 *        suggestedAction: string
 *    }>
 *  - severityClass?: (severity: string) => string
 *      Maps severity -> Tailwind class list (background + border).
 *      If not provided, a local fallback mapping is used.
 *  - title?: string (default: "Schedule Conflicts")
 *  - loading?: boolean (optional skeleton state)
 *  - emptyMessage?: string (default: "No active conflicts 🎉")
 *  - showHeader?: boolean (default: true)
 *  - onResolve?: (conflictId: string) => void (optional resolve action)
 *
 * Example:
 *  <ConflictsList
 *     conflicts={conflicts}
 *     severityClass={conflictSeverityClass}
 *     onResolve={(id) => console.log('resolve', id)}
 *  />
 */

const ConflictsList = ({
  conflicts = [],
  severityClass,
  title = "Schedule Conflicts",
  loading = false,
  emptyMessage = "No active conflicts 🎉",
  showHeader = true,
  onResolve,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border">
      {showHeader && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}

      <div className="p-6 space-y-3">
        {loading ? (
          <SkeletonList />
        ) : conflicts.length === 0 ? (
          <EmptyState message={emptyMessage} />
        ) : (
          conflicts.map((conflict) => (
            <ConflictCard
              key={conflict.id}
              conflict={conflict}
              severityClass={severityClass}
              onResolve={onResolve}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Card                                                                       */
/* -------------------------------------------------------------------------- */

const ConflictCard = ({ conflict, severityClass, onResolve }) => {
  const {
    id,
    description,
    severity,
    affectedClasses,
    suggestedAction,
  } = conflict;

  const classes =
    (severityClass && severityClass(severity)) ||
    fallbackSeverityClass(severity);

  return (
    <div
      className={`border rounded-lg p-3 transition-colors ${classes} relative overflow-hidden`}
    >
      {/* Decorative subtle accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 -top-4 w-16 h-16 rounded-full bg-gradient-to-br from-white/40 to-transparent"
      />

      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center space-x-2">
          <SeverityIcon severity={severity} />
          <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
            {severity}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          {affectedClasses} class{affectedClasses === 1 ? "" : "es"}
        </span>
      </div>

      <p className="text-sm text-gray-800 mb-2 leading-snug">
        {description}
      </p>

      <div className="flex items-start space-x-2">
        <Lightbulb className="w-3.5 h-3.5 mt-0.5 text-amber-600 flex-shrink-0" />
        <p className="text-xs text-gray-600">
          Suggestion: <span className="font-medium">{suggestedAction}</span>
        </p>
      </div>

      {onResolve && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => onResolve(id)}
            className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-medium rounded-md bg-green-600 text-white hover:bg-green-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500 transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resolve</span>
          </button>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Icon Mapping                                                               */
/* -------------------------------------------------------------------------- */

const SeverityIcon = ({ severity }) => {
  switch (severity) {
    case "critical":
      return (
        <ShieldAlert className="w-4 h-4 text-red-600" aria-hidden="true" />
      );
    case "moderate":
      return (
        <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
      );
    case "low":
      return (
        <AlertTriangle className="w-4 h-4 text-blue-600" aria-hidden="true" />
      );
    default:
      return (
        <AlertTriangle className="w-4 h-4 text-gray-500" aria-hidden="true" />
      );
  }
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({ message }) => (
  <div className="py-8 flex flex-col items-center justify-center text-center">
    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
      <AlertTriangle className="w-6 h-6 text-gray-400" />
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
        className="border rounded-lg p-3 bg-white animate-pulse space-y-3"
      >
        <div className="flex items-center justify-between">
          <div className="h-4 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-12 bg-gray-200 rounded" />
        </div>
        <div className="h-3 w-64 bg-gray-200 rounded" />
        <div className="h-3 w-40 bg-gray-200 rounded" />
      </div>
    ))}
  </>
);

/* -------------------------------------------------------------------------- */
/* Fallback severity style helper                                             */
/* -------------------------------------------------------------------------- */

const fallbackSeverityClass = (severity) => {
  switch (severity) {
    case "critical":
      return "bg-red-50 border-red-200";
    case "moderate":
      return "bg-amber-50 border-amber-200";
    case "low":
      return "bg-blue-50 border-blue-200";
    default:
      return "bg-gray-50 border-gray-200";
  }
};

export default ConflictsList;

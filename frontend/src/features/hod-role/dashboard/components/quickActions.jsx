import React from "react";
import { UserCheck, Clock, Calendar, FileText, Plus } from "lucide-react";

/**
 * QuickActions Component
 *
 * Extracted from the monolithic HOD dashboard page. Maintains identical
 * visual appearance for the four default actions while providing:
 *  - Custom action overrides
 *  - Disabled / loading states
 *  - Accessibility & keyboard friendliness
 *
 * Default Actions (when no `actions` prop provided):
 *  1. Mark Unavailable
 *  2. Request Substitution
 *  3. View Full Schedule
 *  4. Generate Report
 *
 * Props:
 *  - actions?: Array<ActionConfig>
 *  - onMarkUnavailable?: () => void
 *  - onRequestSubstitution?: () => void
 *  - onViewFullSchedule?: () => void
 *  - onGenerateReport?: () => void
 *  - loading?: boolean (renders placeholders)
 *  - columns?: number (2|3|4) -> controls grid column count (default 2)
 *  - className?: string
 *  - cardClassName?: string
 *
 * ActionConfig:
 * {
 *   key: string
 *   label: string
 *   icon: ReactNode
 *   onClick?: () => void
 *   accent?: 'blue' | 'green' | 'purple' | 'amber' | string (affects hover)
 *   disabled?: boolean
 * }
 *
 * Example:
 *  <QuickActions
 *    onMarkUnavailable={() => ...}
 *    onGenerateReport={() => ...}
 *  />
 *
 *  <QuickActions
 *    actions={[
 *      { key: 'custom', label: 'Custom', icon: <Plus />, onClick: () => {} }
 *    ]}
 *    columns={3}
 *  />
 */
const QuickActions = ({
  actions,
  onMarkUnavailable,
  onRequestSubstitution,
  onViewFullSchedule,
  onGenerateReport,
  loading = false,
  columns = 2,
  className = "",
  cardClassName = "",
}) => {
  const defaultActions = [
    {
      key: "mark-unavailable",
      label: "Mark Unavailable",
      icon: <UserCheck className="w-6 h-6 text-blue-600 mb-2" />,
      accent: "blue",
      onClick: onMarkUnavailable,
    },
    {
      key: "request-substitution",
      label: "Request Substitution",
      icon: <Clock className="w-6 h-6 text-green-600 mb-2" />,
      accent: "green",
      onClick: onRequestSubstitution,
    },
    {
      key: "view-full-schedule",
      label: "View Full Schedule",
      icon: <Calendar className="w-6 h-6 text-purple-600 mb-2" />,
      accent: "purple",
      onClick: onViewFullSchedule,
    },
    {
      key: "generate-report",
      label: "Generate Report",
      icon: <FileText className="w-6 h-6 text-amber-600 mb-2" />,
      accent: "amber",
      onClick: onGenerateReport,
    },
  ];

  const resolved =
    Array.isArray(actions) && actions.length > 0 ? actions : defaultActions;

  const gridCols =
    {
      2: "grid-cols-2",
      3: "grid-cols-3",
      4: "grid-cols-2 md:grid-cols-4",
    }[columns] || "grid-cols-2";

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-card-foreground">
          Quick Actions
        </h3>
      </div>
      <div className={`p-6 grid ${gridCols} gap-3`}>
        {loading ? (
          <ActionSkeletons count={resolved.length} />
        ) : (
          resolved.map((action) => (
            <ActionCard
              key={action.key}
              action={action}
              cardClassName={cardClassName}
            />
          ))
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Action Card                                                                */
/* -------------------------------------------------------------------------- */

const accentMap = {
  blue: {
    border: "hover:border-blue-300",
    bg: "hover:bg-blue-50",
  },
  green: {
    border: "hover:border-green-300",
    bg: "hover:bg-green-50",
  },
  purple: {
    border: "hover:border-purple-300",
    bg: "hover:bg-purple-50",
  },
  amber: {
    border: "hover:border-amber-300",
    bg: "hover:bg-amber-50",
  },
  default: {
    border: "hover: border-border-300",
    bg: "hover:bg-gray-50",
  },
};

const ActionCard = ({ action, cardClassName }) => {
  const { label, icon, onClick, accent = "default", disabled = false } = action;

  const accentTokens = accentMap[accent] || accentMap.default;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={[
        "flex flex-col items-center p-4 border-2 border-dashed  border-border-200 rounded-lg",
        accentTokens.border,
        accentTokens.bg,
        "transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
        disabled
          ? "opacity-50 cursor-not-allowed hover:bg-transparent hover: border-border-200"
          : "cursor-pointer",
        cardClassName,
      ].join(" ")}
    >
      {icon || <Plus className="w-6 h-6 text-gray-500 mb-2" />}
      <span className="text-sm text-gray-700 font-medium text-center leading-tight">
        {label}
      </span>
    </button>
  );
};

/* -------------------------------------------------------------------------- */
/* Skeletons                                                                  */
/* -------------------------------------------------------------------------- */
const ActionSkeletons = ({ count = 4 }) => (
  <>
    {Array.from({ length: count }).map((_, i) => (
      <div
        key={i}
        className="flex flex-col items-center p-4 border-2 border-dashed  border-border-200 rounded-lg animate-pulse"
      >
        <div className="w-6 h-6 rounded-md bg-gray-200 mb-2" />
        <div className="h-3 w-20 bg-gray-200 rounded" />
      </div>
    ))}
  </>
);

export default QuickActions;

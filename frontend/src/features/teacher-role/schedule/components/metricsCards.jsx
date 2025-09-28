import React from "react"
import { Clock, Calendar, Users, Activity } from "lucide-react"

/**
 * MetricsCards
 *
 * Displays high-level schedule summary stats in a responsive grid.
 *
 * Expected metrics shape:
 * {
 *   teachingHours: number,
 *   sessionCount: number,
 *   totalStudents: number
 * }
 *
 * Props:
 *  - metrics: object (see above)
 *  - loading?: boolean (optional loading state)
 *  - className?: string (container class override)
 *  - cards?: custom override array:
 *      [
 *        {
 *          key: string,
 *          label: string,
 *          value: number|string|ReactNode,
 *          icon: ReactNode,
 *          accentClasses?: string,
 *          description?: string
 *        }
 *      ]
 *
 * Example usage:
 *  <MetricsCards metrics={metrics} />
 *
 * You can also override cards:
 *  <MetricsCards
 *    metrics={metrics}
 *    cards={[
 *      { key: "hours", label: "Hours", value: metrics.teachingHours, icon: <Clock /> }
 *    ]}
 *  />
 */
const MetricsCards = ({
  metrics = {},
  loading = false,
  className = "",
  cards,
}) => {
  const {
    teachingHours = 0,
    sessionCount = 0,
    totalStudents = 0,
  } = metrics || {}

  // Derived - average students per teaching session (avoid division by zero)
  const avgStudents =
    sessionCount > 0 ? Math.round(totalStudents / sessionCount) : 0

  const defaultCards = [
    {
      key: "teachingHours",
      label: "Weekly Hours",
      value: teachingHours,
      icon: <Clock className="h-6 w-6 text-blue-600" />,
      accentClasses: "text-blue-600",
      description: "Teaching hours this week",
    },
    {
      key: "sessions",
      label: "Classes",
      value: sessionCount,
      icon: <Calendar className="h-6 w-6 text-green-600" />,
      accentClasses: "text-green-600",
      description: "Scheduled classes",
    },
    {
      key: "students",
      label: "Students",
      value: totalStudents,
      icon: <Users className="h-6 w-6 text-purple-600" />,
      accentClasses: "text-purple-600",
      description: "Total students taught",
    },
    {
      key: "avgStudents",
      label: "Avg / Class",
      value: avgStudents,
      icon: <Activity className="h-6 w-6 text-amber-600" />,
      accentClasses: "text-amber-600",
      description: "Average students per session",
    },
  ]

  const finalCards = cards && Array.isArray(cards) ? cards : defaultCards

  return (
    <div
      className={[
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
        className,
      ].join(" ")}
    >
      {finalCards.map(card => (
        <MetricCard
          key={card.key}
          {...card}
          loading={loading}
        />
      ))}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* MetricCard                                                                 */
/* -------------------------------------------------------------------------- */

const MetricCard = ({
  label,
  value,
  icon,
  accentClasses = "text-blue-600",
  description,
  loading = false,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 relative overflow-hidden">
      {/* Decorative accent ring */}
      <div
        aria-hidden="true"
        className="absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100"
      />
      <div className="flex items-center space-x-3 mb-4 relative">
        <div className="flex items-center justify-center p-2 bg-gray-50 rounded-lg">
          {icon}
        </div>
        <h3 className="text-lg font-semibold text-gray-800">{label}</h3>
      </div>
      {loading ? (
        <SkeletonValue />
      ) : (
        <>
          <p
            className={[
              "text-3xl font-bold tracking-tight",
              accentClasses,
            ].join(" ")}
          >
            {isEmptyValue(value) ? "—" : value}
          </p>
          {description && (
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          )}
        </>
      )}
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const isEmptyValue = v =>
  v === null || v === undefined || (typeof v === "number" && isNaN(v))

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

const SkeletonValue = () => (
  <div className="animate-pulse">
    <div className="h-9 w-20 bg-gray-200 rounded-md mb-2" />
    <div className="h-3 w-32 bg-gray-200 rounded" />
  </div>
)

export default MetricsCards

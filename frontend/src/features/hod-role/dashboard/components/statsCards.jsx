import React from "react"
import {
  AlertTriangle,
  Users,
  BookOpen,
  TrendingUp,
} from "lucide-react"

/**
 * StatsCards
 *
 * Dashboard metric summary cards for the HOD Dashboard.
 * Mirrors the original visual design from the monolithic page to avoid UI drift.
 *
 * Expected metrics shape (keys all optional; defaults applied if missing):
 * {
 *   pendingCount: number,
 *   activeTeachers: number,
 *   classesToday: number,
 *   systemEfficiency: number (percentage)
 * }
 *
 * Props:
 *  - metrics: object (see above)
 *  - loading?: boolean (shows skeleton placeholders)
 *  - className?: string (optional container class overrides)
 *  - overrideCards?: Array<CustomCardConfig> (full manual control)
 *
 * CustomCardConfig:
 *  {
 *    key: string
 *    label: string
 *    value: ReactNode
 *    description?: string
 *    icon?: ReactNode
 *    accentColorClasses?: string (e.g. "text-red-600")
 *    iconBgClasses?: string (e.g. "bg-red-100")
 *  }
 *
 * Example:
 *  <StatsCards metrics={metrics} />
 *
 * To override cards:
 *  <StatsCards
 *    metrics={metrics}
 *    overrideCards={[
 *      { key: 'custom', label: 'Foo', value: 10, icon: <Users /> }
 *    ]}
 *  />
 */
const StatsCards = ({
  metrics = {},
  loading = false,
  className = "",
  overrideCards,
}) => {
  const {
    pendingCount = 0,
    activeTeachers = 0,
    classesToday = 0,
    systemEfficiency = 0,
  } = metrics || {}

  // Default card config replicating original layout & colors
  const defaultCards = [
    {
      key: "pending",
      label: "Pending Requests",
      value: pendingCount,
      description: "Requires attention",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      accentColorClasses: "text-red-600",
      iconBgClasses: "bg-red-100",
    },
    {
      key: "teachers",
      label: "Active Teachers",
      value: activeTeachers,
      description: "Currently teaching",
      icon: <Users className="w-6 h-6 text-blue-600" />,
      accentColorClasses: "text-blue-600",
      iconBgClasses: "bg-blue-100",
    },
    {
      key: "classes",
      label: "Classes Today",
      value: classesToday,
      description: "Across all subjects",
      icon: <BookOpen className="w-6 h-6 text-green-600" />,
      accentColorClasses: "text-green-600",
      iconBgClasses: "bg-green-100",
    },
    {
      key: "efficiency",
      label: "System Efficiency",
      value: `${systemEfficiency}%`,
      description: "AI optimization",
      icon: <TrendingUp className="w-6 h-6 text-purple-600" />,
      accentColorClasses: "text-purple-600",
      iconBgClasses: "bg-purple-100",
    },
  ]

  const cards = overrideCards && Array.isArray(overrideCards)
    ? overrideCards
    : defaultCards

  return (
    <div
      className={[
        "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6",
        className,
      ].join(" ")}
    >
      {cards.map(card => (
        <MetricCard
          key={card.key}
            loading={loading}
          {...card}
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
  description,
  icon,
  loading,
  accentColorClasses = "text-blue-600",
  iconBgClasses = "bg-blue-100",
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-6 hover:shadow-md transition-shadow relative overflow-hidden">
      {/* Decorative subtle radial accent */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-6 -top-6 w-24 h-24 rounded-full bg-gradient-to-br from-gray-50 to-gray-100"
      />
      <div className="flex items-center justify-between relative">
        <div>
          <p className="text-sm font-medium text-gray-600">{label}</p>
          {loading ? (
            <SkeletonValue />
          ) : (
            <p
              className={[
                "text-3xl font-bold tracking-tight mt-1",
                accentColorClasses,
              ].join(" ")}
            >
              {value ?? "—"}
            </p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {loading ? <SkeletonLine /> : description}
          </p>
        </div>
        <div
          className={[
            "w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0",
            iconBgClasses,
          ].join(" ")}
        >
          {loading ? <SkeletonIcon /> : icon}
        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Skeleton Elements                                                          */
/* -------------------------------------------------------------------------- */

const SkeletonValue = () => (
  <div className="mt-1">
    <div className="h-8 w-16 bg-gray-200 rounded-md animate-pulse" />
  </div>
)

const SkeletonLine = () => (
  <div className="h-3 w-28 bg-gray-200 rounded animate-pulse" />
)

const SkeletonIcon = () => (
  <div className="w-6 h-6 bg-gray-200 rounded-md animate-pulse" />
)

export default StatsCards

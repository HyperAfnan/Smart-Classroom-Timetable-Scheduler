import {
  AlertTriangle,
  Users,
  BookOpen,
} from "lucide-react"

const StatsCards = ({
  metrics = {},
  loading = false,
  className = "",
}) => {
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

export const MetricCard = ({
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

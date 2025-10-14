/**
 * ActivityFeed
 *
 * Reusable component for rendering system / department activity logs.
 * Mirrors the original "Recent System Activity" UI from the monolithic
 * HOD dashboard to preserve visual consistency.
 *
 * Props:
 *  - activities: Array<{
 *        id: string
 *        color?: 'green' | 'blue' | 'amber' | 'red' | 'purple' | 'gray'
 *        message: string
 *        time: string
 *    }>
 *  - title?: string                          (default: "Recent System Activity")
 *  - loading?: boolean                       (shows skeleton rows)
 *  - limit?: number                          (max number of entries to render)
 *  - emptyMessage?: string                   (default: "No recent activity")
 *  - className?: string                      (container overrides)
 *  - onItemClick?: (activity) => void        (optional click handler per row)
 *  - showBorder?: boolean                    (default: true; toggles outer border)
 */

const COLOR_DOT_CLASSES = {
  green: "bg-green-500",
  blue: "bg-blue-500",
  amber: "bg-amber-500",
  yellow: "bg-amber-500",
  red: "bg-red-500",
  purple: "bg-purple-500",
  gray: "bg-gray-400",
  default: "bg-gray-400",
};

const ActivityFeed = ({
  activities = [],
  title = "Recent System Activity",
  loading = false,
  limit,
  emptyMessage = "No recent activity",
  className = "",
  onItemClick,
  showBorder = true,
}) => {
  const list = Array.isArray(activities) ? activities : [];
  const trimmed = typeof limit === "number" ? list.slice(0, limit) : list;
  const isEmpty = !loading && trimmed.length === 0;

  return (
    <div
      className={[
        "bg-card text-card-foreground rounded-xl shadow-sm",
        showBorder ? "border" : "",
        className,
      ].join(" ")}
    >
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-card-foreground">{title}</h3>
      </div>
      <div className="p-6">
        {loading ? (
          <SkeletonFeed />
        ) : isEmpty ? (
          <EmptyState message={emptyMessage} />
        ) : (
          <ul className="space-y-4">
            {trimmed.map((item) => (
              <ActivityRow key={item.id} item={item} onClick={onItemClick} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* Row                                                                        */
/* -------------------------------------------------------------------------- */

const ActivityRow = ({ item, onClick }) => {
  const { color = "default", message, time } = item;
  const dotClass = COLOR_DOT_CLASSES[color] || COLOR_DOT_CLASSES.default;

  const interactive = typeof onClick === "function";

  const content = (
    <>
      <div
        className={`w-2 h-2 rounded-full flex-shrink-0 ${dotClass}`}
        aria-hidden="true"
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-card-foreground leading-snug line-clamp-3">
          {message}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">{time}</p>
      </div>
    </>
  );

  return (
    <li>
      {interactive ? (
        <button
          type="button"
          onClick={() => onClick(item)}
          className="group w-full flex items-center space-x-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1 -m-1 hover:bg-muted/40 transition-colors"
        >
          {content}
        </button>
      ) : (
        <div className="flex items-center space-x-3">{content}</div>
      )}
    </li>
  );
};

/* -------------------------------------------------------------------------- */
/* Empty State                                                                */
/* -------------------------------------------------------------------------- */

const EmptyState = ({ message }) => (
  <div className="py-8 text-center">
    <div className="w-10 h-10 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
      <div className="w-2 h-2 bg-muted-foreground rounded-full" />
    </div>
    <p className="text-sm font-medium text-muted-foreground">{message}</p>
  </div>
);

/* -------------------------------------------------------------------------- */
/* Skeleton                                                                   */
/* -------------------------------------------------------------------------- */

const SkeletonFeed = ({ rows = 3 }) => (
  <ul className="space-y-4">
    {Array.from({ length: rows }).map((_, i) => (
      <li key={i} className="flex items-center space-x-3 animate-pulse">
        <div className="w-2 h-2 rounded-full bg-muted/60" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-3/4 bg-muted/60 rounded" />
          <div className="h-2 w-1/4 bg-muted/60 rounded" />
        </div>
      </li>
    ))}
  </ul>
);

export default ActivityFeed;

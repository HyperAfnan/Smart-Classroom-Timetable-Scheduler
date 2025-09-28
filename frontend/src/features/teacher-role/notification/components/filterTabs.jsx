const FilterTabs = ({ filter, setFilter, notifications, unreadCount }) => {
  const tabs = [
    { key: "all", label: "All", count: notifications.length },
    { key: "unread", label: "Unread", count: unreadCount },
    {
      key: "schedule",
      label: "Schedule",
      count: notifications.filter(n => n.type === "schedule").length,
    },
    {
      key: "system",
      label: "System",
      count: notifications.filter(n => n.type === "system").length,
    },
  ]

  return (
    <div className="border-b border-gray-200">
      <nav className="flex space-x-8 px-6">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key)}
            className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors flex items-center space-x-2 ${
              filter === tab.key
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`inline-flex items-center justify-center px-2 py-0.5 text-xs rounded-full ${
                filter === tab.key
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </nav>
    </div>
  )
}

export default FilterTabs

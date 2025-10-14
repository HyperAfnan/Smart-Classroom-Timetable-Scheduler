const StatCard = ({ label, value, change, Icon, color }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border  border-border-200 hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium  text-muted-foreground">{label}</p>
        <p className="text-2xl font-bold text-card-foreground mt-1">{value}</p>
        <p className="text-xs text-gray-500 mt-1">{change}</p>
      </div>
      <div className={`${color} p-3 rounded-lg`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
    </div>
  </div>
);

export default StatCard;

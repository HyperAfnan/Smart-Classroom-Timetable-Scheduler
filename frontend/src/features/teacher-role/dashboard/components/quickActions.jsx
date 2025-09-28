const QuickAction = ({ Icon, label, bgColor, textColor }) => (
  <button className={`flex items-center space-x-3 p-4 ${bgColor} rounded-lg hover:opacity-90 transition-colors`}>
    <Icon className={`h-5 w-5 ${textColor}`} />
    <span className={`text-sm font-medium ${textColor.replace("600", "700")}`}>
      {label}
    </span>
  </button>
)
export default QuickAction

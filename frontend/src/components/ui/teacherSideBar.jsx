import {
  Calendar,
  Clock,
  Bell,
  User,
  LayoutDashboard,
  LogOut,
  BookOpen
} from "lucide-react"
import { useNavigate } from "react-router-dom"


const TeacherSidebar = () => {
   const navigate = useNavigate()
  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard, route: "/dashboard/teacher-dashboard" },
    { id: "schedule", label: "My Schedule", icon: Calendar, route: "/dashboard/teacher-schedule" },
    { id: "availability", label: "Availability", icon: Clock, route: "/dashboard/teacher-availability" },
    { id: "notifications", label: "Notifications", icon: Bell, route: "/dashboard/teacher-notifications" },
    { id: "profile", label: "Profile", icon: User, route: "/dashboard/teacher-profile" }
  ]

  const handleMenuClick = (route) => {
    navigate(route)
  }

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-10">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-600 p-2 rounded-lg">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Calvio</h1>
            <p className="text-sm text-gray-600">Teacher Portal</p>
          </div>
        </div>
      </div>

      <nav className="p-4">
        <div className="space-y-2">
          {menuItems.map(item => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.route)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors duration-200 ${
                  "" === item.id
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-600"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            )
          })}
        </div>
      </nav>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
        <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50">
          <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
            <span className="text-white font-medium text-sm">JD</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-800">Dr. Jane Doe</p>
            <p className="text-xs text-gray-600">Mathematics Dept.</p>
          </div>
          <button className="text-gray-400 hover:text-gray-600">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

export default TeacherSidebar

import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  GraduationCap,
  LayoutDashboard,
  Clock,
  LayoutGrid,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useSelector, useDispatch } from "react-redux";
import { clearAuth } from "@/Store/auth";
import { supabase } from "@/config/supabase";

const adminNavigationOptions = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Teachers", url: "/dashboard/teachers", icon: Users },
  { title: "Subjects", url: "/dashboard/subjects", icon: BookOpen },
  { title: "Rooms", url: "/dashboard/rooms", icon: MapPin },
  { title: "Classes", url: "/dashboard/classes", icon: GraduationCap },
  {
    title: "Timetable Generator",
    url: "/dashboard/timetablegen",
    icon: Calendar,
  },
  { title: "Master Timetable", url: "/dashboard/timetable", icon: LayoutGrid },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

const studentNavigationOptions = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

const HODNavigationOptions = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    url: "/settings",
  },
];

const teacherNavigationOptions = [
  {
    id: "dashboard",
    title: "Dashboard",
    icon: LayoutDashboard,
    url: "/dashboard/teacher-dashboard",
  },
  {
    id: "schedule",
    title: "My Schedule",
    icon: Calendar,
    url: "/dashboard/teacher-schedule",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: Bell,
    url: "/dashboard/teacher-notifications",
  },
  {
    id: "settings",
    title: "Settings",
    icon: Settings,
    url: "/dashboard/teacher-settings",
  },
  {
    id: "Settings",
    title: "New Settings",
    icon: Settings,
    url: "/settings",
  },
];

export default function SidebarMenuComponent() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      dispatch(clearAuth());
      try {
        localStorage.clear();
      } catch (_) {}
      navigate("/");
    }
  };

   return (
      <Sidebar className="border-r border-slate-200">
         <SidebarHeader className="border-b border-slate-200 p-6">
            <Link to={"/dashboard"}>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                     <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                     <h2 className="font-bold text-slate-900 dark:text-slate-300 text-lg">Calvio</h2>
                     <p className="text-xs text-slate-400">Academic Scheduling</p>
                  </div>
               </div>
            </Link>
         </SidebarHeader>

      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {user.roles.includes("admin") &&
                adminNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-blue-50 dark:hover:bg-blue-800  dark:bg-blue-950 hover:text-blue-700 transition-colors duration-200 rounded-lg py-3 px-3 ${
                        location.pathname === item.url
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {user.roles.includes("teacher") &&
                teacherNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg py-3 px-3 ${
                        location.pathname === item.url
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-stale-600"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {user.roles.includes("student") &&
                studentNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg py-3 px-3 ${
                        location.pathname === item.url
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              {user.roles.includes("hod") &&
                HODNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      className={`hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200 rounded-lg py-3 px-3 ${
                        location.pathname === item.url
                          ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                          : "text-slate-600"
                      }`}
                    >
                      <Link to={item.url} className="flex items-center gap-3">
                        <item.icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

         <SidebarFooter className="border-t border-slate-200 p-4">
            <div className="flex items-center space-x-3 px-4 py-3 rounded-lg bg-gray-50 w-full">
               <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-700 font-medium text-sm">
                     {user?.user?.first_name?.charAt(0)}
                  </span>
               </div>
               <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">
                     {[user?.user?.first_name, user?.user?.last_name]
                        .filter(Boolean)
                        .join(" ")}
                  </p>
                  <p className="text-xs text-gray-600">
                     {user?.roles?.[0]?.charAt(0)?.toUpperCase()}
                     {user?.roles?.[0]?.slice(1)?.toLowerCase()}
                  </p>
               </div>
               <button
                  onClick={handleLogout}
                  className="text-gray-400 hover:text-gray-600 ml-auto"
                  aria-label="Logout"
                  title="Logout"
               >
                  <LogOut className="h-4 w-4" />
               </button>
            </div>
         </SidebarFooter>
      </Sidebar>
   );
}

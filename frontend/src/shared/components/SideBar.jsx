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
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

import { useUser, useAuth } from "@/features/auth/hooks/useAuth";
import { useState, useEffect, useRef } from "react";

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
  {
    title: "Timetable Viewer",
    url: "/dashboard/timetableViewer",
    icon: LayoutGrid,
  },
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
  const { user, roles } = useUser();
  const { logout } = useAuth();
  console.log("User Roles", roles);
  console.log("User", user);

  // Track collapse state: hide labels when width is below threshold
  const sidebarRef = useRef(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const COLLAPSE_THRESHOLD = 160; // px

  useEffect(() => {
    const el = sidebarRef.current;
    if (!el) return;

    const update = () => {
      const width = el.getBoundingClientRect().width;
      // Consider collapsed when panel is below the collapse threshold
      setIsCollapsed(width <= COLLAPSE_THRESHOLD);
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const handleLogout = () => {
      logout();
  };

  return (
    <div
      ref={sidebarRef}
      className="border-r border-sidebar-border h-svh min-h-0 overflow-hidden flex flex-col bg-background text-foreground"
    >
      <SidebarHeader className="border-b border-sidebar-border p-6 shrink-0">
        <Link to={"/dashboard"}>
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div
              className={`min-w-0 flex-1 ${isCollapsed ? "hidden" : "block"}`}
            >
              <h2 className="font-bold text-foreground text-lg truncate">
                Calvio
              </h2>
              <p className="text-xs text-muted-foreground truncate">
                Academic Scheduling
              </p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="p-4 flex-1 overflow-auto min-h-0">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {roles.includes("admin") &&
                adminNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg py-3 px-3 w-full ${!isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
                    >
                      <span
                        className={`${isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-md p-3" : ""}`}
                      >
                        <item.icon className="w-5 h-5 flex-none" />
                      </span>
                      <span
                        className={`font-medium truncate ${isCollapsed ? "hidden" : "inline"}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              {roles.includes("teacher") &&
                teacherNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg py-3 px-3 w-full ${!isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
                    >
                      <span
                        className={`${isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-md p-2" : ""}`}
                      >
                        <item.icon className="h-5 w-5 flex-none" />
                      </span>
                      <span
                        className={`font-medium truncate ${isCollapsed ? "hidden" : "inline"}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              {roles.includes("student") &&
                studentNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg py-3 px-3 w-full ${!isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
                    >
                      <span
                        className={`${isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-md p-2" : ""}`}
                      >
                        <item.icon className="w-5 h-5 flex-none" />
                      </span>
                      <span
                        className={`font-medium truncate ${isCollapsed ? "hidden" : "inline"}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                ))}
              {roles.includes("hod") &&
                HODNavigationOptions.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <Link
                      to={item.url}
                      className={`flex items-center ${isCollapsed ? "justify-center" : "gap-3"} rounded-lg py-3 px-3 w-full ${!isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground font-medium" : ""}`}
                    >
                      <span
                        className={`${isCollapsed && location.pathname === item.url ? "bg-sidebar-accent text-sidebar-accent-foreground rounded-md p-2" : ""}`}
                      >
                        <item.icon className="w-5 h-5 flex-none" />
                      </span>
                      <span
                        className={`font-medium truncate ${isCollapsed ? "hidden" : "inline"}`}
                      >
                        {item.title}
                      </span>
                    </Link>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 shrink-0">
        <div
          className={`flex items-center w-full ${isCollapsed ? "justify-center px-0 py-0 bg-transparent" : "space-x-3 px-4 py-3 rounded-lg bg-muted/50"}`}
        >
          <div
            className={`w-8 h-8 bg-muted rounded-full flex items-center justify-center ${isCollapsed ? "hidden" : "flex"}`}
          >
            <span className="text-foreground font-medium text-sm">
              {user?.first_name?.charAt(0)}
            </span>
          </div>
          <div className={`flex-1 min-w-0 ${isCollapsed ? "hidden" : "block"}`}>
            <p className="text-sm font-medium text-foreground truncate">
              {[user?.first_name, user?.last_name]
                .filter(Boolean)
                .join(" ")}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {roles?.[0]?.charAt(0)?.toUpperCase()}
              {roles?.[0]?.slice(1)?.toLowerCase()}
            </p>
          </div>
          {/*  TODO: add a confirm dialog to logout */}
          <button
            onClick={handleLogout}
            className={`${isCollapsed ? "inline-flex items-center justify-center p-5 rounded-md bg-muted/50 hover:bg-muted" : "ml-auto"} text-muted-foreground hover:text-foreground`}
            aria-label="Logout"
            title="Logout"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </SidebarFooter>
    </div>
  );
}

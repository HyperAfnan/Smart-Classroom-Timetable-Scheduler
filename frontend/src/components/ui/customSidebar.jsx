import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Calendar,
  Users,
  BookOpen,
  MapPin,
  GraduationCap,
  LayoutDashboard,
  Clock,
  LayoutGrid,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

const navigationItems = [
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
];

export default function SidebarMenuComponent() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-slate-200">
      {/* Header */}
      <SidebarHeader className="border-b border-slate-200 p-6">
        <Link to={"/dashboard"}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-bold text-slate-900 text-lg">Calvio</h2>
              <p className="text-xs text-slate-500">Academic Scheduling</p>
            </div>
          </div>
        </Link>
      </SidebarHeader>

      {/* Navigation */}
      <SidebarContent className="p-4">
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
            Management
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
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

        {/* Quick Stats */}
        <SidebarGroup className="mt-8">
          <SidebarGroupLabel className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-2 py-3">
            Quick Stats
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <div className="px-3 py-2 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Teachers
                </span>
                <span className="font-semibold text-slate-900">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Subjects
                </span>
                <span className="font-semibold text-slate-900">0</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-600 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Rooms
                </span>
                <span className="font-semibold text-slate-900">0</span>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-slate-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center">
            <span className="text-slate-700 font-medium text-sm">A</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 text-sm truncate">Admin</p>
            <p className="text-xs text-slate-500 truncate">
              System Administrator
            </p>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

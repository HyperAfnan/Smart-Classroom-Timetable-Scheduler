import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarMenu from "./components/ui/customSidebar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import TeacherSidebar from "./components/ui/teacherSideBar.jsx";
// import StudentDashboard from "./pages/studentdashboard.jsx";

export default function Layout() {
   const location = useLocation();
   const roles = useSelector((state) => state.auth.roles) || [];
   const adminSidebarRoutes = [
      "/dashboard",
      "/dashboard/teachers",
      "/dashboard/subjects",
      "/dashboard/rooms",
      "/dashboard/classes",
      "/dashboard/timetablegen",
      "/dashboard/timetable",
   ];
   const isAdminSidebarVisible = adminSidebarRoutes.includes(location.pathname);
   const teacherSidebarRoutes = [
      "/dashboard",
      "/dashboard/teacher-dashboard",
      "/dashboard/teacher-schedule",
      "/dashboard/teacher-availability",
      "/dashboard/teacher-profile",
      "/dashboard/teacher-notifications",
   ];
   const isTeacherSidebarVisible = teacherSidebarRoutes.includes(
      location.pathname,
   );

   if (roles.includes("admin")) {
      return (
         <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
               {isAdminSidebarVisible && <SidebarMenu />}

               <main className="flex-1 flex flex-col">
                  {/* Mobile header */}
                  <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                     <div className="flex items-center gap-4">
                        <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                        <h1 className="text-xl font-semibold text-slate-900">Calvio</h1>
                     </div>
                  </header>

                  {/* Content */}
                  <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100">
                     <Outlet />
                  </div>
               </main>
            </div>
         </SidebarProvider>
      );
   }

   if (roles.includes("teacher")) {
      return (
         <div className="min-h-screen flex w-full bg-slate-50">
            {isTeacherSidebarVisible && (
               <div className="w-64 shrink-0">
                  <TeacherSidebar />
               </div>
            )}

            <main className="flex-1 flex flex-col">
               <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                  <div className="flex items-center gap-4">
                     <h1 className="text-xl font-semibold text-slate-900">
                        Teacher Portal
                     </h1>
                  </div>
               </header>

               <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-6">
                  <Outlet />
               </div>
            </main>
         </div>
      );
   }

   if (roles.includes("student")) {
      return <Outlet />;
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <Outlet />
      </div>
   );
}

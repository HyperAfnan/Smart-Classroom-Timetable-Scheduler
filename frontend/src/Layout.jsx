import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarMenu from "./components/ui/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Layout() {
   const location = useLocation();
   const roles = useSelector((state) => state.auth.roles) || [];
   const sidebarRoutes = [
      "/dashboard",
      "/dashboard/teachers",
      "/dashboard/subjects",
      "/dashboard/rooms",
      "/dashboard/classes",
      "/dashboard/timetablegen",
      "/dashboard/timetable",
      "/dashboard/teacher-dashboard",
      "/dashboard/teacher-schedule",
      "/dashboard/teacher-availability",
      "/dashboard/teacher-profile",
      "/dashboard/teacher-notifications",
      "/dashboard/teacher-settings",
   ];
   const isSidebarVisible = sidebarRoutes.includes(location.pathname);
   if (roles.includes("admin")) {
      return (
         <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
               {isSidebarVisible && <SidebarMenu />}

               <main className="flex-1 flex flex-col">
                  <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                     <div className="flex items-center gap-4">
                        <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
                        <h1 className="text-xl font-semibold text-slate-900">Calvio</h1>
                     </div>
                  </header>

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
         <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
               {isSidebarVisible && <SidebarMenu />}

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
         </SidebarProvider>
      );
   }

   if (roles.includes("hod")) {
      return (
         <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
               {isSidebarVisible && <SidebarMenu />}

               <main className="flex-1 flex flex-col">
                  <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                     <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-slate-900">
                           HOD Portal
                        </h1>
                     </div>
                  </header>

                  <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-6">
                     <Outlet />
                  </div>
               </main>
            </div>
         </SidebarProvider>
      );
   }

   if (roles.includes("student")) {
      return (
         <SidebarProvider>
            <div className="min-h-screen flex w-full bg-slate-50">
               {isSidebarVisible && <SidebarMenu />}

               <main className="flex-1 flex flex-col">
                  <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
                     <div className="flex items-center gap-4">
                        <h1 className="text-xl font-semibold text-slate-900">
                           Student Portal
                        </h1>
                     </div>
                  </header>

                  <div className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 px-5 py-6">
                     <Outlet />
                  </div>
               </main>
            </div>
         </SidebarProvider>
      );
   }

   return (
      <div className="min-h-screen bg-slate-50">
         <Outlet />
      </div>
   );
}

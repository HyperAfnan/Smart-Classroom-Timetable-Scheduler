import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarMenu from "./components/ui/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function Layout() {
  const location = useLocation();
  const roles = useSelector((state) => state.auth.roles) || [];

  const noSidebarRoutes = ["/", "/auth"];
  const isSidebarVisible = !noSidebarRoutes.includes(location.pathname);

  const roleTitleMap = {
    admin: "Calvio",
    teacher: "Teacher Portal",
    hod: "HOD Portal",
    student: "Student Portal",
  };

  const currentRole = Object.keys(roleTitleMap).find((role) =>
    roles.includes(role)
  );

  if (!currentRole) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Outlet />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-slate-50">
        {isSidebarVisible && <SidebarMenu />}

        <main className="flex-1 flex flex-col">
          <header className="bg-white border-b border-slate-200 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              {currentRole === "admin" && isSidebarVisible && (
                <SidebarTrigger className="hover:bg-slate-100 p-2 rounded-lg transition-colors duration-200" />
              )}
              <h1 className="text-xl font-semibold text-slate-900">
                {roleTitleMap[currentRole]}
              </h1>
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

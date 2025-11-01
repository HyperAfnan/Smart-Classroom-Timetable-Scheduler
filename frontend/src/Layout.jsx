import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import SidebarMenu from "@/shared/components/SideBar";
import { Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

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
    roles.includes(role),
  );

  if (!currentRole) {
    return (
      <div className="h-svh bg-background">
        <Outlet />
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="h-svh w-full overflow-hidden bg-background">
        {isSidebarVisible ? (
          <ResizablePanelGroup
            direction="horizontal"
            className="flex w-full h-svh min-h-0 overflow-hidden"
          >
            <ResizablePanel
              defaultSize={16}
              minSize={5}
              className="min-w-[3rem] h-svh overflow-hidden"
              maxSize={20}
            >
              <SidebarMenu />
            </ResizablePanel>
            <ResizableHandle />
            <ResizablePanel
              defaultSize={84}
              minSize={80}
              className="flex min-h-0 flex-col"
            >
              <main className="flex-1 min-h-0 flex flex-col">
                <header className="bg-background border-b border-border px-6 py-4 md:hidden">
                  <div className="flex items-center gap-4">
                    {currentRole === "admin" && isSidebarVisible && (
                      <SidebarTrigger className="hover:bg-muted p-2 rounded-lg transition-colors duration-200" />
                    )}
                    <h1 className="text-xl font-semibold text-foreground">
                      {roleTitleMap[currentRole]}
                    </h1>
                  </div>
                </header>
                <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/50">
                  <Outlet />
                </div>
              </main>
            </ResizablePanel>
          </ResizablePanelGroup>
        ) : (
          <main className="h-svh min-h-0 flex flex-col overflow-hidden">
            <header className="bg-background border-b border-border px-6 py-4 md:hidden">
              <div className="flex items-center gap-4">
                {currentRole === "admin" && isSidebarVisible && (
                  <SidebarTrigger className="hover:bg-muted p-2 rounded-lg transition-colors duration-200" />
                )}
                <h1 className="text-xl font-semibold text-foreground">
                  {roleTitleMap[currentRole]}
                </h1>
              </div>
            </header>
            <div className="flex-1 overflow-auto bg-gradient-to-br from-background to-muted/50">
              <Outlet />
            </div>
          </main>
        )}
      </div>
    </SidebarProvider>
  );
}

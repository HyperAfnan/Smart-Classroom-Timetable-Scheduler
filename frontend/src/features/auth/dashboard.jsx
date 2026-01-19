import { Suspense } from "react";
import { useUser } from "./hooks/useAuth";
import { lazy } from "react";
import { Spinner } from "@/components/ui/spinner.jsx";
const AdminDashboard = lazy(() => import("../admin-role/dashboard/page"));
const TeacherDashboard = lazy(() => import("../teacher-role/dashboard/page"));
const StudentDashboard = lazy(() => import("../student-role/dashboard/page"));
const HODDashboard = lazy(() => import("../hod-role/dashboard/page.jsx"));

// BUG: refreshing on admin dashboard returns 404

// BUG: when logged in and navigating to /auth route, also gives 404

// BUG: shows only loading text instead of loader component when opening dashboard

// NOTE: when opening pages, it takes 1-2 seconds to load even on fast connections. Consider optimizing the lazy loading or code splitting strategy.
// FIX: possibilty because we was only using suspense without lazy loading the components

export default function Dashboard() {
  const { role } = useUser();
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner/></div>}>
      {role === "admin" && <AdminDashboard />}
      {role === "teacher" && <TeacherDashboard />}
      {role === "student" && <StudentDashboard />}
      {role === "hod" && <HODDashboard />}
    </Suspense>
  );
}


import { Suspense } from "react";
import { useSelector } from "react-redux";
import { lazy } from "react";
const AdminDashboard = lazy(() => import("../admin-role/dashboard/page"));
const TeacherDashboard = lazy(() => import("../teacher-role/dashboard/page"));
const StudentDashboard = lazy(() => import("../student-role/dashboard/page"));
const HODDashboard = lazy(() => import("../hod-role/dashboard/page.jsx"));

export default function Dashboard() {
  const roles = useSelector((state) => state.auth.roles);

  return (
    <Suspense fallback={<div>Loading...</div>}>
      {roles.includes('admin') && <AdminDashboard />}
      {roles.includes('teacher') && <TeacherDashboard />}
      {roles.includes('student') && <StudentDashboard />}
      {roles.includes('hod') && <HODDashboard />}
    </Suspense>
  );
}

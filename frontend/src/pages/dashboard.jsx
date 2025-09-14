import  { useSelector } from 'react-redux';
import { lazy } from "react";
const AdminDashboard = lazy(() => import("./admindashboard.jsx"));
const TeacherDashboard = lazy(() => import("./teacherDashboard.jsx"));
const StudentDashboard = lazy(() => import("./studentdashboard.jsx"));
const HODDashboard = lazy(() => import("./hoddashboard.jsx"));

export default function Dashboard() {
  const roles = useSelector((state) => state.auth.roles);

   if (roles.includes('admin')) {
       return <AdminDashboard />;  
   }
   if (roles.includes('teacher')) {
      return <TeacherDashboard />
   }
   if (roles.includes('student')) {
      return <StudentDashboard />;
   }
   if (roles.includes('hod')) {
      return <HODDashboard />;
   }
}

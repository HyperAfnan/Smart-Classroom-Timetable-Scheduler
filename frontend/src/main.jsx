import { lazy, StrictMode } from "react";
import { createRoot } from "react-dom/client";
import queryClient from "./config/reactQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import {
  createBrowserRouter,
  Navigate,
  Outlet,
  RouterProvider,
} from "react-router-dom";
import "./index.css";
import { Provider, useSelector } from "react-redux";
import store from "./Store/store.js";
import AuthInitializer from "./components/auth/authInit.jsx";
const TeacherAvailability = lazy(
  () => import("./pages/teacherAvailability.jsx"),
);
const TeacherSchedule = lazy(() => import("./pages/teacherSchedule.jsx"));
const TeacherProfile = lazy(() => import("./pages/teacherProfile.jsx"));
const TeacherNotifications = lazy(
  () => import("./pages/teacherNotifications.jsx"),
);
const TeacherDashboard = lazy(() => import("./pages/teacherDashboard.jsx"));
const Layout = lazy(() => import("./Layout"));
const Landing = lazy(() => import("./pages/landing"));
const Auth = lazy(() => import("./pages/auth"));
const Classes = lazy(() => import("./pages/classes"));
const Dashboard = lazy(() => import("./pages/dashboard"));
const MasterTimetable = lazy(() => import("./pages/mastertimetable"));
const Rooms = lazy(() => import("./pages/rooms"));
const Subjects = lazy(() => import("./pages/subjects"));
const Teachers = lazy(() => import("./features/admin-role/teachers/page.jsx"));
const Timetable = lazy(() => import("./pages/timetable"));

function RequireAuth() {
  const user = useSelector((state) => state.auth.user);
  return user ? <Outlet /> : <Navigate to="/auth" replace />;
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Landing /> },
      { path: "auth", element: <Auth /> },
      {
        path: "dashboard",
        element: <RequireAuth />,
        children: [
          { index: true, element: <Dashboard /> },
          { path: "classes", element: <Classes /> },
          { path: "timetable", element: <MasterTimetable /> },
          { path: "rooms", element: <Rooms /> },
          { path: "subjects", element: <Subjects /> },
          { path: "teachers", element: <Teachers /> },
          { path: "timetablegen", element: <Timetable /> },
          { path: "teacher-availability", element: <TeacherAvailability /> },
          { path: "teacher-schedule", element: <TeacherSchedule /> },
          { path: "teacher-profile", element: <TeacherProfile /> },
          { path: "teacher-notifications", element: <TeacherNotifications /> },
          { path: "teacher-dashboard", element: <TeacherDashboard /> },
        ],
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <AuthInitializer>
          <RouterProvider router={router} />
        </AuthInitializer>
      </Provider>
    </QueryClientProvider>
  </StrictMode>,
);

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
import AuthInitializer from "./features/auth/authInit.jsx";
const TeacherSchedule = lazy(() => import("./features/teacher-role/schedule/page.jsx"));
const TeacherProfile = lazy(() => import("./features/teacher-role/profile/page.jsx"));
const TeacherNotifications = lazy(
  () => import("./features/teacher-role/notification/page.jsx"),
);
const TeacherDashboard = lazy(() => import("./features/teacher-role/dashboard/page"));
const Layout = lazy(() => import("./Layout"));
const Landing = lazy(() => import("./features/landing/landing.jsx"));
const Auth = lazy(() => import("./features/auth/auth.jsx"));
const Classes = lazy(() => import("./features/admin-role/classes/page"));
const Dashboard = lazy(() => import("./features/auth/dashboard.jsx"));
const Timetable = lazy(() => import("./features/admin-role/timetable/page.jsx"));
// const MasterTimetable = lazy(() => import("./features/admin-role/timetable"));
const Rooms = lazy(() => import("./features/admin-role/rooms/page"));
const Subjects = lazy(() => import("./features/admin-role/subjects/page"));
const Teachers = lazy(() => import("./features/admin-role/teachers/page"));

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
          // { path: "timetable", element: <MasterTimetable /> },
          { path: "rooms", element: <Rooms /> },
          { path: "subjects", element: <Subjects /> },
          { path: "teachers", element: <Teachers /> },
          { path: "timetablegen", element: <Timetable /> },
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

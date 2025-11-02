import "./config/wdyr.js";
import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import queryClient from "./config/reactQuery";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ThemeProvider from "./shared/components/ThemeProvider.jsx";
import { setupSentry } from "./config/sentry.js";
import { Spinner } from "./components/ui/spinner.jsx";

const TeacherSchedule = lazy(
   () => import("./features/teacher-role/schedule/page.jsx"),
);
const TeacherNotifications = lazy(
   () => import("./features/teacher-role/notification/page.jsx"),
);
const TeacherDashboard = lazy(
   () => import("./features/teacher-role/dashboard/page"),
);
const Layout = lazy(() => import("./Layout"));
const Landing = lazy(() => import("./features/landing/landing.jsx"));
const Auth = lazy(() => import("./features/auth/auth.jsx"));
const Classes = lazy(() => import("./features/admin-role/classes/page"));
const Dashboard = lazy(() => import("./features/auth/dashboard.jsx"));
const Timetable = lazy(
   () => import("./features/admin-role/timetable/page.jsx"),
);
const TeacherSettings = lazy(
   () => import("./features/teacher-role/settings/page.jsx"),
);
const Rooms = lazy(() => import("./features/admin-role/rooms/page"));
const Subjects = lazy(() => import("./features/admin-role/subjects/page"));
const Teachers = lazy(() => import("./features/admin-role/teachers/page"));
const TimetableViewer = lazy(
   () => import("./features/admin-role/timetableViewer/page.jsx"),
);
const Settings = lazy(() => import("./features/settings/page.jsx"));

function RequireAuth() {
   const user = useSelector((state) => state.auth.user);
   return user ? <Outlet /> : <Navigate to="/auth" replace />;
}

const withSuspense = (Component) => (
   <Suspense fallback={<div className="flex items-center justify-center h-full"><Spinner/></div>}>
      <Component />
   </Suspense>
);

const router = createBrowserRouter([
   {
      path: "/",
      element: <Layout />,
      children: [
         { index: true, element: <Landing /> },
         { path: "auth", element: withSuspense(Auth) },
         { path: "settings", element: withSuspense(Settings) },
         {
            path: "dashboard",
            element: <RequireAuth />,
            children: [
               { index: true, element: <Dashboard /> },
               { path: "classes", element: withSuspense(Classes) },
               { path: "rooms", element: withSuspense(Rooms) },
               { path: "subjects", element: withSuspense(Subjects) },
               { path: "teachers", element: withSuspense(Teachers) },
               { path: "timetablegen", element: withSuspense(Timetable) },
               { path: "timetableViewer", element: withSuspense(TimetableViewer) },
               { path: "teacher-schedule", element: withSuspense(TeacherSchedule) },
               {
                  path: "teacher-notifications",
                  element: withSuspense(TeacherNotifications),
               },
               {
                  path: "teacher-dashboard",
                  element: withSuspense(TeacherDashboard),
               },
               { path: "teacher-settings", element: withSuspense(TeacherSettings) },
            ],
         },
      ],
   },
]);

setupSentry();

createRoot(document.getElementById("root")).render(
   <StrictMode>
      <QueryClientProvider client={queryClient}>
         <Provider store={store}>
            <ThemeProvider>
               <AuthInitializer>
                  <ReactQueryDevtools initialIsOpen={false} />
                  <RouterProvider router={router} />
                  <ToastContainer
                     position="top-right"
                     autoClose={4000}
                     hideProgressBar={true}
                     newestOnTop
                     closeOnClick
                     pauseOnFocusLoss
                     draggable
                     pauseOnHover
                     theme="light"
                  />
               </AuthInitializer>
            </ThemeProvider>
         </Provider>
      </QueryClientProvider>
   </StrictMode>,
);

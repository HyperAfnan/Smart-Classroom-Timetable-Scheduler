import "./config/wdyr.js";
import { StrictMode } from "react";
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
// import { setupSentry } from "./config/sentry.js";
//
// import TeacherSchedule from "./features/teacher-role/schedule/page.jsx";
// import TeacherNotifications from "./features/teacher-role/notification/page.jsx";
// import TeacherDashboard from "./features/teacher-role/dashboard/page";
import Layout from "./Layout";
import Landing from "./features/landing/landing.jsx";
import Auth from "./features/auth/auth.jsx";
// import Classes from "./features/admin-role/classes/page";
import Dashboard from "./features/auth/dashboard.jsx";
// import Timetable from "./features/admin-role/timetable/page.jsx";
// import TeacherSettings from "./features/teacher-role/settings/page.jsx";
// import Rooms from "./features/admin-role/rooms/page";
// import Subjects from "./features/admin-role/subjects/page";
// import Teachers from "./features/admin-role/teachers/page";
// import TimetableViewer from "./features/admin-role/timetableViewer/page.jsx";
// import Settings from "./features/settings/page.jsx";

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
         // { path: "settings", element: <Settings /> },
         {
            path: "dashboard",
            element: <RequireAuth />,
            children: [
               { index: true, element: <Dashboard /> },
               // { path: "classes", element: <Classes /> },
               // { path: "rooms", element: <Rooms /> },
               // { path: "subjects", element: <Subjects /> },
               // { path: "teachers", element: <Teachers /> },
               // { path: "timetablegen", element: <Timetable /> },
               // { path: "timetableViewer", element: <TimetableViewer /> },
               // { path: "teacher-schedule", element: <TeacherSchedule /> },
               // { path: "teacher-notifications", element: <TeacherNotifications />, },
               // { path: "teacher-dashboard", element: <TeacherDashboard />, },
               // { path: "teacher-settings", element: <TeacherSettings /> },
            ],
         },
      ],
   },
]);

// setupSentry();

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

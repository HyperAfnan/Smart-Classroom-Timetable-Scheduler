import { Navigate } from "react-router-dom";
import { useUser } from "@/features/auth/hooks/useAuth";

/**
 * Protected route component that requires authentication and optional role-based access
 * @param {Object} props
 * @param {React.ReactNode} props.children - Child components to render if authorized
 * @param {string[]} [props.allowedRoles] - Optional array of roles that can access this route
 */
export function ProtectedRoute({ children, allowedRoles }) {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

/**
 * Conditional rendering component - only renders children if user is admin
 */
export function AdminOnly({ children }) {
  const { user } = useUser();
  return user?.role === "admin" ? children : null;
}

/**
 * Conditional rendering component - only renders children if user is teacher
 */
export function TeacherOnly({ children }) {
  const { user } = useUser();
  return user?.role === "teacher" ? children : null;
}

/**
 * Conditional rendering component - only renders children if user is HOD
 */
export function HODOnly({ children }) {
  const { user } = useUser();
  return user?.role === "hod" ? children : null;
}

/**
 * Conditional rendering component - only renders children if user is student
 */
export function StudentOnly({ children }) {
  const { user } = useUser();
  return user?.role === "student" ? children : null;
}

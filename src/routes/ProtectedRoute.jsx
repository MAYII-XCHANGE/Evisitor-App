import { Navigate, Outlet, useLocation } from "react-router-dom";
import { TableSkeleton } from "../components/ui/Skeleton";
import { useAuth } from "../hooks/useAuth";

export const ProtectedRoute = ({ allowedRoles, children }) => {
  const location = useLocation();
  const { isAuthenticated, status, user } = useAuth();

  if (status === "loading") return <main className="p-8"><TableSkeleton /></main>;
  if (!isAuthenticated) return <Navigate to="/staff/login" replace state={{ from: location }} />;
  if (allowedRoles?.length && !allowedRoles.includes(user?.role)) return <Navigate to="/unauthorized" replace />;
  return children || <Outlet />;
};

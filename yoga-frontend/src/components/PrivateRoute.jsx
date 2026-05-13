import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

export default function PrivateRoute({ children, adminOnly = false }) {
  const location = useLocation();
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="px-6 pt-32 text-center">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/" replace state={{ from: location }} />;
  }

  if (adminOnly && user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return children || <Outlet />;
}

import { ReactNode } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { ENABLE_AUTH } from "@/config/flags";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (!ENABLE_AUTH) return <>{children}</>;
  if (loading) return null;
  if (!user) return <Navigate to="/auth" state={{ from: location.pathname }} replace />;
  return <>{children}</>;
};

export default ProtectedRoute;

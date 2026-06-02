import { Navigate, Outlet } from "react-router";
import { useAuth } from "../../auth/auth-context";
import { Loader2 } from "lucide-react";

export const RequireAuth = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Outlet />;
};

export const RequireAdmin = () => {
  const { session } = useAuth();
  if (!session) return <Navigate to="/login" replace />;
  if (session.role !== "admin") return <Navigate to="/access-denied" replace />;
  return <Outlet />;
};



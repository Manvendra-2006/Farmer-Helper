import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/Authcontext";

/**
 * Rules:
 *  - not authenticated              -> /login
 *  - authenticated but role missing -> /select-role
 *  - authenticated + role exists    -> render children
 *
 * `loading` is checked FIRST so we never redirect before we actually
 * know the auth state on a hard refresh (avoids the classic
 * "flash redirect to /login then bounce back" bug).
 */
export default function ProtectedRoute({ children, requireRole = true }) {
  const { isAuthenticated, currentUser, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-emerald-50">
        <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !currentUser?.role) {
    return <Navigate to="/select-role" replace />;
  }

  return children;
}
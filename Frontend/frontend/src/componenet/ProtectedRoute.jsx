import { Navigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "../context/Authcontext";
import { hasDistrict, homeRouteFor, isOfficer } from "../utils/roleRouting";

/**
 * Rules:
 *  - not authenticated              -> /login
 *  - authenticated but role missing -> /select-role
 *  - authenticated + role exists, but not in allowedRoles -> role's own home
 *  - authenticated + role exists    -> render children
 *
 * `loading` is checked FIRST so we never redirect before we actually
 * know the auth state on a hard refresh (avoids the classic
 * "flash redirect to /login then bounce back" bug).
 *
 * `allowedRoles` is optional — omit it (or pass nothing) for routes any
 * logged-in role can open, e.g. <ProtectedRoute><Home /></ProtectedRoute>.
 * Pass it to lock a route to specific roles, e.g.
 * <ProtectedRoute allowedRoles={["Officer"]}><CommandCenter /></ProtectedRoute>
 */
export default function ProtectedRoute({
  children,
  requireRole = true,
  allowedRoles,
  requireDistrict = false,
}) {
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

  if (
    allowedRoles &&
    currentUser?.role &&
    !allowedRoles.some(
      (allowedRole) => allowedRole.toLowerCase() === currentUser.role.toLowerCase()
    )
  ) {
    return <Navigate to={homeRouteFor(currentUser)} replace />;
  }

  if (requireDistrict && isOfficer(currentUser) && !hasDistrict(currentUser)) {
    return <Navigate to="/officer/select-district" replace />;
  }

  return children;
}
import { Navigate, Outlet } from 'react-router-dom';
import { getStoredToken, getStoredAuthenticatedUser } from '../../services/api/auth-session';

/**
 * Layer 1 guard: verifies a valid token AND stored user exist.
 * Fails → redirects to /auth/login.
 */
export function RequireAuth() {
  const token = getStoredToken();
  const user  = getStoredAuthenticatedUser();

  if (!token || !user) {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}

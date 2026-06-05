import { Navigate } from 'react-router-dom';
import { getStoredSessionUser } from '../../services/api/auth-session';
import type { UserRole } from '../../types/auth';

interface RoleGuardProps {
  roles: UserRole[];
  /** Where to redirect if role is not allowed. Defaults to the user's home route. */
  fallback?: string;
  children: React.ReactNode;
}

function defaultFallback(role: UserRole | undefined): string {
  if (role === 'Medical Team Manager') return '/dashboard/my-team';
  return '/dashboard';
}

/**
 * Layer 3 guard: per-route role enforcement.
 * Renders children only if the current user's role is in the `roles` array.
 * Otherwise redirects to `fallback` (or the user's home route).
 */
export function RoleGuard({ roles, fallback, children }: RoleGuardProps) {
  const user = getStoredSessionUser();

  if (!user || !roles.includes(user.role)) {
    return <Navigate to={fallback ?? defaultFallback(user?.role)} replace />;
  }

  return <>{children}</>;
}

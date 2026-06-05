import { Navigate, Outlet } from 'react-router-dom';
import { getStoredSessionUser } from '../../services/api/auth-session';

/**
 * Layer 2 guard: blocks Medical Staff from accessing any dashboard route.
 * Medical Staff must use the Flutter mobile app exclusively.
 * Fails → redirects to /unauthorized-dashboard-access.
 */
export function BlockMedicalStaff() {
  const user = getStoredSessionUser();

  if (user?.role === 'Medical Staff') {
    return <Navigate to="/unauthorized-dashboard-access" replace />;
  }

  return <Outlet />;
}

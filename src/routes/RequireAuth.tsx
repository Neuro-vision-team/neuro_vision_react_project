import { Navigate, Outlet } from 'react-router-dom';
import { getSessionUser } from '../services/authMock';

export function RequireAuth() {
  const user = getSessionUser();
  if (!user) return <Navigate to="/auth/login" replace />;
  return <Outlet />;
}

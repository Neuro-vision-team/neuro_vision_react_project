import { getStoredSessionUser } from '../services/api/auth-session';
import type { SessionUser, UserRole } from '../types/auth';

/**
 * Returns the current session user from localStorage.
 * Pure function — not reactive. Call inside components where you need the user.
 */
export function useCurrentUser(): SessionUser | null {
  return getStoredSessionUser();
}

/**
 * Returns true if the current user has one of the given roles.
 */
export function useHasRole(...roles: UserRole[]): boolean {
  const user = getStoredSessionUser();
  return !!user && roles.includes(user.role);
}

/**
 * Returns true if the current user is a Super Admin.
 */
export function useIsAdmin(): boolean {
  return useHasRole('Admin');
}

/**
 * Returns true if the current user is a Medical Team Manager.
 */
export function useIsManager(): boolean {
  return useHasRole('Medical Team Manager');
}

import type { AuthUserRaw, SessionUser, UserRole, BackendRole } from '../../types/auth';
import { ROLE_MAP } from '../../types/auth';

export const TOKEN_KEY           = 'neurovision_token';
export const USER_KEY            = 'neurovision_user';
export const CHALLENGE_ID_KEY    = 'neurovision_2fa_challenge_id';
export const CHALLENGE_EMAIL_KEY = 'neurovision_2fa_email';

// ─── Store / clear ─────────────────────────────────────────────────────────────
export function storeSession(user: AuthUserRaw, token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearSession(): void {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  sessionStorage.removeItem(CHALLENGE_ID_KEY);
  sessionStorage.removeItem(CHALLENGE_EMAIL_KEY);
}

// ─── Read raw user ─────────────────────────────────────────────────────────────
export function getStoredAuthenticatedUser(): AuthUserRaw | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as AuthUserRaw) : null;
  } catch {
    return null;
  }
}

// ─── Read mapped session user ──────────────────────────────────────────────────
export function getStoredSessionUser(): SessionUser | null {
  const user = getStoredAuthenticatedUser();
  if (!user) return null;

  const backendRole = user.role?.name as BackendRole | undefined;
  const role: UserRole = backendRole ? (ROLE_MAP[backendRole] ?? 'Medical Staff') : 'Medical Staff';

  return {
    id:       String(user.id),
    role,
    fullName: user.full_name,
    email:    user.email,
    teamId:   user.team_id ? String(user.team_id) : null,
  };
}

// ─── Token check ──────────────────────────────────────────────────────────────
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

// ─── Post-login route ─────────────────────────────────────────────────────────
export function getPostLoginRoute(user: AuthUserRaw | null | undefined): string {
  const role = user?.role?.name as BackendRole | undefined;
  switch (role) {
    case 'super_admin':          return '/dashboard';
    case 'medical_team_manager': return '/dashboard/my-team';
    case 'medical_staff':        return '/unauthorized-dashboard-access';
    default:                     return '/dashboard';
  }
}

// ─── Legacy alias kept for backward compat with existing pages ─────────────────
export const clearAuthenticatedSession = clearSession;
export const storeAuthenticatedSession = storeSession;

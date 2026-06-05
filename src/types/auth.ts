// ─── Backend role strings ──────────────────────────────────────────────────────
export type BackendRole = 'super_admin' | 'medical_team_manager' | 'medical_staff';

// ─── Frontend role strings ────────────────────────────────────────────────────
export type UserRole = 'Admin' | 'Medical Team Manager' | 'Medical Staff';

// ─── Role mapping ─────────────────────────────────────────────────────────────
export const ROLE_MAP: Record<BackendRole, UserRole> = {
  super_admin:           'Admin',
  medical_team_manager:  'Medical Team Manager',
  medical_staff:         'Medical Staff',
};

// ─── Raw user object returned by backend ──────────────────────────────────────
export type AuthUserRaw = {
  id: number;
  role_id: number;
  team_id: number | null;
  full_name: string;
  email: string;
  two_factor_enabled: boolean;
  status: 'active' | 'suspended';
  created_at: string;
  updated_at: string;
  role: { id: number; name: BackendRole };
  team: Record<string, unknown> | null;
};

// ─── Mapped session user stored in localStorage ───────────────────────────────
export type SessionUser = {
  id: string;
  role: UserRole;
  fullName: string;
  email: string;
  teamId: string | null;
};

// ─── Login request ────────────────────────────────────────────────────────────
export type LoginPayload = {
  email: string;
  password: string;
};

// ─── Login response variants ──────────────────────────────────────────────────
export type LoginSuccessRaw = {
  requires_2fa: false;
  token_type: 'Bearer';
  token: string;
  user: AuthUserRaw;
};

export type Login2FAChallengeRaw = {
  requires_2fa: true;
  challenge_id: string;
};

export type LoginResponseRaw = LoginSuccessRaw | Login2FAChallengeRaw;

// ─── 2FA verify request ───────────────────────────────────────────────────────
export type Verify2FAPayload = {
  challenge_id: string;
  code: string;
};

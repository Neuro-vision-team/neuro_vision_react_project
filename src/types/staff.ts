// ─── Raw staff user from backend ──────────────────────────────────────────────
export type StaffRaw = {
  id: number;
  full_name: string;
  email: string;
  status: 'active' | 'suspended';
  two_factor_enabled: boolean;
  team_id: number | null;
  role: { id: number; name: 'medical_staff' };
  created_at: string;
  updated_at: string;
};

// ─── Mapped staff user ────────────────────────────────────────────────────────
export type Staff = {
  id: string;
  fullName: string;
  email: string;
  status: 'active' | 'suspended';
  twoFactorEnabled: boolean;
  teamId: string | null;
  createdAt: string;
};

// ─── Payloads ─────────────────────────────────────────────────────────────────
export type CreateStaffPayload = {
  full_name: string;
  email: string;
  password: string;
  password_confirmation: string;
};

export type UpdateStaffPayload = {
  full_name?: string;
  email?: string;
};

export type UpdateStaffStatusPayload = {
  status: 'active' | 'suspended';
};

// ─── Mapper ───────────────────────────────────────────────────────────────────
export function mapStaff(raw: StaffRaw): Staff {
  return {
    id:               String(raw.id),
    fullName:         raw.full_name,
    email:            raw.email,
    status:           raw.status,
    twoFactorEnabled: raw.two_factor_enabled,
    teamId:           raw.team_id ? String(raw.team_id) : null,
    createdAt:        raw.created_at,
  };
}

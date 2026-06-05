// ─── Audit log raw from backend ────────────────────────────────────────────────
export type AuditLogUserRaw = {
  id: number;
  full_name: string;
  email: string;
};

export type AuditLogRaw = {
  id: number;
  user_id: number;
  action_type: string;
  description: string;
  recorded_at: string;
  user: AuditLogUserRaw;
};

// ─── Mapped audit log ─────────────────────────────────────────────────────────
export type AuditLog = {
  id: string;
  userId: string;
  actionType: string;
  description: string;
  recordedAt: string;
  userName: string;
  userEmail: string;
};

// ─── Query params ─────────────────────────────────────────────────────────────
export type AuditLogsParams = {
  page?: number;
  action_type?: string;
  user_id?: string;
};

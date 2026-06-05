// ─── Admin dashboard raw response ─────────────────────────────────────────────
export type RiskOverviewRaw = {
  low: number;
  medium: number;
  high: number;
};

export type AuditLogUserRaw = {
  id: number;
  full_name: string;
  email: string;
};

export type AuditLogPreviewRaw = {
  id: number;
  user_id: number;
  action_type: string;
  description: string;
  recorded_at: string;
  user: AuditLogUserRaw;
};

export type AdminDashboardRaw = {
  total_teams: number;
  active_teams: number;
  suspended_teams: number;
  total_users: number;
  total_managers: number;
  total_staff: number;
  total_players: number;
  players_count?: number;  // alias backend sometimes returns
  total_assessments: number;
  risk_overview: RiskOverviewRaw;
  recent_audit_logs: AuditLogPreviewRaw[];
};

// ─── Admin dashboard mapped ───────────────────────────────────────────────────
export type AdminDashboard = {
  totalTeams: number;
  activeTeams: number;
  suspendedTeams: number;
  totalUsers: number;
  totalManagers: number;
  totalStaff: number;
  totalPlayers: number;
  totalAssessments: number;
  riskOverview: { low: number; medium: number; high: number };
  recentAuditLogs: AuditLogPreview[];
};

export type AuditLogPreview = {
  id: string;
  actionType: string;
  description: string;
  recordedAt: string;
  userName: string;
  userEmail: string;
};

// ─── Manager dashboard raw response ───────────────────────────────────────────
export type ManagerDashboardRaw = {
  total_players?: number;
  active_players?: number;
  injured_players?: number;
  total_assessments?: number;
  risk_overview?: RiskOverviewRaw;
};

// ─── Manager dashboard mapped ─────────────────────────────────────────────────
export type ManagerDashboard = {
  totalPlayers: number;
  activePlayers: number;
  injuredPlayers: number;
  totalAssessments: number;
  riskOverview: { low: number; medium: number; high: number };
};

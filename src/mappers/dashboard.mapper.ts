import type {
  AdminDashboardRaw,
  AdminDashboard,
  AuditLogPreviewRaw,
  AuditLogPreview,
  ManagerDashboardRaw,
  ManagerDashboard,
} from '../types/dashboard';

function mapAuditLogPreview(raw: AuditLogPreviewRaw): AuditLogPreview {
  return {
    id:          String(raw.id),
    actionType:  raw.action_type,
    description: raw.description,
    recordedAt:  raw.recorded_at,
    userName:    raw.user.full_name,
    userEmail:   raw.user.email,
  };
}

export function mapAdminDashboard(raw: AdminDashboardRaw): AdminDashboard {
  return {
    totalTeams:       raw.total_teams,
    activeTeams:      raw.active_teams,
    suspendedTeams:   raw.suspended_teams,
    totalUsers:       raw.total_users,
    totalManagers:    raw.total_managers,
    totalStaff:       raw.total_staff,
    totalPlayers:     raw.total_players ?? raw.players_count ?? 0,
    totalAssessments: raw.total_assessments,
    riskOverview: {
      low:    raw.risk_overview.low,
      medium: raw.risk_overview.medium,
      high:   raw.risk_overview.high,
    },
    recentAuditLogs: (raw.recent_audit_logs ?? []).map(mapAuditLogPreview),
  };
}

export function mapManagerDashboard(raw: ManagerDashboardRaw): ManagerDashboard {
  return {
    totalPlayers:     raw.total_players     ?? 0,
    activePlayers:    raw.active_players    ?? 0,
    injuredPlayers:   raw.injured_players   ?? 0,
    totalAssessments: raw.total_assessments ?? 0,
    riskOverview: {
      low:    raw.risk_overview?.low    ?? 0,
      medium: raw.risk_overview?.medium ?? 0,
      high:   raw.risk_overview?.high   ?? 0,
    },
  };
}

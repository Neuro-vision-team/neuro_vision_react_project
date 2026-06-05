import { apiGet, apiPatch, apiPost, apiPut } from './client';
import type { PaginatedRaw } from '../../types/api';
import type { AdminDashboardRaw } from '../../types/dashboard';
import type {
  TeamRaw,
  CreateTeamPayload,
  UpdateTeamPayload,
  TeamStatus,
} from '../../types/team';
import type { AuditLogRaw, AuditLogsParams } from '../../types/auditLog';

// ─── User types (admin context) ────────────────────────────────────────────────
export type AdminUserRaw = {
  id: number;
  full_name: string;
  email: string;
  status: 'active' | 'suspended';
  role: { id: number; name: string };
  team: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

export type CreateManagerPayload = {
  full_name: string;
  email: string;
  password: string;
  status: 'active';
};

export type UsersParams = { page?: number; role?: string };
export type TeamsParams = { page?: number; status?: TeamStatus | '' };

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export function getAdminDashboard(): Promise<AdminDashboardRaw> {
  return apiGet<AdminDashboardRaw>('/admin/dashboard');
}

// ─── Teams ─────────────────────────────────────────────────────────────────────
export function getAdminTeams(params: TeamsParams = {}): Promise<PaginatedRaw<TeamRaw>> {
  const query = new URLSearchParams();
  if (params.page)   query.set('page', String(params.page));
  if (params.status) query.set('status', params.status);
  const qs = query.toString();
  return apiGet<PaginatedRaw<TeamRaw>>(`/admin/teams${qs ? `?${qs}` : ''}`);
}

export function getAdminTeam(id: string): Promise<TeamRaw> {
  return apiGet<TeamRaw>(`/admin/teams/${id}`);
}

export function createAdminTeam(payload: CreateTeamPayload): Promise<TeamRaw> {
  return apiPost<TeamRaw>('/admin/teams', payload);
}

export function updateAdminTeam(id: string, payload: UpdateTeamPayload): Promise<TeamRaw> {
  return apiPut<TeamRaw>(`/admin/teams/${id}`, payload);
}

export function updateAdminTeamStatus(id: string, status: TeamStatus): Promise<TeamRaw> {
  return apiPatch<TeamRaw>(`/admin/teams/${id}/status`, { status });
}

// ─── Users / Managers ─────────────────────────────────────────────────────────
export function getAdminUsers(params: UsersParams = {}): Promise<PaginatedRaw<AdminUserRaw>> {
  const query = new URLSearchParams();
  if (params.page) query.set('page', String(params.page));
  if (params.role) query.set('role', params.role);
  const qs = query.toString();
  return apiGet<PaginatedRaw<AdminUserRaw>>(`/admin/users${qs ? `?${qs}` : ''}`);
}

export function createAdminManager(payload: CreateManagerPayload): Promise<AdminUserRaw> {
  return apiPost<AdminUserRaw>('/admin/managers', payload);
}

export function updateAdminUserStatus(
  id: string,
  status: 'active' | 'suspended',
): Promise<AdminUserRaw> {
  return apiPatch<AdminUserRaw>(`/admin/users/${id}/status`, { status });
}

// ─── Audit logs ────────────────────────────────────────────────────────────────
export function getAdminAuditLogs(
  params: AuditLogsParams = {},
): Promise<PaginatedRaw<AuditLogRaw>> {
  const query = new URLSearchParams();
  if (params.page)        query.set('page', String(params.page));
  if (params.action_type) query.set('action_type', params.action_type);
  if (params.user_id)     query.set('user_id', params.user_id);
  const qs = query.toString();
  return apiGet<PaginatedRaw<AuditLogRaw>>(`/admin/audit-logs${qs ? `?${qs}` : ''}`);
}

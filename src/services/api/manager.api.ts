import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from './client';
import type { PaginatedRaw } from '../../types/api';
import type { ManagerDashboardRaw } from '../../types/dashboard';
import type { TeamRaw } from '../../types/team';
import type { PlayerRaw, CreatePlayerPayload, UpdatePlayerPayload, PlayersParams } from '../../types/player';
import type { AssessmentRaw, AssessmentsParams } from '../../types/assessment';
import type { AssessmentReportRaw } from '../../types/report';
import type {
  StaffRaw,
  CreateStaffPayload,
  UpdateStaffPayload,
  UpdateStaffStatusPayload,
} from '../../types/staff';

// ─── Dashboard ─────────────────────────────────────────────────────────────────
export function getManagerDashboard(): Promise<ManagerDashboardRaw> {
  return apiGet<ManagerDashboardRaw>('/manager/dashboard');
}

// ─── Team ─────────────────────────────────────────────────────────────────────
export function getManagerTeam(): Promise<TeamRaw> {
  return apiGet<TeamRaw>('/manager/team');
}

// ─── Players ──────────────────────────────────────────────────────────────────
export function getManagerPlayers(params: PlayersParams = {}): Promise<PaginatedRaw<PlayerRaw>> {
  const query = new URLSearchParams();
  if (params.page)   query.set('page', String(params.page));
  if (params.search) query.set('search', params.search);
  if (params.status) query.set('status', params.status);
  const qs = query.toString();
  return apiGet<PaginatedRaw<PlayerRaw>>(`/manager/players${qs ? `?${qs}` : ''}`);
}

export function getManagerPlayer(id: string): Promise<PlayerRaw> {
  return apiGet<PlayerRaw>(`/manager/players/${id}`);
}

export function createManagerPlayer(payload: CreatePlayerPayload): Promise<PlayerRaw> {
  return apiPost<PlayerRaw>('/manager/players', payload);
}

export function updateManagerPlayer(id: string, payload: UpdatePlayerPayload): Promise<PlayerRaw> {
  return apiPut<PlayerRaw>(`/manager/players/${id}`, payload);
}

export function deleteManagerPlayer(id: string): Promise<void> {
  return apiDelete<void>(`/manager/players/${id}`);
}

// ─── Assessments ──────────────────────────────────────────────────────────────
export function getManagerAssessments(
  params: AssessmentsParams = {},
): Promise<PaginatedRaw<AssessmentRaw>> {
  const query = new URLSearchParams();
  if (params.page)            query.set('page', String(params.page));
  if (params.status)          query.set('status', params.status);
  if (params.risk_level)      query.set('risk_level', params.risk_level);
  if (params.assessment_type) query.set('assessment_type', params.assessment_type);
  if (params.player_id)       query.set('player_id', params.player_id);
  const qs = query.toString();
  return apiGet<PaginatedRaw<AssessmentRaw>>(`/manager/assessments${qs ? `?${qs}` : ''}`);
}

export function getManagerAssessmentReport(id: string): Promise<AssessmentReportRaw> {
  return apiGet<AssessmentReportRaw>(`/manager/assessments/${id}/report`);
}

// ─── Medical Staff (auto-assigned to manager's team) ──────────────────────────
export function getManagerStaff(): Promise<StaffRaw[]> {
  return apiGet<StaffRaw[]>('/manager/staff');
}

export function createManagerStaff(payload: CreateStaffPayload): Promise<StaffRaw> {
  return apiPost<StaffRaw>('/manager/staff', payload);
}

export function updateManagerStaff(id: string, payload: UpdateStaffPayload): Promise<StaffRaw> {
  return apiPut<StaffRaw>(`/manager/staff/${id}`, payload);
}

export function updateManagerStaffStatus(id: string, payload: UpdateStaffStatusPayload): Promise<StaffRaw> {
  return apiPatch<StaffRaw>(`/manager/staff/${id}/status`, payload);
}

export function deleteManagerStaff(id: string): Promise<void> {
  return apiDelete<void>(`/manager/staff/${id}`);
}

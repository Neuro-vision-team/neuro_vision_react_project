/**
 * Assessments service.
 * Dashboard only DISPLAYS results — no SCAT editing, no PLR upload.
 * Reports are derived from completed assessments via /assessments/:id/report
 * (there is no standalone /reports backend endpoint).
 */
import { apiGet, apiPost } from './client';
import type { PaginatedRaw } from '../../types/api';
import type { AssessmentRaw, AssessmentsParams } from '../../types/assessment';
import type { PlrTestRaw } from '../../types/plr';
import type { ScatOnFieldRaw, ScatOffFieldRaw } from '../../types/scat';
import type { AssessmentReportRaw, CompareReportRaw } from '../../types/report';

// ─── Assessments ──────────────────────────────────────────────────────────────
export function getAssessments(params: AssessmentsParams = {}): Promise<PaginatedRaw<AssessmentRaw>> {
  const query = new URLSearchParams();
  if (params.page)            query.set('page', String(params.page));
  if (params.status)          query.set('status', params.status);
  if (params.risk_level)      query.set('risk_level', params.risk_level);
  if (params.assessment_type) query.set('assessment_type', params.assessment_type);
  if (params.player_id)       query.set('player_id', params.player_id);
  const qs = query.toString();
  return apiGet<PaginatedRaw<AssessmentRaw>>(`/assessments${qs ? `?${qs}` : ''}`);
}

export function getAssessment(id: string): Promise<AssessmentRaw> {
  return apiGet<AssessmentRaw>(`/assessments/${id}`);
}

// ─── Report (display only) ────────────────────────────────────────────────────
export function getAssessmentReport(id: string): Promise<AssessmentReportRaw> {
  return apiGet<AssessmentReportRaw>(`/assessments/${id}/report`);
}

// ─── PLR (display only — no upload) ──────────────────────────────────────────
export function getAssessmentPlr(id: string): Promise<PlrTestRaw[]> {
  return apiGet<PlrTestRaw[]>(`/assessments/${id}/plr`);
}

// ─── SCAT (display only — no form submission) ─────────────────────────────────
export function getAssessmentScatOnField(id: string): Promise<ScatOnFieldRaw | null> {
  return apiGet<ScatOnFieldRaw | null>(`/assessments/${id}/scat/on-field`);
}

export function getAssessmentScatOffField(id: string): Promise<ScatOffFieldRaw | null> {
  return apiGet<ScatOffFieldRaw | null>(`/assessments/${id}/scat/off-field`);
}

// ─── Compare reports ──────────────────────────────────────────────────────────
// Both IDs must belong to the same player — backend enforces this with 422.
export function compareAssessments(ids: [string, string]): Promise<CompareReportRaw> {
  return apiPost<CompareReportRaw>('/reports/compare', { assessment_ids: ids });
}

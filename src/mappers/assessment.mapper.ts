import type { AssessmentRaw, Assessment } from '../types/assessment';
import type { PaginatedRaw, PaginatedResult } from '../types/api';

export function mapAssessment(raw: AssessmentRaw): Assessment {
  const playerName = raw.player
    ? (raw.player as { player_name?: string }).player_name ?? null
    : null;

  const playerPhotoUrl = raw.player
    ? ((raw.player as { photo_url?: string | null }).photo_url ?? null)
    : null;

  const performedByName = raw.performed_by
    ? raw.performed_by.full_name
    : null;

  return {
    id:               String(raw.id),
    playerId:         String(raw.player_id),
    performedByUserId: String(raw.performed_by_user_id),
    assessmentType:   raw.assessment_type,
    finalRiskLevel:   raw.final_risk_level,
    assessmentStatus: raw.assessment_status,
    completionReason: raw.completion_reason,
    startedAt:        raw.started_at,
    completedAt:      raw.completed_at,
    createdAt:        raw.created_at,
    updatedAt:        raw.updated_at,
    playerName,
    playerPhotoUrl,
    performedByName,
  };
}

export function mapPaginatedAssessments(
  raw: PaginatedRaw<AssessmentRaw>,
): PaginatedResult<Assessment> {
  return {
    items:       raw.data.map(mapAssessment),
    currentPage: raw.current_page,
    lastPage:    raw.last_page,
    perPage:     raw.per_page,
    total:       raw.total,
  };
}

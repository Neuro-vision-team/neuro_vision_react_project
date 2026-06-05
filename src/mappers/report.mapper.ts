import type { AssessmentReportRaw, AssessmentReport } from '../types/report';

function getString(obj: Record<string, unknown>, ...keys: string[]): string {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return '';
}

function getNullableString(obj: Record<string, unknown>, ...keys: string[]): string | null {
  for (const key of keys) {
    const val = obj[key];
    if (typeof val === 'string' && val.trim()) return val.trim();
  }
  return null;
}

export function mapAssessmentReport(raw: AssessmentReportRaw): AssessmentReport {
  const assessment = raw.assessment;
  const player     = raw.player as Record<string, unknown>;
  const team       = raw.team as Record<string, unknown>;
  const performer  = raw.performed_by as Record<string, unknown>;

  return {
    assessmentId:        String(assessment.id),
    playerId:            String(assessment.player_id),
    assessmentType:      assessment.assessment_type,
    status:              assessment.assessment_status,
    finalRiskLevel:      raw.final_risk_level,
    completionReason:    raw.completion_reason,
    recommendationSummary: raw.recommendation_summary,
    startedAt:           raw.timestamps.started_at,
    completedAt:         raw.timestamps.completed_at,
    playerName:          getString(player, 'player_name', 'full_name', 'name'),
    playerPhotoUrl:      getNullableString(player, 'photo_url', 'photo'),
    teamName:            getString(team, 'team_name', 'name'),
    performedByName:     getString(performer, 'full_name', 'name'),
  };
}

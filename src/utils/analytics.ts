import type { Assessment } from '../types/assessment';
import type { Player } from '../types/player';
import type {
  AssessmentTrendPoint,
  AssessmentTypeCount,
  PlayerStatusCount,
} from '../types/analytics';

/** Count player statuses for the status distribution chart */
export function buildPlayerStatusCount(players: Player[]): PlayerStatusCount {
  return players.reduce(
    (acc, p) => {
      acc[p.status] += 1;
      return acc;
    },
    { active: 0, injured: 0, suspended: 0 } as PlayerStatusCount,
  );
}

/** Count assessment types for the breakdown chart */
export function buildAssessmentTypeCount(assessments: Assessment[]): AssessmentTypeCount {
  return assessments.reduce(
    (acc, a) => {
      acc[a.assessmentType] += 1;
      return acc;
    },
    { baseline: 0, session: 0 } as AssessmentTypeCount,
  );
}

/** Build a 6-month assessment volume + risk trend from assessment dates */
export function buildAssessmentTrend(assessments: Assessment[]): AssessmentTrendPoint[] {
  const now = new Date();
  const months: AssessmentTrendPoint[] = [];

  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push({
      month: date.toLocaleString('en', { month: 'short' }),
      low: 0, medium: 0, high: 0, total: 0,
    });
  }

  const monthIndex = (iso: string): number => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return -1;
    const diff =
      (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    return diff >= 0 && diff <= 5 ? 5 - diff : -1;
  };

  for (const a of assessments) {
    const idx = monthIndex(a.startedAt ?? a.createdAt);
    if (idx < 0) continue;
    months[idx].total += 1;
    if (a.finalRiskLevel === 'low')    months[idx].low += 1;
    if (a.finalRiskLevel === 'medium') months[idx].medium += 1;
    if (a.finalRiskLevel === 'high')   months[idx].high += 1;
  }

  return months;
}

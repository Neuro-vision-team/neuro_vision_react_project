import type { AssessmentRaw } from './assessment';
import type { PlrTestRaw } from './plr';
import type { ScatOnFieldRaw, ScatOffFieldRaw } from './scat';

// ─── Full assessment report (from /assessments/:id/report) ────────────────────
// Reports are derived from completed assessments — there is no /reports endpoint.
export type AssessmentReportRaw = {
  assessment: AssessmentRaw;
  player: Record<string, unknown>;
  team: Record<string, unknown>;
  performed_by: Record<string, unknown>;
  plr_left: PlrTestRaw | null;
  plr_right: PlrTestRaw | null;
  scat_on_field: ScatOnFieldRaw | null;
  scat_off_field: ScatOffFieldRaw | null;
  plr_tests?: PlrTestRaw[];         // some responses include array instead of left/right
  final_risk_level: string | null;
  completion_reason: string | null;
  timestamps: {
    started_at: string;
    completed_at: string | null;
  };
  recommendation_summary: string | null;
};

// ─── Mapped report ────────────────────────────────────────────────────────────
export type AssessmentReport = {
  assessmentId: string;
  playerId: string;
  assessmentType: string;
  status: string;
  finalRiskLevel: string | null;
  completionReason: string | null;
  recommendationSummary: string | null;
  startedAt: string;
  completedAt: string | null;
  playerName: string;
  playerPhotoUrl: string | null;
  teamName: string;
  performedByName: string;
};

// ─── Compare report raw response ──────────────────────────────────────────────
export type CompareReportRaw = Record<string, unknown>;

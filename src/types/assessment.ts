import type { PlayerRaw } from './player';

// ─── Enumerations ─────────────────────────────────────────────────────────────
export type AssessmentType   = 'baseline' | 'session';
export type AssessmentStatus = 'in_progress' | 'completed' | 'cancelled';
export type RiskLevel        = 'low' | 'medium' | 'high';
export type CompletionReason =
  | 'baseline_completed'
  | 'return_to_play'
  | 'emergency_referral'
  | 'offfield_completed';

// ─── Raw assessment from backend ───────────────────────────────────────────────
export type AssessmentPerformedByRaw = {
  id: number;
  full_name: string;
  email: string;
};

export type AssessmentRaw = {
  id: number;
  player_id: number;
  performed_by_user_id: number;
  assessment_type: AssessmentType;
  final_risk_level: RiskLevel | null;
  assessment_status: AssessmentStatus;
  completion_reason: CompletionReason | null;
  started_at: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  player?: PlayerRaw;
  performed_by?: AssessmentPerformedByRaw;
};

// ─── Mapped assessment ─────────────────────────────────────────────────────────
export type Assessment = {
  id: string;
  playerId: string;
  performedByUserId: string;
  assessmentType: AssessmentType;
  finalRiskLevel: RiskLevel | null;
  assessmentStatus: AssessmentStatus;
  completionReason: CompletionReason | null;
  startedAt: string;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
  playerName: string | null;
  playerPhotoUrl: string | null;
  performedByName: string | null;
};

// ─── Query params ─────────────────────────────────────────────────────────────
export type AssessmentsParams = {
  page?: number;
  status?: AssessmentStatus | '';
  risk_level?: RiskLevel | '';
  assessment_type?: AssessmentType | '';
  player_id?: string;
};

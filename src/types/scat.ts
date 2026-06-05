// ─── SCAT on-field raw response ────────────────────────────────────────────────
export type ScatOnFieldRaw = {
  id: number;
  assessment_id: number;
  red_flags: Record<string, unknown>;
  observable_signs: Record<string, unknown>;
  gcs_attempts: Record<string, unknown>;
  cervical_spine_screen: Record<string, unknown>;
  maddocks_score: number | null;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
};

// ─── SCAT on-field mapped ─────────────────────────────────────────────────────
export type ScatOnField = {
  id: string;
  assessmentId: string;
  redFlags: Record<string, unknown>;
  observableSigns: Record<string, unknown>;
  gcsAttempts: Record<string, unknown>;
  cervicalSpineScreen: Record<string, unknown>;
  maddocksScore: number | null;
  createdAt: string;
};

// ─── SCAT off-field raw response ───────────────────────────────────────────────
export type ScatOffFieldRaw = {
  id: number;
  assessment_id: number;
  symptoms_details: Record<string, { present: boolean; severity: number }>;
  total_symptoms_count: number;
  symptoms_severity_score: number;
  orientation_score: number;
  immediate_memory_trials: number[][];
  immediate_memory_total: number;
  digits_backward_score: number;
  months_backward_score: number;
  concentration_total_score: number;
  coordination_screen: Record<string, unknown>;
  mbess_errors_details: Record<string, number>;
  mbess_total_errors: number;
  delayed_recall_score: number;
  cognitive_total_score: number;
  concussion_diagnosed: 'yes' | 'no' | 'suspected';
  clinical_notes: string;
  raw_payload: unknown;
  created_at: string;
  updated_at: string;
};

// ─── SCAT off-field mapped ────────────────────────────────────────────────────
export type ScatOffField = {
  id: string;
  assessmentId: string;
  symptomsDetails: Record<string, { present: boolean; severity: number }>;
  totalSymptomsCount: number;
  symptomsSeverityScore: number;
  orientationScore: number;
  immediateMemoryTrials: number[][];
  immediateMemoryTotal: number;
  digitsBackwardScore: number;
  monthsBackwardScore: number;
  concentrationTotalScore: number;
  coordinationScreen: Record<string, unknown>;
  mbessErrorsDetails: Record<string, number>;
  mbessTotal: number;
  delayedRecallScore: number;
  cognitiveTotalScore: number;
  concussionDiagnosed: 'yes' | 'no' | 'suspected';
  clinicalNotes: string;
  createdAt: string;
};

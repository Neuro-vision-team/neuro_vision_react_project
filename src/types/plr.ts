import type { RiskLevel } from './assessment';

// ─── Expert rule result ───────────────────────────────────────────────────────
// Note: never use "AI" terminology — this is a Risk Classification result.
// Note: baseline_diameter and baseline_diameter_mm are intentionally excluded.

export type ExpertRuleResultRaw = {
  id: number;
  classification_id: number;
  rule_code: string;
  rule_name: string;
  triggered: boolean;
  explanation: string;
};

export type ExpertRuleResult = {
  id: string;
  ruleCode: string;
  ruleName: string;
  triggered: boolean;
  explanation: string;
};

// ─── Risk classification (formerly "AI Classification") ───────────────────────
export type RiskClassificationRaw = {
  id: number;
  plr_metrics_id: number;
  risk_level: RiskLevel;
  confidence: string;                    // backend returns as decimal string
  recommendation: string;
  reasoning_summary: string;
  model_name: string;
  model_version: string;
  expert_rule_results: ExpertRuleResultRaw[];
};

export type RiskClassification = {
  id: string;
  riskLevel: RiskLevel;
  confidence: number;                    // parsed to number
  recommendation: string;
  reasoningSummary: string;
  modelName: string;
  modelVersion: string;
  expertRuleResults: ExpertRuleResult[];
};

// ─── PLR metrics ─────────────────────────────────────────────────────────────
// baseline_diameter and baseline_diameter_mm are intentionally NOT included.
export type PlrMetricRaw = {
  id: number;
  plr_test_id: number;
  max_diameter_mm: string;
  min_diameter_mm: string;
  constriction_percent: string;
  latency_ms: string;
  peak_constriction_velocity: string;
  avg_constriction_velocity: string;
  avg_dilation_velocity: string;
  peak_dilation_velocity: string;
  t75_seconds: string;
  confidence_score: string;
  // Risk classification — field may come as ai_classification from older backend
  risk_classification?: RiskClassificationRaw;
  ai_classification?: RiskClassificationRaw;
};

export type PlrMetric = {
  id: string;
  maxDiameterMm: number;
  minDiameterMm: number;
  constrictionPercent: number;
  latencyMs: number;
  peakConstrictionVelocity: number;
  avgConstrictionVelocity: number;
  avgDilationVelocity: number;
  peakDilationVelocity: number;
  t75Seconds: number;
  confidenceScore: number;
  riskClassification: RiskClassification | null;
};

// ─── PLR test ─────────────────────────────────────────────────────────────────
export type PlrAnalysisStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'skipped';

export type PlrTestRaw = {
  id: number;
  assessment_id: number;
  captured_by_user_id: number;
  eye_side: 'left' | 'right';
  fps: string;
  duration_seconds: string;
  quality_score: string;
  quality_passed: boolean;
  quality_notes: string | null;
  analysis_status: PlrAnalysisStatus;
  raw_analysis_json: unknown;
  created_at: string;
  updated_at: string;
  plr_metric?: PlrMetricRaw | null;
  // Backend returns the raw eye video URL directly (video_url).
  // processed_video_url is the PLR-analyzed output — dashboard does NOT show it.
  video_url?: string | null;
  processed_video_url?: string | null;
  // Storage path fallbacks — used if backend sends paths instead of full URLs.
  video_path?: string | null;
  processed_video_path?: string | null;
};

export type PlrTest = {
  id: string;
  assessmentId: string;
  eyeSide: 'left' | 'right';
  fps: number;
  durationSeconds: number;
  qualityScore: number;
  qualityPassed: boolean;
  qualityNotes: string | null;
  analysisStatus: PlrAnalysisStatus;
  metric: PlrMetric | null;
  // Video URLs. displayVideoUrl = processedVideoUrl || videoUrl || null
  videoUrl: string | null;
  processedVideoUrl: string | null;
  displayVideoUrl: string | null;
};

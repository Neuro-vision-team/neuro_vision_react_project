import type { RiskLevel } from './assessment';

// ─── Generic chart data point ─────────────────────────────────────────────────
export type ChartDataPoint = {
  label: string;
  value: number;
  color?: string;
};

// ─── Risk distribution ────────────────────────────────────────────────────────
export type RiskDistribution = {
  low: number;
  medium: number;
  high: number;
};

// ─── Assessment over time ─────────────────────────────────────────────────────
export type AssessmentTrendPoint = {
  month: string;        // e.g. "Jan", "Feb"
  low: number;
  medium: number;
  high: number;
  total: number;
};

// ─── Player status distribution ───────────────────────────────────────────────
export type PlayerStatusCount = {
  active: number;
  injured: number;
  suspended: number;
};

// ─── Assessment type breakdown ────────────────────────────────────────────────
export type AssessmentTypeCount = {
  baseline: number;
  session: number;
};

// ─── Expert rule trigger rate ─────────────────────────────────────────────────
export type ExpertRuleStat = {
  ruleCode: string;
  ruleName: string;
  triggerCount: number;
  triggerRate: number;   // 0–100 percent
};

// ─── PLR latency distribution bucket ─────────────────────────────────────────
export type PlrLatencyBucket = {
  range: string;         // e.g. "150–175ms"
  count: number;
};

// ─── SCAT score distribution bucket ──────────────────────────────────────────
export type ScatScoreBucket = {
  range: string;         // e.g. "20–25"
  count: number;
};

// ─── Per-team assessment stats (admin only) ───────────────────────────────────
export type TeamActivityStat = {
  teamName: string;
  totalAssessments: number;
  highRiskCount: number;
};

// ─── Per-staff activity stats (admin only) ────────────────────────────────────
export type StaffActivityStat = {
  staffName: string;
  assessmentCount: number;
};

// ─── Aggregated analytics data ────────────────────────────────────────────────
export type AnalyticsData = {
  riskDistribution: RiskDistribution;
  assessmentTrend: AssessmentTrendPoint[];
  playerStatusCount: PlayerStatusCount;
  assessmentTypeCount: AssessmentTypeCount;
  expertRuleStats: ExpertRuleStat[];
  plrLatencyBuckets: PlrLatencyBucket[];
  scatScoreBuckets: ScatScoreBucket[];
  teamActivity: TeamActivityStat[];       // Admin only
  staffActivity: StaffActivityStat[];     // Admin only
};

// ─── Risk level color map ─────────────────────────────────────────────────────
export const RISK_COLORS: Record<RiskLevel, string> = {
  low:    '#22c55e',   // green-500
  medium: '#f59e0b',   // amber-500
  high:   '#ef4444',   // red-500
};

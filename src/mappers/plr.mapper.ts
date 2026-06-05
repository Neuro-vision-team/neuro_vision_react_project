/**
 * PLR mapper.
 * IMPORTANT:
 *   - "AI Classification" is renamed to "Risk Classification" throughout.
 *   - baseline_diameter and baseline_diameter_mm are intentionally NOT mapped.
 *   - Never add baseline_diameter or baseline_diameter_mm to any mapped type.
 */
import type {
  PlrTestRaw,
  PlrTest,
  PlrMetricRaw,
  PlrMetric,
  RiskClassificationRaw,
  RiskClassification,
  ExpertRuleResultRaw,
  ExpertRuleResult,
} from '../types/plr';

function mapExpertRuleResult(raw: ExpertRuleResultRaw): ExpertRuleResult {
  return {
    id:          String(raw.id),
    ruleCode:    raw.rule_code,
    ruleName:    raw.rule_name,
    triggered:   raw.triggered,
    explanation: raw.explanation,
  };
}

function mapRiskClassification(
  // Accept both field names the backend might use
  raw: RiskClassificationRaw,
): RiskClassification {
  return {
    id:               String(raw.id),
    riskLevel:        raw.risk_level,
    confidence:       parseFloat(raw.confidence),
    recommendation:   raw.recommendation,
    reasoningSummary: raw.reasoning_summary,
    modelName:        raw.model_name,
    modelVersion:     raw.model_version,
    expertRuleResults: (raw.expert_rule_results ?? []).map(mapExpertRuleResult),
  };
}

function mapPlrMetric(raw: PlrMetricRaw): PlrMetric {
  // Resolve risk_classification — backend may return either key
  const rawClassification = raw.risk_classification ?? raw.ai_classification ?? null;

  return {
    id:                        String(raw.id),
    maxDiameterMm:             parseFloat(raw.max_diameter_mm),
    minDiameterMm:             parseFloat(raw.min_diameter_mm),
    constrictionPercent:       parseFloat(raw.constriction_percent),
    latencyMs:                 parseFloat(raw.latency_ms),
    peakConstrictionVelocity:  parseFloat(raw.peak_constriction_velocity),
    avgConstrictionVelocity:   parseFloat(raw.avg_constriction_velocity),
    avgDilationVelocity:       parseFloat(raw.avg_dilation_velocity),
    peakDilationVelocity:      parseFloat(raw.peak_dilation_velocity),
    t75Seconds:                parseFloat(raw.t75_seconds),
    confidenceScore:           parseFloat(raw.confidence_score),
    riskClassification:        rawClassification ? mapRiskClassification(rawClassification) : null,
    // baseline_diameter is intentionally not mapped here
  };
}

export function mapPlrTest(raw: PlrTestRaw): PlrTest {
  // Video playback is handled by PlrEyeVideoCard via the authenticated endpoint:
  //   GET /players/{playerId}/assessments/{assessmentId}/plr/video?eye=left|right
  // displayVideoUrl is kept only for PDF exports / reference — not for the video player.
  const videoUrl          = raw.video_url          ?? raw.video_path           ?? null;
  const processedVideoUrl = raw.processed_video_url ?? raw.processed_video_path ?? null;
  const displayVideoUrl   = videoUrl || processedVideoUrl || null;

  return {
    id:              String(raw.id),
    assessmentId:    String(raw.assessment_id),
    eyeSide:         raw.eye_side,
    fps:             parseFloat(raw.fps),
    durationSeconds: parseFloat(raw.duration_seconds),
    qualityScore:    parseFloat(raw.quality_score),
    qualityPassed:   raw.quality_passed,
    qualityNotes:    raw.quality_notes,
    analysisStatus:  raw.analysis_status,
    metric:          raw.plr_metric ? mapPlrMetric(raw.plr_metric) : null,
    videoUrl,
    processedVideoUrl,
    displayVideoUrl,
  };
}

export function mapPlrTests(raws: PlrTestRaw[]): PlrTest[] {
  return raws.map(mapPlrTest);
}

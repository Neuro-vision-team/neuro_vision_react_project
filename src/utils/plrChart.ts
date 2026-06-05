/**
 * PLR radar/spider chart helpers.
 *
 * Metrics have different units, so values are normalized to a 0–100 scale
 * purely for visual shape comparison between the left and right eye.
 * This is NOT a medical score — label the chart accordingly.
 *
 * No baseline_diameter / baseline_diameter_mm is ever used here.
 */
import type { PlrMetric } from '../types/plr';

// The eight metrics compared on the radar chart.
export type PlrRadarMetricKey =
  | 'constrictionPercent'
  | 'latencyMs'
  | 'peakConstrictionVelocity'
  | 'avgConstrictionVelocity'
  | 'avgDilationVelocity'
  | 'peakDilationVelocity'
  | 't75Seconds'
  | 'confidenceScore';

type MetricConfig = {
  label: string;
  unit: string;
  min: number;
  max: number;
};

// Normalization ranges per metric (clamped, then scaled to 0–100).
const METRIC_CONFIG: Record<PlrRadarMetricKey, MetricConfig> = {
  constrictionPercent:      { label: 'Constriction %',    unit: '%',    min: 0,   max: 100 },
  latencyMs:                { label: 'Latency',           unit: 'ms',   min: 100, max: 500 },
  peakConstrictionVelocity: { label: 'Peak Constrict V',  unit: 'mm/s', min: 0,   max: 10  },
  avgConstrictionVelocity:  { label: 'Avg Constrict V',   unit: 'mm/s', min: 0,   max: 6   },
  avgDilationVelocity:      { label: 'Avg Dilation V',    unit: 'mm/s', min: 0,   max: 4   },
  peakDilationVelocity:     { label: 'Peak Dilation V',   unit: 'mm/s', min: 0,   max: 6   },
  t75Seconds:               { label: 'T75',               unit: 's',    min: 0,   max: 3   },
  confidenceScore:          { label: 'Confidence',        unit: '%',    min: 0,   max: 100 },
};

export type RadarDataPoint = {
  metric: string;
  left: number;     // normalized 0–100
  right: number;    // normalized 0–100
  leftRaw: number;  // original value
  rightRaw: number; // original value
  unit: string;
};

function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/**
 * Normalize a single metric value to the 0–100 chart scale.
 * Confidence may arrive as a 0–1 fraction or a 0–100 value; both are handled.
 */
export function normalizePlrMetric(metricName: PlrRadarMetricKey, value: number): number {
  const cfg = METRIC_CONFIG[metricName];
  if (!cfg || !Number.isFinite(value)) return 0;

  let v = value;
  if (metricName === 'confidenceScore' && v <= 1) v = v * 100;

  const clamped = clamp(v, cfg.min, cfg.max);
  return Math.round(((clamped - cfg.min) / (cfg.max - cfg.min)) * 100);
}

/** Raw value for tooltip display (confidence fraction shown as a percent). */
function rawForDisplay(metricName: PlrRadarMetricKey, value: number): number {
  if (metricName === 'confidenceScore' && value <= 1) return Math.round(value * 100);
  return value;
}

/**
 * Build the radar dataset comparing left vs right eye across all metrics.
 * Both metrics should be present; nulls default to 0.
 */
export function buildPlrRadarData(
  leftMetric: PlrMetric | null,
  rightMetric: PlrMetric | null,
): RadarDataPoint[] {
  const keys: PlrRadarMetricKey[] = [
    'constrictionPercent',
    'latencyMs',
    'peakConstrictionVelocity',
    'avgConstrictionVelocity',
    'avgDilationVelocity',
    'peakDilationVelocity',
    't75Seconds',
    'confidenceScore',
  ];

  return keys.map((key) => {
    const cfg = METRIC_CONFIG[key];
    const leftValue  = leftMetric  ? leftMetric[key]  : 0;
    const rightValue = rightMetric ? rightMetric[key] : 0;

    return {
      metric:   cfg.label,
      left:     normalizePlrMetric(key, leftValue),
      right:    normalizePlrMetric(key, rightValue),
      leftRaw:  rawForDisplay(key, leftValue),
      rightRaw: rawForDisplay(key, rightValue),
      unit:     cfg.unit,
    };
  });
}

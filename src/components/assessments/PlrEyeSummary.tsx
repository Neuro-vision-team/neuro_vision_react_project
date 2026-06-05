/**
 * PLR eye summary — display-only.
 *
 * RULES (strictly enforced):
 * - No "AI" terminology anywhere. Uses "Risk Classification" and "Expert Rule Result".
 * - baseline_diameter and baseline_diameter_mm are NEVER displayed or referenced.
 */
import { Card } from '../ui/Card';
import { RiskBadge } from '../dashboard/RiskBadge';
import { Badge } from '../ui/Badge';
import { formatMm, formatMs, formatNum, formatPercent } from '../../utils/formatters';
import type { PlrTest } from '../../types/plr';

interface MetricRowProps {
  label: string;
  value: string;
}
function MetricRow({ label, value }: MetricRowProps) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/50 py-1.5 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value}</span>
    </div>
  );
}

interface PlrEyeSummaryProps {
  eyeSide: 'left' | 'right';
  test: PlrTest | null | undefined;
}

export function PlrEyeSummary({ eyeSide, test }: PlrEyeSummaryProps) {
  const label = eyeSide === 'left' ? 'Left Eye' : 'Right Eye';

  if (!test) {
    return (
      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-300">{label}</p>
        <p className="text-sm text-slate-500">No PLR data recorded.</p>
      </Card>
    );
  }

  if (test.analysisStatus === 'pending' || test.analysisStatus === 'processing') {
    return (
      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-300">{label}</p>
        <Badge variant="info">Analysis Pending</Badge>
      </Card>
    );
  }

  if (test.analysisStatus === 'failed') {
    return (
      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-300">{label}</p>
        <Badge variant="danger">Analysis Failed</Badge>
        <p className="mt-1 text-xs text-slate-500">The analysis could not be completed for this eye.</p>
      </Card>
    );
  }

  const metric = test.metric;

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">{label}</p>
        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-xs">Quality: {formatPercent(test.qualityScore)}</Badge>
          {metric?.riskClassification && (
            <RiskBadge level={metric.riskClassification.riskLevel} />
          )}
        </div>
      </div>

      {metric ? (
        <>
          <div className="space-y-0">
            <MetricRow label="Max Diameter"             value={formatMm(metric.maxDiameterMm)} />
            <MetricRow label="Min Diameter"             value={formatMm(metric.minDiameterMm)} />
            <MetricRow label="Constriction"             value={formatPercent(metric.constrictionPercent)} />
            <MetricRow label="Latency"                  value={formatMs(metric.latencyMs)} />
            <MetricRow label="Peak Constriction Vel."   value={formatNum(metric.peakConstrictionVelocity, 2)} />
            <MetricRow label="Avg Constriction Vel."    value={formatNum(metric.avgConstrictionVelocity, 2)} />
            <MetricRow label="Avg Dilation Vel."        value={formatNum(metric.avgDilationVelocity, 2)} />
            <MetricRow label="Peak Dilation Vel."       value={formatNum(metric.peakDilationVelocity, 2)} />
            <MetricRow label="T75"                      value={formatNum(metric.t75Seconds, 3) + ' s'} />
            <MetricRow label="Confidence Score"         value={formatPercent(metric.confidenceScore * 100)} />
          </div>

          {/* Risk Classification section — never call this "AI" */}
          {metric.riskClassification && (
            <div className="mt-4 rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                Risk Classification
              </p>
              <p className="text-sm text-slate-200">
                {metric.riskClassification.recommendation}
              </p>
              {metric.riskClassification.reasoningSummary && (
                <p className="mt-1 text-xs text-slate-500">
                  {metric.riskClassification.reasoningSummary}
                </p>
              )}
              <p className="mt-2 text-xs text-slate-600">
                Model: {metric.riskClassification.modelName} v{metric.riskClassification.modelVersion}
              </p>
            </div>
          )}
        </>
      ) : (
        <p className="text-sm text-slate-500">Metrics not available.</p>
      )}
    </Card>
  );
}

/**
 * Displays Risk Classification details for a single PLR eye.
 * "Risk Classification" replaces all former "AI Classification" terminology.
 * "Expert Rule Results" replaces all former "AI Rule" terminology.
 */
import { CheckCircle2, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { RiskBadge } from '../dashboard/RiskBadge';
import { formatPercent } from '../../utils/formatters';
import type { RiskClassification } from '../../types/plr';

interface RiskClassificationCardProps {
  classification: RiskClassification;
  eyeSide?: 'left' | 'right';
}

export function RiskClassificationCard({ classification, eyeSide }: RiskClassificationCardProps) {
  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">
          Risk Classification{eyeSide ? ` — ${eyeSide === 'left' ? 'Left Eye' : 'Right Eye'}` : ''}
        </p>
        <RiskBadge level={classification.riskLevel} />
      </div>

      <div className="mb-3 rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Recommendation</p>
        <p className="text-sm text-slate-200">{classification.recommendation}</p>
        {classification.reasoningSummary && (
          <p className="mt-2 text-xs text-slate-500">{classification.reasoningSummary}</p>
        )}
        <p className="mt-2 text-xs text-slate-600">
          Confidence: {formatPercent(classification.confidence * 100)} ·
          Model: {classification.modelName} v{classification.modelVersion}
        </p>
      </div>

      {/* Expert Rule Results */}
      {classification.expertRuleResults.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Expert Rule Results
          </p>
          <div className="space-y-1.5">
            {classification.expertRuleResults.map((rule) => (
              <div
                key={rule.id}
                className="flex items-start gap-2 rounded-lg border border-slate-700/30 bg-slate-800/20 p-2.5"
              >
                {rule.triggered ? (
                  <XCircle size={14} className="mt-0.5 shrink-0 text-rose-400" />
                ) : (
                  <CheckCircle2 size={14} className="mt-0.5 shrink-0 text-emerald-400" />
                )}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-slate-200">{rule.ruleName}</p>
                  <p className="text-xs text-slate-500">{rule.explanation}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}

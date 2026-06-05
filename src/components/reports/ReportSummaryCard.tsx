import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';
import { Card } from '../ui/Card';
import { RiskBadge } from '../dashboard/RiskBadge';
import { AssessmentStatusBadge } from '../assessments/AssessmentStatusBadge';
import { formatDate } from '../../utils/formatters';
import type { Assessment } from '../../types/assessment';

interface ReportSummaryCardProps {
  assessment: Assessment;
}

export function ReportSummaryCard({ assessment }: ReportSummaryCardProps) {
  return (
    <Card className="transition hover:border-cyan-400/20">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-700/50 bg-slate-800/50 text-slate-400">
          <FileText size={18} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-100">
            {assessment.playerName ?? 'Unknown Player'}
          </p>
          <p className="text-xs text-slate-500 capitalize">
            {assessment.assessmentType} · {formatDate(assessment.completedAt)}
          </p>
        </div>

        <div className="shrink-0">
          <RiskBadge level={assessment.finalRiskLevel} />
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between">
        <AssessmentStatusBadge status={assessment.assessmentStatus} />
        <Link
          to={`/dashboard/reports/${assessment.id}`}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          Open Report →
        </Link>
      </div>
    </Card>
  );
}

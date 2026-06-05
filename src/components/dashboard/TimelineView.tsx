import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn';
import { RiskBadge } from './RiskBadge';
import { formatDate } from '../../utils/formatters';
import { capitalize } from '../../utils/formatters';
import type { Assessment } from '../../types/assessment';

interface TimelineViewProps {
  items: Assessment[];
  className?: string;
}

const STATUS_COLOR: Record<string, string> = {
  completed:   'border-emerald-400/60 bg-emerald-400',
  in_progress: 'border-cyan-400/60 bg-cyan-400',
  cancelled:   'border-slate-500/60 bg-slate-500',
};

export function TimelineView({ items, className }: TimelineViewProps) {
  if (items.length === 0) {
    return <p className="py-8 text-center text-sm text-slate-500">No assessment history.</p>;
  }

  return (
    <ol className={cn('relative border-l border-slate-700/60 space-y-6 pl-6', className)}>
      {items.map((item) => {
        const dotColor = STATUS_COLOR[item.assessmentStatus] ?? STATUS_COLOR.cancelled;
        return (
          <li key={item.id} className="relative">
            {/* Timeline dot */}
            <span
              className={cn(
                'absolute -left-[1.6rem] top-1 h-3 w-3 rounded-full border-2',
                dotColor,
              )}
            />

            <div className="rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-semibold text-slate-100">
                    {capitalize(item.assessmentType)} Assessment
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    {formatDate(item.startedAt)}
                    {item.completedAt && ` — ${formatDate(item.completedAt)}`}
                  </p>
                </div>
                <RiskBadge level={item.finalRiskLevel} />
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                <span className={cn(
                  'rounded-full border px-2 py-0.5',
                  item.assessmentStatus === 'completed'   ? 'border-emerald-400/30 text-emerald-300' :
                  item.assessmentStatus === 'in_progress' ? 'border-cyan-400/30 text-cyan-300' :
                  'border-slate-600 text-slate-400',
                )}>
                  {capitalize(item.assessmentStatus)}
                </span>
                {item.completionReason && (
                  <span>{capitalize(item.completionReason)}</span>
                )}
                {item.performedByName && (
                  <span>By {item.performedByName}</span>
                )}
              </div>

              <Link
                to={`/dashboard/assessments/${item.id}`}
                className="mt-3 inline-flex text-xs font-medium text-cyan-400 hover:text-cyan-300"
              >
                View Assessment →
              </Link>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

import { cn } from '../../utils/cn';
import type { RiskLevel } from '../../types/assessment';

const STYLES: Record<RiskLevel, string> = {
  low:    'bg-emerald-500/15 text-emerald-300 border-emerald-400/25',
  medium: 'bg-amber-500/15 text-amber-300 border-amber-400/25',
  high:   'bg-rose-500/15 text-rose-300 border-rose-400/25',
};

const LABELS: Record<RiskLevel, string> = {
  low:    'Low',
  medium: 'Medium',
  high:   'High',
};

interface RiskBadgeProps {
  level: RiskLevel | null | undefined;
  className?: string;
}

export function RiskBadge({ level, className }: RiskBadgeProps) {
  if (!level) {
    return (
      <span className={cn('inline-flex rounded-full border border-slate-600/40 bg-slate-700/20 px-2.5 py-0.5 text-xs font-semibold text-slate-400', className)}>
        N/A
      </span>
    );
  }

  return (
    <span className={cn('inline-flex rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize', STYLES[level], className)}>
      {LABELS[level]}
    </span>
  );
}

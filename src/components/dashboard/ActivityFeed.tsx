import { cn } from '../../utils/cn';
import { formatRelative } from '../../utils/formatters';
import { RiskBadge } from './RiskBadge';
import type { RiskLevel } from '../../types/assessment';

export type ActivityItem = {
  id: string;
  type: 'assessment_completed' | 'assessment_in_progress' | 'assessment_cancelled' | 'high_risk_flagged' | 'player_added' | 'audit';
  description: string;
  playerName?: string | null;
  riskLevel?: RiskLevel | null;
  timestamp: string;
  assessmentId?: string;
  actor?: string | null;
};

const TYPE_DOT: Record<ActivityItem['type'], string> = {
  assessment_completed:   'bg-emerald-400',
  assessment_in_progress: 'bg-cyan-400',
  assessment_cancelled:   'bg-slate-400',
  high_risk_flagged:      'bg-rose-400',
  player_added:           'bg-violet-400',
  audit:                  'bg-amber-400',
};

interface ActivityFeedProps {
  items: ActivityItem[];
  className?: string;
}

export function ActivityFeed({ items, className }: ActivityFeedProps) {
  if (items.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-slate-500">No recent activity.</p>
    );
  }

  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <div key={item.id} className="flex items-start gap-3">
          <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', TYPE_DOT[item.type])} />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-slate-200 truncate">{item.description}</p>
            {item.actor && <p className="mt-0.5 text-xs text-slate-500">{item.actor}</p>}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {item.riskLevel && <RiskBadge level={item.riskLevel} />}
            <span className="text-xs text-slate-600 whitespace-nowrap">
              {formatRelative(item.timestamp)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

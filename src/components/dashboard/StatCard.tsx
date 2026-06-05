import { cn } from '../../utils/cn';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon?: LucideIcon;
  iconColor?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  iconColor = 'text-cyan-300',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-4',
        'shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
        className,
      )}
    >
      {Icon && (
        <div className={cn('mb-3 w-fit rounded-xl border border-slate-700/40 bg-slate-800/50 p-2', iconColor)}>
          <Icon size={20} />
        </div>
      )}
      <p className="text-sm font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-50">{value}</p>
    </div>
  );
}

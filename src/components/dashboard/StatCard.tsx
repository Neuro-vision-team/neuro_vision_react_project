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
  iconColor = 'text-cyan-600 dark:text-cyan-300',
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl border p-4',
        'border-slate-200/80 bg-white shadow-[0_4px_16px_rgba(31,74,116,0.08)]',
        'dark:border-cyan-400/10 dark:bg-gradient-to-br dark:from-slate-950/80 dark:via-slate-900/70 dark:to-cyan-950/20 dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
        className,
      )}
    >
      {Icon && (
        <div className={cn('mb-3 w-fit rounded-xl border border-slate-200 bg-slate-100 p-2 dark:border-slate-700/40 dark:bg-slate-800/50', iconColor)}>
          <Icon size={20} />
        </div>
      )}
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-1 text-3xl font-bold text-slate-800 dark:text-slate-50">{value}</p>
    </div>
  );
}

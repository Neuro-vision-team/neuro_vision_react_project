import { Card } from '../ui/Card';
import { LoadingState } from '../ui/Spinner';
import { EmptyState } from '../ui/EmptyState';
import { cn } from '../../utils/cn';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  loading?: boolean;
  empty?: boolean;
  emptyMessage?: string;
  height?: number;
  className?: string;
  children: React.ReactNode;
}

export function ChartCard({
  title,
  subtitle,
  loading   = false,
  empty     = false,
  emptyMessage = 'No data yet.',
  height    = 280,
  className,
  children,
}: ChartCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <div className="mb-4">
        <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
        {subtitle && <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>

      {loading ? (
        <div style={{ height }}><LoadingState /></div>
      ) : empty ? (
        <div style={{ height }}>
          <EmptyState title="No data" message={emptyMessage} className="py-8" />
        </div>
      ) : (
        <div style={{ height }}>{children}</div>
      )}
    </Card>
  );
}

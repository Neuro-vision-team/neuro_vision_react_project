import { cn } from '../../utils/cn';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

const VARIANTS: Record<BadgeVariant, string> = {
  default: 'bg-cyan-500/15 text-cyan-300 border-cyan-400/20',
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  warning: 'bg-amber-500/15 text-amber-300 border-amber-400/20',
  danger:  'bg-rose-500/15 text-rose-300 border-rose-400/20',
  info:    'bg-sky-500/15 text-sky-300 border-sky-400/20',
  neutral: 'bg-slate-500/15 text-slate-300 border-slate-400/20',
};

interface BadgeProps {
  variant?: BadgeVariant;
  className?: string;
  children: React.ReactNode;
}

export function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        VARIANTS[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}

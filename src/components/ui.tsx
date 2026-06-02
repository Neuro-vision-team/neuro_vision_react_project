import { motion } from 'framer-motion';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../utils/cn';

export function GlassCard({ className, children }: React.PropsWithChildren<{ className?: string }>) {
  return <div className={cn('glass rounded-2xl p-4 shadow-[0_10px_40px_rgba(0,0,0,0.35)]', className)}>{children}</div>;
}

export function RiskBadge({ level }: { level: 'low' | 'medium' | 'high' }) {
  const styles = {
    low: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30',
    medium: 'bg-amber-500/20 text-amber-300 border-amber-400/30',
    high: 'bg-rose-500/20 text-rose-300 border-rose-400/30',
  };
  return <span className={cn('rounded-full border px-2 py-1 text-xs capitalize', styles[level])}>{level}</span>;
}

export function StatCard({ label, value, trend }: { label: string; value: number; trend: number }) {
  const positive = trend >= 0;
  return (
    <motion.div whileHover={{ y: -5 }} className="neon-border rounded-2xl p-4">
      <p className="text-sm theme-muted">{label}</p>
      <div className="mt-2 flex items-end justify-between">
        <p className="text-3xl font-semibold">{value}</p>
        <span className={cn('flex items-center gap-1 text-sm', positive ? 'text-emerald-300' : 'text-rose-300')}>
          {positive ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />} {Math.abs(trend)}%
        </span>
      </div>
    </motion.div>
  );
}

export function PageTitle({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-sm theme-muted">{subtitle}</p>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn('theme-card animate-pulse rounded-xl', className)} />;
}

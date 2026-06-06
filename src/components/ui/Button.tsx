import { cn } from '../../utils/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'outline';
type Size    = 'sm' | 'md' | 'lg';

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-cyan-50 border-cyan-300 text-cyan-700 hover:bg-cyan-100 hover:border-cyan-400 ' +
    'dark:bg-cyan-500/20 dark:border-cyan-400/30 dark:text-cyan-100 dark:hover:bg-cyan-500/30 dark:hover:border-cyan-400/50',
  secondary:
    'bg-slate-100 border-slate-300 text-slate-700 hover:bg-slate-200 hover:border-slate-400 ' +
    'dark:bg-slate-800/60 dark:border-slate-700/60 dark:text-slate-200 dark:hover:bg-slate-700/60 dark:hover:border-slate-600',
  ghost:
    'border-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 ' +
    'dark:text-slate-300 dark:hover:bg-slate-800/50 dark:hover:text-slate-100',
  destructive:
    'bg-rose-50 border-rose-300 text-rose-700 hover:bg-rose-100 hover:border-rose-400 ' +
    'dark:bg-rose-500/15 dark:border-rose-500/30 dark:text-rose-300 dark:hover:bg-rose-500/25 dark:hover:border-rose-400/50',
  outline:
    'border-slate-400 text-slate-700 hover:border-cyan-500/60 hover:text-slate-900 ' +
    'dark:border-slate-600 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-slate-100',
};

const SIZES: Record<Size, string> = {
  sm:  'px-3 py-1.5 text-xs',
  md:  'px-4 py-2 text-sm',
  lg:  'px-5 py-2.5 text-base',
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

export function Button({
  variant = 'primary',
  size    = 'md',
  loading = false,
  disabled,
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl border font-semibold transition',
        'disabled:cursor-not-allowed disabled:opacity-50',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
    >
      {loading && (
        <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </button>
  );
}

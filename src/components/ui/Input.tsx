import { cn } from '../../utils/cn';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          'h-11 w-full rounded-xl border px-4 text-sm outline-none transition',
          'border-slate-300 bg-white text-slate-900 placeholder:text-slate-400',
          'dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100 dark:placeholder:text-slate-500',
          'focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20',
          'dark:focus:border-cyan-400/50 dark:focus:ring-cyan-400/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-400/20 dark:border-rose-500/60 dark:focus:border-rose-400/60 dark:focus:ring-rose-400/20',
          className,
        )}
      />
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
}

export function Select({ label, error, className, id, children, ...props }: SelectProps) {
  const selectId = id ?? label?.toLowerCase().replace(/\s+/g, '-');
  return (
    <div className="w-full space-y-1">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={cn(
          'h-11 w-full rounded-xl border px-4 text-sm outline-none transition',
          'border-slate-300 bg-white text-slate-900',
          'dark:border-slate-700/60 dark:bg-slate-900/70 dark:text-slate-100',
          'focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/20',
          'dark:focus:border-cyan-400/50 dark:focus:ring-cyan-400/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-rose-400 dark:border-rose-500/60',
          className,
        )}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>}
    </div>
  );
}

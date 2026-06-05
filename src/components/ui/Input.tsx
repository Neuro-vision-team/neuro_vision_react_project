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
        <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={cn(
          'h-11 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 text-sm text-slate-100',
          'placeholder:text-slate-500 outline-none transition',
          'focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-rose-500/60 focus:border-rose-400/60 focus:ring-rose-400/20',
          className,
        )}
      />
      {error && <p className="text-xs text-rose-400">{error}</p>}
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
        <label htmlFor={selectId} className="block text-xs font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </label>
      )}
      <select
        id={selectId}
        {...props}
        className={cn(
          'h-11 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 text-sm text-slate-100',
          'outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20',
          'disabled:cursor-not-allowed disabled:opacity-50',
          error && 'border-rose-500/60',
          className,
        )}
      >
        {children}
      </select>
      {error && <p className="text-xs text-rose-400">{error}</p>}
    </div>
  );
}

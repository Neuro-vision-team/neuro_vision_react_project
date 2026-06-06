import { cn } from '../../utils/cn';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glass?: boolean;
}

export function Card({ glass = true, className, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'rounded-2xl border p-4',
        glass
          ? 'border-slate-200/80 bg-white shadow-[0_8px_32px_rgba(31,74,116,0.08)] dark:border-cyan-400/10 dark:bg-slate-900 dark:shadow-[0_8px_32px_rgba(0,0,0,0.22)]'
          : 'border-slate-200 bg-white shadow-[0_4px_16px_rgba(31,74,116,0.10)] dark:border-slate-700/50 dark:bg-slate-900',
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn('mb-4', className)}>
      {children}
    </div>
  );
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 {...props} className={cn('text-lg font-semibold text-slate-900 dark:text-slate-50', className)}>
      {children}
    </h3>
  );
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div {...props} className={cn(className)}>
      {children}
    </div>
  );
}

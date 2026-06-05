import { cn } from '../../utils/cn';

interface AvatarProps {
  src?: string | null;
  name?: string | null;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const SIZE_CLASSES = {
  sm:  'h-8 w-8 text-xs',
  md:  'h-10 w-10 text-sm',
  lg:  'h-14 w-14 text-base',
  xl:  'h-20 w-20 text-xl',
};

function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function Avatar({ src, name, size = 'md', className }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name ?? 'avatar'}
        className={cn(
          'rounded-full object-cover border border-slate-700/50',
          SIZE_CLASSES[size],
          className,
        )}
        onError={(e) => {
          // If image fails to load, hide it and show initials fallback
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-500/15 font-semibold text-cyan-300',
        SIZE_CLASSES[size],
        className,
      )}
    >
      {getInitials(name)}
    </div>
  );
}

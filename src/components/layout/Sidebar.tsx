import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';
import { NAV_ITEMS } from '../../config/navigation';
import { useUiStore } from '../../store/uiStore';
import { useI18n } from '../../hooks/useI18n';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { cn } from '../../utils/cn';

export function Sidebar() {
  const { t, isArabic } = useI18n();
  const theme       = useUiStore((s) => s.theme);
  const sidebarOpen = useUiStore((s) => s.sidebarOpen);
  const setSidebarOpen = useUiStore((s) => s.setSidebarOpen);
  const user        = useCurrentUser();
  const dark        = theme === 'dark';

  const visibleItems = NAV_ITEMS.filter(
    (item) => user && item.roles.includes(user.role),
  );

  const sidebarClass = cn(
    'fixed top-3 h-[calc(100vh-1.5rem)] w-[17rem] flex flex-col overflow-hidden rounded-[1.75rem] border backdrop-blur-xl z-40 transition-transform duration-300',
    isArabic ? 'right-3' : 'left-3',
    dark
      ? 'border-cyan-400/10 bg-gradient-to-br from-slate-950/90 via-slate-900/80 to-cyan-950/20 shadow-[0_20px_60px_rgba(0,0,0,0.4)]'
      : 'border-slate-200 bg-white/95 shadow-[0_20px_60px_rgba(31,74,116,0.14)]',
    // Mobile: hidden by default, visible when open
    'max-md:hidden',
    // Mobile overlay when open
    sidebarOpen && 'max-md:flex',
  );

  return (
    <>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={sidebarClass}>
        {/* Header */}
        <div className={cn('border-b p-4', dark ? 'border-cyan-400/10' : 'border-slate-200')}>
          <div className={cn(
            'rounded-2xl border px-4 py-3',
            dark
              ? 'border-cyan-400/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)]'
              : 'border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(15,122,168,0.08),transparent_40%)]',
          )}>
            <p className={cn('text-[10px] font-bold uppercase tracking-[0.3em]', dark ? 'text-cyan-300/80' : 'text-cyan-700')}>
              Neuro Vision
            </p>
            <h2 className={cn('mt-1 text-lg font-black tracking-tight', dark ? 'text-slate-50' : 'text-slate-900')}>
              {user?.role === 'Admin' ? 'Admin Panel' : 'Team Manager'}
            </h2>
            <p className={cn('mt-0.5 text-xs truncate', dark ? 'text-slate-400' : 'text-slate-500')}>
              {user?.fullName}
            </p>
          </div>
          {/* Mobile close */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            className="absolute right-4 top-4 rounded-lg p-1 text-slate-400 hover:text-slate-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {visibleItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl border px-4 py-2.5 text-sm font-semibold transition',
                  dark
                    ? isActive
                      ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_8px_24px_rgba(6,182,212,0.16)]'
                      : 'border-slate-700/50 bg-slate-950/30 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-slate-50'
                    : isActive
                      ? 'border-cyan-400/30 bg-cyan-50 text-cyan-800'
                      : 'border-slate-200 bg-white/75 text-slate-600 hover:border-cyan-400/30 hover:bg-cyan-50 hover:text-slate-900',
                )
              }
            >
              <item.icon size={16} className="shrink-0" />
              <span>{t(item.labelKey)}</span>
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

import { Languages, LogOut, Menu, Moon, Sun, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useI18n } from '../../hooks/useI18n';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { cn } from '../../utils/cn';

interface TopbarProps {
  onLogout: () => void;
}

export function Topbar({ onLogout }: TopbarProps) {
  const { t, isArabic, language, toggleLanguage } = useI18n();
  const theme          = useUiStore((s) => s.theme);
  const toggleTheme    = useUiStore((s) => s.toggleTheme);
  const toggleSidebar  = useUiStore((s) => s.toggleSidebar);
  const dark           = theme === 'dark';
  const user           = useCurrentUser();
  const [dropOpen, setDropOpen] = useState(false);

  return (
    <header
      className={cn(
        'theme-surface fixed top-3 z-30 flex h-14 items-center justify-end gap-2 rounded-2xl border px-4',
        'backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
        dark ? 'border-cyan-400/10' : 'border-slate-200',
      )}
      style={{
        left:  isArabic ? '0.75rem' : 'calc(17rem + 1.5rem)',
        right: isArabic ? 'calc(17rem + 1.5rem)' : '0.75rem',
      }}
    >
      {/* Mobile hamburger */}
      <button
        type="button"
        onClick={toggleSidebar}
        className="rounded-lg border border-slate-700/60 p-2 text-slate-400 hover:text-slate-100 md:hidden"
        aria-label="Toggle menu"
      >
        <Menu size={16} />
      </button>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className="rounded-xl border border-slate-700/60 px-3 py-2 text-slate-300 hover:border-cyan-400/40 hover:text-slate-100 transition"
        title={dark ? t('Switch to light theme') : t('Switch to dark theme')}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Language toggle */}
      <button
        type="button"
        onClick={toggleLanguage}
        className="rounded-xl border border-slate-700/60 px-3 py-2 text-slate-300 hover:border-cyan-400/40 hover:text-slate-100 transition"
        title={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
      >
        <Languages size={15} />
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropOpen((v) => !v)}
          className="rounded-xl border border-slate-700/60 p-2 text-slate-300 hover:border-cyan-400/40 hover:text-slate-100 transition"
        >
          <UserCircle2 size={18} />
        </button>

        {dropOpen && (
          <div className={cn(
            'absolute mt-2 w-56 rounded-2xl border p-3 shadow-2xl z-50',
            isArabic ? 'left-0' : 'right-0',
            dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-200 bg-white',
          )}>
            <p className="text-sm font-semibold text-slate-100">{user?.fullName}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
            <p className="mt-0.5 text-xs font-medium text-cyan-400">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className="flex items-center gap-1.5 rounded-xl border border-slate-700/60 px-3 py-2 text-sm text-slate-300 hover:border-rose-400/40 hover:text-rose-300 transition"
      >
        <LogOut size={14} />
        {t('Logout')}
      </button>
    </header>
  );
}

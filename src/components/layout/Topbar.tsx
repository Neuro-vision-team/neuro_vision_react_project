import { Languages, LogOut, Menu, Moon, Sun, UserCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useUiStore } from '../../store/uiStore';
import { useI18n } from '../../hooks/useI18n';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { cn } from '../../utils/cn';

interface TopbarProps {
  onLogout: () => void;
}

const iconBtnClass =
  'rounded-xl border px-3 py-2 transition ' +
  'border-slate-300 text-slate-600 hover:border-cyan-500/50 hover:text-slate-900 ' +
  'dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-slate-100';

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
        'backdrop-blur-xl shadow-[0_8px_24px_rgba(0,0,0,0.1)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.2)]',
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
        className={cn(iconBtnClass, 'md:hidden')}
        aria-label="Toggle menu"
      >
        <Menu size={16} />
      </button>

      <div className="flex-1" />

      {/* Theme toggle */}
      <button
        type="button"
        onClick={toggleTheme}
        className={iconBtnClass}
        title={dark ? t('Switch to light theme') : t('Switch to dark theme')}
      >
        {dark ? <Sun size={15} /> : <Moon size={15} />}
      </button>

      {/* Language toggle */}
      <button
        type="button"
        onClick={toggleLanguage}
        className={iconBtnClass}
        title={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
      >
        <Languages size={15} />
      </button>

      {/* User dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setDropOpen((v) => !v)}
          className={cn(iconBtnClass, 'p-2')}
        >
          <UserCircle2 size={18} />
        </button>

        {dropOpen && (
          <div className={cn(
            'absolute mt-2 w-56 rounded-2xl border p-3 shadow-2xl z-50',
            isArabic ? 'left-0' : 'right-0',
            dark ? 'border-slate-700/60 bg-slate-900' : 'border-slate-200 bg-white',
          )}>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{user?.fullName}</p>
            <p className="mt-0.5 truncate text-xs text-slate-500">{user?.email}</p>
            <p className="mt-0.5 text-xs font-medium text-cyan-600 dark:text-cyan-400">{user?.role}</p>
          </div>
        )}
      </div>

      {/* Logout */}
      <button
        type="button"
        onClick={onLogout}
        className={cn(
          iconBtnClass,
          'flex items-center gap-1.5 text-sm',
          'hover:border-rose-300 hover:text-rose-600 dark:hover:border-rose-400/40 dark:hover:text-rose-300',
        )}
      >
        <LogOut size={14} />
        {t('Logout')}
      </button>
    </header>
  );
}

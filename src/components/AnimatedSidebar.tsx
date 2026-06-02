import { NavLink } from 'react-router-dom';
import { ClipboardList, LineChart, Users } from 'lucide-react';
import type { UserRole } from '../services/authMock';
import { useI18n } from '../app/i18n';
import { useUiStore } from '../store/uiStore';

interface AnimatedSidebarProps {
  role: UserRole;
}

const managerItems = [
  ['/dashboard/my-team', 'My Team', Users],
  ['/dashboard/assessments', 'Assessments', ClipboardList],
  ['/dashboard/baseline', 'Baseline', LineChart],
] as const;

export function AnimatedSidebar({ role }: AnimatedSidebarProps) {
  const { t, isArabic } = useI18n();
  const theme = useUiStore((state) => state.theme);
  const isDarkTheme = theme === 'dark';
  const items = role === 'Medical Team Manager' ? managerItems : managerItems;

  return (
    <aside
      className={`hidden md:flex md:w-[18rem] md:flex-col md:fixed md:top-3 md:h-[calc(100vh-1.5rem)] overflow-hidden rounded-[2rem] border backdrop-blur-xl ${
        isDarkTheme
          ? 'border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 shadow-[0_20px_60px_rgba(0,0,0,0.22)]'
          : 'border-slate-200 bg-gradient-to-br from-white via-slate-50 to-cyan-50/70 shadow-[0_20px_60px_rgba(31,74,116,0.12)]'
      } ${
        isArabic ? 'md:right-3' : 'md:left-3'
      }`}
    >
      <div className={`border-b p-3.5 ${isDarkTheme ? 'border-cyan-400/10' : 'border-slate-200'}`}>
        <div
          className={`rounded-[1.5rem] border px-4 py-3.5 ${
            isDarkTheme
              ? 'border-cyan-400/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)]'
              : 'border-slate-200 bg-[radial-gradient(circle_at_top_right,rgba(15,122,168,0.08),transparent_40%)]'
          }`}
        >
          <p className={`text-[11px] font-semibold uppercase tracking-[0.3em] ${isDarkTheme ? 'text-cyan-300/80' : 'text-cyan-700'}`}>{t('Neuro Vision')}</p>
          <h2 className={`mt-2 text-[1.35rem] font-black tracking-tight ${isDarkTheme ? 'text-slate-50' : 'text-slate-900'}`}>{t('Team Manager')}</h2>
          <p className={`mt-1 text-sm ${isDarkTheme ? 'text-slate-300' : 'text-slate-600'}`}>{t('Live team oversight')}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-2 p-3.5">
        {items.map(([to, label, Icon]) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
                isDarkTheme
                  ? isActive
                    ? 'border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_12px_30px_rgba(6,182,212,0.16)]'
                    : 'border-slate-700/50 bg-slate-950/30 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-slate-50'
                  : isActive
                    ? 'border-cyan-400/30 bg-cyan-50 text-cyan-800 shadow-[0_12px_30px_rgba(15,122,168,0.12)]'
                    : 'border-slate-200 bg-white/75 text-slate-600 hover:border-cyan-400/30 hover:bg-cyan-50 hover:text-slate-900'
              }`
            }
          >
            <Icon size={17} className="text-inherit" />
            <span>{t(label)}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Languages, Moon, Sun } from 'lucide-react';
import { AnimatedSidebar } from '../components/AnimatedSidebar';
import { Topbar } from '../components/Topbar';
import { getSessionUser, logout } from '../services/authMock';
import AdminWorkspacePage from '../pages/AdminWorkspacePage';
import { useI18n } from '../app/i18n';
import { useUiStore } from '../store/uiStore';

export function MainLayout() {
  const { t, isArabic, language, toggleLanguage } = useI18n();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const navigate = useNavigate();
  const [refreshSession, setRefreshSession] = useState(0);
  const sessionUser = getSessionUser();

  const onLogout = () => {
    logout();
    navigate('/auth/login', { replace: true });
  };

  if (sessionUser?.role === 'Admin') {
    return (
      <div className="min-h-screen" dir={isArabic ? 'rtl' : 'ltr'}>
        <header className={`theme-surface fixed top-0 z-40 flex h-16 items-center border-b border-cyan-400/10 px-4 backdrop-blur-xl ${isArabic ? 'left-0 right-[19.5rem]' : 'left-[19.5rem] right-0'}`}>
          <div className={`flex w-full items-center gap-3 ${isArabic ? 'justify-start' : 'justify-end'}`}>
            <button
              onClick={toggleTheme}
              className="theme-surface-soft rounded-xl border px-3 py-2 hover:opacity-90"
              title={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
              aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={toggleLanguage}
              className="theme-surface-soft rounded-xl border px-3 py-2 hover:opacity-90"
              title={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
              aria-label={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
            >
              <Languages size={16} />
            </button>
            <button onClick={onLogout} className="theme-surface-soft rounded-xl border px-4 py-2 text-sm hover:opacity-90">{t('Logout')}</button>
          </div>
        </header>
        <main className="min-h-screen px-4 pb-6 pt-24 lg:px-6">
          <div className="min-h-[calc(100vh-5rem)]">
            <AdminWorkspacePage />
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" dir={isArabic ? 'rtl' : 'ltr'}>
      <AnimatedSidebar role={sessionUser?.role ?? 'Medical Team Manager'} />
      <div
        className={`flex-1 ${isArabic ? 'md:pr-[19.5rem]' : 'md:pl-[19.5rem]'}`}
      >
        <Topbar key={refreshSession} onLogout={onLogout} sessionUser={sessionUser} onSessionUpdated={() => setRefreshSession((n) => n + 1)} />
        <main className="min-h-screen px-4 pb-6 pt-24 lg:px-6"><Outlet /></main>
      </div>
    </div>
  );
}

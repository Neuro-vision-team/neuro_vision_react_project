import { useState } from 'react';
import { Languages, LogOut, Moon, Sun, UserCircle2 } from 'lucide-react';
import type { SessionUser } from '../services/authMock';
import { updateSessionUserCredential } from '../services/authMock';
import { useUiStore } from '../store/uiStore';
import { useI18n } from '../app/i18n';

interface TopbarProps {
  onLogout: () => void;
  sessionUser: SessionUser | null;
  onSessionUpdated: () => void;
}

export function Topbar({ onLogout, sessionUser, onSessionUpdated }: TopbarProps) {
  const { t, isArabic, language, toggleLanguage } = useI18n();
  const theme = useUiStore((state) => state.theme);
  const isDarkTheme = theme === 'dark';
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const [open, setOpen] = useState(false);
  const [fullName, setFullName] = useState(sessionUser?.fullName ?? '');
  const [email, setEmail] = useState(sessionUser?.email ?? '');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  const onSave = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!sessionUser) return;
    setErr('');
    setMsg('');

    try {
      updateSessionUserCredential({
        userId: sessionUser.id,
        fullName: fullName.trim(),
        email: email.trim(),
        password: password || 'changeme123',
      });
      setPassword('');
      setMsg(t('Credentials updated.'));
      onSessionUpdated();
    } catch (e) {
      setErr(e instanceof Error ? e.message : t('Could not update credentials.'));
    }
  };

  return (
    <header
      className="theme-surface fixed z-30 flex h-16 items-center justify-end gap-3 rounded-[1.75rem] border border-cyan-400/10 px-4 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
      style={{
        top: '0.75rem',
        left: isArabic ? '0.75rem' : 'calc(19.5rem + 0.75rem)',
        right: isArabic ? 'calc(19.5rem + 0.75rem)' : '0.75rem',
      }}
    >
      <button onClick={toggleTheme} className="rounded-lg border px-3 py-2 theme-surface-soft" title={theme === 'dark' ? t('Switch to light theme') : t('Switch to dark theme')}>
        {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
      </button>

      <button
        onClick={toggleLanguage}
        className="rounded-lg border px-3 py-2 theme-surface-soft"
        title={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
        aria-label={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
      >
        <Languages size={16} />
      </button>

      <div className="relative">
        <button onClick={() => setOpen((v) => !v)} className="rounded-lg p-2 hover:opacity-80">
          <UserCircle2 size={22} />
        </button>

        {open ? (
          <div className={`theme-surface absolute mt-2 w-80 rounded-[1.35rem] border p-4 shadow-2xl ${isArabic ? 'left-0' : 'right-0'}`}>
            <p className={`text-sm font-medium ${isDarkTheme ? 'text-slate-100' : 'text-slate-900'}`}>{sessionUser?.role ?? t('User')}</p>
            <form className="mt-3 space-y-2" onSubmit={onSave}>
              <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="theme-surface-soft w-full rounded-lg border p-2 text-sm" placeholder={t('Full name')} required />
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="theme-surface-soft w-full rounded-lg border p-2 text-sm" placeholder={t('Email')} type="email" required />
              <input value={password} onChange={(e) => setPassword(e.target.value)} className="theme-surface-soft w-full rounded-lg border p-2 text-sm" placeholder={t('New password')} type="password" required />
              <button className={`w-full rounded-lg p-2 text-sm transition ${isDarkTheme ? 'bg-cyan-500/30 hover:bg-cyan-500/40' : 'bg-cyan-50 text-cyan-800 hover:bg-cyan-100'}`} type="submit">{t('Update Credentials')}</button>
            </form>
            {err ? <p className={`mt-2 text-xs ${isDarkTheme ? 'text-rose-300' : 'text-rose-700'}`}>{err}</p> : null}
            {msg ? <p className={`mt-2 text-xs ${isDarkTheme ? 'text-emerald-300' : 'text-emerald-700'}`}>{msg}</p> : null}
          </div>
        ) : null}
      </div>

      <button onClick={onLogout} className="theme-surface-soft rounded-lg border px-3 py-2 hover:opacity-90">
        <LogOut size={16} className="inline" /> {t('Logout')}
      </button>
    </header>
  );
}

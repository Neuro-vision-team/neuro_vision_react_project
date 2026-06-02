import { useState } from 'react';
import { Languages, Moon, Sun, Eye, EyeOff, ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../../components/ui';
import { beginLoginWithCredential, beginLoginWithTeamCredentials, ensureSeedUsers } from '../../services/authMock';
import { useI18n } from '../../app/i18n';
import { useUiStore } from '../../store/uiStore';

function BrandMark() {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-500/20 via-slate-950 to-indigo-500/20 shadow-[0_0_30px_rgba(34,211,238,0.18)]">
        <div className="absolute inset-0 rounded-2xl bg-[radial-gradient(circle_at_top,rgba(34,211,238,0.35),transparent_55%)]" />
        <Zap className="relative z-10 h-7 w-7 text-cyan-300" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-300/80">Neuro Vision</p>
        <h1 className="bg-gradient-to-r from-cyan-100 via-white to-sky-200 bg-clip-text text-3xl font-black tracking-tight text-transparent">
          Neuro Vision
        </h1>
      </div>
    </div>
  );
}

export default function LoginPage() {
  const { t, isArabic, toggleLanguage, language } = useI18n();
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const [loginMode, setLoginMode] = useState<'admin' | 'team'>('admin');
  const [email, setEmail] = useState('admin@neurovision.ai');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    ensureSeedUsers();

    if (loginMode === 'team') {
      const result = beginLoginWithTeamCredentials(email.trim(), password);
      if (!result.ok) {
        setError(t('Invalid team credentials.'));
        return;
      }

      setError('');
      navigate(result.redirectTo || '/dashboard/my-team', { replace: true });
      return;
    }

    const result = beginLoginWithCredential(email.trim(), password, 'Admin');
    if (!result.ok) {
      setError(t('Invalid admin credentials.'));
      return;
    }

    setError('');
    navigate(result.redirectTo || '/dashboard', { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,1),rgba(8,15,31,1),rgba(15,23,42,1))] p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden rounded-[2rem] border border-cyan-400/10 bg-slate-950/55 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-md lg:flex lg:flex-col lg:justify-between">
            <div>
              <BrandMark />
              <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
                Secure access for the medical and team management experience, presented with a clean neon identity that matches the rest of the platform.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-300 sm:grid-cols-2">
              <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-50">Protected entry</p>
                <p className="mt-1 text-slate-400">Role-based login with two-step verification.</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-50">Neon clarity</p>
                <p className="mt-1 text-slate-400">High-contrast styling built for quick scanning.</p>
              </div>
            </div>
          </div>

          <GlassCard className="w-full border border-cyan-400/10 bg-slate-950/70 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
          <div className="mb-6 flex items-center justify-between">
            <BrandMark />
            <div className="flex items-center gap-2">
              <button
                onClick={toggleTheme}
                className="rounded-xl border border-cyan-400/10 bg-slate-900/70 px-3 py-2 text-slate-200 transition hover:border-cyan-400/20 hover:bg-slate-900"
                title={theme === 'dark' ? t('Switch to light theme') : t('Switch to dark theme')}
                aria-label={theme === 'dark' ? t('Switch to light theme') : t('Switch to dark theme')}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </button>
              <button
                onClick={toggleLanguage}
                className="rounded-xl border border-cyan-400/10 bg-slate-900/70 px-3 py-2 text-slate-200 transition hover:border-cyan-400/20 hover:bg-slate-900"
                title={language === 'ar' ? t('Switch to English') : t('Switch to Arabic')}
                aria-label={language === 'ar' ? t('Switch to English') : t('Switch to Arabic')}
              >
                <Languages size={16} />
              </button>
            </div>
          </div>

          <div className="mb-5 flex gap-2 rounded-2xl border border-cyan-400/10 bg-slate-950/50 p-1">
            <button
              onClick={() => {
                setLoginMode('admin');
                setEmail('admin@neurovision.ai');
                setPassword('admin123');
                setShowPassword(false);
                setError('');
              }}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                loginMode === 'admin'
                  ? 'border border-cyan-400/20 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('System Login')}
            </button>
            <button
              onClick={() => {
                setLoginMode('team');
                setEmail('');
                setPassword('');
                setShowPassword(false);
                setError('');
              }}
              className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                loginMode === 'team'
                  ? 'border border-cyan-400/20 bg-cyan-500/15 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.12)]'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('Team Login')}
            </button>
          </div>

          <p className="mt-1 text-sm text-slate-400">
            {loginMode === 'admin' ? t('Admin system access.') : t('Enter your team email and password from registration.')}
          </p>

          <form className="mt-5 space-y-3" onSubmit={onSubmit}>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
              placeholder={loginMode === 'team' ? t('Team Email') : t('Email')}
            />

            <div className="relative">
              <input
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 pr-12 text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
                placeholder={t('Password')}
                type={showPassword ? 'text' : 'password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-cyan-200"
                aria-label={showPassword ? t('Hide password') : t('Show password')}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {error ? <p className="text-sm text-rose-300">{error}</p> : null}

            <button className="w-full rounded-xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/20 via-cyan-400/20 to-sky-500/20 px-4 py-3 font-semibold text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/35 hover:from-cyan-500/30 hover:to-sky-500/30" type="submit">{t('Continue')}</button>
          </form>

          {loginMode === 'admin' && (
            <p className="mt-4 text-xs text-slate-500">{t('Default admin: admin@neurovision.ai / admin123')}</p>
          )}
        </GlassCard>
        </div>
      </div>
    </div>
  );
}

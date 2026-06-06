import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Languages, Moon, Sun } from 'lucide-react';
import { loginApi } from '../../services/api/auth.api';
import {
  storeSession,
  getPostLoginRoute,
  CHALLENGE_ID_KEY,
  CHALLENGE_EMAIL_KEY,
} from '../../services/api/auth-session';
import { useUiStore } from '../../store/uiStore';
import { useI18n } from '../../hooks/useI18n';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import projectIcon from '../../assets/project-icon.jpg';

// Converts any thrown value into a user-facing message, filtering out raw JS errors.
function friendlyAuthError(err: unknown): string {
  if (!(err instanceof Error)) return 'Could not sign in. Please try again.';
  const msg = err.message;
  // Raw JS TypeError / internal errors must never reach the UI
  if (
    msg.startsWith('Cannot read') ||
    msg.startsWith('Cannot set') ||
    msg.startsWith('TypeError') ||
    msg.includes('undefined') ||
    msg.includes('null')
  ) {
    return 'An unexpected error occurred. Please refresh and try again.';
  }
  return msg || 'Could not sign in. Please try again.';
}

export default function LoginPage() {
  const { t, isArabic, language, toggleLanguage } = useI18n();
  const theme       = useUiStore((s) => s.theme);
  const toggleTheme = useUiStore((s) => s.toggleTheme);
  const dark        = theme === 'dark';
  const navigate    = useNavigate();

  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPwd,  setShowPwd]  = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = await loginApi({ email: email.trim(), password });

      // Clear any stale 2FA state
      sessionStorage.removeItem(CHALLENGE_ID_KEY);
      sessionStorage.removeItem(CHALLENGE_EMAIL_KEY);

      if (data.requires_2fa) {
        // Store challenge credentials before redirect. Token is not stored yet.
        // Token is only persisted to localStorage after successful 2FA verification
        // in Verify2FAPage, enforcing the full 2FA flow for all dashboard users.
        sessionStorage.setItem(CHALLENGE_ID_KEY,    data.challenge_id);
        sessionStorage.setItem(CHALLENGE_EMAIL_KEY, email.trim());
        navigate('/auth/verify-2fa', { replace: true });
        return;
      }

      // Guard: backend must include user + token in a non-2FA success response.
      if (!data.user || !data.token) {
        setError('Login failed: the server returned an incomplete response. Please try again or contact support.');
        return;
      }

      // TODO: Backend should enforce 2FA for dashboard users.
      // super_admin and medical_team_manager must always receive requires_2fa: true.
      // Direct token issuance (requires_2fa: false) should not occur for these roles.
      storeSession(data.user, data.token);
      navigate(getPostLoginRoute(data.user), { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`relative min-h-screen overflow-hidden p-4 ${
        dark
          ? 'bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_26%),linear-gradient(180deg,rgba(2,6,23,1),rgba(8,15,31,1))]'
          : 'bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.08),transparent_26%),linear-gradient(180deg,#f8fbff,#eef5fb)]'
      }`}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      {/* Controls */}
      <div className="absolute right-4 top-4 flex gap-2 z-10">
        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-slate-300 px-3 py-2 text-slate-600 hover:border-cyan-500/50 hover:text-slate-900 dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-slate-100"
          title={dark ? t('Switch to light theme') : t('Switch to dark theme')}
        >
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
        <button
          type="button"
          onClick={toggleLanguage}
          className="rounded-xl border border-slate-300 px-3 py-2 text-slate-600 hover:border-cyan-500/50 hover:text-slate-900 dark:border-slate-700/60 dark:text-slate-300 dark:hover:border-cyan-400/40 dark:hover:text-slate-100"
          title={language === 'ar' ? 'Switch to English' : 'Switch to Arabic'}
        >
          <Languages size={15} />
        </button>
      </div>

      {/* Centered card */}
      <div className="flex min-h-screen items-center justify-center">
        <div className={`w-full max-w-md rounded-[2rem] border p-8 backdrop-blur-xl ${
          dark
            ? 'border-cyan-400/10 bg-slate-950/80 shadow-[0_28px_80px_rgba(0,0,0,0.5)]'
            : 'border-slate-200 bg-white shadow-[0_28px_80px_rgba(31,74,116,0.14)]'
        }`}>
          {/* Brand */}
          <div className="mb-8 flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/20 bg-white p-1">
              <img src={projectIcon} alt="Neuro Vision" className="h-full w-full rounded-xl object-contain" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-cyan-600 dark:text-cyan-400">Neuro Vision</p>
              <h1 className="text-2xl font-black text-slate-900 dark:text-slate-50">Dashboard</h1>
            </div>
          </div>

          <h2 className="mb-1 text-lg font-semibold text-slate-800 dark:text-slate-100">{t('Login')}</h2>
          <p className="mb-6 text-sm text-slate-500 dark:text-slate-400">Management and monitoring platform</p>

          <form onSubmit={onSubmit} className="space-y-4">
            <Input
              label={t('Email')}
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@example.com"
              required
              disabled={loading}
            />

            <div className="relative">
              <Input
                label={t('Password')}
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                required
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPwd((v) => !v)}
                className="absolute right-3 top-9 text-slate-500 hover:text-slate-300"
                tabIndex={-1}
              >
                {showPwd ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" loading={loading}>
              {loading ? 'Signing in...' : t('Login')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

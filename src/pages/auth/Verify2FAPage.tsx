import { useEffect, useState } from 'react';
import { Navigate, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { verify2FAApi } from '../../services/api/auth.api';
import {
  CHALLENGE_ID_KEY,
  CHALLENGE_EMAIL_KEY,
  TOKEN_KEY,
  getStoredAuthenticatedUser,
  storeSession,
  clearSession,
  getPostLoginRoute,
} from '../../services/api/auth-session';
import { useUiStore } from '../../store/uiStore';
import { Button } from '../../components/ui/Button';

function friendlyAuthError(err: unknown): string {
  if (!(err instanceof Error)) return 'Verification failed. Please try again.';
  const msg = err.message;
  if (
    msg.startsWith('Cannot read') ||
    msg.startsWith('Cannot set') ||
    msg.startsWith('TypeError') ||
    msg.includes('undefined') ||
    msg.includes('null')
  ) {
    return 'An unexpected error occurred. Please go back and log in again.';
  }
  return msg || 'Verification failed. Please try again.';
}

export default function Verify2FAPage() {
  const theme    = useUiStore((s) => s.theme);
  const dark     = theme === 'dark';
  const navigate = useNavigate();

  const [code,    setCode]    = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const challengeId    = sessionStorage.getItem(CHALLENGE_ID_KEY);
  const challengeEmail = sessionStorage.getItem(CHALLENGE_EMAIL_KEY);
  const storedToken    = localStorage.getItem(TOKEN_KEY);
  const storedUser     = getStoredAuthenticatedUser();

  useEffect(() => {
    if (!storedToken && !challengeId) {
      navigate('/auth/login', { replace: true });
    }
  }, [challengeId, navigate, storedToken]);

  // Already authenticated — redirect to dashboard
  if (storedToken && storedUser) {
    return <Navigate to={getPostLoginRoute(storedUser)} replace />;
  }

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!challengeId) return;
    setError('');
    setLoading(true);

    try {
      const data = await verify2FAApi({ challenge_id: challengeId, code: code.trim() });
      storeSession(data.user, data.token);
      sessionStorage.removeItem(CHALLENGE_ID_KEY);
      sessionStorage.removeItem(CHALLENGE_EMAIL_KEY);
      navigate(getPostLoginRoute(data.user), { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`flex min-h-screen items-center justify-center p-4 ${
        dark
          ? 'bg-[linear-gradient(180deg,rgba(2,6,23,1),rgba(8,15,31,1))]'
          : 'bg-slate-50'
      }`}
    >
      <div className={`w-full max-w-sm rounded-[2rem] border p-8 ${
        dark
          ? 'border-cyan-400/10 bg-slate-950/80 shadow-[0_28px_80px_rgba(0,0,0,0.5)]'
          : 'border-slate-200 bg-white shadow-[0_28px_80px_rgba(31,74,116,0.14)]'
      }`}>
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-400">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-50">Two-Factor Authentication</h1>
          {challengeEmail && (
            <p className="text-sm text-slate-400">
              Enter the code for <span className="font-medium text-slate-200">{challengeEmail}</span>
            </p>
          )}
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            required
            className="h-14 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 text-center text-2xl tracking-[0.5em] text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
          />

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-center text-sm text-rose-300">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full" loading={loading}>
            {loading ? 'Verifying...' : 'Verify'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => { clearSession(); navigate('/auth/login', { replace: true }); }}
          >
            Cancel
          </Button>

          {/* Setup guidance — shown when user hasn't configured Google Authenticator yet */}
          <p className="mt-2 text-center text-xs text-slate-500">
            Haven't set up Google Authenticator yet?{' '}
            <Link
              to="/dashboard/security"
              className="text-cyan-400 underline-offset-2 hover:underline"
              onClick={() => { clearSession(); }}
            >
              Log in first, then go to Security settings.
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

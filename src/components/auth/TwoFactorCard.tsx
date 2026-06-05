/**
 * Two-Factor Authentication setup / management card.
 *
 * Flow:
 *   Not enabled → "Set up 2FA" → calls POST /auth/2fa/setup → shows QR code +
 *   manual secret → user scans with Google Authenticator → enters 6-digit code →
 *   POST /auth/2fa/enable → done.
 *
 *   Enabled → "Disable 2FA" → enter current code → POST /auth/2fa/disable.
 *
 * Requires a valid bearer token (must be used while logged in).
 */
import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Eye, EyeOff, ShieldCheck, ShieldOff } from 'lucide-react';
import { setup2FAApi, enable2FAApi, disable2FAApi, getMeApi } from '../../services/api/auth.api';
import { getStoredToken, storeSession } from '../../services/api/auth-session';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

type Mode = 'idle' | 'setup' | 'disable';

interface TwoFactorCardProps {
  /** Current 2FA state for this user — sourced from AuthUserRaw.two_factor_enabled */
  initialEnabled: boolean;
}

export function TwoFactorCard({ initialEnabled }: TwoFactorCardProps) {
  const [enabled,    setEnabled]    = useState(initialEnabled);
  const [mode,       setMode]       = useState<Mode>('idle');
  const [otpUrl,     setOtpUrl]     = useState('');
  const [secret,     setSecret]     = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [code,       setCode]       = useState('');
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');

  // After a 2FA change refresh the stored user so the enabled flag stays accurate
  const refreshUser = async () => {
    try {
      const fresh = await getMeApi();
      const token = getStoredToken();
      if (token) storeSession(fresh, token);
      setEnabled(fresh.two_factor_enabled);
    } catch {
      // Non-critical — page still reflects the mutation result
    }
  };

  const startSetup = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await setup2FAApi();
      setOtpUrl(data.otpauth_url);
      setSecret(data.secret);
      setMode('setup');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not generate QR code.');
    } finally {
      setLoading(false);
    }
  };

  const handleEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await enable2FAApi(code.trim());
      await refreshUser();
      setMode('idle');
      setCode('');
      setOtpUrl('');
      setSecret('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code. Check Google Authenticator and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await disable2FAApi(code.trim());
      await refreshUser();
      setMode('idle');
      setCode('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid code.');
    } finally {
      setLoading(false);
    }
  };

  const cancel = () => {
    setMode('idle');
    setCode('');
    setOtpUrl('');
    setSecret('');
    setError('');
    setShowSecret(false);
  };

  return (
    <Card>
      {/* ── Status row ──────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            enabled
              ? 'border-emerald-400/20 bg-emerald-500/10 text-emerald-400'
              : 'border-slate-700/60 bg-slate-900/50 text-slate-500'
          }`}>
            {enabled ? <ShieldCheck size={20} /> : <ShieldOff size={20} />}
          </div>
          <div>
            <p className="font-semibold text-slate-100">Two-Factor Authentication</p>
            <p className="text-sm text-slate-500">
              {enabled
                ? 'Your account is protected with Google Authenticator.'
                : 'Add an extra layer of security to your account.'}
            </p>
          </div>
        </div>

        {mode === 'idle' && (
          <Button
            variant={enabled ? 'destructive' : 'primary'}
            size="sm"
            onClick={enabled ? () => { setError(''); setCode(''); setMode('disable'); } : startSetup}
            loading={loading}
          >
            {enabled ? 'Disable 2FA' : 'Set up 2FA'}
          </Button>
        )}
      </div>

      {/* ── QR code setup ────────────────────────────────────────────────────── */}
      {mode === 'setup' && otpUrl && (
        <div className="mt-5 space-y-5">
          {/* Step 1 — Scan */}
          <div className="rounded-2xl border border-cyan-400/15 bg-cyan-950/20 p-5">
            <p className="mb-1 text-sm font-semibold text-cyan-300">
              Step 1 — Scan with Google Authenticator
            </p>
            <p className="mb-4 text-xs text-slate-400">
              Open Google Authenticator → tap <strong className="text-slate-300">+</strong> → choose
              {' '}<strong className="text-slate-300">Scan a QR code</strong>.
            </p>

            {/* QR code on white background */}
            <div className="flex justify-center">
              <div className="rounded-2xl bg-white p-4 shadow-lg">
                <QRCodeSVG
                  value={otpUrl}
                  size={200}
                  level="M"
                  includeMargin={false}
                />
              </div>
            </div>

            {/* Manual key */}
            <div className="mt-4">
              <p className="mb-1.5 text-xs text-slate-500">
                Can't scan? Use this key in the authenticator app instead:
              </p>
              <div className="flex items-center gap-2">
                <code className={`flex-1 rounded-xl border border-slate-700/60 bg-slate-900/70 px-3 py-2 font-mono text-xs tracking-widest text-cyan-300 transition-all ${
                  showSecret ? '' : 'blur-sm select-none'
                }`}>
                  {secret}
                </code>
                <button
                  type="button"
                  aria-label={showSecret ? 'Hide key' : 'Reveal key'}
                  onClick={() => setShowSecret((v) => !v)}
                  className="rounded-xl border border-slate-700/60 bg-slate-900/70 p-2 text-slate-400 hover:text-slate-100"
                >
                  {showSecret ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 2 — Confirm */}
          <form onSubmit={handleEnable} className="space-y-3">
            <div>
              <p className="mb-1 text-sm font-semibold text-slate-200">
                Step 2 — Enter the 6-digit code
              </p>
              <p className="mb-3 text-xs text-slate-500">
                After scanning, Google Authenticator will show a rotating code.
                Enter it below to confirm setup.
              </p>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="000000"
                inputMode="numeric"
                maxLength={6}
                required
                autoFocus
                className="h-14 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 text-center text-2xl tracking-[0.5em] text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
              />
            </div>

            {error && (
              <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
                {error}
              </p>
            )}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={cancel} disabled={loading}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" loading={loading} disabled={code.length < 6}>
                Enable 2FA
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Disable flow ─────────────────────────────────────────────────────── */}
      {mode === 'disable' && (
        <form onSubmit={handleDisable} className="mt-5 space-y-3">
          <p className="text-sm text-slate-400">
            Enter your current Google Authenticator code to confirm disabling 2FA.
          </p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            placeholder="000000"
            inputMode="numeric"
            maxLength={6}
            required
            autoFocus
            className="h-14 w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 text-center text-2xl tracking-[0.5em] text-slate-100 outline-none transition focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
          />

          {error && (
            <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={cancel} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" className="flex-1" loading={loading} disabled={code.length < 6}>
              Disable 2FA
            </Button>
          </div>
        </form>
      )}
    </Card>
  );
}

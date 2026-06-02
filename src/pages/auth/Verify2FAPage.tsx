import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { ShieldCheck, Sparkles, Zap } from 'lucide-react';
import { GlassCard } from '../../components/ui';
import {
  clearPendingTwoFactorLogin,
  completePendingTwoFactorVerification,
  getPendingTwoFactorChallenge,
  getSessionUser,
  hasPendingTwoFactorLogin,
} from '../../services/authMock';
import { useI18n } from '../../app/i18n';

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
          Two-Step Auth
        </h1>
      </div>
    </div>
  );
}

export default function Verify2FAPage() {
  const { t, isArabic } = useI18n();
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const challenge = getPendingTwoFactorChallenge();

  useEffect(() => {
    if (!hasPendingTwoFactorLogin()) {
      navigate('/auth/login', { replace: true });
    }
  }, [navigate]);

  if (getSessionUser()) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const redirect = completePendingTwoFactorVerification(code.trim());
    if (!redirect) {
      setError('Invalid verification code.');
      return;
    }

    setError('');
    navigate(redirect, { replace: true });
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_26%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.12),transparent_24%),linear-gradient(180deg,rgba(2,6,23,1),rgba(8,15,31,1),rgba(15,23,42,1))] p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] opacity-30" />
      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl items-center justify-center">
        <div className="grid w-full gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="hidden rounded-[2rem] border border-cyan-400/10 bg-slate-950/55 p-8 shadow-[0_28px_80px_rgba(0,0,0,0.35)] backdrop-blur-md lg:flex lg:flex-col lg:justify-between">
            <div>
              <BrandMark />
              <p className="mt-6 max-w-lg text-sm leading-7 text-slate-300">
                A secure second step keeps the entry polished, trustworthy, and consistent with the neon identity of the platform.
              </p>
            </div>
            <div className="grid gap-3 text-sm text-slate-300">
              <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-50">Second layer protection</p>
                <p className="mt-1 text-slate-400">Verify identity before landing on the dashboard.</p>
              </div>
              <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/60 p-4">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-500/10 text-cyan-300">
                  <Sparkles className="h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-50">Clear, calm workflow</p>
                <p className="mt-1 text-slate-400">Readable UI with a premium neon finish.</p>
              </div>
            </div>
          </div>

          <GlassCard className="w-full border border-cyan-400/10 bg-slate-950/70 shadow-[0_28px_90px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            <div className="mb-6 flex items-center justify-between gap-4">
              <BrandMark />
              <span className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-100">
                {t('Secure verification')}
              </span>
            </div>

            <h2 className="text-2xl font-black text-slate-50">{t('Two-Factor Authentication')}</h2>
            <p className="mt-2 text-sm text-slate-400">
              {challenge?.requiresSetup
                ? 'Scan this QR in Google Authenticator, then enter the 6-digit code.'
                : t('Enter the 6-digit code from Google Authenticator.')}
            </p>

            {challenge?.requiresSetup && challenge.otpauth ? (
              <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-slate-950/60 p-4 space-y-3">
                <div className="inline-block rounded-2xl border border-cyan-400/10 bg-slate-900/80 p-3 shadow-[0_0_24px_rgba(34,211,238,0.08)]">
                  <QRCodeSVG value={challenge.otpauth} size={170} />
                </div>
                <p className="break-all text-xs text-slate-400">Secret: {challenge.secret}</p>
              </div>
            ) : null}

            <form className="mt-5 space-y-3" onSubmit={onSubmit}>
              <input
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                className="w-full rounded-xl border border-cyan-400/10 bg-slate-950/70 px-4 py-3 text-center tracking-[0.35em] text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/40 focus:ring-2 focus:ring-cyan-400/15"
                placeholder="123456"
                inputMode="numeric"
              />

              {error ? <p className="text-sm text-rose-300">{t(error)}</p> : null}

              <button className="w-full rounded-xl border border-cyan-400/20 bg-gradient-to-r from-cyan-500/20 via-cyan-400/20 to-sky-500/20 px-4 py-3 font-semibold text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.12)] transition hover:border-cyan-300/35 hover:from-cyan-500/30 hover:to-sky-500/30" type="submit">{t('Verify')}</button>
              <button
                type="button"
                className="w-full rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-3 font-semibold text-slate-200 transition hover:border-cyan-400/20 hover:bg-slate-800"
                onClick={() => {
                  clearPendingTwoFactorLogin();
                  navigate('/auth/login', { replace: true });
                }}
              >
                {t('Cancel')}
              </button>
            </form>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

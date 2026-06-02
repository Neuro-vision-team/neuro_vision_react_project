import { useMemo, useState } from 'react';
import { verifySync } from 'otplib';
import { QRCodeSVG } from 'qrcode.react';
import { PageTitle, GlassCard } from '../components/ui';
import { useI18n } from '../app/i18n';
import {
  createMedicalManager,
  createTwoFactorSetupForCurrentSession,
  disableTwoFactorForCurrentSession,
  enableTwoFactorForCurrentSession,
  getCurrentUserTwoFactorStatus,
  getSessionUser,
  getUsers,
} from '../services/authMock';

export default function SettingsPage() {
  const { t, isArabic } = useI18n();
  const session = getSessionUser();
  const isAdmin = session?.role === 'Admin';
  const [fullName, setFullName] = useState('');
  const [teamName, setTeamName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [refreshToken, setRefreshToken] = useState(0);

  const [twoFaSecret, setTwoFaSecret] = useState('');
  const [twoFaOtpAuth, setTwoFaOtpAuth] = useState('');
  const [twoFaCode, setTwoFaCode] = useState('');
  const [twoFaError, setTwoFaError] = useState('');
  const [twoFaNotice, setTwoFaNotice] = useState('');

  const managers = useMemo(
    () => getUsers().filter((u) => u.role === 'Medical Team Manager'),
    [refreshToken]
  );

  const twoFaEnabled = useMemo(() => getCurrentUserTwoFactorStatus(), [refreshToken]);

  const onCreateManager = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');

    try {
      const manager = createMedicalManager({ fullName: fullName.trim(), teamName: teamName.trim(), email: email.trim(), password });
      setNotice(`${t('Manager Full Name')}: ${manager.email} / ${manager.password}`);
      setFullName('');
      setTeamName('');
      setEmail('');
      setPassword('');
      setRefreshToken((n) => n + 1);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not create manager.');
    }
  };

  const onStart2FASetup = () => {
    setTwoFaError('');
    setTwoFaNotice('');

    try {
      const setup = createTwoFactorSetupForCurrentSession();
      setTwoFaSecret(setup.secret);
      setTwoFaOtpAuth(setup.otpauth);
    } catch (e) {
      setTwoFaError(e instanceof Error ? e.message : 'Could not start 2FA setup.');
    }
  };

  const onConfirm2FASetup = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setTwoFaError('');
    setTwoFaNotice('');

    if (!twoFaSecret) {
      setTwoFaError('Start setup first.');
      return;
    }

    const valid = verifySync({ secret: twoFaSecret, token: twoFaCode.trim(), strategy: 'totp', epochTolerance: 30 }).valid;
    if (!valid) {
      setTwoFaError('Invalid verification code.');
      return;
    }

    try {
      enableTwoFactorForCurrentSession(twoFaSecret);
      setTwoFaNotice('Two-factor authentication enabled.');
      setTwoFaSecret('');
      setTwoFaOtpAuth('');
      setTwoFaCode('');
      setRefreshToken((n) => n + 1);
    } catch (e) {
      setTwoFaError(e instanceof Error ? e.message : 'Could not enable 2FA.');
    }
  };

  const onDisable2FA = () => {
    setTwoFaError('');
    setTwoFaNotice('');

    try {
      disableTwoFactorForCurrentSession();
      setTwoFaNotice('Two-factor authentication disabled.');
      setTwoFaSecret('');
      setTwoFaOtpAuth('');
      setTwoFaCode('');
      setRefreshToken((n) => n + 1);
    } catch (e) {
      setTwoFaError(e instanceof Error ? e.message : 'Could not disable 2FA.');
    }
  };

  return (
    <div className="space-y-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <PageTitle title={t('Settings')} subtitle={t('Profile, API, security, language, theme, and notifications.')} />

      <GlassCard>
        <p className="text-sm text-slate-300">{t('Current session: ')}{session ? `${session.fullName} (${session.role})` : t('Not logged in')}</p>
      </GlassCard>

      <GlassCard>
        <h2 className="text-lg font-semibold">{t('Two-Factor Authentication')}</h2>
        <p className="mt-1 text-sm text-slate-400">
          {twoFaEnabled ? t('Google Authenticator is currently enabled on this account.') : t('Protect your account by enabling Google Authenticator TOTP codes.')}
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          {!twoFaEnabled ? (
            <button className="rounded-lg bg-cyan-500/30 px-4 py-2 hover:bg-cyan-500/40" onClick={onStart2FASetup} type="button">
              {t('Set Up Google Authenticator')}
            </button>
          ) : (
            <button className="rounded-lg border border-rose-400/50 px-4 py-2 text-rose-200 hover:bg-rose-950/40" onClick={onDisable2FA} type="button">
              {t('Disable 2FA')}
            </button>
          )}
        </div>

        {twoFaOtpAuth ? (
          <div className="mt-4 rounded-lg border border-slate-700/60 bg-slate-900/40 p-4 space-y-3">
            <p className="text-sm text-slate-300">{t('Scan this QR code in Google Authenticator, then enter a generated code to confirm.')}</p>
            <div className="inline-block rounded-lg bg-white p-3">
              <QRCodeSVG value={twoFaOtpAuth} size={180} />
            </div>
            <p className="text-xs break-all text-slate-400">Secret: {twoFaSecret}</p>

            <form onSubmit={onConfirm2FASetup} className="space-y-3">
              <input
                value={twoFaCode}
                onChange={(e) => setTwoFaCode(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                placeholder="123456"
                inputMode="numeric"
                className="w-full rounded-lg bg-slate-900/80 p-2 tracking-[0.35em] text-center"
              />
              <button className="rounded-lg bg-cyan-500/30 px-4 py-2 hover:bg-cyan-500/40" type="submit">
                {t('Enable 2FA')}
              </button>
            </form>
          </div>
        ) : null}

        {twoFaError ? <p className="mt-3 text-sm text-rose-300">{t(twoFaError)}</p> : null}
        {twoFaNotice ? <p className="mt-3 text-sm text-emerald-300">{t(twoFaNotice)}</p> : null}
      </GlassCard>

      {isAdmin ? (
        <GlassCard>
          <h2 className="text-lg font-semibold">{t('Admin Access Control')}</h2>
          <p className="mt-1 text-sm text-slate-400">{t('Create Medical Team Manager profile and issue login credentials.')}</p>

          <form className="mt-4 grid gap-3 md:grid-cols-2" onSubmit={onCreateManager}>
            <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="rounded-lg bg-slate-900/80 p-2" placeholder={t('Manager Full Name')} required />
            <input value={teamName} onChange={(e) => setTeamName(e.target.value)} className="rounded-lg bg-slate-900/80 p-2" placeholder={t('Team Name')} required />
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="rounded-lg bg-slate-900/80 p-2" placeholder={t('Manager Email')} required type="email" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg bg-slate-900/80 p-2" placeholder={t('Temporary Password')} required />
            <button className="rounded-lg bg-cyan-500/30 p-2 hover:bg-cyan-500/40 md:col-span-2" type="submit">{t('Create Medical Team Manager')}</button>
          </form>

          {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
          {notice ? <p className="mt-3 text-sm text-emerald-300">{notice}</p> : null}

          <div className="mt-5 space-y-2">
            <p className="text-sm text-slate-300">{t('Created Medical Team Managers')}</p>
            {managers.length === 0 ? <p className="text-sm text-slate-500">{t('No manager accounts yet.')}</p> : managers.map((m) => (
              <div key={m.id} className="rounded-lg border border-slate-700/50 bg-slate-900/60 p-3 text-sm">
                <p className="font-medium text-slate-100">{m.fullName}</p>
                <p className="text-slate-400">{t('Team:')}: {m.teamName}</p>
                <p className="text-slate-400">{t('Email')}: {m.email}</p>
                <p className="text-slate-400">{t('Password')}: {m.password}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      ) : (
        <GlassCard>
          <p className="text-sm text-amber-300">{t('Only Admin can create Medical Team Manager credentials.')}</p>
        </GlassCard>
      )}
    </div>
  );
}


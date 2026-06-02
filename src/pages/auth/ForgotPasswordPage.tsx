import { useState } from 'react';
import { GlassCard } from '../../components/ui';
import { useI18n } from '../../app/i18n';

export default function ForgotPasswordPage() {
  const { t, isArabic } = useI18n();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle password reset logic here
  };

  return (
    <div className="min-h-screen grid place-items-center p-4" dir={isArabic ? 'rtl' : 'ltr'}>
      <GlassCard className="w-full max-w-md">
        <h1 className="text-2xl font-semibold">{t('Forgot Password')}</h1>
        <form className="mt-5 space-y-3" onSubmit={handleSubmit}>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-slate-900/80 p-2"
            placeholder={t('Email')}
            type="email"
            required
          />
          <button className="w-full rounded-lg bg-cyan-500/30 p-2 hover:bg-cyan-500/40" type="submit">
            {t('Send Reset Link')}
          </button>
        </form>
      </GlassCard>
    </div>
  );
}

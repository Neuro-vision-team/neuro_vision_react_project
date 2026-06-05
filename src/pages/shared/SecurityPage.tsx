import { PageHeader } from '../../components/dashboard/PageHeader';
import { TwoFactorCard } from '../../components/auth/TwoFactorCard';
import { getStoredAuthenticatedUser } from '../../services/api/auth-session';

export default function SecurityPage() {
  const rawUser = getStoredAuthenticatedUser();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Security"
        subtitle="Manage two-factor authentication for your account."
      />
      <TwoFactorCard initialEnabled={rawUser?.two_factor_enabled ?? false} />
    </div>
  );
}

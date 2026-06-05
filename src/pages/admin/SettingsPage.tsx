import { useState } from 'react';
import { useAdminUsers } from '../../hooks/queries/useAdminUsers';
import { useCreateManager, useUpdateUserStatus } from '../../hooks/mutations/useTeamMutations';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog';
import { LoadingState } from '../../components/ui/Spinner';
import { TwoFactorCard } from '../../components/auth/TwoFactorCard';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { getStoredAuthenticatedUser } from '../../services/api/auth-session';
import type { AdminUser } from '../../hooks/queries/useAdminUsers';

export default function SettingsPage() {
  const user    = useCurrentUser();
  const rawUser = getStoredAuthenticatedUser();
  const { data: usersData, isLoading: loadUsers, refetch } = useAdminUsers();

  const createManager = useCreateManager();
  const updateStatus  = useUpdateUserStatus();

  const [fullName,  setFullName]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [notice,    setNotice]    = useState('');
  const [error,     setError]     = useState('');

  const [confirmUser, setConfirmUser] = useState<{ id: string; name: string; action: 'suspend' | 'activate' } | null>(null);

  const onCreateManager = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setNotice('');

    try {
      await createManager.mutateAsync({ full_name: fullName.trim(), email: email.trim().toLowerCase(), password, status: 'active' });
      setNotice('Manager account created successfully. Share the credentials securely.');
      setFullName('');
      setEmail('');
      setPassword('');
      void refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create manager.');
    }
  };

  const managers = (usersData?.items ?? []).filter((u) => u.roleName === 'medical_team_manager');

  return (
    <div className="space-y-6">
      <PageHeader title="Settings" subtitle="Admin access control and user management." />

      {/* Current session */}
      <Card>
        <p className="text-sm text-slate-400">
          Signed in as <span className="font-semibold text-slate-100">{user?.fullName}</span> ({user?.email}) · {user?.role}
        </p>
      </Card>

      {/* Two-Factor Authentication */}
      <TwoFactorCard initialEnabled={rawUser?.two_factor_enabled ?? false} />

      {/* Create manager */}
      <Card>
        <p className="mb-1 text-base font-semibold text-slate-100">Create Medical Team Manager</p>
        <p className="mb-4 text-sm text-slate-500">Issue a new manager account. Share credentials securely — passwords are not displayed after creation.</p>

        <form onSubmit={onCreateManager} className="grid gap-4 sm:grid-cols-2">
          <Input label="Full Name"  value={fullName}  onChange={(e) => setFullName(e.target.value)}  placeholder="Dr. Jane Smith"        required />
          <Input label="Email"      value={email}     onChange={(e) => setEmail(e.target.value)}     placeholder="manager@team.com" type="email" required />
          <Input label="Password"   value={password}  onChange={(e) => setPassword(e.target.value)}  placeholder="Strong password"  type="password" required />
          <Button type="submit" loading={createManager.isPending} className="sm:col-span-2">
            Create Manager
          </Button>
        </form>

        {error  && <p className="mt-3 text-sm text-rose-400">{error}</p>}
        {notice && <p className="mt-3 text-sm text-emerald-400">{notice}</p>}
      </Card>

      {/* Manager list */}
      <Card>
        <p className="mb-3 font-semibold text-slate-100">Medical Team Managers</p>
        {loadUsers ? (
          <LoadingState />
        ) : managers.length === 0 ? (
          <p className="text-sm text-slate-500">No managers created yet.</p>
        ) : (
          <div className="space-y-2">
            {managers.map((m: AdminUser) => (
              <div
                key={m.id}
                className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-medium text-slate-100">{m.fullName}</p>
                  <p className="text-xs text-slate-500">{m.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={m.status === 'active' ? 'success' : 'neutral'}>{m.status}</Badge>
                  <Button
                    variant={m.status === 'active' ? 'destructive' : 'primary'}
                    size="sm"
                    onClick={() => setConfirmUser({ id: m.id, name: m.fullName, action: m.status === 'active' ? 'suspend' : 'activate' })}
                  >
                    {m.status === 'active' ? 'Suspend' : 'Activate'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <ConfirmDialog
        open={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={() => {
          if (!confirmUser) return;
          updateStatus.mutate({ id: confirmUser.id, status: confirmUser.action === 'suspend' ? 'suspended' : 'active' });
          setConfirmUser(null);
        }}
        title={`${confirmUser?.action === 'suspend' ? 'Suspend' : 'Activate'} manager?`}
        message={`This will ${confirmUser?.action} ${confirmUser?.name ?? 'this manager'}'s account.`}
        confirmLabel={confirmUser?.action === 'suspend' ? 'Suspend' : 'Activate'}
        confirmVariant={confirmUser?.action === 'suspend' ? 'destructive' : 'primary'}
        loading={updateStatus.isPending}
      />
    </div>
  );
}

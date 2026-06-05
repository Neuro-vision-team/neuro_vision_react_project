import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useTeam } from '../../hooks/queries/useTeams';
import { useAdminUsers } from '../../hooks/queries/useAdminUsers';
import { useUpdateUserStatus, useUpdateTeam } from '../../hooks/mutations/useTeamMutations';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog';
import { LoadingState } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import type { AdminUser } from '../../hooks/queries/useAdminUsers';

function UserRow({ user, onToggle }: { user: AdminUser; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-3">
      <div>
        <p className="text-sm font-medium text-slate-100">{user.fullName}</p>
        <p className="text-xs text-slate-500">{user.email}</p>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant={user.status === 'active' ? 'success' : 'neutral'}>{user.status}</Badge>
        <Button
          variant={user.status === 'active' ? 'destructive' : 'primary'}
          size="sm"
          onClick={onToggle}
        >
          {user.status === 'active' ? 'Suspend' : 'Activate'}
        </Button>
      </div>
    </div>
  );
}

export default function TeamAssignmentPage() {
  const { id }  = useParams<{ id: string }>();
  const { data: team,  isLoading: loadTeam,  isError: errTeam,  refetch } = useTeam(id ?? '');
  const { data: users, isLoading: loadUsers }                                = useAdminUsers();

  const updateStatus  = useUpdateUserStatus();
  const updateTeam    = useUpdateTeam(id ?? '');

  const [confirmUser, setConfirmUser] = useState<{ id: string; name: string; action: 'suspend' | 'activate' } | null>(null);
  const [newManagerId, setNewManagerId] = useState('');

  if (loadTeam)  return <LoadingState message="Loading team..." />;
  if (errTeam)   return <ErrorState message="Could not load team." onRetry={() => void refetch()} />;
  if (!team)     return null;

  const managers = (users?.items ?? []).filter((u) => u.roleName === 'medical_team_manager');
  const staff    = (users?.items ?? []).filter((u) => u.roleName === 'medical_staff');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dashboard/teams/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft size={14} /> Back to Team</Button>
        </Link>
        <PageHeader title="Team Assignment" subtitle={`${team.teamName} - manage manager and staff`} />
      </div>

      {/* Current Manager */}
      <Card>
        <p className="mb-3 font-semibold text-slate-200">Current Manager</p>
        {team.manager ? (
          <UserRow
            user={{ id: team.managerUserId, fullName: team.manager.fullName, email: team.manager.email, status: team.manager.status, roleName: 'medical_team_manager', hasTeam: true, createdAt: '' }}
            onToggle={() => setConfirmUser({
              id:     team.managerUserId,
              name:   team.manager!.fullName,
              action: team.manager!.status === 'active' ? 'suspend' : 'activate',
            })}
          />
        ) : (
          <p className="text-sm text-slate-500">No manager assigned.</p>
        )}

        {/* Reassign manager */}
        {managers.length > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <select
              aria-label="Select new manager"
              value={newManagerId}
              onChange={(e) => setNewManagerId(e.target.value)}
              className="flex-1 rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm text-slate-100"
            >
              <option value="">Select new manager...</option>
              {managers.map((m) => (
                <option key={m.id} value={m.id}>{m.fullName} - {m.email}</option>
              ))}
            </select>
            <Button
              variant="primary"
              disabled={!newManagerId}
              loading={updateTeam.isPending}
              onClick={() => {
                if (newManagerId) {
                  updateTeam.mutate({ manager_user_id: Number(newManagerId) });
                  setNewManagerId('');
                }
              }}
            >
              Reassign
            </Button>
          </div>
        )}
      </Card>

      {/* Medical Staff */}
      <Card>
        <p className="mb-3 font-semibold text-slate-200">
          Medical Staff {loadUsers ? '' : `(${staff.length})`}
        </p>
        {loadUsers ? (
          <LoadingState />
        ) : staff.length === 0 ? (
          <p className="text-sm text-slate-500">No medical staff assigned to this team.</p>
        ) : (
          <div className="space-y-2">
            {staff.map((s) => (
              <UserRow
                key={s.id}
                user={s}
                onToggle={() => setConfirmUser({
                  id:     s.id,
                  name:   s.fullName,
                  action: s.status === 'active' ? 'suspend' : 'activate',
                })}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={!!confirmUser}
        onClose={() => setConfirmUser(null)}
        onConfirm={() => {
          if (!confirmUser) return;
          updateStatus.mutate({ id: confirmUser.id, status: confirmUser.action === 'suspend' ? 'suspended' : 'active' });
          setConfirmUser(null);
        }}
        title={`${confirmUser?.action === 'suspend' ? 'Suspend' : 'Activate'} user?`}
        message={`This will ${confirmUser?.action} ${confirmUser?.name ?? 'this user'}.`}
        confirmLabel={confirmUser?.action === 'suspend' ? 'Suspend' : 'Activate'}
        confirmVariant={confirmUser?.action === 'suspend' ? 'destructive' : 'primary'}
        loading={updateStatus.isPending}
      />
    </div>
  );
}

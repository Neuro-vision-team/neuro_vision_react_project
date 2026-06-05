import { useState } from 'react';
import { UserPlus, Pencil, PowerOff, Power, Trash2, ShieldCheck, Mail, CalendarDays } from 'lucide-react';
import { useManagerStaff } from '../../hooks/queries/useManagerStaff';
import { useToggleStaffStatus, useDeleteStaff } from '../../hooks/mutations/useStaffMutations';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { LoadingState } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog';
import { StaffFormDialog } from '../../components/staff/StaffFormDialog';
import type { Staff } from '../../types/staff';

function StatusBadge({ status }: { status: 'active' | 'suspended' }) {
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
      status === 'active'
        ? 'bg-emerald-500/15 text-emerald-300'
        : 'bg-rose-500/15 text-rose-300'
    }`}>
      <span className={`h-1.5 w-1.5 rounded-full ${status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'}`} />
      {status === 'active' ? 'Active' : 'Suspended'}
    </span>
  );
}

function fmtDate(iso: string) {
  try { return new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' }); }
  catch { return iso; }
}

interface StaffRowProps {
  member:    Staff;
  onEdit:    (s: Staff) => void;
  onToggle:  (s: Staff) => void;
  onDelete:  (s: Staff) => void;
  toggling:  boolean;
  deleting:  boolean;
}

function StaffRow({ member, onEdit, onToggle, onDelete, toggling, deleting }: StaffRowProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800/50 bg-slate-900/40 p-4">
      {/* Identity */}
      <div className="flex items-center gap-3 min-w-0">
        <Avatar name={member.fullName} size="md" />
        <div className="min-w-0">
          <p className="truncate font-semibold text-slate-100">{member.fullName}</p>
          <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <Mail size={11} /> {member.email}
            </span>
            <span className="flex items-center gap-1">
              <CalendarDays size={11} /> Joined {fmtDate(member.createdAt)}
            </span>
            {member.twoFactorEnabled && (
              <span className="flex items-center gap-1 text-cyan-400">
                <ShieldCheck size={11} /> 2FA enabled
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Status + actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <StatusBadge status={member.status} />

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onEdit(member)}
          title="Edit"
        >
          <Pencil size={13} />
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggle(member)}
          disabled={toggling}
          title={member.status === 'active' ? 'Suspend' : 'Activate'}
        >
          {member.status === 'active'
            ? <PowerOff size={13} className="text-amber-400" />
            : <Power    size={13} className="text-emerald-400" />
          }
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onDelete(member)}
          disabled={deleting}
          title="Remove"
        >
          <Trash2 size={13} className="text-rose-400" />
        </Button>
      </div>
    </div>
  );
}

export default function ManagerStaffPage() {
  const { data: staff, isLoading, isError, refetch } = useManagerStaff();
  const toggleStatus = useToggleStaffStatus();
  const deleteStaff  = useDeleteStaff();

  const [formOpen,     setFormOpen]     = useState(false);
  const [editing,      setEditing]      = useState<Staff | null>(null);
  const [confirmToggle, setConfirmToggle] = useState<Staff | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Staff | null>(null);
  const [search,       setSearch]       = useState('');

  const openCreate = () => { setEditing(null); setFormOpen(true); };
  const openEdit   = (s: Staff) => { setEditing(s); setFormOpen(true); };
  const closeForm  = () => { setFormOpen(false); setEditing(null); };

  const filtered = (staff ?? []).filter((s) =>
    search.trim() === '' ||
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase()),
  );

  const handleToggle = async () => {
    if (!confirmToggle) return;
    const next = confirmToggle.status === 'active' ? 'suspended' : 'active';
    await toggleStatus.mutateAsync({ id: confirmToggle.id, status: next });
    setConfirmToggle(null);
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    await deleteStaff.mutateAsync(confirmDelete.id);
    setConfirmDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Medical Staff"
          subtitle="Manage your team's medical staff members."
        />
        <Button onClick={openCreate}>
          <UserPlus size={15} /> Add Staff Member
        </Button>
      </div>

      {isLoading ? (
        <LoadingState message="Loading staff..." />
      ) : isError ? (
        <ErrorState message="Could not load staff." onRetry={() => void refetch()} />
      ) : (
        <Card>
          {/* Search */}
          <div className="mb-4">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email…"
              className="w-full rounded-xl border border-slate-700/60 bg-slate-900/70 px-4 py-2 text-sm text-slate-200 placeholder:text-slate-500 outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/20"
            />
          </div>

          {/* Staff count */}
          <p className="mb-3 text-xs text-slate-500">
            {filtered.length} staff member{filtered.length !== 1 ? 's' : ''}
            {search ? ' matching search' : ' on your team'}
          </p>

          {/* List */}
          {filtered.length === 0 ? (
            <EmptyState
              title={search ? 'No results' : 'No staff members yet'}
              message={search ? 'Try a different search term.' : 'Add your first medical staff member to get started.'}
            />
          ) : (
            <div className="space-y-3">
              {filtered.map((member) => (
                <StaffRow
                  key={member.id}
                  member={member}
                  onEdit={openEdit}
                  onToggle={(s) => setConfirmToggle(s)}
                  onDelete={(s) => setConfirmDelete(s)}
                  toggling={toggleStatus.isPending}
                  deleting={deleteStaff.isPending}
                />
              ))}
            </div>
          )}
        </Card>
      )}

      {/* Create / edit dialog */}
      <StaffFormDialog
        open={formOpen}
        onClose={closeForm}
        staff={editing}
      />

      {/* Confirm suspend / activate */}
      <ConfirmDialog
        open={!!confirmToggle}
        title={confirmToggle?.status === 'active' ? 'Suspend staff member?' : 'Activate staff member?'}
        message={
          confirmToggle?.status === 'active'
            ? `${confirmToggle?.fullName} will lose dashboard access until reactivated.`
            : `${confirmToggle?.fullName} will regain access to the system.`
        }
        confirmLabel={confirmToggle?.status === 'active' ? 'Suspend' : 'Activate'}
        confirmVariant={confirmToggle?.status === 'active' ? 'destructive' : 'primary'}
        loading={toggleStatus.isPending}
        onConfirm={() => void handleToggle()}
        onClose={() => setConfirmToggle(null)}
      />

      {/* Confirm delete */}
      <ConfirmDialog
        open={!!confirmDelete}
        title="Remove staff member?"
        message={`${confirmDelete?.fullName} will be permanently removed from your team.`}
        confirmLabel="Remove"
        confirmVariant="destructive"
        loading={deleteStaff.isPending}
        onConfirm={() => void handleDelete()}
        onClose={() => setConfirmDelete(null)}
      />
    </div>
  );
}

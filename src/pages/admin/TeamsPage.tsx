import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, ExternalLink } from 'lucide-react';
import { useTeams } from '../../hooks/queries/useTeams';
import { useUpdateTeamStatus } from '../../hooks/mutations/useTeamMutations';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { DataTable, type Column } from '../../components/dashboard/DataTable';
import { SearchInput } from '../../components/dashboard/SearchInput';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate } from '../../utils/formatters';
import { CreateTeamDialog } from '../../components/teams/CreateTeamDialog';
import type { Team } from '../../types/team';

export default function TeamsPage() {
  const [page, setPage]   = useState(1);
  const [search, setSearch] = useState('');
  const [createOpen, setCreateOpen] = useState(false);

  const { data, isLoading, isError, refetch } = useTeams({ page });
  const updateStatus = useUpdateTeamStatus('');

  const teams = data?.items ?? [];

  const columns: Column<Team>[] = [
    {
      key: 'team',
      header: 'Team',
      render: (t) => (
        <div className="flex items-center gap-3">
          <Avatar src={t.teamLogoUrl} name={t.teamName} size="sm" />
          <div>
            <p className="font-medium text-slate-100">{t.teamName}</p>
            <p className="text-xs text-slate-500">{t.sportType} · {t.ageCategory}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'location',
      header: 'Location',
      render: (t) => <span className="text-slate-300">{t.country}, {t.city}</span>,
    },
    {
      key: 'manager',
      header: 'Manager',
      render: (t) => (
        <span className="text-slate-300">{t.manager?.fullName ?? '—'}</span>
      ),
    },
    {
      key: 'players',
      header: 'Players',
      render: (t) => <span className="text-slate-300">{t.playersCount}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <Badge variant={t.status === 'active' ? 'success' : 'neutral'}>
          {t.status === 'active' ? 'Active' : 'Suspended'}
        </Badge>
      ),
    },
    {
      key: 'created',
      header: 'Created',
      render: (t) => <span className="text-slate-400">{formatDate(t.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (t) => (
        <div className="flex items-center gap-2">
          <Link to={`/dashboard/teams/${t.id}`}>
            <Button variant="ghost" size="sm">
              <ExternalLink size={13} /> Details
            </Button>
          </Link>
          <Button
            variant={t.status === 'active' ? 'destructive' : 'primary'}
            size="sm"
            loading={updateStatus.isPending}
            onClick={() => updateStatus.mutate(t.status === 'active' ? 'suspended' : 'active')}
          >
            {t.status === 'active' ? 'Suspend' : 'Activate'}
          </Button>
        </div>
      ),
    },
  ];

  const filtered = search
    ? teams.filter(
        (t) =>
          t.teamName.toLowerCase().includes(search.toLowerCase()) ||
          t.coachName.toLowerCase().includes(search.toLowerCase()),
      )
    : teams;

  if (isError) {
    return <ErrorState message="Could not load teams." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teams"
        subtitle="Manage all registered teams."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus size={15} /> Add Team
          </Button>
        }
      />

      <CreateTeamDialog open={createOpen} onClose={() => setCreateOpen(false)} />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search teams..."
        className="max-w-sm"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyTitle="No teams found"
        emptyMessage="No teams have been registered yet."
        pagination={
          data
            ? { currentPage: data.currentPage, lastPage: data.lastPage, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}

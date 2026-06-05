import { useState } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { usePlayers } from '../../hooks/queries/usePlayers';
import { useDeletePlayer } from '../../hooks/mutations/usePlayerMutations';
import { useIsManager } from '../../hooks/useCurrentUser';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { SearchInput } from '../../components/dashboard/SearchInput';
import { PlayerCard } from '../../components/players/PlayerCard';
import { PlayerFormDialog } from '../../components/players/PlayerFormDialog';
import { ConfirmDialog } from '../../components/dashboard/ConfirmDialog';
import { Button } from '../../components/ui/Button';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import type { Player } from '../../types/player';

export default function PlayersPage() {
  const isManager = useIsManager();
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = usePlayers({ page, search: search || undefined });
  const deletePlayer = useDeletePlayer();

  const [formOpen, setFormOpen]       = useState(false);
  const [editPlayer, setEditPlayer]   = useState<Player | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Player | null>(null);

  const players = data?.items ?? [];
  const existingJerseyNumbers = players.map((p) => p.jerseyNumber);

  if (isError) {
    return <ErrorState message="Could not load players." onRetry={() => void refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Players"
        subtitle={isManager ? "Manage your team's players." : 'View all players across teams.'}
        action={
          isManager ? (
            <Button onClick={() => { setEditPlayer(null); setFormOpen(true); }}>
              <Plus size={15} /> Add Player
            </Button>
          ) : undefined
        }
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Search players..." className="max-w-sm" />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : players.length === 0 ? (
        <EmptyState title="No players" message="No players found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {players.map((p) => (
            <PlayerCard
              key={p.id}
              player={p}
              actions={
                isManager ? (
                  <div className="flex gap-1.5">
                    <Button variant="ghost" size="sm" onClick={() => { setEditPlayer(p); setFormOpen(true); }}>
                      <Pencil size={13} />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setDeleteTarget(p)}>
                      <Trash2 size={13} className="text-rose-400" />
                    </Button>
                  </div>
                ) : undefined
              }
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {data && data.lastPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-slate-500">Page {data.currentPage} of {data.lastPage}</span>
          <Button variant="ghost" size="sm" disabled={page >= data.lastPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}

      {/* Manager-only dialogs */}
      {isManager && (
        <>
          <PlayerFormDialog
            open={formOpen}
            onClose={() => setFormOpen(false)}
            player={editPlayer}
            existingJerseyNumbers={existingJerseyNumbers}
          />
          <ConfirmDialog
            open={!!deleteTarget}
            onClose={() => setDeleteTarget(null)}
            onConfirm={() => {
              if (deleteTarget) deletePlayer.mutate(deleteTarget.id);
              setDeleteTarget(null);
            }}
            title="Delete player?"
            message={`This will permanently remove ${deleteTarget?.fullName ?? 'this player'}.`}
            confirmLabel="Delete"
            loading={deletePlayer.isPending}
          />
        </>
      )}
    </div>
  );
}

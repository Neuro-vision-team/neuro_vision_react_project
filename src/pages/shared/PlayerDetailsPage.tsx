import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { usePlayer, usePlayerHistory } from '../../hooks/queries/usePlayers';
import { useIsAdmin } from '../../hooks/useCurrentUser';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { PlayerStatusBadge } from '../../components/players/PlayerStatusBadge';
import { TimelineView } from '../../components/dashboard/TimelineView';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate } from '../../utils/formatters';

export default function PlayerDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const isAdmin = useIsAdmin();

  const { data: player, isLoading, isError, refetch } = usePlayer(id ?? '');
  // History endpoint is admin-only; managers see assessments via the player record
  const { data: history, isLoading: loadHistory } = usePlayerHistory(isAdmin ? (id ?? '') : '');

  if (isLoading) return <LoadingState message="Loading player..." />;
  if (isError)   return <ErrorState message="Could not load player." onRetry={() => void refetch()} />;
  if (!player)   return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/players">
          <Button variant="ghost" size="sm"><ArrowLeft size={14} /> Back</Button>
        </Link>
        <PageHeader title={player.fullName} subtitle={`#${player.jerseyNumber} · ${player.position}`} />
        <Link to={`/dashboard/players/${id}/timeline`} className="ml-auto">
          <Button variant="secondary" size="sm"><Clock size={14} /> Timeline</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
        {/* Profile */}
        <Card>
          <div className="flex flex-col items-center gap-3 text-center">
            <Avatar src={player.photoUrl} name={player.fullName} size="xl" />
            <div>
              <p className="text-lg font-bold text-slate-50">{player.fullName}</p>
              <p className="text-sm text-slate-400">{player.shirtName || player.fullName}</p>
            </div>
            <PlayerStatusBadge status={player.status} />
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            {[
              ['Jersey #',     `#${player.jerseyNumber}`],
              ['Position',     player.position],
              ['Age',          String(player.age)],
              ['Gender',       player.gender],
              ['Nationality',  player.nationality],
              ['Height',       player.heightCm ? `${player.heightCm} cm` : '—'],
              ['Weight',       player.weightKg ? `${player.weightKg} kg` : '—'],
              ['Preferred',    player.preferredSide],
              ['Join Year',    String(player.joinYear)],
              ['Date of Birth', formatDate(player.dateOfBirth)],
              ['Email',        player.email ?? '—'],
              ['Phone',        player.phone ?? '—'],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-b border-slate-800/40 py-1 last:border-0">
                <dt className="text-slate-500">{label}</dt>
                <dd className="font-medium text-slate-200">{value}</dd>
              </div>
            ))}
          </dl>
        </Card>

        {/* Assessment history */}
        <Card>
          <p className="mb-4 font-semibold text-slate-100">Assessment History</p>
          {isAdmin ? (
            loadHistory ? (
              <LoadingState message="Loading history..." />
            ) : (
              <TimelineView items={history ?? []} />
            )
          ) : (
            <p className="text-sm text-slate-500">
              View assessment history in the{' '}
              <Link to={`/dashboard/players/${id}/timeline`} className="text-cyan-400 hover:text-cyan-300">timeline</Link>.
            </p>
          )}
        </Card>
      </div>
    </div>
  );
}

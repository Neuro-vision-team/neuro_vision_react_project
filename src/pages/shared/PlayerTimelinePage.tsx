import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePlayer, usePlayerHistory } from '../../hooks/queries/usePlayers';
import { useAssessments } from '../../hooks/queries/useAssessments';
import { useIsAdmin } from '../../hooks/useCurrentUser';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { TimelineView } from '../../components/dashboard/TimelineView';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';

export default function PlayerTimelinePage() {
  const { id } = useParams<{ id: string }>();
  const isAdmin = useIsAdmin();

  const { data: player } = usePlayer(id ?? '');
  // Admin: dedicated history endpoint. Manager: filter assessments by player.
  const { data: history,     isLoading: loadHistory } = usePlayerHistory(isAdmin ? (id ?? '') : '');
  const { data: assessments, isLoading: loadAssess }  = useAssessments(isAdmin ? {} : { player_id: id });

  const items = isAdmin ? (history ?? []) : (assessments?.items ?? []).filter((a) => a.playerId === id);
  const loading = isAdmin ? loadHistory : loadAssess;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to={`/dashboard/players/${id}`}>
          <Button variant="ghost" size="sm"><ArrowLeft size={14} /> Back to Player</Button>
        </Link>
        <PageHeader
          title="Player Timeline"
          subtitle={player ? `${player.fullName} — assessment history` : 'Chronological assessment history'}
        />
      </div>

      <Card>
        {loading ? (
          <LoadingState message="Loading timeline..." />
        ) : (
          <TimelineView items={items} />
        )}
      </Card>
    </div>
  );
}

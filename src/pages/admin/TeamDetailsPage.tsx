import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Settings2 } from 'lucide-react';
import { useTeam } from '../../hooks/queries/useTeams';
import { useAssessments } from '../../hooks/queries/useAssessments';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { LoadingState } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate } from '../../utils/formatters';

export default function TeamDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: team,        isLoading: loadTeam,        isError: errTeam,        refetch: retryTeam }        = useTeam(id ?? '');
  const { data: assessments, isLoading: loadAssessments }                                                        = useAssessments({ player_id: undefined });

  if (loadTeam) return <LoadingState message="Loading team..." />;
  if (errTeam)  return <ErrorState message="Could not load team details." onRetry={() => void retryTeam()} />;
  if (!team)    return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/teams">
          <Button variant="ghost" size="sm"><ArrowLeft size={14} /> Back</Button>
        </Link>
        <PageHeader title={team.teamName} subtitle={`${team.sportType} · ${team.ageCategory}`} />
        <Link to={`/dashboard/teams/${id}/assignment`} className="ml-auto">
          <Button variant="secondary" size="sm"><Settings2 size={14} /> Assignment</Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Team info */}
        <div className="space-y-4">
          <Card>
            <div className="flex items-start gap-4">
              <Avatar src={team.teamLogoUrl} name={team.teamName} size="xl" />
              <div className="flex-1 space-y-1">
                <p className="text-xl font-bold text-slate-50">{team.teamName}</p>
                <p className="text-sm text-slate-400">{team.sportType} · {team.ageCategory} · {team.gender}</p>
                <Badge variant={team.status === 'active' ? 'success' : 'neutral'}>
                  {team.status === 'active' ? 'Active' : 'Suspended'}
                </Badge>
              </div>
            </div>

            <dl className="mt-5 grid gap-y-2 text-sm sm:grid-cols-2">
              {[
                ['Country',      team.country],
                ['City',         team.city],
                ['Club/Academy', team.clubAcademy ?? '—'],
                ['Founded',      team.foundedYear ?? '—'],
                ['Coach',        team.coachName],
                ['Coach Phone',  team.coachPhone],
                ['Coach Email',  team.coachEmail],
                ['Players',      String(team.playersCount)],
                ['Created',      formatDate(team.createdAt)],
              ].map(([label, value]) => (
                <div key={label} className="flex gap-2">
                  <dt className="w-32 shrink-0 text-slate-500">{label}</dt>
                  <dd className="text-slate-200">{value}</dd>
                </div>
              ))}
            </dl>
          </Card>

          {/* Recent assessments */}
          <Card>
            <p className="mb-3 font-semibold text-slate-200">Recent Assessments</p>
            {loadAssessments ? (
              <LoadingState message="Loading assessments..." />
            ) : (assessments?.items ?? []).length === 0 ? (
              <p className="text-sm text-slate-500">No assessments recorded.</p>
            ) : (
              <p className="text-sm text-slate-400">
                {assessments?.total ?? 0} assessment(s) total.{' '}
                <Link to="/dashboard/assessments" className="text-cyan-400 hover:text-cyan-300">View all →</Link>
              </p>
            )}
          </Card>
        </div>

        {/* Manager info */}
        <Card>
          <p className="mb-3 font-semibold text-slate-200">Manager</p>
          {team.manager ? (
            <div className="space-y-2">
              <p className="font-medium text-slate-100">{team.manager.fullName}</p>
              <p className="text-xs text-slate-500">{team.manager.email}</p>
              <Badge variant={team.manager.status === 'active' ? 'success' : 'neutral'}>
                {team.manager.status}
              </Badge>
            </div>
          ) : (
            <p className="text-sm text-slate-500">No manager assigned.</p>
          )}
          <div className="mt-4">
            <Link to={`/dashboard/teams/${id}/assignment`}>
              <Button variant="outline" size="sm" className="w-full">Manage Assignment</Button>
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}

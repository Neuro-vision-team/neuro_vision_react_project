import { Link } from 'react-router-dom';
import { Users, Activity, HeartPulse, ClipboardList } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useManagerDashboard, useManagerTeam } from '../../hooks/queries/useManagerDashboard';
import { useAssessments } from '../../hooks/queries/useAssessments';
import { usePlayers } from '../../hooks/queries/usePlayers';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { ActivityFeed, type ActivityItem } from '../../components/dashboard/ActivityFeed';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { ErrorState } from '../../components/ui/ErrorState';
import { useUiStore } from '../../store/uiStore';
import { buildTeamActivity } from '../../utils/teamActivity';

const RISK_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

export default function ManagerOverviewPage() {
  const theme = useUiStore((s) => s.theme);
  const dark  = theme === 'dark';

  const { data: dashboard, isLoading: loadDash, isError: errDash, refetch } = useManagerDashboard();
  const { data: team }                                                        = useManagerTeam();
  const { data: assessments, isLoading: loadAssess }                          = useAssessments({ page: 1 });
  const { data: players,     isLoading: loadPlayers }                         = usePlayers({ page: 1 });

  const tooltipStyle = {
    background:   dark ? '#0f172a' : '#fff',
    border:       '1px solid rgba(148,163,184,0.2)',
    borderRadius: 12,
    color:        dark ? '#e2e8f0' : '#0f172a',
  };

  if (errDash) {
    return <ErrorState message="Could not load your team overview." onRetry={() => void refetch()} />;
  }

  const riskDistribution = dashboard
    ? [
        { name: 'Low',    value: dashboard.riskOverview.low,    fill: RISK_COLORS.low },
        { name: 'Medium', value: dashboard.riskOverview.medium, fill: RISK_COLORS.medium },
        { name: 'High',   value: dashboard.riskOverview.high,   fill: RISK_COLORS.high },
      ].filter((d) => d.value > 0)
    : [];

  // Compose team activity feed from assessments + players
  const activities: ActivityItem[] = buildTeamActivity(
    assessments?.items ?? [],
    players?.items ?? [],
  );

  const recentPlayers = (players?.items ?? []).slice(0, 5);

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Team"
        subtitle={team ? `${team.teamName} — ${team.sportType} · ${team.ageCategory}` : 'Team overview and activity'}
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Players"     value={dashboard?.totalPlayers ?? players?.total ?? 0} icon={Users}        iconColor="text-cyan-300"    />
        <StatCard label="Active Players"    value={dashboard?.activePlayers ?? 0}                  icon={HeartPulse}   iconColor="text-emerald-300" />
        <StatCard label="Injured Players"   value={dashboard?.injuredPlayers ?? 0}                 icon={Activity}     iconColor="text-amber-300"   />
        <StatCard label="Total Assessments" value={dashboard?.totalAssessments ?? assessments?.total ?? 0} icon={ClipboardList} iconColor="text-violet-300" />
      </section>

      {/* Charts + Activity */}
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ChartCard
          title="Risk Distribution"
          subtitle="Across your team's completed assessments"
          loading={loadDash}
          empty={riskDistribution.length === 0}
          emptyMessage="No completed assessments yet."
          height={280}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskDistribution} dataKey="value" nameKey="name" outerRadius={105} innerRadius={52}>
                {riskDistribution.map((entry) => <Cell key={entry.name} fill={entry.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <Card>
          <p className="mb-4 font-semibold text-slate-100">Team Activity</p>
          {loadAssess || loadPlayers ? (
            <p className="py-6 text-center text-sm text-slate-500">Loading activity...</p>
          ) : (
            <ActivityFeed items={activities} />
          )}
        </Card>
      </section>

      {/* Recent players */}
      <Card>
        <div className="mb-3 flex items-center justify-between">
          <p className="font-semibold text-slate-100">Recent Players</p>
          <Link to="/dashboard/players" className="text-xs font-medium text-cyan-400 hover:text-cyan-300">
            View all →
          </Link>
        </div>
        {loadPlayers ? (
          <p className="py-4 text-center text-sm text-slate-500">Loading...</p>
        ) : recentPlayers.length === 0 ? (
          <p className="py-4 text-center text-sm text-slate-500">No players added yet.</p>
        ) : (
          <div className="space-y-2">
            {recentPlayers.map((p) => (
              <Link
                key={p.id}
                to={`/dashboard/players/${p.id}`}
                className="flex items-center gap-3 rounded-xl border border-slate-800/50 bg-slate-900/30 px-4 py-2.5 transition hover:border-cyan-400/20"
              >
                <Avatar src={p.photoUrl} name={p.fullName} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-slate-100">{p.fullName}</p>
                  <p className="text-xs text-slate-500">#{p.jerseyNumber} · {p.position}</p>
                </div>
                <Badge variant={p.status === 'active' ? 'success' : p.status === 'injured' ? 'warning' : 'neutral'}>
                  {p.status}
                </Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

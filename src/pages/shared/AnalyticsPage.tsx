import { useMemo } from 'react';
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { useAdminDashboard } from '../../hooks/queries/useAdminDashboard';
import { useManagerDashboard } from '../../hooks/queries/useManagerDashboard';
import { useAssessments } from '../../hooks/queries/useAssessments';
import { usePlayers } from '../../hooks/queries/usePlayers';
import { useTeams } from '../../hooks/queries/useTeams';
import { useIsAdmin } from '../../hooks/useCurrentUser';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { useUiStore } from '../../store/uiStore';
import {
  buildAssessmentTrend,
  buildAssessmentTypeCount,
  buildPlayerStatusCount,
} from '../../utils/analytics';
import { RISK_COLORS } from '../../types/analytics';

export default function AnalyticsPage() {
  const isAdmin = useIsAdmin();
  const theme   = useUiStore((s) => s.theme);
  const dark    = theme === 'dark';

  const adminDash   = useAdminDashboard();
  const managerDash = useManagerDashboard();
  const { data: assessments, isLoading: loadAssess } = useAssessments({ page: 1 });
  const { data: players,     isLoading: loadPlayers } = usePlayers({ page: 1 });
  const { data: teams }                               = useTeams(isAdmin ? {} : undefined);

  const riskOverview = isAdmin ? adminDash.data?.riskOverview : managerDash.data?.riskOverview;

  const axisColor    = dark ? '#7e90ad' : '#64748b';
  const gridColor    = dark ? '#233047' : '#d7e3f1';
  const tooltipStyle = {
    background:   dark ? '#0f172a' : '#fff',
    border:       '1px solid rgba(148,163,184,0.2)',
    borderRadius: 12,
    color:        dark ? '#e2e8f0' : '#0f172a',
  };

  const assessmentList = useMemo(() => assessments?.items ?? [], [assessments]);
  const playerList     = useMemo(() => players?.items ?? [], [players]);

  // ── Derived datasets ─────────────────────────────────────────────────────────
  const riskData = riskOverview
    ? [
        { name: 'Low',    value: riskOverview.low,    fill: RISK_COLORS.low },
        { name: 'Medium', value: riskOverview.medium, fill: RISK_COLORS.medium },
        { name: 'High',   value: riskOverview.high,   fill: RISK_COLORS.high },
      ].filter((d) => d.value > 0)
    : [];

  const trend = useMemo(() => buildAssessmentTrend(assessmentList), [assessmentList]);
  const typeBreakdown = useMemo(() => {
    const c = buildAssessmentTypeCount(assessmentList);
    return [
      { name: 'Baseline', value: c.baseline },
      { name: 'Session',  value: c.session },
    ];
  }, [assessmentList]);
  const statusDist = useMemo(() => {
    const c = buildPlayerStatusCount(playerList);
    return [
      { name: 'Active',    value: c.active,    fill: '#22c55e' },
      { name: 'Injured',   value: c.injured,   fill: '#f59e0b' },
      { name: 'Suspended', value: c.suspended, fill: '#64748b' },
    ].filter((d) => d.value > 0);
  }, [playerList]);

  // Team activity (admin only)
  const teamActivity = useMemo(() => {
    if (!isAdmin || !teams) return [];
    return teams.items.map((t) => ({ name: t.teamName, value: t.playersCount }));
  }, [isAdmin, teams]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics"
        subtitle={isAdmin ? 'Platform-wide analytics and trends.' : "Your team's analytics and trends."}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk Distribution */}
        <ChartCard title="Risk Distribution" subtitle="Low / Medium / High" empty={riskData.length === 0} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskData} dataKey="value" nameKey="name" outerRadius={95} innerRadius={48}>
                {riskData.map((e) => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Assessment Volume Over Time */}
        <ChartCard title="Assessment Volume Over Time" subtitle="Last 6 months" loading={loadAssess} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <defs>
                <linearGradient id="volTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#22d3ee" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Area dataKey="total" name="Assessments" stroke="#22d3ee" fill="url(#volTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Risk Trend Over Time */}
        <ChartCard title="Risk Trend Over Time" subtitle="Low / Medium / High by month" loading={loadAssess} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="month" stroke={axisColor} />
              <YAxis stroke={axisColor} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line dataKey="low"    name="Low"    stroke={RISK_COLORS.low}    strokeWidth={2} dot={false} />
              <Line dataKey="medium" name="Medium" stroke={RISK_COLORS.medium} strokeWidth={2} dot={false} />
              <Line dataKey="high"   name="High"   stroke={RISK_COLORS.high}   strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Assessment Type Breakdown */}
        <ChartCard title="Assessment Type Breakdown" subtitle="Baseline vs Session" loading={loadAssess} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={typeBreakdown}>
              <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
              <XAxis dataKey="name" stroke={axisColor} />
              <YAxis stroke={axisColor} allowDecimals={false} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" name="Count" fill="#22d3ee" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Player Status Distribution */}
        <ChartCard title="Player Status Distribution" subtitle="Active / Injured / Suspended" loading={loadPlayers} empty={statusDist.length === 0} height={260}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusDist} dataKey="value" nameKey="name" outerRadius={95} innerRadius={48}>
                {statusDist.map((e) => <Cell key={e.name} fill={e.fill} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Team Activity — Admin only */}
        {isAdmin && (
          <ChartCard title="Team Activity" subtitle="Players per team" empty={teamActivity.length === 0} height={260}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={teamActivity} layout="vertical">
                <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
                <XAxis type="number" stroke={axisColor} allowDecimals={false} />
                <YAxis type="category" dataKey="name" stroke={axisColor} width={120} />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="value" name="Players" fill="#a78bfa" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        )}
      </div>
    </div>
  );
}

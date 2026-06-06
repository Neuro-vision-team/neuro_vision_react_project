import { Users, UserPlus, Stethoscope, ClipboardList, Shield, ShieldOff } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useAdminDashboard } from '../../hooks/queries/useAdminDashboard';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { StatCard } from '../../components/dashboard/StatCard';
import { ChartCard } from '../../components/dashboard/ChartCard';
import { ActivityFeed } from '../../components/dashboard/ActivityFeed';
import { ErrorState } from '../../components/ui/ErrorState';
import { useUiStore } from '../../store/uiStore';
import type { ActivityItem } from '../../components/dashboard/ActivityFeed';
import type { AuditLogPreview } from '../../types/dashboard';

const RISK_COLORS = { low: '#22c55e', medium: '#f59e0b', high: '#ef4444' };

function auditLogToActivity(log: AuditLogPreview): ActivityItem {
  return {
    id:          log.id,
    type:        'audit',
    description: log.description,
    actor:       log.userName,
    timestamp:   log.recordedAt,
  };
}

export default function AdminDashboardPage() {
  const { data, isLoading, isError, refetch } = useAdminDashboard();
  const theme = useUiStore((s) => s.theme);
  const dark  = theme === 'dark';

  const tooltipStyle = {
    background:    dark ? '#0f172a' : '#fff',
    border:        '1px solid rgba(148,163,184,0.2)',
    borderRadius:  12,
    color:         dark ? '#e2e8f0' : '#0f172a',
  };

  if (isError) {
    return <ErrorState message="Could not load dashboard data." onRetry={() => void refetch()} />;
  }

  const riskDistribution = data
    ? [
        { name: 'Low',    value: data.riskOverview.low,    fill: RISK_COLORS.low },
        { name: 'Medium', value: data.riskOverview.medium, fill: RISK_COLORS.medium },
        { name: 'High',   value: data.riskOverview.high,   fill: RISK_COLORS.high },
      ].filter((d) => d.value > 0)
    : [];

  const activities: ActivityItem[] = data
    ? data.recentAuditLogs.map(auditLogToActivity)
    : [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview — teams, players, assessments, risk."
      />

      {/* Stats */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Teams"       value={data?.totalTeams ?? 0}       icon={Shield}       iconColor="text-cyan-300"    />
        <StatCard label="Active Teams"      value={data?.activeTeams ?? 0}       icon={Shield}       iconColor="text-emerald-300" />
        <StatCard label="Suspended Teams"   value={data?.suspendedTeams ?? 0}    icon={ShieldOff}    iconColor="text-rose-300"    />
        <StatCard label="Total Players"     value={data?.totalPlayers ?? 0}      icon={UserPlus}     iconColor="text-violet-300"  />
        <StatCard label="Total Assessments" value={data?.totalAssessments ?? 0}  icon={ClipboardList} iconColor="text-amber-300"  />
        <StatCard label="Total Managers"    value={data?.totalManagers ?? 0}     icon={Users}        iconColor="text-sky-300"     />
        <StatCard label="Medical Staff"     value={data?.totalStaff ?? 0}        icon={Stethoscope}  iconColor="text-teal-300"    />
        <StatCard label="Total Users"       value={data?.totalUsers ?? 0}        icon={Users}        iconColor="text-slate-300"   />
      </section>

      {/* Charts + Activity */}
      <section className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <ChartCard
          title="Risk Distribution"
          subtitle="Low / Medium / High across all completed assessments"
          loading={isLoading}
          empty={riskDistribution.length === 0}
          emptyMessage="No completed assessments yet."
          height={300}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={riskDistribution} dataKey="value" nameKey="name" outerRadius={110} innerRadius={55}>
                {riskDistribution.map((entry) => (
                  <Cell key={entry.name} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-cyan-400/10 dark:bg-slate-900">
          <p className="mb-4 font-semibold text-slate-800 dark:text-slate-100">Recent Activity</p>
          <ActivityFeed items={activities} />
        </div>
      </section>
    </div>
  );
}

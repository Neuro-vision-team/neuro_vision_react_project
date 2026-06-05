import { useState } from 'react';
import { Link } from 'react-router-dom';
import { GitCompare, ExternalLink } from 'lucide-react';
import { useAssessments } from '../../hooks/queries/useAssessments';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { DataTable, type Column } from '../../components/dashboard/DataTable';
import { Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { RiskBadge } from '../../components/dashboard/RiskBadge';
import { AssessmentStatusBadge } from '../../components/assessments/AssessmentStatusBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDate, capitalize } from '../../utils/formatters';
import type { Assessment, AssessmentStatus, RiskLevel } from '../../types/assessment';

export default function AssessmentsPage() {
  const [page, setPage]     = useState(1);
  const [status, setStatus] = useState<AssessmentStatus | ''>('');
  const [risk, setRisk]     = useState<RiskLevel | ''>('');

  const { data, isLoading, isError, refetch } = useAssessments({
    page,
    status: status || undefined,
    risk_level: risk || undefined,
  });

  const assessments = data?.items ?? [];

  const columns: Column<Assessment>[] = [
    {
      key: 'player',
      header: 'Player',
      render: (a) => (
        <div className="flex items-center gap-3">
          <Avatar src={a.playerPhotoUrl} name={a.playerName} size="sm" />
          <span className="font-medium text-slate-100">{a.playerName ?? '—'}</span>
        </div>
      ),
    },
    { key: 'type',   header: 'Type',   render: (a) => <span className="text-slate-300">{capitalize(a.assessmentType)}</span> },
    { key: 'staff',  header: 'Performed By', render: (a) => <span className="text-slate-400">{a.performedByName ?? '—'}</span> },
    { key: 'status', header: 'Status', render: (a) => <AssessmentStatusBadge status={a.assessmentStatus} /> },
    { key: 'risk',   header: 'Risk',   render: (a) => <RiskBadge level={a.finalRiskLevel} /> },
    { key: 'started', header: 'Started', render: (a) => <span className="text-sm text-slate-400">{formatDate(a.startedAt)}</span> },
    {
      key: 'actions',
      header: 'Actions',
      render: (a) => (
        <Link to={`/dashboard/assessments/${a.id}`}>
          <Button variant="ghost" size="sm"><ExternalLink size={13} /> View</Button>
        </Link>
      ),
    },
  ];

  if (isError) return <ErrorState message="Could not load assessments." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Assessments"
        subtitle="View completed and in-progress assessment sessions."
        action={
          <Link to="/dashboard/assessments/compare">
            <Button variant="secondary"><GitCompare size={15} /> Compare</Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={status} onChange={(e) => { setStatus(e.target.value as AssessmentStatus | ''); setPage(1); }} className="max-w-[200px]">
          <option value="">All Status</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In Progress</option>
          <option value="cancelled">Cancelled</option>
        </Select>
        <Select value={risk} onChange={(e) => { setRisk(e.target.value as RiskLevel | ''); setPage(1); }} className="max-w-[200px]">
          <option value="">All Risk Levels</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={assessments}
        loading={isLoading}
        emptyTitle="No assessments"
        emptyMessage="No assessment sessions found."
        pagination={data ? { currentPage: data.currentPage, lastPage: data.lastPage, onPageChange: setPage } : undefined}
      />
    </div>
  );
}

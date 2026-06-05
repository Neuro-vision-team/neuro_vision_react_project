import { useState } from 'react';
import { useAuditLogs } from '../../hooks/queries/useAuditLogs';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { DataTable, type Column } from '../../components/dashboard/DataTable';
import { SearchInput } from '../../components/dashboard/SearchInput';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDateTime } from '../../utils/formatters';
import { capitalize } from '../../utils/formatters';
import type { AuditLog } from '../../types/auditLog';

export default function AuditLogsPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError, refetch } = useAuditLogs({ page });
  const logs = data?.items ?? [];

  const filtered = search
    ? logs.filter(
        (l) =>
          l.userName.toLowerCase().includes(search.toLowerCase()) ||
          l.actionType.toLowerCase().includes(search.toLowerCase()) ||
          l.description.toLowerCase().includes(search.toLowerCase()),
      )
    : logs;

  const columns: Column<AuditLog>[] = [
    {
      key: 'user',
      header: 'User',
      render: (l) => (
        <div>
          <p className="font-medium text-slate-100">{l.userName}</p>
          <p className="text-xs text-slate-500">{l.userEmail}</p>
        </div>
      ),
    },
    {
      key: 'action',
      header: 'Action',
      render: (l) => (
        <span className="rounded-lg border border-cyan-400/20 bg-cyan-500/10 px-2 py-0.5 text-xs font-mono text-cyan-300">
          {capitalize(l.actionType)}
        </span>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      render: (l) => <span className="text-slate-300">{l.description}</span>,
    },
    {
      key: 'time',
      header: 'Recorded At',
      render: (l) => <span className="text-sm text-slate-400">{formatDateTime(l.recordedAt)}</span>,
    },
  ];

  if (isError) return <ErrorState message="Could not load audit logs." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Audit Logs"
        subtitle="Immutable trail of all user actions across the platform."
      />

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by user, action, or description..."
        className="max-w-md"
      />

      <DataTable
        columns={columns}
        data={filtered}
        loading={isLoading}
        emptyTitle="No audit logs"
        emptyMessage="No activity has been recorded yet."
        pagination={
          data
            ? { currentPage: data.currentPage, lastPage: data.lastPage, onPageChange: setPage }
            : undefined
        }
      />
    </div>
  );
}

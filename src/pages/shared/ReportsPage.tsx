/**
 * Reports are DERIVED from completed assessments.
 * There is no standalone /reports endpoint on the backend.
 */
import { useState } from 'react';
import { useAssessments } from '../../hooks/queries/useAssessments';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { SearchInput } from '../../components/dashboard/SearchInput';
import { ReportSummaryCard } from '../../components/reports/ReportSummaryCard';
import { SkeletonCard } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { ErrorState } from '../../components/ui/ErrorState';
import { Button } from '../../components/ui/Button';

export default function ReportsPage() {
  const [page, setPage]     = useState(1);
  const [search, setSearch] = useState('');

  // Reports = completed assessments
  const { data, isLoading, isError, refetch } = useAssessments({ page, status: 'completed' });

  const reports = data?.items ?? [];
  const filtered = search
    ? reports.filter((a) => (a.playerName ?? '').toLowerCase().includes(search.toLowerCase()))
    : reports;

  if (isError) return <ErrorState message="Could not load reports." onRetry={() => void refetch()} />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        subtitle="Completed assessment reports — view and download."
      />

      <SearchInput value={search} onChange={setSearch} placeholder="Search by player..." className="max-w-sm" />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtered.length === 0 ? (
        <EmptyState title="No reports" message="No completed assessment reports found." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => <ReportSummaryCard key={a.id} assessment={a} />)}
        </div>
      )}

      {data && data.lastPage > 1 && (
        <div className="flex items-center justify-center gap-3">
          <Button variant="ghost" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
          <span className="text-sm text-slate-500">Page {data.currentPage} of {data.lastPage}</span>
          <Button variant="ghost" size="sm" disabled={page >= data.lastPage} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}

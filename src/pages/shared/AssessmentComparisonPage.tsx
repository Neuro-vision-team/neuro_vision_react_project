import { useMemo, useState } from 'react';
import { FileDown, GitCompare } from 'lucide-react';
import { useAssessments, useCompareAssessments } from '../../hooks/queries/useAssessments';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Select } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/dashboard/RiskBadge';
import { ErrorState } from '../../components/ui/ErrorState';
import { LoadingState } from '../../components/ui/Spinner';
import { formatDate, capitalize } from '../../utils/formatters';
import { exportComparisonPdf } from '../../services/pdf/comparisonPdf.service';
import type { RiskLevel } from '../../types/assessment';

type Delta    = 'improved' | 'worsened' | 'unchanged';
type PdfStatus = 'idle' | 'loading' | 'success' | 'error';

function getRiskDelta(a: RiskLevel | null, b: RiskLevel | null): Delta {
  if (!a || !b) return 'unchanged';
  const rank = { low: 0, medium: 1, high: 2 };
  if (rank[b] < rank[a]) return 'improved';
  if (rank[b] > rank[a]) return 'worsened';
  return 'unchanged';
}

export default function AssessmentComparisonPage() {
  const { data: list, isLoading: loadList } = useAssessments({ page: 1 });

  const [playerId,   setPlayerId]   = useState('');
  const [idA,        setIdA]        = useState('');
  const [idB,        setIdB]        = useState('');
  const [submitted,  setSubmitted]  = useState<[string, string] | null>(null);
  const [pdfStatus,  setPdfStatus]  = useState<PdfStatus>('idle');

  const { data: compareResult, isLoading: comparing, isError, error } = useCompareAssessments(submitted);

  // Unique players from completed assessments
  const players = useMemo(() => {
    const map = new Map<string, string>();
    (list?.items ?? [])
      .filter((a) => a.assessmentStatus === 'completed')
      .forEach((a) => { if (a.playerName) map.set(a.playerId, a.playerName); });
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }));
  }, [list]);

  // Assessments for selected player
  const playerAssessments = useMemo(
    () => (list?.items ?? []).filter((a) => a.playerId === playerId && a.assessmentStatus === 'completed'),
    [list, playerId],
  );

  const assessA = playerAssessments.find((a) => a.id === idA);
  const assessB = playerAssessments.find((a) => a.id === idB);

  const canCompare   = idA && idB && idA !== idB;
  const canExportPdf = !!submitted && !!compareResult && !!assessA && !!assessB;
  const delta        = getRiskDelta(assessA?.finalRiskLevel ?? null, assessB?.finalRiskLevel ?? null);

  const handleExportPdf = async () => {
    if (!canExportPdf || pdfStatus === 'loading') return;
    setPdfStatus('loading');
    try {
      await exportComparisonPdf({
        compareResult: compareResult as Record<string, unknown>,
        assessA:       assessA!,
        assessB:       assessB!,
        playerName:    assessA!.playerName ?? 'Unknown Player',
      });
      setPdfStatus('success');
    } catch {
      setPdfStatus('error');
    } finally {
      setTimeout(() => setPdfStatus('idle'), 4000);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PageHeader
          title="Assessment Comparison"
          subtitle="Compare two assessments for the same player."
        />

        {/* Export PDF — enabled only after comparison result is loaded */}
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPdf}
            disabled={!canExportPdf || pdfStatus === 'loading'}
            loading={pdfStatus === 'loading'}
          >
            <FileDown size={14} />
            Export Compared PDF
          </Button>
          {pdfStatus === 'success' && (
            <p className="text-xs text-emerald-400">PDF exported successfully.</p>
          )}
          {pdfStatus === 'error' && (
            <p className="text-xs text-rose-400">Failed to export PDF. Please try again.</p>
          )}
        </div>
      </div>

      {loadList ? (
        <LoadingState message="Loading assessments..." />
      ) : (
        <Card>
          <div className="grid gap-4 sm:grid-cols-3">
            <Select
              label="Select Player"
              value={playerId}
              onChange={(e) => { setPlayerId(e.target.value); setIdA(''); setIdB(''); setSubmitted(null); setPdfStatus('idle'); }}
            >
              <option value="">Choose a player...</option>
              {players.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </Select>

            <Select label="Assessment A" value={idA} onChange={(e) => { setIdA(e.target.value); setSubmitted(null); setPdfStatus('idle'); }} disabled={!playerId}>
              <option value="">Choose...</option>
              {playerAssessments.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === idB}>
                  {capitalize(a.assessmentType)} — {formatDate(a.startedAt)}
                </option>
              ))}
            </Select>

            <Select label="Assessment B" value={idB} onChange={(e) => { setIdB(e.target.value); setSubmitted(null); setPdfStatus('idle'); }} disabled={!playerId}>
              <option value="">Choose...</option>
              {playerAssessments.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === idA}>
                  {capitalize(a.assessmentType)} — {formatDate(a.startedAt)}
                </option>
              ))}
            </Select>
          </div>

          {playerId && playerAssessments.length < 2 && (
            <p className="mt-3 text-sm text-amber-400">
              This player needs at least 2 completed assessments to compare.
            </p>
          )}

          <div className="mt-4">
            <Button
              disabled={!canCompare}
              loading={comparing}
              onClick={() => { if (canCompare) setSubmitted([idA, idB]); }}
            >
              <GitCompare size={15} /> Compare
            </Button>
          </div>
        </Card>
      )}

      {/* Comparison error (e.g., 422 different players) */}
      {isError && (
        <ErrorState
          title="Comparison failed"
          message={error instanceof Error ? error.message : 'Assessments must belong to the same player.'}
        />
      )}

      {/* Side-by-side result */}
      {submitted && compareResult && assessA && assessB && (
        <Card>
          <div className="grid gap-4 sm:grid-cols-2">
            {[assessA, assessB].map((a, idx) => (
              <div key={a.id} className="rounded-2xl border border-slate-800/50 bg-slate-900/30 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Assessment {idx === 0 ? 'A' : 'B'}
                </p>
                <p className="mt-1 font-semibold text-slate-100">{capitalize(a.assessmentType)}</p>
                <p className="text-sm text-slate-400">{formatDate(a.startedAt)}</p>
                <div className="mt-3">
                  <RiskBadge level={a.finalRiskLevel} />
                </div>
              </div>
            ))}
          </div>

          {/* Delta indicator */}
          <div className="mt-4 flex items-center justify-center gap-2 rounded-xl border border-slate-800/50 bg-slate-900/30 p-3">
            <span className="text-sm text-slate-400">Risk change:</span>
            <span className={
              delta === 'improved' ? 'text-sm font-semibold text-emerald-400' :
              delta === 'worsened' ? 'text-sm font-semibold text-rose-400'    :
              'text-sm font-semibold text-slate-400'
            }>
              {delta === 'improved' ? '↓ Improved' : delta === 'worsened' ? '↑ Worsened' : '— Unchanged'}
            </span>
          </div>
        </Card>
      )}
    </div>
  );
}

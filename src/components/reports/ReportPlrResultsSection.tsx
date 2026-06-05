/**
 * PLR Results section for the Report Details page (read-only).
 *
 * Renders, for a completed report:
 *   1. Left & Right eye videos (authenticated blob fetch — see PlrEyeVideoCard)
 *   2. Left-vs-Right normalized spider chart (only when both eyes have metrics)
 *   3. Left & Right eye metric cards (with Risk Classification)
 *
 * Display only — no upload, no analysis trigger, no SCAT edit.
 */
import { useMemo } from 'react';
import { Card } from '../ui/Card';
import { EmptyState } from '../ui/EmptyState';
import { LoadingState } from '../ui/Spinner';
import { ErrorState } from '../ui/ErrorState';
import { PlrEyeVideoCard } from '../assessments/PlrEyeVideoCard';
import { PlrEyeSummary } from '../assessments/PlrEyeSummary';
import { PlrSpiderChart } from '../assessments/PlrSpiderChart';
import { buildPlrRadarData } from '../../utils/plrChart';
import type { PlrTest } from '../../types/plr';

interface ReportPlrResultsSectionProps {
  tests:        PlrTest[] | undefined;
  playerId:     string;
  assessmentId: string;
  loading?:     boolean;
  error?:       boolean;
  onRetry?:     () => void;
}

export function ReportPlrResultsSection({
  tests,
  playerId,
  assessmentId,
  loading  = false,
  error    = false,
  onRetry,
}: ReportPlrResultsSectionProps) {
  const left  = tests?.find((t) => t.eyeSide === 'left')  ?? null;
  const right = tests?.find((t) => t.eyeSide === 'right') ?? null;

  const bothMetrics = !!left?.metric && !!right?.metric;
  const radarData   = useMemo(
    () => (bothMetrics ? buildPlrRadarData(left!.metric, right!.metric) : []),
    [bothMetrics, left, right],
  );

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-slate-100">PLR Results</h2>

      {loading ? (
        <Card><LoadingState message="Loading PLR results..." /></Card>
      ) : error ? (
        <Card><ErrorState message="Could not load PLR results." onRetry={onRetry} /></Card>
      ) : !tests || tests.length === 0 ? (
        <Card>
          <EmptyState
            title="No PLR results"
            message="No PLR results are available for this report."
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {/* 1. Videos — left + right (authenticated blob fetch) */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PlrEyeVideoCard
              eyeSide="left"
              playerId={playerId}
              assessmentId={assessmentId}
              analysisStatus={left?.analysisStatus ?? 'pending'}
              qualityPassed={left?.qualityPassed   ?? false}
              qualityScore={left?.qualityScore     ?? null}
            />
            <PlrEyeVideoCard
              eyeSide="right"
              playerId={playerId}
              assessmentId={assessmentId}
              analysisStatus={right?.analysisStatus ?? 'pending'}
              qualityPassed={right?.qualityPassed   ?? false}
              qualityScore={right?.qualityScore     ?? null}
            />
          </div>

          {/* 2. Spider chart — only when both eyes have metrics */}
          {bothMetrics ? (
            <Card>
              <p className="mb-3 text-sm font-semibold text-slate-200">Left vs Right PLR Comparison</p>
              <PlrSpiderChart data={radarData} />
            </Card>
          ) : (
            <Card>
              <p className="text-center text-sm text-slate-500">
                Spider chart requires both left and right eye results.
              </p>
            </Card>
          )}

          {/* 3. Metric cards */}
          <div className="grid gap-4 lg:grid-cols-2">
            <PlrEyeSummary eyeSide="left"  test={left}  />
            <PlrEyeSummary eyeSide="right" test={right} />
          </div>
        </div>
      )}
    </section>
  );
}

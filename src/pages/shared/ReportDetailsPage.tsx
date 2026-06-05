import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileDown } from 'lucide-react';
import {
  useAssessmentReport,
  useAssessmentPlr,
  useAssessmentScatOnField,
  useAssessmentScatOffField,
} from '../../hooks/queries/useAssessments';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/dashboard/RiskBadge';
import { ScatOnFieldSummary } from '../../components/assessments/ScatOnFieldSummary';
import { ScatOffFieldSummary } from '../../components/assessments/ScatOffFieldSummary';
import { MedicalDisclaimer } from '../../components/reports/MedicalDisclaimer';
import { ReportPlrResultsSection } from '../../components/reports/ReportPlrResultsSection';
import { LoadingState } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDateTime, capitalize } from '../../utils/formatters';
import { exportReportPdf } from '../../services/pdf/reportPdf.service';
import type { RiskLevel } from '../../types/assessment';

type PdfStatus = 'idle' | 'loading' | 'success' | 'error';

export default function ReportDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const assessmentId = id ?? '';

  const { data: report, isLoading, isError, refetch }           = useAssessmentReport(assessmentId);
  const { data: plrTests, isLoading: plrLoading, isError: plrError, refetch: plrRefetch } = useAssessmentPlr(assessmentId);
  const { data: scatOn }  = useAssessmentScatOnField(assessmentId);
  const { data: scatOff } = useAssessmentScatOffField(assessmentId);

  const [pdfStatus, setPdfStatus] = useState<PdfStatus>('idle');

  const handleExportPdf = async () => {
    if (!report || pdfStatus === 'loading') return;
    setPdfStatus('loading');
    try {
      await exportReportPdf({
        report,
        plrTests: plrTests ?? [],
        scatOn:   scatOn   ?? null,
        scatOff:  scatOff  ?? null,
      });
      setPdfStatus('success');
    } catch {
      setPdfStatus('error');
    } finally {
      setTimeout(() => setPdfStatus('idle'), 4000);
    }
  };

  if (isLoading) return <LoadingState message="Loading report..." />;
  if (isError)   return <ErrorState message="Could not load report." onRetry={() => void refetch()} />;
  if (!report)   return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link to="/dashboard/reports">
            <Button variant="ghost" size="sm"><ArrowLeft size={14} /> Back</Button>
          </Link>
          <PageHeader
            title="Report Details"
            subtitle={`${capitalize(report.assessmentType)} assessment report`}
          />
        </div>

        {/* Export PDF button */}
        <div className="flex flex-col items-end gap-1">
          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportPdf}
            disabled={isLoading || !report || pdfStatus === 'loading'}
            loading={pdfStatus === 'loading'}
          >
            <FileDown size={14} />
            Export PDF
          </Button>
          {pdfStatus === 'success' && (
            <p className="text-xs text-emerald-400">PDF exported successfully.</p>
          )}
          {pdfStatus === 'error' && (
            <p className="text-xs text-rose-400">Failed to export PDF. Please try again.</p>
          )}
        </div>
      </div>

      {/* Header card */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={report.playerPhotoUrl} name={report.playerName} size="lg" />
            <div>
              <p className="text-lg font-semibold text-slate-50">{report.playerName}</p>
              <p className="text-sm text-slate-400">{report.teamName}</p>
            </div>
          </div>
          <RiskBadge level={report.finalRiskLevel as RiskLevel | null} />
        </div>

        <dl className="mt-5 grid gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Type',         capitalize(report.assessmentType)],
            ['Performed By', report.performedByName],
            ['Started',      formatDateTime(report.startedAt)],
            ['Completed',    report.completedAt ? formatDateTime(report.completedAt) : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-0.5 text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>

        {report.recommendationSummary && (
          <div className="mt-4 rounded-xl border border-cyan-400/20 bg-cyan-500/5 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-cyan-400">Recommendation</p>
            <p className="mt-1 text-sm text-slate-200">{report.recommendationSummary}</p>
          </div>
        )}
      </Card>

      {/* PLR — videos + spider chart + metric cards */}
      <ReportPlrResultsSection
        tests={plrTests}
        playerId={report.playerId}
        assessmentId={assessmentId}
        loading={plrLoading}
        error={plrError}
        onRetry={() => void plrRefetch()}
      />

      {/* SCAT */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">SCAT Results</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ScatOnFieldSummary data={scatOn} />
          <ScatOffFieldSummary data={scatOff} />
        </div>
      </div>

      {/* Disclaimer */}
      <MedicalDisclaimer />
    </div>
  );
}

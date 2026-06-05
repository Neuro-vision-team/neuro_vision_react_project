import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText } from 'lucide-react';
import {
  useAssessment,
  useAssessmentPlr,
  useAssessmentScatOnField,
  useAssessmentScatOffField,
} from '../../hooks/queries/useAssessments';
import { PageHeader } from '../../components/dashboard/PageHeader';
import { Card } from '../../components/ui/Card';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/dashboard/RiskBadge';
import { AssessmentStatusBadge } from '../../components/assessments/AssessmentStatusBadge';
import { PlrEyeSummary } from '../../components/assessments/PlrEyeSummary';
import { ScatOnFieldSummary } from '../../components/assessments/ScatOnFieldSummary';
import { ScatOffFieldSummary } from '../../components/assessments/ScatOffFieldSummary';
import { LoadingState } from '../../components/ui/Spinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { formatDateTime, capitalize } from '../../utils/formatters';

export default function AssessmentDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const assessmentId = id ?? '';

  const { data: assessment, isLoading, isError, refetch } = useAssessment(assessmentId);
  const { data: plrTests }   = useAssessmentPlr(assessmentId);
  const { data: scatOn }     = useAssessmentScatOnField(assessmentId);
  const { data: scatOff }    = useAssessmentScatOffField(assessmentId);

  if (isLoading) return <LoadingState message="Loading assessment..." />;
  if (isError)   return <ErrorState message="Could not load assessment." onRetry={() => void refetch()} />;
  if (!assessment) return null;

  const leftEye  = plrTests?.find((t) => t.eyeSide === 'left');
  const rightEye = plrTests?.find((t) => t.eyeSide === 'right');

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard/assessments">
          <Button variant="ghost" size="sm"><ArrowLeft size={14} /> Back</Button>
        </Link>
        <PageHeader
          title="Assessment Details"
          subtitle={`${capitalize(assessment.assessmentType)} session`}
        />
        {assessment.assessmentStatus === 'completed' && (
          <Link to={`/dashboard/reports/${assessment.id}`} className="ml-auto">
            <Button variant="secondary" size="sm"><FileText size={14} /> View Report</Button>
          </Link>
        )}
      </div>

      {/* Session summary */}
      <Card>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar src={assessment.playerPhotoUrl} name={assessment.playerName} size="lg" />
            <div>
              <p className="text-lg font-semibold text-slate-50">{assessment.playerName ?? '—'}</p>
              <p className="text-sm text-slate-400">Performed by {assessment.performedByName ?? '—'}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <RiskBadge level={assessment.finalRiskLevel} />
            <AssessmentStatusBadge status={assessment.assessmentStatus} />
          </div>
        </div>

        <dl className="mt-5 grid gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {[
            ['Type',          capitalize(assessment.assessmentType)],
            ['Status',        capitalize(assessment.assessmentStatus)],
            ['Started',       formatDateTime(assessment.startedAt)],
            ['Completed',     assessment.completedAt ? formatDateTime(assessment.completedAt) : '—'],
            ['Completion',    assessment.completionReason ? capitalize(assessment.completionReason) : '—'],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
              <dd className="mt-0.5 text-slate-200">{value}</dd>
            </div>
          ))}
        </dl>
      </Card>

      {/* PLR Results — display only */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">PLR Results</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <PlrEyeSummary eyeSide="left"  test={leftEye} />
          <PlrEyeSummary eyeSide="right" test={rightEye} />
        </div>
      </div>

      {/* SCAT Results — display only */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-slate-100">SCAT Results</h2>
        <div className="grid gap-4 lg:grid-cols-2">
          <ScatOnFieldSummary data={scatOn} />
          <ScatOffFieldSummary data={scatOff} />
        </div>
      </div>
    </div>
  );
}

/**
 * SCAT off-field summary — display-only. No editing.
 */
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { ScatOffField } from '../../types/scat';

interface ScatOffFieldSummaryProps {
  data: ScatOffField | null | undefined;
}

function DataRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/40 py-1.5 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-medium text-slate-100">{value ?? '—'}</span>
    </div>
  );
}

export function ScatOffFieldSummary({ data }: ScatOffFieldSummaryProps) {
  if (!data) {
    return (
      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-300">SCAT Off-Field</p>
        <p className="text-sm text-slate-500">Not recorded.</p>
      </Card>
    );
  }

  const diagnosisVariant =
    data.concussionDiagnosed === 'yes'       ? 'danger' :
    data.concussionDiagnosed === 'suspected' ? 'warning' :
    'success';

  const diagnosisLabel =
    data.concussionDiagnosed === 'yes'       ? 'Concussion Diagnosed' :
    data.concussionDiagnosed === 'suspected' ? 'Suspected' :
    'No Concussion';

  return (
    <Card>
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-200">SCAT Off-Field</p>
        <Badge variant={diagnosisVariant}>{diagnosisLabel}</Badge>
      </div>

      <div className="space-y-0">
        <DataRow label="Symptoms Count"        value={data.totalSymptomsCount} />
        <DataRow label="Symptoms Severity"     value={data.symptomsSeverityScore} />
        <DataRow label="Orientation Score"     value={`${data.orientationScore} / 5`} />
        <DataRow label="Immediate Memory"      value={`${data.immediateMemoryTotal} / 15`} />
        <DataRow label="Concentration"         value={`${data.concentrationTotalScore} / 5`} />
        <DataRow label="mBESS Errors"          value={data.mbessTotal} />
        <DataRow label="Delayed Recall"        value={`${data.delayedRecallScore} / 5`} />
        <DataRow label="Cognitive Total"       value={`${data.cognitiveTotalScore} / 30`} />
      </div>

      {data.clinicalNotes && (
        <div className="mt-3 rounded-xl border border-slate-700/40 bg-slate-800/30 p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400 mb-1">Clinical Notes</p>
          <p className="text-sm text-slate-300">{data.clinicalNotes}</p>
        </div>
      )}
    </Card>
  );
}

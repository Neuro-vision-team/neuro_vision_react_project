/**
 * SCAT on-field summary — display-only. No editing.
 */
import { Card } from '../ui/Card';
import type { ScatOnField } from '../../types/scat';

interface ScatOnFieldSummaryProps {
  data: ScatOnField | null | undefined;
}

function DataRow({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div className="flex items-start justify-between border-b border-slate-800/40 py-1.5 text-sm last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className="ml-4 text-right font-medium text-slate-100">{value ?? '—'}</span>
    </div>
  );
}

export function ScatOnFieldSummary({ data }: ScatOnFieldSummaryProps) {
  if (!data) {
    return (
      <Card>
        <p className="mb-2 text-sm font-semibold text-slate-300">SCAT On-Field</p>
        <p className="text-sm text-slate-500">Not recorded.</p>
      </Card>
    );
  }

  const redFlagCount = Object.values(data.redFlags).filter(Boolean).length;
  const signCount    = Object.values(data.observableSigns).filter(Boolean).length;

  return (
    <Card>
      <p className="mb-3 text-sm font-semibold text-slate-200">SCAT On-Field</p>
      <div className="space-y-0">
        <DataRow label="Red Flags Triggered"    value={redFlagCount} />
        <DataRow label="Observable Signs"       value={signCount} />
        <DataRow label="Maddocks Score"         value={data.maddocksScore} />
      </div>
    </Card>
  );
}

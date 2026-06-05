import { Info } from 'lucide-react';

export function MedicalDisclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-amber-400/20 bg-amber-500/10 p-4">
      <Info size={18} className="mt-0.5 shrink-0 text-amber-400" />
      <p className="text-sm text-amber-200">
        <strong>Medical Disclaimer:</strong> This report is a clinical decision-support document
        and not a final medical diagnosis. All results require review and confirmation by a
        qualified medical professional before any clinical decisions are made.
      </p>
    </div>
  );
}

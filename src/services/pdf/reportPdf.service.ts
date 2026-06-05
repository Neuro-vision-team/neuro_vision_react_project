import type { AssessmentReport } from '../../types/report';
import type { PlrTest } from '../../types/plr';
import type { ScatOnField, ScatOffField } from '../../types/scat';
import {
  MARGIN,
  newDoc,
  guardPage,
  addHeader,
  addFooter,
  addSectionTitle,
  addKeyValueRows,
  addTable,
  addDisclaimer,
  formatRiskLevel,
  safeText,
  type State,
} from './pdfHelpers';

export type ReportPdfData = {
  report: AssessmentReport;
  plrTests?: PlrTest[];
  scatOn?: ScatOnField | null;
  scatOff?: ScatOffField | null;
};

// ─── Main export function ──────────────────────────────────────────────────────
export async function exportReportPdf(data: ReportPdfData): Promise<void> {
  const { report, plrTests = [], scatOn, scatOff } = data;

  const doc = newDoc();
  const s: State = { doc, y: addHeader(doc, 'Clinical Assessment Report') };

  // ── Report information ─────────────────────────────────────────────────────
  addSectionTitle(s, 'Report Information');
  addKeyValueRows(s, [
    ['Report / Assessment ID', safeText(report.assessmentId)],
    ['Session ID',             safeText(report.assessmentId)],
    ['Assessment Type',        cap(report.assessmentType)],
    ['Status',                 cap(report.status)],
    ['Final Risk Level',       formatRiskLevel(report.finalRiskLevel)],
    ['Assessment Date',        fmtDatetime(report.startedAt)],
    ['Completed At',           report.completedAt ? fmtDatetime(report.completedAt) : '—'],
  ]);

  // ── Patient & team ─────────────────────────────────────────────────────────
  addSectionTitle(s, 'Patient & Team Information');
  addKeyValueRows(s, [
    ['Player Name',  safeText(report.playerName)],
    ['Team',         safeText(report.teamName)],
    ['Performed By', safeText(report.performedByName)],
  ]);

  // ── Recommendation ─────────────────────────────────────────────────────────
  if (report.recommendationSummary) {
    addSectionTitle(s, 'Recommendation');
    addKeyValueRows(s, [['Summary', safeText(report.recommendationSummary)]]);
  }

  // ── PLR Results ────────────────────────────────────────────────────────────
  const left  = plrTests.find((t) => t.eyeSide === 'left')  ?? null;
  const right = plrTests.find((t) => t.eyeSide === 'right') ?? null;

  addSectionTitle(s, 'PLR Results');

  if (!left && !right) {
    guardPage(s, 10);
    s.doc.setFont('helvetica', 'italic');
    s.doc.setFontSize(8.5);
    s.doc.setTextColor(100, 116, 139);
    s.doc.text('No PLR results available for this report.', MARGIN, s.y);
    s.y += 8;
  } else {
    // Left eye metrics
    if (left) {
      addSectionTitle(s, 'Left Eye Metrics');
      addKeyValueRows(s, buildEyeMetricRows(left));
    }

    // Right eye metrics
    if (right) {
      addSectionTitle(s, 'Right Eye Metrics');
      addKeyValueRows(s, buildEyeMetricRows(right));
    }

    // Combined metrics comparison table (when both eyes available)
    if (left && right) {
      addSectionTitle(s, 'PLR Left vs Right Comparison');
      addTable(s, ['Metric', 'Left Eye', 'Right Eye'], buildPlrComparisonRows(left, right));
    }

    // Video references
    addSectionTitle(s, 'PLR Video References');
    addKeyValueRows(s, [
      ['Left Eye Video URL',  left?.displayVideoUrl  ?? '— No video available'],
      ['Right Eye Video URL', right?.displayVideoUrl ?? '— No video available'],
    ]);

    // Risk classification + expert rules per eye
    for (const test of ([left, right].filter(Boolean) as PlrTest[])) {
      const rc       = test.metric?.riskClassification;
      const eyeLabel = test.eyeSide === 'left' ? 'Left' : 'Right';
      if (!rc) continue;

      addSectionTitle(s, `Risk Classification — ${eyeLabel} Eye`);
      addKeyValueRows(s, [
        ['Risk Level',     formatRiskLevel(rc.riskLevel)],
        ['Confidence',     `${(rc.confidence * 100).toFixed(1)}%`],
        ['Recommendation', safeText(rc.recommendation)],
        ['Reasoning',      safeText(rc.reasoningSummary)],
        ['Model',          `${safeText(rc.modelName)} v${safeText(rc.modelVersion)}`],
      ]);

      if (rc.expertRuleResults.length > 0) {
        addSectionTitle(s, `Expert Rule Results — ${eyeLabel} Eye`);
        addTable(
          s,
          ['Code', 'Rule Name', 'Triggered', 'Explanation'],
          rc.expertRuleResults.map((r) => [
            safeText(r.ruleCode),
            safeText(r.ruleName),
            r.triggered ? 'Yes' : 'No',
            safeText(r.explanation),
          ]),
        );
      }
    }
  }

  // ── SCAT On-Field ──────────────────────────────────────────────────────────
  if (scatOn) {
    addSectionTitle(s, 'SCAT On-Field Summary');
    addKeyValueRows(s, [
      ['Maddocks Score',   safeText(scatOn.maddocksScore)],
      ['Red Flags',        flagKeys(scatOn.redFlags)],
      ['Observable Signs', flagKeys(scatOn.observableSigns)],
    ]);
  }

  // ── SCAT Off-Field ─────────────────────────────────────────────────────────
  if (scatOff) {
    addSectionTitle(s, 'SCAT Off-Field Summary');
    addKeyValueRows(s, [
      ['Total Symptoms',        safeText(scatOff.totalSymptomsCount)],
      ['Symptom Severity Score', safeText(scatOff.symptomsSeverityScore)],
      ['Orientation Score',     safeText(scatOff.orientationScore)],
      ['Immediate Memory Total', safeText(scatOff.immediateMemoryTotal)],
      ['Concentration Score',   safeText(scatOff.concentrationTotalScore)],
      ['Cognitive Total Score', safeText(scatOff.cognitiveTotalScore)],
      ['Delayed Recall Score',  safeText(scatOff.delayedRecallScore)],
      ['Concussion Diagnosed',  cap(scatOff.concussionDiagnosed)],
      ['Clinical Notes',        safeText(scatOff.clinicalNotes)],
    ]);
  }

  // ── Medical disclaimer ─────────────────────────────────────────────────────
  addDisclaimer(s);
  addFooter(doc);

  doc.save(`neuro-vision-report-${report.assessmentId}.pdf`);
}

// ─── Private helpers ───────────────────────────────────────────────────────────

function buildEyeMetricRows(test: PlrTest): [string, string][] {
  const m = test.metric;
  const n = (v: number | undefined | null) => (v !== undefined && v !== null ? v.toFixed(2) : '—');
  return [
    ['Eye Side',             test.eyeSide === 'left' ? 'Left' : 'Right'],
    ['Analysis Status',      safeText(test.analysisStatus)],
    ['Quality Score',        n(test.qualityScore)],
    ['Quality Passed',       test.qualityPassed ? 'Yes' : 'No'],
    ['Quality Notes',        safeText(test.qualityNotes)],
    ['FPS',                  n(test.fps)],
    ['Duration (s)',         n(test.durationSeconds)],
    ...(m ? ([
      ['Max Diameter (mm)',       n(m.maxDiameterMm)],
      ['Min Diameter (mm)',       n(m.minDiameterMm)],
      ['Constriction (%)',        n(m.constrictionPercent)],
      ['Latency (ms)',            n(m.latencyMs)],
      ['Peak Constr. Velocity',   n(m.peakConstrictionVelocity)],
      ['Avg Constr. Velocity',    n(m.avgConstrictionVelocity)],
      ['Avg Dilation Velocity',   n(m.avgDilationVelocity)],
      ['Peak Dilation Velocity',  n(m.peakDilationVelocity)],
      ['T75 (s)',                 n(m.t75Seconds)],
      ['Confidence Score',        n(m.confidenceScore)],
    ] as [string, string][]) : []),
  ];
}

function buildPlrComparisonRows(left: PlrTest, right: PlrTest): string[][] {
  const lm = left.metric;
  const rm = right.metric;
  const n  = (v: number | undefined | null) =>
    v !== undefined && v !== null ? v.toFixed(2) : '—';

  return [
    ['Max Diameter (mm)',      n(lm?.maxDiameterMm),            n(rm?.maxDiameterMm)],
    ['Min Diameter (mm)',      n(lm?.minDiameterMm),            n(rm?.minDiameterMm)],
    ['Constriction (%)',       n(lm?.constrictionPercent),      n(rm?.constrictionPercent)],
    ['Latency (ms)',           n(lm?.latencyMs),                n(rm?.latencyMs)],
    ['Peak Constr. Vel.',      n(lm?.peakConstrictionVelocity), n(rm?.peakConstrictionVelocity)],
    ['Avg Constr. Vel.',       n(lm?.avgConstrictionVelocity),  n(rm?.avgConstrictionVelocity)],
    ['Avg Dilation Vel.',      n(lm?.avgDilationVelocity),      n(rm?.avgDilationVelocity)],
    ['Peak Dilation Vel.',     n(lm?.peakDilationVelocity),     n(rm?.peakDilationVelocity)],
    ['T75 (s)',                n(lm?.t75Seconds),               n(rm?.t75Seconds)],
    ['Quality Score',          n(left.qualityScore),            n(right.qualityScore)],
    ['Analysis Status',        safeText(left.analysisStatus),   safeText(right.analysisStatus)],
  ];
}

function flagKeys(obj: Record<string, unknown>): string {
  const triggered = Object.entries(obj)
    .filter(([, v]) =>
      v === true ||
      (typeof v === 'object' && v !== null &&
        (v as Record<string, unknown>).present === true),
    )
    .map(([k]) => k.replace(/_/g, ' '));
  return triggered.length > 0 ? triggered.join(', ') : 'None';
}

function cap(s: string | undefined | null): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDatetime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

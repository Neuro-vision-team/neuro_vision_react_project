import type { Assessment, RiskLevel } from '../../types/assessment';
import {
  newDoc,
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

export type ComparisonPdfData = {
  compareResult: Record<string, unknown>;
  assessA: Assessment;
  assessB: Assessment;
  playerName: string;
};

type Delta = 'improved' | 'worsened' | 'unchanged';

// ─── Main export function ──────────────────────────────────────────────────────
export async function exportComparisonPdf(data: ComparisonPdfData): Promise<void> {
  const { compareResult, assessA, assessB, playerName } = data;

  const doc = newDoc();
  const s: State = { doc, y: addHeader(doc, 'Assessment Comparison Report') };

  // ── Overview ───────────────────────────────────────────────────────────────
  addSectionTitle(s, 'Comparison Overview');
  addKeyValueRows(s, [
    ['Player',          safeText(playerName)],
    ['Assessment A ID', safeText(assessA.id)],
    ['Assessment B ID', safeText(assessB.id)],
    ['Generated',       new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })],
  ]);

  // ── Assessment A summary ───────────────────────────────────────────────────
  addSectionTitle(s, 'Assessment A');
  addKeyValueRows(s, [
    ['ID',           safeText(assessA.id)],
    ['Type',         cap(assessA.assessmentType)],
    ['Date',         fmtDate(assessA.startedAt)],
    ['Completed',    assessA.completedAt ? fmtDate(assessA.completedAt) : '—'],
    ['Final Risk',   formatRiskLevel(assessA.finalRiskLevel)],
    ['Performed By', safeText(assessA.performedByName)],
  ]);

  // ── Assessment B summary ───────────────────────────────────────────────────
  addSectionTitle(s, 'Assessment B');
  addKeyValueRows(s, [
    ['ID',           safeText(assessB.id)],
    ['Type',         cap(assessB.assessmentType)],
    ['Date',         fmtDate(assessB.startedAt)],
    ['Completed',    assessB.completedAt ? fmtDate(assessB.completedAt) : '—'],
    ['Final Risk',   formatRiskLevel(assessB.finalRiskLevel)],
    ['Performed By', safeText(assessB.performedByName)],
  ]);

  // ── Risk delta ─────────────────────────────────────────────────────────────
  const delta = getRiskDelta(assessA.finalRiskLevel, assessB.finalRiskLevel);
  addSectionTitle(s, 'Risk Change Analysis');
  addKeyValueRows(s, [
    ['Risk Level (Assessment A)', formatRiskLevel(assessA.finalRiskLevel)],
    ['Risk Level (Assessment B)', formatRiskLevel(assessB.finalRiskLevel)],
    ['Risk Change',               formatDelta(delta)],
  ]);

  // ── Side-by-side summary table ─────────────────────────────────────────────
  addSectionTitle(s, 'Side-by-Side Summary');
  addTable(s,
    ['Field', 'Assessment A', 'Assessment B'],
    [
      ['Type',       cap(assessA.assessmentType),   cap(assessB.assessmentType)],
      ['Date',       fmtDate(assessA.startedAt),    fmtDate(assessB.startedAt)],
      ['Risk Level', formatRiskLevel(assessA.finalRiskLevel), formatRiskLevel(assessB.finalRiskLevel)],
      ['Status',     cap(assessA.assessmentStatus), cap(assessB.assessmentStatus)],
    ],
  );

  // ── Backend comparison data (extracted safely from compare response) ────────
  if (compareResult && typeof compareResult === 'object') {
    // Notes / recommendation from backend
    const notes = extractText(compareResult['notes'] ?? compareResult['recommendation'] ?? compareResult['summary']);
    if (notes !== '—') {
      addSectionTitle(s, 'Notes / Recommendation');
      addKeyValueRows(s, [['', notes]]);
    }

    // PLR comparison block
    const plrRaw = compareResult['plr_comparison'] ?? compareResult['plr'];
    if (plrRaw && typeof plrRaw === 'object' && !Array.isArray(plrRaw)) {
      const plrObj  = plrRaw as Record<string, unknown>;
      const plrRows = Object.entries(plrObj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k.replace(/_/g, ' '), extractText(v)]);
      if (plrRows.length > 0) {
        addSectionTitle(s, 'PLR Comparison');
        addTable(s, ['Metric', 'Value'], plrRows);
      }
    }

    // Left eye comparison
    const leftRaw = compareResult['left_eye'] ?? compareResult['plr_left'];
    if (leftRaw && typeof leftRaw === 'object' && !Array.isArray(leftRaw)) {
      const obj  = leftRaw as Record<string, unknown>;
      const rows = Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k.replace(/_/g, ' '), extractText(v)]);
      if (rows.length > 0) {
        addSectionTitle(s, 'Left Eye Comparison');
        addTable(s, ['Metric', 'Value'], rows);
      }
    }

    // Right eye comparison
    const rightRaw = compareResult['right_eye'] ?? compareResult['plr_right'];
    if (rightRaw && typeof rightRaw === 'object' && !Array.isArray(rightRaw)) {
      const obj  = rightRaw as Record<string, unknown>;
      const rows = Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k.replace(/_/g, ' '), extractText(v)]);
      if (rows.length > 0) {
        addSectionTitle(s, 'Right Eye Comparison');
        addTable(s, ['Metric', 'Value'], rows);
      }
    }

    // SCAT comparison block
    const scatRaw = compareResult['scat_comparison'] ?? compareResult['scat'];
    if (scatRaw && typeof scatRaw === 'object' && !Array.isArray(scatRaw)) {
      const scatObj  = scatRaw as Record<string, unknown>;
      const scatRows = Object.entries(scatObj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k.replace(/_/g, ' '), extractText(v)]);
      if (scatRows.length > 0) {
        addSectionTitle(s, 'SCAT Comparison');
        addTable(s, ['Category', 'Value'], scatRows);
      }
    }

    // Risk classification comparison
    const riskRaw = compareResult['risk_classification'] ?? compareResult['risk_comparison'];
    if (riskRaw && typeof riskRaw === 'object' && !Array.isArray(riskRaw)) {
      const obj  = riskRaw as Record<string, unknown>;
      const rows = Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k.replace(/_/g, ' '), extractText(v)]);
      if (rows.length > 0) {
        addSectionTitle(s, 'Risk Classification Comparison');
        addTable(s, ['Field', 'Value'], rows);
      }
    }

    // Expert rule result comparison
    const rulesRaw = compareResult['expert_rules'] ?? compareResult['expert_rule_results'];
    if (rulesRaw && typeof rulesRaw === 'object' && !Array.isArray(rulesRaw)) {
      const obj  = rulesRaw as Record<string, unknown>;
      const rows = Object.entries(obj)
        .filter(([, v]) => v !== null && v !== undefined)
        .map(([k, v]) => [k.replace(/_/g, ' '), extractText(v)]);
      if (rows.length > 0) {
        addSectionTitle(s, 'Expert Rule Results Comparison');
        addTable(s, ['Rule', 'Result'], rows);
      }
    }
  }

  // ── Medical disclaimer ─────────────────────────────────────────────────────
  addDisclaimer(s);
  addFooter(doc);

  const safeName = playerName.replace(/[^a-z0-9]/gi, '-').toLowerCase();
  doc.save(`neuro-vision-comparison-${safeName}-${assessA.id}-${assessB.id}.pdf`);
}

// ─── Private helpers ───────────────────────────────────────────────────────────

function getRiskDelta(a: RiskLevel | null, b: RiskLevel | null): Delta {
  if (!a || !b) return 'unchanged';
  const rank: Record<string, number> = { low: 0, medium: 1, high: 2 };
  const ra = rank[a] ?? 1;
  const rb = rank[b] ?? 1;
  if (rb < ra) return 'improved';
  if (rb > ra) return 'worsened';
  return 'unchanged';
}

function formatDelta(delta: Delta): string {
  if (delta === 'improved') return 'IMPROVED — Risk reduced from A to B';
  if (delta === 'worsened') return 'WORSENED — Risk increased from A to B';
  return 'UNCHANGED — Same risk level in both assessments';
}

function cap(s: string | undefined | null): string {
  if (!s) return '—';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' });
  } catch {
    return iso;
  }
}

function extractText(value: unknown): string {
  if (value === null || value === undefined) return '—';
  if (typeof value === 'object') {
    try { return JSON.stringify(value); } catch { return '[object]'; }
  }
  const str = String(value).trim();
  return str || '—';
}

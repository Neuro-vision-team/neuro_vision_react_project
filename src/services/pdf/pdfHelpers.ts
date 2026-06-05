import { jsPDF } from 'jspdf';

// ─── Page constants ────────────────────────────────────────────────────────────
export const PAGE      = { W: 210, H: 297 } as const;
export const MARGIN    = 14;
export const CONTENT_W = PAGE.W - MARGIN * 2;

// ─── Cursor state passed through all helpers ───────────────────────────────────
export type State = { doc: jsPDF; y: number };

export function newDoc(): jsPDF {
  return new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
}

// ─── Page overflow guard ───────────────────────────────────────────────────────
export function guardPage(s: State, needed = 10): void {
  if (s.y + needed > PAGE.H - 18) {
    s.doc.addPage();
    s.y = 20;
  }
}

// ─── Header — call once per document, returns starting y ──────────────────────
export function addHeader(doc: jsPDF, title: string): number {
  doc.setFillColor(12, 26, 46);
  doc.rect(0, 0, PAGE.W, 18, 'F');
  doc.setFillColor(6, 182, 212);
  doc.rect(0, 18, PAGE.W, 1.2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(6, 182, 212);
  doc.text('NEURO VISION', MARGIN, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text(title, PAGE.W - MARGIN, 12, { align: 'right' });

  return 26;
}

// ─── Footer — call once after all content is written ──────────────────────────
export function addFooter(doc: jsPDF): void {
  const total   = doc.getNumberOfPages();
  const dateStr = new Date().toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' });

  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setDrawColor(226, 232, 240);
    doc.setLineWidth(0.3);
    doc.line(MARGIN, PAGE.H - 14, PAGE.W - MARGIN, PAGE.H - 14);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${dateStr}`, MARGIN, PAGE.H - 9);
    doc.text(`Page ${i} of ${total}`, PAGE.W - MARGIN, PAGE.H - 9, { align: 'right' });
  }
}

// ─── Section title with cyan underline ────────────────────────────────────────
export function addSectionTitle(s: State, title: string): void {
  guardPage(s, 14);
  s.y += 4;
  s.doc.setFont('helvetica', 'bold');
  s.doc.setFontSize(9);
  s.doc.setTextColor(8, 145, 178);
  s.doc.text(title.toUpperCase(), MARGIN, s.y);
  s.y += 1.5;
  s.doc.setDrawColor(8, 145, 178);
  s.doc.setLineWidth(0.3);
  s.doc.line(MARGIN, s.y, MARGIN + CONTENT_W, s.y);
  s.y += 5;
}

// ─── Key–value row list ────────────────────────────────────────────────────────
export function addKeyValueRows(s: State, rows: [string, string][]): void {
  const labelW = 55;

  rows.forEach(([label, value]) => {
    guardPage(s, 7);

    if (label) {
      s.doc.setFont('helvetica', 'bold');
      s.doc.setFontSize(8.5);
      s.doc.setTextColor(100, 116, 139);
      s.doc.text(label, MARGIN, s.y);
    }

    s.doc.setFont('helvetica', 'normal');
    s.doc.setFontSize(8.5);
    s.doc.setTextColor(15, 23, 42);
    const xVal  = label ? MARGIN + labelW : MARGIN;
    const maxW  = label ? CONTENT_W - labelW - 2 : CONTENT_W;
    const lines = s.doc.splitTextToSize(value, maxW) as string[];
    s.doc.text(lines, xVal, s.y);
    s.y += Math.max(5.5, lines.length * 5);
  });
}

// ─── Simple striped table ──────────────────────────────────────────────────────
export function addTable(s: State, columns: string[], rows: string[][]): void {
  if (rows.length === 0) return;
  const colW = CONTENT_W / columns.length;

  guardPage(s, 12);

  // Header row
  s.doc.setFillColor(241, 245, 249);
  s.doc.rect(MARGIN, s.y - 4.5, CONTENT_W, 7, 'F');
  s.doc.setFont('helvetica', 'bold');
  s.doc.setFontSize(7.5);
  s.doc.setTextColor(71, 85, 105);
  columns.forEach((col, i) => {
    s.doc.text(col, MARGIN + i * colW + 2, s.y);
  });
  s.y += 4;

  // Data rows
  rows.forEach((row, ri) => {
    guardPage(s, 7);
    if (ri % 2 === 0) {
      s.doc.setFillColor(248, 250, 252);
      s.doc.rect(MARGIN, s.y - 4, CONTENT_W, 6, 'F');
    }
    s.doc.setFont('helvetica', 'normal');
    s.doc.setFontSize(7.5);
    s.doc.setTextColor(15, 23, 42);
    row.forEach((cell, i) => {
      // Truncate to prevent overflow into adjacent column
      const maxChars = Math.floor((colW / 2.2));
      const text     = String(cell ?? '—').slice(0, maxChars);
      s.doc.text(text, MARGIN + i * colW + 2, s.y);
    });
    s.y += 5.5;
  });
  s.y += 3;
}

// ─── Medical disclaimer box ────────────────────────────────────────────────────
export function addDisclaimer(s: State): void {
  guardPage(s, 22);
  s.y += 5;

  s.doc.setFillColor(255, 251, 235);
  s.doc.setDrawColor(245, 158, 11);
  s.doc.setLineWidth(0.5);
  s.doc.rect(MARGIN, s.y - 4, CONTENT_W, 16, 'FD');

  s.doc.setFont('helvetica', 'bold');
  s.doc.setFontSize(8);
  s.doc.setTextColor(180, 83, 9);
  s.doc.text('MEDICAL DISCLAIMER', MARGIN + 3, s.y);
  s.y += 5;

  s.doc.setFont('helvetica', 'normal');
  s.doc.setFontSize(7.5);
  s.doc.setTextColor(120, 53, 15);
  const lines = s.doc.splitTextToSize(
    'This report is a clinical decision-support document and not a final medical diagnosis.',
    CONTENT_W - 8,
  ) as string[];
  s.doc.text(lines, MARGIN + 3, s.y);
  s.y += lines.length * 4 + 5;
}

// ─── Utilities ─────────────────────────────────────────────────────────────────
export function formatRiskLevel(level: string | null | undefined): string {
  if (!level) return 'Not Available';
  const map: Record<string, string> = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
  return map[level.toLowerCase()] ?? level.toUpperCase();
}

export function safeText(value: unknown): string {
  if (value === null || value === undefined) return '—';
  const str = String(value).trim();
  return str || '—';
}

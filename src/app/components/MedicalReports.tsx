import { useEffect, useMemo, useState } from "react";
import { Search, X, FileWarning, Download, Share2 } from "lucide-react";
import { useLanguage } from "../language-context";

type RiskLevel = "Low" | "Medium" | "High";

export type MedicalReport = {
  report_id: string | number;
  athlete_name: string;
  exam_type: string;
  report_date: string;
  risk_level: RiskLevel;
  action_text: string;
  profile?: { photo_url?: string; age?: number; sport?: string; team?: string };
  vitals?: { heart_rate?: string | number; sleep?: string | number; stress?: string | number };
  ai?: { neuro_vision_score?: number; recommendation?: "Ready to Play" | "Rest Required" | string };
  recovery_trend?: Array<{ date: string; score: number }>;
};

type MedicalReportsProps = { medicalReports: MedicalReport[] | null };

const TR = {
  ar: {
    title: "????? ???????? ??????",
    subtitle: "?????? ??????? ?????? ",
    results: "??? ???????",
    clear: "??? ???????",
    athlete: "??? ??????",
    examType: "??? ?????",
    date: "???????",
    risk: "????? ???????",
    actions: "?????????",
    search: "??? (?????? / ??? ????? / ???????)",
    filterName: "????? ???? ??????",
    noResults: "?? ???? ????? ??????.",
    details: "????????",
    downloadPdf: "????? PDF",
    close: "?????",
    share: "?????? ?? ??????",
    profile: "??? ??????",
    vitals: "???????? ???????",
    aiResults: "????? Neuro-Vision",
    trend: "????? ???????",
    recommendation: "??????? ??????",
    shared: "??? ???????? ?? ?????? ?????.",
  },
  en: {
    title: "Medical Reports Archive",
    subtitle: "Track medical outcomes and neuro-vision analysis for athletes.",
    results: "Results",
    clear: "Clear Filters",
    athlete: "Athlete Name",
    examType: "Exam Type",
    date: "Date",
    risk: "Risk Level",
    actions: "Actions",
    search: "Search (athlete / exam / action)",
    filterName: "Filter by athlete name",
    noResults: "No matching results.",
    details: "Details",
    downloadPdf: "Download PDF",
    close: "Close",
    share: "Share with Coach",
    profile: "Athlete Profile",
    vitals: "Vital Signs",
    aiResults: "Neuro-Vision Scan Results",
    trend: "Recovery Trend",
    recommendation: "Medical Recommendation",
    shared: "Shared with coach successfully.",
  },
};

const riskBadge: Record<RiskLevel, string> = {
  Low: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  Medium: "bg-amber-50 text-amber-700 border border-amber-200",
  High: "bg-red-50 text-red-700 border border-red-200",
};

const TrendChart = ({ trend }: { trend: Array<{ date: string; score: number }> }) => {
  const width = 640;
  const height = 220;
  const padding = { top: 20, right: 16, bottom: 42, left: 42 };
  const innerWidth = width - padding.left - padding.right;
  const innerHeight = height - padding.top - padding.bottom;

  const scaled = trend.map((p, i) => ({
    ...p,
    x: padding.left + (i * innerWidth) / Math.max(trend.length - 1, 1),
    y: padding.top + ((100 - p.score) * innerHeight) / 100,
  }));

  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-60 w-full" role="img" aria-label="Recovery trend chart">
        {[0, 25, 50, 75, 100].map((tick) => {
          const y = padding.top + ((100 - tick) * innerHeight) / 100;
          return (
            <g key={tick}>
              <line x1={padding.left} x2={width - padding.right} y1={y} y2={y} stroke="#dbeafe" strokeWidth="1" />
              <text x={padding.left - 8} y={y + 4} textAnchor="end" fontSize="10" fill="#64748b">
                {tick}
              </text>
            </g>
          );
        })}

        {scaled.length > 1 && (
          <polyline fill="none" stroke="#005088" strokeWidth="3" points={scaled.map((p) => `${p.x},${p.y}`).join(" ")} />
        )}

        {scaled.map((p) => (
          <g key={p.date}>
            <circle cx={p.x} cy={p.y} r="4.5" fill="#005088" />
            <text x={p.x} y={height - 18} textAnchor="middle" fontSize="10" fill="#64748b">
              {p.date.slice(5)}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

export const MedicalReports = ({ medicalReports }: MedicalReportsProps) => {
  const { isArabic } = useLanguage();
  const t = isArabic ? TR.ar : TR.en;
  const dir = isArabic ? "rtl" : "ltr";
  const alignClass = isArabic ? "text-right" : "text-left";

  const [search, setSearch] = useState("");
  const [athleteFilter, setAthleteFilter] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [selectedId, setSelectedId] = useState<string | number | null>(null);
  const [shareToast, setShareToast] = useState(false);

  const filtered = useMemo(() => {
    if (!medicalReports) return [];
    return medicalReports.filter((r) => {
      const q = search.trim().toLowerCase();
      const a = athleteFilter.trim().toLowerCase();
      return (
        (q.length === 0 ||
          r.athlete_name.toLowerCase().includes(q) ||
          r.exam_type.toLowerCase().includes(q) ||
          r.action_text.toLowerCase().includes(q)) &&
        (a.length === 0 || r.athlete_name.toLowerCase().includes(a)) &&
        (dateFilter.length === 0 || r.report_date === dateFilter)
      );
    });
  }, [medicalReports, search, athleteFilter, dateFilter]);

  const selectedReport = useMemo(() => {
    if (!medicalReports || selectedId === null) return null;
    return medicalReports.find((r) => r.report_id === selectedId) ?? null;
  }, [medicalReports, selectedId]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setSelectedId(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const onShare = () => {
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2000);
  };

  const resetFilters = () => {
    setSearch("");
    setAthleteFilter("");
    setDateFilter("");
  };

  if (medicalReports === null) {
    return (
      <section className="font-['Cairo',sans-serif] rounded-2xl border border-slate-200 bg-white p-8 shadow-sm" dir={dir}>
        <div className="overflow-hidden rounded-xl border border-slate-200">
          <div className="h-12 bg-[#005088]" />
          <div className="space-y-3 p-4">{[1, 2, 3, 4].map((row) => <div key={row} className="h-4 animate-pulse rounded bg-slate-200" />)}</div>
        </div>
      </section>
    );
  }

  return (
    <section className="font-['Cairo',sans-serif] rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8" dir={dir}>
      <style>{`@media print { body *{visibility:hidden;} .medical-print-area,.medical-print-area *{visibility:visible;} .medical-print-area{position:absolute;inset:0;width:100%;max-height:none;overflow:visible;box-shadow:none;border:none;padding:12px;} .print-hide{display:none !important;} }`}</style>

      <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-[#005088]">{t.title}</h2>
          <p className="text-sm text-slate-500 mt-1">{t.subtitle}</p>
        </div>
        <div className="rounded-lg bg-slate-50 border border-slate-200 px-3 py-2 text-sm text-slate-700">
          {t.results}: <span className="font-bold text-[#005088]">{filtered.length}</span>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t.search}
            className="h-11 w-full rounded-xl border border-slate-200 px-10 text-sm focus:border-[#005088] focus:outline-none focus:ring-2 focus:ring-[#005088]/20"
          />
        </div>
        <input
          type="text"
          value={athleteFilter}
          onChange={(e) => setAthleteFilter(e.target.value)}
          placeholder={t.filterName}
          className="h-11 rounded-xl border border-slate-200 px-4 text-sm focus:border-[#005088] focus:outline-none focus:ring-2 focus:ring-[#005088]/20"
        />
        <div className="flex gap-2">
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="h-11 flex-1 rounded-xl border border-slate-200 px-3 text-sm focus:border-[#005088] focus:outline-none focus:ring-2 focus:ring-[#005088]/20"
          />
          <button
            type="button"
            onClick={resetFilters}
            className="h-11 rounded-xl border border-slate-200 px-3 text-slate-600 hover:bg-slate-50"
            aria-label={t.clear}
            title={t.clear}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-[#005088] text-white">
            <tr>
              <th className={`px-4 py-3 font-semibold ${alignClass}`}>{t.athlete}</th>
              <th className={`px-4 py-3 font-semibold ${alignClass}`}>{t.examType}</th>
              <th className={`px-4 py-3 font-semibold ${alignClass}`}>{t.date}</th>
              <th className={`px-4 py-3 font-semibold ${alignClass}`}>{t.risk}</th>
              <th className={`px-4 py-3 font-semibold ${alignClass}`}>{t.actions}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {filtered.length > 0 ? (
              filtered.map((report) => (
                <tr key={report.report_id} className="cursor-pointer hover:bg-slate-50 transition-colors" onClick={() => setSelectedId(report.report_id)}>
                  <td className={`px-4 py-3 text-slate-700 font-medium ${alignClass}`}>{report.athlete_name}</td>
                  <td className={`px-4 py-3 text-slate-700 ${alignClass}`}>{report.exam_type}</td>
                  <td className={`px-4 py-3 text-slate-700 ${alignClass}`}>{report.report_date}</td>
                  <td className={`px-4 py-3 ${alignClass}`}>
                    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${riskBadge[report.risk_level]}`}>
                      {report.risk_level}
                    </span>
                  </td>
                  <td className={`px-4 py-3 text-slate-700 ${alignClass}`}>
                    <div className={`flex items-center gap-2 ${isArabic ? "" : "justify-start"}`} onClick={(e) => e.stopPropagation()}>
                      <button type="button" onClick={() => setSelectedId(report.report_id)} className="rounded-lg bg-[#005088] px-2.5 py-1 text-xs font-semibold text-white">
                        {t.details}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2">
                    <FileWarning className="h-6 w-6 text-slate-400" />
                    <p>{t.noResults}</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-900/45 px-4" onClick={() => setSelectedId(null)}>
          <div
            className="medical-print-area absolute left-1/2 top-1/2 w-full max-w-3xl -translate-x-1/2 -translate-y-1/2 max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            dir={dir}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="print-hide mb-4 flex flex-wrap gap-2">
              <button type="button" onClick={() => window.print()} className="inline-flex items-center gap-2 rounded-lg bg-[#005088] px-3 py-2 text-xs font-semibold text-white">
                <Download className="h-3.5 w-3.5" /> {t.downloadPdf}
              </button>
              <button type="button" onClick={onShare} className="inline-flex items-center gap-2 rounded-lg border border-[#11caa0] px-3 py-2 text-xs font-semibold text-[#005088]">
                <Share2 className="h-3.5 w-3.5" /> {t.share}
              </button>
              <button type="button" onClick={() => setSelectedId(null)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs">
                {t.close}
              </button>
            </div>

            <section className="rounded-xl border border-slate-200 p-4"><h4 className="text-sm font-semibold text-[#005088]">{t.profile}</h4><div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-4"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Photo</p>{selectedReport.profile?.photo_url ? <img src={selectedReport.profile.photo_url} alt={selectedReport.athlete_name} className="mt-2 h-12 w-12 rounded-full object-cover" /> : <div className="mt-2 h-12 w-12 rounded-full bg-slate-200" />}</div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Age</p><p className="mt-1 text-sm font-semibold">{selectedReport.profile?.age}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Sport</p><p className="mt-1 text-sm font-semibold">{selectedReport.profile?.sport}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Team</p><p className="mt-1 text-sm font-semibold">{selectedReport.profile?.team}</p></div></div></section>
            <section className="mt-4 rounded-xl border border-slate-200 p-4"><h4 className="text-sm font-semibold text-[#005088]">{t.vitals}</h4><div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3"><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Heart Rate</p><p className="mt-1 text-sm font-semibold">{selectedReport.vitals?.heart_rate}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Sleep</p><p className="mt-1 text-sm font-semibold">{selectedReport.vitals?.sleep}</p></div><div className="rounded-lg bg-slate-50 p-3"><p className="text-xs text-slate-500">Stress</p><p className="mt-1 text-sm font-semibold">{selectedReport.vitals?.stress}</p></div></div></section>
            <section className="mt-4 rounded-xl border border-slate-200 p-4"><h4 className="text-sm font-semibold text-[#005088]">{t.aiResults}</h4><div className="mt-3"><div className="mb-2 flex items-center justify-between text-xs text-slate-600"><span>Scan Signal</span><span>{selectedReport.ai?.neuro_vision_score ?? 0}%</span></div><div className="h-3 w-full rounded-full bg-slate-200"><div className="h-full rounded-full bg-[#11caa0]" style={{ width: `${selectedReport.ai?.neuro_vision_score ?? 0}%` }} /></div></div></section>
            <section className="mt-4 rounded-xl border border-slate-200 p-4"><h4 className="text-sm font-semibold text-[#005088]">{t.trend}</h4><div className="mt-3">{selectedReport.recovery_trend && selectedReport.recovery_trend.length > 0 ? <TrendChart trend={selectedReport.recovery_trend} /> : <div className="h-40 rounded-lg border border-dashed border-slate-300 bg-slate-50" />}</div></section>
            <section className="mt-4 rounded-xl border-2 border-[#11caa0]/50 bg-[#11caa0]/5 p-4"><h4 className="text-sm font-semibold text-[#005088]">{t.recommendation}</h4><p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${(selectedReport.ai?.recommendation ?? "") === "Ready to Play" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>{selectedReport.ai?.recommendation}</p></section>
          </div>

          {shareToast && <div className="print-hide fixed bottom-6 left-1/2 z-[60] -translate-x-1/2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white">{t.shared}</div>}
        </div>
      )}
    </section>
  );
};


import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Download,
  Edit3,
  Eye,
  FileDown,
  Heart,
  Image as ImageIcon,
  Minus,
  Plus,
  ShieldAlert,
  ShieldCheck,
  Stethoscope,
  Trash2,
  Users,
  X,
  Zap,
} from "lucide-react";
import { jsPDF } from "jspdf";
import { getSessionUser } from "../services/authMock";
import { deletePlayer, getTeamById, updatePlayer } from "../app/data/teams";
import { useI18n } from "../app/i18n";
import type { Player, PlayerFormInput, Team } from "../app/types/team";
import { getAssessmentHistory, getPlayerBaseline, seedTemporaryMedicalDemoData, type PlayerAssessment } from "../services/assessmentHistoryMock";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Pie } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);

type PlayerReportEntry = {
  id: string;
  kind: "baseline" | "assessment";
  label: string;
  assessment: PlayerAssessment;
};

type PlayerModalTab = "personal" | "medical" | "compare";
type PlayerModalMode = "view" | "edit";

const DEFAULT_PLAYER_FORM: PlayerFormInput = {
  photo: "",
  fullName: "",
  shirtName: "",
  dateOfBirth: "",
  nationality: "",
  gender: "Male",
  heightCm: 0,
  weightKg: 0,
  jerseyNumber: 0,
  preferredSide: "Right",
  joinDate: "",
  phoneCountryCode: "+1",
  phoneNumber: "",
  email: "",
  guardianName: "",
  status: "Active",
  position: "",
};

const playerStatusTone: Record<Player["status"], string> = {
  Active: "border-emerald-400/25 bg-emerald-500/10 text-emerald-700",
  Injured: "border-rose-400/25 bg-rose-500/10 text-rose-700",
  Suspended: "border-amber-400/25 bg-amber-500/10 text-amber-700",
};

const reportKindTone: Record<PlayerReportEntry["kind"], string> = {
  baseline: "border-cyan-400/20 bg-cyan-500/10 text-cyan-100",
  assessment: "border-slate-500/25 bg-slate-900/60 text-slate-100",
};

const formatDate = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  }).format(date);
};

const formatDateTime = (value?: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const sanitizeFileName = (value: string) => value.replace(/[^a-z0-9-_]+/gi, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");

const normalizePlayerDraft = (player: Player): PlayerFormInput => ({
  photo: player.photo,
  fullName: player.fullName,
  shirtName: player.shirtName,
  dateOfBirth: player.dateOfBirth,
  nationality: player.nationality,
  gender: player.gender,
  heightCm: player.heightCm,
  weightKg: player.weightKg,
  jerseyNumber: player.jerseyNumber,
  preferredSide: player.preferredSide,
  joinDate: player.joinDate,
  phoneCountryCode: player.phoneCountryCode,
  phoneNumber: player.phoneNumber,
  email: player.email || "",
  guardianName: player.guardianName || "",
  status: player.status,
  position: player.position,
});

const buildPlayerReports = (teamName: string, playerName: string): PlayerReportEntry[] => {
  const assessments = getAssessmentHistory(teamName, playerName)
    .slice()
    .sort((left, right) => +new Date(right.assessedAt) - +new Date(left.assessedAt));
  const baseline = getPlayerBaseline(teamName, playerName);
  const items: PlayerReportEntry[] = [];

  if (baseline) {
    items.push({
      id: `baseline-${baseline.id}`,
      kind: "baseline",
      label: "Baseline Report",
      assessment: baseline,
    });
  }

  assessments.forEach((assessment) => {
    items.push({
      id: `assessment-${assessment.id}`,
      kind: "assessment",
      label: `Assessment · ${formatDate(assessment.assessedAt)}`,
      assessment,
    });
  });

  return items;
};

export default function MyTeamPage() {
  const { t, isArabic } = useI18n();
  const navigate = useNavigate();
  const session = getSessionUser();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [playerModalMode, setPlayerModalMode] = useState<PlayerModalMode>("view");
  const [playerModalTab, setPlayerModalTab] = useState<PlayerModalTab>("personal");
  const [playerDraft, setPlayerDraft] = useState<PlayerFormInput>(DEFAULT_PLAYER_FORM);
  const [compareStartId, setCompareStartId] = useState("");
  const [compareSelection, setCompareSelection] = useState<string[]>([]);
  const [pendingDelete, setPendingDelete] = useState<Player | null>(null);
  const [savingPlayer, setSavingPlayer] = useState(false);

  const refreshTeam = async (teamId: string) => {
    const teamData = await getTeamById(teamId);
    setTeam(teamData ?? null);
    return teamData ?? null;
  };

  useEffect(() => {
    if (!session?.teamId) {
      navigate("/auth/login", { replace: true });
      return;
    }

    const loadTeam = async () => {
      try {
        await refreshTeam(session.teamId!);
      } catch (error) {
        console.error("Error loading team:", error);
      } finally {
        setLoading(false);
      }
    };

    loadTeam();
  }, [session, navigate]);

  useEffect(() => {
    if (team && import.meta.env.DEV) {
      seedTemporaryMedicalDemoData(team);
    }
  }, [team]);

  const sortedPlayers = useMemo(() => {
    return [...(team?.players ?? [])].sort((left, right) => left.jerseyNumber - right.jerseyNumber || left.fullName.localeCompare(right.fullName));
  }, [team?.players]);

  const stats = useMemo(() => {
    if (!team?.players) return { total: 0, active: 0, injured: 0, assessments: 0 };
    const totalPlayers = team.players.length;
    const activePlayers = team.players.filter((player) => player.status === "Active").length;
    const injuredPlayers = team.players.filter((player) => player.status === "Injured").length;
    const assessments = team.players.reduce((sum, player) => sum + buildPlayerReports(team.teamName, player.fullName).filter((item) => item.kind === "assessment").length, 0);

    return {
      total: totalPlayers,
      active: activePlayers,
      injured: injuredPlayers,
      assessments,
    };
  }, [team]);

  const riskData = {
    labels: [t("Active"), t("Injured")],
    datasets: [
      {
        data: [stats.active, stats.injured],
        backgroundColor: ["#10B981", "#F43F5E"],
        borderWidth: 0,
      },
    ],
  };

  const selectedPlayerReports = useMemo(() => {
    if (!team || !selectedPlayer) return [];
    return buildPlayerReports(team.teamName, selectedPlayer.fullName);
  }, [team?.teamName, selectedPlayer?.fullName]);

  useEffect(() => {
    if (!selectedPlayer) {
      setPlayerModalMode("view");
      setPlayerModalTab("personal");
      setCompareSelection([]);
      setCompareStartId("");
      return;
    }

    setCompareSelection([]);
    setCompareStartId("");
    if (playerModalMode === "view") {
      setPlayerDraft(normalizePlayerDraft(selectedPlayer));
      setPlayerModalTab("personal");
    }
  }, [selectedPlayer, playerModalMode]);

  useEffect(() => {
    if (!selectedPlayerReports.length) {
      setCompareSelection([]);
      setCompareStartId("");
      return;
    }

    setCompareStartId((current) => (current && selectedPlayerReports.some((report) => report.id === current) ? current : selectedPlayerReports[0].id));
    setCompareSelection((current) => current.filter((reportId) => selectedPlayerReports.some((report) => report.id === reportId)));
  }, [selectedPlayerReports]);

  const selectedCompareReports = useMemo(() => {
    return compareSelection
      .map((reportId) => selectedPlayerReports.find((report) => report.id === reportId))
      .filter((report): report is PlayerReportEntry => Boolean(report));
  }, [compareSelection, selectedPlayerReports]);

  const openPlayerDetails = (player: Player) => {
    setSelectedPlayer(player);
    setPlayerModalMode("view");
    setPlayerModalTab("personal");
  };

  const openPlayerEdit = (player: Player) => {
    setSelectedPlayer(player);
    setPlayerModalMode("edit");
    setPlayerModalTab("personal");
    setPlayerDraft(normalizePlayerDraft(player));
  };

  const closePlayerModal = () => {
    setSelectedPlayer(null);
    setPlayerModalMode("view");
    setPlayerModalTab("personal");
    setPlayerDraft(DEFAULT_PLAYER_FORM);
    setCompareSelection([]);
    setCompareStartId("");
  };

  const startCompareWithReport = (reportId: string) => {
    if (!reportId) return;
    setCompareSelection([reportId]);
    setPlayerModalTab("compare");
  };

  const addCompareReport = (reportId: string) => {
    if (!reportId) return;
    setCompareSelection((current) => (current.includes(reportId) ? current : [...current, reportId]));
  };

  const removeCompareReport = (reportId: string) => {
    setCompareSelection((current) => current.filter((item) => item !== reportId));
  };

  const selectedPlayerAssessmentHistory = useMemo(() => {
    if (!team || !selectedPlayer) return [];
    return getAssessmentHistory(team.teamName, selectedPlayer.fullName).sort((left, right) => +new Date(right.assessedAt) - +new Date(left.assessedAt));
  }, [team?.teamName, selectedPlayer?.fullName]);

  const selectedPlayerBaseline = useMemo(() => {
    if (!team || !selectedPlayer) return null;
    return getPlayerBaseline(team.teamName, selectedPlayer.fullName);
  }, [team?.teamName, selectedPlayer?.fullName]);

  const handlePhotoUpload = async (file?: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), photo: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  };

  const savePlayer = async () => {
    if (!team || !selectedPlayer) return;
    setSavingPlayer(true);
    try {
      const updated = await updatePlayer(team.id, selectedPlayer.id, playerDraft);
      const nextTeam = await refreshTeam(team.id);
      setSelectedPlayer(nextTeam?.players.find((player) => player.id === updated.id) ?? updated);
      setPlayerModalMode("view");
    } catch (error) {
      console.error("Could not update player:", error);
    } finally {
      setSavingPlayer(false);
    }
  };

  const confirmDeletePlayer = async () => {
    if (!team || !pendingDelete) return;
    try {
      await deletePlayer(team.id, pendingDelete.id);
      await refreshTeam(team.id);
      if (selectedPlayer?.id === pendingDelete.id) closePlayerModal();
      setPendingDelete(null);
    } catch (error) {
      console.error("Could not remove player:", error);
    }
  };

  const exportComparePdf = () => {
    if (!team || !selectedPlayer || selectedCompareReports.length === 0) return;

    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;
    const contentWidth = pageWidth - margin * 2;
    const safeTeam = sanitizeFileName(team.teamName);
    const safePlayer = sanitizeFileName(selectedPlayer.fullName);

    const drawSection = (title: string, lines: Array<[string, string]>, startY: number) => {
      doc.setFillColor(241, 246, 252);
      doc.roundedRect(margin, startY, contentWidth, 22 + lines.length * 18, 10, 10, "F");
      doc.setTextColor(16, 36, 58);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(title, margin + 12, startY + 16);
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);

      let cursorY = startY + 34;
      lines.forEach(([label, value]) => {
        doc.setTextColor(91, 109, 131);
        doc.text(`${label}:`, margin + 12, cursorY);
        doc.setTextColor(16, 36, 58);
        const wrapped = doc.splitTextToSize(value || "-", contentWidth - 140);
        doc.text(wrapped, margin + 140, cursorY);
        cursorY += Math.max(16, wrapped.length * 12);
      });
    };

    selectedCompareReports.forEach((report, index) => {
      if (index > 0) doc.addPage();

      doc.setFillColor(15, 122, 168);
      doc.roundedRect(margin, 28, contentWidth, 70, 14, 14, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(18);
      doc.text("NeuroVision - Compare Report", margin + 16, 54);
      doc.setFontSize(11);
      doc.text(`${team.teamName} · ${selectedPlayer.fullName}`, margin + 16, 74);
      doc.text(`${report.label} · ${index + 1}/${selectedCompareReports.length}`, margin + 16, 90);

      let y = 120;
      drawSection("Report Overview", [
        ["Report Type", report.kind === "baseline" ? "Baseline Report" : "Assessment Report"],
        ["Assessment Date", formatDateTime(report.assessment.assessedAt)],
        ["Risk Level", report.assessment.riskLevel.toUpperCase()],
        ["Injury Type", report.assessment.injuryType],
      ], y);

      y += 22 + 4 * 18 + 50;
      drawSection("Key Metrics", [
        ["SCAT Total Severity", String(report.assessment.report.scat5.totalSeverityScore)],
        ["SCAT Symptoms", String(report.assessment.report.scat5.totalSymptomsCount)],
        ["PLR Baseline Diameter", `${report.assessment.report.plr.measurements.baselineDiameter} mm`],
        ["PLR Reflex Latency", `${report.assessment.report.plr.measurements.reflexLatencyMs} ms`],
        ["Recovery Time", `${report.assessment.report.plr.measurements.recoveryTimeMs} ms`],
        ["AI Classification", report.assessment.report.ai.classification],
      ], y);

      y += 22 + 6 * 18 + 66;
      drawSection("Summary", [
        ["Notes", report.assessment.notes || "-"],
        ["Medical Decision", report.assessment.report.decision.recommendedAction],
        ["Return to Play", report.assessment.report.decision.returnToPlay],
        ["Final Summary", report.assessment.report.finalSummary],
      ], y);

      doc.setTextColor(91, 109, 131);
      doc.setFontSize(9);
      doc.text(`Generated on ${new Date().toLocaleString()}`, margin, pageHeight - 18);
      doc.text(`Page ${index + 1}`, pageWidth - margin - 40, pageHeight - 18);
    });

    doc.save(`${safeTeam}-${safePlayer}-compare.pdf`);
  };

  if (loading) {
    return (
      <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
        <div className="h-64 animate-pulse rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 shadow-[0_20px_60px_rgba(0,0,0,0.22)]" />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="space-y-4" dir={isArabic ? "rtl" : "ltr"}>
        <div className="rounded-3xl border border-rose-500/20 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-rose-950/20 p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <p className="text-rose-200">{t("Team not found.")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6" dir={isArabic ? "rtl" : "ltr"}>
      <div className="relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-8 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
        <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.10),transparent_35%)]" />
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-6">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border border-cyan-400/20 bg-slate-950/50 p-3 shadow-[0_10px_30px_rgba(0,0,0,0.25)]">
              {team.teamLogo ? (
                <img src={team.teamLogo} alt={team.teamName} className="h-full w-full rounded-xl object-contain" />
              ) : (
                <ImageIcon className="h-10 w-10 text-cyan-200/70" />
              )}
            </div>
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">
                {team.sportType} · {team.ageCategory}
              </p>
              <h1 className="bg-gradient-to-r from-cyan-100 to-sky-100 bg-clip-text text-4xl font-black tracking-tight text-transparent">
                {team.teamName}
              </h1>
              <p className="mt-2 text-sm text-slate-400">
                {team.coachName} · {team.city}, {team.country}
              </p>
            </div>
          </div>
          <div className="inline-flex items-center rounded-full border border-emerald-400/20 bg-emerald-500/10 px-4 py-2">
            <p className="text-sm font-semibold text-emerald-300">{team.teamStatus}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <KPICard icon={Users} label={t("Total Players")} value={stats.total} color="from-cyan-500/20 to-sky-500/10" iconColor="text-cyan-300" />
        <KPICard icon={Activity} label={t("Active Players")} value={stats.active} color="from-emerald-500/20 to-emerald-500/10" iconColor="text-emerald-300" />
        <KPICard icon={Heart} label={t("Injuries")} value={stats.injured} color="from-rose-500/20 to-rose-500/10" iconColor="text-rose-300" />
        <KPICard icon={Zap} label={t("Assessments")} value={stats.assessments} color="from-amber-500/20 to-amber-500/10" iconColor="text-amber-300" />
      </div>

      <div className="rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur-sm">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-slate-50">{t("Team Risk Overview")}</h2>
            <p className="mt-1 text-sm text-slate-400">{t("Overall player status distribution")}</p>
          </div>
          <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
            {t("Live")}
          </div>
        </div>
        <div className="flex justify-center">
          <div className="w-full max-w-md rounded-3xl border border-slate-700/40 bg-slate-950/40 p-4">
            <Pie data={riskData} />
          </div>
        </div>
      </div>

      <section className="space-y-5">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-50">{t("Total Players")}</h2>
            <p className="mt-1 text-sm text-slate-400">Professional roster view with direct access to each athlete.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100">
            <Users className="h-4 w-4" />
            {stats.total} {t("Players")}
          </div>
        </div>

        {sortedPlayers.length === 0 ? (
          <div className="rounded-3xl border border-slate-700/40 bg-slate-950/40 p-8 text-center text-slate-300">
            {t("No players found for this team.")}
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {sortedPlayers.map((player) => (
              <article
                key={player.id}
                className="group overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950 via-slate-900/90 to-cyan-950/20 shadow-[0_18px_50px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300/35 hover:shadow-[0_0_0_1px_rgba(34,211,238,0.12),0_24px_70px_rgba(0,0,0,0.45)]"
              >
                <div className="relative overflow-hidden border-b border-cyan-400/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_32%),linear-gradient(135deg,rgba(2,6,23,0.96),rgba(15,23,42,0.94),rgba(8,47,73,0.4))] p-4">
                  <div className="absolute right-4 top-4">
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] shadow-[0_0_18px_rgba(34,211,238,0.12)] ${playerStatusTone[player.status]}`}>
                      {t(player.status)}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 pt-7">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/25 bg-slate-950/80 p-1 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                      <img
                        src={player.photo || "https://placehold.co/160x160?text=P"}
                        alt={player.fullName}
                        className="h-full w-full rounded-xl object-cover"
                      />
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-black text-slate-50">{player.fullName}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        #{player.jerseyNumber} · {player.age} {t("Age")}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-2.5 py-1 text-[11px] font-semibold text-cyan-100">
                          {player.position || "-"}
                        </span>
                        <span className="rounded-full border border-slate-500/30 bg-slate-950/60 px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                          {t("Age")}: {player.age}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 p-4">

                  <div className="flex flex-wrap gap-2">
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.08)] transition hover:border-cyan-300/35 hover:bg-cyan-500/15"
                      onClick={() => openPlayerEdit(player)}
                    >
                      <Edit3 className="h-4 w-4" />
                      {t("Edit")}
                    </button>
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 shadow-[0_0_20px_rgba(244,63,94,0.08)] transition hover:border-rose-300/35 hover:bg-rose-500/15"
                      onClick={() => setPendingDelete(player)}
                    >
                      <Trash2 className="h-4 w-4" />
                      {t("Delete")}
                    </button>
                    <button
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-cyan-400/15 bg-slate-950/70 px-3 py-2 text-sm font-semibold text-cyan-50 shadow-[0_0_24px_rgba(34,211,238,0.08)] transition hover:border-cyan-300/30 hover:bg-slate-900/80 hover:text-white"
                      onClick={() => openPlayerDetails(player)}
                    >
                      <Eye className="h-4 w-4" />
                      {t("Details")}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedPlayer && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 p-4 backdrop-blur-sm" onClick={closePlayerModal}>
          <div
            className="mx-auto my-4 flex w-full max-w-6xl max-h-[calc(100vh-2rem)] flex-col overflow-hidden rounded-[1.9rem] border border-cyan-400/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/30 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-cyan-400/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.14),transparent_30%),linear-gradient(135deg,rgba(2,6,23,0.98),rgba(15,23,42,0.95),rgba(8,47,73,0.35))] p-5 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl border border-cyan-400/25 bg-slate-950/80 p-1 shadow-[0_0_24px_rgba(34,211,238,0.12)]">
                  <img
                    src={selectedPlayer.photo || "https://placehold.co/128x128?text=P"}
                    alt={selectedPlayer.fullName}
                    className="h-full w-full rounded-xl object-cover"
                  />
                </div>
                <div>
                  <p className="mt-1 text-sm text-slate-300">
                    #{selectedPlayer.jerseyNumber} · {selectedPlayer.position || "-"} · {selectedPlayer.age} {t("Age")}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-500/15"
                  onClick={() => setPlayerModalTab("compare")}
                >
                  <FileDown className="h-4 w-4" />
                  {t("Compare")}
                </button>
                {playerModalMode === "edit" ? (
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-emerald-400/20 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-300/35 hover:bg-emerald-500/15"
                    onClick={savePlayer}
                    disabled={savingPlayer}
                  >
                    {savingPlayer ? t("Saving...") : t("Save Changes")}
                  </button>
                ) : (
                  <button
                    className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/15 bg-slate-950/60 px-4 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-300/35 hover:bg-slate-900/80"
                    onClick={() => setPlayerModalMode("edit")}
                  >
                    <Edit3 className="h-4 w-4" />
                    {t("Edit")}
                  </button>
                )}
                <button
                  className="inline-flex items-center justify-center rounded-xl border border-cyan-400/15 bg-slate-950/60 px-3 py-2 text-slate-300 transition hover:border-cyan-300/35 hover:bg-slate-900/80 hover:text-white"
                  onClick={closePlayerModal}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 scrollbar-thin">
              <div className="mb-4 rounded-3xl border border-cyan-400/10 bg-slate-950/60 p-4 text-sm text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.06)]">
                <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-300">{t("Medical Info")}</p>
                    <p className="mt-1 font-medium text-slate-200">
                      Medical Info contains the baseline snapshot and every stored assessment for this player.
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                    <Stethoscope className="h-4 w-4" />
                    {selectedPlayerAssessmentHistory.length} assessments
                  </div>
                </div>
              </div>

              <div className="mb-5 flex flex-wrap gap-2 rounded-2xl border border-cyan-400/10 bg-slate-950/50 p-1">
                {[
                  { key: "personal" as const, label: t("Personal Info") },
                  { key: "medical" as const, label: t("Medical Info") },
                  { key: "compare" as const, label: t("Compare") },
                ].map((item) => (
                  <button
                    key={item.key}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                      playerModalTab === item.key
                        ? "bg-slate-900/85 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.16)]"
                        : "text-slate-500 hover:text-slate-300"
                    }`}
                    onClick={() => setPlayerModalTab(item.key)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {playerModalTab === "personal" && (
                <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
                  <section className="theme-surface-soft rounded-3xl border border-cyan-400/10 p-5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-50">{t("Personal Info")}</h4>
                        <p className="mt-1 text-sm text-slate-300">Player registration profile data from Team Registration.</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${playerStatusTone[selectedPlayer.status]}`}>
                        {t(selectedPlayer.status)}
                      </span>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="md:col-span-2">
                        {playerModalMode === "edit" ? (
                          <label className="theme-surface rounded-2xl border border-dashed border-cyan-400/20 p-4 text-sm font-semibold text-slate-100">
                            {t("Player photo (PNG/JPG/WEBP - 5MB)")}
                            <input
                              type="file"
                              accept="image/png,image/jpeg,image/webp"
                              className="mt-3 block text-sm text-slate-300 file:mr-4 file:rounded-xl file:border-0 file:bg-cyan-500/15 file:px-4 file:py-2 file:font-semibold file:text-cyan-100 hover:file:bg-cyan-500/20"
                              onChange={(event) => handlePhotoUpload(event.target.files?.[0])}
                            />
                          </label>
                        ) : null}
                      </div>

                      <EditableField
                        label={t("Full name")}
                        value={playerModalMode === "edit" ? playerDraft.fullName : selectedPlayer.fullName}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), fullName: value }))}
                      />
                      <EditableField
                        label={t("Shirt name")}
                        value={playerModalMode === "edit" ? playerDraft.shirtName : selectedPlayer.shirtName}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), shirtName: value }))}
                      />
                      <EditableField
                        label={t("Jersey Number")}
                        value={String(playerModalMode === "edit" ? playerDraft.jerseyNumber : selectedPlayer.jerseyNumber)}
                        disabled={playerModalMode !== "edit"}
                        type="number"
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), jerseyNumber: Number(value || 0) }))}
                      />
                      <EditableField
                        label={t("Age")}
                        value={String(selectedPlayer.age)}
                        disabled
                        onChange={() => undefined}
                      />
                      <EditableField
                        label={t("Date of Birth")}
                        value={playerModalMode === "edit" ? playerDraft.dateOfBirth : selectedPlayer.dateOfBirth}
                        disabled={playerModalMode !== "edit"}
                        type="date"
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), dateOfBirth: value }))}
                      />
                      <EditableField
                        label={t("Nationality")}
                        value={playerModalMode === "edit" ? playerDraft.nationality : selectedPlayer.nationality}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), nationality: value }))}
                      />
                      <EditableField
                        label={t("Height")}
                        value={String(playerModalMode === "edit" ? playerDraft.heightCm : selectedPlayer.heightCm)}
                        disabled={playerModalMode !== "edit"}
                        type="number"
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), heightCm: Number(value || 0) }))}
                      />
                      <EditableField
                        label={t("Weight")}
                        value={String(playerModalMode === "edit" ? playerDraft.weightKg : selectedPlayer.weightKg)}
                        disabled={playerModalMode !== "edit"}
                        type="number"
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), weightKg: Number(value || 0) }))}
                      />
                      <EditableField
                        label={t("Position")}
                        value={playerModalMode === "edit" ? playerDraft.position : selectedPlayer.position}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), position: value }))}
                      />
                      <EditableField
                        label={t("Preferred foot/hand")}
                        value={playerModalMode === "edit" ? playerDraft.preferredSide : selectedPlayer.preferredSide}
                        disabled={playerModalMode !== "edit"}
                        options={["Right", "Left", "Both"]}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), preferredSide: value as PlayerFormInput["preferredSide"] }))}
                      />
                      <EditableField
                        label={t("Phone number")}
                        value={playerModalMode === "edit" ? playerDraft.phoneNumber : selectedPlayer.phoneNumber}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), phoneNumber: value }))}
                      />
                      <EditableField
                        label={t("Email (optional)")}
                        value={playerModalMode === "edit" ? playerDraft.email || "" : selectedPlayer.email || ""}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), email: value }))}
                      />
                      <EditableField
                        label={t("Guardian name")}
                        value={playerModalMode === "edit" ? playerDraft.guardianName || "" : selectedPlayer.guardianName || "-"}
                        disabled={playerModalMode !== "edit"}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), guardianName: value }))}
                      />
                      <EditableField
                        label={t("Status")}
                        value={playerModalMode === "edit" ? playerDraft.status : selectedPlayer.status}
                        disabled={playerModalMode !== "edit"}
                        options={["Active", "Injured", "Suspended"]}
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), status: value as Player["status"] }))}
                      />
                      <EditableField
                        label={t("Join Date")}
                        value={playerModalMode === "edit" ? playerDraft.joinDate : selectedPlayer.joinDate}
                        disabled={playerModalMode !== "edit"}
                        type="date"
                        onChange={(value) => setPlayerDraft((current) => ({ ...(current ?? DEFAULT_PLAYER_FORM), joinDate: value }))}
                      />
                    </div>
                  </section>

                  <section className="theme-surface-soft rounded-3xl border border-cyan-400/10 p-5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
                    <h4 className="text-lg font-bold text-slate-50">Quick Summary</h4>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <InfoPill label="Team" value={team.teamName} />
                      <InfoPill label="Status" value={selectedPlayer.status} />
                      <InfoPill label="Jersey" value={`#${selectedPlayer.jerseyNumber}`} />
                      <InfoPill label="Age" value={`${selectedPlayer.age} y`} />
                    </div>
                    <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-slate-950/60 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">Photo</p>
                      <div className="mt-3 flex items-center justify-center">
                        <div className="flex h-44 w-44 items-center justify-center overflow-hidden rounded-3xl border border-cyan-400/15 bg-slate-950/80 p-2 shadow-[0_0_32px_rgba(34,211,238,0.08)]">
                          <img
                            src={playerModalMode === "edit" ? playerDraft.photo || selectedPlayer.photo : selectedPlayer.photo || "https://placehold.co/320x320?text=P"}
                            alt={selectedPlayer.fullName}
                            className="h-full w-full rounded-2xl object-cover"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-cyan-500/10 p-4 text-sm text-cyan-100">
                      <div className="flex items-start gap-3">
                        <ShieldCheck className="mt-0.5 h-5 w-5" />
                        <p>
                          This card keeps the player linked to the team assessments and baseline data already stored in the app.
                        </p>
                      </div>
                    </div>
                  </section>
                </div>
              )}

              {playerModalTab === "medical" && (
                <div className="grid gap-5 xl:grid-cols-[0.9fr_1.1fr]">
                  <section className="theme-surface-soft rounded-3xl border border-cyan-400/10 p-5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h4 className="text-lg font-bold text-slate-50">{t("Medical Info")}</h4>
                        <p className="mt-1 text-sm text-slate-300">Baseline snapshot plus all historical assessments.</p>
                      </div>
                      <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                        {selectedPlayerBaseline ? t("Baseline Report") : t("No baseline set for this player yet.")}
                      </span>
                    </div>

                    <div className="mt-4 space-y-3">
                      {selectedPlayerBaseline ? (
                        <ReportCard
                          entry={{
                            id: `baseline-${selectedPlayerBaseline.id}`,
                            kind: "baseline",
                            label: t("Baseline Report"),
                            assessment: selectedPlayerBaseline,
                          }}
                          onCompare={() => startCompareWithReport(`baseline-${selectedPlayerBaseline.id}`)}
                        />
                      ) : (
                        <div className="rounded-2xl border border-dashed border-cyan-400/12 bg-slate-950/60 p-4 text-sm text-slate-300">
                          {t("No baseline set for this player yet.")}
                        </div>
                      )}

                      {selectedPlayerAssessmentHistory.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-cyan-400/12 bg-slate-950/60 p-4 text-sm text-slate-300">
                          {t("No assessments for this player yet.")}
                        </div>
                      ) : (
                        selectedPlayerAssessmentHistory.map((assessment) => (
                          <ReportCard
                            key={assessment.id}
                            entry={{
                              id: `assessment-${assessment.id}`,
                              kind: "assessment",
                              label: `${t("Assessment Report")} · ${formatDate(assessment.assessedAt)}`,
                              assessment,
                            }}
                            onCompare={() => startCompareWithReport(`assessment-${assessment.id}`)}
                          />
                        ))
                      )}
                    </div>
                  </section>

                  <section className="theme-surface-soft rounded-3xl border border-cyan-400/10 p-5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
                    <h4 className="text-lg font-bold text-slate-50">{t("Medical Reports")}</h4>
                    <p className="mt-1 text-sm text-slate-300">All assessments pulled from the stored Assessments table and the Baseline snapshot.</p>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <InfoPill label={t("Total Assessments")} value={String(selectedPlayerAssessmentHistory.length)} />
                      <InfoPill label={t("Baseline")} value={selectedPlayerBaseline ? "Available" : "Not set"} />
                      <InfoPill label={t("Highest Risk")} value={selectedPlayerAssessmentHistory[0]?.riskLevel?.toUpperCase() || "-"} />
                      <InfoPill label={t("Latest Report")} value={formatDate(selectedPlayerAssessmentHistory[0]?.assessedAt)} />
                    </div>

                    <div className="mt-5 rounded-2xl border border-cyan-400/10 bg-slate-950/70 p-4 shadow-[0_18px_40px_rgba(0,0,0,0.2)]">
                      {selectedPlayerAssessmentHistory[0] ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-sm font-semibold text-slate-50">Latest assessment highlights</p>
                            <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${reportKindTone.assessment}`}>{selectedPlayerAssessmentHistory[0].riskLevel.toUpperCase()}</span>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <InfoPill label={t("Injury Type")} value={selectedPlayerAssessmentHistory[0].injuryType} />
                            <InfoPill label={t("SCAT Severity")} value={String(selectedPlayerAssessmentHistory[0].report.scat5.totalSeverityScore)} />
                            <InfoPill label={t("PLR Latency")} value={`${selectedPlayerAssessmentHistory[0].report.plr.measurements.reflexLatencyMs} ms`} />
                            <InfoPill label={t("PLR Constriction Velocity")} value={`${selectedPlayerAssessmentHistory[0].report.plr.measurements.constrictionVelocity} mm/s`} />
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-slate-300">{t("No assessments for this player yet.")}</p>
                      )}
                    </div>
                  </section>
                </div>
              )}

              {playerModalTab === "compare" && (
                <div className="space-y-5">
                  <section className="theme-surface-soft rounded-3xl border border-cyan-400/10 p-5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h4 className="text-lg font-bold text-slate-50">{t("Compare")}</h4>
                        <p className="mt-1 text-sm text-slate-300">
                          Select the first report, then add more reports side by side and export them as a PDF.
                        </p>
                      </div>
                      <button
                        className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/15 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={exportComparePdf}
                        disabled={selectedCompareReports.length === 0}
                      >
                        <Download className="h-4 w-4" />
                        {t("Export as PDF")}
                      </button>
                    </div>

                    {selectedPlayerReports.length === 0 ? (
                      <div className="mt-5 rounded-2xl border border-dashed border-cyan-400/12 bg-slate-950/60 p-5 text-sm text-slate-300">
                        {t("No reports available.")}
                      </div>
                    ) : compareSelection.length === 0 ? (
                      <div className="mt-5 grid gap-3 rounded-3xl border border-cyan-400/10 bg-slate-950/50 p-4 shadow-[0_0_24px_rgba(34,211,238,0.05)] lg:grid-cols-[1fr_auto]">
                        <div className="lg:col-span-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t("Select First Report")}</p>
                          <p className="mt-1 text-sm text-slate-300">{t("Available Reports")}</p>
                        </div>
                        <select
                          className="h-12 rounded-xl border border-cyan-400/15 bg-slate-950/70 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/35"
                          value={compareStartId}
                          onChange={(event) => setCompareStartId(event.target.value)}
                        >
                          {selectedPlayerReports.map((report) => (
                            <option key={report.id} value={report.id}>
                              {report.label}
                            </option>
                          ))}
                        </select>
                        <button
                          className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/15 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-500/20"
                          onClick={() => startCompareWithReport(compareStartId)}
                        >
                          <Plus className="h-4 w-4" />
                          {t("Start Compare")}
                        </button>
                      </div>
                    ) : null}

                    {compareSelection.length > 0 && (
                      <div className="mt-5 space-y-5">
                        <div className="rounded-3xl border border-cyan-400/10 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
                          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-cyan-300">{t("Selected Reports")}</p>
                              <p className="mt-1 text-sm text-slate-300">Add more reports and keep them aligned side by side.</p>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {selectedCompareReports.map((report) => (
                                <span key={`chip-${report.id}`} className="rounded-full border border-cyan-400/15 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                                  {report.kind === "baseline" ? t("Baseline Report") : t("Assessment Report")} · {formatDate(report.assessment.assessedAt)}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="grid gap-3 rounded-3xl border border-cyan-400/10 bg-slate-950/70 p-4 shadow-[0_18px_50px_rgba(0,0,0,0.28)] lg:grid-cols-[1fr_auto]">
                          <select
                            className="h-12 rounded-xl border border-cyan-400/15 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none transition focus:border-cyan-300/35 focus:ring-2 focus:ring-cyan-400/15"
                            value={compareStartId}
                            onChange={(event) => setCompareStartId(event.target.value)}
                          >
                            {selectedPlayerReports
                              .filter((report) => !compareSelection.includes(report.id))
                              .map((report) => (
                                <option key={report.id} value={report.id}>
                                  {report.label}
                                </option>
                              ))}
                          </select>
                          <button
                            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-500/15 disabled:cursor-not-allowed disabled:opacity-50"
                            onClick={() => addCompareReport(compareStartId)}
                            disabled={!compareStartId || compareSelection.includes(compareStartId)}
                          >
                            <Plus className="h-4 w-4" />
                            {t("Add Report")}
                          </button>
                        </div>

                        <div className="grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                          {selectedCompareReports.map((report) => (
                            <CompareCard
                              key={report.id}
                              entry={report}
                              onRemove={() => removeCompareReport(report.id)}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </section>

                  {compareSelection.length > 0 && (
                    <section className="theme-surface-soft rounded-3xl border border-cyan-400/10 p-5 shadow-[0_0_24px_rgba(34,211,238,0.05)]">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-lg font-bold text-slate-50">{t("Selected Reports")}</h4>
                          <p className="mt-1 text-sm text-slate-300">A compact preview of what will be exported.</p>
                        </div>
                        <span className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">
                          {selectedCompareReports.length} selected
                        </span>
                      </div>
                      <div className="mt-4 grid gap-4 xl:grid-cols-2 2xl:grid-cols-3">
                        {selectedCompareReports.map((report) => (
                          <CompareCard key={`summary-${report.id}`} entry={report} compact />
                        ))}
                      </div>
                    </section>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm" onClick={() => setPendingDelete(null)}>
          <div className="theme-surface w-full max-w-md rounded-3xl border border-cyan-400/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.35)]" onClick={(event) => event.stopPropagation()}>
            <div className="flex items-start gap-3">
              <div className="rounded-2xl border border-rose-400/20 bg-rose-500/10 p-3 text-rose-300">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-50">{t("Delete Player?")}</h3>
                <p className="mt-1 text-sm text-slate-300">{pendingDelete.fullName} · #{pendingDelete.jerseyNumber}</p>
              </div>
            </div>
            <p className="mt-4 text-sm text-slate-400">{t("This action cannot be undone.")}</p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                className="rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-cyan-400/25 hover:bg-slate-800"
                onClick={() => setPendingDelete(null)}
              >
                {t("Cancel")}
              </button>
              <button
                className="rounded-xl border border-rose-200 bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
                onClick={confirmDeletePlayer}
              >
                {t("Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function KPICard({
  icon: Icon,
  label,
  value,
  color,
  iconColor,
}: {
  icon: any;
  label: string;
  value: number | string;
  color: string;
  iconColor: string;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br ${color} p-6 shadow-[0_16px_40px_rgba(0,0,0,0.18)] backdrop-blur-sm transition hover:-translate-y-1 hover:border-cyan-400/25`}
    >
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.16),transparent_42%)]" />
      <div className="relative z-10">
        <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-slate-950/40">
          <Icon size={20} className={iconColor} />
        </div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300/80">{label}</p>
        <p className="mt-2 text-3xl font-black text-slate-50">{value}</p>
      </div>
    </div>
  );
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-cyan-400/10 bg-slate-950/70 p-3 shadow-[0_12px_30px_rgba(0,0,0,0.18)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan-300/80">{label}</p>
      <p className="mt-1 text-sm font-semibold text-slate-50">{value || "-"}</p>
    </div>
  );
}

function EditableField({
  label,
  value,
  onChange,
  disabled,
  type = "text",
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  type?: string;
  options?: string[];
}) {
  return (
    <label className="space-y-1">
      <span className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-300">{label}</span>
      {options ? (
        <select
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-cyan-400/12 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 disabled:bg-slate-900/60 disabled:text-slate-500"
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-2xl border border-cyan-400/12 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/15 disabled:bg-slate-900/60 disabled:text-slate-500"
        />
      )}
    </label>
  );
}
function ReportCard({ entry, onCompare }: { entry: PlayerReportEntry; onCompare: () => void }) {
  const { t } = useI18n();
  return (
    <div className="overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/25 shadow-[0_18px_50px_rgba(0,0,0,0.28)]">
      <div className={`h-1.5 ${entry.kind === "baseline" ? "bg-gradient-to-r from-cyan-400 to-cyan-600" : "bg-gradient-to-r from-slate-500 to-slate-700"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${reportKindTone[entry.kind]}`}>
                {entry.kind === "baseline" ? t("Baseline Report") : t("Assessment Report")}
              </span>
              <span className="text-xs text-slate-400">{formatDate(entry.assessment.assessedAt)}</span>
            </div>
            <p className="mt-3 text-base font-bold text-slate-50">{entry.assessment.injuryType}</p>
            <p className="mt-1 text-sm text-slate-300">{entry.assessment.notes || entry.assessment.report.finalSummary}</p>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${entry.assessment.riskLevel === "high" ? "border-rose-400/20 bg-rose-500/10 text-rose-200" : entry.assessment.riskLevel === "medium" ? "border-amber-400/20 bg-amber-500/10 text-amber-200" : "border-emerald-400/20 bg-emerald-500/10 text-emerald-200"}`}
          >
            {entry.assessment.riskLevel.toUpperCase()}
          </span>
        </div>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <InfoPill label="SCAT Severity" value={String(entry.assessment.report.scat5.totalSeverityScore)} />
          <InfoPill label="SCAT Symptoms" value={String(entry.assessment.report.scat5.totalSymptomsCount)} />
          <InfoPill label="PLR Latency" value={`${entry.assessment.report.plr.measurements.reflexLatencyMs} ms`} />
          <InfoPill label="Recovery Time" value={`${entry.assessment.report.plr.measurements.recoveryTimeMs} ms`} />
        </div>

        <div className="mt-4 flex justify-end">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-4 py-2 text-sm font-semibold text-cyan-100 transition hover:border-cyan-300/35 hover:bg-cyan-500/15"
            onClick={onCompare}
          >
            <Plus className="h-4 w-4" />
            {t("Compare")}
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareCard({ entry, onRemove, compact = false }: { entry: PlayerReportEntry; onRemove?: () => void; compact?: boolean }) {
  const { t } = useI18n();
  return (
    <div className={`overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 shadow-[0_18px_50px_rgba(0,0,0,0.28)] ${compact ? "h-full" : ""}`}>
      <div className={`h-1.5 ${entry.kind === "baseline" ? "bg-gradient-to-r from-cyan-400 to-cyan-600" : "bg-gradient-to-r from-slate-500 to-slate-700"}`} />
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] ${reportKindTone[entry.kind]}`}>
                {entry.kind === "baseline" ? t("Baseline Report") : t("Assessment Report")}
              </span>
              <span className="text-xs text-slate-400">{formatDateTime(entry.assessment.assessedAt)}</span>
            </div>
            <p className="mt-3 text-base font-bold text-slate-50">{entry.assessment.playerName}</p>
            <p className="mt-1 text-sm text-slate-300">{entry.assessment.injuryType}</p>
          </div>
          {onRemove ? (
            <button
              className="rounded-xl border border-slate-700/70 bg-slate-900/80 p-2 text-slate-300 transition hover:border-cyan-400/25 hover:bg-slate-800 hover:text-white"
              onClick={onRemove}
              title={t("Remove Report")}
            >
              <Minus className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        <div className="mt-4 space-y-2 text-sm">
          <div className="flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
            <span className="text-slate-400">Risk</span>
            <span className="font-semibold text-slate-50">{entry.assessment.riskLevel.toUpperCase()}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
            <span className="text-slate-400">SCAT Severity</span>
            <span className="font-semibold text-slate-50">{entry.assessment.report.scat5.totalSeverityScore}</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
            <span className="text-slate-400">PLR Latency</span>
            <span className="font-semibold text-slate-50">{entry.assessment.report.plr.measurements.reflexLatencyMs} ms</span>
          </div>
          <div className="flex items-center justify-between rounded-2xl border border-slate-700/70 bg-slate-900/70 px-3 py-2">
            <span className="text-slate-400">Decision</span>
            <span className="font-semibold text-slate-50">{entry.assessment.report.decision.recommendedAction}</span>
          </div>
        </div>

        <div className="mt-4 rounded-2xl border border-cyan-400/10 bg-cyan-500/5 p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-300">Summary</p>
          <p className="mt-2 text-sm text-slate-200">{entry.assessment.report.finalSummary}</p>
        </div>
      </div>
    </div>
  );
}

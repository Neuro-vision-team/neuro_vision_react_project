import { useEffect, useMemo, useState } from "react";
import { ChartColumnBig, CheckCircle2, Eye, EyeOff, Home, Search, Sparkles, Stethoscope, Trash2, UserPlus, Users } from "lucide-react";
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PageTitle } from "../components/ui";
import { useI18n } from "../app/i18n";
import { AGE_CATEGORIES, CITIES_BY_COUNTRY, COUNTRIES, COUNTRY_CODES, COUNTRY_TO_PHONE_CODE, SPORTS } from "../app/data/locations";
import { createPlayer, createTeam, deletePlayer, deleteTeam, getPlayersByTeam, getTeamById, getTeams, isJerseyNumberUniqueInTeam, isLoginEmailUnique, setTeamStatus, updatePlayer, updateTeam } from "../app/data/teams";
import type { Player, PlayerFormInput, PlayerQuery, Team, TeamFormInput, TeamQuery, TeamStatus } from "../app/types/team";
import { getAllAssessments } from "../services/assessmentHistoryMock";

const CURRENT_YEAR = new Date().getFullYear();
const PAGE_SIZE = 6;
const PLAYER_PAGE_SIZE = 6;
const DRAFT_KEY = "player_draft_team";

type Tab = "home" | "register" | "manage" | "details";
type RegisterPhase = "team" | "player";

const calcAge = (dob: string) => {
  if (!dob) return 0;
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

const normalizePhoneDigits = (value: string) => {
  const arabicIndic = "Ù Ù¡Ù¢Ù£Ù¤Ù¥Ù¦Ù§Ù¨Ù©";
  const easternArabicIndic = "Û°Û±Û²Û³Û´ÛµÛ¶Û·Û¸Û¹";
  const mapped = value
    .split("")
    .map((ch) => {
      const i1 = arabicIndic.indexOf(ch);
      if (i1 >= 0) return String(i1);
      const i2 = easternArabicIndic.indexOf(ch);
      if (i2 >= 0) return String(i2);
      return ch;
    })
    .join("");
  return mapped.replace(/[^\d]/g, "");
};

const defaultTeam: TeamFormInput = {
  teamName: "",
  teamLogo: "",
  sportType: "",
  ageCategory: "",
  teamGender: "Men",
  country: "",
  city: "",
  affiliatedClub: "",
  foundedYear: 0,
  coachName: "",
  phoneCountryCode: "+963",
  phoneNumber: "",
  contactEmail: "",
  medicalStaffName: "",
  medicalStaffEmail: "",
  medicalStaffPassword: "",
  loginEmail: "",
  password: "",
  teamStatus: "Active",
  subscriptionType: "Standard",
  permissions: ["Assessments", "Reports"],
};

const defaultPlayer: PlayerFormInput = {
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
  joinDate: new Date().toISOString().slice(0, 10),
  phoneCountryCode: "+963",
  phoneNumber: "",
  email: "",
  guardianName: "",
  status: "Active",
  position: "",
};

export default function AdminWorkspacePage() {
  const { t, isArabic } = useI18n();

  const [tab, setTab] = useState<Tab>("home");
  const [phase, setPhase] = useState<RegisterPhase>("team");
  const [teamStep, setTeamStep] = useState(1);
  const [playerStep, setPlayerStep] = useState(1);

  const [teamForm, setTeamForm] = useState<TeamFormInput>(defaultTeam);
  const [playerForm, setPlayerForm] = useState<PlayerFormInput>(defaultPlayer);

  const [teamEditId, setTeamEditId] = useState<string | null>(null);
  const [playerEditId, setPlayerEditId] = useState<string | null>(null);

  const [activeTeam, setActiveTeam] = useState<Team | null>(null);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);

  const [showPwd, setShowPwd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [teamDeleteId, setTeamDeleteId] = useState("");
  const [playerDeleteId, setPlayerDeleteId] = useState("");
  const [playerDetails, setPlayerDetails] = useState<Player | null>(null);

  const [teams, setTeams] = useState<Team[]>([]);
  const [teamsTotal, setTeamsTotal] = useState(0);
  const [teamPages, setTeamPages] = useState(1);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamQuery, setTeamQuery] = useState<TeamQuery>({ search: "", sport: "", status: "", subscription: "", sortBy: "name_asc", page: 1, pageSize: PAGE_SIZE });

  const [players, setPlayers] = useState<Player[]>([]);
  const [playersTotal, setPlayersTotal] = useState(0);
  const [playerPages, setPlayerPages] = useState(1);
  const [loadingPlayers, setLoadingPlayers] = useState(false);
  const [playerQuery, setPlayerQuery] = useState<PlayerQuery>({ search: "", status: "", sortBy: "name_asc", page: 1, pageSize: PLAYER_PAGE_SIZE });

  const cities = useMemo(() => CITIES_BY_COUNTRY[teamForm.country] || [], [teamForm.country]);
  const age = useMemo(() => calcAge(playerForm.dateOfBirth), [playerForm.dateOfBirth]);
  const assessments = useMemo(() => getAllAssessments(), [teamsTotal, playersTotal, teamPages, playerPages]);
  const dashboardStats = useMemo(() => {
    const teamCount = teamsTotal;
    const playerCount = teams.reduce((sum, team) => sum + (team.players?.length || 0), 0);
    const medicalStaffCount = new Set(
      teams
        .map((team) => {
          const name = team.medicalStaffName?.trim().toLowerCase() || "";
          const email = team.medicalStaffEmail?.trim().toLowerCase() || "";
          return name || email ? `${name}::${email}` : "";
        })
        .filter(Boolean)
    ).size;
    const assessmentCount = assessments.length;

    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monthlyAssessments = monthLabels.map((label, index) => ({
      month: label,
      assessments: assessments.filter((assessment) => new Date(assessment.assessedAt).getMonth() === index).length,
    }));

    return { teamCount, playerCount, medicalStaffCount, assessmentCount, monthlyAssessments };
  }, [assessments, teams, teamsTotal]);
  const loadTeams = async () => {
    setLoadingTeams(true);
    const res = await getTeams(teamQuery);
    setTeams(res.teams);
    setTeamsTotal(res.total);
    setTeamPages(res.totalPages);
    setLoadingTeams(false);
  };

  const loadPlayers = async (teamId: string, query: PlayerQuery = playerQuery) => {
    setLoadingPlayers(true);
    const res = await getPlayersByTeam(teamId, query);
    setPlayers(res.players);
    setPlayersTotal(res.total);
    setPlayerPages(res.totalPages);
    setLoadingPlayers(false);
  };

  useEffect(() => { loadTeams(); }, [teamQuery]);
  useEffect(() => {
    if (!activeTeam) return;
    loadPlayers(activeTeam.id);
  }, [activeTeam?.id, playerQuery.page, playerQuery.search, playerQuery.sortBy, playerQuery.status]);

  useEffect(() => {
    if (!activeTeam) return;
    const all = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Record<string, PlayerFormInput>;
    all[activeTeam.id] = playerForm;
    localStorage.setItem(DRAFT_KEY, JSON.stringify(all));
  }, [activeTeam?.id, playerForm]);

  const setTeamField = <K extends keyof TeamFormInput>(k: K, v: TeamFormInput[K]) => setTeamForm((p) => ({ ...p, [k]: v }));
  const setPlayerField = <K extends keyof PlayerFormInput>(k: K, v: PlayerFormInput[K]) => setPlayerForm((p) => ({ ...p, [k]: v }));

  const onTeamLogo = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setError("Unsupported image format");
    if (file.size > 5 * 1024 * 1024) return setError("Image > 5MB");
    const r = new FileReader();
    r.onloadend = () => setTeamField("teamLogo", String(r.result));
    r.readAsDataURL(file);
  };
  const onPlayerPhoto = (file?: File) => {
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) return setError("Unsupported image format");
    if (file.size > 5 * 1024 * 1024) return setError("Image > 5MB");
    const r = new FileReader();
    r.onloadend = () => setPlayerField("photo", String(r.result));
    r.readAsDataURL(file);
  };

  const validateTeam = () => {
    if (!teamForm.teamName.trim()) return "Team name is required";
    if (teamForm.teamName.length > 100) return "Team name max is 100";
    if (!teamForm.teamLogo) return "Team logo is required";
    if (!teamForm.sportType || !teamForm.ageCategory || !teamForm.country || !teamForm.city) return "Complete team information";
    if (!teamForm.foundedYear || teamForm.foundedYear < 1800 || teamForm.foundedYear > CURRENT_YEAR) return `Founded year must be between 1800 and ${CURRENT_YEAR}`;
    if (!teamForm.coachName.trim()) return "Coach name is required";
    const teamPhone = normalizePhoneDigits(teamForm.phoneNumber);
    if (!/^\d{6,14}$/.test(teamPhone)) return "Invalid phone number";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamForm.contactEmail)) return "Invalid contact email";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamForm.loginEmail)) return "Invalid login email";
    if (!isLoginEmailUnique(teamForm.loginEmail, teamEditId || undefined)) return "Login email already exists";
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(teamForm.password)) return "Weak password";
    if (!teamForm.medicalStaffName.trim()) return "Medical staff name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(teamForm.medicalStaffEmail)) return "Invalid medical staff email";
    if (!/^(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(teamForm.medicalStaffPassword)) return "Weak medical staff password";
    return "";
  };

  const validatePlayer = () => {
    if (!activeTeam?.id) return "Cannot create player without team";
    if (!playerForm.photo) return "Player photo is required";
    if (!playerForm.fullName.trim()) return "Full name is required";
    if (playerForm.fullName.length > 100) return "Full name max is 100";
    if (playerForm.shirtName.length > 30) return "Shirt name max is 30";
    if (!playerForm.dateOfBirth) return "Date of birth is required";
    if (!playerForm.nationality) return "Nationality is required";
    if (!playerForm.jerseyNumber) return "Jersey number is required";
    if (!isJerseyNumberUniqueInTeam(activeTeam.id, playerForm.jerseyNumber, playerEditId || undefined)) return "Jersey number already exists in this team";
    const playerPhone = normalizePhoneDigits(playerForm.phoneNumber);
    if (!/^\d{6,14}$/.test(playerPhone)) return "Invalid phone number";
    if (playerForm.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(playerForm.email)) return "Invalid email";
    if (age < 18 && !playerForm.guardianName?.trim()) return "Guardian name required for under 18";
    return "";
  };

  const saveTeam = async () => {
    const v = validateTeam();
    setError("");
    if (v) return setError(v);
    setSaving(true);
    try {
      const team = teamEditId ? await updateTeam(teamEditId, teamForm) : await createTeam(teamForm);
      setActiveTeam(team);
      setPhase("player");
      setPlayerStep(1);
      setMessage("Team saved. Continue adding players.");
      setTeamEditId(null);
      const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "{}") as Record<string, PlayerFormInput>;
      if (draft[team.id]) setPlayerForm(draft[team.id]); else setPlayerForm({ ...defaultPlayer, phoneCountryCode: team.phoneCountryCode });
      await loadPlayers(team.id, { ...playerQuery, page: 1 });
      await loadTeams();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const savePlayer = async () => {
    const v = validatePlayer();
    setError("");
    if (v) return setError(v);
    if (!activeTeam) return;
    setSaving(true);
    try {
      if (playerEditId) await updatePlayer(activeTeam.id, playerEditId, playerForm);
      else await createPlayer(activeTeam.id, playerForm);
      setMessage("Player saved.");
      setPlayerEditId(null);
      setPlayerForm({ ...defaultPlayer, phoneCountryCode: activeTeam.phoneCountryCode, joinDate: new Date().toISOString().slice(0, 10) });
      setPlayerStep(1);
      await loadPlayers(activeTeam.id, { ...playerQuery, page: 1 });
      const fresh = await getTeamById(activeTeam.id);
      if (fresh) setActiveTeam(fresh);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Player save failed");
    } finally {
      setSaving(false);
    }
  };

  const openTeamDetails = async (id: string) => {
    const team = await getTeamById(id);
    if (!team) return;
    setSelectedTeam(team);
    setTab("details");
    setPlayerQuery((q) => ({ ...q, page: 1, search: "", status: "", sortBy: "name_asc" }));
    await loadPlayers(team.id, { search: "", status: "", sortBy: "name_asc", page: 1, pageSize: PLAYER_PAGE_SIZE });
  };

  const openTeamEdit = async (id: string) => {
    const team = await getTeamById(id);
    if (!team) return;
    setTeamEditId(id);
    setTeamForm({
      teamName: team.teamName,
      teamLogo: team.teamLogo,
      sportType: team.sportType,
      ageCategory: team.ageCategory,
      teamGender: team.teamGender,
      country: team.country,
      city: team.city,
      affiliatedClub: team.affiliatedClub || "",
      foundedYear: team.foundedYear,
      coachName: team.coachName,
      phoneCountryCode: team.phoneCountryCode,
      phoneNumber: team.phoneNumber,
      contactEmail: team.contactEmail,
      medicalStaffName: team.medicalStaffName || "",
      medicalStaffEmail: team.medicalStaffEmail || "",
      medicalStaffPassword: team.medicalStaffPassword || "",
      loginEmail: team.loginEmail,
      password: team.password,
      teamStatus: team.teamStatus,
      subscriptionType: team.subscriptionType,
      permissions: team.permissions,
    });
    setPhase("team");
    setTab("register");
    setTeamStep(1);
  };

  const beginPlayerEdit = (player: Player) => {
    setPlayerEditId(player.id);
    setPlayerForm({
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
    setPlayerStep(1);
  };

  const PlayerCards = ({ scope }: { scope: "active" | "details" }) => {
    const onEdit = (player: Player) => {
      if (scope === "details" && selectedTeam) {
        setTab("register");
        setPhase("player");
        setActiveTeam(selectedTeam);
      }
      beginPlayerEdit(player);
    };
    return (
      <>
        <div className="grid gap-3 md:grid-cols-4">
          <input className="rounded-lg bg-slate-900/80 p-2 md:col-span-2" placeholder={t("Search players")} value={playerQuery.search} onChange={(e) => setPlayerQuery((q) => ({ ...q, search: e.target.value, page: 1 }))} />
          <select className="rounded-lg bg-slate-900/80 p-2" value={playerQuery.sortBy} onChange={(e) => setPlayerQuery((q) => ({ ...q, sortBy: e.target.value as PlayerQuery["sortBy"], page: 1 }))}>
            <option value="name_asc">{t("Name A-Z")}</option>
            <option value="name_desc">{t("Name Z-A")}</option>
            <option value="oldest">{t("Oldest")}</option>
            <option value="youngest">{t("Youngest")}</option>
          </select>
          <select className="rounded-lg bg-slate-900/80 p-2" value={playerQuery.status} onChange={(e) => setPlayerQuery((q) => ({ ...q, status: e.target.value, page: 1 }))}><option value="">{t("All Status")}</option><option>{t("Active")}</option><option>{t("Injured")}</option><option>{t("Suspended")}</option></select>
        </div>
        <p className="text-sm theme-muted">{t("Players")}: {playersTotal}</p>
        <div className="grid md:grid-cols-2 gap-3">
          {loadingPlayers
            ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-40 animate-pulse rounded-2xl bg-slate-900/40" />)
            : players.map((player) => (
                <div key={player.id} className="theme-surface-soft rounded-xl border p-3">
                  <div className="flex gap-3 items-center">
                    <div className="h-14 w-14 rounded-full border border-slate-600 p-1 bg-slate-900/50"><img src={player.photo || "https://placehold.co/56x56?text=P"} className="h-full w-full rounded-full object-contain" /></div>
                    <div className="min-w-0">
                      <p className="font-semibold truncate">{player.fullName}</p>
                      <p className="text-sm theme-muted">#{player.jerseyNumber} • {player.position} • {player.age}y • {player.status}</p>
                    </div>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => setPlayerDetails(player)}>{t("Details")}</button>
                    <button className="rounded-lg border px-2 py-1 text-xs" onClick={() => onEdit(player)}>{t("Edit")}</button>
                    <button className="rounded-lg border border-rose-500/50 px-2 py-1 text-xs text-rose-300" onClick={() => setPlayerDeleteId(player.id)}>{t("Delete")}</button>
                  </div>
                </div>
              ))}
        </div>
        <div className="flex justify-between items-center">
          <button className="rounded-lg border px-3 py-1" disabled={playerQuery.page === 1} onClick={() => setPlayerQuery((q) => ({ ...q, page: q.page - 1 }))}>{t("Previous")}</button>
          <span className="text-sm">{playerQuery.page} / {playerPages}</span>
          <button className="rounded-lg border px-3 py-1" disabled={playerQuery.page === playerPages} onClick={() => setPlayerQuery((q) => ({ ...q, page: q.page + 1 }))}>{t("Next")}</button>
        </div>
      </>
    );
  };

  const formControl =
    "h-12 w-full rounded-xl border border-slate-700/50 bg-slate-900/70 px-4 text-sm font-medium text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20";
  const compactFormControl =
    "h-12 rounded-xl border border-slate-700/50 bg-slate-900/70 px-3 text-sm font-medium text-slate-100 outline-none transition focus:border-cyan-400/70 focus:ring-2 focus:ring-cyan-400/20";
  const stepButtonClass = (active: boolean) =>
    `rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${active ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100 shadow-[0_8px_24px_rgba(6,182,212,0.16)]" : "theme-surface-soft hover:border-cyan-400/40 hover:bg-cyan-500/10"}`;
  const optionButtonClass = (active: boolean) =>
    `h-12 rounded-xl border px-4 text-sm font-semibold transition ${active ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100" : "theme-surface-soft hover:border-cyan-400/40"}`;

  return (
    <div className={`relative mx-auto flex w-full max-w-7xl gap-5 ${isArabic ? "pr-[19.5rem]" : "pl-[19.5rem]"}`} dir={isArabic ? "rtl" : "ltr"}>
      <aside
        className={`theme-surface fixed top-0 flex h-screen w-72 shrink-0 flex-col rounded-[1.75rem] border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-4 shadow-[0_20px_60px_rgba(0,0,0,0.22)] ${
          isArabic ? 'right-0' : 'left-0'
        }`}
      >
        <div className="rounded-2xl border border-cyan-400/10 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.12),transparent_40%)] p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/80">{t("Admin Team Control")}</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-slate-50">{t("Home")}</h1>
          <p className="mt-1 text-sm text-slate-300">{t("Executive overview for registered teams and assessments.")}</p>
        </div>
        <nav className="mt-4 space-y-2">
          {[
            { key: "home", label: t("Home"), icon: Home },
            { key: "register", label: t("Team Registration"), icon: Sparkles },
            { key: "manage", label: t("Teams Management"), icon: Users },
          ].map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key as Tab)}
              className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${
                tab === item.key
                  ? "border-cyan-400/50 bg-cyan-500/20 text-cyan-100 shadow-[0_12px_30px_rgba(6,182,212,0.16)]"
                  : "border-slate-700/50 bg-slate-950/30 text-slate-300 hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-slate-50"
              }`}
            >
              <item.icon size={16} className={tab === item.key ? "text-cyan-300" : "text-slate-400"} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </aside>

      <div className="min-w-0 flex-1 space-y-6">
        {tab === "home" && (
          <section className="space-y-6">
            <PageTitle title={t("Admin Team Control")} subtitle={t("Executive overview for teams, players, medical staff, and assessments.")} />
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard icon={Users} label={t("Total Teams")} value={dashboardStats.teamCount} tone="from-cyan-500/20 to-sky-500/10" iconTone="text-cyan-300" />
              <StatCard icon={UserPlus} label={t("Total Players")} value={dashboardStats.playerCount} tone="from-emerald-500/20 to-emerald-500/10" iconTone="text-emerald-300" />
              <StatCard icon={Stethoscope} label={t("Total Medical Staff")} value={dashboardStats.medicalStaffCount} tone="from-violet-500/20 to-violet-500/10" iconTone="text-violet-300" />
              <StatCard icon={ChartColumnBig} label={t("Assessment Sessions")} value={dashboardStats.assessmentCount} tone="from-amber-500/20 to-amber-500/10" iconTone="text-amber-300" />
            </div>
            <section className="rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div>
                  <h2 className="text-xl font-bold text-slate-50">{t("Assessments Per Month")}</h2>
                  <p className="mt-1 text-sm text-slate-400">{t("Assessments Number")}</p>
                </div>
                <div className="rounded-full border border-cyan-400/20 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-100">{t("Monthly overview")}</div>
              </div>
              <div className="h-[360px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardStats.monthlyAssessments} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                    <defs>
                      <linearGradient id="assessmentBar" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.95} />
                        <stop offset="100%" stopColor="#0f766e" stopOpacity={0.75} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.15)" />
                    <XAxis dataKey="month" stroke="#94a3b8" />
                    <YAxis stroke="#94a3b8" allowDecimals={false} />
                    <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid rgba(34,211,238,0.2)", borderRadius: 14, color: "#e2e8f0" }} />
                    <Legend />
                    <Bar dataKey="assessments" name={t("Assessments Number")} fill="url(#assessmentBar)" radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </section>
          </section>
        )}

        {tab === "register" && phase === "team" && (
        <section className="theme-surface rounded-2xl border p-5 space-y-5">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {[t("1. Team Info"), t("2. Contact"), t("3. System"), t("4. Review")].map((stepLabel, index) => (
              <button key={stepLabel} type="button" className={stepButtonClass(teamStep === index + 1)} onClick={() => setTeamStep(index + 1)}>
                {stepLabel}
              </button>
            ))}
          </div>
          {teamStep === 1 && <div className="grid gap-4 md:grid-cols-2">
            <input className={formControl} placeholder={t("Team name")} value={teamForm.teamName} onChange={(e) => setTeamField("teamName", e.target.value)} />
            <select className={formControl} value={teamForm.sportType} onChange={(e) => setTeamField("sportType", e.target.value)}><option value="">{t("Sport type")}</option>{SPORTS.map((s) => <option key={s}>{s}</option>)}</select>
            <select className={formControl} value={teamForm.ageCategory} onChange={(e) => setTeamField("ageCategory", e.target.value)}><option value="">{t("Age category")}</option>{AGE_CATEGORIES.map((a) => <option key={a}>{a}</option>)}</select>
            <div className="space-y-2"><p className="text-xs font-semibold uppercase theme-muted">{t("Gender")}</p><div className="flex flex-wrap gap-2">{(["Men", "Women", "Mixed"] as const).map((g) => <button key={g} type="button" className={optionButtonClass(teamForm.teamGender === g)} onClick={() => setTeamField("teamGender", g)}>{t(g)}</button>)}</div></div>
            <input list="countries-admin" className={formControl} placeholder={t("Country")} value={teamForm.country} onChange={(e) => { const c = e.target.value; setTeamField("country", c); setTeamField("city", ""); const code = COUNTRY_TO_PHONE_CODE[c]; if (code) setTeamField("phoneCountryCode", code); }} />
            <datalist id="countries-admin">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist>
            <input list="cities-admin" className={formControl} placeholder={t("City")} value={teamForm.city} onChange={(e) => setTeamField("city", e.target.value)} />
            <datalist id="cities-admin">{cities.map((c) => <option key={c} value={c} />)}</datalist>
            <input className={formControl} placeholder={t("Club/Academy (optional)")} value={teamForm.affiliatedClub} onChange={(e) => setTeamField("affiliatedClub", e.target.value)} />
            <input type="text" inputMode="numeric" className={formControl} placeholder={t("Founded year ex.2003")} value={teamForm.foundedYear || ""} onChange={(e) => setTeamField("foundedYear", Number(e.target.value.replace(/[^\d]/g, "")))} />
            <label className="theme-surface-soft md:col-span-2 rounded-2xl border border-dashed p-4 text-sm font-semibold transition hover:border-cyan-400/50">{t("Team logo (PNG/JPG/WEBP - 5MB)")}
              <input type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 block w-full text-sm theme-muted file:mr-4 file:rounded-lg file:border-0 file:bg-cyan-500/20 file:px-4 file:py-2 file:font-semibold file:text-cyan-100" onChange={(e) => onTeamLogo(e.target.files?.[0])} />
              {teamForm.teamLogo ? <div className="mt-3 h-24 w-24 rounded-2xl border border-slate-500 bg-slate-900/50 p-1"><img src={teamForm.teamLogo} className="h-full w-full rounded-xl object-contain" /></div> : null}
            </label>
          </div>}
          {teamStep === 2 && <div className="grid gap-4 md:grid-cols-2"><input className={formControl} placeholder={t("Coach name")} value={teamForm.coachName} onChange={(e) => setTeamField("coachName", e.target.value)} /><div className="flex gap-2"><select className={`${compactFormControl} w-32`} value={teamForm.phoneCountryCode} onChange={(e) => setTeamField("phoneCountryCode", e.target.value)}>{COUNTRY_CODES.map((c) => <option key={c}>{c}</option>)}</select><input className={`${formControl} flex-1`} placeholder={t("Phone number")} value={teamForm.phoneNumber} onChange={(e) => setTeamField("phoneNumber", e.target.value)} /></div><input type="email" className={`${formControl} md:col-span-2`} placeholder={t("Contact email")} value={teamForm.contactEmail} onChange={(e) => setTeamField("contactEmail", e.target.value)} /></div>}
          {teamStep === 3 && <div className="space-y-4">
            <div className="theme-surface-soft rounded-2xl border p-4">
              <div className="mb-4">
                <h3 className="text-base font-semibold">{t("System Settings")}</h3>
                <p className="text-xs theme-muted">{t("Team login and account status.")}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input type="email" className={formControl} placeholder={t("Login email")} value={teamForm.loginEmail} onChange={(e) => setTeamField("loginEmail", e.target.value)} />
                <div className="relative">
                  <input type={showPwd ? "text" : "password"} className={`${formControl} pr-12`} placeholder={t("Password")} value={teamForm.password} onChange={(e) => setTeamField("password", e.target.value)} />
                  <button type="button" onClick={() => setShowPwd((v) => !v)} className="absolute right-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg theme-surface-soft">{showPwd ? <EyeOff size={16} /> : <Eye size={16} />}</button>
                </div>
                <label className="theme-surface flex h-12 items-center gap-3 rounded-xl border px-4 text-sm font-semibold"><input type="checkbox" checked={teamForm.teamStatus === "Active"} onChange={(e) => setTeamField("teamStatus", (e.target.checked ? "Active" : "Suspended") as TeamStatus)} />{t("Team Status")}: {teamForm.teamStatus === "Active" ? t("Active") : t("Suspended")}</label>
              </div>
            </div>
            <div className="theme-surface-soft rounded-2xl border p-4">
              <div className="mb-4">
                <h3 className="text-base font-semibold">{t("Medical Staff")}</h3>
                <p className="text-xs theme-muted">{t("Create the staff account before completing team registration.")}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <input className={formControl} placeholder={t("Medical staff name")} value={teamForm.medicalStaffName} onChange={(e) => setTeamField("medicalStaffName", e.target.value)} />
                <input type="email" className={formControl} placeholder={t("Medical staff email")} value={teamForm.medicalStaffEmail} onChange={(e) => setTeamField("medicalStaffEmail", e.target.value)} />
                <div className="relative md:col-span-2">
                  <input type={showPwd ? "text" : "password"} className={`${formControl} pr-12`} placeholder={t("Medical staff password")} value={teamForm.medicalStaffPassword} onChange={(e) => setTeamField("medicalStaffPassword", e.target.value)} />
                </div>
              </div>
            </div>
          </div>}
          {teamStep === 4 && <div className="space-y-4">
            <div className="rounded-2xl border border-emerald-400/40 bg-emerald-500/10 p-4 text-sm"><CheckCircle2 className="inline w-4 h-4" /> {t("Review complete. Save to continue with player registration.")}</div>
            <div className="grid gap-3 md:grid-cols-4">
              <div className="theme-surface-soft rounded-xl border p-3">
                <p className="text-xs font-semibold uppercase theme-muted">{t("Team")}</p>
                <p className="mt-1 text-sm font-semibold">{teamForm.teamName || "-"}</p>
              </div>
              <div className="theme-surface-soft rounded-xl border p-3">
                <p className="text-xs font-semibold uppercase theme-muted">{t("Login Email")}</p>
                <p className="mt-1 break-words text-sm font-semibold">{teamForm.loginEmail || "-"}</p>
              </div>
              <div className="theme-surface-soft rounded-xl border p-3">
                <p className="text-xs font-semibold uppercase theme-muted">{t("Medical Staff")}</p>
                <p className="mt-1 text-sm font-semibold">{teamForm.medicalStaffName || "-"}</p>
              </div>
              <div className="theme-surface-soft rounded-xl border p-3">
                <p className="text-xs font-semibold uppercase theme-muted">{t("Email")}</p>
                <p className="mt-1 break-words text-sm font-semibold">{teamForm.medicalStaffEmail || "-"}</p>
              </div>
            </div>
          </div>}
          <div className="h-2 w-full rounded-full bg-slate-700/40"><div className="h-2 rounded-full bg-cyan-500" style={{ width: `${(teamStep / 4) * 100}%` }} /></div>
          {error ? <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-rose-200 text-sm">{error}</div> : null}
          {message ? <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-emerald-200 text-sm">{message}</div> : null}
          <div className="flex justify-between"><button className="rounded-lg border px-4 py-2" onClick={() => setTeamStep((s) => Math.max(1, s - 1))}>{t("Back")}</button><div className="flex gap-2">{teamStep < 4 ? <button className="rounded-lg bg-cyan-500/30 px-4 py-2" onClick={() => setTeamStep((s) => Math.min(4, s + 1))}>{t("Next")}</button> : <button className="rounded-lg bg-emerald-500/30 px-4 py-2" onClick={saveTeam} disabled={saving}>{saving ? t("Saving...") : t("Save Team & Add Players")}</button>}</div></div>
        </section>
      )}

      {tab === "register" && phase === "player" && activeTeam && (
        <section className="theme-surface rounded-2xl border p-4 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-lg font-semibold flex items-center gap-2"><UserPlus size={18} /> {t("Add Players - {teamName}").replace("{teamName}", activeTeam.teamName)}</h2><button className="rounded-lg border px-3 py-1" onClick={() => { setPhase("team"); setActiveTeam(null); }}>{t("Back to Team")}</button></div>
          <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-3">
            {[
              { label: t("1. Personal"), step: 1 },
              { label: t("2. Sports"), step: 2 },
              { label: t("3. Contact"), step: 3 },
            ].map((item) => (
              <button
                key={item.label}
                type="button"
                className={`rounded-xl border px-4 py-3 text-left font-semibold transition ${playerStep === item.step ? "border-cyan-400/60 bg-cyan-500/20 text-cyan-100 shadow-[0_8px_24px_rgba(6,182,212,0.16)]" : "theme-surface-soft hover:border-cyan-400/40 hover:bg-cyan-500/10"}`}
                onClick={() => setPlayerStep(item.step)}
              >
                {item.label}
              </button>
            ))}
          </div>
          <div className="rounded-2xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-4 md:p-5 shadow-[0_20px_60px_rgba(0,0,0,0.28)]">
            {playerStep === 1 && <div className="grid gap-3 md:grid-cols-2"><label className="md:col-span-2 rounded-2xl border border-dashed border-cyan-400/30 bg-slate-950/40 p-4 text-sm text-slate-300">{t("Player photo (PNG/JPG/WEBP - 5MB)")}<input type="file" accept="image/png,image/jpeg,image/webp" className="mt-3 block" onChange={(e) => onPlayerPhoto(e.target.files?.[0])} />{playerForm.photo ? <div className="mt-3 h-24 w-24 rounded-full border border-cyan-400/30 bg-slate-900/50 p-1 shadow-lg"><img src={playerForm.photo} className="h-full w-full rounded-full object-contain" /></div> : null}</label><input className={formControl} placeholder={t("Full name")} value={playerForm.fullName} onChange={(e) => setPlayerField("fullName", e.target.value)} /><input className={formControl} placeholder={t("Shirt name")} value={playerForm.shirtName} onChange={(e) => setPlayerField("shirtName", e.target.value)} /><input type="date" className={formControl} value={playerForm.dateOfBirth} onChange={(e) => setPlayerField("dateOfBirth", e.target.value)} /><input className={formControl} value={age || ""} placeholder={t("Age")} disabled /><input list="countries-player" className={formControl} placeholder={t("Nationality")} value={playerForm.nationality} onChange={(e) => setPlayerField("nationality", e.target.value)} /><datalist id="countries-player">{COUNTRIES.map((c) => <option key={c} value={c} />)}</datalist><div className="space-y-1"><p className="text-xs font-semibold uppercase text-slate-400">{t("Gender")}</p><div className="flex gap-2">{(["Male", "Female"] as const).map((g) => <button key={g} type="button" className={`rounded-xl px-4 py-2 border ${playerForm.gender === g ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-50" : "theme-surface-soft"}`} onClick={() => setPlayerField("gender", g)}>{t(g)}</button>)}</div></div><input type="number" className={formControl} placeholder={t("Height (cm)")} value={playerForm.heightCm || ""} onChange={(e) => setPlayerField("heightCm", Number(e.target.value))} /><input type="number" className={formControl} placeholder={t("Weight (kg)")} value={playerForm.weightKg || ""} onChange={(e) => setPlayerField("weightKg", Number(e.target.value))} /></div>}
            {playerStep === 2 && <div className="grid gap-3 md:grid-cols-2"><input type="number" className={formControl} placeholder={t("Jersey number")} value={playerForm.jerseyNumber || ""} onChange={(e) => setPlayerField("jerseyNumber", Number(e.target.value))} /><input className={formControl} placeholder={t("Position")} value={playerForm.position} onChange={(e) => setPlayerField("position", e.target.value)} /><div className="space-y-1"><p className="text-xs font-semibold uppercase text-slate-400">{t("Preferred foot/hand")}</p><div className="flex gap-2">{(["Right", "Left", "Both"] as const).map((v) => <button key={v} type="button" className={`rounded-xl px-4 py-2 border ${playerForm.preferredSide === v ? "bg-cyan-500/30 border-cyan-400/50 text-cyan-50" : "theme-surface-soft"}`} onClick={() => setPlayerField("preferredSide", v)}>{t(v)}</button>)}</div></div><input type="date" className={formControl} value={playerForm.joinDate} onChange={(e) => setPlayerField("joinDate", e.target.value)} /><select className={formControl} value={playerForm.status} onChange={(e) => setPlayerField("status", e.target.value as PlayerFormInput["status"])}><option>{t("Active")}</option><option>{t("Injured")}</option><option>{t("Suspended")}</option></select></div>}
            {playerStep === 3 && <div className="grid gap-3 md:grid-cols-2"><div className="flex gap-2"><select className={`${compactFormControl} w-32`} value={playerForm.phoneCountryCode} onChange={(e) => setPlayerField("phoneCountryCode", e.target.value)}>{COUNTRY_CODES.map((c) => <option key={c}>{c}</option>)}</select><input className={`${formControl} flex-1`} placeholder={t("Phone number")} value={playerForm.phoneNumber} onChange={(e) => setPlayerField("phoneNumber", e.target.value)} /></div><input type="email" className={formControl} placeholder={t("Email (optional)")} value={playerForm.email || ""} onChange={(e) => setPlayerField("email", e.target.value)} />{age < 18 && <input className={`${formControl} md:col-span-2`} placeholder={t("Guardian name")} value={playerForm.guardianName || ""} onChange={(e) => setPlayerField("guardianName", e.target.value)} />}</div>}
          </div>
          <div className="h-2 w-full rounded-full bg-slate-700/40"><div className="h-2 rounded-full bg-cyan-500" style={{ width: `${(playerStep / 3) * 100}%` }} /></div>
          {error ? <div className="rounded-lg border border-rose-500/40 bg-rose-500/10 p-2 text-rose-200 text-sm">{error}</div> : null}
          {message ? <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/10 p-2 text-emerald-200 text-sm">{message}</div> : null}
          <div className="flex justify-between"><button className="rounded-lg border px-4 py-2" onClick={() => setPlayerStep((s) => Math.max(1, s - 1))}>{t("Back")}</button><div className="flex gap-2">{playerStep < 3 ? <button className="rounded-lg bg-cyan-500/30 px-4 py-2" onClick={() => setPlayerStep((s) => Math.min(3, s + 1))}>{t("Next")}</button> : <button className="rounded-lg bg-emerald-500/30 px-4 py-2" onClick={savePlayer} disabled={saving}>{saving ? t("Saving...") : playerEditId ? t("Update Player") : t("Save Player")}</button>}</div></div>
          <h3 className="font-semibold">{t("Current Team Players")}</h3>
          <PlayerCards scope="active" />
        </section>
      )}

      {tab === "manage" && (
        <section className="space-y-4 rounded-3xl border border-cyan-400/10 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 p-5 shadow-[0_20px_60px_rgba(0,0,0,0.22)]">
          <div className="grid gap-3 rounded-2xl border border-cyan-400/10 bg-slate-950/40 p-4 md:grid-cols-5">
            <label className="md:col-span-2 relative"><Search size={16} className="absolute left-2 top-2.5" /><input className="w-full rounded-lg bg-slate-900/80 p-2 pl-8" placeholder={t("Search teams")} value={teamQuery.search} onChange={(e) => setTeamQuery((q) => ({ ...q, search: e.target.value, page: 1 }))} /></label>
            <select className="rounded-lg bg-slate-900/80 p-2" value={teamQuery.sport} onChange={(e) => setTeamQuery((q) => ({ ...q, sport: e.target.value, page: 1 }))}><option value="">{t("All Sports")}</option>{SPORTS.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="rounded-lg bg-slate-900/80 p-2" value={teamQuery.status} onChange={(e) => setTeamQuery((q) => ({ ...q, status: e.target.value, page: 1 }))}><option value="">{t("All Status")}</option><option>{t("Active")}</option><option>{t("Suspended")}</option></select>
            <select className="rounded-lg bg-slate-900/80 p-2" value={teamQuery.sortBy} onChange={(e) => setTeamQuery((q) => ({ ...q, sortBy: e.target.value as TeamQuery["sortBy"] }))}><option value="name_asc">{t("Name A-Z")}</option><option value="name_desc">{t("Name Z-A")}</option><option value="oldest">{t("Oldest")}</option></select>
          </div>
          <p className="text-sm theme-muted">{t("Results")}: {teamsTotal}</p>
          <div className="grid gap-4 md:grid-cols-2">{loadingTeams ? Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-56 animate-pulse rounded-3xl bg-slate-900/40" />) : teams.map((team) => (
            <article key={team.id} className="group overflow-hidden rounded-3xl border border-slate-700/60 bg-gradient-to-br from-slate-950/80 via-slate-900/70 to-cyan-950/20 shadow-[0_16px_40px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-cyan-400/30">
              <div className="h-1 bg-gradient-to-r from-cyan-400 via-sky-400 to-emerald-400" />
              <div className="p-5">
                <div className="flex items-start gap-4">
                  <div className="flex h-18 w-18 shrink-0 items-center justify-center rounded-2xl border border-cyan-400/20 bg-slate-950/60 p-2 shadow-inner">
                    <img src={team.teamLogo || "https://placehold.co/88x88?text=Logo"} alt={team.teamName} className="h-full w-full rounded-xl object-contain" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="truncate text-xl font-bold text-slate-50">{team.teamName}</h3>
                        <p className="mt-1 text-sm text-slate-300">{team.sportType} · {team.ageCategory}</p>
                      </div>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${team.teamStatus === "Active" ? "bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-400/20" : "bg-rose-500/15 text-rose-300 ring-1 ring-rose-400/20"}`}>
                        {team.teamStatus === "Active" ? t("Active") : t("Suspended")}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-slate-400">{team.country}, {team.city}</p>
                    <p className="mt-1 text-sm text-slate-400">{t("Coach")}: <span className="font-semibold text-slate-200">{team.coachName}</span></p>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("Players")}</p>
                    <p className="mt-1 text-lg font-bold text-slate-50">{team.players?.length || 0}</p>
                  </div>
                  <div className="rounded-2xl border border-slate-700/50 bg-slate-950/40 p-3">
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{t("Created At")}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-100">{new Date(team.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <button className="rounded-xl border border-cyan-400/20 bg-cyan-500/10 px-3 py-2 text-sm font-semibold text-cyan-100 transition hover:bg-cyan-500/20" onClick={() => openTeamDetails(team.id)}>{t("Details")}</button>
                  <button className="rounded-xl border border-slate-600/70 bg-slate-950/30 px-3 py-2 text-sm font-semibold text-slate-100 transition hover:border-cyan-400/30 hover:bg-slate-900/60" onClick={() => openTeamEdit(team.id)}>{t("Edit")}</button>
                  <button className="rounded-xl border border-amber-400/20 bg-amber-500/10 px-3 py-2 text-sm font-semibold text-amber-100 transition hover:bg-amber-500/20" onClick={async () => { await setTeamStatus(team.id, team.teamStatus === "Active" ? "Suspended" : "Active"); loadTeams(); }}>{team.teamStatus === "Active" ? t("Suspend") : t("Activate")}</button>
                  <button className="rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-2 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/20" onClick={() => setTeamDeleteId(team.id)}><Trash2 size={14} className="inline" /> {t("Delete")}</button>
                </div>
              </div>
            </article>
          ))}</div>
          <div className="flex justify-between items-center"><button className="rounded-lg border px-3 py-1" disabled={teamQuery.page === 1} onClick={() => setTeamQuery((q) => ({ ...q, page: q.page - 1 }))}>{t("Previous")}</button><span className="text-sm">{teamQuery.page} / {teamPages}</span><button className="rounded-lg border px-3 py-1" disabled={teamQuery.page === teamPages} onClick={() => setTeamQuery((q) => ({ ...q, page: q.page + 1 }))}>{t("Next")}</button></div>
        </section>
      )}

      {tab === "details" && selectedTeam && (
        <section className="theme-surface rounded-2xl border p-4 space-y-4">
          <div className="flex items-center justify-between"><h2 className="text-xl font-semibold">{t("Team Details")}</h2><button className="rounded-lg border px-3 py-1" onClick={() => setTab("manage")}>{t("Back")}</button></div>
          <div className="flex gap-3 items-center"><div className="h-20 w-20 rounded-full border border-slate-600 bg-slate-900/50 p-1"><img src={selectedTeam.teamLogo || "https://placehold.co/96x96?text=Logo"} className="h-full w-full rounded-full object-contain" /></div><div><p className="font-bold">{selectedTeam.teamName}</p><p className="text-sm theme-muted">{selectedTeam.sportType} . {selectedTeam.ageCategory} . {selectedTeam.teamGender}</p></div></div>
          <DetailGrid title={t("Team Information")} rows={[[t("Country"), selectedTeam.country], [t("City"), selectedTeam.city], ["Club/Academy", selectedTeam.affiliatedClub || "-"], [t("Founded Year"), String(selectedTeam.foundedYear)]]} />
          <DetailGrid title={t("Contact Information")} rows={[[t("Coach Name"), selectedTeam.coachName], [t("Phone"), `${selectedTeam.phoneCountryCode} ${selectedTeam.phoneNumber}`], [t("Email"), selectedTeam.contactEmail]]} />
          <DetailGrid title={t("System Settings")} rows={[[t("Team Status"), selectedTeam.teamStatus === "Active" ? t("Active") : t("Suspended")], [t("Login Email"), selectedTeam.loginEmail], [t("Permissions"), selectedTeam.permissions.join(", ")], [t("Created At"), new Date(selectedTeam.createdAt).toLocaleString()], [t("Last Updated"), new Date(selectedTeam.updatedAt).toLocaleString()]]} />
          <DetailGrid title={t("Medical Staff")} rows={[[t("Name"), selectedTeam.medicalStaffName || "-"], [t("Email"), selectedTeam.medicalStaffEmail || "-"]]} />
          <h3 className="text-lg font-semibold">{t("Team Players")}</h3>
          <PlayerCards scope="details" />
        </section>
      )}

      {teamDeleteId && <ConfirmModal title={t("Delete Team?")} text={t("This action cannot be undone.")} onCancel={() => setTeamDeleteId("")} onConfirm={async () => { await deleteTeam(teamDeleteId); setTeamDeleteId(""); loadTeams(); }} />}
      {playerDeleteId && (activeTeam || selectedTeam) && <ConfirmModal title={t("Delete Player?")} text={t("This action cannot be undone.")} onCancel={() => setPlayerDeleteId("")} onConfirm={async () => {
        const teamId = activeTeam?.id || selectedTeam!.id;
        await deletePlayer(teamId, playerDeleteId);
        setPlayerDeleteId("");
        await loadPlayers(teamId);
        const fresh = await getTeamById(teamId);
        if (fresh) {
          if (activeTeam?.id === teamId) setActiveTeam(fresh);
          if (selectedTeam?.id === teamId) setSelectedTeam(fresh);
        }
      }} />}

      {playerDetails && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4" onClick={() => setPlayerDetails(null)}>
          <div className="theme-surface w-full max-w-xl rounded-2xl border p-4" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-lg font-semibold truncate">{t("Player Details")}</p>
                <p className="text-sm theme-muted truncate">{playerDetails.fullName}</p>
              </div>
              <button className="rounded-lg border px-3 py-1 text-sm" onClick={() => setPlayerDetails(null)}>{t("Close")}</button>
            </div>
            <div className="mt-4 flex gap-3 items-center">
              <div className="h-20 w-20 rounded-full border border-slate-600 bg-slate-900/50 p-1">
                <img src={playerDetails.photo || "https://placehold.co/96x96?text=P"} className="h-full w-full rounded-full object-contain" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold truncate">{playerDetails.shirtName || playerDetails.fullName}</p>
                <p className="text-sm theme-muted">#{playerDetails.jerseyNumber} • {playerDetails.position} • {playerDetails.age}y • {playerDetails.status}</p>
              </div>
            </div>

            <div className="mt-4 grid gap-2 md:grid-cols-2">
              <div className="theme-surface-soft rounded-lg border p-2">
                <p className="text-xs theme-muted">{t("Email")}</p>
                <p className="text-sm break-words">{playerDetails.email || "-"}</p>
              </div>
              <div className="theme-surface-soft rounded-lg border p-2">
                <p className="text-xs theme-muted">{t("Phone number")}</p>
                <p className="text-sm break-words">{playerDetails.phoneCountryCode} {playerDetails.phoneNumber}</p>
              </div>
              <div className="theme-surface-soft rounded-lg border p-2">
                <p className="text-xs theme-muted">{t("Nationality")}</p>
                <p className="text-sm">{playerDetails.nationality || "-"}</p>
              </div>
              <div className="theme-surface-soft rounded-lg border p-2">
                <p className="text-xs theme-muted">Date of Birth</p>
                <p className="text-sm">{playerDetails.dateOfBirth || "-"}</p>
              </div>
              <div className="theme-surface-soft rounded-lg border p-2">
                <p className="text-xs theme-muted">{t("Height (cm)")} / {t("Weight (kg)")}</p>
                <p className="text-sm">{playerDetails.heightCm}cm • {playerDetails.weightKg}kg</p>
              </div>
              <div className="theme-surface-soft rounded-lg border p-2">
                <p className="text-xs theme-muted">Join Date</p>
                <p className="text-sm">{playerDetails.joinDate || "-"}</p>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}

function DetailGrid({ title, rows }: { title: string; rows: Array<[string, string]> }) {
  return <section><h3 className="mb-2 font-semibold">{title}</h3><div className="grid md:grid-cols-2 gap-2">{rows.map(([k, v]) => <div key={k} className="theme-surface-soft rounded-lg border p-2"><p className="text-xs theme-muted">{k}</p><p className="text-sm">{v}</p></div>)}</div></section>;
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
  iconTone,
}: {
  icon: any;
  label: string;
  value: number | string;
  tone: string;
  iconTone: string;
}) {
  return (
    <div className={`relative overflow-hidden rounded-3xl border border-cyan-400/10 bg-gradient-to-br ${tone} p-5 shadow-[0_18px_40px_rgba(0,0,0,0.18)]`}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.14),transparent_42%)]" />
      <div className="relative z-10 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-300/80">{label}</p>
          <p className="mt-3 text-3xl font-black text-slate-50">{value}</p>
        </div>
        <div className={`rounded-2xl border border-white/10 bg-slate-950/40 p-3 ${iconTone}`}>
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function ConfirmModal({ title, text, onCancel, onConfirm }: { title: string; text: string; onCancel: () => void; onConfirm: () => void | Promise<void> }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
      <div className="theme-surface w-full max-w-sm rounded-xl border p-4">
        <p className="font-semibold">{title}</p>
        <p className="text-sm theme-muted mt-1">{text}</p>
        <div className="mt-3 flex justify-end gap-2">
          <button className="rounded-lg border px-3 py-1" onClick={onCancel}>{t("Cancel")}</button>
          <button className="rounded-lg bg-rose-500/30 px-3 py-1" onClick={onConfirm}>{t("Delete")}</button>
        </div>
      </div>
    </div>
  );
}

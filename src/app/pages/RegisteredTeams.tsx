import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router";
import { Edit3, Eye, Search, ShieldAlert, ShieldCheck, Trash2, Users } from "lucide-react";
import { SPORTS } from "../data/locations";
import { deleteTeam, getTeams, setTeamStatus } from "../data/teams";
import type { Team, TeamQuery } from "../types/team";

const PAGE_SIZE = 6;

export const RegisteredTeams = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState<TeamQuery>({
    search: "",
    sport: "",
    status: "",
    subscription: "",
    sortBy: "latest",
    page: 1,
    pageSize: PAGE_SIZE,
  });
  const [teams, setTeams] = useState<Team[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState("");

  const loadTeams = async () => {
    setLoading(true);
    const result = await getTeams(query);
    setTeams(result.teams);
    setTotal(result.total);
    setTotalPages(result.totalPages);
    setLoading(false);
  };

  useEffect(() => { loadTeams(); }, [query]);

  const teamCards = useMemo(() => {
    if (loading) {
      return Array.from({ length: 3 }).map((_, idx) => <div key={idx} className="h-48 animate-pulse rounded-2xl bg-slate-200/70" />);
    }

    return teams.map((team) => (
      <article key={team.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
        <div className="flex gap-4">
          <img src={team.teamLogo || "https://placehold.co/96x96?text=Logo"} alt={team.teamName} className="h-16 w-16 rounded-xl border object-cover" />
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-slate-900">{team.teamName}</h3>
            <p className="text-sm text-slate-600">{team.sportType} • {team.ageCategory}</p>
            <p className="text-sm text-slate-500">{team.country}, {team.city}</p>
            <p className="text-sm text-slate-500">Coach: {team.coachName}</p>
          </div>
          <span className={`self-start rounded-full px-2 py-1 text-xs font-semibold ${team.teamStatus === "Active" ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}`}>{team.teamStatus}</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span>Subscription: {team.subscriptionType}</span>
          <span>{new Date(team.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to={`/teams-management/${team.id}`} className="btn"> <Eye className="w-4 h-4" /> Details </Link>
          <button onClick={() => navigate(`/?edit=${team.id}`)} className="btn"> <Edit3 className="w-4 h-4" /> Edit </button>
          <button
            onClick={async () => {
              await setTeamStatus(team.id, team.teamStatus === "Active" ? "Suspended" : "Active");
              loadTeams();
            }}
            className="btn"
          >
            {team.teamStatus === "Active" ? <ShieldAlert className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />} {team.teamStatus === "Active" ? "Suspend" : "Activate"}
          </button>
          <button onClick={() => setDeletingId(team.id)} className="btn-danger"> <Trash2 className="w-4 h-4" /> Delete </button>
        </div>
      </article>
    ));
  }, [teams, loading]);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-2xl font-bold flex items-center gap-2"><Users className="text-teal-500" /> Teams Management</h1>
        <Link to="/" className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Register Team</Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          <label className="md:col-span-2 relative"><Search className="absolute left-3 top-3.5 w-4 h-4 text-slate-400" /><input value={query.search} onChange={(e) => setQuery((prev) => ({ ...prev, search: e.target.value, page: 1 }))} placeholder="Search teams..." className="input pl-9" /></label>
          <select className="input" value={query.sport} onChange={(e) => setQuery((prev) => ({ ...prev, sport: e.target.value, page: 1 }))}><option value="">All Sports</option>{SPORTS.map((sport) => <option key={sport}>{sport}</option>)}</select>
          <select className="input" value={query.status} onChange={(e) => setQuery((prev) => ({ ...prev, status: e.target.value, page: 1 }))}><option value="">All Status</option><option>Active</option><option>Suspended</option></select>
          <select className="input" value={query.subscription} onChange={(e) => setQuery((prev) => ({ ...prev, subscription: e.target.value, page: 1 }))}><option value="">All Subscriptions</option><option>Free</option><option>Standard</option><option>Premium</option></select>
          <select className="input" value={query.sortBy} onChange={(e) => setQuery((prev) => ({ ...prev, sortBy: e.target.value as TeamQuery["sortBy"] }))}><option value="latest">Latest</option><option value="oldest">Oldest</option><option value="name_asc">Name A-Z</option><option value="name_desc">Name Z-A</option></select>
        </div>
      </div>

      <p className="text-sm text-slate-500">{total} teams found</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">{teamCards}</div>

      <div className="flex items-center justify-between">
        <button disabled={query.page === 1} onClick={() => setQuery((prev) => ({ ...prev, page: prev.page - 1 }))} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Previous</button>
        <span className="text-sm text-slate-600">Page {query.page} / {totalPages}</span>
        <button disabled={query.page === totalPages} onClick={() => setQuery((prev) => ({ ...prev, page: prev.page + 1 }))} className="rounded-xl border px-4 py-2 text-sm font-semibold disabled:opacity-40">Next</button>
      </div>

      {deletingId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl">
            <h3 className="font-bold text-slate-900">Delete Team?</h3>
            <p className="mt-1 text-sm text-slate-600">This action cannot be undone.</p>
            <div className="mt-4 flex justify-end gap-2">
              <button onClick={() => setDeletingId("")} className="rounded-xl border px-4 py-2 text-sm font-semibold">Cancel</button>
              <button onClick={async () => { await deleteTeam(deletingId); setDeletingId(""); loadTeams(); }} className="rounded-xl bg-rose-600 px-4 py-2 text-sm font-semibold text-white">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

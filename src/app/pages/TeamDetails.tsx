import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ClipboardList } from "lucide-react";
import { getTeamById } from "../data/teams";
import type { Team } from "../types/team";

export const TeamDetails = () => {
  const { teamId = "" } = useParams();
  const [team, setTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTeamById(teamId).then((result) => {
      setTeam(result || null);
      setLoading(false);
    });
  }, [teamId]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-2xl bg-slate-200/70" />;
  }

  if (!team) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-bold">Team Details</h1>
        <p className="text-slate-600">Team not found.</p>
        <Link to="/teams-management" className="rounded-xl border px-4 py-2 text-sm font-semibold">Back</Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2"><ClipboardList className="text-teal-500" /> Team Details</h1>
        <Link to="/teams-management" className="rounded-xl border px-4 py-2 text-sm font-semibold">Back to Teams</Link>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <img src={team.teamLogo || "https://placehold.co/144x144?text=Logo"} alt={team.teamName} className="h-24 w-24 rounded-2xl border object-cover" />
          <div>
            <h2 className="text-xl font-bold text-slate-900">{team.teamName}</h2>
            <p className="text-sm text-slate-600">{team.sportType} • {team.ageCategory} • {team.teamGender}</p>
            <p className="text-sm text-slate-500">{team.country}, {team.city}</p>
          </div>
        </div>
      </div>

      <Section title="Team Information" items={[
        ["Sport", team.sportType],
        ["Age Category", team.ageCategory],
        ["Gender", team.teamGender],
        ["Country", team.country],
        ["City", team.city],
        ["Club/Academy", team.affiliatedClub || "-"],
        ["Founded Year", String(team.foundedYear)],
      ]} />

      <Section title="Contact Information" items={[
        ["Coach Name", team.coachName],
        ["Phone", `${team.phoneCountryCode} ${team.phoneNumber}`],
        ["Email", team.contactEmail],
      ]} />

      <Section title="System Settings" items={[
        ["Team Status", team.teamStatus],
        ["Subscription", team.subscriptionType],
        ["Permissions", team.permissions.join(", ")],
        ["Created At", new Date(team.createdAt).toLocaleString()],
        ["Last Updated", new Date(team.updatedAt).toLocaleString()],
      ]} />
    </div>
  );
};

const Section = ({ title, items }: { title: string; items: [string, string][] }) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <h3 className="text-base font-bold text-slate-900 mb-3">{title}</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
      {items.map(([label, value]) => (
        <div key={label} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
          <p className="text-slate-500">{label}</p>
          <p className="font-semibold text-slate-900">{value}</p>
        </div>
      ))}
    </div>
  </section>
);

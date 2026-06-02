import type { AuthSession } from "../auth/auth-context";

export type Athlete = {
  id: string;
  name: string;
  team_id: string;
  status: "Cleared" | "Monitoring" | "Injured";
};

const ATHLETES: Athlete[] = [
  { id: "ath-1", name: "Omar Al-Hassan", team_id: "TEAM-01", status: "Cleared" },
  { id: "ath-2", name: "Karim Nasser", team_id: "TEAM-01", status: "Monitoring" },
  { id: "ath-3", name: "Nour Haddad", team_id: "TEAM-02", status: "Injured" },
];

export const getVisibleAthletes = (session: AuthSession | null): Athlete[] => {
  if (!session) return [];
  if (session.role === "admin") return ATHLETES;

  // Dashboard data scope for Team Managers:
  // Managers must only see athletes that belong to their assigned team_id.
  return ATHLETES.filter((athlete) => athlete.team_id === session.teamId);
};

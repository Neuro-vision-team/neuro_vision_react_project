// ─── Raw team from backend ─────────────────────────────────────────────────────
export type TeamStatus = 'active' | 'suspended';
export type TeamGender = 'male' | 'female' | 'mixed';

export type TeamManagerRaw = {
  id: number;
  full_name: string;
  email: string;
  status: 'active' | 'suspended';
};

export type TeamRaw = {
  id: number;
  manager_user_id: number;
  team_name: string;
  sport_type: string;
  age_category: string;
  gender: TeamGender;
  country: string;
  city: string;
  club_academy: string | null;
  founded_year: number | null;
  team_logo: string | null;
  team_logo_url: string | null;
  coach_name: string;
  coach_phone: string;
  coach_email: string;
  status: TeamStatus;
  created_at: string;
  updated_at: string;
  players_count?: number;
  manager?: TeamManagerRaw;
  players?: unknown[];
};

// ─── Mapped team ──────────────────────────────────────────────────────────────
export type Team = {
  id: string;
  managerUserId: string;
  teamName: string;
  teamLogoUrl: string | null;     // always a URL or null — never base64 in mapped type
  sportType: string;
  ageCategory: string;
  gender: TeamGender;
  country: string;
  city: string;
  clubAcademy: string | null;
  foundedYear: number | null;
  coachName: string;
  coachPhone: string;
  coachEmail: string;
  status: TeamStatus;
  playersCount: number;
  createdAt: string;
  updatedAt: string;
  manager: TeamManager | null;
};

export type TeamManager = {
  id: string;
  fullName: string;
  email: string;
  status: 'active' | 'suspended';
};

// ─── Create / update payloads ─────────────────────────────────────────────────
export type CreateTeamPayload = {
  manager_user_id: number;
  team_name: string;
  sport_type: string;
  age_category: string;
  gender: TeamGender;
  country: string;
  city: string;
  club_academy?: string;
  founded_year?: number;
  coach_name: string;
  coach_phone: string;
  coach_email: string;
  status: TeamStatus;
  logo?: string;  // base64 data URI
};

export type UpdateTeamPayload = Partial<CreateTeamPayload>;

export type UpdateTeamStatusPayload = { status: TeamStatus };

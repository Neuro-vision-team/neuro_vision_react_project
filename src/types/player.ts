// ─── Raw player from backend ───────────────────────────────────────────────────
export type PlayerGender = 'male' | 'female';
export type PreferredSide = 'right' | 'left' | 'both';
export type PlayerStatus = 'active' | 'injured' | 'suspended';

export type PlayerRaw = {
  id: number;
  team_id: number;
  photo: string | null;
  photo_url: string | null;
  player_name: string;
  shirt_name: string | null;
  birthdate: string;             // ISO date string
  country: string;
  gender: PlayerGender;
  height: string | number;       // backend returns decimal as string
  weight: string | number;
  shirt_number: number;
  position: string;
  preferred_side: PreferredSide;
  join_year: number;
  status: PlayerStatus;
  email: string | null;
  phone: string | null;
  created_at: string;
  updated_at: string;
  team?: Record<string, unknown>;
};

// ─── Mapped player ────────────────────────────────────────────────────────────
export type Player = {
  id: string;
  teamId: string;
  photoUrl: string | null;
  fullName: string;
  shirtName: string | null;
  dateOfBirth: string;
  age: number;
  nationality: string;
  gender: PlayerGender;
  heightCm: number;
  weightKg: number;
  jerseyNumber: number;
  position: string;
  preferredSide: PreferredSide;
  joinYear: number;
  status: PlayerStatus;
  email: string | null;
  phone: string | null;
  createdAt: string;
  updatedAt: string;
};

// ─── Create / update payloads ─────────────────────────────────────────────────
export type CreatePlayerPayload = {
  photo?: string;              // base64 data URI — optional
  full_name: string;
  shirt_name?: string;
  date_of_birth: string;       // YYYY-MM-DD
  nationality: string;
  gender: PlayerGender;
  height_cm: number;
  weight_kg: number;
  jersey_number: number;
  preferred_side: PreferredSide;
  join_date: string;           // YYYY-MM-DD (backend converts to join_year)
  phone_country_code?: string;
  phone_number?: string;
  email?: string;
  guardian_name?: string;
  status: PlayerStatus;
  position: string;
};

export type UpdatePlayerPayload = Partial<CreatePlayerPayload>;

// ─── Query params ─────────────────────────────────────────────────────────────
export type PlayersParams = {
  page?: number;
  search?: string;
  status?: PlayerStatus | '';
  team_id?: string;
};

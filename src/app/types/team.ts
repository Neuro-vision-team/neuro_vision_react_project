export type TeamStatus = "Active" | "Suspended";
export type TeamGender = "Men" | "Women" | "Mixed";
export type PlayerGender = "Male" | "Female";
export type PreferredSide = "Right" | "Left" | "Both";
export type PlayerStatus = "Active" | "Injured" | "Suspended";

export interface Player {
  id: string;
  teamId: string;
  photo: string;
  fullName: string;
  shirtName: string;
  dateOfBirth: string;
  age: number;
  nationality: string;
  gender: PlayerGender;
  heightCm: number;
  weightKg: number;
  jerseyNumber: number;
  preferredSide: PreferredSide;
  joinDate: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email?: string;
  guardianName?: string;
  status: PlayerStatus;
  position: string;
  createdAt: string;
  updatedAt: string;
}

export interface Team {
  id: string;
  teamName: string;
  teamLogo: string;
  sportType: string;
  ageCategory: string;
  teamGender: TeamGender;
  country: string;
  city: string;
  affiliatedClub?: string;
  foundedYear: number;
  coachName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  contactEmail: string;
  medicalStaffName: string;
  medicalStaffEmail: string;
  medicalStaffPassword: string;
  loginEmail: string;
  password: string;
  teamStatus: TeamStatus;
  subscriptionType: "Free" | "Standard" | "Premium";
  permissions: string[];
  players: Player[];
  createdAt: string;
  updatedAt: string;
}

export interface TeamFormInput {
  teamName: string;
  teamLogo: string;
  sportType: string;
  ageCategory: string;
  teamGender: TeamGender;
  country: string;
  city: string;
  affiliatedClub?: string;
  foundedYear: number;
  coachName: string;
  phoneCountryCode: string;
  phoneNumber: string;
  contactEmail: string;
  medicalStaffName: string;
  medicalStaffEmail: string;
  medicalStaffPassword: string;
  loginEmail: string;
  password: string;
  teamStatus: TeamStatus;
  subscriptionType: "Free" | "Standard" | "Premium";
  permissions: string[];
}

export interface TeamQuery {
  search: string;
  sport: string;
  status: string;
  subscription: string;
  sortBy: "latest" | "oldest" | "name_asc" | "name_desc";
  page: number;
  pageSize: number;
}

export interface TeamQueryResult {
  teams: Team[];
  total: number;
  totalPages: number;
}

export interface PlayerFormInput {
  photo: string;
  fullName: string;
  shirtName: string;
  dateOfBirth: string;
  nationality: string;
  gender: PlayerGender;
  heightCm: number;
  weightKg: number;
  jerseyNumber: number;
  preferredSide: PreferredSide;
  joinDate: string;
  phoneCountryCode: string;
  phoneNumber: string;
  email?: string;
  guardianName?: string;
  status: PlayerStatus;
  position: string;
}

export interface PlayerQuery {
  search: string;
  status: string;
  sortBy: "name_asc" | "name_desc" | "oldest" | "youngest";
  page: number;
  pageSize: number;
}

export interface PlayerQueryResult {
  players: Player[];
  total: number;
  totalPages: number;
}

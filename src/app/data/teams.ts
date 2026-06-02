import type {
  Player,
  PlayerFormInput,
  PlayerQuery,
  PlayerQueryResult,
  Team,
  TeamFormInput,
  TeamQuery,
  TeamQueryResult,
  TeamStatus,
} from "../types/team";

const STORAGE_KEY = "registered_teams_v2";

const wait = (ms = 450) => new Promise((resolve) => setTimeout(resolve, ms));

const readTeams = (): Team[] => {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as Team[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeTeams = (teams: Team[]) => {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(teams));
};

const normalize = (value: string) => value.trim().toLowerCase();

const buildTeam = (input: TeamFormInput): Team => {
  const now = new Date().toISOString();
  return {
    id: `team-${Date.now()}`,
    ...input,
    teamName: input.teamName.trim(),
    affiliatedClub: input.affiliatedClub?.trim() || "",
    coachName: input.coachName.trim(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    medicalStaffName: input.medicalStaffName.trim(),
    medicalStaffEmail: input.medicalStaffEmail.trim().toLowerCase(),
    medicalStaffPassword: input.medicalStaffPassword,
    loginEmail: input.loginEmail.trim().toLowerCase(),
    phoneNumber: input.phoneNumber.trim(),
    players: [],
    createdAt: now,
    updatedAt: now,
  };
};

const sortTeams = (teams: Team[], sortBy: TeamQuery["sortBy"]) => {
  const sorted = [...teams];
  sorted.sort((a, b) => {
    if (sortBy === "oldest") return +new Date(a.createdAt) - +new Date(b.createdAt);
    if (sortBy === "name_asc") return a.teamName.localeCompare(b.teamName);
    if (sortBy === "name_desc") return b.teamName.localeCompare(a.teamName);
    return +new Date(b.createdAt) - +new Date(a.createdAt);
  });
  return sorted;
};

export const isLoginEmailUnique = (email: string, excludeId?: string) => {
  const normalized = normalize(email);
  return !readTeams().some((team) => normalize(team.loginEmail) === normalized && team.id !== excludeId);
};

export const createTeam = async (input: TeamFormInput) => {
  await wait();
  if (!isLoginEmailUnique(input.loginEmail)) {
    throw new Error("Login email already exists.");
  }

  const teams = readTeams();
  const newTeam = buildTeam(input);
  writeTeams([newTeam, ...teams]);
  return newTeam;
};

export const updateTeam = async (teamId: string, input: TeamFormInput) => {
  await wait();
  if (!isLoginEmailUnique(input.loginEmail, teamId)) {
    throw new Error("Login email already exists.");
  }

  const teams = readTeams();
  const idx = teams.findIndex((team) => team.id === teamId);
  if (idx < 0) throw new Error("Team not found.");

  const updated: Team = {
    ...teams[idx],
    ...input,
    players: teams[idx].players ?? [],
    loginEmail: input.loginEmail.trim().toLowerCase(),
    contactEmail: input.contactEmail.trim().toLowerCase(),
    medicalStaffName: input.medicalStaffName.trim(),
    medicalStaffEmail: input.medicalStaffEmail.trim().toLowerCase(),
    medicalStaffPassword: input.medicalStaffPassword,
    updatedAt: new Date().toISOString(),
  };

  const next = [...teams];
  next[idx] = updated;
  writeTeams(next);
  return updated;
};

export const getTeams = async (query: TeamQuery): Promise<TeamQueryResult> => {
  await wait(300);
  const teams = readTeams();
  const search = normalize(query.search);

  let filtered = teams.filter((team) => {
    const matchesSearch =
      !search ||
      normalize(team.teamName).includes(search) ||
      normalize(team.coachName).includes(search) ||
      normalize(team.country).includes(search) ||
      normalize(team.city).includes(search);

    const matchesSport = !query.sport || team.sportType === query.sport;
    const matchesStatus = !query.status || team.teamStatus === query.status;
    const matchesSub = !query.subscription || team.subscriptionType === query.subscription;

    return matchesSearch && matchesSport && matchesStatus && matchesSub;
  });

  filtered = sortTeams(filtered, query.sortBy);
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const safePage = Math.min(query.page, totalPages);
  const start = (safePage - 1) * query.pageSize;

  return {
    teams: filtered.slice(start, start + query.pageSize),
    total,
    totalPages,
  };
};

export const getTeamById = async (teamId: string) => {
  await wait(250);
  return readTeams().find((team) => team.id === teamId);
};

export const deleteTeam = async (teamId: string) => {
  await wait(250);
  const teams = readTeams();
  writeTeams(teams.filter((team) => team.id !== teamId));
};

export const setTeamStatus = async (teamId: string, status: TeamStatus) => {
  await wait(200);
  const teams = readTeams();
  const idx = teams.findIndex((team) => team.id === teamId);
  if (idx < 0) throw new Error("Team not found.");

  const next = [...teams];
  next[idx] = { ...next[idx], teamStatus: status, updatedAt: new Date().toISOString() };
  writeTeams(next);
  return next[idx];
};

const calcAge = (dateOfBirth: string) => {
  const dob = new Date(dateOfBirth);
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) age--;
  return age;
};

export const isJerseyNumberUniqueInTeam = (teamId: string, jerseyNumber: number, excludePlayerId?: string) => {
  const team = readTeams().find((t) => t.id === teamId);
  if (!team) return false;
  return !(team.players ?? []).some((player) => player.jerseyNumber === jerseyNumber && player.id !== excludePlayerId);
};

export const createPlayer = async (teamId: string, input: PlayerFormInput): Promise<Player> => {
  await wait(350);
  const teams = readTeams();
  const idx = teams.findIndex((team) => team.id === teamId);
  if (idx < 0) throw new Error("Cannot create player without team.");
  if (!isJerseyNumberUniqueInTeam(teamId, input.jerseyNumber)) throw new Error("Jersey number already exists in this team.");

  const now = new Date().toISOString();
  const player: Player = {
    id: `player-${Date.now()}`,
    teamId,
    ...input,
    age: calcAge(input.dateOfBirth),
    createdAt: now,
    updatedAt: now,
  };

  const next = [...teams];
  next[idx] = {
    ...next[idx],
    players: [player, ...(next[idx].players ?? [])],
    updatedAt: now,
  };
  writeTeams(next);
  return player;
};

export const updatePlayer = async (teamId: string, playerId: string, input: PlayerFormInput): Promise<Player> => {
  await wait(300);
  const teams = readTeams();
  const teamIndex = teams.findIndex((team) => team.id === teamId);
  if (teamIndex < 0) throw new Error("Team not found.");

  const players = teams[teamIndex].players ?? [];
  const playerIndex = players.findIndex((player) => player.id === playerId);
  if (playerIndex < 0) throw new Error("Player not found.");
  if (!isJerseyNumberUniqueInTeam(teamId, input.jerseyNumber, playerId)) throw new Error("Jersey number already exists in this team.");

  const updatedPlayer: Player = {
    ...players[playerIndex],
    ...input,
    age: calcAge(input.dateOfBirth),
    updatedAt: new Date().toISOString(),
  };

  const updatedPlayers = [...players];
  updatedPlayers[playerIndex] = updatedPlayer;

  const nextTeams = [...teams];
  nextTeams[teamIndex] = { ...nextTeams[teamIndex], players: updatedPlayers, updatedAt: new Date().toISOString() };
  writeTeams(nextTeams);
  return updatedPlayer;
};

export const deletePlayer = async (teamId: string, playerId: string) => {
  await wait(250);
  const teams = readTeams();
  const teamIndex = teams.findIndex((team) => team.id === teamId);
  if (teamIndex < 0) throw new Error("Team not found.");
  const nextTeams = [...teams];
  nextTeams[teamIndex] = {
    ...nextTeams[teamIndex],
    players: (nextTeams[teamIndex].players ?? []).filter((player) => player.id !== playerId),
    updatedAt: new Date().toISOString(),
  };
  writeTeams(nextTeams);
};

export const getPlayersByTeam = async (teamId: string, query: PlayerQuery): Promise<PlayerQueryResult> => {
  await wait(250);
  const team = readTeams().find((t) => t.id === teamId);
  if (!team) return { players: [], total: 0, totalPages: 1 };
  const search = normalize(query.search);
  const filtered = (team.players ?? []).filter((player) => {
    const bySearch =
      !search ||
      normalize(player.fullName).includes(search) ||
      String(player.jerseyNumber).includes(search);
    const byStatus = !query.status || player.status === query.status;
    return bySearch && byStatus;
  });
  const sorted = [...filtered].sort((a, b) => {
    if (query.sortBy === "name_desc") return b.fullName.localeCompare(a.fullName);
    if (query.sortBy === "oldest") return +new Date(a.dateOfBirth) - +new Date(b.dateOfBirth);
    if (query.sortBy === "youngest") return +new Date(b.dateOfBirth) - +new Date(a.dateOfBirth);
    return a.fullName.localeCompare(b.fullName);
  });
  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const safePage = Math.min(query.page, totalPages);
  const start = (safePage - 1) * query.pageSize;
  return { players: sorted.slice(start, start + query.pageSize), total, totalPages };
};

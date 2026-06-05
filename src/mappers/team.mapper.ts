import type { TeamRaw, Team, TeamManager } from '../types/team';
import type { PaginatedRaw, PaginatedResult } from '../types/api';

function mapTeamManager(raw: NonNullable<TeamRaw['manager']>): TeamManager {
  return {
    id:       String(raw.id),
    fullName: raw.full_name,
    email:    raw.email,
    status:   raw.status,
  };
}

export function mapTeam(raw: TeamRaw): Team {
  return {
    id:            String(raw.id),
    managerUserId: String(raw.manager_user_id),
    teamName:      raw.team_name,
    teamLogoUrl:   raw.team_logo_url ?? raw.team_logo ?? null,
    sportType:     raw.sport_type,
    ageCategory:   raw.age_category,
    gender:        raw.gender,
    country:       raw.country,
    city:          raw.city,
    clubAcademy:   raw.club_academy,
    foundedYear:   raw.founded_year,
    coachName:     raw.coach_name,
    coachPhone:    raw.coach_phone,
    coachEmail:    raw.coach_email,
    status:        raw.status,
    playersCount:  raw.players_count ?? (Array.isArray(raw.players) ? raw.players.length : 0),
    createdAt:     raw.created_at,
    updatedAt:     raw.updated_at,
    manager:       raw.manager ? mapTeamManager(raw.manager) : null,
  };
}

export function mapPaginatedTeams(raw: PaginatedRaw<TeamRaw>): PaginatedResult<Team> {
  return {
    items:       raw.data.map(mapTeam),
    currentPage: raw.current_page,
    lastPage:    raw.last_page,
    perPage:     raw.per_page,
    total:       raw.total,
  };
}

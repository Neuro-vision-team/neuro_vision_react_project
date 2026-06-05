import type { PlayerRaw, Player } from '../types/player';
import type { PaginatedRaw, PaginatedResult } from '../types/api';

function calcAge(birthdate: string): number {
  if (!birthdate) return 0;
  const birth = new Date(birthdate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) age--;
  return Math.max(0, age);
}

export function mapPlayer(raw: PlayerRaw): Player {
  return {
    id:            String(raw.id),
    teamId:        String(raw.team_id),
    // Prefer photo_url (full URL), fall back to photo field
    photoUrl:      raw.photo_url ?? null,
    fullName:      raw.player_name,
    shirtName:     raw.shirt_name,
    dateOfBirth:   raw.birthdate,
    age:           calcAge(raw.birthdate),
    nationality:   raw.country,
    gender:        raw.gender,
    heightCm:      typeof raw.height === 'string' ? parseFloat(raw.height) : raw.height,
    weightKg:      typeof raw.weight === 'string' ? parseFloat(raw.weight) : raw.weight,
    jerseyNumber:  raw.shirt_number,
    position:      raw.position,
    preferredSide: raw.preferred_side,
    joinYear:      raw.join_year,
    status:        raw.status,
    email:         raw.email,
    phone:         raw.phone,
    createdAt:     raw.created_at,
    updatedAt:     raw.updated_at,
  };
}

export function mapPaginatedPlayers(raw: PaginatedRaw<PlayerRaw>): PaginatedResult<Player> {
  return {
    items:       raw.data.map(mapPlayer),
    currentPage: raw.current_page,
    lastPage:    raw.last_page,
    perPage:     raw.per_page,
    total:       raw.total,
  };
}

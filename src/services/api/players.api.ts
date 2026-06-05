import { apiGet } from './client';
import type { PaginatedRaw } from '../../types/api';
import type { PlayerRaw, PlayersParams } from '../../types/player';
import type { AssessmentRaw } from '../../types/assessment';

export function getPlayers(params: PlayersParams = {}): Promise<PaginatedRaw<PlayerRaw>> {
  const query = new URLSearchParams();
  if (params.page)    query.set('page', String(params.page));
  if (params.search)  query.set('search', params.search);
  if (params.status)  query.set('status', params.status);
  if (params.team_id) query.set('team_id', params.team_id);
  const qs = query.toString();
  return apiGet<PaginatedRaw<PlayerRaw>>(`/players${qs ? `?${qs}` : ''}`);
}

export function getPlayer(id: string): Promise<PlayerRaw> {
  return apiGet<PlayerRaw>(`/players/${id}`);
}

// Returns array — not paginated on this endpoint
export function getPlayerHistory(id: string): Promise<AssessmentRaw[]> {
  return apiGet<AssessmentRaw[]>(`/players/${id}/history`);
}

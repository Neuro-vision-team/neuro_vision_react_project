import { useQuery } from '@tanstack/react-query';
import { getPlayers, getPlayer, getPlayerHistory } from '../../services/api/players.api';
import {
  getManagerPlayers,
  getManagerPlayer,
} from '../../services/api/manager.api';
import { mapPlayer, mapPaginatedPlayers } from '../../mappers/player.mapper';
import { mapAssessment } from '../../mappers/assessment.mapper';
import { getStoredSessionUser } from '../../services/api/auth-session';
import { QUERY_KEYS } from '../queryKeys';
import type { PlayersParams } from '../../types/player';

/** Role-aware: Admin uses /players, Manager uses /manager/players */
export function usePlayers(params: PlayersParams = {}) {
  const user = getStoredSessionUser();
  const isAdmin = user?.role === 'Admin';

  return useQuery({
    queryKey: isAdmin
      ? QUERY_KEYS.players(params)
      : QUERY_KEYS.managerPlayers(params),
    queryFn: () =>
      isAdmin
        ? getPlayers(params).then(mapPaginatedPlayers)
        : getManagerPlayers(params).then(mapPaginatedPlayers),
  });
}

/** Role-aware: Admin uses /players/:id, Manager uses /manager/players/:id */
export function usePlayer(id: string) {
  const user    = getStoredSessionUser();
  const isAdmin = user?.role === 'Admin';

  return useQuery({
    queryKey: isAdmin ? QUERY_KEYS.player(id) : QUERY_KEYS.managerPlayer(id),
    queryFn:  () =>
      isAdmin
        ? getPlayer(id).then(mapPlayer)
        : getManagerPlayer(id).then(mapPlayer),
    enabled: !!id,
  });
}

/** Player assessment history — Admin only endpoint */
export function usePlayerHistory(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.playerHistory(id),
    queryFn:  () => getPlayerHistory(id).then((list) => list.map(mapAssessment)),
    enabled:  !!id,
  });
}

import { useQuery } from '@tanstack/react-query';
import { getAdminTeams, getAdminTeam, type TeamsParams } from '../../services/api/admin.api';
import { mapTeam, mapPaginatedTeams } from '../../mappers/team.mapper';
import { QUERY_KEYS } from '../queryKeys';

export function useTeams(params: TeamsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminTeams(params),
    queryFn:  () => getAdminTeams(params).then(mapPaginatedTeams),
  });
}

export function useTeam(id: string) {
  return useQuery({
    queryKey: QUERY_KEYS.adminTeam(id),
    queryFn:  () => getAdminTeam(id).then(mapTeam),
    enabled:  !!id,
  });
}

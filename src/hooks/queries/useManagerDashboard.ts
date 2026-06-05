import { useQuery } from '@tanstack/react-query';
import { getManagerDashboard, getManagerTeam } from '../../services/api/manager.api';
import { mapManagerDashboard } from '../../mappers/dashboard.mapper';
import { mapTeam } from '../../mappers/team.mapper';
import { QUERY_KEYS } from '../queryKeys';

export function useManagerDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.managerDashboard(),
    queryFn:  () => getManagerDashboard().then(mapManagerDashboard),
    staleTime: 60_000,
  });
}

export function useManagerTeam() {
  return useQuery({
    queryKey: QUERY_KEYS.managerTeam(),
    queryFn:  () => getManagerTeam().then(mapTeam),
    staleTime: 120_000,
  });
}

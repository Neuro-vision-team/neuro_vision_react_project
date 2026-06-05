import { useQuery } from '@tanstack/react-query';
import { getAdminDashboard } from '../../services/api/admin.api';
import { mapAdminDashboard } from '../../mappers/dashboard.mapper';
import { QUERY_KEYS } from '../queryKeys';

export function useAdminDashboard() {
  return useQuery({
    queryKey: QUERY_KEYS.adminDashboard(),
    queryFn:  () => getAdminDashboard().then(mapAdminDashboard),
    staleTime: 60_000,
  });
}

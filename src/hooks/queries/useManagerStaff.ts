import { useQuery } from '@tanstack/react-query';
import { getManagerStaff } from '../../services/api/manager.api';
import { mapStaff } from '../../types/staff';
import { QUERY_KEYS } from '../queryKeys';

export function useManagerStaff() {
  return useQuery({
    queryKey: QUERY_KEYS.managerStaff(),
    queryFn:  () => getManagerStaff().then((page) => page.data.map(mapStaff)),
  });
}

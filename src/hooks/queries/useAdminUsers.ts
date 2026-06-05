import { useQuery } from '@tanstack/react-query';
import { getAdminUsers } from '../../services/api/admin.api';
import { QUERY_KEYS } from '../queryKeys';
import type { AdminUserRaw } from '../../services/api/admin.api';
import type { PaginatedRaw } from '../../types/api';

function mapUser(raw: AdminUserRaw) {
  return {
    id:        String(raw.id),
    fullName:  raw.full_name,
    email:     raw.email,
    status:    raw.status,
    roleName:  raw.role?.name ?? '',
    hasTeam:   raw.team != null,
    createdAt: raw.created_at,
  };
}

export type AdminUser = ReturnType<typeof mapUser>;

export function useAdminUsers(params: { page?: number } = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.adminUsers(params),
    queryFn:  async () => {
      const raw: PaginatedRaw<AdminUserRaw> = await getAdminUsers(params);
      return {
        items:       raw.data.map(mapUser),
        currentPage: raw.current_page,
        lastPage:    raw.last_page,
        total:       raw.total,
      };
    },
  });
}

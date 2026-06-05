import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createAdminTeam,
  updateAdminTeam,
  updateAdminTeamStatus,
  createAdminManager,
  updateAdminUserStatus,
  type CreateManagerPayload,
} from '../../services/api/admin.api';
import type { CreateTeamPayload, UpdateTeamPayload, TeamStatus } from '../../types/team';
import { QUERY_KEYS } from '../queryKeys';

export function useCreateTeam() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTeamPayload) => createAdminTeam(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-teams'] }),
  });
}

export function useUpdateTeam(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateTeamPayload) => updateAdminTeam(id, payload),
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: ['admin-teams'] });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.adminTeam(id) });
    },
  });
}

export function useUpdateTeamStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (status: TeamStatus) => updateAdminTeamStatus(id, status),
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: ['admin-teams'] });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.adminTeam(id) });
    },
  });
}

export function useCreateManager() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateManagerPayload) => createAdminManager(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      updateAdminUserStatus(id, status),
    onSuccess: () => {
      void qc.invalidateQueries({ queryKey: ['admin-users'] });
      void qc.invalidateQueries({ queryKey: ['admin-teams'] });
    },
  });
}

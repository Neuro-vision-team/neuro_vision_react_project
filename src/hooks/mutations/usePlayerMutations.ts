import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createManagerPlayer,
  updateManagerPlayer,
  deleteManagerPlayer,
} from '../../services/api/manager.api';
import type { CreatePlayerPayload, UpdatePlayerPayload } from '../../types/player';
import { QUERY_KEYS } from '../queryKeys';

export function useCreatePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePlayerPayload) => createManagerPlayer(payload),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['manager-players'] }),
  });
}

export function useUpdatePlayer(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdatePlayerPayload) => updateManagerPlayer(id, payload),
    onSuccess:  () => {
      void qc.invalidateQueries({ queryKey: ['manager-players'] });
      void qc.invalidateQueries({ queryKey: QUERY_KEYS.managerPlayer(id) });
    },
  });
}

export function useDeletePlayer() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteManagerPlayer(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['manager-players'] }),
  });
}

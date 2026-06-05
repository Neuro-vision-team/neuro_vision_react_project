import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  createManagerStaff,
  updateManagerStaff,
  updateManagerStaffStatus,
  deleteManagerStaff,
} from '../../services/api/manager.api';
import { mapStaff } from '../../types/staff';
import type { CreateStaffPayload, UpdateStaffPayload } from '../../types/staff';
import { QUERY_KEYS } from '../queryKeys';

const STAFF_KEY = QUERY_KEYS.managerStaff();

export function useCreateStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateStaffPayload) =>
      createManagerStaff(payload).then(mapStaff),
    onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export function useUpdateStaff(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateStaffPayload) =>
      updateManagerStaff(id, payload).then(mapStaff),
    onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export function useToggleStaffStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'active' | 'suspended' }) =>
      updateManagerStaffStatus(id, { status }).then(mapStaff),
    onSuccess: () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

export function useDeleteStaff() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteManagerStaff(id),
    onSuccess:  () => qc.invalidateQueries({ queryKey: STAFF_KEY }),
  });
}

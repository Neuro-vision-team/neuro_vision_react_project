import { useQuery } from '@tanstack/react-query';
import { getAdminAuditLogs } from '../../services/api/admin.api';
import { mapPaginatedAuditLogs } from '../../mappers/auditLog.mapper';
import { QUERY_KEYS } from '../queryKeys';
import type { AuditLogsParams } from '../../types/auditLog';

export function useAuditLogs(params: AuditLogsParams = {}) {
  return useQuery({
    queryKey: QUERY_KEYS.auditLogs(params),
    queryFn:  () => getAdminAuditLogs(params).then(mapPaginatedAuditLogs),
  });
}

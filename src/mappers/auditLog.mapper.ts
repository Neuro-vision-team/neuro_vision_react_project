import type { AuditLogRaw, AuditLog } from '../types/auditLog';
import type { PaginatedRaw, PaginatedResult } from '../types/api';

export function mapAuditLog(raw: AuditLogRaw): AuditLog {
  return {
    id:          String(raw.id),
    userId:      String(raw.user_id),
    actionType:  raw.action_type,
    description: raw.description,
    recordedAt:  raw.recorded_at,
    userName:    raw.user.full_name,
    userEmail:   raw.user.email,
  };
}

export function mapPaginatedAuditLogs(
  raw: PaginatedRaw<AuditLogRaw>,
): PaginatedResult<AuditLog> {
  return {
    items:       raw.data.map(mapAuditLog),
    currentPage: raw.current_page,
    lastPage:    raw.last_page,
    perPage:     raw.per_page,
    total:       raw.total,
  };
}

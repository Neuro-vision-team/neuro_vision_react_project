import type { TeamsParams } from '../services/api/admin.api';
import type { PlayersParams } from '../types/player';
import type { AssessmentsParams } from '../types/assessment';
import type { AuditLogsParams } from '../types/auditLog';

/**
 * Centralized React Query key registry.
 * Using functions ensures proper cache invalidation by shape.
 */
export const QUERY_KEYS = {
  // Admin
  adminDashboard:   ()                       => ['admin-dashboard']                as const,
  adminTeams:       (p: TeamsParams)         => ['admin-teams', p]                 as const,
  adminTeam:        (id: string)             => ['admin-team', id]                 as const,
  adminUsers:       (p: { page?: number })   => ['admin-users', p]                 as const,
  auditLogs:        (p: AuditLogsParams)     => ['audit-logs', p]                  as const,

  // Manager
  managerDashboard: ()                       => ['manager-dashboard']              as const,
  managerTeam:      ()                       => ['manager-team']                   as const,
  managerPlayers:   (p: PlayersParams)       => ['manager-players', p]             as const,
  managerPlayer:    (id: string)             => ['manager-player', id]             as const,
  managerAssessments: (p: AssessmentsParams) => ['manager-assessments', p]         as const,
  managerStaff:     ()                       => ['manager-staff']                  as const,

  // Players (admin scope)
  players:          (p: PlayersParams)       => ['players', p]                     as const,
  player:           (id: string)             => ['player', id]                     as const,
  playerHistory:    (id: string)             => ['player-history', id]             as const,

  // Assessments
  assessments:      (p: AssessmentsParams)   => ['assessments', p]                 as const,
  assessment:       (id: string)             => ['assessment', id]                 as const,
  assessmentReport: (id: string)             => ['assessment-report', id]          as const,
  assessmentPlr:    (id: string)             => ['assessment-plr', id]             as const,
  assessmentScatOn: (id: string)             => ['assessment-scat-on', id]         as const,
  assessmentScatOff:(id: string)             => ['assessment-scat-off', id]        as const,
  compareAssessments:(ids: [string, string]) => ['compare-assessments', ...ids]    as const,
} as const;

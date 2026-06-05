import type { Assessment } from '../types/assessment';
import type { Player } from '../types/player';
import type { ActivityItem } from '../components/dashboard/ActivityFeed';

/**
 * Composes a unified, chronological team activity feed from
 * assessment and player data sources (no dedicated backend endpoint).
 */
export function buildTeamActivity(
  assessments: Assessment[],
  players: Player[],
  limit = 12,
): ActivityItem[] {
  const items: ActivityItem[] = [];

  for (const a of assessments) {
    // High risk flagged takes priority
    if (a.finalRiskLevel === 'high') {
      items.push({
        id:          `risk-${a.id}`,
        type:        'high_risk_flagged',
        description: `High risk flagged for ${a.playerName ?? 'a player'}`,
        playerName:  a.playerName,
        riskLevel:   'high',
        timestamp:   a.completedAt ?? a.updatedAt,
        assessmentId: a.id,
      });
      continue;
    }

    if (a.assessmentStatus === 'completed') {
      items.push({
        id:          `assess-${a.id}`,
        type:        'assessment_completed',
        description: `Assessment completed for ${a.playerName ?? 'a player'}`,
        playerName:  a.playerName,
        riskLevel:   a.finalRiskLevel,
        timestamp:   a.completedAt ?? a.updatedAt,
        assessmentId: a.id,
      });
    } else if (a.assessmentStatus === 'in_progress') {
      items.push({
        id:          `assess-${a.id}`,
        type:        'assessment_in_progress',
        description: `Assessment in progress for ${a.playerName ?? 'a player'}`,
        playerName:  a.playerName,
        timestamp:   a.startedAt ?? a.updatedAt,
        assessmentId: a.id,
      });
    } else if (a.assessmentStatus === 'cancelled') {
      items.push({
        id:          `assess-${a.id}`,
        type:        'assessment_cancelled',
        description: `Assessment cancelled for ${a.playerName ?? 'a player'}`,
        playerName:  a.playerName,
        timestamp:   a.updatedAt,
        assessmentId: a.id,
      });
    }
  }

  for (const p of players) {
    items.push({
      id:          `player-${p.id}`,
      type:        'player_added',
      description: `${p.fullName} added to team`,
      playerName:  p.fullName,
      timestamp:   p.createdAt,
    });
  }

  // Sort by timestamp descending, take the most recent
  return items
    .filter((i) => i.timestamp)
    .sort((a, b) => +new Date(b.timestamp) - +new Date(a.timestamp))
    .slice(0, limit);
}

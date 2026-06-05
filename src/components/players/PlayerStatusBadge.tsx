import { Badge } from '../ui/Badge';
import type { PlayerStatus } from '../../types/player';

const VARIANT_MAP: Record<PlayerStatus, 'success' | 'warning' | 'neutral'> = {
  active:    'success',
  injured:   'warning',
  suspended: 'neutral',
};

const LABEL_MAP: Record<PlayerStatus, string> = {
  active:    'Active',
  injured:   'Injured',
  suspended: 'Suspended',
};

export function PlayerStatusBadge({ status }: { status: PlayerStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{LABEL_MAP[status]}</Badge>;
}

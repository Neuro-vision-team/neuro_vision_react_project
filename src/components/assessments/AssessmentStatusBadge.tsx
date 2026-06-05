import { Badge } from '../ui/Badge';
import type { AssessmentStatus } from '../../types/assessment';

const VARIANT_MAP: Record<AssessmentStatus, 'info' | 'success' | 'neutral'> = {
  in_progress: 'info',
  completed:   'success',
  cancelled:   'neutral',
};

const LABEL_MAP: Record<AssessmentStatus, string> = {
  in_progress: 'In Progress',
  completed:   'Completed',
  cancelled:   'Cancelled',
};

export function AssessmentStatusBadge({ status }: { status: AssessmentStatus }) {
  return <Badge variant={VARIANT_MAP[status]}>{LABEL_MAP[status]}</Badge>;
}

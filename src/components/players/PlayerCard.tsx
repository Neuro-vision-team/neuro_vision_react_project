import { Link } from 'react-router-dom';
import { Avatar } from '../ui/Avatar';
import { PlayerStatusBadge } from './PlayerStatusBadge';
import { RiskBadge } from '../dashboard/RiskBadge';
import { Card } from '../ui/Card';
import type { Player } from '../../types/player';
import type { RiskLevel } from '../../types/assessment';

interface PlayerCardProps {
  player: Player;
  lastRiskLevel?: RiskLevel | null;
  actions?: React.ReactNode;
}

export function PlayerCard({ player, lastRiskLevel, actions }: PlayerCardProps) {
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <Avatar src={player.photoUrl} name={player.fullName} size="lg" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-slate-100">{player.fullName}</p>
          <p className="text-xs text-slate-500">
            #{player.jerseyNumber} · {player.position}
          </p>
          <p className="text-xs text-slate-500">
            Age {player.age} · {player.gender}
          </p>
        </div>
        <PlayerStatusBadge status={player.status} />
      </div>

      {lastRiskLevel && (
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Last risk:</span>
          <RiskBadge level={lastRiskLevel} />
        </div>
      )}

      <div className="flex items-center justify-between">
        <Link
          to={`/dashboard/players/${player.id}`}
          className="text-xs font-medium text-cyan-400 hover:text-cyan-300"
        >
          View Details →
        </Link>
        {actions}
      </div>
    </Card>
  );
}

import type { Agent } from '../types';
import { STATUS_CLR, getAvatarUrl } from '../services/agents.data';

export function AgentAvatar({
  agent,
  size = 72,
}: {
  agent: Agent;
  size?: number;
}) {
  const seed = agent.avatarSeed || agent.initials;
  const avatarUrl = getAvatarUrl(seed);
  const borderWidth = size > 60 ? 3 : 2;

  return (
    <div className="relative shrink-0">
      <img
        src={avatarUrl}
        alt={agent.name}
        width={size}
        height={size}
        className="rounded-full block bg-slate-100"
        style={{
          border: `${borderWidth}px solid ${STATUS_CLR[agent.status]}40`,
        }}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

import { useState } from 'react';

const AVATAR_COLORS: [string, string][] = [
  ['linear-gradient(135deg,#0EA5E9,#6366F1)', '#fff'],
  ['linear-gradient(135deg,#8B5CF6,#EC4899)', '#fff'],
];

function initials(email?: string): string {
  return email ? email.split('@')[0].slice(0, 2).toUpperCase() : '??';
}

export function RelationalContext({
  internal,
  external,
}: {
  internal?: string;
  external?: string;
}) {
  const [hovered, setHovered] = useState(false);

  if (!internal && !external) {
    return <span className="text-xs text-slate-300">&mdash;</span>;
  }

  return (
    <div
      className="relative inline-flex items-center"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="flex items-center">
        {[internal, external].map((email, i) =>
          email ? (
            <div
              key={i}
              className={`flex items-center justify-center rounded-full border-2 border-white shrink-0 cursor-default text-[9px] font-bold w-[26px] h-[26px] ${i > 0 ? '-ml-2' : ''} ${i === 0 ? 'z-[2]' : 'z-[1]'}`}
              style={{
                background: AVATAR_COLORS[i][0],
                color: AVATAR_COLORS[i][1],
              }}
            >
              {initials(email)}
            </div>
          ) : null,
        )}
      </div>

      {hovered && (
        <div className="absolute top-[calc(100%+6px)] left-0 z-50 bg-slate-900 text-white rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-nowrap shadow-[0_4px_16px_rgba(0,0,0,0.2)] pointer-events-none">
          {internal && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-semibold tracking-wider">
                INT
              </span>
              <span className="text-blue-300">{internal}</span>
            </div>
          )}
          {external && (
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 text-[10px] font-semibold tracking-wider">
                EXT
              </span>
              <span className="text-green-300">{external}</span>
            </div>
          )}
          <div className="absolute -top-[5px] left-2.5 w-2.5 h-2.5 bg-slate-900 rotate-45" />
        </div>
      )}
    </div>
  );
}

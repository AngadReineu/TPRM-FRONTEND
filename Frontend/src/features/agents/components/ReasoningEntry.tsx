import { useState } from 'react';
import { Brain, ChevronDown, ChevronRight } from 'lucide-react';
import type { LogEntry } from '../types';
import { LOG_STYLE } from '../services/agents.data';

export function ReasoningEntry({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const style = LOG_STYLE[entry.type];

  return (
    <div
      className="rounded-lg mb-1.5 py-2.5 px-3.5"
      style={{
        backgroundColor: style.bg,
        border: `1px solid ${style.color}30`,
      }}
    >
      <div
        className={`flex items-center gap-2 ${entry.detail ? 'cursor-pointer' : 'cursor-default'}`}
        onClick={() => entry.detail && setExpanded((e) => !e)}
      >
        <Brain size={13} color={style.color} />
        <span
          className="text-[11px] font-bold tracking-wider"
          style={{ color: style.color }}
        >
          {style.label}
        </span>
        <span className="text-[11px] text-slate-400 ml-auto">{entry.time}</span>
        {entry.detail && (
          <span style={{ color: style.color }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
      </div>
      <div className="text-[13px] text-slate-700 mt-1 font-medium">{entry.message}</div>
      {expanded && entry.detail && (
        <div
          className="mt-2 rounded-md text-xs text-slate-500 leading-relaxed bg-white py-2 px-3"
          style={{
            borderLeft: `3px solid ${style.color}`,
          }}
        >
          {entry.detail}
        </div>
      )}
    </div>
  );
}

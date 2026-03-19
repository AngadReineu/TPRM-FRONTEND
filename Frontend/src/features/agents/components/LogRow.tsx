import type { LogEntry } from '../types';
import { LOG_STYLE } from '../services/agents.data';
import { ReasoningEntry } from './ReasoningEntry';

export function LogRow({ entry }: { entry: LogEntry }) {
  if (entry.type === 'reasoning') return <ReasoningEntry entry={entry} />;
  const style = LOG_STYLE[entry.type];

  return (
    <div className="flex items-start gap-2.5 py-[7px] border-b border-slate-50">
      <span className="text-[10px] text-slate-400 font-mono shrink-0 mt-0.5 min-w-[56px]">
        {entry.time}
      </span>
      <span
        className="text-[10px] font-bold rounded shrink-0 mt-px min-w-[46px] text-center px-1.5 py-px"
        style={{
          color: style.color,
          backgroundColor: style.bg,
        }}
      >
        {style.label}
      </span>
      <span className="text-[13px] text-slate-700 flex-1">{entry.message}</span>
    </div>
  );
}

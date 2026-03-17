import type { TimelineEntry } from '../types';

const TIMELINE_CFG: Record<
  TimelineEntry['status'],
  { dot: string }
> = {
  alert:   { dot: '#EF4444' },
  warning: { dot: '#F59E0B' },
  success: { dot: '#10B981' },
  info:    { dot: '#0EA5E9' },
};

export function TimelineItem({
  entry,
  isLast,
}: {
  entry: TimelineEntry;
  isLast: boolean;
}) {
  const cfg = TIMELINE_CFG[entry.status];

  return (
    <div
      className={`flex gap-3 relative ${isLast ? 'mb-0' : 'mb-4'}`}
    >
      {/* Connecting line */}
      {!isLast && (
        <div
          className="absolute w-px bg-slate-200 left-[7px] top-5 -bottom-4 z-0"
        />
      )}

      {/* Dot */}
      <div
        className="rounded-full shrink-0 mt-0.5 border-2 border-white w-[15px] h-[15px] z-[1]"
        style={{
          backgroundColor: cfg.dot,
          boxShadow: `0 0 0 2px ${cfg.dot}33`,
        }}
      />

      {/* Content */}
      <div className="flex-1">
        <div className="text-[11px] text-slate-400 font-mono mb-0.5">
          {entry.time}
        </div>
        <div className="text-[13px] text-slate-700 leading-snug">
          {entry.event}
        </div>
      </div>
    </div>
  );
}

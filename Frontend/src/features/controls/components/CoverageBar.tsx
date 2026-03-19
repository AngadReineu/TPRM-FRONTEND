export function CoverageBar({ value }: { value: number }) {
  const color = value >= 80 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 bg-slate-200 rounded-full w-16 shrink-0">
        <div
          className="h-1.5 rounded-full"
          style={{ width: `${value}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs font-semibold" style={{ color }}>
        {value}%
      </span>
    </div>
  );
}

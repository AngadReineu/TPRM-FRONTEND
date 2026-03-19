interface SegmentBarProps {
  active: number;
  total: number;
}

/** A row of small segments; filled segments are green. */
export function SegmentBar({ active, total }: SegmentBarProps) {
  return (
    <div className="flex gap-[3px] mt-3.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1 flex-1 rounded-sm ${i < active ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}
        />
      ))}
    </div>
  );
}

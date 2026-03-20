interface MiniBarProps {
  pct: number;
  color: string;
  bg: string;
}

/** Thin horizontal progress bar. */
export function MiniBar({ pct, color, bg }: MiniBarProps) {
  const safePct = Math.min(Math.max(pct, 0), 100);
  return (
    <div className="h-1 rounded-full w-full mt-3.5 overflow-hidden" style={{ backgroundColor: bg }}>
      <div
        className="h-1 rounded-full transition-[width] duration-[400ms] ease-out"
        style={{ width: `${safePct}%`, backgroundColor: color }}
      />
    </div>
  );
}

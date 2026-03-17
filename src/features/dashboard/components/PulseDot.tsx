interface PulseDotProps {
  color?: string;
}

/** Animated pulsing "live" indicator dot. */
export function PulseDot({ color = '#10B981' }: PulseDotProps) {
  return (
    <span className="relative inline-flex w-[9px] h-[9px] shrink-0">
      <span
        className="absolute inline-flex w-full h-full rounded-full opacity-45 animate-ping"
        style={{ backgroundColor: color }}
      />
      <span
        className="relative inline-flex rounded-full w-[9px] h-[9px]"
        style={{ backgroundColor: color }}
      />
    </span>
  );
}

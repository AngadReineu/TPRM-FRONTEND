export function StatusBadge({
  label,
  colors,
  className = '',
}: {
  label: string;
  colors: [bg: string, text: string];
  className?: string;
}) {
  const [bg, text] = colors;
  return (
    <span
      className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${className}`}
      style={{ backgroundColor: bg, color: text }}
    >
      {label}
    </span>
  );
}

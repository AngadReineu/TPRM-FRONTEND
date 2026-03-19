interface WidgetCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Base container card for every dashboard panel.
 * Uses Tailwind for standard styles; falls back to inline `style`
 * only for the custom box-shadow token.
 */
export function WidgetCard({ children, className = '', style }: WidgetCardProps) {
  return (
    <div
      className={`bg-white border border-[#E9EEF4] rounded-[14px] p-6 shadow-[0_1px_4px_rgba(15,23,42,0.06),0_1px_2px_rgba(15,23,42,0.04)] ${className}`}
      style={style}
    >
      {children}
    </div>
  );
}

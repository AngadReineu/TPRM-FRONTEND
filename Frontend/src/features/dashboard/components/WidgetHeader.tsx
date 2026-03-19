interface WidgetHeaderProps {
  title: string;
  subtitle?: string;
  action?: string;
  onAction?: () => void;
}

/** Title row with an optional subtitle and action link. */
export function WidgetHeader({ title, subtitle, action, onAction }: WidgetHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <div className="text-[15px] font-bold text-slate-900 tracking-tight">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 mt-0.5">{subtitle}</div>}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          className="text-[13px] text-sky-500 bg-transparent border-none cursor-pointer font-medium shrink-0"
        >
          {action}
        </button>
      )}
    </div>
  );
}

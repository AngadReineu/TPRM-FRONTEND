import { WidgetCard } from './WidgetCard';
import { Sparkline } from './Sparkline';
import { MiniBar } from './MiniBar';
import { PulseDot } from './PulseDot';

interface KpiWidgetProps {
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string | number;
  valueColor?: string;
  sub: React.ReactNode;
  subColor?: string;
  sparkData?: number[];
  sparkColor?: string;
  barPct?: number;
  barColor?: string;
  barBg?: string;
  liveIndicator?: boolean;
  liveLabel?: string;
  children?: React.ReactNode;
}

/** Composite KPI card combining icon, metric, sparkline, sub-label, and progress bar. */
export function KpiWidget({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  sub,
  subColor,
  sparkData,
  sparkColor,
  barPct,
  barColor,
  barBg,
  liveIndicator,
  liveLabel,
  children,
}: KpiWidgetProps) {
  return (
    <WidgetCard>
      {/* Icon + Label row */}
      <div className="flex items-center gap-2 mb-3">
        <div
          className="w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <span className="flex" style={{ color: iconColor }}>{icon}</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">
          {label}
        </span>
      </div>

      {/* Metric value */}
      <div className="flex items-center gap-2.5">
        <span
          className="text-[38px] font-extrabold leading-none tracking-tight"
          style={{ color: valueColor ?? '#0F172A' }}
        >
          {value}
        </span>
        {liveIndicator && (
          <div className="flex items-center gap-[5px]">
            <PulseDot />
            <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-full">
              {liveLabel ?? 'Live'}
            </span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && sparkColor && (
        <div className="mt-2.5">
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}

      {/* Sub-label */}
      <div
        className="text-xs mt-1.5 flex items-center gap-1"
        style={{ color: subColor ?? '#64748B' }}
      >
        {sub}
      </div>

      {/* Bar */}
      {barPct !== undefined && barColor && barBg && (
        <MiniBar pct={barPct} color={barColor} bg={barBg} />
      )}

      {/* Extra content (e.g. SegmentBar) */}
      {children}
    </WidgetCard>
  );
}

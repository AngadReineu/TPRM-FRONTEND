import type { Risk } from '../../types/shared';

const CLASSES: Record<Risk, string> = {
  Critical: 'bg-[#FEF2F2] text-[#EF4444]',
  High:     'bg-[#FFFBEB] text-[#F59E0B]',
  Medium:   'bg-[#F1F5F9] text-[#64748B]',
  Low:      'bg-[#ECFDF5] text-[#10B981]',
};

export function RiskBadge({ risk }: { risk: Risk }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${CLASSES[risk]}`}>
      {risk}
    </span>
  );
}

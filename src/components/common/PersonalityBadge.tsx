import type { Personality } from '../../types/shared';
import { Handshake, Truck, ShieldCheck, Scale } from 'lucide-react';

const CLASSES: Record<Personality, string> = {
  Consulting: 'bg-[#EFF6FF] text-[#0EA5E9]',
  Operations: 'bg-[#ECFDF5] text-[#10B981]',
  Security:   'bg-[#F5F3FF] text-[#8B5CF6]',
  Regulatory: 'bg-[#FFFBEB] text-[#F59E0B]',
};

const ICONS: Record<Personality, React.ElementType> = {
  Consulting: Handshake,
  Operations: Truck,
  Security: ShieldCheck,
  Regulatory: Scale,
};

export function PersonalityBadge({ personality }: { personality?: Personality }) {
  if (!personality) return <span className="text-xs text-slate-300">—</span>;
  const Icon = ICONS[personality];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] rounded-md whitespace-nowrap ${CLASSES[personality]}`}>
      <Icon size={10} />
      {personality}
    </span>
  );
}

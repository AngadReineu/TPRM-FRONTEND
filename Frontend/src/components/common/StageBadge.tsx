import type { Stage } from '@/types/shared';

const CLASSES: Record<Stage, string> = {
  Acquisition: 'bg-[#EFF6FF] text-[#0EA5E9]',
  Retention:   'bg-[#ECFDF5] text-[#10B981]',
  Upgradation: 'bg-[#FFFBEB] text-[#F59E0B]',
  Offboarding: 'bg-[#F1F5F9] text-[#64748B]',
};

export function StageBadge({ stage }: { stage: Stage }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md tracking-wide ${CLASSES[stage]}`}>
      {stage}
    </span>
  );
}

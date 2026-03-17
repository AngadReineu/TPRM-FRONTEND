import type { PiiFlow } from '@/types/shared';
import { MoveUpRight, MoveDownLeft, Repeat2 } from 'lucide-react';

const CLASSES: Record<PiiFlow, string> = {
  share:  'bg-[#EFF6FF] text-[#0EA5E9]',
  ingest: 'bg-[#ECFDF5] text-[#10B981]',
  both:   'bg-[#F5F3FF] text-[#8B5CF6]',
};

const LABELS: Record<PiiFlow, string> = {
  share: 'Share', ingest: 'Ingest', both: 'Both',
};

const FLOW_ICONS: Record<PiiFlow, React.ElementType> = {
  share: MoveUpRight,
  ingest: MoveDownLeft,
  both: Repeat2,
};

export function PiiFlowBadge({ flow }: { flow?: PiiFlow }) {
  if (!flow) return <span className="text-xs text-slate-300">—</span>;
  const Icon = FLOW_ICONS[flow];
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] rounded-md ${CLASSES[flow]}`}>
      <Icon size={11} />
      {LABELS[flow]}
    </span>
  );
}

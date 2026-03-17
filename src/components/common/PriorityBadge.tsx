import type { TaskPriority } from '../../types/shared';

const CLASSES: Record<TaskPriority, string> = {
  High:   'bg-[#FEF2F2] text-[#EF4444]',
  Medium: 'bg-[#FFFBEB] text-[#F59E0B]',
  Low:    'bg-[#ECFDF5] text-[#10B981]',
};

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${CLASSES[priority]}`}>
      {priority}
    </span>
  );
}

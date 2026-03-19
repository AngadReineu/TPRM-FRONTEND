import type { AssessmentStatus } from '../types';

const STATUS_MAP: Record<AssessmentStatus, { className: string; label: string }> = {
  complete: { className: 'bg-emerald-50 text-emerald-500', label: 'Complete' },
  overdue:  { className: 'bg-red-50 text-red-500',         label: 'Overdue' },
  pending:  { className: 'bg-amber-50 text-amber-500',     label: 'Pending' },
};

export function AssessmentBadge({ status }: { status: AssessmentStatus }) {
  const { className, label } = STATUS_MAP[status];
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${className}`}>
      {label}
    </span>
  );
}

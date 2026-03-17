import type { Permission } from '../types';

export function PermCell({ perm }: { perm: Permission }) {
  if (perm === 'full') {
    return (
      <div className="flex justify-center">
        <span className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2.5 py-[3px] rounded whitespace-nowrap">
          Full Access
        </span>
      </div>
    );
  }
  if (perm === 'read') {
    return (
      <div className="flex justify-center">
        <span className="bg-sky-50 text-blue-600 text-[11px] font-semibold px-2.5 py-[3px] rounded whitespace-nowrap">
          View Only
        </span>
      </div>
    );
  }
  return (
    <div className="flex justify-center">
      <span className="text-slate-300 text-sm font-semibold">&mdash;</span>
    </div>
  );
}

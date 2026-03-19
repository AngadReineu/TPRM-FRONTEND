import { ShieldCheck } from 'lucide-react';

export function TruthMatchCell({
  validator,
  gap,
}: {
  validator?: boolean;
  gap?: boolean;
}) {
  if (!validator) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-300">
        <ShieldCheck size={14} className="text-slate-200" />
        <span>N/A</span>
      </span>
    );
  }

  const color = gap ? '#EF4444' : '#10B981';
  const bg = gap ? '#FEF2F2' : '#ECFDF5';
  const label = gap ? 'Gap Detected' : 'Validated';

  return (
    <span
      className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-[3px] rounded-md"
      style={{ backgroundColor: bg, color }}
    >
      <ShieldCheck size={11} />
      {label}
    </span>
  );
}

import { cn } from '@/lib/utils';

interface ToggleSwitchProps {
  on: boolean;
  onToggle: () => void;
  label?: string;
  size?: 'sm' | 'md';
}

export function ToggleSwitch({ on, onToggle, label, size = 'sm' }: ToggleSwitchProps) {
  // thumb left position must be JS-computed (pixel arithmetic from size)
  const leftOn  = size === 'sm' ? 18 : 21;
  const leftOff = size === 'sm' ? 2  : 3;

  const toggle = (
    <div
      onClick={onToggle}
      className={cn(
        'relative cursor-pointer shrink-0 rounded-full',
        size === 'sm' ? 'w-9 h-5' : 'w-[42px] h-6',
        on ? 'bg-[#0EA5E9]' : 'bg-[#CBD5E1]',
      )}
    >
      <div
        className={cn(
          'absolute bg-white rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.2)] transition-[left] duration-200',
          size === 'sm' ? 'top-0.5 w-4 h-4' : 'top-[3px] w-[18px] h-[18px]',
        )}
        style={{ left: on ? leftOn : leftOff }}
      />
    </div>
  );

  if (!label) return toggle;

  return (
    <div className="flex items-center justify-between py-3 border-b border-slate-100">
      <span className="text-sm text-slate-700">{label}</span>
      {toggle}
    </div>
  );
}

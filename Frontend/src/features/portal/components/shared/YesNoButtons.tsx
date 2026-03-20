interface YesNoButtonsProps {
  value: 'yes' | 'no' | null;
  onChange: (val: 'yes' | 'no') => void;
  disabled?: boolean;
}

export function YesNoButtons({ value, onChange, disabled }: YesNoButtonsProps) {
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('yes')}
        className={`px-6 py-2 rounded-full text-[14px] transition-all border cursor-pointer ${
          value === 'yes'
            ? 'bg-[#ECFDF5] border-[#10B981] text-[#10B981]'
            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#10B981] hover:text-[#10B981]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        Yes
      </button>
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange('no')}
        className={`px-6 py-2 rounded-full text-[14px] transition-all border cursor-pointer ${
          value === 'no'
            ? 'bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]'
            : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#EF4444] hover:text-[#EF4444]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
      >
        No
      </button>
    </div>
  );
}

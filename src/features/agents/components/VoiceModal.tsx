import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';

const VOICES = [
  { id: 'Neutral',      desc: 'Balanced and clear' },
  { id: 'Professional', desc: 'Formal and precise' },
  { id: 'Friendly',     desc: 'Warm and approachable' },
  { id: 'Formal',       desc: 'Structured and authoritative' },
] as const;

export function VoiceModal({ onClose }: { onClose: () => void }) {
  const [sel, setSel] = useState('Neutral');

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[340px] bg-white rounded-2xl p-6 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-slate-400"
        >
          <X size={18} />
        </button>

        <div className="text-base font-bold text-slate-900 mb-1">
          Select Voice
        </div>
        <div className="text-[13px] text-slate-400 mb-5">
          Choose how this agent communicates
        </div>

        <div className="flex flex-col gap-2.5 mb-5">
          {VOICES.map((v) => {
            const active = sel === v.id;
            return (
              <div
                key={v.id}
                onClick={() => setSel(v.id)}
                className={`flex items-center justify-between rounded-[10px] cursor-pointer transition-colors py-3 px-4 border ${active ? 'border-[#0EA5E9] bg-[#F0F9FF]' : 'border-[#E2E8F0] bg-white'}`}
              >
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {v.id}
                  </div>
                  <div className="text-xs text-slate-400 mt-px">{v.desc}</div>
                </div>
                {active && <Check size={16} color="#0EA5E9" strokeWidth={3} />}
              </div>
            );
          })}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onClose();
              toast.success(`Voice set to "${sel}"`);
            }}
            className="px-4 py-2 text-[13px] font-semibold border-none rounded-lg bg-purple-500 text-white cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

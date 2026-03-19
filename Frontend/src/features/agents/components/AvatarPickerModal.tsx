import { useState } from 'react';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import type { Agent } from '../types';
import { STATUS_CLR, AVATAR_SEEDS, getAvatarUrl } from '../services/agents.data';

export function AvatarPickerModal({
  agent,
  onSelect,
  onClose,
}: {
  agent: Agent;
  onSelect: (seed: string) => void;
  onClose: () => void;
}) {
  const [selSeed, setSelSeed] = useState(agent.avatarSeed || agent.initials);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/45 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-[420px] bg-white rounded-2xl p-7 shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-slate-400"
        >
          <X size={18} />
        </button>

        <div className="text-base font-bold text-slate-900 mb-0.5">
          Select Avatar
        </div>
        <div className="text-[13px] text-slate-400 mb-5">
          Choose a persona for this agent
        </div>

        {/* Preview */}
        <div className="flex justify-center mb-5">
          <div className="relative">
            <img
              src={getAvatarUrl(selSeed)}
              alt={selSeed}
              width={80}
              height={80}
              className="rounded-full border-[3px] border-sky-500 bg-slate-100 block"
            />
            <div
              className="absolute bottom-0.5 right-0.5 w-4 h-4 rounded-full border-2 border-white"
              style={{ backgroundColor: STATUS_CLR[agent.status] }}
            />
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {AVATAR_SEEDS.map(({ seed, label }) => {
            const isSel = selSeed === seed;
            return (
              <div
                key={seed}
                onClick={() => setSelSeed(seed)}
                className="flex flex-col items-center gap-1.5 cursor-pointer"
              >
                <div
                  className={`rounded-full p-0.5 transition-all border-[2.5px] ${isSel ? 'border-[#0EA5E9] bg-[#EFF6FF]' : 'border-transparent bg-transparent'}`}
                >
                  <img
                    src={getAvatarUrl(seed)}
                    alt={label}
                    width={56}
                    height={56}
                    className={`rounded-full bg-slate-100 block transition-opacity ${isSel ? 'opacity-100' : 'opacity-75'}`}
                  />
                </div>
                <span
                  className={`text-[10px] tracking-wide ${isSel ? 'font-bold text-[#0EA5E9]' : 'font-medium text-[#94A3B8]'}`}
                >
                  {label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSelect(selSeed);
              onClose();
              toast.success('Avatar updated!');
            }}
            className="px-4 py-2 text-[13px] font-semibold border-none rounded-lg bg-sky-500 text-white cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}

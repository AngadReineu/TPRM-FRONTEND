import { useState } from 'react';
import { X, Mic } from 'lucide-react';
import type { Agent } from '../types';
import { AgentAvatar } from './AgentAvatar';

export function TalkModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const [listening, setListening] = useState(false);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-80 bg-white rounded-2xl p-8 shadow-2xl text-center">
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 bg-transparent border-none cursor-pointer text-slate-400"
        >
          <X size={18} />
        </button>

        <AgentAvatar agent={agent} size={52} />

        <div className="text-base font-bold text-slate-900 mt-3 mb-1">
          Talk to {agent.name}
        </div>
        <div className="text-[13px] text-slate-400 mb-7">
          {listening
            ? 'Listening... speak now'
            : 'Click the mic to start speaking'}
        </div>

        <div
          onClick={() => setListening((l) => !l)}
          className={`mx-auto mb-5 flex items-center justify-center rounded-full cursor-pointer transition-all w-16 h-16 ${listening ? 'bg-[#EF4444]' : 'bg-[#10B981]'}`}
          style={{
            boxShadow: `0 4px 20px ${
              listening ? 'rgba(239,68,68,0.4)' : 'rgba(16,185,129,0.4)'
            }`,
          }}
        >
          <Mic size={26} color="#fff" />
        </div>

        {listening && (
          <div className="text-xs text-red-500 font-semibold mb-4">
            &#9679; Listening...
          </div>
        )}

        <button
          onClick={onClose}
          className="px-5 py-2 text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer"
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

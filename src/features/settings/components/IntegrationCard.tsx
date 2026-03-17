import { useState } from 'react';

interface IntegrationCardProps {
  name: string;
  icon: string;
  connected: boolean;
  status: string;
}

export function IntegrationCard({ name, icon, connected, status }: IntegrationCardProps) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border border-slate-200 rounded-[10px] mb-2.5">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">
          {icon}
        </div>
        <div>
          <div className="text-sm font-semibold text-slate-900">{name}</div>
          <div className={`text-xs flex items-center gap-1 ${connected ? 'text-emerald-500' : 'text-slate-400'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`} />
            {status}
          </div>
        </div>
      </div>
      <button
        className={`text-[13px] font-medium bg-transparent rounded-[7px] px-3.5 py-1.5 cursor-pointer ${
          connected
            ? 'text-red-500 border border-red-200'
            : 'text-sky-500 border border-blue-200'
        }`}
      >
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}

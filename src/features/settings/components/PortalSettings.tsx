import { useState } from 'react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

const inputCls = 'w-full box-border px-3.5 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none bg-white font-[Inter,sans-serif] mb-4';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

function Toggle({ initial, label }: { initial: boolean; label: string }) {
  const [on, setOn] = useState(initial);
  return <ToggleSwitch on={on} onToggle={() => setOn(!on)} label={label} size="md" />;
}

export function PortalSettings() {
  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-5">Supplier Portal Settings</div>
      <label className={labelCls}>Portal URL (read-only)</label>
      <div className="flex gap-2 mb-4">
        <input readOnly className={`${inputCls} bg-slate-50 !mb-0 flex-1`} value="https://portal.tprm.abcinsurance.in" />
        <button className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer text-xs text-slate-500 shrink-0">Copy</button>
      </div>
      <label className={labelCls}>Portal Logo URL</label>
      <input className={inputCls} placeholder="https://cdn.example.com/logo.png" />
      <label className={labelCls}>Portal Brand Color</label>
      <input type="color" className={`${inputCls} h-[42px] p-1.5 !mb-4`} defaultValue="#0EA5E9" />
      <label className={labelCls}>Assessment Expiry (days)</label>
      <input className={inputCls} type="number" defaultValue={30} />
      <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-2">Auto-Reminder Schedule</div>
      <Toggle initial label="Send reminder on Day 7" />
      <Toggle initial label="Send reminder on Day 15" />
      <Toggle initial label="Send reminder on Day 25" />
      <Toggle initial label="Send final warning on Day 30" />
      <button className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer mt-4 hover:bg-sky-600">
        Save Settings
      </button>
    </div>
  );
}

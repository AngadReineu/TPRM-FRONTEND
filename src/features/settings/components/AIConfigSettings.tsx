import { useState } from 'react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

const inputCls = 'w-full box-border px-3.5 py-2.5 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none bg-white font-[Inter,sans-serif] mb-4';
const labelCls = 'block text-[13px] font-semibold text-slate-700 mb-1.5';

function Toggle({ initial, label }: { initial: boolean; label: string }) {
  const [on, setOn] = useState(initial);
  return <ToggleSwitch on={on} onToggle={() => setOn(!on)} label={label} size="md" />;
}

export function AIConfigSettings() {
  const [confidence, setConfidence] = useState(75);

  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-5">AI Configuration</div>
      <div className="mb-5">
        <label className={labelCls}>Default AI Model</label>
        <select className={`${inputCls} appearance-none !mb-0`}>
          <option>GPT-4o (Azure OpenAI)</option>
          <option>Claude 3 Sonnet</option>
          <option>Gemini Pro</option>
        </select>
      </div>
      <div className="mb-5">
        <label className={labelCls}>
          Global Confidence Threshold: <span className="text-sky-500">{confidence}%</span>
        </label>
        <input type="range" min={0} max={100} value={confidence} onChange={e => setConfidence(Number(e.target.value))} className="w-full" />
        <div className="text-xs text-slate-500 mt-1">Below this threshold, all evaluations are flagged for human review.</div>
      </div>
      <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-2.5">AI Permissions</div>
      <Toggle initial label="Allow AI to auto-create ServiceNow tickets" />
      <Toggle initial label="Allow AI to send email alerts" />
      <Toggle initial={false} label="Allow AI to modify supplier risk scores" />
      <Toggle initial={false} label="Allow AI to escalate to management" />
      <button className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer mt-5 hover:bg-sky-600">
        Save Configuration
      </button>
    </div>
  );
}

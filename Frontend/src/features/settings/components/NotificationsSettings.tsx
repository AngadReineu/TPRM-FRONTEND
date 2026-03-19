import { useState } from 'react';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

function Toggle({ initial, label }: { initial: boolean; label: string }) {
  const [on, setOn] = useState(initial);
  return <ToggleSwitch on={on} onToggle={() => setOn(!on)} label={label} size="md" />;
}

export function NotificationsSettings() {
  return (
    <div>
      <div className="text-base font-semibold text-slate-900 mb-2">Notification Preferences</div>
      <p className="text-[13px] text-slate-500 mb-5">Configure which events trigger email and in-app notifications.</p>

      <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-2">Supplier Events</div>
      <Toggle initial label="Assessment overdue (>7 days)" />
      <Toggle initial label="New supplier onboarded" />
      <Toggle initial label="Assessment completed" />
      <Toggle initial={false} label="Supplier risk score changed" />

      <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.06em] mt-5 mb-2">Control Events</div>
      <Toggle initial label="Control evaluation failed" />
      <Toggle initial label="Coverage dropped below threshold" />
      <Toggle initial={false} label="Control activated / deactivated" />

      <div className="text-[13px] font-semibold text-slate-400 uppercase tracking-[0.06em] mt-5 mb-2">Certificate &amp; Expiry</div>
      <Toggle initial label="Certificate expiring in 30 days" />
      <Toggle initial label="Certificate expiring in 7 days" />
      <Toggle initial={false} label="Contract end date approaching" />

      <button className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer mt-5 hover:bg-sky-600">
        Save Preferences
      </button>
    </div>
  );
}

import { useState } from 'react';
import { OrgSettings } from '../components/OrgSettings';
import { IntegrationsSettings } from '../components/IntegrationsSettings';
import { NotificationsSettings } from '../components/NotificationsSettings';
import { ComplianceSettings } from '../components/ComplianceSettings';
import { AIConfigSettings } from '../components/AIConfigSettings';
import { PortalSettings } from '../components/PortalSettings';

const tabs = [
  { id: 'org', label: 'Organization' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'ai', label: 'AI Config' },
  { id: 'portal', label: 'Portal Settings' },
];

const tabContent: Record<string, React.ReactNode> = {
  org: <OrgSettings />,
  integrations: <IntegrationsSettings />,
  notifications: <NotificationsSettings />,
  compliance: <ComplianceSettings />,
  ai: <AIConfigSettings />,
  portal: <PortalSettings />,
};

export function SettingsPage() {
  const [activeTab, setActiveTab] = useState('org');

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 m-0">Settings</h1>
        <p className="text-sm text-slate-500 mt-1">Configure your TPRM platform settings</p>
      </div>

      <div className="grid grid-cols-[200px_1fr] gap-6">
        {/* Left nav */}
        <div className="flex flex-col gap-0.5">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`block w-full text-left px-3.5 py-2 text-sm font-medium rounded-lg border-none cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-sky-50 text-sky-500 border-l-[3px] border-l-sky-500'
                  : 'bg-transparent text-slate-500 border-l-[3px] border-l-transparent hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="bg-white border border-slate-200 rounded-xl p-7 shadow-sm">
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}

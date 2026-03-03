import { useState } from 'react';

const tabs = [
  { id: 'org', label: 'Organization' },
  { id: 'integrations', label: 'Integrations' },
  { id: 'notifications', label: 'Notifications' },
  { id: 'compliance', label: 'Compliance' },
  { id: 'ai', label: 'AI Config' },
  { id: 'portal', label: 'Portal Settings' },
];

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px', fontSize: 14, color: '#334155',
  border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none',
  backgroundColor: '#fff', fontFamily: 'Inter, sans-serif',
  marginBottom: 16,
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6,
};

function ToggleSwitch({ on, label }: { on: boolean; label: string }) {
  const [state, setState] = useState(on);
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid #F1F5F9' }}>
      <span style={{ fontSize: 14, color: '#334155' }}>{label}</span>
      <div onClick={() => setState(!state)} style={{ width: 42, height: 24, borderRadius: 99, backgroundColor: state ? '#0EA5E9' : '#CBD5E1', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
        <div style={{ position: 'absolute', top: 3, left: state ? 21 : 3, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
      </div>
    </div>
  );
}

function IntegrationCard({ name, icon, connected, status }: { name: string; icon: string; connected: boolean; status: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', border: '1px solid #E2E8F0', borderRadius: 10, marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#64748B' }}>
          {icon}
        </div>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{name}</div>
          <div style={{ fontSize: 12, color: connected ? '#10B981' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: connected ? '#10B981' : '#94A3B8' }} />
            {status}
          </div>
        </div>
      </div>
      <button style={{ fontSize: 13, color: connected ? '#EF4444' : '#0EA5E9', backgroundColor: 'transparent', border: `1px solid ${connected ? '#FECACA' : '#DBEAFE'}`, borderRadius: 7, padding: '6px 14px', cursor: 'pointer', fontWeight: 500 }}>
        {connected ? 'Disconnect' : 'Connect'}
      </button>
    </div>
  );
}

function OrgSettings() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>Organization Details</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        <div style={{ paddingRight: 20 }}>
          <label style={labelStyle}>Organization Name</label>
          <input style={inputStyle} defaultValue="ABC Insurance Company" />
          <label style={labelStyle}>Industry</label>
          <select style={{ ...inputStyle, appearance: 'none' }}><option>Healthcare / Insurance</option><option>Finance</option><option>Technology</option></select>
          <label style={labelStyle}>Headquarters</label>
          <input style={inputStyle} defaultValue="Mumbai, India" />
        </div>
        <div style={{ paddingLeft: 20, borderLeft: '1px solid #E2E8F0' }}>
          <label style={labelStyle}>CIN / Registration No.</label>
          <input style={inputStyle} defaultValue="U66000MH2015PLC123456" />
          <label style={labelStyle}>IRDAI License Number</label>
          <input style={inputStyle} defaultValue="IRDAI/HLT/2015/123" />
          <label style={labelStyle}>Primary Contact Email</label>
          <input style={inputStyle} defaultValue="risk@abcinsurance.in" />
        </div>
      </div>
      <label style={labelStyle}>Organization Logo URL</label>
      <input style={inputStyle} placeholder="https://..." />
      <button style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} className="hover:bg-[#0284C7]">
        Save Changes
      </button>
    </div>
  );
}

function IntegrationsSettings() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>Connected Integrations</div>
      <IntegrationCard name="Microsoft Azure" icon="AZ" connected status="Connected · 312 assets" />
      <IntegrationCard name="Google Cloud Platform" icon="GCP" connected status="Connected · 185 assets" />
      <IntegrationCard name="Microsoft 365" icon="M365" connected status="Connected · 156 assets" />
      <IntegrationCard name="Active Directory" icon="AD" connected status="Connected · 89 assets" />
      <IntegrationCard name="ServiceNow" icon="SN" connected={false} status="Not connected" />
      <IntegrationCard name="Splunk" icon="SPL" connected={false} status="Degraded · Reconnect needed" />
      <IntegrationCard name="Slack / Teams" icon="SLK" connected={false} status="Not connected" />
    </div>
  );
}

function NotificationsSettings() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 8 }}>Notification Preferences</div>
      <p style={{ fontSize: 13, color: '#64748B', marginBottom: 20 }}>Configure which events trigger email and in-app notifications.</p>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Supplier Events</div>
      <ToggleSwitch on label="Assessment overdue (>7 days)" />
      <ToggleSwitch on label="New supplier onboarded" />
      <ToggleSwitch on label="Assessment completed" />
      <ToggleSwitch on={false} label="Supplier risk score changed" />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 20, marginBottom: 8 }}>Control Events</div>
      <ToggleSwitch on label="Control evaluation failed" />
      <ToggleSwitch on label="Coverage dropped below threshold" />
      <ToggleSwitch on={false} label="Control activated / deactivated" />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 20, marginBottom: 8 }}>Certificate & Expiry</div>
      <ToggleSwitch on label="Certificate expiring in 30 days" />
      <ToggleSwitch on label="Certificate expiring in 7 days" />
      <ToggleSwitch on={false} label="Contract end date approaching" />
      <button style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 20 }} className="hover:bg-[#0284C7]">
        Save Preferences
      </button>
    </div>
  );
}

function ComplianceSettings() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>Compliance Framework</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'IRDAI Data Governance Framework', checked: true },
          { label: 'DPDPA (Digital Personal Data Protection Act)', checked: true },
          { label: 'ISO 27001', checked: true },
          { label: 'SOC 2 Type II', checked: false },
          { label: 'GDPR', checked: false },
          { label: 'PCI DSS', checked: false },
        ].map(f => (
          <label key={f.label} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#334155' }}>
            <div style={{ width: 18, height: 18, borderRadius: 4, border: f.checked ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: f.checked ? '#0EA5E9' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {f.checked && <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>✓</span>}
            </div>
            {f.label}
          </label>
        ))}
      </div>
      <label style={labelStyle}>Regulatory Contact Email</label>
      <input style={inputStyle} defaultValue="compliance@abcinsurance.in" />
      <label style={labelStyle}>Data Retention Policy (days)</label>
      <input style={inputStyle} type="number" defaultValue={2555} />
      <button style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }} className="hover:bg-[#0284C7]">
        Save
      </button>
    </div>
  );
}

function AIConfigSettings() {
  const [confidence, setConfidence] = useState(75);
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>AI Configuration</div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Default AI Model</label>
        <select style={{ ...inputStyle, appearance: 'none', marginBottom: 0 }}><option>GPT-4o (Azure OpenAI)</option><option>Claude 3 Sonnet</option><option>Gemini Pro</option></select>
      </div>
      <div style={{ marginBottom: 20 }}>
        <label style={labelStyle}>Global Confidence Threshold: <span style={{ color: '#0EA5E9' }}>{confidence}%</span></label>
        <input type="range" min={0} max={100} value={confidence} onChange={e => setConfidence(Number(e.target.value))} style={{ width: '100%' }} />
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Below this threshold, all evaluations are flagged for human review.</div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>AI Permissions</div>
      <ToggleSwitch on label="Allow AI to auto-create ServiceNow tickets" />
      <ToggleSwitch on label="Allow AI to send email alerts" />
      <ToggleSwitch on={false} label="Allow AI to modify supplier risk scores" />
      <ToggleSwitch on={false} label="Allow AI to escalate to management" />
      <button style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 20 }} className="hover:bg-[#0284C7]">
        Save Configuration
      </button>
    </div>
  );
}

function PortalSettings() {
  return (
    <div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A', marginBottom: 20 }}>Supplier Portal Settings</div>
      <label style={labelStyle}>Portal URL (read-only)</label>
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input readOnly style={{ ...inputStyle, backgroundColor: '#F8FAFC', marginBottom: 0, flex: 1 }} value="https://portal.tprm.abcinsurance.in" />
        <button style={{ padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#64748B', flexShrink: 0 }}>Copy</button>
      </div>
      <label style={labelStyle}>Portal Logo URL</label>
      <input style={inputStyle} placeholder="https://cdn.example.com/logo.png" />
      <label style={labelStyle}>Portal Brand Color</label>
      <input type="color" style={{ ...inputStyle, height: 42, padding: 6, marginBottom: 16 }} defaultValue="#0EA5E9" />
      <label style={labelStyle}>Assessment Expiry (days)</label>
      <input style={inputStyle} type="number" defaultValue={30} />
      <div style={{ fontSize: 13, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Auto-Reminder Schedule</div>
      <ToggleSwitch on label="Send reminder on Day 7" />
      <ToggleSwitch on label="Send reminder on Day 15" />
      <ToggleSwitch on label="Send reminder on Day 25" />
      <ToggleSwitch on label="Send final warning on Day 30" />
      <button style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 16 }} className="hover:bg-[#0284C7]">
        Save Settings
      </button>
    </div>
  );
}

const tabContent: Record<string, React.ReactNode> = {
  org: <OrgSettings />,
  integrations: <IntegrationsSettings />,
  notifications: <NotificationsSettings />,
  compliance: <ComplianceSettings />,
  ai: <AIConfigSettings />,
  portal: <PortalSettings />,
};

export function Settings() {
  const [activeTab, setActiveTab] = useState('org');

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Settings</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Configure your TPRM platform settings</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        {/* Left nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'block', width: '100%', textAlign: 'left',
                padding: '9px 14px', fontSize: 14, fontWeight: 500,
                borderRadius: 8, border: 'none', cursor: 'pointer',
                backgroundColor: activeTab === tab.id ? '#EFF6FF' : 'transparent',
                color: activeTab === tab.id ? '#0EA5E9' : '#64748B',
                borderLeft: activeTab === tab.id ? '3px solid #0EA5E9' : '3px solid transparent',
              }}
              className={activeTab === tab.id ? '' : 'hover:bg-[#F1F5F9]'}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: 28, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
          {tabContent[activeTab]}
        </div>
      </div>
    </div>
  );
}
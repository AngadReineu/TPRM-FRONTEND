import { useState, useRef } from 'react';
import { ArrowLeft, Check, Loader2, CheckCircle2, Plus, X, ChevronDown,
  Handshake, Truck, ShieldCheck, Scale, AlertTriangle, Zap, GitMerge } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

/* ── Step Meta ───────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Target Asset Scope' },
  { id: 3, label: 'Data Source' },
  { id: 4, label: 'Trigger Config' },
  { id: 5, label: 'AI Behaviour' },
  { id: 6, label: 'Dependencies' },
];

/* ── Styles ──────────────────────────────────────────── */
const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '10px 14px', fontSize: 14, color: '#334155',
  border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none',
  backgroundColor: '#fff', fontFamily: 'Inter, sans-serif',
};

const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600,
  color: '#334155', marginBottom: 6,
};

const field = { marginBottom: 20 } as React.CSSProperties;

function PrimaryBtn({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: disabled ? '#CBD5E1' : '#0EA5E9',
        color: '#fff', border: 'none', borderRadius: 8,
        padding: '10px 20px', fontSize: 14, fontWeight: 600,
        cursor: disabled ? 'not-allowed' : 'pointer',
      }}
      className={disabled ? '' : 'hover:bg-[#0284C7]'}
    >
      {children}
    </button>
  );
}

function GhostBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        backgroundColor: '#fff', color: '#334155',
        border: '1px solid #E2E8F0', borderRadius: 8,
        padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
      }}
    >
      {children}
    </button>
  );
}

/* ── Stepper Bar ─────────────────────────────────────── */
function StepperBar({ currentStep }: { currentStep: number }) {
  return (
    <div style={{ ...card, padding: '20px 24px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {STEPS.map((step, idx) => {
          const completed = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: idx < STEPS.length - 1 ? 1 : 0 }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: '50%',
                  backgroundColor: completed ? '#10B981' : active ? '#0EA5E9' : '#fff',
                  border: completed || active ? 'none' : '2px solid #E2E8F0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {completed ? (
                    <Check size={16} color="#fff" strokeWidth={2.5} />
                  ) : (
                    <span style={{ fontSize: 13, fontWeight: 700, color: active ? '#fff' : '#94A3B8' }}>{step.id}</span>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: active ? 600 : 400, color: active ? '#0EA5E9' : '#94A3B8', whiteSpace: 'nowrap' }}>
                  {step.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div style={{
                  flex: 1, height: 2, margin: '0 6px', marginBottom: 20,
                  backgroundColor: completed ? '#10B981' : '#E2E8F0',
                }} />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 1 ──────────────────────────────────────────── */
const classifications = [
  { id: 'Technical', title: 'Technical', desc: 'Automated technical checks on systems and infrastructure' },
  { id: 'Process', title: 'Process', desc: 'Operational procedures and SLA adherence' },
  { id: 'Document', title: 'Document', desc: 'Policy documents and certification validity' },
  { id: 'Expected Response', title: 'Expected Response', desc: 'Behavioral outcomes and response timelines' },
];

const PERSONALITIES = [
  { id: 'consulting',  icon: Handshake,  title: 'Consulting',    sub: 'SOW & Payment Auditor',     color: '#0EA5E9', bg: '#EFF6FF' },
  { id: 'operations',  icon: Truck,       title: 'Operations',    sub: 'SLA & Logistics Monitor',   color: '#10B981', bg: '#ECFDF5' },
  { id: 'security',    icon: ShieldCheck, title: 'Data Security', sub: 'PII & Encryption Watchdog', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'regulatory',  icon: Scale,       title: 'Regulatory',   sub: 'Compliance & Audit Trail',  color: '#F59E0B', bg: '#FFFBEB' },
];

const PERSONALITY_CHECKS: Record<string, string[]> = {
  consulting:  ['SOW validation', 'Payment mismatch detection', 'Invoice discrepancy', 'SLA breach monitoring', 'Approval chain anomaly'],
  operations:  ['SLA timing', 'Volume mismatch', 'Delivery delay'],
  security:    ['Undeclared PII detection', 'Encryption enforcement', 'Access misuse', 'Data retention violation'],
  regulatory:  ['Certification expiry', 'Audit documentation missing', 'Compliance breach'],
};

const GRC_PROVIDERS = ['ServiceNow GRC', 'Archer (RSA)', 'OneTrust', 'MetricStream', 'IBM OpenPages'];

function Step1({ form, setForm }: { form: any; setForm: any }) {
  const [selectedChecks, setSelectedChecks] = useState<Set<string>>(new Set());
  const [customCheck, setCustomCheck] = useState('');
  const [customChecks, setCustomChecks] = useState<string[]>([]);

  const toggleCheck = (c: string) => {
    const n = new Set(selectedChecks);
    n.has(c) ? n.delete(c) : n.add(c);
    setSelectedChecks(n);
    setForm({ ...form, selectedChecks: Array.from(n) });
  };
  const addCustomCheck = () => {
    if (!customCheck.trim()) return;
    const updated = [...customChecks, customCheck.trim()];
    setCustomChecks(updated);
    const n = new Set(selectedChecks); n.add(customCheck.trim());
    setSelectedChecks(n);
    setForm({ ...form, selectedChecks: Array.from(n) });
    setCustomCheck('');
  };

  return (
    <div>
      <div style={field}>
        <label style={labelStyle}>Control Name *</label>
        <input
          style={inputStyle}
          placeholder="e.g., MFA Enforcement Policy"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>
      <div style={field}>
        <label style={labelStyle}>Description</label>
        <textarea
          rows={4}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Describe the purpose and scope..."
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* ── Control Source: 3 cards ── */}
      <div style={field}>
        <label style={labelStyle}>Control Source</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          {[
            { id: 'local', title: 'Local Control',         desc: 'Create and manage locally within Kyudo',                          accent: '#0EA5E9' },
            { id: 'kyudo', title: 'Imported from Kyudo',   desc: 'Import from the external Kyudo governance framework',             accent: '#8B5CF6' },
            { id: 'grc',   title: 'Import from GRC',       desc: 'Pull from ServiceNow GRC, Archer, or OneTrust',                  accent: '#10B981' },
          ].map(opt => {
            const sel = form.source === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setForm({ ...form, source: opt.id })}
                style={{
                  padding: 16, borderRadius: 10, cursor: 'pointer',
                  border: sel ? `2px solid ${opt.accent}` : '1px solid #E2E8F0',
                  backgroundColor: sel ? opt.accent + '12' : '#fff',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: opt.accent, marginBottom: 8 }} />
                <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 3 }}>{opt.title}</div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.4 }}>{opt.desc}</div>
              </div>
            );
          })}
        </div>

        {/* GRC provider dropdown — shown only when GRC selected */}
        {form.source === 'grc' && (
          <div style={{ marginTop: 12, backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: '#065F46', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
              <GitMerge size={13} color="#10B981" />
              GRC Provider — Select the instance to pull from
            </div>
            <select
              style={{ ...inputStyle, backgroundColor: '#fff' }}
              value={form.grcProvider ?? ''}
              onChange={e => setForm({ ...form, grcProvider: e.target.value })}
            >
              <option value="">Select GRC provider…</option>
              {GRC_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {form.grcProvider && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>
                The AI Agent will map this static GRC requirement to a <strong style={{ color: '#065F46' }}>Live Contextual Audit</strong> — linking the {form.grcProvider} policy definition directly to your SPOC-based email monitoring.
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Monitoring Personality ── */}
      <div style={field}>
        <label style={labelStyle}>Monitoring Personality</label>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Choose an AI agent personality that matches how this control should audit supplier behaviour.</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {PERSONALITIES.map(p => {
            const Icon = p.icon;
            const sel = form.personality === p.id;
            const presetChecks = PERSONALITY_CHECKS[p.id] ?? [];
            return (
              <div key={p.id}>
                <div
                  onClick={() => {
                    const newPers = sel ? '' : p.id;
                    setForm({ ...form, personality: newPers, selectedChecks: [] });
                    setSelectedChecks(new Set());
                    // pre-select all preset checks when switching personality
                    if (!sel) {
                      const allChecks = new Set(PERSONALITY_CHECKS[p.id] ?? []);
                      setSelectedChecks(allChecks);
                      setForm({ ...form, personality: p.id, selectedChecks: Array.from(allChecks) });
                    }
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '11px 14px', borderRadius: sel ? '10px 10px 0 0' : 10, cursor: 'pointer',
                    border: sel ? `2px solid ${p.color}` : '1px solid #E2E8F0',
                    borderBottom: sel ? `1px solid ${p.color}33` : sel ? 'none' : `1px solid #E2E8F0`,
                    backgroundColor: sel ? p.bg : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 16, height: 16, borderRadius: '50%', border: `2px solid ${sel ? p.color : '#CBD5E1'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {sel && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: p.color }} />}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: sel ? p.color + '22' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={16} color={sel ? p.color : '#94A3B8'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{p.title}</div>
                    <div style={{ fontSize: 11, color: '#94A3B8' }}>{p.sub}</div>
                  </div>
                  {sel && <div style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, backgroundColor: p.bg, color: p.color, padding: '2px 8px', borderRadius: 20, border: `1px solid ${p.color}44` }}>Selected</div>}
                </div>

                {/* ── Expanded check list when selected ── */}
                {sel && (
                  <div style={{ border: `2px solid ${p.color}`, borderTop: 'none', borderRadius: '0 0 10px 10px', backgroundColor: '#fff', padding: '12px 14px' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Anomaly Checks — {p.title}</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                      {[...presetChecks, ...customChecks].map(check => {
                        const checked = selectedChecks.has(check);
                        return (
                          <label key={check} onClick={() => toggleCheck(check)} style={{ display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer', padding: '6px 8px', borderRadius: 7, backgroundColor: checked ? p.bg : '#F8FAFC', border: `1px solid ${checked ? p.color + '44' : '#F1F5F9'}`, transition: 'all 0.12s' }}>
                            <div style={{ width: 16, height: 16, borderRadius: 4, border: `2px solid ${checked ? p.color : '#CBD5E1'}`, backgroundColor: checked ? p.color : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              {checked && <Check size={10} color="#fff" strokeWidth={3} />}
                            </div>
                            <span style={{ fontSize: 13, fontWeight: checked ? 600 : 400, color: checked ? p.color : '#334155' }}>{check}</span>
                          </label>
                        );
                      })}
                    </div>
                    {/* Custom check input */}
                    <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                      <input
                        value={customCheck}
                        onChange={e => setCustomCheck(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomCheck()}
                        placeholder="Add custom check…"
                        style={{ flex: 1, border: `1px dashed ${p.color}88`, borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', color: '#334155', backgroundColor: '#fff' }}
                      />
                      <button
                        onClick={addCustomCheck}
                        style={{ padding: '7px 12px', backgroundColor: p.color, color: '#fff', border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
                      >
                        + Add
                      </button>
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: '#94A3B8' }}>{selectedChecks.size} check{selectedChecks.size !== 1 ? 's' : ''} selected · Personality acts as preset anomaly bundle</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Control Classification ── */}
      <div style={field}>
        <label style={labelStyle}>Control Classification *</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {classifications.map(c => (
            <div
              key={c.id}
              onClick={() => setForm({ ...form, classification: c.id })}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                border: form.classification === c.id ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                backgroundColor: form.classification === c.id ? '#EFF6FF' : '#fff',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                border: form.classification === c.id ? '5px solid #0EA5E9' : '2px solid #CBD5E1',
                backgroundColor: '#fff',
              }} />
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{c.title}</div>
                <div style={{ fontSize: 13, color: '#64748B' }}>{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div>
          <label style={labelStyle}>Risk Level</label>
          <select style={{ ...inputStyle, appearance: 'none' }} value={form.risk} onChange={e => setForm({ ...form, risk: e.target.value })}>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div>
          <label style={labelStyle}>Tags</label>
          <input style={inputStyle} placeholder="Add tag..." value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ── Step 2 ──────────────────────────────────────────── */
const assetCategories = [
  { id: 'azure', name: 'Azure', desc: 'Microsoft Cloud', count: '312 assets', status: 'Connected', default: true },
  { id: 'gcp', name: 'GCP', desc: 'Google Cloud', count: '185 assets', status: 'Connected', default: true },
  { id: 'm365', name: 'Microsoft 365', desc: 'Productivity', count: '156 assets', status: 'Connected', default: true },
  { id: 'ad', name: 'Active Directory', desc: 'Identity & Access', count: '89 assets', status: 'Connected', default: true },
  { id: 'snow', name: 'ServiceNow', desc: 'IT Service Mgmt', count: '67 assets', status: 'Connected', default: false },
  { id: 'splunk', name: 'Splunk', desc: 'Security & SIEM', count: '38 assets', status: 'Degraded', default: false },
  { id: 'suppliers', name: 'Suppliers', desc: 'Third-party vendors', count: '48 suppliers', status: 'Connected', default: true },
];

function Step2({ form, setForm }: { form: any; setForm: any }) {
  const [selected, setSelected] = useState(new Set(assetCategories.filter(a => a.default).map(a => a.id)));
  const toggle = (id: string) => {
    const n = new Set(selected);
    n.has(id) ? n.delete(id) : n.add(id);
    setSelected(n);
  };
  return (
    <div>
      <div style={field}>
        <label style={labelStyle}>Asset Categories</label>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
          {assetCategories.map((cat, i) => (
            <div
              key={cat.id}
              onClick={() => toggle(cat.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                borderBottom: i < assetCategories.length - 1 ? '1px solid #F1F5F9' : 'none',
                cursor: 'pointer', backgroundColor: selected.has(cat.id) ? '#F8FAFF' : '#fff',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4, border: selected.has(cat.id) ? '2px solid #0EA5E9' : '2px solid #CBD5E1',
                backgroundColor: selected.has(cat.id) ? '#0EA5E9' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {selected.has(cat.id) && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{cat.name}</span>
                <span style={{ fontSize: 13, color: '#94A3B8', marginLeft: 8 }}>{cat.desc}</span>
              </div>
              <span style={{ fontSize: 12, color: '#64748B' }}>{cat.count}</span>
              <span style={{ fontSize: 11, fontWeight: 500, color: cat.status === 'Connected' ? '#10B981' : '#F59E0B', backgroundColor: cat.status === 'Connected' ? '#ECFDF5' : '#FFFBEB', padding: '2px 8px', borderRadius: 20 }}>
                ● {cat.status}
              </span>
            </div>
          ))}
        </div>
      </div>
      <div style={field}>
        <label style={labelStyle}>Scope Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {[
            { id: 'full', title: 'Full Scope', desc: 'All assets in selected categories auto-included' },
            { id: 'specific', title: 'Select Specific Assets', desc: 'Hand-pick individual assets by number' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setForm({ ...form, scopeMode: opt.id })}
              style={{
                padding: 16, borderRadius: 10, cursor: 'pointer',
                border: (form.scopeMode ?? 'full') === opt.id ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                backgroundColor: (form.scopeMode ?? 'full') === opt.id ? '#EFF6FF' : '#fff',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{opt.title}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Specific asset count — shown only when "specific" mode selected */}
      {(form.scopeMode ?? 'full') === 'specific' && (
        <div style={field}>
          <label style={labelStyle}>Number of Assets to Monitor *</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <input
              type="number"
              min={1}
              max={847}
              style={{ ...inputStyle, maxWidth: 180 }}
              placeholder="e.g. 150"
              value={form.assetCount || ''}
              onChange={e => setForm({ ...form, assetCount: e.target.value })}
            />
            <span style={{ fontSize: 13, color: '#64748B' }}>of 847 available assets</span>
          </div>
          {form.assetCount && Number(form.assetCount) > 0 && (
            <div style={{ marginTop: 8, backgroundColor: '#EFF6FF', border: '1px solid #BAE6FD', borderRadius: 8, padding: '8px 14px', fontSize: 13, color: '#0369A1' }}>
              {form.assetCount} specific asset{Number(form.assetCount) !== 1 ? 's' : ''} will be monitored by this control
            </div>
          )}
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>
            You can update this number at any time from the control settings.
          </div>
        </div>
      )}

      <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#065F46', marginBottom: 20 }}>
        {(form.scopeMode ?? 'full') === 'full'
          ? <>Total Available: <strong>847 Assets</strong> · Auto-selected · All assets in selected categories</>
          : <>Monitoring: <strong>{form.assetCount || 0} of 847 Assets</strong> · Specific selection mode</>
        }
      </div>
      <div style={field}>
        <label style={labelStyle}>Reference Document (optional)</label>
        <div style={{ border: '2px dashed #CBD5E1', borderRadius: 10, padding: 24, textAlign: 'center', color: '#94A3B8', fontSize: 13 }}>
          Drop reference document here or <span style={{ color: '#0EA5E9', cursor: 'pointer' }}>browse</span>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3 ──────────────────────────────────────────── */
const dataSources = [
  { id: 'api', label: 'API Integration', desc: 'Connect via REST or GraphQL', default: true },
  { id: 'siem', label: 'Logs / SIEM (Splunk)', desc: 'Ingest from log sources' },
  { id: 'ticket', label: 'Ticketing (ServiceNow)', desc: 'Pull from ticket systems', badge: 'Recommended', default: true },
  { id: 'docs', label: 'Uploaded Documents', desc: 'Manual evidence upload' },
  { id: 'task', label: 'Task Output', desc: 'Output from agent tasks' },
  { id: 'portal', label: 'Supplier Portal', desc: 'Responses from assessments' },
  { id: 'email', label: 'Email Monitoring', desc: 'Track supplier communications' },
];
const retentionOptions = ['30 days', '90 days', '1 year', '7 years'];

function Step3({ form, setForm }: { form: any; setForm: any }) {
  const [sources, setSources] = useState(new Set(dataSources.filter(d => d.default).map(d => d.id)));
  const [retention, setRetention] = useState('90 days');
  const toggleSource = (id: string) => { const n = new Set(sources); n.has(id) ? n.delete(id) : n.add(id); setSources(n); };
  return (
    <div>
      <div style={field}>
        <label style={labelStyle}>Data Sources</label>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, overflow: 'hidden' }}>
          {dataSources.map((src, i) => (
            <div
              key={src.id}
              onClick={() => toggleSource(src.id)}
              style={{
                display: 'flex', alignItems: 'center', gap: 12, padding: '11px 16px',
                borderBottom: i < dataSources.length - 1 ? '1px solid #F1F5F9' : 'none',
                cursor: 'pointer', backgroundColor: sources.has(src.id) ? '#F8FAFF' : '#fff',
              }}
            >
              <div style={{
                width: 18, height: 18, borderRadius: 4, border: sources.has(src.id) ? '2px solid #0EA5E9' : '2px solid #CBD5E1',
                backgroundColor: sources.has(src.id) ? '#0EA5E9' : '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                {sources.has(src.id) && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{src.label}</span>
                <span style={{ fontSize: 13, color: '#94A3B8', marginLeft: 8 }}>{src.desc}</span>
              </div>
              {src.badge && (
                <span style={{ fontSize: 11, fontWeight: 500, backgroundColor: '#FFFBEB', color: '#F59E0B', padding: '2px 8px', borderRadius: 20 }}>{src.badge}</span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email monitoring note — stakeholders are configured per Supplier/Agent, not per Control */}
      {sources.has('email') && (
        <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '12px 16px', marginBottom: 20, display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <Zap size={14} color="#0EA5E9" style={{ flexShrink: 0, marginTop: 2 }} />
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0369A1', marginBottom: 3 }}>Email Monitoring Enabled</div>
            <div style={{ fontSize: 12, color: '#0369A1', lineHeight: 1.55 }}>
              Stakeholder email contacts are configured per <strong>Supplier</strong> and per <strong>Agent</strong> — not at the control level. This keeps controls reusable across multiple suppliers. Assign this control to an agent to activate email intelligence.
            </div>
          </div>
        </div>
      )}

      {sources.has('api') && (
        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 16, marginBottom: 20 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 12 }}>API Configuration</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input style={inputStyle} placeholder="Endpoint URL" />
            <select style={{ ...inputStyle, appearance: 'none' }}><option>OAuth 2.0</option><option>API Key</option><option>JWT Bearer</option></select>
            <select style={{ ...inputStyle, appearance: 'none' }}><option>Hourly</option><option>Every 6 hrs</option><option>Daily</option><option>Weekly</option></select>
          </div>
        </div>
      )}
      <div style={field}>
        <label style={labelStyle}>Evidence Retention</label>
        <div style={{ display: 'flex', gap: 8 }}>
          {retentionOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setRetention(opt)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                backgroundColor: retention === opt ? '#0EA5E9' : '#fff',
                color: retention === opt ? '#fff' : '#64748B',
                border: `1px solid ${retention === opt ? '#0EA5E9' : '#E2E8F0'}`,
              }}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Step 4 ──────────────────────────────────────────── */
const triggerModes = [
  { id: 'manual', title: 'Manual', desc: 'Trigger evaluation on demand' },
  { id: 'scheduled', title: 'Scheduled', desc: 'Run on a recurring schedule' },
  { id: 'event', title: 'Event-Driven', desc: 'Trigger via webhook event' },
];
const cronPresets = ['Every hour', 'Every 6 hrs', 'Daily', 'Weekly', 'Monthly'];

function Step4({ form, setForm }: { form: any; setForm: any }) {
  const [triggerMode, setTriggerMode] = useState('scheduled');
  const [cronExpr, setCronExpr] = useState('0 0 * * *');
  const [activePreset, setActivePreset] = useState('Daily');
  return (
    <div>
      <div style={field}>
        <label style={labelStyle}>Trigger Mode</label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          {triggerModes.map(m => (
            <div
              key={m.id}
              onClick={() => setTriggerMode(m.id)}
              style={{
                padding: 16, borderRadius: 10, cursor: 'pointer', textAlign: 'center',
                border: triggerMode === m.id ? '2px solid #0EA5E9' : '1px solid #E2E8F0',
                backgroundColor: triggerMode === m.id ? '#EFF6FF' : '#fff',
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{m.title}</div>
              <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
      {triggerMode === 'scheduled' && (
        <div>
          <div style={field}>
            <label style={labelStyle}>Cron Expression</label>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input style={{ ...inputStyle, fontFamily: 'monospace', maxWidth: 200 }} value={cronExpr} onChange={e => setCronExpr(e.target.value)} />
              <span style={{ fontSize: 13, color: '#64748B' }}>Every day at midnight UTC</span>
            </div>
          </div>
          <div style={field}>
            <label style={labelStyle}>Quick Presets</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {cronPresets.map(p => (
                <button
                  key={p}
                  onClick={() => setActivePreset(p)}
                  style={{
                    padding: '6px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    backgroundColor: activePreset === p ? '#0EA5E9' : '#fff',
                    color: activePreset === p ? '#fff' : '#64748B',
                    border: `1px solid ${activePreset === p ? '#0EA5E9' : '#E2E8F0'}`,
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <label style={labelStyle}>First Evaluation Date</label>
              <input type="date" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Time</label>
              <input type="time" style={inputStyle} />
            </div>
          </div>
        </div>
      )}
      {triggerMode === 'event' && (
        <div>
          <div style={field}>
            <label style={labelStyle}>Webhook URL</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input readOnly style={{ ...inputStyle, backgroundColor: '#F8FAFC', flex: 1 }} value="https://tprm.example.com/webhook/ctrl-xxxx" />
              <button style={{ padding: '10px 14px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, cursor: 'pointer', fontSize: 12, color: '#64748B' }}>Copy</button>
            </div>
          </div>
          <div style={field}>
            <label style={labelStyle}>Event Filter</label>
            <input style={inputStyle} placeholder="e.g., incident.created" />
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Step 5 ──────────────────────────────────────────── */
const ANOMALY_PRESETS = [
  { id: 'sow_date',     label: 'SOW Date vs. Service Start Date',  color: '#EF4444' },
  { id: 'payment_po',   label: 'Payment Without PO Approval',      color: '#EF4444' },
  { id: 'milestone',    label: 'Milestone Slip > 7 Days',          color: '#F59E0B' },
  { id: 'silent_feed',  label: 'Silent SFTP / API Feed',           color: '#F59E0B' },
  { id: 'pii_gap',      label: 'Undeclared PII in Data Stream',    color: '#EF4444' },
  { id: 'cert_expiry',  label: 'Certification Expiry < 30 Days',   color: '#F59E0B' },
  { id: 'dup_invoice',  label: 'Duplicate Invoice Detection',      color: '#64748B' },
  { id: 'cred_reuse',   label: 'Credential Reuse Detection',       color: '#64748B' },
];

const autoActions = [
  { id: 'ticket', label: 'Create ticket in ServiceNow', default: true },
  { id: 'email', label: 'Send email alert', default: true },
  { id: 'slack', label: 'Notify via Slack / Teams' },
  { id: 'score', label: 'Reduce supplier risk score automatically' },
  { id: 'review', label: 'Flag for human review', default: true },
  { id: 'quarantine', label: 'Quarantine asset / data' },
];

function ToggleSwitch({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} style={{ width: 40, height: 22, borderRadius: 99, backgroundColor: on ? '#0EA5E9' : '#CBD5E1', position: 'relative', cursor: 'pointer', flexShrink: 0 }}>
      <div style={{ position: 'absolute', top: 2, left: on ? 20 : 2, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </div>
  );
}

function Step5({ form, setForm }: { form: any; setForm: any }) {
  const [actions, setActions] = useState(new Set(autoActions.filter(a => a.default).map(a => a.id)));
  const [confidence, setConfidence] = useState(75);
  const [storeEvidence, setStoreEvidence] = useState(true);
  const [humanReview, setHumanReview] = useState(false);
  const [truthGap, setTruthGap] = useState(false);
  const [selectedAnomalies, setSelectedAnomalies] = useState<Set<string>>(new Set());
  const toggleAction  = (id: string) => { const n = new Set(actions); n.has(id) ? n.delete(id) : n.add(id); setActions(n); };
  const toggleAnomaly = (id: string) => { const n = new Set(selectedAnomalies); n.has(id) ? n.delete(id) : n.add(id); setSelectedAnomalies(n); };

  return (
    <div>
      <div style={field}>
        <label style={labelStyle}>Evaluation Instructions</label>
        <textarea
          rows={6}
          style={{ ...inputStyle, resize: 'vertical' }}
          placeholder="Describe in natural language how the AI should evaluate this control..."
          maxLength={500}
        />
        <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 4 }}>Max 500 characters</div>
      </div>

      {/* ── Anomaly Detection Presets ── */}
      <div style={field}>
        <label style={labelStyle}>Anomaly Detection Presets</label>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 10 }}>Select known anomaly patterns the AI should watch for. These become primary trigger conditions.</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {ANOMALY_PRESETS.map(a => {
            const sel = selectedAnomalies.has(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggleAnomaly(a.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px',
                  borderRadius: 20, fontSize: 12, fontWeight: sel ? 600 : 500, cursor: 'pointer',
                  transition: 'all 0.15s',
                  backgroundColor: sel ? a.color + '18' : '#F8FAFC',
                  color: sel ? a.color : '#64748B',
                  border: sel ? `1.5px solid ${a.color}` : '1px solid #E2E8F0',
                }}
              >
                {sel && <Check size={11} />}
                {a.label}
              </button>
            );
          })}
        </div>
        {selectedAnomalies.size > 0 && (
          <div style={{ marginTop: 8, fontSize: 12, color: '#10B981', display: 'flex', alignItems: 'center', gap: 4 }}>
            <CheckCircle2 size={11} color="#10B981" />
            {selectedAnomalies.size} anomaly pattern{selectedAnomalies.size > 1 ? 's' : ''} added to this control
          </div>
        )}
      </div>

      <div style={field}>
        <label style={labelStyle}>Confidence Threshold</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <input type="range" min={0} max={100} value={confidence} onChange={e => setConfidence(Number(e.target.value))} style={{ flex: 1 }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', backgroundColor: '#0EA5E9', padding: '3px 10px', borderRadius: 6 }}>{confidence}%</span>
        </div>
        <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Below this threshold, AI will flag for human review instead of auto-deciding.</div>
      </div>
      <div style={field}>
        <label style={labelStyle}>Auto Actions on Fail</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {autoActions.map(a => (
            <label key={a.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#334155' }}>
              <div
                onClick={() => toggleAction(a.id)}
                style={{
                  width: 18, height: 18, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
                  border: actions.has(a.id) ? '2px solid #0EA5E9' : '2px solid #CBD5E1',
                  backgroundColor: actions.has(a.id) ? '#0EA5E9' : '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {actions.has(a.id) && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              {a.label}
            </label>
          ))}
        </div>
      </div>
      <div style={field}>
        <label style={labelStyle}>Remediation Suggestion</label>
        <textarea rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="What should the agent recommend when this control fails?" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToggleSwitch on={storeEvidence} onChange={() => setStoreEvidence(!storeEvidence)} />
          <span style={{ fontSize: 14, color: '#334155' }}>Store evidence snapshots for each evaluation</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ToggleSwitch on={humanReview} onChange={() => setHumanReview(!humanReview)} />
          <span style={{ fontSize: 14, color: '#334155' }}>Require human approval before marking as compliant</span>
        </div>

        {/* ── Truth Gap Detection ── */}
        <div style={{
          marginTop: 4, borderRadius: 10, padding: '12px 16px', transition: 'all 0.2s',
          border: `1px solid ${truthGap ? '#FECACA' : '#E2E8F0'}`,
          backgroundColor: truthGap ? '#FEF2F2' : '#F8FAFC',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: truthGap ? 10 : 0 }}>
            <ToggleSwitch on={truthGap} onChange={() => setTruthGap(!truthGap)} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                <AlertTriangle size={14} color={truthGap ? '#EF4444' : '#94A3B8'} />
                <span style={{ fontSize: 14, fontWeight: 600, color: truthGap ? '#DC2626' : '#334155' }}>Truth Gap Detection</span>
              </div>
              <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>When enabled, failures automatically trigger auditing signals in the Knowledge Graph.</div>
            </div>
          </div>
          {truthGap && (
            <div style={{ backgroundColor: '#fff', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: '#DC2626', lineHeight: 1.5 }}>A <strong>pulsing red AlertTriangle</strong> will appear on the supplier node in the Knowledge Graph whenever this control fails.</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <AlertTriangle size={12} color="#EF4444" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 12, color: '#DC2626', lineHeight: 1.5 }}>The supplier's <strong>Truth Match %</strong> is automatically reduced by the agent, reflecting any declared vs. detected PII gap.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Step 6 ──────────────────────────────────────────── */
const availableControlOptions = [
  'MFA Enforcement', 'Encryption at Rest', 'Access Review Policy',
  'Network Segmentation', 'Patch Management', 'Data Classification Policy',
  'Incident Response Plan', 'Backup Verification', 'Vulnerability Scanning', 'Privileged Access Mgmt',
];

function Step6({ form, setForm }: { form: any; setForm: any }) {
  const [dependsOn, setDependsOn] = useState([
    { id: 'mfa', label: 'MFA Enforcement', type: 'Blocking' },
    { id: 'enc', label: 'Encryption at Rest', type: 'Warning' },
  ]);
  const [cascade, setCascade] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const removeDep = (id: string) => setDependsOn(prev => prev.filter(d => d.id !== id));
  const toggleType = (id: string) => setDependsOn(prev => prev.map(d => d.id === id ? { ...d, type: d.type === 'Blocking' ? 'Warning' : 'Blocking' } : d));
  const addDep = (label: string) => {
    if (dependsOn.find(d => d.label === label)) return;
    setDependsOn(prev => [...prev, { id: label.toLowerCase().replace(/\s/g, '_'), label, type: 'Warning' }]);
    setDropdownOpen(false);
  };

  const alreadyAdded = new Set(dependsOn.map(d => d.label));

  return (
    <div>
      <div style={field}>
        <label style={labelStyle}>Depends On</label>
        {/* Dropdown selector */}
        <div style={{ position: 'relative', marginBottom: 10 }}>
          <div
            onClick={() => setDropdownOpen(o => !o)}
            style={{
              border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 14px',
              cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              backgroundColor: '#fff', fontSize: 14, color: '#94A3B8',
            }}
          >
            <span>Select a control to add as dependency...</span>
            <ChevronDown size={14} color="#94A3B8" />
          </div>
          {dropdownOpen && (
            <div style={{
              position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0, zIndex: 50,
              backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8,
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)', maxHeight: 220, overflowY: 'auto',
            }}>
              {availableControlOptions.filter(c => !alreadyAdded.has(c)).map(ctrl => (
                <div
                  key={ctrl}
                  onClick={() => addDep(ctrl)}
                  style={{ padding: '10px 14px', cursor: 'pointer', fontSize: 13, color: '#334155', borderBottom: '1px solid #F1F5F9' }}
                  className="hover:bg-[#F0F9FF]"
                >
                  {ctrl}
                </div>
              ))}
              {availableControlOptions.filter(c => !alreadyAdded.has(c)).length === 0 && (
                <div style={{ padding: '10px 14px', fontSize: 13, color: '#94A3B8' }}>All controls added</div>
              )}
            </div>
          )}
        </div>

        {/* Selected dependency chips */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
          {dependsOn.map(dep => (
            <div
              key={dep.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
                backgroundColor: dep.type === 'Blocking' ? '#FEF2F2' : '#FFFBEB',
                border: `1px solid ${dep.type === 'Blocking' ? '#FECACA' : '#FDE68A'}`,
                color: dep.type === 'Blocking' ? '#EF4444' : '#F59E0B',
              }}
            >
              <span style={{ fontSize: 13, fontWeight: 600 }}>{dep.label}</span>
              <button
                onClick={() => toggleType(dep.id)}
                title="Toggle Blocking / Warning"
                style={{ fontSize: 11, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 500 }}
              >
                {dep.type}
              </button>
              <button onClick={() => removeDep(dep.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
                <X size={12} />
              </button>
            </div>
          ))}
          {dependsOn.length === 0 && (
            <span style={{ fontSize: 13, color: '#94A3B8' }}>No dependencies added yet</span>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 6 }}>Click the type badge on a chip to toggle Blocking ↔ Warning</div>
      </div>
      <div style={field}>
        <label style={labelStyle}>Impacts (Controls that depend on this)</label>
        <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 12, fontSize: 13, color: '#64748B' }}>
          Access Review Policy · Vulnerability Scanning
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <div onClick={() => setCascade(!cascade)} style={{ width: 40, height: 22, borderRadius: 99, backgroundColor: cascade ? '#0EA5E9' : '#CBD5E1', position: 'relative', cursor: 'pointer' }}>
          <div style={{ position: 'absolute', top: 2, left: cascade ? 20 : 2, width: 18, height: 18, borderRadius: '50%', backgroundColor: '#fff', transition: 'left 0.2s' }} />
        </div>
        <span style={{ fontSize: 14, color: '#334155' }}>When this control fails, automatically flag all dependent controls</span>
      </div>
      {/* Dependency Graph Preview — PII flow aware */}
      <div style={field}>
        <label style={labelStyle}>Dependency Graph Preview</label>
        <div style={{ fontSize: 12, color: '#64748B', marginBottom: 8 }}>Shows how this control sits in the dependency chain and its impact on Bi-Directional PII flows.</div>
        <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: 20, backgroundColor: '#F8FAFC', display: 'flex', justifyContent: 'center' }}>
          <svg width={380} height={200} style={{ fontFamily: 'Inter, sans-serif' }}>
            <defs>
              <marker id="arrow-share"  markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#0EA5E9"/></marker>
              <marker id="arrow-ingest" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#10B981"/></marker>
              <marker id="arrow-dep"    markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="#94A3B8"/></marker>
            </defs>

            {/* Dep edges */}
            <line x1={190} y1={60} x2={100} y2={120} stroke="#CBD5E1" strokeWidth={1.5} markerEnd="url(#arrow-dep)" />
            <line x1={190} y1={60} x2={280} y2={120} stroke="#CBD5E1" strokeWidth={1.5} markerEnd="url(#arrow-dep)" />
            {/* PII flow edges */}
            <line x1={190} y1={80} x2={100} y2={160} stroke="#0EA5E9" strokeWidth={2} strokeDasharray="5,3" markerEnd="url(#arrow-share)" />
            <line x1={100} y1={160} x2={190} y2={80} stroke="#10B981" strokeWidth={2} strokeDasharray="5,3" markerEnd="url(#arrow-ingest)" />

            {/* Center — This Control */}
            <circle cx={190} cy={44} r={34} fill="#EFF6FF" stroke="#0EA5E9" strokeWidth={2.5} />
            <text x={190} y={40} textAnchor="middle" fill="#0EA5E9" fontSize={9} fontWeight={700}>This</text>
            <text x={190} y={51} textAnchor="middle" fill="#0EA5E9" fontSize={9} fontWeight={700}>Control</text>

            {/* MFA node */}
            <circle cx={100} cy={138} r={28} fill="#ECFDF5" stroke="#10B981" strokeWidth={2} />
            <text x={100} y={134} textAnchor="middle" fill="#10B981" fontSize={9} fontWeight={600}>MFA</text>
            <text x={100} y={145} textAnchor="middle" fill="#10B981" fontSize={8}>Blocking</text>

            {/* Encrypt node */}
            <circle cx={280} cy={138} r={28} fill="#FFFBEB" stroke="#F59E0B" strokeWidth={2} />
            <text x={280} y={134} textAnchor="middle" fill="#F59E0B" fontSize={9} fontWeight={600}>Encrypt</text>
            <text x={280} y={145} textAnchor="middle" fill="#F59E0B" fontSize={8}>Warning</text>

            {/* Supplier node */}
            <circle cx={100} cy={185} r={18} fill="#F8FAFC" stroke="#64748B" strokeWidth={1.5} />
            <text x={100} y={189} textAnchor="middle" fill="#64748B" fontSize={8}>Supplier</text>

            {/* Legend */}
            <line x1={220} y1={170} x2={240} y2={170} stroke="#0EA5E9" strokeWidth={2} strokeDasharray="4,2" />
            <text x={244} y={173} fill="#0EA5E9" fontSize={8}>Share →</text>
            <line x1={220} y1={183} x2={240} y2={183} stroke="#10B981" strokeWidth={2} strokeDasharray="4,2" />
            <text x={244} y={186} fill="#10B981" fontSize={8}>← Ingest</text>
            <line x1={220} y1={196} x2={240} y2={196} stroke="#CBD5E1" strokeWidth={1.5} />
            <text x={244} y={199} fill="#94A3B8" fontSize={8}>Dependency</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ── Review Screen ───────────────────────────────────── */
function ReviewScreen({ form, onActivate }: { form: any; onActivate: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[
          { title: 'Basic Info', items: [['Name', form.name || 'MFA Enforcement Policy'], ['Classification', form.classification || 'Technical'], ['Risk', form.risk || 'High']] },
          { title: 'Asset Scope', items: [['Scope Mode', 'Full Scope'], ['Total Assets', '847']] },
          { title: 'Data Source', items: [['Sources', 'API Integration, Ticketing'], ['Retention', '90 days']] },
          { title: 'Trigger Config', items: [['Mode', 'Scheduled'], ['Schedule', 'Daily at midnight UTC']] },
          { title: 'AI Behaviour', items: [['Confidence Threshold', '75%'], ['Evidence', 'Enabled']] },
          { title: 'Dependencies', items: [['Depends On', '2 controls'], ['Failure Cascade', 'Off']] },
        ].map(section => (
          <div key={section.title} style={{ ...card, padding: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>{section.title}</div>
            {section.items.map(([k, v]) => (
              <div key={k} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 13, color: '#94A3B8' }}>{k}</span>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#334155' }}>{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '14px 20px', fontSize: 14, color: '#065F46', fontWeight: 500 }}>
        Estimated Coverage: <strong>847 assets</strong> will be monitored by this control
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
        <GhostBtn>Save as Draft</GhostBtn>
        <PrimaryBtn onClick={onActivate}>Activate Control</PrimaryBtn>
      </div>
    </div>
  );
}

/* ── Success Screen ──────────────────────────────────── */
function SuccessScreen({ onViewControls, onCreateAnother }: { onViewControls: () => void; onCreateAnother: () => void }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 24px', textAlign: 'center' }}>
      <CheckCircle2 size={64} color="#10B981" strokeWidth={1.5} />
      <h2 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: '16px 0 8px' }}>Control Activated!</h2>
      <p style={{ fontSize: 14, color: '#64748B', margin: '0 0 28px' }}>MFA Enforcement Policy is now live and monitoring 847 assets</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <PrimaryBtn onClick={onViewControls}>View Controls</PrimaryBtn>
        <GhostBtn onClick={onCreateAnother}>Create Another</GhostBtn>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function CreateControl() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isReview, setIsReview] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', source: 'local', classification: '',
    risk: 'High', tags: '', scopeMode: 'full',
  });

  const canNext = form.name.trim().length > 0 && form.classification.length > 0;

  function handleActivate() {
    setIsActivating(true);
    setTimeout(() => {
      setIsActivating(false);
      setIsSuccess(true);
      toast.success(`Control "${form.name || 'MFA Enforcement Policy'}" activated! Monitoring 847 assets.`);
    }, 1600);
  }

  const stepContent: Record<number, React.ReactNode> = {
    1: <Step1 form={form} setForm={setForm} />,
    2: <Step2 form={form} setForm={setForm} />,
    3: <Step3 form={form} setForm={setForm} />,
    4: <Step4 form={form} setForm={setForm} />,
    5: <Step5 form={form} setForm={setForm} />,
    6: <Step6 form={form} setForm={setForm} />,
  };

  if (isSuccess) {
    return (
      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        <div style={{ ...card, padding: 0 }}>
          <SuccessScreen onViewControls={() => navigate('/controls')} onCreateAnother={() => { setIsSuccess(false); setStep(1); setForm({ name: '', description: '', source: 'local', classification: '', risk: 'High', tags: '', scopeMode: 'full' }); }} />
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, display: 'flex', flexDirection: 'column', gap: 0 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/controls')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 12, padding: 0 }}
          className="hover:text-[#0EA5E9]"
        >
          <ArrowLeft size={16} /> Back to Controls
        </button>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Create Control</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Configure a new governance control</p>
      </div>

      {/* Stepper */}
      {!isReview && <StepperBar currentStep={step} />}

      {/* Content Card */}
      <div style={{ ...card, padding: 32 }}>
        {isReview ? (
          <ReviewScreen form={form} onActivate={handleActivate} />
        ) : (
          <>
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>
                Step {step} — {STEPS[step - 1].label}
              </h3>
            </div>
            {stepContent[step]}
            {/* Navigation */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24, paddingTop: 20, borderTop: '1px solid #E2E8F0' }}>
              <div>
                {step > 1 && <GhostBtn onClick={() => setStep(s => s - 1)}>← Back</GhostBtn>}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                {step < 6 ? (
                  <PrimaryBtn onClick={() => setStep(s => s + 1)}>
                    Next →
                  </PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={() => setIsReview(true)}>Review & Activate →</PrimaryBtn>
                )}
              </div>
            </div>
          </>
        )}
        {isActivating && (
          <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(255,255,255,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
              <Loader2 size={24} color="#0EA5E9" style={{ animation: 'spin 1s linear infinite' }} />
              Activating...
            </div>
          </div>
        )}
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
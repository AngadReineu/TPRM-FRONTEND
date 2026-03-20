import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Check,
  Loader2,
  CheckCircle2,
  X,
  ChevronDown,
  Handshake,
  Truck,
  ShieldCheck,
  Scale,
  AlertTriangle,
  Zap,
  GitMerge,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import { StepperBar } from '../components/StepperBar';
import { createControl } from '../services/controls.data';
import type { Control } from '../types';

/* ---- Step Meta ---- */
const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Target Asset Scope' },
  { id: 3, label: 'Data Source' },
  { id: 4, label: 'Trigger Config' },
  { id: 5, label: 'AI Behaviour' },
  { id: 6, label: 'Dependencies' },
];

/* ---- Shared input class string ---- */
const INPUT_CLS = "w-full box-border py-2.5 px-3.5 text-sm text-[#334155] border border-[#E2E8F0] rounded-lg outline-none bg-white font-[Inter,sans-serif]";

/* ---- Tiny button components ---- */
function PrimaryBtn({
  onClick,
  disabled,
  children,
}: {
  onClick?: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer ${disabled ? 'bg-[#CBD5E1]' : 'bg-[#0EA5E9] hover:bg-sky-600'}`}
    >
      {children}
    </button>
  );
}

function GhostBtn({
  onClick,
  children,
}: {
  onClick?: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="bg-white text-slate-700 border border-slate-200 rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer"
    >
      {children}
    </button>
  );
}

/* ---- Data constants ---- */
const classifications = [
  { id: 'Technical', title: 'Technical', desc: 'Automated technical checks on systems and infrastructure' },
  { id: 'Process', title: 'Process', desc: 'Operational procedures and SLA adherence' },
  { id: 'Document', title: 'Document', desc: 'Policy documents and certification validity' },
  { id: 'Expected Response', title: 'Expected Response', desc: 'Behavioral outcomes and response timelines' },
];

const PERSONALITIES = [
  { id: 'consulting', icon: Handshake, title: 'Consulting', sub: 'SOW & Payment Auditor', color: '#0EA5E9', bg: '#EFF6FF' },
  { id: 'operations', icon: Truck, title: 'Operations', sub: 'SLA & Logistics Monitor', color: '#10B981', bg: '#ECFDF5' },
  { id: 'security', icon: ShieldCheck, title: 'Data Security', sub: 'PII & Encryption Watchdog', color: '#8B5CF6', bg: '#F5F3FF' },
  { id: 'regulatory', icon: Scale, title: 'Regulatory', sub: 'Compliance & Audit Trail', color: '#F59E0B', bg: '#FFFBEB' },
];

const PERSONALITY_CHECKS: Record<string, string[]> = {
  consulting: ['SOW validation', 'Payment mismatch detection', 'Invoice discrepancy', 'SLA breach monitoring', 'Approval chain anomaly'],
  operations: ['SLA timing', 'Volume mismatch', 'Delivery delay'],
  security: ['Undeclared PII detection', 'Encryption enforcement', 'Access misuse', 'Data retention violation'],
  regulatory: ['Certification expiry', 'Audit documentation missing', 'Compliance breach'],
};

const GRC_PROVIDERS = ['ServiceNow GRC', 'Archer (RSA)', 'OneTrust', 'MetricStream', 'IBM OpenPages'];

const assetCategories = [
  { id: 'azure', name: 'Azure', desc: 'Microsoft Cloud', count: '312 assets', status: 'Connected', default: true },
  { id: 'gcp', name: 'GCP', desc: 'Google Cloud', count: '185 assets', status: 'Connected', default: true },
  { id: 'm365', name: 'Microsoft 365', desc: 'Productivity', count: '156 assets', status: 'Connected', default: true },
  { id: 'ad', name: 'Active Directory', desc: 'Identity & Access', count: '89 assets', status: 'Connected', default: true },
  { id: 'snow', name: 'ServiceNow', desc: 'IT Service Mgmt', count: '67 assets', status: 'Connected', default: false },
  { id: 'splunk', name: 'Splunk', desc: 'Security & SIEM', count: '38 assets', status: 'Degraded', default: false },
  { id: 'suppliers', name: 'Suppliers', desc: 'Third-party vendors', count: '48 suppliers', status: 'Connected', default: true },
];

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

const triggerModes = [
  { id: 'manual', title: 'Manual', desc: 'Trigger evaluation on demand' },
  { id: 'scheduled', title: 'Scheduled', desc: 'Run on a recurring schedule' },
  { id: 'event', title: 'Event-Driven', desc: 'Trigger via webhook event' },
];

const cronPresets = ['Every hour', 'Every 6 hrs', 'Daily', 'Weekly', 'Monthly'];

const ANOMALY_PRESETS = [
  { id: 'sow_date', label: 'SOW Date vs. Service Start Date', color: '#EF4444' },
  { id: 'payment_po', label: 'Payment Without PO Approval', color: '#EF4444' },
  { id: 'milestone', label: 'Milestone Slip > 7 Days', color: '#F59E0B' },
  { id: 'silent_feed', label: 'Silent SFTP / API Feed', color: '#F59E0B' },
  { id: 'pii_gap', label: 'Undeclared PII in Data Stream', color: '#EF4444' },
  { id: 'cert_expiry', label: 'Certification Expiry < 30 Days', color: '#F59E0B' },
  { id: 'dup_invoice', label: 'Duplicate Invoice Detection', color: '#64748B' },
  { id: 'cred_reuse', label: 'Credential Reuse Detection', color: '#64748B' },
];

const autoActions = [
  { id: 'ticket', label: 'Create ticket in ServiceNow', default: true },
  { id: 'email', label: 'Send email alert', default: true },
  { id: 'slack', label: 'Notify via Slack / Teams' },
  { id: 'score', label: 'Reduce supplier risk score automatically' },
  { id: 'review', label: 'Flag for human review', default: true },
  { id: 'quarantine', label: 'Quarantine asset / data' },
];

const availableControlOptions = [
  'MFA Enforcement', 'Encryption at Rest', 'Access Review Policy',
  'Network Segmentation', 'Patch Management', 'Data Classification Policy',
  'Incident Response Plan', 'Backup Verification', 'Vulnerability Scanning', 'Privileged Access Mgmt',
];

/* ---- Toggle used inside Step 5 ---- */
function InlineToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div
      onClick={onChange}
      className={`relative cursor-pointer shrink-0 w-10 h-[22px] rounded-full ${on ? 'bg-[#0EA5E9]' : 'bg-[#CBD5E1]'}`}
    >
      <div
        className={`absolute bg-white rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.2)] top-[2px] w-[18px] h-[18px] transition-[left] duration-200 ${on ? 'left-5' : 'left-[2px]'}`}
      />
    </div>
  );
}

/* ================================================================
   Step 1 -- Basic Info
   ================================================================ */
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
    const n = new Set(selectedChecks);
    n.add(customCheck.trim());
    setSelectedChecks(n);
    setForm({ ...form, selectedChecks: Array.from(n) });
    setCustomCheck('');
  };

  return (
    <div>
      {/* Control Name */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Control Name *</label>
        <input
          className={INPUT_CLS}
          placeholder="e.g., MFA Enforcement Policy"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
        />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Description</label>
        <textarea
          rows={4}
          className={`${INPUT_CLS} resize-y`}
          placeholder="Describe the purpose and scope..."
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
      </div>

      {/* Control Source */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Control Source</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'local', title: 'Local Control', desc: 'Create and manage locally within Kyudo', accent: '#0EA5E9' },
            { id: 'kyudo', title: 'Imported from Kyudo', desc: 'Import from the external Kyudo governance framework', accent: '#8B5CF6' },
            { id: 'grc', title: 'Import from GRC', desc: 'Pull from ServiceNow GRC, Archer, or OneTrust', accent: '#10B981' },
          ].map(opt => {
            const sel = form.source === opt.id;
            return (
              <div
                key={opt.id}
                onClick={() => setForm({ ...form, source: opt.id })}
                className="p-4 rounded-[10px] cursor-pointer transition-all duration-150"
                style={{
                  border: sel ? `2px solid ${opt.accent}` : '1px solid #E2E8F0',
                  backgroundColor: sel ? opt.accent + '12' : '#fff',
                }}
              >
                <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: opt.accent }} />
                <div className="text-[13px] font-bold text-slate-900 mb-0.5">{opt.title}</div>
                <div className="text-xs text-slate-500 leading-snug">{opt.desc}</div>
              </div>
            );
          })}
        </div>

        {/* GRC provider dropdown */}
        {form.source === 'grc' && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-[10px] p-4">
            <div className="text-xs font-bold text-emerald-900 mb-2.5 flex items-center gap-1.5">
              <GitMerge size={13} className="text-emerald-500" />
              GRC Provider &mdash; Select the instance to pull from
            </div>
            <select
              className={INPUT_CLS}
              value={form.grcProvider ?? ''}
              onChange={e => setForm({ ...form, grcProvider: e.target.value })}
            >
              <option value="">Select GRC provider&hellip;</option>
              {GRC_PROVIDERS.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
            {form.grcProvider && (
              <div className="mt-2 text-xs text-slate-500 leading-relaxed">
                The AI Agent will map this static GRC requirement to a <strong className="text-emerald-900">Live Contextual Audit</strong> &mdash; linking the {form.grcProvider} policy definition directly to your SPOC-based email monitoring.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Monitoring Personality */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Monitoring Personality</label>
        <div className="text-xs text-slate-500 mb-2.5">Choose an AI agent personality that matches how this control should audit supplier behaviour.</div>
        <div className="flex flex-col gap-2">
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
                    if (!sel) {
                      const allChecks = new Set(PERSONALITY_CHECKS[p.id] ?? []);
                      setSelectedChecks(allChecks);
                      setForm({ ...form, personality: p.id, selectedChecks: Array.from(allChecks) });
                    }
                  }}
                  className="flex items-center gap-3 px-3.5 py-[11px] cursor-pointer transition-all duration-150"
                  style={{
                    borderRadius: sel ? '10px 10px 0 0' : 10,
                    border: sel ? `2px solid ${p.color}` : '1px solid #E2E8F0',
                    borderBottom: sel ? `1px solid ${p.color}33` : `1px solid #E2E8F0`,
                    backgroundColor: sel ? p.bg : '#fff',
                  }}
                >
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center shrink-0"
                    style={{ border: `2px solid ${sel ? p.color : '#CBD5E1'}` }}
                  >
                    {sel && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />}
                  </div>
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: sel ? p.color + '22' : '#F1F5F9' }}
                  >
                    <Icon size={16} color={sel ? p.color : '#94A3B8'} />
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-900">{p.title}</div>
                    <div className="text-[11px] text-slate-400">{p.sub}</div>
                  </div>
                  {sel && (
                    <div
                      className="ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: p.bg, color: p.color, border: `1px solid ${p.color}44` }}
                    >
                      Selected
                    </div>
                  )}
                </div>

                {/* Expanded check list */}
                {sel && (
                  <div className="bg-white p-3 px-3.5" style={{ border: `2px solid ${p.color}`, borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                      Anomaly Checks &mdash; {p.title}
                    </div>
                    <div className="flex flex-col gap-[7px]">
                      {[...presetChecks, ...customChecks].map((check, idx) => {
                        const checked = selectedChecks.has(check);
                        return (
                          <label
                            key={`${idx}-${check}`}
                            onClick={() => toggleCheck(check)}
                            className="flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded-[7px] transition-all duration-100"
                            style={{
                              backgroundColor: checked ? p.bg : '#F8FAFC',
                              border: `1px solid ${checked ? p.color + '44' : '#F1F5F9'}`,
                            }}
                          >
                            <div
                              className="w-4 h-4 rounded flex items-center justify-center shrink-0"
                              style={{
                                border: `2px solid ${checked ? p.color : '#CBD5E1'}`,
                                backgroundColor: checked ? p.color : '#fff',
                              }}
                            >
                              {checked && <Check size={10} color="#fff" strokeWidth={3} />}
                            </div>
                            <span
                              className="text-[13px]"
                              style={{ fontWeight: checked ? 600 : 400, color: checked ? p.color : '#334155' }}
                            >
                              {check}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                    <div className="flex gap-2 mt-2.5">
                      <input
                        value={customCheck}
                        onChange={e => setCustomCheck(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addCustomCheck()}
                        placeholder="Add custom check\u2026"
                        className="flex-1 rounded-[7px] px-2.5 py-[7px] text-xs outline-none text-slate-700 bg-white"
                        style={{ border: `1px dashed ${p.color}88` }}
                      />
                      <button
                        onClick={addCustomCheck}
                        className="px-3 py-[7px] text-white border-none rounded-[7px] text-xs font-semibold cursor-pointer"
                        style={{ backgroundColor: p.color }}
                      >
                        + Add
                      </button>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-400">
                      {selectedChecks.size} check{selectedChecks.size !== 1 ? 's' : ''} selected &middot; Personality acts as preset anomaly bundle
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Control Classification */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Control Classification *</label>
        <div className="flex flex-col gap-2.5">
          {classifications.map(c => (
            <div
              key={c.id}
              onClick={() => setForm({ ...form, classification: c.id })}
              className={`flex items-center gap-3 px-4 py-3 rounded-[10px] cursor-pointer ${form.classification === c.id ? 'border-2 border-[#0EA5E9] bg-[#EFF6FF]' : 'border border-[#E2E8F0] bg-white'}`}
            >
              <div
                className={`w-[18px] h-[18px] rounded-full shrink-0 bg-white ${form.classification === c.id ? 'border-[5px] border-[#0EA5E9]' : 'border-2 border-[#CBD5E1]'}`}
              />
              <div>
                <div className="text-sm font-semibold text-slate-900">{c.title}</div>
                <div className="text-[13px] text-slate-500">{c.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Risk + Tags */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Risk Level</label>
          <select className={`${INPUT_CLS} appearance-none`} value={form.risk} onChange={e => setForm({ ...form, risk: e.target.value })}>
            <option>Critical</option><option>High</option><option>Medium</option><option>Low</option>
          </select>
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Tags</label>
          <input className={INPUT_CLS} placeholder="Add tag..." value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 2 -- Target Asset Scope
   ================================================================ */
function Step2({ form, setForm }: { form: any; setForm: any }) {
  const toggle = (id: string) => {
    const current = new Set(form.selectedAssets || []);
    current.has(id) ? current.delete(id) : current.add(id);
    setForm({ ...form, selectedAssets: Array.from(current) });
  };
  const selected = new Set(form.selectedAssets || []);
  return (
    <div>
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Asset Categories</label>
        <div className="border border-slate-200 rounded-[10px] overflow-hidden">
          {assetCategories.map((cat, i) => (
            <div
              key={cat.id}
              onClick={() => toggle(cat.id)}
              className={`flex items-center gap-3 px-4 py-3 cursor-pointer ${i < assetCategories.length - 1 ? 'border-b border-[#F1F5F9]' : ''} ${selected.has(cat.id) ? 'bg-[#F8FAFF]' : 'bg-white'}`}
            >
              <div
                className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 ${selected.has(cat.id) ? 'border-2 border-[#0EA5E9] bg-[#0EA5E9]' : 'border-2 border-[#CBD5E1] bg-white'}`}
              >
                {selected.has(cat.id) && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-900">{cat.name}</span>
                <span className="text-[13px] text-slate-400 ml-2">{cat.desc}</span>
              </div>
              <span className="text-xs text-slate-500">{cat.count}</span>
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${cat.status === 'Connected' ? 'text-[#10B981] bg-[#ECFDF5]' : 'text-[#F59E0B] bg-[#FFFBEB]'}`}
              >
                &#x25CF; {cat.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Scope Mode</label>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: 'full', title: 'Full Scope', desc: 'All assets in selected categories auto-included' },
            { id: 'specific', title: 'Select Specific Assets', desc: 'Hand-pick individual assets by number' },
          ].map(opt => (
            <div
              key={opt.id}
              onClick={() => setForm({ ...form, scopeMode: opt.id })}
              className={`p-4 rounded-[10px] cursor-pointer ${(form.scopeMode ?? 'full') === opt.id ? 'border-2 border-[#0EA5E9] bg-[#EFF6FF]' : 'border border-[#E2E8F0] bg-white'}`}
            >
              <div className="text-sm font-semibold text-slate-900">{opt.title}</div>
              <div className="text-[13px] text-slate-500 mt-1">{opt.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Specific asset count */}
      {(form.scopeMode ?? 'full') === 'specific' && (
        <div className="mb-5">
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Number of Assets to Monitor *</label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={847}
              className={`${INPUT_CLS} max-w-[180px]`}
              placeholder="e.g. 150"
              value={form.assetCount || ''}
              onChange={e => setForm({ ...form, assetCount: e.target.value })}
            />
            <span className="text-[13px] text-slate-500">of 847 available assets</span>
          </div>
          {form.assetCount && Number(form.assetCount) > 0 && (
            <div className="mt-2 bg-sky-50 border border-sky-200 rounded-lg px-3.5 py-2 text-[13px] text-sky-800">
              {form.assetCount} specific asset{Number(form.assetCount) !== 1 ? 's' : ''} will be monitored by this control
            </div>
          )}
          <div className="text-xs text-slate-400 mt-1.5">
            You can update this number at any time from the control settings.
          </div>
        </div>
      )}

      <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-3 text-[13px] text-emerald-900 mb-5">
        {(form.scopeMode ?? 'full') === 'full' ? (
          <>Total Available: <strong>847 Assets</strong> &middot; Auto-selected &middot; All assets in selected categories</>
        ) : (
          <>Monitoring: <strong>{form.assetCount || 0} of 847 Assets</strong> &middot; Specific selection mode</>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Reference Document (optional)</label>
        <div className="border-2 border-dashed border-slate-300 rounded-[10px] p-6 text-center text-slate-400 text-[13px]">
          Drop reference document here or <span className="text-sky-500 cursor-pointer">browse</span>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 3 -- Data Source
   ================================================================ */
function Step3({ form, setForm }: { form: any; setForm: any }) {
  const sources = new Set(form.dataSources || []);
  const toggleSource = (id: string) => {
    const n = new Set(form.dataSources || []);
    n.has(id) ? n.delete(id) : n.add(id);
    setForm({ ...form, dataSources: Array.from(n) });
  };
  return (
    <div>
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Data Sources</label>
        <div className="border border-slate-200 rounded-[10px] overflow-hidden">
          {dataSources.map((src, i) => (
            <div
              key={src.id}
              onClick={() => toggleSource(src.id)}
              className={`flex items-center gap-3 px-4 py-[11px] cursor-pointer ${i < dataSources.length - 1 ? 'border-b border-[#F1F5F9]' : ''} ${sources.has(src.id) ? 'bg-[#F8FAFF]' : 'bg-white'}`}
            >
              <div
                className={`w-[18px] h-[18px] rounded flex items-center justify-center shrink-0 ${sources.has(src.id) ? 'border-2 border-[#0EA5E9] bg-[#0EA5E9]' : 'border-2 border-[#CBD5E1] bg-white'}`}
              >
                {sources.has(src.id) && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              <div className="flex-1">
                <span className="text-sm font-semibold text-slate-900">{src.label}</span>
                <span className="text-[13px] text-slate-400 ml-2">{src.desc}</span>
              </div>
              {src.badge && (
                <span className="text-[11px] font-medium bg-amber-50 text-amber-500 px-2 py-0.5 rounded-full">
                  {src.badge}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Email monitoring note */}
      {sources.has('email') && (
        <div className="bg-sky-50 border border-sky-200 rounded-[10px] px-4 py-3 mb-5 flex items-start gap-2.5">
          <Zap size={14} className="text-sky-500 shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-bold text-sky-800 mb-0.5">Email Monitoring Enabled</div>
            <div className="text-xs text-sky-800 leading-relaxed">
              Stakeholder email contacts are configured per <strong>Supplier</strong> and per <strong>Agent</strong> &mdash; not at the control level. This keeps controls reusable across multiple suppliers. Assign this control to an agent to activate email intelligence.
            </div>
          </div>
        </div>
      )}

      {sources.has('api') && (
        <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-4 mb-5">
          <div className="text-[13px] font-semibold text-slate-700 mb-3">API Configuration</div>
          <div className="flex flex-col gap-3">
            <input
              className={INPUT_CLS}
              placeholder="Endpoint URL"
              value={form.apiEndpoint || ''}
              onChange={e => setForm({ ...form, apiEndpoint: e.target.value })}
            />
            <select
              className={`${INPUT_CLS} appearance-none`}
              value={form.apiAuth || 'OAuth 2.0'}
              onChange={e => setForm({ ...form, apiAuth: e.target.value })}
            >
              <option>OAuth 2.0</option><option>API Key</option><option>JWT Bearer</option>
            </select>
            <select
              className={`${INPUT_CLS} appearance-none`}
              value={form.apiFrequency || 'Hourly'}
              onChange={e => setForm({ ...form, apiFrequency: e.target.value })}
            >
              <option>Hourly</option><option>Every 6 hrs</option><option>Daily</option><option>Weekly</option>
            </select>
          </div>
        </div>
      )}

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Evidence Retention</label>
        <div className="flex gap-2">
          {retentionOptions.map(opt => (
            <button
              key={opt}
              onClick={() => setForm({ ...form, retention: opt })}
              className={`px-3.5 py-[7px] rounded-lg text-[13px] font-medium cursor-pointer border ${(form.retention || '90 days') === opt ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 4 -- Trigger Config
   ================================================================ */
function Step4({ form, setForm }: { form: any; setForm: any }) {
  const triggerMode = form.triggerMode || 'scheduled';
  const cronExpr = form.cronExpr || '0 0 * * *';
  const activePreset = form.cronPreset || 'Daily';
  return (
    <div>
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Trigger Mode</label>
        <div className="grid grid-cols-3 gap-3">
          {triggerModes.map(m => (
            <div
              key={m.id}
              onClick={() => setForm({ ...form, triggerMode: m.id })}
              className={`p-4 rounded-[10px] cursor-pointer text-center ${triggerMode === m.id ? 'border-2 border-[#0EA5E9] bg-[#EFF6FF]' : 'border border-[#E2E8F0] bg-white'}`}
            >
              <div className="text-sm font-semibold text-slate-900">{m.title}</div>
              <div className="text-[13px] text-slate-500 mt-1">{m.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {triggerMode === 'scheduled' && (
        <div>
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Cron Expression</label>
            <div className="flex gap-3 items-center">
              <input
                className={`${INPUT_CLS} font-mono max-w-[200px]`}
                value={cronExpr}
                onChange={e => setForm({ ...form, cronExpr: e.target.value })}
              />
              <span className="text-[13px] text-slate-500">Every day at midnight UTC</span>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Quick Presets</label>
            <div className="flex gap-2 flex-wrap">
              {cronPresets.map(p => (
                <button
                  key={p}
                  onClick={() => setForm({ ...form, cronPreset: p })}
                  className={`px-3.5 py-1.5 rounded-lg text-[13px] font-medium cursor-pointer border ${activePreset === p ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">First Evaluation Date</label>
              <input
                type="date"
                className={INPUT_CLS}
                value={form.firstEvalDate || ''}
                onChange={e => setForm({ ...form, firstEvalDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Time</label>
              <input
                type="time"
                className={INPUT_CLS}
                value={form.firstEvalTime || ''}
                onChange={e => setForm({ ...form, firstEvalTime: e.target.value })}
              />
            </div>
          </div>
        </div>
      )}

      {triggerMode === 'event' && (
        <div>
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Webhook URL</label>
            <div className="flex gap-2">
              <input
                readOnly
                className={`${INPUT_CLS} bg-[#F8FAFC] flex-1`}
                value={form.webhookUrl || 'https://tprm.example.com/webhook/ctrl-xxxx'}
              />
              <button className="px-3.5 py-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer text-xs text-slate-500">
                Copy
              </button>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Event Filter</label>
            <input
              className={INPUT_CLS}
              placeholder="e.g., incident.created"
              value={form.eventFilter || ''}
              onChange={e => setForm({ ...form, eventFilter: e.target.value })}
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ================================================================
   Step 5 -- AI Behaviour
   ================================================================ */
function Step5({ form, setForm }: { form: any; setForm: any }) {
  const actions = new Set(form.autoActions || []);
  const confidence = form.confidenceThreshold ?? 75;
  const storeEvidence = form.storeEvidence ?? true;
  const humanReview = form.humanReview ?? false;
  const truthGap = form.truthGap ?? false;
  const selectedAnomalies = new Set(form.selectedAnomalies || []);

  const toggleAction = (id: string) => {
    const n = new Set(form.autoActions || []);
    n.has(id) ? n.delete(id) : n.add(id);
    setForm({ ...form, autoActions: Array.from(n) });
  };
  const toggleAnomaly = (id: string) => {
    const n = new Set(form.selectedAnomalies || []);
    n.has(id) ? n.delete(id) : n.add(id);
    setForm({ ...form, selectedAnomalies: Array.from(n) });
  };

  return (
    <div>
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Evaluation Instructions</label>
        <textarea
          rows={6}
          className={`${INPUT_CLS} resize-y`}
          placeholder="Describe in natural language how the AI should evaluate this control..."
          maxLength={500}
          value={form.evaluationInstructions || ''}
          onChange={e => setForm({ ...form, evaluationInstructions: e.target.value })}
        />
        <div className="text-[11px] text-slate-400 mt-1">Max 500 characters</div>
      </div>

      {/* Anomaly Detection Presets */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Anomaly Detection Presets</label>
        <div className="text-xs text-slate-500 mb-2.5">
          Select known anomaly patterns the AI should watch for. These become primary trigger conditions.
        </div>
        <div className="flex gap-2 flex-wrap">
          {ANOMALY_PRESETS.map(a => {
            const sel = selectedAnomalies.has(a.id);
            return (
              <button
                key={a.id}
                onClick={() => toggleAnomaly(a.id)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs cursor-pointer transition-all duration-150"
                style={{
                  fontWeight: sel ? 600 : 500,
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
          <div className="mt-2 text-xs text-emerald-500 flex items-center gap-1">
            <CheckCircle2 size={11} className="text-emerald-500" />
            {selectedAnomalies.size} anomaly pattern{selectedAnomalies.size > 1 ? 's' : ''} added to this control
          </div>
        )}
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Confidence Threshold</label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            min={0}
            max={100}
            value={confidence}
            onChange={e => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
            className="flex-1"
          />
          <span className="text-sm font-bold text-white bg-sky-500 px-2.5 py-[3px] rounded-md">{confidence}%</span>
        </div>
        <div className="text-xs text-slate-500 mt-1">Below this threshold, AI will flag for human review instead of auto-deciding.</div>
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Auto Actions on Fail</label>
        <div className="flex flex-col gap-2.5">
          {autoActions.map(a => (
            <label key={a.id} className="flex items-center gap-2.5 cursor-pointer text-sm text-slate-700">
              <div
                onClick={() => toggleAction(a.id)}
                className={`w-[18px] h-[18px] rounded shrink-0 cursor-pointer flex items-center justify-center ${actions.has(a.id) ? 'border-2 border-[#0EA5E9] bg-[#0EA5E9]' : 'border-2 border-[#CBD5E1] bg-white'}`}
              >
                {actions.has(a.id) && <Check size={11} color="#fff" strokeWidth={3} />}
              </div>
              {a.label}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Remediation Suggestion</label>
        <textarea
          rows={3}
          className={`${INPUT_CLS} resize-y`}
          placeholder="What should the agent recommend when this control fails?"
          value={form.remediationSuggestion || ''}
          onChange={e => setForm({ ...form, remediationSuggestion: e.target.value })}
        />
      </div>

      <div className="flex flex-col gap-3.5">
        <div className="flex items-center gap-3">
          <InlineToggle on={storeEvidence} onChange={() => setForm({ ...form, storeEvidence: !storeEvidence })} />
          <span className="text-sm text-slate-700">Store evidence snapshots for each evaluation</span>
        </div>
        <div className="flex items-center gap-3">
          <InlineToggle on={humanReview} onChange={() => setForm({ ...form, humanReview: !humanReview })} />
          <span className="text-sm text-slate-700">Require human approval before marking as compliant</span>
        </div>

        {/* Truth Gap Detection */}
        <div
          className={`mt-1 rounded-[10px] px-4 py-3 transition-all duration-200 border ${truthGap ? 'border-[#FECACA] bg-[#FEF2F2]' : 'border-[#E2E8F0] bg-[#F8FAFC]'}`}
        >
          <div className={`flex items-start gap-3 ${truthGap ? 'mb-[10px]' : ''}`}>
            <InlineToggle on={truthGap} onChange={() => setForm({ ...form, truthGap: !truthGap })} />
            <div>
              <div className="flex items-center gap-1.5 mb-0.5">
                <AlertTriangle size={14} color={truthGap ? '#EF4444' : '#94A3B8'} />
                <span className={`text-sm font-semibold ${truthGap ? 'text-[#DC2626]' : 'text-[#334155]'}`}>
                  Truth Gap Detection
                </span>
              </div>
              <div className="text-xs text-slate-500 leading-relaxed">
                When enabled, failures automatically trigger auditing signals in the Knowledge Graph.
              </div>
            </div>
          </div>
          {truthGap && (
            <div className="bg-white border border-red-200 rounded-lg px-3 py-2.5 flex flex-col gap-2">
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs text-red-600 leading-relaxed">
                  A <strong>pulsing red AlertTriangle</strong> will appear on the supplier node in the Knowledge Graph whenever this control fails.
                </span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle size={12} className="text-red-500 shrink-0 mt-0.5" />
                <span className="text-xs text-red-600 leading-relaxed">
                  The supplier's <strong>Truth Match %</strong> is automatically reduced by the agent, reflecting any declared vs. detected PII gap.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Step 6 -- Dependencies
   ================================================================ */
function Step6({ form, setForm }: { form: any; setForm: any }) {
  const dependsOn = form.dependencies || [];
  const cascade = form.cascadeOnFail ?? false;
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const removeDep = (id: string) => setForm({ ...form, dependencies: dependsOn.filter((d: any) => d.id !== id) });
  const toggleType = (id: string) =>
    setForm({
      ...form,
      dependencies: dependsOn.map((d: any) =>
        d.id === id ? { ...d, type: d.type === 'Blocking' ? 'Warning' : 'Blocking' } : d,
      ),
    });
  const addDep = (label: string) => {
    if (dependsOn.find((d: any) => d.label === label)) return;
    setForm({
      ...form,
      dependencies: [
        ...dependsOn,
        { id: label.toLowerCase().replace(/\s/g, '_'), label, type: 'Warning' },
      ],
    });
    setDropdownOpen(false);
  };

  const alreadyAdded = new Set(dependsOn.map((d: any) => d.label));

  return (
    <div>
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Depends On</label>

        {/* Dropdown selector */}
        <div className="relative mb-2.5">
          <div
            onClick={() => setDropdownOpen(o => !o)}
            className="border border-slate-200 rounded-lg px-3.5 py-2.5 cursor-pointer flex justify-between items-center bg-white text-sm text-slate-400"
          >
            <span>Select a control to add as dependency...</span>
            <ChevronDown size={14} className="text-slate-400" />
          </div>
          {dropdownOpen && (
            <div className="absolute top-[calc(100%+4px)] left-0 right-0 z-50 bg-white border border-slate-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] max-h-[220px] overflow-y-auto">
              {availableControlOptions
                .filter(c => !alreadyAdded.has(c))
                .map(ctrl => (
                  <div
                    key={ctrl}
                    onClick={() => addDep(ctrl)}
                    className="px-3.5 py-2.5 cursor-pointer text-[13px] text-slate-700 border-b border-slate-100 hover:bg-sky-50"
                  >
                    {ctrl}
                  </div>
                ))}
              {availableControlOptions.filter(c => !alreadyAdded.has(c)).length === 0 && (
                <div className="px-3.5 py-2.5 text-[13px] text-slate-400">All controls added</div>
              )}
            </div>
          )}
        </div>

        {/* Selected dependency chips */}
        <div className="flex gap-2 flex-wrap">
          {dependsOn.map(dep => (
            <div
              key={dep.id}
              className={`flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border ${dep.type === 'Blocking' ? 'bg-[#FEF2F2] border-[#FECACA] text-[#EF4444]' : 'bg-[#FFFBEB] border-[#FDE68A] text-[#F59E0B]'}`}
            >
              <span className="text-[13px] font-semibold">{dep.label}</span>
              <button
                onClick={() => toggleType(dep.id)}
                title="Toggle Blocking / Warning"
                className="text-[11px] bg-transparent border-none cursor-pointer font-medium text-inherit"
              >
                {dep.type}
              </button>
              <button
                onClick={() => removeDep(dep.id)}
                className="bg-transparent border-none cursor-pointer p-0 text-inherit"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {dependsOn.length === 0 && (
            <span className="text-[13px] text-slate-400">No dependencies added yet</span>
          )}
        </div>
        <div className="text-xs text-slate-400 mt-1.5">
          Click the type badge on a chip to toggle Blocking &harr; Warning
        </div>
      </div>

      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Impacts (Controls that depend on this)</label>
        <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-3 text-[13px] text-slate-500">
          Access Review Policy &middot; Vulnerability Scanning
        </div>
      </div>

      <div className="flex items-center gap-3 mb-5">
        <div
          onClick={() => setForm({ ...form, cascadeOnFail: !cascade })}
          className={`relative cursor-pointer w-10 h-[22px] rounded-full ${cascade ? 'bg-[#0EA5E9]' : 'bg-[#CBD5E1]'}`}
        >
          <div
            className={`absolute bg-white rounded-full top-[2px] w-[18px] h-[18px] transition-[left] duration-200 ${cascade ? 'left-5' : 'left-[2px]'}`}
          />
        </div>
        <span className="text-sm text-slate-700">When this control fails, automatically flag all dependent controls</span>
      </div>

      {/* Dependency Graph Preview */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Dependency Graph Preview</label>
        <div className="text-xs text-slate-500 mb-2">Shows how this control sits in the dependency chain and its impact on Bi-Directional PII flows.</div>
        <div className="border border-slate-200 rounded-[10px] p-5 bg-slate-50 flex justify-center">
          <svg width={380} height={200} className="font-[Inter,sans-serif]">
            <defs>
              <marker id="arrow-share" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#0EA5E9" />
              </marker>
              <marker id="arrow-ingest" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#10B981" />
              </marker>
              <marker id="arrow-dep" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
                <path d="M0,0 L0,6 L8,3 z" fill="#94A3B8" />
              </marker>
            </defs>

            {/* Dep edges */}
            <line x1={190} y1={60} x2={100} y2={120} stroke="#CBD5E1" strokeWidth={1.5} markerEnd="url(#arrow-dep)" />
            <line x1={190} y1={60} x2={280} y2={120} stroke="#CBD5E1" strokeWidth={1.5} markerEnd="url(#arrow-dep)" />
            {/* PII flow edges */}
            <line x1={190} y1={80} x2={100} y2={160} stroke="#0EA5E9" strokeWidth={2} strokeDasharray="5,3" markerEnd="url(#arrow-share)" />
            <line x1={100} y1={160} x2={190} y2={80} stroke="#10B981" strokeWidth={2} strokeDasharray="5,3" markerEnd="url(#arrow-ingest)" />

            {/* Center -- This Control */}
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
            <text x={244} y={173} fill="#0EA5E9" fontSize={8}>Share &rarr;</text>
            <line x1={220} y1={183} x2={240} y2={183} stroke="#10B981" strokeWidth={2} strokeDasharray="4,2" />
            <text x={244} y={186} fill="#10B981" fontSize={8}>&larr; Ingest</text>
            <line x1={220} y1={196} x2={240} y2={196} stroke="#CBD5E1" strokeWidth={1.5} />
            <text x={244} y={199} fill="#94A3B8" fontSize={8}>Dependency</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

/* ================================================================
   Review Screen
   ================================================================ */
function ReviewScreen({ form, onActivate }: { form: any; onActivate: () => void }) {
  // Calculate total assets from selected categories
  const assetCounts: Record<string, number> = {
    azure: 312, gcp: 185, m365: 156, ad: 89, snow: 67, splunk: 38, suppliers: 48
  };
  const totalAssets = (form.selectedAssets || []).reduce((sum: number, id: string) => sum + (assetCounts[id] || 0), 0);

  // Format data sources
  const sourceLabels: Record<string, string> = {
    api: 'API Integration', siem: 'Logs/SIEM', ticket: 'Ticketing', docs: 'Documents', task: 'Task Output', portal: 'Supplier Portal', email: 'Email'
  };
  const formattedSources = (form.dataSources || []).map((id: string) => sourceLabels[id] || id).join(', ') || 'None selected';

  // Format trigger info
  const triggerModeLabels: Record<string, string> = { manual: 'Manual', scheduled: 'Scheduled', event: 'Event-Driven' };
  const triggerLabel = triggerModeLabels[form.triggerMode] || 'Scheduled';
  const scheduleLabel = form.triggerMode === 'scheduled' ? `${form.cronPreset || 'Daily'} at midnight UTC` : 'N/A';

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        {[
          { title: 'Basic Info', items: [
            ['Name', form.name || '(not set)'],
            ['Classification', form.classification || '(not set)'],
            ['Risk', form.risk || 'High'],
            ['Personality', form.personality ? form.personality.charAt(0).toUpperCase() + form.personality.slice(1) : 'Operations']
          ]},
          { title: 'Asset Scope', items: [
            ['Scope Mode', form.scopeMode === 'full' ? 'Full Scope' : 'Specific Assets'],
            ['Total Assets', form.scopeMode === 'specific' ? (form.assetCount || '0') : String(totalAssets)],
            ['Categories', `${(form.selectedAssets || []).length} selected`]
          ]},
          { title: 'Data Source', items: [
            ['Sources', formattedSources],
            ['Retention', form.retention || '90 days']
          ]},
          { title: 'Trigger Config', items: [
            ['Mode', triggerLabel],
            ['Schedule', scheduleLabel]
          ]},
          { title: 'AI Behaviour', items: [
            ['Confidence Threshold', `${form.confidenceThreshold ?? 75}%`],
            ['Evidence', form.storeEvidence !== false ? 'Enabled' : 'Disabled'],
            ['Truth Gap', form.truthGap ? 'Enabled' : 'Disabled'],
            ['Anomalies', `${(form.selectedAnomalies || []).length} selected`]
          ]},
          { title: 'Dependencies', items: [
            ['Depends On', `${(form.dependencies || []).length} controls`],
            ['Failure Cascade', form.cascadeOnFail ? 'On' : 'Off']
          ]},
        ].map(section => (
          <div key={section.title} className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
            <div className="text-[13px] font-bold text-slate-900 mb-2.5">{section.title}</div>
            {section.items.map(([k, v]) => (
              <div key={k} className="flex justify-between mb-1.5">
                <span className="text-[13px] text-slate-400">{k}</span>
                <span className="text-[13px] font-medium text-slate-700">{v}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-5 py-3.5 text-sm text-emerald-900 font-medium">
        Estimated Coverage: <strong>{form.scopeMode === 'specific' ? (form.assetCount || 0) : totalAssets} assets</strong> will be monitored by this control
      </div>
      <div className="flex justify-end gap-3">
        <GhostBtn>Save as Draft</GhostBtn>
        <PrimaryBtn onClick={onActivate}>Activate Control</PrimaryBtn>
      </div>
    </div>
  );
}

/* ================================================================
   Success Screen
   ================================================================ */
function SuccessScreen({
  onViewControls,
  onCreateAnother,
}: {
  onViewControls: () => void;
  onCreateAnother: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-[60px] text-center">
      <CheckCircle2 size={64} color="#10B981" strokeWidth={1.5} />
      <h2 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Control Activated!</h2>
      <p className="text-sm text-slate-500 mb-7">MFA Enforcement Policy is now live and monitoring 847 assets</p>
      <div className="flex gap-3">
        <PrimaryBtn onClick={onViewControls}>View Controls</PrimaryBtn>
        <GhostBtn onClick={onCreateAnother}>Create Another</GhostBtn>
      </div>
    </div>
  );
}

/* ================================================================
   Main Export -- CreateControlPage
   ================================================================ */
export function CreateControlPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isReview, setIsReview] = useState(false);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [form, setForm] = useState({
    // Step 1 - Basic Info
    name: '',
    description: '',
    source: 'local',
    classification: '',
    risk: 'High',
    tags: '',
    personality: '' as string,
    selectedChecks: [] as string[],
    grcProvider: '' as string,
    // Step 2 - Asset Scope
    scopeMode: 'full',
    assetCount: '' as string,
    selectedAssets: ['azure', 'gcp', 'm365', 'ad', 'suppliers'] as string[],
    // Step 3 - Data Source
    dataSources: ['api', 'ticket'] as string[],
    retention: '90 days',
    apiEndpoint: '',
    apiAuth: 'OAuth 2.0',
    apiFrequency: 'Hourly',
    // Step 4 - Trigger Config
    triggerMode: 'scheduled',
    cronExpr: '0 0 * * *',
    cronPreset: 'Daily',
    firstEvalDate: '',
    firstEvalTime: '',
    webhookUrl: 'https://tprm.example.com/webhook/ctrl-xxxx',
    eventFilter: '',
    // Step 5 - AI Behaviour
    evaluationInstructions: '',
    selectedAnomalies: [] as string[],
    confidenceThreshold: 75,
    autoActions: ['ticket', 'email', 'review'] as string[],
    remediationSuggestion: '',
    storeEvidence: true,
    humanReview: false,
    truthGap: false,
    // Step 6 - Dependencies
    dependencies: [
      { id: 'mfa', label: 'MFA Enforcement', type: 'Blocking' },
      { id: 'enc', label: 'Encryption at Rest', type: 'Warning' },
    ] as Array<{ id: string; label: string; type: string }>,
    cascadeOnFail: false,
  });

  const canNext = form.name.trim().length > 0 && form.classification.length > 0;

  async function handleActivate() {
    setIsActivating(true);
    try {
      // Map form data to Control interface
      const controlData: Omit<Control, 'id'> = {
        name: form.name.trim(),
        desc: form.description.trim(),
        category: form.classification as Control['category'],
        active: true, // New controls start active
        coverage: 0, // Will be calculated by backend
        scope: form.scopeMode === 'full' ? 'Full' : form.scopeMode === 'specific' ? 'Partial' : 'Sparse',
        risk: form.risk as Control['risk'],
        lastEval: 'Just created',
        deps: (form.dependencies || []).length,
        // Optional fields from wizard steps
        internalSpoc: undefined,
        externalSpoc: undefined,
        piiFlow: undefined,
        truthValidator: form.humanReview ?? false,
        hasTruthGap: form.truthGap ?? false,
        personality: (form.personality || 'operations') as Control['personality'],
      };

      const newControl = await createControl(controlData);

      setIsActivating(false);
      setIsSuccess(true);
      toast.success(
        `Control "${newControl.name}" created successfully! Starting monitoring...`
      );
    } catch (error) {
      setIsActivating(false);
      toast.error(`Failed to create control: ${error instanceof Error ? error.message : 'Unknown error'}`);
      console.error('Failed to create control:', error);
    }
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
      <div className="max-w-[720px] mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SuccessScreen
            onViewControls={() => navigate('/controls')}
            onCreateAnother={() => {
              setIsSuccess(false);
              setStep(1);
              setForm({
                // Step 1 - Basic Info
                name: '',
                description: '',
                source: 'local',
                classification: '',
                risk: 'High',
                tags: '',
                personality: '',
                selectedChecks: [],
                grcProvider: '',
                // Step 2 - Asset Scope
                scopeMode: 'full',
                assetCount: '',
                selectedAssets: ['azure', 'gcp', 'm365', 'ad', 'suppliers'],
                // Step 3 - Data Source
                dataSources: ['api', 'ticket'],
                retention: '90 days',
                apiEndpoint: '',
                apiAuth: 'OAuth 2.0',
                apiFrequency: 'Hourly',
                // Step 4 - Trigger Config
                triggerMode: 'scheduled',
                cronExpr: '0 0 * * *',
                cronPreset: 'Daily',
                firstEvalDate: '',
                firstEvalTime: '',
                webhookUrl: 'https://tprm.example.com/webhook/ctrl-xxxx',
                eventFilter: '',
                // Step 5 - AI Behaviour
                evaluationInstructions: '',
                selectedAnomalies: [],
                confidenceThreshold: 75,
                autoActions: ['ticket', 'email', 'review'],
                remediationSuggestion: '',
                storeEvidence: true,
                humanReview: false,
                truthGap: false,
                // Step 6 - Dependencies
                dependencies: [
                  { id: 'mfa', label: 'MFA Enforcement', type: 'Blocking' },
                  { id: 'enc', label: 'Encryption at Rest', type: 'Warning' },
                ],
                cascadeOnFail: false,
              });
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[900px] flex flex-col gap-0">
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => navigate('/controls')}
          className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-3 p-0 hover:text-sky-500"
        >
          <ArrowLeft size={16} /> Back to Controls
        </button>
        <h1 className="text-2xl font-bold text-slate-900 m-0">Create Control</h1>
        <p className="text-sm text-slate-500 mt-1 mb-0">Configure a new governance control</p>
      </div>

      {/* Stepper */}
      {!isReview && <StepperBar steps={STEPS} currentStep={step} />}

      {/* Content Card */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-8">
        {isReview ? (
          <ReviewScreen form={form} onActivate={handleActivate} />
        ) : (
          <>
            <div className="mb-6">
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                Step {step} &mdash; {STEPS[step - 1].label}
              </h3>
            </div>
            {stepContent[step]}
            {/* Navigation */}
            <div className="flex justify-between mt-6 pt-5 border-t border-slate-200">
              <div>
                {step > 1 && <GhostBtn onClick={() => setStep(s => s - 1)}>&larr; Back</GhostBtn>}
              </div>
              <div className="flex gap-2.5">
                {step < 6 ? (
                  <PrimaryBtn onClick={() => setStep(s => s + 1)}>Next &rarr;</PrimaryBtn>
                ) : (
                  <PrimaryBtn onClick={() => setIsReview(true)}>Review &amp; Activate &rarr;</PrimaryBtn>
                )}
              </div>
            </div>
          </>
        )}
        {isActivating && (
          <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[100]">
            <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
              <Loader2 size={24} className="text-sky-500 animate-spin" />
              Activating...
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

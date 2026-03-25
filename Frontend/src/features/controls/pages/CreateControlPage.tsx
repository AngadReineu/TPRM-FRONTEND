import { useState, useEffect } from 'react';
import {
  ArrowLeft, Check, Loader2, CheckCircle2, X,
  Handshake, Truck, ShieldCheck, Scale,
  GitMerge, Plus, Mail, FileText, Globe, MessageSquare, Hash, Video,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { StepperBar } from '../components/StepperBar';
import { createControl } from '../services/controls.data';
import { getVendors } from '../../vendors/services/vendors.data';
import { useAuthStore } from '../../../stores/authStore';

/* ── Constants ─────────────────────────────────────────── */
const STEPS = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Target Asset Scope' },
  { id: 3, label: 'Data Source' },
  { id: 4, label: 'Trigger Config' },
  { id: 5, label: 'AI Behaviour' },
];

const INPUT_CLS = 'w-full box-border py-2.5 px-3.5 text-sm text-[#334155] border border-[#E2E8F0] rounded-lg outline-none bg-white';

const SLM_TASKS_CONSULTING = [
  'Purchase Order Verification',
  'SOW Validation',
  'Payment Conversation Monitoring',
  'Approval Chain Tracking',
  'Project Risk Identification',
  'Contractual Obligation Tracking',
  'Escalation & Stakeholder Review',
];

const LIFECYCLE_STAGE_SUGGESTIONS: Record<string, string> = {
  'SOW Validation': 'Acquisition',
  'Purchase Order Verification': 'Acquisition',
  'Payment Conversation Monitoring': 'Retention',
  'Approval Chain Tracking': 'Retention',
  'Project Risk Identification': 'Retention',
  'Contractual Obligation Tracking': 'Upgradation',
  'Escalation & Stakeholder Review': 'Offboarding',
};

const COMMUNICATION_SCOPE_MAP: Record<string, { label: string; placeholder: string }> = {
  'Payment Conversation Monitoring': { label: 'Supplier Finance Contact', placeholder: 'finance@supplier.com' },
  'SOW Validation': { label: 'Legal Contact', placeholder: 'legal@supplier.com' },
  'Escalation & Stakeholder Review': { label: 'Senior Stakeholder', placeholder: 'escalation@supplier.com' },
  'Approval Chain Tracking': { label: 'Approver Contact', placeholder: 'approver@supplier.com' },
  'Project Risk Identification': { label: 'Project Manager', placeholder: 'pm@supplier.com' },
};

const DOCUMENT_SCOPE_OPTIONS = ['Statement of Work (SOW)', 'Purchase Order (PO)', 'Invoice', 'Data Processing Agreement (DPA)', 'ISO Certificate', 'NDA', 'Contract'];

const ANOMALY_MAP: Record<string, string> = {
  'SOW Validation': 'SOW Date vs Service Start Date',
  'Purchase Order Verification': 'Payment Without PO Approval',
  'Project Risk Identification': 'Milestone Slip > 7 Days',
  'Contractual Obligation Tracking': 'Certification Expiry < 30 Days',
  'Payment Conversation Monitoring': 'Duplicate Invoice Detection',
  'Escalation & Stakeholder Review': 'Escalation Response Overdue',
};

const GRC_PROVIDERS = ['ServiceNow GRC', 'Archer (RSA)', 'OneTrust', 'MetricStream'];

const ASSET_CATEGORIES = [
  { id: 'azure', name: 'Azure', desc: 'Microsoft Cloud' },
  { id: 'gcp', name: 'GCP', desc: 'Google Cloud' },
  { id: 'm365', name: 'Microsoft 365', desc: 'Productivity' },
  { id: 'ad', name: 'Active Directory', desc: 'Identity & Access' },
  { id: 'servicenow', name: 'ServiceNow', desc: 'IT Service Mgmt' },
  { id: 'splunk', name: 'Splunk', desc: 'Security & SIEM' },
];

/* ── Shared UI components ───────────────────────────────── */
function PrimaryBtn({ onClick, disabled, children }: { onClick?: () => void; disabled?: boolean; children: React.ReactNode }) {
  return (
    <button onClick={onClick} disabled={disabled}
      className={`text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer ${disabled ? 'bg-[#CBD5E1] cursor-not-allowed' : 'bg-[#0EA5E9] hover:bg-sky-600'}`}>
      {children}
    </button>
  );
}

function GhostBtn({ onClick, children }: { onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} className="bg-white text-slate-700 border border-slate-200 rounded-lg px-5 py-2.5 text-sm font-medium cursor-pointer hover:bg-slate-50">
      {children}
    </button>
  );
}

function InlineToggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <div onClick={onChange} className={`relative cursor-pointer shrink-0 w-10 h-[22px] rounded-full ${on ? 'bg-[#0EA5E9]' : 'bg-[#CBD5E1]'}`}>
      <div className={`absolute bg-white rounded-full shadow top-[2px] w-[18px] h-[18px] transition-[left] duration-200 ${on ? 'left-5' : 'left-[2px]'}`} />
    </div>
  );
}

/* ── Step 1 — Basic Info ────────────────────────────────── */
function Step1({ form, setForm }: { form: any; setForm: any }) {
  const [customTask, setCustomTask] = useState('');
  const [customTasks, setCustomTasks] = useState<string[]>([]);

  const isConsulting = form.personality === 'consulting' || form.personality === 'operations';
  const allTasks = [...SLM_TASKS_CONSULTING, ...customTasks];

  const toggleTask = (task: string) => {
    const current: string[] = form.slmTasks || [];
    const updated = current.includes(task) ? current.filter(t => t !== task) : [...current, task];
    setForm({ ...form, slmTasks: updated });
  };

  const addCustomTask = () => {
    if (!customTask.trim()) return;
    setCustomTasks(prev => [...prev, customTask.trim()]);
    setForm({ ...form, slmTasks: [...(form.slmTasks || []), customTask.trim()] });
    setCustomTask('');
  };

  const selectPersona = (id: string) => {
    const category = (id === 'consulting' || id === 'operations') ? 'Process'
      : id === 'regulatory' ? 'Document'
      : id === 'security' ? 'Technical' : 'Document';
    setForm({ ...form, personality: id, category, slmTasks: [] });
    setCustomTasks([]);
  };

  return (
    <div>
      {/* Control Name */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Control Name *</label>
        <input className={INPUT_CLS} placeholder="e.g., SOW Signature Verification"
          value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
      </div>

      {/* Description */}
      <div className="mb-5">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Description</label>
        <textarea rows={3} className={`${INPUT_CLS} resize-none`}
          placeholder="Describe the purpose and scope of this control..."
          value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
      </div>

      {/* Control Source */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Control Source</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'local', title: 'Local Control', desc: 'Create and manage locally', accent: '#0EA5E9' },
            { id: 'kyudo', title: 'Imported from Kyudo', desc: 'Import from Kyudo governance framework', accent: '#8B5CF6' },
            { id: 'grc', title: 'Import from GRC', desc: 'Pull from ServiceNow GRC, Archer, or OneTrust', accent: '#10B981' },
          ].map(opt => {
            const sel = form.source === opt.id;
            return (
              <div key={opt.id} onClick={() => setForm({ ...form, source: opt.id })}
                className="p-4 rounded-[10px] cursor-pointer transition-all"
                style={{ border: sel ? `2px solid ${opt.accent}` : '1px solid #E2E8F0', backgroundColor: sel ? opt.accent + '12' : '#fff' }}>
                <div className="w-2 h-2 rounded-full mb-2" style={{ backgroundColor: opt.accent }} />
                <div className="text-[13px] font-bold text-slate-900 mb-0.5">{opt.title}</div>
                <div className="text-xs text-slate-500 leading-snug">{opt.desc}</div>
              </div>
            );
          })}
        </div>
        {form.source === 'grc' && (
          <div className="mt-3 bg-emerald-50 border border-emerald-200 rounded-[10px] p-4">
            <div className="text-xs font-bold text-emerald-900 mb-2 flex items-center gap-1.5">
              <GitMerge size={13} className="text-emerald-500" /> GRC Provider
            </div>
            <select className={INPUT_CLS} value={form.grcProvider ?? ''}
              onChange={e => setForm({ ...form, grcProvider: e.target.value })}>
              <option value="">Select GRC provider...</option>
              {GRC_PROVIDERS.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
        )}
      </div>

      {/* Monitoring Persona — 2 groups */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-0.5">Monitoring Persona</label>
        <div className="text-xs text-slate-500 mb-3">Select the agent type that should evaluate this control.</div>

        {/* Consulting Agent group */}
        <div className="mb-3">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Consulting Agent</div>
          <div className="flex flex-col gap-2">
            {[
              { id: 'consulting', Icon: Handshake, title: 'Consulting', sub: 'SOW & Payment Auditor', color: '#0EA5E9', bg: '#EFF6FF', category: 'Process', catColor: '#10B981' },
              { id: 'operations', Icon: Truck, title: 'Operations', sub: 'SLA & Logistics Monitor', color: '#10B981', bg: '#ECFDF5', category: 'Process', catColor: '#10B981' },
              { id: 'regulatory', Icon: Scale, title: 'Regulatory', sub: 'Compliance & Audit Trail', color: '#F59E0B', bg: '#FFFBEB', category: 'Document', catColor: '#8B5CF6' },
            ].map(({ id, Icon, title, sub, color, bg, category, catColor }) => {
              const sel = form.personality === id;
              return (
                <div key={id} onClick={() => selectPersona(id)}
                  className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-pointer transition-all"
                  style={{ border: sel ? `2px solid ${color}` : '1px solid #E2E8F0', backgroundColor: sel ? bg : '#fff' }}>
                  <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center"
                    style={{ border: `2px solid ${sel ? color : '#CBD5E1'}` }}>
                    {sel && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />}
                  </div>
                  <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center"
                    style={{ backgroundColor: sel ? color + '22' : '#F1F5F9' }}>
                    <Icon size={15} color={sel ? color : '#94A3B8'} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold text-slate-900">{title}</div>
                    <div className="text-[11px] text-slate-400">{sub}</div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
                    style={{ color: catColor, backgroundColor: catColor + '15' }}>
                    {category}
                  </span>
                  {sel && <span className="text-[10px] font-bold px-2 py-px rounded-full" style={{ color, backgroundColor: bg }}>Selected</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* IT Risk Agent group — greyed out */}
        <div className="opacity-50">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
            IT Risk Agent
            <span className="text-[10px] font-semibold bg-slate-100 text-slate-400 px-2 py-px rounded-full">Coming Soon</span>
          </div>
          <div className="flex flex-col gap-2">
            {[
              { id: 'security', Icon: ShieldCheck, title: 'Data Security', sub: 'PII & Encryption Watchdog', color: '#8B5CF6', bg: '#F5F3FF', category: 'Technical', catColor: '#3B82F6' },
            ].map(({ id, Icon, title, sub, color, bg, category, catColor }) => (
              <div key={id}
                className="flex items-center gap-3 px-3.5 py-3 rounded-[10px] cursor-not-allowed"
                style={{ border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
                <div className="w-4 h-4 rounded-full shrink-0" style={{ border: '2px solid #CBD5E1' }} />
                <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center bg-slate-100">
                  <Icon size={15} color="#94A3B8" />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] font-semibold text-slate-400">{title}</div>
                  <div className="text-[11px] text-slate-300">{sub}</div>
                </div>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
                  style={{ color: '#94A3B8', backgroundColor: '#F1F5F9' }}>
                  {category}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Auto-set classification notice */}
        {form.personality && (
          <div className="mt-2 text-[11px] text-emerald-600 flex items-center gap-1">
            <Check size={11} /> Control classification auto-set to <strong>{form.category}</strong> based on persona
          </div>
        )}
      </div>

      {/* SLM Tasks — appears after persona selected */}
      {isConsulting && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-[3px] h-3.5 rounded bg-sky-500" />
            <label className="text-[13px] font-bold text-slate-900">SLM Tasks</label>
            <span className="text-[11px] text-slate-400 ml-1">Select which tasks this control covers</span>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden mb-2">
            {allTasks.map((task, i) => {
              const sel = (form.slmTasks || []).includes(task);
              return (
                <div key={task} onClick={() => toggleTask(task)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors ${i < allTasks.length - 1 ? 'border-b border-slate-100' : ''}`}
                  style={{ backgroundColor: sel ? '#EFF6FF' : '#fff' }}>
                  <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                    style={{ border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff' }}>
                    {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px]" style={{ fontWeight: sel ? 600 : 400, color: sel ? '#0EA5E9' : '#334155' }}>{task}</span>
                  {sel && <span className="ml-auto text-[10px] font-semibold bg-blue-50 text-sky-500 px-2 py-px rounded-full">Selected</span>}
                </div>
              );
            })}
          </div>
          {/* Add custom task */}
          <div className="flex gap-2">
            <input className={`${INPUT_CLS} flex-1`} placeholder="Add custom SLM Task..."
              value={customTask} onChange={e => setCustomTask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addCustomTask()} />
            <button onClick={addCustomTask}
              className="px-3 py-2 bg-sky-500 text-white rounded-lg text-sm border-none cursor-pointer hover:bg-sky-600 flex items-center gap-1">
              <Plus size={14} /> Add
            </button>
          </div>
        </div>
      )}

      {/* Risk Level */}
      <div className="mb-2">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Risk Level</label>
        <div className="text-xs text-slate-400 mb-2">Determines the order the agent evaluates this control. Critical runs first.</div>
        <div className="flex gap-2">
          {(['Critical', 'High', 'Medium', 'Low'] as const).map(r => {
            const sel = form.risk === r;
            const colors: Record<string, string> = { Critical: '#EF4444', High: '#F59E0B', Medium: '#64748B', Low: '#10B981' };
            const bgs: Record<string, string> = { Critical: '#FCEBEB', High: '#FFFBEB', Medium: '#F8FAFC', Low: '#F0FDF4' };
            return (
              <button key={r} onClick={() => setForm({ ...form, risk: r })}
                className="px-4 py-2 rounded-lg text-[13px] cursor-pointer border transition-all"
                style={{
                  fontWeight: sel ? 700 : 500,
                  color: sel ? colors[r] : '#64748B',
                  backgroundColor: sel ? bgs[r] : '#fff',
                  border: sel ? `2px solid ${colors[r]}` : '1px solid #E2E8F0',
                }}>
                {r}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Step 2 — Target Asset Scope ────────────────────────── */
function Step2({ form, setForm, pendingDocs, setPendingDocs }: { form: any; setForm: any; pendingDocs?: {file: File, docType: string}[]; setPendingDocs?: any }) {
  const [vendors, setVendors] = useState<{ id: string; name: string }[]>([]);
  const isConsulting = form.personality === 'consulting' || form.personality === 'operations';

  useEffect(() => {
    getVendors().then(data => setVendors(data.map((v: any) => ({ id: v.id, name: v.name }))));
  }, []);

  // Auto-suggest lifecycle stage from SLM tasks
  useEffect(() => {
    if (!form.lifecycleStage && form.slmTasks?.length > 0) {
      const firstTask = form.slmTasks[0];
      const suggested = LIFECYCLE_STAGE_SUGGESTIONS[firstTask];
      if (suggested) setForm((f: any) => ({ ...f, lifecycleStage: suggested }));
    }
  }, [form.slmTasks]);

  const toggleSupplier = (id: string) => {
    const current: string[] = form.supplierScope || [];
    const updated = current.includes(id) ? current.filter(s => s !== id) : [...current, id];
    setForm({ ...form, supplierScope: updated });
  };

  const toggleDoc = (doc: string) => {
    const current: string[] = form.documentScope || [];
    const updated = current.includes(doc) ? current.filter(d => d !== doc) : [...current, doc];
    setForm({ ...form, documentScope: updated });
  };

  if (isConsulting) {
    return (
      <div>
        {/* Supplier Scope */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-[3px] h-3.5 rounded bg-sky-500" />
            <label className="text-[13px] font-bold text-slate-900">Supplier Scope</label>
            <span className="text-[11px] text-slate-400 ml-1">Pre-fills Create Agent supplier assignment</span>
          </div>
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            {vendors.length === 0 ? (
              <div className="px-4 py-3 text-sm text-slate-400">Loading vendors...</div>
            ) : vendors.map((v, i) => {
              const sel = (form.supplierScope || []).includes(v.id);
              return (
                <div key={v.id} onClick={() => toggleSupplier(v.id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 cursor-pointer transition-colors ${i < vendors.length - 1 ? 'border-b border-slate-100' : ''}`}
                  style={{ backgroundColor: sel ? '#EFF6FF' : '#fff' }}>
                  <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                    style={{ border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff' }}>
                    {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px]" style={{ fontWeight: sel ? 600 : 400, color: sel ? '#0EA5E9' : '#334155' }}>{v.name}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lifecycle Stage */}
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-[3px] h-3.5 rounded bg-violet-500" />
            <label className="text-[13px] font-bold text-slate-900">Lifecycle Stage</label>
            {form.lifecycleStage && <span className="text-[10px] text-sky-500 bg-blue-50 px-2 py-px rounded-full">Auto-suggested from SLM Tasks</span>}
          </div>
          <div className="flex gap-2 flex-wrap">
            {(['All Stages', 'Acquisition', 'Retention', 'Upgradation', 'Offboarding'] as const).map(stage => {
              const sel = form.lifecycleStage === stage;
              const colors: Record<string, string> = { 'All Stages': '#64748B', Acquisition: '#0EA5E9', Retention: '#10B981', Upgradation: '#F59E0B', Offboarding: '#94A3B8' };
              const bgs: Record<string, string> = { 'All Stages': '#F8FAFC', Acquisition: '#EFF6FF', Retention: '#ECFDF5', Upgradation: '#FFFBEB', Offboarding: '#F1F5F9' };
              return (
                <button key={stage} onClick={() => setForm({ ...form, lifecycleStage: stage })}
                  className="px-4 py-2 rounded-lg text-[13px] cursor-pointer border transition-all"
                  style={{ fontWeight: sel ? 700 : 500, color: sel ? colors[stage] : '#64748B', backgroundColor: sel ? bgs[stage] : '#fff', border: sel ? `2px solid ${colors[stage]}` : '1px solid #E2E8F0' }}>
                  {stage}
                </button>
              );
            })}
          </div>
        </div>

        {/* Communication Scope — driven by SLM Tasks */}
        {(form.slmTasks || []).some((t: string) => COMMUNICATION_SCOPE_MAP[t]) && (
          <div className="mb-6">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-[3px] h-3.5 rounded bg-emerald-500" />
              <label className="text-[13px] font-bold text-slate-900">Communication Scope</label>
              <span className="text-[11px] text-slate-400 ml-1">Contacts needed per SLM Task — pre-fills Create Agent</span>
            </div>
            <div className="flex flex-col gap-2">
              {(form.slmTasks || []).filter((t: string) => COMMUNICATION_SCOPE_MAP[t]).map((task: string) => {
                const { label, placeholder } = COMMUNICATION_SCOPE_MAP[task];
                const val = (form.communicationScope || {})[task] || '';
                return (
                  <div key={task} className="bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-3">
                    <div className="text-[11px] font-semibold text-sky-500 mb-1.5">{task} → {label}</div>
                    <div className="flex items-center gap-2">
                      <Mail size={13} className="text-slate-400 shrink-0" />
                      <input className={INPUT_CLS} placeholder={placeholder} value={val}
                        onChange={e => setForm({ ...form, communicationScope: { ...(form.communicationScope || {}), [task]: e.target.value } })} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Document Scope */}
        <div className="mb-4">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-[3px] h-3.5 rounded bg-amber-500" />
            <label className="text-[13px] font-bold text-slate-900">Document Scope</label>
          </div>
          <div className="flex flex-wrap gap-2 mb-4">
            {DOCUMENT_SCOPE_OPTIONS.map(doc => {
              const sel = (form.documentScope || []).includes(doc);
              return (
                <button key={doc} onClick={() => toggleDoc(doc)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs cursor-pointer border transition-all"
                  style={{ fontWeight: sel ? 600 : 400, color: sel ? '#D97706' : '#64748B', backgroundColor: sel ? '#FFFBEB' : '#fff', border: sel ? '2px solid #D97706' : '1px solid #E2E8F0' }}>
                  <FileText size={11} />
                  {sel && <Check size={10} />}
                  {doc}
                </button>
              );
            })}
          </div>
          
          {(form.documentScope || []).length > 0 && (
            <div className="flex flex-col gap-3">
              {(form.documentScope || []).map((docType: string) => {
                const existing = pendingDocs?.find((p: any) => p.docType === docType);
                return (
                  <div key={'upload-'+docType} className="border border-dashed border-slate-300 rounded-lg p-3.5 bg-slate-50 relative flex justify-between items-center">
                    <div className="text-[12px] font-bold text-slate-700">{docType} Document</div>
                    {existing ? (
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 overflow-hidden bg-white border border-slate-200 px-3 py-1.5 rounded-md shadow-sm">
                          <FileText size={14} className="text-red-500 shrink-0" />
                          <span className="text-xs text-slate-700 truncate max-w-[150px]">{existing.file.name}</span>
                        </div>
                        <button onClick={() => setPendingDocs?.((p: any) => p.filter((x: any) => x.docType !== docType))} 
                          className="bg-white border text-red-500 border-red-200 rounded px-2.5 py-1.5 text-xs font-semibold cursor-pointer hover:bg-red-50 shrink-0 shadow-sm transition-colors">
                          Remove
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <label className="bg-white border border-slate-200 text-slate-700 text-xs px-3.5 py-1.5 rounded-md cursor-pointer hover:bg-slate-50 font-semibold shadow-sm transition-colors">
                          Upload PDF
                          <input type="file" accept=".pdf,application/pdf" className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
                                  toast.error('Only PDF files are allowed');
                                  return;
                                }
                                setPendingDocs?.((p: any) => [...p.filter((x: any) => x.docType !== docType), { file, docType }]);
                              }
                            }} 
                          />
                        </label>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  // IT Risk — assets shown as Not Connected
  return (
    <div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-4 flex gap-2">
        <Globe size={15} className="text-amber-500 shrink-0 mt-0.5" />
        <div className="text-xs text-amber-800">
          <strong>Asset integrations not connected.</strong> Connect your infrastructure in Settings → Integrations to enable technical control evaluation.
        </div>
      </div>
      <div className="flex flex-col gap-2 mb-6">
        {ASSET_CATEGORIES.map(cat => (
          <div key={cat.id} className="flex items-center justify-between px-3.5 py-3 border border-slate-200 rounded-lg bg-slate-50 opacity-60">
            <div>
              <span className="text-[13px] font-semibold text-slate-400">{cat.name}</span>
              <span className="text-xs text-slate-400 ml-2">{cat.desc}</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400 bg-slate-200 px-2 py-px rounded-full">Not Connected</span>
          </div>
        ))}
        {/* Suppliers — active */}
        <div className="flex items-center justify-between px-3.5 py-3 border border-sky-200 rounded-lg bg-blue-50 cursor-pointer">
          <div>
            <span className="text-[13px] font-semibold text-slate-700">Suppliers</span>
            <span className="text-xs text-slate-500 ml-2">Third-party vendors</span>
          </div>
          <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 px-2 py-px rounded-full">● Connected</span>
        </div>
      </div>
    </div>
  );
}

/* ── Step 3 — Data Source ───────────────────────────────── */
function Step3({ form, setForm }: { form: any; setForm: any }) {
  const isConsulting = form.personality === 'consulting' || form.personality === 'operations';

  const RETENTION_OPTIONS = ['30 days', '90 days', '1 year', '7 years'];

  const consultingSources = [
    { id: 'email', label: 'Email Monitoring', desc: 'Read supplier SPOC email threads for anomaly detection', Icon: Mail, locked: false, comingSoon: false },
    { id: 'documents', label: 'Uploaded Documents', desc: 'Compare original uploaded docs (SOW, PO, Invoice) against email evidence', Icon: FileText, locked: false, comingSoon: false },
    { id: 'portal', label: 'Supplier Portal', desc: 'Assessment responses submitted by the supplier', Icon: Globe, locked: false, comingSoon: false },
    { id: 'teams', label: 'Microsoft Teams', desc: 'Monitor Teams channels and direct messages', Icon: MessageSquare, locked: false, comingSoon: false },
    { id: 'slack', label: 'Slack', desc: 'Monitor Slack channels and DMs', Icon: Hash, locked: false, comingSoon: false },
    { id: 'zoom', label: 'Zoom', desc: 'Analyze meeting transcripts and chat', Icon: Video, locked: false, comingSoon: false },
  ];

  const itRiskSources = [
    { id: 'documents', label: 'Uploaded Documents', desc: 'Policy documents, certificates, technical evidence', Icon: FileText, locked: false, comingSoon: false },
    { id: 'portal', label: 'Supplier Portal', desc: 'Assessment responses submitted by the supplier', Icon: Globe, locked: false, comingSoon: false },
    { id: 'teams', label: 'Microsoft Teams', desc: 'Monitor Teams channels and direct messages', Icon: MessageSquare, locked: false, comingSoon: false },
    { id: 'slack', label: 'Slack', desc: 'Monitor Slack channels and DMs', Icon: Hash, locked: false, comingSoon: false },
    { id: 'zoom', label: 'Zoom', desc: 'Analyze meeting transcripts and chat', Icon: Video, locked: false, comingSoon: false },
  ];

  const sources = isConsulting ? consultingSources : itRiskSources;

  const [showZoomSecret, setShowZoomSecret] = useState(false);

  const toggleSource = (id: string) => {
    const current: string[] = form.dataSources || [];
    const updated = current.includes(id) ? current.filter(s => s !== id) : [...current, id];
    setForm({ ...form, dataSources: updated });
  };



  return (
    <div>
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Data Sources</label>
        <div className="flex flex-col gap-2">
          {sources.map(({ id, label, desc, Icon, locked, comingSoon }) => {
            const sel = (form.dataSources || []).includes(id);
            return (
              <div key={id} className="flex flex-col gap-2">
                <div onClick={() => !locked && toggleSource(id)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-lg border transition-all ${locked ? 'cursor-default' : 'cursor-pointer'}`}
                  style={{ backgroundColor: sel ? '#EFF6FF' : '#fff', border: sel ? '1px solid #0EA5E9' : '1px solid #E2E8F0' }}>
                  <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                    style={{ border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff' }}>
                    {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-50 shrink-0">
                    <Icon size={15} color="#0EA5E9" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[13px] font-semibold text-slate-700">{label}</span>
                      {comingSoon && <span className="text-[10px] font-semibold text-amber-600 bg-amber-50 px-2 py-px rounded-full border border-amber-200">Coming Soon</span>}
                    </div>
                    <div className="text-xs text-slate-400 mt-px">{desc}</div>
                  </div>
                </div>

                {/* Conditional configurations based on data source */}
                
                {sel && id === 'teams' && (
                  <div className="ml-9 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Azure Tenant ID</label>
                        <input className={INPUT_CLS} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" value={form.teamsTenantId || ''} onChange={e => setForm({...form, teamsTenantId: e.target.value})} />
                        <div className="text-[10px] text-slate-400 mt-1">Your Azure AD tenant ID — found in Azure portal app registration</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Search Scope</label>
                        <div className="flex gap-4 mb-2">
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" checked={form.teamsScope === 'all' || !form.teamsScope} onChange={() => setForm({...form, teamsScope: 'all'})} /> All teams and channels
                          </label>
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" checked={form.teamsScope === 'specific'} onChange={() => setForm({...form, teamsScope: 'specific'})} /> Specific channels only
                          </label>
                        </div>
                        {form.teamsScope === 'specific' && (
                          <input className={INPUT_CLS} placeholder="general, supplier-reviews, finance" value={form.teamsChannels || ''} onChange={e => setForm({...form, teamsChannels: e.target.value})} />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {sel && id === 'slack' && (
                  <div className="ml-9 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Bot Token</label>
                        <input className={INPUT_CLS} placeholder="xoxb-..." value={form.slackBotToken || ''} onChange={e => setForm({...form, slackBotToken: e.target.value})} />
                        <div className="text-[10px] text-slate-400 mt-1">Install your Slack app and copy the Bot User OAuth Token</div>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Workspace</label>
                        <input className={INPUT_CLS} placeholder="yourcompany" value={form.slackWorkspaceUrl || ''} onChange={e => setForm({...form, slackWorkspaceUrl: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Search Scope</label>
                        <div className="flex gap-4 mb-2">
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" checked={form.slackScope === 'all' || !form.slackScope} onChange={() => setForm({...form, slackScope: 'all'})} /> All channels bot is invited to
                          </label>
                          <label className="text-xs flex items-center gap-1.5 cursor-pointer">
                            <input type="radio" checked={form.slackScope === 'specific'} onChange={() => setForm({...form, slackScope: 'specific'})} /> Specific channels only
                          </label>
                        </div>
                        {form.slackScope === 'specific' && (
                          <input className={INPUT_CLS} placeholder="#general, #supplier-comms" value={form.slackChannels || ''} onChange={e => setForm({...form, slackChannels: e.target.value})} />
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {sel && id === 'zoom' && (
                  <div className="ml-9 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="flex flex-col gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-0.5">Account ID</label>
                        <input className={INPUT_CLS} placeholder="your-zoom-account-id" value={form.zoomAccountId || ''} onChange={e => setForm({...form, zoomAccountId: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-0.5">Client ID</label>
                        <input className={INPUT_CLS} placeholder="your-zoom-client-id" value={form.zoomClientId || ''} onChange={e => setForm({...form, zoomClientId: e.target.value})} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-0.5">Client Secret</label>
                        <div className="relative">
                          <input type={showZoomSecret ? 'text' : 'password'} className={INPUT_CLS} placeholder="your-zoom-client-secret" value={form.zoomClientSecret || ''} onChange={e => setForm({...form, zoomClientSecret: e.target.value})} />
                          <button type="button" onClick={() => setShowZoomSecret(!showZoomSecret)} className="absolute right-3 top-2.5 text-xs text-slate-400 font-semibold cursor-pointer">
                            {showZoomSecret ? 'Hide' : 'Show'}
                          </button>
                        </div>
                      </div>
                      <div className="text-[11px] text-amber-700 bg-amber-50 px-2 py-1.5 rounded border border-amber-200 mt-1">Note: Zoom transcripts require cloud recording and audio transcription to be enabled in your Zoom account settings</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence Retention */}
      <div>
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Evidence Retention</label>
        <div className="flex gap-2">
          {RETENTION_OPTIONS.map(opt => {
            const sel = form.evidenceRetention === opt || (!form.evidenceRetention && opt === '90 days');
            return (
              <button key={opt} onClick={() => setForm({ ...form, evidenceRetention: opt })}
                className="px-4 py-2 rounded-lg text-[13px] cursor-pointer border transition-all"
                style={{ fontWeight: sel ? 700 : 500, color: sel ? '#0EA5E9' : '#64748B', backgroundColor: sel ? '#EFF6FF' : '#fff', border: sel ? '2px solid #0EA5E9' : '1px solid #E2E8F0' }}>
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ── Step 4 — Trigger Config ────────────────────────────── */
function Step4({ form, setForm }: { form: any; setForm: any }) {
  const TASK_EVENTS: Record<string, string> = {
    'Purchase Order Verification': 'new_email',
    'SOW Validation': 'document_uploaded',
    'Payment Conversation Monitoring': 'new_email',
    'Approval Chain Tracking': 'new_email',
    'Project Risk Identification': 'new_email',
    'Contractual Obligation Tracking': 'vendor_stage_changed',
    'Escalation & Stakeholder Review': 'new_email',
  };

  const EVENT_OPTIONS = [
    { id: 'new_email', label: 'New email received from supplier SPOC' },
    { id: 'document_uploaded', label: 'Document uploaded for this supplier' },
    { id: 'portal_submitted', label: 'Supplier portal assessment submitted' },
    { id: 'vendor_stage_changed', label: 'Vendor stage changed' },
    { id: 'manual', label: 'Manual trigger by Risk Manager' },
  ];

  const PRESETS = ['Every hour', 'Every 6 hrs', 'Daily', 'Weekly', 'Monthly'];

  // Auto-select trigger events from SLM tasks
  useEffect(() => {
    if (!form.triggerMode || form.triggerMode === 'event') {
      const autoEvents = Array.from(new Set((form.slmTasks || []).map((t: string) => TASK_EVENTS[t]).filter(Boolean)));
      if (autoEvents.length > 0 && JSON.stringify(autoEvents) !== JSON.stringify(form.triggerEvents)) {
        setForm((f: any) => ({ ...f, triggerMode: 'event', triggerEvents: autoEvents }));
      }
    }
  }, [form.slmTasks]);

  const toggleEvent = (id: string) => {
    const current: string[] = form.triggerEvents || [];
    const updated = current.includes(id) ? current.filter(e => e !== id) : [...current, id];
    setForm({ ...form, triggerEvents: updated });
  };

  const triggerMode = form.triggerMode || 'event';

  return (
    <div>
      {/* Trigger Mode */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Trigger Mode</label>
        <div className="grid grid-cols-3 gap-3">
          {[
            { id: 'manual', title: 'Manual', desc: 'Trigger evaluation on demand' },
            { id: 'scheduled', title: 'Scheduled', desc: 'Run on a recurring schedule' },
            { id: 'event', title: 'Event-Driven', desc: 'Trigger when something happens' },
          ].map(mode => {
            const sel = triggerMode === mode.id;
            return (
              <div key={mode.id} onClick={() => setForm({ ...form, triggerMode: mode.id })}
                className="p-4 rounded-[10px] cursor-pointer transition-all text-center"
                style={{ border: sel ? '2px solid #0EA5E9' : '1px solid #E2E8F0', backgroundColor: sel ? '#EFF6FF' : '#fff' }}>
                <div className="text-[13px] font-bold text-slate-900 mb-0.5">{mode.title}</div>
                <div className="text-[11px] text-slate-400">{mode.desc}</div>
                {sel && mode.id === 'event' && <div className="mt-1 text-[10px] font-bold text-sky-500">Recommended for Consulting</div>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Event-Driven events */}
      {triggerMode === 'event' && (
        <div className="mb-6">
          <div className="flex items-center gap-1.5 mb-2">
            <div className="w-[3px] h-3.5 rounded bg-sky-500" />
            <label className="text-[13px] font-bold text-slate-900">Trigger Events</label>
            <span className="text-[11px] text-sky-500 bg-blue-50 px-2 py-px rounded-full ml-1">Auto-selected from SLM Tasks</span>
          </div>
          <div className="flex flex-col gap-2">
            {EVENT_OPTIONS.map(({ id, label }) => {
              const sel = (form.triggerEvents || []).includes(id);
              return (
                <div key={id} onClick={() => toggleEvent(id)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg cursor-pointer border transition-all"
                  style={{ backgroundColor: sel ? '#EFF6FF' : '#fff', border: sel ? '1px solid #0EA5E9' : '1px solid #E2E8F0' }}>
                  <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                    style={{ border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff' }}>
                    {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  <span className="text-[13px]" style={{ color: sel ? '#0EA5E9' : '#334155', fontWeight: sel ? 600 : 400 }}>{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Scheduled presets */}
      {triggerMode === 'scheduled' && (
        <div className="mb-6">
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Frequency</label>
          <div className="flex gap-2 flex-wrap">
            {PRESETS.map(p => {
              const sel = form.triggerFrequency === p;
              return (
                <button key={p} onClick={() => setForm({ ...form, triggerFrequency: p })}
                  className="px-4 py-2 rounded-lg text-[13px] cursor-pointer border transition-all"
                  style={{ fontWeight: sel ? 700 : 500, color: sel ? '#0EA5E9' : '#64748B', backgroundColor: sel ? '#EFF6FF' : '#fff', border: sel ? '2px solid #0EA5E9' : '1px solid #E2E8F0' }}>
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* First Evaluation Date */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">First Evaluation Date</label>
          <input type="date" className={INPUT_CLS} value={form.firstEvalDate || ''}
            onChange={e => setForm({ ...form, firstEvalDate: e.target.value })} />
        </div>
        <div>
          <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Time</label>
          <input type="time" className={INPUT_CLS} value={form.firstEvalTime || ''}
            onChange={e => setForm({ ...form, firstEvalTime: e.target.value })} />
        </div>
      </div>
    </div>
  );
}

/* ── Step 5 — AI Behaviour ──────────────────────────────── */
function Step5({ form, setForm }: { form: any; setForm: any }) {
  const isConsulting = form.personality === 'consulting' || form.personality === 'operations';

  const CONSULTING_ANOMALIES = [
    { id: 'sow_date', label: 'SOW Date vs Service Start Date', taskKey: 'SOW Validation' },
    { id: 'payment_po', label: 'Payment Without PO Approval', taskKey: 'Payment Conversation Monitoring' },
    { id: 'milestone', label: 'Milestone Slip > 7 Days', taskKey: 'Project Risk Identification' },
    { id: 'cert_expiry', label: 'Certification Expiry < 30 Days', taskKey: 'Contractual Obligation Tracking' },
    { id: 'dup_invoice', label: 'Duplicate Invoice Detection', taskKey: 'Payment Conversation Monitoring' },
    { id: 'contract_renewal', label: 'Contract Renewal < 30 Days', taskKey: 'Contractual Obligation Tracking' },
    { id: 'escalation_overdue', label: 'Escalation Response Overdue', taskKey: 'Escalation & Stakeholder Review' },
  ];

  const AUTO_ACTIONS = [
    { id: 'send_email_alert', label: 'Send email alert', desc: 'Emails the notification list' },
    { id: 'reduce_risk_score', label: 'Reduce supplier risk score automatically', desc: 'Updates vendor score in real time' },
    { id: 'flag_for_review', label: 'Flag for human review', desc: 'Adds a review flag on the agent detail page' },
    { id: 'create_slm_task', label: 'Create SLM Task', desc: 'Creates a task in the agent task list' },
  ];

  // Auto-generate evaluation prompt from SLM tasks
  useEffect(() => {
    if (form.slmTasks?.length > 0 && !form.evaluationPromptEdited) {
      const persona = form.personality === 'consulting' ? 'Consulting' : 'Operations';
      const taskList = form.slmTasks.map((t: string, i: number) => `${i + 1}. ${t}`).join('\\n');

      const prompt = `You are a ${persona} Agent responsible for monitoring a supplier relationship in a Third Party Risk Management (TPRM) system.

Your role is to analyze all available data sources and identify compliance issues, operational risks, and any signs of unethical or fraudulent behavior.

You are provided with:
- Email threads between internal stakeholders and the supplier
- Uploaded reference documents (contracts, SOW, PO, invoices, SLA, etc.)
- Slack messages
- Microsoft Teams conversations
- Zoom meeting transcripts

---

TASK OBJECTIVE:
Evaluate the supplier’s activities based on the following tasks:
${taskList}

---

ANALYSIS INSTRUCTIONS:

1. Cross-Source Validation  
Compare all communications (email, Slack, Teams, Zoom) with reference documents.  
Identify discrepancies, inconsistencies, or missing information.

2. Task-Oriented Evaluation  
Focus on the assigned tasks listed above and determine whether the supplier’s actions align with expectations.

3. Compliance & Governance Review  
Identify violations of processes, missing approvals, undocumented decisions, or workflow bypasses.

4. Financial & Transaction Risk (if applicable)  
Detect anomalies in invoices, payments, pricing, or bank details.

5. Contractual & Documentation Integrity  
Ensure all actions align with formal agreements (SOW, contracts, SLA, policies).  
Flag any activity occurring without proper documentation.

6. Communication Risk Analysis  
Analyze tone, intent, and context across all channels.  
Pay special attention to informal communication (Slack, Teams, Zoom).

7. Fraud & Ethical Risk Detection (CRITICAL)  
Detect:
- manipulation of invoices or payments  
- attempts to hide financial changes  
- collusion between internal staff and supplier  
- requests to keep decisions secret  
- intent to gain unauthorized financial benefit  

Flag intent-based risks even if no document discrepancy exists.

8. Implicit Risk Detection  
Even if no explicit violation is found, identify suspicious patterns, unusual behavior, or early warning signals.

---

OUTPUT FORMAT:

FINDINGS:
- key observations with source (Email / Slack / Teams / Zoom / Document)

DISCREPANCIES:
- mismatches between documents and communication

RISK LEVEL:
- Low / Medium / High / Critical

RECOMMENDED ACTION:
- clear, actionable next steps

---

IMPORTANT:
- prioritize high-risk issues  
- be evidence-based  
- escalate fraud or unethical intent to Critical`;

      setForm((f: any) => ({ ...f, evaluationPrompt: prompt }));
    }
  }, [form.slmTasks, form.personality, form.evaluationPromptEdited]);

  // Auto-generate remediation suggestion
  useEffect(() => {
    if (form.slmTasks?.length > 0 && !form.remediationEdited) {
      const suggestion = `Request the supplier provide the required documentation for: ${(form.slmTasks || []).join(', ')}. Escalate to internal SPOC if not received within 48 hours. Update supplier risk score pending resolution.`;
      setForm((f: any) => ({ ...f, remediationSuggestion: suggestion }));
    }
  }, [form.slmTasks]);

  // Auto-select anomaly triggers from SLM tasks
  useEffect(() => {
    if (form.slmTasks?.length > 0 && !form.anomalyTriggersEdited) {
      const autoTriggers = CONSULTING_ANOMALIES
        .filter(a => form.slmTasks.includes(a.taskKey))
        .map(a => a.id);
      setForm((f: any) => ({ ...f, anomalyTriggers: autoTriggers }));
    }
  }, [form.slmTasks]);

  // Default auto actions
  useEffect(() => {
    if (!form.autoActions || form.autoActions.length === 0) {
      setForm((f: any) => ({ ...f, autoActions: AUTO_ACTIONS.map(a => a.id) }));
    }
  }, []);

  const toggleAnomaly = (id: string) => {
    const current: string[] = form.anomalyTriggers || [];
    setForm({ ...form, anomalyTriggers: current.includes(id) ? current.filter(a => a !== id) : [...current, id], anomalyTriggersEdited: true });
  };

  const toggleAction = (id: string) => {
    const current: string[] = form.autoActions || [];
    setForm({ ...form, autoActions: current.includes(id) ? current.filter(a => a !== id) : [...current, id] });
  };

  return (
    <div>
      {/* Evaluation Instructions */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-[3px] h-3.5 rounded bg-sky-500" />
          <label className="text-[13px] font-bold text-slate-900">Evaluation Instructions</label>
          <span className="text-[11px] text-sky-500 bg-blue-50 px-2 py-px rounded-full ml-1">This is the Mistral SLM prompt</span>
        </div>
        <div className="text-xs text-slate-400 mb-2">Auto-generated from your SLM Tasks. Edit to refine how the agent evaluates this control.</div>
        <textarea rows={5} className={`${INPUT_CLS} resize-y`}
          value={form.evaluationPrompt || ''}
          onChange={e => setForm({ ...form, evaluationPrompt: e.target.value, evaluationPromptEdited: true })}
          placeholder="Select SLM Tasks in Step 1 to auto-generate this prompt..." />
      </div>

      {/* SLM Anomaly Triggers */}
      <div className="mb-6">
        <div className="flex items-center gap-1.5 mb-1">
          <div className="w-[3px] h-3.5 rounded bg-red-500" />
          <label className="text-[13px] font-bold text-slate-900">SLM Anomaly Triggers</label>
          <span className="text-[11px] text-sky-500 bg-blue-50 px-2 py-px rounded-full ml-1">Auto-selected from SLM Tasks</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {CONSULTING_ANOMALIES.map(({ id, label }) => {
            const sel = (form.anomalyTriggers || []).includes(id);
            return (
              <button key={id} onClick={() => toggleAnomaly(id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs cursor-pointer border transition-all"
                style={{ fontWeight: sel ? 700 : 400, color: sel ? '#EF4444' : '#64748B', backgroundColor: sel ? '#FCEBEB' : '#fff', border: sel ? '2px solid #EF4444' : '1px solid #E2E8F0' }}>
                {sel && <Check size={10} />}
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Confidence Threshold */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
          Confidence Threshold — <span className="text-sky-500 font-bold">{form.confidenceThreshold ?? 75}%</span>
        </label>
        <input type="range" min={0} max={100} step={5}
          value={form.confidenceThreshold ?? 75}
          onChange={e => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
          className="w-full cursor-pointer" style={{ accentColor: '#0EA5E9' }} />
        <div className="text-xs text-slate-400 mt-1">Below this threshold the AI flags for human review instead of auto-deciding.</div>
      </div>

      {/* Auto Actions on Fail */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Auto Actions on Fail</label>
        <div className="flex flex-col gap-2">
          {AUTO_ACTIONS.map(({ id, label, desc }) => {
            const sel = (form.autoActions || []).includes(id);
            return (
              <div key={id} onClick={() => toggleAction(id)}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg cursor-pointer border transition-all"
                style={{ backgroundColor: sel ? '#EFF6FF' : '#fff', border: sel ? '1px solid #0EA5E9' : '1px solid #E2E8F0' }}>
                <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                  style={{ border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff' }}>
                  {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                </div>
                <div className="flex-1">
                  <div className="text-[13px]" style={{ fontWeight: sel ? 600 : 400, color: sel ? '#0EA5E9' : '#334155' }}>{label}</div>
                  <div className="text-xs text-slate-400">{desc}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Remediation Suggestion */}
      <div className="mb-6">
        <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Remediation Suggestion</label>
        <div className="text-xs text-slate-400 mb-2">Auto-generated from SLM Tasks. Edit to customise.</div>
        <textarea rows={3} className={`${INPUT_CLS} resize-none`}
          value={form.remediationSuggestion || ''}
          onChange={e => setForm({ ...form, remediationSuggestion: e.target.value, remediationEdited: true })}
          placeholder="What should the agent recommend when this control fails?" />
      </div>

      {/* Toggles */}
      <div className="flex flex-col gap-3">
        {[
          { key: 'storeSnapshots', label: 'Store evidence snapshots for each evaluation', desc: 'Saves what the agent read and found — used for audit trail', defaultVal: true },
          { key: 'requireApproval', label: 'Require human approval before marking as compliant', desc: 'Even if agent finds no issues a human must confirm', defaultVal: false },
          { key: 'truthGapDetection', label: 'Truth Gap Detection', desc: isConsulting ? 'Compare what supplier declared in portal vs what agent detects in emails. ON by default for Consulting.' : 'Detect mismatches between declared and detected data', defaultVal: isConsulting },
        ].map(({ key, label, desc, defaultVal }) => {
          const val = form[key] !== undefined ? form[key] : defaultVal;
          return (
            <div key={key} className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
              <div>
                <div className="text-[13px] font-semibold text-slate-700">{label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{desc}</div>
              </div>
              <InlineToggle on={val} onChange={() => setForm({ ...form, [key]: !val })} />
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Main CreateControlPage ─────────────────────────────── */
export function CreateControlPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [isActivating, setIsActivating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [pendingDocs, setPendingDocs] = useState<{file: File, docType: string}[]>([]);
  const [form, setForm] = useState<any>({
    name: '', description: '', source: 'local', grcProvider: '',
    personality: '', category: 'Process', risk: 'High',
    slmTasks: [],
    supplierScope: [], lifecycleStage: '', communicationScope: {}, documentScope: [],
    dataSources: [], evidenceRetention: '90 days',
    triggerMode: 'event', triggerEvents: [], triggerFrequency: 'Daily',
    firstEvalDate: '', firstEvalTime: '',
    evaluationPrompt: '', anomalyTriggers: [], confidenceThreshold: 75,
    autoActions: ['send_email_alert', 'reduce_risk_score', 'flag_for_review', 'create_slm_task'],
    remediationSuggestion: '', storeSnapshots: true, requireApproval: false, truthGapDetection: true,
  });

  const canNext = step === 1 ? form.name.trim().length > 0 && form.personality.length > 0 : true;

  const handleActivate = async () => {
    setIsActivating(true);
    try {
      const dataSourcesConfig: any = {};
      if (form.dataSources?.includes('teams')) {
        dataSourcesConfig.teams = {
          tenant_id: form.teamsTenantId,
          scope: form.teamsScope || 'all',
          channels: form.teamsScope === 'specific' ? form.teamsChannels : null
        };
      }
      if (form.dataSources?.includes('slack')) {
        dataSourcesConfig.slack = {
          bot_token: form.slackBotToken,
          workspace: form.slackWorkspaceUrl,
          scope: form.slackScope || 'all',
          channels: form.slackScope === 'specific' ? form.slackChannels : null
        };
      }
      if (form.dataSources?.includes('zoom')) {
        dataSourcesConfig.zoom = {
          account_id: form.zoomAccountId,
          client_id: form.zoomClientId,
          client_secret: form.zoomClientSecret
        };
      }

      const newControl = await createControl({
        name: form.name.trim(),
        desc: form.description.trim(),
        category: form.category,
        personality: form.personality,
        risk: form.risk,
        active: true,
        coverage: 0,
        slmTasks: form.slmTasks || [],
        supplierScope: form.supplierScope || [],
        lifecycleStage: form.lifecycleStage || null,
        communicationScope: form.communicationScope || {},
        documentScope: form.documentScope || [],
        dataSources: form.dataSources || [],
        dataSourcesConfig: Object.keys(dataSourcesConfig).length > 0 ? dataSourcesConfig : undefined,
        evidenceRetention: form.evidenceRetention || '90d',
        triggerMode: form.triggerMode || 'event',
        triggerEvents: form.triggerEvents || [],
        triggerFrequency: form.triggerFrequency || null,
        firstEvalDate: form.firstEvalDate || null,
        firstEvalTime: form.firstEvalTime || null,
        evaluationPrompt: form.evaluationPrompt || null,
        anomalyTriggers: form.anomalyTriggers || [],
        confidenceThreshold: form.confidenceThreshold ?? 75,
        autoActions: form.autoActions || [],
        remediationSuggestion: form.remediationSuggestion || null,
        storeSnapshots: form.storeSnapshots ?? true,
        requireApproval: form.requireApproval ?? false,
        truthGapDetection: form.truthGapDetection ?? true,
        internalSpoc: undefined,
        externalSpoc: undefined,
        truthValidator: form.truthGapDetection ?? true,
        hasTruthGap: false,
        controlSource: form.source || 'local',
      });
      
      if (pendingDocs.length > 0 && newControl?.id) {
        const token = useAuthStore.getState().token;
        for (const pd of pendingDocs) {
          const formData = new FormData();
          formData.append('file', pd.file);
          formData.append('doc_type', pd.docType);
          
          try {
            await fetch(`http://localhost:8000/api/controls/${newControl.id}/documents`, {
              method: 'POST',
              headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
              body: formData
            });
          } catch (uploadErr) {
            console.error('Failed to upload document', pd.docType, uploadErr);
            toast.error(`Failed to upload ${pd.docType} document`);
          }
        }
      }

      setIsActivating(false);
      setIsSuccess(true);
      toast.success(`Control "${form.name}" created successfully!`);
    } catch (err) {
      setIsActivating(false);
      toast.error('Failed to create control');
      console.error(err);
    }
  };

  const resetForm = () => {
    setIsSuccess(false);
    setStep(1);
    setForm({
      name: '', description: '', source: 'local', grcProvider: '',
      personality: '', category: 'Process', risk: 'High',
      slmTasks: [], supplierScope: [], lifecycleStage: '', communicationScope: {}, documentScope: [],
      dataSources: [], evidenceRetention: '90 days',
      triggerMode: 'event', triggerEvents: [], triggerFrequency: 'Daily',
      firstEvalDate: '', firstEvalTime: '',
      evaluationPrompt: '', anomalyTriggers: [], confidenceThreshold: 75,
      autoActions: ['send_email_alert', 'reduce_risk_score', 'flag_for_review', 'create_slm_task'],
      remediationSuggestion: '', storeSnapshots: true, requireApproval: false, truthGapDetection: true,
      teamsTenantId: undefined, teamsScope: undefined, teamsChannels: undefined,
      slackBotToken: undefined, slackWorkspaceUrl: undefined, slackScope: undefined, slackChannels: undefined,
      zoomAccountId: undefined, zoomClientId: undefined, zoomClientSecret: undefined,
    });
    setPendingDocs([]);
  };

  if (isSuccess) {
    return (
      <div className="max-w-[720px] mx-auto">
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={36} color="#10B981" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Control Created!</h2>
          <p className="text-slate-500 text-sm mb-6">"{form.name}" is now active and ready to be assigned to an agent.</p>
          <div className="flex gap-3 justify-center">
            <button onClick={() => navigate('/controls')}
              className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600">
              View Controls
            </button>
            <button onClick={resetForm}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50">
              Create Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stepContent: Record<number, React.ReactNode> = {
    1: <Step1 form={form} setForm={setForm} />,
    2: <Step2 form={form} setForm={setForm} pendingDocs={pendingDocs} setPendingDocs={setPendingDocs} />,
    3: <Step3 form={form} setForm={setForm} />,
    4: <Step4 form={form} setForm={setForm} />,
    5: <Step5 form={form} setForm={setForm} />,
  };

  return (
    <div className="max-w-[900px] flex flex-col gap-0">
      {/* Header */}
      <div className="mb-5">
        <button onClick={() => navigate('/controls')}
          className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-3 p-0 hover:text-sky-500">
          <ArrowLeft size={16} /> Back to Controls
        </button>
        <h1 className="text-2xl font-bold text-slate-900 m-0">Create Control</h1>
        <p className="text-sm text-slate-500 mt-1 mb-0">Configure a new governance control</p>
      </div>

      <StepperBar steps={STEPS} currentStep={step} />

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h3 className="text-lg font-bold text-slate-900 mb-1">
            Step {step} — {STEPS[step - 1].label}
          </h3>
        </div>

        {stepContent[step]}

        <div className="flex justify-between mt-6 pt-5 border-t border-slate-200">
          <div>
            {step > 1 && <GhostBtn onClick={() => setStep(s => s - 1)}>← Back</GhostBtn>}
          </div>
          <div className="flex gap-2.5">
            {step < 5 ? (
              <PrimaryBtn onClick={() => setStep(s => s + 1)} disabled={!canNext}>
                Next →
              </PrimaryBtn>
            ) : (
              <PrimaryBtn onClick={handleActivate}>
                Activate Control →
              </PrimaryBtn>
            )}
          </div>
        </div>
      </div>

      {isActivating && (
        <div className="fixed inset-0 bg-white/80 flex items-center justify-center z-[100]">
          <div className="flex items-center gap-3 text-base font-semibold text-slate-900">
            <Loader2 size={24} className="text-sky-500 animate-spin" />
            Activating control...
          </div>
        </div>
      )}
    </div>
  );
}

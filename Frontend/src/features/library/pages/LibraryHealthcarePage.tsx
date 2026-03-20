import { useState, useEffect } from 'react';
import { ArrowLeft, X, Check, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { getHealthcareStages, deleteSupplier, deleteSystem } from '../services/library.data';
import { createVendor } from '../../vendors/services/vendors.data';

/* ── Types ───────────────────────────────────────────── */
type SupplierState = 'pending' | 'overdue' | 'complete_unconfigured' | 'active';

interface SupplierCard {
  id: string;
  name: string;
  email?: string;
  state: SupplierState;
  score?: number;
  risk?: string;
  daysInfo?: string;
  piiIcons?: string[];
  transferMethod?: string;
  agent?: string;
}

interface SystemCard {
  id: string;
  name: string;
  method: string;
  methodColor: string;
}

interface StageData {
  id: string;
  label: string;
  color: string;
  systems: SystemCard[];
  suppliers: SupplierCard[];
}

/* ── Method color map ────────────────────────────────── */
const METHOD_COLORS: Record<string, string> = {
  'Mobile App': '#0EA5E9',
  'Portal': '#8B5CF6',
  'Email': '#10B981',
  'Phone': '#F59E0B',
  'API': '#06B6D4',
  'Branch': '#F59E0B',
  'Internal': '#64748B',
};

/* ── Mock Data ───────────────────────────────────────── */
const initialStages: StageData[] = [
  {
    id: 'acquisition', label: 'Acquisition', color: '#0EA5E9',
    systems: [
      { id: 's1', name: 'Insurance Sales App', method: 'Mobile App', methodColor: '#0EA5E9' },
      { id: 's2', name: 'Branch Walk-in', method: 'Branch', methodColor: '#F59E0B' },
      { id: 's3', name: 'CRM Portal', method: 'Portal', methodColor: '#8B5CF6' },
    ],
    suppliers: [
      { id: 'sup1', name: 'Field Agent Mgmt Co', state: 'complete_unconfigured', score: 78, risk: 'High' },
      { id: 'sup2', name: 'Doc Verify Service', state: 'pending', daysInfo: 'Portal sent 5 days ago' },
    ],
  },
  {
    id: 'retention', label: 'Retention', color: '#10B981',
    systems: [
      { id: 's4', name: 'Email Campaign System', method: 'Email', methodColor: '#10B981' },
      { id: 's5', name: 'Call Center', method: 'Phone', methodColor: '#F59E0B' },
      { id: 's6', name: 'Customer Portal', method: 'Portal', methodColor: '#8B5CF6' },
    ],
    suppliers: [
      { id: 'sup3', name: 'XYZ Email Marketing', state: 'active', score: 42, risk: 'Low', piiIcons: ['Email', 'Mobile'], transferMethod: 'API · Daily', agent: 'A2' },
      { id: 'sup4', name: 'Call Center Outsourcing', state: 'overdue', daysInfo: '38 days since invite' },
    ],
  },
  {
    id: 'upgradation', label: 'Upgradation', color: '#F59E0B',
    systems: [
      { id: 's7', name: 'Loyalty Platform', method: 'Portal', methodColor: '#8B5CF6' },
    ],
    suppliers: [
      { id: 'sup5', name: 'Upsell Campaign Manager', state: 'pending', daysInfo: 'Portal sent 2 days ago' },
    ],
  },
  {
    id: 'offboarding', label: 'Offboarding', color: '#94A3B8',
    systems: [
      { id: 's8', name: 'Account Closure', method: 'Internal', methodColor: '#64748B' },
      { id: 's9', name: 'Data Archival', method: 'Internal', methodColor: '#64748B' },
    ],
    suppliers: [],
  },
];

/* ── Supplier Card component ─────────────────────────── */
function SupplierCardView({
  supplier,
  onConfigure,
  onRemove,
}: {
  supplier: SupplierCard;
  onConfigure: (s: SupplierCard) => void;
  onRemove: (supplierId: string) => void;
}) {
  const stateConfig: Record<SupplierState, { bg: string; border: string }> = {
    pending: { bg: 'bg-white', border: 'border-slate-200' },
    overdue: { bg: 'bg-red-50', border: 'border-red-200' },
    complete_unconfigured: { bg: 'bg-emerald-50', border: 'border-emerald-200' },
    active: { bg: 'bg-white', border: 'border-sky-200' },
  };

  const config = stateConfig[supplier.state];

  return (
    <div className={`${config.bg} border ${config.border} rounded-lg p-3 transition-all hover:shadow-sm group`}>
      <div className="flex items-start justify-between mb-1.5">
        <div className="text-[13px] font-bold text-slate-900 leading-tight">{supplier.name}</div>
        <Trash2
          size={12}
          className="text-slate-300 cursor-pointer hover:text-red-500 shrink-0 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => {
            if (window.confirm(`Remove "${supplier.name}"?`)) {
              onRemove(supplier.id);
            }
          }}
        />
      </div>

      {supplier.state === 'pending' && (
        <>
          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-600 text-[10px] font-semibold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            Pending
          </span>
          <div className="text-[11px] text-slate-400 mt-1.5">{supplier.daysInfo}</div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => toast.success(`Reminder sent to ${supplier.name}`)}
              className="text-[11px] text-slate-500 bg-white border border-slate-200 rounded px-2.5 py-1 cursor-pointer hover:bg-slate-50 hover:border-slate-300 transition-colors"
            >
              Send Reminder
            </button>
          </div>
        </>
      )}

      {supplier.state === 'overdue' && (
        <>
          <span className="inline-flex items-center gap-1 bg-red-100 text-red-600 text-[10px] font-semibold px-2 py-0.5 rounded">
            <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
            Overdue
          </span>
          <div className="text-[11px] text-red-500 mt-1.5">{supplier.daysInfo}</div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => toast.success(`Reminder sent to ${supplier.name}`)}
              className="text-[11px] text-red-500 bg-red-50 border border-red-200 rounded px-2.5 py-1 cursor-pointer hover:bg-red-100 transition-colors"
            >
              Send Reminder
            </button>
          </div>
        </>
      )}

      {supplier.state === 'complete_unconfigured' && (
        <>
          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded">
            <CheckCircle2 size={10} />
            Assessed
          </span>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Score: <strong className="text-amber-500">{supplier.score}</strong> · {supplier.risk} Risk
          </div>
          <button
            onClick={() => onConfigure(supplier)}
            className="text-[11px] font-semibold text-sky-500 bg-transparent border-none cursor-pointer py-1 block mt-1 hover:text-sky-600 transition-colors"
          >
            Configure Data Sharing →
          </button>
        </>
      )}

      {supplier.state === 'active' && (
        <>
          <span className="inline-flex items-center gap-1 bg-sky-100 text-sky-600 text-[10px] font-semibold px-2 py-0.5 rounded">
            <CheckCircle2 size={10} />
            Active
          </span>
          <div className="text-[11px] text-slate-500 mt-1.5">
            Score: <strong>{supplier.score}</strong> · {supplier.risk} Risk
          </div>
          <div className="flex flex-wrap gap-1 mt-1.5">
            {supplier.piiIcons?.map(icon => (
              <span key={icon} className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-0.5 rounded">
                {icon}
              </span>
            ))}
          </div>
          <div className="text-[10px] text-slate-400 mt-1">{supplier.transferMethod} · Agent: {supplier.agent}</div>
        </>
      )}
    </div>
  );
}

/* ── Add Process/System Modal ────────────────────────── */
function AddProcessModal({ stage, onClose, onAdd }: {
  stage: string;
  onClose: () => void;
  onAdd: (sys: SystemCard) => void;
}) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState('Portal');

  function handleSubmit() {
    if (!name.trim()) return;
    const newSys: SystemCard = {
      id: `sys_${Date.now()}`,
      name: name.trim(),
      method,
      methodColor: METHOD_COLORS[method] || '#64748B',
    };
    onAdd(newSys);
    toast.success(`"${name.trim()}" added to ${stage}`);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-[440px] bg-white rounded-[14px] shadow-[0_20px_60px_rgba(0,0,0,0.18)] z-[1]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0 mb-1">Add Process / System</h2>
            <span className="bg-blue-50 text-sky-500 text-xs font-medium px-2.5 py-0.5 rounded-full">{stage} stage</span>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 p-1">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 pt-5 pb-2">
          <label className="block text-xs font-semibold text-slate-700 mb-1">System / Process Name *</label>
          <input
            className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Customer Portal"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />

          <label className="block text-xs font-semibold text-slate-700 mb-1">Method / Channel</label>
          <select
            className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3 appearance-none cursor-pointer"
            value={method}
            onChange={e => setMethod(e.target.value)}
          >
            {Object.keys(METHOD_COLORS).map(m => <option key={m}>{m}</option>)}
          </select>

          {/* Preview badge — colors are dynamic from METHOD_COLORS[method] */}
          <div className="mb-4">
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 5, backgroundColor: (METHOD_COLORS[method] || '#64748B') + '20', color: METHOD_COLORS[method] || '#64748B' }}>
              {method}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 px-6 pb-5 flex justify-end gap-2">
          <button onClick={onClose} className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-[9px] text-sm cursor-pointer">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            className={`text-white border-none rounded-lg px-5 py-[9px] text-sm font-semibold ${name.trim() ? 'bg-sky-500 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'}`}
          >
            Add System
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Add Supplier Modal ──────────────────────────────── */
function AddSupplierModal({ stage, onClose, onAdd }: {
  stage: string;
  onClose: () => void;
  onAdd: (sup: SupplierCard) => void;
}) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', contact: '', phone: '', website: '', gst: '', pan: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const canNext = form.name.trim() && form.email.trim();

  function handleInitiate() {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
      const newSup: SupplierCard = {
        id: `sup_${Date.now()}`,
        name: form.name.trim(),
        email: form.email.trim(),
        state: 'pending',
        daysInfo: 'Portal sent just now',
      };
      onAdd(newSup);
      toast.success(`Supplier "${form.name.trim()}" added to ${stage} stage`);
    }, 1600);
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />
      <div className="relative w-[540px] max-h-[90vh] bg-white rounded-[14px] flex flex-col shadow-[0_20px_60px_rgba(0,0,0,0.18)] z-[1]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0 mb-1">Add Supplier</h2>
            <span className="bg-violet-50 text-violet-500 text-xs font-medium px-2.5 py-0.5 rounded-full">{stage} stage</span>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400"><X size={20} /></button>
        </div>

        {/* Step indicator */}
        {!isSuccess && (
          <div className="flex gap-1.5 px-6 py-3 items-center shrink-0">
            {[1, 2].map(s => (
              <div
                key={s}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${s === step ? 'bg-sky-500 text-white' : s < step ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}
              >
                {s < step ? <Check size={13} strokeWidth={3} /> : s}
              </div>
            ))}
            <span className="text-[13px] text-slate-500 ml-1">{step === 1 ? 'Company Information' : 'Review & Initiate'}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {isSuccess ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-[14px]">
              <CheckCircle2 size={48} color="#10B981" strokeWidth={1.5} />
              <div className="text-lg font-bold text-slate-900">Supplier Initiated!</div>
              <div className="text-sm text-slate-500 max-w-[360px]">
                A portal link has been sent to {form.email || 'the contact'}. They have 30 days to complete.
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 w-full text-left">
                Reminders will be sent on Day 7, 15, 25, and 30.
              </div>
              <button onClick={onClose} className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer mt-2">Done</button>
            </div>
          ) : step === 1 ? (
            <>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-xs text-amber-800 mb-4 mt-2">
                PII configuration will be available after the supplier completes their risk assessment.
              </div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Supplier Name *</label>
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., XYZ Corporation" />
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email (primary contact) *</label>
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@company.com" />
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Person</label>
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Full name" />
              <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              <label className="block text-xs font-semibold text-slate-700 mb-1">Website</label>
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">GST Number</label>
                  <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none" value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">PAN Number</label>
                  <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none" value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value })} />
                </div>
              </div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 mt-3">Service Type</label>
              <div className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-500">
                <span className="bg-violet-50 text-violet-500 text-xs px-2 py-0.5 rounded-[5px]">{stage}</span>
              </div>
            </>
          ) : (
            <div className="mt-2">
              <div className="text-sm font-semibold text-slate-900 mb-3">Review Details</div>
              {Object.entries({ 'Supplier Name': form.name, 'Email': form.email, 'Contact': form.contact, 'Phone': form.phone, 'Stage': stage }).map(([k, v]) => v ? (
                <div key={k} className="flex justify-between py-2 border-b border-slate-100 text-sm">
                  <span className="text-slate-400">{k}</span>
                  <span className="text-slate-700 font-medium">{v}</span>
                </div>
              ) : null)}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div className="px-6 py-[14px] border-t border-slate-200 shrink-0 bg-white rounded-b-[14px]">
            {step === 1 ? (
              <div className="flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!canNext}
                  className={`text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold ${canNext ? 'bg-violet-500 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                  Next →
                </button>
              </div>
            ) : (
              <div className="flex justify-between">
                <button onClick={() => setStep(1)} className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer">← Back</button>
                <button
                  onClick={handleInitiate}
                  className="bg-violet-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer"
                >
                  {isLoading ? '⟳ Initiating...' : 'Initiate Supplier Onboarding'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Configure Data Sharing Panel ────────────────────── */
function ConfigureDataPanel({
  supplier,
  onClose,
  onSave,
}: {
  supplier: SupplierCard;
  onClose: () => void;
  onSave: (updatedSupplier: SupplierCard) => void;
}) {
  // Initialize from existing supplier data or defaults
  const [selectedPII, setSelectedPII] = useState<Set<string>>(
    new Set(supplier.piiIcons || ['name', 'email', 'phone'])
  );
  const [transferMethod, setTransferMethod] = useState(supplier.transferMethod || 'api');
  const [authorizedBy, setAuthorizedBy] = useState('');
  const [role, setRole] = useState('Risk Manager');
  const [apiEndpoint, setApiEndpoint] = useState('');
  const [apiAuth, setApiAuth] = useState('OAuth 2.0');
  const [frequency, setFrequency] = useState('Real-time');
  const [startDate, setStartDate] = useState('');

  const piiFields = [
    { id: 'name', label: 'Full Name' }, { id: 'aadhar', label: 'Aadhar / National ID' },
    { id: 'email', label: 'Email Address' }, { id: 'pan', label: 'PAN Number' },
    { id: 'phone', label: 'Phone Number' }, { id: 'financial', label: 'Financial Information' },
    { id: 'address', label: 'Physical Address' }, { id: 'health', label: 'Health Records' },
    { id: 'biometric', label: 'Biometric Data' }, { id: 'credentials', label: 'Login Credentials' },
  ];
  const togglePII = (id: string) => { const n = new Set(selectedPII); n.has(id) ? n.delete(id) : n.add(id); setSelectedPII(n); };

  const handleSave = () => {
    // Create updated supplier with data sharing configuration
    const updatedSupplier: SupplierCard = {
      ...supplier,
      piiIcons: Array.from(selectedPII),
      transferMethod,
      state: 'active', // Mark as configured/active
    };
    onSave(updatedSupplier);
    toast.success(`Data sharing configured for ${supplier.name}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[200]">
      <div onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="absolute right-0 top-0 bottom-0 w-[560px] bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.12)]">
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 m-0 mb-0.5">Configure Data Sharing</h2>
            <div className="text-[13px] text-slate-500">{supplier.name}</div>
          </div>
          <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400"><X size={20} /></button>
        </div>
        <div className="bg-amber-50 border border-amber-200 px-6 py-2.5 text-[13px] text-amber-800 shrink-0">
          Risk Score: <strong>{supplier.score}</strong> — {supplier.risk} · Assessment completed Mar 1, 2026
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">What PII are we sending? *</label>
            <div className="grid grid-cols-2 gap-2">
              {piiFields.map(f => (
                <label key={f.id} onClick={() => togglePII(f.id)} className="flex items-center gap-2 cursor-pointer text-[13px] text-slate-700">
                  <div
                    className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 ${selectedPII.has(f.id) ? 'border-sky-500 bg-sky-500' : 'border-slate-300 bg-white'}`}
                  >
                    {selectedPII.has(f.id) && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  {f.label}
                </label>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Authorized by *</label>
              <input
                className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3"
                placeholder="Full name"
                value={authorizedBy}
                onChange={e => setAuthorizedBy(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Role</label>
              <select
                className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none"
                value={role}
                onChange={e => setRole(e.target.value)}
              >
                <option>Risk Manager</option><option>DPO</option><option>Compliance Officer</option><option>Admin</option>
              </select>
            </div>
          </div>
          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Transfer Method *</label>
            <div className="grid grid-cols-3 gap-2.5">
              {[{ id: 'api', label: 'API Integration' }, { id: 'excel', label: 'Excel Sheet' }, { id: 'db', label: 'Database Dump' }].map(m => (
                <div
                  key={m.id}
                  onClick={() => setTransferMethod(m.id)}
                  className={`p-3 rounded-[10px] text-center cursor-pointer ${transferMethod === m.id ? 'border-2 border-sky-500 bg-blue-50' : 'border border-slate-200 bg-white'}`}
                >
                  <div className="text-xs font-semibold text-slate-900">{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          {transferMethod === 'api' && (
            <div className="bg-slate-50 border border-slate-200 rounded-[10px] p-[14px] mb-5">
              <input
                className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3"
                placeholder="Endpoint URL"
                value={apiEndpoint}
                onChange={e => setApiEndpoint(e.target.value)}
              />
              <select
                className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none"
                value={apiAuth}
                onChange={e => setApiAuth(e.target.value)}
              >
                <option>OAuth 2.0</option><option>API Key</option>
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Transfer Frequency *</label>
              <select
                className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none"
                value={frequency}
                onChange={e => setFrequency(e.target.value)}
              >
                <option>Real-time</option><option>Hourly</option><option>Daily</option><option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Transfer Start Date *</label>
              <input
                type="date"
                className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
              />
            </div>
          </div>
        </div>
        <div className="px-6 py-[14px] border-t border-slate-200 flex justify-end gap-2.5 shrink-0 bg-white">
          <button onClick={onClose} className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer">Cancel</button>
          <button
            onClick={handleSave}
            className="bg-sky-500 text-white border-none rounded-lg px-[18px] py-2.5 text-sm font-semibold cursor-pointer"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function LibraryHealthcarePage() {
  const navigate = useNavigate();
  const [stages, setStages] = useState(initialStages);
  const [addSystemStage, setAddSystemStage] = useState<string | null>(null);
  const [addSupplierStage, setAddSupplierStage] = useState<string | null>(null);
  const [configureSupplier, setConfigureSupplier] = useState<SupplierCard | null>(null);

  // Load healthcare stages data from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getHealthcareStages();
        if (data && Array.isArray(data)) {
          setStages(data);
        }
      } catch (err) {
        console.error('Failed to load healthcare stages:', err);
      }
    })();
  }, []);

  function handleAddSystem(stageLabel: string, sys: SystemCard) {
    setStages(prev => prev.map(s =>
      s.label === stageLabel ? { ...s, systems: [...s.systems, sys] } : s
    ));
  }

  async function handleAddSupplier(stageLabel: string, sup: SupplierCard) {
    try {
      // Create vendor in backend database
      const vendorData = {
        name: sup.name,
        email: sup.email || '',
        stage: stageLabel as any,
        stageColor: stages.find(s => s.label === stageLabel)?.color || '#0EA5E9',
        score: sup.score || 0,
        risk: sup.risk || 'Low',
        riskColor: sup.risk === 'High' ? '#F59E0B' : sup.risk === 'Medium' ? '#64748B' : sup.risk === 'Low' ? '#10B981' : '#EF4444',
        assessment: sup.state === 'active' ? 'complete' : sup.state === 'complete_unconfigured' ? 'complete' : 'pending',
        pii: { configured: false },
        piiFlow: null,
        contractEnd: null,
        contractWarning: false,
        agentId: null,
        internalSpoc: null,
        externalSpoc: null,
        lastActivity: 'just now',
      };

      await createVendor(vendorData);

      // Update local state
      setStages(prev => prev.map(s =>
        s.label === stageLabel ? { ...s, suppliers: [...s.suppliers, sup] } : s
      ));
    } catch (err) {
      console.error('Failed to create vendor:', err);
      toast.error('Failed to add supplier to database');
    }
  }

  function handleUpdateSupplier(updatedSupplier: SupplierCard) {
    setStages(prev => prev.map(stage => ({
      ...stage,
      suppliers: stage.suppliers.map(sup =>
        sup.id === updatedSupplier.id ? updatedSupplier : sup
      ),
    })));
  }

  async function handleRemoveSystem(stageLabel: string, systemId: string) {
    try {
      await deleteSystem(systemId);
      setStages(prev => prev.map(stage =>
        stage.label === stageLabel
          ? { ...stage, systems: stage.systems.filter(sys => sys.id !== systemId) }
          : stage
      ));
      toast.success('Process/System removed');
    } catch (err) {
      console.error('Failed to remove system:', err);
      toast.error('Failed to remove system');
    }
  }

  async function handleRemoveSupplier(stageLabel: string, supplierId: string) {
    try {
      await deleteSupplier(supplierId);
      setStages(prev => prev.map(stage =>
        stage.label === stageLabel
          ? { ...stage, suppliers: stage.suppliers.filter(sup => sup.id !== supplierId) }
          : stage
      ));
      toast.success('Supplier removed');
    } catch (err) {
      console.error('Failed to remove supplier:', err);
      toast.error('Failed to remove supplier');
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => navigate('/libraries')}
            className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-3 p-0 hover:text-sky-500 transition-colors"
          >
            <ArrowLeft size={16} /> Back to Library
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 m-0">Customer Lifecycle Template</h1>
              <p className="text-sm text-slate-500 mt-1 mb-0">Map your processes & suppliers across lifecycle stages</p>
            </div>
            <button
              className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600 transition-colors shadow-sm whitespace-nowrap"
              onClick={() => toast.success('Template saved and applied successfully!')}
            >
              Save & Apply Template
            </button>
          </div>
        </div>

        {/* 4-Column Grid with horizontal scroll on mobile */}
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <div className="min-w-[900px]">
              {/* Column headers */}
              <div className="grid grid-cols-4 border-b border-slate-200 bg-slate-50">
                {stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className={`px-4 py-3.5 flex items-center gap-2.5 ${idx < stages.length - 1 ? 'border-r border-slate-200' : ''}`}
                  >
                    <div
                      className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                      style={{ backgroundColor: stage.color }}
                    />
                    <span className="text-sm font-semibold text-slate-800">{stage.label}</span>
                    <span className="bg-slate-200 text-slate-600 text-[11px] font-medium px-2 py-0.5 rounded-full ml-auto">
                      {stage.systems.length + stage.suppliers.length}
                    </span>
                  </div>
                ))}
              </div>

              {/* Column bodies */}
              <div className="grid grid-cols-4">
                {stages.map((stage, stageIdx) => (
                  <div
                    key={stage.id}
                    className={`p-4 min-h-[500px] bg-white ${stageIdx < stages.length - 1 ? 'border-r border-slate-100' : ''}`}
                  >
                    {/* Systems Section */}
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Processes / Systems</div>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      {/* Add System button */}
                      <button
                        onClick={() => setAddSystemStage(stage.label)}
                        className="w-full rounded-lg py-2.5 text-xs font-semibold bg-sky-500 text-white border-none cursor-pointer mb-3 hover:bg-sky-600 transition-colors shadow-sm flex items-center justify-center gap-1"
                      >
                        <span className="text-base leading-none">+</span> Add Process
                      </button>

                      {/* System cards */}
                      <div className="space-y-2">
                        {stage.systems.map(sys => (
                          <div key={sys.id} className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5 hover:border-slate-300 transition-colors group">
                            <div className="flex items-center justify-between">
                              <span className="text-[13px] font-semibold text-slate-700">{sys.name}</span>
                              <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Edit2 size={12} className="text-slate-400 cursor-pointer hover:text-sky-500" />
                                <Trash2
                                  size={12}
                                  className="text-slate-400 cursor-pointer hover:text-red-500"
                                  onClick={() => {
                                    if (window.confirm(`Remove "${sys.name}" from ${stage.label}?`)) {
                                      handleRemoveSystem(stage.label, sys.id);
                                    }
                                  }}
                                />
                              </div>
                            </div>
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded mt-1.5 inline-block"
                              style={{ backgroundColor: sys.methodColor + '15', color: sys.methodColor }}
                            >
                              {sys.method}
                            </span>
                          </div>
                        ))}
                        {stage.systems.length === 0 && (
                          <div className="text-xs text-slate-400 text-center py-2">No processes added</div>
                        )}
                      </div>
                    </div>

                    {/* Divider */}
                    <div className="border-t border-dashed border-slate-200 my-4" />

                    {/* Suppliers Section */}
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">Suppliers</div>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>

                      {/* Add Supplier button */}
                      <button
                        onClick={() => setAddSupplierStage(stage.label)}
                        className="w-full rounded-lg py-2.5 text-xs font-semibold bg-violet-500 text-white border-none cursor-pointer mb-3 hover:bg-violet-600 transition-colors shadow-sm flex items-center justify-center gap-1"
                      >
                        <span className="text-base leading-none">+</span> Add Supplier
                      </button>

                      {/* Supplier cards */}
                      <div className="space-y-2">
                        {stage.suppliers.map(sup => (
                          <SupplierCardView
                            key={sup.id}
                            supplier={sup}
                            onConfigure={setConfigureSupplier}
                            onRemove={(supplierId) => handleRemoveSupplier(stage.label, supplierId)}
                          />
                        ))}
                        {stage.suppliers.length === 0 && (
                          <div className="text-xs text-slate-400 text-center py-2">No suppliers — internal only</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Summary Footer */}
        <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-500">
          <span>
            <strong className="text-slate-700">{stages.reduce((acc, s) => acc + s.systems.length, 0)}</strong> Processes
          </span>
          <span className="text-slate-300">|</span>
          <span>
            <strong className="text-slate-700">{stages.reduce((acc, s) => acc + s.suppliers.length, 0)}</strong> Suppliers
          </span>
        </div>
      </div>

      {/* Modals */}
      {addSystemStage && (
        <AddProcessModal
          stage={addSystemStage}
          onClose={() => setAddSystemStage(null)}
          onAdd={sys => handleAddSystem(addSystemStage, sys)}
        />
      )}
      {addSupplierStage && (
        <AddSupplierModal
          stage={addSupplierStage}
          onClose={() => setAddSupplierStage(null)}
          onAdd={sup => handleAddSupplier(addSupplierStage, sup)}
        />
      )}
      {configureSupplier && (
        <ConfigureDataPanel
          supplier={configureSupplier}
          onClose={() => setConfigureSupplier(null)}
          onSave={handleUpdateSupplier}
        />
      )}
    </div>
  );
}

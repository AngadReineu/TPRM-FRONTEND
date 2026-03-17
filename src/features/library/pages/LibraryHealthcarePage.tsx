import { useState } from 'react';
import { ArrowLeft, X, Check, CheckCircle2, Edit2, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

/* ── Types ───────────────────────────────────────────── */
type SupplierState = 'pending' | 'overdue' | 'complete_unconfigured' | 'active';

interface SupplierCard {
  id: string;
  name: string;
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
function SupplierCardView({ supplier, onConfigure }: { supplier: SupplierCard; onConfigure: (s: SupplierCard) => void }) {
  const stateClasses: Record<SupplierState, string> = {
    pending: 'bg-white border border-slate-200',
    overdue: 'bg-red-50 border border-red-200',
    complete_unconfigured: 'bg-emerald-50 border border-emerald-200',
    active: 'bg-white border border-slate-200',
  };

  return (
    <div className={`${stateClasses[supplier.state]} rounded-lg p-3 mb-1.5`}>
      <div className="text-[13px] font-bold text-slate-900 mb-1">{supplier.name}</div>
      {supplier.state === 'pending' && (
        <>
          <span className="bg-amber-50 text-amber-500 text-[11px] font-semibold px-2 py-0.5 rounded-[5px]">Assessment Pending</span>
          <div className="text-xs text-slate-400 mt-1">{supplier.daysInfo}</div>
          <div className="flex justify-end gap-1.5 mt-2">
            <button
              onClick={() => toast.success(`Reminder sent to ${supplier.name}`)}
              className="text-[11px] text-slate-500 bg-white border border-slate-200 rounded-[5px] px-2.5 py-[3px] cursor-pointer"
            >
              Send Reminder
            </button>
          </div>
        </>
      )}
      {supplier.state === 'overdue' && (
        <>
          <span className="bg-red-50 text-red-500 text-[11px] font-semibold px-2 py-0.5 rounded-[5px]">Assessment Overdue</span>
          <div className="text-xs text-red-500 mt-1">{supplier.daysInfo}</div>
          <div className="flex justify-end mt-2">
            <button
              onClick={() => toast.success(`Reminder sent to ${supplier.name}`)}
              className="text-[11px] text-red-500 bg-red-50 border border-red-200 rounded-[5px] px-2.5 py-[3px] cursor-pointer"
            >
              Send Reminder
            </button>
          </div>
        </>
      )}
      {supplier.state === 'complete_unconfigured' && (
        <>
          <span className="bg-emerald-50 text-emerald-500 text-[11px] font-semibold px-2 py-0.5 rounded-[5px]">Assessment Complete</span>
          <div className="text-xs text-slate-500 mt-1">Score: <strong className="text-amber-500">{supplier.score}</strong> {supplier.risk}</div>
          <button onClick={() => onConfigure(supplier)} className="text-xs font-semibold text-sky-500 bg-transparent border-none cursor-pointer py-1 block mt-1">
            Configure Data Sharing →
          </button>
        </>
      )}
      {supplier.state === 'active' && (
        <>
          <span className="bg-emerald-50 text-emerald-500 text-[11px] font-semibold px-2 py-0.5 rounded-[5px]">Active</span>
          <div className="text-xs text-slate-500 mt-1">Score: <strong>{supplier.score}</strong> {supplier.risk}</div>
          <div className="flex gap-1 mt-1">{supplier.piiIcons?.map(icon => <span key={icon} className="bg-slate-100 text-slate-500 text-[10px] px-[5px] py-px rounded">{icon}</span>)}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{supplier.transferMethod} · Agent: {supplier.agent}</div>
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
function ConfigureDataPanel({ supplier, onClose }: { supplier: SupplierCard; onClose: () => void }) {
  const [selectedPII, setSelectedPII] = useState(new Set(['name', 'email', 'phone']));
  const [transferMethod, setTransferMethod] = useState('api');
  const piiFields = [
    { id: 'name', label: 'Full Name' }, { id: 'aadhar', label: 'Aadhar / National ID' },
    { id: 'email', label: 'Email Address' }, { id: 'pan', label: 'PAN Number' },
    { id: 'phone', label: 'Phone Number' }, { id: 'financial', label: 'Financial Information' },
    { id: 'address', label: 'Physical Address' }, { id: 'health', label: 'Health Records' },
    { id: 'biometric', label: 'Biometric Data' }, { id: 'credentials', label: 'Login Credentials' },
  ];
  const togglePII = (id: string) => { const n = new Set(selectedPII); n.has(id) ? n.delete(id) : n.add(id); setSelectedPII(n); };

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
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Role</label>
              <select className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none"><option>Risk Manager</option><option>DPO</option><option>Compliance Officer</option><option>Admin</option></select>
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
              <input className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" placeholder="Endpoint URL" />
              <select className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none"><option>OAuth 2.0</option><option>API Key</option></select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Transfer Frequency *</label>
              <select className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none"><option>Real-time</option><option>Hourly</option><option>Daily</option><option>Weekly</option></select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Transfer Start Date *</label>
              <input type="date" className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none mb-3" />
            </div>
          </div>
        </div>
        <div className="px-6 py-[14px] border-t border-slate-200 flex justify-end gap-2.5 shrink-0 bg-white">
          <button onClick={onClose} className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer">Cancel</button>
          <button
            onClick={() => { toast.success(`Data sharing configured for ${supplier.name}`); onClose(); }}
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

  function handleAddSystem(stageLabel: string, sys: SystemCard) {
    setStages(prev => prev.map(s =>
      s.label === stageLabel ? { ...s, systems: [...s.systems, sys] } : s
    ));
  }

  function handleAddSupplier(stageLabel: string, sup: SupplierCard) {
    setStages(prev => prev.map(s =>
      s.label === stageLabel ? { ...s, suppliers: [...s.suppliers, sup] } : s
    ));
  }

  return (
    <div className="max-w-[1200px]">
      {/* Header */}
      <div className="mb-5">
        <button
          onClick={() => navigate('/libraries')}
          className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-3 p-0 hover:text-[#0EA5E9]"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 m-0">Healthcare / Insurance Template</h1>
            <p className="text-sm text-slate-500 mt-1 mb-0">Fill in your systems and suppliers for each stage</p>
          </div>
          <button
            className="bg-sky-500 text-white border-none rounded-lg px-4 py-[9px] text-sm font-semibold cursor-pointer hover:bg-[#0284C7]"
            onClick={() => toast.success('Template saved and applied successfully!')}
          >
            Save &amp; Apply Template
          </button>
        </div>
      </div>

      {/* 4-Column Grid */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        {/* Column headers */}
        <div className="grid grid-cols-4 border-b border-slate-200">
          {stages.map(stage => (
            <div key={stage.id} className="px-4 py-[14px] border-r border-slate-200 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: stage.color }} />
              <span className="text-sm font-semibold text-slate-700">{stage.label}</span>
              <span className="bg-slate-100 text-slate-500 text-[11px] px-[7px] py-px rounded-xl ml-auto">
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
              className={`p-3 min-h-[400px] ${stageIdx < stages.length - 1 ? 'border-r border-slate-200' : ''}`}
            >
              {/* Add System button */}
              <button
                onClick={() => setAddSystemStage(stage.label)}
                className="w-full rounded-lg py-[9px] text-xs font-semibold bg-sky-500 text-white border-none cursor-pointer mb-2 hover:bg-[#0284C7]"
              >
                + Add Process/System
              </button>

              {/* System cards */}
              {stage.systems.map(sys => (
                <div key={sys.id} className="bg-white border border-slate-200 rounded-lg px-3 py-2.5 mb-1.5 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-slate-700">{sys.name}</span>
                    <div className="flex gap-1">
                      <Edit2 size={11} color="#94A3B8" className="cursor-pointer" />
                      <Trash2 size={11} color="#94A3B8" className="cursor-pointer" />
                    </div>
                  </div>
                  {/* Method badge — colors are dynamic from sys.methodColor */}
                  <span
                    className="text-[11px] font-medium px-2 py-0.5 rounded-[5px] mt-1 inline-block"
                    style={{ backgroundColor: sys.methodColor + '20', color: sys.methodColor }}
                  >
                    {sys.method}
                  </span>
                </div>
              ))}

              {/* Divider */}
              <div className="border-t border-dashed border-slate-200 my-2.5" />

              {/* Add Supplier button */}
              <button
                onClick={() => setAddSupplierStage(stage.label)}
                className="w-full rounded-lg py-[9px] text-xs font-semibold bg-violet-500 text-white border-none cursor-pointer mb-2 hover:bg-[#7C3AED]"
              >
                + Add Supplier
              </button>

              {/* Supplier cards */}
              {stage.suppliers.map(sup => (
                <SupplierCardView key={sup.id} supplier={sup} onConfigure={setConfigureSupplier} />
              ))}
              {stage.suppliers.length === 0 && (
                <div className="text-xs text-slate-400 text-center py-3">No suppliers — internal only</div>
              )}
            </div>
          ))}
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
        <ConfigureDataPanel supplier={configureSupplier} onClose={() => setConfigureSupplier(null)} />
      )}
    </div>
  );
}

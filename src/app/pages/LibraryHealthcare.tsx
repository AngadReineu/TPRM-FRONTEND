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

/* ── Shared styles ───────────────────────────────────── */
const inputStyle: React.CSSProperties = {
  width: '100%', boxSizing: 'border-box',
  padding: '9px 12px', fontSize: 14, color: '#334155',
  border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none',
  fontFamily: 'Inter, sans-serif', marginBottom: 12,
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4,
};

/* ── Supplier Card component ─────────────────────────── */
function SupplierCardView({ supplier, onConfigure }: { supplier: SupplierCard; onConfigure: (s: SupplierCard) => void }) {
  const stateStyles: Record<SupplierState, React.CSSProperties> = {
    pending: { backgroundColor: '#fff', border: '1px solid #E2E8F0' },
    overdue: { backgroundColor: '#FEF2F2', border: '1px solid #FECACA' },
    complete_unconfigured: { backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0' },
    active: { backgroundColor: '#fff', border: '1px solid #E2E8F0' },
  };

  return (
    <div style={{ ...stateStyles[supplier.state], borderRadius: 8, padding: 12, marginBottom: 6 }}>
      <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{supplier.name}</div>
      {supplier.state === 'pending' && (
        <>
          <span style={{ backgroundColor: '#FFFBEB', color: '#F59E0B', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>Assessment Pending</span>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{supplier.daysInfo}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6, marginTop: 8 }}>
            <button
              onClick={() => toast.success(`Reminder sent to ${supplier.name}`)}
              style={{ fontSize: 11, color: '#64748B', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}
            >
              Send Reminder
            </button>
          </div>
        </>
      )}
      {supplier.state === 'overdue' && (
        <>
          <span style={{ backgroundColor: '#FEF2F2', color: '#EF4444', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>Assessment Overdue</span>
          <div style={{ fontSize: 12, color: '#EF4444', marginTop: 4 }}>{supplier.daysInfo}</div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button
              onClick={() => toast.success(`Reminder sent to ${supplier.name}`)}
              style={{ fontSize: 11, color: '#EF4444', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 5, padding: '3px 10px', cursor: 'pointer' }}
            >
              Send Reminder
            </button>
          </div>
        </>
      )}
      {supplier.state === 'complete_unconfigured' && (
        <>
          <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>Assessment Complete</span>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Score: <strong style={{ color: '#F59E0B' }}>{supplier.score}</strong> {supplier.risk}</div>
          <button onClick={() => onConfigure(supplier)} style={{ fontSize: 12, fontWeight: 600, color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 0', display: 'block', marginTop: 4 }}>
            Configure Data Sharing →
          </button>
        </>
      )}
      {supplier.state === 'active' && (
        <>
          <span style={{ backgroundColor: '#ECFDF5', color: '#10B981', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>Active</span>
          <div style={{ fontSize: 12, color: '#64748B', marginTop: 4 }}>Score: <strong>{supplier.score}</strong> {supplier.risk}</div>
          <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>{supplier.piiIcons?.map(icon => <span key={icon} style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 10, padding: '1px 5px', borderRadius: 4 }}>{icon}</span>)}</div>
          <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 2 }}>{supplier.transferMethod} · Agent: {supplier.agent}</div>
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <div style={{
        position: 'relative', width: 440,
        backgroundColor: '#fff', borderRadius: 14,
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Add Process / System</h2>
            <span style={{ backgroundColor: '#EFF6FF', color: '#0EA5E9', fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 20 }}>{stage} stage</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}>
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: '20px 24px 8px' }}>
          <label style={labelStyle}>System / Process Name *</label>
          <input
            style={inputStyle}
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g., Customer Portal"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
          />

          <label style={labelStyle}>Method / Channel</label>
          <select
            style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
            value={method}
            onChange={e => setMethod(e.target.value)}
          >
            {Object.keys(METHOD_COLORS).map(m => <option key={m}>{m}</option>)}
          </select>

          {/* Preview badge */}
          <div style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 11, fontWeight: 500, padding: '3px 10px', borderRadius: 5, backgroundColor: (METHOD_COLORS[method] || '#64748B') + '20', color: METHOD_COLORS[method] || '#64748B' }}>
              {method}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '12px 24px 20px', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={onClose} style={{ backgroundColor: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 16px', fontSize: 14, cursor: 'pointer' }}>
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim()}
            style={{
              backgroundColor: name.trim() ? '#0EA5E9' : '#CBD5E1',
              color: '#fff', border: 'none', borderRadius: 8,
              padding: '9px 20px', fontSize: 14, fontWeight: 600,
              cursor: name.trim() ? 'pointer' : 'not-allowed',
            }}
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
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <div style={{
        position: 'relative', width: 540, maxHeight: '90vh',
        backgroundColor: '#fff', borderRadius: 14, display: 'flex', flexDirection: 'column',
        boxShadow: '0 20px 60px rgba(0,0,0,0.18)', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>Add Supplier</h2>
            <span style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', fontSize: 12, fontWeight: 500, padding: '2px 10px', borderRadius: 20 }}>{stage} stage</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
        </div>

        {/* Step indicator */}
        {!isSuccess && (
          <div style={{ display: 'flex', gap: 6, padding: '12px 24px', alignItems: 'center', flexShrink: 0 }}>
            {[1, 2].map(s => (
              <div key={s} style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: s === step ? '#0EA5E9' : s < step ? '#10B981' : '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: s <= step ? '#fff' : '#94A3B8' }}>
                {s < step ? <Check size={13} strokeWidth={3} /> : s}
              </div>
            ))}
            <span style={{ fontSize: 13, color: '#64748B', marginLeft: 4 }}>{step === 1 ? 'Company Information' : 'Review & Initiate'}</span>
          </div>
        )}

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          {isSuccess ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 0', textAlign: 'center', gap: 14 }}>
              <CheckCircle2 size={48} color="#10B981" strokeWidth={1.5} />
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Supplier Initiated!</div>
              <div style={{ fontSize: 14, color: '#64748B', maxWidth: 360 }}>
                A portal link has been sent to {form.email || 'the contact'}. They have 30 days to complete.
              </div>
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 12, fontSize: 12, color: '#92400E', width: '100%', textAlign: 'left' }}>
                Reminders will be sent on Day 7, 15, 25, and 30.
              </div>
              <button onClick={onClose} style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer', marginTop: 8 }}>Done</button>
            </div>
          ) : step === 1 ? (
            <>
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: 10, fontSize: 12, color: '#92400E', marginBottom: 16, marginTop: 8 }}>
                PII configuration will be available after the supplier completes their risk assessment.
              </div>
              <label style={labelStyle}>Supplier Name *</label>
              <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g., XYZ Corporation" />
              <label style={labelStyle}>Email (primary contact) *</label>
              <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="contact@company.com" />
              <label style={labelStyle}>Contact Person</label>
              <input style={inputStyle} value={form.contact} onChange={e => setForm({ ...form, contact: e.target.value })} placeholder="Full name" />
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
              <label style={labelStyle}>Website</label>
              <input style={inputStyle} value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} placeholder="https://example.com" />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>GST Number</label>
                  <input style={{ ...inputStyle, marginBottom: 0 }} value={form.gst} onChange={e => setForm({ ...form, gst: e.target.value })} />
                </div>
                <div>
                  <label style={labelStyle}>PAN Number</label>
                  <input style={{ ...inputStyle, marginBottom: 0 }} value={form.pan} onChange={e => setForm({ ...form, pan: e.target.value })} />
                </div>
              </div>
              <label style={{ ...labelStyle, marginTop: 12 }}>Service Type</label>
              <div style={{ padding: '8px 12px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 14, color: '#64748B' }}>
                <span style={{ backgroundColor: '#F5F3FF', color: '#8B5CF6', fontSize: 12, padding: '2px 8px', borderRadius: 5 }}>{stage}</span>
              </div>
            </>
          ) : (
            <div style={{ marginTop: 8 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A', marginBottom: 12 }}>Review Details</div>
              {Object.entries({ 'Supplier Name': form.name, 'Email': form.email, 'Contact': form.contact, 'Phone': form.phone, 'Stage': stage }).map(([k, v]) => v ? (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #F1F5F9', fontSize: 14 }}>
                  <span style={{ color: '#94A3B8' }}>{k}</span>
                  <span style={{ color: '#334155', fontWeight: 500 }}>{v}</span>
                </div>
              ) : null)}
            </div>
          )}
        </div>

        {/* Footer */}
        {!isSuccess && (
          <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', flexShrink: 0, backgroundColor: '#fff', borderRadius: '0 0 14px 14px' }}>
            {step === 1 ? (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => setStep(2)}
                  disabled={!canNext}
                  style={{ backgroundColor: canNext ? '#8B5CF6' : '#CBD5E1', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: canNext ? 'pointer' : 'not-allowed' }}
                >
                  Next →
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button onClick={() => setStep(1)} style={{ backgroundColor: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }}>← Back</button>
                <button
                  onClick={handleInitiate}
                  style={{ backgroundColor: '#8B5CF6', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 20px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
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
  const panelInputStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: 14, color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: 12 };
  const panelLabelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.3)' }} />
      <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 560, backgroundColor: '#fff', display: 'flex', flexDirection: 'column', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)' }}>
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', margin: '0 0 2px' }}>Configure Data Sharing</h2>
            <div style={{ fontSize: 13, color: '#64748B' }}>{supplier.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={20} /></button>
        </div>
        <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', padding: '10px 24px', fontSize: 13, color: '#92400E', flexShrink: 0 }}>
          Risk Score: <strong>{supplier.score}</strong> — {supplier.risk} · Assessment completed Mar 1, 2026
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={panelLabelStyle}>What PII are we sending? *</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {piiFields.map(f => (
                <label key={f.id} onClick={() => togglePII(f.id)} style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: '#334155' }}>
                  <div style={{ width: 16, height: 16, borderRadius: 4, flexShrink: 0, border: selectedPII.has(f.id) ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: selectedPII.has(f.id) ? '#0EA5E9' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {selectedPII.has(f.id) && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  {f.label}
                </label>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={panelLabelStyle}>Authorized by *</label>
              <input style={panelInputStyle} placeholder="Full name" />
            </div>
            <div>
              <label style={panelLabelStyle}>Role</label>
              <select style={{ ...panelInputStyle, marginBottom: 0, appearance: 'none' }}><option>Risk Manager</option><option>DPO</option><option>Compliance Officer</option><option>Admin</option></select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={panelLabelStyle}>Transfer Method *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[{ id: 'api', label: 'API Integration' }, { id: 'excel', label: 'Excel Sheet' }, { id: 'db', label: 'Database Dump' }].map(m => (
                <div key={m.id} onClick={() => setTransferMethod(m.id)} style={{ padding: '12px 8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: transferMethod === m.id ? '2px solid #0EA5E9' : '1px solid #E2E8F0', backgroundColor: transferMethod === m.id ? '#EFF6FF' : '#fff' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          {transferMethod === 'api' && (
            <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: 14, marginBottom: 20 }}>
              <input style={panelInputStyle} placeholder="Endpoint URL" />
              <select style={{ ...panelInputStyle, appearance: 'none' }}><option>OAuth 2.0</option><option>API Key</option></select>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
            <div>
              <label style={panelLabelStyle}>Transfer Frequency *</label>
              <select style={{ ...panelInputStyle, appearance: 'none' }}><option>Real-time</option><option>Hourly</option><option>Daily</option><option>Weekly</option></select>
            </div>
            <div>
              <label style={panelLabelStyle}>Transfer Start Date *</label>
              <input type="date" style={panelInputStyle} />
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0, backgroundColor: '#fff' }}>
          <button onClick={onClose} style={{ backgroundColor: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button
            onClick={() => { toast.success(`Data sharing configured for ${supplier.name}`); onClose(); }}
            style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function LibraryHealthcare() {
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
    <div style={{ maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <button
          onClick={() => navigate('/libraries')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 12, padding: 0 }}
          className="hover:text-[#0EA5E9]"
        >
          <ArrowLeft size={16} /> Back to Library
        </button>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Healthcare / Insurance Template</h1>
            <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Fill in your systems and suppliers for each stage</p>
          </div>
          <button
            style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
            className="hover:bg-[#0284C7]"
            onClick={() => toast.success('Template saved and applied successfully!')}
          >
            Save & Apply Template
          </button>
        </div>
      </div>

      {/* 4-Column Grid */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Column headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', borderBottom: '1px solid #E2E8F0' }}>
          {stages.map(stage => (
            <div key={stage.id} style={{ padding: '14px 16px', borderRight: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: stage.color, flexShrink: 0 }} />
              <span style={{ fontSize: 14, fontWeight: 600, color: '#334155' }}>{stage.label}</span>
              <span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 11, padding: '1px 7px', borderRadius: 12, marginLeft: 'auto' }}>
                {stage.systems.length + stage.suppliers.length}
              </span>
            </div>
          ))}
        </div>

        {/* Column bodies */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)' }}>
          {stages.map((stage, stageIdx) => (
            <div
              key={stage.id}
              style={{
                padding: 12,
                borderRight: stageIdx < stages.length - 1 ? '1px solid #E2E8F0' : 'none',
                minHeight: 400,
              }}
            >
              {/* Add System button — solid blue */}
              <button
                onClick={() => setAddSystemStage(stage.label)}
                style={{
                  width: '100%', borderRadius: 8, padding: '9px 0',
                  fontSize: 12, fontWeight: 600,
                  backgroundColor: '#0EA5E9', color: '#fff',
                  border: 'none', cursor: 'pointer', marginBottom: 8,
                }}
                className="hover:bg-[#0284C7]"
              >
                + Add Process/System
              </button>

              {/* System cards */}
              {stage.systems.map(sys => (
                <div key={sys.id} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', marginBottom: 6, position: 'relative' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{sys.name}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <Edit2 size={11} color="#94A3B8" style={{ cursor: 'pointer' }} />
                      <Trash2 size={11} color="#94A3B8" style={{ cursor: 'pointer' }} />
                    </div>
                  </div>
                  <span style={{ backgroundColor: sys.methodColor + '20', color: sys.methodColor, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5, marginTop: 4, display: 'inline-block' }}>
                    {sys.method}
                  </span>
                </div>
              ))}

              {/* Divider */}
              <div style={{ borderTop: '1px dashed #E2E8F0', margin: '10px 0' }} />

              {/* Add Supplier button — solid violet */}
              <button
                onClick={() => setAddSupplierStage(stage.label)}
                style={{
                  width: '100%', borderRadius: 8, padding: '9px 0',
                  fontSize: 12, fontWeight: 600,
                  backgroundColor: '#8B5CF6', color: '#fff',
                  border: 'none', cursor: 'pointer', marginBottom: 8,
                }}
                className="hover:bg-[#7C3AED]"
              >
                + Add Supplier
              </button>

              {/* Supplier cards */}
              {stage.suppliers.map(sup => (
                <SupplierCardView key={sup.id} supplier={sup} onConfigure={setConfigureSupplier} />
              ))}
              {stage.suppliers.length === 0 && (
                <div style={{ fontSize: 12, color: '#94A3B8', textAlign: 'center', padding: '12px 0' }}>No suppliers — internal only</div>
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

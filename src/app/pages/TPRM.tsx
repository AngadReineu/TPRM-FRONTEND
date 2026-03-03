import { useState } from 'react';
import { Search, Eye, Bell, RefreshCw, Trash2, X, Check, AlertTriangle, Clock, CheckCircle2, Settings2, FileText, Calendar, User, MoveUpRight, MoveDownLeft, Repeat2 } from 'lucide-react';
import { toast } from 'sonner';
import React from 'react';

/* ── Types ───────────────────────────────────────────── */
interface Supplier {
  id: string;
  name: string;
  email: string;
  stage: string;
  stageColor: string;
  score: number;
  risk: string;
  riskColor: string;
  assessment: 'complete' | 'overdue' | 'pending';
  pii: { configured: boolean; icons?: string[]; method?: string };
  piiFlow?: 'share' | 'ingest' | 'both';
  contractEnd: string;
  contractWarning?: boolean;
  agent: string;
  lastActivity: string;
  internalSPOC?: string;
  externalSPOC?: string;
}

/* ── Mock Data ───────────────────────────────────────── */
const initialSuppliers: Supplier[] = [
  { id: '1', name: 'XYZ Corporation',  email: 'contact@xyz.com',  stage: 'Acquisition', stageColor: '#0EA5E9', score: 78, risk: 'High',     riskColor: '#F59E0B', assessment: 'complete', pii: { configured: true,  icons: ['ID','Email','Mobile','Doc','Location'], method: 'API'   }, piiFlow: 'share',  contractEnd: 'Mar 2026', contractWarning: true,  agent: 'A1', lastActivity: '2 min ago',  internalSPOC: 'priya@abc.co',  externalSPOC: 'john@xyz.com'  },
  { id: '2', name: 'ABC Services Ltd', email: 'ops@abc.com',      stage: 'Retention',   stageColor: '#10B981', score: 42, risk: 'Low',      riskColor: '#10B981', assessment: 'complete', pii: { configured: true,  icons: ['Email','Mobile'],              method: 'SFTP'  }, piiFlow: 'ingest', contractEnd: 'Dec 2027',                         agent: 'A2', lastActivity: '1 hr ago',   internalSPOC: 'raj@abc.co',    externalSPOC: 'ops@abcsvc.com' },
  { id: '3', name: 'DEF Limited',      email: 'info@def.com',     stage: 'Upgradation', stageColor: '#F59E0B', score: 62, risk: 'Medium',   riskColor: '#64748B', assessment: 'overdue', pii: { configured: false                                              }, piiFlow: 'both',   contractEnd: 'Jun 2025', contractWarning: true,  agent: 'A3', lastActivity: '2 hrs ago',  internalSPOC: 'anita@abc.co',  externalSPOC: 'info@def.com'  },
  { id: '4', name: 'GHI Technologies', email: 'bd@ghi.com',       stage: 'Acquisition', stageColor: '#0EA5E9', score: 91, risk: 'Critical', riskColor: '#EF4444', assessment: 'overdue', pii: { configured: false                                              }, piiFlow: 'share',  contractEnd: 'Sep 2026',                         agent: 'A1', lastActivity: '5 hrs ago',  internalSPOC: 'priya@abc.co',  externalSPOC: 'bd@ghi.com'   },
  { id: '5', name: 'JKL Consultancy',  email: 'admin@jkl.com',    stage: 'Retention',   stageColor: '#10B981', score: 35, risk: 'Low',      riskColor: '#10B981', assessment: 'complete', pii: { configured: true,  icons: ['Email'],                       method: 'Email' }, piiFlow: 'ingest', contractEnd: 'Jan 2028',                         agent: 'A4', lastActivity: '3 hrs ago',  internalSPOC: 'raj@abc.co',    externalSPOC: 'admin@jkl.com' },
  { id: '6', name: 'MNO Partners',     email: 'contact@mno.com',  stage: 'Offboarding', stageColor: '#94A3B8', score: 55, risk: 'Medium',   riskColor: '#64748B', assessment: 'pending', pii: { configured: false                                              },                  contractEnd: 'Apr 2026', contractWarning: true,  agent: 'A2', lastActivity: '1 day ago',  },
  { id: '7', name: 'PQR Systems',      email: 'info@pqr.com',     stage: 'Acquisition', stageColor: '#0EA5E9', score: 67, risk: 'Medium',   riskColor: '#64748B', assessment: 'pending', pii: { configured: false                                              }, piiFlow: 'share',  contractEnd: 'Nov 2027',                         agent: 'A5', lastActivity: '6 hrs ago',  },
  { id: '8', name: 'STU Analytics',    email: 'hello@stu.com',    stage: 'Upgradation', stageColor: '#F59E0B', score: 22, risk: 'Low',      riskColor: '#10B981', assessment: 'complete', pii: { configured: false, method: 'configure'                       }, piiFlow: 'both',   contractEnd: 'Jul 2028',                         agent: 'A2', lastActivity: '4 hrs ago',  },
];

/* ── Helpers ─────────────────────────────────────────── */
const thStyle: React.CSSProperties = { padding: '10px 16px', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' };
const tdStyle: React.CSSProperties = { padding: '12px 16px', fontSize: 14, color: '#334155', verticalAlign: 'middle' };

function StageBadge({ stage, color }: { stage: string; color: string }) {
  return (
    <span style={{ backgroundColor: color + '20', color, fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20 }}>
      {stage}
    </span>
  );
}

function AssessmentBadge({ status }: { status: 'complete' | 'overdue' | 'pending' }) {
  const map = {
    complete: { bg: '#ECFDF5', color: '#10B981', label: 'Complete' },
    overdue: { bg: '#FEF2F2', color: '#EF4444', label: 'Overdue' },
    pending: { bg: '#FFFBEB', color: '#F59E0B', label: 'Pending' },
  };
  const { bg, color, label } = map[status];
  return <span style={{ backgroundColor: bg, color, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{label}</span>;
}

function PIIColumn({ pii, assessment, piiFlow }: { pii: Supplier['pii']; assessment: Supplier['assessment']; piiFlow?: Supplier['piiFlow'] }) {
  const flowIcon = piiFlow === 'share'  ? <MoveUpRight size={11} color="#0EA5E9" />
                 : piiFlow === 'ingest' ? <MoveDownLeft size={11} color="#10B981" />
                 : piiFlow === 'both'   ? <Repeat2 size={11} color="#8B5CF6" />
                 : null;
  const flowLabel = piiFlow === 'share' ? 'Share' : piiFlow === 'ingest' ? 'Ingest' : piiFlow === 'both' ? 'Both' : null;
  const flowColor = piiFlow === 'share' ? '#0EA5E9' : piiFlow === 'ingest' ? '#10B981' : '#8B5CF6';

  if (!pii.configured && pii.method !== 'configure') {
    return (
      <div>
        <span style={{ fontSize: 12, color: '#94A3B8' }}>Assessment required</span>
        {flowIcon && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
            {flowIcon}<span style={{ fontSize: 10, color: flowColor }}>{flowLabel}</span>
          </div>
        )}
      </div>
    );
  }
  if (pii.method === 'configure') {
    const canConfigure = assessment === 'complete';
    return (
      <div>
        <button
          disabled={!canConfigure}
          title={canConfigure ? 'Configure PII sharing' : 'Available after assessment is complete'}
          style={{ fontSize: 12, fontWeight: 600, color: canConfigure ? '#0EA5E9' : '#CBD5E1', background: 'none', border: 'none', cursor: canConfigure ? 'pointer' : 'not-allowed', padding: 0 }}
        >
          Configure →
        </button>
        {flowIcon && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 3, marginTop: 3 }}>
            {flowIcon}<span style={{ fontSize: 10, color: flowColor }}>{flowLabel}</span>
          </div>
        )}
      </div>
    );
  }
  return (
    <div>
      <div style={{ display: 'flex', gap: 3, flexWrap: 'wrap', marginBottom: 2 }}>
        {pii.icons?.map(icon => (
          <span key={icon} style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 10, padding: '1px 5px', borderRadius: 4 }}>{icon}</span>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ fontSize: 11, color: '#94A3B8' }}>{pii.method}</span>
        {flowIcon && <><span style={{ color: '#E2E8F0' }}>·</span>{flowIcon}<span style={{ fontSize: 10, color: flowColor }}>{flowLabel}</span></>}
      </div>
    </div>
  );
}

/* ── Configure Data Sharing Panel ────────────────────── */
function ConfigureDataPanel({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
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
  const iStyle: React.CSSProperties = { width: '100%', boxSizing: 'border-box', padding: '9px 12px', fontSize: 14, color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', fontFamily: 'Inter, sans-serif', marginBottom: 12 };
  const lStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 300 }}>
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
          Risk Score: <strong>{supplier.score}</strong> — {supplier.risk} · Stage: {supplier.stage}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
          <div style={{ marginBottom: 20 }}>
            <label style={lStyle}>What PII are we sending? *</label>
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
              <label style={lStyle}>Authorized by *</label>
              <input style={iStyle} placeholder="Full name" />
            </div>
            <div>
              <label style={lStyle}>Role</label>
              <select style={{ ...iStyle, marginBottom: 0, appearance: 'none' }}><option>Risk Manager</option><option>DPO</option><option>Compliance Officer</option></select>
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={lStyle}>Transfer Method *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
              {[{ id: 'api', label: 'API Integration' }, { id: 'excel', label: 'Excel Sheet' }, { id: 'db', label: 'Database Dump' }].map(m => (
                <div key={m.id} onClick={() => setTransferMethod(m.id)} style={{ padding: '12px 8px', borderRadius: 10, textAlign: 'center', cursor: 'pointer', border: transferMethod === m.id ? '2px solid #0EA5E9' : '1px solid #E2E8F0', backgroundColor: transferMethod === m.id ? '#EFF6FF' : '#fff' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#0F172A' }}>{m.label}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={lStyle}>Transfer Frequency *</label>
              <select style={{ ...iStyle, appearance: 'none' }}><option>Real-time</option><option>Daily</option><option>Weekly</option></select>
            </div>
            <div>
              <label style={lStyle}>Transfer Start Date *</label>
              <input type="date" style={iStyle} />
            </div>
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: 10, flexShrink: 0 }}>
          <button onClick={onClose} style={{ backgroundColor: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 16px', fontSize: 14, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => { toast.success(`Data sharing configured for ${supplier.name}`); onClose(); }} style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Supplier Detail Modal (centered) ───────────────── */
function SupplierDetailModal({ supplier, onClose, onConfigureData }: {
  supplier: Supplier;
  onClose: () => void;
  onConfigureData: (s: Supplier) => void;
}) {
  const assessmentInfo = {
    complete: { icon: <CheckCircle2 size={15} color="#10B981" />, label: 'Assessment Complete', bg: '#ECFDF5', color: '#10B981' },
    overdue:  { icon: <AlertTriangle size={15} color="#EF4444" />, label: 'Assessment Overdue',  bg: '#FEF2F2', color: '#EF4444' },
    pending:  { icon: <Clock size={15} color="#F59E0B" />,         label: 'Assessment Pending',  bg: '#FFFBEB', color: '#F59E0B' },
  }[supplier.assessment];

  const riskBg = supplier.risk === 'Critical' ? '#FEF2F2' : supplier.risk === 'High' ? '#FFFBEB' : supplier.risk === 'Low' ? '#ECFDF5' : '#F1F5F9';

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)' }} />
      <div style={{
        position: 'relative', width: 680, maxHeight: '88vh',
        backgroundColor: '#fff', borderRadius: 16, display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 16px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{supplier.name}</h2>
              <div style={{ fontSize: 13, color: '#94A3B8' }}>{supplier.email}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4 }}><X size={20} /></button>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ backgroundColor: supplier.stageColor + '20', color: supplier.stageColor, fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20 }}>{supplier.stage}</span>
            <span style={{ backgroundColor: assessmentInfo.bg, color: assessmentInfo.color, fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 4 }}>
              {assessmentInfo.icon}{assessmentInfo.label}
            </span>
          </div>
        </div>

        {/* Risk banner */}
        <div style={{ padding: '14px 28px', backgroundColor: riskBg, borderBottom: '1px solid #E2E8F0', flexShrink: 0, display: 'flex', gap: 32 }}>
          {[
            { label: 'Risk Score', value: supplier.score.toString(), color: supplier.riskColor, big: true },
            { label: 'Risk Level', value: supplier.risk, color: supplier.riskColor },
            { label: 'Agent',      value: supplier.agent, color: '#0EA5E9' },
            { label: 'Contract',   value: supplier.contractEnd, color: supplier.contractWarning ? '#F59E0B' : '#334155' },
          ].map(item => (
            <div key={item.label}>
              <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 2 }}>{item.label}</div>
              <div style={{ fontSize: item.big ? 26 : 15, fontWeight: 800, color: item.color }}>{item.value}</div>
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Details grid */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Supplier Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {[
                ['Email', supplier.email],
                ['Last Activity', supplier.lastActivity],
                ['Contract End', supplier.contractWarning ? `${supplier.contractEnd} ⚠ Expiring` : supplier.contractEnd],
                ['Monitoring Agent', supplier.agent],
              ].map(([k, v]) => (
                <div key={k} style={{ backgroundColor: '#F8FAFC', borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginBottom: 2 }}>{k}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#334155' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PII Sharing */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>PII Data Sharing</div>
            {supplier.pii.configured ? (
              <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <CheckCircle2 size={14} color="#10B981" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#059669' }}>Configured · Transfer via {supplier.pii.method}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
                  {supplier.pii.icons?.map(icon => (
                    <span key={icon} style={{ backgroundColor: '#fff', color: '#334155', fontSize: 11, padding: '2px 8px', borderRadius: 5, border: '1px solid #D1FAE5' }}>{icon}</span>
                  ))}
                </div>
                <button onClick={() => { onClose(); onConfigureData(supplier); }} style={{ fontSize: 12, fontWeight: 600, color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                  Edit Configuration →
                </button>
              </div>
            ) : supplier.assessment === 'complete' ? (
              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '14px 16px' }}>
                <div style={{ fontSize: 13, color: '#92400E', marginBottom: 12 }}>Assessment complete — PII data sharing not yet configured.</div>
                <button onClick={() => { onClose(); onConfigureData(supplier); }} style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                  Configure Data Sharing
                </button>
              </div>
            ) : (
              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px', fontSize: 13, color: '#94A3B8' }}>
                Available after supplier completes their assessment
              </div>
            )}
          </div>

          {/* Assessment action */}
          {(supplier.assessment === 'pending' || supplier.assessment === 'overdue') && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Assessment Actions</div>
              <div style={{ backgroundColor: supplier.assessment === 'overdue' ? '#FEF2F2' : '#FFFBEB', border: `1px solid ${supplier.assessment === 'overdue' ? '#FECACA' : '#FDE68A'}`, borderRadius: 10, padding: '14px 16px' }}>
                <p style={{ fontSize: 13, color: supplier.assessment === 'overdue' ? '#991B1B' : '#92400E', margin: '0 0 12px' }}>
                  {supplier.assessment === 'overdue' ? 'Immediate follow-up required — assessment overdue.' : 'Assessment portal sent. Awaiting supplier response.'}
                </p>
                <button
                  onClick={() => { toast.success(`Reminder sent to ${supplier.name}`); onClose(); }}
                  style={{ backgroundColor: supplier.assessment === 'overdue' ? '#EF4444' : '#F59E0B', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
                >
                  <Bell size={13} /> Send Reminder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, backgroundColor: '#F8FAFC', borderRadius: '0 0 16px 16px' }}>
          <button onClick={() => { toast.success(`Assessment refreshed for ${supplier.name}`); onClose(); }} style={{ backgroundColor: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <RefreshCw size={13} /> Refresh Assessment
          </button>
          <button onClick={onClose} style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function TPRM() {
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [configureSupplier, setConfigureSupplier] = useState<Supplier | null>(null);

  const filtered = suppliers.filter(s => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.email.includes(search.toLowerCase());
    const matchStage = stageFilter === 'All' || s.stage === stageFilter;
    const matchRisk = riskFilter === 'All' || s.risk === riskFilter;
    return matchSearch && matchStage && matchRisk;
  });

  function handleRemove(s: Supplier) {
    setSuppliers(prev => prev.filter(x => x.id !== s.id));
    toast.error(`${s.name} removed from TPRM`);
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Third Party Risk Management</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>{suppliers.length} suppliers across 4 stages</p>
        </div>
        {/* Search + Filters */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search suppliers..."
              style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', width: 200 }}
            />
          </div>
          <select value={stageFilter} onChange={e => setStageFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
            {['All', 'Acquisition', 'Retention', 'Upgradation', 'Offboarding'].map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={riskFilter} onChange={e => setRiskFilter(e.target.value)} style={{ padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Supplier', 'Stage', 'Risk Score', 'Assessment', 'PII Sharing', 'Contract End', 'Agent', 'Last Activity', 'Actions'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* ── Lifecycle groups ── */}
            {[
              { label: 'Customer Acquisition', stages: ['Acquisition'],               color: '#0EA5E9', bg: '#EFF6FF' },
              { label: 'Customer Retention',   stages: ['Retention'],                 color: '#10B981', bg: '#ECFDF5' },
              { label: 'Operations',           stages: ['Upgradation','Offboarding'], color: '#64748B', bg: '#F8FAFC' },
            ].map(grp => {
              const rows = filtered.filter(s => grp.stages.includes(s.stage));
              if (rows.length === 0) return null;
              return (
                <React.Fragment key={grp.label}>
                  <tr>
                    <td colSpan={9} style={{ padding: '8px 16px', backgroundColor: grp.bg, borderBottom: '1px solid #E2E8F0', borderTop: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: grp.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{grp.label}</span>
                      <span style={{ fontSize: 11, color: grp.color, marginLeft: 6, opacity: 0.7 }}>· {rows.length} supplier{rows.length !== 1 ? 's' : ''}</span>
                    </td>
                  </tr>
                  {rows.map((s, idx) => (
                    <tr key={s.id} style={{ borderBottom: idx < rows.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-[#F8FAFC]">
                      <td style={tdStyle}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{s.name}</div>
                        <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{s.email}</div>
                      </td>
                      <td style={tdStyle}><StageBadge stage={s.stage} color={s.stageColor} /></td>
                      <td style={tdStyle}><span style={{ fontSize: 14, fontWeight: 700, color: s.riskColor }}>{s.score}</span></td>
                      <td style={tdStyle}><AssessmentBadge status={s.assessment} /></td>
                      <td style={tdStyle}><PIIColumn pii={s.pii} assessment={s.assessment} piiFlow={s.piiFlow} /></td>
                      <td style={tdStyle}>
                        <div style={{ fontSize: 13, color: s.contractWarning ? '#F59E0B' : '#334155', fontWeight: s.contractWarning ? 600 : 400 }}>
                          {s.contractEnd}
                          {s.contractWarning && <span style={{ marginLeft: 6, fontSize: 11, backgroundColor: '#FFFBEB', color: '#F59E0B', padding: '1px 6px', borderRadius: 4, fontWeight: 500 }}>Expiring</span>}
                        </div>
                      </td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0EA5E9', backgroundColor: '#EFF6FF', padding: '3px 9px', borderRadius: 20 }}>{s.agent}</span>
                      </td>
                      <td style={tdStyle}><span style={{ fontSize: 12, color: '#94A3B8' }}>{s.lastActivity}</span></td>
                      <td style={tdStyle}>
                        <div style={{ display: 'flex', gap: 3 }}>
                          <button onClick={() => setViewSupplier(s)} title="View details" style={{ padding: 5, borderRadius: 5, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} className="hover:text-[#0EA5E9] hover:bg-[#EFF6FF]"><Eye size={14} /></button>
                          <button onClick={() => toast.success(`Reminder sent to ${s.name}`)} title="Send reminder" style={{ padding: 5, borderRadius: 5, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} className="hover:text-[#F59E0B] hover:bg-[#FFFBEB]"><Bell size={14} /></button>
                          <button onClick={() => toast.success(`Assessment refreshed for ${s.name}`)} title="Refresh assessment" style={{ padding: 5, borderRadius: 5, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} className="hover:text-[#10B981] hover:bg-[#ECFDF5]"><RefreshCw size={14} /></button>
                          <button onClick={() => handleRemove(s)} title="Remove supplier" style={{ padding: 5, borderRadius: 5, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} className="hover:text-[#EF4444] hover:bg-[#FEF2F2]"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>Showing {filtered.length} of {suppliers.length} suppliers</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Prev', 'Next'].map(label => (
              <button key={label} style={{ fontSize: 13, color: '#64748B', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Panels */}
      {viewSupplier && (
        <SupplierDetailModal
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
          onConfigureData={s => { setViewSupplier(null); setConfigureSupplier(s); }}
        />
      )}
      {configureSupplier && (
        <ConfigureDataPanel
          supplier={configureSupplier}
          onClose={() => setConfigureSupplier(null)}
        />
      )}
    </div>
  );
}
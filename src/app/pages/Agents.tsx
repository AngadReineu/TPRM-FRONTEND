import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  Bot, ChevronLeft, Mic, Volume2, MessageSquare, Image as ImageIcon,
  RefreshCw, CheckCircle2, Send, X, Plus, Check,
  AlertCircle, Clock, AlertTriangle, Eye, Cpu, XCircle, ShieldCheck, Handshake, Truck,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────── */
type Status = 'live' | 'active' | 'syncing' | 'idle';
type Stage  = 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';

interface Agent {
  id: string; name: string; initials: string; status: Status;
  stage: Stage; controls: number; suppliers: number; gradient: string;
  alerts: number; lastActive: string; health: number;
  division: string; frequency: string; notify: string[];
  internalSPOC?: string; externalSPOC?: string; truthMatch?: number;
}

/* ─── Mock Data ─────────────────────────────────────────── */
const MOCK_AGENTS: Agent[] = [
  { id:'a1', name:'Agent A1', initials:'A1', status:'live',    stage:'Acquisition', controls:3, suppliers:2, gradient:'linear-gradient(135deg, #0EA5E9, #6366F1)', alerts:2, lastActive:'2 min ago',  health:82, division:'Marketing Dept',   frequency:'Hourly',     notify:['Risk Manager','Compliance Officer'], internalSPOC:'priya@abc.co',  externalSPOC:'john@xyz.com',   truthMatch:50  },
  { id:'a2', name:'Agent A2', initials:'A2', status:'active',  stage:'Retention',   controls:2, suppliers:3, gradient:'linear-gradient(135deg, #10B981, #0EA5E9)', alerts:0, lastActive:'8 min ago',  health:94, division:'Operations Dept', frequency:'Daily',      notify:['Risk Manager'],                     internalSPOC:'raj@abc.co',    externalSPOC:'ops@abc.com',    truthMatch:100 },
  { id:'a3', name:'Agent A3', initials:'A3', status:'syncing', stage:'Upgradation', controls:4, suppliers:1, gradient:'linear-gradient(135deg, #8B5CF6, #EC4899)', alerts:3, lastActive:'just now',   health:61, division:'Technical Dept',  frequency:'Every 6hrs', notify:['Risk Manager','DPO','Admin'],        internalSPOC:'anita@abc.co',  externalSPOC:'info@def.com',   truthMatch:0   },
];

const openAlerts = { total: 5, critical: 3, high: 2 };

/* ─── Constants ─────────────────────────────────────────── */
const STATUS_CLR: Record<Status, string> = { live:'#10B981', active:'#0EA5E9', syncing:'#F59E0B', idle:'#CBD5E1' };
const STATUS_LABEL: Record<Status, string> = { live:'Live', active:'Active', syncing:'Syncing', idle:'Idle' };
const STAGE_CLR: Record<Stage, [string,string]> = {
  Acquisition: ['#EFF6FF','#0EA5E9'], Retention: ['#ECFDF5','#10B981'],
  Upgradation: ['#FFFBEB','#F59E0B'], Offboarding: ['#F1F5F9','#64748B'],
};
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#0EA5E9,#6366F1)', 'linear-gradient(135deg,#10B981,#0EA5E9)',
  'linear-gradient(135deg,#8B5CF6,#EC4899)', 'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#06B6D4,#8B5CF6)', 'linear-gradient(135deg,#EF4444,#EC4899)',
];
const PROCESS_CONTROLS   = ['SLA Adherence Policy','Supplier Onboarding Checklist','Contractual Obligation Review','Invoice Approval Workflow','Access Revocation on Exit','Third-Party Risk Assessment'];
const TECHNICAL_CONTROLS = ['MFA Enforcement','Data Classification Policy','Backup Verification','Access Review Policy','Encryption Standard Audit','Vulnerability Scan Cadence'];
const CONTROLS_LIST  = [...PROCESS_CONTROLS, ...TECHNICAL_CONTROLS];
const SUPPLIERS_LIST = ['XYZ Corporation','ABC Services','DEF Limited','GHI Technologies'];
const STAGES: Stage[] = ['Acquisition','Retention','Upgradation','Offboarding'];

/* ─── Status indicator ──────────────────────────────────── */
function StatusIndicator({ status, size=8 }: { status: Status; size?: number }) {
  const color = STATUS_CLR[status];
  if (status === 'syncing') return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
      <RefreshCw size={12} color={color} style={{ animation:'spin 1.2s linear infinite' }} />
      <span style={{ fontSize:12, color, fontWeight:500 }}>Syncing</span>
    </span>
  );
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:5 }}>
      <span style={{ position:'relative', display:'inline-flex', width:size, height:size }}>
        {status === 'live' && <span style={{ position:'absolute', inset:0, borderRadius:'50%', backgroundColor:color, opacity:0.5, animation:'ping 1.4s ease infinite' }} />}
        <span style={{ position:'relative', width:size, height:size, borderRadius:'50%', backgroundColor:color, display:'block' }} />
      </span>
      <span style={{ fontSize:12, color, fontWeight:500 }}>{STATUS_LABEL[status]}</span>
    </span>
  );
}

/* ─── Agent Avatar ──────────────────────────────────────── */
function AgentAvatar({ agent, size=72 }: { agent: Agent; size?: number }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:agent.gradient, border:`${size>60?4:3}px solid ${STATUS_CLR[agent.status]}`, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:size*0.27, fontWeight:700, flexShrink:0, boxShadow:`0 0 0 2px white inset` }}>
      {agent.initials}
    </div>
  );
}

/* ─── Multi-select dropdown ─────────────────────────────── */
function MultiSelect({ label, options, selected, onToggle, chipColor }: {
  label: string; options: string[]; selected: Set<string>; onToggle:(v:string)=>void; chipColor:[string,string];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const fn = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);
  return (
    <div ref={ref} style={{ position:'relative' }}>
      <div onClick={() => setOpen(o=>!o)} style={{ border:'1px solid #E2E8F0', borderRadius:8, padding:'8px 12px', cursor:'pointer', display:'flex', justifyContent:'space-between', alignItems:'flex-start', minHeight:42, backgroundColor:'#fff', gap:6 }}>
        <div style={{ display:'flex', flexWrap:'wrap', gap:4, flex:1 }}>
          {selected.size === 0
            ? <span style={{ color:'#94A3B8', fontSize:13, lineHeight:'24px' }}>Select {label.toLowerCase()}...</span>
            : Array.from(selected).map(v => (
              <span key={v} style={{ backgroundColor:chipColor[0], color:chipColor[1], fontSize:11, padding:'2px 8px', borderRadius:20, display:'flex', alignItems:'center', gap:3 }}>
                {v}
                <button onClick={e=>{e.stopPropagation();onToggle(v);}} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:chipColor[1], display:'flex' }}><X size={9}/></button>
              </span>
            ))
          }
        </div>
        <span style={{ color:'#94A3B8', fontSize:10, marginTop:5 }}>▾</span>
      </div>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:300, maxHeight:180, overflowY:'auto' }}>
          {options.map(opt => (
            <div key={opt} onClick={()=>onToggle(opt)} style={{ padding:'9px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#334155', backgroundColor:selected.has(opt)?'#F0F9FF':'#fff' }} className="hover:bg-[#F8FAFC]">
              <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:selected.has(opt)?'2px solid '+chipColor[1]:'2px solid #CBD5E1', backgroundColor:selected.has(opt)?chipColor[1]:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                {selected.has(opt) && <Check size={10} color="#fff" strokeWidth={3}/>}
              </div>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── Create Agent Modal ────────────────────────────────── */
function CreateAgentModal({ onClose, onCreated }: { onClose:()=>void; onCreated:(a:Agent)=>void }) {
  const [name, setName]               = useState('');
  const [gradient, setGradient]       = useState(AVATAR_GRADIENTS[0]);
  const [controls, setControls]       = useState<Set<string>>(new Set(['MFA Enforcement']));
  const [suppliers, setSuppliers]     = useState<Set<string>>(new Set());
  const [stages, setStages]           = useState<Set<Stage>>(new Set(['Acquisition']));
  const [alertLevel, setAlertLevel]   = useState('High');
  const [frequency,  setFrequency]    = useState('Daily');
  const [notify,     setNotify]       = useState<Set<string>>(new Set(['Risk Manager']));
  const [division,   setDivision]     = useState('');
  const [template,   setTemplate]     = useState<string|null>(null);
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const initials = name.trim() ? name.trim().slice(0,2).toUpperCase() : 'A?';
  const toggleStage  = (s:Stage) => { const n=new Set(stages);   n.has(s)?n.delete(s):n.add(s); setStages(n); };
  const toggleCtrl   = (v:string) => { const n=new Set(controls);  n.has(v)?n.delete(v):n.add(v); setControls(n); };
  const toggleSup    = (v:string) => { const n=new Set(suppliers); n.has(v)?n.delete(v):n.add(v); setSuppliers(n); };
  const toggleNotify = (v:string) => { const n=new Set(notify); n.has(v)?n.delete(v):n.add(v); setNotify(n); };
  const [controlTab, setControlTab] = useState<'process'|'technical'>('process');
  const [internalContacts, setInternalContacts] = useState<string[]>(['']);
  const [supplierContacts, setSupplierContacts] = useState<string[]>(['']);
  const addContactField  = (side: 'int'|'sup') => side==='int' ? setInternalContacts(p=>[...p,'']) : setSupplierContacts(p=>[...p,'']);
  const removeContact    = (side: 'int'|'sup', i:number) => { if(side==='int') setInternalContacts(p=>p.filter((_,idx)=>idx!==i)); else setSupplierContacts(p=>p.filter((_,idx)=>idx!==i)); };
  const updateContact    = (side:'int'|'sup', i:number, val:string) => { if(side==='int') setInternalContacts(p=>p.map((v,idx)=>idx===i?val:v)); else setSupplierContacts(p=>p.map((v,idx)=>idx===i?val:v)); };
  const [externalSPOC, setExternalSPOC] = useState('');

  const applyTemplate = (id: string) => {
    setTemplate(id);
    if (id==='consulting')   { setFrequency('Daily');      setAlertLevel('High');          setControls(new Set(['MFA Enforcement','Data Classification Policy'])); setInternalContacts(['priya@abc.co','raj@abc.co']); setSupplierContacts(['john@xyz.com']); }
    if (id==='operations')   { setFrequency('Every 6hrs'); setAlertLevel('Critical Only'); setControls(new Set(['Backup Verification','Access Review Policy']));  setInternalContacts(['raj@abc.co']);               setSupplierContacts(['ops@supplier.com','sla@supplier.com']); }
    if (id==='data-security'){ setFrequency('Hourly');     setAlertLevel('Critical Only'); setControls(new Set(['MFA Enforcement','Backup Verification']));        setInternalContacts(['anita@abc.co']);             setSupplierContacts(['dpo@supplier.co']); }
    if (id==='custom')       { setInternalContacts(['']); setSupplierContacts(['']); }
  };

  const handleCreate = () => {
    if (!name.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false); setSuccess(true);
    }, 1600);
  };

  const handleViewAgents = () => {
    const firstStage = stages.size > 0 ? Array.from(stages)[0] as Stage : 'Acquisition';
    onCreated({ id:`a${Date.now()}`, name:name.trim(), initials, status:'active', stage:firstStage, controls:controls.size, suppliers:suppliers.size, gradient, alerts:0, lastActive:'just now', health:100, division:division||'Unassigned', frequency, notify:Array.from(notify) });
    onClose();
  };

  const inp: React.CSSProperties = { width:'100%', boxSizing:'border-box', border:'1px solid #E2E8F0', borderRadius:8, padding:'10px 12px', fontSize:14, outline:'none', color:'#334155', fontFamily:'inherit' };
  const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(15,23,42,0.4)', backdropFilter:'blur(2px)' }} />
      <div style={{ position:'relative', width:480, maxHeight:'85vh', backgroundColor:'#fff', borderRadius:16, display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)', zIndex:1 }}>
        {/* Header */}
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#0F172A' }}>Create Agent</div>
          <button onClick={onClose} style={{ width:32, height:32, backgroundColor:'#F1F5F9', border:'none', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748B' }}><X size={16}/></button>
        </div>
        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'20px 24px', display:'flex', flexDirection:'column', gap:18 }}>
          {success ? (
            <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 0', textAlign:'center', gap:14 }}>
              <CheckCircle2 size={48} color="#10B981" strokeWidth={1.5}/>
              <div style={{ fontSize:20, fontWeight:700, color:'#0F172A' }}>Agent Created!</div>
              <div style={{ display:'flex', alignItems:'center', gap:10, backgroundColor:'#F8FAFC', padding:'10px 20px', borderRadius:40 }}>
                <div style={{ width:40, height:40, borderRadius:'50%', background:gradient, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:700 }}>{initials}</div>
                <span style={{ fontSize:14, fontWeight:600, color:'#334155' }}>{name}</span>
              </div>
              <div style={{ display:'flex', gap:10, marginTop:4 }}>
                <button onClick={handleViewAgents} style={{ backgroundColor:'#0EA5E9', color:'#fff', border:'none', borderRadius:8, padding:'10px 20px', fontSize:14, fontWeight:600, cursor:'pointer' }}>View Agents</button>
                <button onClick={()=>setSuccess(false)} style={{ backgroundColor:'#fff', color:'#334155', border:'1px solid #E2E8F0', borderRadius:8, padding:'10px 16px', fontSize:14, cursor:'pointer' }}>Create Another</button>
              </div>
            </div>
          ) : (
            <>
              {/* Monitoring Templates — Radio Cards */}
              <div>
                <label style={lbl}>Monitoring Template</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                  {[
                    { id:'consulting',    icon:<Handshake  size={15} color="#0EA5E9"/>, title:'Consulting',    sub:'SOW & Payment Auditor',      color:'#0EA5E9', bg:'#EFF6FF' },
                    { id:'operations',    icon:<Truck       size={15} color="#10B981"/>, title:'Operations',    sub:'SLA & Logistics Monitor',    color:'#10B981', bg:'#ECFDF5' },
                    { id:'data-security', icon:<ShieldCheck size={15} color="#8B5CF6"/>, title:'Data Security', sub:'PII & Encryption Watchdog',  color:'#8B5CF6', bg:'#F5F3FF' },
                    { id:'custom',        icon:<Plus        size={15} color="#64748B"/>, title:'Custom',        sub:'Define your own parameters', color:'#64748B', bg:'#F8FAFC' },
                  ].map(tpl => {
                    const sel = template === tpl.id;
                    return (
                      <div key={tpl.id} onClick={()=>applyTemplate(tpl.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', border:`1px solid ${sel?tpl.color:'#E2E8F0'}`, borderRadius:10, cursor:'pointer', backgroundColor:sel?tpl.bg:'#fff', transition:'all 0.15s' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${sel?tpl.color:'#CBD5E1'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {sel && <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:tpl.color }} />}
                        </div>
                        <div style={{ width:28, height:28, borderRadius:8, backgroundColor:sel?tpl.color+'22':'#F1F5F9', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>{tpl.icon}</div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, fontWeight:600, color:'#0F172A' }}>{tpl.title}</div>
                          <div style={{ fontSize:11, color:'#94A3B8' }}>{tpl.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {template && template !== 'custom' && <div style={{ fontSize:11, color:'#10B981', display:'flex', alignItems:'center', gap:4, marginBottom:2 }}><CheckCircle2 size={11}/> Template applied — fields pre-filled</div>}
              </div>
              {/* Stakeholder Communication Monitoring — shown for all templates */}
              <div style={{ border:'1px solid #E2E8F0', borderRadius:12, padding:14, backgroundColor:'#F8FAFC' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <div style={{ width:3, height:14, borderRadius:2, backgroundColor:'#0EA5E9' }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>Stakeholder Communication Monitoring</span>
                </div>
                <div style={{ fontSize:12, color:'#94A3B8', marginBottom:12, lineHeight:1.5 }}>
                  The agent will scan email and calendar activity between these contacts to detect contractual, financial, and operational anomalies.
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#0EA5E9', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Internal Contacts</div>
                    {internalContacts.map((email, i) => (
                      <div key={i} style={{ display:'flex', gap:4, marginBottom:6 }}>
                        <input value={email} onChange={e=>updateContact('int',i,e.target.value)} placeholder="priya@abc.co"
                          style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:7, padding:'7px 10px', fontSize:12, outline:'none', color:'#334155', backgroundColor:'#fff' }} />
                        {internalContacts.length > 1 && (
                          <button onClick={()=>removeContact('int',i)} style={{ width:28, flexShrink:0, border:'1px solid #FECACA', borderRadius:7, backgroundColor:'#FEF2F2', color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={10}/></button>
                        )}
                      </div>
                    ))}
                    <button onClick={()=>addContactField('int')} style={{ fontSize:11, color:'#0EA5E9', background:'none', border:'1px dashed #BAE6FD', borderRadius:7, padding:'4px 10px', cursor:'pointer', width:'100%' }}>+ Add contact</button>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#8B5CF6', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Supplier Contacts</div>
                    {supplierContacts.map((email, i) => (
                      <div key={i} style={{ display:'flex', gap:4, marginBottom:6 }}>
                        <input value={email} onChange={e=>updateContact('sup',i,e.target.value)} placeholder="john@supplier.com"
                          style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:7, padding:'7px 10px', fontSize:12, outline:'none', color:'#334155', backgroundColor:'#fff' }} />
                        {supplierContacts.length > 1 && (
                          <button onClick={()=>removeContact('sup',i)} style={{ width:28, flexShrink:0, border:'1px solid #FECACA', borderRadius:7, backgroundColor:'#FEF2F2', color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={10}/></button>
                        )}
                      </div>
                    ))}
                    <button onClick={()=>addContactField('sup')} style={{ fontSize:11, color:'#8B5CF6', background:'none', border:'1px dashed #DDD6FE', borderRadius:7, padding:'4px 10px', cursor:'pointer', width:'100%' }}>+ Add contact</button>
                  </div>
                </div>
              </div>
              <div>
                <label style={lbl}>Agent Name *</label>
                <input style={inp} placeholder="e.g., Agent A4" value={name} onChange={e=>setName(e.target.value)} />
              </div>
              <div>
                <label style={lbl}>Avatar Gradient</label>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {AVATAR_GRADIENTS.map(g => (
                    <div key={g} onClick={()=>setGradient(g)} style={{ width:28, height:28, borderRadius:'50%', background:g, cursor:'pointer', outline:gradient===g?'3px solid #0EA5E9':'none', outlineOffset:2 }} />
                  ))}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:gradient, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:700 }}>{initials}</div>
                  <span style={{ fontSize:13, color:'#64748B' }}>{name||'New Agent'}</span>
                </div>
              </div>
              <div>
                <label style={lbl}>Assign Controls</label>
                {/* Process / Technical tabs */}
                <div style={{ display:'flex', gap:4, marginBottom:10, backgroundColor:'#F1F5F9', borderRadius:8, padding:3 }}>
                  {(['process','technical'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setControlTab(tab)}
                      style={{ flex:1, padding:'6px 0', borderRadius:6, fontSize:12, fontWeight: controlTab===tab ? 700 : 500, cursor:'pointer', border:'none', backgroundColor: controlTab===tab ? '#fff' : 'transparent', color: controlTab===tab ? '#0F172A' : '#64748B', boxShadow: controlTab===tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none', transition:'all 0.15s' }}
                    >
                      {tab === 'process' ? 'Process Controls' : 'Technical Controls'}
                    </button>
                  ))}
                </div>
                <div style={{ border:'1px solid #E2E8F0', borderRadius:8, overflow:'hidden' }}>
                  {(controlTab === 'process' ? PROCESS_CONTROLS : TECHNICAL_CONTROLS).map((ctrl, i, arr) => {
                    const sel = controls.has(ctrl);
                    return (
                      <div key={ctrl} onClick={() => toggleCtrl(ctrl)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', backgroundColor: sel ? '#F0F9FF' : '#fff', borderBottom: i < arr.length-1 ? '1px solid #F1F5F9' : 'none', transition:'background 0.12s' }}>
                        <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <span style={{ fontSize:13, fontWeight: sel ? 600 : 400, color: sel ? '#0369A1' : '#334155' }}>{ctrl}</span>
                        {sel && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:600, backgroundColor:'#EFF6FF', color:'#0EA5E9', padding:'1px 7px', borderRadius:10 }}>Selected</span>}
                      </div>
                    );
                  })}
                </div>
                {controls.size > 0 && (
                  <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:5 }}>
                    {Array.from(controls).map(c => (
                      <span key={c} style={{ backgroundColor:'#EFF6FF', color:'#0EA5E9', fontSize:11, padding:'2px 8px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
                        {c} <button onClick={()=>toggleCtrl(c)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:'#0EA5E9', display:'flex' }}><X size={9}/></button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label style={lbl}>Assign Suppliers</label>
                <MultiSelect label="Suppliers" options={SUPPLIERS_LIST} selected={suppliers} onToggle={toggleSup} chipColor={['#F5F3FF','#8B5CF6']} />
              </div>
              <div>
                <label style={lbl}>Data Flow Stage</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {STAGES.map(s => {
                    const sel=stages.has(s); const [bg,c]=STAGE_CLR[s];
                    return <button key={s} onClick={()=>toggleStage(s)} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:sel?600:500, cursor:'pointer', backgroundColor:sel?bg:'#fff', color:sel?c:'#64748B', border:`1px solid ${sel?c:'#E2E8F0'}` }}>{s}</button>;
                  })}
                </div>
              </div>
              <div>
                <label style={lbl}>Alert Sensitivity</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['Low','Medium','High','Critical Only'].map(l => (
                    <button key={l} onClick={()=>setAlertLevel(l)} style={{ padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:alertLevel===l?600:500, cursor:'pointer', backgroundColor:alertLevel===l?'#0EA5E9':'#fff', color:alertLevel===l?'#fff':'#64748B', border:`1px solid ${alertLevel===l?'#0EA5E9':'#E2E8F0'}` }}>{l}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Frequency</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['Hourly','Daily','Every 6hrs'].map(f => (
                    <button key={f} onClick={()=>setFrequency(f)} style={{ padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:frequency===f?600:500, cursor:'pointer', backgroundColor:frequency===f?'#0EA5E9':'#fff', color:frequency===f?'#fff':'#64748B', border:`1px solid ${frequency===f?'#0EA5E9':'#E2E8F0'}` }}>{f}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl}>Notify</label>
                <MultiSelect label="Notify" options={['Risk Manager','Compliance Officer','DPO','Admin']} selected={notify} onToggle={toggleNotify} chipColor={['#F5F3FF','#8B5CF6']} />
              </div>
              <div>
                <label style={lbl}>Division</label>
                <input style={inp} placeholder="e.g., Marketing Dept" value={division} onChange={e=>setDivision(e.target.value)} />
              </div>
            </>
          )}
        </div>
        {/* Footer */}
        {!success && (
          <div style={{ padding:'14px 24px', borderTop:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', flexShrink:0 }}>
            <button style={{ padding:'9px 16px', fontSize:14, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#334155', cursor:'pointer' }}>Save as Draft</button>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={onClose} style={{ padding:'9px 16px', fontSize:14, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#334155', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim()||loading} style={{ padding:'9px 20px', fontSize:14, fontWeight:600, border:'none', borderRadius:8, backgroundColor:name.trim()?'#0EA5E9':'#CBD5E1', color:'#fff', cursor:name.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:7 }}>
                {loading && <RefreshCw size={14} style={{ animation:'spin 0.8s linear infinite' }} />}
                {loading?'Creating...':'Create Agent →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Detail Sub-Modals ─────────────────────────────────── */
function PictureModal({ agent, onSelect, onClose }: { agent:Agent; onSelect:(g:string)=>void; onClose:()=>void }) {
  const [sel, setSel] = useState(agent.gradient);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }} />
      <div style={{ position:'relative', width:340, backgroundColor:'#fff', borderRadius:16, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', marginBottom:4 }}>Select Avatar</div>
        <div style={{ fontSize:13, color:'#94A3B8', marginBottom:20 }}>Choose a gradient for this agent</div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, marginBottom:20 }}>
          {AVATAR_GRADIENTS.map(g => (
            <div key={g} onClick={()=>setSel(g)} style={{ width:64, height:64, borderRadius:'50%', background:g, cursor:'pointer', margin:'0 auto', outline:sel===g?'3px solid #0EA5E9':'none', outlineOffset:3, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:18, fontWeight:700 }}>{agent.initials}</div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 14px', fontSize:13, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#64748B', cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>{onSelect(sel);onClose();toast.success('Avatar updated!');}} style={{ padding:'8px 16px', fontSize:13, fontWeight:600, border:'none', borderRadius:8, backgroundColor:'#0EA5E9', color:'#fff', cursor:'pointer' }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function VoiceModal({ onClose }: { onClose:()=>void }) {
  const [sel, setSel] = useState('Neutral');
  const voices = ['Neutral','Professional','Friendly','Formal'];
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }} />
      <div style={{ position:'relative', width:340, backgroundColor:'#fff', borderRadius:16, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', marginBottom:4 }}>Select Voice</div>
        <div style={{ fontSize:13, color:'#94A3B8', marginBottom:20 }}>Choose how this agent communicates</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {voices.map(v => (
            <div key={v} onClick={()=>setSel(v)} style={{ padding:'12px 16px', border:`1px solid ${sel===v?'#0EA5E9':'#E2E8F0'}`, borderRadius:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor:sel===v?'#F0F9FF':'#fff' }}>
              <div>
                <div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>{v}</div>
                <div style={{ fontSize:12, color:'#94A3B8', marginTop:1 }}>{v==='Neutral'?'Balanced and clear':v==='Professional'?'Formal and precise':v==='Friendly'?'Warm and approachable':'Structured and authoritative'}</div>
              </div>
              {sel===v && <Check size={16} color="#0EA5E9" strokeWidth={3}/>}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 14px', fontSize:13, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#64748B', cursor:'pointer' }}>Cancel</button>
          <button onClick={()=>{onClose();toast.success(`Voice set to "${sel}"`);}} style={{ padding:'8px 16px', fontSize:13, fontWeight:600, border:'none', borderRadius:8, backgroundColor:'#8B5CF6', color:'#fff', cursor:'pointer' }}>Apply</button>
        </div>
      </div>
    </div>
  );
}

function TalkModal({ agent, onClose }: { agent:Agent; onClose:()=>void }) {
  const [listening, setListening] = useState(false);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }} />
      <div style={{ position:'relative', width:320, backgroundColor:'#fff', borderRadius:16, padding:32, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', textAlign:'center' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        <AgentAvatar agent={agent} size={52} />
        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', marginTop:12, marginBottom:4 }}>Talk to {agent.name}</div>
        <div style={{ fontSize:13, color:'#94A3B8', marginBottom:28 }}>{listening?'Listening... speak now':'Click the mic to start speaking'}</div>
        <div onClick={()=>setListening(l=>!l)} style={{ width:64, height:64, borderRadius:'50%', backgroundColor:listening?'#EF4444':'#10B981', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', margin:'0 auto 20px', boxShadow:`0 4px 20px ${listening?'rgba(239,68,68,0.4)':'rgba(16,185,129,0.4)'}`, transition:'all 0.2s' }}>
          <Mic size={26} color="#fff"/>
        </div>
        {listening && <div style={{ fontSize:12, color:'#EF4444', fontWeight:600, marginBottom:16 }}>● Listening...</div>}
        <button onClick={onClose} style={{ padding:'8px 20px', fontSize:13, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#64748B', cursor:'pointer' }}>Cancel</button>
      </div>
    </div>
  );
}

function ChatModal({ agent, onClose }: { agent:Agent; onClose:()=>void }) {
  const MOCK_RESPONSES = [
    "I'm monitoring all assigned controls and suppliers in real-time. Is there anything specific you'd like me to investigate?",
    "I've detected 2 anomalies in the last 24 hours. Would you like a detailed report?",
    "Running analysis now... I'll have results shortly.",
    "All systems are operating within normal parameters. No critical alerts at this time.",
  ];
  const initMsgs = [
    { from:'agent' as const, text:`Hello! I'm ${agent.name}. I'm currently monitoring ${agent.controls} controls and ${agent.suppliers} suppliers. How can I help?` },
    { from:'user' as const,  text:'Show me the latest alerts' },
    { from:'agent' as const, text:`I found 2 alerts in the last 24 hours. XYZ Corporation has a missing data event and GHI Technologies assessment is overdue.` },
  ];
  const [msgs, setMsgs] = useState(initMsgs);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { from:'user' as const, text:input.trim() };
    const reply   = { from:'agent' as const, text:MOCK_RESPONSES[Math.floor(Math.random()*MOCK_RESPONSES.length)] };
    setMsgs(m => [...m, userMsg]);
    setInput('');
    setTimeout(() => setMsgs(m => [...m, reply]), 800);
  };

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }} />
      <div style={{ position:'relative', width:420, height:540, backgroundColor:'#fff', borderRadius:16, display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflow:'hidden' }}>
        {/* Chat header */}
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:10, backgroundColor:'#fff' }}>
          <AgentAvatar agent={agent} size={36}/>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>{agent.name}</div>
            <div style={{ display:'flex', alignItems:'center', gap:4, marginTop:1 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'#10B981' }}/>
              <span style={{ fontSize:11, color:'#10B981' }}>Online</span>
            </div>
          </div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        </div>
        {/* Messages */}
        <div style={{ flex:1, overflowY:'auto', padding:'16px', backgroundColor:'#F8FAFC', display:'flex', flexDirection:'column', gap:10 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
              {m.from==='agent' && <AgentAvatar agent={agent} size={28} />}
              <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:12, fontSize:13, lineHeight:1.5, marginLeft:m.from==='agent'?8:0, marginRight:m.from==='user'?0:0, backgroundColor:m.from==='user'?'#0EA5E9':'#fff', color:m.from==='user'?'#fff':'#334155', border:m.from==='agent'?'1px solid #E2E8F0':'none' }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
        {/* Input */}
        <div style={{ padding:'12px 14px', borderTop:'1px solid #E2E8F0', display:'flex', gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter') send(); }} placeholder="Type a message..." style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', color:'#334155' }}/>
          <button onClick={send} style={{ width:38, height:38, backgroundColor:'#0EA5E9', border:'none', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Send size={15} color="#fff"/>
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Agent Detail View ─────────────────────────────────── */
function AgentDetail({ agent, onBack, onUpdateAgent }: { agent:Agent; onBack:()=>void; onUpdateAgent:(a:Agent)=>void }) {
  const [detailModal, setDetailModal] = useState<null|'picture'|'voice'|'talk'|'chat'>(null);
  const [stageBg, stageClr] = STAGE_CLR[agent.stage];

  const actionCards = [
    { key:'picture', icon:<ImageIcon size={20} color="#0EA5E9"/>, iconBg:'#EFF6FF', title:'Select Picture', sub:"Change the agent's avatar image" },
    { key:'voice',   icon:<Mic size={20} color="#8B5CF6"/>,      iconBg:'#F5F3FF', title:'Select Voice',   sub:'Choose how this agent speaks' },
    { key:'talk',    icon:<Volume2 size={20} color="#10B981"/>,   iconBg:'#ECFDF5', title:'Talk to Agent',  sub:'Speak directly with this agent' },
    { key:'chat',    icon:<MessageSquare size={20} color="#F59E0B"/>, iconBg:'#FFF7ED', title:'Start Chat', sub:'Open chat interface with agent' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      {/* Detail Header */}
      <div style={{ backgroundColor:'#fff', borderBottom:'1px solid #E2E8F0', padding:'14px 24px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:14, padding:'6px 10px', borderRadius:8 }} className="hover:bg-[#F1F5F9]">
          <ChevronLeft size={18}/> Back to Agents
        </button>
        <span style={{ color:'#E2E8F0' }}>|</span>
        <div style={{ fontSize:18, fontWeight:700, color:'#0F172A' }}>{agent.name}</div>
        <span style={{ backgroundColor:STATUS_CLR[agent.status]+'22', color:STATUS_CLR[agent.status], fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>{STATUS_LABEL[agent.status]}</span>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>
        {/* Profile card */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:32, textAlign:'center', marginBottom:20 }}>
          <div style={{ display:'flex', justifyContent:'center', marginBottom:14 }}>
            <AgentAvatar agent={agent} size={96}/>
          </div>
          <div style={{ fontSize:22, fontWeight:700, color:'#0F172A', marginBottom:6 }}>{agent.name}</div>
          <div style={{ marginBottom:8 }}><StatusIndicator status={agent.status}/></div>
          <span style={{ backgroundColor:stageBg, color:stageClr, fontSize:12, fontWeight:600, padding:'3px 12px', borderRadius:20 }}>{agent.stage}</span>
          <div style={{ fontSize:13, color:'#94A3B8', marginTop:8 }}>{agent.controls} controls enforced · {agent.suppliers} suppliers monitored</div>
          <div style={{ fontSize:12, color:'#94A3B8', marginTop:4 }}>{agent.division} · Checks {agent.frequency.toLowerCase()}</div>
          {/* Truth Match gauge */}
          {agent.truthMatch !== undefined && (
            <div style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:8, backgroundColor: agent.truthMatch===100?'#ECFDF5':agent.truthMatch>=50?'#FFFBEB':'#FEF2F2', border:`1px solid ${agent.truthMatch===100?'#A7F3D0':agent.truthMatch>=50?'#FDE68A':'#FECACA'}`, borderRadius:20, padding:'5px 14px' }}>
              {agent.truthMatch===100?<CheckCircle2 size={13} color="#10B981"/>:agent.truthMatch>=50?<AlertTriangle size={13} color="#F59E0B"/>:<AlertCircle size={13} color="#EF4444"/>}
              <span style={{ fontSize:12, fontWeight:600, color:agent.truthMatch===100?'#059669':agent.truthMatch>=50?'#92400E':'#DC2626' }}>Truth Match: {agent.truthMatch}%</span>
            </div>
          )}

          {/* Stakeholder Context */}
          {(agent.internalSPOC || agent.externalSPOC) && (
            <div style={{ marginTop:18, borderTop:'1px solid #F1F5F9', paddingTop:16, display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, textAlign:'left' }}>
              {agent.internalSPOC && (
                <div style={{ backgroundColor:'#F8FAFC', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Internal SPOC</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#0EA5E9', marginBottom:2 }}>{agent.internalSPOC}</div>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>Risk Manager</div>
                </div>
              )}
              {agent.externalSPOC && (
                <div style={{ backgroundColor:'#F8FAFC', borderRadius:10, padding:'10px 12px' }}>
                  <div style={{ fontSize:10, fontWeight:700, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:4 }}>Supplier SPOC</div>
                  <div style={{ fontSize:12, fontWeight:600, color:'#8B5CF6', marginBottom:2 }}>{agent.externalSPOC}</div>
                  <div style={{ fontSize:11, color:'#94A3B8' }}>Account Manager</div>
                </div>
              )}
              <div style={{ gridColumn:'1/-1', fontSize:11, color:'#94A3B8', lineHeight:1.5 }}>
                These contacts serve as the audit targets for the Agent Reasoning feed — their communications are monitored for contractual and financial anomalies.
              </div>
            </div>
          )}
        </div>

        {/* ── Stakeholder Network Map ───────────────────── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#0EA5E9', animation:'ping 1.4s ease infinite', opacity:0.7 }}/>
            <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Stakeholder Communication Map</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:0, alignItems:'center' }}>
            {/* Internal contacts */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#0EA5E9', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Internal</div>
              {[agent.internalSPOC || 'priya@abc.co', ...(agent.id==='a1'?['raj@abc.co']:agent.id==='a3'?['anita@abc.co']:[])].filter(Boolean).map((email, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, border:'1px solid #BAE6FD', backgroundColor:'#EFF6FF' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#0EA5E9,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700, flexShrink:0 }}>{email.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontSize:11, fontWeight:500, color:'#0369A1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{email}</span>
                </div>
              ))}
            </div>
            {/* SVG connecting lines */}
            <div style={{ width:80, height:80, flexShrink:0 }}>
              <svg width={80} height={80} style={{ overflow:'visible' }}>
                <defs>
                  <marker id="nm-arrow" markerWidth="5" markerHeight="5" refX="4" refY="2.5" orient="auto"><path d="M0,0 L0,5 L5,2.5 z" fill="#CBD5E1"/></marker>
                </defs>
                <line x1={10} y1={20} x2={70} y2={20} stroke="#0EA5E9" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
                <line x1={10} y1={40} x2={70} y2={40} stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
                <line x1={70} y1={60} x2={10} y2={60} stroke="#10B981" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
                <circle cx={40} cy={40} r={14} fill="#fff" stroke="#E2E8F0" strokeWidth={1}/>
                <text x={40} y={44} textAnchor="middle" fontSize={8} fill="#94A3B8" fontWeight={700}>AI</text>
              </svg>
            </div>
            {/* Supplier contacts */}
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#8B5CF6', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4, textAlign:'right' }}>Supplier</div>
              {[agent.externalSPOC || 'john@xyz.com', ...(agent.id==='a2'?['ops@abc.com']:agent.id==='a3'?['info@def.com']:[])].filter(Boolean).map((email, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, border:'1px solid #DDD6FE', backgroundColor:'#F5F3FF', flexDirection:'row-reverse' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700, flexShrink:0 }}>{email.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontSize:11, fontWeight:500, color:'#6D28D9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Activity Summary Card ─────────────────────── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:14 }}>Process Intelligence Summary</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Last SOW Signed',        value: agent.id==='a1'?'Feb 10, 2026':agent.id==='a2'?'Jan 22, 2026':'Dec 5, 2025',      icon:'📄', color:'#0EA5E9', bg:'#EFF6FF' },
              { label:'Last Payment Detected',   value: agent.id==='a1'?'₹10L · Feb 28':agent.id==='a2'?'₹4.2L · Feb 20':'₹18L · Jan 15', icon:'₹',  color:'#10B981', bg:'#ECFDF5' },
              { label:'Last Escalation',         value: agent.id==='a1'?'Mar 1, 2026':agent.id==='a2'?'None detected':'Feb 27, 2026',      icon:'⚡',  color:'#F59E0B', bg:'#FFFBEB' },
              { label:'Active Risks',            value: agent.alerts > 0 ? `${agent.alerts} open alert${agent.alerts>1?'s':''}` : 'None detected',   icon:'!',  color: agent.alerts>0?'#EF4444':'#10B981', bg: agent.alerts>0?'#FEF2F2':'#ECFDF5' },
            ].map(item => (
              <div key={item.label} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 12px', borderRadius:10, backgroundColor:item.bg, border:`1px solid ${item.color}22` }}>
                <div style={{ width:32, height:32, borderRadius:8, backgroundColor:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:14, flexShrink:0, boxShadow:'0 1px 4px rgba(0,0,0,0.08)' }}>{item.icon}</div>
                <div>
                  <div style={{ fontSize:10, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:2 }}>{item.label}</div>
                  <div style={{ fontSize:13, fontWeight:700, color:item.color }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Live Monitoring Panel ─────────────────────── */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:16 }}>

          {/* Left — Suppliers Monitored */}
          <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <Eye size={16} color="#0EA5E9"/>
                <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Suppliers Monitored</span>
              </div>
              <span style={{ backgroundColor:'#EFF6FF', color:'#0EA5E9', fontSize:11, padding:'2px 8px', borderRadius:20 }}>{agent.suppliers}</span>
            </div>
            {(agent.id==='a1' ? [
              { name:'XYZ Corporation',  stage:'Acquisition', dot:'#0EA5E9', status:'flowing' },
              { name:'GHI Technologies', stage:'Acquisition', dot:'#0EA5E9', status:'alert' },
            ] : agent.id==='a2' ? [
              { name:'ABC Services Ltd', stage:'Retention', dot:'#10B981', status:'flowing' },
              { name:'JKL Consultancy',  stage:'Retention', dot:'#10B981', status:'flowing' },
              { name:'MNO Partners',     stage:'Retention', dot:'#10B981', status:'pending' },
            ] : [
              { name:'DEF Limited', stage:'Upgradation', dot:'#F59E0B', status:'alert' },
            ]).map((sup, i, arr) => (
              <div key={sup.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}>
                    <span style={{ width:8, height:8, borderRadius:'50%', backgroundColor:sup.dot, display:'inline-block', flexShrink:0 }}/>
                    <span style={{ fontSize:13, fontWeight:600, color:'#334155' }}>{sup.name}</span>
                  </div>
                  <span style={{ fontSize:10, color:'#94A3B8', paddingLeft:14 }}>{sup.stage}</span>
                </div>
                {sup.status==='flowing' && <span style={{ backgroundColor:'#ECFDF5', color:'#10B981', fontSize:11, padding:'2px 8px', borderRadius:20 }}>Flowing</span>}
                {sup.status==='alert'   && <span style={{ backgroundColor:'#FEF2F2', color:'#EF4444', fontSize:11, padding:'2px 8px', borderRadius:20 }}>Alert</span>}
                {sup.status==='pending' && <span style={{ backgroundColor:'#FFFBEB', color:'#F59E0B', fontSize:11, padding:'2px 8px', borderRadius:20 }}>Pending</span>}
              </div>
            ))}
          </div>

          {/* Right — Controls Enforced */}
          <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20 }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <ShieldCheck size={16} color="#8B5CF6"/>
                <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Controls Enforced</span>
              </div>
              <span style={{ backgroundColor:'#F5F3FF', color:'#8B5CF6', fontSize:11, padding:'2px 8px', borderRadius:20 }}>{agent.controls}</span>
            </div>
            {(agent.id==='a1' ? [
              { name:'MFA Enforcement',            cat:'Technical', result:'passing' },
              { name:'Data Classification Policy', cat:'Document',  result:'issue'   },
              { name:'Backup Verification',         cat:'Process',   result:'passing' },
            ] : agent.id==='a2' ? [
              { name:'Access Review Policy',   cat:'Process',  result:'passing' },
              { name:'Incident Response Plan', cat:'Document', result:'passing' },
            ] : [
              { name:'Network Segmentation',  cat:'Technical', result:'failed'  },
              { name:'Patch Management',       cat:'Process',   result:'issue'   },
              { name:'Vulnerability Scanning', cat:'Technical', result:'passing' },
              { name:'Privileged Access Mgmt', cat:'Technical', result:'passing' },
            ]).map((ctrl, i, arr) => (
              <div key={ctrl.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none' }}>
                <div>
                  <div style={{ fontSize:13, fontWeight:600, color:'#334155', marginBottom:3 }}>{ctrl.name}</div>
                  <span style={{ fontSize:10, color:'#94A3B8' }}>{ctrl.cat}</span>
                </div>
                {ctrl.result==='passing' && <span style={{ display:'inline-flex', alignItems:'center', gap:4, backgroundColor:'#ECFDF5', color:'#10B981', fontSize:11, padding:'2px 8px', borderRadius:20 }}><CheckCircle2 size={12}/>Passing</span>}
                {ctrl.result==='issue'   && <span style={{ display:'inline-flex', alignItems:'center', gap:4, backgroundColor:'#FFFBEB', color:'#F59E0B', fontSize:11, padding:'2px 8px', borderRadius:20 }}><AlertTriangle size={12}/>1 Issue</span>}
                {ctrl.result==='failed'  && <span style={{ display:'inline-flex', alignItems:'center', gap:4, backgroundColor:'#FEF2F2', color:'#EF4444', fontSize:11, padding:'2px 8px', borderRadius:20 }}><XCircle size={12}/>Failed</span>}
              </div>
            ))}
          </div>
        </div>

        {/* ── Agent Reasoning Feed ──────────────────────── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden', marginBottom:16 }}>
          <div style={{ padding:'14px 16px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <Cpu size={16} color="#0EA5E9"/>
              <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Agent Reasoning</span>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:5 }}>
              <span style={{ position:'relative', display:'inline-flex', width:8, height:8 }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', backgroundColor:'#10B981', opacity:0.5, animation:'ping 1.4s ease infinite' }}/>
                <span style={{ position:'relative', width:8, height:8, borderRadius:'50%', backgroundColor:'#10B981', display:'block' }}/>
              </span>
              <span style={{ fontSize:12, color:'#10B981' }}>Live</span>
            </div>
          </div>
          {(agent.id==='a1' ? [
            { time:'2 min ago',  action:'MFA Check',          trigger:'XYZ Corporation admin accounts', reasoning:'Queried Azure AD. Found 94 of 100 accounts compliant. 6 accounts flagged.',                   confidence:'94%',  outcome:'check' },
            { time:'8 min ago',  action:'Data Flow Alert',     trigger:'GHI Technologies',               reasoning:'No data received in 7 days. SLA breach detected. Alert triggered and Risk Manager notified.',   confidence:'99%',  outcome:'alert' },
            { time:'32 min ago', action:'Backup Verification', trigger:'XYZ Corporation',                reasoning:'Backup logs reviewed. Last successful backup 18 hours ago. Within acceptable threshold.',        confidence:'88%',  outcome:'check' },
            { time:'1 hr ago',   action:'Document Expiry',     trigger:'ISO 27001 Certificate',          reasoning:'Certificate expiry date extracted. Expires in 22 days. Renewal reminder sent to supplier.',     confidence:'97%',  outcome:'warn'  },
            { time:'3 hrs ago',  action:'Process Audit',       trigger:'Contractual Risk',                reasoning:`Detected SOW signature (Feb 10) occurs after service start date (Feb 5) in ${MOCK_AGENTS[0].internalSPOC} emails. Anomaly: Contractual Risk.`,  confidence:'91%',  outcome:'alert' },
            { time:'5 hrs ago',  action:'Process Audit',       trigger:'Financial Leak',                  reasoning:`Payment of ₹10L detected. No PO approval found in conversation history between ${MOCK_AGENTS[0].internalSPOC} and ${MOCK_AGENTS[0].externalSPOC}. Anomaly: Financial Leak.`,  confidence:'88%',  outcome:'alert' },
          ] : agent.id==='a2' ? [
            { time:'8 min ago',  action:'Data Alert',          trigger:'Call Center Ltd',                reasoning:'Expected daily data feed not received. Checked SFTP logs. No transfer recorded. Alert raised.',  confidence:'96%',  outcome:'alert' },
            { time:'1 hr ago',   action:'Access Review',       trigger:'ABC Services Ltd',               reasoning:'Quarterly access review policy evaluated. All user access rights confirmed current.',              confidence:'91%',  outcome:'check' },
            { time:'3 hrs ago',  action:'Incident Response',   trigger:'JKL Consultancy',                reasoning:'IR plan document reviewed. Board approval confirmed. Ransomware scenario included.',               confidence:'85%',  outcome:'check' },
            { time:'5 hrs ago',  action:'SLA Check',           trigger:'MNO Partners',                   reasoning:'Assessment portal link sent 30 days ago. No response received. Escalation triggered.',           confidence:'100%', outcome:'warn'  },
          ] : [
            { time:'just now',   action:'Network Check',       trigger:'DEF Limited',                    reasoning:'Network segmentation control evaluated. DMZ configuration missing. Control marked Failed.',       confidence:'92%',  outcome:'alert' },
            { time:'20 min ago', action:'Patch Status',        trigger:'DEF Limited',                    reasoning:'Last patch applied 45 days ago. SLA requires 30 days. 1 issue flagged for review.',              confidence:'89%',  outcome:'warn'  },
            { time:'2 hrs ago',  action:'Vulnerability Scan',  trigger:'DEF Limited',                    reasoning:'Automated scan results reviewed. 0 critical vulnerabilities. Scan coverage 100%.',               confidence:'95%',  outcome:'check' },
            { time:'4 hrs ago',  action:'PAM Evaluation',      trigger:'DEF Limited',                    reasoning:'Privileged access management controls evaluated. JIT access confirmed active.',                  confidence:'87%',  outcome:'check' },
          ]).map((row, i, arr) => (
            <div key={i} style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none' }}>
              <div style={{ fontSize:11, color:'#94A3B8', width:70, flexShrink:0, paddingTop:2 }}>{row.time}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:13, color:'#334155', marginBottom:3 }}>
                  <span style={{ fontWeight:600, color:'#0F172A' }}>{row.action}</span>{' · '}{row.trigger}
                </div>
                <div style={{ fontSize:12, color:'#64748B', fontStyle:'italic', marginBottom:5, lineHeight:1.5 }}>{row.reasoning}</div>
                <span style={{ fontSize:11, color:'#64748B', backgroundColor:'#F8FAFC', border:'1px solid #E2E8F0', padding:'2px 8px', borderRadius:20 }}>Confidence: {row.confidence}</span>
              </div>
              <div style={{ flexShrink:0, paddingTop:2 }}>
                {row.outcome==='check' && <CheckCircle2  size={16} color="#10B981"/>}
                {row.outcome==='alert' && <AlertCircle   size={16} color="#EF4444"/>}
                {row.outcome==='warn'  && <AlertTriangle size={16} color="#F59E0B"/>}
              </div>
            </div>
          ))}
        </div>

        {/* 4 Action cards */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
          {actionCards.map(ac => (
            <div
              key={ac.key}
              onClick={() => setDetailModal(ac.key as any)}
              style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, cursor:'pointer', transition:'all 0.18s' }}
              className="hover:border-[#0EA5E9] hover:shadow-sm"
            >
              <div style={{ width:40, height:40, borderRadius:10, backgroundColor:ac.iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>
                {ac.icon}
              </div>
              <div style={{ fontSize:15, fontWeight:700, color:'#0F172A', marginBottom:3 }}>{ac.title}</div>
              <div style={{ fontSize:13, color:'#94A3B8' }}>{ac.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {detailModal === 'picture' && <PictureModal agent={agent} onSelect={g=>onUpdateAgent({...agent,gradient:g})} onClose={()=>setDetailModal(null)}/>}
      {detailModal === 'voice'   && <VoiceModal onClose={()=>setDetailModal(null)}/>}
      {detailModal === 'talk'    && <TalkModal agent={agent} onClose={()=>setDetailModal(null)}/>}
      {detailModal === 'chat'    && <ChatModal agent={agent} onClose={()=>setDetailModal(null)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function Agents() {
  const location     = useLocation();
  const [view,           setView]           = useState<'dashboard'|'detail'>('dashboard');
  const [selectedAgent,  setSelectedAgent]  = useState<Agent|null>(null);
  const [showCreate,     setShowCreate]     = useState(false);
  const [agents,         setAgents]         = useState<Agent[]>(MOCK_AGENTS);

  /* ── Read navigation state from sidebar ── */
  useEffect(() => {
    if (location.state?.openCreateModal) {
      setShowCreate(true);
      setView('dashboard');
    }
    if (location.state?.openAgentDetail) {
      const found = agents.find(a => a.id === location.state.openAgentDetail);
      if (found) { setSelectedAgent(found); setView('detail'); }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state]);

  const liveCount    = agents.filter(a=>a.status==='live').length;
  const activeCount  = agents.filter(a=>a.status==='active').length;
  const syncingCount = agents.filter(a=>a.status==='syncing').length;

  const updateAgent = (updated: Agent) => {
    setAgents(as => as.map(a => a.id===updated.id ? updated : a));
    if (selectedAgent?.id === updated.id) setSelectedAgent(updated);
  };

  if (view === 'detail' && selectedAgent) {
    return (
      <>
        <AgentDetail
          agent={agents.find(a=>a.id===selectedAgent.id) ?? selectedAgent}
          onBack={()=>{ setView('dashboard'); setSelectedAgent(null); }}
          onUpdateAgent={updateAgent}
        />
        <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </>
    );
  }

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:0, maxWidth:1200 }}>
      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#0F172A', margin:0 }}>Agents</h1>
          <p style={{ fontSize:13, color:'#94A3B8', margin:'4px 0 0' }}>Monitor and manage your AI agents</p>
        </div>
        <button onClick={()=>setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, backgroundColor:'#0EA5E9', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          <Plus size={16}/> Create Agent
        </button>
      </div>

      {/* KPI Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Live',    count:liveCount,    color:'#10B981', indicator:<><span style={{ position:'relative', display:'inline-flex', width:10, height:10 }}><span style={{ position:'absolute', inset:0, borderRadius:'50%', backgroundColor:'#10B981', opacity:0.5, animation:'ping 1.4s ease infinite' }}/><span style={{ position:'relative', width:10, height:10, borderRadius:'50%', backgroundColor:'#10B981', display:'block' }}/></span></>, sub:null },
          { label:'Active',  count:activeCount,  color:'#0EA5E9', indicator:<span style={{ width:10, height:10, borderRadius:'50%', backgroundColor:'#0EA5E9', display:'inline-block' }}/>, sub:null },
          { label:'Syncing', count:syncingCount, color:'#F59E0B', indicator:<RefreshCw size={14} color="#F59E0B" style={{ animation:'spin 1.2s linear infinite' }}/>, sub:null },
          { label:'Open Alerts', count:openAlerts.total, color:'#EF4444', indicator:<AlertCircle size={16} color="#EF4444"/>, sub:`${openAlerts.critical} critical · ${openAlerts.high} high` },
        ].map(kpi => (
          <div key={kpi.label} style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'18px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', borderLeft:`4px solid ${kpi.color}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <span style={{ fontSize:34, fontWeight:700, color:'#0F172A' }}>{kpi.count}</span>
              {kpi.indicator}
            </div>
            <div style={{ fontSize:13, color:'#64748B' }}>{kpi.label}</div>
            {kpi.sub && <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{kpi.sub}</div>}
          </div>
        ))}
      </div>

      {/* Agent grid */}
      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A' }}>Your Agents</div>
        <span style={{ backgroundColor:'#F1F5F9', color:'#64748B', fontSize:12, fontWeight:500, padding:'2px 8px', borderRadius:20 }}>{agents.length}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:18 }}>
        {agents.map(agent => {
          const [stageBg, stageClr] = STAGE_CLR[agent.stage];
          return (
            <div
              key={agent.id}
              onClick={()=>{ setSelectedAgent(agent); setView('detail'); }}
              style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:20, cursor:'pointer', textAlign:'center', transition:'all 0.2s' }}
              className="hover:shadow-md hover:border-[#0EA5E9]"
            >
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12 }}>
                <AgentAvatar agent={agent} size={72}/>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:5 }}>{agent.name}</div>
              <div style={{ marginBottom:8 }}><StatusIndicator status={agent.status}/></div>
              <span style={{ backgroundColor:stageBg, color:stageClr, fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, display:'inline-block', marginBottom:8 }}>{agent.stage}</span>
              <div style={{ fontSize:11, color:'#94A3B8' }}>{agent.controls} controls · {agent.suppliers} sup</div>

              {/* Alert badge */}
              <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center', marginTop:8 }}>
                {agent.alerts === 0
                  ? <span style={{ display:'inline-flex', alignItems:'center', gap:3, backgroundColor:'#ECFDF5', color:'#10B981', fontSize:11, padding:'2px 8px', borderRadius:20 }}>
                      <CheckCircle2 size={11}/> No alerts
                    </span>
                  : <span style={{ display:'inline-flex', alignItems:'center', gap:3, backgroundColor:'#FEF2F2', color:'#EF4444', fontSize:11, padding:'2px 8px', borderRadius:20 }}>
                      <AlertCircle size={11}/> {agent.alerts} open alerts
                    </span>
                }
              </div>

              {/* Last active */}
              <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center', marginTop:4 }}>
                <Clock size={11} color="#94A3B8"/>
                <span style={{ fontSize:11, color:'#94A3B8' }}>Last active: {agent.lastActive}</span>
              </div>

              {/* Health bar */}
              <div style={{ marginTop:10, borderTop:'1px solid #F1F5F9', paddingTop:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:10, color:'#94A3B8' }}>Coverage</span>
                  <span style={{ fontSize:10, fontWeight:600, color: agent.health>=80?'#10B981':agent.health>=50?'#F59E0B':'#EF4444' }}>{agent.health}%</span>
                </div>
                <div style={{ height:4, borderRadius:99, backgroundColor:'#F1F5F9', width:'100%' }}>
                  <div style={{ height:'100%', borderRadius:99, width:`${agent.health}%`, backgroundColor:agent.health>=80?'#10B981':agent.health>=50?'#F59E0B':'#EF4444', transition:'width 0.6s ease' }}/>
                </div>
              </div>
            </div>
          );
        })}

        {/* Add agent card */}
        <div
          onClick={()=>setShowCreate(true)}
          style={{ backgroundColor:'#F8FAFC', border:'2px dashed #E2E8F0', borderRadius:16, padding:20, cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:180, transition:'all 0.2s' }}
          className="hover:border-[#0EA5E9] hover:bg-[#F0F9FF]"
        >
          <div style={{ width:44, height:44, borderRadius:'50%', backgroundColor:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}>
            <Bot size={20} color="#0EA5E9"/>
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:'#64748B' }}>New Agent</div>
          <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>Click to create</div>
        </div>
      </div>

      {showCreate && (
        <CreateAgentModal
          onClose={()=>setShowCreate(false)}
          onCreated={a=>{ setAgents(prev=>[...prev,a]); toast.success(`Agent \"${a.name}\" created!`); }}
        />
      )}

      {/* ── Activity Feed ──────────────────────────────── */}
      <div style={{ marginTop:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Agent Activity</div>
            <div style={{ fontSize:12, color:'#94A3B8', marginTop:2 }}>Live feed of agent actions</div>
          </div>
          <button
            onClick={()=>toast('Coming soon')}
            style={{ fontSize:13, color:'#0EA5E9', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}
          >
            View All
          </button>
        </div>

        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden' }}>
          {[
            { initials:'A1', gradient:'linear-gradient(135deg,#0EA5E9,#6366F1)', name:'Agent A1', action:'checked MFA compliance on XYZ Corporation',             time:'2 min ago',  icon:<CheckCircle2 size={16} color="#10B981"/> },
            { initials:'A2', gradient:'linear-gradient(135deg,#10B981,#0EA5E9)', name:'Agent A2', action:'raised alert: Call Center Ltd missing data',             time:'8 min ago',  icon:<AlertCircle  size={16} color="#EF4444"/> },
            { initials:'A3', gradient:'linear-gradient(135deg,#8B5CF6,#EC4899)', name:'Agent A3', action:'started backup verification check',                      time:'just now',   icon:<RefreshCw    size={16} color="#F59E0B" style={{ animation:'spin 1.5s linear infinite' }}/> },
            { initials:'A1', gradient:'linear-gradient(135deg,#0EA5E9,#6366F1)', name:'Agent A1', action:'document expiry warning: ISO 27001 cert expires in 22 days', time:'15 min ago', icon:<AlertTriangle size={16} color="#F59E0B"/> },
            { initials:'A2', gradient:'linear-gradient(135deg,#10B981,#0EA5E9)', name:'Agent A2', action:'completed access review policy evaluation',               time:'1 hr ago',   icon:<CheckCircle2 size={16} color="#10B981"/> },
          ].map((row, i, arr) => (
            <div
              key={i}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none', transition:'background 0.15s' }}
              className="hover:bg-[#F8FAFC]"
            >
              {/* Avatar */}
              <div style={{ width:28, height:28, borderRadius:'50%', background:row.gradient, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:10, fontWeight:700, flexShrink:0 }}>
                {row.initials}
              </div>
              {/* Text */}
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, color:'#334155', lineHeight:1.4 }}>
                  <span style={{ fontWeight:600, color:'#0F172A' }}>{row.name}</span>{' '}{row.action}
                </p>
                <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{row.time}</div>
              </div>
              {/* Status icon */}
              <div style={{ flexShrink:0 }}>{row.icon}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
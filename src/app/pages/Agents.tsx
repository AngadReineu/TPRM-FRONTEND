import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router';
import {
  Bot, ChevronLeft, Mic, Volume2, MessageSquare, Image as ImageIcon,
  RefreshCw, CheckCircle2, Send, X, Plus, Check,
  AlertCircle, Clock, AlertTriangle, Eye, Cpu, XCircle, ShieldCheck, Handshake, Truck,
  Activity, Database, Zap, TrendingUp, Shield, ChevronDown, ChevronUp,
  Brain, ChevronRight, MessageSquare as MsgSq, Users, BarChart2, Bell,
  FileText, Flag, UserCheck, CalendarCheck, GitMerge, Send as SendIcon,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────── */
type Status   = 'live' | 'active' | 'syncing' | 'idle';
type Stage    = 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';
type LogType  = 'fetch' | 'evaluate' | 'reasoning' | 'success' | 'warning' | 'action' | 'decision' | 'error';
type TaskPriority = 'High' | 'Medium' | 'Low';
type TaskStatus   = 'Open' | 'In Progress' | 'Resolved';

interface Agent {
  id: string; name: string; initials: string; status: Status;
  stage: Stage; controls: number; suppliers: number; gradient: string;
  alerts: number; lastActive: string; health: number;
  division: string; frequency: string; notify: string[];
  internalSPOC?: string; externalSPOC?: string; truthMatch?: number;
  /* enriched fields for detail page */
  agentName?: string; role?: string; color?: string; avatarSeed?: string;
  uptime?: string; nextEval?: string; lastScan?: string; openTasks?: number;
  currentTask?: string;
}

interface LogEntry {
  id: string; time: string; type: LogType; message: string; detail?: string;
}
interface AgentTask {
  id: string; title: string; supplier: string; priority: TaskPriority;
  assignee: string; status: TaskStatus; dueDate: string; description: string;
}
interface TimelineEntry {
  id: string; time: string; event: string; status: 'alert' | 'info' | 'success' | 'warning';
}

/* ─── Constants ─────────────────────────────────────────── */
const STATUS_CLR: Record<Status, string>   = { live:'#10B981', active:'#0EA5E9', syncing:'#F59E0B', idle:'#CBD5E1' };
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
const DOCUMENT_CONTROLS  = ['ISO 27001 Certificate Review','NDA Compliance Check','Data Processing Agreement (DPA)','SOW Signature Verification','Audit Report Review','Policy Acknowledgement Tracker'];
const SUPPLIERS_LIST = ['XYZ Corporation','ABC Services','DEF Limited','GHI Technologies'];
const STAGES: Stage[] = ['Acquisition','Retention','Upgradation','Offboarding'];

const LOG_STYLE: Record<LogType, { color: string; bg: string; label: string }> = {
  fetch:     { color:'#06B6D4', bg:'#ECFEFF', label:'FETCH'  },
  evaluate:  { color:'#0EA5E9', bg:'#EFF6FF', label:'EVAL'   },
  reasoning: { color:'#8B5CF6', bg:'#F5F3FF', label:'REASON' },
  success:   { color:'#10B981', bg:'#ECFDF5', label:'PASS'   },
  warning:   { color:'#F59E0B', bg:'#FFFBEB', label:'WARN'   },
  action:    { color:'#64748B', bg:'#F8FAFC', label:'ACTION' },
  decision:  { color:'#6366F1', bg:'#EEF2FF', label:'NEXT'   },
  error:     { color:'#EF4444', bg:'#FEF2F2', label:'ERROR'  },
};

/* ─── Mock Data ─────────────────────────────────────────── */
const MOCK_AGENTS: Agent[] = [
  {
    id:'a1', name:'Agent Aria', initials:'A1', status:'live', stage:'Acquisition',
    controls:4, suppliers:2, gradient:'linear-gradient(135deg, #0EA5E9, #6366F1)',
    alerts:2, lastActive:'2 min ago', health:82, division:'Marketing Dept',
    frequency:'Hourly', notify:['Risk Manager','Compliance Officer'],
    internalSPOC:'priya@abc.co', externalSPOC:'john@xyz.com', truthMatch:50,
    agentName:'Agent Aria', role:'Contract & Process Compliance Specialist', color:'#0EA5E9', avatarSeed:'Aria',
    uptime:'99.1%', nextEval:'In 45 min', lastScan:'09:14 AM', openTasks:3, currentTask:'Auditing SOW signatures and contractual obligation timelines for XYZ Corporation',
  },
  {
    id:'a2', name:'Agent Blake', initials:'A2', status:'active', stage:'Retention',
    controls:3, suppliers:3, gradient:'linear-gradient(135deg, #10B981, #0EA5E9)',
    alerts:0, lastActive:'8 min ago', health:94, division:'Operations Dept',
    frequency:'Daily', notify:['Risk Manager'],
    internalSPOC:'raj@abc.co', externalSPOC:'ops@abc.com', truthMatch:100,
    agentName:'Agent Blake', role:'SLA & Supplier Process Monitor', color:'#10B981', avatarSeed:'Blake',
    uptime:'98.7%', nextEval:'In 2 hrs', lastScan:'08:52 AM', openTasks:1, currentTask:'Verifying SLA adherence and invoice approval workflows across 3 suppliers',
  },
  {
    id:'a3', name:'Agent Casey', initials:'A3', status:'syncing', stage:'Upgradation',
    controls:4, suppliers:1, gradient:'linear-gradient(135deg, #8B5CF6, #EC4899)',
    alerts:3, lastActive:'just now', health:61, division:'Technical Dept',
    frequency:'Every 6hrs', notify:['Risk Manager','DPO','Admin'],
    internalSPOC:'anita@abc.co', externalSPOC:'info@def.com', truthMatch:0,
    agentName:'Agent Casey', role:'Network & Access Review Auditor', color:'#8B5CF6', avatarSeed:'Casey',
    uptime:'97.3%', nextEval:'In 1 hr', lastScan:'08:30 AM', openTasks:5, currentTask:'Running quarterly access review across Active Directory',
  },
];
const openAlerts = { total: 5, critical: 3, high: 2 };

/* ─── Per-agent enriched data ────────────────────────────── */
const AGENT_TASKS: Record<string, AgentTask[]> = {
  a1: [
    { id:'t1', title:'SOW Signed After Service Start — XYZ Corporation', supplier:'XYZ Corporation', priority:'High', assignee:'priya@abc.co', status:'Open', dueDate:'2026-03-07', description:'SOW signed Feb 10, but service delivery started Feb 5. Contractual risk — legal review required.' },
    { id:'t2', title:'Unapproved Payment of ₹10L — No PO Found', supplier:'XYZ Corporation', priority:'High', assignee:'anita@abc.co', status:'In Progress', dueDate:'2026-03-06', description:'₹10L payment detected with no corresponding PO approval in email thread. Finance Controller to investigate.' },
    { id:'t3', title:'ISO 27001 Certificate Renewal — 22 Days Remaining', supplier:'XYZ Corporation', priority:'Medium', assignee:'', status:'Open', dueDate:'2026-03-26', description:'Certificate expires Mar 26. Supplier to submit renewal proof within 15 days per contract terms.' },
    { id:'t4', title:'TPRA Overdue — GHI Technologies', supplier:'GHI Technologies', priority:'High', assignee:'priya@abc.co', status:'Open', dueDate:'2026-03-05', description:'Annual Third-Party Risk Assessment 3 days overdue. Last score: Medium Risk (48/100). Escalation in progress.' },
  ],
  a2: [
    { id:'t4', title:'SLA Breach — ABC Services Uptime 98.1% vs 99.5%', supplier:'ABC Services Ltd', priority:'High', assignee:'raj@abc.co', status:'In Progress', dueDate:'2026-03-08', description:'SLA breach of 1.4% in Feb 2026. Penalty clause applicable. Acknowledgement from supplier overdue.' },
    { id:'t5', title:'MNO Partners Onboarding — 3 Items Missing', supplier:'MNO Partners', priority:'Medium', assignee:'raj@abc.co', status:'Open', dueDate:'2026-03-12', description:'BCP document, cyber insurance cert, and sub-processor list not yet submitted. Checklist at 62%.' },
    { id:'t6', title:'DPA Sub-Processor Annex — JKL Consultancy', supplier:'JKL Consultancy', priority:'Medium', assignee:'', status:'Open', dueDate:'2026-03-14', description:'DPA missing sub-processor annex per GDPR Article 28(2). Legal team to follow up.' },
  ],
  a3: [
    { id:'t5', title:'Revoke Access — 3 Orphaned Accounts', supplier:'DEF Limited', priority:'High', assignee:'it-admin@abc.co', status:'In Progress', dueDate:'2026-03-05', description:'Accounts U1042, U1098, U1187 belong to terminated employees with active access.' },
    { id:'t6', title:'Patch 3 Servers — Feb 2026 Security Rollup', supplier:'DEF Limited', priority:'High', assignee:'sysadmin@abc.co', status:'Open', dueDate:'2026-03-10', description:'3 servers missing Feb 2026 security rollup. SLA breach in 8 days.' },
    { id:'t7', title:'Document Approved VLAN Exceptions', supplier:'DEF Limited', priority:'Low', assignee:'', status:'Open', dueDate:'2026-03-20', description:'2 cross-VLAN firewall exceptions approved in ServiceNow. Audit documentation required.' },
    { id:'t8', title:'Access Review Sign-off by Dept Heads', supplier:'DEF Limited', priority:'Medium', assignee:'hr@abc.co', status:'Open', dueDate:'2026-03-12', description:'Quarterly access review results require department head sign-off.' },
    { id:'t9', title:'Update Insider Threat Runbook', supplier:'DEF Limited', priority:'Low', assignee:'', status:'Open', dueDate:'2026-03-25', description:'IR Plan references outdated escalation contacts. Update required.' },
  ],
};

const AGENT_TIMELINE: Record<string, TimelineEntry[]> = {
  a1: [
    { id:'tl1', time:'09:14 AM', event:'MFA audit completed — 94.5% coverage across 847 assets', status:'success' },
    { id:'tl2', time:'09:08 AM', event:'ServiceNow ticket VULN-2847 auto-created for critical CVE patch', status:'alert' },
    { id:'tl3', time:'09:05 AM', event:'Email dispatched to Risk Manager & Compliance Officer re: CVE breach risk', status:'warning' },
    { id:'tl4', time:'08:55 AM', event:'JIT access session audit completed — 14 sessions, 0 standing access', status:'success' },
    { id:'tl5', time:'08:40 AM', event:'Supplier XYZ Corporation contract expiry flagged — 15 days remaining', status:'warning' },
    { id:'tl6', time:'08:20 AM', event:'MFA enrollment advisory sent to 3 non-compliant admin accounts', status:'info' },
  ],
  a2: [
    { id:'tl1', time:'08:52 AM', event:'SLA breach confirmed — ABC Services uptime 98.1% vs 99.5% contracted', status:'alert' },
    { id:'tl2', time:'08:45 AM', event:'Penalty clause notification queued for raj@abc.co (awaiting review)', status:'warning' },
    { id:'tl3', time:'08:30 AM', event:'Supplier onboarding: MNO Partners at 62% — 3 items missing, reminder sent', status:'warning' },
    { id:'tl4', time:'08:15 AM', event:'DPA reviewed: JKL Consultancy missing sub-processor annex — legal flagged', status:'alert' },
    { id:'tl5', time:'07:58 AM', event:'Invoice INV-20260228 (₹4.2L) verified — PO approval confirmed, no anomalies', status:'success' },
    { id:'tl6', time:'07:40 AM', event:'Access revocation triggered: mark@abc-services.com (offboarded Feb 15)', status:'info' },
  ],
  a3: [
    { id:'tl1', time:'08:30 AM', event:'Orphaned account revocation initiated — U1042, U1098, U1187', status:'alert' },
    { id:'tl2', time:'08:25 AM', event:'PATCH-3319 escalated to P1 — 3 servers missing Feb 2026 rollup', status:'warning' },
    { id:'tl3', time:'08:10 AM', event:'Network segmentation confirmed — VLAN 10/20 isolation verified', status:'success' },
    { id:'tl4', time:'07:50 AM', event:'IR runbooks validated — all current, last updated Feb 2026', status:'success' },
    { id:'tl5', time:'07:30 AM', event:'Quarterly access review initiated — 1,240 AD accounts scanned', status:'info' },
  ],
};

function buildInitialLogs(agentId: string): LogEntry[] {
  const now = new Date();
  const ts = (off: number) => { const d = new Date(now.getTime() - off*1000); return d.toTimeString().slice(0,8); };
  const seqs: Record<string, LogEntry[]> = {
    a1: [
      { id:'1', time:ts(420), type:'fetch',     message:'Connecting to email integration — scanning priya@abc.co ↔ john@xyz.com thread' },
      { id:'2', time:ts(415), type:'fetch',     message:'Pulling XYZ Corporation contract documents from SharePoint' },
      { id:'3', time:ts(410), type:'evaluate',  message:'Running evaluation: SOW Signature Verification' },
      { id:'4', time:ts(405), type:'reasoning', message:'Cross-referencing SOW date against service start date in emails', detail:'SOW signed Feb 10. Email thread shows service delivery began Feb 5. 5-day gap — SOW signed after work commenced. Contractual Risk flagged.' },
      { id:'5', time:ts(400), type:'warning',   message:'SOW Signature Verification: ANOMALY — SOW signed after service start date' },
      { id:'6', time:ts(395), type:'action',    message:'Alert raised → Risk Manager, Compliance Officer. Ticket SOW-1041 created.' },
      { id:'7', time:ts(380), type:'fetch',     message:'Pulling bank transaction feed — checking for unapproved payments' },
      { id:'8', time:ts(375), type:'evaluate',  message:'Running evaluation: Invoice Approval Workflow' },
      { id:'9', time:ts(365), type:'reasoning', message:'Matching ₹10L payment to PO approval chain', detail:'Payment of ₹10L detected on Feb 28. Searched email thread for PO approval. No approval found between priya@abc.co and john@xyz.com. Anomaly: Unapproved Payment.' },
      { id:'10', time:ts(358), type:'error',    message:'Invoice Approval Workflow: FAILED — ₹10L payment with no PO approval' },
      { id:'11', time:ts(354), type:'action',   message:'Escalation email sent → Finance Controller + Risk Manager' },
      { id:'12', time:ts(340), type:'evaluate', message:'Running evaluation: ISO 27001 Certificate Review' },
      { id:'13', time:ts(328), type:'reasoning', message:'Parsing certificate metadata from document store', detail:'ISO 27001 cert expiry: Mar 26, 2026. Today: Mar 4, 2026. 22 days remaining. Renewal SLA is 30 days — already in warning window.' },
      { id:'14', time:ts(320), type:'warning',  message:'ISO 27001 Certificate Review: EXPIRING SOON — 22 days remaining' },
      { id:'15', time:ts(316), type:'action',   message:'Auto-renewal reminder sent to XYZ Corporation supplier contact' },
    ],
    a2: [
      { id:'1', time:ts(300), type:'fetch',     message:'Pulling SLA reports from ABC Services Ltd supplier portal' },
      { id:'2', time:ts(295), type:'evaluate',  message:'Running evaluation: SLA Adherence Policy' },
      { id:'3', time:ts(285), type:'reasoning', message:'Comparing reported uptime against contracted SLA thresholds', detail:'ABC Services SLA: 99.5% uptime. Feb 2026 report: 98.1%. Breach of 1.4%. Penalty clause in contract applies above 0.5% deviation.' },
      { id:'4', time:ts(280), type:'error',     message:'SLA Adherence: BREACH — ABC Services uptime 98.1% vs 99.5% contracted' },
      { id:'5', time:ts(275), type:'action',    message:'SLA breach ticket raised. Penalty clause notification queued for raj@abc.co' },
      { id:'6', time:ts(260), type:'fetch',     message:'Pulling supplier onboarding checklist status for MNO Partners' },
      { id:'7', time:ts(250), type:'evaluate',  message:'Running evaluation: Supplier Onboarding Checklist' },
      { id:'8', time:ts(240), type:'reasoning', message:'Reviewing checklist completion across 8 required onboarding items', detail:'8 items total. Completed: 5. Missing: BCP document (item 6), cyber insurance certificate (item 7), sub-processor list (item 8). Checklist 62.5% complete.' },
      { id:'9', time:ts(232), type:'warning',   message:'Supplier Onboarding: INCOMPLETE — MNO Partners 62% (3 items missing)' },
      { id:'10', time:ts(225), type:'action',   message:'Automated reminder sent → MNO Partners. Escalation in 7 days if unresolved.' },
      { id:'11', time:ts(210), type:'evaluate', message:'Running evaluation: Data Processing Agreement — JKL Consultancy' },
      { id:'12', time:ts(195), type:'reasoning', message:'Reviewing DPA against GDPR Article 28 requirements', detail:'DPA signed Jan 2026. Sub-processor annex not attached. Article 28(2) requires written authorisation for sub-processors. Flagging for legal review.' },
      { id:'13', time:ts(188), type:'warning',  message:'DPA Compliance: ISSUE — sub-processor annex missing from JKL Consultancy DPA' },
    ],
    a3: [
      { id:'1', time:ts(500), type:'fetch',     message:'Pulling Active Directory user list (quarterly review cycle)' },
      { id:'2', time:ts(490), type:'evaluate',  message:'Running evaluation: Access Review Policy' },
      { id:'3', time:ts(475), type:'reasoning', message:'Cross-referencing AD users against HR offboarding records', detail:'1,240 user accounts reviewed. 8 accounts belong to terminated employees. 3 still have active access. Immediate revocation required.' },
      { id:'4', time:ts(465), type:'warning',   message:'Access Review: 3 orphaned accounts with active access detected' },
      { id:'5', time:ts(460), type:'action',    message:'Auto-revocation initiated for accounts: U1042, U1098, U1187' },
      { id:'6', time:ts(455), type:'action',    message:'Notification sent to IT Admin + HR compliance team' },
      { id:'7', time:ts(440), type:'evaluate',  message:'Running evaluation: Network Segmentation' },
      { id:'8', time:ts(425), type:'reasoning', message:'Scanning VLAN topology — prod vs. staging isolation', detail:'VLAN rules reviewed. VLAN 10 (prod) and VLAN 20 (staging) properly isolated. 2 cross-VLAN rules — both approved exceptions in ServiceNow.' },
      { id:'9', time:ts(415), type:'success',   message:'Network Segmentation: PASSED — isolation confirmed, 2 approved exceptions' },
      { id:'10', time:ts(400), type:'evaluate', message:'Running evaluation: Incident Response Plan' },
      { id:'11', time:ts(385), type:'reasoning', message:'Checking IR runbooks last update date and tabletop exercise records', detail:'IR Plan last updated: Feb 2026. Tabletop exercise: Jan 2026. Both within SLA. Runbooks cover ransomware, data breach, insider threat.' },
      { id:'12', time:ts(375), type:'success',  message:'Incident Response Plan: PASSED — all runbooks current' },
    ],
  };
  return seqs[agentId] || seqs['a1'];
}

const STREAM_QUEUES: Record<string, Array<Omit<LogEntry,'id'|'time'>>> = {
  a1: [
    { type:'fetch',     message:'Re-scanning email thread: priya@abc.co ↔ john@xyz.com for new communications' },
    { type:'evaluate',  message:'Running evaluation: Contractual Obligation Review (scheduled hourly)' },
    { type:'reasoning', message:'Checking 5 active contractual obligations for XYZ Corporation', detail:'Obligation 3 (Monthly SLA Report) overdue by 3 days. Obligation 5 (Quarterly Risk Review) due in 2 days. All others current.' },
    { type:'warning',   message:'Contractual Obligation Review: 1 overdue obligation, 1 approaching deadline' },
    { type:'action',    message:'Overdue obligation escalation sent → priya@abc.co & john@xyz.com' },
    { type:'evaluate',  message:'Running evaluation: Third-Party Risk Assessment — GHI Technologies' },
    { type:'reasoning', message:'Checking TPRA due date and last submission from GHI Technologies', detail:'Annual TPRA due Mar 1, 2026. Today is Mar 4 — 3 days overdue. No updated assessment received. Previous score: Medium Risk (48/100).' },
    { type:'error',     message:'Third-Party Risk Assessment: OVERDUE — GHI Technologies TPRA 3 days past due' },
    { type:'action',    message:'Escalation notice dispatched → Risk Manager & Compliance Officer' },
    { type:'decision',  message:'Next: Invoice Approval Workflow re-scan in 30 min' },
  ],
  a2: [
    { type:'fetch',     message:'Pulling latest SLA report submission from ABC Services Ltd portal' },
    { type:'evaluate',  message:'Re-evaluating SLA Adherence Policy (daily cycle)' },
    { type:'reasoning', message:'Verifying whether SLA breach penalty has been acknowledged', detail:'Penalty clause notification sent 2 days ago. No acknowledgement received from ABC Services. Escalation threshold: 3 business days.' },
    { type:'warning',   message:'SLA Breach: Penalty acknowledgement not received — escalation pending' },
    { type:'action',    message:'Escalation email queued → raj@abc.co + Legal team (due tomorrow)' },
    { type:'decision',  message:'Next: Supplier Onboarding Checklist follow-up for MNO Partners' },
  ],
  a3: [
    { type:'fetch',     message:'Pulling patch deployment status from ServiceNow CMDB' },
    { type:'evaluate',  message:'Running evaluation: Patch Management' },
    { type:'reasoning', message:'Comparing installed patch versions against vendor advisories', detail:'OS patch compliance: 88%. 12 servers running unpatched versions. Most critical: 3 servers missing Feb 2026 security rollup. SLA: 30 days — 8 days remaining.' },
    { type:'warning',   message:'Patch Management: 3 servers approaching SLA deadline (8 days)' },
    { type:'action',    message:'PATCH-3319 ticket escalated to P1 — assigned to SysAdmin team' },
  ],
};

/* ═══════════════════════════════════════════════════════════
   SHARED UI HELPERS
══════════════════════════════════════════════════════════════ */
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

function AgentAvatar({ agent, size=72 }: { agent: Agent; size?: number }) {
  // Try DiceBear human avatar, fall back to gradient with initials
  const seed = agent.avatarSeed || agent.initials;
  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
  return (
    <div style={{ position:'relative', flexShrink:0 }}>
      <img
        src={avatarUrl}
        alt={agent.name}
        width={size}
        height={size}
        style={{ borderRadius:'50%', border:`${size>60?3:2}px solid ${STATUS_CLR[agent.status]}40`, backgroundColor:'#F1F5F9', display:'block' }}
        onError={(e) => {
          // Graceful fallback: hide img, show gradient div
          (e.target as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

/* ─── Multi-select ────────────────────────────────────────── */
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
                {v}<button onClick={e=>{e.stopPropagation();onToggle(v);}} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:chipColor[1], display:'flex' }}><X size={9}/></button>
              </span>
            ))}
        </div>
        <span style={{ color:'#94A3B8', fontSize:10, marginTop:5 }}>▾</span>
      </div>
      {open && (
        <div style={{ position:'absolute', top:'calc(100% + 4px)', left:0, right:0, backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:8, boxShadow:'0 4px 12px rgba(0,0,0,0.1)', zIndex:300, maxHeight:180, overflowY:'auto' }}>
          {options.map(opt => (
            <div key={opt} onClick={()=>onToggle(opt)} style={{ padding:'9px 12px', cursor:'pointer', display:'flex', alignItems:'center', gap:8, fontSize:13, color:'#334155', backgroundColor:selected.has(opt)?'#F0F9FF':'#fff' }}>
              <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:selected.has(opt)?`2px solid ${chipColor[1]}`:'2px solid #CBD5E1', backgroundColor:selected.has(opt)?chipColor[1]:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
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

/* ─── Create Agent Modal ──────────────────────────────────── */
function CreateAgentModal({ onClose, onCreated }: { onClose:()=>void; onCreated:(a:Agent)=>void }) {
  const [name, setName]             = useState('');
  const [gradient, setGradient]     = useState(AVATAR_GRADIENTS[0]);
  const [controls, setControls]     = useState<Set<string>>(new Set(['MFA Enforcement']));
  const [suppliers, setSuppliers]   = useState<Set<string>>(new Set());
  const [stages, setStages]         = useState<Set<Stage>>(new Set(['Acquisition']));
  const [alertLevel, setAlertLevel] = useState('High');
  const [frequency, setFrequency]   = useState('Daily');
  const [notify, setNotify]         = useState<Set<string>>(new Set(['Risk Manager']));
  const [division, setDivision]     = useState('');
  const [template, setTemplate]     = useState<string|null>(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [controlTab, setControlTab] = useState<'process'|'technical'|'document'>('process');
  const [internalContacts, setInternalContacts] = useState<string[]>(['']);
  const [supplierContacts, setSupplierContacts] = useState<string[]>(['']);

  const initials = name.trim() ? name.trim().slice(0,2).toUpperCase() : 'A?';
  const toggleStage  = (s:Stage) => { const n=new Set(stages); n.has(s)?n.delete(s):n.add(s); setStages(n); };
  const toggleCtrl   = (v:string) => { const n=new Set(controls); n.has(v)?n.delete(v):n.add(v); setControls(n); };
  const toggleSup    = (v:string) => { const n=new Set(suppliers); n.has(v)?n.delete(v):n.add(v); setSuppliers(n); };
  const toggleNotify = (v:string) => { const n=new Set(notify); n.has(v)?n.delete(v):n.add(v); setNotify(n); };
  const addContactField  = (side:'int'|'sup') => side==='int'?setInternalContacts(p=>[...p,'']):setSupplierContacts(p=>[...p,'']);
  const removeContact    = (side:'int'|'sup', i:number) => { if(side==='int') setInternalContacts(p=>p.filter((_,idx)=>idx!==i)); else setSupplierContacts(p=>p.filter((_,idx)=>idx!==i)); };
  const updateContact    = (side:'int'|'sup', i:number, val:string) => { if(side==='int') setInternalContacts(p=>p.map((v,idx)=>idx===i?val:v)); else setSupplierContacts(p=>p.map((v,idx)=>idx===i?val:v)); };
  const applyTemplate = (id:string) => {
    setTemplate(id);
    if(id==='consulting')   { setFrequency('Daily'); setAlertLevel('High'); setControls(new Set(['MFA Enforcement','Data Classification Policy'])); setInternalContacts(['priya@abc.co','raj@abc.co']); setSupplierContacts(['john@xyz.com']); }
    if(id==='operations')   { setFrequency('Every 6hrs'); setAlertLevel('Critical Only'); setControls(new Set(['Backup Verification','Access Review Policy'])); setInternalContacts(['raj@abc.co']); setSupplierContacts(['ops@supplier.com']); }
    if(id==='data-security'){ setFrequency('Hourly'); setAlertLevel('Critical Only'); setControls(new Set(['MFA Enforcement','Backup Verification'])); setInternalContacts(['anita@abc.co']); setSupplierContacts(['dpo@supplier.co']); }
    if(id==='custom')       { setInternalContacts(['']); setSupplierContacts(['']); }
  };
  const handleCreate = () => { if(!name.trim()) return; setLoading(true); setTimeout(()=>{ setLoading(false); setSuccess(true); }, 1600); };
  const handleViewAgents = () => {
    const firstStage = stages.size > 0 ? Array.from(stages)[0] as Stage : 'Acquisition';
    onCreated({ id:`a${Date.now()}`, name:name.trim(), initials, status:'active', stage:firstStage, controls:controls.size, suppliers:suppliers.size, gradient, alerts:0, lastActive:'just now', health:100, division:division||'Unassigned', frequency, notify:Array.from(notify), agentName:name.trim(), role:'Custom Agent', color:'#0EA5E9', avatarSeed:name.trim(), uptime:'100%', nextEval:'—', lastScan:'—', openTasks:0, currentTask:'Idle' });
    onClose();
  };
  const inp: React.CSSProperties = { width:'100%', boxSizing:'border-box', border:'1px solid #E2E8F0', borderRadius:8, padding:'10px 12px', fontSize:14, outline:'none', color:'#334155', fontFamily:'inherit' };
  const lbl: React.CSSProperties = { display:'block', fontSize:13, fontWeight:600, color:'#334155', marginBottom:6 };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:500, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(15,23,42,0.4)', backdropFilter:'blur(2px)' }} />
      <div style={{ position:'relative', width:480, maxHeight:'85vh', backgroundColor:'#fff', borderRadius:16, display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.2)', zIndex:1 }}>
        <div style={{ padding:'18px 24px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
          <div style={{ fontSize:18, fontWeight:700, color:'#0F172A' }}>Create Agent</div>
          <button onClick={onClose} style={{ width:32, height:32, backgroundColor:'#F1F5F9', border:'none', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:'#64748B' }}><X size={16}/></button>
        </div>
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
              <div>
                <label style={lbl}>Monitoring Template</label>
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:10 }}>
                  {[
                    { id:'consulting',    icon:<Handshake size={15} color="#0EA5E9"/>,  title:'Consulting',    sub:'SOW & Payment Auditor',      color:'#0EA5E9', bg:'#EFF6FF' },
                    { id:'operations',    icon:<Truck     size={15} color="#10B981"/>,  title:'Operations',    sub:'SLA & Logistics Monitor',    color:'#10B981', bg:'#ECFDF5' },
                    { id:'data-security', icon:<ShieldCheck size={15} color="#8B5CF6"/>,title:'Data Security', sub:'PII & Encryption Watchdog',  color:'#8B5CF6', bg:'#F5F3FF' },
                    { id:'custom',        icon:<Plus      size={15} color="#64748B"/>,  title:'Custom',        sub:'Define your own parameters', color:'#64748B', bg:'#F8FAFC' },
                  ].map(tpl => {
                    const sel = template===tpl.id;
                    return (
                      <div key={tpl.id} onClick={()=>applyTemplate(tpl.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:'11px 14px', border:`1px solid ${sel?tpl.color:'#E2E8F0'}`, borderRadius:10, cursor:'pointer', backgroundColor:sel?tpl.bg:'#fff', transition:'all 0.15s' }}>
                        <div style={{ width:16, height:16, borderRadius:'50%', border:`2px solid ${sel?tpl.color:'#CBD5E1'}`, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                          {sel && <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:tpl.color }}/>}
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
                {template && template !== 'custom' && <div style={{ fontSize:11, color:'#10B981', display:'flex', alignItems:'center', gap:4 }}><CheckCircle2 size={11}/> Template applied — fields pre-filled</div>}
              </div>
              <div style={{ border:'1px solid #E2E8F0', borderRadius:12, padding:14, backgroundColor:'#F8FAFC' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}>
                  <div style={{ width:3, height:14, borderRadius:2, backgroundColor:'#0EA5E9' }}/>
                  <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>Stakeholder Communication Monitoring</span>
                </div>
                <div style={{ fontSize:12, color:'#94A3B8', marginBottom:12, lineHeight:1.5 }}>The agent will scan email and calendar activity between these contacts to detect anomalies.</div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#0EA5E9', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Internal Contacts</div>
                    {internalContacts.map((email, i) => (
                      <div key={i} style={{ display:'flex', gap:4, marginBottom:6 }}>
                        <input value={email} onChange={e=>updateContact('int',i,e.target.value)} placeholder="priya@abc.co" style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:7, padding:'7px 10px', fontSize:12, outline:'none', color:'#334155', backgroundColor:'#fff' }}/>
                        {internalContacts.length > 1 && <button onClick={()=>removeContact('int',i)} style={{ width:28, flexShrink:0, border:'1px solid #FECACA', borderRadius:7, backgroundColor:'#FEF2F2', color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={10}/></button>}
                      </div>
                    ))}
                    <button onClick={()=>addContactField('int')} style={{ fontSize:11, color:'#0EA5E9', background:'none', border:'1px dashed #BAE6FD', borderRadius:7, padding:'4px 10px', cursor:'pointer', width:'100%' }}>+ Add contact</button>
                  </div>
                  <div>
                    <div style={{ fontSize:11, fontWeight:700, color:'#8B5CF6', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:6 }}>Supplier Contacts</div>
                    {supplierContacts.map((email, i) => (
                      <div key={i} style={{ display:'flex', gap:4, marginBottom:6 }}>
                        <input value={email} onChange={e=>updateContact('sup',i,e.target.value)} placeholder="john@supplier.com" style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:7, padding:'7px 10px', fontSize:12, outline:'none', color:'#334155', backgroundColor:'#fff' }}/>
                        {supplierContacts.length > 1 && <button onClick={()=>removeContact('sup',i)} style={{ width:28, flexShrink:0, border:'1px solid #FECACA', borderRadius:7, backgroundColor:'#FEF2F2', color:'#EF4444', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><X size={10}/></button>}
                      </div>
                    ))}
                    <button onClick={()=>addContactField('sup')} style={{ fontSize:11, color:'#8B5CF6', background:'none', border:'1px dashed #DDD6FE', borderRadius:7, padding:'4px 10px', cursor:'pointer', width:'100%' }}>+ Add contact</button>
                  </div>
                </div>
              </div>
              <div><label style={lbl}>Agent Name *</label><input style={inp} placeholder="e.g., Agent A4" value={name} onChange={e=>setName(e.target.value)}/></div>
              <div>
                <label style={lbl}>Avatar Gradient</label>
                <div style={{ display:'flex', gap:8, marginBottom:10 }}>
                  {AVATAR_GRADIENTS.map(g => <div key={g} onClick={()=>setGradient(g)} style={{ width:28, height:28, borderRadius:'50%', background:g, cursor:'pointer', outline:gradient===g?'3px solid #0EA5E9':'none', outlineOffset:2 }}/>)}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <div style={{ width:40, height:40, borderRadius:'50%', background:gradient, display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:14, fontWeight:700 }}>{initials}</div>
                  <span style={{ fontSize:13, color:'#64748B' }}>{name||'New Agent'}</span>
                </div>
              </div>
              <div>
                <label style={lbl}>Assign Controls</label>
                <div style={{ display:'flex', gap:4, marginBottom:10, backgroundColor:'#F1F5F9', borderRadius:8, padding:3 }}>
                  {(['process','technical','document'] as const).map(tab => (
                    <button key={tab} onClick={()=>setControlTab(tab)} style={{ flex:1, padding:'6px 0', borderRadius:6, fontSize:12, fontWeight:controlTab===tab?700:500, cursor:'pointer', border:'none', backgroundColor:controlTab===tab?'#fff':'transparent', color:controlTab===tab?'#0F172A':'#64748B', boxShadow:controlTab===tab?'0 1px 3px rgba(0,0,0,0.08)':'none', transition:'all 0.15s' }}>
                      {tab==='process'?'Process':tab==='technical'?'Technical':'Document'}
                    </button>
                  ))}
                </div>
                <div style={{ border:'1px solid #E2E8F0', borderRadius:8, overflow:'hidden' }}>
                  {(controlTab==='process'?PROCESS_CONTROLS:controlTab==='technical'?TECHNICAL_CONTROLS:DOCUMENT_CONTROLS).map((ctrl, i, arr) => {
                    const sel = controls.has(ctrl);
                    const tabColor = controlTab==='process'?'#10B981':controlTab==='technical'?'#0EA5E9':'#8B5CF6';
                    const tabBg    = controlTab==='process'?'#ECFDF5':controlTab==='technical'?'#EFF6FF':'#F5F3FF';
                    return (
                      <div key={ctrl} onClick={()=>toggleCtrl(ctrl)} style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', backgroundColor:sel?tabBg:'#fff', borderBottom:i<arr.length-1?'1px solid #F1F5F9':'none', transition:'background 0.12s' }}>
                        <div style={{ width:16, height:16, borderRadius:4, flexShrink:0, border:sel?`2px solid ${tabColor}`:'2px solid #CBD5E1', backgroundColor:sel?tabColor:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>
                          {sel && <Check size={10} color="#fff" strokeWidth={3}/>}
                        </div>
                        <span style={{ fontSize:13, fontWeight:sel?600:400, color:sel?tabColor:'#334155' }}>{ctrl}</span>
                        {sel && <span style={{ marginLeft:'auto', fontSize:10, fontWeight:600, backgroundColor:tabBg, color:tabColor, padding:'1px 7px', borderRadius:10 }}>Selected</span>}
                      </div>
                    );
                  })}
                </div>
                {controls.size > 0 && (
                  <div style={{ marginTop:8, display:'flex', flexWrap:'wrap', gap:5 }}>
                    {Array.from(controls).map(c => {
                      const isDoc  = DOCUMENT_CONTROLS.includes(c);
                      const isProc = PROCESS_CONTROLS.includes(c);
                      const chipClr = isDoc?'#8B5CF6':isProc?'#10B981':'#0EA5E9';
                      const chipBg  = isDoc?'#F5F3FF':isProc?'#ECFDF5':'#EFF6FF';
                      return (
                        <span key={c} style={{ backgroundColor:chipBg, color:chipClr, fontSize:11, padding:'2px 8px', borderRadius:20, display:'flex', alignItems:'center', gap:4 }}>
                          {c} <button onClick={()=>toggleCtrl(c)} style={{ background:'none', border:'none', cursor:'pointer', padding:0, color:chipClr, display:'flex' }}><X size={9}/></button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>
              <div><label style={lbl}>Assign Suppliers</label><MultiSelect label="Suppliers" options={SUPPLIERS_LIST} selected={suppliers} onToggle={toggleSup} chipColor={['#F5F3FF','#8B5CF6']}/></div>
              <div>
                <label style={lbl}>Data Flow Stage</label>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {STAGES.map(s => { const sel=stages.has(s); const [bg,c]=STAGE_CLR[s]; return <button key={s} onClick={()=>toggleStage(s)} style={{ padding:'6px 14px', borderRadius:8, fontSize:13, fontWeight:sel?600:500, cursor:'pointer', backgroundColor:sel?bg:'#fff', color:sel?c:'#64748B', border:`1px solid ${sel?c:'#E2E8F0'}` }}>{s}</button>; })}
                </div>
              </div>
              <div>
                <label style={lbl}>Alert Sensitivity</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['Low','Medium','High','Critical Only'].map(l => <button key={l} onClick={()=>setAlertLevel(l)} style={{ padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:alertLevel===l?600:500, cursor:'pointer', backgroundColor:alertLevel===l?'#0EA5E9':'#fff', color:alertLevel===l?'#fff':'#64748B', border:`1px solid ${alertLevel===l?'#0EA5E9':'#E2E8F0'}` }}>{l}</button>)}
                </div>
              </div>
              <div>
                <label style={lbl}>Frequency</label>
                <div style={{ display:'flex', gap:8 }}>
                  {['Hourly','Daily','Every 6hrs'].map(f => <button key={f} onClick={()=>setFrequency(f)} style={{ padding:'6px 12px', borderRadius:8, fontSize:13, fontWeight:frequency===f?600:500, cursor:'pointer', backgroundColor:frequency===f?'#0EA5E9':'#fff', color:frequency===f?'#fff':'#64748B', border:`1px solid ${frequency===f?'#0EA5E9':'#E2E8F0'}` }}>{f}</button>)}
                </div>
              </div>
              <div><label style={lbl}>Notify</label><MultiSelect label="Notify" options={['Risk Manager','Compliance Officer','DPO','Admin']} selected={notify} onToggle={toggleNotify} chipColor={['#F5F3FF','#8B5CF6']}/></div>
              <div><label style={lbl}>Division</label><input style={inp} placeholder="e.g., Marketing Dept" value={division} onChange={e=>setDivision(e.target.value)}/></div>
            </>
          )}
        </div>
        {!success && (
          <div style={{ padding:'14px 24px', borderTop:'1px solid #E2E8F0', display:'flex', justifyContent:'space-between', flexShrink:0 }}>
            <button style={{ padding:'9px 16px', fontSize:14, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#334155', cursor:'pointer' }}>Save as Draft</button>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={onClose} style={{ padding:'9px 16px', fontSize:14, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#334155', cursor:'pointer' }}>Cancel</button>
              <button onClick={handleCreate} disabled={!name.trim()||loading} style={{ padding:'9px 20px', fontSize:14, fontWeight:600, border:'none', borderRadius:8, backgroundColor:name.trim()?'#0EA5E9':'#CBD5E1', color:'#fff', cursor:name.trim()?'pointer':'not-allowed', display:'flex', alignItems:'center', gap:7 }}>
                {loading && <RefreshCw size={14} style={{ animation:'spin 0.8s linear infinite' }}/>}
                {loading?'Creating...':'Create Agent →'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Sub-modals ─────────────────────────────────────────── */
const AVATAR_SEEDS = [
  { seed:'Aria',    label:'Aria'    },
  { seed:'Blake',   label:'Blake'   },
  { seed:'Casey',   label:'Casey'   },
  { seed:'Dana',    label:'Dana'    },
  { seed:'Ellis',   label:'Ellis'   },
  { seed:'Felix',   label:'Felix'   },
  { seed:'Grace',   label:'Grace'   },
  { seed:'Harper',  label:'Harper'  },
  { seed:'Indira',  label:'Indira'  },
  { seed:'Jordan',  label:'Jordan'  },
  { seed:'Kai',     label:'Kai'     },
  { seed:'Luna',    label:'Luna'    },
];

function PictureModal({ agent, onSelect, onClose }: { agent:Agent; onSelect:(seed:string)=>void; onClose:()=>void }) {
  const [selSeed, setSelSeed] = useState(agent.avatarSeed || agent.initials);
  const previewUrl = (seed: string) =>
    `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.45)', backdropFilter:'blur(2px)' }}/>
      <div style={{ position:'relative', width:420, backgroundColor:'#fff', borderRadius:16, padding:28, boxShadow:'0 24px 64px rgba(0,0,0,0.2)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>

        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', marginBottom:2 }}>Select Avatar</div>
        <div style={{ fontSize:13, color:'#94A3B8', marginBottom:20 }}>Choose a persona for this agent</div>

        {/* Preview of selected */}
        <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
          <div style={{ position:'relative' }}>
            <img
              src={previewUrl(selSeed)}
              alt={selSeed}
              width={80} height={80}
              style={{ borderRadius:'50%', border:'3px solid #0EA5E9', backgroundColor:'#F1F5F9', display:'block' }}
            />
            <div style={{ position:'absolute', bottom:2, right:2, width:16, height:16, borderRadius:'50%', backgroundColor:STATUS_CLR[agent.status], border:'2px solid #fff' }}/>
          </div>
        </div>

        {/* Avatar grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12, marginBottom:22 }}>
          {AVATAR_SEEDS.map(({ seed, label }) => {
            const isSel = selSeed === seed;
            return (
              <div
                key={seed}
                onClick={() => setSelSeed(seed)}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5, cursor:'pointer' }}
              >
                <div style={{ borderRadius:'50%', padding:2, border:`2.5px solid ${isSel?'#0EA5E9':'transparent'}`, transition:'border 0.15s', backgroundColor:isSel?'#EFF6FF':'transparent' }}>
                  <img
                    src={previewUrl(seed)}
                    alt={label}
                    width={56} height={56}
                    style={{ borderRadius:'50%', backgroundColor:'#F1F5F9', display:'block', opacity:isSel?1:0.75, transition:'opacity 0.15s' }}
                  />
                </div>
                <span style={{ fontSize:10, fontWeight:isSel?700:500, color:isSel?'#0EA5E9':'#94A3B8', letterSpacing:'0.02em' }}>{label}</span>
              </div>
            );
          })}
        </div>

        <div style={{ display:'flex', justifyContent:'flex-end', gap:8 }}>
          <button onClick={onClose} style={{ padding:'8px 14px', fontSize:13, border:'1px solid #E2E8F0', borderRadius:8, backgroundColor:'#fff', color:'#64748B', cursor:'pointer' }}>Cancel</button>
          <button
            onClick={() => { onSelect(selSeed); onClose(); toast.success('Avatar updated!'); }}
            style={{ padding:'8px 18px', fontSize:13, fontWeight:600, border:'none', borderRadius:8, backgroundColor:'#0EA5E9', color:'#fff', cursor:'pointer' }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
function VoiceModal({ onClose }: { onClose:()=>void }) {
  const [sel, setSel] = useState('Neutral');
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }}/>
      <div style={{ position:'relative', width:340, backgroundColor:'#fff', borderRadius:16, padding:24, boxShadow:'0 24px 64px rgba(0,0,0,0.18)' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A', marginBottom:4 }}>Select Voice</div>
        <div style={{ fontSize:13, color:'#94A3B8', marginBottom:20 }}>Choose how this agent communicates</div>
        <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:20 }}>
          {['Neutral','Professional','Friendly','Formal'].map(v => (
            <div key={v} onClick={()=>setSel(v)} style={{ padding:'12px 16px', border:`1px solid ${sel===v?'#0EA5E9':'#E2E8F0'}`, borderRadius:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'space-between', backgroundColor:sel===v?'#F0F9FF':'#fff' }}>
              <div><div style={{ fontSize:14, fontWeight:600, color:'#0F172A' }}>{v}</div><div style={{ fontSize:12, color:'#94A3B8', marginTop:1 }}>{v==='Neutral'?'Balanced and clear':v==='Professional'?'Formal and precise':v==='Friendly'?'Warm and approachable':'Structured and authoritative'}</div></div>
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
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }}/>
      <div style={{ position:'relative', width:320, backgroundColor:'#fff', borderRadius:16, padding:32, boxShadow:'0 24px 64px rgba(0,0,0,0.18)', textAlign:'center' }}>
        <button onClick={onClose} style={{ position:'absolute', top:14, right:14, background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        <AgentAvatar agent={agent} size={52}/>
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
  const MOCK_RESPONSES = ["I'm monitoring all assigned controls and suppliers in real-time. Anything specific to investigate?","I've detected 2 anomalies in the last 24 hours. Would you like a detailed report?","Running analysis now... I'll have results shortly.","All systems are operating within normal parameters."];
  const [msgs, setMsgs] = useState([
    { from:'agent' as const, text:`Hello! I'm ${agent.name}. I'm monitoring ${agent.controls} controls and ${agent.suppliers} suppliers. How can I help?` },
    { from:'user' as const, text:'Show me the latest alerts' },
    { from:'agent' as const, text:`Found 2 alerts in the last 24 hours. XYZ Corporation has a missing data event and GHI Technologies assessment is overdue.` },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);
  const send = () => { if(!input.trim()) return; setMsgs(m=>[...m,{from:'user',text:input.trim()}]); setInput(''); setTimeout(()=>setMsgs(m=>[...m,{from:'agent',text:MOCK_RESPONSES[Math.floor(Math.random()*MOCK_RESPONSES.length)]}]),800); };
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:'smooth'}); },[msgs]);
  return (
    <div style={{ position:'fixed', inset:0, zIndex:600, display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div onClick={onClose} style={{ position:'absolute', inset:0, backgroundColor:'rgba(0,0,0,0.4)' }}/>
      <div style={{ position:'relative', width:420, height:540, backgroundColor:'#fff', borderRadius:16, display:'flex', flexDirection:'column', boxShadow:'0 24px 64px rgba(0,0,0,0.18)', overflow:'hidden' }}>
        <div style={{ padding:'14px 18px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', gap:10 }}>
          <AgentAvatar agent={agent} size={36}/><div style={{ flex:1 }}><div style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>{agent.name}</div><div style={{ display:'flex', alignItems:'center', gap:4, marginTop:1 }}><div style={{ width:6, height:6, borderRadius:'50%', backgroundColor:'#10B981' }}/><span style={{ fontSize:11, color:'#10B981' }}>Online</span></div></div>
          <button onClick={onClose} style={{ background:'none', border:'none', cursor:'pointer', color:'#94A3B8' }}><X size={18}/></button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'16px', backgroundColor:'#F8FAFC', display:'flex', flexDirection:'column', gap:10 }}>
          {msgs.map((m,i) => (
            <div key={i} style={{ display:'flex', justifyContent:m.from==='user'?'flex-end':'flex-start' }}>
              {m.from==='agent' && <AgentAvatar agent={agent} size={28}/>}
              <div style={{ maxWidth:'75%', padding:'10px 14px', borderRadius:12, fontSize:13, lineHeight:1.5, marginLeft:m.from==='agent'?8:0, backgroundColor:m.from==='user'?'#0EA5E9':'#fff', color:m.from==='user'?'#fff':'#334155', border:m.from==='agent'?'1px solid #E2E8F0':'none' }}>{m.text}</div>
            </div>
          ))}
          <div ref={bottomRef}/>
        </div>
        <div style={{ padding:'12px 14px', borderTop:'1px solid #E2E8F0', display:'flex', gap:8 }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')send();}} placeholder="Type a message..." style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:8, padding:'8px 12px', fontSize:13, outline:'none', color:'#334155' }}/>
          <button onClick={send} style={{ width:38, height:38, backgroundColor:'#0EA5E9', border:'none', borderRadius:8, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><Send size={15} color="#fff"/></button>
        </div>
      </div>
    </div>
  );
}

/* ─── Log UI helpers ─────────────────────────────────────── */
function ReasoningEntry({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const style = LOG_STYLE[entry.type];
  return (
    <div style={{ backgroundColor:style.bg, border:`1px solid ${style.color}30`, borderRadius:8, padding:'10px 14px', marginBottom:6 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, cursor:entry.detail?'pointer':'default' }} onClick={()=>entry.detail&&setExpanded(e=>!e)}>
        <Brain size={13} color={style.color}/>
        <span style={{ fontSize:11, fontWeight:700, color:style.color, letterSpacing:'0.06em' }}>{style.label}</span>
        <span style={{ fontSize:11, color:'#94A3B8', marginLeft:'auto' }}>{entry.time}</span>
        {entry.detail && <span style={{ color:style.color }}>{expanded?<ChevronDown size={12}/>:<ChevronRight size={12}/>}</span>}
      </div>
      <div style={{ fontSize:13, color:'#334155', marginTop:4, fontWeight:500 }}>{entry.message}</div>
      {expanded && entry.detail && <div style={{ marginTop:8, padding:'8px 12px', backgroundColor:'#fff', borderRadius:6, fontSize:12, color:'#64748B', lineHeight:1.6, borderLeft:`3px solid ${style.color}` }}>{entry.detail}</div>}
    </div>
  );
}
function LogRow({ entry }: { entry: LogEntry }) {
  if (entry.type==='reasoning') return <ReasoningEntry entry={entry}/>;
  const style = LOG_STYLE[entry.type];
  return (
    <div style={{ display:'flex', alignItems:'flex-start', gap:10, padding:'7px 0', borderBottom:'1px solid #F8FAFC' }}>
      <span style={{ fontSize:10, color:'#94A3B8', fontFamily:'monospace', flexShrink:0, marginTop:2, minWidth:56 }}>{entry.time}</span>
      <span style={{ fontSize:10, fontWeight:700, color:style.color, backgroundColor:style.bg, padding:'1px 6px', borderRadius:4, flexShrink:0, marginTop:1, minWidth:46, textAlign:'center' }}>{style.label}</span>
      <span style={{ fontSize:13, color:'#334155', flex:1 }}>{entry.message}</span>
    </div>
  );
}

/* ─── Task Row ───────────────────────────────────────────── */
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = { High:{color:'#EF4444',bg:'#FEF2F2',border:'#FECACA'}, Medium:{color:'#F59E0B',bg:'#FFFBEB',border:'#FDE68A'}, Low:{color:'#10B981',bg:'#ECFDF5',border:'#A7F3D0'} }[priority];
  return <span style={{ fontSize:10, fontWeight:700, color:cfg.color, backgroundColor:cfg.bg, border:`1px solid ${cfg.border}`, padding:'2px 8px', borderRadius:20 }}>{priority}</span>;
}
function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = { 'Open':{color:'#64748B',bg:'#F1F5F9',border:'#CBD5E1'}, 'In Progress':{color:'#0EA5E9',bg:'#EFF6FF',border:'#BAE6FD'}, 'Resolved':{color:'#10B981',bg:'#ECFDF5',border:'#A7F3D0'} }[status];
  return <span style={{ fontSize:10, fontWeight:600, color:cfg.color, backgroundColor:cfg.bg, border:`1px solid ${cfg.border}`, padding:'2px 8px', borderRadius:20 }}>{status}</span>;
}
function TaskRow({ task, agentColor }: { task: AgentTask; agentColor: string }) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status);
  return (
    <div style={{ border:'1px solid #E2E8F0', borderRadius:10, padding:'14px 16px', backgroundColor:'#fff', marginBottom:10 }}>
      <div style={{ display:'flex', alignItems:'flex-start', gap:10, flexWrap:'wrap' }}>
        <div style={{ flex:1, minWidth:200 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4, flexWrap:'wrap' }}>
            <span style={{ fontSize:13, fontWeight:700, color:'#0F172A' }}>{task.title}</span>
            <PriorityBadge priority={task.priority}/><StatusBadge status={localStatus}/>
          </div>
          <div style={{ fontSize:12, color:'#64748B', marginBottom:4 }}>{task.description}</div>
          <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontSize:11, color:'#8B5CF6', backgroundColor:'#F5F3FF', padding:'2px 8px', borderRadius:10, fontWeight:500 }}>{task.supplier}</span>
            {task.assignee?<span style={{ fontSize:11, color:'#64748B', display:'flex', alignItems:'center', gap:4 }}><UserCheck size={11}/>{task.assignee}</span>:<span style={{ fontSize:11, color:'#94A3B8', fontStyle:'italic' }}>Unassigned</span>}
            <span style={{ fontSize:11, color:'#94A3B8', display:'flex', alignItems:'center', gap:4 }}><CalendarCheck size={11}/>Due {task.dueDate}</span>
          </div>
        </div>
        <div style={{ display:'flex', gap:6, flexShrink:0, flexWrap:'wrap' }}>
          {localStatus!=='In Progress'&&localStatus!=='Resolved'&&<button onClick={()=>setLocalStatus('In Progress')} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:7, border:'1px solid #BAE6FD', backgroundColor:'#EFF6FF', color:'#0EA5E9', cursor:'pointer' }}>Assign</button>}
          {localStatus!=='Resolved'&&<button onClick={()=>setLocalStatus('Resolved')} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:7, border:'1px solid #A7F3D0', backgroundColor:'#ECFDF5', color:'#10B981', cursor:'pointer' }}>Resolve</button>}
          <button style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:7, border:'1px solid #FECACA', backgroundColor:'#FEF2F2', color:'#EF4444', cursor:'pointer' }}>Escalate</button>
          <button onClick={()=>setShowComment(v=>!v)} style={{ fontSize:11, fontWeight:600, padding:'5px 12px', borderRadius:7, border:'1px solid #E2E8F0', backgroundColor:'#F8FAFC', color:'#64748B', cursor:'pointer', display:'flex', alignItems:'center', gap:4 }}><MessageSquare size={11}/> Comment</button>
        </div>
      </div>
      {showComment && (
        <div style={{ marginTop:12, display:'flex', gap:8 }}>
          <input value={comment} onChange={e=>setComment(e.target.value)} placeholder="Add a comment..." style={{ flex:1, border:'1px solid #E2E8F0', borderRadius:7, padding:'7px 12px', fontSize:12, outline:'none', color:'#334155' }}/>
          <button onClick={()=>{setComment('');setShowComment(false);}} style={{ padding:'7px 14px', borderRadius:7, border:'none', backgroundColor:agentColor, color:'#fff', fontSize:12, fontWeight:600, cursor:'pointer', display:'flex', alignItems:'center', gap:5 }}><SendIcon size={11}/> Send</button>
        </div>
      )}
    </div>
  );
}

/* ─── Timeline Item ──────────────────────────────────────── */
function TimelineItem({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const cfg = { alert:{dot:'#EF4444'}, warning:{dot:'#F59E0B'}, success:{dot:'#10B981'}, info:{dot:'#0EA5E9'} }[entry.status];
  return (
    <div style={{ display:'flex', gap:12, marginBottom:isLast?0:16, position:'relative' }}>
      {!isLast && <div style={{ position:'absolute', left:7, top:20, bottom:-16, width:1, backgroundColor:'#E2E8F0', zIndex:0 }}/>}
      <div style={{ width:15, height:15, borderRadius:'50%', backgroundColor:cfg.dot, flexShrink:0, marginTop:2, zIndex:1, border:'2px solid #fff', boxShadow:`0 0 0 2px ${cfg.dot}33` }}/>
      <div style={{ flex:1 }}>
        <div style={{ fontSize:11, color:'#94A3B8', fontFamily:'monospace', marginBottom:2 }}>{entry.time}</div>
        <div style={{ fontSize:13, color:'#334155', lineHeight:1.4 }}>{entry.event}</div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RICH AGENT DETAIL VIEW
══════════════════════════════════════════════════════════════ */
function AgentDetail({ agent, onBack, onUpdateAgent }: { agent:Agent; onBack:()=>void; onUpdateAgent:(a:Agent)=>void }) {
  const feedRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<LogEntry[]>(() => buildInitialLogs(agent.id));
  const [streamIdx, setStreamIdx] = useState(0);
  const [pulse, setPulse] = useState(true);
  const [taskFilter, setTaskFilter] = useState<TaskStatus|'All'>('All');
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [detailModal, setDetailModal] = useState<null|'picture'|'voice'|'talk'|'chat'>(null);

  const agentColor  = agent.color || '#0EA5E9';
  const agentRole   = agent.role  || 'AI Agent';
  const tasks       = AGENT_TASKS[agent.id] || [];
  const timeline    = AGENT_TIMELINE[agent.id] || [];
  const filteredTasks = taskFilter==='All' ? tasks : tasks.filter(t=>t.status===taskFilter);
  const openCount   = tasks.filter(t=>t.status==='Open').length;
  const inProgressCount = tasks.filter(t=>t.status==='In Progress').length;
  const [stageBg, stageClr] = STAGE_CLR[agent.stage];

  const isActive = agent.status === 'live' || agent.status === 'active';

  useEffect(() => { if(feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, [logs]);
  useEffect(() => {
    if(!isActive) return;
    const queue = STREAM_QUEUES[agent.id] || [];
    if(!queue.length) return;
    const interval = setInterval(() => {
      setStreamIdx(prev => {
        const idx = prev % queue.length;
        const entry = queue[idx];
        const now = new Date();
        setLogs(l => [...l, { ...entry, id:`live_${Date.now()}_${idx}`, time:now.toTimeString().slice(0,8) }]);
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [agent.id, isActive]);
  useEffect(() => {
    if(!isActive) return;
    const t = setInterval(() => setPulse(p=>!p), 800);
    return () => clearInterval(t);
  }, [isActive]);

  const actionCards = [
    { key:'picture', icon:<ImageIcon size={20} color="#0EA5E9"/>, iconBg:'#EFF6FF', title:'Select Picture', sub:"Change the agent's avatar" },
    { key:'voice',   icon:<Mic size={20} color="#8B5CF6"/>,       iconBg:'#F5F3FF', title:'Select Voice',   sub:'Choose how this agent speaks' },
    { key:'talk',    icon:<Volume2 size={20} color="#10B981"/>,    iconBg:'#ECFDF5', title:'Talk to Agent',  sub:'Speak directly with this agent' },
    { key:'chat',    icon:<MessageSquare size={20} color="#F59E0B"/>, iconBg:'#FFF7ED', title:'Start Chat',  sub:'Open chat interface with agent' },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', minHeight:'100%' }}>
      {/* Top nav bar */}
      <div style={{ backgroundColor:'#fff', borderBottom:'1px solid #E2E8F0', padding:'14px 24px', display:'flex', alignItems:'center', gap:12, flexShrink:0 }}>
        <button onClick={onBack} style={{ display:'flex', alignItems:'center', gap:4, background:'none', border:'none', cursor:'pointer', color:'#64748B', fontSize:14, padding:'6px 10px', borderRadius:8 }}>
          <ChevronLeft size={18}/> Back to Agents
        </button>
        <span style={{ color:'#E2E8F0' }}>|</span>
        <div style={{ fontSize:18, fontWeight:700, color:'#0F172A' }}>{agent.name}</div>
        <span style={{ backgroundColor:STATUS_CLR[agent.status]+'22', color:STATUS_CLR[agent.status], fontSize:12, fontWeight:600, padding:'3px 10px', borderRadius:20 }}>{STATUS_LABEL[agent.status]}</span>
      </div>

      <div style={{ flex:1, overflowY:'auto', padding:'24px' }}>

        {/* ── 1. AGENT PROFILE HEADER ── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:14, padding:'24px', marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ display:'flex', alignItems:'center', gap:20, flexWrap:'wrap' }}>
            {/* DiceBear avatar */}
            <div style={{ position:'relative', flexShrink:0 }}>
              <img
                src={`https://api.dicebear.com/7.x/personas/svg?seed=${agent.avatarSeed||agent.initials}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`}
                alt={agent.name}
                width={72} height={72}
                style={{ borderRadius:'50%', border:`3px solid ${agentColor}40`, backgroundColor:'#F1F5F9', display:'block' }}
              />
              <div style={{ position:'absolute', bottom:2, right:2, width:14, height:14, borderRadius:'50%', backgroundColor:STATUS_CLR[agent.status], border:'2px solid #fff', opacity:isActive?(pulse?1:0.4):1, transition:'opacity 0.3s' }}/>
            </div>
            <div style={{ flex:1, minWidth:180 }}>
              <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap', marginBottom:2 }}>
                <h1 style={{ fontSize:22, fontWeight:700, color:'#0F172A', margin:0 }}>{agent.name}</h1>
                <div style={{ display:'flex', alignItems:'center', gap:5, backgroundColor:isActive?'#ECFDF5':'#F1F5F9', padding:'4px 10px', borderRadius:20, border:`1px solid ${isActive?'#A7F3D0':'#E2E8F0'}` }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', backgroundColor:STATUS_CLR[agent.status], opacity:isActive?(pulse?1:0.3):1, transition:'opacity 0.3s' }}/>
                  <span style={{ fontSize:12, fontWeight:600, color:STATUS_CLR[agent.status] }}>{isActive?'LIVE':'IDLE'}</span>
                </div>
              </div>
              <div style={{ fontSize:13, color:'#64748B', marginBottom:3 }}>{agentRole}</div>
              <div style={{ fontSize:12, color:'#94A3B8' }}>{agent.controls} controls · {agent.suppliers} suppliers · Division: {agent.division}</div>
            </div>
            <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
              {[
                { label:'UPTIME', value:agent.uptime||'—', color:'#0EA5E9', bg:'#F8FAFC', border:'#E2E8F0' },
                { label:'ALERTS', value:String(agent.alerts), color:agent.alerts>0?'#F59E0B':'#94A3B8', bg:agent.alerts>0?'#FFFBEB':'#F8FAFC', border:agent.alerts>0?'#FDE68A':'#E2E8F0' },
                { label:'NEXT EVAL', value:agent.nextEval||'—', color:'#6366F1', bg:'#F8FAFC', border:'#E2E8F0' },
              ].map(s => (
                <div key={s.label} style={{ textAlign:'center', padding:'8px 14px', backgroundColor:s.bg, borderRadius:10, border:`1px solid ${s.border}` }}>
                  <div style={{ fontSize:18, fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:10, color:'#94A3B8', fontWeight:600, letterSpacing:'0.04em' }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Current task bar */}
          <div style={{ marginTop:16, backgroundColor:`${agentColor}0A`, border:`1px solid ${agentColor}30`, borderRadius:8, padding:'10px 14px', display:'flex', alignItems:'center', gap:8 }}>
            <Activity size={13} color={agentColor}/>
            <span style={{ fontSize:11, fontWeight:700, color:agentColor, textTransform:'uppercase', letterSpacing:'0.07em', flexShrink:0 }}>Currently</span>
            <span style={{ fontSize:13, color:'#334155' }}>{agent.currentTask||agent.division}</span>
          </div>
          {/* Truth match */}
          {agent.truthMatch !== undefined && (
            <div style={{ marginTop:12, display:'inline-flex', alignItems:'center', gap:8, backgroundColor:agent.truthMatch===100?'#ECFDF5':agent.truthMatch>=50?'#FFFBEB':'#FEF2F2', border:`1px solid ${agent.truthMatch===100?'#A7F3D0':agent.truthMatch>=50?'#FDE68A':'#FECACA'}`, borderRadius:20, padding:'5px 14px' }}>
              {agent.truthMatch===100?<CheckCircle2 size={13} color="#10B981"/>:agent.truthMatch>=50?<AlertTriangle size={13} color="#F59E0B"/>:<AlertCircle size={13} color="#EF4444"/>}
              <span style={{ fontSize:12, fontWeight:600, color:agent.truthMatch===100?'#059669':agent.truthMatch>=50?'#92400E':'#DC2626' }}>Truth Match: {agent.truthMatch}%</span>
            </div>
          )}
        </div>

        {/* ── 2. AGENT OVERVIEW ── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'16px 20px', marginBottom:16, boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
          <div style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.07em', marginBottom:14, display:'flex', alignItems:'center', gap:6 }}>
            <BarChart2 size={14} color="#6366F1"/> Agent Overview
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:10 }}>
            {[
              { label:'Suppliers Monitored', value:agent.suppliers, icon:<Users size={16} color="#8B5CF6"/>, color:'#8B5CF6', bg:'#F5F3FF' },
              { label:'Controls Active',     value:agent.controls,  icon:<Shield size={16} color="#0EA5E9"/>, color:'#0EA5E9', bg:'#EFF6FF' },
              { label:'Open Alerts',         value:agent.alerts,    icon:<Bell size={16} color={agent.alerts>0?'#F59E0B':'#94A3B8'}/>, color:agent.alerts>0?'#F59E0B':'#94A3B8', bg:agent.alerts>0?'#FFFBEB':'#F8FAFC' },
              { label:'Open Tasks',          value:openCount+inProgressCount, icon:<FileText size={16} color={openCount>0?'#EF4444':'#10B981'}/>, color:openCount>0?'#EF4444':'#10B981', bg:openCount>0?'#FEF2F2':'#ECFDF5' },
              { label:'Last Scan',           value:agent.lastScan||'—', icon:<Clock size={16} color="#6366F1"/>, color:'#6366F1', bg:'#EEF2FF' },
            ].map(m => (
              <div key={m.label} style={{ backgroundColor:m.bg, borderRadius:10, padding:'12px 14px', display:'flex', flexDirection:'column', gap:6 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}>{m.icon}<span style={{ fontSize:10, fontWeight:600, color:'#94A3B8', textTransform:'uppercase', letterSpacing:'0.05em' }}>{m.label}</span></div>
                <div style={{ fontSize:22, fontWeight:800, color:m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAKEHOLDER MAP ── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
            <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#0EA5E9', animation:'ping 1.4s ease infinite', opacity:0.7 }}/>
            <span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Stakeholder Communication Map</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr auto 1fr', gap:0, alignItems:'center' }}>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#0EA5E9', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4 }}>Internal</div>
              {[agent.internalSPOC||'priya@abc.co', ...(agent.id==='a1'?['raj@abc.co']:agent.id==='a3'?['anita@abc.co']:[])].filter(Boolean).map((email, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, border:'1px solid #BAE6FD', backgroundColor:'#EFF6FF' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#0EA5E9,#6366F1)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700, flexShrink:0 }}>{email.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontSize:11, fontWeight:500, color:'#0369A1', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{email}</span>
                </div>
              ))}
            </div>
            <div style={{ width:80, height:80, flexShrink:0 }}>
              <svg width={80} height={80} style={{ overflow:'visible' }}>
                <line x1={10} y1={20} x2={70} y2={20} stroke="#0EA5E9" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
                <line x1={10} y1={40} x2={70} y2={40} stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
                <line x1={70} y1={60} x2={10} y2={60} stroke="#10B981" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5}/>
                <circle cx={40} cy={40} r={14} fill="#fff" stroke="#E2E8F0" strokeWidth={1}/>
                <text x={40} y={44} textAnchor="middle" fontSize={8} fill="#94A3B8" fontWeight={700}>AI</text>
              </svg>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              <div style={{ fontSize:10, fontWeight:700, color:'#8B5CF6', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:4, textAlign:'right' }}>Supplier</div>
              {[agent.externalSPOC||'john@xyz.com', ...(agent.id==='a2'?['ops@abc.com']:agent.id==='a3'?['info@def.com']:[])].filter(Boolean).map((email, i) => (
                <div key={i} style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 10px', borderRadius:8, border:'1px solid #DDD6FE', backgroundColor:'#F5F3FF', flexDirection:'row-reverse' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'linear-gradient(135deg,#8B5CF6,#EC4899)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontSize:8, fontWeight:700, flexShrink:0 }}>{email.slice(0,2).toUpperCase()}</div>
                  <span style={{ fontSize:11, fontWeight:500, color:'#6D28D9', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', textAlign:'right' }}>{email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROCESS INTELLIGENCE ── */}
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, marginBottom:16 }}>
          <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:14 }}>Process Intelligence Summary</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
            {[
              { label:'Last SOW Signed',      value:agent.id==='a1'?'Feb 10, 2026':agent.id==='a2'?'Jan 22, 2026':'Dec 5, 2025', icon:'📄', color:'#0EA5E9', bg:'#EFF6FF' },
              { label:'Last Payment Detected', value:agent.id==='a1'?'₹10L · Feb 28':agent.id==='a2'?'₹4.2L · Feb 20':'₹18L · Jan 15', icon:'₹', color:'#10B981', bg:'#ECFDF5' },
              { label:'Last Escalation',       value:agent.id==='a1'?'Mar 1, 2026':agent.id==='a2'?'None detected':'Feb 27, 2026', icon:'⚡', color:'#F59E0B', bg:'#FFFBEB' },
              { label:'Active Risks',          value:agent.alerts>0?`${agent.alerts} open alert${agent.alerts>1?'s':''}`:'None detected', icon:'!', color:agent.alerts>0?'#EF4444':'#10B981', bg:agent.alerts>0?'#FEF2F2':'#ECFDF5' },
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

        {/* ── MAIN LAYOUT: LEFT + RIGHT ── */}
        <div style={{ display:'grid', gridTemplateColumns:'300px 1fr', gap:16, alignItems:'start' }}>

          {/* LEFT */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>

            {/* Suppliers */}
            <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}><Eye size={16} color="#0EA5E9"/><span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Suppliers Monitored</span></div>
                <span style={{ backgroundColor:'#EFF6FF', color:'#0EA5E9', fontSize:11, padding:'2px 8px', borderRadius:20 }}>{agent.suppliers}</span>
              </div>
              {(agent.id==='a1'?[
                { name:'XYZ Corporation', stage:'Acquisition', dot:'#0EA5E9', status:'flowing' },
                { name:'GHI Technologies', stage:'Acquisition', dot:'#0EA5E9', status:'alert' },
              ]:agent.id==='a2'?[
                { name:'ABC Services Ltd', stage:'Retention', dot:'#10B981', status:'flowing' },
                { name:'JKL Consultancy', stage:'Retention', dot:'#10B981', status:'flowing' },
                { name:'MNO Partners', stage:'Retention', dot:'#10B981', status:'pending' },
              ]:[
                { name:'DEF Limited', stage:'Upgradation', dot:'#F59E0B', status:'alert' },
              ]).map((sup,i,arr) => (
                <div key={sup.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none' }}>
                  <div>
                    <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:3 }}><span style={{ width:8, height:8, borderRadius:'50%', backgroundColor:sup.dot, display:'inline-block', flexShrink:0 }}/><span style={{ fontSize:13, fontWeight:600, color:'#334155' }}>{sup.name}</span></div>
                    <span style={{ fontSize:10, color:'#94A3B8', paddingLeft:14 }}>{sup.stage}</span>
                  </div>
                  {sup.status==='flowing'&&<span style={{ backgroundColor:'#ECFDF5', color:'#10B981', fontSize:11, padding:'2px 8px', borderRadius:20 }}>Flowing</span>}
                  {sup.status==='alert'  &&<span style={{ backgroundColor:'#FEF2F2', color:'#EF4444', fontSize:11, padding:'2px 8px', borderRadius:20 }}>Alert</span>}
                  {sup.status==='pending'&&<span style={{ backgroundColor:'#FFFBEB', color:'#F59E0B', fontSize:11, padding:'2px 8px', borderRadius:20 }}>Pending</span>}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20 }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:12 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}><ShieldCheck size={16} color="#8B5CF6"/><span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Controls Enforced</span></div>
                <span style={{ backgroundColor:'#F5F3FF', color:'#8B5CF6', fontSize:11, padding:'2px 8px', borderRadius:20 }}>{agent.controls}</span>
              </div>
              {(agent.id==='a1'?[
                { name:'Contractual Obligation Review', cat:'Process', result:'issue' },
                { name:'SOW Signature Verification',   cat:'Document', result:'passing' },
                { name:'Invoice Approval Workflow',    cat:'Process', result:'passing' },
                { name:'ISO 27001 Certificate Review', cat:'Document', result:'warn' },
              ]:agent.id==='a2'?[
                { name:'SLA Adherence Policy',         cat:'Process',  result:'passing' },
                { name:'Supplier Onboarding Checklist',cat:'Process',  result:'passing' },
                { name:'Data Processing Agreement',    cat:'Document', result:'issue' },
              ]:[
                { name:'Network Segmentation', cat:'Technical', result:'failed' },
                { name:'Patch Management', cat:'Process', result:'issue' },
                { name:'Vulnerability Scanning', cat:'Technical', result:'passing' },
                { name:'Privileged Access Mgmt', cat:'Technical', result:'passing' },
              ]).map((ctrl,i,arr) => (
                <div key={ctrl.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none' }}>
                  <div><div style={{ fontSize:13, fontWeight:600, color:'#334155', marginBottom:3 }}>{ctrl.name}</div><span style={{ fontSize:10, color:'#94A3B8' }}>{ctrl.cat}</span></div>
                  {ctrl.result==='passing'&&<span style={{ display:'inline-flex', alignItems:'center', gap:4, backgroundColor:'#ECFDF5', color:'#10B981', fontSize:11, padding:'2px 8px', borderRadius:20 }}><CheckCircle2 size={12}/>Passing</span>}
                  {ctrl.result==='issue'  &&<span style={{ display:'inline-flex', alignItems:'center', gap:4, backgroundColor:'#FFFBEB', color:'#F59E0B', fontSize:11, padding:'2px 8px', borderRadius:20 }}><AlertTriangle size={12}/>1 Issue</span>}
                  {ctrl.result==='failed' &&<span style={{ display:'inline-flex', alignItems:'center', gap:4, backgroundColor:'#FEF2F2', color:'#EF4444', fontSize:11, padding:'2px 8px', borderRadius:20 }}><XCircle size={12}/>Failed</span>}
                </div>
              ))}
            </div>

            {/* Activity Timeline */}
            <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'16px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:timelineCollapsed?0:14, cursor:'pointer' }} onClick={()=>setTimelineCollapsed(v=>!v)}>
                <GitMerge size={14} color="#6366F1"/>
                <span style={{ fontSize:11, fontWeight:700, color:'#64748B', textTransform:'uppercase', letterSpacing:'0.08em', flex:1 }}>Activity Timeline</span>
                {timelineCollapsed?<ChevronDown size={13} color="#94A3B8"/>:<ChevronUp size={13} color="#94A3B8"/>}
              </div>
              {!timelineCollapsed && (
                <div>
                  {timeline.map((entry, idx) => <TimelineItem key={entry.id} entry={entry} isLast={idx===timeline.length-1}/>)}
                  {timeline.length===0 && <span style={{ fontSize:12, color:'#94A3B8' }}>No timeline entries</span>}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div style={{ display:'flex', flexDirection:'column', gap:16 }}>

            {/* Agent Tasks */}
            <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:14, boxShadow:'0 1px 3px rgba(0,0,0,0.06)', overflow:'hidden' }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <Flag size={15} color="#EF4444"/>
                  <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Agent Tasks</span>
                  {tasks.length>0 && <span style={{ fontSize:11, fontWeight:700, color:'#fff', backgroundColor:'#EF4444', padding:'1px 8px', borderRadius:20 }}>{tasks.length}</span>}
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  {(['All','Open','In Progress','Resolved'] as const).map(f => (
                    <button key={f} onClick={()=>setTaskFilter(f as TaskStatus|'All')} style={{ fontSize:11, fontWeight:600, padding:'4px 12px', borderRadius:20, cursor:'pointer', backgroundColor:taskFilter===f?agentColor:'#F8FAFC', color:taskFilter===f?'#fff':'#64748B', border:`1px solid ${taskFilter===f?agentColor:'#E2E8F0'}` }}>{f}</button>
                  ))}
                </div>
              </div>
              <div style={{ padding:'16px 20px' }}>
                {filteredTasks.length===0 ? (
                  <div style={{ textAlign:'center', padding:'32px', color:'#94A3B8', fontSize:13 }}>
                    <CheckCircle2 size={32} color="#A7F3D0" style={{ display:'block', margin:'0 auto 8px' }}/>
                    No {taskFilter!=='All'?taskFilter.toLowerCase()+' ':''}tasks for this agent
                  </div>
                ) : filteredTasks.map(task => <TaskRow key={task.id} task={task} agentColor={agentColor}/>)}
              </div>
            </div>

            {/* Agent Reasoning */}
            <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden' }}>
              <div style={{ padding:'14px 16px', borderBottom:'1px solid #F8FAFC', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}><Cpu size={16} color="#0EA5E9"/><span style={{ fontSize:14, fontWeight:700, color:'#0F172A' }}>Agent Reasoning</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                  <span style={{ position:'relative', display:'inline-flex', width:8, height:8 }}><span style={{ position:'absolute', inset:0, borderRadius:'50%', backgroundColor:'#10B981', opacity:0.5, animation:'ping 1.4s ease infinite' }}/><span style={{ position:'relative', width:8, height:8, borderRadius:'50%', backgroundColor:'#10B981', display:'block' }}/></span>
                  <span style={{ fontSize:12, color:'#10B981' }}>Live</span>
                </div>
              </div>
              {(agent.id==='a1'?[
                { time:'2 min ago',  action:'SOW Verification',          trigger:'XYZ Corporation',  reasoning:`Cross-referenced SOW signature date (Feb 10) against service start date (Feb 5) from ${agent.internalSPOC} emails. SOW signed after service began — Contractual Risk flagged.`, confidence:'91%', outcome:'alert' },
                { time:'15 min ago', action:'Invoice Approval Check',    trigger:'XYZ Corporation',  reasoning:`Payment of ₹10L detected in bank feed. No corresponding PO approval found in email chain between ${agent.internalSPOC} and ${agent.externalSPOC}. Anomaly: Unapproved Payment.`, confidence:'88%', outcome:'alert' },
                { time:'40 min ago', action:'Contractual Obligation Review', trigger:'GHI Technologies', reasoning:'Reviewed active obligations in contract. 2 of 5 deliverables overdue by 12+ days. SLA breach threshold crossed. Escalation email sent to Risk Manager.', confidence:'96%', outcome:'warn' },
                { time:'1 hr ago',   action:'ISO 27001 Cert Expiry',     trigger:'XYZ Corporation',  reasoning:'Pulled certificate expiry date from document store. ISO 27001 cert expires in 22 days. Auto-renewal reminder dispatched to supplier contact.', confidence:'97%', outcome:'warn' },
                { time:'3 hrs ago',  action:'Supplier Onboarding Check', trigger:'GHI Technologies', reasoning:'Onboarding checklist reviewed. Items 4 (DPA signed) and 7 (BCP submitted) not completed. Checklist 71% complete. Flagged for follow-up.', confidence:'85%', outcome:'warn' },
                { time:'5 hrs ago',  action:'Third-Party Risk Assessment', trigger:'XYZ Corporation', reasoning:'Annual TPRA due date passed 8 days ago. No updated risk assessment received. Reminder escalated to Compliance Officer.', confidence:'99%', outcome:'alert' },
              ]:agent.id==='a2'?[
                { time:'8 min ago',  action:'SLA Adherence Check',       trigger:'ABC Services Ltd', reasoning:'SLA report for Feb 2026 reviewed. Uptime reported at 98.1% vs contracted 99.5%. Breach of 1.4%. Penalty clause applicable. Ticket raised.', confidence:'97%', outcome:'alert' },
                { time:'30 min ago', action:'Invoice Approval Workflow',  trigger:'MNO Partners',     reasoning:'Invoice INV-20260228 (₹4.2L) submitted. Verified PO approval in email thread. Finance sign-off confirmed. Workflow complete, no anomalies.', confidence:'99%', outcome:'check' },
                { time:'1 hr ago',   action:'DPA Compliance Check',      trigger:'JKL Consultancy',  reasoning:'Data Processing Agreement reviewed. Article 28 obligations assessed. DPA signed Jan 2026 but missing sub-processor annex. 1 issue flagged for legal.', confidence:'90%', outcome:'warn' },
                { time:'2 hrs ago',  action:'Access Revocation on Exit', trigger:'ABC Services Ltd', reasoning:'Cross-checked HR offboarding log against supplier contact list. 1 contact (mark@abc-services.com) departed Feb 15 — access not yet revoked. Action triggered.', confidence:'94%', outcome:'alert' },
                { time:'4 hrs ago',  action:'Supplier Onboarding Review', trigger:'MNO Partners',    reasoning:'Onboarding checklist for MNO Partners at 60% completion. Missing: BCP document and proof of cyber insurance. Automated reminder sent.', confidence:'88%', outcome:'warn' },
              ]:[
                { time:'just now', action:'Network Check', trigger:'DEF Limited', reasoning:'Network segmentation control evaluated. DMZ configuration missing. Control marked Failed.', confidence:'92%', outcome:'alert' },
                { time:'20 min ago', action:'Patch Status', trigger:'DEF Limited', reasoning:'Last patch applied 45 days ago. SLA requires 30 days. 1 issue flagged for review.', confidence:'89%', outcome:'warn' },
                { time:'2 hrs ago', action:'Vulnerability Scan', trigger:'DEF Limited', reasoning:'Automated scan results reviewed. 0 critical vulnerabilities. Scan coverage 100%.', confidence:'95%', outcome:'check' },
                { time:'4 hrs ago', action:'PAM Evaluation', trigger:'DEF Limited', reasoning:'Privileged access management controls evaluated. JIT access confirmed active.', confidence:'87%', outcome:'check' },
              ]).map((row, i, arr) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'12px 16px', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none' }}>
                  <div style={{ fontSize:11, color:'#94A3B8', width:70, flexShrink:0, paddingTop:2 }}>{row.time}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'#334155', marginBottom:3 }}><span style={{ fontWeight:600, color:'#0F172A' }}>{row.action}</span>{' · '}{row.trigger}</div>
                    <div style={{ fontSize:12, color:'#64748B', fontStyle:'italic', marginBottom:5, lineHeight:1.5 }}>{row.reasoning}</div>
                    <span style={{ fontSize:11, color:'#64748B', backgroundColor:'#F8FAFC', border:'1px solid #E2E8F0', padding:'2px 8px', borderRadius:20 }}>Confidence: {row.confidence}</span>
                  </div>
                  <div style={{ flexShrink:0, paddingTop:2 }}>
                    {row.outcome==='check'&&<CheckCircle2 size={16} color="#10B981"/>}
                    {row.outcome==='alert'&&<AlertCircle size={16} color="#EF4444"/>}
                    {row.outcome==='warn' &&<AlertTriangle size={16} color="#F59E0B"/>}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Activity Feed */}
            <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:14, display:'flex', flexDirection:'column', height:440 }}>
              <div style={{ padding:'16px 20px', borderBottom:'1px solid #E2E8F0', display:'flex', alignItems:'center', justifyContent:'space-between', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <Zap size={16} color="#F59E0B"/>
                  <span style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Activity Feed</span>
                  {isActive && <span style={{ fontSize:11, fontWeight:600, color:'#10B981', backgroundColor:'#ECFDF5', padding:'2px 8px', borderRadius:20, border:'1px solid #A7F3D0' }}>STREAMING LIVE</span>}
                </div>
                <span style={{ fontSize:12, color:'#94A3B8' }}>{logs.length} entries</span>
              </div>
              <div style={{ padding:'8px 20px', borderBottom:'1px solid #F1F5F9', display:'flex', gap:8, flexWrap:'wrap', flexShrink:0, backgroundColor:'#FAFAFA' }}>
                {Object.entries(LOG_STYLE).map(([type, s]) => <span key={type} style={{ fontSize:10, fontWeight:700, color:s.color, backgroundColor:s.bg, padding:'1px 7px', borderRadius:4 }}>{s.label}</span>)}
                <span style={{ fontSize:10, color:'#94A3B8', marginLeft:4 }}>· Click REASON to expand</span>
              </div>
              <div ref={feedRef} style={{ flex:1, overflowY:'auto', padding:'12px 20px' }}>
                {logs.map(entry => <LogRow key={entry.id} entry={entry}/>)}
                {isActive && <div style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 0', color:'#94A3B8' }}><div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:'#10B981', opacity:pulse?1:0, transition:'opacity 0.3s' }}/><span style={{ fontSize:12, fontFamily:'monospace' }}>Agent running...</span></div>}
              </div>
              <div style={{ padding:'14px 20px', borderTop:'1px solid #E2E8F0', backgroundColor:'#F8FAFC', flexShrink:0 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6 }}><Clock size={13} color="#6366F1"/><span style={{ fontSize:11, fontWeight:700, color:'#6366F1', textTransform:'uppercase', letterSpacing:'0.08em' }}>Planned Next Steps</span></div>
                <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                  {isActive?(<>
                    <span style={{ fontSize:12, color:'#334155', backgroundColor:'#EEF2FF', padding:'3px 10px', borderRadius:20, border:'1px solid #C7D2FE' }}>Re-evaluate controls ({agent.nextEval||'—'})</span>
                    <span style={{ fontSize:12, color:'#334155', backgroundColor:'#EEF2FF', padding:'3px 10px', borderRadius:20, border:'1px solid #C7D2FE' }}>Check supplier assessments</span>
                    <span style={{ fontSize:12, color:'#334155', backgroundColor:'#EEF2FF', padding:'3px 10px', borderRadius:20, border:'1px solid #C7D2FE' }}>Update audit log entries</span>
                  </>):<span style={{ fontSize:12, color:'#94A3B8' }}>Agent idle — next evaluation {agent.nextEval||'—'}</span>}
                </div>
              </div>
            </div>

            {/* Action cards */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {actionCards.map(ac => (
                <div key={ac.key} onClick={()=>setDetailModal(ac.key as any)} style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:20, cursor:'pointer', transition:'all 0.18s' }} className="hover:border-[#0EA5E9] hover:shadow-sm">
                  <div style={{ width:40, height:40, borderRadius:10, backgroundColor:ac.iconBg, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:10 }}>{ac.icon}</div>
                  <div style={{ fontSize:15, fontWeight:700, color:'#0F172A', marginBottom:3 }}>{ac.title}</div>
                  <div style={{ fontSize:13, color:'#94A3B8' }}>{ac.sub}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {detailModal==='picture' && <PictureModal agent={agent} onSelect={seed=>onUpdateAgent({...agent,avatarSeed:seed})} onClose={()=>setDetailModal(null)}/>}
      {detailModal==='voice'   && <VoiceModal onClose={()=>setDetailModal(null)}/>}
      {detailModal==='talk'    && <TalkModal agent={agent} onClose={()=>setDetailModal(null)}/>}
      {detailModal==='chat'    && <ChatModal agent={agent} onClose={()=>setDetailModal(null)}/>}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AGENTS DASHBOARD (LIST VIEW)
══════════════════════════════════════════════════════════════ */
export function Agents() {
  const location = useLocation();
  const [view, setView]                   = useState<'dashboard'|'detail'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent|null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [agents, setAgents]               = useState<Agent[]>(MOCK_AGENTS);

  useEffect(() => {
    if (location.state?.openCreateModal) { setShowCreate(true); setView('dashboard'); }
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
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:24, fontWeight:700, color:'#0F172A', margin:0 }}>Agents</h1>
          <p style={{ fontSize:13, color:'#94A3B8', margin:'4px 0 0' }}>Monitor and manage your AI agents</p>
        </div>
        <button onClick={()=>setShowCreate(true)} style={{ display:'flex', alignItems:'center', gap:6, backgroundColor:'#0EA5E9', color:'#fff', border:'none', borderRadius:8, padding:'9px 16px', fontSize:14, fontWeight:600, cursor:'pointer' }}>
          <Plus size={16}/> Create Agent
        </button>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:28 }}>
        {[
          { label:'Live',        count:liveCount,         color:'#10B981', indicator:<><span style={{ position:'relative', display:'inline-flex', width:10, height:10 }}><span style={{ position:'absolute', inset:0, borderRadius:'50%', backgroundColor:'#10B981', opacity:0.5, animation:'ping 1.4s ease infinite' }}/><span style={{ position:'relative', width:10, height:10, borderRadius:'50%', backgroundColor:'#10B981', display:'block' }}/></span></>, sub:null },
          { label:'Active',      count:activeCount,       color:'#0EA5E9', indicator:<span style={{ width:10, height:10, borderRadius:'50%', backgroundColor:'#0EA5E9', display:'inline-block' }}/>, sub:null },
          { label:'Syncing',     count:syncingCount,      color:'#F59E0B', indicator:<RefreshCw size={14} color="#F59E0B" style={{ animation:'spin 1.2s linear infinite' }}/>, sub:null },
          { label:'Open Alerts', count:openAlerts.total,  color:'#EF4444', indicator:<AlertCircle size={16} color="#EF4444"/>, sub:`${openAlerts.critical} critical · ${openAlerts.high} high` },
        ].map(kpi => (
          <div key={kpi.label} style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, padding:'18px 20px', boxShadow:'0 1px 3px rgba(0,0,0,0.04)', borderLeft:`4px solid ${kpi.color}` }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:4 }}>
              <span style={{ fontSize:34, fontWeight:700, color:'#0F172A' }}>{kpi.count}</span>{kpi.indicator}
            </div>
            <div style={{ fontSize:13, color:'#64748B' }}>{kpi.label}</div>
            {kpi.sub && <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{kpi.sub}</div>}
          </div>
        ))}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
        <div style={{ fontSize:16, fontWeight:700, color:'#0F172A' }}>Your Agents</div>
        <span style={{ backgroundColor:'#F1F5F9', color:'#64748B', fontSize:12, fontWeight:500, padding:'2px 8px', borderRadius:20 }}>{agents.length}</span>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:18 }}>
        {agents.map(agent => {
          const [stageBg, stageClr] = STAGE_CLR[agent.stage];
          const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${agent.avatarSeed||agent.initials}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
          return (
            <div key={agent.id} onClick={()=>{ setSelectedAgent(agent); setView('detail'); }} style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:16, padding:20, cursor:'pointer', textAlign:'center', transition:'all 0.2s' }} className="hover:shadow-md hover:border-[#0EA5E9]">
              {/* Human avatar */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:12, position:'relative' }}>
                <div style={{ position:'relative' }}>
                  <img src={avatarUrl} alt={agent.name} width={72} height={72} style={{ borderRadius:'50%', border:`3px solid ${STATUS_CLR[agent.status]}55`, backgroundColor:'#F1F5F9', display:'block' }}/>
                  <div style={{ position:'absolute', bottom:1, right:1, width:13, height:13, borderRadius:'50%', backgroundColor:STATUS_CLR[agent.status], border:'2px solid #fff' }}/>
                </div>
              </div>
              <div style={{ fontSize:14, fontWeight:700, color:'#0F172A', marginBottom:5 }}>{agent.name}</div>
              {agent.role && <div style={{ fontSize:11, color:'#94A3B8', marginBottom:5, lineHeight:1.3 }}>{agent.role}</div>}
              <div style={{ marginBottom:8 }}><StatusIndicator status={agent.status}/></div>
              <span style={{ backgroundColor:stageBg, color:stageClr, fontSize:10, fontWeight:600, padding:'2px 8px', borderRadius:20, display:'inline-block', marginBottom:8 }}>{agent.stage}</span>
              <div style={{ fontSize:11, color:'#94A3B8' }}>{agent.controls} controls · {agent.suppliers} sup</div>
              <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center', marginTop:8 }}>
                {agent.alerts===0
                  ? <span style={{ display:'inline-flex', alignItems:'center', gap:3, backgroundColor:'#ECFDF5', color:'#10B981', fontSize:11, padding:'2px 8px', borderRadius:20 }}><CheckCircle2 size={11}/> No alerts</span>
                  : <span style={{ display:'inline-flex', alignItems:'center', gap:3, backgroundColor:'#FEF2F2', color:'#EF4444', fontSize:11, padding:'2px 8px', borderRadius:20 }}><AlertCircle size={11}/> {agent.alerts} open alerts</span>
                }
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:4, justifyContent:'center', marginTop:4 }}>
                <Clock size={11} color="#94A3B8"/>
                <span style={{ fontSize:11, color:'#94A3B8' }}>Last active: {agent.lastActive}</span>
              </div>
              <div style={{ marginTop:10, borderTop:'1px solid #F1F5F9', paddingTop:8 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                  <span style={{ fontSize:10, color:'#94A3B8' }}>Coverage</span>
                  <span style={{ fontSize:10, fontWeight:600, color:agent.health>=80?'#10B981':agent.health>=50?'#F59E0B':'#EF4444' }}>{agent.health}%</span>
                </div>
                <div style={{ height:4, borderRadius:99, backgroundColor:'#F1F5F9', width:'100%' }}>
                  <div style={{ height:'100%', borderRadius:99, width:`${agent.health}%`, backgroundColor:agent.health>=80?'#10B981':agent.health>=50?'#F59E0B':'#EF4444', transition:'width 0.6s ease' }}/>
                </div>
              </div>
            </div>
          );
        })}

        <div onClick={()=>setShowCreate(true)} style={{ backgroundColor:'#F8FAFC', border:'2px dashed #E2E8F0', borderRadius:16, padding:20, cursor:'pointer', textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:180, transition:'all 0.2s' }} className="hover:border-[#0EA5E9] hover:bg-[#F0F9FF]">
          <div style={{ width:44, height:44, borderRadius:'50%', backgroundColor:'#EFF6FF', display:'flex', alignItems:'center', justifyContent:'center', marginBottom:8 }}><Bot size={20} color="#0EA5E9"/></div>
          <div style={{ fontSize:13, fontWeight:600, color:'#64748B' }}>New Agent</div>
          <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>Click to create</div>
        </div>
      </div>

      {showCreate && <CreateAgentModal onClose={()=>setShowCreate(false)} onCreated={a=>{ setAgents(prev=>[...prev,a]); toast.success(`Agent "${a.name}" created!`); }}/>}

      <div style={{ marginTop:32 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:700, color:'#0F172A' }}>Agent Activity</div>
            <div style={{ fontSize:12, color:'#94A3B8', marginTop:2 }}>Live feed of agent actions</div>
          </div>
          <button onClick={()=>toast('Coming soon')} style={{ fontSize:13, color:'#0EA5E9', background:'none', border:'none', cursor:'pointer', fontWeight:500 }}>View All</button>
        </div>
        <div style={{ backgroundColor:'#fff', border:'1px solid #E2E8F0', borderRadius:12, overflow:'hidden' }}>
          {[
            { id:'a1', name:'Agent Aria',  gradient:'linear-gradient(135deg,#0EA5E9,#6366F1)', seed:'Aria',  action:'checked MFA compliance on XYZ Corporation',                   time:'2 min ago',  icon:<CheckCircle2 size={16} color="#10B981"/> },
            { id:'a2', name:'Agent Blake', gradient:'linear-gradient(135deg,#10B981,#0EA5E9)', seed:'Blake', action:'raised alert: Call Center Ltd missing data',                   time:'8 min ago',  icon:<AlertCircle size={16} color="#EF4444"/> },
            { id:'a3', name:'Agent Casey', gradient:'linear-gradient(135deg,#8B5CF6,#EC4899)', seed:'Casey', action:'started backup verification check',                            time:'just now',   icon:<RefreshCw size={16} color="#F59E0B" style={{ animation:'spin 1.5s linear infinite' }}/> },
            { id:'a1', name:'Agent Aria',  gradient:'linear-gradient(135deg,#0EA5E9,#6366F1)', seed:'Aria',  action:'document expiry warning: ISO 27001 cert expires in 22 days', time:'15 min ago', icon:<AlertTriangle size={16} color="#F59E0B"/> },
            { id:'a2', name:'Agent Blake', gradient:'linear-gradient(135deg,#10B981,#0EA5E9)', seed:'Blake', action:'completed access review policy evaluation',                    time:'1 hr ago',   icon:<CheckCircle2 size={16} color="#10B981"/> },
          ].map((row, i, arr) => (
            <div
              key={i}
              onClick={() => { const found = agents.find(a=>a.id===row.id); if(found){ setSelectedAgent(found); setView('detail'); } }}
              style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', borderBottom:i<arr.length-1?'1px solid #F8FAFC':'none', transition:'background 0.15s', cursor:'pointer' }}
              className="hover:bg-[#F8FAFC]"
            >
              <img src={`https://api.dicebear.com/7.x/personas/svg?seed=${row.seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`} alt={row.name} width={28} height={28} style={{ borderRadius:'50%', backgroundColor:'#F1F5F9', flexShrink:0 }}/>
              <div style={{ flex:1, minWidth:0 }}>
                <p style={{ margin:0, fontSize:13, color:'#334155', lineHeight:1.4 }}><span style={{ fontWeight:600, color:'#0F172A' }}>{row.name}</span>{' '}{row.action}</p>
                <div style={{ fontSize:11, color:'#94A3B8', marginTop:2 }}>{row.time}</div>
              </div>
              <div style={{ flexShrink:0 }}>{row.icon}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
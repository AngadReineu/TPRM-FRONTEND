import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Activity, CheckCircle2, AlertTriangle, Brain,
  Database, Zap, Clock, TrendingUp, Shield, ChevronDown, ChevronRight
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────── */
type LogType = 'fetch' | 'evaluate' | 'reasoning' | 'success' | 'warning' | 'action' | 'decision' | 'error';

interface LogEntry {
  id: string;
  time: string;
  type: LogType;
  message: string;
  detail?: string;
}

/* ── Log type styles ─────────────────────────────────── */
const LOG_STYLE: Record<LogType, { color: string; bg: string; label: string }> = {
  fetch:     { color: '#06B6D4', bg: '#ECFEFF',  label: 'FETCH'     },
  evaluate:  { color: '#0EA5E9', bg: '#EFF6FF',  label: 'EVAL'      },
  reasoning: { color: '#8B5CF6', bg: '#F5F3FF',  label: 'REASON'    },
  success:   { color: '#10B981', bg: '#ECFDF5',  label: 'PASS'      },
  warning:   { color: '#F59E0B', bg: '#FFFBEB',  label: 'WARN'      },
  action:    { color: '#64748B', bg: '#F8FAFC',  label: 'ACTION'    },
  decision:  { color: '#6366F1', bg: '#EEF2FF',  label: 'NEXT'      },
  error:     { color: '#EF4444', bg: '#FEF2F2',  label: 'ERROR'     },
};

/* ── Agent definitions ───────────────────────────────── */
const AGENTS: Record<string, {
  id: string; initials: string; color: string; name: string;
  status: 'Active' | 'Idle'; controls: string[]; suppliers: string[];
  uptime: string; alerts: number; alertLevel: string; systems: string[];
  currentTask: string; nextEval: string;
}> = {
  a1: {
    id: 'a1', initials: 'A1', color: '#0EA5E9', name: 'Agent A1',
    status: 'Active', controls: ['MFA Enforcement', 'Privileged Access Mgmt', 'Vulnerability Scanning'],
    suppliers: ['XYZ Corporation', 'GHI Technologies'],
    uptime: '99.1%', alerts: 12, alertLevel: 'High',
    systems: ['Email', 'API', 'ServiceNow'],
    currentTask: 'Evaluating MFA coverage across 847 assets',
    nextEval: 'In 45 min',
  },
  a2: {
    id: 'a2', initials: 'A2', color: '#10B981', name: 'Agent A2',
    status: 'Active', controls: ['Encryption at Rest', 'Data Classification Policy'],
    suppliers: ['ABC Services Ltd', 'MNO Partners', 'STU Analytics'],
    uptime: '98.7%', alerts: 4, alertLevel: '',
    systems: ['Email', 'API', 'Slack'],
    currentTask: 'Auditing data classification labels across storage volumes',
    nextEval: 'In 2 hrs',
  },
  a3: {
    id: 'a3', initials: 'A3', color: '#8B5CF6', name: 'Agent A3',
    status: 'Active', controls: ['Access Review Policy', 'Network Segmentation', 'Patch Management', 'Incident Response Plan'],
    suppliers: ['DEF Limited'],
    uptime: '97.3%', alerts: 7, alertLevel: 'High',
    systems: ['API', 'ServiceNow'],
    currentTask: 'Running quarterly access review across Active Directory',
    nextEval: 'In 1 hr',
  },
  a4: {
    id: 'a4', initials: 'A4', color: '#F59E0B', name: 'Agent A4',
    status: 'Idle', controls: ['Backup Verification'],
    suppliers: ['JKL Consultancy', 'PQR Systems'],
    uptime: '100%', alerts: 0, alertLevel: '',
    systems: ['Email'],
    currentTask: 'Idle — waiting for scheduled trigger at 02:00 UTC',
    nextEval: 'Tomorrow 02:00',
  },
  a5: {
    id: 'a5', initials: 'A5', color: '#EF4444', name: 'Agent A5',
    status: 'Active', controls: ['Vulnerability Scanning', 'Patch Management'],
    suppliers: ['PQR Systems'],
    uptime: '99.8%', alerts: 2, alertLevel: '',
    systems: ['API', 'Splunk'],
    currentTask: 'Scanning for unpatched CVEs in production environment',
    nextEval: 'In 20 min',
  },
};

/* ── Log sequences per agent ─────────────────────────── */
function buildInitialLogs(agentId: string): LogEntry[] {
  const now = new Date();
  const ts = (offsetSeconds: number) => {
    const d = new Date(now.getTime() - offsetSeconds * 1000);
    return d.toTimeString().slice(0, 8);
  };

  const seqs: Record<string, LogEntry[]> = {
    a1: [
      { id: '1', time: ts(420), type: 'fetch',     message: 'Connecting to API Integration endpoint', },
      { id: '2', time: ts(418), type: 'fetch',     message: 'Pulling MFA status from Active Directory (89 assets)' },
      { id: '3', time: ts(415), type: 'evaluate',  message: 'Running evaluation: MFA Enforcement' },
      { id: '4', time: ts(410), type: 'reasoning', message: 'Analyzing authentication logs across 847 assets', detail: 'Found 3 admin accounts with MFA disabled. Coverage calculated at 94.2%. Threshold is 90% — currently passing. Flagging 3 accounts for remediation advisory.' },
      { id: '5', time: ts(405), type: 'success',   message: 'MFA Enforcement: PASSED — 94% coverage (847 assets)' },
      { id: '6', time: ts(400), type: 'action',    message: 'Advisory email sent: 3 accounts flagged for MFA enrollment' },
      { id: '7', time: ts(380), type: 'fetch',     message: 'Connecting to Splunk SIEM for vulnerability data' },
      { id: '8', time: ts(375), type: 'evaluate',  message: 'Running evaluation: Vulnerability Scanning' },
      { id: '9', time: ts(360), type: 'reasoning', message: 'Parsing Splunk vulnerability index for CVE entries', detail: '12 open CVEs detected. 2 Critical (CVSS ≥ 9.0): CVE-2024-4711, CVE-2024-3890. Patch SLA is 30 days — both are 26 days old. Breach in 4 days.' },
      { id: '10', time: ts(355), type: 'warning',  message: 'Vulnerability Scanning: HIGH RISK — 2 critical CVEs near SLA breach' },
      { id: '11', time: ts(352), type: 'action',   message: 'ServiceNow ticket created: VULN-2847 (P1)' },
      { id: '12', time: ts(350), type: 'action',   message: 'Email alert dispatched → Risk Manager, Compliance Officer' },
      { id: '13', time: ts(340), type: 'evaluate',  message: 'Running evaluation: Privileged Access Mgmt' },
      { id: '14', time: ts(330), type: 'reasoning', message: 'Checking JIT access logs for admin operations', detail: 'All 14 admin sessions in last 24h used JIT. No standing access detected. Privileged accounts: 14 active, 0 orphaned.' },
      { id: '15', time: ts(320), type: 'success',   message: 'Privileged Access Mgmt: PASSED — 100% JIT compliance' },
    ],
    a2: [
      { id: '1', time: ts(300), type: 'fetch',     message: 'Fetching storage inventory from Azure Blob & S3' },
      { id: '2', time: ts(295), type: 'evaluate',  message: 'Running evaluation: Encryption at Rest' },
      { id: '3', time: ts(285), type: 'reasoning', message: 'Scanning 312 Azure assets for AES-256 encryption status', detail: '312 Azure assets checked. 206/312 (66%) encrypted. 106 assets on legacy config — not AES-256. Coverage below 70% threshold.' },
      { id: '4', time: ts(280), type: 'warning',   message: 'Encryption at Rest: BELOW THRESHOLD — 67% (need 70%)' },
      { id: '5', time: ts(275), type: 'action',    message: 'Ticket raised: ENC-1104 — 106 assets require encryption upgrade' },
      { id: '6', time: ts(260), type: 'fetch',     message: 'Pulling data classification metadata from Microsoft 365' },
      { id: '7', time: ts(250), type: 'evaluate',  message: 'Running evaluation: Data Classification Policy' },
      { id: '8', time: ts(240), type: 'reasoning', message: 'Auditing 156 M365 assets for classification labels', detail: 'Checked 156 M365 assets. 142 classified (91%). 14 unclassified — 9 are email archives, 5 are SharePoint docs created in last 7 days (within grace period).' },
      { id: '9', time: ts(232), type: 'success',   message: 'Data Classification Policy: PASSED — 91% labelled' },
      { id: '10', time: ts(220), type: 'fetch',     message: 'Checking supplier STU Analytics assessment status' },
      { id: '11', time: ts(215), type: 'reasoning', message: 'Reviewing supplier risk posture for STU Analytics', detail: 'Score: 22 (Low). Assessment complete. PII sharing not configured. Contract ends Jul 2028. No immediate risk.' },
      { id: '12', time: ts(210), type: 'action',   message: 'Supplier note: STU Analytics PII config pending — flagged for DPO' },
    ],
    a3: [
      { id: '1', time: ts(500), type: 'fetch',     message: 'Pulling Active Directory user list (quarterly review cycle)' },
      { id: '2', time: ts(490), type: 'evaluate',  message: 'Running evaluation: Access Review Policy' },
      { id: '3', time: ts(475), type: 'reasoning', message: 'Cross-referencing AD users against HR offboarding records', detail: '1,240 user accounts reviewed. 8 accounts belong to employees terminated in last 90 days. 3 still have active resource access. Immediate revocation required.' },
      { id: '4', time: ts(465), type: 'warning',   message: 'Access Review: 3 orphaned accounts with active access detected' },
      { id: '5', time: ts(460), type: 'action',    message: 'Auto-revocation initiated for accounts: U1042, U1098, U1187' },
      { id: '6', time: ts(455), type: 'action',    message: 'Notification sent to IT Admin + HR compliance team' },
      { id: '7', time: ts(440), type: 'evaluate',  message: 'Running evaluation: Network Segmentation' },
      { id: '8', time: ts(425), type: 'reasoning', message: 'Scanning VLAN topology — prod vs. staging isolation', detail: 'VLAN rules reviewed. Production (VLAN 10) and Staging (VLAN 20) properly isolated. 2 cross-VLAN firewall rules exist — both are approved exceptions in ServiceNow.' },
      { id: '9', time: ts(415), type: 'success',   message: 'Network Segmentation: PASSED — isolation confirmed, 2 approved exceptions on record' },
      { id: '10', time: ts(400), type: 'evaluate',  message: 'Running evaluation: Incident Response Plan' },
      { id: '11', time: ts(385), type: 'reasoning', message: 'Checking IR runbooks last update date and tabletop exercise records', detail: 'IR Plan last updated: Feb 2026. Tabletop exercise: Jan 2026. Both within SLA. Runbooks cover: ransomware, data breach, insider threat. No open P1 incidents.' },
      { id: '12', time: ts(375), type: 'success',   message: 'Incident Response Plan: PASSED — all runbooks current' },
    ],
    a4: [
      { id: '1', time: ts(3600), type: 'fetch',    message: 'Scheduled backup verification triggered at 02:00 UTC' },
      { id: '2', time: ts(3590), type: 'evaluate', message: 'Running evaluation: Backup Verification' },
      { id: '3', time: ts(3575), type: 'fetch',    message: 'Connecting to backup storage — Azure Recovery Vault' },
      { id: '4', time: ts(3560), type: 'reasoning', message: 'Verifying integrity of last 7 days of backup snapshots', detail: 'Checked 14 backup snapshots (2/day). All checksums valid. Last restore test: Feb 24, 2026. Restore time: 4.2 hrs (within 6 hr SLA).' },
      { id: '5', time: ts(3550), type: 'success',  message: 'Backup Verification: PASSED — 14/14 snapshots verified' },
      { id: '6', time: ts(3540), type: 'decision', message: 'Next evaluation scheduled: Tomorrow 02:00 UTC' },
      { id: '7', time: ts(3520), type: 'action',   message: 'Agent entering idle state — no active triggers' },
    ],
    a5: [
      { id: '1', time: ts(180), type: 'fetch',     message: 'Connecting to Splunk for CVE vulnerability index' },
      { id: '2', time: ts(175), type: 'evaluate',  message: 'Running evaluation: Vulnerability Scanning' },
      { id: '3', time: ts(160), type: 'reasoning', message: 'Scanning production environment for unpatched CVEs', detail: 'Scanned 650 endpoints. 2 medium CVEs found: CVE-2024-7821 (CVSS 5.5) and CVE-2024-6634 (CVSS 6.1). Both in 30-day SLA window. Patches available upstream.' },
      { id: '4', time: ts(152), type: 'warning',   message: 'Vulnerability Scanning: 2 medium CVEs detected — SLA: 18 days remaining' },
      { id: '5', time: ts(148), type: 'action',    message: 'ServiceNow ticket created: VULN-2851 (P2)' },
      { id: '6', time: ts(140), type: 'evaluate',  message: 'Running evaluation: Patch Management' },
      { id: '7', time: ts(125), type: 'reasoning', message: 'Verifying patch compliance across OS versions', detail: 'OS patch review: 650 systems checked. 598 (92%) patched within SLA. 52 systems running OS versions 1-2 minor versions behind. No critical unpatched systems.' },
      { id: '8', time: ts(115), type: 'success',   message: 'Patch Management: PASSED — 92% compliance (threshold: 85%)' },
    ],
  };

  return seqs[agentId] || seqs['a1'];
}

/* ── Streaming log queue per agent ───────────────────── */
const STREAM_QUEUES: Record<string, Array<Omit<LogEntry, 'id' | 'time'>>> = {
  a1: [
    { type: 'fetch',     message: 'Re-fetching API Integration for updated MFA status' },
    { type: 'evaluate',  message: 'Re-evaluating MFA Enforcement (scheduled 45-min cycle)' },
    { type: 'reasoning', message: 'Comparing current MFA coverage against last evaluation', detail: 'Previous: 94.2%. Current: 94.5%. 1 additional account enrolled. 2 accounts still pending enrollment.' },
    { type: 'success',   message: 'MFA Enforcement: PASSED — 94.5% coverage (+0.3%)' },
    { type: 'fetch',     message: 'Polling supplier XYZ Corporation assessment portal' },
    { type: 'reasoning', message: 'Checking XYZ Corporation contract renewal window', detail: 'Contract expires Mar 2026 — 15 days remaining. Risk score 78 (High). Recommendation: Initiate renewal or escalate to procurement.' },
    { type: 'warning',   message: 'XYZ Corporation contract expiring in 15 days — escalation required' },
    { type: 'action',    message: 'Contract renewal alert sent to Procurement & Risk Manager' },
    { type: 'decision',  message: 'Next: Privileged Access Mgmt re-evaluation in 30 min' },
  ],
  a2: [
    { type: 'fetch',     message: 'Checking new assets added to Azure in last 24h' },
    { type: 'reasoning', message: 'Scanning 3 newly created Azure resources for encryption', detail: '3 new Azure VMs detected. 2/3 encrypted at creation. 1 (vm-staging-09) missing encryption config.' },
    { type: 'warning',   message: 'New unencrypted VM detected: vm-staging-09' },
    { type: 'action',    message: 'Auto-remediation triggered: encryption policy applied to vm-staging-09' },
    { type: 'success',   message: 'Encryption at Rest: Auto-remediated — vm-staging-09 now encrypted' },
    { type: 'fetch',     message: 'Fetching MNO Partners supplier assessment status' },
    { type: 'reasoning', message: 'Reviewing MNO Partners offboarding stage risk', detail: 'MNO Partners: Assessment pending for 1 day. Contract ends Apr 2026. Risk score 55 (Medium). No PII sharing configured.' },
    { type: 'action',    message: 'Reminder queued for MNO Partners — pending assessment follow-up' },
  ],
  a3: [
    { type: 'fetch',     message: 'Pulling patch deployment status from ServiceNow CMDB' },
    { type: 'evaluate',  message: 'Running evaluation: Patch Management' },
    { type: 'reasoning', message: 'Comparing installed patch versions against vendor advisories', detail: 'OS patch compliance: 88%. 12 servers running unpatched versions. Most critical: 3 servers missing Feb 2026 security rollup. SLA: 30 days — 8 days remaining.' },
    { type: 'warning',   message: 'Patch Management: 3 servers approaching SLA deadline (8 days)' },
    { type: 'action',    message: 'PATCH-3319 ticket escalated to P1 — assigned to SysAdmin team' },
    { type: 'decision',  message: 'Re-evaluating Patch Management in 24h unless patch deployed' },
  ],
  a4: [
    { type: 'action',    message: 'Agent idle — next trigger at 02:00 UTC tomorrow' },
    { type: 'decision',  message: 'Standby mode active — monitoring for event-driven triggers' },
  ],
  a5: [
    { type: 'fetch',     message: 'Re-scanning Splunk CVE index for new vulnerabilities' },
    { type: 'evaluate',  message: 'Running evaluation: Vulnerability Scanning (20-min cycle)' },
    { type: 'reasoning', message: 'Checking if existing CVEs have been patched since last scan', detail: 'CVE-2024-7821: still unpatched (Day 12/30). CVE-2024-6634: still unpatched (Day 12/30). No new CVEs detected in this scan cycle.' },
    { type: 'action',    message: 'Updated ticket VULN-2851 — patch still pending (Day 12/30)' },
    { type: 'decision',  message: 'Next vulnerability scan in 20 min' },
  ],
};

/* ── Reasoning Entry (expandable) ────────────────────── */
function ReasoningEntry({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const style = LOG_STYLE[entry.type];
  return (
    <div style={{ backgroundColor: style.bg, border: `1px solid ${style.color}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: entry.detail ? 'pointer' : 'default' }} onClick={() => entry.detail && setExpanded(e => !e)}>
        <Brain size={13} color={style.color} />
        <span style={{ fontSize: 11, fontWeight: 700, color: style.color, letterSpacing: '0.06em' }}>{style.label}</span>
        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{entry.time}</span>
        {entry.detail && (
          <span style={{ color: style.color }}>
            {expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </span>
        )}
      </div>
      <div style={{ fontSize: 13, color: '#334155', marginTop: 4, fontWeight: 500 }}>{entry.message}</div>
      {expanded && entry.detail && (
        <div style={{ marginTop: 8, padding: '8px 12px', backgroundColor: '#fff', borderRadius: 6, fontSize: 12, color: '#64748B', lineHeight: 1.6, borderLeft: `3px solid ${style.color}` }}>
          {entry.detail}
        </div>
      )}
    </div>
  );
}

/* ── Log Entry ───────────────────────────────────────── */
function LogRow({ entry }: { entry: LogEntry }) {
  if (entry.type === 'reasoning') return <ReasoningEntry entry={entry} />;
  const style = LOG_STYLE[entry.type];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', flexShrink: 0, marginTop: 2, minWidth: 56 }}>{entry.time}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: style.color, backgroundColor: style.bg, padding: '1px 6px', borderRadius: 4, flexShrink: 0, marginTop: 1, minWidth: 46, textAlign: 'center' }}>
        {style.label}
      </span>
      <span style={{ fontSize: 13, color: '#334155', flex: 1 }}>{entry.message}</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agent = AGENTS[id || ''] || AGENTS['a1'];
  const feedRef = useRef<HTMLDivElement>(null);

  const [logs, setLogs] = useState<LogEntry[]>(() => buildInitialLogs(agent.id));
  const [streamIdx, setStreamIdx] = useState(0);
  const [pulse, setPulse] = useState(true);

  // Auto-scroll feed to bottom on new entries
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
    }
  }, [logs]);

  // Stream new entries for active agents
  useEffect(() => {
    if (agent.status !== 'Active') return;
    const queue = STREAM_QUEUES[agent.id] || [];
    if (queue.length === 0) return;

    const interval = setInterval(() => {
      setStreamIdx(prev => {
        const idx = prev % queue.length;
        const entry = queue[idx];
        const now = new Date();
        const timeStr = now.toTimeString().slice(0, 8);
        setLogs(l => [...l, { ...entry, id: `live_${Date.now()}_${idx}`, time: timeStr }]);
        return prev + 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [agent.id, agent.status]);

  // Pulse indicator toggle
  useEffect(() => {
    if (agent.status !== 'Active') return;
    const t = setInterval(() => setPulse(p => !p), 800);
    return () => clearInterval(t);
  }, [agent.status]);

  const statCard = (label: string, value: string, color?: string) => (
    <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 16px' }}>
      <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 20, fontWeight: 800, color: color || '#0F172A' }}>{value}</div>
    </div>
  );

  return (
    <div style={{ maxWidth: 1200 }}>
      {/* Back */}
      <button
        onClick={() => navigate('/agents')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}
        className="hover:text-[#0EA5E9]"
      >
        <ArrowLeft size={16} /> Back to Agents
      </button>

      {/* Agent Header */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '20px 24px', marginBottom: 20, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ width: 56, height: 56, borderRadius: '50%', backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#475569', fontSize: 20, fontWeight: 800, flexShrink: 0 }}>
            {agent.initials}
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>{agent.name}</h1>
              {/* Live indicator */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: agent.status === 'Active' ? '#ECFDF5' : '#F1F5F9', padding: '4px 10px', borderRadius: 20, border: `1px solid ${agent.status === 'Active' ? '#A7F3D0' : '#E2E8F0'}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: agent.status === 'Active' ? '#10B981' : '#94A3B8', opacity: agent.status === 'Active' ? (pulse ? 1 : 0.3) : 1, transition: 'opacity 0.3s' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: agent.status === 'Active' ? '#10B981' : '#94A3B8' }}>
                  {agent.status === 'Active' ? 'LIVE' : 'IDLE'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>
              Monitoring {agent.controls.length} control{agent.controls.length !== 1 ? 's' : ''} · {agent.suppliers.length} supplier{agent.suppliers.length !== 1 ? 's' : ''} · Alert sensitivity: {agent.alertLevel || 'Low'}
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ textAlign: 'center', padding: '8px 16px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#0EA5E9' }}>{agent.uptime}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>UPTIME</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', backgroundColor: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC', borderRadius: 10, border: `1px solid ${agent.alerts > 0 ? '#FDE68A' : '#E2E8F0'}` }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8' }}>{agent.alerts}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>ALERTS</div>
            </div>
            <div style={{ textAlign: 'center', padding: '8px 16px', backgroundColor: '#F8FAFC', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: '#6366F1' }}>{agent.nextEval}</div>
              <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500 }}>NEXT EVAL</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Current Task */}
          <div style={{ backgroundColor: '#fff', border: `2px solid ${agent.color}40`, borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Activity size={14} color={agent.color} />
              <span style={{ fontSize: 11, fontWeight: 700, color: agent.color, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Current Task</span>
            </div>
            <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.5 }}>{agent.currentTask}</p>
          </div>

          {/* Assigned Controls */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Shield size={14} color="#0EA5E9" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assigned Controls</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {agent.controls.map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', padding: '6px 10px', backgroundColor: '#F8FAFC', borderRadius: 7 }}>
                  <CheckCircle2 size={12} color="#10B981" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Assigned Suppliers */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <TrendingUp size={14} color="#8B5CF6" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monitoring Suppliers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {agent.suppliers.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', padding: '6px 10px', backgroundColor: '#F5F3FF', borderRadius: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8B5CF6', flexShrink: 0 }} />
                  {s}
                </div>
              ))}
              {agent.suppliers.length === 0 && (
                <span style={{ fontSize: 12, color: '#94A3B8' }}>No suppliers assigned</span>
              )}
            </div>
          </div>

          {/* Systems */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Database size={14} color="#F59E0B" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Connected Systems</span>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {agent.systems.map(s => (
                <span key={s} style={{ backgroundColor: '#FFFBEB', color: '#F59E0B', fontSize: 12, fontWeight: 500, padding: '3px 10px', borderRadius: 20, border: '1px solid #FDE68A' }}>{s}</span>
              ))}
            </div>
          </div>
        </div>

        {/* ── RIGHT COLUMN: Live Feed ── */}
        <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', height: 640 }}>
          {/* Feed Header */}
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Zap size={16} color="#F59E0B" />
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Activity Feed</span>
              {agent.status === 'Active' && (
                <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 20, border: '1px solid #A7F3D0' }}>
                  STREAMING LIVE
                </span>
              )}
            </div>
            <span style={{ fontSize: 12, color: '#94A3B8' }}>{logs.length} entries</span>
          </div>

          {/* Legend */}
          <div style={{ padding: '8px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 10, flexWrap: 'wrap', flexShrink: 0, backgroundColor: '#FAFAFA' }}>
            {Object.entries(LOG_STYLE).map(([type, s]) => (
              <span key={type} style={{ fontSize: 10, fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '1px 7px', borderRadius: 4 }}>{s.label}</span>
            ))}
            <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 4 }}>· Click REASON entries to expand</span>
          </div>

          {/* Scrollable Feed */}
          <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
            {logs.map(entry => (
              <LogRow key={entry.id} entry={entry} />
            ))}
            {/* Live cursor */}
            {agent.status === 'Active' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 0', color: '#94A3B8' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', opacity: pulse ? 1 : 0, transition: 'opacity 0.3s' }} />
                <span style={{ fontSize: 12, fontFamily: 'monospace' }}>Agent running...</span>
              </div>
            )}
          </div>

          {/* Next Steps footer */}
          <div style={{ padding: '14px 20px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', flexShrink: 0, borderRadius: '0 0 14px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
              <Clock size={13} color="#6366F1" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#6366F1', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Planned Next Steps</span>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {agent.status === 'Active' ? (
                <>
                  <span style={{ fontSize: 12, color: '#334155', backgroundColor: '#EEF2FF', padding: '3px 10px', borderRadius: 20, border: '1px solid #C7D2FE' }}>Re-evaluate controls ({agent.nextEval})</span>
                  <span style={{ fontSize: 12, color: '#334155', backgroundColor: '#EEF2FF', padding: '3px 10px', borderRadius: 20, border: '1px solid #C7D2FE' }}>Check supplier assessments</span>
                  <span style={{ fontSize: 12, color: '#334155', backgroundColor: '#EEF2FF', padding: '3px 10px', borderRadius: 20, border: '1px solid #C7D2FE' }}>Update audit log entries</span>
                </>
              ) : (
                <span style={{ fontSize: 12, color: '#94A3B8' }}>Agent idle — triggers checked at {agent.nextEval}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
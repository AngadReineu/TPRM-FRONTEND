import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Activity, CheckCircle2, AlertTriangle, Brain,
  Database, Zap, Clock, TrendingUp, Shield, ChevronDown, ChevronRight,
  MessageSquare, Users, BarChart2, Cpu, CalendarCheck, Flag,
  UserCheck, GitMerge, Bell, FileText, Send, ChevronUp, MoreHorizontal
} from 'lucide-react';

/* ── Types ───────────────────────────────────────────── */
type LogType = 'fetch' | 'evaluate' | 'reasoning' | 'success' | 'warning' | 'action' | 'decision' | 'error';
type TaskPriority = 'High' | 'Medium' | 'Low';
type TaskStatus = 'Open' | 'In Progress' | 'Resolved';

interface LogEntry {
  id: string;
  time: string;
  type: LogType;
  message: string;
  detail?: string;
}

interface AgentTask {
  id: string;
  title: string;
  supplier: string;
  priority: TaskPriority;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  description: string;
}

interface TimelineEntry {
  id: string;
  time: string;
  event: string;
  status: 'alert' | 'info' | 'success' | 'warning';
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
  id: string; initials: string; color: string; name: string; role: string;
  status: 'Active' | 'Idle'; controls: string[]; suppliers: string[];
  uptime: string; alerts: number; alertLevel: string; systems: string[];
  currentTask: string; nextEval: string; lastScan: string;
  openTasks: number; avatarSeed: string;
}> = {
  a1: {
    id: 'a1', initials: 'A1', color: '#0EA5E9', name: 'Agent Aria', role: 'MFA & Access Control Specialist',
    status: 'Active', controls: ['MFA Enforcement', 'Privileged Access Mgmt', 'Vulnerability Scanning'],
    suppliers: ['XYZ Corporation', 'GHI Technologies'],
    uptime: '99.1%', alerts: 12, alertLevel: 'High',
    systems: ['Email', 'API', 'ServiceNow'],
    currentTask: 'Evaluating MFA coverage across 847 assets',
    nextEval: 'In 45 min', lastScan: '09:14 AM', openTasks: 3, avatarSeed: 'Aria',
  },
  a2: {
    id: 'a2', initials: 'A2', color: '#10B981', name: 'Agent Blake', role: 'Encryption & Data Classification Analyst',
    status: 'Active', controls: ['Encryption at Rest', 'Data Classification Policy'],
    suppliers: ['ABC Services Ltd', 'MNO Partners', 'STU Analytics'],
    uptime: '98.7%', alerts: 4, alertLevel: '',
    systems: ['Email', 'API', 'Slack'],
    currentTask: 'Auditing data classification labels across storage volumes',
    nextEval: 'In 2 hrs', lastScan: '08:52 AM', openTasks: 1, avatarSeed: 'Blake',
  },
  a3: {
    id: 'a3', initials: 'A3', color: '#8B5CF6', name: 'Agent Casey', role: 'Network & Access Review Auditor',
    status: 'Active', controls: ['Access Review Policy', 'Network Segmentation', 'Patch Management', 'Incident Response Plan'],
    suppliers: ['DEF Limited'],
    uptime: '97.3%', alerts: 7, alertLevel: 'High',
    systems: ['API', 'ServiceNow'],
    currentTask: 'Running quarterly access review across Active Directory',
    nextEval: 'In 1 hr', lastScan: '08:30 AM', openTasks: 5, avatarSeed: 'Casey',
  },
  a4: {
    id: 'a4', initials: 'A4', color: '#F59E0B', name: 'Agent Dana', role: 'Backup & Recovery Monitor',
    status: 'Idle', controls: ['Backup Verification'],
    suppliers: ['JKL Consultancy', 'PQR Systems'],
    uptime: '100%', alerts: 0, alertLevel: '',
    systems: ['Email'],
    currentTask: 'Idle — waiting for scheduled trigger at 02:00 UTC',
    nextEval: 'Tomorrow 02:00', lastScan: 'Yesterday 02:04 AM', openTasks: 0, avatarSeed: 'Dana',
  },
  a5: {
    id: 'a5', initials: 'A5', color: '#EF4444', name: 'Agent Ellis', role: 'Vulnerability & Patch Intelligence',
    status: 'Active', controls: ['Vulnerability Scanning', 'Patch Management'],
    suppliers: ['PQR Systems'],
    uptime: '99.8%', alerts: 2, alertLevel: '',
    systems: ['API', 'Splunk'],
    currentTask: 'Scanning for unpatched CVEs in production environment',
    nextEval: 'In 20 min', lastScan: '09:22 AM', openTasks: 2, avatarSeed: 'Ellis',
  },
};

/* ── Tasks per agent ──────────────────────────────────── */
const AGENT_TASKS: Record<string, AgentTask[]> = {
  a1: [
    { id: 't1', title: 'MFA Enrollment — 2 Pending Admin Accounts', supplier: 'XYZ Corporation', priority: 'High', assignee: 'priya@abc.co', status: 'Open', dueDate: '2026-03-07', description: 'Two admin accounts have not completed MFA enrollment. Breach risk in 4 days.' },
    { id: 't2', title: 'Critical CVE Patch — CVE-2024-4711', supplier: 'GHI Technologies', priority: 'High', assignee: 'anita@abc.co', status: 'In Progress', dueDate: '2026-03-06', description: 'Critical vulnerability approaching 30-day SLA. Patch available upstream.' },
    { id: 't3', title: 'Contract Renewal Reminder — XYZ Corp', supplier: 'XYZ Corporation', priority: 'Medium', assignee: '', status: 'Open', dueDate: '2026-03-15', description: 'Contract expires in 15 days. Procurement to initiate renewal.' },
  ],
  a2: [
    { id: 't4', title: 'Encrypt vm-staging-09', supplier: 'ABC Services Ltd', priority: 'Medium', assignee: 'raj@abc.co', status: 'In Progress', dueDate: '2026-03-08', description: 'New Azure VM created without encryption. Auto-remediation triggered but requires verification.' },
  ],
  a3: [
    { id: 't5', title: 'Revoke Access — 3 Orphaned Accounts', supplier: 'DEF Limited', priority: 'High', assignee: 'it-admin@abc.co', status: 'In Progress', dueDate: '2026-03-05', description: 'Accounts U1042, U1098, U1187 belong to terminated employees with active access.' },
    { id: 't6', title: 'Patch 3 Servers — Feb 2026 Security Rollup', supplier: 'DEF Limited', priority: 'High', assignee: 'sysadmin@abc.co', status: 'Open', dueDate: '2026-03-10', description: '3 servers missing Feb 2026 security rollup. SLA breach in 8 days.' },
    { id: 't7', title: 'Document Approved VLAN Exceptions', supplier: 'DEF Limited', priority: 'Low', assignee: '', status: 'Open', dueDate: '2026-03-20', description: '2 cross-VLAN firewall exceptions approved in ServiceNow. Audit documentation required.' },
    { id: 't8', title: 'Access Review Sign-off by Dept Heads', supplier: 'DEF Limited', priority: 'Medium', assignee: 'hr@abc.co', status: 'Open', dueDate: '2026-03-12', description: 'Quarterly access review results require department head sign-off.' },
    { id: 't9', title: 'Update Insider Threat Runbook', supplier: 'DEF Limited', priority: 'Low', assignee: '', status: 'Open', dueDate: '2026-03-25', description: 'IR Plan references outdated escalation contacts. Update required.' },
  ],
  a4: [],
  a5: [
    { id: 't10', title: 'Patch CVE-2024-7821 (CVSS 5.5)', supplier: 'PQR Systems', priority: 'Medium', assignee: 'sysadmin@abc.co', status: 'In Progress', dueDate: '2026-03-18', description: '18 days remaining in SLA. Patches available upstream. Deployment pending.' },
    { id: 't11', title: 'Patch CVE-2024-6634 (CVSS 6.1)', supplier: 'PQR Systems', priority: 'Medium', assignee: 'sysadmin@abc.co', status: 'Open', dueDate: '2026-03-18', description: '18 days remaining in SLA. Patches available upstream.' },
  ],
};

/* ── Timeline per agent ───────────────────────────────── */
const AGENT_TIMELINE: Record<string, TimelineEntry[]> = {
  a1: [
    { id: 'tl1', time: '09:14 AM', event: 'MFA audit completed — 94.5% coverage across 847 assets', status: 'success' },
    { id: 'tl2', time: '09:08 AM', event: 'ServiceNow ticket VULN-2847 auto-created for critical CVE patch', status: 'alert' },
    { id: 'tl3', time: '09:05 AM', event: 'Email dispatched to Risk Manager & Compliance Officer re: CVE breach risk', status: 'warning' },
    { id: 'tl4', time: '08:55 AM', event: 'JIT access session audit completed — 14 sessions, 0 standing access', status: 'success' },
    { id: 'tl5', time: '08:40 AM', event: 'Supplier XYZ Corporation contract expiry flagged — 15 days remaining', status: 'warning' },
    { id: 'tl6', time: '08:20 AM', event: 'MFA enrollment advisory sent to 3 non-compliant admin accounts', status: 'info' },
  ],
  a2: [
    { id: 'tl1', time: '08:52 AM', event: 'Auto-remediation applied: vm-staging-09 encryption policy enforced', status: 'success' },
    { id: 'tl2', time: '08:48 AM', event: 'Unencrypted Azure VM detected: vm-staging-09', status: 'alert' },
    { id: 'tl3', time: '08:35 AM', event: 'Data classification audit: 91% M365 assets labelled (156 total)', status: 'success' },
    { id: 'tl4', time: '08:20 AM', event: 'Encryption at Rest below threshold — 67% coverage (need 70%)', status: 'warning' },
    { id: 'tl5', time: '08:10 AM', event: 'Ticket ENC-1104 raised — 106 assets require encryption upgrade', status: 'info' },
    { id: 'tl6', time: '07:55 AM', event: 'STU Analytics supplier note flagged for DPO — PII config pending', status: 'info' },
  ],
  a3: [
    { id: 'tl1', time: '08:30 AM', event: 'Orphaned account revocation initiated — U1042, U1098, U1187', status: 'alert' },
    { id: 'tl2', time: '08:25 AM', event: 'PATCH-3319 escalated to P1 — 3 servers missing Feb 2026 rollup', status: 'warning' },
    { id: 'tl3', time: '08:10 AM', event: 'Network segmentation confirmed — VLAN 10/20 isolation verified', status: 'success' },
    { id: 'tl4', time: '07:50 AM', event: 'IR runbooks validated — all current, last updated Feb 2026', status: 'success' },
    { id: 'tl5', time: '07:30 AM', event: 'Quarterly access review initiated — 1,240 AD accounts scanned', status: 'info' },
  ],
  a4: [
    { id: 'tl1', time: '02:04 AM', event: 'Backup verification complete — 14/14 snapshots validated', status: 'success' },
    { id: 'tl2', time: '02:02 AM', event: 'Restore test confirmed — 4.2 hrs (within 6 hr SLA)', status: 'success' },
    { id: 'tl3', time: '02:00 AM', event: 'Agent triggered by scheduled backup verification job', status: 'info' },
    { id: 'tl4', time: 'Yesterday', event: 'Agent entered idle state — no active triggers detected', status: 'info' },
  ],
  a5: [
    { id: 'tl1', time: '09:22 AM', event: 'No new CVEs detected in latest Splunk scan (650 endpoints)', status: 'success' },
    { id: 'tl2', time: '09:18 AM', event: 'Ticket VULN-2851 updated — CVE-2024-7821 & CVE-2024-6634 still unpatched (Day 12/30)', status: 'warning' },
    { id: 'tl3', time: '08:58 AM', event: 'Patch compliance: 92% (650 systems), 52 systems 1-2 minor versions behind', status: 'success' },
    { id: 'tl4', time: '08:40 AM', event: 'Two medium CVEs detected — SLA: 18 days remaining', status: 'warning' },
    { id: 'tl5', time: '08:30 AM', event: 'ServiceNow ticket VULN-2851 (P2) auto-created', status: 'info' },
  ],
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
      { id: '1', time: ts(420), type: 'fetch',     message: 'Connecting to API Integration endpoint' },
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
      { id: '13', time: ts(340), type: 'evaluate', message: 'Running evaluation: Privileged Access Mgmt' },
      { id: '14', time: ts(330), type: 'reasoning', message: 'Checking JIT access logs for admin operations', detail: 'All 14 admin sessions in last 24h used JIT. No standing access detected. Privileged accounts: 14 active, 0 orphaned.' },
      { id: '15', time: ts(320), type: 'success',  message: 'Privileged Access Mgmt: PASSED — 100% JIT compliance' },
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
      { id: '10', time: ts(220), type: 'fetch',    message: 'Checking supplier STU Analytics assessment status' },
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
      { id: '10', time: ts(400), type: 'evaluate', message: 'Running evaluation: Incident Response Plan' },
      { id: '11', time: ts(385), type: 'reasoning', message: 'Checking IR runbooks last update date and tabletop exercise records', detail: 'IR Plan last updated: Feb 2026. Tabletop exercise: Jan 2026. Both within SLA. Runbooks cover: ransomware, data breach, insider threat. No open P1 incidents.' },
      { id: '12', time: ts(375), type: 'success',  message: 'Incident Response Plan: PASSED — all runbooks current' },
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

/* ── Helper: Priority badge ───────────────────────────── */
function PriorityBadge({ priority }: { priority: TaskPriority }) {
  const cfg = {
    High:   { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA' },
    Medium: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
    Low:    { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  }[priority];
  return (
    <span style={{ fontSize: 10, fontWeight: 700, color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: 20 }}>
      {priority}
    </span>
  );
}

function StatusBadge({ status }: { status: TaskStatus }) {
  const cfg = {
    'Open':        { color: '#64748B', bg: '#F1F5F9', border: '#CBD5E1' },
    'In Progress': { color: '#0EA5E9', bg: '#EFF6FF', border: '#BAE6FD' },
    'Resolved':    { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0' },
  }[status];
  return (
    <span style={{ fontSize: 10, fontWeight: 600, color: cfg.color, backgroundColor: cfg.bg, border: `1px solid ${cfg.border}`, padding: '2px 8px', borderRadius: 20 }}>
      {status}
    </span>
  );
}

/* ── Reasoning Entry ─────────────────────────────────── */
function ReasoningEntry({ entry }: { entry: LogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const style = LOG_STYLE[entry.type];
  return (
    <div style={{ backgroundColor: style.bg, border: `1px solid ${style.color}30`, borderRadius: 8, padding: '10px 14px', marginBottom: 6 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: entry.detail ? 'pointer' : 'default' }} onClick={() => entry.detail && setExpanded(e => !e)}>
        <Brain size={13} color={style.color} />
        <span style={{ fontSize: 11, fontWeight: 700, color: style.color, letterSpacing: '0.06em' }}>{style.label}</span>
        <span style={{ fontSize: 11, color: '#94A3B8', marginLeft: 'auto' }}>{entry.time}</span>
        {entry.detail && <span style={{ color: style.color }}>{expanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}</span>}
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

function LogRow({ entry }: { entry: LogEntry }) {
  if (entry.type === 'reasoning') return <ReasoningEntry entry={entry} />;
  const style = LOG_STYLE[entry.type];
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '7px 0', borderBottom: '1px solid #F8FAFC' }}>
      <span style={{ fontSize: 10, color: '#94A3B8', fontFamily: 'monospace', flexShrink: 0, marginTop: 2, minWidth: 56 }}>{entry.time}</span>
      <span style={{ fontSize: 10, fontWeight: 700, color: style.color, backgroundColor: style.bg, padding: '1px 6px', borderRadius: 4, flexShrink: 0, marginTop: 1, minWidth: 46, textAlign: 'center' }}>{style.label}</span>
      <span style={{ fontSize: 13, color: '#334155', flex: 1 }}>{entry.message}</span>
    </div>
  );
}

/* ── Task Row ─────────────────────────────────────────── */
function TaskRow({ task, agentColor }: { task: AgentTask; agentColor: string }) {
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [localStatus, setLocalStatus] = useState<TaskStatus>(task.status);

  return (
    <div style={{ border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', backgroundColor: '#fff', marginBottom: 10 }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{task.title}</span>
            <PriorityBadge priority={task.priority} />
            <StatusBadge status={localStatus} />
          </div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>{task.description}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 11, color: '#8B5CF6', backgroundColor: '#F5F3FF', padding: '2px 8px', borderRadius: 10, fontWeight: 500 }}>
              {task.supplier}
            </span>
            {task.assignee ? (
              <span style={{ fontSize: 11, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                <UserCheck size={11} />{task.assignee}
              </span>
            ) : (
              <span style={{ fontSize: 11, color: '#94A3B8', fontStyle: 'italic' }}>Unassigned</span>
            )}
            <span style={{ fontSize: 11, color: '#94A3B8', display: 'flex', alignItems: 'center', gap: 4 }}>
              <CalendarCheck size={11} />Due {task.dueDate}
            </span>
          </div>
        </div>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 6, flexShrink: 0, flexWrap: 'wrap' }}>
          {localStatus !== 'In Progress' && localStatus !== 'Resolved' && (
            <button
              onClick={() => setLocalStatus('In Progress')}
              style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: '1px solid #BAE6FD', backgroundColor: '#EFF6FF', color: '#0EA5E9', cursor: 'pointer' }}
            >
              Assign
            </button>
          )}
          {localStatus !== 'Resolved' && (
            <button
              onClick={() => setLocalStatus('Resolved')}
              style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: '1px solid #A7F3D0', backgroundColor: '#ECFDF5', color: '#10B981', cursor: 'pointer' }}
            >
              Resolve
            </button>
          )}
          <button
            style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: '1px solid #FECACA', backgroundColor: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}
          >
            Escalate
          </button>
          <button
            onClick={() => setShowComment(v => !v)}
            style={{ fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 7, border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', color: '#64748B', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}
          >
            <MessageSquare size={11} /> Comment
          </button>
        </div>
      </div>
      {showComment && (
        <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
          <input
            value={comment}
            onChange={e => setComment(e.target.value)}
            placeholder="Add a comment or note..."
            style={{ flex: 1, border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 12px', fontSize: 12, outline: 'none', color: '#334155' }}
          />
          <button
            onClick={() => { setComment(''); setShowComment(false); }}
            style={{ padding: '7px 14px', borderRadius: 7, border: 'none', backgroundColor: agentColor, color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}
          >
            <Send size={11} /> Send
          </button>
        </div>
      )}
    </div>
  );
}

/* ── Timeline Item ────────────────────────────────────── */
function TimelineItem({ entry, isLast }: { entry: TimelineEntry; isLast: boolean }) {
  const cfg = {
    alert:   { color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', dot: '#EF4444' },
    warning: { color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A', dot: '#F59E0B' },
    success: { color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', dot: '#10B981' },
    info:    { color: '#0EA5E9', bg: '#EFF6FF', border: '#BAE6FD', dot: '#0EA5E9' },
  }[entry.status];

  return (
    <div style={{ display: 'flex', gap: 12, marginBottom: isLast ? 0 : 16, position: 'relative' }}>
      {/* Timeline line */}
      {!isLast && (
        <div style={{ position: 'absolute', left: 7, top: 20, bottom: -16, width: 1, backgroundColor: '#E2E8F0', zIndex: 0 }} />
      )}
      {/* Dot */}
      <div style={{ width: 15, height: 15, borderRadius: '50%', backgroundColor: cfg.dot, flexShrink: 0, marginTop: 2, zIndex: 1, border: '2px solid #fff', boxShadow: `0 0 0 2px ${cfg.dot}33` }} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', marginBottom: 2 }}>{entry.time}</div>
        <div style={{ fontSize: 13, color: '#334155', lineHeight: 1.4 }}>{entry.event}</div>
      </div>
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
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'All'>('All');
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  const tasks = AGENT_TASKS[agent.id] || [];
  const timeline = AGENT_TIMELINE[agent.id] || [];

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter(t => t.status === taskFilter);
  const openCount = tasks.filter(t => t.status === 'Open').length;
  const inProgressCount = tasks.filter(t => t.status === 'In Progress').length;

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [logs]);

  useEffect(() => {
    if (agent.status !== 'Active') return;
    const queue = STREAM_QUEUES[agent.id] || [];
    if (!queue.length) return;
    const interval = setInterval(() => {
      setStreamIdx(prev => {
        const idx = prev % queue.length;
        const entry = queue[idx];
        const now = new Date();
        setLogs(l => [...l, { ...entry, id: `live_${Date.now()}_${idx}`, time: now.toTimeString().slice(0, 8) }]);
        return prev + 1;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [agent.id, agent.status]);

  useEffect(() => {
    if (agent.status !== 'Active') return;
    const t = setInterval(() => setPulse(p => !p), 800);
    return () => clearInterval(t);
  }, [agent.status]);

  const avatarUrl = `https://api.dicebear.com/7.x/personas/svg?seed=${agent.avatarSeed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;

  return (
    <div style={{ maxWidth: 1200, fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>
      {/* Back */}
      <button
        onClick={() => navigate('/agents')}
        style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0 }}
      >
        <ArrowLeft size={16} /> Back to Agents
      </button>

      {/* ── 1. AGENT PROFILE HEADER ──────────────────── */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, padding: '24px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{ position: 'relative', flexShrink: 0 }}>
            <img
              src={avatarUrl}
              alt={agent.name}
              width={72}
              height={72}
              style={{ borderRadius: '50%', border: `3px solid ${agent.color}40`, backgroundColor: '#F1F5F9', display: 'block' }}
            />
            {/* Status dot */}
            <div style={{
              position: 'absolute', bottom: 2, right: 2,
              width: 14, height: 14, borderRadius: '50%',
              backgroundColor: agent.status === 'Active' ? '#10B981' : '#94A3B8',
              border: '2px solid #fff',
              opacity: agent.status === 'Active' ? (pulse ? 1 : 0.4) : 1,
              transition: 'opacity 0.3s',
            }} />
          </div>

          {/* Name + role */}
          <div style={{ flex: 1, minWidth: 180 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 2 }}>
              <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', margin: 0 }}>{agent.name}</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: agent.status === 'Active' ? '#ECFDF5' : '#F1F5F9', padding: '4px 10px', borderRadius: 20, border: `1px solid ${agent.status === 'Active' ? '#A7F3D0' : '#E2E8F0'}` }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: agent.status === 'Active' ? '#10B981' : '#94A3B8', opacity: agent.status === 'Active' ? (pulse ? 1 : 0.3) : 1, transition: 'opacity 0.3s' }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: agent.status === 'Active' ? '#10B981' : '#94A3B8' }}>
                  {agent.status === 'Active' ? 'LIVE' : 'IDLE'}
                </span>
              </div>
            </div>
            <div style={{ fontSize: 13, color: '#64748B', marginBottom: 4 }}>{agent.role}</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>
              {agent.controls.length} controls · {agent.suppliers.length} suppliers · Alert sensitivity: {agent.alertLevel || 'Low'}
            </div>
          </div>

          {/* Stats */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            {[
              { label: 'UPTIME', value: agent.uptime, color: '#0EA5E9', bg: '#F8FAFC', border: '#E2E8F0' },
              { label: 'ALERTS', value: String(agent.alerts), color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC', border: agent.alerts > 0 ? '#FDE68A' : '#E2E8F0' },
              { label: 'NEXT EVAL', value: agent.nextEval, color: '#6366F1', bg: '#F8FAFC', border: '#E2E8F0' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '8px 14px', backgroundColor: s.bg, borderRadius: 10, border: `1px solid ${s.border}` }}>
                <div style={{ fontSize: 18, fontWeight: 800, color: s.color }}>{s.value}</div>
                <div style={{ fontSize: 10, color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Task bar */}
        <div style={{ marginTop: 16, backgroundColor: `${agent.color}0A`, border: `1px solid ${agent.color}30`, borderRadius: 8, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Activity size={13} color={agent.color} />
          <span style={{ fontSize: 11, fontWeight: 700, color: agent.color, textTransform: 'uppercase', letterSpacing: '0.07em', flexShrink: 0 }}>Currently</span>
          <span style={{ fontSize: 13, color: '#334155' }}>{agent.currentTask}</span>
        </div>
      </div>

      {/* ── 2. AGENT OVERVIEW CARD ───────────────────── */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px 20px', marginBottom: 16, boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 14, display: 'flex', alignItems: 'center', gap: 6 }}>
          <BarChart2 size={14} color="#6366F1" />
          <span style={{ textTransform: 'uppercase', letterSpacing: '0.07em', fontSize: 11, color: '#64748B' }}>Agent Overview</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { label: 'Suppliers Monitored', value: agent.suppliers.length, icon: <Users size={16} color="#8B5CF6" />, color: '#8B5CF6', bg: '#F5F3FF' },
            { label: 'Controls Active',     value: agent.controls.length,  icon: <Shield size={16} color="#0EA5E9" />, color: '#0EA5E9', bg: '#EFF6FF' },
            { label: 'Open Alerts',         value: agent.alerts,           icon: <Bell size={16} color={agent.alerts > 0 ? '#F59E0B' : '#94A3B8'} />, color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC' },
            { label: 'Open Tasks',          value: openCount + inProgressCount, icon: <FileText size={16} color={openCount > 0 ? '#EF4444' : '#10B981'} />, color: openCount > 0 ? '#EF4444' : '#10B981', bg: openCount > 0 ? '#FEF2F2' : '#ECFDF5' },
            { label: 'Last Scan',           value: agent.lastScan,         icon: <Clock size={16} color="#6366F1" />, color: '#6366F1', bg: '#EEF2FF' },
          ].map(m => (
            <div key={m.label} style={{ backgroundColor: m.bg, borderRadius: 10, padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                {m.icon}
                <span style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT: Left + Right ─────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: 16, alignItems: 'start' }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

          {/* Assigned Controls */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <Shield size={14} color="#0EA5E9" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Assigned Controls</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {agent.controls.map(c => (
                <div key={c} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', padding: '6px 10px', backgroundColor: '#F8FAFC', borderRadius: 7 }}>
                  <CheckCircle2 size={12} color="#10B981" />{c}
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Suppliers */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
              <TrendingUp size={14} color="#8B5CF6" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Monitoring Suppliers</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {agent.suppliers.map(s => (
                <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#334155', padding: '6px 10px', backgroundColor: '#F5F3FF', borderRadius: 7 }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#8B5CF6', flexShrink: 0 }} />{s}
                </div>
              ))}
              {agent.suppliers.length === 0 && <span style={{ fontSize: 12, color: '#94A3B8' }}>No suppliers assigned</span>}
            </div>
          </div>

          {/* Connected Systems */}
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

          {/* ── 4. AGENT ACTIVITY TIMELINE ──────────── */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, padding: '16px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <div
              style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: timelineCollapsed ? 0 : 14, cursor: 'pointer' }}
              onClick={() => setTimelineCollapsed(v => !v)}
            >
              <GitMerge size={14} color="#6366F1" />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.08em', flex: 1 }}>Activity Timeline</span>
              {timelineCollapsed ? <ChevronDown size={13} color="#94A3B8" /> : <ChevronUp size={13} color="#94A3B8" />}
            </div>
            {!timelineCollapsed && (
              <div>
                {timeline.map((entry, idx) => (
                  <TimelineItem key={entry.id} entry={entry} isLast={idx === timeline.length - 1} />
                ))}
                {timeline.length === 0 && <span style={{ fontSize: 12, color: '#94A3B8' }}>No timeline entries</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* ── 3. AGENT TASKS PANEL ─────────────────── */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Flag size={15} color="#EF4444" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Agent Tasks</span>
                {tasks.length > 0 && (
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#fff', backgroundColor: '#EF4444', padding: '1px 8px', borderRadius: 20 }}>{tasks.length}</span>
                )}
              </div>
              {/* Filter pills */}
              <div style={{ display: 'flex', gap: 6 }}>
                {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setTaskFilter(f as TaskStatus | 'All')}
                    style={{
                      fontSize: 11, fontWeight: 600, padding: '4px 12px', borderRadius: 20, cursor: 'pointer',
                      backgroundColor: taskFilter === f ? agent.color : '#F8FAFC',
                      color: taskFilter === f ? '#fff' : '#64748B',
                      border: `1px solid ${taskFilter === f ? agent.color : '#E2E8F0'}`,
                    }}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ padding: '16px 20px' }}>
              {filteredTasks.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '32px', color: '#94A3B8', fontSize: 13 }}>
                  <CheckCircle2 size={32} color="#A7F3D0" style={{ display: 'block', margin: '0 auto 8px' }} />
                  No {taskFilter !== 'All' ? taskFilter.toLowerCase() + ' ' : ''}tasks for this agent
                </div>
              ) : (
                filteredTasks.map(task => <TaskRow key={task.id} task={task} agentColor={agent.color} />)
              )}
            </div>
          </div>

          {/* ── LIVE ACTIVITY FEED ──────────────────── */}
          <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column', height: 520 }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Zap size={16} color="#F59E0B" />
                <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A' }}>Activity Feed</span>
                {agent.status === 'Active' && (
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 20, border: '1px solid #A7F3D0' }}>STREAMING LIVE</span>
                )}
              </div>
              <span style={{ fontSize: 12, color: '#94A3B8' }}>{logs.length} entries</span>
            </div>

            {/* Legend */}
            <div style={{ padding: '8px 20px', borderBottom: '1px solid #F1F5F9', display: 'flex', gap: 8, flexWrap: 'wrap', flexShrink: 0, backgroundColor: '#FAFAFA' }}>
              {Object.entries(LOG_STYLE).map(([type, s]) => (
                <span key={type} style={{ fontSize: 10, fontWeight: 700, color: s.color, backgroundColor: s.bg, padding: '1px 7px', borderRadius: 4 }}>{s.label}</span>
              ))}
              <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 4 }}>· Click REASON to expand</span>
            </div>

            {/* Feed */}
            <div ref={feedRef} style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
              {logs.map(entry => <LogRow key={entry.id} entry={entry} />)}
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
    </div>
  );
}
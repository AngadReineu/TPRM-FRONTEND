import type {
  Status,
  LogType,
  LogEntry,
  AgentTask,
  TimelineEntry,
  Agent,
  AgentDefinition,
} from '../types';
import type { Stage } from '@/types/shared';

/* ── Status display helpers ──────────────────────────── */

export const STATUS_CLR: Record<Status, string> = {
  live: '#10B981',
  active: '#0EA5E9',
  syncing: '#F59E0B',
  idle: '#CBD5E1',
};

export const STATUS_LABEL: Record<Status, string> = {
  live: 'Live',
  active: 'Active',
  syncing: 'Syncing',
  idle: 'Idle',
};

/* ── Stage colors (agent-specific version) ───────────── */

export const STAGE_CLR: Record<Stage, [string, string]> = {
  Acquisition: ['#EFF6FF', '#0EA5E9'],
  Retention: ['#ECFDF5', '#10B981'],
  Upgradation: ['#FFFBEB', '#F59E0B'],
  Offboarding: ['#F1F5F9', '#64748B'],
};

/* ── Log type styles ─────────────────────────────────── */

export const LOG_STYLE: Record<LogType, { color: string; bg: string; label: string }> = {
  fetch:     { color: '#06B6D4', bg: '#ECFEFF', label: 'FETCH'  },
  evaluate:  { color: '#0EA5E9', bg: '#EFF6FF', label: 'EVAL'   },
  reasoning: { color: '#8B5CF6', bg: '#F5F3FF', label: 'REASON' },
  success:   { color: '#10B981', bg: '#ECFDF5', label: 'PASS'   },
  warning:   { color: '#F59E0B', bg: '#FFFBEB', label: 'WARN'   },
  action:    { color: '#64748B', bg: '#F8FAFC', label: 'ACTION' },
  decision:  { color: '#6366F1', bg: '#EEF2FF', label: 'NEXT'   },
  error:     { color: '#EF4444', bg: '#FEF2F2', label: 'ERROR'  },
};

/* ── Avatar gradients ────────────────────────────────── */

export const AVATAR_GRADIENTS = [
  'linear-gradient(135deg,#0EA5E9,#6366F1)',
  'linear-gradient(135deg,#10B981,#0EA5E9)',
  'linear-gradient(135deg,#8B5CF6,#EC4899)',
  'linear-gradient(135deg,#F59E0B,#EF4444)',
  'linear-gradient(135deg,#06B6D4,#8B5CF6)',
  'linear-gradient(135deg,#EF4444,#EC4899)',
];

/* ── Control lists ───────────────────────────────────── */

export const PROCESS_CONTROLS = [
  'SLA Adherence Policy',
  'Supplier Onboarding Checklist',
  'Contractual Obligation Review',
  'Invoice Approval Workflow',
  'Access Revocation on Exit',
  'Third-Party Risk Assessment',
];

export const TECHNICAL_CONTROLS = [
  'MFA Enforcement',
  'Data Classification Policy',
  'Backup Verification',
  'Access Review Policy',
  'Encryption Standard Audit',
  'Vulnerability Scan Cadence',
];

export const DOCUMENT_CONTROLS = [
  'ISO 27001 Certificate Review',
  'NDA Compliance Check',
  'Data Processing Agreement (DPA)',
  'SOW Signature Verification',
  'Audit Report Review',
  'Policy Acknowledgement Tracker',
];

/* ── Suppliers list ──────────────────────────────────── */

export const SUPPLIERS_LIST = ['XYZ Corporation', 'ABC Services', 'DEF Limited', 'GHI Technologies'];

/* ── Stage list ──────────────────────────────────────── */

export const STAGES: Stage[] = ['Acquisition', 'Retention', 'Upgradation', 'Offboarding'];

/* ── Avatar seeds for picker ─────────────────────────── */

export const AVATAR_SEEDS = [
  { seed: 'Aria',   label: 'Aria'   },
  { seed: 'Blake',  label: 'Blake'  },
  { seed: 'Casey',  label: 'Casey'  },
  { seed: 'Dana',   label: 'Dana'   },
  { seed: 'Ellis',  label: 'Ellis'  },
  { seed: 'Felix',  label: 'Felix'  },
  { seed: 'Grace',  label: 'Grace'  },
  { seed: 'Harper', label: 'Harper' },
  { seed: 'Indira', label: 'Indira' },
  { seed: 'Jordan', label: 'Jordan' },
  { seed: 'Kai',    label: 'Kai'    },
  { seed: 'Luna',   label: 'Luna'   },
];

/* ── Mock Agents (list-view data) ────────────────────── */

const MOCK_AGENTS: Agent[] = [
  {
    id: 'a1', name: 'Agent Aria', initials: 'A1', status: 'live', stage: 'Acquisition',
    controls: 4, suppliers: 2, gradient: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
    alerts: 2, lastActive: '2 min ago', health: 82, division: 'Marketing Dept',
    frequency: 'Hourly', notify: ['Risk Manager', 'Compliance Officer'],
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com', truthMatch: 50,
    agentName: 'Agent Aria', role: 'Contract & Process Compliance Specialist', color: '#0EA5E9', avatarSeed: 'Aria',
    uptime: '99.1%', nextEval: 'In 45 min', lastScan: '09:14 AM', openTasks: 3,
    currentTask: 'Auditing SOW signatures and contractual obligation timelines for XYZ Corporation',
  },
  {
    id: 'a2', name: 'Agent Blake', initials: 'A2', status: 'active', stage: 'Retention',
    controls: 3, suppliers: 3, gradient: 'linear-gradient(135deg, #10B981, #0EA5E9)',
    alerts: 0, lastActive: '8 min ago', health: 94, division: 'Operations Dept',
    frequency: 'Daily', notify: ['Risk Manager'],
    internalSPOC: 'raj@abc.co', externalSPOC: 'ops@abc.com', truthMatch: 100,
    agentName: 'Agent Blake', role: 'SLA & Supplier Process Monitor', color: '#10B981', avatarSeed: 'Blake',
    uptime: '98.7%', nextEval: 'In 2 hrs', lastScan: '08:52 AM', openTasks: 1,
    currentTask: 'Verifying SLA adherence and invoice approval workflows across 3 suppliers',
  },
  {
    id: 'a3', name: 'Agent Casey', initials: 'A3', status: 'syncing', stage: 'Upgradation',
    controls: 4, suppliers: 1, gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899)',
    alerts: 3, lastActive: 'just now', health: 61, division: 'Technical Dept',
    frequency: 'Every 6hrs', notify: ['Risk Manager', 'DPO', 'Admin'],
    internalSPOC: 'anita@abc.co', externalSPOC: 'info@def.com', truthMatch: 0,
    agentName: 'Agent Casey', role: 'Network & Access Review Auditor', color: '#8B5CF6', avatarSeed: 'Casey',
    uptime: '97.3%', nextEval: 'In 1 hr', lastScan: '08:30 AM', openTasks: 5,
    currentTask: 'Running quarterly access review across Active Directory',
  },
];

export const openAlerts = { total: 5, critical: 3, high: 2 };

/* ── Agent Definitions (detail-view data) ────────────── */

const AGENTS: Record<string, AgentDefinition> = {
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

/* ── Tasks per agent (detail-view) ───────────────────── */

const AGENT_TASKS_DETAIL: Record<string, AgentTask[]> = {
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

/* ── Tasks per agent (list-view) ─────────────────────── */

const AGENT_TASKS_LIST: Record<string, AgentTask[]> = {
  a1: [
    { id: 't1', title: 'SOW Signed After Service Start — XYZ Corporation', supplier: 'XYZ Corporation', priority: 'High', assignee: 'priya@abc.co', status: 'Open', dueDate: '2026-03-07', description: 'SOW signed Feb 10, but service delivery started Feb 5. Contractual risk — legal review required.' },
    { id: 't2', title: 'Unapproved Payment of \u20B910L — No PO Found', supplier: 'XYZ Corporation', priority: 'High', assignee: 'anita@abc.co', status: 'In Progress', dueDate: '2026-03-06', description: '\u20B910L payment detected with no corresponding PO approval in email thread. Finance Controller to investigate.' },
    { id: 't3', title: 'ISO 27001 Certificate Renewal — 22 Days Remaining', supplier: 'XYZ Corporation', priority: 'Medium', assignee: '', status: 'Open', dueDate: '2026-03-26', description: 'Certificate expires Mar 26. Supplier to submit renewal proof within 15 days per contract terms.' },
    { id: 't4', title: 'TPRA Overdue — GHI Technologies', supplier: 'GHI Technologies', priority: 'High', assignee: 'priya@abc.co', status: 'Open', dueDate: '2026-03-05', description: 'Annual Third-Party Risk Assessment 3 days overdue. Last score: Medium Risk (48/100). Escalation in progress.' },
  ],
  a2: [
    { id: 't4', title: 'SLA Breach — ABC Services Uptime 98.1% vs 99.5%', supplier: 'ABC Services Ltd', priority: 'High', assignee: 'raj@abc.co', status: 'In Progress', dueDate: '2026-03-08', description: 'SLA breach of 1.4% in Feb 2026. Penalty clause applicable. Acknowledgement from supplier overdue.' },
    { id: 't5', title: 'MNO Partners Onboarding — 3 Items Missing', supplier: 'MNO Partners', priority: 'Medium', assignee: 'raj@abc.co', status: 'Open', dueDate: '2026-03-12', description: 'BCP document, cyber insurance cert, and sub-processor list not yet submitted. Checklist at 62%.' },
    { id: 't6', title: 'DPA Sub-Processor Annex — JKL Consultancy', supplier: 'JKL Consultancy', priority: 'Medium', assignee: '', status: 'Open', dueDate: '2026-03-14', description: 'DPA missing sub-processor annex per GDPR Article 28(2). Legal team to follow up.' },
  ],
  a3: [
    { id: 't5', title: 'Revoke Access — 3 Orphaned Accounts', supplier: 'DEF Limited', priority: 'High', assignee: 'it-admin@abc.co', status: 'In Progress', dueDate: '2026-03-05', description: 'Accounts U1042, U1098, U1187 belong to terminated employees with active access.' },
    { id: 't6', title: 'Patch 3 Servers — Feb 2026 Security Rollup', supplier: 'DEF Limited', priority: 'High', assignee: 'sysadmin@abc.co', status: 'Open', dueDate: '2026-03-10', description: '3 servers missing Feb 2026 security rollup. SLA breach in 8 days.' },
    { id: 't7', title: 'Document Approved VLAN Exceptions', supplier: 'DEF Limited', priority: 'Low', assignee: '', status: 'Open', dueDate: '2026-03-20', description: '2 cross-VLAN firewall exceptions approved in ServiceNow. Audit documentation required.' },
    { id: 't8', title: 'Access Review Sign-off by Dept Heads', supplier: 'DEF Limited', priority: 'Medium', assignee: 'hr@abc.co', status: 'Open', dueDate: '2026-03-12', description: 'Quarterly access review results require department head sign-off.' },
    { id: 't9', title: 'Update Insider Threat Runbook', supplier: 'DEF Limited', priority: 'Low', assignee: '', status: 'Open', dueDate: '2026-03-25', description: 'IR Plan references outdated escalation contacts. Update required.' },
  ],
};

/* ── Timeline per agent (detail-view) ────────────────── */

const AGENT_TIMELINE_DETAIL: Record<string, TimelineEntry[]> = {
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

/* ── Timeline per agent (list-view) ──────────────────── */

const AGENT_TIMELINE_LIST: Record<string, TimelineEntry[]> = {
  a1: [
    { id: 'tl1', time: '09:14 AM', event: 'MFA audit completed — 94.5% coverage across 847 assets', status: 'success' },
    { id: 'tl2', time: '09:08 AM', event: 'ServiceNow ticket VULN-2847 auto-created for critical CVE patch', status: 'alert' },
    { id: 'tl3', time: '09:05 AM', event: 'Email dispatched to Risk Manager & Compliance Officer re: CVE breach risk', status: 'warning' },
    { id: 'tl4', time: '08:55 AM', event: 'JIT access session audit completed — 14 sessions, 0 standing access', status: 'success' },
    { id: 'tl5', time: '08:40 AM', event: 'Supplier XYZ Corporation contract expiry flagged — 15 days remaining', status: 'warning' },
    { id: 'tl6', time: '08:20 AM', event: 'MFA enrollment advisory sent to 3 non-compliant admin accounts', status: 'info' },
  ],
  a2: [
    { id: 'tl1', time: '08:52 AM', event: 'SLA breach confirmed — ABC Services uptime 98.1% vs 99.5% contracted', status: 'alert' },
    { id: 'tl2', time: '08:45 AM', event: 'Penalty clause notification queued for raj@abc.co (awaiting review)', status: 'warning' },
    { id: 'tl3', time: '08:30 AM', event: 'Supplier onboarding: MNO Partners at 62% — 3 items missing, reminder sent', status: 'warning' },
    { id: 'tl4', time: '08:15 AM', event: 'DPA reviewed: JKL Consultancy missing sub-processor annex — legal flagged', status: 'alert' },
    { id: 'tl5', time: '07:58 AM', event: 'Invoice INV-20260228 (\u20B94.2L) verified — PO approval confirmed, no anomalies', status: 'success' },
    { id: 'tl6', time: '07:40 AM', event: 'Access revocation triggered: mark@abc-services.com (offboarded Feb 15)', status: 'info' },
  ],
  a3: [
    { id: 'tl1', time: '08:30 AM', event: 'Orphaned account revocation initiated — U1042, U1098, U1187', status: 'alert' },
    { id: 'tl2', time: '08:25 AM', event: 'PATCH-3319 escalated to P1 — 3 servers missing Feb 2026 rollup', status: 'warning' },
    { id: 'tl3', time: '08:10 AM', event: 'Network segmentation confirmed — VLAN 10/20 isolation verified', status: 'success' },
    { id: 'tl4', time: '07:50 AM', event: 'IR runbooks validated — all current, last updated Feb 2026', status: 'success' },
    { id: 'tl5', time: '07:30 AM', event: 'Quarterly access review initiated — 1,240 AD accounts scanned', status: 'info' },
  ],
};

/* ── Log sequences ───────────────────────────────────── */

function buildInitialLogsDetail(agentId: string): LogEntry[] {
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
      { id: '4', time: ts(410), type: 'reasoning', message: 'Analyzing authentication logs across 847 assets', detail: 'Found 3 admin accounts with MFA disabled. Coverage calculated at 94.2%. Threshold is 90% \u2014 currently passing. Flagging 3 accounts for remediation advisory.' },
      { id: '5', time: ts(405), type: 'success',   message: 'MFA Enforcement: PASSED \u2014 94% coverage (847 assets)' },
      { id: '6', time: ts(400), type: 'action',    message: 'Advisory email sent: 3 accounts flagged for MFA enrollment' },
      { id: '7', time: ts(380), type: 'fetch',     message: 'Connecting to Splunk SIEM for vulnerability data' },
      { id: '8', time: ts(375), type: 'evaluate',  message: 'Running evaluation: Vulnerability Scanning' },
      { id: '9', time: ts(360), type: 'reasoning', message: 'Parsing Splunk vulnerability index for CVE entries', detail: '12 open CVEs detected. 2 Critical (CVSS \u2265 9.0): CVE-2024-4711, CVE-2024-3890. Patch SLA is 30 days \u2014 both are 26 days old. Breach in 4 days.' },
      { id: '10', time: ts(355), type: 'warning',  message: 'Vulnerability Scanning: HIGH RISK \u2014 2 critical CVEs near SLA breach' },
      { id: '11', time: ts(352), type: 'action',   message: 'ServiceNow ticket created: VULN-2847 (P1)' },
      { id: '12', time: ts(350), type: 'action',   message: 'Email alert dispatched \u2192 Risk Manager, Compliance Officer' },
      { id: '13', time: ts(340), type: 'evaluate', message: 'Running evaluation: Privileged Access Mgmt' },
      { id: '14', time: ts(330), type: 'reasoning', message: 'Checking JIT access logs for admin operations', detail: 'All 14 admin sessions in last 24h used JIT. No standing access detected. Privileged accounts: 14 active, 0 orphaned.' },
      { id: '15', time: ts(320), type: 'success',  message: 'Privileged Access Mgmt: PASSED \u2014 100% JIT compliance' },
    ],
    a2: [
      { id: '1', time: ts(300), type: 'fetch',     message: 'Fetching storage inventory from Azure Blob & S3' },
      { id: '2', time: ts(295), type: 'evaluate',  message: 'Running evaluation: Encryption at Rest' },
      { id: '3', time: ts(285), type: 'reasoning', message: 'Scanning 312 Azure assets for AES-256 encryption status', detail: '312 Azure assets checked. 206/312 (66%) encrypted. 106 assets on legacy config \u2014 not AES-256. Coverage below 70% threshold.' },
      { id: '4', time: ts(280), type: 'warning',   message: 'Encryption at Rest: BELOW THRESHOLD \u2014 67% (need 70%)' },
      { id: '5', time: ts(275), type: 'action',    message: 'Ticket raised: ENC-1104 \u2014 106 assets require encryption upgrade' },
      { id: '6', time: ts(260), type: 'fetch',     message: 'Pulling data classification metadata from Microsoft 365' },
      { id: '7', time: ts(250), type: 'evaluate',  message: 'Running evaluation: Data Classification Policy' },
      { id: '8', time: ts(240), type: 'reasoning', message: 'Auditing 156 M365 assets for classification labels', detail: 'Checked 156 M365 assets. 142 classified (91%). 14 unclassified \u2014 9 are email archives, 5 are SharePoint docs created in last 7 days (within grace period).' },
      { id: '9', time: ts(232), type: 'success',   message: 'Data Classification Policy: PASSED \u2014 91% labelled' },
      { id: '10', time: ts(220), type: 'fetch',    message: 'Checking supplier STU Analytics assessment status' },
      { id: '11', time: ts(215), type: 'reasoning', message: 'Reviewing supplier risk posture for STU Analytics', detail: 'Score: 22 (Low). Assessment complete. PII sharing not configured. Contract ends Jul 2028. No immediate risk.' },
      { id: '12', time: ts(210), type: 'action',   message: 'Supplier note: STU Analytics PII config pending \u2014 flagged for DPO' },
    ],
    a3: [
      { id: '1', time: ts(500), type: 'fetch',     message: 'Pulling Active Directory user list (quarterly review cycle)' },
      { id: '2', time: ts(490), type: 'evaluate',  message: 'Running evaluation: Access Review Policy' },
      { id: '3', time: ts(475), type: 'reasoning', message: 'Cross-referencing AD users against HR offboarding records', detail: '1,240 user accounts reviewed. 8 accounts belong to employees terminated in last 90 days. 3 still have active resource access. Immediate revocation required.' },
      { id: '4', time: ts(465), type: 'warning',   message: 'Access Review: 3 orphaned accounts with active access detected' },
      { id: '5', time: ts(460), type: 'action',    message: 'Auto-revocation initiated for accounts: U1042, U1098, U1187' },
      { id: '6', time: ts(455), type: 'action',    message: 'Notification sent to IT Admin + HR compliance team' },
      { id: '7', time: ts(440), type: 'evaluate',  message: 'Running evaluation: Network Segmentation' },
      { id: '8', time: ts(425), type: 'reasoning', message: 'Scanning VLAN topology \u2014 prod vs. staging isolation', detail: 'VLAN rules reviewed. Production (VLAN 10) and Staging (VLAN 20) properly isolated. 2 cross-VLAN firewall rules exist \u2014 both are approved exceptions in ServiceNow.' },
      { id: '9', time: ts(415), type: 'success',   message: 'Network Segmentation: PASSED \u2014 isolation confirmed, 2 approved exceptions on record' },
      { id: '10', time: ts(400), type: 'evaluate', message: 'Running evaluation: Incident Response Plan' },
      { id: '11', time: ts(385), type: 'reasoning', message: 'Checking IR runbooks last update date and tabletop exercise records', detail: 'IR Plan last updated: Feb 2026. Tabletop exercise: Jan 2026. Both within SLA. Runbooks cover: ransomware, data breach, insider threat. No open P1 incidents.' },
      { id: '12', time: ts(375), type: 'success',  message: 'Incident Response Plan: PASSED \u2014 all runbooks current' },
    ],
    a4: [
      { id: '1', time: ts(3600), type: 'fetch',    message: 'Scheduled backup verification triggered at 02:00 UTC' },
      { id: '2', time: ts(3590), type: 'evaluate', message: 'Running evaluation: Backup Verification' },
      { id: '3', time: ts(3575), type: 'fetch',    message: 'Connecting to backup storage \u2014 Azure Recovery Vault' },
      { id: '4', time: ts(3560), type: 'reasoning', message: 'Verifying integrity of last 7 days of backup snapshots', detail: 'Checked 14 backup snapshots (2/day). All checksums valid. Last restore test: Feb 24, 2026. Restore time: 4.2 hrs (within 6 hr SLA).' },
      { id: '5', time: ts(3550), type: 'success',  message: 'Backup Verification: PASSED \u2014 14/14 snapshots verified' },
      { id: '6', time: ts(3540), type: 'decision', message: 'Next evaluation scheduled: Tomorrow 02:00 UTC' },
      { id: '7', time: ts(3520), type: 'action',   message: 'Agent entering idle state \u2014 no active triggers' },
    ],
    a5: [
      { id: '1', time: ts(180), type: 'fetch',     message: 'Connecting to Splunk for CVE vulnerability index' },
      { id: '2', time: ts(175), type: 'evaluate',  message: 'Running evaluation: Vulnerability Scanning' },
      { id: '3', time: ts(160), type: 'reasoning', message: 'Scanning production environment for unpatched CVEs', detail: 'Scanned 650 endpoints. 2 medium CVEs found: CVE-2024-7821 (CVSS 5.5) and CVE-2024-6634 (CVSS 6.1). Both in 30-day SLA window. Patches available upstream.' },
      { id: '4', time: ts(152), type: 'warning',   message: 'Vulnerability Scanning: 2 medium CVEs detected \u2014 SLA: 18 days remaining' },
      { id: '5', time: ts(148), type: 'action',    message: 'ServiceNow ticket created: VULN-2851 (P2)' },
      { id: '6', time: ts(140), type: 'evaluate',  message: 'Running evaluation: Patch Management' },
      { id: '7', time: ts(125), type: 'reasoning', message: 'Verifying patch compliance across OS versions', detail: 'OS patch review: 650 systems checked. 598 (92%) patched within SLA. 52 systems running OS versions 1-2 minor versions behind. No critical unpatched systems.' },
      { id: '8', time: ts(115), type: 'success',   message: 'Patch Management: PASSED \u2014 92% compliance (threshold: 85%)' },
    ],
  };
  return seqs[agentId] || seqs['a1'];
}

function buildInitialLogsList(agentId: string): LogEntry[] {
  const now = new Date();
  const ts = (off: number) => {
    const d = new Date(now.getTime() - off * 1000);
    return d.toTimeString().slice(0, 8);
  };
  const seqs: Record<string, LogEntry[]> = {
    a1: [
      { id: '1', time: ts(420), type: 'fetch',     message: 'Connecting to email integration \u2014 scanning priya@abc.co \u2194 john@xyz.com thread' },
      { id: '2', time: ts(415), type: 'fetch',     message: 'Pulling XYZ Corporation contract documents from SharePoint' },
      { id: '3', time: ts(410), type: 'evaluate',  message: 'Running evaluation: SOW Signature Verification' },
      { id: '4', time: ts(405), type: 'reasoning', message: 'Cross-referencing SOW date against service start date in emails', detail: 'SOW signed Feb 10. Email thread shows service delivery began Feb 5. 5-day gap \u2014 SOW signed after work commenced. Contractual Risk flagged.' },
      { id: '5', time: ts(400), type: 'warning',   message: 'SOW Signature Verification: ANOMALY \u2014 SOW signed after service start date' },
      { id: '6', time: ts(395), type: 'action',    message: 'Alert raised \u2192 Risk Manager, Compliance Officer. Ticket SOW-1041 created.' },
      { id: '7', time: ts(380), type: 'fetch',     message: 'Pulling bank transaction feed \u2014 checking for unapproved payments' },
      { id: '8', time: ts(375), type: 'evaluate',  message: 'Running evaluation: Invoice Approval Workflow' },
      { id: '9', time: ts(365), type: 'reasoning', message: 'Matching \u20B910L payment to PO approval chain', detail: 'Payment of \u20B910L detected on Feb 28. Searched email thread for PO approval. No approval found between priya@abc.co and john@xyz.com. Anomaly: Unapproved Payment.' },
      { id: '10', time: ts(358), type: 'error',    message: 'Invoice Approval Workflow: FAILED \u2014 \u20B910L payment with no PO approval' },
      { id: '11', time: ts(354), type: 'action',   message: 'Escalation email sent \u2192 Finance Controller + Risk Manager' },
      { id: '12', time: ts(340), type: 'evaluate', message: 'Running evaluation: ISO 27001 Certificate Review' },
      { id: '13', time: ts(328), type: 'reasoning', message: 'Parsing certificate metadata from document store', detail: 'ISO 27001 cert expiry: Mar 26, 2026. Today: Mar 4, 2026. 22 days remaining. Renewal SLA is 30 days \u2014 already in warning window.' },
      { id: '14', time: ts(320), type: 'warning',  message: 'ISO 27001 Certificate Review: EXPIRING SOON \u2014 22 days remaining' },
      { id: '15', time: ts(316), type: 'action',   message: 'Auto-renewal reminder sent to XYZ Corporation supplier contact' },
    ],
    a2: [
      { id: '1', time: ts(300), type: 'fetch',     message: 'Pulling SLA reports from ABC Services Ltd supplier portal' },
      { id: '2', time: ts(295), type: 'evaluate',  message: 'Running evaluation: SLA Adherence Policy' },
      { id: '3', time: ts(285), type: 'reasoning', message: 'Comparing reported uptime against contracted SLA thresholds', detail: 'ABC Services SLA: 99.5% uptime. Feb 2026 report: 98.1%. Breach of 1.4%. Penalty clause in contract applies above 0.5% deviation.' },
      { id: '4', time: ts(280), type: 'error',     message: 'SLA Adherence: BREACH \u2014 ABC Services uptime 98.1% vs 99.5% contracted' },
      { id: '5', time: ts(275), type: 'action',    message: 'SLA breach ticket raised. Penalty clause notification queued for raj@abc.co' },
      { id: '6', time: ts(260), type: 'fetch',     message: 'Pulling supplier onboarding checklist status for MNO Partners' },
      { id: '7', time: ts(250), type: 'evaluate',  message: 'Running evaluation: Supplier Onboarding Checklist' },
      { id: '8', time: ts(240), type: 'reasoning', message: 'Reviewing checklist completion across 8 required onboarding items', detail: '8 items total. Completed: 5. Missing: BCP document (item 6), cyber insurance certificate (item 7), sub-processor list (item 8). Checklist 62.5% complete.' },
      { id: '9', time: ts(232), type: 'warning',   message: 'Supplier Onboarding: INCOMPLETE \u2014 MNO Partners 62% (3 items missing)' },
      { id: '10', time: ts(225), type: 'action',   message: 'Automated reminder sent \u2192 MNO Partners. Escalation in 7 days if unresolved.' },
      { id: '11', time: ts(210), type: 'evaluate', message: 'Running evaluation: Data Processing Agreement \u2014 JKL Consultancy' },
      { id: '12', time: ts(195), type: 'reasoning', message: 'Reviewing DPA against GDPR Article 28 requirements', detail: 'DPA signed Jan 2026. Sub-processor annex not attached. Article 28(2) requires written authorisation for sub-processors. Flagging for legal review.' },
      { id: '13', time: ts(188), type: 'warning',  message: 'DPA Compliance: ISSUE \u2014 sub-processor annex missing from JKL Consultancy DPA' },
    ],
    a3: [
      { id: '1', time: ts(500), type: 'fetch',     message: 'Pulling Active Directory user list (quarterly review cycle)' },
      { id: '2', time: ts(490), type: 'evaluate',  message: 'Running evaluation: Access Review Policy' },
      { id: '3', time: ts(475), type: 'reasoning', message: 'Cross-referencing AD users against HR offboarding records', detail: '1,240 user accounts reviewed. 8 accounts belong to terminated employees. 3 still have active access. Immediate revocation required.' },
      { id: '4', time: ts(465), type: 'warning',   message: 'Access Review: 3 orphaned accounts with active access detected' },
      { id: '5', time: ts(460), type: 'action',    message: 'Auto-revocation initiated for accounts: U1042, U1098, U1187' },
      { id: '6', time: ts(455), type: 'action',    message: 'Notification sent to IT Admin + HR compliance team' },
      { id: '7', time: ts(440), type: 'evaluate',  message: 'Running evaluation: Network Segmentation' },
      { id: '8', time: ts(425), type: 'reasoning', message: 'Scanning VLAN topology \u2014 prod vs. staging isolation', detail: 'VLAN rules reviewed. VLAN 10 (prod) and VLAN 20 (staging) properly isolated. 2 cross-VLAN rules \u2014 both approved exceptions in ServiceNow.' },
      { id: '9', time: ts(415), type: 'success',   message: 'Network Segmentation: PASSED \u2014 isolation confirmed, 2 approved exceptions' },
      { id: '10', time: ts(400), type: 'evaluate', message: 'Running evaluation: Incident Response Plan' },
      { id: '11', time: ts(385), type: 'reasoning', message: 'Checking IR runbooks last update date and tabletop exercise records', detail: 'IR Plan last updated: Feb 2026. Tabletop exercise: Jan 2026. Both within SLA. Runbooks cover ransomware, data breach, insider threat.' },
      { id: '12', time: ts(375), type: 'success',  message: 'Incident Response Plan: PASSED \u2014 all runbooks current' },
    ],
  };
  return seqs[agentId] || seqs['a1'];
}

/* ── Stream queues (detail-view) ─────────────────────── */

const STREAM_QUEUES_DETAIL: Record<string, Array<Omit<LogEntry, 'id' | 'time'>>> = {
  a1: [
    { type: 'fetch',     message: 'Re-fetching API Integration for updated MFA status' },
    { type: 'evaluate',  message: 'Re-evaluating MFA Enforcement (scheduled 45-min cycle)' },
    { type: 'reasoning', message: 'Comparing current MFA coverage against last evaluation', detail: 'Previous: 94.2%. Current: 94.5%. 1 additional account enrolled. 2 accounts still pending enrollment.' },
    { type: 'success',   message: 'MFA Enforcement: PASSED \u2014 94.5% coverage (+0.3%)' },
    { type: 'fetch',     message: 'Polling supplier XYZ Corporation assessment portal' },
    { type: 'reasoning', message: 'Checking XYZ Corporation contract renewal window', detail: 'Contract expires Mar 2026 \u2014 15 days remaining. Risk score 78 (High). Recommendation: Initiate renewal or escalate to procurement.' },
    { type: 'warning',   message: 'XYZ Corporation contract expiring in 15 days \u2014 escalation required' },
    { type: 'action',    message: 'Contract renewal alert sent to Procurement & Risk Manager' },
    { type: 'decision',  message: 'Next: Privileged Access Mgmt re-evaluation in 30 min' },
  ],
  a2: [
    { type: 'fetch',     message: 'Checking new assets added to Azure in last 24h' },
    { type: 'reasoning', message: 'Scanning 3 newly created Azure resources for encryption', detail: '3 new Azure VMs detected. 2/3 encrypted at creation. 1 (vm-staging-09) missing encryption config.' },
    { type: 'warning',   message: 'New unencrypted VM detected: vm-staging-09' },
    { type: 'action',    message: 'Auto-remediation triggered: encryption policy applied to vm-staging-09' },
    { type: 'success',   message: 'Encryption at Rest: Auto-remediated \u2014 vm-staging-09 now encrypted' },
    { type: 'fetch',     message: 'Fetching MNO Partners supplier assessment status' },
    { type: 'reasoning', message: 'Reviewing MNO Partners offboarding stage risk', detail: 'MNO Partners: Assessment pending for 1 day. Contract ends Apr 2026. Risk score 55 (Medium). No PII sharing configured.' },
    { type: 'action',    message: 'Reminder queued for MNO Partners \u2014 pending assessment follow-up' },
  ],
  a3: [
    { type: 'fetch',     message: 'Pulling patch deployment status from ServiceNow CMDB' },
    { type: 'evaluate',  message: 'Running evaluation: Patch Management' },
    { type: 'reasoning', message: 'Comparing installed patch versions against vendor advisories', detail: 'OS patch compliance: 88%. 12 servers running unpatched versions. Most critical: 3 servers missing Feb 2026 security rollup. SLA: 30 days \u2014 8 days remaining.' },
    { type: 'warning',   message: 'Patch Management: 3 servers approaching SLA deadline (8 days)' },
    { type: 'action',    message: 'PATCH-3319 ticket escalated to P1 \u2014 assigned to SysAdmin team' },
    { type: 'decision',  message: 'Re-evaluating Patch Management in 24h unless patch deployed' },
  ],
  a4: [
    { type: 'action',    message: 'Agent idle \u2014 next trigger at 02:00 UTC tomorrow' },
    { type: 'decision',  message: 'Standby mode active \u2014 monitoring for event-driven triggers' },
  ],
  a5: [
    { type: 'fetch',     message: 'Re-scanning Splunk CVE index for new vulnerabilities' },
    { type: 'evaluate',  message: 'Running evaluation: Vulnerability Scanning (20-min cycle)' },
    { type: 'reasoning', message: 'Checking if existing CVEs have been patched since last scan', detail: 'CVE-2024-7821: still unpatched (Day 12/30). CVE-2024-6634: still unpatched (Day 12/30). No new CVEs detected in this scan cycle.' },
    { type: 'action',    message: 'Updated ticket VULN-2851 \u2014 patch still pending (Day 12/30)' },
    { type: 'decision',  message: 'Next vulnerability scan in 20 min' },
  ],
};

/* ── Stream queues (list-view) ───────────────────────── */

const STREAM_QUEUES_LIST: Record<string, Array<Omit<LogEntry, 'id' | 'time'>>> = {
  a1: [
    { type: 'fetch',     message: 'Re-scanning email thread: priya@abc.co \u2194 john@xyz.com for new communications' },
    { type: 'evaluate',  message: 'Running evaluation: Contractual Obligation Review (scheduled hourly)' },
    { type: 'reasoning', message: 'Checking 5 active contractual obligations for XYZ Corporation', detail: 'Obligation 3 (Monthly SLA Report) overdue by 3 days. Obligation 5 (Quarterly Risk Review) due in 2 days. All others current.' },
    { type: 'warning',   message: 'Contractual Obligation Review: 1 overdue obligation, 1 approaching deadline' },
    { type: 'action',    message: 'Overdue obligation escalation sent \u2192 priya@abc.co & john@xyz.com' },
    { type: 'evaluate',  message: 'Running evaluation: Third-Party Risk Assessment \u2014 GHI Technologies' },
    { type: 'reasoning', message: 'Checking TPRA due date and last submission from GHI Technologies', detail: 'Annual TPRA due Mar 1, 2026. Today is Mar 4 \u2014 3 days overdue. No updated assessment received. Previous score: Medium Risk (48/100).' },
    { type: 'error',     message: 'Third-Party Risk Assessment: OVERDUE \u2014 GHI Technologies TPRA 3 days past due' },
    { type: 'action',    message: 'Escalation notice dispatched \u2192 Risk Manager & Compliance Officer' },
    { type: 'decision',  message: 'Next: Invoice Approval Workflow re-scan in 30 min' },
  ],
  a2: [
    { type: 'fetch',     message: 'Pulling latest SLA report submission from ABC Services Ltd portal' },
    { type: 'evaluate',  message: 'Re-evaluating SLA Adherence Policy (daily cycle)' },
    { type: 'reasoning', message: 'Verifying whether SLA breach penalty has been acknowledged', detail: 'Penalty clause notification sent 2 days ago. No acknowledgement received from ABC Services. Escalation threshold: 3 business days.' },
    { type: 'warning',   message: 'SLA Breach: Penalty acknowledgement not received \u2014 escalation pending' },
    { type: 'action',    message: 'Escalation email queued \u2192 raj@abc.co + Legal team (due tomorrow)' },
    { type: 'decision',  message: 'Next: Supplier Onboarding Checklist follow-up for MNO Partners' },
  ],
  a3: [
    { type: 'fetch',     message: 'Pulling patch deployment status from ServiceNow CMDB' },
    { type: 'evaluate',  message: 'Running evaluation: Patch Management' },
    { type: 'reasoning', message: 'Comparing installed patch versions against vendor advisories', detail: 'OS patch compliance: 88%. 12 servers running unpatched versions. Most critical: 3 servers missing Feb 2026 security rollup. SLA: 30 days \u2014 8 days remaining.' },
    { type: 'warning',   message: 'Patch Management: 3 servers approaching SLA deadline (8 days)' },
    { type: 'action',    message: 'PATCH-3319 ticket escalated to P1 \u2014 assigned to SysAdmin team' },
  ],
};

/* ── Getter functions ────────────────────────────────── */

export function getMockAgents(): Agent[] {
  return [...MOCK_AGENTS];
}

export function getAgentDefinitions(): Record<string, AgentDefinition> {
  return AGENTS;
}

export function getAgentDefinitionById(id: string): AgentDefinition {
  return AGENTS[id] || AGENTS['a1'];
}

export function getAgentTasksDetail(id: string): AgentTask[] {
  return AGENT_TASKS_DETAIL[id] || [];
}

export function getAgentTasksList(id: string): AgentTask[] {
  return AGENT_TASKS_LIST[id] || [];
}

export function getAgentTimelineDetail(id: string): TimelineEntry[] {
  return AGENT_TIMELINE_DETAIL[id] || [];
}

export function getAgentTimelineList(id: string): TimelineEntry[] {
  return AGENT_TIMELINE_LIST[id] || [];
}

export function getInitialLogsDetail(agentId: string): LogEntry[] {
  return buildInitialLogsDetail(agentId);
}

export function getInitialLogsList(agentId: string): LogEntry[] {
  return buildInitialLogsList(agentId);
}

export function getStreamQueueDetail(agentId: string): Array<Omit<LogEntry, 'id' | 'time'>> {
  return STREAM_QUEUES_DETAIL[agentId] || [];
}

export function getStreamQueueList(agentId: string): Array<Omit<LogEntry, 'id' | 'time'>> {
  return STREAM_QUEUES_LIST[agentId] || [];
}

/** Generate a DiceBear avatar URL */
export function getAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/personas/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf`;
}

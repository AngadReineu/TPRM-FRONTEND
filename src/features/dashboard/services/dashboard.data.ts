import type { StageDataItem, AgentRow, RiskTrendPoint, RiskAlert } from '../types';

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS
   ══════════════════════════════════════════════════════ */
const token = {
  surface:    '#FFFFFF',
  border:     '#E9EEF4',
  shadow:     '0 1px 4px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
  radius:     14,
  padding:    24,
  labelSize:  11,
  metricSize: 38,
} as const;

export function getDesignTokens() {
  return token;
}

/* ══════════════════════════════════════════════════════
   STAGE DATA
   ══════════════════════════════════════════════════════ */
const stageData: StageDataItem[] = [
  { stage: 'Acquisition', color: '#0EA5E9', count: 18, critical: 2, high: 4, medium: 8, low: 4 },
  { stage: 'Retention',   color: '#10B981', count: 14, critical: 1, high: 3, medium: 6, low: 4 },
  { stage: 'Upgradation', color: '#F59E0B', count: 10, critical: 0, high: 2, medium: 5, low: 3 },
  { stage: 'Offboarding', color: '#94A3B8', count: 6,  critical: 1, high: 1, medium: 2, low: 2 },
];

const totalSuppliers = 48;

export function getStageData(): StageDataItem[] {
  return stageData;
}

export function getTotalSuppliers(): number {
  return totalSuppliers;
}

/* ══════════════════════════════════════════════════════
   AGENT ROWS
   ══════════════════════════════════════════════════════ */
const agentRows: AgentRow[] = [
  { initials: 'A1', color: '#0EA5E9', name: 'Agent A1', stage: 'Acquisition', status: '3 checks complete \u00b7 1 alert open',  statusColor: '#F59E0B', isActive: true  },
  { initials: 'A2', color: '#10B981', name: 'Agent A2', stage: 'Retention',   status: 'Running \u00b7 Last active 8 min ago',  statusColor: '#64748B', isActive: true  },
  { initials: 'A3', color: '#8B5CF6', name: 'Agent A3', stage: 'Upgradation', status: 'All clear \u00b7 Last active 1 hr ago', statusColor: '#10B981', isActive: true  },
  { initials: 'A4', color: '#F59E0B', name: 'Agent A4', stage: 'Retention',   status: 'Idle \u00b7 Last active 3 hrs ago',     statusColor: '#94A3B8', isActive: false },
  { initials: 'A5', color: '#EF4444', name: 'Agent A5', stage: 'Acquisition', status: '2 checks complete \u00b7 No alerts',    statusColor: '#10B981', isActive: true  },
];

export function getAgentRows(): AgentRow[] {
  return agentRows;
}

/* ══════════════════════════════════════════════════════
   RISK TREND DATA
   ══════════════════════════════════════════════════════ */
const riskTrendData: RiskTrendPoint[] = [
  { month: 'Aug', overall: 72, critical: 15, high: 28 },
  { month: 'Sep', overall: 68, critical: 12, high: 25 },
  { month: 'Oct', overall: 75, critical: 18, high: 32 },
  { month: 'Nov', overall: 70, critical: 14, high: 30 },
  { month: 'Dec', overall: 65, critical: 11, high: 24 },
  { month: 'Jan', overall: 63, critical: 10, high: 22 },
  { month: 'Feb', overall: 62, critical: 9,  high: 20 },
];

export function getRiskTrendData(): RiskTrendPoint[] {
  return riskTrendData;
}

/* ══════════════════════════════════════════════════════
   RISK ALERTS
   ══════════════════════════════════════════════════════ */
const riskAlerts: RiskAlert[] = [
  { type: 'Truth Gap Detected', supplier: 'Field Agent Co.',      system: 'Salesforce CRM',   severity: '#EF4444', severityBg: '#FEF2F2' },
  { type: 'SLA Violation',      supplier: 'Call Center Ltd.',     system: 'ITSM Portal',      severity: '#F59E0B', severityBg: '#FFFBEB' },
  { type: 'Contract Anomaly',   supplier: 'XYZ Corp.',           system: 'DocuSign Audit',   severity: '#F59E0B', severityBg: '#FFFBEB' },
  { type: 'Cert Expiring Soon', supplier: 'GHI Technologies',    system: 'ISO 27001',        severity: '#64748B', severityBg: '#F1F5F9' },
  { type: 'Data Gap Detected',  supplier: 'MNO Partners',        system: 'No data \u00b7 7 days', severity: '#64748B', severityBg: '#F1F5F9' },
];

export function getRiskAlerts(): RiskAlert[] {
  return riskAlerts;
}

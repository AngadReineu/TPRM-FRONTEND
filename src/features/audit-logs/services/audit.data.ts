import type { LogEntry } from '../types';

const logs: LogEntry[] = [
  { id: 1, ts: 'Feb 27, 2026 \u00b7 14:32:10', user: 'Priya Sharma', role: 'Risk Manager', action: 'Control Updated', entity: 'MFA Enforcement', desc: 'Coverage threshold changed from 90% to 94%', ip: '10.0.1.45', status: 'Success' },
  { id: 2, ts: 'Feb 27, 2026 \u00b7 12:15:44', user: 'Raj Kumar', role: 'Compliance Officer', action: 'Supplier Added', entity: 'PQR Systems', desc: 'New supplier onboarded to Acquisition stage', ip: '10.0.1.22', status: 'Success' },
  { id: 3, ts: 'Feb 27, 2026 \u00b7 11:02:58', user: 'System', role: 'Agent', action: 'Alert Triggered', entity: 'Agent A1', desc: 'GHI Technologies \u2014 assessment overdue 32 days', ip: '\u2014', status: 'Warning' },
  { id: 4, ts: 'Feb 26, 2026 \u00b7 17:45:20', user: 'Anita Nair', role: 'DPO', action: 'PII Configured', entity: 'XYZ Corporation', desc: 'Data sharing agreement activated \u2014 API daily', ip: '10.0.2.11', status: 'Success' },
  { id: 5, ts: 'Feb 26, 2026 \u00b7 15:30:05', user: 'System', role: 'Agent', action: 'Control Eval', entity: 'Encryption at Rest', desc: 'Coverage dropped below 70% threshold', ip: '\u2014', status: 'Warning' },
  { id: 6, ts: 'Feb 25, 2026 \u00b7 10:14:32', user: 'Priya Sharma', role: 'Risk Manager', action: 'User Login', entity: 'Platform', desc: 'Successful login from Mumbai, India', ip: '10.0.1.45', status: 'Success' },
  { id: 7, ts: 'Feb 24, 2026 \u00b7 16:22:48', user: 'Mohan Das', role: 'Admin', action: 'Role Changed', entity: 'Analyst User', desc: 'Role upgraded from Viewer to Analyst', ip: '10.0.3.88', status: 'Success' },
  { id: 8, ts: 'Feb 24, 2026 \u00b7 09:05:11', user: 'System', role: 'Agent', action: 'Portal Sent', entity: 'DEF Limited', desc: 'Assessment portal link re-sent after 7 days', ip: '\u2014', status: 'Info' },
];

const actionColors: Record<string, [string, string]> = {
  'Control Updated': ['#EFF6FF', '#0EA5E9'],
  'Supplier Added': ['#ECFDF5', '#10B981'],
  'Alert Triggered': ['#FEF2F2', '#EF4444'],
  'PII Configured': ['#F5F3FF', '#8B5CF6'],
  'Control Eval': ['#FFFBEB', '#F59E0B'],
  'User Login': ['#F1F5F9', '#64748B'],
  'Role Changed': ['#F5F3FF', '#8B5CF6'],
  'Portal Sent': ['#EFF6FF', '#0EA5E9'],
};

const statusColors: Record<string, [string, string]> = {
  Success: ['#ECFDF5', '#10B981'],
  Warning: ['#FFFBEB', '#F59E0B'],
  Info: ['#EFF6FF', '#0EA5E9'],
};

const userColors = ['#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export function getLogs() {
  return logs;
}

export function getActionColors() {
  return actionColors;
}

export function getStatusColors() {
  return statusColors;
}

export function getUserColors() {
  return userColors;
}

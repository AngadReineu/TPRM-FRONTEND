import { api } from '../../../lib/api';
import { withFallback, toCamelCase } from '../../../lib/apiUtils';
import type { LogEntry, AuditLogsFilter } from '../types';

const DEFAULT_LOGS: LogEntry[] = [];

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

/** Normalize API response to match LogEntry interface */
function normalizeLogEntry(log: LogEntry): LogEntry {
  return {
    ...log,
    ip: log.ipAddress || log.ip,
    ts: log.createdAt || log.ts,
  };
}

/** Get audit logs from API with fallback to empty array */
export async function getLogs(filter?: AuditLogsFilter): Promise<LogEntry[]> {
  const queryParams = new URLSearchParams();
  if (filter?.user) queryParams.append('user', filter.user);
  if (filter?.action) queryParams.append('action', filter.action);
  if (filter?.entity) queryParams.append('entity', filter.entity);
  if (filter?.startDate) queryParams.append('start_date', filter.startDate);
  if (filter?.endDate) queryParams.append('end_date', filter.endDate);

  const queryString = queryParams.toString();
  const endpoint = `/audit-logs${queryString ? `?${queryString}` : ''}`;

  return withFallback(
    async () => {
      const data = toCamelCase<LogEntry[]>(await api.get(endpoint));
      return data.map(normalizeLogEntry);
    },
    DEFAULT_LOGS,
    'audit-logs'
  );
}

/** Legacy sync getter for backwards compatibility */
export function getLogsSync(): LogEntry[] {
  return DEFAULT_LOGS;
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

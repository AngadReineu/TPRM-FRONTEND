export type LogAction =
  | 'Control Updated'
  | 'Supplier Added'
  | 'Alert Triggered'
  | 'PII Configured'
  | 'Control Eval'
  | 'User Login'
  | 'Role Changed'
  | 'Portal Sent';

export type LogStatus = 'Success' | 'Warning' | 'Info';

export interface LogEntry {
  id: number;
  ts: string;           // Timestamp display string (for mock data)
  user: string;
  role: string;
  action: LogAction;
  entity: string;
  desc: string;
  ip: string;           // IP address (mock uses 'ip')
  status: LogStatus;
  // Backend fields (snake_case converted to camelCase)
  ipAddress?: string;   // Backend uses 'ip_address'
  createdAt?: string;   // Backend uses 'created_at' (ISO timestamp)
}

export interface AuditLogsFilter {
  user?: string;
  action?: string;
  entity?: string;
  startDate?: string;
  endDate?: string;
}

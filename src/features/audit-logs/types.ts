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
  ts: string;
  user: string;
  role: string;
  action: LogAction;
  entity: string;
  desc: string;
  ip: string;
  status: LogStatus;
}

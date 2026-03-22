import type { TaskPriority, TaskStatus, Stage } from '../../types/shared';

/* ── Agent-specific types ────────────────────────────── */

export type Status = 'live' | 'active' | 'syncing' | 'idle';

export type LogType =
  | 'fetch'
  | 'evaluate'
  | 'reasoning'
  | 'success'
  | 'warning'
  | 'action'
  | 'decision'
  | 'error';

export interface LogEntry {
  id: string;
  time: string;
  type: LogType;
  message: string;
  detail?: string;
}

export interface AgentTask {
  id: string;
  title: string;
  supplier: string;
  priority: TaskPriority;
  assignee: string;
  status: TaskStatus;
  dueDate: string;
  description: string;
}

export interface TimelineEntry {
  id: string;
  time: string;
  event: string;
  status: 'alert' | 'info' | 'success' | 'warning';
}

export interface Agent {
  id: string;
  name: string;
  initials: string;
  status: Status;
  stage: Stage;
  controls: number;
  suppliers: number;
  gradient: string;
  alerts: number;
  lastActive: string;
  health: number;
  division: string;
  frequency: string;
  notify: string[];
  internalSpoc?: string;
  externalSpoc?: string;
  truthMatch?: number;
  slmTemplate?: string;
  jobTitle?: string;
  jobDescription?: string;
  internalContacts?: string[];
  supplierContacts?: string[];
  pendingContacts?: string[];
  controlList?: string[];
  supplierList?: string[];
  alertLevel?: string;
  /* enriched fields for detail page */
  agentName?: string;
  role?: string;
  color?: string;
  avatarSeed?: string;
  uptime?: string;
  nextEval?: string;
  lastScan?: string;
  openTasks?: number;
  currentTask?: string;
}

/** Agent definition used in the standalone AgentDetail route */
export interface AgentDefinition {
  id: string;
  initials: string;
  color: string;
  name: string;
  role: string;
  status: 'Active' | 'Idle';
  controls: string[];
  suppliers: string[];
  uptime: string;
  alerts: number;
  alertLevel: string;
  systems: string[];
  currentTask: string;
  nextEval: string;
  lastScan: string;
  openTasks: number;
  avatarSeed: string;
}

/* Re-export shared types for convenience */
export type { TaskPriority, TaskStatus, Stage };

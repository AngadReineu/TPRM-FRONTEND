export interface Action {
  id: string;
  title: string;
  detail: string;
  scoreReduction?: number;
  score_reduction?: number;
  owner: string;
  effort: 'Low' | 'Medium' | 'High' | string;
  completed?: boolean;
}

export interface RiskEvent {
  id?: string;
  date?: string;
  runId?: string;
  runDate?: string;
  supplier?: string;
  supplierName?: string;
  taskName?: string;
  desc?: string;
  description?: string;
  severity: string;
  scoreChange?: string | number;
  status: string;
  currentScore?: number;
  category?: string;
  fullDetail?: string;
  impact?: string;
  actions?: Action[];
}

export interface RiskDataPoint {
  month: string;
  overall: number;
  critical: number;
  high: number;
}

export type ActionItem = Action;

export interface ActionUpdatePayload {
  notes?: string;
  completedAt?: string;
}

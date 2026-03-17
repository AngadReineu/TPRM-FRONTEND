import type { Stage } from '@/types/shared';

/** One row in the supplier-risk-by-stage breakdown. */
export interface StageDataItem {
  stage: Stage;
  color: string;
  count: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
}

/** One row in the agent-activity table. */
export interface AgentRow {
  initials: string;
  color: string;
  name: string;
  stage: Stage;
  status: string;
  statusColor: string;
  isActive: boolean;
}

/** A single point on the risk-trend line chart. */
export interface RiskTrendPoint {
  month: string;
  overall: number;
  critical: number;
  high: number;
}

/** One card in the recent-risk-alerts list. */
export interface RiskAlert {
  type: string;
  supplier: string;
  system: string;
  severity: string;
  severityBg: string;
}

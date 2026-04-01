import type { Stage } from '../../types/shared';

/** A single point on the risk-trend line chart. */
export interface RiskTrendPoint {
  month: string;
  overall: number;
  critical: number;
  high: number;
}

/** One row in the supplier-risk-by-stage breakdown. */
export interface StageDataItem {
  stage: Stage | string;
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
  stage: Stage | string;
  status: string;
  statusColor: string;
  isActive: boolean;
}

/** One card in the recent-risk-alerts list. */
export interface RiskAlert {
  type: string;
  supplier: string;
  system: string;
  severity: string;
  severityBg: string;
}

/** Full dashboard summary from API. */
export interface DashboardSummary {
  totalVendors: number;
  activeAgents: number;
  openRisks: number;
  avgRiskScore: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  controlsActive: number;
  controlsTotal: number;
  assessmentsTotal: number;
  assessmentsOverdue: number;
  totalRiskAlerts: number;
  criticalAlerts: number;
  riskTrend: RiskTrendPoint[];
  stageBreakdown: StageDataItem[];
  agentActivity: AgentRow[];
  recentAlerts: RiskAlert[];
}

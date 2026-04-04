import { api } from '../../../lib/api';
import { withFallback, toCamelCase } from '../../../lib/apiUtils';
import type { StageDataItem, AgentRow, RiskTrendPoint, RiskAlert, DashboardSummary } from '../types';

/* ══════════════════════════════════════════════════════
  DESIGN TOKENS
   ══════════════════════════════════════════════════════ */
const token = {
  surface: '#FFFFFF',
  border: '#E9EEF4',
  shadow: '0 1px 4px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
  radius: 14,
  padding: 24,
  labelSize: 11,
  metricSize: 38,
} as const;

export function getDesignTokens() {
  return token;
}


const stageData: StageDataItem[] = [];

const agentRows: AgentRow[] = [];

const riskTrendData: RiskTrendPoint[] = [];

const riskAlerts: RiskAlert[] = [];

/** Consolidated mock data matching DashboardSummary schema */
export const MOCK_DASHBOARD_DATA: DashboardSummary = { totalVendors: 0, activeAgents: 0, openRisks: 0, avgRiskScore: 0, criticalCount: 0, highCount: 0, mediumCount: 0, lowCount: 0, controlsActive: 0, controlsTotal: 0, assessmentsTotal: 0, assessmentsOverdue: 0, totalRiskAlerts: 0, criticalAlerts: 0, riskTrend: riskTrendData, stageBreakdown: stageData, agentActivity: agentRows, recentAlerts: riskAlerts };

/* ══════════════════════════════════════════════════════
 API SERVICE
   ══════════════════════════════════════════════════════ */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const data = await api.get('/dashboard/summary');
    const result = toCamelCase<DashboardSummary>(data);
    return result;
  } catch (e) {
    console.error('[DASHBOARD API FAILED]', e);
    return MOCK_DASHBOARD_DATA;
  }
}

/* ══════════════════════════════════════════════════════
  LEGACY GETTERS (for backward compatibility)
   ══════════════════════════════════════════════════════ */
export function getStageData(): StageDataItem[] {
  return stageData;
}

export function getTotalSuppliers(): number {
  return MOCK_DASHBOARD_DATA.totalVendors;
}

export function getAgentRows(): AgentRow[] {
  return agentRows;
}

export function getRiskTrendData(): RiskTrendPoint[] {
  return riskTrendData;
}

export function getRiskAlerts(): RiskAlert[] {
  return riskAlerts;
}

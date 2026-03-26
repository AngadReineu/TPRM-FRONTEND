import { api } from '../../../lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { RiskEvent, RiskDataPoint, ActionItem, ActionUpdatePayload } from '../types';

const MOCK_RISK_DATA: RiskDataPoint[] = [
  { month: 'Aug', overall: 72, critical: 15, high: 28 },
  { month: 'Sep', overall: 68, critical: 12, high: 25 },
  { month: 'Oct', overall: 75, critical: 18, high: 32 },
  { month: 'Nov', overall: 70, critical: 14, high: 30 },
  { month: 'Dec', overall: 65, critical: 11, high: 24 },
  { month: 'Jan', overall: 63, critical: 10, high: 22 },
  { month: 'Feb', overall: 62, critical: 9, high: 20 },
];

const MOCK_RISK_EVENTS: RiskEvent[] = [];

const MOCK_AI_RECOMMENDATIONS: string[] = [];

const severityColors: Record<string, [string, string]> = {
  Critical: ['bg-red-50', 'text-red-500'],
  High: ['bg-amber-50', 'text-amber-500'],
  Medium: ['bg-slate-100', 'text-slate-500'],
  Low: ['bg-emerald-50', 'text-emerald-500'],
};

const statusColors: Record<string, [string, string]> = {
  Open: ['bg-red-50', 'text-red-500'],
  'In Review': ['bg-amber-50', 'text-amber-500'],
  Resolved: ['bg-emerald-50', 'text-emerald-500'],
};

const effortColors: Record<string, [string, string]> = {
  Low: ['bg-emerald-50', 'text-emerald-500'],
  Medium: ['bg-amber-50', 'text-amber-500'],
  High: ['bg-red-50', 'text-red-500'],
};

/* ── Sync getters (backward compatibility) ── */

export function getRiskData() {
  return MOCK_RISK_DATA;
}

export function getRiskEvents() {
  return MOCK_RISK_EVENTS;
}

export function getAiRecommendations() {
  return MOCK_AI_RECOMMENDATIONS;
}

export function getSeverityColors() {
  return severityColors;
}

export function getStatusColors() {
  return statusColors;
}

export function getEffortColors() {
  return effortColors;
}

/* ── API Service Functions ── */

/**
 * Fetch risk trend data from API
 */
export async function fetchRiskData(): Promise<RiskDataPoint[]> {
  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/risk/trends')),
    MOCK_RISK_DATA,
    'risk-trends'
  );
}

/**
 * Fetch risk events from API
 */
export async function fetchRiskEvents(): Promise<RiskEvent[]> {
  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/risk/events')),
    MOCK_RISK_EVENTS,
    'risk-events'
  );
}

/**
 * Fetch AI recommendations from API
 */
export async function fetchAiRecommendations(): Promise<string[]> {
  return withFallback(
    async () => {
      const data = await api.get<{ recommendations: string[] }>('/risk/ai-recommendations');
      return data.recommendations;
    },
    MOCK_AI_RECOMMENDATIONS,
    'risk-ai-recommendations'
  );
}

/**
 * Update risk event status
 */
export async function updateRiskEventStatus(
  eventId: string,
  status: 'Open' | 'In Review' | 'Resolved'
): Promise<RiskEvent> {
  const result = await api.patch<Record<string, unknown>>(`/risk/events/${eventId}`, toSnakeCase({ status }));
  return toCamelCase<RiskEvent>(result);
}

/**
 * Update risk event actions array
 */
export async function updateRiskEventActions(
  eventId: string,
  actions: any[]
): Promise<RiskEvent> {
  const result = await api.patch<Record<string, unknown>>(`/risk/events/${eventId}/actions`, toSnakeCase({ actions }));
  return toCamelCase<RiskEvent>(result);
}

/**
 * Execute an action item on a risk event
 */
export async function executeRiskAction(
  eventId: string,
  actionId: string,
  payload?: ActionUpdatePayload
): Promise<RiskEvent> {
  const result = await api.post<Record<string, unknown>>(
    `/risk/events/${eventId}/actions/${actionId}/execute`,
    toSnakeCase(payload ?? {})
  );
  return toCamelCase<RiskEvent>(result);
}

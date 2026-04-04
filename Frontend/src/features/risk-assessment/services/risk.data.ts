import { api } from '../../../lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { RiskEvent, RiskDataPoint, ActionItem, ActionUpdatePayload } from '../types';

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

export function getRiskData(): RiskDataPoint[] {
  return [];
}

export function getRiskEvents(): RiskEvent[] {
  return [];
}

export function getAiRecommendations(): string[] {
  return [];
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
    [],
    'risk-trends'
  );
}

/**
 * Fetch risk events from API
 */
export async function fetchRiskEvents(): Promise<RiskEvent[]> {
  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/risk/events')),
    [],
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
    [],
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

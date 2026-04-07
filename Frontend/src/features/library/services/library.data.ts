import type { Stage } from '../../../types/shared';
import type { Division, Supplier, SystemNode, StageData, GraphData, DivisionCreate, SupplierCreate, SystemCreate, OrgNode } from '../types';
import { api } from '../../../lib/api';
import { toCamelCase, toSnakeCase, withFallback } from '../../../lib/apiUtils';

/* ── Graph View Constants ──────────────────────────────── */

const STAGES: Stage[] = ['Acquisition', 'Retention', 'Upgradation', 'Offboarding'];

const STAGE_CLR: Record<Stage, [string, string]> = {
  Acquisition: ['#EFF6FF', '#0EA5E9'],
  Retention:   ['#ECFDF5', '#10B981'],
  Upgradation: ['#FFFBEB', '#F59E0B'],
  Offboarding: ['#F1F5F9', '#64748B'],
};

const LIFECYCLE_COLUMNS: Record<Stage, { minFrac: number; maxFrac: number }> = {
  Acquisition: { minFrac: 0,    maxFrac: 0.25 },
  Retention:   { minFrac: 0.25, maxFrac: 0.50 },
  Upgradation: { minFrac: 0.50, maxFrac: 0.75 },
  Offboarding: { minFrac: 0.75, maxFrac: 1.00 },
};

const CANVAS_W = 1600;
const CANVAS_H = 1000;

const ORG_R = 32;
const DIV_R = 24;

const INIT_ORG = { x: 580, y: 380 };

/* ── Color helpers ──────────────────────────────────────── */

function innerColor(score: number | null): string {
  return score === null ? '#94A3B8' : score >= 50 ? '#10B981' : '#EF4444';
}

function piiStrokeW(vol: 'low' | 'moderate' | 'high'): number {
  return vol === 'low' ? 3 : vol === 'moderate' ? 7 : 13;
}

function supOuterR(vol: 'low' | 'moderate' | 'high'): number {
  return vol === 'low' ? 22 : vol === 'moderate' ? 26 : 32;
}

/* ── Graph View Mock Data ──────────────────────────────── */

const INIT_DIVS: Division[] = [];

const INIT_SUPS: Supplier[] = [];

const INIT_SYSTEMS: SystemNode[] = [];

/* ── Healthcare Library Data ──────────────────────────── */

const METHOD_COLORS: Record<string, string> = {
  'Mobile App': '#0EA5E9',
  'Portal': '#8B5CF6',
  'Email': '#10B981',
  'Phone': '#F59E0B',
  'API': '#06B6D4',
  'Branch': '#F59E0B',
  'Internal': '#64748B',
};

const initialStages: StageData[] = [];

/* ── Getter Functions ──────────────────────────────────── */

export function getStages() {
  return STAGES;
}

export function getStageColors() {
  return STAGE_CLR;
}

export function getLifecycleColumns() {
  return LIFECYCLE_COLUMNS;
}

export function getCanvasDimensions() {
  return { CANVAS_W, CANVAS_H };
}

export function getNodeRadii() {
  return { ORG_R, DIV_R };
}

export function getInitOrg() {
  return { ...INIT_ORG };
}

export function getInitDivisions() {
  return INIT_DIVS.map(d => ({ ...d }));
}

export function getInitSuppliers() {
  return INIT_SUPS.map(s => ({ ...s }));
}

export function getInitSystems() {
  return INIT_SYSTEMS.map(s => ({ ...s }));
}

export function getMethodColors() {
  return METHOD_COLORS;
}

export function getInitialHealthcareStages() {
  return initialStages.map(s => ({
    ...s,
    systems: s.systems.map(sys => ({ ...sys })),
    suppliers: s.suppliers.map(sup => ({ ...sup })),
  }));
}

export { innerColor, piiStrokeW, supOuterR };
export { toRad };

function toRad(d: number): number {
  return (d * Math.PI) / 180;
}

/* ── API Service Functions ────────────────────────────── */

/**
 * Fetch graph data (divisions, suppliers, systems) from API
 */
export async function getGraphData(): Promise<GraphData> {
  try {
    const result = await toCamelCase<any>(await api.get<any>('/library/graph'));
    
    // Normalize coordinates: ensure all nodes have x/y coordinates
    return {
      org: {
        ...result.org,
        x: result.org.canvasX ?? result.org.x ?? 0,
        y: result.org.canvasY ?? result.org.y ?? 0,
      },
      divisions: result.divisions?.map((div: any) => ({
        ...div,
        x: div.canvasX ?? div.x ?? 0,
        y: div.canvasY ?? div.y ?? 0,
      })) ?? [],
      suppliers: result.suppliers?.map((sup: any) => ({
        ...sup,
        x: sup.canvasX ?? sup.x ?? 0,
        y: sup.canvasY ?? sup.y ?? 0,
      })) ?? [],
      systems: result.systems?.map((sys: any) => ({
        ...sys,
        x: sys.canvasX ?? sys.x ?? 0,
        y: sys.canvasY ?? sys.y ?? 0,
      })) ?? [],
    };
  } catch (error) {
    console.error('Failed to fetch graph data:', error);
    return {
      divisions: [],
      suppliers: [],
      systems: [],
      org: { id: 'org', name: 'Organization', x: 0, y: 0 },
    };
  }
}

/**
 * Fetch healthcare stages data from API
 */
export async function getHealthcareStages(): Promise<StageData[]> {
  try {
    return toCamelCase(await api.get<unknown[]>('/library/healthcare'));
  } catch (error) {
    console.error('Failed to fetch healthcare stages:', error);
    return [];
  }
}

/**
 * Create a new division
 */
export async function createDivision(division: DivisionCreate): Promise<Division> {
  const payload = toSnakeCase(division);
  const result = await api.post<Record<string, unknown>>('/library/divisions', payload);
  const camelResult = toCamelCase<Division>(result);

  // Normalize coordinates: map canvasX/canvasY to x/y for frontend compatibility
  return {
    ...camelResult,
    x: (camelResult as any).canvasX ?? (camelResult as any).x ?? 0,
    y: (camelResult as any).canvasY ?? (camelResult as any).y ?? 0,
  };
}

/**
 * Create a new supplier in the graph
 */
export async function createSupplier(supplier: SupplierCreate): Promise<Supplier> {
  const payload = toSnakeCase(supplier);
  const result = await api.post<Record<string, unknown>>('/library/suppliers', payload);
  const camelResult = toCamelCase<Supplier>(result);

  // Normalize coordinates: map canvasX/canvasY to x/y for frontend compatibility
  return {
    ...camelResult,
    x: (camelResult as any).canvasX ?? (camelResult as any).x ?? 0,
    y: (camelResult as any).canvasY ?? (camelResult as any).y ?? 0,
  };
}

/**
 * Create a new system in the graph
 */
export async function createSystem(system: SystemCreate): Promise<SystemNode> {
  const payload = toSnakeCase(system);
  const result = await api.post<Record<string, unknown>>('/library/systems', payload);
  const camelResult = toCamelCase<SystemNode>(result);

  // Normalize coordinates: map canvasX/canvasY to x/y for frontend compatibility
  return {
    ...camelResult,
    x: (camelResult as any).canvasX ?? (camelResult as any).x ?? 0,
    y: (camelResult as any).canvasY ?? (camelResult as any).y ?? 0,
  };
}

/**
 * Update node position in the graph (for drag-and-drop)
 */
export async function updateNodePosition(
  nodeType: 'division' | 'supplier' | 'system' | 'org',
  nodeId: string,
  position: { x: number; y: number }
): Promise<void> {
  const payload = toSnakeCase({ nodeType, nodeId, ...position });
  await api.patch<void>('/library/graph/position', payload);
}

/**
 * Update supplier stage assignment
 */
export async function updateSupplierStage(
  supplierId: string,
  stage: Stage
): Promise<Supplier> {
  const payload = toSnakeCase({ stage });
  const result = await api.patch<Record<string, unknown>>(`/library/suppliers/${supplierId}/stage`, payload);
  return toCamelCase<Supplier>(result);
}

/**
 * Delete a division
 */
export async function deleteDivision(divisionId: string): Promise<void> {
  await api.delete(`/library/divisions/${divisionId}`);
}

/**
 * Delete a supplier
 */
export async function deleteSupplier(supplierId: string): Promise<void> {
  await api.delete(`/library/suppliers/${supplierId}`);
}

/**
 * Delete a system
 */
export async function deleteSystem(systemId: string): Promise<void> {
  await api.delete(`/library/systems/${systemId}`);
}

/**
 * Update a supplier node
 */
export async function updateSupplier(supplierId: string, updates: Partial<Supplier>): Promise<Supplier> {
  const payload = toSnakeCase(updates);
  const result = await api.patch<Record<string, unknown>>(`/library/suppliers/${supplierId}`, payload);
  const camelResult = toCamelCase<Supplier>(result);

  // Normalize coordinates: map canvasX/canvasY to x/y for frontend compatibility
  return {
    ...camelResult,
    x: (camelResult as any).canvasX ?? (camelResult as any).x ?? 0,
    y: (camelResult as any).canvasY ?? (camelResult as any).y ?? 0,
  };
}

/**
 * Update a system node
 */
export async function updateSystem(systemId: string, updates: Partial<SystemNode>): Promise<SystemNode> {
  const payload = toSnakeCase(updates);
  const result = await api.patch<Record<string, unknown>>(`/library/systems/${systemId}`, payload);
  const camelResult = toCamelCase<SystemNode>(result);

  // Normalize coordinates: map canvasX/canvasY to x/y for frontend compatibility
  return {
    ...camelResult,
    x: (camelResult as any).canvasX ?? (camelResult as any).x ?? 0,
    y: (camelResult as any).canvasY ?? (camelResult as any).y ?? 0,
  };
}

/**
 * Update a division
 */
export async function updateDivision(divisionId: string, updates: Partial<Division>): Promise<Division> {
  const payload = toSnakeCase(updates);
  const result = await api.patch<Record<string, unknown>>(`/library/divisions/${divisionId}`, payload);
  const camelResult = toCamelCase<Division>(result);

  // Normalize coordinates: map canvasX/canvasY to x/y for frontend compatibility
  return {
    ...camelResult,
    x: (camelResult as any).canvasX ?? (camelResult as any).x ?? 0,
    y: (camelResult as any).canvasY ?? (camelResult as any).y ?? 0,
  };
}

/**
 * Get all divisions (departments) for use in dropdowns
 */
export async function getDivisions(): Promise<Division[]> {
  const graphData = await getGraphData();
  return graphData.divisions;
}

/**
 * Fetch all systems from the backend.
 */
export async function getSystems(): Promise<SystemNode[]> {
  const result = await withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/library/systems')),
    INIT_SYSTEMS.map(s => ({ ...s })),
    'systems-list'
  ) as any[];
  
  // Normalize coordinates
  return result.map((sys: any) => ({
    ...sys,
    x: sys.canvasX ?? sys.x ?? 0,
    y: sys.canvasY ?? sys.y ?? 0,
  }));
}

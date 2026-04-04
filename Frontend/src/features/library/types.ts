import type { Stage, PiiFlow } from '../../types/shared';

export type DragType = 'canvas' | 'org' | 'div' | 'sup' | 'sys';
export type PiiVolume = 'low' | 'moderate' | 'high';

export interface DragState {
  type: DragType;
  id: string;
  startMX: number;
  startMY: number;
  startX: number;
  startY: number;
}

export interface Division {
  id: string;
  x: number;
  y: number;
  lx?: number;
  ly?: number;
  name: string;
  lifecycleStage?: Stage;
}

export interface Supplier {
  id: string;
  divisionId: string;
  x: number;
  y: number;
  lx?: number;
  ly?: number;
  name: string;
  email: string;
  contact: string;
  phone: string;
  website: string;
  gst: string;
  pan: string;
  stage: Stage;
  riskScore: number | null;
  piiVolume: PiiVolume;
  piiFlow?: PiiFlow;
  piiTypes?: string[];
  hasTruthGap?: boolean;
  declaredPii?: string[];
  detectedPii?: string[];
  internalSpoc?: string;
  externalSpoc?: string;
  contractStart?: string;
  contractEnd?: string;
  frequency?: string;
  lifecycles?: Stage[];
  stakeholders?: {
    internal?: { label: string; email: string }[];
    supplier?: { label: string; email: string }[];
    [key: string]: any;
  };
}

export interface SystemNode {
  id: string;
  divisionId: string;
  x: number;
  y: number;
  lx?: number;
  ly?: number;
  name: string;
  type: 'crm' | 'infra' | 'db';
  dataSource?: string;
  piiTypes?: string[];
  vulnScore?: number;
  stage?: Stage;
  internalSpoc?: string;
  authorizedPii?: string[];
  hasStageDiscrepancy?: boolean;
  discrepancyFields?: string[];
  agentReasoning?: {
    timestamp: string;
    action: string;
    trigger: string;
    reasoning: string;
    confidence: number;
    outcome: 'alert';
  };
  linkedSupplierId?: string;
}

/* ── Graph View API types ───────────────────────── */

export interface OrgNode {
  id: string;
  name: string;
  canvasX?: number;
  canvasY?: number;
  x?: number;
  y?: number;
}

export interface GraphData {
  org: OrgNode;
  divisions: Division[];
  suppliers: Supplier[];
  systems: SystemNode[];
}

/* ── Create/Update DTOs ───────────────────────── */

export interface DivisionCreate {
  name: string;
  lifecycleStage?: Stage;
  canvasX?: number;
  canvasY?: number;
}

export interface SupplierCreate {
  divisionId: string;
  canvasX?: number;
  canvasY?: number;
  name: string;
  email?: string;
  contact?: string;
  phone?: string;
  website?: string;
  gst?: string;
  pan?: string;
  stage: Stage;
  piiVolume?: PiiVolume;
  piiFlow?: PiiFlow;
  piiTypes?: string[];
  contractStart?: string;
  contractEnd?: string;
  frequency?: string;
  lifecycles?: Stage[];
  internalSpoc?: string;
  externalSpoc?: string;
  stakeholders?: Supplier['stakeholders'];
}

export interface SystemCreate {
  divisionId: string;
  canvasX?: number;
  canvasY?: number;
  name: string;
  type: 'crm' | 'infra' | 'db';
  stage?: Stage;
  dataSource?: string;
  authorizedPii?: string[];
  piiTypes?: string[];
  vulnScore?: number;
  linkedSupplierId?: string;
}

export type ModalState =
  | null
  | { type: 'addDiv'; spawnX?: number; spawnY?: number; lifecycleStage?: Stage }
  | { type: 'chooseAsset'; divisionId: string }
  | { type: 'addSup'; divisionId: string }
  | { type: 'addSys'; divisionId: string }
  | { type: 'supInfo'; supplierId: string }
  | { type: 'xrayInfo'; supplierId: string }
  | { type: 'sysInfo'; systemId: string }
  | { type: 'sysReasoning'; systemId: string }
  | { type: 'divInfo'; divisionId: string };

/* ── Healthcare Library types ───────────────────────── */

export type SupplierState = 'pending' | 'overdue' | 'complete_unconfigured' | 'active';

export interface SupplierCard {
  id: string;
  name: string;
  state: SupplierState;
  score?: number;
  risk?: string;
  daysInfo?: string;
  piiIcons?: string[];
  transferMethod?: string;
  agent?: string;
}

export interface SystemCard {
  id: string;
  name: string;
  method: string;
  methodColor: string;
}

export interface StageData {
  id: string;
  label: string;
  color: string;
  systems: SystemCard[];
  suppliers: SupplierCard[];
}

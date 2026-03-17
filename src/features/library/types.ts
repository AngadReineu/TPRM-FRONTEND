import type { Stage, PiiFlow } from '@/types/shared';

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
  name: string;
  lifecycleStage?: Stage;
}

export interface Supplier {
  id: string;
  divisionId: string;
  x: number;
  y: number;
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
  declaredPII?: string[];
  detectedPII?: string[];
  internalSPOC?: string;
  externalSPOC?: string;
  contractStart?: string;
  contractEnd?: string;
  frequency?: string;
  lifecycles?: Stage[];
  stakeholders?: {
    businessOwner?: string;
    financeContact?: string;
    projectManager?: string;
    escalationContact?: string;
    accountManager?: string;
    supplierFinance?: string;
    supplierEscalation?: string;
  };
}

export interface SystemNode {
  id: string;
  divisionId: string;
  x: number;
  y: number;
  name: string;
  type: 'crm' | 'infra' | 'db';
  dataSource?: string;
  piiTypes?: string[];
  vulnScore?: number;
  stage?: Stage;
  internalSPOC?: string;
  authorizedPII?: string[];
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

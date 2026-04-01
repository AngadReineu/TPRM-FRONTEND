import type { Stage, PiiFlow } from '../../types/shared';

export type AssessmentStatus = 'complete' | 'overdue' | 'pending';

export interface Supplier {
  id: string;
  name: string;
  email: string;
  stage: Stage;
  stageColor: string;
  score: number;
  risk: string;
  riskColor: string;
  assessment: AssessmentStatus;
  pii: { configured: boolean; icons?: string[]; method?: string };
  piiFlow?: PiiFlow;
  contractEnd: string;
  contractWarning?: boolean;
  agentId: string;
  lastActivity: string;
  internalSpoc?: string;
  externalSpoc?: string;
}

import type { Category, Risk, PiiFlow, Personality } from '@/types/shared';

export interface Control {
  id: string;
  name: string;
  desc: string;
  category: Category;
  active: boolean;
  coverage: number;
  scope: string;
  risk: Risk;
  lastEval: string;
  deps: number;
  internalSPOC?: string;
  externalSPOC?: string;
  piiFlow?: PiiFlow;
  truthValidator?: boolean;
  hasTruthGap?: boolean;
  personality?: Personality;
}

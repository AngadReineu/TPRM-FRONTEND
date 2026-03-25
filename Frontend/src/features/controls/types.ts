import type { Category, Risk, Personality } from '../../types/shared';

export interface Control {
  id: string;
  name: string;
  desc: string;
  category: Category;
  active: boolean;
  coverage: number;
  risk: Risk;
  lastEval?: string;

  // Persona — determines agent type
  personality?: Personality;

  // SLM Tasks — list of task names this control covers
  slmTasks?: string[];

  // Step 2 — Target Asset Scope
  supplierScope?: string[];          // list of vendor IDs
  lifecycleStage?: string;           // Acquisition | Retention | Upgradation | Offboarding | All
  communicationScope?: Record<string, string>; // { "Payment Monitoring": "finance@supplier.com" }
  documentScope?: string[];          // ["SOW", "PO", "Invoice" ...]

  // Step 3 — Data Source
  dataSources?: string[];            // ["email", "documents", "portal"]
  dataSourcesConfig?: Record<string, any>; // {"teams": {...}, "slack": {...}, "zoom": {...}}
  evidenceRetention?: string;        // 30d | 90d | 1y | 7y

  // Step 4 — Trigger Config
  triggerMode?: string;              // event | scheduled | manual
  triggerEvents?: string[];          // list of event types
  triggerFrequency?: string;         // Hourly | Daily | Every 6hrs | Weekly | Monthly
  firstEvalDate?: string;
  firstEvalTime?: string;

  // Step 5 — AI Behaviour
  evaluationPrompt?: string;         // auto-generated Mistral prompt
  anomalyTriggers?: string[];        // list of anomaly trigger IDs
  confidenceThreshold?: number;      // 0-100
  autoActions?: string[];            // enabled auto actions
  remediationSuggestion?: string;
  storeSnapshots?: boolean;
  requireApproval?: boolean;
  truthGapDetection?: boolean;

  // Relational context
  internalSpoc?: string;
  externalSpoc?: string;
  truthValidator?: boolean;
  hasTruthGap?: boolean;

  // Metadata
  controlSource?: string;            // local | kyudo | grc
}

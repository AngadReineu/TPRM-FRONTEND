import type { Stage } from '@/types/shared';
import type { Division, Supplier, SystemNode, StageData, GraphData, DivisionCreate, SupplierCreate, SystemCreate, OrgNode } from '../types';
import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';

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

const INIT_DIVS: Division[] = [
  { id: 'd1', name: 'Marketing Dept',  x: 400, y: 200 },
  { id: 'd2', name: 'Technical Dept',  x: 350, y: 500 },
  { id: 'd3', name: 'Operations Dept', x: 760, y: 480 },
  { id: 'ld1', name: 'Growth & Leads',   x: 200,  y: 130, lifecycleStage: 'Acquisition' },
  { id: 'ld3', name: 'Customer Success', x: 600,  y: 130, lifecycleStage: 'Retention'   },
  { id: 'ld5', name: 'Product Upgrades', x: 1000, y: 130, lifecycleStage: 'Upgradation' },
  { id: 'ld7', name: 'Churn Prevention', x: 1400, y: 130, lifecycleStage: 'Offboarding' },
];

const INIT_SUPS: Supplier[] = [
  { id:'s1', divisionId:'d1', x:220, y:120, name:'XYZ Email Mktg',  stage:'Acquisition', riskScore:78,   piiVolume:'moderate', email:'xyz@email.com',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'share',  piiTypes:['Aadhar','Phone','Email'], hasTruthGap:false, declaredPii:['Aadhar','Phone','Email'],    detectedPii:['Aadhar','Phone','Email'],    internalSpoc:'priya@abc.co',  externalSpoc:'john@xyz.com',    frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Acquisition','Retention'], stakeholders:{ businessOwner:'priya@abc.co', financeContact:'finance@abc.co', accountManager:'john@xyz.com', supplierFinance:'billing@xyz.com' } },
  { id:'s2', divisionId:'d1', x:380, y:80,  name:'Field Agent Co.', stage:'Acquisition', riskScore:null, piiVolume:'low',      email:'field@agent.com', contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'ingest', piiTypes:['Email'],              hasTruthGap:false, declaredPii:['Email'],                    detectedPii:['Email'],                    internalSpoc:'priya@abc.co',  externalSpoc:'leads@field.com', frequency:'Weekly', contractEnd:'2026-06-30', lifecycles:['Acquisition'], stakeholders:{ businessOwner:'priya@abc.co', accountManager:'leads@field.com' } },
  { id:'s3', divisionId:'d1', x:200, y:280, name:'Call Center Ltd',  stage:'Retention',   riskScore:22,   piiVolume:'high',     email:'cc@ltd.com',      contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'both',   piiTypes:['Aadhar','Phone'],    hasTruthGap:true,  declaredPii:['Phone'],                    detectedPii:['Aadhar','Phone','Location'], internalSpoc:'raj@abc.co',    externalSpoc:'ops@ccltd.com',   frequency:'Hourly', contractEnd:'2025-12-31', lifecycles:['Retention','Upgradation'], stakeholders:{ businessOwner:'raj@abc.co', escalationContact:'ciso@abc.co', accountManager:'ops@ccltd.com', supplierEscalation:'escalate@ccltd.com' } },
  { id:'s4', divisionId:'d2', x:160, y:460, name:'CloudSec Inc.',    stage:'Upgradation', riskScore:82,   piiVolume:'low',      email:'cloud@sec.com',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'share',  piiTypes:['Credentials'],       hasTruthGap:false, declaredPii:['Credentials'],              detectedPii:['Credentials'],              internalSpoc:'anita@abc.co',  externalSpoc:'cto@cloudsec.io', frequency:'Daily',  contractEnd:'2027-03-31', lifecycles:['Upgradation'], stakeholders:{ businessOwner:'anita@abc.co', projectManager:'pm@abc.co', accountManager:'cto@cloudsec.io' } },
  { id:'s5', divisionId:'d2', x:200, y:620, name:'DataVault Co.',    stage:'Retention',   riskScore:35,   piiVolume:'moderate', email:'data@vault.co',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'both',   piiTypes:['Financial','PAN'],   hasTruthGap:true,  declaredPii:['Financial'],                detectedPii:['Financial','PAN','Aadhar'], internalSpoc:'anita@abc.co',  externalSpoc:'dpo@datavault.co',frequency:'Hourly', contractEnd:'2026-09-30', lifecycles:['Retention','Offboarding'], stakeholders:{ businessOwner:'anita@abc.co', escalationContact:'dpo@abc.co', accountManager:'dpo@datavault.co', supplierEscalation:'security@datavault.co' } },
  { id:'s6', divisionId:'d3', x:660, y:640, name:'LogiTrack Ltd',    stage:'Offboarding', riskScore:null, piiVolume:'low',      email:'lt@email.com',    contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'ingest', piiTypes:['Location'],          hasTruthGap:false, declaredPii:['Location'],                 detectedPii:['Location'],                 frequency:'Weekly', contractEnd:'2025-06-30', lifecycles:['Offboarding'] },
  { id:'s7', divisionId:'d3', x:880, y:560, name:'HR Systems Co.',   stage:'Acquisition', riskScore:88,   piiVolume:'moderate', email:'hr@systems.co',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'share',  piiTypes:['Name','Email','DOB'], hasTruthGap:false, declaredPii:['Name','Email','DOB'],        detectedPii:['Name','Email','DOB'],        frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Acquisition','Retention'] },
  { id:'ls1', divisionId:'ld1', x:90,   y:230, name:'AdReach Pro',      stage:'Acquisition', riskScore:72,   piiVolume:'moderate', email:'ads@adreach.io',   contact:'Sam', phone:'+91 98100 11111', website:'adreach.io', gst:'', pan:'', piiFlow:'share',  piiTypes:['Name','Email','Phone'],  hasTruthGap:false, declaredPii:['Name','Email','Phone'],  detectedPii:['Name','Email','Phone'],  internalSpoc:'priya@abc.co', externalSpoc:'sam@adreach.io',  frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Acquisition'], stakeholders:{ businessOwner:'priya@abc.co', accountManager:'sam@adreach.io' } },
  { id:'ls2', divisionId:'ld1', x:330,  y:230, name:'LeadGen Solutions', stage:'Acquisition', riskScore:null, piiVolume:'low',      email:'info@leadgen.co',  contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'ingest', piiTypes:['Email'],                 hasTruthGap:false, declaredPii:['Email'],                detectedPii:['Email'],                internalSpoc:'priya@abc.co', externalSpoc:'leads@leadgen.co', frequency:'Weekly', contractEnd:'2026-09-30', lifecycles:['Acquisition'] },
  { id:'ls5', divisionId:'ld3', x:500,  y:230, name:'NPS Track Co.',     stage:'Retention',   riskScore:68,   piiVolume:'moderate', email:'nps@track.io',     contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'both',   piiTypes:['Phone','Email'],         hasTruthGap:false, declaredPii:['Phone','Email'],        detectedPii:['Phone','Email'],        internalSpoc:'raj@abc.co',   frequency:'Daily',  contractEnd:'2026-10-31', lifecycles:['Retention'] },
  { id:'ls6', divisionId:'ld3', x:730,  y:230, name:'Call Center Ltd',   stage:'Retention',   riskScore:22,   piiVolume:'high',     email:'cc@ltd.com',       contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'both',   piiTypes:['Aadhar','Phone'],        hasTruthGap:true,  declaredPii:['Phone'],                detectedPii:['Aadhar','Phone','Location'], internalSpoc:'raj@abc.co', externalSpoc:'ops@ccltd.com', frequency:'Hourly', contractEnd:'2025-12-31', lifecycles:['Retention'], stakeholders:{ businessOwner:'raj@abc.co', escalationContact:'ciso@abc.co', accountManager:'ops@ccltd.com' } },
  { id:'ls9',  divisionId:'ld5', x:900,  y:230, name:'UpSell AI',        stage:'Upgradation', riskScore:76,   piiVolume:'moderate', email:'api@upsellai.com', contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'share',  piiTypes:['Financial','PAN'],       hasTruthGap:false, declaredPii:['Financial','PAN'],      detectedPii:['Financial','PAN'],      internalSpoc:'anita@abc.co', frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Upgradation'] },
  { id:'ls10', divisionId:'ld5', x:1130, y:230, name:'Policy Xpander',   stage:'Upgradation', riskScore:60,   piiVolume:'low',      email:'px@policyxp.in',  contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'ingest', piiTypes:['Name','DOB'],            hasTruthGap:false, declaredPii:['Name','DOB'],           detectedPii:['Name','DOB'],           internalSpoc:'anita@abc.co', frequency:'Weekly', contractEnd:'2027-06-30', lifecycles:['Upgradation'] },
  { id:'ls13', divisionId:'ld7', x:1300, y:230, name:'Churn Analytics',  stage:'Offboarding', riskScore:50,   piiVolume:'moderate', email:'ops@churnai.io',   contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'ingest', piiTypes:['Phone','Email'],         hasTruthGap:false, declaredPii:['Phone','Email'],        detectedPii:['Phone','Email'],        internalSpoc:'kiran@abc.co', frequency:'Daily',  contractEnd:'2026-07-31', lifecycles:['Offboarding'] },
  { id:'ls14', divisionId:'ld7', x:1530, y:230, name:'WinBack Mktg',     stage:'Offboarding', riskScore:40,   piiVolume:'low',      email:'wb@winback.in',    contact:'',    phone:'',               website:'',           gst:'', pan:'', piiFlow:'share',  piiTypes:['Email'],                 hasTruthGap:false, declaredPii:['Email'],                detectedPii:['Email'],                internalSpoc:'kiran@abc.co', frequency:'Weekly', contractEnd:'2025-12-31', lifecycles:['Offboarding'] },
];

const INIT_SYSTEMS: SystemNode[] = [
  {
    id:'sys1', divisionId:'d1', x:480, y:100, name:'Salesforce CRM', type:'crm',
    dataSource:'AWS S3 Bucket (us-east-1/crm-prod)',
    piiTypes:['Name','Email','Phone','DOB'],
    vulnScore:82,
    stage:'Acquisition',
    internalSpoc:'priya@abc.co',
    authorizedPii:['Name','Phone','Email','DOB'],
    hasStageDiscrepancy:true,
    discrepancyFields:['Bank Balance','Aadhar'],
    linkedSupplierId:'s2',
    agentReasoning:{
      timestamp:'09:14 AM',
      action:'Stage PII Audit',
      trigger:'Salesforce CRM \u00b7 Acquisition Step',
      reasoning:'Detected "Bank Balance" and "Aadhar" fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step \u2014 they belong to Retention/Upgradation workflows. Probable cause: employee error or unauthorized data pre-fill. Flagging as Stage Discrepancy.',
      confidence:94,
      outcome:'alert',
    },
  },
  {
    id:'sys2', divisionId:'d2', x:120, y:560, name:'AWS Infra', type:'infra',
    dataSource:'SQL DB (prod-db.internal:5432)',
    piiTypes:['Credentials','Financial','PAN'],
    vulnScore:61,
    stage:'Upgradation',
    internalSpoc:'anita@abc.co',
    authorizedPii:['Credentials','Financial','PAN'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'s4',
  },
  {
    id:'lsys1', divisionId:'ld1', x:215, y:320,
    name:'Salesforce CRM', type:'crm',
    dataSource:'AWS S3 (us-east-1/crm-prod)',
    piiTypes:['Name','Email','Phone','DOB'],
    vulnScore:82, stage:'Acquisition', internalSpoc:'priya@abc.co',
    authorizedPii:['Name','Phone','Email'],
    hasStageDiscrepancy:true, discrepancyFields:['Bank Balance','Aadhar'],
    linkedSupplierId:'ls2',
    agentReasoning:{ timestamp:'09:14 AM', action:'Stage PII Audit', trigger:'Salesforce CRM \u00b7 Acquisition Step', reasoning:'Detected "Bank Balance" and "Aadhar" fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step \u2014 they belong to Retention/Upgradation workflows.', confidence:94, outcome:'alert' },
  },
  {
    id:'lsys3', divisionId:'ld3', x:615, y:320,
    name:'Zendesk CRM', type:'crm',
    dataSource:'AWS RDS (ap-south-1/zendesk-prod)',
    piiTypes:['Name','Email','Phone'],
    vulnScore:79, stage:'Retention', internalSpoc:'raj@abc.co',
    authorizedPii:['Name','Email','Phone'],
    hasStageDiscrepancy:false, linkedSupplierId:'ls5',
  },
  {
    id:'lsys5', divisionId:'ld5', x:1015, y:320,
    name:'Policy Engine', type:'infra',
    dataSource:'AWS S3 (ap-south-1/policy-engine)',
    piiTypes:['Financial','PAN','DOB'],
    vulnScore:65, stage:'Upgradation', internalSpoc:'anita@abc.co',
    authorizedPii:['Financial','PAN','DOB'],
    hasStageDiscrepancy:false, linkedSupplierId:'ls9',
  },
  {
    id:'lsys7', divisionId:'ld7', x:1415, y:320,
    name:'Churn Dashboard', type:'crm',
    dataSource:'GCP BigQuery (project/churn-metrics)',
    piiTypes:['Phone','Email'],
    vulnScore:70, stage:'Offboarding', internalSpoc:'kiran@abc.co',
    authorizedPii:['Phone','Email'],
    hasStageDiscrepancy:false, linkedSupplierId:'ls13',
  },
];

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

const initialStages: StageData[] = [
  {
    id: 'acquisition', label: 'Acquisition', color: '#0EA5E9',
    systems: [
      { id: 's1', name: 'Insurance Sales App', method: 'Mobile App', methodColor: '#0EA5E9' },
      { id: 's2', name: 'Branch Walk-in', method: 'Branch', methodColor: '#F59E0B' },
      { id: 's3', name: 'CRM Portal', method: 'Portal', methodColor: '#8B5CF6' },
    ],
    suppliers: [
      { id: 'sup1', name: 'Field Agent Mgmt Co', state: 'complete_unconfigured', score: 78, risk: 'High' },
      { id: 'sup2', name: 'Doc Verify Service', state: 'pending', daysInfo: 'Portal sent 5 days ago' },
    ],
  },
  {
    id: 'retention', label: 'Retention', color: '#10B981',
    systems: [
      { id: 's4', name: 'Email Campaign System', method: 'Email', methodColor: '#10B981' },
      { id: 's5', name: 'Call Center', method: 'Phone', methodColor: '#F59E0B' },
      { id: 's6', name: 'Customer Portal', method: 'Portal', methodColor: '#8B5CF6' },
    ],
    suppliers: [
      { id: 'sup3', name: 'XYZ Email Marketing', state: 'active', score: 42, risk: 'Low', piiIcons: ['Email', 'Mobile'], transferMethod: 'API \u00b7 Daily', agent: 'A2' },
      { id: 'sup4', name: 'Call Center Outsourcing', state: 'overdue', daysInfo: '38 days since invite' },
    ],
  },
  {
    id: 'upgradation', label: 'Upgradation', color: '#F59E0B',
    systems: [
      { id: 's7', name: 'Loyalty Platform', method: 'Portal', methodColor: '#8B5CF6' },
    ],
    suppliers: [
      { id: 'sup5', name: 'Upsell Campaign Manager', state: 'pending', daysInfo: 'Portal sent 2 days ago' },
    ],
  },
  {
    id: 'offboarding', label: 'Offboarding', color: '#94A3B8',
    systems: [
      { id: 's8', name: 'Account Closure', method: 'Internal', methodColor: '#64748B' },
      { id: 's9', name: 'Data Archival', method: 'Internal', methodColor: '#64748B' },
    ],
    suppliers: [],
  },
];

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
  const mockData: GraphData = {
    divisions: INIT_DIVS.map(d => ({ ...d })),
    suppliers: INIT_SUPS.map(s => ({ ...s })),
    systems: INIT_SYSTEMS.map(s => ({ ...s })),
    org: { ...INIT_ORG },
  };

  return withFallback(
    async () => toCamelCase(await api.get<unknown>('/library/graph')),
    mockData,
    'library-graph'
  );
}

/**
 * Fetch healthcare stages data from API
 */
export async function getHealthcareStages(): Promise<StageData[]> {
  const mockData = initialStages.map(s => ({
    ...s,
    systems: s.systems.map(sys => ({ ...sys })),
    suppliers: s.suppliers.map(sup => ({ ...sup })),
  }));

  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/library/healthcare/stages')),
    mockData,
    'healthcare-stages'
  );
}

/**
 * Create a new division
 */
export async function createDivision(division: DivisionCreate): Promise<Division> {
  const payload = toSnakeCase(division);
  const result = await api.post<Record<string, unknown>>('/library/divisions', payload);
  return toCamelCase<Division>(result);
}

/**
 * Create a new supplier in the graph
 */
export async function createSupplier(supplier: SupplierCreate): Promise<Supplier> {
  const payload = toSnakeCase(supplier);
  const result = await api.post<Record<string, unknown>>('/library/suppliers', payload);
  return toCamelCase<Supplier>(result);
}

/**
 * Create a new system in the graph
 */
export async function createSystem(system: SystemCreate): Promise<SystemNode> {
  const payload = toSnakeCase(system);
  const result = await api.post<Record<string, unknown>>('/library/systems', payload);
  return toCamelCase<SystemNode>(result);
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

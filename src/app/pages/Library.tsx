import { useState, useRef, useEffect } from 'react';
import { RotateCcw, X, Network, AlertTriangle, Building2, Briefcase, Database, Eye, EyeOff, Smartphone, Cpu, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

/* ─── Types ─────────────────────────────────────────────── */
type Stage       = 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';
type PiiVolume   = 'low' | 'moderate' | 'high';
type DragType    = 'canvas' | 'org' | 'div' | 'sup' | 'sys';
type PiiFlow     = 'share' | 'ingest' | 'both';

interface DragState { type: DragType; id: string; startMX: number; startMY: number; startX: number; startY: number; }
interface Division  { id: string; x: number; y: number; name: string; lifecycleStage?: Stage; }
interface Supplier  {
  id: string; divisionId: string; x: number; y: number;
  name: string; email: string; contact: string; phone: string; website: string; gst: string; pan: string;
  stage: Stage; riskScore: number | null; piiVolume: PiiVolume;
  piiFlow?: PiiFlow; piiTypes?: string[];
  hasTruthGap?: boolean; declaredPII?: string[]; detectedPII?: string[];
  internalSPOC?: string; externalSPOC?: string;
  contractStart?: string; contractEnd?: string;
  frequency?: string;
  lifecycles?: Stage[];
  stakeholders?: {
    businessOwner?: string; financeContact?: string; projectManager?: string; escalationContact?: string;
    accountManager?: string; supplierFinance?: string; supplierEscalation?: string;
  };
}
interface SystemNode { id: string; divisionId: string; x: number; y: number; name: string; type: 'crm' | 'infra' | 'db';
  dataSource?: string; piiTypes?: string[]; vulnScore?: number;
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

type ModalState =
  | null
  | { type: 'addDiv'; spawnX?: number; spawnY?: number; lifecycleStage?: Stage }
  | { type: 'chooseAsset'; divisionId: string }
  | { type: 'addSup';  divisionId: string }
  | { type: 'addSys';  divisionId: string }
  | { type: 'supInfo'; supplierId: string }
  | { type: 'xrayInfo'; supplierId: string }
  | { type: 'sysInfo'; systemId: string }
  | { type: 'sysReasoning'; systemId: string }
  | { type: 'divInfo'; divisionId: string };

/* ─── Constants ─────────────────────────────────────────── */
const STAGES: Stage[]  = ['Acquisition', 'Retention', 'Upgradation', 'Offboarding'];
const STAGE_CLR: Record<Stage, [string, string]> = {
  Acquisition: ['#EFF6FF', '#0EA5E9'],
  Retention:   ['#ECFDF5', '#10B981'],
  Upgradation: ['#FFFBEB', '#F59E0B'],
  Offboarding: ['#F1F5F9', '#64748B'],
};

/* Column X-axis boundaries as fractions of canvas width (1600px wide) */
const LIFECYCLE_COLUMNS: Record<Stage, { minFrac: number; maxFrac: number }> = {
  Acquisition: { minFrac: 0,    maxFrac: 0.25 },
  Retention:   { minFrac: 0.25, maxFrac: 0.50 },
  Upgradation: { minFrac: 0.50, maxFrac: 0.75 },
  Offboarding: { minFrac: 0.75, maxFrac: 1.00 },
};
const CANVAS_W = 1600;
const CANVAS_H = 1000;

const ORG_R   = 32;
const DIV_R   = 24;
const toRad   = (d: number) => (d * Math.PI) / 180;

/* ─── Color helpers ─────────────────────────────────────── */
const innerColor = (score: number | null): string =>
  score === null ? '#94A3B8' : score >= 50 ? '#10B981' : '#EF4444';
const piiStrokeW = (vol: PiiVolume): number =>
  vol === 'low' ? 3 : vol === 'moderate' ? 7 : 13;
const supOuterR = (vol: PiiVolume): number =>
  vol === 'low' ? 22 : vol === 'moderate' ? 26 : 32;

/* ─── Mock Data ─────────────────────────────────────────── */
const INIT_ORG = { x: 580, y: 380 };

/* ── Graph-view divisions (no lifecycleStage) ── */
const INIT_DIVS: Division[] = [
  { id: 'd1', name: 'Marketing Dept',  x: 400, y: 200 },
  { id: 'd2', name: 'Technical Dept',  x: 350, y: 500 },
  { id: 'd3', name: 'Operations Dept', x: 760, y: 480 },
  /* ── Lifecycle-view divisions (lifecycleStage assigned, X inside column bounds) ──
     Canvas = 1600 wide. Columns: Acq 0–400, Ret 400–800, Upg 800–1200, Off 1200–1600  */
  { id: 'ld1', name: 'Growth & Leads',    x: 200,  y: 200, lifecycleStage: 'Acquisition' },
  { id: 'ld2', name: 'Digital Marketing', x: 200,  y: 500, lifecycleStage: 'Acquisition' },
  { id: 'ld3', name: 'Customer Success',  x: 600,  y: 200, lifecycleStage: 'Retention'   },
  { id: 'ld4', name: 'Loyalty Programs',  x: 600,  y: 500, lifecycleStage: 'Retention'   },
  { id: 'ld5', name: 'Product Upgrades',  x: 1000, y: 200, lifecycleStage: 'Upgradation' },
  { id: 'ld6', name: 'Technical Dept',    x: 1000, y: 500, lifecycleStage: 'Upgradation' },
  { id: 'ld7', name: 'Churn Prevention',  x: 1400, y: 200, lifecycleStage: 'Offboarding' },
  { id: 'ld8', name: 'Exit Processing',   x: 1400, y: 500, lifecycleStage: 'Offboarding' },
];

const INIT_SUPS: Supplier[] = [
  /* ── Original graph-view suppliers ── */
  { id:'s1', divisionId:'d1', x:220, y:120, name:'XYZ Email Mktg',  stage:'Acquisition', riskScore:78,   piiVolume:'moderate', email:'xyz@email.com',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'share',  piiTypes:['Aadhar','Phone','Email'], hasTruthGap:false, declaredPII:['Aadhar','Phone','Email'],    detectedPII:['Aadhar','Phone','Email'],    internalSPOC:'priya@abc.co',  externalSPOC:'john@xyz.com',    frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Acquisition','Retention'], stakeholders:{ businessOwner:'priya@abc.co', financeContact:'finance@abc.co', accountManager:'john@xyz.com', supplierFinance:'billing@xyz.com' } },
  { id:'s2', divisionId:'d1', x:380, y:80,  name:'Field Agent Co.', stage:'Acquisition', riskScore:null, piiVolume:'low',      email:'field@agent.com', contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'ingest', piiTypes:['Email'],              hasTruthGap:false, declaredPII:['Email'],                    detectedPII:['Email'],                    internalSPOC:'priya@abc.co',  externalSPOC:'leads@field.com', frequency:'Weekly', contractEnd:'2026-06-30', lifecycles:['Acquisition'], stakeholders:{ businessOwner:'priya@abc.co', accountManager:'leads@field.com' } },
  { id:'s3', divisionId:'d1', x:200, y:280, name:'Call Center Ltd',  stage:'Retention',   riskScore:22,   piiVolume:'high',     email:'cc@ltd.com',      contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'both',   piiTypes:['Aadhar','Phone'],    hasTruthGap:true,  declaredPII:['Phone'],                    detectedPII:['Aadhar','Phone','Location'], internalSPOC:'raj@abc.co',    externalSPOC:'ops@ccltd.com',   frequency:'Hourly', contractEnd:'2025-12-31', lifecycles:['Retention','Upgradation'], stakeholders:{ businessOwner:'raj@abc.co', escalationContact:'ciso@abc.co', accountManager:'ops@ccltd.com', supplierEscalation:'escalate@ccltd.com' } },
  { id:'s4', divisionId:'d2', x:160, y:460, name:'CloudSec Inc.',    stage:'Upgradation', riskScore:82,   piiVolume:'low',      email:'cloud@sec.com',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'share',  piiTypes:['Credentials'],       hasTruthGap:false, declaredPII:['Credentials'],              detectedPII:['Credentials'],              internalSPOC:'anita@abc.co',  externalSPOC:'cto@cloudsec.io', frequency:'Daily',  contractEnd:'2027-03-31', lifecycles:['Upgradation'], stakeholders:{ businessOwner:'anita@abc.co', projectManager:'pm@abc.co', accountManager:'cto@cloudsec.io' } },
  { id:'s5', divisionId:'d2', x:200, y:620, name:'DataVault Co.',    stage:'Retention',   riskScore:35,   piiVolume:'moderate', email:'data@vault.co',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'both',   piiTypes:['Financial','PAN'],   hasTruthGap:true,  declaredPII:['Financial'],                detectedPII:['Financial','PAN','Aadhar'], internalSPOC:'anita@abc.co',  externalSPOC:'dpo@datavault.co',frequency:'Hourly', contractEnd:'2026-09-30', lifecycles:['Retention','Offboarding'], stakeholders:{ businessOwner:'anita@abc.co', escalationContact:'dpo@abc.co', accountManager:'dpo@datavault.co', supplierEscalation:'security@datavault.co' } },
  { id:'s6', divisionId:'d3', x:660, y:640, name:'LogiTrack Ltd',    stage:'Offboarding', riskScore:null, piiVolume:'low',      email:'lt@email.com',    contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'ingest', piiTypes:['Location'],          hasTruthGap:false, declaredPII:['Location'],                 detectedPII:['Location'],                 frequency:'Weekly', contractEnd:'2025-06-30', lifecycles:['Offboarding'] },
  { id:'s7', divisionId:'d3', x:880, y:560, name:'HR Systems Co.',   stage:'Acquisition', riskScore:88,   piiVolume:'moderate', email:'hr@systems.co',   contact:'', phone:'', website:'', gst:'', pan:'', piiFlow:'share',  piiTypes:['Name','Email','DOB'], hasTruthGap:false, declaredPII:['Name','Email','DOB'],        detectedPII:['Name','Email','DOB'],        frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Acquisition','Retention'] },

  /* ── Lifecycle-view suppliers — Acquisition column (X: 0–400) ── */
  { id:'ls1', divisionId:'ld1', x:100,  y:310, name:'AdReach Pro',     stage:'Acquisition', riskScore:72,   piiVolume:'moderate', email:'ads@adreach.io',    contact:'Sam', phone:'+91 98100 11111', website:'adreach.io',    gst:'', pan:'', piiFlow:'share',  piiTypes:['Name','Email','Phone'],  hasTruthGap:false, declaredPII:['Name','Email','Phone'],  detectedPII:['Name','Email','Phone'],  internalSPOC:'priya@abc.co', externalSPOC:'sam@adreach.io',  frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Acquisition'], stakeholders:{ businessOwner:'priya@abc.co', accountManager:'sam@adreach.io' } },
  { id:'ls2', divisionId:'ld1', x:330,  y:310, name:'LeadGen Solutions',stage:'Acquisition', riskScore:null, piiVolume:'low',      email:'info@leadgen.co',   contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'ingest', piiTypes:['Email'],                 hasTruthGap:false, declaredPII:['Email'],                detectedPII:['Email'],                internalSPOC:'priya@abc.co', externalSPOC:'leads@leadgen.co',frequency:'Weekly', contractEnd:'2026-09-30', lifecycles:['Acquisition'] },
  { id:'ls3', divisionId:'ld2', x:100,  y:615, name:'Social Ads Ltd',   stage:'Acquisition', riskScore:55,   piiVolume:'low',      email:'ops@socialads.com', contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'share',  piiTypes:['Email','DOB'],           hasTruthGap:false, declaredPII:['Email','DOB'],          detectedPII:['Email','DOB'],          internalSPOC:'priya@abc.co', frequency:'Daily',  contractEnd:'2027-03-31', lifecycles:['Acquisition'] },
  { id:'ls4', divisionId:'ld2', x:330,  y:615, name:'Content Bureau',   stage:'Acquisition', riskScore:90,   piiVolume:'low',      email:'cb@bureau.in',      contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'share',  piiTypes:['Name'],                  hasTruthGap:false, declaredPII:['Name'],                 detectedPII:['Name'],                 internalSPOC:'priya@abc.co', frequency:'Weekly', contractEnd:'2026-06-30', lifecycles:['Acquisition'] },

  /* ── Lifecycle-view suppliers — Retention column (X: 400–800) ── */
  { id:'ls5', divisionId:'ld3', x:500,  y:310, name:'NPS Track Co.',    stage:'Retention',   riskScore:68,   piiVolume:'moderate', email:'nps@track.io',      contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'both',   piiTypes:['Phone','Email'],         hasTruthGap:false, declaredPII:['Phone','Email'],        detectedPII:['Phone','Email'],        internalSPOC:'raj@abc.co',   frequency:'Daily',  contractEnd:'2026-10-31', lifecycles:['Retention'] },
  { id:'ls6', divisionId:'ld3', x:730,  y:310, name:'Call Center Ltd',  stage:'Retention',   riskScore:22,   piiVolume:'high',     email:'cc@ltd.com',        contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'both',   piiTypes:['Aadhar','Phone'],        hasTruthGap:true,  declaredPII:['Phone'],                detectedPII:['Aadhar','Phone','Location'], internalSPOC:'raj@abc.co', externalSPOC:'ops@ccltd.com', frequency:'Hourly', contractEnd:'2025-12-31', lifecycles:['Retention'], stakeholders:{ businessOwner:'raj@abc.co', escalationContact:'ciso@abc.co', accountManager:'ops@ccltd.com' } },
  { id:'ls7', divisionId:'ld4', x:500,  y:615, name:'Reward Engine',    stage:'Retention',   riskScore:80,   piiVolume:'low',      email:'ops@rewardeng.co',  contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'ingest', piiTypes:['Name','Email'],          hasTruthGap:false, declaredPII:['Name','Email'],         detectedPII:['Name','Email'],         internalSPOC:'raj@abc.co',   frequency:'Weekly', contractEnd:'2027-01-31', lifecycles:['Retention'] },
  { id:'ls8', divisionId:'ld4', x:730,  y:615, name:'Survey Monk',      stage:'Retention',   riskScore:45,   piiVolume:'moderate', email:'api@surveymonk.in', contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'share',  piiTypes:['Email','Phone'],         hasTruthGap:false, declaredPII:['Email','Phone'],        detectedPII:['Email','Phone'],        internalSPOC:'raj@abc.co',   frequency:'Daily',  contractEnd:'2026-08-31', lifecycles:['Retention'] },

  /* ── Lifecycle-view suppliers — Upgradation column (X: 800–1200) ── */
  { id:'ls9',  divisionId:'ld5', x:900,  y:310, name:'UpSell AI',        stage:'Upgradation', riskScore:76,   piiVolume:'moderate', email:'api@upsellai.com',  contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'share',  piiTypes:['Financial','PAN'],       hasTruthGap:false, declaredPII:['Financial','PAN'],      detectedPII:['Financial','PAN'],      internalSPOC:'anita@abc.co', frequency:'Daily',  contractEnd:'2026-12-31', lifecycles:['Upgradation'] },
  { id:'ls10', divisionId:'ld5', x:1130, y:310, name:'Policy Xpander',   stage:'Upgradation', riskScore:60,   piiVolume:'low',      email:'px@policyxp.in',    contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'ingest', piiTypes:['Name','DOB'],            hasTruthGap:false, declaredPII:['Name','DOB'],           detectedPII:['Name','DOB'],           internalSPOC:'anita@abc.co', frequency:'Weekly', contractEnd:'2027-06-30', lifecycles:['Upgradation'] },
  { id:'ls11', divisionId:'ld6', x:900,  y:615, name:'CloudSec Inc.',    stage:'Upgradation', riskScore:82,   piiVolume:'low',      email:'cloud@sec.com',     contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'share',  piiTypes:['Credentials'],           hasTruthGap:false, declaredPII:['Credentials'],          detectedPII:['Credentials'],          internalSPOC:'anita@abc.co', externalSPOC:'cto@cloudsec.io', frequency:'Daily', contractEnd:'2027-03-31', lifecycles:['Upgradation'] },
  { id:'ls12', divisionId:'ld6', x:1130, y:615, name:'DataVault Co.',    stage:'Upgradation', riskScore:35,   piiVolume:'moderate', email:'data@vault.co',     contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'both',   piiTypes:['Financial','PAN'],       hasTruthGap:true,  declaredPII:['Financial'],            detectedPII:['Financial','PAN','Aadhar'], internalSPOC:'anita@abc.co', frequency:'Hourly', contractEnd:'2026-09-30', lifecycles:['Upgradation'] },

  /* ── Lifecycle-view suppliers — Offboarding column (X: 1200–1600) ── */
  { id:'ls13', divisionId:'ld7', x:1300, y:310, name:'Churn Analytics',  stage:'Offboarding', riskScore:50,   piiVolume:'moderate', email:'ops@churnai.io',    contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'ingest', piiTypes:['Phone','Email'],         hasTruthGap:false, declaredPII:['Phone','Email'],        detectedPII:['Phone','Email'],        internalSPOC:'kiran@abc.co', frequency:'Daily',  contractEnd:'2026-07-31', lifecycles:['Offboarding'] },
  { id:'ls14', divisionId:'ld7', x:1530, y:310, name:'WinBack Mktg',     stage:'Offboarding', riskScore:40,   piiVolume:'low',      email:'wb@winback.in',     contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'share',  piiTypes:['Email'],                 hasTruthGap:false, declaredPII:['Email'],                detectedPII:['Email'],                internalSPOC:'kiran@abc.co', frequency:'Weekly', contractEnd:'2025-12-31', lifecycles:['Offboarding'] },
  { id:'ls15', divisionId:'ld8', x:1300, y:615, name:'LogiTrack Ltd',    stage:'Offboarding', riskScore:null, piiVolume:'low',      email:'lt@email.com',      contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'ingest', piiTypes:['Location'],              hasTruthGap:false, declaredPII:['Location'],             detectedPII:['Location'],             internalSPOC:'kiran@abc.co', frequency:'Weekly', contractEnd:'2025-06-30', lifecycles:['Offboarding'] },
  { id:'ls16', divisionId:'ld8', x:1530, y:615, name:'Data Purge Co.',   stage:'Offboarding', riskScore:88,   piiVolume:'high',     email:'purge@datapurge.co',contact:'',    phone:'',               website:'',             gst:'', pan:'', piiFlow:'both',   piiTypes:['Aadhar','PAN','Financial'],hasTruthGap:true, declaredPII:['Aadhar','PAN'],          detectedPII:['Aadhar','PAN','Financial','Location'], internalSPOC:'kiran@abc.co', frequency:'Hourly', contractEnd:'2026-03-31', lifecycles:['Offboarding'] },
];

const INIT_SYSTEMS: SystemNode[] = [
  /* ── Original graph-view systems ── */
  {
    id:'sys1', divisionId:'d1', x:480, y:100, name:'Salesforce CRM', type:'crm',
    dataSource:'AWS S3 Bucket (us-east-1/crm-prod)',
    piiTypes:['Name','Email','Phone','DOB'],
    vulnScore:82,
    stage:'Acquisition',
    internalSPOC:'priya@abc.co',
    authorizedPII:['Name','Phone','Email','DOB'],
    hasStageDiscrepancy:true,
    discrepancyFields:['Bank Balance','Aadhar'],
    linkedSupplierId:'s2',
    agentReasoning:{
      timestamp:'09:14 AM',
      action:'Stage PII Audit',
      trigger:'Salesforce CRM · Acquisition Step',
      reasoning:'Detected "Bank Balance" and "Aadhar" fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step — they belong to Retention/Upgradation workflows. Probable cause: employee error or unauthorized data pre-fill. Flagging as Stage Discrepancy.',
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
    internalSPOC:'anita@abc.co',
    authorizedPII:['Credentials','Financial','PAN'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'s4',
  },

  /* ── Lifecycle-view systems — Acquisition column ── */
  {
    id:'lsys1', divisionId:'ld1', x:215, y:420,
    name:'Salesforce CRM', type:'crm',
    dataSource:'AWS S3 (us-east-1/crm-prod)',
    piiTypes:['Name','Email','Phone','DOB'],
    vulnScore:82,
    stage:'Acquisition',
    internalSPOC:'priya@abc.co',
    authorizedPII:['Name','Phone','Email'],
    hasStageDiscrepancy:true,
    discrepancyFields:['Bank Balance','Aadhar'],
    linkedSupplierId:'ls2',
    agentReasoning:{
      timestamp:'09:14 AM', action:'Stage PII Audit', trigger:'Salesforce CRM · Acquisition Step',
      reasoning:'Detected "Bank Balance" and "Aadhar" fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step — they belong to Retention/Upgradation workflows.',
      confidence:94, outcome:'alert',
    },
  },
  {
    id:'lsys2', divisionId:'ld2', x:215, y:730,
    name:'HubSpot Ads', type:'crm',
    dataSource:'GCP BigQuery (project/ads-analytics)',
    piiTypes:['Email','Phone'],
    vulnScore:74,
    stage:'Acquisition',
    internalSPOC:'priya@abc.co',
    authorizedPII:['Email','Phone'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'ls3',
  },

  /* ── Lifecycle-view systems — Retention column ── */
  {
    id:'lsys3', divisionId:'ld3', x:615, y:420,
    name:'Zendesk CRM', type:'crm',
    dataSource:'AWS RDS (ap-south-1/zendesk-prod)',
    piiTypes:['Name','Email','Phone'],
    vulnScore:79,
    stage:'Retention',
    internalSPOC:'raj@abc.co',
    authorizedPII:['Name','Email','Phone'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'ls5',
  },
  {
    id:'lsys4', divisionId:'ld4', x:615, y:730,
    name:'Loyalty DB', type:'db',
    dataSource:'SQL DB (loyalty-prod.internal:5432)',
    piiTypes:['Name','Email','PAN'],
    vulnScore:55,
    stage:'Retention',
    internalSPOC:'raj@abc.co',
    authorizedPII:['Name','Email'],
    hasStageDiscrepancy:true,
    discrepancyFields:['PAN','Aadhar'],
    linkedSupplierId:'ls8',
    agentReasoning:{
      timestamp:'11:02 AM', action:'Stage PII Audit', trigger:'Loyalty DB · Retention Step',
      reasoning:'PAN and Aadhar fields detected in Loyalty DB at Retention stage. These financial identifiers should only be collected at Upgradation. Possible pre-fill from an upstream pipeline. Flagging as Stage Discrepancy.',
      confidence:88, outcome:'alert',
    },
  },

  /* ── Lifecycle-view systems — Upgradation column ── */
  {
    id:'lsys5', divisionId:'ld5', x:1015, y:420,
    name:'Policy Engine', type:'infra',
    dataSource:'AWS S3 (ap-south-1/policy-engine)',
    piiTypes:['Financial','PAN','DOB'],
    vulnScore:65,
    stage:'Upgradation',
    internalSPOC:'anita@abc.co',
    authorizedPII:['Financial','PAN','DOB'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'ls9',
  },
  {
    id:'lsys6', divisionId:'ld6', x:1015, y:730,
    name:'AWS Infra', type:'infra',
    dataSource:'SQL DB (prod-db.internal:5432)',
    piiTypes:['Credentials','Financial','PAN'],
    vulnScore:61,
    stage:'Upgradation',
    internalSPOC:'anita@abc.co',
    authorizedPII:['Credentials','Financial','PAN'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'ls11',
  },

  /* ── Lifecycle-view systems — Offboarding column ── */
  {
    id:'lsys7', divisionId:'ld7', x:1415, y:420,
    name:'Churn Dashboard', type:'crm',
    dataSource:'GCP BigQuery (project/churn-metrics)',
    piiTypes:['Phone','Email'],
    vulnScore:70,
    stage:'Offboarding',
    internalSPOC:'kiran@abc.co',
    authorizedPII:['Phone','Email'],
    hasStageDiscrepancy:false,
    linkedSupplierId:'ls13',
  },
  {
    id:'lsys8', divisionId:'ld8', x:1415, y:730,
    name:'Purge Vault', type:'db',
    dataSource:'AWS S3 (ap-south-1/data-purge-vault)',
    piiTypes:['Aadhar','PAN','Financial','Location'],
    vulnScore:30,
    stage:'Offboarding',
    internalSPOC:'kiran@abc.co',
    authorizedPII:['Aadhar','PAN'],
    hasStageDiscrepancy:true,
    discrepancyFields:['Financial','Location'],
    linkedSupplierId:'ls16',
    agentReasoning:{
      timestamp:'02:47 PM', action:'Stage PII Audit', trigger:'Purge Vault · Offboarding Step',
      reasoning:'Financial records and Location data detected in Purge Vault during Offboarding. Only Aadhar and PAN are authorized for deletion confirmation at this step. Possible incomplete data sanitization from upstream systems.',
      confidence:91, outcome:'alert',
    },
  },
];

/* ─── Supplier dual-circle SVG ──────────────────────────── */
function SupCircle({ riskScore, piiVolume, size }: { riskScore: number | null; piiVolume: PiiVolume; size: number }) {
  const sw  = piiStrokeW(piiVolume);
  const r   = size / 2 - sw / 2 - 1;
  const ir  = size * 0.34;
  return (
    <svg width={size} height={size} style={{ display: 'block', flexShrink: 0, overflow: 'visible' }}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#EF4444" strokeWidth={sw} opacity={0.35} />
      <circle cx={size/2} cy={size/2} r={ir} fill={innerColor(riskScore)} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function Library() {
  const containerRef  = useRef<HTMLDivElement>(null);
  const dragMovedRef  = useRef(false);

  const [zoom, setZoom]           = useState(1);
  const [pan,  setPan]            = useState({ x: 0, y: 0 });
  const [drag, setDrag]           = useState<DragState | null>(null);
  const [orgPos, setOrgPos]       = useState(INIT_ORG);
  const [divisions, setDivisions] = useState<Division[]>(INIT_DIVS);
  const [suppliers, setSuppliers] = useState<Supplier[]>(INIT_SUPS);
  const [systems,   setSystems]   = useState<SystemNode[]>(INIT_SYSTEMS);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modal, setModal]         = useState<ModalState>(null);
  const [xrayMode,  setXrayMode]  = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lifecycleView, setLifecycleView] = useState(false);
  const [showLegend, setShowLegend] = useState(true);

  // Add Division form
  const [divName, setDivName]   = useState('');
  // Add Supplier form
  const [supForm, setSupForm]   = useState({ name:'', email:'', contact:'', phone:'', website:'', gst:'', pan:'', stage:'' as Stage|'', contractStart:'', contractEnd:'', frequency:'Daily', lifecycles:[] as Stage[], businessOwner:'', financeContact:'', projectManager:'', escalationContact:'', accountManager:'', supplierFinance:'', supplierEscalation:'' });
  // Add System form
  const [sysForm, setSysForm]   = useState({ name:'', type:'crm' as SystemNode['type'], stage:'' as Stage|'', dataSource:'', authorizedPII:[] as string[], vulnScore:75, linkedSupplierId:'' });

  /* ── Center on mount ────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setPan({ x: r.width / 2 - INIT_ORG.x, y: r.height / 2 - INIT_ORG.y });
  }, []);

  /* ── Wheel zoom ─────────────────────────────────────── */
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const rect   = el.getBoundingClientRect();
      const cx = e.clientX - rect.left, cy = e.clientY - rect.top;
      setZoom(prev => {
        const next = Math.max(0.25, Math.min(3, prev * factor));
        setPan(p => ({ x: cx - (cx - p.x) * (next / prev), y: cy - (cy - p.y) * (next / prev) }));
        return next;
      });
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  /* ── Global drag — with lifecycle X-clamp ───────────── */
  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - drag.startMX, dy = e.clientY - drag.startMY;
      if (Math.abs(dx) + Math.abs(dy) >= 3) dragMovedRef.current = true;
      if (!dragMovedRef.current) return;
      const vdx = dx / zoom, vdy = dy / zoom;

      if (drag.type === 'canvas') {
        if (lifecycleView) return; // canvas pan disabled in lifecycle mode
        setPan({ x: drag.startX + dx, y: drag.startY + dy });
      } else if (drag.type === 'org') {
        setOrgPos({ x: drag.startX + vdx, y: drag.startY + vdy });
      } else if (drag.type === 'div') {
        setDivisions(ds => ds.map(d => {
          if (d.id !== drag.id) return d;
          let newX = drag.startX + vdx;
          let newY = drag.startY + vdy;
          // In lifecycle mode, clamp X to the column boundaries of this division's lifecycle stage
          if (lifecycleView && d.lifecycleStage) {
            const col = LIFECYCLE_COLUMNS[d.lifecycleStage];
            const minX = col.minFrac * CANVAS_W + DIV_R + 8;
            const maxX = col.maxFrac * CANVAS_W - DIV_R - 8;
            newX = Math.max(minX, Math.min(maxX, newX));
          }
          return { ...d, x: newX, y: newY };
        }));
      } else if (drag.type === 'sup') {
        setSuppliers(ss => ss.map(s => {
          if (s.id !== drag.id) return s;
          let newX = drag.startX + vdx;
          let newY = drag.startY + vdy;
          // In lifecycle mode, clamp X to the division's lifecycle column
          if (lifecycleView) {
            const parentDiv = divisions.find(d => d.id === s.divisionId);
            if (parentDiv?.lifecycleStage) {
              const col = LIFECYCLE_COLUMNS[parentDiv.lifecycleStage];
              const minX = col.minFrac * CANVAS_W + 16;
              const maxX = col.maxFrac * CANVAS_W - 16;
              newX = Math.max(minX, Math.min(maxX, newX));
            }
          }
          return { ...s, x: newX, y: newY };
        }));
      } else if (drag.type === 'sys') {
        setSystems(sys => sys.map(s => {
          if (s.id !== drag.id) return s;
          let newX = drag.startX + vdx;
          let newY = drag.startY + vdy;
          // In lifecycle mode, clamp X to the division's lifecycle column
          if (lifecycleView) {
            const parentDiv = divisions.find(d => d.id === s.divisionId);
            if (parentDiv?.lifecycleStage) {
              const col = LIFECYCLE_COLUMNS[parentDiv.lifecycleStage];
              const minX = col.minFrac * CANVAS_W + 16;
              const maxX = col.maxFrac * CANVAS_W - 16;
              newX = Math.max(minX, Math.min(maxX, newX));
            }
          }
          return { ...s, x: newX, y: newY };
        }));
      }
    };
    const onUp = () => setDrag(null);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); }
  }, [drag, zoom, lifecycleView, divisions]);

  /* ── Helpers ────────────────────────────────────────── */
  const resetView = () => {
    setZoom(1);
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    if (lifecycleView) {
      // In lifecycle mode: snap columns to fill the viewport
      setPan({ x: 0, y: 0 });
    } else {
      // In graph mode: re-centre on org node
      setPan({ x: r.width / 2 - orgPos.x, y: r.height / 2 - orgPos.y });
    }
  };
  const startDrag = (type: DragType, id: string, e: React.MouseEvent, startX: number, startY: number) => {
    e.stopPropagation();
    dragMovedRef.current = false;
    setDrag({ type, id, startMX: e.clientX, startMY: e.clientY, startX, startY });
  };
  const handleNodeClick = (e: React.MouseEvent, id: string, action: () => void) => {
    e.stopPropagation();
    if (dragMovedRef.current) return;
    setSelectedId(id);
    action();
  };

  /* ── X-Ray: which ids are "dim" ─────────────────────── */
  const dimmedIds = new Set<string>();
  if (xrayMode && selectedId) {
    const selSup = suppliers.find(s => s.id === selectedId);
    const selDiv = divisions.find(d => d.id === selectedId);
    const selSys = systems.find(s => s.id === selectedId);
    const focusedDivId = selSup?.divisionId ?? selSys?.divisionId ?? (selDiv ? selectedId : null);
    if (focusedDivId) {
      divisions.forEach(d => { if (d.id !== focusedDivId) dimmedIds.add(d.id); });
      suppliers.forEach(s => { if (s.divisionId !== focusedDivId) dimmedIds.add(s.id); });
      systems.forEach(s => {
        const linkedSup = s.linkedSupplierId ? suppliers.find(x => x.id === s.linkedSupplierId) : null;
        const inFocus = s.divisionId === focusedDivId || (linkedSup && linkedSup.divisionId === focusedDivId);
        if (!inFocus) dimmedIds.add(s.id);
      });
    }
  }
  const dimOpacity = (id: string) => xrayMode && dimmedIds.has(id) ? 0.08 : 1;

  /* ── Switch views — always reset pan/zoom so canvas is correctly framed ── */
  const handleToggleLifecycle = () => {
    const el = containerRef.current;
    const r  = el?.getBoundingClientRect();
    setZoom(1);
    setDrag(null);
    if (!lifecycleView) {
      // Lifecycle mode: snap pan so canvas x=0 aligns with viewport left (columns fill screen width)
      if (r) setPan({ x: 0, y: 0 });
      setLifecycleView(true);
    } else {
      // Graph mode: re-centre on the org node
      if (r) setPan({ x: r.width / 2 - INIT_ORG.x, y: r.height / 2 - INIT_ORG.y });
      setLifecycleView(false);
    }
  };

  /* ── Compute lifecycle-assigned divisions ───────────── */
  const lifecycleDivisions = divisions.filter(d => d.lifecycleStage !== undefined);

  /* ── Add Division ───────────────────────────────────── */
  const addDivision = () => {
    if (!divName.trim()) return;

    let spawnX: number, spawnY: number;
    let lifecycleStage: Stage | undefined = undefined;

    if (modal?.type === 'addDiv' && modal.spawnX !== undefined && modal.spawnY !== undefined) {
      // Lifecycle view: place node inside the column
      spawnX = modal.spawnX;
      spawnY = modal.spawnY;
      lifecycleStage = modal.lifecycleStage;
    } else {
      // Graph view: radial from org
      const ang = toRad(divisions.length * 120);
      spawnX = orgPos.x + 200 * Math.cos(ang);
      spawnY = orgPos.y + 200 * Math.sin(ang);
    }

    setDivisions(ds => [...ds, { id: `d${Date.now()}`, name: divName.trim(), x: spawnX, y: spawnY, lifecycleStage }]);
    setModal(null);
    setDivName('');
    toast.success(`Division "${divName.trim()}" added`);
  };

  /* ── Add Supplier ───────────────────────────────────── */
  const addSupplier = () => {
    if (!supForm.name || !supForm.email || !supForm.stage) return;
    const divisionId = modal?.type === 'addSup' ? modal.divisionId : '';
    const div = divisions.find(d => d.id === divisionId);
    if (!div) return;
    const count = suppliers.filter(s => s.divisionId === div.id).length;

    // In lifecycle mode, position relative to the division node but clamped inside column
    let baseX = div.x, baseY = div.y;
    const ang = toRad(count * 72);
    let newX = baseX + 160 * Math.cos(ang);
    let newY = baseY + 160 * Math.sin(ang);

    if (lifecycleView && div.lifecycleStage) {
      const col = LIFECYCLE_COLUMNS[div.lifecycleStage];
      const minX = col.minFrac * CANVAS_W + 16;
      const maxX = col.maxFrac * CANVAS_W - 16;
      newX = Math.max(minX, Math.min(maxX, newX));
    }

    const lcs = supForm.lifecycles.length > 0 ? supForm.lifecycles : [supForm.stage as Stage];
    setSuppliers(ss => [...ss, { id:`s${Date.now()}`, divisionId:div.id, x:newX, y:newY, name:supForm.name, email:supForm.email, contact:supForm.contact, phone:supForm.phone, website:supForm.website, gst:supForm.gst, pan:supForm.pan, stage:supForm.stage as Stage, riskScore:null, piiVolume:'low', piiFlow:'share', piiTypes:[], hasTruthGap:false, declaredPII:[], detectedPII:[], contractStart:supForm.contractStart||undefined, contractEnd:supForm.contractEnd||undefined, frequency:supForm.frequency||undefined, lifecycles:lcs, stakeholders:{ businessOwner:supForm.businessOwner||undefined, financeContact:supForm.financeContact||undefined, projectManager:supForm.projectManager||undefined, escalationContact:supForm.escalationContact||undefined, accountManager:supForm.accountManager||undefined, supplierFinance:supForm.supplierFinance||undefined, supplierEscalation:supForm.supplierEscalation||undefined } }]);
    setModal(null); setSupForm({ name:'', email:'', contact:'', phone:'', website:'', gst:'', pan:'', stage:'', contractStart:'', contractEnd:'', frequency:'Daily', lifecycles:[], businessOwner:'', financeContact:'', projectManager:'', escalationContact:'', accountManager:'', supplierFinance:'', supplierEscalation:'' });
    toast.success(`Supplier "${supForm.name}" added`);
  };

  /* ── Add System ─────────────────────────────────────── */
  const addSystem = () => {
    if (!sysForm.name || !sysForm.stage || !sysForm.linkedSupplierId) return;
    const divisionId = modal?.type === 'addSys' ? modal.divisionId : '';
    const div = divisions.find(d => d.id === divisionId);
    if (!div) return;
    const linkedSup = suppliers.find(s => s.id === sysForm.linkedSupplierId);
    const anchorX = linkedSup ? linkedSup.x : div.x;
    const anchorY = linkedSup ? linkedSup.y : div.y;
    const count = systems.filter(s => s.divisionId === div.id).length;
    const ang = toRad((count + 2) * 72);
    let newX = anchorX + 140 * Math.cos(ang);
    let newY = anchorY + 140 * Math.sin(ang);

    if (lifecycleView && div.lifecycleStage) {
      const col = LIFECYCLE_COLUMNS[div.lifecycleStage];
      const minX = col.minFrac * CANVAS_W + 16;
      const maxX = col.maxFrac * CANVAS_W - 16;
      newX = Math.max(minX, Math.min(maxX, newX));
    }

    setSystems(sys => [...sys, {
      id: `sys${Date.now()}`,
      divisionId: div.id,
      x: newX,
      y: newY,
      name: sysForm.name,
      type: sysForm.type,
      stage: sysForm.stage as Stage,
      dataSource: sysForm.dataSource || undefined,
      authorizedPII: sysForm.authorizedPII.length > 0 ? sysForm.authorizedPII : undefined,
      piiTypes: sysForm.authorizedPII.length > 0 ? sysForm.authorizedPII : undefined,
      vulnScore: sysForm.vulnScore,
      hasStageDiscrepancy: false,
      linkedSupplierId: sysForm.linkedSupplierId,
    }]);
    setModal(null);
    setSysForm({ name:'', type:'crm', stage:'', dataSource:'', authorizedPII:[], vulnScore:75, linkedSupplierId:'' });
    toast.success(`System "${sysForm.name}" linked to ${linkedSup?.name ?? div.name}`);
  };

  /* ── Delete / Remove ────────────────────────────────── */
  const deleteDiv = (id: string) => {
    setDivisions(ds => ds.filter(d => d.id !== id));
    setSuppliers(ss => ss.filter(s => s.divisionId !== id));
    setSystems(sys => sys.filter(s => s.divisionId !== id));
    setModal(null); toast.success('Division deleted');
  };
  const removeSup = (id: string) => { setSuppliers(ss => ss.filter(s => s.id !== id)); setModal(null); toast.success('Supplier removed'); };

  const selSup    = modal?.type === 'supInfo' ? suppliers.find(s => s.id === modal.supplierId) ?? null : null;
  const selDiv    = modal?.type === 'divInfo' ? divisions.find(d => d.id === modal.divisionId) ?? null : null;
  const addSupDiv = modal?.type === 'addSup'  ? divisions.find(d => d.id === modal.divisionId) ?? null : null;
  const addSysDiv = modal?.type === 'addSys'  ? divisions.find(d => d.id === modal.divisionId) ?? null : null;
  const selSys    = modal?.type === 'sysInfo' ? systems.find(s => s.id === (modal as any).systemId) ?? null : null;

  /* ── Flow arrow color ───────────────────────────────── */
  const arrowColor = (flow?: PiiFlow) => flow === 'share' ? '#0EA5E9' : flow === 'ingest' ? '#10B981' : '#8B5CF6';

  /* ── Lifecycle column helpers ───────────────────────── */
  const getColumnBounds = (stage: Stage) => {
    const col = LIFECYCLE_COLUMNS[stage];
    return { minX: col.minFrac * CANVAS_W, maxX: col.maxFrac * CANVAS_W };
  };

  /* ─── Which nodes to render in each mode ────────────── */
  // In lifecycle mode: only render divisions that have a lifecycleStage, plus their children
  // In graph mode: render all
  // Graph-only nodes: divisions WITHOUT a lifecycleStage (pure graph data)
  const graphDivisions = divisions.filter(d => d.lifecycleStage === undefined);
  const graphSuppliers = suppliers.filter(s => graphDivisions.some(d => d.id === s.divisionId));
  const graphSystems   = systems.filter(s => graphDivisions.some(d => d.id === s.divisionId));

  const visibleDivisions = lifecycleView ? lifecycleDivisions : graphDivisions;
  const visibleSuppliers = lifecycleView
    ? suppliers.filter(s => lifecycleDivisions.some(d => d.id === s.divisionId))
    : graphSuppliers;
  const visibleSystems = lifecycleView
    ? systems.filter(s => lifecycleDivisions.some(d => d.id === s.divisionId))
    : graphSystems;

  /* ── Render ─────────────────────────────────────────── */
  return (
    <div style={{ margin: '-24px -32px', height: 'calc(100vh - 64px)', display: 'flex', flexDirection: 'column', overflow: 'hidden', fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>

      {/* ── Page Header ─────────────────────────────── */}
      <div style={{ backgroundColor: '#fff', borderBottom: '1px solid #E2E8F0', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Organization Data Flow</div>
          <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{lifecycleView ? 'Lifecycle view · Add divisions to columns · Click to interact' : 'Drag nodes · Scroll to zoom · Click to interact'}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Lifecycle / Graph toggle */}
          <button
            onClick={handleToggleLifecycle}
            style={{ height: 32, padding: '0 12px', border: `1px solid ${lifecycleView ? '#8B5CF6' : '#E2E8F0'}`, backgroundColor: lifecycleView ? '#F5F3FF' : '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: lifecycleView ? '#8B5CF6' : '#64748B', display: 'flex', alignItems: 'center', gap: 5, fontWeight: lifecycleView ? 600 : 400 }}
          >
            <Network size={13} />
            {lifecycleView ? 'Switch to Graph View' : 'Switch to Lifecycle View'}
          </button>
          <span style={{ width: 1, height: 20, backgroundColor: '#E2E8F0', display: 'inline-block' }} />
          {/* X-Ray toggle */}
          <button
            onClick={() => { setXrayMode(x => !x); if (xrayMode) setSelectedId(null); }}
            style={{ height: 32, padding: '0 12px', border: `1px solid ${xrayMode ? '#0EA5E9' : '#E2E8F0'}`, backgroundColor: xrayMode ? '#EFF6FF' : '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: xrayMode ? '#0EA5E9' : '#64748B', display: 'flex', alignItems: 'center', gap: 5, fontWeight: xrayMode ? 600 : 400 }}
          >
            {xrayMode ? <Eye size={13} /> : <EyeOff size={13} />}
            Data X-Ray {xrayMode ? 'ON' : 'OFF'}
          </button>
          <span style={{ width: 1, height: 20, backgroundColor: '#E2E8F0', display: 'inline-block', margin: '0 4px' }} />
          <span style={{ fontSize: 13, color: '#64748B' }}>Viewing:</span>
          <select
            defaultValue="current"
            onChange={e => { if (e.target.value !== 'current') { toast('Historical view coming soon'); setTimeout(() => (e.target.value = 'current'), 0); } }}
            style={{ border: '1px solid #E2E8F0', borderRadius: 8, padding: '5px 10px', fontSize: 13, color: '#334155', backgroundColor: '#fff', outline: 'none', cursor: 'pointer' }}
          >
            <option value="current">Current</option>
            <option value="3m">3 months ago</option>
            <option value="6m">6 months ago</option>
            <option value="1y">1 year ago</option>
          </select>
          <span style={{ width: 1, height: 20, backgroundColor: '#E2E8F0', display: 'inline-block', margin: '0 4px' }} />
          {[{ l: '+', fn: () => setZoom(z => Math.min(3, z * 1.15)) }, { l: '−', fn: () => setZoom(z => Math.max(0.25, z / 1.15)) }].map(b => (
            <button key={b.l} onClick={b.fn} style={{ width: 32, height: 32, border: '1px solid #E2E8F0', backgroundColor: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B', fontFamily: 'monospace' }}>{b.l}</button>
          ))}
          <button onClick={resetView} style={{ height: 32, padding: '0 12px', border: '1px solid #E2E8F0', backgroundColor: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 5 }}>
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────── */}
      <div
        ref={containerRef}
        style={{ flex: 1, position: 'relative', overflow: 'hidden', backgroundColor: '#F8FAFC', backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)', backgroundSize: '24px 24px', cursor: lifecycleView ? 'default' : drag?.type === 'canvas' ? 'grabbing' : 'grab' }}
        onMouseDown={e => { setModal(null); if (xrayMode) setSelectedId(null); if (!lifecycleView) startDrag('canvas', '', e, pan.x, pan.y); }}
      >

        {/* ── Lifecycle column UI (fixed, outside transform) ── */}
        {lifecycleView && (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', zIndex: 5, pointerEvents: 'none' }}>
            {STAGES.map((stage, i) => {
              const dotColors: Record<Stage, string> = { Acquisition:'#0EA5E9', Retention:'#10B981', Upgradation:'#F59E0B', Offboarding:'#64748B' };
              const dot = dotColors[stage];
              const colDivs = lifecycleDivisions.filter(d => d.lifecycleStage === stage);

              return (
                <div
                  key={stage}
                  style={{
                    flex: 1,
                    borderRight: i < 3 ? '1px solid rgba(229,231,235,0.7)' : 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                  }}
                >
                  {/* Column header — 48px tall */}
                  <div
                    style={{
                      height: 48,
                      minHeight: 48,
                      backgroundColor: '#F8FAFC',
                      borderBottom: '1px solid #E5E7EB',
                      padding: '0 16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flexShrink: 0,
                      pointerEvents: 'auto',
                      zIndex: 20,
                    }}
                  >
                    <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: dot, flexShrink: 0 }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', letterSpacing: '-0.01em', flex: 1 }}>
                      Customer {stage}
                    </span>
                    {colDivs.length > 0 && (
                      <span style={{ fontSize: 11, color: '#94A3B8', marginRight: 6 }}>
                        {colDivs.length} div{colDivs.length !== 1 ? 's' : ''}
                      </span>
                    )}
                    {/* Add Division button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Compute spawn position inside this column in canvas coords
                        const containerEl = containerRef.current;
                        const containerW = containerEl?.getBoundingClientRect().width ?? CANVAS_W;
                        const colFrac = LIFECYCLE_COLUMNS[stage];
                        const colCenterScreenX = colFrac.minFrac * containerW + (containerW * (colFrac.maxFrac - colFrac.minFrac)) / 2;
                        // Convert screen position to canvas coordinates
                        const canvasX = (colCenterScreenX - pan.x) / zoom;
                        const canvasY = (120 - pan.y) / zoom + (lifecycleDivisions.filter(d => d.lifecycleStage === stage).length * 180);
                        setModal({ type: 'addDiv', spawnX: canvasX, spawnY: Math.max(80, canvasY), lifecycleStage: stage });
                      }}
                      style={{
                        width: 26,
                        height: 26,
                        borderRadius: '50%',
                        backgroundColor: '#10B981',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff',
                        fontSize: 18,
                        lineHeight: '1',
                        boxShadow: '0 2px 8px rgba(16,185,129,0.35)',
                        flexShrink: 0,
                      }}
                      title={`Add Division to ${stage}`}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.12)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      +
                    </button>
                  </div>

                  {/* Column body — empty state */}
                  {colDivs.length === 0 && (
                    <div style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      opacity: 0.35,
                      pointerEvents: 'none',
                      gap: 8,
                    }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2px dashed #CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Briefcase size={16} color="#94A3B8" />
                      </div>
                      <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500 }}>No divisions yet</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* ── Transform wrapper ───────────────────── */}
        <div
          style={{
            position: 'absolute',
            transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})`,
            transformOrigin: '0 0',
            width: CANVAS_W,
            height: CANVAS_H,
          }}
          onMouseDown={e => { if (e.target === e.currentTarget && !lifecycleView) startDrag('canvas', '', e, pan.x, pan.y); }}
        >
          {/* SVG edges + arrows */}
          <svg style={{ position: 'absolute', inset: 0, width: CANVAS_W, height: CANVAS_H, pointerEvents: 'none', overflow: 'visible' }}>
            <defs>
              <marker id="arrow-share"  markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#0EA5E9" opacity="0.8"/></marker>
              <marker id="arrow-ingest" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#10B981" opacity="0.8"/></marker>
              <marker id="arrow-both"   markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8B5CF6" opacity="0.8"/></marker>
              <marker id="arrow-gray"   markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#CBD5E1" opacity="0.8"/></marker>
              <marker id="arrow-alert"  markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#EF4444" opacity="0.9"/></marker>
            </defs>

            {/* Org → Divisions (graph mode only) */}
            {!lifecycleView && graphDivisions.map(d => (
              <g key={`eg-${d.id}`} opacity={dimOpacity(d.id)}>
                <line x1={orgPos.x} y1={orgPos.y} x2={d.x} y2={d.y} stroke="#CBD5E1" strokeWidth={2} markerEnd="url(#arrow-gray)" />
                <rect x={(orgPos.x+d.x)/2-28} y={(orgPos.y+d.y)/2-8} width={56} height={16} rx={4} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
                <text x={(orgPos.x+d.x)/2} y={(orgPos.y+d.y)/2+4} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="inherit">HAS DIVISION</text>
              </g>
            ))}

            {/* Divisions → Suppliers */}
            {visibleSuppliers.map(s => {
              const d = visibleDivisions.find(x => x.id === s.divisionId);
              if (!d) return null;
              const clr   = arrowColor(s.piiFlow);
              const mId   = s.piiFlow === 'share' ? 'url(#arrow-share)' : s.piiFlow === 'ingest' ? 'url(#arrow-ingest)' : 'url(#arrow-both)';
              const label = s.piiTypes?.slice(0, 2).join(', ') ?? 'SUPPLIES TO';
              const mx    = (d.x + s.x) / 2, my = (d.y + s.y) / 2;
              return (
                <g key={`es-${s.id}`} opacity={dimOpacity(s.id)}>
                  <line x1={d.x} y1={d.y} x2={s.x} y2={s.y} stroke={clr} strokeWidth={1.5} opacity={0.55} markerEnd={mId} />
                  <rect x={mx - 30} y={my - 9} width={60} height={18} rx={5} fill="#fff" stroke={clr} strokeWidth={1} opacity={0.9} />
                  <text x={mx} y={my + 4} textAnchor="middle" fontSize={8} fill={clr} fontFamily="inherit" fontWeight="600">{label}</text>
                </g>
              );
            })}

            {/* Systems edges */}
            {visibleSystems.map(sys => {
              if (sys.linkedSupplierId) {
                const sup = visibleSuppliers.find(x => x.id === sys.linkedSupplierId);
                if (!sup) return null;
                const mx = (sup.x + sys.x) / 2, my = (sup.y + sys.y) / 2;
                const edgeColor = sys.hasStageDiscrepancy ? '#EF4444' : '#64748B';
                const edgeDash  = sys.hasStageDiscrepancy ? '4,3' : '5,3';
                return (
                  <g key={`esys-${sys.id}`} opacity={dimOpacity(sys.id)}>
                    {sys.hasStageDiscrepancy && (
                      <line x1={sup.x} y1={sup.y} x2={sys.x} y2={sys.y} stroke="#EF4444" strokeWidth={6} opacity={0.12} />
                    )}
                    <line x1={sup.x} y1={sup.y} x2={sys.x} y2={sys.y}
                      stroke={edgeColor} strokeWidth={1.5} strokeDasharray={edgeDash}
                      markerEnd={sys.hasStageDiscrepancy ? 'url(#arrow-alert)' : 'url(#arrow-gray)'}
                    />
                    <rect x={mx - 24} y={my - 9} width={48} height={18} rx={5} fill="#fff"
                      stroke={edgeColor} strokeWidth={1} opacity={0.95} />
                    <text x={mx} y={my + 4} textAnchor="middle" fontSize={9}
                      fill={edgeColor} fontFamily="inherit" fontWeight="600">
                      {sys.hasStageDiscrepancy ? 'GAP !' : 'USES SYS'}
                    </text>
                  </g>
                );
              }
              const d = visibleDivisions.find(x => x.id === sys.divisionId);
              if (!d) return null;
              return (
                <g key={`esys-${sys.id}`} opacity={dimOpacity(sys.id)}>
                  <line x1={d.x} y1={d.y} x2={sys.x} y2={sys.y} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arrow-gray)" />
                  <rect x={(d.x+sys.x)/2-22} y={(d.y+sys.y)/2-8} width={44} height={16} rx={4} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
                  <text x={(d.x+sys.x)/2} y={(d.y+sys.y)/2+4} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="inherit">INTERNAL</text>
                </g>
              );
            })}
          </svg>

          {/* ── Org Node (graph mode only) ──────────── */}
          {!lifecycleView && (
            <div
              style={{ position: 'absolute', left: orgPos.x - ORG_R, top: orgPos.y - ORG_R, width: ORG_R*2, height: ORG_R*2, zIndex: 10 }}
              onMouseEnter={() => setHoveredId('org')}
              onMouseLeave={() => setHoveredId(null)}
              onMouseDown={e => startDrag('org', 'org', e, orgPos.x, orgPos.y)}
            >
              <div style={{ width: ORG_R*2, height: ORG_R*2, borderRadius: '50%', backgroundColor: '#0EA5E9', border: '3px solid #0284C7', boxShadow: '0 4px 20px rgba(14,165,233,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: hoveredId === 'org' ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.15s ease', cursor: 'move' }}>
                <Building2 size={26} color="#fff" strokeWidth={1.8} />
              </div>
              <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', marginTop: 7, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A' }}>ABC Insurance Co.</div>
                <div style={{ fontSize: 10, color: '#94A3B8' }}>Organization</div>
              </div>
              {hoveredId === 'org' && (
                <div title="Add Division" onClick={e => { e.stopPropagation(); setModal({ type: 'addDiv' }); }} style={{ position: 'absolute', top: -12, right: -12, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.45)', zIndex: 20, color: '#fff', fontSize: 17, lineHeight: '1' }}>+</div>
              )}
            </div>
          )}

          {/* ── Division Nodes ─────────────────────── */}
          {visibleDivisions.map(div => {
            const supCount = suppliers.filter(s => s.divisionId === div.id).length;
            const sysCount = systems.filter(s => s.divisionId === div.id).length;
            const isHov = hoveredId === div.id;
            return (
              <div
                key={div.id}
                style={{ position: 'absolute', left: div.x - DIV_R, top: div.y - DIV_R, width: DIV_R*2, height: DIV_R*2, zIndex: 10, opacity: dimOpacity(div.id), transition: 'opacity 0.25s' }}
                onMouseEnter={() => setHoveredId(div.id)}
                onMouseLeave={() => setHoveredId(null)}
                onMouseDown={e => startDrag('div', div.id, e, div.x, div.y)}
                onClick={e => handleNodeClick(e, div.id, () => setModal({ type: 'divInfo', divisionId: div.id }))}
              >
                <div style={{ width: DIV_R*2, height: DIV_R*2, borderRadius: '50%', backgroundColor: '#8B5CF6', border: '2px solid #7C3AED', boxShadow: '0 4px 14px rgba(139,92,246,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', transform: isHov ? 'scale(1.08)' : 'scale(1)', transition: 'transform 0.15s ease', cursor: 'pointer' }}>
                  <Briefcase size={20} color="#fff" strokeWidth={1.8} />
                </div>
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', marginTop: 7, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: '#0F172A' }}>{div.name}</div>
                  <div style={{ fontSize: 10, color: '#94A3B8' }}>Div · {supCount} sup{sysCount > 0 ? ` · ${sysCount} sys` : ''}</div>
                </div>
                {isHov && (
                  <div title="Add Asset" onClick={e => { e.stopPropagation(); setModal({ type: 'chooseAsset', divisionId: div.id }); }} style={{ position: 'absolute', top: -12, right: -12, width: 22, height: 22, borderRadius: '50%', backgroundColor: '#10B981', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 8px rgba(16,185,129,0.45)', zIndex: 20, color: '#fff', fontSize: 17, lineHeight: '1' }}>+</div>
                )}
              </div>
            );
          })}

          {/* ── Supplier Nodes ─────────────────────── */}
          {visibleSuppliers.map(sup => {
            const outerR = supOuterR(sup.piiVolume);
            const size   = outerR * 2 + piiStrokeW(sup.piiVolume) + 4;
            const [stageBg, stageClr] = STAGE_CLR[sup.stage];
            const label = sup.name.length > 14 ? sup.name.slice(0, 13) + '…' : sup.name;
            return (
              <div
                key={sup.id}
                style={{ position: 'absolute', left: sup.x - size/2, top: sup.y - size/2, width: size, height: size, zIndex: 10, cursor: 'pointer', opacity: dimOpacity(sup.id), transition: 'opacity 0.25s' }}
                onMouseEnter={() => setHoveredId(sup.id)}
                onMouseLeave={() => setHoveredId(null)}
                onMouseDown={e => startDrag('sup', sup.id, e, sup.x, sup.y)}
                onClick={e => handleNodeClick(e, sup.id, () => setModal(xrayMode ? { type: 'xrayInfo', supplierId: sup.id } : { type: 'supInfo', supplierId: sup.id }))}
              >
                <div style={{ transform: hoveredId === sup.id ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.15s ease' }}>
                  <SupCircle riskScore={sup.riskScore} piiVolume={sup.piiVolume} size={size} />
                </div>
                {sup.hasTruthGap && (
                  <div style={{ position: 'absolute', top: -6, right: -6, zIndex: 20 }}>
                    <div style={{ position: 'relative', display: 'inline-flex' }}>
                      <div style={{ position: 'absolute', inset: -2, borderRadius: '50%', backgroundColor: '#EF4444', opacity: 0.25, animation: 'ping 1.2s ease infinite' }} />
                      <AlertTriangle size={14} color="#EF4444" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', marginTop: 4, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: '#0F172A', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</div>
                  <span style={{ fontSize: 9, fontWeight: 600, color: stageClr, backgroundColor: stageBg, padding: '1px 5px', borderRadius: 3, display: 'inline-block', marginTop: 2 }}>{sup.stage}</span>
                  <div style={{ display: 'flex', gap: 3, marginTop: 4, justifyContent: 'center', flexWrap: 'nowrap' }}>
                    {sup.piiFlow && (() => {
                      const piiMeta = { share: ['→', '#0EA5E9', '#EFF6FF'], ingest: ['←', '#10B981', '#ECFDF5'], both: ['⇄', '#8B5CF6', '#F5F3FF'] }[sup.piiFlow];
                      return <span style={{ fontSize: 8, fontWeight: 700, color: piiMeta[1], backgroundColor: piiMeta[2], padding: '1px 5px', borderRadius: 3 }}>{piiMeta[0]}</span>;
                    })()}
                    {sup.contractEnd && <span style={{ fontSize: 8, color: '#64748B', backgroundColor: '#F1F5F9', padding: '1px 5px', borderRadius: 3 }}>📅 {sup.contractEnd.slice(0,7)}</span>}
                    {sup.frequency && <span style={{ fontSize: 8, color: '#8B5CF6', backgroundColor: '#F5F3FF', padding: '1px 5px', borderRadius: 3 }}>{sup.frequency}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* ── System Nodes ─────────────────────────── */}
          {visibleSystems.map(sys => {
            const isHov = hoveredId === sys.id;
            const SysIcon = sys.type === 'crm' ? Smartphone : Database;
            const [stageBg, stageClr] = sys.stage ? STAGE_CLR[sys.stage] : ['#F1F5F9', '#64748B'];
            return (
              <div
                key={sys.id}
                style={{ position: 'absolute', left: sys.x - 34, top: sys.y - 22, width: 68, height: 44, zIndex: 10, cursor: 'pointer', opacity: dimOpacity(sys.id), transition: 'opacity 0.25s' }}
                onMouseEnter={() => setHoveredId(sys.id)}
                onMouseLeave={() => setHoveredId(null)}
                onMouseDown={e => startDrag('sys', sys.id, e, sys.x, sys.y)}
                onClick={e => handleNodeClick(e, sys.id, () => setModal({ type: 'sysInfo', systemId: sys.id } as any))}
              >
                <div style={{
                  width: 68, height: 44, borderRadius: 10,
                  backgroundColor: sys.hasStageDiscrepancy ? '#7F1D1D' : '#64748B',
                  border: `2px solid ${sys.hasStageDiscrepancy ? '#EF4444' : isHov ? '#94A3B8' : '#475569'}`,
                  boxShadow: sys.hasStageDiscrepancy
                    ? '0 2px 14px rgba(239,68,68,0.4)'
                    : '0 2px 10px rgba(100,116,139,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transform: isHov ? 'scale(1.06)' : 'scale(1)', transition: 'all 0.15s ease',
                }}>
                  <SysIcon size={18} color={sys.hasStageDiscrepancy ? '#FCA5A5' : '#fff'} strokeWidth={1.7} />
                </div>
                {sys.hasStageDiscrepancy && (
                  <div
                    style={{ position: 'absolute', top: -8, right: -8, zIndex: 30 }}
                    onClick={e => { e.stopPropagation(); setModal({ type: 'sysReasoning', systemId: sys.id } as any); }}
                  >
                    <div style={{ position: 'relative', display: 'inline-flex', cursor: 'pointer' }}>
                      <div style={{ position: 'absolute', inset: -3, borderRadius: '50%', backgroundColor: '#EF4444', opacity: 0.25, animation: 'ping 1.2s ease infinite' }} />
                      <AlertTriangle size={16} color="#EF4444" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                <div style={{ position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)', textAlign: 'center', marginTop: 4, pointerEvents: 'none', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: sys.hasStageDiscrepancy ? '#DC2626' : '#0F172A', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis' }}>{sys.name}</div>
                  {sys.stage && (
                    <span style={{ fontSize: 9, fontWeight: 600, color: stageClr, backgroundColor: stageBg, padding: '1px 5px', borderRadius: 3, display: 'inline-block', marginTop: 2 }}>{sys.stage}</span>
                  )}
                </div>
              </div>
            );
          })}

          {/* Empty state — graph mode only */}
          {divisions.length === 0 && !lifecycleView && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center', pointerEvents: 'none' }}>
              <Network size={48} color="#CBD5E1" style={{ display: 'block', margin: '0 auto 12px' }} />
              <div style={{ fontSize: 16, fontWeight: 600, color: '#64748B', marginBottom: 6 }}>Start building your graph</div>
              <div style={{ fontSize: 13, color: '#94A3B8', maxWidth: 300, lineHeight: 1.5 }}>Click + on the organization node to add your first division</div>
            </div>
          )}
        </div>

        {/* ── Legend toggle button ─────────────────── */}
        <div style={{ position: 'absolute', bottom: 24, left: 24, zIndex: 101 }}>
          <button
            onClick={() => setShowLegend(v => !v)}
            style={{
              height: 32,
              padding: '0 14px',
              border: '1px solid #E2E8F0',
              backgroundColor: showLegend ? '#F5F3FF' : '#fff',
              borderRadius: 8,
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: showLegend ? '#8B5CF6' : '#64748B',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
            }}
          >
            <Eye size={13} />
            {showLegend ? 'Hide Legend' : 'Show Legend'}
          </button>
        </div>

        {/* ── Legend panel ────────────────────────── */}
        {showLegend && (
          <div style={{ position: 'absolute', bottom: 64, left: 24, backgroundColor: 'rgba(255,255,255,0.95)', border: '1px solid #E2E8F0', borderRadius: 12, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', width: 200, zIndex: 100, pointerEvents: 'none' }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>Legend</div>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>Node Types</div>
            {[['#0EA5E9', 'Organization', 12], ['#8B5CF6', 'Division', 10]].map(([c, l, sz]) => (
              <div key={l as string} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: sz as number, height: sz as number, borderRadius: '50%', backgroundColor: c as string, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#64748B' }}>{l as string}</span>
              </div>
            ))}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <svg width={14} height={14}><circle cx={7} cy={7} r={4} fill="#94A3B8" stroke="#fff" strokeWidth={1.5} /><circle cx={7} cy={7} r={6.5} fill="none" stroke="#EF4444" strokeWidth={2.5} opacity={0.35} /></svg>
              <span style={{ fontSize: 11, color: '#64748B' }}>Supplier</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 12 }}>
              <div style={{ width: 16, height: 10, borderRadius: 3, backgroundColor: '#64748B', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>Internal System</span>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6 }}>PII Flow Direction</div>
            {[['#0EA5E9','Share (Org → Sup)'],['#10B981','Ingest (Sup → Org)'],['#8B5CF6','Bidirectional']].map(([c,l]) => (
              <div key={l} style={{ display:'flex', alignItems:'center', gap:7, marginBottom:4 }}>
                <div style={{ width:14, height:2, backgroundColor:c, flexShrink:0 }} />
                <span style={{ fontSize:11, color:'#64748B' }}>{l}</span>
              </div>
            ))}

            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 6, marginTop: 10 }}>Supplier Score</div>
            {[['#10B981', 'Score ≥ 50 (Low)'], ['#EF4444', 'Score < 50 (Critical)'], ['#94A3B8', 'Not Assessed']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
                <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} />
                <span style={{ fontSize: 11, color: '#64748B' }}>{l}</span>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 8 }}>
              <AlertTriangle size={11} color="#EF4444" />
              <span style={{ fontSize: 11, color: '#64748B' }}>Truth Gap (PII mismatch)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 4 }}>
              <div style={{ width: 16, height: 10, borderRadius: 3, backgroundColor: '#7F1D1D', border: '1px solid #EF4444', flexShrink: 0 }} />
              <span style={{ fontSize: 11, color: '#64748B' }}>Stage Discrepancy (System)</span>
            </div>

            <div style={{ fontSize: 11, fontWeight: 600, color: '#475569', marginBottom: 5, marginTop: 10 }}>System Edges</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 4 }}>
              <svg width={20} height={8}><line x1={0} y1={4} x2={16} y2={4} stroke="#64748B" strokeWidth={1.5} strokeDasharray="4,2" /><polygon points="14,1 20,4 14,7" fill="#CBD5E1" /></svg>
              <span style={{ fontSize: 11, color: '#64748B' }}>Supplier → System</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <svg width={20} height={8}><line x1={0} y1={4} x2={16} y2={4} stroke="#EF4444" strokeWidth={1.5} strokeDasharray="3,2" /><polygon points="14,1 20,4 14,7" fill="#EF4444" /></svg>
              <span style={{ fontSize: 11, color: '#64748B' }}>Stage Gap edge (alert)</span>
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ── Modals ──────────────────────────────────── */}
      {/* ═══════════════════════════════════════════════ */}

      {modal !== null && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setModal(null)}>
          <div style={{ position: 'absolute', inset: 0, backgroundColor: modal.type === 'xrayInfo' ? 'rgba(0,0,0,0.45)' : 'rgba(0,0,0,0.2)', backdropFilter: modal.type === 'xrayInfo' ? 'blur(2px)' : 'none', transition: 'background-color 0.2s' }} />

          {/* ── CHOOSE ASSET TYPE ─────────────────── */}
          {modal.type === 'chooseAsset' && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 380, backgroundColor: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
              <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 6 }}>Add to Division</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 24 }}>What would you like to add?</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <button
                  onClick={() => setModal({ type: 'addSup', divisionId: modal.divisionId })}
                  style={{ padding: '20px 16px', borderRadius: 12, border: '1px solid #E2E8F0', backgroundColor: '#F5F3FF', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Briefcase size={18} color="#fff" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Add Supplier</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>External vendor</div>
                </button>
                <button
                  onClick={() => setModal({ type: 'addSys', divisionId: modal.divisionId })}
                  style={{ padding: '20px 16px', borderRadius: 12, border: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', cursor: 'pointer', textAlign: 'center', transition: 'all 0.15s' }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: '#64748B', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                    <Database size={18} color="#fff" />
                  </div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Add System</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 3 }}>Internal CRM/App</div>
                </button>
              </div>
            </div>
          )}

          {/* ── ADD DIVISION ──────────────────────── */}
          {modal.type === 'addDiv' && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 340, backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
              <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Add Division</div>
              <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 4 }}>Add a department or business unit</div>
              {modal.lifecycleStage && (
                <div style={{ marginBottom: 16 }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 600,
                    padding: '3px 10px',
                    borderRadius: 6,
                    color: STAGE_CLR[modal.lifecycleStage][1],
                    backgroundColor: STAGE_CLR[modal.lifecycleStage][0],
                    border: `1px solid ${STAGE_CLR[modal.lifecycleStage][1]}33`,
                  }}>
                    Customer {modal.lifecycleStage}
                  </span>
                </div>
              )}
              <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>Division Name *</label>
              <input autoFocus value={divName} onChange={e => setDivName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addDivision(); if (e.key === 'Escape') setModal(null); }} placeholder="e.g., Technical Dept" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', color: '#334155' }} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 20 }}>
                <button onClick={() => { setModal(null); setDivName(''); }} style={{ padding: '9px 16px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                <button onClick={addDivision} disabled={!divName.trim()} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, backgroundColor: divName.trim() ? '#0EA5E9' : '#CBD5E1', color: '#fff', cursor: divName.trim() ? 'pointer' : 'not-allowed' }}>Add Division</button>
              </div>
            </div>
          )}

          {/* ── ADD SUPPLIER ──────────────────────── */}
          {modal.type === 'addSup' && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 480, maxHeight: '85vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
              <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Add Supplier</div>
              {addSupDiv && <div style={{ marginBottom: 12 }}><span style={{ backgroundColor: '#EEF2FF', color: '#8B5CF6', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>{addSupDiv.name}</span></div>}

              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Supplier Stage *</label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  {STAGES.map(s => {
                    const sel = supForm.stage === s; const [bg, clr] = STAGE_CLR[s];
                    return (
                      <button key={s} onClick={() => setSupForm(p => ({ ...p, stage: p.stage === s ? '' : s }))} style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: sel ? 700 : 500, cursor: 'pointer', backgroundColor: sel ? bg : '#F8FAFC', color: sel ? clr : '#64748B', border: `${sel ? 2 : 1}px solid ${sel ? clr : '#E2E8F0'}`, transition: 'all 0.15s', textAlign: 'center' }}>
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: '#8B5CF6' }} />
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Lifecycle Mapping</label>
                  <span style={{ fontSize: 10, color: '#94A3B8', marginLeft: 4 }}>Supplier appears in each selected lifecycle</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                  {STAGES.map(s => {
                    const checked = supForm.lifecycles.includes(s);
                    const [bg, clr] = STAGE_CLR[s];
                    const dotColors: Record<Stage, string> = { Acquisition:'#0EA5E9', Retention:'#10B981', Upgradation:'#F59E0B', Offboarding:'#64748B' };
                    return (
                      <label key={s} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', borderRadius:8, border:`1px solid ${checked ? clr : '#E2E8F0'}`, backgroundColor: checked ? bg : '#fff', cursor:'pointer', transition:'all 0.15s' }}>
                        <div style={{ width:16, height:16, borderRadius:4, border:`2px solid ${checked ? clr : '#CBD5E1'}`, backgroundColor: checked ? clr : '#fff', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}
                          onClick={() => setSupForm(p => { const lcs = p.lifecycles.includes(s) ? p.lifecycles.filter(l=>l!==s) : [...p.lifecycles, s]; return { ...p, lifecycles: lcs }; })}
                        >
                          {checked && <CheckCircle2 size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <div style={{ display:'flex', alignItems:'center', gap:5 }}>
                          <div style={{ width:7, height:7, borderRadius:'50%', backgroundColor:dotColors[s] }} />
                          <span style={{ fontSize:12, fontWeight: checked ? 600 : 400, color: checked ? clr : '#64748B' }}>Customer {s}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              {[{ label: 'Supplier Name *', key: 'name', ph: 'e.g., XYZ Corporation' }, { label: 'Email *', key: 'email', ph: 'contact@company.com' }, { label: 'Contact Person', key: 'contact', ph: 'Full name' }, { label: 'Phone', key: 'phone', ph: '+91 98765 43210' }, { label: 'Website', key: 'website', ph: 'https://example.com' }].map(f => (
                <div key={f.key} style={{ marginBottom: 12 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>{f.label}</label>
                  <input value={(supForm as any)[f.key]} onChange={e => setSupForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder={f.ph} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: '#334155' }} />
                </div>
              ))}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
                {['gst', 'pan'].map(k => (
                  <div key={k}>
                    <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 4 }}>{k.toUpperCase()} Number</label>
                    <input value={(supForm as any)[k]} onChange={e => setSupForm(p => ({ ...p, [k]: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: '#334155' }} />
                  </div>
                ))}
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: '#0EA5E9' }} />
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Contract Period</label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>Contract Start Date</label>
                    <input type="date" value={supForm.contractStart} onChange={e => setSupForm(p => ({ ...p, contractStart: e.target.value }))} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: supForm.contractStart ? '#334155' : '#94A3B8', backgroundColor: '#fff', cursor: 'pointer' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }}>Contract End Date</label>
                    <input type="date" value={supForm.contractEnd} onChange={e => setSupForm(p => ({ ...p, contractEnd: e.target.value }))} min={supForm.contractStart || undefined} style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', color: supForm.contractEnd ? '#334155' : '#94A3B8', backgroundColor: '#fff', cursor: 'pointer' }} />
                  </div>
                </div>
              </div>

              <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
                  <div style={{ width: 3, height: 13, borderRadius: 2, backgroundColor: '#8B5CF6' }} />
                  <label style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Stakeholder Matrix</label>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Internal</div>
                    {[{ key:'businessOwner', label:'Business Owner' },{ key:'financeContact', label:'Finance Contact' },{ key:'projectManager', label:'Project Manager' },{ key:'escalationContact', label:'Escalation Contact' }].map(f => (
                      <div key={f.key} style={{ marginBottom: 8 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 3 }}>{f.label}</label>
                        <input value={(supForm as any)[f.key]} onChange={e => setSupForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder="email@abc.co" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', color: '#334155', backgroundColor: '#EFF6FF' }} />
                      </div>
                    ))}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#8B5CF6', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Supplier</div>
                    {[{ key:'accountManager', label:'Account Manager' },{ key:'supplierFinance', label:'Supplier Finance' },{ key:'supplierEscalation', label:'Supplier Escalation' }].map(f => (
                      <div key={f.key} style={{ marginBottom: 8 }}>
                        <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#64748B', marginBottom: 3 }}>{f.label}</label>
                        <input value={(supForm as any)[f.key]} onChange={e => setSupForm(p => ({ ...p, [f.key]: e.target.value }))} placeholder="email@supplier.com" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 7, padding: '7px 10px', fontSize: 12, outline: 'none', color: '#334155', backgroundColor: '#F5F3FF' }} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 14px', marginBottom: 4 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 6 }}>
                  <AlertTriangle size={15} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#92400E', marginBottom: 2 }}>PII Configuration — Locked</div>
                    <div style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>Data sharing configuration is disabled until the initial risk assessment and AI scan are complete.</div>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button onClick={() => setModal(null)} style={{ padding: '9px 16px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                <button onClick={addSupplier} disabled={!supForm.name || !supForm.email || !supForm.stage} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, backgroundColor: supForm.name && supForm.email && supForm.stage ? '#0EA5E9' : '#CBD5E1', color: '#fff', cursor: supForm.name && supForm.email && supForm.stage ? 'pointer' : 'not-allowed' }}>Add Supplier →</button>
              </div>
            </div>
          )}

          {/* ── ADD SYSTEM ────────────────────────── */}
          {modal.type === 'addSys' && (() => {
            const PII_OPTIONS = ['Name', 'Email', 'Phone', 'Aadhar', 'PAN', 'Balance'];
            const divSuppliers = addSysDiv ? suppliers.filter(s => s.divisionId === addSysDiv.id) : [];
            const canSubmit = !!(sysForm.name && sysForm.stage && sysForm.linkedSupplierId);
            const togglePii = (p: string) => setSysForm(prev => ({
              ...prev,
              authorizedPII: prev.authorizedPII.includes(p) ? prev.authorizedPII.filter(x => x !== p) : [...prev.authorizedPII, p],
            }));
            return (
              <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 460, maxHeight: '88vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
                <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>Register Internal System</div>
                <div style={{ fontSize: 13, color: '#94A3B8', marginBottom: 16 }}>Define lifecycle mapping, data access scope, and security baseline</div>
                {addSysDiv && <div style={{ marginBottom: 16 }}><span style={{ backgroundColor: '#F1F5F9', color: '#64748B', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>{addSysDiv.name}</span></div>}

                <div style={{ marginBottom: 14 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>System Name *</label>
                  <input autoFocus value={sysForm.name} onChange={e => setSysForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Salesforce CRM" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 13, outline: 'none', color: '#334155' }} />
                </div>

                <div style={{ marginBottom: 20 }}>
                  <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 8 }}>System Type</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {([['crm','CRM/App'],['infra','Infrastructure'],['db','Database']] as [SystemNode['type'],string][]).map(([t, l]) => (
                      <button key={t} onClick={() => setSysForm(p => ({ ...p, type: t }))} style={{ padding: '7px 14px', borderRadius: 8, fontSize: 12, cursor: 'pointer', backgroundColor: sysForm.type === t ? '#F1F5F9' : '#fff', color: sysForm.type === t ? '#334155' : '#94A3B8', border: `1px solid ${sysForm.type === t ? '#94A3B8' : '#E2E8F0'}`, fontWeight: sysForm.type === t ? 600 : 400 }}>{l}</button>
                    ))}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#8B5CF6' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Relational Link *</div>
                    <span style={{ marginLeft: 'auto', fontSize: 11, fontWeight: 600, color: '#8B5CF6', backgroundColor: '#F5F3FF', padding: '1px 8px', borderRadius: 10 }}>Supplier → System</span>
                  </div>
                  {divSuppliers.length === 0 ? (
                    <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 8, padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <AlertTriangle size={14} color="#F59E0B" style={{ flexShrink: 0, marginTop: 1 }} />
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#92400E' }}>No suppliers in this division</div>
                        <div style={{ fontSize: 11, color: '#92400E', marginTop: 2 }}>Add at least one supplier to this division before registering a linked system.</div>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {divSuppliers.map(sup => {
                        const sel = sysForm.linkedSupplierId === sup.id;
                        const [stageBg, stageClr] = STAGE_CLR[sup.stage];
                        return (
                          <button key={sup.id} onClick={() => setSysForm(p => ({ ...p, linkedSupplierId: p.linkedSupplierId === sup.id ? '' : sup.id }))}
                            style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, cursor: 'pointer', textAlign: 'left', backgroundColor: sel ? '#F5F3FF' : '#F8FAFC', border: `${sel ? 2 : 1}px solid ${sel ? '#8B5CF6' : '#E2E8F0'}`, transition: 'all 0.13s' }}>
                            <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: sel ? '#8B5CF6' : '#CBD5E1', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Briefcase size={13} color="#fff" />
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: sel ? 700 : 500, color: sel ? '#6D28D9' : '#334155', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sup.name}</div>
                              <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
                                <span style={{ fontSize: 10, fontWeight: 600, color: stageClr, backgroundColor: stageBg, padding: '1px 6px', borderRadius: 8 }}>{sup.stage}</span>
                              </div>
                            </div>
                            {sel && <div style={{ width: 16, height: 16, borderRadius: '50%', backgroundColor: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}><CheckCircle2 size={11} color="#fff" /></div>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#0EA5E9' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Lifecycle Stage *</div>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 8 }}>
                    {STAGES.map(s => {
                      const sel = sysForm.stage === s;
                      const [bg, clr] = STAGE_CLR[s];
                      return (
                        <button key={s} onClick={() => setSysForm(p => ({ ...p, stage: p.stage === s ? '' : s }))}
                          style={{ padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: sel ? 700 : 500, cursor: 'pointer', backgroundColor: sel ? bg : '#F8FAFC', color: sel ? clr : '#64748B', border: `${sel ? 2 : 1}px solid ${sel ? clr : '#E2E8F0'}`, transition: 'all 0.15s', textAlign: 'center' }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#8B5CF6' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Data Source</div>
                  </div>
                  <input value={sysForm.dataSource} onChange={e => setSysForm(p => ({ ...p, dataSource: e.target.value }))} placeholder="e.g., AWS S3 Bucket (us-east-1/crm-prod)" style={{ width: '100%', boxSizing: 'border-box', border: '1px solid #E2E8F0', borderRadius: 8, padding: '10px 12px', fontSize: 12, outline: 'none', color: '#334155', fontFamily: 'monospace', backgroundColor: '#F8FAFC' }} />
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#10B981' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Authorized PII</div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {PII_OPTIONS.map(p => {
                      const sel = sysForm.authorizedPII.includes(p);
                      return (
                        <button key={p} onClick={() => togglePii(p)} style={{ padding: '6px 13px', borderRadius: 20, fontSize: 12, fontWeight: sel ? 700 : 500, cursor: 'pointer', backgroundColor: sel ? '#ECFDF5' : '#F8FAFC', color: sel ? '#10B981' : '#64748B', border: `${sel ? 2 : 1}px solid ${sel ? '#10B981' : '#E2E8F0'}`, transition: 'all 0.12s', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          {sel && <CheckCircle2 size={11} color="#10B981" />}
                          {p}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 18, marginBottom: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                    <div style={{ width: 3, height: 14, borderRadius: 2, backgroundColor: '#F59E0B' }} />
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>Target Vulnerability Score</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    {(() => {
                      const v = sysForm.vulnScore;
                      const r = 24, circ = 2 * Math.PI * r;
                      const dash = circ * (1 - v / 100);
                      const col = v >= 75 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444';
                      return (
                        <svg width={64} height={64} style={{ flexShrink: 0 }}>
                          <circle cx={32} cy={32} r={r} fill="none" stroke="#F1F5F9" strokeWidth={7} />
                          <circle cx={32} cy={32} r={r} fill="none" stroke={col} strokeWidth={7} strokeDasharray={`${circ}`} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 32 32)" />
                          <text x={32} y={36} textAnchor="middle" fontSize={12} fontWeight={800} fill={col}>{v}</text>
                        </svg>
                      );
                    })()}
                    <input type="range" min={0} max={100} step={1} value={sysForm.vulnScore} onChange={e => setSysForm(p => ({ ...p, vulnScore: Number(e.target.value) }))} style={{ flex: 1, accentColor: sysForm.vulnScore >= 75 ? '#10B981' : sysForm.vulnScore >= 50 ? '#F59E0B' : '#EF4444', cursor: 'pointer' }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button onClick={() => { setModal(null); setSysForm({ name:'', type:'crm', stage:'', dataSource:'', authorizedPII:[], vulnScore:75, linkedSupplierId:'' }); }} style={{ padding: '9px 16px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff', color: '#64748B', cursor: 'pointer' }}>Cancel</button>
                  <button onClick={addSystem} disabled={!canSubmit} style={{ padding: '9px 18px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, backgroundColor: canSubmit ? '#64748B' : '#CBD5E1', color: '#fff', cursor: canSubmit ? 'pointer' : 'not-allowed' }}>Register System →</button>
                </div>
              </div>
            );
          })()}

          {/* ── X-RAY DETAIL MODAL ────────────────── */}
          {modal.type === 'xrayInfo' && (() => {
            const xSup = suppliers.find(s => s.id === (modal as any).supplierId);
            if (!xSup) return null;
            const shadowPII = (xSup.detectedPII ?? []).filter(p => !(xSup.declaredPII ?? []).includes(p));
            const orgToSup  = xSup.piiFlow === 'share' || xSup.piiFlow === 'both' ? xSup.declaredPII ?? [] : [];
            const supToOrg  = xSup.piiFlow === 'ingest' || xSup.piiFlow === 'both' ? xSup.detectedPII ?? [] : [];
            const tm = xSup.hasTruthGap ? Math.round(((xSup.declaredPII?.length ?? 0) / Math.max(1, (xSup.detectedPII?.length ?? 0))) * 100) : 100;
            const r = 44, circ = 2 * Math.PI * r, dash = circ * (1 - tm / 100);
            const tmColor = tm === 100 ? '#10B981' : tm >= 60 ? '#F59E0B' : '#EF4444';
            const linkedSystems = systems.filter(s => s.linkedSupplierId === xSup.id);
            return (
              <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 560, maxHeight: '88vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 32px 80px rgba(0,0,0,0.28)', animation: 'scaleIn 0.18s ease' }}>
                <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 18, right: 18, width: 32, height: 32, backgroundColor: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={16} /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Eye size={18} color="#0EA5E9" />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Data X-Ray — {xSup.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 1 }}>AI-generated analysis of supplier data flows</div>
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '14px 0', paddingBottom: 14, borderBottom: '1px solid #F1F5F9' }}>
                  {(() => { const [bg,c] = STAGE_CLR[xSup.stage]; return <span style={{ fontSize: 11, fontWeight: 600, color: c, backgroundColor: bg, padding: '3px 10px', borderRadius: 20 }}>{xSup.stage}</span>; })()}
                  {xSup.frequency && <span style={{ fontSize: 11, color: '#8B5CF6', backgroundColor: '#F5F3FF', padding: '3px 10px', borderRadius: 20 }}>{xSup.frequency}</span>}
                  {xSup.contractEnd && <span style={{ fontSize: 11, color: '#64748B', backgroundColor: '#F1F5F9', padding: '3px 10px', borderRadius: 20 }}>Contract ends {xSup.contractEnd}</span>}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 20, marginBottom: 20, alignItems: 'center', backgroundColor: '#F8FAFC', borderRadius: 12, padding: '16px 20px' }}>
                  <div style={{ textAlign: 'center' }}>
                    <svg width={108} height={108}>
                      <circle cx={54} cy={54} r={r} fill="none" stroke="#E2E8F0" strokeWidth={10} />
                      <circle cx={54} cy={54} r={r} fill="none" stroke={tmColor} strokeWidth={10} strokeDasharray={`${circ}`} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 54 54)" />
                      <text x={54} y={58} textAnchor="middle" fontSize={20} fontWeight={800} fill={tmColor}>{tm}%</text>
                    </svg>
                    <div style={{ fontSize: 10, color: '#64748B', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', marginTop: 4 }}>Truth Match</div>
                  </div>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: tm === 100 ? '#059669' : '#DC2626', marginBottom: 6 }}>
                      {tm === 100 ? 'All declared PII verified' : 'Undeclared PII detected'}
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B', lineHeight: 1.65, marginBottom: 10 }}>
                      {xSup.hasTruthGap ? `Supplier declared ${xSup.declaredPII?.length ?? 0} PII fields, but AI detected ${xSup.detectedPII?.length ?? 0}.` : 'All PII detected matches the supplier\'s self-declared assessment.'}
                    </div>
                    {xSup.internalSPOC && <div style={{ fontSize: 12, color: '#64748B' }}>Internal SPOC: <span style={{ color: '#0EA5E9', fontWeight: 600 }}>{xSup.internalSPOC}</span></div>}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
                  {orgToSup.length > 0 && (
                    <div style={{ backgroundColor: '#EFF6FF', border: '1px solid #BAE6FD', borderRadius: 10, padding: '12px 16px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#0EA5E9', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Outgoing — Org → Supplier (Declared)</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{orgToSup.map(p => <span key={p} style={{ fontSize: 12, backgroundColor: '#fff', color: '#0EA5E9', border: '1px solid #BAE6FD', padding: '3px 11px', borderRadius: 20, fontWeight: 500 }}>{p}</span>)}</div>
                    </div>
                  )}
                  {supToOrg.length > 0 && (
                    <div style={{ backgroundColor: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: 10, padding: '12px 16px' }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: '#10B981', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>Incoming — Supplier → Org (Detected)</div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{supToOrg.filter(p => !shadowPII.includes(p)).map(p => <span key={p} style={{ fontSize: 12, backgroundColor: '#fff', color: '#10B981', border: '1px solid #A7F3D0', padding: '3px 11px', borderRadius: 20, fontWeight: 500 }}>{p}</span>)}</div>
                    </div>
                  )}
                  {shadowPII.length > 0 && (
                    <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 8 }}>
                        <AlertTriangle size={14} color="#EF4444" />
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Shadow PII — Detected but NOT Declared</div>
                      </div>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>{shadowPII.map(p => <span key={p} style={{ fontSize: 12, backgroundColor: '#fff', color: '#EF4444', border: '2px solid #FECACA', padding: '3px 11px', borderRadius: 20, fontWeight: 700 }}>{p}</span>)}</div>
                    </div>
                  )}
                </div>
                {linkedSystems.length > 0 && (
                  <div style={{ borderTop: '1px solid #F1F5F9', paddingTop: 16, marginBottom: 20 }}>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#0F172A', marginBottom: 10 }}>Linked Systems</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {linkedSystems.map(sys => {
                        const [stBg, stClr] = sys.stage ? STAGE_CLR[sys.stage] : ['#F1F5F9', '#64748B'];
                        return (
                          <div key={sys.id} onClick={() => setModal({ type: 'sysInfo', systemId: sys.id } as any)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', borderRadius: 10, backgroundColor: sys.hasStageDiscrepancy ? '#FEF2F2' : '#F8FAFC', border: `1px solid ${sys.hasStageDiscrepancy ? '#FECACA' : '#E2E8F0'}`, cursor: 'pointer' }}>
                            <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: sys.hasStageDiscrepancy ? '#FEE2E2' : '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                              <Database size={14} color={sys.hasStageDiscrepancy ? '#EF4444' : '#0EA5E9'} />
                            </div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: sys.hasStageDiscrepancy ? '#DC2626' : '#334155', flex: 1 }}>{sys.name}</span>
                            {sys.stage && <span style={{ fontSize: 10, fontWeight: 600, color: stClr, backgroundColor: stBg, padding: '2px 8px', borderRadius: 10 }}>{sys.stage}</span>}
                            {sys.hasStageDiscrepancy && <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: '#EF4444', backgroundColor: '#FEF2F2', border: '1px solid #FECACA', padding: '2px 8px', borderRadius: 8 }}><AlertTriangle size={11} /> Stage Gap</span>}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                <button onClick={() => { toast.success('X-Ray report exported'); setModal(null); }} style={{ width: '100%', padding: '12px', backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Export X-Ray Report</button>
              </div>
            );
          })()}

          {/* ── SUPPLIER INFO ─────────────────────── */}
          {modal.type === 'supInfo' && selSup && (
            <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 400, backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
              <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
              <div style={{ textAlign: 'center', marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                  <SupCircle riskScore={selSup.riskScore} piiVolume={selSup.piiVolume} size={56} />
                </div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 4 }}>{selSup.name}</div>
                {(() => { const [bg,c] = STAGE_CLR[selSup.stage]; return <span style={{ fontSize: 11, fontWeight: 600, color: c, backgroundColor: bg, padding: '3px 10px', borderRadius: 20 }}>{selSup.stage}</span>; })()}
              </div>
              {selSup.hasTruthGap && (
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 8, padding: '10px 12px', marginBottom: 14, display: 'flex', gap: 8, alignItems: 'center' }}>
                  <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#EF4444' }}>Truth Gap Detected</div>
                    <div style={{ fontSize: 11, color: '#DC2626', marginTop: 1 }}>Declared: [{selSup.declaredPII?.join(', ')}] · Detected: [{selSup.detectedPII?.join(', ')}]</div>
                  </div>
                </div>
              )}
              <div style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 14 }} />
              {([
                { label: 'RISK SCORE', value: selSup.riskScore === null ? 'Not assessed yet' : `${selSup.riskScore} / 100`, color: innerColor(selSup.riskScore) },
                { label: 'PII VOLUME', value: selSup.piiVolume, color: '#64748B' },
                { label: 'INTERNAL SPOC', value: selSup.internalSPOC ?? '— Not set', color: '#0EA5E9' },
                { label: 'TRUTH MATCH', value: selSup.hasTruthGap ? '⚠ Mismatch' : '100% Match', color: selSup.hasTruthGap ? '#EF4444' : '#10B981' },
              ] as { label: string; value: string; color: string }[]).map(row => (
                <div key={row.label} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 1 }}>{row.label}</div>
                  <div style={{ fontSize: 13, color: row.color }}>{row.value}</div>
                </div>
              ))}
              <div style={{ height: 1, backgroundColor: '#E2E8F0', margin: '14px 0' }} />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <button onClick={() => { toast.success(`Portal link sent to ${selSup.email}`); setModal(null); }} style={{ width: '100%', padding: '10px', backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>Send Portal Link</button>
                <button onClick={() => removeSup(selSup.id)} style={{ width: '100%', padding: '10px', backgroundColor: '#FEF2F2', color: '#EF4444', border: '1px solid #FECACA', borderRadius: 8, fontSize: 14, cursor: 'pointer' }}>Remove Supplier</button>
              </div>
            </div>
          )}

          {/* ── SYSTEM INFO ───────────────────────── */}
          {modal.type === 'sysInfo' && selSys && (() => {
            const vs = selSys.vulnScore ?? 75;
            const r = 28, circ = 2 * Math.PI * r;
            const dash = circ * (1 - vs / 100);
            const vsColor = vs >= 75 ? '#10B981' : vs >= 50 ? '#F59E0B' : '#EF4444';
            const [stageBg, stageClr] = selSys.stage ? STAGE_CLR[selSys.stage] : ['#F1F5F9', '#64748B'];
            return (
              <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 420, maxHeight: '88vh', overflowY: 'auto', backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
                <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 48, height: 48, borderRadius: 12, backgroundColor: selSys.hasStageDiscrepancy ? '#7F1D1D' : '#64748B', border: selSys.hasStageDiscrepancy ? '2px solid #EF4444' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Database size={22} color={selSys.hasStageDiscrepancy ? '#FCA5A5' : '#fff'} />
                  </div>
                  <div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{selSys.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8' }}>Internal System · {selSys.type.toUpperCase()}</div>
                  </div>
                </div>
                {selSys.hasStageDiscrepancy && (
                  <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '12px 14px', marginBottom: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                      <AlertTriangle size={14} color="#EF4444" style={{ flexShrink: 0 }} />
                      <div style={{ fontSize: 12, fontWeight: 700, color: '#DC2626' }}>Stage Discrepancy Detected</div>
                    </div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                      {(selSys.discrepancyFields ?? []).map(f => (
                        <span key={f} style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#fff', color: '#EF4444', border: '2px solid #FECACA', padding: '2px 10px', borderRadius: 20 }}>{f}</span>
                      ))}
                    </div>
                    <button onClick={() => setModal({ type: 'sysReasoning', systemId: selSys.id } as any)} style={{ fontSize: 11, fontWeight: 600, color: '#EF4444', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Cpu size={11} color="#EF4444" /> View Agent Reasoning →
                    </button>
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 16, marginBottom: 16, alignItems: 'center' }}>
                  <svg width={80} height={80}>
                    <circle cx={40} cy={40} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
                    <circle cx={40} cy={40} r={r} fill="none" stroke={vsColor} strokeWidth={8} strokeDasharray={`${circ}`} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 40 40)" />
                    <text x={40} y={44} textAnchor="middle" fontSize={14} fontWeight={700} fill={vsColor}>{vs}</text>
                  </svg>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Data Source</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#334155', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 10px', fontFamily: 'monospace' }}>{selSys.dataSource ?? '—'}</div>
                  </div>
                </div>
                {selSys.authorizedPII && selSys.authorizedPII.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>Authorized PII</div>
                    <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                      {selSys.authorizedPII.map(p => <span key={p} style={{ fontSize: 12, fontWeight: 600, backgroundColor: '#ECFDF5', color: '#10B981', border: '1px solid #A7F3D0', padding: '3px 10px', borderRadius: 20, display: 'inline-flex', alignItems: 'center', gap: 4 }}><CheckCircle2 size={10} />{p}</span>)}
                    </div>
                  </div>
                )}
                <div style={{ height: 1, backgroundColor: '#E2E8F0', marginBottom: 14 }} />
                <button onClick={() => { toast('System deep-scan coming soon'); setModal(null); }} style={{ width: '100%', padding: '10px', backgroundColor: '#64748B', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Run System Scan</button>
              </div>
            );
          })()}

          {/* ── SYSTEM REASONING MODAL ────────────── */}
          {modal.type === 'sysReasoning' && (() => {
            const rSys = systems.find(s => s.id === (modal as any).systemId);
            if (!rSys || !rSys.agentReasoning) return null;
            const ar = rSys.agentReasoning;
            const [stageBg, stageClr] = rSys.stage ? STAGE_CLR[rSys.stage] : ['#F1F5F9', '#64748B'];
            return (
              <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 480, backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.18)', animation: 'scaleIn 0.18s ease' }}>
                <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <Cpu size={16} color="#EF4444" />
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>Agent Reasoning — {rSys.name}</div>
                </div>
                <div style={{ fontSize: 12, color: '#94A3B8', marginBottom: 20 }}>Explaining the Stage Discrepancy detected on this internal system</div>
                <div style={{ backgroundColor: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#DC2626' }}>{ar.action} · {ar.trigger}</div>
                    <AlertTriangle size={14} color="#EF4444" />
                  </div>
                  <div style={{ fontSize: 12, color: '#7F1D1D', fontStyle: 'italic', lineHeight: 1.6, marginBottom: 10, paddingLeft: 4, borderLeft: '3px solid #FECACA' }}>
                    "{ar.reasoning}"
                  </div>
                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 10 }}>
                    {(rSys.discrepancyFields ?? []).map(f => <span key={f} style={{ fontSize: 12, fontWeight: 700, backgroundColor: '#fff', color: '#EF4444', border: '2px solid #FECACA', padding: '2px 9px', borderRadius: 20 }}>{f}</span>)}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 11, fontWeight: 500, backgroundColor: '#fff', border: '1px solid #E2E8F0', color: '#64748B', padding: '2px 10px', borderRadius: 20 }}>Confidence: {ar.confidence}%</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#EF4444', display: 'flex', alignItems: 'center', gap: 4 }}><AlertTriangle size={11} color="#EF4444" /> ALERT</span>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
                  <button onClick={() => setModal({ type: 'sysInfo', systemId: rSys.id } as any)} style={{ flex: 1, padding: '9px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff', color: '#64748B', cursor: 'pointer' }}>View System Details</button>
                  <button onClick={() => { toast.success('Discrepancy escalated to ' + rSys.internalSPOC); setModal(null); }} style={{ flex: 1, padding: '9px', fontSize: 13, fontWeight: 600, border: 'none', borderRadius: 8, backgroundColor: '#EF4444', color: '#fff', cursor: 'pointer' }}>Escalate to SPOC</button>
                </div>
              </div>
            );
          })()}

          {/* ── DIVISION INFO ─────────────────────── */}
          {modal.type === 'divInfo' && selDiv && (() => {
            const sups = suppliers.filter(s => s.divisionId === selDiv.id);
            const syss = systems.filter(s => s.divisionId === selDiv.id);
            const counts = STAGES.reduce((a, s) => { a[s] = sups.filter(x => x.stage === s).length; return a; }, {} as Record<Stage, number>);
            return (
              <div onClick={e => e.stopPropagation()} style={{ position: 'relative', width: 360, backgroundColor: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 24px 64px rgba(0,0,0,0.16)', animation: 'scaleIn 0.18s ease' }}>
                <button onClick={() => setModal(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8' }}><X size={18} /></button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: '#8B5CF6', border: '2px solid #7C3AED', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Briefcase size={18} color="#fff" strokeWidth={1.8} />
                  </div>
                  <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>{selDiv.name}</div>
                </div>
                {selDiv.lifecycleStage && (
                  <div style={{ marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 600, color: STAGE_CLR[selDiv.lifecycleStage][1], backgroundColor: STAGE_CLR[selDiv.lifecycleStage][0], padding: '3px 10px', borderRadius: 20 }}>
                      Customer {selDiv.lifecycleStage}
                    </span>
                  </div>
                )}
                <div style={{ fontSize: 13, color: '#64748B', marginBottom: 6 }}>
                  {sups.length} supplier{sups.length !== 1 ? 's' : ''} · {syss.length} internal system{syss.length !== 1 ? 's' : ''}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {STAGES.filter(s => counts[s] > 0).map(s => {
                    const [bg, c] = STAGE_CLR[s];
                    return <span key={s} style={{ fontSize: 11, fontWeight: 500, color: c, backgroundColor: bg, padding: '3px 10px', borderRadius: 20 }}>{counts[s]} {s}</span>;
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button onClick={() => setModal(null)} style={{ padding: '9px 16px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, backgroundColor: '#fff', color: '#64748B', cursor: 'pointer' }}>Close</button>
                  <button onClick={() => deleteDiv(selDiv.id)} style={{ padding: '9px 16px', fontSize: 13, border: '1px solid #FECACA', borderRadius: 8, backgroundColor: '#FEF2F2', color: '#EF4444', cursor: 'pointer' }}>Delete Division</button>
                </div>
              </div>
            );
          })()}

        </div>
      )}

      <style>{`
        @keyframes scaleIn { from{opacity:0;transform:scale(0.94)} to{opacity:1;transform:scale(1)} }
        @keyframes ping    { 0%,100%{opacity:1} 50%{opacity:0.25} }
      `}</style>
    </div>
  );
}
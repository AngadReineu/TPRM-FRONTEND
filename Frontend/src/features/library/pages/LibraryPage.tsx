import { useState, useRef, useEffect } from 'react';
import { RotateCcw, X, Network, AlertTriangle, Building2, Briefcase, Database, Eye, EyeOff, Smartphone, Cpu, CheckCircle2, Check, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/stores/authStore';
import { getGraphData, createDivision, updateDivision, createSupplier, createSystem, deleteDivision, deleteSupplier, deleteSystem } from '../services/library.data';

/* ── Validation helpers ─────────────────────────────────── */
const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const isValidMobile = (mobile: string) => /^[6-9]\d{9}$/.test(mobile.replace(/\s/g, ''));
const isValidGST = (gst: string) => 
  gst === '' || /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(gst.toUpperCase());
const isValidPAN = (pan: string) => 
  pan === '' || /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan.toUpperCase());

const fieldClass = (isValid: boolean, value: string) =>
  `w-full box-border border rounded-lg text-[13px] py-[9px] px-3 outline-none text-slate-700 ${
    value && !isValid 
      ? 'border-red-300 focus:ring-red-200' 
      : value && isValid 
      ? 'border-emerald-300 focus:ring-emerald-200'
      : 'border-slate-200 focus:ring-sky-200'
  }`;

/* ── Contact types ─────────────────────────────────────── */
interface LibContact {
  id: string;
  label: string;
  email: string;
  isDefault: boolean;
}

/* ─── Types ─────────────────────────────────────────────── */
type Stage = 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';
type PiiVolume = 'low' | 'moderate' | 'high';
type DragType = 'canvas' | 'org' | 'div' | 'sup' | 'sys';
type PiiFlow = 'share' | 'ingest' | 'both';

interface DragState { type: DragType; id: string; startMX: number; startMY: number; startX: number; startY: number; }
interface Division { id: string; x: number; y: number; lx?: number; ly?: number; name: string; lifecycleStage?: Stage; }
interface Supplier {
  id: string; divisionId: string; x: number; y: number; lx?: number; ly?: number;
  name: string; email: string; contact: string; phone: string; website: string; gst: string; pan: string;
  stage: Stage; riskScore: number | null; piiVolume: PiiVolume;
  piiFlow?: PiiFlow; piiTypes?: string[];
  hasTruthGap?: boolean; declaredPii?: string[]; detectedPii?: string[];
  internalSpoc?: string; externalSpoc?: string;
  contractStart?: string; contractEnd?: string;
  frequency?: string;
  lifecycles?: Stage[];
  stakeholders?: {
    businessOwner?: string; financeContact?: string; projectManager?: string; escalationContact?: string;
    accountManager?: string; supplierFinance?: string; supplierEscalation?: string;
  };
}
interface SystemNode {
  id: string; divisionId: string; x: number; y: number; lx?: number; ly?: number; name: string; type: 'crm' | 'infra' | 'db';
  dataSource?: string; piiTypes?: string[]; vulnScore?: number;
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

type ModalState =
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

/* ─── Constants ─────────────────────────────────────────── */
const STAGES: Stage[] = ['Acquisition', 'Retention', 'Upgradation', 'Offboarding'];
const STAGE_CLR: Record<Stage, [string, string]> = {
  Acquisition: ['#EFF6FF', '#0EA5E9'],
  Retention: ['#ECFDF5', '#10B981'],
  Upgradation: ['#FFFBEB', '#F59E0B'],
  Offboarding: ['#F1F5F9', '#64748B'],
};

const LIFECYCLE_COLUMNS: Record<Stage, { minFrac: number; maxFrac: number }> = {
  Acquisition: { minFrac: 0, maxFrac: 0.25 },
  Retention: { minFrac: 0.25, maxFrac: 0.50 },
  Upgradation: { minFrac: 0.50, maxFrac: 0.75 },
  Offboarding: { minFrac: 0.75, maxFrac: 1.00 },
};
const CANVAS_W = 1600;
const CANVAS_H = 1000;

const ORG_R = 32;
const DIV_R = 24;
const toRad = (d: number) => (d * Math.PI) / 180;

/* ─── Color helpers ─────────────────────────────────────── */
const innerColor = (score: number | null): string =>
  score === null ? '#94A3B8' : score >= 50 ? '#10B981' : '#EF4444';
const piiStrokeW = (vol: PiiVolume): number =>
  vol === 'low' ? 3 : vol === 'moderate' ? 7 : 13;
const supOuterR = (vol: PiiVolume): number =>
  vol === 'low' ? 22 : vol === 'moderate' ? 26 : 32;

/* ─── Mock Data ─────────────────────────────────────────── */
const INIT_ORG = { x: 580, y: 380 };

const INIT_DIVS: Division[] = [
  { id: 'd1', name: 'Marketing Dept', x: 400, y: 200 },
  { id: 'd2', name: 'Technical Dept', x: 350, y: 500 },
  { id: 'd3', name: 'Operations Dept', x: 760, y: 480 },
  { id: 'ld1', name: 'Growth & Leads', x: 200, y: 130, lifecycleStage: 'Acquisition' },
  { id: 'ld3', name: 'Customer Success', x: 600, y: 130, lifecycleStage: 'Retention' },
  { id: 'ld5', name: 'Product Upgrades', x: 1000, y: 130, lifecycleStage: 'Upgradation' },
  { id: 'ld7', name: 'Churn Prevention', x: 1400, y: 130, lifecycleStage: 'Offboarding' },
];

const INIT_SUPS: Supplier[] = [
  { id: 's1', divisionId: 'd1', x: 220, y: 120, name: 'XYZ Email Mktg', stage: 'Acquisition', riskScore: 78, piiVolume: 'moderate', email: 'xyz@email.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'share', piiTypes: ['Aadhar', 'Phone', 'Email'], hasTruthGap: false, declaredPii: ['Aadhar', 'Phone', 'Email'], detectedPii: ['Aadhar', 'Phone', 'Email'], internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com', frequency: 'Daily', contractEnd: '2026-12-31', lifecycles: ['Acquisition', 'Retention'], stakeholders: { businessOwner: 'priya@abc.co', financeContact: 'finance@abc.co', accountManager: 'john@xyz.com', supplierFinance: 'billing@xyz.com' } },
  { id: 's2', divisionId: 'd1', x: 380, y: 80, name: 'Field Agent Co.', stage: 'Acquisition', riskScore: null, piiVolume: 'low', email: 'field@agent.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'ingest', piiTypes: ['Email'], hasTruthGap: false, declaredPii: ['Email'], detectedPii: ['Email'], internalSpoc: 'priya@abc.co', externalSpoc: 'leads@field.com', frequency: 'Weekly', contractEnd: '2026-06-30', lifecycles: ['Acquisition'], stakeholders: { businessOwner: 'priya@abc.co', accountManager: 'leads@field.com' } },
  { id: 's3', divisionId: 'd1', x: 200, y: 280, name: 'Call Center Ltd', stage: 'Retention', riskScore: 22, piiVolume: 'high', email: 'cc@ltd.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'both', piiTypes: ['Aadhar', 'Phone'], hasTruthGap: true, declaredPii: ['Phone'], detectedPii: ['Aadhar', 'Phone', 'Location'], internalSpoc: 'raj@abc.co', externalSpoc: 'ops@ccltd.com', frequency: 'Hourly', contractEnd: '2025-12-31', lifecycles: ['Retention', 'Upgradation'], stakeholders: { businessOwner: 'raj@abc.co', escalationContact: 'ciso@abc.co', accountManager: 'ops@ccltd.com', supplierEscalation: 'escalate@ccltd.com' } },
  { id: 's4', divisionId: 'd2', x: 160, y: 460, name: 'CloudSec Inc.', stage: 'Upgradation', riskScore: 82, piiVolume: 'low', email: 'cloud@sec.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'share', piiTypes: ['Credentials'], hasTruthGap: false, declaredPii: ['Credentials'], detectedPii: ['Credentials'], internalSpoc: 'anita@abc.co', externalSpoc: 'cto@cloudsec.io', frequency: 'Daily', contractEnd: '2027-03-31', lifecycles: ['Upgradation'], stakeholders: { businessOwner: 'anita@abc.co', projectManager: 'pm@abc.co', accountManager: 'cto@cloudsec.io' } },
  { id: 's5', divisionId: 'd2', x: 200, y: 620, name: 'DataVault Co.', stage: 'Retention', riskScore: 35, piiVolume: 'moderate', email: 'data@vault.co', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'both', piiTypes: ['Financial', 'PAN'], hasTruthGap: true, declaredPii: ['Financial'], detectedPii: ['Financial', 'PAN', 'Aadhar'], internalSpoc: 'anita@abc.co', externalSpoc: 'dpo@datavault.co', frequency: 'Hourly', contractEnd: '2026-09-30', lifecycles: ['Retention', 'Offboarding'], stakeholders: { businessOwner: 'anita@abc.co', escalationContact: 'dpo@abc.co', accountManager: 'dpo@datavault.co', supplierEscalation: 'security@datavault.co' } },
  { id: 's6', divisionId: 'd3', x: 660, y: 640, name: 'LogiTrack Ltd', stage: 'Offboarding', riskScore: null, piiVolume: 'low', email: 'lt@email.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'ingest', piiTypes: ['Location'], hasTruthGap: false, declaredPii: ['Location'], detectedPii: ['Location'], frequency: 'Weekly', contractEnd: '2025-06-30', lifecycles: ['Offboarding'] },
  { id: 's7', divisionId: 'd3', x: 880, y: 560, name: 'HR Systems Co.', stage: 'Acquisition', riskScore: 88, piiVolume: 'moderate', email: 'hr@systems.co', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'share', piiTypes: ['Name', 'Email', 'DOB'], hasTruthGap: false, declaredPii: ['Name', 'Email', 'DOB'], detectedPii: ['Name', 'Email', 'DOB'], frequency: 'Daily', contractEnd: '2026-12-31', lifecycles: ['Acquisition', 'Retention'] },
  { id: 'ls1', divisionId: 'ld1', x: 90, y: 230, name: 'AdReach Pro', stage: 'Acquisition', riskScore: 72, piiVolume: 'moderate', email: 'ads@adreach.io', contact: 'Sam', phone: '+91 98100 11111', website: 'adreach.io', gst: '', pan: '', piiFlow: 'share', piiTypes: ['Name', 'Email', 'Phone'], hasTruthGap: false, declaredPii: ['Name', 'Email', 'Phone'], detectedPii: ['Name', 'Email', 'Phone'], internalSpoc: 'priya@abc.co', externalSpoc: 'sam@adreach.io', frequency: 'Daily', contractEnd: '2026-12-31', lifecycles: ['Acquisition'], stakeholders: { businessOwner: 'priya@abc.co', accountManager: 'sam@adreach.io' } },
  { id: 'ls2', divisionId: 'ld1', x: 330, y: 230, name: 'LeadGen Solutions', stage: 'Acquisition', riskScore: null, piiVolume: 'low', email: 'info@leadgen.co', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'ingest', piiTypes: ['Email'], hasTruthGap: false, declaredPii: ['Email'], detectedPii: ['Email'], internalSpoc: 'priya@abc.co', externalSpoc: 'leads@leadgen.co', frequency: 'Weekly', contractEnd: '2026-09-30', lifecycles: ['Acquisition'] },
  { id: 'ls5', divisionId: 'ld3', x: 500, y: 230, name: 'NPS Track Co.', stage: 'Retention', riskScore: 68, piiVolume: 'moderate', email: 'nps@track.io', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'both', piiTypes: ['Phone', 'Email'], hasTruthGap: false, declaredPii: ['Phone', 'Email'], detectedPii: ['Phone', 'Email'], internalSpoc: 'raj@abc.co', frequency: 'Daily', contractEnd: '2026-10-31', lifecycles: ['Retention'] },
  { id: 'ls6', divisionId: 'ld3', x: 730, y: 230, name: 'Call Center Ltd', stage: 'Retention', riskScore: 22, piiVolume: 'high', email: 'cc@ltd.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'both', piiTypes: ['Aadhar', 'Phone'], hasTruthGap: true, declaredPii: ['Phone'], detectedPii: ['Aadhar', 'Phone', 'Location'], internalSpoc: 'raj@abc.co', externalSpoc: 'ops@ccltd.com', frequency: 'Hourly', contractEnd: '2025-12-31', lifecycles: ['Retention'], stakeholders: { businessOwner: 'raj@abc.co', escalationContact: 'ciso@abc.co', accountManager: 'ops@ccltd.com' } },
  { id: 'ls9', divisionId: 'ld5', x: 900, y: 230, name: 'UpSell AI', stage: 'Upgradation', riskScore: 76, piiVolume: 'moderate', email: 'api@upsellai.com', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'share', piiTypes: ['Financial', 'PAN'], hasTruthGap: false, declaredPii: ['Financial', 'PAN'], detectedPii: ['Financial', 'PAN'], internalSpoc: 'anita@abc.co', frequency: 'Daily', contractEnd: '2026-12-31', lifecycles: ['Upgradation'] },
  { id: 'ls10', divisionId: 'ld5', x: 1130, y: 230, name: 'Policy Xpander', stage: 'Upgradation', riskScore: 60, piiVolume: 'low', email: 'px@policyxp.in', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'ingest', piiTypes: ['Name', 'DOB'], hasTruthGap: false, declaredPii: ['Name', 'DOB'], detectedPii: ['Name', 'DOB'], internalSpoc: 'anita@abc.co', frequency: 'Weekly', contractEnd: '2027-06-30', lifecycles: ['Upgradation'] },
  { id: 'ls13', divisionId: 'ld7', x: 1300, y: 230, name: 'Churn Analytics', stage: 'Offboarding', riskScore: 50, piiVolume: 'moderate', email: 'ops@churnai.io', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'ingest', piiTypes: ['Phone', 'Email'], hasTruthGap: false, declaredPii: ['Phone', 'Email'], detectedPii: ['Phone', 'Email'], internalSpoc: 'kiran@abc.co', frequency: 'Daily', contractEnd: '2026-07-31', lifecycles: ['Offboarding'] },
  { id: 'ls14', divisionId: 'ld7', x: 1530, y: 230, name: 'WinBack Mktg', stage: 'Offboarding', riskScore: 40, piiVolume: 'low', email: 'wb@winback.in', contact: '', phone: '', website: '', gst: '', pan: '', piiFlow: 'share', piiTypes: ['Email'], hasTruthGap: false, declaredPii: ['Email'], detectedPii: ['Email'], internalSpoc: 'kiran@abc.co', frequency: 'Weekly', contractEnd: '2025-12-31', lifecycles: ['Offboarding'] },
];

const INIT_SYSTEMS: SystemNode[] = [
  {
    id: 'sys1', divisionId: 'd1', x: 480, y: 100, name: 'Salesforce CRM', type: 'crm',
    dataSource: 'AWS S3 Bucket (us-east-1/crm-prod)',
    piiTypes: ['Name', 'Email', 'Phone', 'DOB'],
    vulnScore: 82,
    stage: 'Acquisition',
    internalSpoc: 'priya@abc.co',
    authorizedPii: ['Name', 'Phone', 'Email', 'DOB'],
    hasStageDiscrepancy: true,
    discrepancyFields: ['Bank Balance', 'Aadhar'],
    linkedSupplierId: 's2',
    agentReasoning: {
      timestamp: '09:14 AM',
      action: 'Stage PII Audit',
      trigger: 'Salesforce CRM · Acquisition Step',
      reasoning: 'Detected "Bank Balance" and "Aadhar" fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step — they belong to Retention/Upgradation workflows. Probable cause: employee error or unauthorized data pre-fill. Flagging as Stage Discrepancy.',
      confidence: 94,
      outcome: 'alert',
    },
  },
  {
    id: 'sys2', divisionId: 'd2', x: 120, y: 560, name: 'AWS Infra', type: 'infra',
    dataSource: 'SQL DB (prod-db.internal:5432)',
    piiTypes: ['Credentials', 'Financial', 'PAN'],
    vulnScore: 61,
    stage: 'Upgradation',
    internalSpoc: 'anita@abc.co',
    authorizedPii: ['Credentials', 'Financial', 'PAN'],
    hasStageDiscrepancy: false,
    linkedSupplierId: 's4',
  },
  {
    id: 'lsys1', divisionId: 'ld1', x: 215, y: 320,
    name: 'Salesforce CRM', type: 'crm',
    dataSource: 'AWS S3 (us-east-1/crm-prod)',
    piiTypes: ['Name', 'Email', 'Phone', 'DOB'],
    vulnScore: 82, stage: 'Acquisition', internalSpoc: 'priya@abc.co',
    authorizedPii: ['Name', 'Phone', 'Email'],
    hasStageDiscrepancy: true, discrepancyFields: ['Bank Balance', 'Aadhar'],
    linkedSupplierId: 'ls2',
    agentReasoning: { timestamp: '09:14 AM', action: 'Stage PII Audit', trigger: 'Salesforce CRM · Acquisition Step', reasoning: 'Detected "Bank Balance" and "Aadhar" fields being written to Salesforce CRM (Acquisition stage). These fields are not authorized at this step — they belong to Retention/Upgradation workflows.', confidence: 94, outcome: 'alert' },
  },
  {
    id: 'lsys3', divisionId: 'ld3', x: 615, y: 320,
    name: 'Zendesk CRM', type: 'crm',
    dataSource: 'AWS RDS (ap-south-1/zendesk-prod)',
    piiTypes: ['Name', 'Email', 'Phone'],
    vulnScore: 79, stage: 'Retention', internalSpoc: 'raj@abc.co',
    authorizedPii: ['Name', 'Email', 'Phone'],
    hasStageDiscrepancy: false, linkedSupplierId: 'ls5',
  },
  {
    id: 'lsys5', divisionId: 'ld5', x: 1015, y: 320,
    name: 'Policy Engine', type: 'infra',
    dataSource: 'AWS S3 (ap-south-1/policy-engine)',
    piiTypes: ['Financial', 'PAN', 'DOB'],
    vulnScore: 65, stage: 'Upgradation', internalSpoc: 'anita@abc.co',
    authorizedPii: ['Financial', 'PAN', 'DOB'],
    hasStageDiscrepancy: false, linkedSupplierId: 'ls9',
  },
  {
    id: 'lsys7', divisionId: 'ld7', x: 1415, y: 320,
    name: 'Churn Dashboard', type: 'crm',
    dataSource: 'GCP BigQuery (project/churn-metrics)',
    piiTypes: ['Phone', 'Email'],
    vulnScore: 70, stage: 'Offboarding', internalSpoc: 'kiran@abc.co',
    authorizedPii: ['Phone', 'Email'],
    hasStageDiscrepancy: false, linkedSupplierId: 'ls13',
  },
];

/* ─── Supplier dual-circle SVG ──────────────────────────── */
function SupCircle({ riskScore, piiVolume, size }: { riskScore: number | null; piiVolume: PiiVolume; size: number }) {
  const sw = piiStrokeW(piiVolume);
  const r = size / 2 - sw / 2 - 1;
  const ir = size * 0.34;
  return (
    <svg width={size} height={size} className="block shrink-0 overflow-visible">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#EF4444" strokeWidth={sw} opacity={0.35} />
      <circle cx={size / 2} cy={size / 2} r={ir} fill={innerColor(riskScore)} stroke="#fff" strokeWidth={2} />
    </svg>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function LibraryPage() {
  const user = useAuthStore((state) => state.user);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragMovedRef = useRef(false);
  const [containerWidth, setContainerWidth] = useState(1200);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [drag, setDrag] = useState<DragState | null>(null);
  const [orgPos, setOrgPos] = useState(INIT_ORG);
  const [divisions, setDivisions] = useState<Division[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [systems, setSystems] = useState<SystemNode[]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const [xrayMode, setXrayMode] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [lifecycleView, setLifecycleView] = useState(false);
  const [showLegend, setShowLegend] = useState(false);

  const [divName, setDivName] = useState('');
  const [supForm, setSupForm] = useState({ name: '', email: '', contact: '', phone: '', website: '', gst: '', pan: '', stage: '' as Stage | '', contractStart: '', contractEnd: '', frequency: 'Daily', lifecycles: [] as Stage[], businessOwner: '', financeContact: '', projectManager: '', escalationContact: '', accountManager: '', supplierFinance: '', supplierEscalation: '' });
  const [sysForm, setSysForm] = useState({ name: '', type: 'crm' as SystemNode['type'], stage: '' as Stage | '', dataSource: '', authorizedPii: [] as string[], vulnScore: 75, linkedSupplierId: '' });
  
  // Contact management for stakeholder matrix
  const [libInternalContacts, setLibInternalContacts] = useState<LibContact[]>([
    { id: 'default-internal', label: 'Business Owner', email: '', isDefault: true }
  ]);
  const [libSupplierContacts, setLibSupplierContacts] = useState<LibContact[]>([
    { id: 'default-supplier', label: 'Account Manager', email: '', isDefault: true }
  ]);

  function addLibContact(side: 'internal' | 'supplier') {
    const newContact: LibContact = { id: crypto.randomUUID(), label: '', email: '', isDefault: false };
    if (side === 'internal') {
      setLibInternalContacts(prev => [...prev, newContact]);
    } else {
      setLibSupplierContacts(prev => [...prev, newContact]);
    }
  }

  function removeLibContact(side: 'internal' | 'supplier', id: string) {
    if (side === 'internal') {
      setLibInternalContacts(prev => prev.filter(c => c.id !== id));
    } else {
      setLibSupplierContacts(prev => prev.filter(c => c.id !== id));
    }
  }

  function updateLibContact(side: 'internal' | 'supplier', id: string, field: 'label' | 'email', value: string) {
    const setter = side === 'internal' ? setLibInternalContacts : setLibSupplierContacts;
    setter(prev => prev.map(c => c.id === id ? { ...c, [field]: value } : c));
  }

  function resetLibContacts() {
    setLibInternalContacts([{ id: 'default-internal', label: 'Business Owner', email: '', isDefault: true }]);
    setLibSupplierContacts([{ id: 'default-supplier', label: 'Account Manager', email: '', isDefault: true }]);
  }

  // Load data from backend on mount
  useEffect(() => {
    (async () => {
      try {
        const data = await getGraphData();
        let divs = data.divisions || [];
        let sups = data.suppliers || [];
        let syst = data.systems || [];

        // --- Prevent initial cramped layout by applying a repulsive force relaxation ---
        let nodes = [...divs, ...sups, ...syst] as any[];
        for (let iter = 0; iter < 80; iter++) {
          for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
              let u = nodes[i], v = nodes[j];
              let dx = u.x - v.x, dy = u.y - v.y;
              let dist = Math.sqrt(dx*dx + dy*dy) || 1;
              let targetDist = u.type === 'crm' || v.type === 'crm' ? 80 : 100;
              if (dist < targetDist) {
                let force = (targetDist - dist) / dist * 0.15;
                u.x += dx * force; u.y += dy * force;
                v.x -= dx * force; v.y -= dy * force;
              }
            }
          }
          // Mild attraction to parents to keep them grouped loosely
          for (let s of sups) {
             let d = divs.find(x => x.id === s.divisionId);
             if (d) { s.x += (d.x - s.x) * 0.01; s.y += (d.y - s.y) * 0.01; }
          }
          for (let s of syst) {
             let ref = s.linkedSupplierId ? sups.find(x => x.id === s.linkedSupplierId) : divs.find(x => x.id === s.divisionId);
             if (ref) { s.x += (ref.x - s.x) * 0.02; s.y += (ref.y - s.y) * 0.02; }
          }
        }

        // --- Calculate structured lifecycle coords (lx, ly) to fix columns ---
        const lCols: Record<string, any[]> = { Acquisition: [], Retention: [], Upgradation: [], Offboarding: [] };
        nodes.forEach(n => {
           let stage = n.lifecycleStage || n.stage;
           if (stage && lCols[stage]) lCols[stage].push(n);
        });

        Object.entries(lCols).forEach(([stage, stageNodes]) => {
           const col = LIFECYCLE_COLUMNS[stage as Stage];
           if (col) {
             const cx = (col.minFrac + col.maxFrac) / 2 * CANVAS_W;
             stageNodes.forEach((n, idx) => {
               // Assign a stable spread lx/ly layout inside the lifecycle column
               if (n.lx === undefined || isNaN(n.lx)) {
                 n.lx = cx + (Math.sin(idx) * 60) - 30; 
                 n.ly = 150 + idx * 95;
               }
             });
           }
        });

        setDivisions([...divs]);
        setSuppliers([...sups]);
        setSystems([...syst]);
        if (data.org) setOrgPos({ x: data.org.canvasX ?? data.org.x ?? 580, y: data.org.canvasY ?? data.org.y ?? 380 });
      } catch (err) {
        console.error('Failed to load library graph data:', err);
      }
    })();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    setContainerWidth(r.width);
    setPan({ x: r.width / 2 - INIT_ORG.x, y: r.height / 2 - INIT_ORG.y });
    const ro = new ResizeObserver(entries => {
      const w = entries[0]?.contentRect.width;
      if (w) setContainerWidth(w);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const factor = e.deltaY > 0 ? 0.92 : 1.08;
      const rect = el.getBoundingClientRect();
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

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - drag.startMX, dy = e.clientY - drag.startMY;
      if (Math.abs(dx) + Math.abs(dy) >= 3) dragMovedRef.current = true;
      if (!dragMovedRef.current) return;
      const activeScale = zoom;
      const vdx = dx / activeScale, vdy = dy / activeScale;
      if (drag.type === 'canvas') {
        setPan({ x: drag.startX + dx, y: drag.startY + dy });
      } else if (drag.type === 'org') {
        setOrgPos({ x: drag.startX + vdx, y: drag.startY + vdy });
      } else if (drag.type === 'div') {
        setDivisions(ds => ds.map(d => {
          if (d.id !== drag.id) return d;
          let newX = drag.startX + vdx, newY = drag.startY + vdy;
          if (lifecycleView && d.lifecycleStage) {
            const col = LIFECYCLE_COLUMNS[d.lifecycleStage];
            newX = Math.max(col.minFrac * CANVAS_W + DIV_R + 12, Math.min(col.maxFrac * CANVAS_W - DIV_R - 12, newX));
            return { ...d, lx: newX, ly: newY };
          }
          return { ...d, x: newX, y: newY };
        }));
      } else if (drag.type === 'sup') {
        setSuppliers(ss => ss.map(s => {
          if (s.id !== drag.id) return s;
          let newX = drag.startX + vdx, newY = drag.startY + vdy;
          if (lifecycleView && s.stage) {
            const col = LIFECYCLE_COLUMNS[s.stage as Stage];
            if (col) {
              newX = Math.max(col.minFrac * CANVAS_W + 50, Math.min(col.maxFrac * CANVAS_W - 50, newX));
            }
            return { ...s, lx: newX, ly: newY };
          }
          return { ...s, x: newX, y: newY };
        }));
      } else if (drag.type === 'sys') {
        setSystems(sys => sys.map(s => {
          if (s.id !== drag.id) return s;
          let newX = drag.startX + vdx, newY = drag.startY + vdy;
          if (lifecycleView && s.stage) {
            const col = LIFECYCLE_COLUMNS[s.stage as Stage];
            if (col) {
              newX = Math.max(col.minFrac * CANVAS_W + 40, Math.min(col.maxFrac * CANVAS_W - 40, newX));
            }
            return { ...s, lx: newX, ly: newY };
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

  const resetView = () => {
    const r = containerRef.current?.getBoundingClientRect();
    if (!r) return;
    setZoom(1);
    if (lifecycleView) setPan({ x: 0, y: 48 });
    else setPan({ x: r.width / 2 - orgPos.x, y: r.height / 2 - orgPos.y });
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

  const handleToggleLifecycle = () => {
    const el = containerRef.current;
    const r = el?.getBoundingClientRect();
    setDrag(null);
    if (!lifecycleView) {
      setZoom(containerWidth / CANVAS_W);
      if (r) setPan({ x: 0, y: 48 });
      setLifecycleView(true);
    } else {
      setZoom(1);
      if (r) setPan({ x: r.width / 2 - INIT_ORG.x, y: r.height / 2 - INIT_ORG.y });
      setLifecycleView(false);
    }
  };

  const lifecycleDivisions = divisions.filter(d => d.lifecycleStage !== undefined);

  const addDivision = async () => {
    if (!divName.trim()) return;
    let spawnX: number, spawnY: number;
    let lifecycleStage: Stage | undefined = undefined;
    if (modal?.type === 'addDiv' && modal.spawnX !== undefined && modal.spawnY !== undefined) {
      spawnX = modal.spawnX; spawnY = modal.spawnY; lifecycleStage = modal.lifecycleStage;
    } else {
      const ang = toRad(divisions.length * 120);
      spawnX = orgPos.x + 200 * Math.cos(ang); spawnY = orgPos.y + 200 * Math.sin(ang);
    }
    try {
      const newDiv = await createDivision({ name: divName.trim(), canvasX: spawnX, canvasY: spawnY, lifecycleStage });
      setDivisions(ds => [...ds, newDiv]);
      toast.success(`Division "${divName.trim()}" added`);
    } catch (err) {
      console.error('Failed to create division:', err);
      toast.error('Failed to add division');
    }
    setModal(null); setDivName('');
  };

  const addSupplier = async () => {
    // Validate required fields
    const isFormValid = 
      supForm.name.trim() !== '' &&
      isValidEmail(supForm.email) &&
      supForm.stage !== '' &&
      (!supForm.phone || isValidMobile(supForm.phone)) &&
      (!supForm.gst || isValidGST(supForm.gst)) &&
      (!supForm.pan || isValidPAN(supForm.pan)) &&
      libInternalContacts[0].email !== '' && isValidEmail(libInternalContacts[0].email) &&
      libSupplierContacts[0].email !== '' && isValidEmail(libSupplierContacts[0].email);

    if (!isFormValid) {
      toast.error('Please fill in all required fields correctly');
      return;
    }
    const divisionId = modal?.type === 'addSup' ? modal.divisionId : '';
    const div = divisions.find(d => d.id === divisionId);
    if (!div) return;
    const count = suppliers.filter(s => s.divisionId === div.id).length;
    const ang = toRad(count * 72);
    let newX = div.x + 160 * Math.cos(ang), newY = div.y + 160 * Math.sin(ang);
    if (lifecycleView && div.lifecycleStage) {
      const col = LIFECYCLE_COLUMNS[div.lifecycleStage];
      newX = Math.max(col.minFrac * CANVAS_W + 16, Math.min(col.maxFrac * CANVAS_W - 16, newX));
    }
    const lcs = supForm.lifecycles.length > 0 ? supForm.lifecycles : [supForm.stage as Stage];
    try {
      const newSup = await createSupplier({
        divisionId: div.id, canvasX: newX, canvasY: newY, name: supForm.name, email: supForm.email,
        contact: supForm.contact, phone: supForm.phone, website: supForm.website, gst: supForm.gst, pan: supForm.pan,
        stage: supForm.stage as Stage, piiVolume: 'low', piiFlow: 'share', piiTypes: [],
        contractStart: supForm.contractStart || undefined, contractEnd: supForm.contractEnd || undefined,
        frequency: supForm.frequency || undefined, lifecycles: lcs,
        internalSpoc: libInternalContacts[0]?.email || undefined,
        externalSpoc: libSupplierContacts[0]?.email || undefined,
        stakeholders: {
          internal: libInternalContacts.filter(c => c.email).map(c => ({ label: c.label, email: c.email })),
          supplier: libSupplierContacts.filter(c => c.email).map(c => ({ label: c.label, email: c.email }))
        }
      });
      setSuppliers(ss => [...ss, newSup]);
      toast.success(`Supplier "${supForm.name}" added`);
    } catch (err) {
      console.error('Failed to create supplier:', err);
      toast.error('Failed to add supplier');
    }
    setModal(null); setSupForm({ name: '', email: '', contact: '', phone: '', website: '', gst: '', pan: '', stage: '', contractStart: '', contractEnd: '', frequency: 'Daily', lifecycles: [], businessOwner: '', financeContact: '', projectManager: '', escalationContact: '', accountManager: '', supplierFinance: '', supplierEscalation: '' });
    resetLibContacts();
  };

  const addSystem = async () => {
    if (!sysForm.name || !sysForm.stage || !sysForm.linkedSupplierId) return;
    const divisionId = modal?.type === 'addSys' ? modal.divisionId : '';
    const div = divisions.find(d => d.id === divisionId);
    if (!div) return;
    const linkedSup = suppliers.find(s => s.id === sysForm.linkedSupplierId);
    const anchorX = linkedSup ? linkedSup.x : div.x, anchorY = linkedSup ? linkedSup.y : div.y;
    const count = systems.filter(s => s.divisionId === div.id).length;
    const ang = toRad((count + 2) * 72);
    let newX = anchorX + 140 * Math.cos(ang), newY = anchorY + 140 * Math.sin(ang);
    if (lifecycleView && div.lifecycleStage) {
      const col = LIFECYCLE_COLUMNS[div.lifecycleStage];
      newX = Math.max(col.minFrac * CANVAS_W + 16, Math.min(col.maxFrac * CANVAS_W - 16, newX));
    }
    try {
      const newSys = await createSystem({
        divisionId: div.id, canvasX: newX, canvasY: newY, name: sysForm.name, type: sysForm.type,
        stage: sysForm.stage as Stage, dataSource: sysForm.dataSource || undefined,
        authorizedPii: sysForm.authorizedPii.length > 0 ? sysForm.authorizedPii : undefined,
        piiTypes: sysForm.authorizedPii.length > 0 ? sysForm.authorizedPii : undefined,
        vulnScore: sysForm.vulnScore, linkedSupplierId: sysForm.linkedSupplierId
      });
      setSystems(sys => [...sys, newSys]);
      toast.success(`System "${sysForm.name}" linked to ${linkedSup?.name ?? div.name}`);
    } catch (err) {
      console.error('Failed to create system:', err);
      toast.error('Failed to add system');
    }
    setModal(null); setSysForm({ name: '', type: 'crm', stage: '', dataSource: '', authorizedPii: [], vulnScore: 75, linkedSupplierId: '' });
  };

  const deleteDiv = async (id: string) => {
    try {
      await deleteDivision(id);
      setDivisions(ds => ds.filter(d => d.id !== id));
      setSuppliers(ss => ss.filter(s => s.divisionId !== id));
      setSystems(sys => sys.filter(s => s.divisionId !== id));
      setModal(null); toast.success('Division deleted');
    } catch (err) {
      console.error('Failed to delete division:', err);
      toast.error('Failed to delete division');
    }
  };
  const removeSup = async (id: string) => {
    try {
      await deleteSupplier(id);
      setSuppliers(ss => ss.filter(s => s.id !== id));
      setModal(null); toast.success('Supplier removed');
    } catch (err) {
      console.error('Failed to remove supplier:', err);
      toast.error('Failed to remove supplier');
    }
  };
  const removeSys = async (id: string) => {
    try {
      await deleteSystem(id);
      setSystems(sys => sys.filter(s => s.id !== id));
      setModal(null); toast.success('System removed');
    } catch (err) {
      console.error('Failed to remove system:', err);
      toast.error('Failed to remove system');
    }
  };

  const selSup = modal?.type === 'supInfo' ? suppliers.find(s => s.id === modal.supplierId) ?? null : null;
  const selDiv = modal?.type === 'divInfo' ? divisions.find(d => d.id === modal.divisionId) ?? null : null;
  const addSupDiv = modal?.type === 'addSup' ? divisions.find(d => d.id === modal.divisionId) ?? null : null;
  const addSysDiv = modal?.type === 'addSys' ? divisions.find(d => d.id === modal.divisionId) ?? null : null;
  const selSys = modal?.type === 'sysInfo' ? systems.find(s => s.id === (modal as any).systemId) ?? null : null;

  const arrowColor = (flow?: PiiFlow) => flow === 'share' ? '#0EA5E9' : flow === 'ingest' ? '#10B981' : '#8B5CF6';

  const visibleDivisions = divisions;
  const visibleSuppliers = suppliers;
  const visibleSystems = systems;

  return (
    <div className="-mx-8 -my-6 h-[calc(100vh-64px)] flex flex-col overflow-hidden" style={{ fontFamily: "'Segoe UI', -apple-system, sans-serif" }}>

      {/* ── Page Header ─────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-6 py-[14px] flex items-center justify-between shrink-0">
        <div>
          <div className="text-lg font-bold text-slate-900">Organization Data Flow</div>
          <div className="text-xs text-slate-400 mt-0.5">{lifecycleView ? 'Lifecycle view · Add divisions to columns · Click to interact' : 'Drag nodes · Scroll to zoom · Click to interact'}</div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={handleToggleLifecycle} className={`h-8 px-3 rounded-[6px] cursor-pointer text-xs flex items-center gap-[5px] ${lifecycleView ? 'border border-violet-500 bg-violet-50 text-violet-500 font-semibold' : 'border border-slate-200 bg-white text-slate-500 font-normal'}`}>
            <Network size={13} />{lifecycleView ? 'Switch to Graph View' : 'Switch to Lifecycle View'}
          </button>
          <span className="w-px h-5 bg-slate-200 inline-block" />
          <button onClick={() => { setXrayMode(x => !x); if (xrayMode) setSelectedId(null); }} className={`h-8 px-3 rounded-[6px] cursor-pointer text-xs flex items-center gap-[5px] ${xrayMode ? 'border border-sky-500 bg-blue-50 text-sky-500 font-semibold' : 'border border-slate-200 bg-white text-slate-500 font-normal'}`}>
            {xrayMode ? <Eye size={13} /> : <EyeOff size={13} />}Data X-Ray {xrayMode ? 'ON' : 'OFF'}
          </button>
          <span className="w-px h-5 bg-slate-200 inline-block mx-1" />
          <span className="text-[13px] text-slate-500">Viewing:</span>
          <select defaultValue="current" onChange={e => { if (e.target.value !== 'current') { toast('Historical view coming soon'); setTimeout(() => (e.target.value = 'current'), 0); } }} className="border border-slate-200 rounded-lg px-2.5 py-[5px] text-[13px] text-slate-700 bg-white outline-none cursor-pointer">
            <option value="current">Current</option>
            <option value="3m">3 months ago</option>
            <option value="6m">6 months ago</option>
            <option value="1y">1 year ago</option>
          </select>
          <span className="w-px h-5 bg-slate-200 inline-block mx-1" />
          {[{ l: '+', fn: () => { setZoom(z => Math.min(3, z * 1.15)); } }, { l: '−', fn: () => { setZoom(z => Math.max(0.25, z / 1.15)); } }].map(b => (
            <button key={b.l} onClick={b.fn} className="w-8 h-8 border border-slate-200 bg-white rounded-[6px] cursor-pointer text-base flex items-center justify-center text-slate-500 font-mono">{b.l}</button>
          ))}
          <button onClick={resetView} className="h-8 px-3 border border-slate-200 bg-white rounded-[6px] cursor-pointer text-xs text-slate-500 flex items-center gap-[5px]">
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* ── Canvas ──────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="flex-1 relative overflow-hidden bg-slate-50 [background-image:radial-gradient(circle,#CBD5E1_1px,transparent_1px)] [background-size:24px_24px]"
        style={{ cursor: drag?.type === 'canvas' ? 'grabbing' : 'grab' }}
        onMouseDown={e => { setModal(null); if (xrayMode) setSelectedId(null); startDrag('canvas', '', e, pan.x, pan.y); }}
      >
        {/* ═══ Canvas with nodes (shown in both views) ═══ */}
        <div className="absolute origin-[0_0] w-[1600px] h-[1000px]" style={{ transform: `translate(${pan.x}px,${pan.y}px) scale(${zoom})` }} onMouseDown={e => { if (e.target === e.currentTarget) startDrag('canvas', '', e, pan.x, pan.y); }}>
          
          {/* ═══ LIFECYCLE VIEW - Column headers only ═══ */}
          {lifecycleView && (() => {
            const colPx = CANVAS_W / 4;
            const dotColors: Record<Stage, string> = { Acquisition: '#0EA5E9', Retention: '#10B981', Upgradation: '#F59E0B', Offboarding: '#64748B' };
            return (
              <>
                <div className="absolute top-0 left-0 right-0 h-[64px] z-20 flex pointer-events-none bg-slate-50/90 backdrop-blur-sm border-b border-gray-200">
                  {STAGES.map((stage, i) => {
                    const dot = dotColors[stage];
                    const colDivs = lifecycleDivisions.filter(d => d.lifecycleStage === stage);
                    return (
                      <div key={stage} className={`absolute h-[64px] flex items-center gap-3 px-6 pointer-events-auto overflow-hidden ${i < 3 ? 'border-r border-gray-200' : ''}`} style={{ left: i * colPx, width: colPx }}>
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: dot }} />
                        <span className="text-[20px] font-semibold text-slate-900 tracking-[-0.01em] flex-1 whitespace-nowrap overflow-hidden text-ellipsis">Customer {stage}</span>
                        {colDivs.length > 0 && <span className="text-[13px] font-medium text-slate-400 mr-2 whitespace-nowrap">{colDivs.length} div{colDivs.length !== 1 ? 's' : ''}</span>}
                        <button onClick={(e) => { e.stopPropagation(); const col = LIFECYCLE_COLUMNS[stage]; const colCenterCanvasX = (col.minFrac + col.maxFrac) / 2 * CANVAS_W; const existingCount = lifecycleDivisions.filter(d => d.lifecycleStage === stage).length; const spawnY = 110 + existingCount * 260; setModal({ type: 'addDiv', spawnX: colCenterCanvasX, spawnY, lifecycleStage: stage }); }} className="w-8 h-8 rounded-full bg-emerald-500 border-none flex items-center justify-center cursor-pointer text-white text-[22px] leading-none shadow-md shrink-0 transition-transform active:scale-95 hover:bg-emerald-400" title={`Add Division to ${stage}`}>+</button>
                      </div>
                    );
                  })}
                </div>
                {[1, 2, 3].map(i => <div key={i} className="absolute top-[64px] bottom-[-2000px] w-px bg-gray-200/80 z-[4] pointer-events-none shadow-sm" style={{ left: i * colPx, height: CANVAS_H * 3 }} />)}
              </>
            );
          })()}
          <svg className="absolute inset-0 pointer-events-none overflow-visible" width={CANVAS_W} height={CANVAS_H}>
            <defs>
              <marker id="arrow-share" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#0EA5E9" opacity="0.8" /></marker>
              <marker id="arrow-ingest" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#10B981" opacity="0.8" /></marker>
              <marker id="arrow-both" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#8B5CF6" opacity="0.8" /></marker>
              <marker id="arrow-gray" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#CBD5E1" opacity="0.8" /></marker>
              <marker id="arrow-alert" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto"><path d="M0,0 L0,6 L6,3 z" fill="#EF4444" opacity="0.9" /></marker>
            </defs>
            {/* Division-to-Org edges - only in graph view */}
            {!lifecycleView && visibleDivisions.map(d => (
              <g key={`eg-${d.id}`} opacity={dimOpacity(d.id)}>
                <line x1={orgPos.x} y1={orgPos.y} x2={d.x} y2={d.y} stroke="#CBD5E1" strokeWidth={2} markerEnd="url(#arrow-gray)" />
                <rect x={(orgPos.x + d.x) / 2 - 28} y={(orgPos.y + d.y) / 2 - 8} width={56} height={16} rx={4} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
                <text x={(orgPos.x + d.x) / 2} y={(orgPos.y + d.y) / 2 + 4} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="inherit">HAS DIVISION</text>
              </g>
            ))}
            {visibleSuppliers.map(s => {
              const d = visibleDivisions.find(x => x.id === s.divisionId);
              if (!d) return null;
              const clr = arrowColor(s.piiFlow);
              const mId = s.piiFlow === 'share' ? 'url(#arrow-share)' : s.piiFlow === 'ingest' ? 'url(#arrow-ingest)' : 'url(#arrow-both)';
              const label = s.piiTypes?.slice(0, 2).join(', ') ?? 'SUPPLIES TO';
              const sx = lifecycleView ? (s.lx ?? s.x) : s.x;
              const sy = lifecycleView ? (s.ly ?? s.y) : s.y;
              const dx = lifecycleView ? (d.lx ?? d.x) : d.x;
              const dy = lifecycleView ? (d.ly ?? d.y) : d.y;
              const mx = (dx + sx) / 2, my = (dy + sy) / 2;
              return (
                <g key={`es-${s.id}`} opacity={dimOpacity(s.id)}>
                  <line x1={dx} y1={dy} x2={sx} y2={sy} stroke={clr} strokeWidth={1.5} opacity={0.55} markerEnd={mId} />
                  <rect x={mx - 30} y={my - 9} width={60} height={18} rx={5} fill="#fff" stroke={clr} strokeWidth={1} opacity={0.9} />
                  <text x={mx} y={my + 4} textAnchor="middle" fontSize={8} fill={clr} fontFamily="inherit" fontWeight="600">{label}</text>
                </g>
              );
            })}
            {visibleSystems.map(sys => {
              const sysX = lifecycleView ? (sys.lx ?? sys.x) : sys.x;
              const sysY = lifecycleView ? (sys.ly ?? sys.y) : sys.y;
              if (sys.linkedSupplierId) {
                const sup = visibleSuppliers.find(x => x.id === sys.linkedSupplierId);
                if (!sup) return null;
                const supX = lifecycleView ? (sup.lx ?? sup.x) : sup.x;
                const supY = lifecycleView ? (sup.ly ?? sup.y) : sup.y;
                const mx = (supX + sysX) / 2, my = (supY + sysY) / 2;
                const edgeColor = sys.hasStageDiscrepancy ? '#EF4444' : '#64748B';
                const edgeDash = sys.hasStageDiscrepancy ? '4,3' : '5,3';
                return (
                  <g key={`esys-${sys.id}`} opacity={dimOpacity(sys.id)}>
                    {sys.hasStageDiscrepancy && <line x1={supX} y1={supY} x2={sysX} y2={sysY} stroke="#EF4444" strokeWidth={6} opacity={0.12} />}
                    <line x1={supX} y1={supY} x2={sysX} y2={sysY} stroke={edgeColor} strokeWidth={1.5} strokeDasharray={edgeDash} markerEnd={sys.hasStageDiscrepancy ? 'url(#arrow-alert)' : 'url(#arrow-gray)'} />
                    <rect x={mx - 24} y={my - 9} width={48} height={18} rx={5} fill="#fff" stroke={edgeColor} strokeWidth={1} opacity={0.95} />
                    <text x={mx} y={my + 4} textAnchor="middle" fontSize={9} fill={edgeColor} fontFamily="inherit" fontWeight="600">{sys.hasStageDiscrepancy ? 'GAP !' : 'USES SYS'}</text>
                  </g>
                );
              }
              const d = visibleDivisions.find(x => x.id === sys.divisionId);
              if (!d) return null;
              const dx = lifecycleView ? (d.lx ?? d.x) : d.x;
              const dy = lifecycleView ? (d.ly ?? d.y) : d.y;
              return (
                <g key={`esys-${sys.id}`} opacity={dimOpacity(sys.id)}>
                  <line x1={dx} y1={dy} x2={sysX} y2={sysY} stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="5,3" markerEnd="url(#arrow-gray)" />
                  <rect x={(dx + sysX) / 2 - 22} y={(dy + sysY) / 2 - 8} width={44} height={16} rx={4} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
                  <text x={(dx + sysX) / 2} y={(dy + sysY) / 2 + 4} textAnchor="middle" fontSize={9} fill="#94A3B8" fontFamily="inherit">INTERNAL</text>
                </g>
              );
            })}
          </svg>

          {/* Organization node - only in graph view */}
          {!lifecycleView && (
            <div className="absolute w-16 h-16 z-10" style={{ left: orgPos.x - ORG_R, top: orgPos.y - ORG_R }} onMouseEnter={() => setHoveredId('org')} onMouseLeave={() => setHoveredId(null)} onMouseDown={e => startDrag('org', 'org', e, orgPos.x, orgPos.y)}>
              <div className={`w-16 h-16 rounded-full bg-sky-500 border-[3px] border-sky-600 shadow-[0_4px_20px_rgba(14,165,233,0.35)] flex items-center justify-center transition-[transform] duration-150 ease-in-out cursor-move ${hoveredId === 'org' ? 'scale-[1.08]' : 'scale-100'}`}>
                <Building2 size={26} color="#fff" strokeWidth={1.8} />
              </div>
              <div className="absolute top-full left-1/2 -translate-x-1/2 text-center mt-[7px] pointer-events-none whitespace-nowrap">
                <div className="text-xs font-bold text-slate-900">{user?.org_name || 'Organization'}</div>
                <div className="text-[10px] text-slate-400">Organization</div>
              </div>
              {hoveredId === 'org' && <div title="Add Division" onClick={e => { e.stopPropagation(); setModal({ type: 'addDiv' }); }} className="absolute -top-3 -right-3 w-[22px] h-[22px] rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.45)] z-20 text-white text-[17px] leading-none">+</div>}
            </div>
          )}

          {visibleDivisions.map(div => {
            const supCount = suppliers.filter(s => s.divisionId === div.id).length;
            const sysCount = systems.filter(s => s.divisionId === div.id).length;
            const isHov = hoveredId === div.id;
            const dx = lifecycleView ? (div.lx ?? div.x) : div.x;
            const dy = lifecycleView ? (div.ly ?? div.y) : div.y;
            return (
              <div key={div.id} className="absolute w-12 h-12 z-10 transition-[opacity] duration-[250ms]" style={{ left: dx - DIV_R, top: dy - DIV_R, opacity: dimOpacity(div.id) }} onMouseEnter={() => setHoveredId(div.id)} onMouseLeave={() => setHoveredId(null)} onMouseDown={e => startDrag('div', div.id, e, dx, dy)} onClick={e => handleNodeClick(e, div.id, () => setModal({ type: 'divInfo', divisionId: div.id }))}>
                <div className={`w-12 h-12 rounded-full bg-violet-500 border-2 border-violet-600 shadow-[0_4px_14px_rgba(139,92,246,0.3)] flex items-center justify-center transition-[transform] duration-150 ease-in-out cursor-pointer ${isHov ? 'scale-[1.08]' : 'scale-100'}`}>
                  <Briefcase size={20} color="#fff" strokeWidth={1.8} />
                </div>
                <div className="absolute top-full left-1/2 -translate-x-1/2 text-center mt-[7px] pointer-events-none whitespace-nowrap">
                  <div className="text-[11px] font-bold text-slate-900">{div.name}</div>
                  <div className="text-[10px] text-slate-400">Div · {supCount} sup{sysCount > 0 ? ` · ${sysCount} sys` : ''}</div>
                </div>
                {isHov && <div title="Add Asset" onClick={e => { e.stopPropagation(); setModal({ type: 'chooseAsset', divisionId: div.id }); }} className="absolute -top-3 -right-3 w-[22px] h-[22px] rounded-full bg-emerald-500 flex items-center justify-center cursor-pointer shadow-[0_2px_8px_rgba(16,185,129,0.45)] z-20 text-white text-[17px] leading-none">+</div>}
              </div>
            );
          })}

          {visibleSuppliers.map(sup => {
            const outerR = supOuterR(sup.piiVolume);
            const size = outerR * 2 + piiStrokeW(sup.piiVolume) + 4;
            const [stageBg, stageClr] = STAGE_CLR[sup.stage];
            const label = sup.name.length > 14 ? sup.name.slice(0, 13) + '…' : sup.name;
            const sx = lifecycleView ? (sup.lx ?? sup.x) : sup.x;
            const sy = lifecycleView ? (sup.ly ?? sup.y) : sup.y;
            return (
              <div key={sup.id} className="absolute z-10 cursor-pointer transition-[opacity] duration-[250ms]" style={{ left: sx - size / 2, top: sy - size / 2, width: size, height: size, opacity: dimOpacity(sup.id) }} onMouseEnter={() => setHoveredId(sup.id)} onMouseLeave={() => setHoveredId(null)} onMouseDown={e => startDrag('sup', sup.id, e, sx, sy)} onClick={e => handleNodeClick(e, sup.id, () => setModal(xrayMode ? { type: 'xrayInfo', supplierId: sup.id } : { type: 'supInfo', supplierId: sup.id }))}>
                <div className={`transition-[transform] duration-150 ease-in-out ${hoveredId === sup.id ? 'scale-[1.1]' : 'scale-100'}`}>
                  <SupCircle riskScore={sup.riskScore} piiVolume={sup.piiVolume} size={size} />
                </div>
                {sup.hasTruthGap && (
                  <div className="absolute -top-1.5 -right-1.5 z-20">
                    <div className="relative inline-flex">
                      <div className="absolute -inset-0.5 rounded-full bg-red-500 opacity-25 [animation:ping_1.2s_ease_infinite]" />
                      <AlertTriangle size={14} color="#EF4444" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 text-center mt-1 pointer-events-none whitespace-nowrap">
                  <div className="text-[10px] font-bold text-slate-900 max-w-[90px] overflow-hidden text-ellipsis">{label}</div>
                  <span className="text-[9px] font-semibold px-[5px] py-px rounded-[3px] inline-block mt-0.5" style={{ color: stageClr, backgroundColor: stageBg }}>{sup.stage}</span>
                  <div className="flex gap-[3px] mt-1 justify-center flex-nowrap">
                    {sup.piiFlow && (() => { const piiMeta = { share: ['→', '#0EA5E9', '#EFF6FF'], ingest: ['←', '#10B981', '#ECFDF5'], both: ['⇄', '#8B5CF6', '#F5F3FF'] }[sup.piiFlow]; return <span className="text-[8px] font-bold px-[5px] py-px rounded-[3px]" style={{ color: piiMeta[1], backgroundColor: piiMeta[2] }}>{piiMeta[0]}</span>; })()}
                    {sup.contractEnd && <span className="text-[8px] text-slate-500 bg-slate-100 px-[5px] py-px rounded-[3px]">📅 {sup.contractEnd.slice(0, 7)}</span>}
                    {sup.frequency && <span className="text-[8px] text-violet-500 bg-violet-50 px-[5px] py-px rounded-[3px]">{sup.frequency}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {visibleSystems.map(sys => {
            const isHov = hoveredId === sys.id;
            const SysIcon = sys.type === 'crm' ? Smartphone : Database;
            const [stageBg, stageClr] = sys.stage ? STAGE_CLR[sys.stage] : ['#F1F5F9', '#64748B'];
            const sx = lifecycleView ? (sys.lx ?? sys.x) : sys.x;
            const sy = lifecycleView ? (sys.ly ?? sys.y) : sys.y;
            return (
              <div key={sys.id} className="absolute w-[68px] h-11 z-10 cursor-pointer transition-[opacity] duration-[250ms]" style={{ left: sx - 34, top: sy - 22, opacity: dimOpacity(sys.id) }} onMouseEnter={() => setHoveredId(sys.id)} onMouseLeave={() => setHoveredId(null)} onMouseDown={e => startDrag('sys', sys.id, e, sx, sy)} onClick={e => handleNodeClick(e, sys.id, () => setModal({ type: 'sysInfo', systemId: sys.id } as any))}>
                <div className={`w-[68px] h-11 rounded-[10px] flex items-center justify-center transition-all duration-150 ease-in-out border-2 ${sys.hasStageDiscrepancy ? 'bg-[#7F1D1D] shadow-[0_2px_14px_rgba(239,68,68,0.4)]' : 'bg-slate-500 shadow-[0_2px_10px_rgba(100,116,139,0.3)]'} ${isHov ? 'scale-[1.06]' : 'scale-100'}`} style={{ borderColor: sys.hasStageDiscrepancy ? '#EF4444' : isHov ? '#94A3B8' : '#475569' }}>
                  <SysIcon size={18} color={sys.hasStageDiscrepancy ? '#FCA5A5' : '#fff'} strokeWidth={1.7} />
                </div>
                {sys.hasStageDiscrepancy && (
                  <div className="absolute -top-2 -right-2 z-[30]" onClick={e => { e.stopPropagation(); setModal({ type: 'sysReasoning', systemId: sys.id } as any); }}>
                    <div className="relative inline-flex cursor-pointer">
                      <div className="absolute -inset-[3px] rounded-full bg-red-500 opacity-25 [animation:ping_1.2s_ease_infinite]" />
                      <AlertTriangle size={16} color="#EF4444" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                <div className="absolute top-full left-1/2 -translate-x-1/2 text-center mt-1 pointer-events-none whitespace-nowrap">
                  <div className={`text-[10px] font-bold max-w-[90px] overflow-hidden text-ellipsis ${sys.hasStageDiscrepancy ? 'text-red-600' : 'text-[#0F172A]'}`}>{sys.name}</div>
                  {sys.stage && <span className="text-[9px] font-semibold px-[5px] py-px rounded-[3px] inline-block mt-0.5" style={{ color: stageClr, backgroundColor: stageBg }}>{sys.stage}</span>}
                </div>
              </div>
            );
          })}

          {divisions.length === 0 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <Network size={48} color="#CBD5E1" className="block mx-auto mb-3" />
              <div className="text-base font-semibold text-slate-500 mb-1.5">Start building your graph</div>
              <div className="text-[13px] text-slate-400 max-w-[300px] leading-normal">Click + on the organization node to add your first division</div>
            </div>
          )}
        </div>

        {/* Legend - show only in graph view */}
        {!lifecycleView && (
          <div className="absolute bottom-6 left-6 z-[101]">
            <button onClick={() => setShowLegend(v => !v)} className={`h-8 px-[14px] border border-slate-200 rounded-lg cursor-pointer text-xs font-semibold flex items-center gap-[5px] shadow-[0_1px_4px_rgba(0,0,0,0.07)] ${showLegend ? 'bg-violet-50 text-violet-500' : 'bg-white text-slate-500'}`}>
              <Eye size={13} />{showLegend ? 'Hide Legend' : 'Show Legend'}
            </button>
          </div>
        )}

        {!lifecycleView && showLegend && (
          <div className="absolute bottom-16 left-6 bg-white/95 border border-slate-200 rounded-xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.06)] w-[200px] z-[100] pointer-events-none">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2.5">Legend</div>
            <div className="text-[11px] font-semibold text-slate-600 mb-1.5">Node Types</div>
            {[['#0EA5E9', 'Organization', 12], ['#8B5CF6', 'Division', 10]].map(([c, l, sz]) => (
              <div key={l as string} className="flex items-center gap-[7px] mb-1">
                <div style={{ width: sz as number, height: sz as number, borderRadius: '50%', backgroundColor: c as string, flexShrink: 0 }} />
                <span className="text-[11px] text-slate-500">{l as string}</span>
              </div>
            ))}
            <div className="flex items-center gap-[7px] mb-1"><svg width={14} height={14}><circle cx={7} cy={7} r={4} fill="#94A3B8" stroke="#fff" strokeWidth={1.5} /><circle cx={7} cy={7} r={6.5} fill="none" stroke="#EF4444" strokeWidth={2.5} opacity={0.35} /></svg><span className="text-[11px] text-slate-500">Supplier</span></div>
            <div className="flex items-center gap-[7px] mb-3"><div className="w-4 h-2.5 rounded-[3px] bg-slate-500 shrink-0" /><span className="text-[11px] text-slate-500">Internal System</span></div>
            <div className="text-[11px] font-semibold text-slate-600 mb-1.5">PII Flow Direction</div>
            {[['#0EA5E9', 'Share (Org → Sup)'], ['#10B981', 'Ingest (Sup → Org)'], ['#8B5CF6', 'Bidirectional']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-[7px] mb-1"><div style={{ width: 14, height: 2, backgroundColor: c, flexShrink: 0 }} /><span className="text-[11px] text-slate-500">{l}</span></div>
            ))}
            <div className="text-[11px] font-semibold text-slate-600 mb-1.5 mt-2.5">Supplier Score</div>
            {[['#10B981', 'Score ≥ 50 (Low)'], ['#EF4444', 'Score < 50 (Critical)'], ['#94A3B8', 'Not Assessed']].map(([c, l]) => (
              <div key={l} className="flex items-center gap-[7px] mb-1"><div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: c, flexShrink: 0 }} /><span className="text-[11px] text-slate-500">{l}</span></div>
            ))}
            <div className="flex items-center gap-[7px] mt-2"><AlertTriangle size={11} color="#EF4444" /><span className="text-[11px] text-slate-500">Truth Gap (PII mismatch)</span></div>
            <div className="flex items-center gap-[7px] mt-1"><div className="w-4 h-2.5 rounded-[3px] bg-[#7F1D1D] border border-red-500 shrink-0" /><span className="text-[11px] text-slate-500">Stage Discrepancy (System)</span></div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/* ── Modals ──────────────────────────────────── */}
      {modal !== null && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center" onClick={() => setModal(null)}>
          <div className={`absolute inset-0 transition-[background-color] duration-200 ${modal.type === 'xrayInfo' ? 'bg-black/45 backdrop-blur-[2px]' : 'bg-black/20'}`} />

          {/* ── CHOOSE ASSET TYPE ─────────────────── */}
          {modal.type === 'chooseAsset' && (
            <div onClick={e => e.stopPropagation()} className="relative w-[380px] bg-white rounded-2xl p-7 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
              <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
              <div className="text-lg font-bold text-[#0F172A] mb-1.5">Add to Division</div>
              <div className="text-[13px] text-slate-400 mb-6">What would you like to add?</div>
              <div className="grid grid-cols-2 gap-3.5">
                <button onClick={() => setModal({ type: 'addSup', divisionId: modal.divisionId })} className="py-5 px-4 rounded-xl border border-slate-200 bg-violet-50 cursor-pointer text-center">
                  <div className="w-10 h-10 rounded-full bg-violet-500 flex items-center justify-center mx-auto mb-2.5"><Briefcase size={18} color="#fff" /></div>
                  <div className="text-[13px] font-bold text-[#0F172A]">Add Supplier</div>
                  <div className="text-[11px] text-slate-400 mt-[3px]">External vendor</div>
                </button>
                <button onClick={() => setModal({ type: 'addSys', divisionId: modal.divisionId })} className="py-5 px-4 rounded-xl border border-slate-200 bg-slate-50 cursor-pointer text-center">
                  <div className="w-10 h-10 rounded-[10px] bg-slate-500 flex items-center justify-center mx-auto mb-2.5"><Database size={18} color="#fff" /></div>
                  <div className="text-[13px] font-bold text-[#0F172A]">Add System</div>
                  <div className="text-[11px] text-slate-400 mt-[3px]">Internal CRM/App</div>
                </button>
              </div>
            </div>
          )}

          {/* ── ADD DIVISION ──────────────────────── */}
          {modal.type === 'addDiv' && (
            <div onClick={e => e.stopPropagation()} className="relative w-[340px] bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
              <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
              <div className="text-lg font-bold text-[#0F172A] mb-1">Add Division</div>
              <div className="text-[13px] text-slate-400 mb-1">Add a department or business unit</div>
              {modal.lifecycleStage && (
                <div className="mb-4">
                  <span className="text-xs font-semibold py-[3px] px-2.5 rounded-[6px]" style={{ color: STAGE_CLR[modal.lifecycleStage][1], backgroundColor: STAGE_CLR[modal.lifecycleStage][0], border: `1px solid ${STAGE_CLR[modal.lifecycleStage][1]}33` }}>Customer {modal.lifecycleStage}</span>
                </div>
              )}
              <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Division Name *</label>
              <input autoFocus value={divName} onChange={e => setDivName(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') addDivision(); if (e.key === 'Escape') setModal(null); }} placeholder="e.g., Technical Dept" className="w-full box-border border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] outline-none text-slate-700" />
              <div className="flex justify-end gap-2.5 mt-5">
                <button onClick={() => { setModal(null); setDivName(''); }} className="px-4 py-[9px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer">Cancel</button>
                <button onClick={addDivision} disabled={!divName.trim()} className={`px-[18px] py-[9px] text-[13px] font-semibold border-none rounded-lg text-white ${divName.trim() ? 'bg-sky-500 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'}`}>Add Division</button>
              </div>
            </div>
          )}

          {/* ── ADD SUPPLIER ──────────────────────── */}
          {modal.type === 'addSup' && (() => {
            const isFormValid = 
              supForm.name.trim() !== '' &&
              isValidEmail(supForm.email) &&
              supForm.stage !== '' &&
              (!supForm.phone || isValidMobile(supForm.phone)) &&
              (!supForm.gst || isValidGST(supForm.gst)) &&
              (!supForm.pan || isValidPAN(supForm.pan)) &&
              libInternalContacts[0].email !== '' && isValidEmail(libInternalContacts[0].email) &&
              libSupplierContacts[0].email !== '' && isValidEmail(libSupplierContacts[0].email);
            return (
            <div onClick={e => e.stopPropagation()} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
              <button onClick={() => { setModal(null); resetLibContacts(); }} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
              <div className="text-lg font-bold text-[#0F172A] mb-2.5">Add Supplier</div>
              {addSupDiv && <div className="mb-3"><span className="bg-indigo-50 text-violet-500 text-xs font-semibold py-[3px] px-2.5 rounded-[6px]">{addSupDiv.name}</span></div>}
              
              {/* Supplier Stage */}
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-[#0F172A] mb-2">Supplier Stage <span className="text-red-500">*</span></label>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map(s => { const sel = supForm.stage === s; const [bg, clr] = STAGE_CLR[s]; return <button key={s} onClick={() => setSupForm(p => ({ ...p, stage: p.stage === s ? '' : s }))} className="py-2.5 px-3.5 rounded-[10px] text-[13px] cursor-pointer transition-all duration-150 text-center" style={{ fontWeight: sel ? 700 : 500, backgroundColor: sel ? bg : '#F8FAFC', color: sel ? clr : '#64748B', border: `${sel ? 2 : 1}px solid ${sel ? clr : '#E2E8F0'}` }}>{s}</button>; })}
                </div>
              </div>
              
              {/* Lifecycle Mapping */}
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] px-3.5 py-3 mb-4">
                <div className="flex items-center gap-1.5 mb-2.5">
                  <div className="w-[3px] h-[13px] rounded-[2px] bg-violet-500" />
                  <label className="text-[13px] font-bold text-[#0F172A]">Lifecycle Mapping</label>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {STAGES.map(s => { const checked = supForm.lifecycles.includes(s); const [bg, clr] = STAGE_CLR[s]; const dotColors: Record<Stage, string> = { Acquisition: '#0EA5E9', Retention: '#10B981', Upgradation: '#F59E0B', Offboarding: '#64748B' }; return <label key={s} className="flex items-center gap-2 py-2 px-2.5 rounded-lg cursor-pointer" style={{ border: `1px solid ${checked ? clr : '#E2E8F0'}`, backgroundColor: checked ? bg : '#fff' }}><div className="w-4 h-4 rounded flex items-center justify-center shrink-0" style={{ border: `2px solid ${checked ? clr : '#CBD5E1'}`, backgroundColor: checked ? clr : '#fff' }} onClick={() => setSupForm(p => { const lcs = p.lifecycles.includes(s) ? p.lifecycles.filter(l => l !== s) : [...p.lifecycles, s]; return { ...p, lifecycles: lcs }; })}>{checked && <CheckCircle2 size={10} color="#fff" strokeWidth={3} />}</div><div className="flex items-center gap-[5px]"><div className="w-[7px] h-[7px] rounded-full" style={{ backgroundColor: dotColors[s] }} /><span className="text-xs" style={{ fontWeight: checked ? 600 : 400, color: checked ? clr : '#64748B' }}>Customer {s}</span></div></label>; })}
                </div>
              </div>
              
              {/* Basic Fields - Supplier Name */}
              <div className="mb-3">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Supplier Name <span className="text-red-500">*</span></label>
                <input value={supForm.name} onChange={e => setSupForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., XYZ Corporation" className="w-full box-border border border-slate-200 rounded-lg py-[9px] px-3 text-[13px] outline-none text-slate-700 focus:ring-2 focus:ring-sky-200" />
              </div>
              
              {/* Email with validation */}
              <div className="mb-3">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Email <span className="text-red-500">*</span></label>
                <div className="relative">
                  <input value={supForm.email} onChange={e => setSupForm(p => ({ ...p, email: e.target.value }))} placeholder="contact@company.com" className={fieldClass(isValidEmail(supForm.email), supForm.email)} />
                  {supForm.email && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidEmail(supForm.email) ? <Check size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-400" />}
                    </span>
                  )}
                </div>
                {supForm.email && !isValidEmail(supForm.email) && <p className="text-xs text-red-500 mt-1">Invalid email format</p>}
              </div>
              
              {/* Contact Person */}
              <div className="mb-3">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Contact Person</label>
                <input value={supForm.contact} onChange={e => setSupForm(p => ({ ...p, contact: e.target.value }))} placeholder="Full name" className="w-full box-border border border-slate-200 rounded-lg py-[9px] px-3 text-[13px] outline-none text-slate-700 focus:ring-2 focus:ring-sky-200" />
              </div>
              
              {/* Phone with validation */}
              <div className="mb-3">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Phone (10-digit Indian mobile)</label>
                <div className="relative">
                  <input value={supForm.phone} onChange={e => setSupForm(p => ({ ...p, phone: e.target.value }))} placeholder="9876543210" className={fieldClass(isValidMobile(supForm.phone), supForm.phone)} />
                  {supForm.phone && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2">
                      {isValidMobile(supForm.phone) ? <Check size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-400" />}
                    </span>
                  )}
                </div>
                {supForm.phone && !isValidMobile(supForm.phone) && <p className="text-xs text-red-500 mt-1">Must be 10 digits starting with 6-9</p>}
              </div>
              
              {/* Website */}
              <div className="mb-3">
                <label className="block text-[13px] font-semibold text-slate-700 mb-1">Website</label>
                <input value={supForm.website} onChange={e => setSupForm(p => ({ ...p, website: e.target.value }))} placeholder="https://example.com" className="w-full box-border border border-slate-200 rounded-lg py-[9px] px-3 text-[13px] outline-none text-slate-700 focus:ring-2 focus:ring-sky-200" />
              </div>
              
              {/* GST and PAN with validation */}
              <div className="grid grid-cols-2 gap-4 mb-3.5">
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">GST Number</label>
                  <div className="relative">
                    <input value={supForm.gst} onChange={e => setSupForm(p => ({ ...p, gst: e.target.value.toUpperCase() }))} placeholder="22AAAAA0000A1Z5" className={fieldClass(isValidGST(supForm.gst), supForm.gst)} />
                    {supForm.gst && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidGST(supForm.gst) ? <Check size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-400" />}
                      </span>
                    )}
                  </div>
                  {supForm.gst && !isValidGST(supForm.gst) && <p className="text-xs text-red-500 mt-1">Invalid GST format</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1">PAN Number</label>
                  <div className="relative">
                    <input value={supForm.pan} onChange={e => setSupForm(p => ({ ...p, pan: e.target.value.toUpperCase() }))} placeholder="ABCDE1234F" className={fieldClass(isValidPAN(supForm.pan), supForm.pan)} />
                    {supForm.pan && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2">
                        {isValidPAN(supForm.pan) ? <Check size={16} className="text-emerald-500" /> : <AlertCircle size={16} className="text-red-400" />}
                      </span>
                    )}
                  </div>
                  {supForm.pan && !isValidPAN(supForm.pan) && <p className="text-xs text-red-500 mt-1">Invalid PAN format</p>}
                </div>
              </div>
              
              {/* Contract Period */}
              <div className="border-t border-slate-100 pt-3.5 mb-3.5">
                <div className="flex items-center gap-1.5 mb-2.5"><div className="w-[3px] h-[13px] rounded-[2px] bg-sky-500" /><label className="text-[13px] font-bold text-[#0F172A]">Contract Period</label></div>
                <div className="grid grid-cols-2 gap-2.5">
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label><input type="date" value={supForm.contractStart} onChange={e => setSupForm(p => ({ ...p, contractStart: e.target.value }))} className="w-full box-border border border-slate-200 rounded-lg py-[9px] px-3 text-[13px] outline-none bg-white cursor-pointer" style={{ color: supForm.contractStart ? '#334155' : '#94A3B8' }} /></div>
                  <div><label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label><input type="date" value={supForm.contractEnd} onChange={e => setSupForm(p => ({ ...p, contractEnd: e.target.value }))} min={supForm.contractStart || undefined} className="w-full box-border border border-slate-200 rounded-lg py-[9px] px-3 text-[13px] outline-none bg-white cursor-pointer" style={{ color: supForm.contractEnd ? '#334155' : '#94A3B8' }} /></div>
                </div>
              </div>
              
              {/* Stakeholder Matrix - Dynamic Contacts */}
              <div className="border-t border-slate-100 pt-3.5 mb-3.5">
                <div className="flex items-center gap-1.5 mb-3"><div className="w-[3px] h-[13px] rounded-[2px] bg-violet-500" /><label className="text-[13px] font-bold text-[#0F172A]">Stakeholder Matrix <span className="text-red-500">*</span></label></div>
                <div className="grid grid-cols-2 gap-4">
                  {/* Internal Contacts */}
                  <div className="pr-3 border-r border-slate-100">
                    <p className="text-xs font-bold text-sky-600 uppercase tracking-wide mb-3">Internal</p>
                    <div className="flex flex-col gap-3">
                      {libInternalContacts.map(contact => (
                        <div key={contact.id}>
                          {contact.isDefault ? (
                            <span className="text-xs font-semibold text-sky-600 bg-blue-50 px-2 py-0.5 rounded mb-1.5 inline-block">{contact.label}</span>
                          ) : (
                            <input type="text" value={contact.label} onChange={e => updateLibContact('internal', contact.id, 'label', e.target.value)} placeholder="Role label (e.g. Finance, Legal)" className="text-xs font-semibold text-slate-600 mb-1 border-none bg-transparent outline-none w-full" />
                          )}
                          <div className="flex gap-1.5 items-center">
                            <div className="relative flex-1">
                              <input type="email" value={contact.email} onChange={e => updateLibContact('internal', contact.id, 'email', e.target.value)} placeholder="email@company.com" className={`w-full border rounded-lg text-xs py-2 px-2.5 outline-none focus:ring-1 pr-8 ${contact.email && !isValidEmail(contact.email) ? 'border-red-300 focus:ring-red-200' : contact.email && isValidEmail(contact.email) ? 'border-emerald-300 focus:ring-emerald-200' : 'border-slate-200 focus:ring-sky-400'}`} />
                              {contact.email && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                  {isValidEmail(contact.email) ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-red-400" />}
                                </span>
                              )}
                            </div>
                            {!contact.isDefault && (
                              <button type="button" onClick={() => removeLibContact('internal', contact.id)} className="text-slate-300 hover:text-red-400 text-lg font-bold bg-transparent border-none cursor-pointer px-1">×</button>
                            )}
                          </div>
                          {contact.isDefault && contact.email && !isValidEmail(contact.email) && <p className="text-[10px] text-red-500 mt-0.5">Invalid email</p>}
                        </div>
                      ))}
                      <button type="button" onClick={() => addLibContact('internal')} className="flex items-center gap-1 text-xs text-sky-500 border border-dashed border-sky-200 rounded-lg px-2.5 py-1.5 w-full justify-center hover:bg-blue-50 cursor-pointer bg-transparent mt-1">+ Add Contact</button>
                    </div>
                  </div>
                  
                  {/* Supplier Contacts */}
                  <div className="pl-3">
                    <p className="text-xs font-bold text-amber-600 uppercase tracking-wide mb-3">Supplier</p>
                    <div className="flex flex-col gap-3">
                      {libSupplierContacts.map(contact => (
                        <div key={contact.id}>
                          {contact.isDefault ? (
                            <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded mb-1.5 inline-block">{contact.label}</span>
                          ) : (
                            <input type="text" value={contact.label} onChange={e => updateLibContact('supplier', contact.id, 'label', e.target.value)} placeholder="Role label (e.g. Finance, Legal)" className="text-xs font-semibold text-slate-600 mb-1 border-none bg-transparent outline-none w-full" />
                          )}
                          <div className="flex gap-1.5 items-center">
                            <div className="relative flex-1">
                              <input type="email" value={contact.email} onChange={e => updateLibContact('supplier', contact.id, 'email', e.target.value)} placeholder="email@supplier.com" className={`w-full border rounded-lg text-xs py-2 px-2.5 outline-none focus:ring-1 pr-8 ${contact.email && !isValidEmail(contact.email) ? 'border-red-300 focus:ring-red-200' : contact.email && isValidEmail(contact.email) ? 'border-emerald-300 focus:ring-emerald-200' : 'border-slate-200 focus:ring-sky-400'}`} />
                              {contact.email && (
                                <span className="absolute right-2 top-1/2 -translate-y-1/2">
                                  {isValidEmail(contact.email) ? <Check size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-red-400" />}
                                </span>
                              )}
                            </div>
                            {!contact.isDefault && (
                              <button type="button" onClick={() => removeLibContact('supplier', contact.id)} className="text-slate-300 hover:text-red-400 text-lg font-bold bg-transparent border-none cursor-pointer px-1">×</button>
                            )}
                          </div>
                          {contact.isDefault && contact.email && !isValidEmail(contact.email) && <p className="text-[10px] text-red-500 mt-0.5">Invalid email</p>}
                        </div>
                      ))}
                      <button type="button" onClick={() => addLibContact('supplier')} className="flex items-center gap-1 text-xs text-amber-500 border border-dashed border-amber-200 rounded-lg px-2.5 py-1.5 w-full justify-center hover:bg-amber-50 cursor-pointer bg-transparent mt-1">+ Add Contact</button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* PII Configuration Notice */}
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-3.5 py-3 mb-1">
                <div className="flex gap-2 items-start"><AlertTriangle size={15} color="#F59E0B" className="shrink-0 mt-px" /><div><div className="text-[13px] font-bold text-amber-800 mb-0.5">PII Configuration — Locked</div><div className="text-xs text-amber-800 leading-normal">Data sharing configuration is disabled until the initial risk assessment and AI scan are complete.</div></div></div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button onClick={() => { setModal(null); resetLibContacts(); }} className="px-4 py-[9px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer hover:bg-slate-50">Cancel</button>
                <button onClick={addSupplier} disabled={!isFormValid} className={`px-[18px] py-[9px] text-[13px] font-semibold border-none rounded-lg text-white ${isFormValid ? 'bg-sky-500 cursor-pointer hover:bg-sky-600' : 'bg-slate-300 cursor-not-allowed'}`}>Add Supplier →</button>
              </div>
            </div>
            );
          })()}

          {/* ── ADD SYSTEM ────────────────────────── */}
          {modal.type === 'addSys' && (() => {
            const PII_OPTIONS = ['Name', 'Email', 'Phone', 'Aadhar', 'PAN', 'Balance'];
            const divSuppliers = addSysDiv ? suppliers.filter(s => s.divisionId === addSysDiv.id) : [];
            const canSubmit = !!(sysForm.name && sysForm.stage && sysForm.linkedSupplierId);
            const togglePii = (p: string) => setSysForm(prev => ({ ...prev, authorizedPii: prev.authorizedPii.includes(p) ? prev.authorizedPii.filter((x: string) => x !== p) : [...prev.authorizedPii, p] }));
            return (
              <div onClick={e => e.stopPropagation()} className="relative w-[460px] max-h-[88vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
                <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
                <div className="text-lg font-bold text-[#0F172A] mb-1">Register Internal System</div>
                <div className="text-[13px] text-slate-400 mb-4">Define lifecycle mapping, data access scope, and security baseline</div>
                {addSysDiv && <div className="mb-4"><span className="bg-slate-100 text-slate-500 text-xs font-semibold py-[3px] px-2.5 rounded-[6px]">{addSysDiv.name}</span></div>}
                <div className="mb-3.5"><label className="block text-[13px] font-semibold text-slate-700 mb-1.5">System Name *</label><input autoFocus value={sysForm.name} onChange={e => setSysForm(p => ({ ...p, name: e.target.value }))} placeholder="e.g., Salesforce CRM" className="w-full box-border border border-slate-200 rounded-lg px-3 py-2.5 text-[13px] outline-none text-slate-700" /></div>
                <div className="mb-5"><label className="block text-[13px] font-semibold text-slate-700 mb-2">System Type</label><div className="flex gap-2">{([['crm', 'CRM/App'], ['infra', 'Infrastructure'], ['db', 'Database']] as [SystemNode['type'], string][]).map(([t, l]) => <button key={t} onClick={() => setSysForm(p => ({ ...p, type: t }))} className={`py-[7px] px-3.5 rounded-lg text-xs cursor-pointer ${sysForm.type === t ? 'bg-slate-100 text-slate-700 border border-slate-400 font-semibold' : 'bg-white text-slate-400 border border-slate-200 font-normal'}`}>{l}</button>)}</div></div>
                <div className="border-t border-slate-100 pt-[18px] mb-[18px]">
                  <div className="flex items-center gap-1.5 mb-2"><div className="w-[3px] h-3.5 rounded-[2px] bg-violet-500" /><div className="text-[13px] font-bold text-[#0F172A]">Relational Link *</div><span className="ml-auto text-[11px] font-semibold text-violet-500 bg-violet-50 px-2 py-px rounded-[10px]">Supplier → System</span></div>
                  {divSuppliers.length === 0 ? <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5 flex gap-2"><AlertTriangle size={14} color="#F59E0B" className="shrink-0 mt-px" /><div><div className="text-xs font-bold text-amber-800">No suppliers in this division</div><div className="text-[11px] text-amber-800 mt-0.5">Add at least one supplier before registering a system.</div></div></div> : (
                    <div className="flex flex-col gap-1.5">
                      {divSuppliers.map(sup => { const sel = sysForm.linkedSupplierId === sup.id; const [stageBg, stageClr] = STAGE_CLR[sup.stage]; return <button key={sup.id} onClick={() => setSysForm(p => ({ ...p, linkedSupplierId: p.linkedSupplierId === sup.id ? '' : sup.id }))} className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer text-left ${sel ? 'bg-violet-50 border-2 border-violet-500' : 'bg-slate-50 border border-slate-200'}`}><div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${sel ? 'bg-violet-500' : 'bg-slate-300'}`}><Briefcase size={13} color="#fff" /></div><div className="flex-1 min-w-0"><div className={`text-[13px] overflow-hidden text-ellipsis whitespace-nowrap ${sel ? 'font-bold text-violet-700' : 'font-medium text-slate-700'}`}>{sup.name}</div><span className="text-[10px] font-semibold px-1.5 py-px rounded-lg" style={{ color: stageClr, backgroundColor: stageBg }}>{sup.stage}</span></div>{sel && <div className="w-4 h-4 rounded-full bg-violet-500 flex items-center justify-center shrink-0"><CheckCircle2 size={11} color="#fff" /></div>}</button>; })}
                    </div>
                  )}
                </div>
                <div className="border-t border-slate-100 pt-[18px] mb-[18px]">
                  <div className="flex items-center gap-1.5 mb-2"><div className="w-[3px] h-3.5 rounded-[2px] bg-sky-500" /><div className="text-[13px] font-bold text-[#0F172A]">Lifecycle Stage *</div></div>
                  <div className="grid grid-cols-2 gap-2">{STAGES.map(s => { const sel = sysForm.stage === s; const [bg, clr] = STAGE_CLR[s]; return <button key={s} onClick={() => setSysForm(p => ({ ...p, stage: p.stage === s ? '' : s }))} className="py-2.5 px-3.5 rounded-[10px] text-[13px] cursor-pointer text-center" style={{ fontWeight: sel ? 700 : 500, backgroundColor: sel ? bg : '#F8FAFC', color: sel ? clr : '#64748B', border: `${sel ? 2 : 1}px solid ${sel ? clr : '#E2E8F0'}` }}>{s}</button>; })}</div>
                </div>
                <div className="border-t border-slate-100 pt-[18px] mb-[18px]">
                  <div className="flex items-center gap-1.5 mb-2"><div className="w-[3px] h-3.5 rounded-[2px] bg-violet-500" /><div className="text-[13px] font-bold text-[#0F172A]">Data Source</div></div>
                  <input value={sysForm.dataSource} onChange={e => setSysForm(p => ({ ...p, dataSource: e.target.value }))} placeholder="e.g., AWS S3 Bucket (us-east-1/crm-prod)" className="w-full box-border border border-slate-200 rounded-lg px-3 py-2.5 text-xs outline-none text-slate-700 font-mono bg-slate-50" />
                </div>
                <div className="border-t border-slate-100 pt-[18px] mb-[18px]">
                  <div className="flex items-center gap-1.5 mb-2"><div className="w-[3px] h-3.5 rounded-[2px] bg-emerald-500" /><div className="text-[13px] font-bold text-[#0F172A]">Authorized PII</div></div>
                  <div className="flex gap-2 flex-wrap">{PII_OPTIONS.map(p => { const sel = sysForm.authorizedPii.includes(p); return <button key={p} onClick={() => togglePii(p)} className={`py-1.5 px-[13px] rounded-full text-xs cursor-pointer inline-flex items-center gap-1 ${sel ? 'font-bold bg-emerald-50 text-emerald-500 border-2 border-emerald-500' : 'font-medium bg-slate-50 text-slate-500 border border-slate-200'}`}>{sel && <CheckCircle2 size={11} color="#10B981" />}{p}</button>; })}</div>
                </div>
                <div className="border-t border-slate-100 pt-[18px] mb-5">
                  <div className="flex items-center gap-1.5 mb-2"><div className="w-[3px] h-3.5 rounded-[2px] bg-amber-500" /><div className="text-[13px] font-bold text-[#0F172A]">Target Vulnerability Score</div></div>
                  <div className="flex items-center gap-4">
                    {(() => { const v = sysForm.vulnScore, r = 24, circ = 2 * Math.PI * r, dash = circ * (1 - v / 100), col = v >= 75 ? '#10B981' : v >= 50 ? '#F59E0B' : '#EF4444'; return <svg width={64} height={64} className="shrink-0"><circle cx={32} cy={32} r={r} fill="none" stroke="#F1F5F9" strokeWidth={7} /><circle cx={32} cy={32} r={r} fill="none" stroke={col} strokeWidth={7} strokeDasharray={`${circ}`} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 32 32)" /><text x={32} y={36} textAnchor="middle" fontSize={12} fontWeight={800} fill={col}>{v}</text></svg>; })()}
                    <input type="range" min={0} max={100} step={1} value={sysForm.vulnScore} onChange={e => setSysForm(p => ({ ...p, vulnScore: Number(e.target.value) }))} className="flex-1 cursor-pointer" style={{ accentColor: sysForm.vulnScore >= 75 ? '#10B981' : sysForm.vulnScore >= 50 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
                <div className="flex justify-end gap-2.5">
                  <button onClick={() => { setModal(null); setSysForm({ name: '', type: 'crm', stage: '', dataSource: '', authorizedPii: [], vulnScore: 75, linkedSupplierId: '' }); }} className="px-4 py-[9px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer">Cancel</button>
                  <button onClick={addSystem} disabled={!canSubmit} className={`px-[18px] py-[9px] text-[13px] font-semibold border-none rounded-lg text-white ${canSubmit ? 'bg-slate-500 cursor-pointer' : 'bg-slate-300 cursor-not-allowed'}`}>Register System →</button>
                </div>
              </div>
            );
          })()}

          {/* ── X-RAY DETAIL MODAL ────────────────── */}
          {modal.type === 'xrayInfo' && (() => {
            const xSup = suppliers.find(s => s.id === (modal as any).supplierId);
            if (!xSup) return null;
            const shadowPII = (xSup.detectedPii ?? []).filter((p: string) => !(xSup.declaredPii ?? []).includes(p));
            const orgToSup = xSup.piiFlow === 'share' || xSup.piiFlow === 'both' ? xSup.declaredPii ?? [] : [];
            const supToOrg = xSup.piiFlow === 'ingest' || xSup.piiFlow === 'both' ? xSup.detectedPii ?? [] : [];
            const tm = xSup.hasTruthGap ? Math.round(((xSup.declaredPii?.length ?? 0) / Math.max(1, (xSup.detectedPii?.length ?? 0))) * 100) : 100;
            const r = 44, circ = 2 * Math.PI * r, dash = circ * (1 - tm / 100);
            const tmColor = tm === 100 ? '#10B981' : tm >= 60 ? '#F59E0B' : '#EF4444';
            const linkedSystems = systems.filter(s => s.linkedSupplierId === xSup.id);
            return (
              <div onClick={e => e.stopPropagation()} className="relative w-[560px] max-h-[88vh] overflow-y-auto bg-white rounded-2xl p-7 shadow-[0_32px_80px_rgba(0,0,0,0.28)] animate-[scaleIn_0.18s_ease]">
                <button onClick={() => setModal(null)} className="absolute top-[18px] right-[18px] w-8 h-8 bg-slate-100 border-none rounded-lg cursor-pointer flex items-center justify-center text-slate-500"><X size={16} /></button>
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="w-9 h-9 rounded-[10px] bg-blue-50 flex items-center justify-center shrink-0"><Eye size={18} color="#0EA5E9" /></div>
                  <div><div className="text-lg font-bold text-[#0F172A]">Data X-Ray — {xSup.name}</div><div className="text-xs text-slate-400 mt-px">AI-generated analysis of supplier data flows</div></div>
                </div>
                <div className="flex items-center gap-2 my-3.5 pb-3.5 border-b border-slate-100">
                  {(() => { const [bg, c] = STAGE_CLR[xSup.stage]; return <span className="text-[11px] font-semibold py-[3px] px-2.5 rounded-full" style={{ color: c, backgroundColor: bg }}>{xSup.stage}</span>; })()}
                  {xSup.frequency && <span className="text-[11px] text-violet-500 bg-violet-50 py-[3px] px-2.5 rounded-full">{xSup.frequency}</span>}
                  {xSup.contractEnd && <span className="text-[11px] text-slate-500 bg-slate-100 py-[3px] px-2.5 rounded-full">Contract ends {xSup.contractEnd}</span>}
                </div>
                <div className="grid grid-cols-[auto_1fr] gap-5 mb-5 items-center bg-slate-50 rounded-xl px-5 py-4">
                  <div className="text-center">
                    <svg width={108} height={108}><circle cx={54} cy={54} r={r} fill="none" stroke="#E2E8F0" strokeWidth={10} /><circle cx={54} cy={54} r={r} fill="none" stroke={tmColor} strokeWidth={10} strokeDasharray={`${circ}`} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 54 54)" /><text x={54} y={58} textAnchor="middle" fontSize={20} fontWeight={800} fill={tmColor}>{tm}%</text></svg>
                    <div className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.07em] mt-1">Truth Match</div>
                  </div>
                  <div>
                    <div className={`text-[15px] font-bold mb-1.5 ${tm === 100 ? 'text-emerald-600' : 'text-red-600'}`}>{tm === 100 ? 'All declared PII verified' : 'Undeclared PII detected'}</div>
                    <div className="text-[13px] text-slate-500 leading-[1.65] mb-2.5">{xSup.hasTruthGap ? `Supplier declared ${xSup.declaredPii?.length ?? 0} PII fields, but AI detected ${xSup.detectedPii?.length ?? 0}.` : 'All PII detected matches the supplier\'s self-declared assessment.'}</div>
                    {xSup.internalSpoc && <div className="text-xs text-slate-500">Internal SPOC: <span className="text-sky-500 font-semibold">{xSup.internalSpoc}</span></div>}
                  </div>
                </div>
                <div className="flex flex-col gap-3 mb-5">
                  {orgToSup.length > 0 && <div className="bg-blue-50 border border-sky-200 rounded-[10px] px-4 py-3"><div className="text-[11px] font-bold text-sky-500 uppercase tracking-[0.06em] mb-2.5">Outgoing — Org → Supplier (Declared)</div><div className="flex gap-1.5 flex-wrap">{orgToSup.map((p: string) => <span key={p} className="text-xs bg-white text-sky-500 border border-sky-200 py-[3px] px-[11px] rounded-full font-medium">{p}</span>)}</div></div>}
                  {supToOrg.length > 0 && <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-3"><div className="text-[11px] font-bold text-emerald-500 uppercase tracking-[0.06em] mb-2.5">Incoming — Supplier → Org (Detected)</div><div className="flex gap-1.5 flex-wrap">{supToOrg.filter((p: string) => !shadowPII.includes(p)).map((p: string) => <span key={p} className="text-xs bg-white text-emerald-500 border border-emerald-200 py-[3px] px-[11px] rounded-full font-medium">{p}</span>)}</div></div>}
                  {shadowPII.length > 0 && <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3"><div className="flex items-center gap-[7px] mb-2"><AlertTriangle size={14} color="#EF4444" /><div className="text-[11px] font-bold text-red-500 uppercase tracking-[0.06em]">Shadow PII — Detected but NOT Declared</div></div><div className="flex gap-1.5 flex-wrap">{shadowPII.map((p: string) => <span key={p} className="text-xs bg-white text-red-500 border-2 border-red-200 py-[3px] px-[11px] rounded-full font-bold">{p}</span>)}</div></div>}
                </div>
                {linkedSystems.length > 0 && (
                  <div className="border-t border-slate-100 pt-4 mb-5">
                    <div className="text-xs font-bold text-[#0F172A] mb-2.5">Linked Systems</div>
                    <div className="flex flex-col gap-2">
                      {linkedSystems.map(sys => { const [stBg, stClr] = sys.stage ? STAGE_CLR[sys.stage] : ['#F1F5F9', '#64748B']; return <div key={sys.id} onClick={() => setModal({ type: 'sysInfo', systemId: sys.id } as any)} className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] cursor-pointer ${sys.hasStageDiscrepancy ? 'bg-red-50 border border-red-200' : 'bg-slate-50 border border-slate-200'}`}><div className={`w-[30px] h-[30px] rounded-lg flex items-center justify-center shrink-0 ${sys.hasStageDiscrepancy ? 'bg-red-100' : 'bg-blue-50'}`}><Database size={14} color={sys.hasStageDiscrepancy ? '#EF4444' : '#0EA5E9'} /></div><span className={`text-[13px] font-semibold flex-1 ${sys.hasStageDiscrepancy ? 'text-red-600' : 'text-slate-700'}`}>{sys.name}</span>{sys.stage && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-[10px]" style={{ color: stClr, backgroundColor: stBg }}>{sys.stage}</span>}{sys.hasStageDiscrepancy && <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-lg"><AlertTriangle size={11} /> Stage Gap</span>}</div>; })}
                    </div>
                  </div>
                )}
                <button onClick={() => { toast.success('X-Ray report exported'); setModal(null); }} className="w-full p-3 bg-sky-500 text-white border-none rounded-[10px] text-sm font-semibold cursor-pointer">Export X-Ray Report</button>
              </div>
            );
          })()}

          {/* ── SUPPLIER INFO ─────────────────────── */}
          {modal.type === 'supInfo' && selSup && (
            <div onClick={e => e.stopPropagation()} className="relative w-[400px] bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
              <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
              <div className="text-center mb-4">
                <div className="flex justify-center mb-3"><SupCircle riskScore={selSup.riskScore} piiVolume={selSup.piiVolume} size={56} /></div>
                <div className="text-lg font-bold text-[#0F172A] mb-1">{selSup.name}</div>
                {(() => { const [bg, c] = STAGE_CLR[selSup.stage]; return <span className="text-[11px] font-semibold py-[3px] px-2.5 rounded-full" style={{ color: c, backgroundColor: bg }}>{selSup.stage}</span>; })()}
              </div>
              {selSup.hasTruthGap && (
                <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 mb-3.5 flex gap-2 items-center">
                  <AlertTriangle size={14} color="#EF4444" className="shrink-0" />
                  <div><div className="text-xs font-bold text-red-500">Truth Gap Detected</div><div className="text-[11px] text-red-600 mt-px">Declared: [{selSup.declaredPii?.join(', ')}] · Detected: [{selSup.detectedPii?.join(', ')}]</div></div>
                </div>
              )}
              <div className="h-px bg-slate-200 mb-3.5" />
              {([
                { label: 'RISK SCORE', value: selSup.riskScore === null ? 'Not assessed yet' : `${selSup.riskScore} / 100`, color: innerColor(selSup.riskScore) },
                { label: 'PII VOLUME', value: selSup.piiVolume, color: '#64748B' },
                { label: 'INTERNAL SPOC', value: selSup.internalSpoc ?? '— Not set', color: '#0EA5E9' },
                { label: 'TRUTH MATCH', value: selSup.hasTruthGap ? '⚠ Mismatch' : '100% Match', color: selSup.hasTruthGap ? '#EF4444' : '#10B981' },
              ] as { label: string; value: string; color: string }[]).map(row => (
                <div key={row.label} className="mb-2.5">
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-px">{row.label}</div>
                  <div className="text-[13px]" style={{ color: row.color }}>{row.value}</div>
                </div>
              ))}
              <div className="h-px bg-slate-200 my-3.5" />
              <div className="flex flex-col gap-2">
                <button onClick={() => { toast.success(`Portal link sent to ${selSup.email}`); setModal(null); }} className="w-full p-2.5 bg-sky-500 text-white border-none rounded-lg text-sm font-semibold cursor-pointer">Send Portal Link</button>
                <button onClick={() => removeSup(selSup.id)} className="w-full p-2.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-sm cursor-pointer">Remove Supplier</button>
              </div>
            </div>
          )}

          {/* ── SYSTEM INFO (full-featured) ────────── */}
          {modal.type === 'sysInfo' && selSys && (() => {
            const vs = selSys.vulnScore ?? 75;
            const r = 28, circ = 2 * Math.PI * r;
            const dash = circ * (1 - vs / 100);
            const vsColor = vs >= 75 ? '#10B981' : vs >= 50 ? '#F59E0B' : '#EF4444';
            const [stageBg, stageClr] = selSys.stage ? STAGE_CLR[selSys.stage] : ['#F1F5F9', '#64748B'];
            const linkedSup = selSys.linkedSupplierId ? suppliers.find(s => s.id === selSys.linkedSupplierId) : null;
            return (
              <div onClick={e => e.stopPropagation()} className="relative w-[420px] max-h-[88vh] overflow-y-auto bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
                <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>

                {/* Header */}
                <div className="flex items-center gap-3 mb-1.5">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${selSys.hasStageDiscrepancy ? 'bg-[#7F1D1D] border-2 border-red-500' : 'bg-slate-500'}`}>
                    <Database size={22} color={selSys.hasStageDiscrepancy ? '#FCA5A5' : '#fff'} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-lg font-bold text-[#0F172A]">{selSys.name}</div>
                    <div className="flex items-center gap-1.5 mt-[3px] flex-wrap">
                      <span className="text-[11px] text-slate-400">Internal System · {selSys.type.toUpperCase()}</span>
                      <span className="text-[10px] text-slate-400">·</span>
                      <span className="text-[10px] text-slate-500">{divisions.find(d => d.id === selSys.divisionId)?.name}</span>
                    </div>
                    {/* Operated-by supplier badge */}
                    {linkedSup && (() => {
                      const [lsBg, lsClr] = STAGE_CLR[linkedSup.stage];
                      const flowMeta: Record<string, [string, string, string]> = {
                        share: ['Sends PII', '#0EA5E9', '#EFF6FF'],
                        ingest: ['Receives PII', '#10B981', '#ECFDF5'],
                        both: ['Bidirectional', '#8B5CF6', '#F5F3FF'],
                      };
                      const [flowLabel, flowClr, flowBg] = linkedSup.piiFlow ? flowMeta[linkedSup.piiFlow] : ['No PII', '#94A3B8', '#F8FAFC'];
                      return (
                        <div className="flex items-center gap-1.5 mt-[5px] flex-wrap">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-[10px]" style={{ color: flowClr, backgroundColor: flowBg, border: `1px solid ${flowClr}33` }}>⇄ {flowLabel}</span>
                          <span className="text-[10px] text-slate-400">Operated by</span>
                          <button onClick={() => setModal({ type: 'supInfo', supplierId: linkedSup.id })} className="text-[10px] font-bold text-violet-500 bg-violet-50 px-[9px] py-0.5 rounded-[10px] border border-violet-200 cursor-pointer">
                            {linkedSup.name} ↗
                          </button>
                          <span className="text-[9px] font-semibold px-[5px] py-px rounded-lg" style={{ color: lsClr, backgroundColor: lsBg }}>{linkedSup.stage}</span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Lifecycle Stage badge */}
                {selSys.stage && (
                  <div className="mb-4 mt-2.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1.5">Lifecycle Stage</div>
                    <span className="text-[13px] font-bold py-[5px] px-3.5 rounded-full inline-flex items-center gap-[5px]" style={{ color: stageClr, backgroundColor: stageBg, border: `1px solid ${stageClr}33` }}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 inline-block" style={{ backgroundColor: stageClr }} />
                      {selSys.stage}
                    </span>
                    <div className="text-[11px] text-slate-500 mt-1">Customer data entry is expected to occur at this step.</div>
                  </div>
                )}

                {/* Stage discrepancy alert */}
                {selSys.hasStageDiscrepancy && (
                  <div className="bg-red-50 border border-red-200 rounded-[10px] px-3.5 py-3 mb-4">
                    <div className="flex items-center gap-1.5 mb-2">
                      <AlertTriangle size={14} color="#EF4444" className="shrink-0 [animation:ping_1.4s_ease_infinite]" />
                      <div className="text-xs font-bold text-red-600">Stage Discrepancy Detected</div>
                    </div>
                    <div className="text-xs text-red-600 leading-normal mb-2">
                      Employee(s) entered PII that does not belong to the <strong>{selSys.stage}</strong> step:
                    </div>
                    <div className="flex gap-[5px] flex-wrap mb-2.5">
                      {(selSys.discrepancyFields ?? []).map(f => (
                        <span key={f} className="text-xs font-bold bg-white text-red-500 border-2 border-red-200 px-2.5 py-0.5 rounded-full">{f}</span>
                      ))}
                    </div>
                    <button onClick={() => setModal({ type: 'sysReasoning', systemId: selSys.id } as any)} className="text-[11px] font-semibold text-red-500 bg-transparent border-none cursor-pointer p-0 flex items-center gap-1">
                      <Cpu size={11} color="#EF4444" /> View Agent Reasoning →
                    </button>
                  </div>
                )}

                {/* Vulnerability gauge + Data Source */}
                <div className="grid grid-cols-[auto_1fr] gap-4 mb-4 items-center">
                  <div className="text-center">
                    <svg width={80} height={80}>
                      <circle cx={40} cy={40} r={r} fill="none" stroke="#F1F5F9" strokeWidth={8} />
                      <circle cx={40} cy={40} r={r} fill="none" stroke={vsColor} strokeWidth={8} strokeDasharray={`${circ}`} strokeDashoffset={dash} strokeLinecap="round" transform="rotate(-90 40 40)" />
                      <text x={40} y={44} textAnchor="middle" fontSize={14} fontWeight={700} fill={vsColor}>{vs}</text>
                    </svg>
                    <div className="text-[9px] text-slate-400 font-semibold uppercase tracking-[0.04em] mt-0.5">Vuln Score</div>
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1">Data Source Location</div>
                    <div className="text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 font-mono leading-normal">{selSys.dataSource ?? '—'}</div>
                  </div>
                </div>

                {/* Internal SPOC */}
                {selSys.internalSpoc && (
                  <div className="mb-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2.5">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-[3px]">Internal SPOC (Data Integrity Owner)</div>
                    <div className="text-[13px] font-semibold text-sky-500">{selSys.internalSpoc}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Responsible for ensuring employees enter only authorized PII at this step.</div>
                  </div>
                )}

                {/* Authorized PII at this step */}
                {selSys.authorizedPii && selSys.authorizedPii.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1.5">Authorized PII at this Step</div>
                    <div className="text-[11px] text-slate-500 mb-2">At the <strong>{selSys.stage}</strong> step, employees must <strong>only</strong> fill:</div>
                    <div className="flex gap-[5px] flex-wrap">
                      {selSys.authorizedPii.map((p: string) => (
                        <span key={p} className="text-xs font-semibold bg-emerald-50 text-emerald-500 border border-emerald-200 py-[3px] px-2.5 rounded-full inline-flex items-center gap-1">
                          <CheckCircle2 size={10} />{p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Monitored PII Fields */}
                {selSys.piiTypes && selSys.piiTypes.length > 0 && (
                  <div className="mb-4">
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em] mb-1.5">AI Monitored PII Fields</div>
                    <div className="flex gap-[5px] flex-wrap">
                      {selSys.piiTypes.map(p => (
                        <span key={p} className="text-xs font-semibold bg-blue-50 text-sky-500 border border-sky-200 py-[3px] px-2.5 rounded-full">{p}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="h-px bg-slate-200 mb-3.5" />
                <div className="flex gap-2.5">
                  <button onClick={() => { toast('System deep-scan coming soon'); setModal(null); }} className="flex-1 p-2.5 bg-slate-500 text-white border-none rounded-lg text-[13px] font-semibold cursor-pointer">Run System Scan</button>
                  <button onClick={() => { if (window.confirm(`Remove system "${selSys.name}"?`)) removeSys(selSys.id); }} className="flex-1 p-2.5 bg-red-50 text-red-500 border border-red-200 rounded-lg text-[13px] font-semibold cursor-pointer">Remove System</button>
                </div>
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
              <div onClick={e => e.stopPropagation()} className="relative w-[480px] bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.18)] animate-[scaleIn_0.18s_ease]">
                <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
                <div className="flex items-center gap-2.5 mb-1"><Cpu size={16} color="#EF4444" /><div className="text-base font-bold text-[#0F172A]">Agent Reasoning — {rSys.name}</div></div>
                <div className="text-xs text-slate-400 mb-5">Explaining the Stage Discrepancy detected on this internal system</div>
                <div className="flex items-center gap-2 mb-4 bg-slate-50 border border-slate-200 rounded-lg px-3 py-2">
                  <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.06em]">Mapped Stage</span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-[10px]" style={{ color: stageClr, backgroundColor: stageBg }}>{rSys.stage}</span>
                  <span className="text-[10px] text-slate-400 ml-auto">SPOC: <span className="text-sky-500 font-semibold">{rSys.internalSpoc}</span></span>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 font-mono shrink-0">{ar.timestamp}</span>
                      <div><span className="text-[13px] font-bold text-red-600">{ar.action}</span><span className="text-[13px] text-slate-500"> · {ar.trigger}</span></div>
                    </div>
                    <AlertTriangle size={14} color="#EF4444" />
                  </div>
                  <div className="text-xs text-[#7F1D1D] italic leading-[1.6] mb-2.5 pl-1 border-l-[3px] border-red-200">"{ar.reasoning}"</div>
                  <div className="flex gap-[5px] flex-wrap mb-2.5">
                    <span className="text-[11px] text-slate-400 font-semibold mr-1">Flagged fields:</span>
                    {(rSys.discrepancyFields ?? []).map(f => <span key={f} className="text-xs font-bold bg-white text-red-500 border-2 border-red-200 px-[9px] py-0.5 rounded-full">{f}</span>)}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium bg-white border border-slate-200 text-slate-500 px-2.5 py-0.5 rounded-full">Confidence: {ar.confidence}%</span>
                    <span className="text-[11px] font-bold text-red-500 flex items-center gap-1"><AlertTriangle size={11} color="#EF4444" /> ALERT — Stage Discrepancy</span>
                  </div>
                </div>
                {rSys.authorizedPii && (
                  <div className="mt-3.5 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
                    <div className="text-[11px] font-semibold text-emerald-800 mb-1.5">What should have been entered at this step:</div>
                    <div className="flex gap-[5px] flex-wrap">
                      {rSys.authorizedPii.map((p: string) => <span key={p} className="text-xs font-semibold bg-white text-emerald-500 border border-emerald-200 px-[9px] py-0.5 rounded-full inline-flex items-center gap-1"><CheckCircle2 size={10} />{p}</span>)}
                    </div>
                  </div>
                )}
                <div className="flex gap-2.5 mt-4">
                  <button onClick={() => setModal({ type: 'sysInfo', systemId: rSys.id } as any)} className="flex-1 py-[9px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer">View System Details</button>
                  <button onClick={() => { toast.success('Discrepancy escalated to ' + rSys.internalSpoc); setModal(null); }} className="flex-1 py-[9px] text-[13px] font-semibold border-none rounded-lg bg-red-500 text-white cursor-pointer">Escalate to SPOC</button>
                </div>
              </div>
            );
          })()}

          {/* ── DIVISION INFO ─────────────────────── */}
          {modal.type === 'divInfo' && selDiv && (() => {
            const sups = suppliers.filter(s => s.divisionId === selDiv.id);
            const syss = systems.filter(s => s.divisionId === selDiv.id);
            const counts = STAGES.reduce((a, s) => { a[s] = sups.filter(x => x.stage === s).length; return a; }, {} as Record<Stage, number>);

            const handleStageChange = async (newStage: Stage | '') => {
              try {
                const updates = { lifecycleStage: newStage || undefined };
                const updatedDiv = await updateDivision(selDiv.id, updates);
                setDivisions(ds => ds.map(d => d.id === selDiv.id ? updatedDiv : d));
                toast.success(`Division moved to ${newStage || 'no stage'}`);
              } catch (err) {
                console.error('Failed to update division stage:', err);
                toast.error('Failed to update division stage');
              }
            };

            return (
              <div onClick={e => e.stopPropagation()} className="relative w-[380px] bg-white rounded-2xl p-6 shadow-[0_24px_64px_rgba(0,0,0,0.16)] animate-[scaleIn_0.18s_ease]">
                <button onClick={() => setModal(null)} className="absolute top-4 right-4 bg-transparent border-none cursor-pointer text-slate-400"><X size={18} /></button>
                <div className="flex items-center gap-2.5 mb-3">
                  <div className="w-9 h-9 rounded-full bg-violet-500 border-2 border-violet-600 flex items-center justify-center shrink-0"><Briefcase size={18} color="#fff" strokeWidth={1.8} /></div>
                  <div className="text-lg font-bold text-[#0F172A]">{selDiv.name}</div>
                </div>

                <div className="mb-3">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Customer Lifecycle Stage</label>
                  <select
                    value={selDiv.lifecycleStage || ''}
                    onChange={e => handleStageChange(e.target.value as Stage | '')}
                    className="w-full px-3 py-[9px] text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none cursor-pointer"
                  >
                    <option value="">No specific stage</option>
                    {STAGES.map(stage => (
                      <option key={stage} value={stage}>{stage}</option>
                    ))}
                  </select>
                </div>

                {selDiv.lifecycleStage && <div className="mb-2.5"><span className="text-[11px] font-semibold py-[3px] px-2.5 rounded-full" style={{ color: STAGE_CLR[selDiv.lifecycleStage][1], backgroundColor: STAGE_CLR[selDiv.lifecycleStage][0] }}>Customer {selDiv.lifecycleStage}</span></div>}
                <div className="text-[13px] text-slate-500 mb-1.5">{sups.length} supplier{sups.length !== 1 ? 's' : ''} · {syss.length} internal system{syss.length !== 1 ? 's' : ''}</div>
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {STAGES.filter(s => counts[s] > 0).map(s => { const [bg, c] = STAGE_CLR[s]; return <span key={s} className="text-[11px] font-medium py-[3px] px-2.5 rounded-full" style={{ color: c, backgroundColor: bg }}>{counts[s]} {s}</span>; })}
                </div>
                <div className="flex justify-end gap-2.5">
                  <button onClick={() => setModal(null)} className="px-4 py-[9px] text-[13px] border border-slate-200 rounded-lg bg-white text-slate-500 cursor-pointer">Close</button>
                  <button onClick={() => deleteDiv(selDiv.id)} className="px-4 py-[9px] text-[13px] border border-red-200 rounded-lg bg-red-50 text-red-500 cursor-pointer">Delete Division</button>
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
import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';
import type { Control } from '../types';

const MOCK_CONTROLS: Control[] = [
  /* == PROCESS CONTROLS (10) == */
  {
    id: 'p1', name: 'SLA Adherence Policy', desc: 'Monitor supplier uptime vs contracted SLA thresholds',
    category: 'Process', active: true, coverage: 91, scope: 'Full', risk: 'High', lastEval: '8 min ago', deps: 2,
    internalSpoc: 'raj@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: true, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p2', name: 'Invoice Approval Workflow', desc: 'Verify every payment has a corresponding approved PO',
    category: 'Process', active: true, coverage: 78, scope: 'Partial', risk: 'Critical', lastEval: '15 min ago', deps: 3,
    internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Consulting',
  },
  {
    id: 'p3', name: 'Supplier Onboarding Checklist', desc: 'Ensure all onboarding items completed before go-live',
    category: 'Process', active: true, coverage: 62, scope: 'Partial', risk: 'High', lastEval: '30 min ago', deps: 1,
    internalSpoc: 'raj@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p4', name: 'Contractual Obligation Review', desc: 'Track active obligations and flag overdue deliverables',
    category: 'Process', active: true, coverage: 85, scope: 'Full', risk: 'Critical', lastEval: '2 min ago', deps: 4,
    internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Consulting',
  },
  {
    id: 'p5', name: 'Access Revocation on Exit', desc: 'Remove all access within 24hrs of supplier staff offboarding',
    category: 'Process', active: true, coverage: 88, scope: 'Full', risk: 'High', lastEval: '1 hr ago', deps: 2,
    internalSpoc: 'anita@abc.co', externalSpoc: 'info@def.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Security',
  },
  {
    id: 'p6', name: 'Third-Party Risk Assessment', desc: 'Annual TPRA due date monitoring and escalation',
    category: 'Process', active: true, coverage: 74, scope: 'Partial', risk: 'High', lastEval: '45 min ago', deps: 2,
    internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'p7', name: 'Patch Management SLA', desc: 'OS patching within 30-day SLA window',
    category: 'Process', active: false, coverage: 72, scope: 'Partial', risk: 'Medium', lastEval: '2 hrs ago', deps: 2,
    internalSpoc: 'raj@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p8', name: 'Quarterly Access Review', desc: 'Review all active user accounts every 90 days',
    category: 'Process', active: true, coverage: 88, scope: 'Full', risk: 'Medium', lastEval: '1 hr ago', deps: 1,
    internalSpoc: 'raj@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'p9', name: 'Escalation Response Time', desc: 'Critical alerts must be acknowledged within 2 hours',
    category: 'Process', active: true, coverage: 94, scope: 'Full', risk: 'Critical', lastEval: '5 min ago', deps: 3,
    internalSpoc: 'anita@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'both', truthValidator: true, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p10', name: 'Change Management Process', desc: 'All system changes require approved change request',
    category: 'Process', active: true, coverage: 81, scope: 'Full', risk: 'Medium', lastEval: '3 hrs ago', deps: 2,
    internalSpoc: 'raj@abc.co', externalSpoc: 'info@def.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },

  /* == DOCUMENT CONTROLS (8) == */
  {
    id: 'd1', name: 'SOW Signature Verification', desc: 'SOW must be signed before service delivery commences',
    category: 'Document', active: true, coverage: 83, scope: 'Full', risk: 'Critical', lastEval: '10 min ago', deps: 3,
    internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Consulting',
  },
  {
    id: 'd2', name: 'ISO 27001 Certificate Review', desc: 'Track cert validity and trigger renewal 30 days before expiry',
    category: 'Document', active: true, coverage: 91, scope: 'Full', risk: 'High', lastEval: '20 min ago', deps: 1,
    internalSpoc: 'anita@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Regulatory',
  },
  {
    id: 'd3', name: 'Data Processing Agreement (DPA)', desc: 'GDPR Art. 28 DPA in place with all data processors',
    category: 'Document', active: true, coverage: 76, scope: 'Partial', risk: 'Critical', lastEval: '35 min ago', deps: 2,
    internalSpoc: 'priya@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'both', truthValidator: true, hasTruthGap: true, personality: 'Regulatory',
  },
  {
    id: 'd4', name: 'NDA Compliance Check', desc: 'Verify NDA signed and within validity period',
    category: 'Document', active: true, coverage: 95, scope: 'Full', risk: 'Medium', lastEval: '1 hr ago', deps: 0,
    internalSpoc: 'raj@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: false, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'd5', name: 'Incident Response Plan', desc: 'IR runbooks documented and reviewed every 6 months',
    category: 'Document', active: true, coverage: 85, scope: 'Full', risk: 'Critical', lastEval: '3 hrs ago', deps: 5,
    internalSpoc: 'raj@abc.co', externalSpoc: 'info@def.com',
    piiFlow: 'share', truthValidator: false, hasTruthGap: false, personality: 'Regulatory',
  },
  {
    id: 'd6', name: 'Data Classification Policy', desc: 'All data assets classified per sensitivity tier',
    category: 'Document', active: true, coverage: 91, scope: 'Full', risk: 'Low', lastEval: '45 min ago', deps: 0,
    internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'both', truthValidator: true, hasTruthGap: false, personality: 'Regulatory',
  },
  {
    id: 'd7', name: 'Audit Report Review', desc: 'Review and sign off on supplier audit reports quarterly',
    category: 'Document', active: true, coverage: 68, scope: 'Partial', risk: 'High', lastEval: '2 hrs ago', deps: 1,
    internalSpoc: 'anita@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: true, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'd8', name: 'Policy Acknowledgement Tracker', desc: 'All staff and suppliers acknowledge security policies annually',
    category: 'Document', active: false, coverage: 58, scope: 'Sparse', risk: 'Medium', lastEval: '4 hrs ago', deps: 0,
    internalSpoc: 'raj@abc.co', externalSpoc: 'info@def.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Regulatory',
  },

  /* == TECHNICAL CONTROLS (4) == */
  {
    id: 't1', name: 'MFA Enforcement', desc: 'Multi-factor auth on all admin accounts',
    category: 'Technical', active: true, coverage: 94, scope: 'Full', risk: 'Critical', lastEval: '2 min ago', deps: 3,
    internalSpoc: 'priya@abc.co', externalSpoc: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Security',
  },
  {
    id: 't2', name: 'Network Segmentation', desc: 'VLAN isolation prod vs staging environments',
    category: 'Technical', active: true, coverage: 45, scope: 'Sparse', risk: 'High', lastEval: '30 min ago', deps: 4,
    internalSpoc: 'anita@abc.co', externalSpoc: 'info@def.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Security',
  },
  {
    id: 't3', name: 'Vulnerability Scanning', desc: 'Automated weekly asset vulnerability assessments',
    category: 'Technical', active: true, coverage: 78, scope: 'Full', risk: 'Medium', lastEval: '20 min ago', deps: 2,
    internalSpoc: 'anita@abc.co', externalSpoc: 'info@def.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Security',
  },
  {
    id: 't4', name: 'Backup Verification', desc: 'Weekly backup integrity test and restoration drill',
    category: 'Expected Res.', active: true, coverage: 56, scope: 'Partial', risk: 'High', lastEval: '1 hr ago', deps: 1,
    internalSpoc: 'priya@abc.co', externalSpoc: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },
];

/** Get all controls from API with fallback to mock data */
export async function getControls(): Promise<Control[]> {
  return withFallback(
    async () => toCamelCase<Control[]>(await api.get('/controls')),
    MOCK_CONTROLS,
    'controls'
  );
}

/** Get a control by ID (local lookup from fetched data) */
export function getControlById(controls: Control[], id: string): Control | undefined {
  return controls.find(c => c.id === id);
}

/** Toggle control active state */
export async function toggleControl(id: string): Promise<Control> {
  const result = await api.patch<Record<string, unknown>>(`/controls/${id}/toggle`, {});
  return toCamelCase<Control>(result);
}

/** Create a new control */
export async function createControl(control: Omit<Control, 'id'>): Promise<Control> {
  const payload = toSnakeCase(control);
  const result = await api.post<Record<string, unknown>>('/controls', payload);
  return toCamelCase<Control>(result);
}

/** Update a control */
export async function updateControl(id: string, control: Partial<Control>): Promise<Control> {
  const payload = toSnakeCase(control);
  const result = await api.patch<Record<string, unknown>>(`/controls/${id}`, payload);
  return toCamelCase<Control>(result);
}

/** Delete a control */
export async function deleteControl(id: string): Promise<void> {
  await api.delete(`/controls/${id}`);
}

/** Legacy sync getter for backwards compatibility */
export function getControlsSync(): Control[] {
  return MOCK_CONTROLS;
}

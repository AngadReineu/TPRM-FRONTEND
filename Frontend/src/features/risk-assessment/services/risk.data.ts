import { api } from '../../../lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { RiskEvent, RiskDataPoint, ActionItem, ActionUpdatePayload } from '../types';

const MOCK_RISK_DATA: RiskDataPoint[] = [
  { month: 'Aug', overall: 72, critical: 15, high: 28 },
  { month: 'Sep', overall: 68, critical: 12, high: 25 },
  { month: 'Oct', overall: 75, critical: 18, high: 32 },
  { month: 'Nov', overall: 70, critical: 14, high: 30 },
  { month: 'Dec', overall: 65, critical: 11, high: 24 },
  { month: 'Jan', overall: 63, critical: 10, high: 22 },
  { month: 'Feb', overall: 62, critical: 9, high: 20 },
];

const MOCK_RISK_EVENTS: RiskEvent[] = [
  {
    date: 'Feb 25, 2026', supplier: 'GHI Technologies', desc: 'Assessment overdue — 32 days, no response',
    severity: 'Critical', scoreChange: '+8', status: 'Open', currentScore: 91,
    category: 'Assessment Compliance',
    fullDetail: 'GHI Technologies has failed to complete their annual risk assessment. The portal was sent 32 days ago with no response. Three automated follow-up emails have gone unanswered. This creates a critical visibility gap in the supply chain risk posture and constitutes a contractual breach under Section 4.2 of the vendor agreement.',
    impact: 'Without a completed assessment, compliance certifications, PII handling practices, and current security posture cannot be verified. The score has increased by +8 points — any further delay risks contractual penalties and regulatory exposure.',
    actions: [
      { id: 'a1', title: 'Send formal legal notice via certified email', detail: 'Draft and send a formal notice citing contractual obligations under Section 4.2 of the vendor agreement. CC legal and procurement.', scoreReduction: -3, owner: 'Legal / Compliance', effort: 'Medium' },
      { id: 'a2', title: "Escalate to GHI Technologies' executive contact", detail: 'Bypass standard contact and reach CTO/VP directly via phone or LinkedIn. Document all communication attempts.', scoreReduction: -2, owner: 'Risk Manager', effort: 'Low' },
      { id: 'a3', title: 'Configure Agent A1 for daily automated reminders', detail: 'Set Agent A1 to send a daily reminder email until the assessment portal is submitted. Log each attempt.', scoreReduction: -1, owner: 'Agent A1', effort: 'Low' },
      { id: 'a4', title: 'Strengthen vendor agreement with SLA clauses', detail: 'Amend the contract to include financial penalties for assessment delays exceeding 14 days.', scoreReduction: -1, owner: 'Procurement', effort: 'High' },
      { id: 'a5', title: 'Place on watch list — board escalation if no response in 7 days', detail: 'Formally flag for quarterly risk board review. If unresolved in 7 days, initiate offboarding evaluation.', scoreReduction: -1, owner: 'Risk Committee', effort: 'Medium' },
    ],
  },
  {
    date: 'Feb 20, 2026', supplier: 'DEF Limited', desc: 'Network Segmentation control failed evaluation',
    severity: 'High', scoreChange: '+5', status: 'In Review', currentScore: 62,
    category: 'Control Failure',
    fullDetail: 'Agent A3 detected a Network Segmentation control failure during the Feb 20 evaluation. VLAN topology review found 4 unauthorized cross-VLAN firewall rules — 2 lacking proper ServiceNow approval records. Production (VLAN 10) and Staging (VLAN 20) environments are not fully isolated, creating a lateral movement risk.',
    impact: 'Improper network segmentation exposes production systems to potential contamination from lower-security staging environments. GDPR and ISO 27001 Annex A.13.1 compliance is at risk. Current risk score elevated by +5 points.',
    actions: [
      { id: 'b1', title: 'Revoke the 2 unapproved cross-VLAN firewall rules immediately', detail: 'IT Admin to identify and disable the two rules without ServiceNow approval records within 24 hours.', scoreReduction: -2, owner: 'IT Admin', effort: 'Low' },
      { id: 'b2', title: 'Request updated network topology diagram from DEF Limited', detail: 'Formal request for a current, signed network topology diagram showing all VLAN rules and justifications.', scoreReduction: -1, owner: 'Risk Manager', effort: 'Low' },
      { id: 'b3', title: 'Schedule re-evaluation of Network Segmentation control', detail: 'After remediation, trigger manual re-evaluation via Agent A3 to confirm control passes.', scoreReduction: -1, owner: 'Agent A3', effort: 'Low' },
      { id: 'b4', title: 'Increase control evaluation frequency to weekly', detail: 'Update Agent A3 configuration to evaluate Network Segmentation weekly instead of monthly for DEF Limited.', scoreReduction: -1, owner: 'Agent A3', effort: 'Low' },
    ],
  },
  {
    date: 'Feb 14, 2026', supplier: 'Call Center Outsourcing', desc: 'ISO 27001 certificate expiring in 22 days',
    severity: 'High', scoreChange: '+3', status: 'Open', currentScore: 74,
    category: 'Certification Expiry',
    fullDetail: "Automated document monitoring detected that Call Center Outsourcing's ISO 27001 certification expires on March 15, 2026 — 22 days from now. The vendor has not provided a renewal confirmation or an updated certificate. ISO 27001 certification is a contractual requirement and impacts their risk score under the certification scoring model.",
    impact: 'Lapse in ISO 27001 certification will breach Clause 7 of the vendor contract. If the certificate lapses, the supplier cannot be used for any data processing activities involving personal data until re-certified. Score increases by another +5 if not resolved before expiry.',
    actions: [
      { id: 'c1', title: 'Contact Call Center Outsourcing for renewal confirmation', detail: 'Request written confirmation of ISO 27001 renewal status, including the name of their certification body and expected issuance date.', scoreReduction: -1, owner: 'Risk Manager', effort: 'Low' },
      { id: 'c2', title: 'Initiate ISO 27001 renewal tracking in contract management', detail: 'Add certificate expiry tracking to the contract management system with a 60-day advance reminder.', scoreReduction: -1, owner: 'Compliance Officer', effort: 'Medium' },
      { id: 'c3', title: 'Verify all active certifications (SOC2, PCI-DSS, etc.)', detail: 'Use this opportunity to audit all other certifications held by this supplier for upcoming expiries.', scoreReduction: -1, owner: 'DPO', effort: 'Medium' },
    ],
  },
  {
    date: 'Feb 10, 2026', supplier: 'MNO Partners', desc: 'No portal data received for 7 consecutive days',
    severity: 'Medium', scoreChange: '+2', status: 'Resolved', currentScore: 55,
    category: 'Data Feed Interruption',
    fullDetail: "Agent A2 logged a data feed interruption from MNO Partners' assessment portal. No telemetry, evidence uploads, or portal activity was detected for 7 consecutive days (Feb 3-10). The portal connection was restored on Feb 10 after a credential refresh, and data sync was confirmed. Root cause: expired API token on the supplier side.",
    impact: 'While resolved, the 7-day data gap created a temporary blind spot in compliance monitoring. Score increased by +2 and has since partially recovered. Mitigation measures implemented.',
    actions: [
      { id: 'd1', title: 'Implement automated API token rotation reminder', detail: "Set up a monthly token rotation check for MNO Partners' portal integration with a 14-day advance notification.", scoreReduction: -1, owner: 'Agent A2', effort: 'Low' },
      { id: 'd2', title: 'Add redundant data feed from email backup channel', detail: 'Configure a fallback email-based data submission for MNO Partners in case API feed fails again.', scoreReduction: -1, owner: 'IT Admin', effort: 'Medium' },
    ],
  },
  {
    date: 'Feb 05, 2026', supplier: 'XYZ Corporation', desc: 'Encryption at Rest coverage dropped below 70%',
    severity: 'Medium', scoreChange: '+4', status: 'In Review', currentScore: 78,
    category: 'Control Threshold Breach',
    fullDetail: "Agent A2 detected that XYZ Corporation's Encryption at Rest coverage dropped to 67% (threshold: 70%) following the addition of 106 new Azure VM assets that were provisioned without the default encryption policy applied. The assets are in the production environment.",
    impact: 'Unencrypted data at rest exposes customer PII and financial data to unauthorized access in the event of a storage breach. GDPR Article 32 and PCI-DSS Requirement 3 are potentially at risk. Score elevated by +4 points.',
    actions: [
      { id: 'e1', title: 'Apply AES-256 encryption to all 106 unencrypted VMs', detail: 'IT Admin to run the Azure Policy remediation task to enforce encryption on all non-compliant storage volumes.', scoreReduction: -2, owner: 'IT Admin / Agent A2', effort: 'Medium' },
      { id: 'e2', title: 'Enable auto-remediation in Azure Policy for encryption', detail: 'Configure Azure Policy to automatically enforce encryption at rest on newly provisioned VMs, preventing future occurrences.', scoreReduction: -1, owner: 'Cloud Architect', effort: 'Low' },
      { id: 'e3', title: 'Update Encryption at Rest control threshold to 75%', detail: 'Raise the compliance threshold from 70% to 75% and schedule weekly evaluation checks.', scoreReduction: -1, owner: 'Compliance Officer', effort: 'Low' },
    ],
  },
  {
    date: 'Jan 28, 2026', supplier: 'PQR Systems', desc: 'New supplier — initial risk score: 67 (Medium)',
    severity: 'Low', scoreChange: '0', status: 'Resolved', currentScore: 67,
    category: 'Onboarding',
    fullDetail: 'PQR Systems was onboarded as a new third-party supplier on Jan 28, 2026. Initial risk score of 67 (Medium) was calculated using baseline onboarding criteria. Assessment portal has been issued. Agent A5 has been assigned for monitoring.',
    impact: 'Standard onboarding — no immediate risk. Score will update dynamically as the first assessment is completed and controls begin evaluation.',
    actions: [
      { id: 'f1', title: 'Complete initial supplier assessment (portal sent)', detail: 'Ensure PQR Systems completes the assessment portal within the 30-day onboarding window.', scoreReduction: -5, owner: 'PQR Systems', effort: 'Low' },
      { id: 'f2', title: 'Configure PII data sharing settings', detail: 'Once assessment is complete, configure data sharing permissions and transfer method.', scoreReduction: -2, owner: 'DPO', effort: 'Medium' },
      { id: 'f3', title: 'Schedule 30-day onboarding review call', detail: 'Check progress on assessment, certifications, and any immediate concerns.', scoreReduction: -1, owner: 'Risk Manager', effort: 'Low' },
    ],
  },
];

const MOCK_AI_RECOMMENDATIONS = [
  'Escalate GHI Technologies assessment — 32 days overdue with no response. Consider sending legal notice.',
  'Initiate ISO 27001 renewal process for Call Center Outsourcing before expiry on Mar 15, 2026.',
  'Review and update MFA Enforcement control scope — 3 suppliers out of compliance.',
  'Consider offboarding DEF Limited from Upgradation stage due to consistently elevated risk scores.',
  'Schedule quarterly access review for all Retention-stage suppliers — last review was 4 months ago.',
];

const severityColors: Record<string, [string, string]> = {
  Critical: ['bg-red-50', 'text-red-500'],
  High: ['bg-amber-50', 'text-amber-500'],
  Medium: ['bg-slate-100', 'text-slate-500'],
  Low: ['bg-emerald-50', 'text-emerald-500'],
};

const statusColors: Record<string, [string, string]> = {
  Open: ['bg-red-50', 'text-red-500'],
  'In Review': ['bg-amber-50', 'text-amber-500'],
  Resolved: ['bg-emerald-50', 'text-emerald-500'],
};

const effortColors: Record<string, [string, string]> = {
  Low: ['bg-emerald-50', 'text-emerald-500'],
  Medium: ['bg-amber-50', 'text-amber-500'],
  High: ['bg-red-50', 'text-red-500'],
};

/* ── Sync getters (backward compatibility) ── */

export function getRiskData() {
  return MOCK_RISK_DATA;
}

export function getRiskEvents() {
  return MOCK_RISK_EVENTS;
}

export function getAiRecommendations() {
  return MOCK_AI_RECOMMENDATIONS;
}

export function getSeverityColors() {
  return severityColors;
}

export function getStatusColors() {
  return statusColors;
}

export function getEffortColors() {
  return effortColors;
}

/* ── API Service Functions ── */

/**
 * Fetch risk trend data from API
 */
export async function fetchRiskData(): Promise<RiskDataPoint[]> {
  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/risk/trends')),
    MOCK_RISK_DATA,
    'risk-trends'
  );
}

/**
 * Fetch risk events from API
 */
export async function fetchRiskEvents(): Promise<RiskEvent[]> {
  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/risk/events')),
    MOCK_RISK_EVENTS,
    'risk-events'
  );
}

/**
 * Fetch AI recommendations from API
 */
export async function fetchAiRecommendations(): Promise<string[]> {
  return withFallback(
    async () => {
      const data = await api.get<{ recommendations: string[] }>('/risk/ai-recommendations');
      return data.recommendations;
    },
    MOCK_AI_RECOMMENDATIONS,
    'risk-ai-recommendations'
  );
}

/**
 * Update risk event status
 */
export async function updateRiskEventStatus(
  eventId: string,
  status: 'Open' | 'In Review' | 'Resolved'
): Promise<RiskEvent> {
  const result = await api.patch<Record<string, unknown>>(`/risk/events/${eventId}`, toSnakeCase({ status }));
  return toCamelCase<RiskEvent>(result);
}

/**
 * Execute an action item on a risk event
 */
export async function executeRiskAction(
  eventId: string,
  actionId: string,
  payload?: ActionUpdatePayload
): Promise<RiskEvent> {
  const result = await api.post<Record<string, unknown>>(
    `/risk/events/${eventId}/actions/${actionId}/execute`,
    toSnakeCase(payload ?? {})
  );
  return toCamelCase<RiskEvent>(result);
}

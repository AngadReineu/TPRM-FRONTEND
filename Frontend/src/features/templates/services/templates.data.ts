import { Handshake, Truck, ShieldCheck, Scale } from 'lucide-react';
import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';
import type { Template, Severity, TemplateApiResponse, DeployTemplatePayload, DeployTemplateResponse } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Icon mapping for API responses
// ─────────────────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, typeof Handshake> = {
  Handshake,
  Truck,
  ShieldCheck,
  Scale,
};

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (fallback)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_TEMPLATES: Template[] = [
  {
    id: 'consulting',
    title: 'Consulting',
    subtitle: 'SOW & Payment Auditor',
    description: 'Monitors consulting engagements for contractual compliance, payment milestones, and SOW adherence. Flags anomalies in signature timelines and PO approvals.',
    icon: Handshake,
    color: '#0EA5E9',
    bg: '#EFF6FF',
    border: '#BAE6FD',
    frequency: 'Daily',
    alertLevel: 'High',
    controls: ['MFA Enforcement', 'Data Classification Policy'],
    capabilities: [
      'SOW signature date validation',
      'Payment vs PO approval audit',
      'Milestone delivery tracking',
      'Contractual risk detection',
    ],
    badge: 'Finance',
    badgeBg: '#EFF6FF',
    badgeColor: '#0EA5E9',
    logic: [
      { trigger: 'SOW vs Service Start Date', detail: 'Flags cases where the SOW is signed after the service commencement date — a known contractual risk pattern.', severity: 'critical' },
      { trigger: 'Payment Without PO Approval', detail: 'Detects payments processed without a matching purchase order in the internal approval chain.', severity: 'critical' },
      { trigger: 'Milestone Slip Detection', detail: 'Compares agreed milestone dates against delivery confirmations. Triggers alert if slippage exceeds 7 days.', severity: 'high' },
      { trigger: 'Duplicate Invoice Check', detail: 'Scans invoice history for duplicate amounts or vendor codes within a 30-day window.', severity: 'medium' },
    ],
  },
  {
    id: 'operations',
    title: 'Operations',
    subtitle: 'SLA & Logistics Monitor',
    description: 'Tracks operational SLAs, logistics pipelines, and delivery commitments. Raises escalations when agreed benchmarks are breached or data feeds go silent.',
    icon: Truck,
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    frequency: 'Every 6hrs',
    alertLevel: 'Critical Only',
    controls: ['Backup Verification', 'Access Review Policy'],
    capabilities: [
      'SLA breach detection',
      'Logistics delay alerting',
      'Delivery confirmation audit',
      'SFTP / API feed monitoring',
    ],
    badge: 'Ops',
    badgeBg: '#ECFDF5',
    badgeColor: '#10B981',
    logic: [
      { trigger: 'SLA Breach Window', detail: 'Monitors agreed response times. Auto-escalates if SLA threshold is crossed by more than 10% of the breach window.', severity: 'critical' },
      { trigger: 'Silent Feed Detection', detail: 'Raises an alert if no data has been received via SFTP or API feed for more than 6 hours.', severity: 'high' },
      { trigger: 'Delivery Lag > 3 Days', detail: 'Compares expected delivery date against logistics tracking data. Flags any lag exceeding 72 hours.', severity: 'high' },
      { trigger: 'Escalation Chain Compliance', detail: 'Validates that the escalation matrix was followed when a breach was previously detected.', severity: 'medium' },
    ],
  },
  {
    id: 'data-security',
    title: 'Data Security',
    subtitle: 'PII & Encryption Watchdog',
    description: 'Continuously audits PII flows, encryption standards, and truth-gap indicators across supplier relationships. Fires alerts the moment declared and detected PII diverge.',
    icon: ShieldCheck,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    border: '#DDD6FE',
    frequency: 'Hourly',
    alertLevel: 'Critical Only',
    controls: ['MFA Enforcement', 'Backup Verification', 'Vulnerability Scanning', 'Privileged Access Mgmt'],
    capabilities: [
      'PII truth-gap detection',
      'Encryption compliance checks',
      'Data breach indicator alerts',
      'Access control verification',
    ],
    badge: 'Security',
    badgeBg: '#F5F3FF',
    badgeColor: '#8B5CF6',
    logic: [
      { trigger: 'PII Truth Gap', detail: 'Compares supplier-declared PII fields against fields detected in live data streams. Any undeclared field triggers a Shadow PII alert.', severity: 'critical' },
      { trigger: 'Encryption Standard Drift', detail: 'Validates that data at rest and in transit uses AES-256 / TLS 1.3. Downgrades to older standards trigger immediate alerts.', severity: 'critical' },
      { trigger: 'Anomalous Access Pattern', detail: 'Flags access to sensitive data repositories outside business hours or from unrecognised IP ranges.', severity: 'high' },
      { trigger: 'Credential Reuse Detection', detail: 'Identifies reused credentials across systems, a common precursor to credential-stuffing attacks.', severity: 'medium' },
    ],
  },
  {
    id: 'regulatory',
    title: 'Regulatory',
    subtitle: 'Compliance & Audit Trail',
    description: 'Maintains compliance across IRDAI, DPDPA, ISO 27001, and other active frameworks. Tracks certification expiry and regulatory filing deadlines automatically.',
    icon: Scale,
    color: '#F59E0B',
    bg: '#FFFBEB',
    border: '#FDE68A',
    frequency: 'Daily',
    alertLevel: 'High',
    controls: ['Data Classification Policy', 'Access Review Policy', 'Incident Response Plan'],
    capabilities: [
      'Framework compliance scoring',
      'Regulatory filing deadlines',
      'Audit evidence collection',
      'Certification expiry alerts',
    ],
    badge: 'Regulatory',
    badgeBg: '#FFFBEB',
    badgeColor: '#F59E0B',
    logic: [
      { trigger: 'Certification Expiry < 30 Days', detail: 'Proactively flags ISO 27001, SOC 2, or sector-specific certifications expiring within 30 days.', severity: 'high' },
      { trigger: 'DPDPA Consent Gap', detail: 'Checks that active data flows have corresponding DPDPA consent records. Flags any unconsented processing.', severity: 'critical' },
      { trigger: 'Regulatory Filing Deadline', detail: 'Cross-references IRDAI and RBI filing calendars and raises alerts 10 working days before deadlines.', severity: 'high' },
      { trigger: 'Audit Evidence Missing', detail: 'Identifies controls without supporting evidence documents in the last audit cycle.', severity: 'medium' },
    ],
  },
];

const MOCK_SEVERITY_COLORS: Record<Severity, [string, string]> = {
  critical: ['#FEF2F2', '#EF4444'],
  high:     ['#FFFBEB', '#F59E0B'],
  medium:   ['#F1F5F9', '#64748B'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Synchronous getters (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export function getTemplates() {
  return MOCK_TEMPLATES;
}

export function getSeverityColors() {
  return MOCK_SEVERITY_COLORS;
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: Convert API response to Template with icon
// ─────────────────────────────────────────────────────────────────────────────

function mapApiResponseToTemplate(apiTemplate: TemplateApiResponse): Template {
  return {
    ...apiTemplate,
    icon: ICON_MAP[apiTemplate.iconName] ?? ShieldCheck,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service Functions (async with fallback)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all templates from the API.
 */
export async function fetchTemplates(): Promise<Template[]> {
  return withFallback(
    async () => {
      const data = await api.get<TemplateApiResponse[]>('/templates');
      const camelData = toCamelCase<TemplateApiResponse[]>(data);
      return camelData.map(mapApiResponseToTemplate);
    },
    () => MOCK_TEMPLATES,
    'Templates'
  );
}

/**
 * Fetch a single template by ID.
 */
export async function fetchTemplateById(id: string): Promise<Template | null> {
  return withFallback(
    async () => {
      const data = await api.get<TemplateApiResponse>(`/templates/${id}`);
      const camelData = toCamelCase<TemplateApiResponse>(data);
      return mapApiResponseToTemplate(camelData);
    },
    () => MOCK_TEMPLATES.find(t => t.id === id) ?? null,
    `Templates/${id}`
  );
}

/**
 * Deploy a template to create a new agent.
 */
export async function deployTemplate(
  templateId: string,
  payload?: DeployTemplatePayload
): Promise<DeployTemplateResponse> {
  const data = await api.post<DeployTemplateResponse>(
    `/templates/${templateId}/deploy`,
    toSnakeCase(payload ?? {})
  );
  return toCamelCase<DeployTemplateResponse>(data);
}

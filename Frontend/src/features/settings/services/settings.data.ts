import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';
import type {
  OrgSettings,
  IntegrationSettings,
  NotificationSettings,
  ComplianceSettings,
  AIConfigSettings,
  PortalSettings,
  AllSettings,
  SettingsUpdatePayload,
} from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Mock Data (fallback)
// ─────────────────────────────────────────────────────────────────────────────

const MOCK_ORG_SETTINGS: OrgSettings = {
  orgName: 'ABC Insurance Company',
  industry: 'Healthcare / Insurance',
  headquarters: 'Mumbai, India',
  cinNumber: 'U66000MH2015PLC123456',
  irdaiLicenseNumber: 'IRDAI/HLT/2015/123',
  primaryContactEmail: 'risk@abcinsurance.in',
  logoUrl: '',
};

const MOCK_INTEGRATIONS: IntegrationSettings[] = [
  { id: 'azure-ad', name: 'Azure AD', description: 'Single sign-on with Microsoft Azure Active Directory', icon: 'azure', enabled: true, status: 'connected', lastSync: '2 min ago' },
  { id: 'slack', name: 'Slack', description: 'Real-time notifications and alerts', icon: 'slack', enabled: true, status: 'connected', lastSync: '5 min ago' },
  { id: 'jira', name: 'Jira', description: 'Sync risk items with Jira tickets', icon: 'jira', enabled: false, status: 'disconnected' },
  { id: 'servicenow', name: 'ServiceNow', description: 'Integration with ServiceNow ITSM', icon: 'servicenow', enabled: false, status: 'disconnected' },
];

const MOCK_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  riskAlerts: true,
  assessmentReminders: true,
  weeklyDigest: true,
  slackIntegration: true,
  teamsIntegration: false,
};

const MOCK_COMPLIANCE_SETTINGS: ComplianceSettings = {
  riskThreshold: 70,
  autoEscalation: true,
  assessmentFrequency: 'quarterly',
  dataRetentionDays: 365,
  enabledFrameworks: ['ISO 27001', 'SOC 2', 'GDPR', 'DPDPA', 'IRDAI'],
};

const MOCK_AI_CONFIG: AIConfigSettings = {
  enableAI: true,
  modelVersion: 'gpt-4o',
  autoRecommendations: true,
  confidenceThreshold: 0.75,
  maxTokens: 4096,
};

const MOCK_PORTAL_SETTINGS: PortalSettings = {
  portalName: 'ABC Insurance TPRM Portal',
  brandColor: '#0EA5E9',
  supportEmail: 'support@abcinsurance.in',
  termsUrl: 'https://abcinsurance.in/terms',
  privacyUrl: 'https://abcinsurance.in/privacy',
};

// ─────────────────────────────────────────────────────────────────────────────
// Synchronous getters (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export function getOrgSettings(): OrgSettings {
  return MOCK_ORG_SETTINGS;
}

export function getIntegrations(): IntegrationSettings[] {
  return MOCK_INTEGRATIONS;
}

export function getNotificationSettings(): NotificationSettings {
  return MOCK_NOTIFICATION_SETTINGS;
}

export function getComplianceSettings(): ComplianceSettings {
  return MOCK_COMPLIANCE_SETTINGS;
}

export function getAIConfigSettings(): AIConfigSettings {
  return MOCK_AI_CONFIG;
}

export function getPortalSettings(): PortalSettings {
  return MOCK_PORTAL_SETTINGS;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service Functions (async with fallback)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all settings from the API.
 */
export async function fetchSettings(): Promise<AllSettings> {
  return withFallback(
    async () => {
      const data = await api.get<AllSettings>('/settings');
      return toCamelCase<AllSettings>(data);
    },
    () => ({
      org: MOCK_ORG_SETTINGS,
      integrations: MOCK_INTEGRATIONS,
      notifications: MOCK_NOTIFICATION_SETTINGS,
      compliance: MOCK_COMPLIANCE_SETTINGS,
      aiConfig: MOCK_AI_CONFIG,
      portal: MOCK_PORTAL_SETTINGS,
    }),
    'Settings'
  );
}

/**
 * Fetch organization settings only.
 */
export async function fetchOrgSettings(): Promise<OrgSettings> {
  return withFallback(
    async () => {
      const data = await api.get<OrgSettings>('/settings/org');
      return toCamelCase<OrgSettings>(data);
    },
    () => MOCK_ORG_SETTINGS,
    'Settings/Org'
  );
}

/**
 * Fetch notification settings only.
 */
export async function fetchNotificationSettings(): Promise<NotificationSettings> {
  return withFallback(
    async () => {
      const data = await api.get<NotificationSettings>('/settings/notifications');
      return toCamelCase<NotificationSettings>(data);
    },
    () => MOCK_NOTIFICATION_SETTINGS,
    'Settings/Notifications'
  );
}

/**
 * Fetch compliance settings only.
 */
export async function fetchComplianceSettings(): Promise<ComplianceSettings> {
  return withFallback(
    async () => {
      const data = await api.get<ComplianceSettings>('/settings/compliance');
      return toCamelCase<ComplianceSettings>(data);
    },
    () => MOCK_COMPLIANCE_SETTINGS,
    'Settings/Compliance'
  );
}

/**
 * Fetch AI configuration settings only.
 */
export async function fetchAIConfigSettings(): Promise<AIConfigSettings> {
  return withFallback(
    async () => {
      const data = await api.get<AIConfigSettings>('/settings/ai-config');
      return toCamelCase<AIConfigSettings>(data);
    },
    () => MOCK_AI_CONFIG,
    'Settings/AIConfig'
  );
}

/**
 * Fetch portal settings only.
 */
export async function fetchPortalSettings(): Promise<PortalSettings> {
  return withFallback(
    async () => {
      const data = await api.get<PortalSettings>('/settings/portal');
      return toCamelCase<PortalSettings>(data);
    },
    () => MOCK_PORTAL_SETTINGS,
    'Settings/Portal'
  );
}

/**
 * Update settings (partial update).
 */
export async function updateSettings(payload: SettingsUpdatePayload): Promise<AllSettings> {
  const data = await api.patch<AllSettings>('/settings', toSnakeCase(payload));
  return toCamelCase<AllSettings>(data);
}

/**
 * Update organization settings.
 */
export async function updateOrgSettings(payload: Partial<OrgSettings>): Promise<OrgSettings> {
  const data = await api.patch<OrgSettings>('/settings/org', toSnakeCase(payload));
  return toCamelCase<OrgSettings>(data);
}

/**
 * Update notification settings.
 */
export async function updateNotificationSettings(payload: Partial<NotificationSettings>): Promise<NotificationSettings> {
  const data = await api.patch<NotificationSettings>('/settings/notifications', toSnakeCase(payload));
  return toCamelCase<NotificationSettings>(data);
}

/**
 * Update compliance settings.
 */
export async function updateComplianceSettings(payload: Partial<ComplianceSettings>): Promise<ComplianceSettings> {
  const data = await api.patch<ComplianceSettings>('/settings/compliance', toSnakeCase(payload));
  return toCamelCase<ComplianceSettings>(data);
}

/**
 * Update AI configuration settings.
 */
export async function updateAIConfigSettings(payload: Partial<AIConfigSettings>): Promise<AIConfigSettings> {
  const data = await api.patch<AIConfigSettings>('/settings/ai-config', toSnakeCase(payload));
  return toCamelCase<AIConfigSettings>(data);
}

/**
 * Update portal settings.
 */
export async function updatePortalSettings(payload: Partial<PortalSettings>): Promise<PortalSettings> {
  const data = await api.patch<PortalSettings>('/settings/portal', toSnakeCase(payload));
  return toCamelCase<PortalSettings>(data);
}

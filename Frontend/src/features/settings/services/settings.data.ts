import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';
import { useAuthStore } from '@/stores/authStore';
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
// Get default empty settings
// ─────────────────────────────────────────────────────────────────────────────

const getDefaultOrgSettings = (): OrgSettings => {
  const user = useAuthStore.getState().user;
  return {
    orgName: user?.org_name || '',
    industry: user?.industry || 'Technology',
    headquarters: '',
    cinNumber: '',
    irdaiLicenseNumber: '',
    primaryContactEmail: user?.email || '',
    logoUrl: '',
  };
};

const DEFAULT_INTEGRATIONS: IntegrationSettings[] = [];

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  emailNotifications: true,
  riskAlerts: true,
  assessmentReminders: true,
  weeklyDigest: false,
  slackIntegration: false,
  teamsIntegration: false,
};

const DEFAULT_COMPLIANCE_SETTINGS: ComplianceSettings = {
  riskThreshold: 70,
  autoEscalation: true,
  assessmentFrequency: 'quarterly',
  dataRetentionDays: 365,
  enabledFrameworks: [],
};

const DEFAULT_AI_CONFIG: AIConfigSettings = {
  enableAI: false,
  modelVersion: 'gpt-4o',
  autoRecommendations: false,
  confidenceThreshold: 0.75,
  maxTokens: 4096,
};

const getDefaultPortalSettings = (): PortalSettings => {
  const user = useAuthStore.getState().user;
  return {
    portalName: (user?.org_name || '') + ' TPRM Portal',
    brandColor: '#0EA5E9',
    supportEmail: user?.email || '',
    termsUrl: '',
    privacyUrl: '',
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// Synchronous getters (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export function getOrgSettings(): OrgSettings {
  return getDefaultOrgSettings();
}

export function getIntegrations(): IntegrationSettings[] {
  return DEFAULT_INTEGRATIONS;
}

export function getNotificationSettings(): NotificationSettings {
  return DEFAULT_NOTIFICATION_SETTINGS;
}

export function getComplianceSettings(): ComplianceSettings {
  return DEFAULT_COMPLIANCE_SETTINGS;
}

export function getAIConfigSettings(): AIConfigSettings {
  return DEFAULT_AI_CONFIG;
}

export function getPortalSettings(): PortalSettings {
  return getDefaultPortalSettings();
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
      org: getDefaultOrgSettings(),
      integrations: DEFAULT_INTEGRATIONS,
      notifications: DEFAULT_NOTIFICATION_SETTINGS,
      compliance: DEFAULT_COMPLIANCE_SETTINGS,
      aiConfig: DEFAULT_AI_CONFIG,
      portal: getDefaultPortalSettings(),
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
    () => getDefaultOrgSettings(),
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
    () => DEFAULT_NOTIFICATION_SETTINGS,
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
    () => DEFAULT_COMPLIANCE_SETTINGS,
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
    () => DEFAULT_AI_CONFIG,
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
    () => getDefaultPortalSettings(),
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

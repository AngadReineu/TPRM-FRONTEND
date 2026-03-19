export interface OrgSettings {
  id?: string;
  orgName: string;
  industry: string;
  headquarters: string;
  cinNumber: string;
  irdaiLicenseNumber: string;
  primaryContactEmail: string;
  logoUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IntegrationSettings {
  id: string;
  name: string;
  description: string;
  icon: string;
  enabled: boolean;
  status: 'connected' | 'disconnected' | 'pending';
  lastSync?: string;
  configUrl?: string;
}

export interface NotificationSettings {
  emailNotifications: boolean;
  riskAlerts: boolean;
  assessmentReminders: boolean;
  weeklyDigest: boolean;
  slackIntegration: boolean;
  teamsIntegration: boolean;
}

export interface ComplianceSettings {
  riskThreshold: number;
  autoEscalation: boolean;
  assessmentFrequency: 'monthly' | 'quarterly' | 'annually';
  dataRetentionDays: number;
  enabledFrameworks: string[];
}

export interface AIConfigSettings {
  enableAI: boolean;
  modelVersion: string;
  autoRecommendations: boolean;
  confidenceThreshold: number;
  maxTokens: number;
}

export interface PortalSettings {
  portalName: string;
  brandColor: string;
  logoUrl?: string;
  supportEmail: string;
  termsUrl?: string;
  privacyUrl?: string;
}

export interface AllSettings {
  org: OrgSettings;
  integrations: IntegrationSettings[];
  notifications: NotificationSettings;
  compliance: ComplianceSettings;
  aiConfig: AIConfigSettings;
  portal: PortalSettings;
}

export type SettingsUpdatePayload = Partial<AllSettings>;

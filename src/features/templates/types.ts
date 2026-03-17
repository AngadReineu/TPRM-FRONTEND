import type { LucideIcon } from 'lucide-react';

export type Severity = 'critical' | 'high' | 'medium';

export interface TemplateLogicTrigger {
  trigger: string;
  detail: string;
  severity: Severity;
}

export interface Template {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  border: string;
  frequency: string;
  alertLevel: string;
  controls: string[];
  capabilities: string[];
  badge: string;
  badgeBg: string;
  badgeColor: string;
  logic: TemplateLogicTrigger[];
}

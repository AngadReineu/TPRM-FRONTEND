/* ── Shared Types ─────────────────────────────────────── */

export type Stage = 'Acquisition' | 'Retention' | 'Upgradation' | 'Offboarding';

export type PiiFlow = 'share' | 'ingest' | 'both';

export type Personality = 'Consulting' | 'Operations' | 'Security' | 'Regulatory';

export type Risk = 'Critical' | 'High' | 'Medium' | 'Low';

export type Severity = 'critical' | 'high' | 'medium';

export type TaskPriority = 'High' | 'Medium' | 'Low';

export type TaskStatus = 'Open' | 'In Progress' | 'Resolved';

export type Category = 'Technical' | 'Process' | 'Document' | 'Expected Res.';

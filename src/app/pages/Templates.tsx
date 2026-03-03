import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Handshake, Truck, ShieldCheck, Scale,
  CheckCircle2, ArrowRight, Zap, Clock, Eye, X,
  AlertTriangle, Plus, Pencil,
} from 'lucide-react';
import { toast } from 'sonner';

/* ─── Template definitions ───────────────────────────────── */
const TEMPLATES = [
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

type Severity = 'critical' | 'high' | 'medium';
const SEV_CLR: Record<Severity, [string, string]> = {
  critical: ['#FEF2F2', '#EF4444'],
  high:     ['#FFFBEB', '#F59E0B'],
  medium:   ['#F1F5F9', '#64748B'],
};

/* ─── Anomaly Preview Modal ──────────────────────────────── */
function AnomalyPreviewModal({ tpl, onClose }: { tpl: typeof TEMPLATES[0]; onClose: () => void }) {
  const Icon = tpl.icon;
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', width: 520, maxHeight: '85vh', backgroundColor: '#fff', borderRadius: 18, display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.24)', animation: 'scaleIn 0.18s ease', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, backgroundColor: tpl.bg, border: `1px solid ${tpl.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Icon size={18} color={tpl.color} />
              </div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 700, color: '#0F172A' }}>{tpl.title} — AI Logic</div>
                <div style={{ fontSize: 12, color: '#94A3B8' }}>{tpl.subtitle}</div>
              </div>
            </div>
            <button onClick={onClose} style={{ width: 30, height: 30, backgroundColor: '#F1F5F9', border: 'none', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748B' }}><X size={15} /></button>
          </div>
        </div>

        {/* Trigger list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 4 }}>
            These are the specific anomaly patterns this agent personality is trained to detect and escalate:
          </div>
          {tpl.logic.map((row, i) => {
            const [bg, clr] = SEV_CLR[row.severity as Severity];
            return (
              <div key={i} style={{ backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 12, padding: '14px 16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <AlertTriangle size={13} color={clr} />
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{row.trigger}</span>
                  <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, backgroundColor: bg, color: clr, padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>{row.severity}</span>
                </div>
                <div style={{ fontSize: 12, color: '#64748B', lineHeight: 1.6 }}>{row.detail}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 24px', borderTop: '1px solid #E2E8F0', flexShrink: 0, backgroundColor: '#FAFBFC', display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ backgroundColor: tpl.color, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>Got it</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Deployed success overlay ───────────────────────────── */
function DeployedOverlay({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(2px)' }} />
      <div style={{ position: 'relative', width: 380, backgroundColor: '#fff', borderRadius: 20, padding: '40px 32px', textAlign: 'center', boxShadow: '0 24px 64px rgba(0,0,0,0.22)', animation: 'scaleIn 0.18s ease' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
          <CheckCircle2 size={32} color="#10B981" strokeWidth={1.6} />
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#0F172A', marginBottom: 8 }}>Template Deployed!</div>
        <div style={{ fontSize: 14, color: '#64748B', marginBottom: 28, lineHeight: 1.6 }}>
          <strong style={{ color: '#0F172A' }}>{title}</strong> template has been loaded into the Agent creation flow. Redirecting now…
        </div>
        <button onClick={onClose} style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, padding: '11px 28px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}>
          Go to Agents →
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function Templates() {
  const navigate = useNavigate();
  const [deployed,  setDeployed]  = useState<string | null>(null);
  const [viewLogic, setViewLogic] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDeploy = (tpl: typeof TEMPLATES[0]) => {
    setDeployed(tpl.id);
    setTimeout(() => {
      setDeployed(null);
      navigate('/agents', {
        state: {
          openCreateModal: true,
          templatePreset: { frequency: tpl.frequency, alertLevel: tpl.alertLevel, controls: tpl.controls, name: `${tpl.title} Agent` },
        },
      });
      toast.success(`${tpl.title} template deployed to Agent creation`);
    }, 1800);
  };

  const logicTpl = TEMPLATES.find(t => t.id === viewLogic);

  return (
    <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Agent Templates</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '6px 0 0' }}>
          Pre-built agent personalities. Inspect the AI logic before deploying.
        </p>
      </div>

      {/* Template grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(460px, 1fr))', gap: 20 }}>
        {TEMPLATES.map(tpl => {
          const Icon = tpl.icon;
          const isHov = hoveredId === tpl.id;
          return (
            <div
              key={tpl.id}
              onMouseEnter={() => setHoveredId(tpl.id)}
              onMouseLeave={() => setHoveredId(null)}
              style={{
                backgroundColor: '#fff',
                border: `1px solid ${isHov ? tpl.color : '#E2E8F0'}`,
                borderRadius: 16,
                overflow: 'hidden',
                boxShadow: isHov ? `0 8px 28px rgba(0,0,0,0.10)` : '0 1px 4px rgba(0,0,0,0.05)',
                transition: 'all 0.18s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ height: 4, backgroundColor: tpl.color }} />

              <div style={{ padding: '22px 24px', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 16 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, backgroundColor: tpl.bg, border: `1px solid ${tpl.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={24} color={tpl.color} strokeWidth={1.7} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                      <span style={{ fontSize: 17, fontWeight: 700, color: '#0F172A' }}>{tpl.title}</span>
                      <span style={{ fontSize: 11, fontWeight: 600, backgroundColor: tpl.badgeBg, color: tpl.badgeColor, padding: '2px 8px', borderRadius: 20 }}>{tpl.badge}</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#64748B' }}>{tpl.subtitle}</div>
                  </div>
                </div>

                <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: '0 0 18px' }}>{tpl.description}</p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 18 }}>
                  {tpl.capabilities.map(cap => (
                    <div key={cap} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <CheckCircle2 size={13} color={tpl.color} strokeWidth={2.5} />
                      <span style={{ fontSize: 13, color: '#334155' }}>{cap}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '4px 10px' }}>
                    <Clock size={11} color="#94A3B8" />
                    <span style={{ fontSize: 11, color: '#64748B' }}>{tpl.frequency}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '4px 10px' }}>
                    <Zap size={11} color="#94A3B8" />
                    <span style={{ fontSize: 11, color: '#64748B' }}>Alert: {tpl.alertLevel}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '4px 10px' }}>
                    <ShieldCheck size={11} color="#94A3B8" />
                    <span style={{ fontSize: 11, color: '#64748B' }}>{tpl.controls.length} controls</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: 20, padding: '4px 10px' }}>
                    <AlertTriangle size={11} color="#94A3B8" />
                    <span style={{ fontSize: 11, color: '#64748B' }}>{tpl.logic.length} triggers</span>
                  </div>
                </div>
              </div>

              {/* Footer — View Logic + Deploy */}
              <div style={{ padding: '14px 24px', borderTop: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FAFBFC' }}>
                <button
                  onClick={() => setViewLogic(tpl.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 5, backgroundColor: '#fff', color: '#64748B', border: '1px solid #E2E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s' }}
                  className="hover:border-[#94A3B8] hover:text-[#334155]"
                >
                  <Eye size={13} /> View Logic
                </button>
                <button
                  onClick={() => handleDeploy(tpl)}
                  style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: tpl.color, color: '#fff', border: 'none', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'opacity 0.15s' }}
                  className="hover:opacity-90"
                >
                  Deploy <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Custom Personality — dashed card */}
        <div
          onMouseEnter={() => setHoveredId('custom')}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => navigate('/agents', { state: { openCreateModal: true, templatePreset: { name: 'Custom Agent' } } })}
          style={{
            backgroundColor: hoveredId === 'custom' ? '#F8FAFC' : '#fff',
            border: `2px dashed ${hoveredId === 'custom' ? '#94A3B8' : '#CBD5E1'}`,
            borderRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            cursor: 'pointer',
            transition: 'all 0.18s ease',
            textAlign: 'center',
            minHeight: 280,
          }}
        >
          <div style={{ width: 56, height: 56, borderRadius: 16, backgroundColor: hoveredId === 'custom' ? '#E2E8F0' : '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 16, transition: 'background 0.15s' }}>
            <Pencil size={24} color="#94A3B8" strokeWidth={1.5} />
          </div>
          <div style={{ fontSize: 17, fontWeight: 700, color: '#334155', marginBottom: 8 }}>Create Custom Personality</div>
          <div style={{ fontSize: 13, color: '#94A3B8', lineHeight: 1.6, maxWidth: 260, marginBottom: 20 }}>
            Define your own monitoring parameters, triggers, and anomaly detection rules from scratch.
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#F1F5F9', border: '1px solid #E2E8F0', borderRadius: 8, padding: '8px 16px', fontSize: 13, fontWeight: 600, color: '#64748B' }}>
            <Plus size={14} /> Start from scratch
          </div>
        </div>
      </div>

      {/* Modals */}
      {deployed && (
        <DeployedOverlay
          title={TEMPLATES.find(t => t.id === deployed)?.title ?? ''}
          onClose={() => setDeployed(null)}
        />
      )}
      {viewLogic && logicTpl && (
        <AnomalyPreviewModal tpl={logicTpl} onClose={() => setViewLogic(null)} />
      )}

      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

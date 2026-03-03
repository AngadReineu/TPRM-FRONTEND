import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, X, CheckCircle2, Check, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';

const riskData = [
  { month: 'Aug', overall: 72, critical: 15, high: 28 },
  { month: 'Sep', overall: 68, critical: 12, high: 25 },
  { month: 'Oct', overall: 75, critical: 18, high: 32 },
  { month: 'Nov', overall: 70, critical: 14, high: 30 },
  { month: 'Dec', overall: 65, critical: 11, high: 24 },
  { month: 'Jan', overall: 63, critical: 10, high: 22 },
  { month: 'Feb', overall: 62, critical: 9, high: 20 },
];

interface Action {
  id: string;
  title: string;
  detail: string;
  scoreReduction: number;
  owner: string;
  effort: 'Low' | 'Medium' | 'High';
}

interface RiskEvent {
  date: string;
  supplier: string;
  desc: string;
  severity: string;
  scoreChange: string;
  status: string;
  currentScore: number;
  category: string;
  fullDetail: string;
  impact: string;
  actions: Action[];
}

const riskEvents: RiskEvent[] = [
  {
    date: 'Feb 25, 2026', supplier: 'GHI Technologies', desc: 'Assessment overdue — 32 days, no response',
    severity: 'Critical', scoreChange: '+8', status: 'Open', currentScore: 91,
    category: 'Assessment Compliance',
    fullDetail: 'GHI Technologies has failed to complete their annual risk assessment. The portal was sent 32 days ago with no response. Three automated follow-up emails have gone unanswered. This creates a critical visibility gap in the supply chain risk posture and constitutes a contractual breach under Section 4.2 of the vendor agreement.',
    impact: 'Without a completed assessment, compliance certifications, PII handling practices, and current security posture cannot be verified. The score has increased by +8 points — any further delay risks contractual penalties and regulatory exposure.',
    actions: [
      { id: 'a1', title: 'Send formal legal notice via certified email', detail: 'Draft and send a formal notice citing contractual obligations under Section 4.2 of the vendor agreement. CC legal and procurement.', scoreReduction: -3, owner: 'Legal / Compliance', effort: 'Medium' },
      { id: 'a2', title: 'Escalate to GHI Technologies\' executive contact', detail: 'Bypass standard contact and reach CTO/VP directly via phone or LinkedIn. Document all communication attempts.', scoreReduction: -2, owner: 'Risk Manager', effort: 'Low' },
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
    fullDetail: 'Automated document monitoring detected that Call Center Outsourcing\'s ISO 27001 certification expires on March 15, 2026 — 22 days from now. The vendor has not provided a renewal confirmation or an updated certificate. ISO 27001 certification is a contractual requirement and impacts their risk score under the certification scoring model.',
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
    fullDetail: 'Agent A2 logged a data feed interruption from MNO Partners\' assessment portal. No telemetry, evidence uploads, or portal activity was detected for 7 consecutive days (Feb 3–10). The portal connection was restored on Feb 10 after a credential refresh, and data sync was confirmed. Root cause: expired API token on the supplier side.',
    impact: 'While resolved, the 7-day data gap created a temporary blind spot in compliance monitoring. Score increased by +2 and has since partially recovered. Mitigation measures implemented.',
    actions: [
      { id: 'd1', title: 'Implement automated API token rotation reminder', detail: 'Set up a monthly token rotation check for MNO Partners\' portal integration with a 14-day advance notification.', scoreReduction: -1, owner: 'Agent A2', effort: 'Low' },
      { id: 'd2', title: 'Add redundant data feed from email backup channel', detail: 'Configure a fallback email-based data submission for MNO Partners in case API feed fails again.', scoreReduction: -1, owner: 'IT Admin', effort: 'Medium' },
    ],
  },
  {
    date: 'Feb 05, 2026', supplier: 'XYZ Corporation', desc: 'Encryption at Rest coverage dropped below 70%',
    severity: 'Medium', scoreChange: '+4', status: 'In Review', currentScore: 78,
    category: 'Control Threshold Breach',
    fullDetail: 'Agent A2 detected that XYZ Corporation\'s Encryption at Rest coverage dropped to 67% (threshold: 70%) following the addition of 106 new Azure VM assets that were provisioned without the default encryption policy applied. The assets are in the production environment.',
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

const aiRecommendations = [
  'Escalate GHI Technologies assessment — 32 days overdue with no response. Consider sending legal notice.',
  'Initiate ISO 27001 renewal process for Call Center Outsourcing before expiry on Mar 15, 2026.',
  'Review and update MFA Enforcement control scope — 3 suppliers out of compliance.',
  'Consider offboarding DEF Limited from Upgradation stage due to consistently elevated risk scores.',
  'Schedule quarterly access review for all Retention-stage suppliers — last review was 4 months ago.',
];

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF', border: '1px solid #E2E8F0', borderRadius: 12,
  padding: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

const severityColors: Record<string, [string, string]> = {
  Critical: ['#FEF2F2', '#EF4444'],
  High: ['#FFFBEB', '#F59E0B'],
  Medium: ['#F1F5F9', '#64748B'],
  Low: ['#ECFDF5', '#10B981'],
};

const statusColors: Record<string, [string, string]> = {
  Open: ['#FEF2F2', '#EF4444'],
  'In Review': ['#FFFBEB', '#F59E0B'],
  Resolved: ['#ECFDF5', '#10B981'],
};

const effortColors: Record<string, [string, string]> = {
  Low: ['#ECFDF5', '#10B981'],
  Medium: ['#FFFBEB', '#F59E0B'],
  High: ['#FEF2F2', '#EF4444'],
};

/* ── Risk Event Detail Modal ─────────────────────────── */
function RiskDetailModal({ event, onClose }: { event: RiskEvent; onClose: () => void }) {
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const n = new Set(doneActions);
    if (n.has(id)) { n.delete(id); } else {
      n.add(id);
      const action = event.actions.find(a => a.id === id);
      if (action) toast.success(`Action completed: "${action.title}"`);
    }
    setDoneActions(n);
  };

  const totalReduction = event.actions.filter(a => doneActions.has(a.id)).reduce((s, a) => s + a.scoreReduction, 0);
  const projectedScore = Math.max(0, event.currentScore + totalReduction);
  const remainingReduction = event.actions.filter(a => !doneActions.has(a.id)).reduce((s, a) => s + a.scoreReduction, 0);
  const [sevBg, sevColor] = severityColors[event.severity] ?? ['#F1F5F9', '#64748B'];
  const [stsBg, stsColor] = statusColors[event.status] ?? ['#F1F5F9', '#64748B'];

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.45)' }} />
      <div style={{
        position: 'relative', width: 720, maxHeight: '90vh',
        backgroundColor: '#fff', borderRadius: 16, display: 'flex', flexDirection: 'column',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)', zIndex: 1,
      }}>
        {/* Header */}
        <div style={{ padding: '22px 28px 16px', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ backgroundColor: sevBg, color: sevColor, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 5 }}>{event.severity}</span>
                <span style={{ backgroundColor: stsBg, color: stsColor, fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 5 }}>{event.status}</span>
                <span style={{ fontSize: 12, color: '#94A3B8' }}>{event.date}</span>
              </div>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', margin: '0 0 4px' }}>{event.supplier}</h2>
              <div style={{ fontSize: 13, color: '#64748B' }}>{event.desc}</div>
            </div>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94A3B8', padding: 4, flexShrink: 0 }}><X size={20} /></button>
          </div>
        </div>

        {/* Score Banner */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', borderBottom: '1px solid #E2E8F0', flexShrink: 0 }}>
          <div style={{ padding: '14px 24px', borderRight: '1px solid #E2E8F0' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Current Risk Score</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#EF4444' }}>{event.currentScore}</div>
          </div>
          <div style={{ padding: '14px 24px', borderRight: '1px solid #E2E8F0', backgroundColor: doneActions.size > 0 ? '#ECFDF5' : '#F8FAFC' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Projected After Actions</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: doneActions.size > 0 ? '#10B981' : '#94A3B8', display: 'flex', alignItems: 'center', gap: 6 }}>
              {projectedScore}
              {doneActions.size > 0 && <TrendingDown size={18} color="#10B981" />}
            </div>
          </div>
          <div style={{ padding: '14px 24px' }}>
            <div style={{ fontSize: 10, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 4 }}>Max Possible Reduction</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: '#0EA5E9' }}>
              {event.actions.reduce((s, a) => s + a.scoreReduction, 0)} pts
            </div>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* What happened */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>What Happened</div>
            <p style={{ fontSize: 14, color: '#334155', margin: 0, lineHeight: 1.65, backgroundColor: '#F8FAFC', padding: '14px 16px', borderRadius: 10, border: '1px solid #E2E8F0' }}>
              {event.fullDetail}
            </p>
          </div>

          {/* Business Impact */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Business Impact</div>
            <div style={{ backgroundColor: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10 }}>
              <AlertTriangle size={16} color="#F59E0B" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 13, color: '#92400E', margin: 0, lineHeight: 1.6 }}>{event.impact}</p>
            </div>
          </div>

          {/* Action Plan */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                Remediation Action Plan
              </div>
              {doneActions.size > 0 && (
                <span style={{ fontSize: 12, fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '3px 10px', borderRadius: 20 }}>
                  {doneActions.size}/{event.actions.length} completed · {totalReduction} pts reduced
                </span>
              )}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {event.actions.map((action, i) => {
                const done = doneActions.has(action.id);
                const [efBg, efColor] = effortColors[action.effort];
                return (
                  <div
                    key={action.id}
                    style={{
                      border: `1px solid ${done ? '#A7F3D0' : '#E2E8F0'}`,
                      borderRadius: 10, padding: '14px 16px',
                      backgroundColor: done ? '#F0FDF4' : '#fff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                      {/* Checkbox */}
                      <div
                        onClick={() => toggle(action.id)}
                        style={{
                          width: 22, height: 22, borderRadius: 6, flexShrink: 0, cursor: 'pointer', marginTop: 1,
                          border: done ? '2px solid #10B981' : '2px solid #CBD5E1',
                          backgroundColor: done ? '#10B981' : '#fff',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                      >
                        {done && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 4 }}>
                          <span style={{ fontSize: 11, color: '#94A3B8', fontWeight: 600 }}>{i + 1}</span>
                          <span style={{ fontSize: 14, fontWeight: 600, color: done ? '#10B981' : '#0F172A', textDecoration: done ? 'line-through' : 'none' }}>
                            {action.title}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: '#64748B', margin: '0 0 8px', lineHeight: 1.5 }}>{action.detail}</p>
                        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 5 }}>
                            {action.scoreReduction} pts
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: 5 }}>
                            Owner: {action.owner}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 500, color: efColor, backgroundColor: efBg, padding: '2px 8px', borderRadius: 5 }}>
                            Effort: {action.effort}
                          </span>
                        </div>
                      </div>
                      {done && <CheckCircle2 size={18} color="#10B981" style={{ flexShrink: 0 }} />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 28px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexShrink: 0, backgroundColor: '#F8FAFC', borderRadius: '0 0 16px 16px' }}>
          <div style={{ fontSize: 13, color: '#64748B' }}>
            {doneActions.size === 0
              ? `${event.actions.length} actions available · up to ${event.actions.reduce((s, a) => s + a.scoreReduction, 0)} pts reduction`
              : `${doneActions.size} done · ${projectedScore} projected score`
            }
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} style={{ backgroundColor: '#fff', color: '#334155', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 16px', fontSize: 13, cursor: 'pointer' }}>
              Close
            </button>
            <button
              onClick={() => { toast.success(`Action plan exported for ${event.supplier}`); }}
              style={{ backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function RiskThreat() {
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200 }}>
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Risk Threat</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Monitor risk trends and respond to threats</p>
      </div>

      {/* Risk Trend Chart */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Risk Score Trend — Aug 2025 to Feb 2026</div>
          <select style={{ padding: '6px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
            <option>Last 7 months</option><option>Last 12 months</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={riskData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} labelStyle={{ color: '#0F172A', fontWeight: 600 }} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} iconType="circle" />
            <Line type="monotone" dataKey="overall" name="Overall Risk" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="high" name="High" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Events + AI Recommendations */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20 }}>
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Risk Events Timeline</div>
            <div style={{ fontSize: 12, color: '#94A3B8' }}>Click a row to view details & action plan</div>
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Date', 'Supplier', 'Description', 'Severity', 'Score Δ', 'Status'].map(h => (
                  <th key={h} style={{ padding: '8px 12px', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskEvents.map((evt, idx) => {
                const [sevBg, sevColor] = severityColors[evt.severity] ?? ['#F1F5F9', '#64748B'];
                const [stsBg, stsColor] = statusColors[evt.status] ?? ['#F1F5F9', '#64748B'];
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedEvent(evt)}
                    style={{ borderBottom: idx < riskEvents.length - 1 ? '1px solid #F1F5F9' : 'none', cursor: 'pointer' }}
                    className="hover:bg-[#F0F9FF]"
                  >
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>{evt.date}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: '#0EA5E9', whiteSpace: 'nowrap', textDecoration: 'underline', textDecorationStyle: 'dotted', textUnderlineOffset: 3 }}>{evt.supplier}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, color: '#64748B', maxWidth: 200 }}>{evt.desc}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ backgroundColor: sevBg, color: sevColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>{evt.severity}</span>
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 700, color: evt.scoreChange !== '0' ? '#EF4444' : '#10B981' }}>{evt.scoreChange}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ backgroundColor: stsBg, color: stsColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>{evt.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Recommendations */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Lightbulb size={16} color="#0EA5E9" />
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>AI Recommendations</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {aiRecommendations.map((rec, idx) => (
              <div key={idx} style={{ display: 'flex', gap: 10, padding: '10px 12px', backgroundColor: '#F8FAFC', borderRadius: 8, border: '1px solid #E2E8F0' }}>
                <div style={{ width: 20, height: 20, borderRadius: '50%', backgroundColor: '#EFF6FF', border: '2px solid #0EA5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#0EA5E9', marginTop: 1 }}>
                  {idx + 1}
                </div>
                <p style={{ fontSize: 13, color: '#334155', margin: 0, lineHeight: 1.5 }}>{rec}</p>
              </div>
            ))}
          </div>
          <button style={{ width: '100%', marginTop: 14, padding: '9px', backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE', borderRadius: 8, color: '#0EA5E9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
            Refresh Recommendations
          </button>
        </div>
      </div>

      {selectedEvent && <RiskDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}

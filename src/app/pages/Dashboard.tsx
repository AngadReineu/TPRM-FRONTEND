import {
  TrendingUp, AlertCircle, ChevronRight,
  Package, ShieldAlert, Bot, FileText, ScanSearch,
  Activity, Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* ══════════════════════════════════════════════════════
   DESIGN TOKENS
   ══════════════════════════════════════════════════════ */
const token = {
  surface    : '#FFFFFF',
  border     : '#E9EEF4',
  shadow     : '0 1px 4px rgba(15,23,42,0.06), 0 1px 2px rgba(15,23,42,0.04)',
  radius     : 14,
  padding    : 24,
  labelSize  : 11,
  metricSize : 38,
} as const;

/* ══════════════════════════════════════════════════════
   WIDGET CARD — base container for every panel
   ══════════════════════════════════════════════════════ */
function WidgetCard({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        backgroundColor: token.surface,
        border        : `1px solid ${token.border}`,
        borderRadius  : token.radius,
        padding       : token.padding,
        boxShadow     : token.shadow,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   WIDGET HEADER — title + optional action link
   ══════════════════════════════════════════════════════ */
function WidgetHeader({
  title,
  subtitle,
  action,
  onAction,
}: {
  title    : string;
  subtitle?: string;
  action  ?: string;
  onAction?: () => void;
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>{title}</div>
        {subtitle && <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{subtitle}</div>}
      </div>
      {action && onAction && (
        <button
          onClick={onAction}
          style={{ fontSize: 13, color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500, flexShrink: 0 }}
        >
          {action}
        </button>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   STAGE BADGE
   ══════════════════════════════════════════════════════ */
function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, [string, string]> = {
    Acquisition: ['#EFF6FF', '#0EA5E9'],
    Retention   : ['#ECFDF5', '#10B981'],
    Upgradation : ['#FFFBEB', '#F59E0B'],
    Offboarding : ['#F1F5F9', '#64748B'],
  };
  const [bg, text] = colors[stage] ?? ['#F1F5F9', '#64748B'];
  return (
    <span style={{ backgroundColor: bg, color: text, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6, letterSpacing: '0.01em' }}>
      {stage}
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   SPARKLINE
   ══════════════════════════════════════════════════════ */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 110, h = 32;
  const max = Math.max(...data), min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 6) - 3}`)
    .join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ══════════════════════════════════════════════════════
   MINI PROGRESS BAR
   ══════════════════════════════════════════════════════ */
function MiniBar({ pct, color, bg }: { pct: number; color: string; bg: string }) {
  return (
    <div style={{ height: 4, backgroundColor: bg, borderRadius: 99, width: '100%', marginTop: 14 }}>
      <div style={{ height: 4, width: `${pct}%`, backgroundColor: color, borderRadius: 99, transition: 'width 0.4s ease' }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   SEGMENT BAR
   ══════════════════════════════════════════════════════ */
function SegmentBar({ active, total }: { active: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 3, marginTop: 14 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ height: 4, flex: 1, borderRadius: 2, backgroundColor: i < active ? '#10B981' : '#E2E8F0' }} />
      ))}
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   PULSING LIVE DOT
   ══════════════════════════════════════════════════════ */
function PulseDot({ color = '#10B981' }: { color?: string }) {
  return (
    <span style={{ position: 'relative', display: 'inline-flex', width: 9, height: 9, flexShrink: 0 }}>
      <span style={{
        position: 'absolute', display: 'inline-flex', width: '100%', height: '100%',
        borderRadius: '50%', backgroundColor: color, opacity: 0.45,
        animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
      }} />
      <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', width: 9, height: 9, backgroundColor: color }} />
    </span>
  );
}

/* ══════════════════════════════════════════════════════
   KPI WIDGET
   ══════════════════════════════════════════════════════ */
function KpiWidget({
  icon,
  iconBg,
  iconColor,
  label,
  value,
  valueColor,
  sub,
  subColor,
  sparkData,
  sparkColor,
  barPct,
  barColor,
  barBg,
  liveIndicator,
  liveLabel,
  children,
}: {
  icon         : React.ReactNode;
  iconBg       : string;
  iconColor    : string;
  label        : string;
  value        : string | number;
  valueColor  ?: string;
  sub          : React.ReactNode;
  subColor    ?: string;
  sparkData   ?: number[];
  sparkColor  ?: string;
  barPct      ?: number;
  barColor    ?: string;
  barBg       ?: string;
  liveIndicator?: boolean;
  liveLabel   ?: string;
  children    ?: React.ReactNode;
}) {
  return (
    <WidgetCard>
      {/* Icon + Label row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{
          width: 30, height: 30, borderRadius: 8,
          backgroundColor: iconBg,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <span style={{ color: iconColor, display: 'flex' }}>{icon}</span>
        </div>
        <span style={{
          fontSize: token.labelSize, fontWeight: 600, color: '#94A3B8',
          textTransform: 'uppercase', letterSpacing: '0.07em',
        }}>
          {label}
        </span>
      </div>

      {/* Metric value */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontSize: token.metricSize, fontWeight: 800, color: valueColor ?? '#0F172A', lineHeight: 1, letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {liveIndicator && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <PulseDot />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 8px', borderRadius: 20 }}>
              {liveLabel ?? 'Live'}
            </span>
          </div>
        )}
      </div>

      {/* Sparkline */}
      {sparkData && sparkColor && (
        <div style={{ marginTop: 10 }}>
          <Sparkline data={sparkData} color={sparkColor} />
        </div>
      )}

      {/* Sub-label */}
      <div style={{ fontSize: 12, color: subColor ?? '#64748B', marginTop: 6, display: 'flex', alignItems: 'center', gap: 4 }}>
        {sub}
      </div>

      {/* Bar */}
      {barPct !== undefined && barColor && barBg && (
        <MiniBar pct={barPct} color={barColor} bg={barBg} />
      )}

      {/* Extra content (e.g. SegmentBar) */}
      {children}
    </WidgetCard>
  );
}

/* ══════════════════════════════════════════════════════
   DATA
   ══════════════════════════════════════════════════════ */
const stageData = [
  { stage: 'Acquisition', color: '#0EA5E9', count: 18, critical: 2, high: 4, medium: 8, low: 4 },
  { stage: 'Retention',   color: '#10B981', count: 14, critical: 1, high: 3, medium: 6, low: 4 },
  { stage: 'Upgradation', color: '#F59E0B', count: 10, critical: 0, high: 2, medium: 5, low: 3 },
  { stage: 'Offboarding', color: '#94A3B8', count: 6,  critical: 1, high: 1, medium: 2, low: 2 },
];
const totalSuppliers = 48;

const agentRows = [
  { initials: 'A1', color: '#0EA5E9', name: 'Agent A1', stage: 'Acquisition', status: '3 checks complete · 1 alert open',  statusColor: '#F59E0B', isActive: true  },
  { initials: 'A2', color: '#10B981', name: 'Agent A2', stage: 'Retention',   status: 'Running · Last active 8 min ago',  statusColor: '#64748B', isActive: true  },
  { initials: 'A3', color: '#8B5CF6', name: 'Agent A3', stage: 'Upgradation', status: 'All clear · Last active 1 hr ago', statusColor: '#10B981', isActive: true  },
  { initials: 'A4', color: '#F59E0B', name: 'Agent A4', stage: 'Retention',   status: 'Idle · Last active 3 hrs ago',     statusColor: '#94A3B8', isActive: false },
  { initials: 'A5', color: '#EF4444', name: 'Agent A5', stage: 'Acquisition', status: '2 checks complete · No alerts',    statusColor: '#10B981', isActive: true  },
];

const riskTrendData = [
  { month: 'Aug', overall: 72, critical: 15, high: 28 },
  { month: 'Sep', overall: 68, critical: 12, high: 25 },
  { month: 'Oct', overall: 75, critical: 18, high: 32 },
  { month: 'Nov', overall: 70, critical: 14, high: 30 },
  { month: 'Dec', overall: 65, critical: 11, high: 24 },
  { month: 'Jan', overall: 63, critical: 10, high: 22 },
  { month: 'Feb', overall: 62, critical: 9,  high: 20 },
];

const riskAlerts = [
  { type: 'Truth Gap Detected', supplier: 'Field Agent Co.',      system: 'Salesforce CRM',  severity: '#EF4444', severityBg: '#FEF2F2' },
  { type: 'SLA Violation',       supplier: 'Call Center Ltd.',    system: 'ITSM Portal',     severity: '#F59E0B', severityBg: '#FFFBEB' },
  { type: 'Contract Anomaly',    supplier: 'XYZ Corp.',          system: 'DocuSign Audit',  severity: '#F59E0B', severityBg: '#FFFBEB' },
  { type: 'Cert Expiring Soon',  supplier: 'GHI Technologies',   system: 'ISO 27001',       severity: '#64748B', severityBg: '#F1F5F9' },
  { type: 'Data Gap Detected',   supplier: 'MNO Partners',       system: 'No data · 7 days',severity: '#64748B', severityBg: '#F1F5F9' },
];

/* ══════════════════════════════════════════════════════
   DASHBOARD
   ══════════════════════════════════════════════════════ */
export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28, maxWidth: 1280 }}>

      {/* ── Welcome Banner ── */}
      <WidgetCard style={{ padding: '18px 28px', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 19, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>Good morning, Priya</div>
            <div style={{ fontSize: 13, color: '#64748B', marginTop: 3 }}>ABC Insurance Company · Healthcare · Mumbai</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Overall Risk Posture</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 22, fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>62 / 100</span>
                <span style={{ backgroundColor: '#FFFBEB', color: '#D97706', fontSize: 12, fontWeight: 700, padding: '4px 12px', borderRadius: 20, border: '1px solid #FDE68A' }}>
                  Medium
                </span>
              </div>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* ── KPI Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 20 }}>

        <KpiWidget
          icon={<Package size={15} />}
          iconBg="#EFF6FF" iconColor="#0EA5E9"
          label="Total Suppliers"
          value={48}
          sparkData={[10, 25, 18, 40, 35, 55, 42, 60, 55, 72, 68, 85]}
          sparkColor="#0EA5E9"
          sub={<><TrendingUp size={12} color="#10B981" /><span style={{ color: '#10B981', fontWeight: 600 }}>+12% vs last quarter</span></>}
        />

        <KpiWidget
          icon={<ShieldAlert size={15} />}
          iconBg="#FEF2F2" iconColor="#EF4444"
          label="High Risk"
          value={15}
          valueColor="#EF4444"
          sub={<><AlertCircle size={12} color="#F59E0B" /><span>3 require immediate attention</span></>}
          barPct={31} barColor="#EF4444" barBg="#FEE2E2"
        />

        <KpiWidget
          icon={<Bot size={15} />}
          iconBg="#ECFDF5" iconColor="#10B981"
          label="Active Agents"
          value={14}
          liveIndicator
          sub={<span>12 monitoring · 2 idle</span>}
          barPct={undefined}
          sparkData={undefined}
        >
          <SegmentBar active={12} total={14} />
        </KpiWidget>

        <KpiWidget
          icon={<FileText size={15} />}
          iconBg="#FFFBEB" iconColor="#F59E0B"
          label="Assessments"
          value={23}
          valueColor="#D97706"
          sub={<><AlertCircle size={12} color="#F59E0B" /><span>5 overdue &gt;30 days</span></>}
          barPct={48} barColor="#F59E0B" barBg="#FEF9C3"
        />

        <KpiWidget
          icon={<ScanSearch size={15} />}
          iconBg="#FEF2F2" iconColor="#EF4444"
          label="Truth Gap Alerts"
          value={6}
          valueColor="#EF4444"
          sub={<><AlertCircle size={12} color="#EF4444" /><span style={{ color: '#EF4444', fontWeight: 600 }}>2 require investigation</span></>}
          barPct={40} barColor="#EF4444" barBg="#FEE2E2"
        />
      </div>

      {/* ── Analytics Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>

        {/* Supplier Risk by Stage */}
        <WidgetCard>
          <WidgetHeader title="Supplier Risk by Stage" action="View All →" onAction={() => navigate('/tprm')} />
          <div>
            {stageData.map((s, idx) => (
              <div
                key={s.stage}
                onClick={() => navigate('/tprm')}
                style={{ padding: '13px 0', borderBottom: idx < stageData.length - 1 ? `1px solid ${token.border}` : 'none', cursor: 'pointer' }}
                className="hover:bg-[#F8FAFC] rounded-lg transition-colors"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#334155', flex: 1 }}>{s.stage}</span>
                  <span style={{ fontSize: 13, color: '#64748B' }}>{s.count} suppliers</span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
                <div style={{ marginLeft: 20, marginBottom: 4 }}>
                  <div style={{ height: 7, backgroundColor: '#F1F5F9', borderRadius: 99, width: '100%' }}>
                    <div style={{ height: 7, borderRadius: 99, width: `${(s.count / totalSuppliers) * 100}%`, background: `linear-gradient(90deg, ${s.color}, #F59E0B)` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 5, fontSize: 12 }}>
                    {s.critical > 0 && <span style={{ color: '#EF4444', fontWeight: 600 }}>{s.critical} Critical</span>}
                    {s.high > 0    && <span style={{ color: '#F59E0B', fontWeight: 600 }}>{s.high} High</span>}
                    {s.medium > 0  && <span style={{ color: '#64748B' }}>{s.medium} Medium</span>}
                    {s.low > 0     && <span style={{ color: '#10B981' }}>{s.low} Low</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Risk Score Trend */}
        <WidgetCard>
          <WidgetHeader title="Risk Score Trend" subtitle="Aug 2025 – Feb 2026" action="Full Report →" onAction={() => navigate('/risk-threat')} />
          <ResponsiveContainer width="100%" height={228}>
            <LineChart data={riskTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: `1px solid ${token.border}`, borderRadius: 8, fontSize: 12, boxShadow: token.shadow }}
                labelStyle={{ color: '#0F172A', fontWeight: 700 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 10 }} iconType="circle" />
              <Line type="monotone" dataKey="overall"  name="Overall"  stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 3" />
              <Line type="monotone" dataKey="high"     name="High"     stroke="#F59E0B" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 3" />
            </LineChart>
          </ResponsiveContainer>
        </WidgetCard>
      </div>

      {/* ── Operations Row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '3fr 2fr', gap: 20 }}>

        {/* Agent Activity */}
        <WidgetCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Activity size={15} color="#10B981" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>Agent Activity</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <PulseDot />
              <span style={{ fontSize: 12, color: '#10B981', fontWeight: 600 }}>5 agents live</span>
            </div>
          </div>
          <div>
            {agentRows.map((agent, idx) => (
              <div
                key={agent.name}
                style={{
                  display: 'flex', alignItems: 'center', gap: 13,
                  padding: '10px 8px',
                  borderBottom: idx < agentRows.length - 1 ? `1px solid ${token.border}` : 'none',
                  cursor: 'pointer', borderRadius: 8,
                }}
                className="hover:bg-[#F8FAFC] transition-colors"
              >
                {/* Avatar with live dot */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', backgroundColor: agent.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                  }}>
                    {agent.initials}
                  </div>
                  {agent.isActive && (
                    <span style={{
                      position: 'absolute', bottom: 0, right: -1,
                      width: 9, height: 9, borderRadius: '50%',
                      backgroundColor: '#10B981', border: '2px solid #fff',
                    }} />
                  )}
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#334155', minWidth: 68 }}>{agent.name}</div>
                <StageBadge stage={agent.stage} />
                <div style={{ fontSize: 12, color: agent.statusColor, flex: 1 }}>{agent.status}</div>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Recent Risk Alerts */}
        <WidgetCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: '#FEF2F2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Zap size={15} color="#EF4444" />
              </div>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#0F172A', letterSpacing: '-0.01em' }}>Recent Risk Alerts</span>
            </div>
            <button
              onClick={() => navigate('/risk-threat')}
              style={{ fontSize: 13, color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              View All →
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {riskAlerts.map((alert, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '10px 12px', borderRadius: 10,
                  backgroundColor: alert.severityBg,
                  cursor: 'pointer',
                }}
                className="hover:opacity-90 transition-opacity"
              >
                <div style={{
                  width: 8, height: 8, borderRadius: '50%',
                  backgroundColor: alert.severity,
                  marginTop: 4, flexShrink: 0,
                }} />
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0F172A' }}>{alert.type}</div>
                  <div style={{ fontSize: 12, color: '#64748B', marginTop: 1 }}>Supplier: {alert.supplier}</div>
                  <div style={{ fontSize: 11, color: '#94A3B8', marginTop: 1 }}>{alert.system}</div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>

      <style>{`@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
  );
}


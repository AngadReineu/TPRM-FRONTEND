import { TrendingUp, AlertCircle, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

/* ── Helpers ─────────────────────────────────────────── */
const card = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  padding: 24,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
} as React.CSSProperties;

function StageBadge({ stage }: { stage: string }) {
  const colors: Record<string, [string, string]> = {
    Acquisition: ['#EFF6FF', '#0EA5E9'],
    Retention: ['#ECFDF5', '#10B981'],
    Upgradation: ['#FFFBEB', '#F59E0B'],
    Offboarding: ['#F1F5F9', '#64748B'],
  };
  const [bg, text] = colors[stage] ?? ['#F1F5F9', '#64748B'];
  return (
    <span style={{ backgroundColor: bg, color: text, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6 }}>
      {stage}
    </span>
  );
}

/* ── Sparkline ───────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
  const w = 120, h = 36;
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

/* ── Coverage Bar ────────────────────────────────────── */
function MiniBar({ pct, color, bg }: { pct: number; color: string; bg: string }) {
  return (
    <div style={{ height: 4, backgroundColor: bg, borderRadius: 99, width: '100%', marginTop: 12 }}>
      <div style={{ height: 4, width: `${pct}%`, backgroundColor: color, borderRadius: 99 }} />
    </div>
  );
}

/* ── Agent segment bar ───────────────────────────────── */
function SegmentBar({ active, total }: { active: number; total: number }) {
  return (
    <div style={{ display: 'flex', gap: 2, marginTop: 12 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          style={{
            height: 4,
            flex: 1,
            borderRadius: 2,
            backgroundColor: i < active ? '#10B981' : '#E2E8F0',
          }}
        />
      ))}
    </div>
  );
}

/* ── Stage Risk Row ──────────────────────────────────── */
const stageData = [
  { stage: 'Acquisition', color: '#0EA5E9', count: 18, critical: 2, high: 4, medium: 8, low: 4 },
  { stage: 'Retention', color: '#10B981', count: 14, critical: 1, high: 3, medium: 6, low: 4 },
  { stage: 'Upgradation', color: '#F59E0B', count: 10, critical: 0, high: 2, medium: 5, low: 3 },
  { stage: 'Offboarding', color: '#94A3B8', count: 6, critical: 1, high: 1, medium: 2, low: 2 },
];
const totalSuppliers = 48;

/* ── Action Items ────────────────────────────────────── */
const actionItems = [
  {
    dot: '#EF4444',
    supplier: 'GHI Technologies',
    issue: 'Assessment overdue · 32 days',
    stage: 'Acquisition',
    button: 'Send Reminder',
  },
  {
    dot: '#F59E0B',
    supplier: 'Supplier D (Call Center Co.)',
    issue: 'ISO 27001 cert expires in 22 days',
    stage: 'Retention',
    button: 'View',
  },
  {
    dot: '#F59E0B',
    supplier: 'MNO Partners',
    issue: 'No data received · 7 days',
    stage: 'Offboarding',
    button: 'Investigate',
  },
];

/* ── Agent Activity ──────────────────────────────────── */
const agentRows = [
  { initials: 'A1', color: '#0EA5E9', name: 'Agent A1', stage: 'Acquisition', status: '3 checks complete · 1 alert open', statusColor: '#F59E0B' },
  { initials: 'A2', color: '#10B981', name: 'Agent A2', stage: 'Retention', status: 'Running · Last active 8 min ago', statusColor: '#64748B' },
  { initials: 'A3', color: '#8B5CF6', name: 'Agent A3', stage: 'Upgradation', status: 'All clear · Last active 1 hr ago', statusColor: '#10B981' },
  { initials: 'A4', color: '#F59E0B', name: 'Agent A4', stage: 'Retention', status: 'Idle · Last active 3 hrs ago', statusColor: '#94A3B8' },
  { initials: 'A5', color: '#EF4444', name: 'Agent A5', stage: 'Acquisition', status: '2 checks complete · No alerts', statusColor: '#10B981' },
];

/* ── Risk Trend Data ─────────────────────────────────── */
const riskTrendData = [
  { month: 'Aug', overall: 72, critical: 15, high: 28 },
  { month: 'Sep', overall: 68, critical: 12, high: 25 },
  { month: 'Oct', overall: 75, critical: 18, high: 32 },
  { month: 'Nov', overall: 70, critical: 14, high: 30 },
  { month: 'Dec', overall: 65, critical: 11, high: 24 },
  { month: 'Jan', overall: 63, critical: 10, high: 22 },
  { month: 'Feb', overall: 62, critical: 9,  high: 20 },
];

/* ═══════════════════════════════════════════════════════ */
export function Dashboard() {
  const navigate = useNavigate();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 1200 }}>

      {/* Row 1 — Welcome Banner */}
      <div style={{ ...card, padding: '16px 24px', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#0F172A' }}>Good morning, Priya</div>
            <div style={{ fontSize: 14, color: '#64748B', marginTop: 2 }}>ABC Insurance Company · Healthcare · Mumbai</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Overall Risk Posture: 62 / 100</span>
            <span style={{ backgroundColor: '#FFFBEB', color: '#F59E0B', fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 20, border: '1px solid #FDE68A' }}>
              Medium
            </span>
          </div>
        </div>
      </div>

      {/* Row 2 — 4 KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>

        {/* Card 1 — Total Suppliers */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Total Suppliers
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#0F172A' }}>48</div>
          <Sparkline data={[10, 25, 18, 40, 35, 55, 42, 60, 55, 72, 68, 85]} color="#0EA5E9" />
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <TrendingUp size={13} color="#10B981" />
            <span style={{ fontSize: 12, color: '#10B981', fontWeight: 500 }}>+12% vs last quarter</span>
          </div>
        </div>

        {/* Card 2 — High Risk Suppliers */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            High Risk Suppliers
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#EF4444' }}>15</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <AlertCircle size={13} color="#F59E0B" />
            <span style={{ fontSize: 13, color: '#64748B' }}>3 require immediate attention</span>
          </div>
          <MiniBar pct={31} color="#EF4444" bg="#FEE2E2" />
        </div>

        {/* Card 3 — Active Agents */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Active Agents
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 32, fontWeight: 700, color: '#0F172A' }}>14</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
                <span style={{
                  position: 'absolute', display: 'inline-flex', width: '100%', height: '100%',
                  borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.5,
                  animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite',
                }} />
                <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', width: 8, height: 8, backgroundColor: '#10B981' }} />
              </span>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#10B981', backgroundColor: '#ECFDF5', padding: '2px 7px', borderRadius: 20 }}>Live</span>
            </div>
          </div>
          <div style={{ fontSize: 13, color: '#64748B', marginTop: 4 }}>12 monitoring · 2 idle</div>
          <SegmentBar active={12} total={14} />
        </div>

        {/* Card 4 — Pending Assessments */}
        <div style={card}>
          <div style={{ fontSize: 11, fontWeight: 500, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>
            Pending Assessments
          </div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#F59E0B' }}>23</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 6 }}>
            <AlertCircle size={13} color="#F59E0B" />
            <span style={{ fontSize: 13, color: '#64748B' }}>5 overdue &gt;30 days</span>
          </div>
          <MiniBar pct={48} color="#F59E0B" bg="#FFFBEB" />
        </div>
      </div>

      {/* Row 3 — Two columns */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Supplier Risk by Stage */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Supplier Risk by Stage</div>
            <button
              onClick={() => navigate('/tprm')}
              style={{ fontSize: 14, color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              View All →
            </button>
          </div>
          <div>
            {stageData.map((s, idx) => (
              <div
                key={s.stage}
                onClick={() => navigate('/tprm')}
                style={{
                  padding: '12px 0',
                  borderBottom: idx < stageData.length - 1 ? '1px solid #E2E8F0' : 'none',
                  cursor: 'pointer',
                }}
                className="hover:bg-[#F8FAFC] rounded-lg"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: s.color, flexShrink: 0 }} />
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#334155', flex: 1 }}>{s.stage}</span>
                  <span style={{ fontSize: 14, color: '#64748B' }}>{s.count} suppliers</span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
                <div style={{ marginLeft: 20, marginBottom: 4 }}>
                  <div style={{ height: 8, backgroundColor: '#F1F5F9', borderRadius: 99, width: '100%' }}>
                    <div style={{ height: 8, borderRadius: 99, width: `${(s.count / totalSuppliers) * 100}%`, background: `linear-gradient(90deg, ${s.color}, #F59E0B)` }} />
                  </div>
                  <div style={{ display: 'flex', gap: 12, marginTop: 4, fontSize: 12 }}>
                    {s.critical > 0 && <span style={{ color: '#EF4444' }}>{s.critical} Critical</span>}
                    {s.high > 0 && <span style={{ color: '#F59E0B' }}>{s.high} High</span>}
                    {s.medium > 0 && <span style={{ color: '#64748B' }}>{s.medium} Medium</span>}
                    {s.low > 0 && <span style={{ color: '#10B981' }}>{s.low} Low</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Risk Threat Trend */}
        <div style={card}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>Risk Score Trend</div>
              <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>Aug 2025 – Feb 2026</div>
            </div>
            <button
              onClick={() => navigate('/risk-threat')}
              style={{ fontSize: 13, color: '#0EA5E9', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
            >
              Full Report →
            </button>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={riskTrendData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 12 }}
                labelStyle={{ color: '#0F172A', fontWeight: 600 }}
              />
              <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} iconType="circle" />
              <Line type="monotone" dataKey="overall" name="Overall" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} />
              <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
              <Line type="monotone" dataKey="high" name="High" stroke="#F59E0B" strokeWidth={1.5} dot={{ r: 2 }} strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 4 — Agent Activity Strip */}
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#0F172A' }}>Agent Activity</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ position: 'relative', display: 'inline-flex', width: 8, height: 8 }}>
              <span style={{ position: 'absolute', display: 'inline-flex', width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#10B981', opacity: 0.5, animation: 'ping 1.5s cubic-bezier(0,0,0.2,1) infinite' }} />
              <span style={{ position: 'relative', display: 'inline-flex', borderRadius: '50%', width: 8, height: 8, backgroundColor: '#10B981' }} />
            </span>
            <span style={{ fontSize: 13, color: '#10B981', fontWeight: 500 }}>5 agents live</span>
          </div>
        </div>
        <div>
          {agentRows.map((agent, idx) => (
            <div
              key={agent.name}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '8px 0',
                borderBottom: idx < agentRows.length - 1 ? '1px solid #E2E8F0' : 'none',
                cursor: 'pointer',
              }}
              className="hover:bg-[#F8FAFC] rounded-lg"
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                backgroundColor: agent.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
              }}>
                {agent.initials}
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#334155', minWidth: 64 }}>{agent.name}</div>
              <StageBadge stage={agent.stage} />
              <div style={{ fontSize: 13, color: agent.statusColor, flex: 1 }}>{agent.status}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes ping { 75%,100% { transform: scale(2); opacity: 0; } }`}</style>
    </div>
  );
}
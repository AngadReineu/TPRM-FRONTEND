import { useState, useEffect } from 'react';
import {
  TrendingUp, AlertCircle, ChevronRight,
  Package, ShieldAlert, Bot, FileText, ScanSearch,
  Activity, Zap, Loader2,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

import { StageBadge } from '../../../components/common/StageBadge';
import { Skeleton } from '../../../components/ui/skeleton';

import { WidgetCard } from '../components/WidgetCard';
import { WidgetHeader } from '../components/WidgetHeader';
import { KpiWidget } from '../components/KpiWidget';
import { SegmentBar } from '../components/SegmentBar';
import { PulseDot } from '../components/PulseDot';

import { getDesignTokens, getDashboardSummary, MOCK_DASHBOARD_DATA } from '../services/dashboard.data';
import type { DashboardSummary } from '../types';

const token = getDesignTokens();

/* ══════════════════════════════════════════════════════
   LOADING SKELETON
   ══════════════════════════════════════════════════════ */
function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-7 max-w-[1280px]">
      {/* Welcome Banner Skeleton */}
      <WidgetCard className="!py-[18px] !px-7 !rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <Skeleton className="h-3 w-24 mb-2" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* KPI Row Skeleton */}
      <div className="grid grid-cols-5 gap-5">
        {[...Array(5)].map((_, i) => (
          <WidgetCard key={i} className="!p-5">
            <div className="flex items-center gap-2 mb-3">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-10 w-16 mb-2" />
            <Skeleton className="h-3 w-full" />
          </WidgetCard>
        ))}
      </div>

      {/* Analytics Row Skeleton */}
      <div className="grid grid-cols-2 gap-5">
        <WidgetCard>
          <Skeleton className="h-5 w-40 mb-4" />
          {[...Array(4)].map((_, i) => (
            <div key={i} className="py-3 border-b border-slate-100 last:border-0">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-2 w-3/4" />
            </div>
          ))}
        </WidgetCard>
        <WidgetCard>
          <Skeleton className="h-5 w-40 mb-4" />
          <Skeleton className="h-[228px] w-full" />
        </WidgetCard>
      </div>

      {/* Operations Row Skeleton */}
      <div className="grid gap-5 grid-cols-[3fr_2fr]">
        <WidgetCard>
          <Skeleton className="h-5 w-32 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 py-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-32 flex-1" />
            </div>
          ))}
        </WidgetCard>
        <WidgetCard>
          <Skeleton className="h-5 w-36 mb-4" />
          {[...Array(5)].map((_, i) => (
            <div key={i} className="py-2">
              <Skeleton className="h-16 w-full rounded-lg" />
            </div>
          ))}
        </WidgetCard>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   DASHBOARD PAGE
   ══════════════════════════════════════════════════════ */
export function DashboardPage() {
  const navigate = useNavigate();
  const [data, setData] = useState<DashboardSummary>(MOCK_DASHBOARD_DATA);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchData() {
      try {
        const summary = await getDashboardSummary();
        if (mounted) {
          setData(summary);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }



  const {
    totalVendors,
    activeAgents,
    openRisks,
    avgRiskScore,
    controlsActive,
    controlsTotal,
    riskTrend,
    stageBreakdown,
    agentActivity,
    recentAlerts,
  } = data;

  const liveAgents = agentActivity.filter(a => a.isActive).length;

  return (
    <div className="flex flex-col gap-7 max-w-[1280px]">

      {/* -- Welcome Banner -- */}
      <WidgetCard className="!py-[18px] !px-7 !rounded-2xl">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[19px] font-extrabold text-slate-900 tracking-tight">
              Good morning, Priya
            </div>
            <div className="text-[13px] text-slate-500 mt-[3px]">
              ABC Insurance Company &middot; Healthcare &middot; Mumbai
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                Overall Risk Posture
              </div>
              <div className="flex items-center gap-2.5">
                <span className="text-[22px] font-extrabold text-slate-900 tracking-tight">
                  {avgRiskScore} / 100
                </span>
                <span className="bg-amber-50 text-amber-600 text-xs font-bold px-3 py-1 rounded-full border border-amber-200">
                  {avgRiskScore >= 70 ? 'High' : avgRiskScore >= 40 ? 'Medium' : 'Low'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </WidgetCard>

      {/* -- KPI Row -- */}
      <div className="grid grid-cols-5 gap-5">

        <KpiWidget
          icon={<Package size={15} />}
          iconBg="#EFF6FF" iconColor="#0EA5E9"
          label="Total Suppliers"
          value={totalVendors}
          sparkData={[10, 25, 18, 40, 35, 55, 42, 60, 55, 72, 68, 85]}
          sparkColor="#0EA5E9"
          sub={
            <>
              <TrendingUp size={12} color="#10B981" />
              <span className="text-emerald-500 font-semibold">+12% vs last quarter</span>
            </>
          }
        />

        <KpiWidget
          icon={<ShieldAlert size={15} />}
          iconBg="#FEF2F2" iconColor="#EF4444"
          label="High Risk"
          value={openRisks}
          valueColor="#EF4444"
          sub={
            <>
              <AlertCircle size={12} color="#F59E0B" />
              <span>3 require immediate attention</span>
            </>
          }
          barPct={Math.round((openRisks / totalVendors) * 100)} barColor="#EF4444" barBg="#FEE2E2"
        />

        <KpiWidget
          icon={<Bot size={15} />}
          iconBg="#ECFDF5" iconColor="#10B981"
          label="Active Agents"
          value={activeAgents}
          liveIndicator
          sub={<span>{liveAgents} monitoring &middot; {activeAgents - liveAgents} idle</span>}
          barPct={undefined}
          sparkData={undefined}
        >
          <SegmentBar active={controlsActive} total={controlsTotal} />
        </KpiWidget>

        <KpiWidget
          icon={<FileText size={15} />}
          iconBg="#FFFBEB" iconColor="#F59E0B"
          label="Assessments"
          value={23}
          valueColor="#D97706"
          sub={
            <>
              <AlertCircle size={12} color="#F59E0B" />
              <span>5 overdue &gt;30 days</span>
            </>
          }
          barPct={48} barColor="#F59E0B" barBg="#FEF9C3"
        />

        <KpiWidget
          icon={<ScanSearch size={15} />}
          iconBg="#FEF2F2" iconColor="#EF4444"
          label="Truth Gap Alerts"
          value={6}
          valueColor="#EF4444"
          sub={
            <>
              <AlertCircle size={12} color="#EF4444" />
              <span className="text-red-500 font-semibold">2 require investigation</span>
            </>
          }
          barPct={40} barColor="#EF4444" barBg="#FEE2E2"
        />
      </div>

      {/* -- Analytics Row -- */}
      <div className="grid grid-cols-2 gap-5">

        {/* Supplier Risk by Stage */}
        <WidgetCard>
          <WidgetHeader
            title="Supplier Risk by Stage"
            action="View All"
            onAction={() => navigate('/tprm')}
          />
          <div>
            {stageBreakdown.map((s, idx) => (
              <div
                key={s.stage}
                onClick={() => navigate('/tprm')}
                className="hover:bg-[#F8FAFC] rounded-lg transition-colors cursor-pointer"
                style={{
                  padding: '13px 0',
                  borderBottom: idx < stageBreakdown.length - 1 ? `1px solid ${token.border}` : 'none',
                }}
              >
                <div className="flex items-center gap-2.5 mb-[7px]">
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="text-sm font-bold text-slate-700 flex-1">{s.stage}</span>
                  <span className="text-[13px] text-slate-500">{s.count} suppliers</span>
                  <ChevronRight size={14} color="#94A3B8" />
                </div>
                <div className="ml-5 mb-1">
                  <div className="h-[7px] bg-slate-100 rounded-full w-full">
                    <div
                      className="h-[7px] rounded-full"
                      style={{
                        width: `${(s.count / totalVendors) * 100}%`,
                        background: `linear-gradient(90deg, ${s.color}, #F59E0B)`,
                      }}
                    />
                  </div>
                  <div className="flex gap-3 mt-[5px] text-xs">
                    {s.critical > 0 && <span className="text-red-500 font-semibold">{s.critical} Critical</span>}
                    {s.high > 0    && <span className="text-amber-500 font-semibold">{s.high} High</span>}
                    {s.medium > 0  && <span className="text-slate-500">{s.medium} Medium</span>}
                    {s.low > 0     && <span className="text-emerald-500">{s.low} Low</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Risk Score Trend */}
        <WidgetCard>
          <WidgetHeader
            title="Risk Score Trend"
            subtitle="Aug 2025 - Feb 2026"
            action="Full Report "
            onAction={() => navigate('/risk-threat')}
          />
          <ResponsiveContainer width="100%" height={228}>
            <LineChart data={riskTrend} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94A3B8' }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  border: `1px solid ${token.border}`,
                  borderRadius: 8,
                  fontSize: 12,
                  boxShadow: token.shadow,
                }}
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

      {/* -- Operations Row -- */}
      <div className="grid gap-5 grid-cols-[3fr_2fr]">

        {/* Agent Activity */}
        <WidgetCard>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-lg bg-emerald-50 flex items-center justify-center">
                <Activity size={15} color="#10B981" />
              </div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">Agent Activity</span>
            </div>
            <div className="flex items-center gap-1.5">
              <PulseDot />
              <span className="text-xs text-emerald-500 font-semibold">{liveAgents} agents live</span>
            </div>
          </div>
          <div>
            {agentActivity.map((agent, idx) => (
              <div
                key={agent.name}
                className="flex items-center gap-[13px] px-2 py-2.5 rounded-lg cursor-pointer hover:bg-[#F8FAFC] transition-colors"
                style={{
                  borderBottom: idx < agentActivity.length - 1 ? `1px solid ${token.border}` : 'none',
                }}
              >
                {/* Avatar with live dot */}
                <div className="relative shrink-0">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold"
                    style={{ backgroundColor: agent.color }}
                  >
                    {agent.initials}
                  </div>
                  {agent.isActive && (
                    <span className="absolute bottom-0 -right-px w-[9px] h-[9px] rounded-full bg-emerald-500 border-2 border-white" />
                  )}
                </div>
                <div className="text-[13px] font-bold text-slate-700 min-w-[68px]">{agent.name}</div>
                <StageBadge stage={agent.stage} />
                <div className="text-xs flex-1" style={{ color: agent.statusColor }}>{agent.status}</div>
              </div>
            ))}
          </div>
        </WidgetCard>

        {/* Recent Risk Alerts */}
        <WidgetCard>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-[30px] h-[30px] rounded-lg bg-red-50 flex items-center justify-center">
                <Zap size={15} color="#EF4444" />
              </div>
              <span className="text-[15px] font-bold text-slate-900 tracking-tight">Recent Risk Alerts</span>
            </div>
            <button
              onClick={() => navigate('/risk-threat')}
              className="text-[13px] text-sky-500 bg-transparent border-none cursor-pointer font-medium"
            >
              View All &rarr;
            </button>
          </div>
          <div className="flex flex-col gap-2.5">
            {recentAlerts.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer hover:opacity-90 transition-opacity"
                style={{ backgroundColor: alert.severityBg }}
              >
                <div
                  className="w-2 h-2 rounded-full mt-1 shrink-0"
                  style={{ backgroundColor: alert.severity }}
                />
                <div>
                  <div className="text-[13px] font-bold text-slate-900">{alert.type}</div>
                  <div className="text-xs text-slate-500 mt-px">Supplier: {alert.supplier}</div>
                  <div className="text-[11px] text-slate-400 mt-px">{alert.system}</div>
                </div>
              </div>
            ))}
          </div>
        </WidgetCard>
      </div>
    </div>
  );
}

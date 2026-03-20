import { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  Activity,
  Play,
  Pencil,
  Trash2,
  Clock,
  Users,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  GitMerge,
  Zap,
  Eye,
  Loader2,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { getControls, toggleControl, deleteControl } from '../services/controls.data';
import type { Control } from '../types';
import { PersonalityBadge } from '@/components/common/PersonalityBadge';
import { RiskBadge } from '@/components/common/RiskBadge';
import { PiiFlowBadge } from '@/components/common/PiiFlowBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { CoverageBar } from '../components/CoverageBar';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

/* ── Small helpers ─────────────────────────────────────────── */

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-36 shrink-0 mt-0.5">
        {label}
      </span>
      <div className="flex-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Section({ title, icon: Icon, children, accent = '#0EA5E9' }: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  accent?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_4px_rgba(0,0,0,0.05)] overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-3.5 border-b border-slate-100">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: accent + '18' }}>
          <Icon size={15} color={accent} />
        </div>
        <span className="text-[13px] font-bold text-slate-800">{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function StatCard({ label, value, sub, color = '#0F172A', bg = '#F8FAFC' }: {
  label: string; value: React.ReactNode; sub?: string; color?: string; bg?: string;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl px-4 py-3.5 border border-slate-200" style={{ backgroundColor: bg }}>
      <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">{label}</div>
      <div className="text-2xl font-bold leading-none" style={{ color }}>{value}</div>
      {sub && <div className="text-[11px] text-slate-400 mt-0.5">{sub}</div>}
    </div>
  );
}

function Avatar({ email, gradient }: { email: string; gradient: string }) {
  const initials = email.split('@')[0].slice(0, 2).toUpperCase();
  return (
    <div
      className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold text-white shrink-0"
      style={{ background: gradient }}
    >
      {initials}
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export function ViewControlPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [control, setControl] = useState<Control | null>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(false);
  const [runningAudit, setRunningAudit] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const controls = await getControls();
        const found = controls.find(c => c.id === id);
        if (mounted) {
          setControl(found ?? null);
          setActive(found?.active ?? false);
          setLoading(false);
        }
      } catch {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleToggle = async () => {
    if (!control) return;
    const next = !active;
    setActive(next);
    try {
      await toggleControl(control.id);
      toast.success(`Control ${next ? 'enabled' : 'disabled'}`);
    } catch {
      setActive(!next);
      toast.error('Failed to toggle control');
    }
  };

  const handleDelete = async () => {
    if (!control) return;
    if (!window.confirm(`Delete "${control.name}"? This cannot be undone.`)) return;
    try {
      await deleteControl(control.id);
      toast.success('Control deleted');
      navigate('/controls');
    } catch {
      toast.error('Failed to delete control');
    }
  };

  const handleRunAudit = async () => {
    setRunningAudit(true);
    await new Promise(r => setTimeout(r, 1800));
    setRunningAudit(false);
    toast.success(`Audit triggered for "${control?.name}"`);
  };

  /* ── Loading / Not Found ── */
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
        <Loader2 size={22} className="animate-spin" />
        <span className="text-sm">Loading control…</span>
      </div>
    );
  }

  if (!control) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <AlertTriangle size={36} className="text-amber-400" />
        <p className="text-slate-500">Control not found.</p>
        <button
          onClick={() => navigate('/controls')}
          className="flex items-center gap-2 text-sm text-sky-500 font-semibold bg-sky-50 border border-sky-200 px-4 py-2 rounded-lg cursor-pointer"
        >
          <ArrowLeft size={14} /> Back to Controls
        </button>
      </div>
    );
  }

  /* ── Coverage colour ── */
  const covColor = control.coverage >= 80 ? '#10B981' : control.coverage >= 60 ? '#F59E0B' : '#EF4444';
  const covBg    = control.coverage >= 80 ? '#ECFDF5' : control.coverage >= 60 ? '#FFFBEB' : '#FEF2F2';

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">

      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/controls')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-800 hover:border-slate-300 cursor-pointer"
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 m-0">{control.name}</h1>
              <PersonalityBadge personality={control.personality} />
              <RiskBadge risk={control.risk} />
            </div>
            <p className="text-sm text-slate-500 mt-0.5 mb-0">{control.desc}</p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs font-medium text-slate-500">Active</span>
            <ToggleSwitch on={active} onToggle={handleToggle} />
          </div>
          <button
            onClick={handleRunAudit}
            disabled={runningAudit}
            className={`flex items-center gap-1.5 border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer text-white ${runningAudit ? 'bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}
          >
            {runningAudit
              ? <><Loader2 size={14} className="animate-spin" /> Running…</>
              : <><Play size={14} /> Run Audit</>
            }
          </button>
          <button
            onClick={() => toast(`Edit control: ${control.name}`)}
            className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-600 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-sky-100"
          >
            <Pencil size={14} /> Edit
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-red-100"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* ── Stat Strip ─────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3">
        <StatCard
          label="Coverage"
          value={`${control.coverage}%`}
          sub={control.scope + ' scope'}
          color={covColor}
          bg={covBg}
        />
        <StatCard
          label="Dependencies"
          value={control.deps}
          sub={control.deps === 1 ? 'linked control' : 'linked controls'}
        />
        <StatCard
          label="Last Evaluated"
          value={<span className="text-lg">{control.lastEval}</span>}
          sub="Most recent run"
        />
        <StatCard
          label="Truth Match"
          value={control.hasTruthGap
            ? <span className="text-red-500 flex items-center gap-1.5 text-lg"><XCircle size={18} /> Gap</span>
            : <span className="text-emerald-500 flex items-center gap-1.5 text-lg"><CheckCircle2 size={18} /> Clear</span>
          }
          sub={control.truthValidator ? 'AI truth validator active' : 'No truth validator'}
        />
      </div>

      {/* ── Two-Column Layout ───────────────────────────────── */}
      <div className="grid grid-cols-[1fr_340px] gap-4 items-start">

        {/* LEFT ── Details */}
        <div className="flex flex-col gap-4">

          {/* Overview */}
          <Section title="Control Overview" icon={ShieldCheck} accent="#0EA5E9">
            <InfoRow label="Name">{control.name}</InfoRow>
            <InfoRow label="Description">{control.desc}</InfoRow>
            <InfoRow label="Category"><CategoryBadge category={control.category} /></InfoRow>
            <InfoRow label="Control Scope">
              <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
                {control.scope}
              </span>
            </InfoRow>
            <InfoRow label="Coverage">
              <div className="flex items-center gap-2.5">
                <CoverageBar value={control.coverage} />
                <span className="text-sm font-semibold" style={{ color: covColor }}>{control.coverage}%</span>
              </div>
            </InfoRow>
            <InfoRow label="Risk Level"><RiskBadge risk={control.risk} /></InfoRow>
            <InfoRow label="Personality"><PersonalityBadge personality={control.personality} /></InfoRow>
            <InfoRow label="Status">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {active ? 'Active' : 'Inactive'}
              </span>
            </InfoRow>
          </Section>

          {/* Data Flow / PII */}
          <Section title="Data Flow & PII Intelligence" icon={Activity} accent="#8B5CF6">
            <InfoRow label="PII Flow"><PiiFlowBadge flow={control.piiFlow} /></InfoRow>
            <InfoRow label="Truth Validator">
              {control.truthValidator
                ? <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full"><CheckCircle2 size={11} /> Enabled</span>
                : <span className="text-xs text-slate-400">Not configured</span>
              }
            </InfoRow>
            <InfoRow label="Truth Gap">
              {control.hasTruthGap
                ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-red-50 text-red-500 border border-red-200 px-2.5 py-1 rounded-full">
                    <AlertTriangle size={11} /> Gap Detected
                  </span>
                )
                : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-emerald-50 text-emerald-600 border border-emerald-200 px-2.5 py-1 rounded-full">
                    <CheckCircle2 size={11} /> All Clear
                  </span>
                )
              }
            </InfoRow>
            {control.truthMatch !== undefined && (
              <InfoRow label="Truth Match Score">
                <span className="text-sm font-bold" style={{ color: control.truthMatch ? '#10B981' : '#EF4444' }}>
                  {control.truthMatch ? '100% matched' : 'Mismatch detected'}
                </span>
              </InfoRow>
            )}
            {control.complianceScore !== undefined && (
              <InfoRow label="Compliance Score">
                <span className="text-sm font-bold text-sky-600">{control.complianceScore}%</span>
              </InfoRow>
            )}
          </Section>

          {/* Dependencies */}
          <Section title="Dependencies" icon={GitMerge} accent="#F59E0B">
            {control.deps === 0
              ? <p className="text-sm text-slate-400 m-0">No dependencies configured for this control.</p>
              : (
                <div className="flex items-center gap-2">
                  <span className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-lg font-bold text-amber-600 shrink-0">
                    {control.deps}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-slate-700">
                      {control.deps} linked control{control.deps !== 1 ? 's' : ''}
                    </div>
                    <div className="text-xs text-slate-400">Dependency graph view coming soon</div>
                  </div>
                </div>
              )
            }
          </Section>

          {/* Linked Suppliers */}
          {control.linkedSuppliers && control.linkedSuppliers.length > 0 && (
            <Section title="Linked Suppliers" icon={Eye} accent="#0EA5E9">
              <div className="flex flex-wrap gap-2">
                {control.linkedSuppliers.map(s => (
                  <span key={s} className="text-xs font-medium bg-sky-50 text-sky-600 border border-sky-200 px-2.5 py-1 rounded-full">
                    {s}
                  </span>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* RIGHT ── Side Panel */}
        <div className="flex flex-col gap-4">

          {/* Relational Context */}
          <Section title="Relational Context" icon={Users} accent="#10B981">
            <div className="flex flex-col gap-3">
              {control.internalSpoc && (
                <div className="flex items-center gap-3">
                  <Avatar email={control.internalSpoc} gradient="linear-gradient(135deg,#0EA5E9,#6366F1)" />
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Internal SPOC</div>
                    <div className="text-sm font-semibold text-slate-700">{control.internalSpoc}</div>
                  </div>
                </div>
              )}
              {control.externalSpoc && (
                <div className="flex items-center gap-3">
                  <Avatar email={control.externalSpoc} gradient="linear-gradient(135deg,#8B5CF6,#EC4899)" />
                  <div>
                    <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">External SPOC</div>
                    <div className="text-sm font-semibold text-slate-700">{control.externalSpoc}</div>
                  </div>
                </div>
              )}
              {!control.internalSpoc && !control.externalSpoc && (
                <p className="text-sm text-slate-400 m-0">No contacts configured.</p>
              )}
            </div>
          </Section>

          {/* Audit Log Panel */}
          <Section title="Audit Activity" icon={Clock} accent="#64748B">
            <div className="flex flex-col gap-3">
              {[
                { time: control.lastEval, event: 'Last evaluation completed', dot: '#10B981' },
                { time: '2 days ago',     event: 'Configuration updated',      dot: '#0EA5E9' },
                { time: '1 week ago',     event: 'Control created',            dot: '#8B5CF6' },
              ].map((entry, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: entry.dot }} />
                  <div>
                    <div className="text-[13px] font-medium text-slate-700">{entry.event}</div>
                    <div className="text-[11px] text-slate-400">{entry.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Quick Actions */}
          <Section title="Quick Actions" icon={Zap} accent="#F59E0B">
            <div className="flex flex-col gap-2">
              {[
                { label: 'Run Audit Now', icon: Play, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', action: handleRunAudit },
                { label: 'Edit Control',  icon: Pencil, color: '#0EA5E9', bg: '#EFF6FF', border: '#BAE6FD', action: () => toast(`Edit: ${control.name}`) },
                { label: 'View Audit Logs', icon: Clock, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', action: () => navigate('/audit-logs') },
                { label: 'Delete Control', icon: Trash2, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', action: handleDelete },
              ].map(({ label, icon: Icon, color, bg, border, action }) => (
                <button
                  key={label}
                  onClick={action}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer border transition-opacity hover:opacity-80"
                  style={{ color, backgroundColor: bg, borderColor: border }}
                >
                  <Icon size={14} />
                  {label}
                </button>
              ))}
            </div>
          </Section>

          {/* Metadata */}
          {(control.controlGroup || control.lastReviewed) && (
            <Section title="Metadata" icon={ShieldCheck} accent="#94A3B8">
              {control.controlGroup && (
                <InfoRow label="Control Group">
                  <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{control.controlGroup}</span>
                </InfoRow>
              )}
              {control.lastReviewed && (
                <InfoRow label="Last Reviewed">
                  <span className="text-sm text-slate-600">{control.lastReviewed}</span>
                </InfoRow>
              )}
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

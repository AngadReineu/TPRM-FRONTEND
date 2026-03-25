import { useState, useEffect } from 'react';
import {
  ArrowLeft, ShieldCheck, Activity, Play, Pencil, Trash2,
  Clock, Users, AlertTriangle, CheckCircle2, XCircle,
  Zap, Loader2, Mail, FileText, Globe, Shield, ChevronUp,
  ChevronDown, Check, MessageSquare, Hash, Video,
} from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';

import { getControls, toggleControl, deleteControl } from '../services/controls.data';
import type { Control } from '../types';
import { PersonalityBadge } from '../../../components/common/PersonalityBadge';
import { RiskBadge } from '../../../components/common/RiskBadge';
import { CategoryBadge } from '../components/CategoryBadge';
import { CoverageBar } from '../components/CoverageBar';
import { ToggleSwitch } from '../../../components/common/ToggleSwitch';

/* ── Helpers ──────────────────────────────────────────────── */
function Section({ title, icon: Icon, children, accent = '#0EA5E9' }: {
  title: string; icon: React.ElementType; children: React.ReactNode; accent?: string;
}) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
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

function InfoRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider w-40 shrink-0 mt-0.5">{label}</span>
      <div className="flex-1 text-sm text-slate-700">{children}</div>
    </div>
  );
}

function Chip({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full border"
      style={{ color, backgroundColor: bg, borderColor: color + '40' }}>
      {label}
    </span>
  );
}

/* ── Main ─────────────────────────────────────────────────── */
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
        if (mounted) { setControl(found ?? null); setActive(found?.active ?? false); setLoading(false); }
      } catch { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleToggle = async () => {
    if (!control) return;
    const next = !active;
    setActive(next);
    try { await toggleControl(control.id); toast.success(`Control ${next ? 'enabled' : 'disabled'}`); }
    catch { setActive(!next); toast.error('Failed to toggle control'); }
  };

  const handleDelete = async () => {
    if (!control) return;
    if (!window.confirm(`Delete "${control.name}"? This cannot be undone.`)) return;
    try { await deleteControl(control.id); toast.success('Control deleted'); navigate('/controls'); }
    catch { toast.error('Failed to delete control'); }
  };

  const handleRunAudit = async () => {
    setRunningAudit(true);
    await new Promise(r => setTimeout(r, 1800));
    setRunningAudit(false);
    toast.success(`Audit triggered for "${control?.name}"`);
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-3 text-slate-400">
      <Loader2 size={22} className="animate-spin" /><span className="text-sm">Loading control…</span>
    </div>
  );

  if (!control) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <AlertTriangle size={36} className="text-amber-400" />
      <p className="text-slate-500">Control not found.</p>
      <button onClick={() => navigate('/controls')} className="flex items-center gap-2 text-sm text-sky-500 font-semibold bg-sky-50 border border-sky-200 px-4 py-2 rounded-lg cursor-pointer">
        <ArrowLeft size={14} /> Back to Controls
      </button>
    </div>
  );

  const slmTasks: string[] = control.slmTasks || [];
  const supplierScope: string[] = control.supplierScope || [];
  const documentScope: string[] = control.documentScope || [];
  const anomalyTriggers: string[] = control.anomalyTriggers || [];
  const autoActions: string[] = control.autoActions || [];
  const communicationScope: Record<string, string> = control.communicationScope || {};
  const dataSources: string[] = control.dataSources || [];
  const dsConfig: Record<string, any> = control.dataSourcesConfig || {};
  const triggerEvents: string[] = control.triggerEvents || [];
  const covColor = control.coverage >= 80 ? '#10B981' : control.coverage >= 60 ? '#F59E0B' : '#EF4444';
  const covBg    = control.coverage >= 80 ? '#ECFDF5' : control.coverage >= 60 ? '#FFFBEB' : '#FEF2F2';

  const PERSONA_META: Record<string, { color: string; bg: string }> = {
    Consulting:   { color: '#0EA5E9', bg: '#EFF6FF' },
    Operations:   { color: '#10B981', bg: '#ECFDF5' },
    'Data Security': { color: '#8B5CF6', bg: '#F5F3FF' },
    Regulatory:   { color: '#F59E0B', bg: '#FFFBEB' },
  };
  const pm = PERSONA_META[control.personality || ''] || { color: '#64748B', bg: '#F8FAFC' };

  return (
    <div className="flex flex-col gap-5 max-w-[1100px]">

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/controls')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 cursor-pointer">
            <ArrowLeft size={15} />
          </button>
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-xl font-bold text-slate-900 m-0">{control.name}</h1>
              <RiskBadge risk={control.risk} />
              {control.personality && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ color: pm.color, backgroundColor: pm.bg }}>
                  {control.personality}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5 mb-0">{control.desc}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs font-medium text-slate-500">Active</span>
            <ToggleSwitch on={active} onToggle={handleToggle} />
          </div>
          <button onClick={handleRunAudit} disabled={runningAudit}
            className={`flex items-center gap-1.5 border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer text-white ${runningAudit ? 'bg-slate-400' : 'bg-emerald-500 hover:bg-emerald-600'}`}>
            {runningAudit ? <><Loader2 size={14} className="animate-spin" /> Running…</> : <><Play size={14} /> Run Audit</>}
          </button>
          <button onClick={() => toast(`Edit: ${control.name}`)}
            className="flex items-center gap-1.5 bg-sky-50 border border-sky-200 text-sky-600 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-sky-100">
            <Pencil size={14} /> Edit
          </button>
          <button onClick={handleDelete}
            className="flex items-center gap-1.5 bg-red-50 border border-red-200 text-red-500 rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-red-100">
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>

      {/* Stat strip */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Coverage', value: `${control.coverage}%`, sub: control.category + ' control', color: covColor, bg: covBg },
          { label: 'SLM Tasks', value: String(slmTasks.length), sub: slmTasks.length > 0 ? `${slmTasks.length} task${slmTasks.length > 1 ? 's' : ''} defined` : 'No tasks yet', color: '#0EA5E9', bg: '#EFF6FF' },
          { label: 'Last Evaluated', value: control.lastEval || '—', sub: 'Most recent run', color: '#64748B', bg: '#F8FAFC' },
          { label: 'Truth Match', value: control.hasTruthGap ? 'Gap' : 'Clear', sub: control.truthGapDetection ? 'Truth gap detection on' : 'No truth validator', color: control.hasTruthGap ? '#EF4444' : '#10B981', bg: control.hasTruthGap ? '#FEF2F2' : '#ECFDF5' },
        ].map(s => (
          <div key={s.label} className="rounded-xl px-4 py-3.5 border border-slate-200" style={{ backgroundColor: s.bg }}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">{s.label}</div>
            <div className="text-2xl font-bold leading-none mb-0.5" style={{ color: s.color }}>{s.value}</div>
            <div className="text-[11px] text-slate-400">{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-[1fr_340px] gap-4 items-start">

        {/* LEFT */}
        <div className="flex flex-col gap-4">

          {/* Basic Info */}
          <Section title="Control Overview" icon={ShieldCheck} accent="#0EA5E9">
            <InfoRow label="Name">{control.name}</InfoRow>
            <InfoRow label="Description">{control.desc || '—'}</InfoRow>
            <InfoRow label="Category"><CategoryBadge category={control.category} /></InfoRow>
            <InfoRow label="Persona">
              {control.personality
                ? <span className="text-[12px] font-semibold px-2.5 py-1 rounded-full" style={{ color: pm.color, backgroundColor: pm.bg }}>{control.personality}</span>
                : <span className="text-slate-400 text-sm">—</span>}
            </InfoRow>
            <InfoRow label="Risk Level"><RiskBadge risk={control.risk} /></InfoRow>
            <InfoRow label="Control Source">
              <span className="text-[12px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full capitalize">
                {control.controlSource || 'Local'}
              </span>
            </InfoRow>
            <InfoRow label="Coverage">
              <div className="flex items-center gap-2.5">
                <CoverageBar value={control.coverage} />
                <span className="text-sm font-semibold" style={{ color: covColor }}>{control.coverage}%</span>
              </div>
            </InfoRow>
            <InfoRow label="Status">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                {active ? 'Active' : 'Inactive'}
              </span>
            </InfoRow>
          </Section>

          {/* SLM Tasks */}
          <Section title="SLM Tasks" icon={Shield} accent="#8B5CF6">
            {slmTasks.length === 0 ? (
              <p className="text-sm text-slate-400 m-0">No SLM tasks defined for this control.</p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {slmTasks.map((task, i) => (
                  <div key={task} className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl border"
                    style={{ backgroundColor: i === 0 ? '#F5F3FF' : '#F8FAFC', border: i === 0 ? '1px solid #DDD6FE' : '1px solid #E2E8F0' }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                      style={{ backgroundColor: i === 0 ? '#EDE9FE' : '#E2E8F0', color: i === 0 ? '#7C3AED' : '#64748B' }}>
                      {i + 1}
                    </div>
                    <span className="text-[13px] font-semibold flex-1" style={{ color: i === 0 ? '#7C3AED' : '#334155' }}>{task}</span>
                    <CheckCircle2 size={13} color={i === 0 ? '#8B5CF6' : '#94A3B8'} />
                  </div>
                ))}
              </div>
            )}
          </Section>

          {/* Target Scope */}
          <Section title="Target Asset Scope" icon={Globe} accent="#10B981">
            {/* Lifecycle Stage */}
            {control.lifecycleStage && (
              <InfoRow label="Lifecycle Stage">
                <Chip label={control.lifecycleStage}
                  color={{ Acquisition: '#0EA5E9', Retention: '#10B981', Upgradation: '#F59E0B', Offboarding: '#94A3B8', 'All Stages': '#64748B' }[control.lifecycleStage] || '#64748B'}
                  bg={{ Acquisition: '#EFF6FF', Retention: '#ECFDF5', Upgradation: '#FFFBEB', Offboarding: '#F1F5F9', 'All Stages': '#F8FAFC' }[control.lifecycleStage] || '#F8FAFC'} />
              </InfoRow>
            )}
            {/* Suppliers */}
            <InfoRow label="Supplier Scope">
              {supplierScope.length > 0
                ? <div className="flex flex-wrap gap-1.5">{supplierScope.map(s => <Chip key={s} label={s} color="#0EA5E9" bg="#EFF6FF" />)}</div>
                : <span className="text-slate-400 text-sm">All suppliers</span>}
            </InfoRow>
            {/* Document Scope */}
            {documentScope.length > 0 && (
              <InfoRow label="Document Types">
                <div className="flex flex-wrap gap-1.5">
                  {documentScope.map(d => (
                    <div key={d} className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-lg">
                      <FileText size={10} />{d}
                    </div>
                  ))}
                </div>
              </InfoRow>
            )}
            {/* Communication Scope */}
            {Object.keys(communicationScope).length > 0 && (
              <InfoRow label="Communication Scope">
                <div className="flex flex-col gap-1.5">
                  {Object.entries(communicationScope).map(([task, email]) => (
                    <div key={task} className="bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      <div className="text-[10px] font-bold text-sky-500 mb-0.5">{task}</div>
                      <div className="flex items-center gap-1.5 text-[12px] text-slate-600">
                        <Mail size={11} />{email || 'Not configured'}
                      </div>
                    </div>
                  ))}
                </div>
              </InfoRow>
            )}
          </Section>

          {/* Data Source */}
          <Section title="Data Sources" icon={Activity} accent="#F59E0B">
            <InfoRow label="Sources">
              <div className="flex flex-col gap-2">
                {dataSources.length > 0
                  ? dataSources.map(s => {
                      const META: Record<string, { label: string; color: string; bg: string; icon: React.ElementType }> = {
                        email: { label: 'Email Monitoring', color: '#0EA5E9', bg: '#EFF6FF', icon: Mail },
                        documents: { label: 'Uploaded Documents', color: '#F59E0B', bg: '#FFFBEB', icon: FileText },
                        portal: { label: 'Supplier Portal', color: '#10B981', bg: '#ECFDF5', icon: Globe },
                        teams: { label: 'Microsoft Teams', color: '#0EA5E9', bg: '#EFF6FF', icon: MessageSquare },
                        slack: { label: 'Slack', color: '#8B5CF6', bg: '#F5F3FF', icon: Hash },
                        zoom: { label: 'Zoom', color: '#3B82F6', bg: '#EFF6FF', icon: Video },
                      };
                      const m = META[s] || { label: s, color: '#64748B', bg: '#F8FAFC', icon: Activity };
                      return (
                        <div key={s} className="flex flex-col gap-1.5 border border-slate-100 rounded-lg p-2.5">
                          <span className="text-[11px] w-fit font-semibold flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
                            style={{ color: m.color, backgroundColor: m.bg, borderColor: m.color + '40' }}>
                            <m.icon size={12} />
                            {m.label}
                          </span>
                          
                          {s === 'teams' && dsConfig.teams && (
                            <div className="text-[11px] text-slate-500 pl-1 mt-1 flex flex-col gap-0.5">
                              <div><strong>Tenant:</strong> {'*'.repeat(Math.max(0, (dsConfig.teams.tenant_id?.length || 8) - 8)) + (dsConfig.teams.tenant_id?.slice(-8) || '')}</div>
                              <div><strong>Scope:</strong> {dsConfig.teams.scope === 'specific' ? `Channels (${dsConfig.teams.channels})` : 'All channels'}</div>
                            </div>
                          )}

                          {s === 'slack' && dsConfig.slack && (
                            <div className="text-[11px] text-slate-500 pl-1 mt-1 flex flex-col gap-0.5">
                              <div><strong>Workspace:</strong> {dsConfig.slack.workspace}</div>
                              <div><strong>Scope:</strong> {dsConfig.slack.scope === 'specific' ? `Channels (${dsConfig.slack.channels})` : 'All bot-invited channels'}</div>
                            </div>
                          )}

                          {s === 'zoom' && dsConfig.zoom && (
                            <div className="text-[11px] text-slate-500 pl-1 mt-1 flex flex-col gap-0.5">
                              <div><strong>Account ID:</strong> {dsConfig.zoom.account_id}</div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  : <span className="text-slate-400 text-sm">Not configured</span>}
              </div>
            </InfoRow>
            <InfoRow label="Evidence Retention">
              <Chip label={control.evidenceRetention || '90 days'} color="#64748B" bg="#F8FAFC" />
            </InfoRow>
          </Section>

          {/* Trigger Config */}
          <Section title="Trigger Configuration" icon={Zap} accent="#6366F1">
            <InfoRow label="Trigger Mode">
              <Chip
                label={control.triggerMode === 'event' ? 'Event-Driven' : control.triggerMode === 'scheduled' ? 'Scheduled' : 'Manual'}
                color="#6366F1" bg="#EEF2FF" />
            </InfoRow>
            {control.triggerMode === 'event' && triggerEvents.length > 0 && (
              <InfoRow label="Trigger Events">
                <div className="flex flex-col gap-1">
                  {triggerEvents.map(e => {
                    const labels: Record<string, string> = {
                      new_email: 'New email from supplier SPOC',
                      document_uploaded: 'Document uploaded',
                      portal_submitted: 'Portal assessment submitted',
                      vendor_stage_changed: 'Vendor stage changed',
                      manual: 'Manual trigger',
                    };
                    return (
                      <div key={e} className="flex items-center gap-1.5 text-[12px] text-slate-600">
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                        {labels[e] || e}
                      </div>
                    );
                  })}
                </div>
              </InfoRow>
            )}
            {control.triggerMode === 'scheduled' && control.triggerFrequency && (
              <InfoRow label="Frequency"><Chip label={control.triggerFrequency} color="#6366F1" bg="#EEF2FF" /></InfoRow>
            )}
            {control.firstEvalDate && (
              <InfoRow label="First Evaluation">{control.firstEvalDate} {control.firstEvalTime || ''}</InfoRow>
            )}
          </Section>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">

          {/* AI Behaviour */}
          <Section title="AI Behaviour" icon={ShieldCheck} accent="#0EA5E9">
            {/* Evaluation Prompt */}
            {control.evaluationPrompt && (
              <div className="mb-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Evaluation Prompt (Mistral)</div>
                <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-[11px] text-slate-600 leading-relaxed max-h-32 overflow-y-auto">
                  {control.evaluationPrompt}
                </div>
              </div>
            )}
            {/* Confidence */}
            <InfoRow label="Confidence">
              <div className="flex items-center gap-2">
                <div className="flex-1 bg-slate-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-sky-500" style={{ width: `${control.confidenceThreshold ?? 75}%` }} />
                </div>
                <span className="text-[12px] font-bold text-sky-500">{control.confidenceThreshold ?? 75}%</span>
              </div>
            </InfoRow>
            {/* Toggles */}
            {[
              { key: 'storeSnapshots', label: 'Store Snapshots', val: control.storeSnapshots !== false },
              { key: 'requireApproval', label: 'Require Approval', val: control.requireApproval === true },
              { key: 'truthGapDetection', label: 'Truth Gap Detection', val: control.truthGapDetection !== false },
            ].map(({ key, label, val }) => (
              <InfoRow key={key} label={label}>
                <span className={`text-[11px] font-bold px-2 py-px rounded-full ${val ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                  {val ? 'On' : 'Off'}
                </span>
              </InfoRow>
            ))}
            {/* Auto Actions */}
            {autoActions.length > 0 && (
              <div className="mt-2 pt-2 border-t border-slate-100">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Auto Actions on Fail</div>
                <div className="flex flex-col gap-1">
                  {autoActions.map(a => {
                    const labels: Record<string, string> = {
                      send_email_alert: 'Send email alert',
                      reduce_risk_score: 'Reduce risk score',
                      flag_for_review: 'Flag for human review',
                      create_slm_task: 'Create SLM Task',
                    };
                    return (
                      <div key={a} className="flex items-center gap-1.5 text-[12px] text-emerald-600">
                        <Check size={11} className="shrink-0" />{labels[a] || a}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </Section>

          {/* SLM Anomaly Triggers */}
          {anomalyTriggers.length > 0 && (
            <Section title="SLM Anomaly Triggers" icon={AlertTriangle} accent="#EF4444">
              <div className="flex flex-wrap gap-1.5">
                {anomalyTriggers.map(t => <Chip key={t} label={t} color="#EF4444" bg="#FEF2F2" />)}
              </div>
            </Section>
          )}

          {/* Contacts */}
          <Section title="Relational Context" icon={Users} accent="#10B981">
            {control.internalSpoc ? (
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)' }}>
                  {control.internalSpoc.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Internal SPOC</div>
                  <div className="text-sm font-semibold text-slate-700">{control.internalSpoc}</div>
                </div>
              </div>
            ) : null}
            {control.externalSpoc ? (
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                  {control.externalSpoc.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">External SPOC</div>
                  <div className="text-sm font-semibold text-slate-700">{control.externalSpoc}</div>
                </div>
              </div>
            ) : null}
            {!control.internalSpoc && !control.externalSpoc && (
              <p className="text-sm text-slate-400 m-0">No contacts configured.</p>
            )}
          </Section>

          {/* Remediation */}
          {control.remediationSuggestion && (
            <Section title="Remediation Suggestion" icon={CheckCircle2} accent="#10B981">
              <p className="text-[12px] text-slate-600 leading-relaxed m-0">{control.remediationSuggestion}</p>
            </Section>
          )}

          {/* Quick Actions */}
          <Section title="Quick Actions" icon={Zap} accent="#F59E0B">
            <div className="flex flex-col gap-2">
              {[
                { label: 'Run Audit Now', icon: Play, color: '#10B981', bg: '#ECFDF5', border: '#A7F3D0', action: handleRunAudit },
                { label: 'Edit Control', icon: Pencil, color: '#0EA5E9', bg: '#EFF6FF', border: '#BAE6FD', action: () => toast(`Edit: ${control.name}`) },
                { label: 'View Audit Logs', icon: Clock, color: '#8B5CF6', bg: '#F5F3FF', border: '#DDD6FE', action: () => navigate('/audit-logs') },
                { label: 'Delete Control', icon: Trash2, color: '#EF4444', bg: '#FEF2F2', border: '#FECACA', action: handleDelete },
              ].map(({ label, icon: Icon, color, bg, border, action }) => (
                <button key={label} onClick={action}
                  className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-[13px] font-medium cursor-pointer border transition-opacity hover:opacity-80"
                  style={{ color, backgroundColor: bg, borderColor: border }}>
                  <Icon size={14} />{label}
                </button>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Activity, CheckCircle2,
  Database, Zap, Clock, TrendingUp, Shield, ChevronDown, ChevronUp,
  Users, BarChart2, Bell, FileText, Flag,
  GitMerge, Loader2, AlertCircle, ShieldCheck, RefreshCw, Check, X, Pencil, Trash2,
} from 'lucide-react';

import type { TaskStatus, AgentTask, TimelineEntry, LogEntry, AgentDefinition } from '../types';
import {
  LOG_STYLE,
  getAgentDefinitionById,
  getAgentTasksDetail,
  getAgentTimelineDetail,
  getInitialLogsDetail,
  getStreamQueueDetail,
  getAvatarUrl,
  getAgentDefinition,
  getAgentTasks,
  getAgentTimeline,
  getAgentLogs,
  updateAgent,
  clearAgentTasks,
  clearAgentLogs,
  runAgentTask,
} from '../services/agents.data';
import { LogRow } from '../components/LogRow';
import { TaskRow } from '../components/TaskRow';
import { TimelineItem } from '../components/TimelineItem';
import { useAgentLogStream } from '../hooks/useAgentLogStream';
import { toast } from 'sonner';

/* ─── SLM Tasks step-by-step panel ─────────────────────── */
function SLMTasksPanel({ agentId, controls, onReorder }: {
  agentId: string;
  controls: string[];
  onReorder: (updated: string[]) => void;
}) {
  const [taskList, setTaskList] = useState<string[]>(controls);
  const [saving, setSaving] = useState(false);

  const moveUp = (i: number) => {
    if (i === 0) return;
    const updated = [...taskList];
    [updated[i - 1], updated[i]] = [updated[i], updated[i - 1]];
    setTaskList(updated);
    saveOrder(updated);
  };

  const moveDown = (i: number) => {
    if (i === taskList.length - 1) return;
    const updated = [...taskList];
    [updated[i], updated[i + 1]] = [updated[i + 1], updated[i]];
    setTaskList(updated);
    saveOrder(updated);
  };

  const saveOrder = async (updated: string[]) => {
    setSaving(true);
    try {
      await updateAgent(agentId, { controlList: updated, controls: updated.length } as any);
      // no onReorder call — avoids remount
    } catch {
      toast.error('Failed to update task order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <ShieldCheck size={14} color="#8B5CF6" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">SLM Tasks Enforced</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <RefreshCw size={11} className="animate-spin text-slate-400" />}
          <span className="bg-purple-50 text-purple-500 text-[11px] rounded-full px-2 py-px">{taskList.length}</span>
        </div>
      </div>
      {taskList.length === 0 && <div className="text-xs text-slate-400 py-3 text-center italic">No tasks enforced</div>}
      <div className="flex flex-col gap-1.5">
        {taskList.map((task, i) => (
          <div key={task}
            className="flex items-center gap-2.5 rounded-xl border px-3 py-2.5 transition-all"
            style={{ backgroundColor: i === 0 ? '#F0FDF4' : '#F8FAFC', border: i === 0 ? '1px solid #A7F3D0' : '1px solid #E2E8F0' }}>
            <div className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
              style={{ backgroundColor: i === 0 ? '#D1FAE5' : '#E2E8F0', color: i === 0 ? '#059669' : '#64748B' }}>
              {i + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[12px] font-semibold text-slate-700 truncate">{task}</div>
              <div className="flex items-center gap-1 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: i === 0 ? '#10B981' : '#38BDF8' }} />
                <span className="text-[10px] font-semibold" style={{ color: i === 0 ? '#059669' : '#0369A1' }}>
                  {i === 0 ? 'Active' : 'Queued'}
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-0.5 shrink-0">
              <button onClick={() => moveUp(i)} disabled={i === 0}
                className="w-5 h-5 rounded flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600">
                <ChevronUp size={11} />
              </button>
              <button onClick={() => moveDown(i)} disabled={i === taskList.length - 1}
                className="w-5 h-5 rounded flex items-center justify-center border-none cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed bg-slate-100 hover:bg-sky-100 text-slate-500 hover:text-sky-600">
                <ChevronDown size={11} />
              </button>
            </div>
          </div>
        ))}
      </div>
      {taskList.length > 0 && (
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
          <ChevronUp size={11} /> Use arrows to set priority — Step 1 runs first
        </div>
      )}
    </div>
  );
}

/* ─── Stakeholder Communication Map — editable ──────────── */
function StakeholderMap({ agentId, internalSpoc, externalSpoc, internalContacts: initInternal, supplierContacts: initSupplier }: {
  agentId: string;
  internalSpoc?: string;
  externalSpoc?: string;
  internalContacts?: string[];
  supplierContacts?: string[];
}) {
  const [editMode, setEditMode] = useState(false);
  const [internalEmails, setInternalEmails] = useState<string[]>(
    initInternal?.length ? initInternal : internalSpoc ? [internalSpoc] : ['']
  );
  const [supplierEmails, setSupplierEmails] = useState<string[]>(
    initSupplier?.length ? initSupplier : externalSpoc ? [externalSpoc] : ['']
  );
  const [saving, setSaving] = useState(false);

  const addEmail = (side: 'int' | 'sup') =>
    side === 'int' ? setInternalEmails(p => [...p, '']) : setSupplierEmails(p => [...p, '']);

  const removeEmail = (side: 'int' | 'sup', i: number) => {
    if (side === 'int') setInternalEmails(p => p.filter((_, idx) => idx !== i));
    else setSupplierEmails(p => p.filter((_, idx) => idx !== i));
  };

  const updateEmail = (side: 'int' | 'sup', i: number, val: string) => {
    if (side === 'int') setInternalEmails(p => p.map((v, idx) => idx === i ? val : v));
    else setSupplierEmails(p => p.map((v, idx) => idx === i ? val : v));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateAgent(agentId, {
        internal_spoc: internalEmails.filter(Boolean)[0] || '',
        external_spoc: supplierEmails.filter(Boolean)[0] || '',
        internal_contacts: internalEmails.filter(Boolean),
        supplier_contacts: supplierEmails.filter(Boolean),
      } as any);
      setEditMode(false);
      toast.success('Contacts updated — triggering Payment Monitoring task...');

      // Auto-trigger Task 3 only — no full restart
      await runAgentTask(agentId, 'Payment Conversation Monitoring');
    } catch {
      toast.error('Failed to update contacts');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping opacity-70" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Stakeholder Map</span>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-sky-500 bg-blue-50 border-none px-2.5 py-1 rounded-lg cursor-pointer hover:bg-blue-100">
            <Pencil size={11} /> Edit
          </button>
        ) : (
          <div className="flex gap-1.5">
            <button onClick={() => setEditMode(false)}
              className="text-[11px] text-slate-500 border border-slate-200 bg-white rounded-lg px-2.5 py-1 cursor-pointer">
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1 text-[11px] font-semibold text-white bg-sky-500 border-none px-2.5 py-1 rounded-lg cursor-pointer disabled:opacity-50">
              {saving ? <RefreshCw size={10} className="animate-spin" /> : <Check size={10} />} Save
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1.5">Internal</div>
            {internalEmails.map((email, i) => (
              <div key={i} className="flex gap-1 mb-1.5">
                <input value={email} onChange={e => updateEmail('int', i, e.target.value)}
                  placeholder="internal@co"
                  className="flex-1 border border-slate-200 rounded-lg text-xs outline-none bg-white py-1.5 px-2" />
                {internalEmails.length > 1 && (
                  <button onClick={() => removeEmail('int', i)}
                    className="w-6 shrink-0 border border-red-200 rounded-lg bg-red-50 text-red-400 cursor-pointer flex items-center justify-center">
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addEmail('int')}
              className="text-[11px] text-sky-500 bg-transparent border border-dashed border-sky-200 rounded-lg cursor-pointer w-full py-1 px-2 hover:bg-blue-50">
              + Add email
            </button>
          </div>
          <div>
            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1.5">Supplier</div>
            {supplierEmails.map((email, i) => (
              <div key={i} className="flex gap-1 mb-1.5">
                <input value={email} onChange={e => updateEmail('sup', i, e.target.value)}
                  placeholder="supplier@co"
                  className="flex-1 border border-slate-200 rounded-lg text-xs outline-none bg-white py-1.5 px-2" />
                {supplierEmails.length > 1 && (
                  <button onClick={() => removeEmail('sup', i)}
                    className="w-6 shrink-0 border border-red-200 rounded-lg bg-red-50 text-red-400 cursor-pointer flex items-center justify-center">
                    <X size={9} />
                  </button>
                )}
              </div>
            ))}
            <button onClick={() => addEmail('sup')}
              className="text-[11px] text-purple-500 bg-transparent border border-dashed border-purple-200 rounded-lg cursor-pointer w-full py-1 px-2 hover:bg-purple-50">
              + Add email
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1.5">Internal</div>
            {internalEmails.filter(Boolean).map((email, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 py-1.5 px-2.5 mb-1">
                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)' }}>
                  {email.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-sky-700 truncate">{email}</span>
              </div>
            ))}
            {internalEmails.filter(Boolean).length === 0 && (
              <div className="text-[11px] text-slate-400 italic">No contact assigned</div>
            )}
          </div>
          <div>
            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1.5">Supplier</div>
            {supplierEmails.filter(Boolean).map((email, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 py-1.5 px-2.5 mb-1">
                <div className="w-5 h-5 rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold"
                  style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>
                  {email.slice(0, 2).toUpperCase()}
                </div>
                <span className="text-[11px] font-medium text-purple-700 truncate">{email}</span>
              </div>
            ))}
            {supplierEmails.filter(Boolean).length === 0 && (
              <div className="text-[11px] text-slate-400 italic">No contact assigned</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Main Page ─────────────────────────────────────────── */
export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const feedRef = useRef<HTMLDivElement>(null);

  const [agent, setAgent] = useState<AgentDefinition | null>(null);
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [initialLogs, setInitialLogs] = useState<LogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'All'>('All');
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  // Initial data fetch
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);
    Promise.all([
      getAgentDefinition(id),
      getAgentTasks(id, 'list'),
      getAgentTimeline(id, 'detail'),
      getAgentLogs(id, 'detail'),
    ]).then(([agentData, tasksData, timelineData, logsData]) => {
      if (mounted) {
        setAgent(agentData);
        setTasks(tasksData);
        setTimeline(timelineData);
        setInitialLogs(logsData);
        setIsLoading(false);
      }
    }).catch((err) => {
      console.error('Failed to fetch agent detail:', err);
      if (mounted) {
        setAgent(getAgentDefinitionById(id));
        setTasks(getAgentTasksDetail(id));
        setTimeline(getAgentTimelineDetail(id));
        setInitialLogs(getInitialLogsDetail(id));
        setError(null);
        setIsLoading(false);
      }
    });
    return () => { mounted = false; };
  }, [id]);

  // Poll for new logs and tasks every 4 seconds
  useEffect(() => {
    if (!id) return;
    const interval = setInterval(async () => {
      try {
        const [freshLogs, freshTasks] = await Promise.all([
          getAgentLogs(id, 'detail'),
          getAgentTasks(id, 'list'),
        ]);
        setInitialLogs(freshLogs);
        setTasks(freshTasks);
      } catch (err) {
        console.error('Poll failed:', err);
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [id]);

  const isActive = agent?.status === 'Active' || agent?.status === 'live' || agent?.status === 'active';

  const { logs, pulse } = useAgentLogStream({
    agentId: id || '',
    view: 'detail',
    initialLogs: initialLogs.length > 0 ? initialLogs : getInitialLogsDetail(id || ''),
    streamQueue: getStreamQueueDetail(id || ''),
    isActive: true,
  });

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter((t) => t.status === taskFilter);
  const openCount = tasks.filter((t) => t.status === 'Open').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [logs]);

  if (isLoading) {
    return (
      <div className="max-w-[1200px] font-sans">
        <button onClick={() => navigate('/agents')}
          className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-4 p-0">
          <ArrowLeft size={16} /> Back to Agents
        </button>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <Loader2 size={32} className="animate-spin text-sky-500" />
          <p className="text-slate-500 text-sm">Loading agent details...</p>
        </div>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="max-w-[1200px] font-sans">
        <button onClick={() => navigate('/agents')}
          className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-4 p-0">
          <ArrowLeft size={16} /> Back to Agents
        </button>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertCircle size={32} className="text-red-500" />
          <p className="text-slate-700 font-medium">Failed to load agent</p>
          <p className="text-slate-500 text-sm">{error || 'Agent not found'}</p>
          <button onClick={() => navigate('/agents')}
            className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none">
            Back to Agents
          </button>
        </div>
      </div>
    );
  }

  const avatarUrl = getAvatarUrl(agent.avatarSeed);
  const agentControls: string[] = (agent as any).controlList || (agent as any).control_list || agent.controls || [];

  return (
    <div className="max-w-[1200px] font-sans">
      <button onClick={() => navigate('/agents')}
        className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-4 p-0">
        <ArrowLeft size={16} /> Back to Agents
      </button>

      {/* ── AGENT PROFILE HEADER ── */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-5 flex-wrap">
          <div className="relative shrink-0">
            <img src={avatarUrl} alt={agent.name} width={72} height={72}
              className="rounded-full block bg-slate-100"
              style={{ border: `3px solid ${agent.color}40` }} />
            <div className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-opacity duration-300 ${isActive ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`}
              style={{ opacity: isActive ? (pulse ? 1 : 0.4) : 1 }} />
          </div>
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
              <h1 className="text-[22px] font-bold text-slate-900 m-0">{agent.name}</h1>
              <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${isActive ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#F1F5F9] border-[#E2E8F0]'}`}>
                <div className={`w-[7px] h-[7px] rounded-full transition-opacity duration-300 ${isActive ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`}
                  style={{ opacity: isActive ? (pulse ? 1 : 0.3) : 1 }} />
                <span className={`text-xs font-semibold ${isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}>
                  {isActive ? 'LIVE' : 'IDLE'}
                </span>
              </div>
            </div>
            <div className="text-[13px] text-slate-500 mb-1">{agent.role}</div>
            <div className="text-xs text-slate-400">
              {agentControls.length} SLM Tasks &middot; {agent.suppliers.length} suppliers &middot; Alert sensitivity: {agent.alertLevel || 'Low'}
            </div>
          </div>
          <div className="flex gap-2.5 flex-wrap">
            {[
              { label: 'UPTIME', value: agent.uptime, color: '#0EA5E9', bg: '#F8FAFC', border: '#E2E8F0' },
              { label: 'ALERTS', value: String(agent.alerts), color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC', border: agent.alerts > 0 ? '#FDE68A' : '#E2E8F0' },
              { label: 'NEXT EVAL', value: agent.nextEval, color: '#6366F1', bg: '#F8FAFC', border: '#E2E8F0' },
            ].map((s) => (
              <div key={s.label} className="text-center rounded-[10px] py-2 px-3.5"
                style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}>
                <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-4 rounded-lg flex items-center gap-2 py-2.5 px-3.5"
          style={{ backgroundColor: `${agent.color}0A`, border: `1px solid ${agent.color}30` }}>
          <Activity size={13} color={agent.color} />
          <span className="text-[11px] font-bold uppercase tracking-wider shrink-0" style={{ color: agent.color }}>Currently</span>
          <span className="text-[13px] text-slate-700">{agent.currentTask}</span>
        </div>
      </div>

      {/* ── AGENT OVERVIEW ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 px-5 mb-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3.5">
          <BarChart2 size={14} color="#6366F1" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent Overview</span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {[
            { label: 'Suppliers Monitored', value: agent.suppliers.length, icon: <Users size={16} color="#8B5CF6" />, color: '#8B5CF6', bg: '#F5F3FF' },
            { label: 'SLM Tasks', value: agentControls.length, icon: <Shield size={16} color="#0EA5E9" />, color: '#0EA5E9', bg: '#EFF6FF' },
            { label: 'Open Alerts', value: agent.alerts, icon: <Bell size={16} color={agent.alerts > 0 ? '#F59E0B' : '#94A3B8'} />, color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC' },
            { label: 'Open Tasks', value: openCount + inProgressCount, icon: <FileText size={16} color={openCount > 0 ? '#EF4444' : '#10B981'} />, color: openCount > 0 ? '#EF4444' : '#10B981', bg: openCount > 0 ? '#FEF2F2' : '#ECFDF5' },
            { label: 'Last Scan', value: agent.lastScan, icon: <Clock size={16} color="#6366F1" />, color: '#6366F1', bg: '#EEF2FF' },
          ].map((m) => (
            <div key={m.label} className="rounded-[10px] flex flex-col gap-1.5 py-3 px-3.5" style={{ backgroundColor: m.bg }}>
              <div className="flex items-center gap-1.5">
                {m.icon}
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{m.label}</span>
              </div>
              <div className="text-[22px] font-extrabold" style={{ color: m.color }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT ── */}
      <div className="grid gap-4 items-start grid-cols-[300px_1fr]">

        {/* LEFT */}
        <div className="flex flex-col gap-3.5">
          <SLMTasksPanel
            agentId={id || ''}
            controls={agentControls}
            onReorder={(updated) => setAgent(prev => prev ? { ...prev, controls: updated } as any : prev)}
          />

          <StakeholderMap
            agentId={id || ''}
            internalSpoc={(agent as any).internal_spoc || (agent as any).internalSpoc}
            externalSpoc={(agent as any).external_spoc || (agent as any).externalSpoc}
            internalContacts={(agent as any).internal_contacts || (agent as any).internalContacts}
            supplierContacts={(agent as any).supplier_contacts || (agent as any).supplierContacts}
          />

          {/* Monitoring Suppliers */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2.5">
              <TrendingUp size={14} color="#8B5CF6" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Monitoring Suppliers</span>
            </div>
            <div className="flex flex-col gap-1.5">
              {agent.suppliers.map((s) => (
                <div key={s} className="flex items-center gap-2 text-[13px] text-slate-700 bg-purple-50 rounded-[7px] py-1.5 px-2.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />{s}
                </div>
              ))}
              {agent.suppliers.length === 0 && <span className="text-xs text-slate-400">No suppliers assigned</span>}
            </div>
          </div>

          {/* Connected Systems */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Database size={14} color="#F59E0B" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Connected Systems</span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {agent.systems.map((s) => (
                <span key={s} className="bg-amber-50 text-amber-500 text-xs font-medium rounded-full border border-amber-200 py-[3px] px-2.5">{s}</span>
              ))}
              {agent.systems.length === 0 && <span className="text-xs text-slate-400">No systems connected</span>}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className={`flex items-center gap-1.5 cursor-pointer ${timelineCollapsed ? 'mb-0' : 'mb-3.5'}`}
              onClick={() => setTimelineCollapsed(v => !v)}>
              <GitMerge size={14} color="#6366F1" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex-1">Activity Timeline</span>
              {timelineCollapsed ? <ChevronDown size={13} color="#94A3B8" /> : <ChevronUp size={13} color="#94A3B8" />}
            </div>
            {!timelineCollapsed && (
              <div>
                {timeline.map((entry, idx) => (
                  <TimelineItem key={entry.id} entry={entry} isLast={idx === timeline.length - 1} />
                ))}
                {timeline.length === 0 && <span className="text-xs text-slate-400">No timeline entries</span>}
              </div>
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div className="flex flex-col gap-4">

          {/* Agent Tasks */}
          <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <Flag size={15} color="#EF4444" />
                <span className="text-[15px] font-bold text-slate-900">Agent Tasks</span>
                {tasks.length > 0 && (
                  <span className="text-[11px] font-bold text-white bg-red-500 rounded-full px-2 py-px">{tasks.length}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {tasks.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Clear all tasks for this agent?')) return;
                      try {
                        await clearAgentTasks(id || '');
                        setTasks([]);
                        toast.success('All tasks cleared');
                      } catch {
                        toast.error('Failed to clear tasks');
                      }
                    }}
                    className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-red-100">
                    <Trash2 size={11} /> Clear All
                  </button>
                )}
                <div className="flex gap-1.5">
                  {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((f) => (
                    <button key={f} onClick={() => setTaskFilter(f as TaskStatus | 'All')}
                      className="text-[11px] font-semibold rounded-full cursor-pointer py-1 px-3"
                      style={{
                        backgroundColor: taskFilter === f ? agent.color : '#F8FAFC',
                        color: taskFilter === f ? '#fff' : '#64748B',
                        border: `1px solid ${taskFilter === f ? agent.color : '#E2E8F0'}`,
                      }}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-5 py-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[13px]">
                  <CheckCircle2 size={32} color="#A7F3D0" className="block mx-auto mb-2" />
                  No {taskFilter !== 'All' ? taskFilter.toLowerCase() + ' ' : ''}tasks for this agent
                </div>
              ) : filteredTasks.map((task) => (
                <TaskRow key={task.id} task={task} agentColor={agent.color} />
              ))}
            </div>
          </div>

          {/* Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm flex flex-col h-[520px]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Zap size={16} color="#F59E0B" />
                <span className="text-[15px] font-bold text-slate-900">Activity Feed</span>
                {isActive && (
                  <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 rounded-full border border-emerald-200 px-2 py-px">
                    STREAMING LIVE
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">{logs.length} entries</span>
                {logs.length > 0 && (
                  <button
                    onClick={async () => {
                      if (!window.confirm('Clear activity log?')) return;
                      try {
                        await clearAgentLogs(id || '');
                        toast.success('Logs cleared — refresh to confirm');
                      } catch {
                        toast.error('Failed to clear logs');
                      }
                    }}
                    className="text-[11px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-slate-200">
                    Clear
                  </button>
                )}
              </div>
            </div>
            <div className="px-5 py-2 border-b border-slate-100 flex gap-2 flex-wrap shrink-0 bg-[#FAFAFA]">
              {Object.entries(LOG_STYLE).map(([type, s]) => (
                <span key={type} className="text-[10px] font-bold rounded px-[7px] py-px"
                  style={{ color: s.color, backgroundColor: s.bg }}>
                  {s.label}
                </span>
              ))}
              <span className="text-[10px] text-slate-400 ml-1">&middot; Click REASON to expand</span>
            </div>
            <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-3">
              {logs.map((entry) => <LogRow key={entry.id} entry={entry} />)}
              {isActive && (
                <div className="flex items-center gap-1.5 py-1.5 text-slate-400">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 transition-opacity duration-300"
                    style={{ opacity: pulse ? 1 : 0 }} />
                  <span className="text-xs font-mono">Agent running...</span>
                </div>
              )}
            </div>
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0 rounded-b-[14px]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock size={13} color="#6366F1" />
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Planned Next Steps</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                {isActive ? (
                  <>
                    <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">
                      Re-evaluate controls ({agent.nextEval})
                    </span>
                    <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">
                      Check supplier assessments
                    </span>
                    <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">
                      Update audit log entries
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-slate-400">Agent idle — triggers checked at {agent.nextEval}</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
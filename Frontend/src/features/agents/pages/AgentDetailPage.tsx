import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';
import {
  Bot, ChevronLeft, Pencil, Mic, Volume2, MessageSquare, Image as ImageIcon,
  RefreshCw, CheckCircle2, Send, X, Plus, Check,
  AlertCircle, Clock, AlertTriangle, Eye, Cpu, XCircle, ShieldCheck, Handshake, Truck,
  Activity, Zap, Shield, ChevronDown, ChevronUp,
  Brain, ChevronRight, Users, BarChart2, Bell,
  FileText, Flag, GitMerge, Loader2, Trash2, Play, Square
} from 'lucide-react';
import { toast } from 'sonner';

import type { Agent, LogEntry, AgentTask, TimelineEntry, TaskStatus } from '../types';
import type { Stage } from '../../../types/shared';
import {
  STATUS_CLR, STATUS_LABEL, STAGE_CLR, AVATAR_GRADIENTS,
  STAGES, LOG_STYLE,
  getMockAgents, openAlerts,
  getAgentTasksList, getAgentTimelineList,
  getInitialLogsList, getStreamQueueList,
  getAvatarUrl,
  getAgents,
  getAgentTasks,
  getAgentTimeline,
  getAgentLogs,
  createAgent,
  updateAgent,
  deleteAgent,
  runAgent,
  stopAgent,
  runAgentTask,
  clearAgentTasks, clearAgentLogs,
} from '../services/agents.data';

import { AgentAvatar } from '../components/AgentAvatar';
import { LogRow } from '../components/LogRow';
import { TaskRow } from '../components/TaskRow';
import { TimelineItem } from '../components/TimelineItem';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { VoiceModal } from '../components/VoiceModal';
import { TalkModal } from '../components/TalkModal';
import { ChatModal } from '../components/ChatModal';
import { useAgentLogStream } from '../hooks/useAgentLogStream';

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [agent, setAgent] = useState<Agent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getAgents()
      .then((data) => {
        if (mounted) {
          const found = data.find((a) => a.id === id);
          if (found) setAgent(found);
          else setError('Agent not found');
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch agents:', err);
        if (mounted) {
          const found = getMockAgents().find((a) => a.id === id);
          if (found) setAgent(found);
          else setError('Agent not found');
          setIsLoading(false);
        }
      });

    const pollInterval = setInterval(() => {
      getAgents().then(data => {
        if (mounted) {
          const found = data.find(a => a.id === id);
          if (found) setAgent(found);
        }
      }).catch(console.error);
    }, 4000);

    return () => { 
      mounted = false; 
      clearInterval(pollInterval);
    };
  }, [id]);

  const handleUpdateAgent = async (updated: Agent) => {
    setAgent(updated);
    try {
      await updateAgent(updated.id, {
        name: updated.name,
        initials: updated.initials,
        status: updated.status,
        stage: updated.stage,
        controls: updated.controls,
        suppliers: updated.suppliers,
        gradient: updated.gradient,
        alerts: updated.alerts,
        division: updated.division,
        frequency: updated.frequency,
        notify: updated.notify,
        role: updated.role,
        color: updated.color,
        avatarSeed: updated.avatarSeed,
        uptime: updated.uptime,
        nextEval: updated.nextEval,
        lastScan: updated.lastScan,
        openTasks: updated.openTasks,
        currentTask: updated.currentTask,
      } as any);
    } catch (err) {
      console.error('Failed to update agent:', err);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-[1200px]">
        <Loader2 size={32} className="animate-spin text-sky-500" />
        <p className="text-slate-500 text-sm">Loading agent details...</p>
      </div>
    );
  }

  if (error || !agent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4 max-w-[1200px]">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-slate-700 font-medium">{error || 'Failed to load agent'}</p>
        <button onClick={() => navigate('/agents')} className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none">
          Back to Agents
        </button>
      </div>
    );
  }

  return <AgentDetailView agent={agent} onBack={() => navigate('/agents')} onUpdateAgent={handleUpdateAgent} />;
}

/* ─── SLMTasksPanel ─────────────────────────────────────── */

function SLMTasksPanel({ agent, onUpdateAgent }: { agent: Agent; onUpdateAgent: (a: Agent) => void }) {
  const [taskList, setTaskList] = useState<string[]>(agent.controlList || []);
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
      const a = await updateAgent(agent.id, { controlList: updated, controls: updated.length } as any);

    } catch {
      toast.error('Failed to update task order');
    } finally {
      setSaving(false);
    }
  };

  const STATUS_COLORS: Record<number, { bg: string; text: string; label: string; dot: string }> = {
    0: { bg: '#ECFDF5', text: '#059669', label: 'Active', dot: '#10B981' },
    1: { bg: '#F0F9FF', text: '#0369A1', label: 'Queued', dot: '#38BDF8' },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} color="#8B5CF6" />
          <span className="text-sm font-bold text-slate-900">SLM Tasks Enforced</span>
        </div>
        <div className="flex items-center gap-2">
          {saving && <RefreshCw size={12} className="animate-spin text-slate-400" />}
          <span className="bg-purple-50 text-purple-500 text-[11px] rounded-full px-2 py-px">{taskList.length}</span>
        </div>
      </div>

      {taskList.length === 0 && (
        <div className="text-xs text-slate-400 py-4 text-center italic">No tasks enforced</div>
      )}

      <div className="flex flex-col gap-2">
        {taskList.map((task, i) => {
          const statusKey = i === 0 ? 0 : 1;
          const s = STATUS_COLORS[statusKey];
          return (
            <div key={task}
              className="flex items-center gap-3 rounded-xl border border-slate-100 px-3.5 py-3 transition-all"
              style={{ backgroundColor: i === 0 ? '#F0FDF4' : '#F8FAFC' }}>
              <div className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                style={{ backgroundColor: i === 0 ? '#D1FAE5' : '#E2E8F0', color: i === 0 ? '#059669' : '#64748B' }}>
                {i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-semibold text-slate-700 truncate">{task}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s.dot }} />
                  <span className="text-[10px] font-semibold" style={{ color: s.text }}>{s.label}</span>
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
          );
        })}
      </div>

      {taskList.length > 0 && (
        <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
          <ChevronUp size={11} />
          Use arrows to set priority &mdash; Step 1 runs first
        </div>
      )}
    </div>
  );
}

/* ─── StakeholderMap ────────────────────────────────────── */

function StakeholderMap({ agent, onUpdateAgent }: { agent: Agent; onUpdateAgent: (a: Agent) => void }) {
  const [editMode, setEditMode] = useState(false);
  const [internalEmails, setInternalEmails] = useState<string[]>(
    (agent as any).internalContacts?.length ? (agent as any).internalContacts : (agent.internalSpoc ? [agent.internalSpoc] : [''])
  );
  const [supplierEmails, setSupplierEmails] = useState<string[]>(
    (agent as any).supplierContacts?.length ? (agent as any).supplierContacts : (agent.externalSpoc ? [agent.externalSpoc] : [''])
  );
  const [saving, setSaving] = useState(false);

  const addEmail = (side: 'int' | 'sup') => side === 'int' ? setInternalEmails(p => [...p, '']) : setSupplierEmails(p => [...p, '']);
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
      await updateAgent(agent.id, {
        internalSpoc: internalEmails.filter(Boolean)[0] || '',
        externalSpoc: supplierEmails.filter(Boolean)[0] || '',
        internalContacts: internalEmails.filter(Boolean),
        supplierContacts: supplierEmails.filter(Boolean),
      } as any);
      setEditMode(false);
      toast.success('Contacts updated — running Payment Monitoring task...');

      // Auto-trigger Task 3 only
      await runAgentTask(agent.id, 'Payment Conversation Monitoring');

    } catch {
      toast.error('Failed to update contacts');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping opacity-70" />
          <span className="text-sm font-bold text-slate-900">Stakeholder Communication Map</span>
        </div>
        {!editMode ? (
          <button onClick={() => setEditMode(true)}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-sky-500 bg-blue-50 border-none px-3 py-1.5 rounded-lg cursor-pointer hover:bg-blue-100">
            <Pencil size={12} /> Edit Contacts
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => setEditMode(false)} className="text-[12px] text-slate-500 border border-slate-200 bg-white rounded-lg px-3 py-1.5 cursor-pointer">Cancel</button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 text-[12px] font-semibold text-white bg-sky-500 border-none px-3 py-1.5 rounded-lg cursor-pointer hover:bg-sky-600 disabled:opacity-50">
              {saving ? <RefreshCw size={11} className="animate-spin" /> : <Check size={11} />} Save
            </button>
          </div>
        )}
      </div>

      {editMode ? (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-2">Internal</div>
            {internalEmails.map((email, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                <input value={email} onChange={e => updateEmail('int', i, e.target.value)} placeholder="internal@company.co"
                  className="flex-1 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none bg-white py-2 px-2.5" />
                {internalEmails.length > 1 && (
                  <button onClick={() => removeEmail('int', i)} className="w-7 shrink-0 border border-red-200 rounded-lg bg-red-50 text-red-500 cursor-pointer flex items-center justify-center"><X size={10} /></button>
                )}
              </div>
            ))}
            <button onClick={() => addEmail('int')} className="text-[11px] text-sky-500 bg-transparent border border-dashed border-sky-200 rounded-lg cursor-pointer w-full py-1.5 px-2.5 hover:bg-blue-50">+ Add email</button>
          </div>
          <div>
            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-2">Supplier</div>
            {supplierEmails.map((email, i) => (
              <div key={i} className="flex gap-1.5 mb-1.5">
                <input value={email} onChange={e => updateEmail('sup', i, e.target.value)} placeholder="contact@supplier.com"
                  className="flex-1 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none bg-white py-2 px-2.5" />
                {supplierEmails.length > 1 && (
                  <button onClick={() => removeEmail('sup', i)} className="w-7 shrink-0 border border-red-200 rounded-lg bg-red-50 text-red-500 cursor-pointer flex items-center justify-center"><X size={10} /></button>
                )}
              </div>
            ))}
            <button onClick={() => addEmail('sup')} className="text-[11px] text-purple-500 bg-transparent border border-dashed border-purple-200 rounded-lg cursor-pointer w-full py-1.5 px-2.5 hover:bg-purple-50">+ Add email</button>
          </div>
        </div>
      ) : (
        <div className="grid items-center grid-cols-[1fr_auto_1fr]">
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1">Internal</div>
            {internalEmails.filter(Boolean).map((email, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 py-1.5 px-2.5">
                <div className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold" style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)' }}>{email.slice(0, 2).toUpperCase()}</div>
                <span className="text-[11px] font-medium text-sky-700 truncate">{email}</span>
              </div>
            ))}
            {internalEmails.filter(Boolean).length === 0 && <div className="text-[11px] text-slate-400 italic px-1">No contact assigned</div>}
          </div>
          <div className="shrink-0 w-20 h-20">
            <svg width={80} height={80} style={{ overflow: 'visible' }}>
              <line x1={10} y1={20} x2={70} y2={20} stroke="#0EA5E9" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
              <line x1={10} y1={40} x2={70} y2={40} stroke="#8B5CF6" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
              <line x1={70} y1={60} x2={10} y2={60} stroke="#10B981" strokeWidth={1.5} strokeDasharray="4,3" opacity={0.5} />
              <circle cx={40} cy={40} r={14} fill="#fff" stroke="#E2E8F0" strokeWidth={1} />
              <text x={40} y={44} textAnchor="middle" fontSize={8} fill="#94A3B8" fontWeight={700}>AI</text>
            </svg>
          </div>
          <div className="flex flex-col gap-2">
            <div className="text-[10px] font-bold text-purple-500 uppercase tracking-wider mb-1 text-right">Supplier</div>
            {supplierEmails.filter(Boolean).map((email, i) => (
              <div key={i} className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 flex-row-reverse py-1.5 px-2.5">
                <div className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>{email.slice(0, 2).toUpperCase()}</div>
                <span className="text-[11px] font-medium text-purple-700 truncate text-right">{email}</span>
              </div>
            ))}
            {supplierEmails.filter(Boolean).length === 0 && <div className="text-[11px] text-slate-400 italic px-1 text-right">No contact assigned</div>}
          </div>
        </div>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AGENT DETAIL VIEW
══════════════════════════════════════════════════════════════ */

function AgentDetailView({
  agent,
  onBack,
  onUpdateAgent,
}: {
  agent: Agent;
  onBack: () => void;
  onUpdateAgent: (a: Agent) => void;
}) {
  const feedRef = useRef<HTMLDivElement>(null);
  const agentColor = agent.color || '#0EA5E9';
  const agentRole = agent.role || 'AI Agent';
  const isActive = agent.status === 'live' || agent.status === 'active';
  const displayStage = agent.stage || 'Acquisition';
  const [stageBg, stageClr] = STAGE_CLR[displayStage as Stage] || ['#F1F5F9', '#64748B'];

  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [initialLogs, setInitialLogs] = useState<LogEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [forceDisconnect, setForceDisconnect] = useState(false);
  const [vendors, setVendors] = useState<any[]>([]);

  useEffect(() => {
    import('../../vendors/services/vendors.data')
      .then(m => m.getVendors().then(setVendors))
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (agent?.status === 'idle') {
      getAgentTasks(agent.id, 'list').then(setTasks).catch(console.error);
    }
  }, [agent?.status, agent.id]);

  useEffect(() => {
    let mounted = true;
    setIsLoadingData(true);

    Promise.all([
      getAgentTasks(agent.id, 'list'),
      getAgentTimeline(agent.id, 'detail'),
      getAgentLogs(agent.id, 'detail'),
    ]).then(([fetchedTasks, fetchedTimeline, fetchedLogs]) => {
      if (mounted) {
        setTasks(fetchedTasks);
        setTimeline(fetchedTimeline);
        setInitialLogs(fetchedLogs);
        setIsLoadingData(false);
      }
    }).catch((err) => {
      console.error('Failed to fetch agent data:', err);
      if (mounted) {
        setTasks(getAgentTasksList(agent.id));
        setTimeline(getAgentTimelineList(agent.id));
        setInitialLogs(getInitialLogsList(agent.id));
        setIsLoadingData(false);
      }
    });

    return () => { mounted = false; };
  }, [agent.id]);

  // Poll for new logs and tasks every 4 seconds
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const [freshLogs, freshTasks] = await Promise.all([
          getAgentLogs(agent.id, 'detail'),
          getAgentTasks(agent.id, 'list'),
        ]);
        setInitialLogs(freshLogs);
        setTasks(freshTasks);
      } catch (err) {
        console.error('Poll failed:', err);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [agent.id]);

  const { logs, pulse } = useAgentLogStream({
    agentId: agent.id,
    view: 'detail',
    initialLogs,
    streamQueue: [],
    isActive: isActive && !forceDisconnect,
  });

  const handleRunAgent = async () => {
    try {
      setIsAgentRunning(true);
      setForceDisconnect(true);
      setTimeout(() => setForceDisconnect(false), 100);
      
      // Instantly trigger UI Active State so SSE connects immediately
      onUpdateAgent({ ...agent, status: 'active', currentTask: 'Initializing run...' });

      await runAgent(agent.id);
      toast.success('Agent started successfully');
    } catch (err) {
      console.error('Failed to run agent:', err);
      toast.error('Failed to run agent');
    } finally {
      setIsAgentRunning(false);
    }
  };

  const handleStopAgent = async () => {
    try {
      setIsAgentRunning(true); // Re-use loading state for the button spinner
      setForceDisconnect(true);
      setTimeout(() => setForceDisconnect(false), 100);

      // Instantly trigger UI Idle State
      onUpdateAgent({ ...agent, status: 'idle', currentTask: 'Stopped by user' });

      await stopAgent(agent.id);
      toast.success('Agent stopped successfully');
    } catch (err) {
      console.error('Failed to stop agent:', err);
      toast.error('Failed to stop agent');
      setIsAgentRunning(false);
    }
  };

  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'All'>('All');
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [detailModal, setDetailModal] = useState<null | 'picture' | 'voice' | 'talk' | 'chat'>(null);

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter((t) => t.status === taskFilter);
  const openCount = tasks.filter((t) => t.status === 'Open').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;

  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [logs]);

  const actionCards = [
    { key: 'picture', icon: <ImageIcon size={20} color="#0EA5E9" />, iconBg: '#EFF6FF', title: 'Select Picture', sub: "Change the agent's avatar" },
    { key: 'voice', icon: <Mic size={20} color="#8B5CF6" />, iconBg: '#F5F3FF', title: 'Select Voice', sub: 'Choose how this agent speaks' },
    { key: 'talk', icon: <Volume2 size={20} color="#10B981" />, iconBg: '#ECFDF5', title: 'Talk to Agent', sub: 'Speak directly with this agent' },
    { key: 'chat', icon: <MessageSquare size={20} color="#F59E0B" />, iconBg: '#FFF7ED', title: 'Start Chat', sub: 'Open chat interface with agent' },
  ];

  /* ── Reasoning rows derived from logs ── */
  interface ReasoningRow {
    time: string;
    action: string;
    trigger: string;
    reasoning: string;
    confidence: string;
    outcome: 'check' | 'alert' | 'warn';
  }

  const reasoningRows: ReasoningRow[] = logs
    .filter(l => l.type === 'reasoning')
    .map((l) => ({
      time: l.time,
      action: 'AI Evaluation',
      trigger: l.message,
      reasoning: l.detail || l.message,
      confidence: '95%',
      outcome: (l.detail?.includes('High') || l.detail?.includes('Critical')) ? 'alert' : 'check',
    }));

  return (
    <div className="flex flex-col min-h-full">
      {/* Top nav */}
      <div className="bg-white border-b border-slate-200 flex items-center justify-between shrink-0 py-3.5 px-6">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-slate-500 text-sm rounded-lg px-2.5 py-1.5 hover:bg-slate-50">
            <ChevronLeft size={18} /> Back to Agents
          </button>
          <span className="text-slate-200">|</span>
          <div className="text-lg font-bold text-slate-900">{agent.name}</div>
          <span className="text-xs font-semibold rounded-full px-2.5 py-0.5" style={{ backgroundColor: STATUS_CLR[agent.status] + '22', color: STATUS_CLR[agent.status] }}>
            {STATUS_LABEL[agent.status]}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {isActive ? (
            <button
              onClick={handleStopAgent}
              disabled={isAgentRunning}
              className="flex items-center gap-2 bg-[#EF4444] text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-[#DC2626] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAgentRunning ? <Loader2 size={16} className="animate-spin" /> : <Square size={16} fill="currentColor" />}
              Stop Agent
            </button>
          ) : (
            <button
              onClick={handleRunAgent}
              disabled={isAgentRunning}
              className="flex items-center gap-2 bg-[#10B981] text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-[#059669] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAgentRunning ? <Loader2 size={16} className="animate-spin" /> : <Play size={16} />}
              Run Agent
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* ── AGENT PROFILE HEADER ── */}
        <div className="bg-white border border-slate-200 rounded-[14px] p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-5 flex-wrap">
            <div className="relative shrink-0">
              <img
                src={getAvatarUrl(agent.avatarSeed || agent.initials)}
                alt={agent.name}
                width={72} height={72}
                className="rounded-full block bg-slate-100"
                style={{ border: `3px solid ${agentColor}40` }}
              />
              <div
                className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-opacity duration-300"
                style={{ backgroundColor: STATUS_CLR[agent.status], opacity: isActive ? (pulse ? 1 : 0.4) : 1 }}
              />
            </div>
            <div className="flex-1 min-w-[180px]">
              <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
                <h1 className="text-[22px] font-bold text-slate-900 m-0">{agent.name}</h1>
                <div className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${isActive ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#F1F5F9] border-[#E2E8F0]'}`}>
                  <div className="w-[7px] h-[7px] rounded-full transition-opacity duration-300" style={{ backgroundColor: STATUS_CLR[agent.status], opacity: isActive ? (pulse ? 1 : 0.3) : 1 }} />
                  <span className="text-xs font-semibold" style={{ color: STATUS_CLR[agent.status] }}>{isActive ? 'LIVE' : 'IDLE'}</span>
                </div>
              </div>
              <div className="text-[13px] text-slate-500 mb-1">{agentRole}</div>
              <div className="text-xs text-slate-400">{agent.controls} SLM Tasks &middot; {agent.suppliers} suppliers &middot; Division: {agent.division}</div>
            </div>
            <div className="flex gap-2.5 flex-wrap">
              {[
                { label: 'UPTIME', value: agent.uptime || '\u2014', color: '#0EA5E9', bg: '#F8FAFC', border: '#E2E8F0' },
                { label: 'ALERTS', value: String(agent.alerts), color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC', border: agent.alerts > 0 ? '#FDE68A' : '#E2E8F0' },
                { label: 'NEXT EVAL', value: agent.nextEval || '\u2014', color: '#6366F1', bg: '#F8FAFC', border: '#E2E8F0' },
              ].map((s) => (
                <div key={s.label} className="text-center rounded-[10px] py-2 px-3.5" style={{ backgroundColor: s.bg, border: `1px solid ${s.border}` }}>
                  <div className="text-lg font-extrabold" style={{ color: s.color }}>{s.value}</div>
                  <div className="text-[10px] text-slate-400 font-semibold tracking-wide">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
          {/* Current task bar */}
          <div className="mt-4 rounded-lg flex items-center gap-2 py-2.5 px-3.5" style={{ backgroundColor: `${agentColor}0A`, border: `1px solid ${agentColor}30` }}>
            <Activity size={13} color={agentColor} />
            <span className="text-[11px] font-bold uppercase tracking-wider shrink-0" style={{ color: agentColor }}>Currently</span>
            <span className="text-[13px] text-slate-700">{agent.currentTask || agent.division}</span>
          </div>
          {/* Truth match */}
          {agent.truthMatch !== undefined && (
            <div className={`mt-3 inline-flex items-center gap-2 rounded-full py-[5px] px-3.5 border ${agent.truthMatch === 100 ? 'bg-[#ECFDF5] border-[#A7F3D0]' : agent.truthMatch >= 50 ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#FEF2F2] border-[#FECACA]'}`}>
              {agent.truthMatch === 100
                ? <CheckCircle2 size={13} color="#10B981" />
                : agent.truthMatch >= 50
                  ? <AlertTriangle size={13} color="#F59E0B" />
                  : <AlertCircle size={13} color="#EF4444" />
              }
              <span className={`text-xs font-semibold ${agent.truthMatch === 100 ? 'text-[#059669]' : agent.truthMatch >= 50 ? 'text-[#92400E]' : 'text-[#DC2626]'}`}>
                Truth Match: {agent.truthMatch}%
              </span>
            </div>
          )}
        </div>

        {/* ── AGENT OVERVIEW ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 px-5 mb-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3.5">
            <BarChart2 size={14} color="#6366F1" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent Overview</span>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {[
              { label: 'Suppliers Monitored', value: agent.suppliers, icon: <Users size={16} color="#8B5CF6" />, color: '#8B5CF6', bg: '#F5F3FF' },
              { label: 'SLM Tasks', value: agent.controls, icon: <Shield size={16} color="#0EA5E9" />, color: '#0EA5E9', bg: '#EFF6FF' },
              { label: 'Open Alerts', value: agent.alerts, icon: <Bell size={16} color={agent.alerts > 0 ? '#F59E0B' : '#94A3B8'} />, color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC' },
              { label: 'Open Tasks', value: openCount + inProgressCount, icon: <FileText size={16} color={openCount > 0 ? '#EF4444' : '#10B981'} />, color: openCount > 0 ? '#EF4444' : '#10B981', bg: openCount > 0 ? '#FEF2F2' : '#ECFDF5' },
              { label: 'Last Scan', value: agent.lastScan || '\u2014', icon: <Clock size={16} color="#6366F1" />, color: '#6366F1', bg: '#EEF2FF' },
            ].map((m) => (
              <div key={m.label} className="rounded-[10px] flex flex-col gap-1.5 py-3 px-3.5" style={{ backgroundColor: m.bg }}>
                <div className="flex items-center gap-1.5">{m.icon}<span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{m.label}</span></div>
                <div className="text-[22px] font-extrabold" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAKEHOLDER MAP ── */}
        <StakeholderMap agent={agent} onUpdateAgent={onUpdateAgent} />

        {/* ── PROCESS INTELLIGENCE ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <div className="text-sm font-bold text-slate-900 mb-3.5">Process Intelligence Summary</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Last SOW Signed', value: '—', icon: '📄', color: '#0EA5E9', bg: '#EFF6FF' },
              { label: 'Last Payment Detected', value: '—', icon: '₹', color: '#10B981', bg: '#ECFDF5' },
              { label: 'Last Escalation', value: 'None detected', icon: '⚡', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Active Risks', value: agent.alerts > 0 ? `${agent.alerts} open alert${agent.alerts > 1 ? 's' : ''}` : 'None detected', icon: '!', color: agent.alerts > 0 ? '#EF4444' : '#10B981', bg: agent.alerts > 0 ? '#FEF2F2' : '#ECFDF5' },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2.5 rounded-[10px] py-2.5 px-3" style={{ backgroundColor: item.bg, border: `1px solid ${item.color}22` }}>
                <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-sm shrink-0 shadow-sm">{item.icon}</div>
                <div>
                  <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">{item.label}</div>
                  <div className="text-[13px] font-bold" style={{ color: item.color }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN LAYOUT ── */}
        <div className="grid gap-4 items-start grid-cols-[300px_1fr]">
          {/* LEFT */}
          <div className="flex flex-col gap-3.5">
            {/* Suppliers */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Eye size={16} color="#0EA5E9" /><span className="text-sm font-bold text-slate-900">Suppliers Monitored</span></div>
                <span className="bg-sky-50 text-sky-500 text-[11px] rounded-full px-2 py-px">{agent.suppliers}</span>
              </div>
              {((agent.supplierList || []) as string[]).map((supId: string, i: number, arr: string[]) => {
                const vendor = vendors.find(v => v.id === supId || v.name === supId);
                const supName = vendor?.name || supId;
                return (
                  <div key={supId} className={`flex justify-between items-center py-2.5 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}>
                    <div>
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: '#0EA5E9' }} />
                        <span className="text-[13px] font-semibold text-slate-700">{supName}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 pl-3.5">{displayStage}</span>
                    </div>
                    <span className="bg-emerald-50 text-emerald-500 text-[11px] rounded-full px-2 py-px">Flowing</span>
                  </div>
                );
              })}
              {(!agent.supplierList || agent.supplierList.length === 0) && <div className="text-xs text-slate-400 py-4 text-center italic">No suppliers monitored</div>}
            </div>

            {/* SLM Tasks */}
            <SLMTasksPanel agent={agent} onUpdateAgent={onUpdateAgent} />

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div
                className={`flex items-center gap-1.5 cursor-pointer ${timelineCollapsed ? 'mb-0' : 'mb-3.5'}`}
                onClick={() => setTimelineCollapsed((v) => !v)}
              >
                <GitMerge size={14} color="#6366F1" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex-1">Activity Timeline</span>
                {timelineCollapsed ? <ChevronDown size={13} color="#94A3B8" /> : <ChevronUp size={13} color="#94A3B8" />}
              </div>
              {!timelineCollapsed && (
                <div>
                  {timeline.map((entry, idx) => <TimelineItem key={entry.id} entry={entry} isLast={idx === timeline.length - 1} />)}
                  {timeline.length === 0 && <span className="text-xs text-slate-400">No timeline entries</span>}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex flex-col gap-4">
            {/* Tasks */}
            <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2.5">
                <div className="flex items-center gap-2">
                  <Flag size={15} color="#EF4444" />
                  <span className="text-[15px] font-bold text-slate-900">Agent Tasks</span>
                  {tasks.length > 0 && <span className="text-[11px] font-bold text-white bg-red-500 rounded-full px-2 py-px">{tasks.length}</span>}
                </div>
                <div className="flex items-center gap-2">
                  {tasks.length > 0 && (
                    <button
                      onClick={async () => {
                        if (!window.confirm('Clear all tasks for this agent?')) return;
                        try {
                          await clearAgentTasks(agent.id);
                          setTasks([]);
                          toast.success('All tasks cleared');
                        } catch {
                          toast.error('Failed to clear tasks');
                        }
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-semibold text-red-500 bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg cursor-pointer hover:bg-red-100"
                    >
                      <Trash2 size={11} /> Clear All
                    </button>
                  )}
                  <div className="flex gap-1.5">
                    {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((f) => (
                      <button key={f} onClick={() => setTaskFilter(f as TaskStatus | 'All')}
                        className="text-[11px] font-semibold rounded-full cursor-pointer py-1 px-3"
                        style={{ backgroundColor: taskFilter === f ? agentColor : '#F8FAFC', color: taskFilter === f ? '#fff' : '#64748B', border: `1px solid ${taskFilter === f ? agentColor : '#E2E8F0'}` }}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="px-5 py-4">
                  {filteredTasks.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-[13px]">
                      <CheckCircle2 size={32} color="#A7F3D0" className="block mx-auto mb-2" />
                      No {taskFilter !== 'All' ? taskFilter.toLowerCase() + ' ' : ''}tasks for this agent
                    </div>
                  ) : filteredTasks.map((task) => <TaskRow key={task.id} task={task} agentColor={agentColor} />)}
                </div>
              </div>
            </div>

            {/* Agent Reasoning — FIXED: extracted to typed array before render */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-4 py-3.5 border-b border-slate-50 flex justify-between items-center">
                  <div className="flex items-center gap-2"><Cpu size={16} color="#0EA5E9" /><span className="text-sm font-bold text-slate-900">Agent Reasoning</span></div>
                  <div className="flex items-center gap-1.5">
                    <span className="relative inline-flex w-2 h-2">
                      <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-50 animate-ping" />
                      <span className="relative w-2 h-2 rounded-full bg-emerald-500 block" />
                    </span>
                    <span className="text-xs text-emerald-500">Live</span>
                  </div>
                </div>
                {reasoningRows.map((row, i, arr) => (
                  <div key={i} className={`flex gap-3 py-3 px-4 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}>
                    <div className="text-[11px] text-slate-400 shrink-0 pt-0.5 w-[70px]">{row.time}</div>
                    <div className="flex-1">
                      <div className="text-[13px] text-slate-700 mb-0.5">
                        <span className="font-semibold text-slate-900">{row.action}</span>
                        {' \u00B7 '}
                        {row.trigger}
                      </div>
                      <div className="text-xs text-slate-500 mb-1.5 leading-relaxed whitespace-pre-wrap max-h-60 overflow-y-auto">{row.reasoning}</div>
                      <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-px">Confidence: {row.confidence}</span>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      {row.outcome === 'check' && <CheckCircle2 size={16} color="#10B981" />}
                      {row.outcome === 'alert' && <AlertCircle size={16} color="#EF4444" />}
                      {row.outcome === 'warn' && <AlertTriangle size={16} color="#F59E0B" />}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Activity Feed */}
              <div className="bg-white border border-slate-200 rounded-[14px] flex flex-col h-[440px]">
                <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2.5">
                    <Zap size={16} color="#F59E0B" />
                    <span className="text-[15px] font-bold text-slate-900">Activity Feed</span>
                    {isActive && <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 rounded-full border border-emerald-200 px-2 py-px">STREAMING LIVE</span>}
                  </div>
                  <span className="text-xs text-slate-400">{logs.length} entries</span>
                </div>
                <div className="px-5 py-2 border-b border-slate-100 flex gap-2 flex-wrap shrink-0 bg-[#FAFAFA]">
                  {Object.entries(LOG_STYLE).map(([type, s]) => (
                    <span key={type} className="text-[10px] font-bold rounded px-[7px] py-px" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>
                  ))}
                  <span className="text-[10px] text-slate-400 ml-1">&middot; Click REASON to expand</span>
                </div>
                <div ref={feedRef} className="flex-1 overflow-y-auto px-5 py-3">
                  {logs.map((entry) => <LogRow key={entry.id} entry={entry} />)}
                  {isActive && (
                    <div className="flex items-center gap-1.5 py-1.5 text-slate-400">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 transition-opacity duration-300" style={{ opacity: pulse ? 1 : 0 }} />
                      <span className="text-xs font-mono">Agent running...</span>
                    </div>
                  )}
                </div>
                <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Clock size={13} color="#6366F1" />
                    <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Planned Next Steps</span>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    {isActive ? (
                      <>
                        <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">Re-evaluate controls ({agent.nextEval || '\u2014'})</span>
                        <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">Check supplier assessments</span>
                        <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">Update audit log entries</span>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">Agent idle &mdash; next evaluation {agent.nextEval || '\u2014'}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action cards */}
              <div className="grid grid-cols-2 gap-3.5">
                {actionCards.map((ac) => (
                  <div
                    key={ac.key}
                    onClick={() => setDetailModal(ac.key as 'picture' | 'voice' | 'talk' | 'chat')}
                    className="bg-white border border-slate-200 rounded-xl p-5 cursor-pointer transition-all hover:border-sky-500 hover:shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-[10px] flex items-center justify-center mb-2.5" style={{ backgroundColor: ac.iconBg }}>{ac.icon}</div>
                    <div className="text-[15px] font-bold text-slate-900 mb-0.5">{ac.title}</div>
                    <div className="text-[13px] text-slate-400">{ac.sub}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sub-modals */}
        {detailModal === 'picture' && <AvatarPickerModal agent={agent} onSelect={(seed) => onUpdateAgent({ ...agent, avatarSeed: seed })} onClose={() => setDetailModal(null)} />}
        {detailModal === 'voice' && <VoiceModal onClose={() => setDetailModal(null)} />}
        {detailModal === 'talk' && <TalkModal agent={agent} onClose={() => setDetailModal(null)} />}
        {detailModal === 'chat' && <ChatModal agent={agent} onClose={() => setDetailModal(null)} />}
      </div>
      );
}

      
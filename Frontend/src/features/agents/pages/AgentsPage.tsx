import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router';
import {
  Bot, ChevronLeft, Pencil, Mic, Volume2, MessageSquare, Image as ImageIcon,
  RefreshCw, CheckCircle2, Send, X, Plus, Check,
  AlertCircle, Clock, AlertTriangle, Eye, Cpu, XCircle, ShieldCheck, Handshake, Truck,
  Activity, Zap, Shield, ChevronDown, ChevronUp,
  Brain, ChevronRight, Users, BarChart2, Bell,
  FileText, Flag, GitMerge, Loader2, Trash2, Play,
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
  runAgentTask,
  clearAgentTasks,
} from '../services/agents.data';
import { getControls } from '../../controls/services/controls.data';
import { getVendors } from '../../vendors/services/vendors.data';
import { getDivisions } from '../../library/services/library.data';
import type { Division } from '../../library/types';

import { AgentAvatar } from '../components/AgentAvatar';
import { LogRow } from '../components/LogRow';
import { TaskRow } from '../components/TaskRow';
import { TimelineItem } from '../components/TimelineItem';
import { AvatarPickerModal } from '../components/AvatarPickerModal';
import { VoiceModal } from '../components/VoiceModal';
import { TalkModal } from '../components/TalkModal';
import { ChatModal } from '../components/ChatModal';
import { useAgentLogStream } from '../hooks/useAgentLogStream';

/* ─── StatusIndicator ──────────────────────────────────── */

function StatusIndicator({ status, size = 8 }: { status: Agent['status']; size?: number }) {
  const color = STATUS_CLR[status];
  if (status === 'syncing')
    return (
      <span className="inline-flex items-center gap-1.5">
        <RefreshCw size={12} color={color} className="animate-spin" />
        <span className="text-xs font-medium" style={{ color }}>
          Syncing
        </span>
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="relative inline-flex" style={{ width: size, height: size }}>
        {status === 'live' && (
          <span
            className="absolute inset-0 rounded-full opacity-50 animate-ping"
            style={{ backgroundColor: color }}
          />
        )}
        <span
          className="relative block rounded-full"
          style={{ width: size, height: size, backgroundColor: color }}
        />
      </span>
      <span className="text-xs font-medium" style={{ color }}>
        {STATUS_LABEL[status]}
      </span>
    </span>
  );
}

/* ─── MultiSelect dropdown ──────────────────────────────── */

function MultiSelect({
  label, options, selected, onToggle, chipColor,
}: {
  label: string;
  options: string[];
  selected: Set<string>;
  onToggle: (v: string) => void;
  chipColor: [string, string];
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  return (
    <div ref={ref} className="relative">
      <div
        onClick={() => setOpen((o) => !o)}
        className="border border-slate-200 rounded-lg cursor-pointer flex justify-between items-start bg-white gap-1.5 py-2 px-3 min-h-[42px]"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.size === 0 ? (
            <span className="text-slate-400 text-[13px] leading-6">
              Select {label.toLowerCase()}...
            </span>
          ) : (
            Array.from(selected).map((v) => (
              <span
                key={v}
                className="text-[11px] rounded-full flex items-center gap-1 px-2 py-0.5"
                style={{ backgroundColor: chipColor[0], color: chipColor[1] }}
              >
                {v}
                <button
                  onClick={(e) => { e.stopPropagation(); onToggle(v); }}
                  className="bg-transparent border-none cursor-pointer p-0 flex"
                  style={{ color: chipColor[1] }}
                >
                  <X size={9} />
                </button>
              </span>
            ))
          )}
        </div>
        <span className="text-slate-400 text-[10px] mt-1">&#9662;</span>
      </div>
      {open && (
        <div className="absolute top-[calc(100%+4px)] left-0 right-0 bg-white border border-slate-200 rounded-lg shadow-lg z-[300] max-h-[180px] overflow-y-auto">
          {options.map((opt) => (
            <div
              key={opt}
              onClick={() => onToggle(opt)}
              className={`flex items-center gap-2 cursor-pointer text-[13px] text-slate-700 py-[9px] px-3 ${selected.has(opt) ? 'bg-[#F0F9FF]' : 'bg-white'}`}
            >
              <div
                className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                style={{
                  border: selected.has(opt) ? `2px solid ${chipColor[1]}` : '2px solid #CBD5E1',
                  backgroundColor: selected.has(opt) ? chipColor[1] : '#fff',
                }}
              >
                {selected.has(opt) && <Check size={10} color="#fff" strokeWidth={3} />}
              </div>
              {opt}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ─── CreateAgentModal ──────────────────────────────────── */

const CONSULTING_JOB = {
  title: 'Contract & Commercial Compliance Specialist',
  description: 'This agent monitors the commercial and contractual health of supplier relationships. It reads email communications between internal and supplier contacts, compares them against uploaded reference documents, and evaluates whether contractual obligations are being met.',
  covers: [
    'Purchase Order Verification',
    'SOW Validation',
    'Payment Conversation Monitoring',
    'Approval Chain Tracking',
    'Project Risk Identification',
    'Contractual Obligation Tracking',
    'Escalation & Stakeholder Review',
  ],
};

const IT_RISK_JOB = {
  title: 'IT Risk & Security Compliance Specialist',
  description: 'This agent monitors technical security controls and regulatory compliance across supplier systems. It evaluates infrastructure security, data protection practices, and compliance certifications.',
  covers: [
    'MFA Enforcement Audit',
    'Encryption Standards Review',
    'Vulnerability Assessment',
    'Access Control Review',
    'Incident Response Readiness',
    'Regulatory Certification Tracking',
    'Data Classification Compliance',
  ],
};

function CreateAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Agent) => void }) {
  const [name, setName] = useState('');
  const [gradient, setGradient] = useState(AVATAR_GRADIENTS[0]);
  const [selectedTasks, setSelectedTasks] = useState<Record<string, string[]>>({});
  const [customTask, setCustomTask] = useState('');
  const [customTasks, setCustomTasks] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<Set<string>>(new Set());
  const [stages, setStages] = useState<Set<Stage>>(new Set());
  const [alertLevel, setAlertLevel] = useState('High');
  const [frequency, setFrequency] = useState('Daily');
  const [notify, setNotify] = useState<Set<string>>(new Set(['Risk Manager']));
  const [division, setDivision] = useState('');
  const [slmTemplate, setSlmTemplate] = useState<'consulting' | 'it-risk' | null>(null);
  const [showJobPanel, setShowJobPanel] = useState(false);
  const [activeControlPanel, setActiveControlPanel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [internalContacts, setInternalContacts] = useState<string[]>(['']);
  const [supplierContacts, setSupplierContacts] = useState<string[]>(['']);
  const [availableSuppliers, setAvailableSuppliers] = useState<{id: string, name: string}[]>([]);
  const [availableDivisions, setAvailableDivisions] = useState<Division[]>([]);
  const [controlsFromBackend, setControlsFromBackend] = useState<{ name: string; slmTasks: string[]; supplierScope: string[]; lifecycleStage?: string; category?: string }[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [controlsData, vendorsData, divisionsData] = await Promise.all([
          getControls(),
          getVendors(),
          getDivisions(),
        ]);
        setControlsFromBackend(controlsData.map((c: any) => ({
          name: c.name,
          slmTasks: c.slmTasks || [],
          supplierScope: c.supplierScope || [],
          lifecycleStage: c.lifecycleStage,
          category: c.category,
        })));
        setAvailableSuppliers(vendorsData.map((v: any) => ({ id: v.id, name: v.name })));
        setAvailableDivisions(divisionsData);
      } catch (err) {
        console.error('Failed to load data:', err);
      }
    })();
  }, []);

  const applyTemplate = (tpl: 'consulting' | 'it-risk') => {
    setSlmTemplate(tpl);
    setShowJobPanel(true);
    setActiveControlPanel(null);
    setSelectedTasks({});
    setCustomTasks([]);
    if (tpl === 'consulting') { setFrequency('Daily'); setAlertLevel('High'); }
    if (tpl === 'it-risk') { setFrequency('Every 6hrs'); setAlertLevel('Critical Only'); }
  };

  const initials = name.trim() ? name.trim().slice(0, 2).toUpperCase() : 'A?';

  const toggleStage = (s: Stage) => {
    const n = new Set(stages);
    n.has(s) ? n.delete(s) : n.add(s);
    setStages(n);
  };

  const toggleTask = (ctrlName: string, taskName: string) => {
    setSelectedTasks(prev => {
      const next = { ...prev };
      if (!next[ctrlName]) next[ctrlName] = [];
      const hasTask = next[ctrlName].includes(taskName);

      if (hasTask) {
        next[ctrlName] = next[ctrlName].filter(t => t !== taskName);
        if (next[ctrlName].length === 0) delete next[ctrlName];
      } else {
        next[ctrlName] = [...next[ctrlName], taskName];
        if (ctrlName !== 'custom') {
          const ctrl = controlsFromBackend.find(c => c.name === ctrlName);
          if (ctrl) {
            const vNames = ctrl.supplierScope.map((vId: string) => availableSuppliers.find(v => v.id === vId)?.name).filter(Boolean) as string[];
            setSuppliers(p => new Set([...Array.from(p), ...vNames]));
            if (ctrl.lifecycleStage) setStages(p => new Set([...Array.from(p), ctrl.lifecycleStage as Stage]));
          }
        }
      }
      return next;
    });
  };

  const toggleSup = (v: string) => { const n = new Set(suppliers); n.has(v) ? n.delete(v) : n.add(v); setSuppliers(n); };
  const toggleNotify = (v: string) => { const n = new Set(notify); n.has(v) ? n.delete(v) : n.add(v); setNotify(n); };

  const addContactField = (side: 'int' | 'sup') => side === 'int' ? setInternalContacts(p => [...p, '']) : setSupplierContacts(p => [...p, '']);
  const removeContact = (side: 'int' | 'sup', i: number) => {
    if (side === 'int') setInternalContacts(p => p.filter((_, idx) => idx !== i));
    else setSupplierContacts(p => p.filter((_, idx) => idx !== i));
  };
  const updateContact = (side: 'int' | 'sup', i: number, val: string) => {
    if (side === 'int') setInternalContacts(p => p.map((v, idx) => idx === i ? val : v));
    else setSupplierContacts(p => p.map((v, idx) => idx === i ? val : v));
  };

  const addCustomTask = () => {
    if (!customTask.trim()) return;
    const t = customTask.trim();
    setCustomTasks(p => [...p, t]);
    setSelectedTasks(prev => ({ ...prev, custom: [...(prev.custom || []), t] }));
    setCustomTask('');
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const jobInfo = slmTemplate === 'consulting' ? CONSULTING_JOB : slmTemplate === 'it-risk' ? IT_RISK_JOB : null;
      const selectedControlNames = Object.keys(selectedTasks).filter(k => k !== 'custom');
      const flatUniqueTasks = Array.from(new Set(Object.values(selectedTasks).flat()));
      const combinedList = flatUniqueTasks; // Task names only

      const firstStage = stages.size > 0 ? (Array.from(stages)[0] as Stage) : undefined;
      const supplierIds = Array.from(suppliers).map(name => availableSuppliers.find(v => v.name === name)?.id).filter(Boolean);
      
      const agent = await createAgent({
        name: name.trim(),
        initials,
        status: 'active',
        stage: firstStage,
        controls: selectedControlNames.length || 1, // Store the count of controls accurately
        suppliers: supplierIds.length,
        gradient,
        alerts: 0,
        division: division || 'Unassigned',
        frequency,
        notify: Array.from(notify),
        alertLevel,
        controlList: combinedList,
        supplierList: supplierIds,
        internalSpoc: internalContacts.filter(Boolean)[0] || '',
        externalSpoc: supplierContacts.filter(Boolean)[0] || '',
        slmTemplate: slmTemplate || 'custom',
        jobTitle: jobInfo?.title || '',
        jobDescription: jobInfo?.description || '',
        internalContacts: internalContacts.filter(Boolean),
        supplierContacts: supplierContacts.filter(Boolean),
      } as any);
      setCreatedAgent(agent);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to create agent:', err);
      toast.error('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgents = () => { if (createdAgent) onCreated(createdAgent); onClose(); };
  const handleCreateAnother = () => {
    setSuccess(false); setCreatedAgent(null); setName('');
    setGradient(AVATAR_GRADIENTS[0]); setSelectedTasks({});
    setSuppliers(new Set()); setStages(new Set());
    setAlertLevel('High'); setFrequency('Daily');
    setNotify(new Set(['Risk Manager'])); setDivision('');
    setSlmTemplate(null); setShowJobPanel(false); setActiveControlPanel(null);
    setInternalContacts(['']); setSupplierContacts(['']);
  };

  const jobInfo = slmTemplate === 'consulting' ? CONSULTING_JOB : slmTemplate === 'it-risk' ? IT_RISK_JOB : null;
  const consultingControls = controlsFromBackend.filter(c => c.slmTasks && c.slmTasks.length > 0);
  const totalSelectedCount = Object.values(selectedTasks).flat().length;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative flex items-start z-[1]" style={{ maxHeight: '85vh' }}>

        {/* Main modal */}
        <div className="w-[500px] max-h-[85vh] bg-white rounded-2xl flex flex-col shadow-2xl">
          <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
            <div className="text-lg font-bold text-slate-900">Create Agent</div>
            <button onClick={onClose} className="w-8 h-8 bg-slate-100 border-none rounded-lg cursor-pointer flex items-center justify-center text-slate-500">
              <X size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-4">
            {success ? (
              <div className="flex flex-col items-center justify-center py-10 text-center gap-3.5">
                <CheckCircle2 size={48} color="#10B981" strokeWidth={1.5} />
                <div className="text-xl font-bold text-slate-900">Agent Created!</div>
                <div className="flex items-center gap-2.5 bg-slate-50 rounded-full py-2.5 px-5">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: gradient }}>{initials}</div>
                  <span className="text-sm font-semibold text-slate-700">{name}</span>
                </div>
                <div className="flex gap-2.5 mt-1">
                  <button onClick={handleViewAgents} className="bg-sky-500 text-white border-none rounded-lg px-5 py-2.5 text-sm font-semibold cursor-pointer">View Agents</button>
                  <button onClick={handleCreateAnother} className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer">Create Another</button>
                </div>
              </div>
            ) : (
              <>
                {/* SLM Templates */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">SLM Templates</label>
                  <div className="flex flex-col gap-2 mb-1">
                    {([
                      { id: 'consulting' as const, icon: <Handshake size={15} color="#0EA5E9" />, title: 'Consulting Agent', sub: 'Contract & Commercial Compliance', color: '#0EA5E9', bg: '#EFF6FF', disabled: false },
                      { id: 'it-risk' as const, icon: <ShieldCheck size={15} color="#8B5CF6" />, title: 'IT Risk Agent', sub: 'Security & Regulatory Compliance', color: '#8B5CF6', bg: '#F5F3FF', disabled: true },
                    ]).map((tpl) => {
                      const sel = slmTemplate === tpl.id;
                      return (
                        <div key={tpl.id}
                          onClick={() => !tpl.disabled && applyTemplate(tpl.id)}
                          className="flex items-center gap-2.5 rounded-[10px] transition-all py-[11px] px-3.5"
                          style={{ border: `1px solid ${sel ? tpl.color : '#E2E8F0'}`, backgroundColor: sel ? tpl.bg : tpl.disabled ? '#F8FAFC' : '#fff', cursor: tpl.disabled ? 'not-allowed' : 'pointer', opacity: tpl.disabled ? 0.5 : 1 }}>
                          <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${sel ? tpl.color : '#CBD5E1'}` }}>
                            {sel && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.color }} />}
                          </div>
                          <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: sel ? tpl.color + '22' : '#F1F5F9' }}>{tpl.icon}</div>
                          <div className="flex-1">
                            <div className="text-[13px] font-semibold text-slate-900 flex items-center gap-2">
                              {tpl.title}
                              {tpl.disabled && <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-1.5 py-px rounded-full">Coming Soon</span>}
                            </div>
                            <div className="text-[11px] text-slate-400">{tpl.sub}</div>
                          </div>
                          {sel && (
                            <button onClick={(e) => { e.stopPropagation(); setShowJobPanel(p => !p); setActiveControlPanel(null); }}
                              className="text-[11px] font-semibold text-sky-500 bg-blue-50 border-none px-2.5 py-1 rounded-lg cursor-pointer hover:bg-blue-100 shrink-0">
                              Job Title {showJobPanel ? '↑' : '↓'}
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                  {slmTemplate && <div className="text-[11px] text-emerald-500 flex items-center gap-1"><CheckCircle2 size={11} /> Template applied — fields pre-filled</div>}
                </div>

                {/* Stakeholder Communication Monitoring */}
                <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <div className="w-[3px] h-3.5 rounded bg-sky-500" />
                    <span className="text-[13px] font-bold text-slate-900">Stakeholder Communication Monitoring</span>
                  </div>
                  <div className="text-xs text-slate-400 mb-3 leading-relaxed">The agent scans email activity between these contacts to detect anomalies. Add more contacts later if the agent requests them.</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-sky-500 uppercase tracking-wider mb-1.5">Internal Contacts</div>
                      {internalContacts.map((email, i) => (
                        <div key={i} className="flex gap-1 mb-1.5">
                          <input value={email} onChange={(e) => updateContact('int', i, e.target.value)} placeholder="priya@abc.co"
                            className="flex-1 border border-slate-200 rounded-[7px] text-xs text-slate-700 outline-none bg-white py-[7px] px-2.5" />
                          {internalContacts.length > 1 && (
                            <button onClick={() => removeContact('int', i)} className="w-7 shrink-0 border border-red-200 rounded-[7px] bg-red-50 text-red-500 cursor-pointer flex items-center justify-center"><X size={10} /></button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addContactField('int')} className="text-[11px] text-sky-500 bg-transparent border border-dashed border-sky-200 rounded-[7px] cursor-pointer w-full py-1 px-2.5">+ Add contact</button>
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider mb-1.5">Supplier Contacts</div>
                      {supplierContacts.map((email, i) => (
                        <div key={i} className="flex gap-1 mb-1.5">
                          <input value={email} onChange={(e) => updateContact('sup', i, e.target.value)} placeholder="john@supplier.com"
                            className="flex-1 border border-slate-200 rounded-[7px] text-xs text-slate-700 outline-none bg-white py-[7px] px-2.5" />
                          {supplierContacts.length > 1 && (
                            <button onClick={() => removeContact('sup', i)} className="w-7 shrink-0 border border-red-200 rounded-[7px] bg-red-50 text-red-500 cursor-pointer flex items-center justify-center"><X size={10} /></button>
                          )}
                        </div>
                      ))}
                      <button onClick={() => addContactField('sup')} className="text-[11px] text-purple-500 bg-transparent border border-dashed border-purple-200 rounded-[7px] cursor-pointer w-full py-1 px-2.5">+ Add contact</button>
                    </div>
                  </div>
                </div>

                {/* Agent Name */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Agent Name *</label>
                  <input className="w-full border border-slate-200 rounded-lg text-sm text-slate-700 outline-none py-2.5 px-3" placeholder="e.g., Agent Aria" value={name} onChange={(e) => setName(e.target.value)} />
                </div>

                {/* Avatar Gradient */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Avatar Gradient</label>
                  <div className="flex gap-2 mb-2.5">
                    {AVATAR_GRADIENTS.map((g) => (
                      <div key={g} onClick={() => setGradient(g)} className="w-7 h-7 rounded-full cursor-pointer"
                        style={{ background: g, outline: gradient === g ? '3px solid #0EA5E9' : 'none', outlineOffset: 2 }} />
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: gradient }}>{initials}</div>
                    <span className="text-[13px] text-slate-500">{name || 'New Agent'}</span>
                  </div>
                </div>

                {/* SLM Tasks */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-[13px] font-semibold text-slate-700">SLM Tasks</label>
                    {totalSelectedCount > 0 && (
                      <span className="text-[11px] font-semibold text-sky-500 bg-blue-50 px-2 py-px rounded-full">{totalSelectedCount} task{totalSelectedCount > 1 ? 's' : ''} selected</span>
                    )}
                  </div>
                  {!slmTemplate ? (
                    <div className="border border-dashed border-slate-200 rounded-lg px-4 py-6 text-center text-slate-400 text-sm">Select an SLM Template above to see available controls</div>
                  ) : consultingControls.length === 0 ? (
                    <div className="border border-dashed border-amber-200 bg-amber-50 rounded-lg px-4 py-5 text-center">
                      <div className="text-[13px] font-semibold text-amber-700 mb-1">No controls created yet</div>
                      <div className="text-xs text-amber-500">Create controls in the Controls page first, then assign them here.</div>
                    </div>
                  ) : (
                    <>
                      <div className="text-[11px] text-slate-400 mb-2">Click a control to view and select its tasks</div>
                      <div className="flex flex-col gap-2 mb-3">
                        {consultingControls.map((ctrl) => {
                          const isOpen = activeControlPanel === ctrl.name;
                          const ctrlSelectedCount = (selectedTasks[ctrl.name] || []).length;
                          return (
                            <div key={ctrl.name}
                              onClick={() => { setActiveControlPanel(isOpen ? null : ctrl.name); setShowJobPanel(false); }}
                              className="flex items-center gap-3 px-3.5 py-3 rounded-xl cursor-pointer border transition-all"
                              style={{ border: isOpen ? '2px solid #0EA5E9' : ctrlSelectedCount > 0 ? '1px solid #BAE6FD' : '1px solid #E2E8F0', backgroundColor: isOpen ? '#EFF6FF' : ctrlSelectedCount > 0 ? '#F0F9FF' : '#fff' }}>
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <div className="text-[13px] font-semibold text-slate-800">{ctrl.name}</div>
                                  {ctrl.category && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded"
                                      style={{
                                        color: ctrl.category === 'Process' ? '#10B981' : ctrl.category === 'Document' ? '#8B5CF6' : '#3B82F6',
                                        backgroundColor: ctrl.category === 'Process' ? '#10B98115' : ctrl.category === 'Document' ? '#8B5CF615' : '#3B82F615',
                                      }}>
                                      {ctrl.category}
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-400 mt-0.5">
                                  {ctrl.slmTasks.length} task{ctrl.slmTasks.length > 1 ? 's' : ''}
                                  {ctrlSelectedCount > 0 && <span className="text-sky-500 font-semibold ml-1">&middot; {ctrlSelectedCount} selected</span>}
                                </div>
                              </div>
                              {ctrlSelectedCount > 0 && (
                                <div className="w-5 h-5 rounded-full bg-sky-500 flex items-center justify-center shrink-0">
                                  <Check size={10} color="#fff" strokeWidth={3} />
                                </div>
                              )}
                              <ChevronRight size={14} className="text-slate-400 shrink-0" style={{ transform: isOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.15s' }} />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <input className="flex-1 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none py-2 px-3"
                          placeholder="Add custom SLM Task..."
                          value={customTask} onChange={e => setCustomTask(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCustomTask()} />
                        <button onClick={addCustomTask} className="px-3 py-2 bg-sky-500 text-white rounded-lg text-xs border-none cursor-pointer hover:bg-sky-600 flex items-center gap-1">
                          <Plus size={12} /> Add
                        </button>
                      </div>
                      {totalSelectedCount > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {Object.entries(selectedTasks).flatMap(([ctrlName, tasks]) =>
                            tasks.map(t => (
                              <span key={`${ctrlName}-${t}`} className="text-[11px] rounded-full flex items-center gap-1.5 px-2 py-1 bg-blue-50 text-sky-600 border border-sky-100/50">
                                {t} {ctrlName !== 'custom' && <span className="opacity-50 text-[9px] -ml-0.5">({ctrlName})</span>}
                                <button onClick={(e) => { e.stopPropagation(); toggleTask(ctrlName, t); }} className="bg-transparent border-none cursor-pointer p-0 flex text-sky-400 hover:text-sky-600"><X size={10} /></button>
                              </span>
                            ))
                          )}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Assign Suppliers */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Assign Suppliers</label>
                  <MultiSelect label="Suppliers" options={availableSuppliers.map(v => v.name)} selected={suppliers} onToggle={toggleSup} chipColor={['#F5F3FF', '#8B5CF6']} />
                </div>

                {/* Data Flow Stage */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Data Flow Stage</label>
                  <div className="flex gap-2 flex-wrap">
                    {STAGES.map((s) => {
                      const sel = stages.has(s);
                      const [bg, c] = STAGE_CLR[s];
                      return (
                        <button key={s} onClick={() => toggleStage(s)} className="rounded-lg text-[13px] cursor-pointer py-1.5 px-3.5"
                          style={{ fontWeight: sel ? 600 : 500, backgroundColor: sel ? bg : '#fff', color: sel ? c : '#64748B', border: `1px solid ${sel ? c : '#E2E8F0'}` }}>
                          {s}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Alert Sensitivity */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Alert Sensitivity</label>
                  <div className="flex gap-2">
                    {['Low', 'Medium', 'High', 'Critical Only'].map((l) => (
                      <button key={l} onClick={() => setAlertLevel(l)}
                        className={`rounded-lg text-[13px] cursor-pointer py-1.5 px-3 border ${alertLevel === l ? 'font-semibold bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'font-medium bg-white text-[#64748B] border-[#E2E8F0]'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Frequency */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Frequency</label>
                  <div className="flex gap-2">
                    {['Hourly', 'Daily', 'Every 6hrs'].map((f) => (
                      <button key={f} onClick={() => setFrequency(f)}
                        className={`rounded-lg text-[13px] cursor-pointer py-1.5 px-3 border ${frequency === f ? 'font-semibold bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'font-medium bg-white text-[#64748B] border-[#E2E8F0]'}`}>
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notify */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Notify</label>
                  <MultiSelect label="Notify" options={['Risk Manager', 'Compliance Officer', 'DPO', 'Admin']} selected={notify} onToggle={toggleNotify} chipColor={['#F5F3FF', '#8B5CF6']} />
                </div>

                {/* Division */}
                <div>
                  <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Division</label>
                  <div className="relative">
                    <select className="w-full border border-slate-200 rounded-lg text-sm text-slate-700 outline-none py-2.5 px-3 bg-white appearance-none pr-8"
                      value={division} onChange={(e) => setDivision(e.target.value)}>
                      <option value="">Select a division&hellip;</option>
                      {availableDivisions.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                    <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </>
            )}
          </div>

          {!success && (
            <div className="px-6 py-3.5 border-t border-slate-200 flex justify-between shrink-0">
              <button className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 cursor-pointer">Save as Draft</button>
              <div className="flex gap-2">
                <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 cursor-pointer">Cancel</button>
                <button onClick={handleCreate} disabled={!name.trim() || loading}
                  className={`px-5 py-2 text-sm font-semibold border-none rounded-lg text-white cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed ${name.trim() ? 'bg-[#0EA5E9]' : 'bg-[#CBD5E1]'}`}>
                  {loading && <RefreshCw size={14} className="animate-spin" />}
                  {loading ? 'Creating...' : 'Create Agent'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Job Title side panel */}
        {showJobPanel && jobInfo && (
          <div className="w-[300px] max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl ml-3 p-5 shadow-xl flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-[3px] h-4 rounded-full bg-sky-500" />
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Job Title</span>
              </div>
              <button onClick={() => setShowJobPanel(false)}
                className="w-6 h-6 rounded-md bg-slate-100 border-none cursor-pointer flex items-center justify-center text-slate-400 hover:bg-slate-200">
                <X size={12} />
              </button>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4">
              <div className="text-[14px] font-bold text-slate-900 leading-snug mb-2">{jobInfo.title}</div>
              <div className="text-[11px] text-slate-500 leading-relaxed">{jobInfo.description}</div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">What this covers</div>
              <div className="flex flex-col gap-1.5">
                {jobInfo.covers.map((item, i) => (
                  <div key={i} className="flex items-center gap-2 py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                    <div className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0" />
                    <span className="text-[12px] text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-slate-100 pt-3">
              <div className="text-[11px] text-slate-400 leading-relaxed">
                The agent receives this job title and description before starting work — exactly as a new employee would.
              </div>
            </div>
          </div>
        )}

        {/* Control Tasks side panel */}
        {activeControlPanel && (() => {
          const ctrl = controlsFromBackend.find(c => c.name === activeControlPanel);
          if (!ctrl) return null;
          return (
            <div className="w-[300px] max-h-[85vh] overflow-y-auto bg-white border border-slate-200 rounded-2xl ml-3 p-5 shadow-xl flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-[3px] h-4 rounded-full bg-sky-500" />
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Control Tasks</span>
                </div>
                <button onClick={() => setActiveControlPanel(null)}
                  className="w-6 h-6 rounded-md bg-slate-100 border-none cursor-pointer flex items-center justify-center text-slate-400 hover:bg-slate-200">
                  <X size={12} />
                </button>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                <div className="text-[13px] font-bold text-slate-900">{ctrl.name}</div>
                <div className="text-[11px] text-slate-400 mt-0.5">{ctrl.slmTasks.length} tasks defined in this control</div>
              </div>
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Select tasks to assign to agent</div>
                <div className="flex flex-col gap-1.5">
                  {ctrl.slmTasks.map((task) => {
                    const sel = (selectedTasks[ctrl.name] || []).includes(task);
                    return (
                      <div key={task} onClick={() => toggleTask(ctrl.name, task)}
                        className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer border transition-all"
                        style={{ border: sel ? '2px solid #0EA5E9' : '1px solid #E2E8F0', backgroundColor: sel ? '#EFF6FF' : '#fff' }}>
                        <div className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                          style={{ border: sel ? '2px solid #0EA5E9' : '2px solid #CBD5E1', backgroundColor: sel ? '#0EA5E9' : '#fff' }}>
                          {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <span className="text-[12px] flex-1" style={{ fontWeight: sel ? 600 : 400, color: sel ? '#0EA5E9' : '#334155' }}>{task}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div className="border-t border-slate-100 pt-3">
                <div className="text-[11px] text-slate-400 leading-relaxed">
                  Selected tasks are added to the agent task list and run in priority order on the agent detail page.
                </div>
              </div>
            </div>
          );
        })()}

      </div>
    </div>
  );
}

// Component logic moved to AgentDetailPage.tsx

/* ═══════════════════════════════════════════════════════════
         AGENTS DASHBOARD
      ══════════════════════════════════════════════════════════════ */

      export function AgentsPage() {
  const location = useLocation();
      const navigate = useNavigate();
      const [showCreate, setShowCreate]       = useState(false);
      const [agents, setAgents]               = useState<Agent[]>([]);
      const [isLoading, setIsLoading]         = useState(true);
      const [error, setError]                 = useState<string | null>(null);
      const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
        let mounted = true;
      setIsLoading(true);
      setError(null);

      getAgents()
      .then((data) => {
        if (mounted) {setAgents(data); setIsLoading(false); }
      })
      .catch((err) => {
        console.error('Failed to fetch agents:', err);
      if (mounted) {setAgents(getMockAgents()); setIsLoading(false); }
      });

    return () => {mounted = false; };
  }, []);

  useEffect(() => {
    fetch('http://localhost:8000/api/agents/activity/recent')
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setRecentActivity(data);
        }
      })
      .catch(() => { /* keep mock */ });
  }, []);

  useEffect(() => {
    if (location.state?.openCreateModal) {setShowCreate(true); }
      if (location.state?.openAgentDetail) {
      navigate(`/agents/${location.state.openAgentDetail}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, agents]);

  const liveCount    = agents.filter((a) => a.status === 'live').length;
  const activeCount  = agents.filter((a) => a.status === 'active').length;
  const syncingCount = agents.filter((a) => a.status === 'syncing').length;

  const handleDeleteAgent = async (agent: Agent, e: React.MouseEvent) => {
        e.stopPropagation();
      if (!window.confirm(`Are you sure you want to delete "${agent.name}"? This action cannot be undone.`)) return;
      try {
        await deleteAgent(agent.id);
      setAgents((prev) => prev.filter((a) => a.id !== agent.id));
      toast.success(`${agent.name} deleted successfully`);
    } catch (err) {
        console.error('Failed to delete agent:', err);
      toast.error('Failed to delete agent. Please try again.');
    }
  };

      /* Loading state */
      if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 size={32} className="animate-spin text-sky-500" />
        <p className="text-slate-500 text-sm">Loading agents...</p>
      </div>
      );
  }

      /* Error state */
      if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle size={32} className="text-red-500" />
        <p className="text-slate-700 font-medium">Failed to load agents</p>
        <p className="text-slate-500 text-sm">{error}</p>
        <button onClick={() => window.location.reload()} className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none">
          Retry
        </button>
      </div>
      );
  }

      /* Dashboard view */
      return (
      <div className="flex flex-col gap-0 max-w-[1200px]">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 m-0">Agents</h1>
            <p className="text-[13px] text-slate-400 mt-1 mb-0">Monitor and manage your AI agents</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-1.5 bg-sky-500 text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer">
            <Plus size={16} /> Create Agent
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4 mb-7">
          {[
            {
              label: 'Live', count: liveCount, color: '#10B981',
              indicator: (
                <span className="relative inline-flex w-2.5 h-2.5">
                  <span className="absolute inset-0 rounded-full bg-emerald-500 opacity-50 animate-ping" />
                  <span className="relative w-2.5 h-2.5 rounded-full bg-emerald-500 block" />
                </span>
              ),
              sub: null,
            },
            {
              label: 'Active', count: activeCount, color: '#0EA5E9',
              indicator: <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" />,
              sub: null,
            },
            {
              label: 'Syncing', count: syncingCount, color: '#F59E0B',
              indicator: <RefreshCw size={14} color="#F59E0B" className="animate-spin" />,
              sub: null,
            },
            {
              label: 'Open Alerts', count: openAlerts.total, color: '#EF4444',
              indicator: <AlertCircle size={16} color="#EF4444" />,
              sub: `${openAlerts.critical} critical \u00B7 ${openAlerts.high} high`,
            },
          ].map((kpi) => (
            <div key={kpi.label} className="bg-white border border-slate-200 rounded-xl shadow-sm py-[18px] px-5" style={{ borderLeft: `4px solid ${kpi.color}` }}>
              <div className="flex items-center gap-2.5 mb-1">
                <span className="text-[34px] font-bold text-slate-900">{kpi.count}</span>
                {kpi.indicator}
              </div>
              <div className="text-[13px] text-slate-500">{kpi.label}</div>
              {kpi.sub && <div className="text-[11px] text-slate-400 mt-0.5">{kpi.sub}</div>}
            </div>
          ))}
        </div>

        {/* Agents heading */}
        <div className="flex items-center gap-2 mb-4">
          <div className="text-base font-bold text-slate-900">Your Agents</div>
          <span className="bg-slate-100 text-slate-500 text-xs font-medium rounded-full px-2 py-px">{agents.length}</span>
        </div>

        {/* Agent cards grid */}
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(180px,1fr))]">
          {agents.map((agent) => {
            const displayStage = agent.stage || 'Acquisition';
            const [sBg, sClr] = STAGE_CLR[displayStage as Stage] || ['#F1F5F9', '#64748B'];
            const avatarUrl = getAvatarUrl(agent.avatarSeed || agent.initials);
            return (
              <div
                key={agent.id}
                onClick={() => { navigate(`/agents/${agent.id}`); }}
                className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer text-center transition-all hover:shadow-md hover:border-sky-500 relative group"
              >
                <button
                  onClick={(e) => handleDeleteAgent(agent, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                  title="Delete agent"
                >
                  <Trash2 size={14} />
                </button>
                <div className="flex justify-center mb-3 relative">
                  <div className="relative">
                    <img src={avatarUrl} alt={agent.name} width={72} height={72} className="rounded-full block bg-slate-100" style={{ border: `3px solid ${STATUS_CLR[agent.status]}55` }} />
                    <div className="absolute bottom-px right-px w-[13px] h-[13px] rounded-full border-2 border-white" style={{ backgroundColor: STATUS_CLR[agent.status] }} />
                  </div>
                </div>
                <div className="text-sm font-bold text-slate-900 mb-1.5">{agent.name}</div>
                {agent.role && <div className="text-[11px] text-slate-400 mb-1.5 leading-snug">{agent.role}</div>}
                <div className="mb-2"><StatusIndicator status={agent.status} /></div>
                <span className="text-[10px] font-semibold rounded-full inline-block mb-2 px-2 py-0.5" style={{ backgroundColor: sBg, color: sClr }}>{displayStage}</span>
                <div className="text-[11px] text-slate-400">{agent.controls} controls &middot; {agent.suppliers} sup</div>
                <div className="flex items-center gap-1 justify-center mt-2">
                  {agent.alerts === 0
                    ? <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-500 text-[11px] rounded-full px-2 py-px"><CheckCircle2 size={11} /> No alerts</span>
                    : <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 text-[11px] rounded-full px-2 py-px"><AlertCircle size={11} /> {agent.alerts} open alerts</span>
                  }
                </div>
                <div className="flex items-center gap-1 justify-center mt-1">
                  <Clock size={11} color="#94A3B8" />
                  <span className="text-[11px] text-slate-400">Last active: {agent.lastActive}</span>
                </div>
                <div className="mt-2.5 border-t border-slate-100 pt-2">
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-[10px] text-slate-400">Coverage</span>
                    <span className={`text-[10px] font-semibold ${agent.health >= 80 ? 'text-[#10B981]' : agent.health >= 50 ? 'text-[#F59E0B]' : 'text-[#EF4444]'}`}>{agent.health}%</span>
                  </div>
                  <div className="h-1 rounded-full bg-slate-100 w-full">
                    <div className="h-full rounded-full transition-[width] duration-500 ease-out"
                      style={{ width: `${agent.health}%`, backgroundColor: agent.health >= 80 ? '#10B981' : agent.health >= 50 ? '#F59E0B' : '#EF4444' }} />
                  </div>
                </div>
              </div>
            );
          })}

          {/* New Agent card */}
          <div
            onClick={() => setShowCreate(true)}
            className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl p-5 cursor-pointer text-center flex flex-col items-center justify-center min-h-[180px] transition-all hover:border-sky-500 hover:bg-sky-50"
          >
            <div className="w-11 h-11 rounded-full bg-sky-50 flex items-center justify-center mb-2"><Bot size={20} color="#0EA5E9" /></div>
            <div className="text-[13px] font-semibold text-slate-500">New Agent</div>
            <div className="text-[11px] text-slate-400 mt-0.5">Click to create</div>
          </div>
        </div>

        {/* Create modal */}
        {showCreate && (
          <CreateAgentModal
            onClose={() => setShowCreate(false)}
            onCreated={(a) => { setAgents((prev) => [...prev, a]); toast.success(`Agent "${a.name}" created!`); }}
          />
        )}

          {/* Agent Activity feed */}
        <div className="mt-8">
          <div className="flex justify-between items-start mb-3">
            <div>
              <div className="text-[15px] font-bold text-slate-900">Agent Activity</div>
              <div className="text-xs text-slate-400 mt-0.5">Live feed of agent actions</div>
            </div>
            <button onClick={() => toast('Coming soon')} className="text-[13px] text-sky-500 bg-transparent border-none cursor-pointer font-medium">View All</button>
          </div>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {(() => {
              const MOCK_ACTIVITY = [
                { agent_name: 'Agent Aria',  agent_initials: 'AA', agent_color: '#0EA5E9', message: 'checked MFA compliance on XYZ Corporation',         log_type: 'pass',    created_at: null },
                { agent_name: 'Agent Blake', agent_initials: 'AB', agent_color: '#EF4444', message: 'raised alert: Call Center Ltd missing data',          log_type: 'warning', created_at: null },
                { agent_name: 'Agent Casey', agent_initials: 'AC', agent_color: '#F59E0B', message: 'started backup verification check',                   log_type: 'fetch',   created_at: null },
                { agent_name: 'Agent Aria',  agent_initials: 'AA', agent_color: '#0EA5E9', message: 'document expiry warning: ISO 27001 cert expires in 22 days', log_type: 'warn', created_at: null },
                { agent_name: 'Agent Blake', agent_initials: 'AB', agent_color: '#EF4444', message: 'completed access review policy evaluation',             log_type: 'success', created_at: null },
              ];
              const rows = recentActivity.length > 0 ? recentActivity : MOCK_ACTIVITY;

              const getIcon = (logType: string) => {
                const t = (logType || '').toLowerCase();
                if (t === 'success' || t === 'pass') return <CheckCircle2 size={16} color="#10B981" />;
                if (t === 'error') return <AlertCircle size={16} color="#EF4444" />;
                if (t === 'warning' || t === 'warn') return <AlertTriangle size={16} color="#F59E0B" />;
                if (t === 'fetch' || t === 'eval') return <RefreshCw size={16} color="#0EA5E9" />;
                if (t === 'action') return <Zap size={16} color="#14B8A6" />;
                return <Activity size={16} color="#94A3B8" />;
              };

              const relativeTime = (iso: string | null) => {
                if (!iso) return 'just now';
                const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
                if (diff < 60) return 'just now';
                if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
                if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
                return `${Math.floor(diff / 86400)} days ago`;
              };

              return rows.map((row: any, i: number, arr: any[]) => (
                <div
                  key={i}
                  className={`flex items-center gap-3 cursor-pointer transition-colors hover:bg-slate-50 py-3 px-4 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                    style={{ backgroundColor: row.agent_color || '#0EA5E9' }}
                  >
                    {(row.agent_initials || row.agent_name || '?').slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="m-0 text-[13px] text-slate-700 leading-snug">
                      <span className="font-semibold text-slate-900">{row.agent_name}</span>{' '}{row.message}
                    </p>
                    <div className="text-[11px] text-slate-400 mt-0.5">{relativeTime(row.created_at)}</div>
                  </div>
                  <div className="shrink-0">{getIcon(row.log_type)}</div>
                </div>
              ));
            })()}
          </div>
        </div>

        <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </div>
      );
}
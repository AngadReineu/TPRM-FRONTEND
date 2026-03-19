import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router';
import {
  Bot, ChevronLeft, Mic, Volume2, MessageSquare, Image as ImageIcon,
  RefreshCw, CheckCircle2, Send, X, Plus, Check,
  AlertCircle, Clock, AlertTriangle, Eye, Cpu, XCircle, ShieldCheck, Handshake, Truck,
  Activity, Zap, Shield, ChevronDown, ChevronUp,
  Brain, ChevronRight, Users, BarChart2, Bell,
  FileText, Flag, GitMerge, Loader2,
} from 'lucide-react';
import { toast } from 'sonner';

import type { Agent, LogEntry, AgentTask, TimelineEntry, TaskStatus } from '../types';
import type { Stage } from '../../../types/shared';
import {
  STATUS_CLR, STATUS_LABEL, STAGE_CLR, AVATAR_GRADIENTS,
  PROCESS_CONTROLS, TECHNICAL_CONTROLS, DOCUMENT_CONTROLS,
  SUPPLIERS_LIST, STAGES, LOG_STYLE,
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

/* ─── StatusIndicator (small, shared) ─────────────────── */

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

function CreateAgentModal({ onClose, onCreated }: { onClose: () => void; onCreated: (a: Agent) => void }) {
  const [name, setName]             = useState('');
  const [gradient, setGradient]     = useState(AVATAR_GRADIENTS[0]);
  const [controls, setControls]     = useState<Set<string>>(new Set(['MFA Enforcement']));
  const [suppliers, setSuppliers]   = useState<Set<string>>(new Set());
  const [stages, setStages]         = useState<Set<Stage>>(new Set(['Acquisition']));
  const [alertLevel, setAlertLevel] = useState('High');
  const [frequency, setFrequency]   = useState('Daily');
  const [notify, setNotify]         = useState<Set<string>>(new Set(['Risk Manager']));
  const [division, setDivision]     = useState('');
  const [template, setTemplate]     = useState<string | null>(null);
  const [loading, setLoading]       = useState(false);
  const [success, setSuccess]       = useState(false);
  const [createdAgent, setCreatedAgent] = useState<Agent | null>(null);
  const [controlTab, setControlTab] = useState<'process' | 'technical' | 'document'>('process');
  const [internalContacts, setInternalContacts] = useState<string[]>(['']);
  const [supplierContacts, setSupplierContacts] = useState<string[]>(['']);

  const initials = name.trim() ? name.trim().slice(0, 2).toUpperCase() : 'A?';
  const toggleStage  = (s: Stage) => { const n = new Set(stages); n.has(s) ? n.delete(s) : n.add(s); setStages(n); };
  const toggleCtrl   = (v: string) => { const n = new Set(controls); n.has(v) ? n.delete(v) : n.add(v); setControls(n); };
  const toggleSup    = (v: string) => { const n = new Set(suppliers); n.has(v) ? n.delete(v) : n.add(v); setSuppliers(n); };
  const toggleNotify = (v: string) => { const n = new Set(notify); n.has(v) ? n.delete(v) : n.add(v); setNotify(n); };
  const addContactField  = (side: 'int' | 'sup') => side === 'int' ? setInternalContacts((p) => [...p, '']) : setSupplierContacts((p) => [...p, '']);
  const removeContact    = (side: 'int' | 'sup', i: number) => { if (side === 'int') setInternalContacts((p) => p.filter((_, idx) => idx !== i)); else setSupplierContacts((p) => p.filter((_, idx) => idx !== i)); };
  const updateContact    = (side: 'int' | 'sup', i: number, val: string) => { if (side === 'int') setInternalContacts((p) => p.map((v, idx) => idx === i ? val : v)); else setSupplierContacts((p) => p.map((v, idx) => idx === i ? val : v)); };

  const applyTemplate = (id: string) => {
    setTemplate(id);
    if (id === 'consulting')    { setFrequency('Daily'); setAlertLevel('High'); setControls(new Set(['MFA Enforcement', 'Data Classification Policy'])); setInternalContacts(['priya@abc.co', 'raj@abc.co']); setSupplierContacts(['john@xyz.com']); }
    if (id === 'operations')    { setFrequency('Every 6hrs'); setAlertLevel('Critical Only'); setControls(new Set(['Backup Verification', 'Access Review Policy'])); setInternalContacts(['raj@abc.co']); setSupplierContacts(['ops@supplier.com']); }
    if (id === 'data-security') { setFrequency('Hourly'); setAlertLevel('Critical Only'); setControls(new Set(['MFA Enforcement', 'Backup Verification'])); setInternalContacts(['anita@abc.co']); setSupplierContacts(['dpo@supplier.co']); }
    if (id === 'custom')        { setInternalContacts(['']); setSupplierContacts(['']); }
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const firstStage = stages.size > 0 ? (Array.from(stages)[0] as Stage) : 'Acquisition';
      const agent = await createAgent({
        name: name.trim(),
        initials,
        status: 'active',
        stage: firstStage,
        controls: controls.size,
        suppliers: suppliers.size,
        gradient,
        alerts: 0,
        division: division || 'Unassigned',
        frequency,
        notify: Array.from(notify),
        alertLevel,
        controlList: Array.from(controls),
        supplierList: Array.from(suppliers),
      });
      setCreatedAgent(agent);
      setSuccess(true);
    } catch (err) {
      console.error('Failed to create agent:', err);
      toast.error('Failed to create agent. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAgents = () => {
    if (createdAgent) {
      onCreated(createdAgent);
    }
    onClose();
  };

  const handleCreateAnother = () => {
    setSuccess(false);
    setCreatedAgent(null);
    setName('');
    setGradient(AVATAR_GRADIENTS[0]);
    setControls(new Set(['MFA Enforcement']));
    setSuppliers(new Set());
    setStages(new Set(['Acquisition']));
    setAlertLevel('High');
    setFrequency('Daily');
    setNotify(new Set(['Risk Manager']));
    setDivision('');
    setTemplate(null);
  };

  const firstStage = stages.size > 0 ? (Array.from(stages)[0] as Stage) : 'Acquisition';

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
      <div className="relative w-[480px] max-h-[85vh] bg-white rounded-2xl flex flex-col shadow-2xl z-[1]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-lg font-bold text-slate-900">Create Agent</div>
          <button onClick={onClose} className="w-8 h-8 bg-slate-100 border-none rounded-lg cursor-pointer flex items-center justify-center text-slate-500">
            <X size={16} />
          </button>
        </div>

        {/* Body */}
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
              {/* Template selection */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Monitoring Template</label>
                <div className="flex flex-col gap-2 mb-2.5">
                  {[
                    { id: 'consulting',    icon: <Handshake size={15} color="#0EA5E9" />,   title: 'Consulting',    sub: 'SOW & Payment Auditor',     color: '#0EA5E9', bg: '#EFF6FF' },
                    { id: 'operations',    icon: <Truck size={15} color="#10B981" />,       title: 'Operations',    sub: 'SLA & Logistics Monitor',   color: '#10B981', bg: '#ECFDF5' },
                    { id: 'data-security', icon: <ShieldCheck size={15} color="#8B5CF6" />, title: 'Data Security', sub: 'PII & Encryption Watchdog', color: '#8B5CF6', bg: '#F5F3FF' },
                    { id: 'custom',        icon: <Plus size={15} color="#64748B" />,        title: 'Custom',        sub: 'Define your own parameters', color: '#64748B', bg: '#F8FAFC' },
                  ].map((tpl) => {
                    const sel = template === tpl.id;
                    return (
                      <div
                        key={tpl.id}
                        onClick={() => applyTemplate(tpl.id)}
                        className="flex items-center gap-2.5 rounded-[10px] cursor-pointer transition-all py-[11px] px-3.5"
                        style={{
                          border: `1px solid ${sel ? tpl.color : '#E2E8F0'}`,
                          backgroundColor: sel ? tpl.bg : '#fff',
                        }}
                      >
                        <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center" style={{ border: `2px solid ${sel ? tpl.color : '#CBD5E1'}` }}>
                          {sel && <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tpl.color }} />}
                        </div>
                        <div className="w-7 h-7 rounded-lg shrink-0 flex items-center justify-center" style={{ backgroundColor: sel ? tpl.color + '22' : '#F1F5F9' }}>{tpl.icon}</div>
                        <div className="flex-1">
                          <div className="text-[13px] font-semibold text-slate-900">{tpl.title}</div>
                          <div className="text-[11px] text-slate-400">{tpl.sub}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {template && template !== 'custom' && (
                  <div className="text-[11px] text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Template applied &mdash; fields pre-filled
                  </div>
                )}
              </div>

              {/* Stakeholder Communication Monitoring */}
              <div className="border border-slate-200 rounded-xl p-3.5 bg-slate-50">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <div className="w-[3px] h-3.5 rounded bg-sky-500" />
                  <span className="text-[13px] font-bold text-slate-900">Stakeholder Communication Monitoring</span>
                </div>
                <div className="text-xs text-slate-400 mb-3 leading-relaxed">
                  The agent will scan email and calendar activity between these contacts to detect anomalies.
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {/* Internal */}
                  <div>
                    <div className="text-[11px] font-bold text-sky-500 uppercase tracking-wider mb-1.5">Internal Contacts</div>
                    {internalContacts.map((email, i) => (
                      <div key={i} className="flex gap-1 mb-1.5">
                        <input
                          value={email}
                          onChange={(e) => updateContact('int', i, e.target.value)}
                          placeholder="priya@abc.co"
                          className="flex-1 border border-slate-200 rounded-[7px] text-xs text-slate-700 outline-none bg-white py-[7px] px-2.5"
                        />
                        {internalContacts.length > 1 && (
                          <button onClick={() => removeContact('int', i)} className="w-7 shrink-0 border border-red-200 rounded-[7px] bg-red-50 text-red-500 cursor-pointer flex items-center justify-center">
                            <X size={10} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button onClick={() => addContactField('int')} className="text-[11px] text-sky-500 bg-transparent border border-dashed border-sky-200 rounded-[7px] cursor-pointer w-full py-1 px-2.5">+ Add contact</button>
                  </div>
                  {/* Supplier */}
                  <div>
                    <div className="text-[11px] font-bold text-purple-500 uppercase tracking-wider mb-1.5">Supplier Contacts</div>
                    {supplierContacts.map((email, i) => (
                      <div key={i} className="flex gap-1 mb-1.5">
                        <input
                          value={email}
                          onChange={(e) => updateContact('sup', i, e.target.value)}
                          placeholder="john@supplier.com"
                          className="flex-1 border border-slate-200 rounded-[7px] text-xs text-slate-700 outline-none bg-white py-[7px] px-2.5"
                        />
                        {supplierContacts.length > 1 && (
                          <button onClick={() => removeContact('sup', i)} className="w-7 shrink-0 border border-red-200 rounded-[7px] bg-red-50 text-red-500 cursor-pointer flex items-center justify-center">
                            <X size={10} />
                          </button>
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
                <input className="w-full border border-slate-200 rounded-lg text-sm text-slate-700 outline-none py-2.5 px-3" placeholder="e.g., Agent A4" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              {/* Avatar Gradient */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Avatar Gradient</label>
                <div className="flex gap-2 mb-2.5">
                  {AVATAR_GRADIENTS.map((g) => (
                    <div
                      key={g}
                      onClick={() => setGradient(g)}
                      className="w-7 h-7 rounded-full cursor-pointer"
                      style={{ background: g, outline: gradient === g ? '3px solid #0EA5E9' : 'none', outlineOffset: 2 }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold" style={{ background: gradient }}>{initials}</div>
                  <span className="text-[13px] text-slate-500">{name || 'New Agent'}</span>
                </div>
              </div>

              {/* Controls */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Assign Controls</label>
                <div className="flex gap-1 mb-2.5 bg-slate-100 rounded-lg p-0.5">
                  {(['process', 'technical', 'document'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setControlTab(tab)}
                      className={`flex-1 rounded-md text-xs cursor-pointer border-none transition-all py-1.5 px-0 ${controlTab === tab ? 'font-bold bg-white text-[#0F172A] shadow-[0_1px_3px_rgba(0,0,0,0.08)]' : 'font-medium bg-transparent text-[#64748B] shadow-none'}`}
                    >
                      {tab === 'process' ? 'Process' : tab === 'technical' ? 'Technical' : 'Document'}
                    </button>
                  ))}
                </div>
                <div className="border border-slate-200 rounded-lg overflow-hidden">
                  {(controlTab === 'process' ? PROCESS_CONTROLS : controlTab === 'technical' ? TECHNICAL_CONTROLS : DOCUMENT_CONTROLS).map((ctrl, i, arr) => {
                    const sel = controls.has(ctrl);
                    const tabColor = controlTab === 'process' ? '#10B981' : controlTab === 'technical' ? '#0EA5E9' : '#8B5CF6';
                    const tabBg    = controlTab === 'process' ? '#ECFDF5' : controlTab === 'technical' ? '#EFF6FF' : '#F5F3FF';
                    return (
                      <div
                        key={ctrl}
                        onClick={() => toggleCtrl(ctrl)}
                        className={`flex items-center gap-2.5 cursor-pointer transition-colors py-2.5 px-3.5 ${i < arr.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                        style={{
                          backgroundColor: sel ? tabBg : '#fff',
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded shrink-0 flex items-center justify-center"
                          style={{
                            border: sel ? `2px solid ${tabColor}` : '2px solid #CBD5E1',
                            backgroundColor: sel ? tabColor : '#fff',
                          }}
                        >
                          {sel && <Check size={10} color="#fff" strokeWidth={3} />}
                        </div>
                        <span className="text-[13px]" style={{ fontWeight: sel ? 600 : 400, color: sel ? tabColor : '#334155' }}>{ctrl}</span>
                        {sel && <span className="ml-auto text-[10px] font-semibold rounded-full px-2 py-px" style={{ backgroundColor: tabBg, color: tabColor }}>Selected</span>}
                      </div>
                    );
                  })}
                </div>
                {controls.size > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {Array.from(controls).map((c) => {
                      const isDoc  = DOCUMENT_CONTROLS.includes(c);
                      const isProc = PROCESS_CONTROLS.includes(c);
                      const chipClr = isDoc ? '#8B5CF6' : isProc ? '#10B981' : '#0EA5E9';
                      const chipBg  = isDoc ? '#F5F3FF' : isProc ? '#ECFDF5' : '#EFF6FF';
                      return (
                        <span key={c} className="text-[11px] rounded-full flex items-center gap-1 px-2 py-0.5" style={{ backgroundColor: chipBg, color: chipClr }}>
                          {c}
                          <button onClick={() => toggleCtrl(c)} className="bg-transparent border-none cursor-pointer p-0 flex" style={{ color: chipClr }}>
                            <X size={9} />
                          </button>
                        </span>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Suppliers */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Assign Suppliers</label>
                <MultiSelect label="Suppliers" options={SUPPLIERS_LIST} selected={suppliers} onToggle={toggleSup} chipColor={['#F5F3FF', '#8B5CF6']} />
              </div>

              {/* Stages */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Data Flow Stage</label>
                <div className="flex gap-2 flex-wrap">
                  {STAGES.map((s) => {
                    const sel = stages.has(s);
                    const [bg, c] = STAGE_CLR[s];
                    return (
                      <button
                        key={s}
                        onClick={() => toggleStage(s)}
                        className="rounded-lg text-[13px] cursor-pointer py-1.5 px-3.5"
                        style={{
                          fontWeight: sel ? 600 : 500,
                          backgroundColor: sel ? bg : '#fff',
                          color: sel ? c : '#64748B',
                          border: `1px solid ${sel ? c : '#E2E8F0'}`,
                        }}
                      >
                        {s}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Alert / Frequency / Notify / Division */}
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Alert Sensitivity</label>
                <div className="flex gap-2">
                  {['Low', 'Medium', 'High', 'Critical Only'].map((l) => (
                    <button
                      key={l}
                      onClick={() => setAlertLevel(l)}
                      className={`rounded-lg text-[13px] cursor-pointer py-1.5 px-3 border ${alertLevel === l ? 'font-semibold bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'font-medium bg-white text-[#64748B] border-[#E2E8F0]'}`}
                    >
                      {l}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Frequency</label>
                <div className="flex gap-2">
                  {['Hourly', 'Daily', 'Every 6hrs'].map((f) => (
                    <button
                      key={f}
                      onClick={() => setFrequency(f)}
                      className={`rounded-lg text-[13px] cursor-pointer py-1.5 px-3 border ${frequency === f ? 'font-semibold bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'font-medium bg-white text-[#64748B] border-[#E2E8F0]'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Notify</label>
                <MultiSelect label="Notify" options={['Risk Manager', 'Compliance Officer', 'DPO', 'Admin']} selected={notify} onToggle={toggleNotify} chipColor={['#F5F3FF', '#8B5CF6']} />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">Division</label>
                <input className="w-full border border-slate-200 rounded-lg text-sm text-slate-700 outline-none py-2.5 px-3" placeholder="e.g., Marketing Dept" value={division} onChange={(e) => setDivision(e.target.value)} />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="px-6 py-3.5 border-t border-slate-200 flex justify-between shrink-0">
            <button className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 cursor-pointer">Save as Draft</button>
            <div className="flex gap-2">
              <button onClick={onClose} className="px-4 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-700 cursor-pointer">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!name.trim() || loading}
                className={`px-5 py-2 text-sm font-semibold border-none rounded-lg text-white cursor-pointer flex items-center gap-2 disabled:cursor-not-allowed ${name.trim() ? 'bg-[#0EA5E9]' : 'bg-[#CBD5E1]'}`}
              >
                {loading && <RefreshCw size={14} className="animate-spin" />}
                {loading ? 'Creating...' : 'Create Agent \u2192'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   RICH AGENT DETAIL VIEW (inline within Agents page)
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
  const agentRole  = agent.role || 'AI Agent';
  const isActive   = agent.status === 'live' || agent.status === 'active';
  const [stageBg, stageClr] = STAGE_CLR[agent.stage];

  // Async data fetching state
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [timeline, setTimeline] = useState<TimelineEntry[]>([]);
  const [initialLogs, setInitialLogs] = useState<LogEntry[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  // Fetch tasks, timeline, and logs
  useEffect(() => {
    let mounted = true;
    setIsLoadingData(true);

    Promise.all([
      getAgentTasks(agent.id, 'list'),
      getAgentTimeline(agent.id, 'list'),
      getAgentLogs(agent.id, 'list'),
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
        // Fall back to sync getters
        setTasks(getAgentTasksList(agent.id));
        setTimeline(getAgentTimelineList(agent.id));
        setInitialLogs(getInitialLogsList(agent.id));
        setIsLoadingData(false);
      }
    });

    return () => { mounted = false; };
  }, [agent.id]);

  const { logs, pulse } = useAgentLogStream({
    agentId: agent.id,
    view: 'list',
    initialLogs: initialLogs.length > 0 ? initialLogs : getInitialLogsList(agent.id),
    streamQueue: getStreamQueueList(agent.id),
    isActive,
  });

  const [taskFilter, setTaskFilter]         = useState<TaskStatus | 'All'>('All');
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);
  const [detailModal, setDetailModal]       = useState<null | 'picture' | 'voice' | 'talk' | 'chat'>(null);

  const filteredTasks = taskFilter === 'All' ? tasks : tasks.filter((t) => t.status === taskFilter);
  const openCount       = tasks.filter((t) => t.status === 'Open').length;
  const inProgressCount = tasks.filter((t) => t.status === 'In Progress').length;

  /* Auto-scroll log feed */
  useEffect(() => {
    if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [logs]);

  const actionCards = [
    { key: 'picture', icon: <ImageIcon size={20} color="#0EA5E9" />, iconBg: '#EFF6FF', title: 'Select Picture', sub: "Change the agent's avatar" },
    { key: 'voice',   icon: <Mic size={20} color="#8B5CF6" />,       iconBg: '#F5F3FF', title: 'Select Voice',   sub: 'Choose how this agent speaks' },
    { key: 'talk',    icon: <Volume2 size={20} color="#10B981" />,    iconBg: '#ECFDF5', title: 'Talk to Agent',  sub: 'Speak directly with this agent' },
    { key: 'chat',    icon: <MessageSquare size={20} color="#F59E0B" />, iconBg: '#FFF7ED', title: 'Start Chat', sub: 'Open chat interface with agent' },
  ];

  return (
    <div className="flex flex-col min-h-full">
      {/* Top nav */}
      <div className="bg-white border-b border-slate-200 flex items-center gap-3 shrink-0 py-3.5 px-6">
        <button onClick={onBack} className="flex items-center gap-1 bg-transparent border-none cursor-pointer text-slate-500 text-sm rounded-lg px-2.5 py-1.5">
          <ChevronLeft size={18} /> Back to Agents
        </button>
        <span className="text-slate-200">|</span>
        <div className="text-lg font-bold text-slate-900">{agent.name}</div>
        <span className="text-xs font-semibold rounded-full px-2.5 py-0.5" style={{ backgroundColor: STATUS_CLR[agent.status] + '22', color: STATUS_CLR[agent.status] }}>
          {STATUS_LABEL[agent.status]}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* ── 1. AGENT PROFILE HEADER ── */}
        <div className="bg-white border border-slate-200 rounded-[14px] p-6 mb-4 shadow-sm">
          <div className="flex items-center gap-5 flex-wrap">
            {/* Avatar */}
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
              <div className="text-xs text-slate-400">{agent.controls} controls &middot; {agent.suppliers} suppliers &middot; Division: {agent.division}</div>
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
            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full py-[5px] px-3.5 border ${agent.truthMatch === 100 ? 'bg-[#ECFDF5] border-[#A7F3D0]' : agent.truthMatch >= 50 ? 'bg-[#FFFBEB] border-[#FDE68A]' : 'bg-[#FEF2F2] border-[#FECACA]'}`}
            >
              {agent.truthMatch === 100 ? <CheckCircle2 size={13} color="#10B981" /> : agent.truthMatch >= 50 ? <AlertTriangle size={13} color="#F59E0B" /> : <AlertCircle size={13} color="#EF4444" />}
              <span className={`text-xs font-semibold ${agent.truthMatch === 100 ? 'text-[#059669]' : agent.truthMatch >= 50 ? 'text-[#92400E]' : 'text-[#DC2626]'}`}>
                Truth Match: {agent.truthMatch}%
              </span>
            </div>
          )}
        </div>

        {/* ── 2. AGENT OVERVIEW ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 px-5 mb-4 shadow-sm">
          <div className="flex items-center gap-1.5 mb-3.5">
            <BarChart2 size={14} color="#6366F1" />
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Agent Overview</span>
          </div>
          <div className="grid grid-cols-5 gap-2.5">
            {[
              { label: 'Suppliers Monitored', value: agent.suppliers, icon: <Users size={16} color="#8B5CF6" />, color: '#8B5CF6', bg: '#F5F3FF' },
              { label: 'Controls Active',     value: agent.controls,  icon: <Shield size={16} color="#0EA5E9" />, color: '#0EA5E9', bg: '#EFF6FF' },
              { label: 'Open Alerts',         value: agent.alerts,    icon: <Bell size={16} color={agent.alerts > 0 ? '#F59E0B' : '#94A3B8'} />, color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8', bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC' },
              { label: 'Open Tasks',          value: openCount + inProgressCount, icon: <FileText size={16} color={openCount > 0 ? '#EF4444' : '#10B981'} />, color: openCount > 0 ? '#EF4444' : '#10B981', bg: openCount > 0 ? '#FEF2F2' : '#ECFDF5' },
              { label: 'Last Scan',           value: agent.lastScan || '\u2014', icon: <Clock size={16} color="#6366F1" />, color: '#6366F1', bg: '#EEF2FF' },
            ].map((m) => (
              <div key={m.label} className="rounded-[10px] flex flex-col gap-1.5 py-3 px-3.5" style={{ backgroundColor: m.bg }}>
                <div className="flex items-center gap-1.5">{m.icon}<span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">{m.label}</span></div>
                <div className="text-[22px] font-extrabold" style={{ color: m.color }}>{m.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── STAKEHOLDER MAP ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-sky-500 animate-ping opacity-70" />
            <span className="text-sm font-bold text-slate-900">Stakeholder Communication Map</span>
          </div>
          <div className="grid items-center grid-cols-[1fr_auto_1fr]">
            <div className="flex flex-col gap-2">
              <div className="text-[10px] font-bold text-sky-500 uppercase tracking-wider mb-1">Internal</div>
              {[agent.internalSPOC || 'priya@abc.co', ...(agent.id === 'a1' ? ['raj@abc.co'] : agent.id === 'a3' ? ['anita@abc.co'] : [])].filter(Boolean).map((email, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg border border-sky-200 bg-sky-50 py-1.5 px-2.5">
                  <div className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold" style={{ background: 'linear-gradient(135deg,#0EA5E9,#6366F1)' }}>{email.slice(0, 2).toUpperCase()}</div>
                  <span className="text-[11px] font-medium text-sky-700 truncate">{email}</span>
                </div>
              ))}
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
              {[agent.externalSPOC || 'john@xyz.com', ...(agent.id === 'a2' ? ['ops@abc.com'] : agent.id === 'a3' ? ['info@def.com'] : [])].filter(Boolean).map((email, i) => (
                <div key={i} className="flex items-center gap-1.5 rounded-lg border border-purple-200 bg-purple-50 flex-row-reverse py-1.5 px-2.5">
                  <div className="w-[22px] h-[22px] rounded-full shrink-0 flex items-center justify-center text-white text-[8px] font-bold" style={{ background: 'linear-gradient(135deg,#8B5CF6,#EC4899)' }}>{email.slice(0, 2).toUpperCase()}</div>
                  <span className="text-[11px] font-medium text-purple-700 truncate text-right">{email}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── PROCESS INTELLIGENCE ── */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 mb-4">
          <div className="text-sm font-bold text-slate-900 mb-3.5">Process Intelligence Summary</div>
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: 'Last SOW Signed',      value: agent.id === 'a1' ? 'Feb 10, 2026' : agent.id === 'a2' ? 'Jan 22, 2026' : 'Dec 5, 2025', icon: '\uD83D\uDCC4', color: '#0EA5E9', bg: '#EFF6FF' },
              { label: 'Last Payment Detected', value: agent.id === 'a1' ? '\u20B910L \u00B7 Feb 28' : agent.id === 'a2' ? '\u20B94.2L \u00B7 Feb 20' : '\u20B918L \u00B7 Jan 15', icon: '\u20B9', color: '#10B981', bg: '#ECFDF5' },
              { label: 'Last Escalation',       value: agent.id === 'a1' ? 'Mar 1, 2026' : agent.id === 'a2' ? 'None detected' : 'Feb 27, 2026', icon: '\u26A1', color: '#F59E0B', bg: '#FFFBEB' },
              { label: 'Active Risks',          value: agent.alerts > 0 ? `${agent.alerts} open alert${agent.alerts > 1 ? 's' : ''}` : 'None detected', icon: '!', color: agent.alerts > 0 ? '#EF4444' : '#10B981', bg: agent.alerts > 0 ? '#FEF2F2' : '#ECFDF5' },
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

        {/* ── MAIN LAYOUT: LEFT + RIGHT ── */}
        <div className="grid gap-4 items-start grid-cols-[300px_1fr]">
          {/* LEFT */}
          <div className="flex flex-col gap-3.5">
            {/* Suppliers */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><Eye size={16} color="#0EA5E9" /><span className="text-sm font-bold text-slate-900">Suppliers Monitored</span></div>
                <span className="bg-sky-50 text-sky-500 text-[11px] rounded-full px-2 py-px">{agent.suppliers}</span>
              </div>
              {(agent.id === 'a1' ? [
                { name: 'XYZ Corporation', stage: 'Acquisition', dot: '#0EA5E9', status: 'flowing' },
                { name: 'GHI Technologies', stage: 'Acquisition', dot: '#0EA5E9', status: 'alert' },
              ] : agent.id === 'a2' ? [
                { name: 'ABC Services Ltd', stage: 'Retention', dot: '#10B981', status: 'flowing' },
                { name: 'JKL Consultancy', stage: 'Retention', dot: '#10B981', status: 'flowing' },
                { name: 'MNO Partners', stage: 'Retention', dot: '#10B981', status: 'pending' },
              ] : [
                { name: 'DEF Limited', stage: 'Upgradation', dot: '#F59E0B', status: 'alert' },
              ]).map((sup, i, arr) => (
                <div key={sup.name} className={`flex justify-between items-center py-2.5 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}>
                  <div>
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="w-2 h-2 rounded-full inline-block shrink-0" style={{ backgroundColor: sup.dot }} />
                      <span className="text-[13px] font-semibold text-slate-700">{sup.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 pl-3.5">{sup.stage}</span>
                  </div>
                  {sup.status === 'flowing' && <span className="bg-emerald-50 text-emerald-500 text-[11px] rounded-full px-2 py-px">Flowing</span>}
                  {sup.status === 'alert'   && <span className="bg-red-50 text-red-500 text-[11px] rounded-full px-2 py-px">Alert</span>}
                  {sup.status === 'pending' && <span className="bg-amber-50 text-amber-500 text-[11px] rounded-full px-2 py-px">Pending</span>}
                </div>
              ))}
            </div>

            {/* Controls */}
            <div className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2"><ShieldCheck size={16} color="#8B5CF6" /><span className="text-sm font-bold text-slate-900">Controls Enforced</span></div>
                <span className="bg-purple-50 text-purple-500 text-[11px] rounded-full px-2 py-px">{agent.controls}</span>
              </div>
              {(agent.id === 'a1' ? [
                { name: 'Contractual Obligation Review', cat: 'Process', result: 'issue' },
                { name: 'SOW Signature Verification',   cat: 'Document', result: 'passing' },
                { name: 'Invoice Approval Workflow',    cat: 'Process', result: 'passing' },
                { name: 'ISO 27001 Certificate Review', cat: 'Document', result: 'warn' },
              ] : agent.id === 'a2' ? [
                { name: 'SLA Adherence Policy',         cat: 'Process',  result: 'passing' },
                { name: 'Supplier Onboarding Checklist', cat: 'Process',  result: 'passing' },
                { name: 'Data Processing Agreement',    cat: 'Document', result: 'issue' },
              ] : [
                { name: 'Network Segmentation', cat: 'Technical', result: 'failed' },
                { name: 'Patch Management', cat: 'Process', result: 'issue' },
                { name: 'Vulnerability Scanning', cat: 'Technical', result: 'passing' },
                { name: 'Privileged Access Mgmt', cat: 'Technical', result: 'passing' },
              ]).map((ctrl, i, arr) => (
                <div key={ctrl.name} className={`flex justify-between items-center py-2.5 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}>
                  <div>
                    <div className="text-[13px] font-semibold text-slate-700 mb-0.5">{ctrl.name}</div>
                    <span className="text-[10px] text-slate-400">{ctrl.cat}</span>
                  </div>
                  {ctrl.result === 'passing' && <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-500 text-[11px] rounded-full px-2 py-px"><CheckCircle2 size={12} />Passing</span>}
                  {ctrl.result === 'issue'   && <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-500 text-[11px] rounded-full px-2 py-px"><AlertTriangle size={12} />1 Issue</span>}
                  {ctrl.result === 'failed'  && <span className="inline-flex items-center gap-1 bg-red-50 text-red-500 text-[11px] rounded-full px-2 py-px"><XCircle size={12} />Failed</span>}
                  {ctrl.result === 'warn'    && <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-500 text-[11px] rounded-full px-2 py-px"><AlertTriangle size={12} />1 Issue</span>}
                </div>
              ))}
            </div>

            {/* Timeline */}
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
              <div className={`flex items-center gap-1.5 cursor-pointer ${timelineCollapsed ? 'mb-0' : 'mb-3.5'}`} onClick={() => setTimelineCollapsed((v) => !v)}>
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
                <div className="flex gap-1.5">
                  {(['All', 'Open', 'In Progress', 'Resolved'] as const).map((f) => (
                    <button key={f} onClick={() => setTaskFilter(f as TaskStatus | 'All')} className="text-[11px] font-semibold rounded-full cursor-pointer py-1 px-3" style={{ backgroundColor: taskFilter === f ? agentColor : '#F8FAFC', color: taskFilter === f ? '#fff' : '#64748B', border: `1px solid ${taskFilter === f ? agentColor : '#E2E8F0'}` }}>{f}</button>
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

            {/* Agent Reasoning */}
            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
              <div className="px-4 py-3.5 border-b border-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-2"><Cpu size={16} color="#0EA5E9" /><span className="text-sm font-bold text-slate-900">Agent Reasoning</span></div>
                <div className="flex items-center gap-1.5">
                  <span className="relative inline-flex w-2 h-2"><span className="absolute inset-0 rounded-full bg-emerald-500 opacity-50 animate-ping" /><span className="relative w-2 h-2 rounded-full bg-emerald-500 block" /></span>
                  <span className="text-xs text-emerald-500">Live</span>
                </div>
              </div>
              {(agent.id === 'a1' ? [
                { time: '2 min ago',  action: 'SOW Verification',          trigger: 'XYZ Corporation',  reasoning: `Cross-referenced SOW signature date (Feb 10) against service start date (Feb 5) from ${agent.internalSPOC} emails. SOW signed after service began \u2014 Contractual Risk flagged.`, confidence: '91%', outcome: 'alert' },
                { time: '15 min ago', action: 'Invoice Approval Check',    trigger: 'XYZ Corporation',  reasoning: `Payment of \u20B910L detected in bank feed. No corresponding PO approval found in email chain between ${agent.internalSPOC} and ${agent.externalSPOC}. Anomaly: Unapproved Payment.`, confidence: '88%', outcome: 'alert' },
                { time: '40 min ago', action: 'Contractual Obligation Review', trigger: 'GHI Technologies', reasoning: 'Reviewed active obligations in contract. 2 of 5 deliverables overdue by 12+ days. SLA breach threshold crossed. Escalation email sent to Risk Manager.', confidence: '96%', outcome: 'warn' },
                { time: '1 hr ago',   action: 'ISO 27001 Cert Expiry',     trigger: 'XYZ Corporation',  reasoning: 'Pulled certificate expiry date from document store. ISO 27001 cert expires in 22 days. Auto-renewal reminder dispatched to supplier contact.', confidence: '97%', outcome: 'warn' },
                { time: '3 hrs ago',  action: 'Supplier Onboarding Check', trigger: 'GHI Technologies', reasoning: 'Onboarding checklist reviewed. Items 4 (DPA signed) and 7 (BCP submitted) not completed. Checklist 71% complete. Flagged for follow-up.', confidence: '85%', outcome: 'warn' },
                { time: '5 hrs ago',  action: 'Third-Party Risk Assessment', trigger: 'XYZ Corporation', reasoning: 'Annual TPRA due date passed 8 days ago. No updated risk assessment received. Reminder escalated to Compliance Officer.', confidence: '99%', outcome: 'alert' },
              ] : agent.id === 'a2' ? [
                { time: '8 min ago',  action: 'SLA Adherence Check',       trigger: 'ABC Services Ltd', reasoning: 'SLA report for Feb 2026 reviewed. Uptime reported at 98.1% vs contracted 99.5%. Breach of 1.4%. Penalty clause applicable. Ticket raised.', confidence: '97%', outcome: 'alert' },
                { time: '30 min ago', action: 'Invoice Approval Workflow',  trigger: 'MNO Partners',     reasoning: 'Invoice INV-20260228 (\u20B94.2L) submitted. Verified PO approval in email thread. Finance sign-off confirmed. Workflow complete, no anomalies.', confidence: '99%', outcome: 'check' },
                { time: '1 hr ago',   action: 'DPA Compliance Check',      trigger: 'JKL Consultancy',  reasoning: 'Data Processing Agreement reviewed. Article 28 obligations assessed. DPA signed Jan 2026 but missing sub-processor annex. 1 issue flagged for legal.', confidence: '90%', outcome: 'warn' },
                { time: '2 hrs ago',  action: 'Access Revocation on Exit', trigger: 'ABC Services Ltd', reasoning: 'Cross-checked HR offboarding log against supplier contact list. 1 contact (mark@abc-services.com) departed Feb 15 \u2014 access not yet revoked. Action triggered.', confidence: '94%', outcome: 'alert' },
                { time: '4 hrs ago',  action: 'Supplier Onboarding Review', trigger: 'MNO Partners',    reasoning: 'Onboarding checklist for MNO Partners at 60% completion. Missing: BCP document and proof of cyber insurance. Automated reminder sent.', confidence: '88%', outcome: 'warn' },
              ] : [
                { time: 'just now', action: 'Network Check', trigger: 'DEF Limited', reasoning: 'Network segmentation control evaluated. DMZ configuration missing. Control marked Failed.', confidence: '92%', outcome: 'alert' },
                { time: '20 min ago', action: 'Patch Status', trigger: 'DEF Limited', reasoning: 'Last patch applied 45 days ago. SLA requires 30 days. 1 issue flagged for review.', confidence: '89%', outcome: 'warn' },
                { time: '2 hrs ago', action: 'Vulnerability Scan', trigger: 'DEF Limited', reasoning: 'Automated scan results reviewed. 0 critical vulnerabilities. Scan coverage 100%.', confidence: '95%', outcome: 'check' },
                { time: '4 hrs ago', action: 'PAM Evaluation', trigger: 'DEF Limited', reasoning: 'Privileged access management controls evaluated. JIT access confirmed active.', confidence: '87%', outcome: 'check' },
              ]).map((row, i, arr) => (
                <div key={i} className={`flex gap-3 py-3 px-4 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}>
                  <div className="text-[11px] text-slate-400 shrink-0 pt-0.5 w-[70px]">{row.time}</div>
                  <div className="flex-1">
                    <div className="text-[13px] text-slate-700 mb-0.5"><span className="font-semibold text-slate-900">{row.action}</span>{' \u00B7 '}{row.trigger}</div>
                    <div className="text-xs text-slate-500 italic mb-1.5 leading-relaxed">{row.reasoning}</div>
                    <span className="text-[11px] text-slate-500 bg-slate-50 border border-slate-200 rounded-full px-2 py-px">Confidence: {row.confidence}</span>
                  </div>
                  <div className="shrink-0 pt-0.5">
                    {row.outcome === 'check' && <CheckCircle2 size={16} color="#10B981" />}
                    {row.outcome === 'alert' && <AlertCircle size={16} color="#EF4444" />}
                    {row.outcome === 'warn'  && <AlertTriangle size={16} color="#F59E0B" />}
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
                {Object.entries(LOG_STYLE).map(([type, s]) => <span key={type} className="text-[10px] font-bold rounded px-[7px] py-px" style={{ color: s.color, backgroundColor: s.bg }}>{s.label}</span>)}
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
                <div className="flex items-center gap-1.5 mb-1.5"><Clock size={13} color="#6366F1" /><span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">Planned Next Steps</span></div>
                <div className="flex gap-2 flex-wrap">
                  {isActive ? (
                    <>
                      <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">Re-evaluate controls ({agent.nextEval || '\u2014'})</span>
                      <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">Check supplier assessments</span>
                      <span className="text-xs text-slate-700 bg-indigo-50 rounded-full border border-indigo-200 px-2.5 py-0.5">Update audit log entries</span>
                    </>
                  ) : <span className="text-xs text-slate-400">Agent idle &mdash; next evaluation {agent.nextEval || '\u2014'}</span>}
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
      {detailModal === 'voice'   && <VoiceModal onClose={() => setDetailModal(null)} />}
      {detailModal === 'talk'    && <TalkModal agent={agent} onClose={() => setDetailModal(null)} />}
      {detailModal === 'chat'    && <ChatModal agent={agent} onClose={() => setDetailModal(null)} />}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   AGENTS DASHBOARD (LIST VIEW)
══════════════════════════════════════════════════════════════ */

export function AgentsPage() {
  const location = useLocation();
  const [view, setView]                   = useState<'dashboard' | 'detail'>('dashboard');
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [showCreate, setShowCreate]       = useState(false);
  const [agents, setAgents]               = useState<Agent[]>([]);
  const [isLoading, setIsLoading]         = useState(true);
  const [error, setError]                 = useState<string | null>(null);

  // Fetch agents on mount
  useEffect(() => {
    let mounted = true;
    setIsLoading(true);
    setError(null);

    getAgents()
      .then((data) => {
        if (mounted) {
          setAgents(data);
          setIsLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch agents:', err);
        if (mounted) {
          // Fall back to sync mock data
          setAgents(getMockAgents());
          setError(null); // Don't show error since we have fallback
          setIsLoading(false);
        }
      });

    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    if (location.state?.openCreateModal) { setShowCreate(true); setView('dashboard'); }
    if (location.state?.openAgentDetail) {
      const found = agents.find((a) => a.id === location.state.openAgentDetail);
      if (found) { setSelectedAgent(found); setView('detail'); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.state, agents]);

  const liveCount    = agents.filter((a) => a.status === 'live').length;
  const activeCount  = agents.filter((a) => a.status === 'active').length;
  const syncingCount = agents.filter((a) => a.status === 'syncing').length;

  const handleUpdateAgent = async (updated: Agent) => {
    // Optimistically update local state
    setAgents((as) => as.map((a) => (a.id === updated.id ? updated : a)));
    if (selectedAgent?.id === updated.id) setSelectedAgent(updated);

    // Persist to backend
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
      });
    } catch (err) {
      console.error('Failed to update agent:', err);
      toast.error('Failed to save changes. Please try again.');
    }
  };

  /* Detail view */
  if (view === 'detail' && selectedAgent) {
    return (
      <>
        <AgentDetailView
          agent={agents.find((a) => a.id === selectedAgent.id) ?? selectedAgent}
          onBack={() => { setView('dashboard'); setSelectedAgent(null); }}
          onUpdateAgent={handleUpdateAgent}
        />
        <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      </>
    );
  }

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
        <button
          onClick={() => window.location.reload()}
          className="bg-sky-500 text-white px-4 py-2 rounded-lg text-sm font-medium cursor-pointer border-none"
        >
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
          <div
            key={kpi.label}
            className="bg-white border border-slate-200 rounded-xl shadow-sm py-[18px] px-5"
            style={{ borderLeft: `4px solid ${kpi.color}` }}
          >
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
          const [sBg, sClr] = STAGE_CLR[agent.stage];
          const avatarUrl = getAvatarUrl(agent.avatarSeed || agent.initials);
          return (
            <div
              key={agent.id}
              onClick={() => { setSelectedAgent(agent); setView('detail'); }}
              className="bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer text-center transition-all hover:shadow-md hover:border-sky-500"
            >
              <div className="flex justify-center mb-3 relative">
                <div className="relative">
                  <img src={avatarUrl} alt={agent.name} width={72} height={72} className="rounded-full block bg-slate-100" style={{ border: `3px solid ${STATUS_CLR[agent.status]}55` }} />
                  <div className="absolute bottom-px right-px w-[13px] h-[13px] rounded-full border-2 border-white" style={{ backgroundColor: STATUS_CLR[agent.status] }} />
                </div>
              </div>
              <div className="text-sm font-bold text-slate-900 mb-1.5">{agent.name}</div>
              {agent.role && <div className="text-[11px] text-slate-400 mb-1.5 leading-snug">{agent.role}</div>}
              <div className="mb-2"><StatusIndicator status={agent.status} /></div>
              <span className="text-[10px] font-semibold rounded-full inline-block mb-2 px-2 py-0.5" style={{ backgroundColor: sBg, color: sClr }}>{agent.stage}</span>
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
                  <div className="h-full rounded-full transition-[width] duration-500 ease-out" style={{ width: `${agent.health}%`, backgroundColor: agent.health >= 80 ? '#10B981' : agent.health >= 50 ? '#F59E0B' : '#EF4444' }} />
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
          {[
            { id: 'a1', name: 'Agent Aria',  seed: 'Aria',  action: 'checked MFA compliance on XYZ Corporation',                 time: '2 min ago',  icon: <CheckCircle2 size={16} color="#10B981" /> },
            { id: 'a2', name: 'Agent Blake', seed: 'Blake', action: 'raised alert: Call Center Ltd missing data',                 time: '8 min ago',  icon: <AlertCircle size={16} color="#EF4444" /> },
            { id: 'a3', name: 'Agent Casey', seed: 'Casey', action: 'started backup verification check',                          time: 'just now',   icon: <RefreshCw size={16} color="#F59E0B" className="animate-spin" /> },
            { id: 'a1', name: 'Agent Aria',  seed: 'Aria',  action: 'document expiry warning: ISO 27001 cert expires in 22 days', time: '15 min ago', icon: <AlertTriangle size={16} color="#F59E0B" /> },
            { id: 'a2', name: 'Agent Blake', seed: 'Blake', action: 'completed access review policy evaluation',                  time: '1 hr ago',   icon: <CheckCircle2 size={16} color="#10B981" /> },
          ].map((row, i, arr) => (
            <div
              key={i}
              onClick={() => { const found = agents.find((a) => a.id === row.id); if (found) { setSelectedAgent(found); setView('detail'); } }}
              className={`flex items-center gap-3 cursor-pointer transition-colors hover:bg-slate-50 py-3 px-4 ${i < arr.length - 1 ? 'border-b border-[#F8FAFC]' : ''}`}
            >
              <img src={getAvatarUrl(row.seed)} alt={row.name} width={28} height={28} className="rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="m-0 text-[13px] text-slate-700 leading-snug">
                  <span className="font-semibold text-slate-900">{row.name}</span>{' '}{row.action}
                </p>
                <div className="text-[11px] text-slate-400 mt-0.5">{row.time}</div>
              </div>
              <div className="shrink-0">{row.icon}</div>
            </div>
          ))}
        </div>
      </div>

      <style>{`@keyframes ping{0%,100%{opacity:1}50%{opacity:0.3}} @keyframes spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

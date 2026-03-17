import { useEffect, useRef } from 'react';
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, Activity, CheckCircle2, Brain,
  Database, Zap, Clock, TrendingUp, Shield, ChevronDown, ChevronUp,
  Users, BarChart2, Bell, FileText, Flag,
  GitMerge,
} from 'lucide-react';

import type { TaskStatus } from '../types';
import {
  LOG_STYLE,
  getAgentDefinitionById,
  getAgentTasksDetail,
  getAgentTimelineDetail,
  getInitialLogsDetail,
  getStreamQueueDetail,
  getAvatarUrl,
} from '../services/agents.data';
import { LogRow } from '../components/LogRow';
import { TaskRow } from '../components/TaskRow';
import { TimelineItem } from '../components/TimelineItem';
import { useAgentLogStream } from '../hooks/useAgentLogStream';

export function AgentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const agent = getAgentDefinitionById(id || '');
  const feedRef = useRef<HTMLDivElement>(null);

  const tasks = getAgentTasksDetail(agent.id);
  const timeline = getAgentTimelineDetail(agent.id);

  const isActive = agent.status === 'Active';

  const { logs, pulse } = useAgentLogStream({
    initialLogs: getInitialLogsDetail(agent.id),
    streamQueue: getStreamQueueDetail(agent.id),
    isActive,
  });

  const [taskFilter, setTaskFilter] = useState<TaskStatus | 'All'>('All');
  const [timelineCollapsed, setTimelineCollapsed] = useState(false);

  const filteredTasks =
    taskFilter === 'All' ? tasks : tasks.filter((t) => t.status === taskFilter);
  const openCount = tasks.filter((t) => t.status === 'Open').length;
  const inProgressCount = tasks.filter(
    (t) => t.status === 'In Progress',
  ).length;

  const avatarUrl = getAvatarUrl(agent.avatarSeed);

  /* Auto-scroll log feed */
  useEffect(() => {
    if (feedRef.current)
      feedRef.current.scrollTop = feedRef.current.scrollHeight;
  }, [logs]);

  return (
    <div className="max-w-[1200px] font-sans">
      {/* Back button */}
      <button
        onClick={() => navigate('/agents')}
        className="flex items-center gap-1.5 text-slate-500 bg-transparent border-none cursor-pointer text-sm mb-4 p-0"
      >
        <ArrowLeft size={16} /> Back to Agents
      </button>

      {/* ── 1. AGENT PROFILE HEADER ── */}
      <div className="bg-white border border-slate-200 rounded-[14px] p-6 mb-4 shadow-sm">
        <div className="flex items-center gap-5 flex-wrap">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={avatarUrl}
              alt={agent.name}
              width={72}
              height={72}
              className="rounded-full block bg-slate-100"
              style={{ border: `3px solid ${agent.color}40` }}
            />
            <div
              className={`absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full border-2 border-white transition-opacity duration-300 ${isActive ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`}
              style={{
                opacity: isActive ? (pulse ? 1 : 0.4) : 1,
              }}
            />
          </div>

          {/* Name + role */}
          <div className="flex-1 min-w-[180px]">
            <div className="flex items-center gap-2.5 flex-wrap mb-0.5">
              <h1 className="text-[22px] font-bold text-slate-900 m-0">
                {agent.name}
              </h1>
              <div
                className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 border ${isActive ? 'bg-[#ECFDF5] border-[#A7F3D0]' : 'bg-[#F1F5F9] border-[#E2E8F0]'}`}
              >
                <div
                  className={`w-[7px] h-[7px] rounded-full transition-opacity duration-300 ${isActive ? 'bg-[#10B981]' : 'bg-[#94A3B8]'}`}
                  style={{
                    opacity: isActive ? (pulse ? 1 : 0.3) : 1,
                  }}
                />
                <span
                  className={`text-xs font-semibold ${isActive ? 'text-[#10B981]' : 'text-[#94A3B8]'}`}
                >
                  {isActive ? 'LIVE' : 'IDLE'}
                </span>
              </div>
            </div>
            <div className="text-[13px] text-slate-500 mb-1">{agent.role}</div>
            <div className="text-xs text-slate-400">
              {agent.controls.length} controls &middot;{' '}
              {agent.suppliers.length} suppliers &middot; Alert sensitivity:{' '}
              {agent.alertLevel || 'Low'}
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-2.5 flex-wrap">
            {[
              {
                label: 'UPTIME',
                value: agent.uptime,
                color: '#0EA5E9',
                bg: '#F8FAFC',
                border: '#E2E8F0',
              },
              {
                label: 'ALERTS',
                value: String(agent.alerts),
                color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8',
                bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC',
                border: agent.alerts > 0 ? '#FDE68A' : '#E2E8F0',
              },
              {
                label: 'NEXT EVAL',
                value: agent.nextEval,
                color: '#6366F1',
                bg: '#F8FAFC',
                border: '#E2E8F0',
              },
            ].map((s) => (
              <div
                key={s.label}
                className="text-center rounded-[10px] py-2 px-3.5"
                style={{
                  backgroundColor: s.bg,
                  border: `1px solid ${s.border}`,
                }}
              >
                <div
                  className="text-lg font-extrabold"
                  style={{ color: s.color }}
                >
                  {s.value}
                </div>
                <div className="text-[10px] text-slate-400 font-semibold tracking-wide">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current task bar */}
        <div
          className="mt-4 rounded-lg flex items-center gap-2 py-2.5 px-3.5"
          style={{
            backgroundColor: `${agent.color}0A`,
            border: `1px solid ${agent.color}30`,
          }}
        >
          <Activity size={13} color={agent.color} />
          <span
            className="text-[11px] font-bold uppercase tracking-wider shrink-0"
            style={{ color: agent.color }}
          >
            Currently
          </span>
          <span className="text-[13px] text-slate-700">
            {agent.currentTask}
          </span>
        </div>
      </div>

      {/* ── 2. AGENT OVERVIEW CARD ── */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 px-5 mb-4 shadow-sm">
        <div className="flex items-center gap-1.5 mb-3.5">
          <BarChart2 size={14} color="#6366F1" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Agent Overview
          </span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {[
            {
              label: 'Suppliers Monitored',
              value: agent.suppliers.length,
              icon: <Users size={16} color="#8B5CF6" />,
              color: '#8B5CF6',
              bg: '#F5F3FF',
            },
            {
              label: 'Controls Active',
              value: agent.controls.length,
              icon: <Shield size={16} color="#0EA5E9" />,
              color: '#0EA5E9',
              bg: '#EFF6FF',
            },
            {
              label: 'Open Alerts',
              value: agent.alerts,
              icon: (
                <Bell
                  size={16}
                  color={agent.alerts > 0 ? '#F59E0B' : '#94A3B8'}
                />
              ),
              color: agent.alerts > 0 ? '#F59E0B' : '#94A3B8',
              bg: agent.alerts > 0 ? '#FFFBEB' : '#F8FAFC',
            },
            {
              label: 'Open Tasks',
              value: openCount + inProgressCount,
              icon: (
                <FileText
                  size={16}
                  color={openCount > 0 ? '#EF4444' : '#10B981'}
                />
              ),
              color: openCount > 0 ? '#EF4444' : '#10B981',
              bg: openCount > 0 ? '#FEF2F2' : '#ECFDF5',
            },
            {
              label: 'Last Scan',
              value: agent.lastScan,
              icon: <Clock size={16} color="#6366F1" />,
              color: '#6366F1',
              bg: '#EEF2FF',
            },
          ].map((m) => (
            <div
              key={m.label}
              className="rounded-[10px] flex flex-col gap-1.5 py-3 px-3.5"
              style={{ backgroundColor: m.bg }}
            >
              <div className="flex items-center gap-1.5">
                {m.icon}
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  {m.label}
                </span>
              </div>
              <div
                className="text-[22px] font-extrabold"
                style={{ color: m.color }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── MAIN LAYOUT: Left + Right ── */}
      <div className="grid gap-4 items-start grid-cols-[300px_1fr]">
        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col gap-3.5">
          {/* Assigned Controls */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Shield size={14} color="#0EA5E9" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Assigned Controls
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {agent.controls.map((c) => (
                <div
                  key={c}
                  className="flex items-center gap-2 text-[13px] text-slate-700 bg-slate-50 rounded-[7px] py-1.5 px-2.5"
                >
                  <CheckCircle2 size={12} color="#10B981" />
                  {c}
                </div>
              ))}
            </div>
          </div>

          {/* Monitoring Suppliers */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2.5">
              <TrendingUp size={14} color="#8B5CF6" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Monitoring Suppliers
              </span>
            </div>
            <div className="flex flex-col gap-1.5">
              {agent.suppliers.map((s) => (
                <div
                  key={s}
                  className="flex items-center gap-2 text-[13px] text-slate-700 bg-purple-50 rounded-[7px] py-1.5 px-2.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
                  {s}
                </div>
              ))}
              {agent.suppliers.length === 0 && (
                <span className="text-xs text-slate-400">
                  No suppliers assigned
                </span>
              )}
            </div>
          </div>

          {/* Connected Systems */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Database size={14} color="#F59E0B" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                Connected Systems
              </span>
            </div>
            <div className="flex gap-1.5 flex-wrap">
              {agent.systems.map((s) => (
                <span
                  key={s}
                  className="bg-amber-50 text-amber-500 text-xs font-medium rounded-full border border-amber-200 py-[3px] px-2.5"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div
              className={`flex items-center gap-1.5 cursor-pointer ${timelineCollapsed ? 'mb-0' : 'mb-3.5'}`}
              onClick={() => setTimelineCollapsed((v) => !v)}
            >
              <GitMerge size={14} color="#6366F1" />
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest flex-1">
                Activity Timeline
              </span>
              {timelineCollapsed ? (
                <ChevronDown size={13} color="#94A3B8" />
              ) : (
                <ChevronUp size={13} color="#94A3B8" />
              )}
            </div>
            {!timelineCollapsed && (
              <div>
                {timeline.map((entry, idx) => (
                  <TimelineItem
                    key={entry.id}
                    entry={entry}
                    isLast={idx === timeline.length - 1}
                  />
                ))}
                {timeline.length === 0 && (
                  <span className="text-xs text-slate-400">
                    No timeline entries
                  </span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT COLUMN ── */}
        <div className="flex flex-col gap-4">
          {/* Agent Tasks Panel */}
          <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between flex-wrap gap-2.5">
              <div className="flex items-center gap-2">
                <Flag size={15} color="#EF4444" />
                <span className="text-[15px] font-bold text-slate-900">
                  Agent Tasks
                </span>
                {tasks.length > 0 && (
                  <span className="text-[11px] font-bold text-white bg-red-500 rounded-full px-2 py-px">
                    {tasks.length}
                  </span>
                )}
              </div>
              <div className="flex gap-1.5">
                {(['All', 'Open', 'In Progress', 'Resolved'] as const).map(
                  (f) => (
                    <button
                      key={f}
                      onClick={() => setTaskFilter(f as TaskStatus | 'All')}
                      className="text-[11px] font-semibold rounded-full cursor-pointer py-1 px-3"
                      style={{
                        backgroundColor:
                          taskFilter === f ? agent.color : '#F8FAFC',
                        color: taskFilter === f ? '#fff' : '#64748B',
                        border: `1px solid ${taskFilter === f ? agent.color : '#E2E8F0'}`,
                      }}
                    >
                      {f}
                    </button>
                  ),
                )}
              </div>
            </div>
            <div className="px-5 py-4">
              {filteredTasks.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-[13px]">
                  <CheckCircle2
                    size={32}
                    color="#A7F3D0"
                    className="block mx-auto mb-2"
                  />
                  No{' '}
                  {taskFilter !== 'All'
                    ? taskFilter.toLowerCase() + ' '
                    : ''}
                  tasks for this agent
                </div>
              ) : (
                filteredTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    agentColor={agent.color}
                  />
                ))
              )}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="bg-white border border-slate-200 rounded-[14px] shadow-sm flex flex-col h-[520px]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <Zap size={16} color="#F59E0B" />
                <span className="text-[15px] font-bold text-slate-900">
                  Activity Feed
                </span>
                {isActive && (
                  <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 rounded-full border border-emerald-200 px-2 py-px">
                    STREAMING LIVE
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                {logs.length} entries
              </span>
            </div>

            {/* Legend */}
            <div className="px-5 py-2 border-b border-slate-100 flex gap-2 flex-wrap shrink-0 bg-[#FAFAFA]">
              {Object.entries(LOG_STYLE).map(([type, s]) => (
                <span
                  key={type}
                  className="text-[10px] font-bold rounded px-[7px] py-px"
                  style={{
                    color: s.color,
                    backgroundColor: s.bg,
                  }}
                >
                  {s.label}
                </span>
              ))}
              <span className="text-[10px] text-slate-400 ml-1">
                &middot; Click REASON to expand
              </span>
            </div>

            {/* Feed */}
            <div
              ref={feedRef}
              className="flex-1 overflow-y-auto px-5 py-3"
            >
              {logs.map((entry) => (
                <LogRow key={entry.id} entry={entry} />
              ))}
              {isActive && (
                <div className="flex items-center gap-1.5 py-1.5 text-slate-400">
                  <div
                    className="w-2 h-2 rounded-full bg-emerald-500 transition-opacity duration-300"
                    style={{ opacity: pulse ? 1 : 0 }}
                  />
                  <span className="text-xs font-mono">Agent running...</span>
                </div>
              )}
            </div>

            {/* Next Steps footer */}
            <div className="px-5 py-3.5 border-t border-slate-200 bg-slate-50 shrink-0 rounded-b-[14px]">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Clock size={13} color="#6366F1" />
                <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-widest">
                  Planned Next Steps
                </span>
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
                  <span className="text-xs text-slate-400">
                    Agent idle &mdash; triggers checked at {agent.nextEval}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

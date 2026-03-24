import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import {
  ArrowLeft, ChevronDown, ChevronUp, Clock, CheckCircle2,
  AlertTriangle, AlertCircle, Loader2, Zap, Calendar,
  Hash, FileText, Bot, ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';
import { getAgents, getAvatarUrl, STATUS_CLR } from '../services/agents.data';
import { LogRow } from '../components/LogRow';
import type { LogEntry, Agent } from '../types';
import { api } from '../../../lib/api';

/* ── Types ─────────────────────────────────────────────── */
interface RunSummary {
  run_id: string;
  run_date: string;
  started_at: string;
  ended_at: string;
  log_count: number;
}

/* ── Log type colours ──────────────────────────────────── */
const LOG_CLR: Record<string, { color: string; bg: string; label: string }> = {
  fetch:     { color: '#0EA5E9', bg: '#EFF6FF',  label: 'FETCH'  },
  evaluate:  { color: '#6366F1', bg: '#EEF2FF',  label: 'EVAL'   },
  reasoning: { color: '#8B5CF6', bg: '#F5F3FF',  label: 'REASON' },
  success:   { color: '#10B981', bg: '#ECFDF5',  label: 'PASS'   },
  warning:   { color: '#F59E0B', bg: '#FFFBEB',  label: 'WARN'   },
  action:    { color: '#0EA5E9', bg: '#EFF6FF',  label: 'ACTION' },
  error:     { color: '#EF4444', bg: '#FEF2F2',  label: 'ERROR'  },
  decision:  { color: '#64748B', bg: '#F8FAFC',  label: 'NEXT'   },
};

/* ── Run row — expandable logs ─────────────────────────── */
function RunRow({ agentId, run }: { agentId: string; run: RunSummary }) {
  const [open, setOpen]       = useState(false);
  const [logs, setLogs]       = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  const warnCount    = logs.filter(l => l.type === 'warning').length;
  const errorCount   = logs.filter(l => l.type === 'error').length;

  const startTime = run.started_at
    ? new Date(run.started_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    : '—';

  const duration = run.started_at && run.ended_at
    ? Math.round((new Date(run.ended_at).getTime() - new Date(run.started_at).getTime()) / 1000)
    : null;

  const handleToggle = async () => {
    if (!open && !loaded) {
      setLoading(true);
      try {
        const data = await api.get<LogEntry[]>(`/agents/${agentId}/logs/runs/${run.run_id}`);
        setLogs(data);
        setLoaded(true);
      } catch (err) {
        toast.error('Failed to load logs for this run');
      } finally {
        setLoading(false);
      }
    }
    setOpen(p => !p);
  };

  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden mb-3 bg-white">
      <div
        onClick={handleToggle}
        className="flex items-center gap-3 px-5 py-3 cursor-pointer hover:bg-slate-50 transition-colors flex-wrap"
      >
        <div className="flex items-center gap-1.5 bg-slate-100 rounded-lg px-2.5 py-1 shrink-0">
          <Hash size={11} className="text-slate-400" />
          <span className="text-[12px] font-mono font-semibold text-slate-600">{run.run_id}</span>
        </div>

        <div className="flex items-center gap-1.5 shrink-0 ml-1">
          <Calendar size={13} className="text-slate-400" />
          <span className="text-[13px] font-semibold text-slate-700">{run.run_date}</span>
          <span className="text-slate-300">·</span>
          <Clock size={13} className="text-slate-400" />
          <span className="text-[13px] text-slate-500">{startTime}</span>
        </div>

        {duration !== null && (
          <span className="text-[12px] text-slate-400 shrink-0">
            {duration < 60 ? `${duration}s` : `${Math.floor(duration / 60)}m ${duration % 60}s`}
          </span>
        )}

        <div className="flex items-center gap-2 ml-auto shrink-0">
          <span className="text-[11px] text-slate-400">{run.log_count} entries</span>
          {errorCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
              <AlertCircle size={10} /> {errorCount} error{errorCount > 1 ? 's' : ''}
            </span>
          )}
          {warnCount > 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
              <AlertTriangle size={10} /> {warnCount} warning{warnCount > 1 ? 's' : ''}
            </span>
          )}
          {!loading && loaded && errorCount === 0 && warnCount === 0 && (
            <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <CheckCircle2 size={10} /> Clean
            </span>
          )}
          {loading
            ? <Loader2 size={14} className="animate-spin text-slate-400" />
            : open
              ? <ChevronUp size={14} className="text-slate-400" />
              : <ChevronDown size={14} className="text-slate-400" />
          }
        </div>
      </div>

      {open && loaded && (
        <div className="border-t border-slate-100 bg-[#FAFAFA]">
          <div className="px-5 py-2 border-b border-slate-100 flex gap-2 flex-wrap">
            {Object.entries(LOG_CLR).map(([type, s]) => (
              <span key={type} className="text-[10px] font-bold rounded px-[7px] py-px"
                style={{ color: s.color, backgroundColor: s.bg }}>
                {s.label}
              </span>
            ))}
            <span className="text-[10px] text-slate-400 ml-1">&middot; Click REASON to expand</span>
          </div>
          <div className="px-5 py-3">
            {logs.length === 0
              ? <div className="text-sm text-slate-400 py-4 text-center">No logs for this run</div>
              : logs.map(entry => <LogRow key={entry.id} entry={entry} />)
            }
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Agent Accordion Card ──────────────────────────────── */
function AgentHistoryCard({ agent, autoOpen }: { agent: Agent, autoOpen?: boolean }) {
  const [open, setOpen]       = useState(autoOpen);
  const [runs, setRuns]       = useState<RunSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded]   = useState(false);

  useEffect(() => {
    if (autoOpen && !loaded) {
      loadRuns();
    }
  }, [autoOpen, loaded]);

  const loadRuns = async () => {
    setLoading(true);
    try {
      const data = await api.get<RunSummary[]>(`/agents/${agent.id}/logs/runs`);
      setRuns(data.sort((a,b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime()));
      setLoaded(true);
    } catch (e) {
      toast.error(`Failed to load history for ${agent.name}`);
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    if (!open && !loaded) {
      loadRuns();
    }
    setOpen(!open);
  };

  return (
    <div className={`border rounded-2xl overflow-hidden transition-all mb-4 ${open ? 'border-sky-300 shadow-md' : 'border-slate-200 bg-white hover:border-sky-200 hover:shadow-sm'}`}>
      <div onClick={handleToggle} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 cursor-pointer bg-white relative">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
             <img src={getAvatarUrl(agent.avatarSeed || agent.initials)} alt={agent.name} width={48} height={48} className="rounded-full bg-slate-100" style={{ border: `2px solid ${STATUS_CLR[agent.status]}55` }} />
             <div className="absolute bottom-0 right-0 w-[11px] h-[11px] rounded-full border-2 border-white" style={{ backgroundColor: STATUS_CLR[agent.status] }} />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 m-0">{agent.name}</h3>
            <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1 m-0">
              <span className="font-medium text-slate-700">{agent.division || 'Cross-functional'}</span>
              <span>&mdash;</span>
              <span>{agent.controls} controls supervised</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 mt-3 sm:mt-0 max-sm:pl-[64px]">
           {loaded && !loading && (
             <span className="text-[12px] font-semibold text-slate-400 bg-slate-50 px-2.5 py-1 rounded-lg">
               {runs.length} run{runs.length !== 1 ? 's' : ''} recorded
             </span>
           )}
           <div className="w-8 h-8 rounded-full flex items-center justify-center bg-slate-50 text-slate-400 shrink-0">
             {loading ? <Loader2 size={16} className="animate-spin text-sky-500" /> : open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
           </div>
        </div>
      </div>

      {open && (
        <div className="p-5 pt-2 bg-slate-50/50 border-t border-slate-100">
          {loading && (
            <div className="flex items-center justify-center py-10 gap-3 text-slate-400">
              <Loader2 size={24} className="animate-spin text-sky-500" />
              <span className="text-sm">Loading execution history...</span>
            </div>
          )}

          {!loading && loaded && runs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
                <Zap size={20} className="text-slate-300" />
              </div>
              <p className="text-slate-500 font-medium text-sm">No runs executed yet</p>
            </div>
          )}

          {!loading && loaded && runs.length > 0 && (
             <div className="flex flex-col">
               {runs.map(run => <RunRow key={run.run_id} agentId={agent.id} run={run} />)}
             </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────── */
export function AgentLogsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [agents, setAgents]   = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    getAgents().then((data) => {
      if (mounted) {
        if (id) {
          // If a specific ID is provided, filter
          setAgents(data.filter(a => a.id === id));
        } else {
          setAgents(data);
        }
        setLoading(false);
      }
    }).catch(err => {
      console.error(err);
      if (mounted) setLoading(false);
      toast.error('Failed to load agents');
    });
    return () => { mounted = false; };
  }, [id]);

  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mb-20 animate-in fade-in zoom-in duration-300">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/agents')}
            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 hover:border-slate-300 cursor-pointer transition-colors shadow-sm">
            <ArrowLeft size={15} />
          </button>
          
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shrink-0">
             <FileText size={22} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 m-0 tracking-tight">Agent History & Logs</h1>
            <p className="text-sm font-medium text-slate-500 mt-0.5 mb-0">
              {id ? 'Detailed execution logs for the selected agent' : 'Select an agent to view its historical run traces, findings, and evaluations'}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3 text-slate-400">
          <Loader2 size={32} className="animate-spin text-indigo-500" />
          <span className="text-sm font-medium">Loading agents...</span>
        </div>
      ) : agents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
           <AlertCircle size={32} className="text-slate-300" />
           <p className="text-slate-500 font-medium">No agents found</p>
        </div>
      ) : (
        <div className="mt-2">
          {agents.map(agent => (
            <AgentHistoryCard key={agent.id} agent={agent} autoOpen={!!id || agents.length === 1} />
          ))}
        </div>
      )}
    </div>
  );
}

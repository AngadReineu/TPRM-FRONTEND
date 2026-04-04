import { NavLink, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { getAgents } from '../../features/agents/services/agents.data';
import type { Agent } from '../../features/agents/types';
import {
  LayoutDashboard, Database, BookOpen, AlertTriangle,
  Bot, Plus, Sliders, FolderOpen, LayoutTemplate, FileText,
  Settings, LogOut, ChevronUp, ChevronDown, Users, Server,
} from 'lucide-react';

/* ── Item class helper ───────────────────────────────── */
function itemClass(isActive = false, indent = false, sub = false) {
  const pad = sub && indent ? 'py-[7px] pr-3 pl-9'
    : sub           ? 'py-[7px] pr-3 pl-7'
    : indent        ? 'py-2 pr-3 pl-7'
    :                 'py-2 px-3';
  return cn(
    'flex items-center gap-2.5 rounded-md no-underline cursor-pointer transition-all duration-150 mb-0.5 select-none',
    sub ? 'text-[12px]' : 'text-[13px]',
    pad,
    isActive
      ? 'font-semibold text-sky-600 bg-sky-50 border border-sky-100'
      : 'font-medium text-slate-500 border border-transparent',
    'hover:bg-slate-50 hover:text-slate-700',
  );
}

/* ── Functional NavLink item ─────────────────────────── */
function FuncItem({
  icon: Icon, label, to, indent = false, sub = false, end = false,
}: {
  icon: React.ElementType; label: string; to: string;
  indent?: boolean; sub?: boolean; end?: boolean;
}) {
  return (
    <NavLink
      to={to}
      end={end || to === '/'}
      className={({ isActive }) => itemClass(isActive, indent, sub)}
    >
      <Icon size={16} strokeWidth={1.8} className="shrink-0" />
      <span>{label}</span>
    </NavLink>
  );
}

/* ── Section label ───────────────────────────────────── */
function SectionLabel({
  label, section, collapsed, toggle,
}: {
  label: string; section: string;
  collapsed: Record<string, boolean>;
  toggle: (s: string) => void;
}) {
  const isCollapsed = !!collapsed[section];
  return (
    <div
      onClick={() => toggle(section)}
      className="text-[10px] font-bold text-slate-400 tracking-[0.08em] uppercase px-3 pt-3 pb-1 flex justify-between items-center cursor-pointer select-none hover:text-slate-500"
    >
      <span>{label}</span>
      {isCollapsed
        ? <ChevronDown size={13} className="text-slate-400" />
        : <ChevronUp   size={13} className="text-slate-400" />}
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────── */
function Divider() {
  return <div className="border-t border-slate-100 mx-3 my-1" />;
}

/* ═══════════════════════════════════════════════════════ */
export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [agents, setAgents] = useState<Agent[]>([]);

  const toggle = (section: string) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(err => console.error('Failed to fetch agents for sidebar:', err));
  }, []);

  const getStatusColor = (status: Agent['status']): string => {
    switch (status) {
      case 'live':    return '#10B981';
      case 'active':  return '#0EA5E9';
      case 'syncing': return '#F59E0B';
      default:        return '#CBD5E1';
    }
  };

  return (
    <div className="w-60 bg-white border-r border-slate-200 shadow-sm flex flex-col h-screen fixed top-0 left-0 z-50 font-[Inter,sans-serif]">

      {/* ── Logo ─────────────────────────────────────── */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-100 shrink-0">
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="9"   stroke="white" strokeWidth="2"/>
            <circle cx="13" cy="13" r="4"   stroke="white" strokeWidth="2"/>
            <circle cx="13" cy="13" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-900 tracking-[-0.02em]">
          TPRM
        </span>
      </div>

      {/* ── Scrollable Nav ───────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2">

        {/* 1 — Dashboard */}
        <div className="mt-3 mb-0.5 px-3">
          <FuncItem icon={LayoutDashboard} label="Dashboard" to="/" end />
        </div>

        <Divider />

        {/* 2 — ORGANIZATION DATA FLOW */}
        <SectionLabel label="Organization Data Flow" section="ORG_DATA_FLOW" collapsed={collapsed} toggle={toggle} />
        {!collapsed['ORG_DATA_FLOW'] && (
          <div className="px-3">
            {/* TPRM collapsible sub-menu */}
            <div
              onClick={() => toggle('TPRM_MENU')}
              className={cn(itemClass(false, false, false), 'justify-between font-medium text-slate-500')}
            >
              <div className="flex items-center gap-2.5">
                <Database size={16} strokeWidth={1.8} className="shrink-0" />
                <span>TPRM</span>
              </div>
              {collapsed['TPRM_MENU']
                ? <ChevronDown size={13} className="opacity-50" />
                : <ChevronUp   size={13} className="opacity-50" />}
            </div>
            {!collapsed['TPRM_MENU'] && (
              <div className="mb-1">
                <FuncItem icon={Users}  label="Suppliers" to="/tprm/suppliers" indent sub />
                <FuncItem icon={Server} label="Systems"   to="/tprm/systems"   indent sub />
              </div>
            )}
            <FuncItem icon={BookOpen}      label="Library"     to="/libraries"   indent />
            <FuncItem icon={AlertTriangle} label="Risk Threat" to="/risk-threat" indent />
          </div>
        )}

        <Divider />

        {/* 3 — AGENTS */}
        <div className="text-[10px] font-bold text-slate-400 tracking-[0.08em] uppercase px-3 pt-3 pb-1 flex justify-between items-center select-none hover:text-slate-500">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => toggle('AGENTS')}
          >
            <span>Agents</span>
            {collapsed['AGENTS']
              ? <ChevronDown size={13} className="text-slate-400" />
              : <ChevronUp   size={13} className="text-slate-400" />}
          </div>
          <button
            onClick={() => navigate('/agents', { state: { openCreateModal: true } })}
            className="bg-transparent border-0 cursor-pointer text-slate-400 hover:text-sky-500 transition-colors p-0"
            title="Create Agent"
          >
            <Plus size={13} />
          </button>
        </div>

        {!collapsed['AGENTS'] && (
          <div className="px-3">
            <FuncItem icon={Bot} label="Agents" to="/agents" end indent />

            {/* Dynamic agent sub-items */}
            {agents.slice(0, 5).map(agent => (
              <NavLink
                key={agent.id}
                to={`/agents/${agent.id}`}
                className={({ isActive }) => itemClass(isActive, true, true)}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: getStatusColor(agent.status) }}
                />
                <span className="truncate">{agent.name}</span>
              </NavLink>
            ))}
            {agents.length > 5 && (
              <div
                onClick={() => navigate('/agents')}
                className="py-[7px] pr-3 pl-9 text-[11px] text-slate-400 cursor-pointer hover:text-slate-600"
              >
                +{agents.length - 5} more agents...
              </div>
            )}

            <Divider />
            <FuncItem icon={FileText}       label="Agent Logs"  to="/agents/logs" indent />
            <FuncItem icon={Sliders}        label="Controls"    to="/controls"    indent />
            <FuncItem icon={FolderOpen}     label="Documents"   to="/documents"   indent />
            <FuncItem icon={LayoutTemplate} label="Templates"   to="/templates"   indent />
          </div>
        )}

      </nav>

      {/* ── Settings — pinned above user profile ─────── */}
      <div className="px-3 py-1 mb-1 shrink-0">
        <FuncItem icon={Settings} label="Settings" to="/settings" />
      </div>

      {/* ── Bottom user profile ───────────────────────── */}
      <div className="border-t border-slate-100 py-3 px-4 flex items-center gap-2.5 shrink-0 bg-slate-50/60">
        <button
          onClick={() => navigate('/profile')}
          className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#6366F1] flex items-center justify-center text-white text-[11px] font-bold shrink-0 border-0 cursor-pointer hover:opacity-90 transition-opacity"
          title="View Profile"
        >
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </button>

        <button
          onClick={() => navigate('/profile')}
          className="flex-1 min-w-0 text-left bg-transparent border-0 cursor-pointer hover:opacity-80 transition-opacity p-0"
          title="View Profile"
        >
          <div className="text-xs font-semibold text-slate-700 truncate">
            {user?.name || 'User'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {user?.org_name || 'Organization'} · {user?.role || 'User'}
          </div>
        </button>

        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-transparent border-0 cursor-pointer text-slate-300 flex items-center p-1 rounded shrink-0 hover:text-red-500 transition-colors"
          title="Log out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
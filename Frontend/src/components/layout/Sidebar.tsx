import { NavLink, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import { getAgents } from '../../features/agents/services/agents.data';
import type { Agent } from '../../features/agents/types';
import {
  LayoutDashboard, ScanLine, ShieldCheck, AlertCircle, Scan,
  FolderOpen, ClipboardList, Database, BookOpen, AlertTriangle,
  Bot, Plus, Sliders, Compass, UserCog, ExternalLink,
  Settings, LogOut, ChevronUp, ChevronDown, LayoutTemplate, FileText,
} from 'lucide-react';
import { AgentLogsPage } from '../../features/agents/pages/AgentLogPage';

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
    isActive ? 'font-semibold text-white bg-white/10' : 'font-medium text-[#8B9CC8]',
    'hover:bg-white/[0.06] hover:!text-[#C8D3F5]',
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

/* ── Non-functional plain item ───────────────────────── */
function PlainItem({ icon: Icon, label, indent = false }: {
  icon: React.ElementType; label: string; indent?: boolean;
}) {
  return (
    <div className={cn(itemClass(false, indent), 'cursor-default opacity-70')}>
      <Icon size={16} strokeWidth={1.8} className="shrink-0" />
      <span>{label}</span>
    </div>
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
      className="text-[11px] font-bold text-[#4A5680] tracking-[0.08em] px-3 pt-3 pb-1 flex justify-between items-center cursor-pointer select-none"
    >
      <span>{label}</span>
      {isCollapsed
        ? <ChevronDown size={13} color="#4A5680" />
        : <ChevronUp   size={13} color="#4A5680" />}
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────── */
function Divider() {
  return <div className="border-t border-white/[0.06] my-1" />;
}

/* ═══════════════════════════════════════════════════════ */
export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [agents, setAgents] = useState<Agent[]>([]);

  const toggle = (section: string) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  // Fetch agents on mount
  useEffect(() => {
    getAgents()
      .then(setAgents)
      .catch(err => console.error('Failed to fetch agents for sidebar:', err));
  }, []);

  // Status color mapping
  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'live': return 'bg-[#10B981]';
      case 'active': return 'bg-[#0EA5E9]';
      case 'syncing': return 'bg-[#F59E0B]';
      default: return 'bg-[#94A3B8]';
    }
  };

  return (
    <div className="w-60 bg-[#1B2236] shadow-[2px_0_12px_rgba(0,0,0,0.3)] flex flex-col h-screen fixed top-0 left-0 z-50 font-[Inter,sans-serif]">

      {/* ── Logo ─────────────────────────────────────── */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-white/[0.07] shrink-0">
        {/* Bullseye / target SVG */}
        <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
          <circle cx="13" cy="13" r="11" stroke="#38BDF8" strokeWidth="1.5"/>
          <circle cx="13" cy="13" r="6"  stroke="#38BDF8" strokeWidth="1.5"/>
          <circle cx="13" cy="13" r="2"  fill="#38BDF8"/>
          <line x1="13" y1="2"  x2="13" y2="6"  stroke="#38BDF8" strokeWidth="1.5"/>
          <line x1="13" y1="20" x2="13" y2="24" stroke="#38BDF8" strokeWidth="1.5"/>
          <line x1="2"  y1="13" x2="6"  y2="13" stroke="#38BDF8" strokeWidth="1.5"/>
          <line x1="20" y1="13" x2="24" y2="13" stroke="#38BDF8" strokeWidth="1.5"/>
        </svg>
        <span className="text-xl font-extrabold text-white tracking-[-0.02em]">
          Kyūdo
        </span>
      </div>

      {/* ── Scrollable Nav ───────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2">

        {/* 1 — Dashboard */}
        <div className="mt-3 mb-0.5 px-3">
          <FuncItem icon={LayoutDashboard} label="Dashboard" to="/" />
        </div>

        <Divider />

        {/* 2 — SECURITY SCANNER */}
        <SectionLabel label="SECURITY SCANNER" section="SECURITY_SCANNER" collapsed={collapsed} toggle={toggle} />
        {!collapsed['SECURITY_SCANNER'] && (
          <div className="px-3">
            <PlainItem icon={ScanLine}     label="Scanner Overview" indent />
            <PlainItem icon={ShieldCheck}  label="Compliance"       indent />
            <PlainItem icon={AlertCircle}  label="Findings"         indent />
            <PlainItem icon={Scan}         label="Scans"            indent />
          </div>
        )}

        <Divider />

        {/* 3 — GOVERNANCE */}
        <SectionLabel label="GOVERNANCE" section="GOVERNANCE" collapsed={collapsed} toggle={toggle} />
        {!collapsed['GOVERNANCE'] && (
          <div className="px-3">
            <PlainItem icon={ShieldCheck}   label="Controls Hub"  indent />
            <PlainItem icon={FolderOpen}    label="Evidence Hub"  indent />
            <PlainItem icon={ClipboardList} label="Assessments"   indent />
          </div>
        )}

        <Divider />

        {/* 4 — ORGANIZATION DATA FLOW */}
        <SectionLabel label="ORGANIZATION DATA FLOW" section="ORG_DATA_FLOW" collapsed={collapsed} toggle={toggle} />
        {!collapsed['ORG_DATA_FLOW'] && (
          <div className="px-3">
            <FuncItem icon={Database}      label="TPRM"        to="/tprm"        indent />
            <FuncItem icon={BookOpen}      label="Library"     to="/libraries"   indent />
            <FuncItem icon={AlertTriangle} label="Risk Threat" to="/risk-threat" indent />
          </div>
        )}

        <Divider />

        {/* 5 — AGENTS */}
        <SectionLabel label="AGENTS" section="AGENTS" collapsed={collapsed} toggle={toggle} />
        {!collapsed['AGENTS'] && (
          <div className="px-3">

            {/* Agents row with + button */}
            <div className="flex items-center justify-between mb-0.5">
              <NavLink
                to="/agents"
                end
                className={({ isActive }) => cn(
                  'flex-1 flex items-center gap-2.5 py-2 pr-2 pl-3 rounded-md text-[13px] no-underline cursor-pointer transition-all duration-150 select-none',
                  isActive ? 'font-semibold text-white bg-white/10' : 'font-medium text-[#8B9CC8]',
                  'hover:bg-white/[0.06] hover:!text-[#C8D3F5]',
                )}
              >
                <Bot size={16} strokeWidth={1.8} className="shrink-0" />
                <span>Agents</span>
              </NavLink>

              {/* + button */}
              <button
                onClick={() => navigate('/agents', { state: { openCreateModal: true } })}
                className="w-5 h-5 rounded-full bg-white/[0.08] border border-white/[0.15] text-[#8B9CC8] text-sm shrink-0 cursor-pointer flex items-center justify-center ml-1.5 p-0 hover:!bg-[rgba(56,189,248,0.2)] hover:!text-[#38BDF8]"
                title="Create Agent"
              >
                <Plus size={11} />
              </button>
            </div>

            {/* Agent sub-items: dynamically loaded */}
            {agents.slice(0, 5).map(agent => (
              <div
                key={agent.id}
                onClick={() => navigate('/agents', { state: { openAgentDetail: agent.id } })}
                className="flex items-center gap-2 py-[7px] pr-3 pl-9 rounded-md text-[12px] font-medium text-[#8B9CC8] cursor-pointer transition-all duration-150 mb-0.5 select-none hover:bg-white/[0.06] hover:!text-[#C8D3F5]"
              >
                <span className={cn('w-2 h-2 rounded-full shrink-0 inline-block', getStatusColor(agent.status))} />
                {agent.name}
              </div>
            ))}
            {agents.length > 5 && (
              <div
                onClick={() => navigate('/agents')}
                className="py-[7px] pr-3 pl-9 text-[11px] text-[#4A5680] cursor-pointer hover:text-[#8B9CC8]"
              >
                +{agents.length - 5} more agents...
              </div>
            )}
            

            {/* Controls */}
            <FuncItem icon={FileText} label="Agent Logs" to="/agents/logs" indent />
            <FuncItem icon={Sliders} label="Controls" to="/controls" indent />
            <FuncItem icon={FolderOpen} label="Documents" to="/documents" indent />
            <FuncItem icon={LayoutTemplate} label="Templates" to="/templates" indent />
          </div>
        )}

        <Divider />

        {/* 6 — POLICY */}
        <SectionLabel label="POLICY" section="POLICY" collapsed={collapsed} toggle={toggle} />
        {!collapsed['POLICY'] && (
          <div className="px-3">
            <PlainItem icon={Compass} label="PolicyPilot" indent />
            <PlainItem icon={UserCog} label="Tenant Admin" indent />

            {/* Supplier Portal — external link */}
            <a
              href="/portal/demo"
              target="_blank"
              rel="noreferrer"
              className={cn(itemClass(false, true), 'justify-start')}
            >
              <ExternalLink size={16} strokeWidth={1.8} className="shrink-0" />
              <span className="flex-1">Supplier Portal</span>
              <ExternalLink size={11} className="opacity-50 shrink-0" />
            </a>
          </div>
        )}

      </nav>

      {/* ── Settings — pinned above user profile ─────── */}
      <div className="px-3 py-1 mb-1 shrink-0">
        <FuncItem icon={Settings} label="Settings" to="/settings" />
      </div>

      {/* ── Bottom user profile ───────────────────────── */}
      <div className="border-t border-white/[0.07] py-3 px-4 flex items-center gap-2.5 shrink-0">
        {/* Avatar with gradient */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#6366F1] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </div>

        {/* Name + role */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-[#C8D3F5] truncate">
            {user?.name || 'User'}
          </div>
          <div className="text-[11px] text-[#4A5680]">{user?.role || 'Guest'}</div>
        </div>

        {/* Logout */}
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="bg-transparent border-0 cursor-pointer text-[#4A5680] flex items-center p-1 rounded shrink-0 hover:!text-[#EF4444]"
          title="Log out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}

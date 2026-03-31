import { NavLink, useNavigate } from 'react-router';
import { useState } from 'react';
import { cn } from '../../lib/utils';
import { useAuthStore } from '../../stores/authStore';
import {
  LayoutDashboard, ScanLine, ShieldCheck, AlertCircle, Scan,
  Database, BookOpen, AlertTriangle, ClipboardList,
  Settings, LogOut, ChevronUp, ChevronDown,
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

/* ── Non-functional plain item ───────────────────────── */
function PlainItem({ icon: Icon, label, indent = false }: {
  icon: React.ElementType; label: string; indent?: boolean;
}) {
  return (
    <div className={cn(itemClass(false, indent), 'cursor-default opacity-60')}>
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

export function Sidebar() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const toggle = (section: string) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <div className="w-60 bg-white border-r border-slate-200 shadow-sm flex flex-col h-screen fixed top-0 left-0 z-50 font-[Inter,sans-serif]">

      {/* ── Logo ─────────────────────────────────────── */}
      <div className="h-16 px-5 flex items-center gap-2.5 border-b border-slate-100 shrink-0">
        {/* Sky-blue rounded square icon */}
        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
          <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
            <circle cx="13" cy="13" r="9" stroke="white" strokeWidth="2"/>
            <circle cx="13" cy="13" r="4" stroke="white" strokeWidth="2"/>
            <circle cx="13" cy="13" r="1.5" fill="white"/>
          </svg>
        </div>
        <span className="text-xl font-extrabold text-slate-900 tracking-[-0.02em]">
          Kyūdo
        </span>
        <span className="text-[10px] font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
          v2
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

        {/* 3 — ORGANIZATION DATA FLOW */}
        <SectionLabel label="ORGANIZATION DATA FLOW" section="ORG_DATA_FLOW" collapsed={collapsed} toggle={toggle} />
        {!collapsed['ORG_DATA_FLOW'] && (
          <div className="px-3">
            <FuncItem icon={Database}      label="TPRM"        to="/tprm"        indent />
            <FuncItem icon={BookOpen}      label="Library"     to="/libraries"   indent />
            <FuncItem icon={AlertTriangle} label="Risk Threat" to="/risk-threat" indent />
            <PlainItem icon={ClipboardList} label="Assessments" indent />
          </div>
        )}

      </nav>

      {/* ── Settings — pinned above user profile ─────── */}
      <div className="px-3 py-1 mb-1 shrink-0">
        <FuncItem icon={Settings} label="Settings" to="/settings" />
      </div>

      {/* ── Bottom user profile ───────────────────────── */}
      <div className="border-t border-slate-100 py-3 px-4 flex items-center gap-2.5 shrink-0 bg-slate-50/60">
        {/* Avatar with gradient */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0EA5E9] to-[#6366F1] flex items-center justify-center text-white text-[11px] font-bold shrink-0">
          {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
        </div>

        {/* Name + org */}
        <div className="flex-1 min-w-0">
          <div className="text-xs font-semibold text-slate-700 truncate">
            {user?.name || 'User'}
          </div>
          <div className="text-[11px] text-slate-400 truncate">
            {user?.org_name || 'Organization'} · {user?.role || 'User'}
          </div>
        </div>

        {/* Logout */}
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

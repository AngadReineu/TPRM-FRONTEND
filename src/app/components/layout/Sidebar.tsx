import { NavLink, useNavigate } from 'react-router';
import { useState } from 'react';
import {
  LayoutDashboard, ScanLine, ShieldCheck, AlertCircle, Scan,
  FolderOpen, ClipboardList, Database, BookOpen, AlertTriangle,
  Bot, Plus, Sliders, Compass, UserCog, ExternalLink,
  Settings, LogOut, ChevronUp, ChevronDown, LayoutTemplate,
} from 'lucide-react';

/* ── Shared style constants ──────────────────────────── */
const BG            = '#1B2236';
const ITEM_CLR      = '#8B9CC8';
const ITEM_ACTIVE   = '#FFFFFF';
const ACTIVE_BG     = 'rgba(255,255,255,0.10)';
const SECTION_CLR   = '#4A5680';
const DIVIDER       = 'rgba(255,255,255,0.06)';

/* ── Base item style (shared) ────────────────────────── */
const itemBase = (isActive = false, indent = false, sub = false): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  padding: sub ? `7px 12px 7px ${indent ? 36 : 28}px` : `8px 12px 8px ${indent ? 28 : 12}px`,
  borderRadius: 6,
  fontSize: sub ? 12 : 13,
  fontWeight: isActive ? 600 : 500,
  color: isActive ? ITEM_ACTIVE : ITEM_CLR,
  backgroundColor: isActive ? ACTIVE_BG : 'transparent',
  textDecoration: 'none',
  cursor: 'pointer',
  transition: 'all 0.15s',
  marginBottom: 2,
  userSelect: 'none' as const,
});

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
      style={({ isActive }) => itemBase(isActive, indent, sub)}
      className="hover:bg-white/[0.06] hover:!text-[#C8D3F5]"
    >
      <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
      <span>{label}</span>
    </NavLink>
  );
}

/* ── Non-functional plain item ───────────────────────── */
function PlainItem({ icon: Icon, label, indent = false }: {
  icon: React.ElementType; label: string; indent?: boolean;
}) {
  return (
    <div style={{ ...itemBase(false, indent), cursor: 'default', opacity: 0.7 }}>
      <Icon size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
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
      style={{
        fontSize: 11, fontWeight: 700, color: SECTION_CLR,
        letterSpacing: '0.08em', padding: '12px 12px 4px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        cursor: 'pointer', userSelect: 'none',
      }}
    >
      <span>{label}</span>
      {isCollapsed
        ? <ChevronDown size={13} color={SECTION_CLR} />
        : <ChevronUp   size={13} color={SECTION_CLR} />}
    </div>
  );
}

/* ── Divider ─────────────────────────────────────────── */
function Divider() {
  return <div style={{ borderTop: `1px solid ${DIVIDER}`, margin: '4px 0' }} />;
}

/* ═══════════════════════════════════════════════════════ */
export function Sidebar() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const toggle = (section: string) =>
    setCollapsed(prev => ({ ...prev, [section]: !prev[section] }));

  return (
    <div style={{
      width: 240, backgroundColor: BG, boxShadow: '2px 0 12px rgba(0,0,0,0.3)',
      display: 'flex', flexDirection: 'column', height: '100vh',
      position: 'fixed', top: 0, left: 0, zIndex: 50,
      fontFamily: 'Inter, sans-serif',
    }}>

      {/* ── Logo ─────────────────────────────────────── */}
      <div style={{
        height: 64, padding: '0 20px', display: 'flex', alignItems: 'center', gap: 10,
        borderBottom: `1px solid rgba(255,255,255,0.07)`, flexShrink: 0,
      }}>
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
        <span style={{ fontSize: 20, fontWeight: 800, color: '#FFFFFF', letterSpacing: '-0.02em' }}>
          Ky<span style={{ fontFamily: 'inherit' }}>ū</span>do
        </span>
      </div>

      {/* ── Scrollable Nav ───────────────────────────── */}
      <nav style={{ flex: 1, overflowY: 'auto', padding: '8px 0' }}>

        {/* 1 — Dashboard */}
        <div style={{ marginTop: 12, marginBottom: 2, padding: '0 12px' }}>
          <FuncItem icon={LayoutDashboard} label="Dashboard" to="/" />
        </div>

        <Divider />

        {/* 2 — SECURITY SCANNER */}
        <SectionLabel label="SECURITY SCANNER" section="SECURITY_SCANNER" collapsed={collapsed} toggle={toggle} />
        {!collapsed['SECURITY_SCANNER'] && (
          <div style={{ padding: '0 12px' }}>
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
          <div style={{ padding: '0 12px' }}>
            <PlainItem icon={ShieldCheck}   label="Controls Hub"  indent />
            <PlainItem icon={FolderOpen}    label="Evidence Hub"  indent />
            <PlainItem icon={ClipboardList} label="Assessments"   indent />
          </div>
        )}

        <Divider />

        {/* 4 — ORGANIZATION DATA FLOW */}
        <SectionLabel label="ORGANIZATION DATA FLOW" section="ORG_DATA_FLOW" collapsed={collapsed} toggle={toggle} />
        {!collapsed['ORG_DATA_FLOW'] && (
          <div style={{ padding: '0 12px' }}>
            <FuncItem icon={Database}      label="TPRM"        to="/tprm"        indent />
            <FuncItem icon={BookOpen}      label="Library"     to="/libraries"   indent />
            <FuncItem icon={AlertTriangle} label="Risk Threat" to="/risk-threat" indent />
          </div>
        )}

        <Divider />

        {/* 5 — AGENTS */}
        <SectionLabel label="AGENTS" section="AGENTS" collapsed={collapsed} toggle={toggle} />
        {!collapsed['AGENTS'] && (
          <div style={{ padding: '0 12px' }}>

            {/* Agents row with + button */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingRight: 0, marginBottom: 2 }}>
              <NavLink
                to="/agents"
                end
                style={({ isActive }) => ({
                  flex: 1,
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '8px 8px 8px 12px',
                  borderRadius: 6, fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? ITEM_ACTIVE : ITEM_CLR,
                  backgroundColor: isActive ? ACTIVE_BG : 'transparent',
                  textDecoration: 'none', cursor: 'pointer',
                  transition: 'all 0.15s', userSelect: 'none',
                })}
                className="hover:bg-white/[0.06] hover:!text-[#C8D3F5]"
              >
                <Bot size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
                <span>Agents</span>
              </NavLink>

              {/* + button */}
              <button
                onClick={() => navigate('/agents', { state: { openCreateModal: true } })}
                style={{
                  width: 20, height: 20, borderRadius: '50%',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: ITEM_CLR, fontSize: 14, flexShrink: 0,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  marginLeft: 6, padding: 0,
                }}
                className="hover:!bg-[rgba(56,189,248,0.2)] hover:!text-[#38BDF8]"
                title="Create Agent"
              >
                <Plus size={11} />
              </button>
            </div>

            {/* Agent sub-items: A1, A2, A3 */}
            {[
              { label: 'Agent A1', dot: '#0EA5E9', id: 'a1' },
              { label: 'Agent A2', dot: '#10B981', id: 'a2' },
              { label: 'Agent A3', dot: '#8B5CF6', id: 'a3' },
            ].map(a => (
              <div
                key={a.id}
                onClick={() => navigate('/agents', { state: { openAgentDetail: a.id } })}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '7px 12px 7px 36px',
                  borderRadius: 6, fontSize: 12, fontWeight: 500,
                  color: ITEM_CLR, cursor: 'pointer',
                  transition: 'all 0.15s', userSelect: 'none',
                  marginBottom: 2,
                }}
                className="hover:bg-white/[0.06] hover:!text-[#C8D3F5]"
              >
                <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: a.dot, flexShrink: 0, display: 'inline-block' }} />
                {a.label}
              </div>
            ))}

            {/* Controls */}
            <FuncItem icon={Sliders} label="Controls" to="/controls" indent />
            <FuncItem icon={LayoutTemplate} label="Templates" to="/templates" indent />
          </div>
        )}

        <Divider />

        {/* 6 — POLICY */}
        <SectionLabel label="POLICY" section="POLICY" collapsed={collapsed} toggle={toggle} />
        {!collapsed['POLICY'] && (
          <div style={{ padding: '0 12px' }}>
            <PlainItem icon={Compass} label="PolicyPilot" indent />
            <PlainItem icon={UserCog} label="Tenant Admin" indent />

            {/* Supplier Portal — external link */}
            <a
              href="#"
              target="_blank"
              rel="noreferrer"
              style={{
                ...itemBase(false, true),
                opacity: 1,
                justifyContent: 'flex-start',
              }}
              className="hover:bg-white/[0.06] hover:!text-[#C8D3F5]"
            >
              <ExternalLink size={16} strokeWidth={1.8} style={{ flexShrink: 0 }} />
              <span style={{ flex: 1 }}>Supplier Portal</span>
              <ExternalLink size={11} style={{ opacity: 0.5, flexShrink: 0 }} />
            </a>
          </div>
        )}

      </nav>

      {/* ── Settings — pinned above user profile ─────── */}
      <div style={{ padding: '4px 12px', marginBottom: 4, flexShrink: 0 }}>
        <FuncItem icon={Settings} label="Settings" to="/settings" />
      </div>

      {/* ── Bottom user profile ───────────────────────── */}
      <div style={{
        borderTop: `1px solid rgba(255,255,255,0.07)`,
        padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: 10,
        flexShrink: 0,
      }}>
        {/* Avatar with gradient */}
        <div style={{
          width: 32, height: 32, borderRadius: '50%',
          background: 'linear-gradient(135deg, #0EA5E9, #6366F1)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: 11, fontWeight: 700, flexShrink: 0,
        }}>
          PS
        </div>

        {/* Name + role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#C8D3F5', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            Priya Sharma
          </div>
          <div style={{ fontSize: 11, color: SECTION_CLR }}>Risk Manager</div>
        </div>

        {/* Logout */}
        <button
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: SECTION_CLR, display: 'flex', alignItems: 'center', padding: 4, borderRadius: 4, flexShrink: 0 }}
          className="hover:!text-[#EF4444]"
          title="Log out"
        >
          <LogOut size={14} />
        </button>
      </div>
    </div>
  );
}
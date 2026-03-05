import { useState } from 'react';
import {
  Search, SlidersHorizontal, Plus, Eye, Pencil, Play,
  MoveUpRight, MoveDownLeft, Repeat2, ShieldCheck,
  Handshake, Truck, Scale,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

/* ── Types ───────────────────────────────────────────── */
type Category    = 'Technical' | 'Process' | 'Document' | 'Expected Res.';
type Risk        = 'Critical' | 'High' | 'Medium' | 'Low';
type PiiFlow     = 'share' | 'ingest' | 'both';
type Personality = 'Consulting' | 'Operations' | 'Security' | 'Regulatory';

interface Control {
  id: string;
  name: string;
  desc: string;
  category: Category;
  active: boolean;
  coverage: number;
  scope: string;
  risk: Risk;
  lastEval: string;
  deps: number;
  internalSPOC?: string;
  externalSPOC?: string;
  piiFlow?: PiiFlow;
  truthValidator?: boolean;
  hasTruthGap?: boolean;
  personality?: Personality;
}

/* ── Mock Data ───────────────────────────────────────── */
const CONTROLS: Control[] = [

  /* ══ PROCESS CONTROLS (10) ══ */
  {
    id: 'p1', name: 'SLA Adherence Policy', desc: 'Monitor supplier uptime vs contracted SLA thresholds',
    category: 'Process', active: true, coverage: 91, scope: 'Full', risk: 'High', lastEval: '8 min ago', deps: 2,
    internalSPOC: 'raj@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: true, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p2', name: 'Invoice Approval Workflow', desc: 'Verify every payment has a corresponding approved PO',
    category: 'Process', active: true, coverage: 78, scope: 'Partial', risk: 'Critical', lastEval: '15 min ago', deps: 3,
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Consulting',
  },
  {
    id: 'p3', name: 'Supplier Onboarding Checklist', desc: 'Ensure all onboarding items completed before go-live',
    category: 'Process', active: true, coverage: 62, scope: 'Partial', risk: 'High', lastEval: '30 min ago', deps: 1,
    internalSPOC: 'raj@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p4', name: 'Contractual Obligation Review', desc: 'Track active obligations and flag overdue deliverables',
    category: 'Process', active: true, coverage: 85, scope: 'Full', risk: 'Critical', lastEval: '2 min ago', deps: 4,
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Consulting',
  },
  {
    id: 'p5', name: 'Access Revocation on Exit', desc: 'Remove all access within 24hrs of supplier staff offboarding',
    category: 'Process', active: true, coverage: 88, scope: 'Full', risk: 'High', lastEval: '1 hr ago', deps: 2,
    internalSPOC: 'anita@abc.co', externalSPOC: 'info@def.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Security',
  },
  {
    id: 'p6', name: 'Third-Party Risk Assessment', desc: 'Annual TPRA due date monitoring and escalation',
    category: 'Process', active: true, coverage: 74, scope: 'Partial', risk: 'High', lastEval: '45 min ago', deps: 2,
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'p7', name: 'Patch Management SLA', desc: 'OS patching within 30-day SLA window',
    category: 'Process', active: false, coverage: 72, scope: 'Partial', risk: 'Medium', lastEval: '2 hrs ago', deps: 2,
    internalSPOC: 'raj@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p8', name: 'Quarterly Access Review', desc: 'Review all active user accounts every 90 days',
    category: 'Process', active: true, coverage: 88, scope: 'Full', risk: 'Medium', lastEval: '1 hr ago', deps: 1,
    internalSPOC: 'raj@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'p9', name: 'Escalation Response Time', desc: 'Critical alerts must be acknowledged within 2 hours',
    category: 'Process', active: true, coverage: 94, scope: 'Full', risk: 'Critical', lastEval: '5 min ago', deps: 3,
    internalSPOC: 'anita@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'both', truthValidator: true, hasTruthGap: false, personality: 'Operations',
  },
  {
    id: 'p10', name: 'Change Management Process', desc: 'All system changes require approved change request',
    category: 'Process', active: true, coverage: 81, scope: 'Full', risk: 'Medium', lastEval: '3 hrs ago', deps: 2,
    internalSPOC: 'raj@abc.co', externalSPOC: 'info@def.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },

  /* ══ DOCUMENT CONTROLS (8) ══ */
  {
    id: 'd1', name: 'SOW Signature Verification', desc: 'SOW must be signed before service delivery commences',
    category: 'Document', active: true, coverage: 83, scope: 'Full', risk: 'Critical', lastEval: '10 min ago', deps: 3,
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Consulting',
  },
  {
    id: 'd2', name: 'ISO 27001 Certificate Review', desc: 'Track cert validity and trigger renewal 30 days before expiry',
    category: 'Document', active: true, coverage: 91, scope: 'Full', risk: 'High', lastEval: '20 min ago', deps: 1,
    internalSPOC: 'anita@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Regulatory',
  },
  {
    id: 'd3', name: 'Data Processing Agreement (DPA)', desc: 'GDPR Art. 28 DPA in place with all data processors',
    category: 'Document', active: true, coverage: 76, scope: 'Partial', risk: 'Critical', lastEval: '35 min ago', deps: 2,
    internalSPOC: 'priya@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'both', truthValidator: true, hasTruthGap: true, personality: 'Regulatory',
  },
  {
    id: 'd4', name: 'NDA Compliance Check', desc: 'Verify NDA signed and within validity period',
    category: 'Document', active: true, coverage: 95, scope: 'Full', risk: 'Medium', lastEval: '1 hr ago', deps: 0,
    internalSPOC: 'raj@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: false, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'd5', name: 'Incident Response Plan', desc: 'IR runbooks documented and reviewed every 6 months',
    category: 'Document', active: true, coverage: 85, scope: 'Full', risk: 'Critical', lastEval: '3 hrs ago', deps: 5,
    internalSPOC: 'raj@abc.co', externalSPOC: 'info@def.com',
    piiFlow: 'share', truthValidator: false, hasTruthGap: false, personality: 'Regulatory',
  },
  {
    id: 'd6', name: 'Data Classification Policy', desc: 'All data assets classified per sensitivity tier',
    category: 'Document', active: true, coverage: 91, scope: 'Full', risk: 'Low', lastEval: '45 min ago', deps: 0,
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'both', truthValidator: true, hasTruthGap: false, personality: 'Regulatory',
  },
  {
    id: 'd7', name: 'Audit Report Review', desc: 'Review and sign off on supplier audit reports quarterly',
    category: 'Document', active: true, coverage: 68, scope: 'Partial', risk: 'High', lastEval: '2 hrs ago', deps: 1,
    internalSPOC: 'anita@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: true, hasTruthGap: false, personality: 'Consulting',
  },
  {
    id: 'd8', name: 'Policy Acknowledgement Tracker', desc: 'All staff and suppliers acknowledge security policies annually',
    category: 'Document', active: false, coverage: 58, scope: 'Sparse', risk: 'Medium', lastEval: '4 hrs ago', deps: 0,
    internalSPOC: 'raj@abc.co', externalSPOC: 'info@def.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Regulatory',
  },

  /* ══ TECHNICAL CONTROLS (4) ══ */
  {
    id: 't1', name: 'MFA Enforcement', desc: 'Multi-factor auth on all admin accounts',
    category: 'Technical', active: true, coverage: 94, scope: 'Full', risk: 'Critical', lastEval: '2 min ago', deps: 3,
    internalSPOC: 'priya@abc.co', externalSPOC: 'john@xyz.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Security',
  },
  {
    id: 't2', name: 'Network Segmentation', desc: 'VLAN isolation prod vs staging environments',
    category: 'Technical', active: true, coverage: 45, scope: 'Sparse', risk: 'High', lastEval: '30 min ago', deps: 4,
    internalSPOC: 'anita@abc.co', externalSPOC: 'info@def.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: true, personality: 'Security',
  },
  {
    id: 't3', name: 'Vulnerability Scanning', desc: 'Automated weekly asset vulnerability assessments',
    category: 'Technical', active: true, coverage: 78, scope: 'Full', risk: 'Medium', lastEval: '20 min ago', deps: 2,
    internalSPOC: 'anita@abc.co', externalSPOC: 'info@def.com',
    piiFlow: 'share', truthValidator: true, hasTruthGap: false, personality: 'Security',
  },
  {
    id: 't4', name: 'Backup Verification', desc: 'Weekly backup integrity test and restoration drill',
    category: 'Expected Res.', active: true, coverage: 56, scope: 'Partial', risk: 'High', lastEval: '1 hr ago', deps: 1,
    internalSPOC: 'priya@abc.co', externalSPOC: 'ops@abc.com',
    piiFlow: 'ingest', truthValidator: false, hasTruthGap: false, personality: 'Operations',
  },
];

/* ── Table styles ────────────────────────────────────── */
const thStyle: React.CSSProperties = {
  padding: '10px 14px',
  fontSize: 11, fontWeight: 600,
  color: '#64748B',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  backgroundColor: '#F8FAFC',
};
const tdStyle: React.CSSProperties = {
  padding: '11px 14px',
  fontSize: 14, color: '#334155',
  verticalAlign: 'middle',
};

/* ── Sub-components ──────────────────────────────────── */
function CategoryBadge({ cat }: { cat: Category }) {
  const map: Record<Category, [string, string]> = {
    Process:        ['#ECFDF5', '#10B981'],
    Document:       ['#F5F3FF', '#8B5CF6'],
    Technical:      ['#EFF6FF', '#0EA5E9'],
    'Expected Res.':['#FFFBEB', '#F59E0B'],
  };
  const [bg, text] = map[cat];
  return (
    <span style={{ backgroundColor: bg, color: text, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 6, whiteSpace: 'nowrap' as const }}>
      {cat}
    </span>
  );
}

function RiskBadge({ risk }: { risk: Risk }) {
  const map: Record<Risk, [string, string]> = {
    Critical: ['#FEF2F2', '#EF4444'],
    High:     ['#FFFBEB', '#F59E0B'],
    Medium:   ['#F1F5F9', '#64748B'],
    Low:      ['#ECFDF5', '#10B981'],
  };
  const [bg, text] = map[risk];
  return (
    <span style={{ backgroundColor: bg, color: text, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 6 }}>
      {risk}
    </span>
  );
}

function CoverageBar({ value }: { value: number }) {
  const color = value >= 80 ? '#10B981' : value >= 50 ? '#F59E0B' : '#EF4444';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ height: 6, backgroundColor: '#E2E8F0', borderRadius: 99, width: 64, flexShrink: 0 }}>
        <div style={{ height: 6, width: `${value}%`, backgroundColor: color, borderRadius: 99 }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color }}>{value}%</span>
    </div>
  );
}

function Toggle({ on, onToggle }: { on: boolean; onToggle: () => void }) {
  return (
    <div
      onClick={onToggle}
      style={{
        width: 36, height: 20, borderRadius: 99,
        backgroundColor: on ? '#0EA5E9' : '#CBD5E1',
        position: 'relative', cursor: 'pointer', flexShrink: 0,
      }}
    >
      <div style={{
        position: 'absolute',
        top: 2, left: on ? 18 : 2,
        width: 16, height: 16, borderRadius: '50%',
        backgroundColor: '#fff',
        transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </div>
  );
}

const PERSONALITY_MAP: Record<Personality, { Icon: React.ElementType; color: string; bg: string }> = {
  Consulting: { Icon: Handshake,   color: '#0EA5E9', bg: '#EFF6FF' },
  Operations: { Icon: Truck,       color: '#10B981', bg: '#ECFDF5' },
  Security:   { Icon: ShieldCheck, color: '#8B5CF6', bg: '#F5F3FF' },
  Regulatory: { Icon: Scale,       color: '#F59E0B', bg: '#FFFBEB' },
};

function PersonalityBadge({ p }: { p?: Personality }) {
  if (!p) return <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>;
  const { Icon, color, bg } = PERSONALITY_MAP[p];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      backgroundColor: bg, color,
      fontSize: 11, fontWeight: 600,
      padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap',
    }}>
      <Icon size={10} />
      {p}
    </span>
  );
}

function RelationalContext({ internal, external }: { internal?: string; external?: string }) {
  const [hovered, setHovered] = useState(false);
  if (!internal && !external) return <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>;
  const initials = (email?: string) => email ? email.split('@')[0].slice(0, 2).toUpperCase() : '??';
  const AVATAR_COLORS: [string, string][] = [
    ['linear-gradient(135deg,#0EA5E9,#6366F1)', '#fff'],
    ['linear-gradient(135deg,#8B5CF6,#EC4899)', '#fff'],
  ];
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        {[internal, external].map((email, i) =>
          email ? (
            <div key={i} style={{ width: 26, height: 26, borderRadius: '50%', background: AVATAR_COLORS[i][0], color: AVATAR_COLORS[i][1], fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #fff', marginLeft: i > 0 ? -8 : 0, flexShrink: 0, zIndex: 2 - i, cursor: 'default' }}>
              {initials(email)}
            </div>
          ) : null
        )}
      </div>
      {hovered && (
        <div style={{ position: 'absolute', top: 'calc(100% + 6px)', left: 0, zIndex: 50, backgroundColor: '#0F172A', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12, lineHeight: 1.6, whiteSpace: 'nowrap', boxShadow: '0 4px 16px rgba(0,0,0,0.2)', pointerEvents: 'none' }}>
          {internal && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}>INT</span><span style={{ color: '#93C5FD' }}>{internal}</span></div>}
          {external && <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}><span style={{ color: '#94A3B8', fontSize: 10, fontWeight: 600, letterSpacing: '0.04em' }}>EXT</span><span style={{ color: '#86EFAC' }}>{external}</span></div>}
          <div style={{ position: 'absolute', top: -5, left: 10, width: 10, height: 10, backgroundColor: '#0F172A', transform: 'rotate(45deg)' }} />
        </div>
      )}
    </div>
  );
}

function PiiFlowCell({ flow }: { flow?: PiiFlow }) {
  if (!flow) return <span style={{ fontSize: 12, color: '#CBD5E1' }}>—</span>;
  const MAP = {
    share:  { Icon: MoveUpRight,  color: '#0EA5E9', bg: '#EFF6FF', label: 'Share'  },
    ingest: { Icon: MoveDownLeft, color: '#10B981', bg: '#ECFDF5', label: 'Ingest' },
    both:   { Icon: Repeat2,      color: '#8B5CF6', bg: '#F5F3FF', label: 'Both'   },
  };
  const { Icon, color, bg, label } = MAP[flow];
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: bg, color, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
      <Icon size={11} />{label}
    </span>
  );
}

function TruthMatchCell({ validator, gap }: { validator?: boolean; gap?: boolean }) {
  if (!validator) return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#CBD5E1' }}>
      <ShieldCheck size={14} color="#E2E8F0" />
      <span style={{ fontSize: 11, color: '#CBD5E1' }}>N/A</span>
    </span>
  );
  const color = gap ? '#EF4444' : '#10B981';
  const bg    = gap ? '#FEF2F2' : '#ECFDF5';
  const label = gap ? 'Gap Detected' : 'Validated';
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, backgroundColor: bg, color, fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 6 }}>
      <ShieldCheck size={11} />{label}
    </span>
  );
}

/* ═══════════════════════════════════════════════════════ */
export function Controls() {
  const navigate = useNavigate();

  // Primary tab order: Process → Document → Technical
  const [primaryTab, setPrimaryTab] = useState<'Process' | 'Document' | 'Technical'>('Process');
  const [search, setSearch]                       = useState('');
  const [catFilter, setCatFilter]                 = useState<string>('All');
  const [personalityFilter, setPersonalityFilter] = useState<string>('All');
  const [activeToggles, setActiveToggles]         = useState<Record<string, boolean>>(
    Object.fromEntries(CONTROLS.map(c => [c.id, c.active]))
  );

  const tabCategories: Record<string, Category[]> = {
    Process:   ['Process'],
    Document:  ['Document'],
    Technical: ['Technical', 'Expected Res.'],
  };

  const filtered = CONTROLS.filter(c => {
    const matchSearch      = c.name.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat         = catFilter === 'All' || c.category === catFilter;
    const matchPersonality = personalityFilter === 'All' || c.personality === personalityFilter;
    const matchTab         = tabCategories[primaryTab].includes(c.category);
    return matchSearch && matchCat && matchPersonality && matchTab;
  });

  const truthGapCount  = CONTROLS.filter(c => c.hasTruthGap).length;
  const validatorCount = CONTROLS.filter(c => c.truthValidator).length;

  // Tab config — Process first, Document second, Technical third
  const TABS: { id: 'Process' | 'Document' | 'Technical'; label: string; icon: string; activeColor: string; count: number }[] = [
    { id: 'Process',   label: 'Process Controls',   icon: '⟳', activeColor: '#10B981', count: CONTROLS.filter(c => c.category === 'Process').length },
    { id: 'Document',  label: 'Document Controls',  icon: '📄', activeColor: '#8B5CF6', count: CONTROLS.filter(c => c.category === 'Document').length },
    { id: 'Technical', label: 'Technical Controls', icon: '⬡', activeColor: '#0EA5E9', count: CONTROLS.filter(c => ['Technical','Expected Res.'].includes(c.category)).length },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Controls</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>
            {CONTROLS.length} controls · {validatorCount} truth validators ·{' '}
            {truthGapCount > 0
              ? <span style={{ color: '#EF4444', fontWeight: 600 }}>{truthGapCount} gap{truthGapCount > 1 ? 's' : ''} detected</span>
              : <span style={{ color: '#10B981', fontWeight: 600 }}>all clear</span>
            }
          </p>
        </div>
        <button
          onClick={() => navigate('/controls/create')}
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          className="hover:bg-[#0284C7]"
        >
          <Plus size={16} />
          Create Control
        </button>
      </div>

      {/* Intelligence Summary Strip */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Consulting Audits',   value: CONTROLS.filter(c => c.personality === 'Consulting').length,  color: '#0EA5E9', bg: '#EFF6FF', Icon: Handshake  },
          { label: 'Operations Checks',   value: CONTROLS.filter(c => c.personality === 'Operations').length,  color: '#10B981', bg: '#ECFDF5', Icon: Truck       },
          { label: 'Security Validators', value: CONTROLS.filter(c => c.personality === 'Security').length,    color: '#8B5CF6', bg: '#F5F3FF', Icon: ShieldCheck },
          { label: 'Regulatory Monitors', value: CONTROLS.filter(c => c.personality === 'Regulatory').length,  color: '#F59E0B', bg: '#FFFBEB', Icon: Scale       },
        ].map(({ label, value, color, bg, Icon }) => (
          <div key={label} style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 12, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon size={18} color={color} />
            </div>
            <div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0F172A', lineHeight: 1 }}>{value}</div>
              <div style={{ fontSize: 12, color: '#64748B', marginTop: 2 }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Primary Tabs: Process → Document → Technical ── */}
      <div style={{ display: 'flex', gap: 0, backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 10, padding: 4, alignSelf: 'flex-start' }}>
        {TABS.map(tab => {
          const sel = primaryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => { setPrimaryTab(tab.id); setCatFilter('All'); }}
              style={{
                padding: '8px 20px', borderRadius: 7, fontSize: 13,
                fontWeight: sel ? 700 : 500, cursor: 'pointer', border: 'none',
                backgroundColor: sel ? tab.activeColor : 'transparent',
                color: sel ? '#fff' : '#64748B',
                transition: 'all 0.15s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span style={{
                fontSize: 10, fontWeight: 700,
                backgroundColor: sel ? 'rgba(255,255,255,0.25)' : '#F1F5F9',
                color: sel ? '#fff' : '#94A3B8',
                padding: '1px 7px', borderRadius: 20,
              }}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
          <Search size={16} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search controls..."
            style={{ width: '100%', boxSizing: 'border-box', paddingLeft: 36, paddingRight: 16, paddingTop: 9, paddingBottom: 9, fontSize: 14, color: '#334155', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none' }}
          />
        </div>

        {/* Category filter pills — ordered Process, Document, Technical */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['All', 'Process', 'Document', 'Technical', 'Expected Res.'].map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              style={{
                padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                backgroundColor: catFilter === cat ? '#0EA5E9' : '#fff',
                color: catFilter === cat ? '#fff' : '#64748B',
                border: `1px solid ${catFilter === cat ? '#0EA5E9' : '#E2E8F0'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Personality filter pills */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {(['All', 'Consulting', 'Operations', 'Security', 'Regulatory'] as const).map(p => {
            const sel = personalityFilter === p;
            const colors: Record<string, string> = { Consulting: '#0EA5E9', Operations: '#10B981', Security: '#8B5CF6', Regulatory: '#F59E0B', All: '#64748B' };
            return (
              <button
                key={p}
                onClick={() => setPersonalityFilter(p)}
                style={{
                  padding: '7px 12px', borderRadius: 8, fontSize: 12, fontWeight: 500, cursor: 'pointer',
                  backgroundColor: sel ? colors[p] + '18' : '#fff',
                  color: sel ? colors[p] : '#64748B',
                  border: `1px solid ${sel ? colors[p] : '#E2E8F0'}`,
                }}
              >
                {p}
              </button>
            );
          })}
        </div>

        <button style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, padding: '9px 14px', fontSize: 13, fontWeight: 500, color: '#334155', cursor: 'pointer' }}>
          <SlidersHorizontal size={14} />
          More Filters
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 1100 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                <th style={thStyle}>Control Name</th>
                <th style={{ ...thStyle, color: '#8B5CF6' }}>Personality</th>
                <th style={{ ...thStyle, color: '#0EA5E9' }}>Relational Context</th>
                <th style={thStyle}>Category</th>
                <th style={{ ...thStyle, color: '#0EA5E9' }}>PII Flow</th>
                <th style={{ ...thStyle, color: '#10B981' }}>Truth Match</th>
                <th style={thStyle}>Active</th>
                <th style={thStyle}>Coverage</th>
                <th style={thStyle}>Risk</th>
                <th style={thStyle}>Last Evaluated</th>
                <th style={thStyle}>Deps</th>
                <th style={thStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }}
                  className="hover:bg-[#F8FAFC]"
                >
                  <td style={tdStyle}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{c.name}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{c.desc}</div>
                  </td>
                  <td style={tdStyle}><PersonalityBadge p={c.personality} /></td>
                  <td style={tdStyle}><RelationalContext internal={c.internalSPOC} external={c.externalSPOC} /></td>
                  <td style={tdStyle}><CategoryBadge cat={c.category} /></td>
                  <td style={tdStyle}><PiiFlowCell flow={c.piiFlow} /></td>
                  <td style={tdStyle}><TruthMatchCell validator={c.truthValidator} gap={c.hasTruthGap} /></td>
                  <td style={tdStyle}>
                    <Toggle
                      on={activeToggles[c.id]}
                      onToggle={() => {
                        const next = !activeToggles[c.id];
                        setActiveToggles(prev => ({ ...prev, [c.id]: next }));
                        toast.success(`${c.name} ${next ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </td>
                  <td style={tdStyle}><CoverageBar value={c.coverage} /></td>
                  <td style={tdStyle}><RiskBadge risk={c.risk} /></td>
                  <td style={tdStyle}><span style={{ fontSize: 12, color: '#94A3B8' }}>{c.lastEval}</span></td>
                  <td style={tdStyle}>
                    <span style={{ fontSize: 13, color: '#64748B', backgroundColor: '#F1F5F9', padding: '2px 8px', borderRadius: 6 }}>{c.deps}</span>
                  </td>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', gap: 2 }}>
                      {[{ Icon: Eye, title: 'View' }, { Icon: Pencil, title: 'Edit' }, { Icon: Play, title: 'Run' }].map(({ Icon, title }) => (
                        <button
                          key={title}
                          title={title}
                          onClick={() => toast(`${title}: ${c.name}`)}
                          style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                          className="hover:text-[#0EA5E9] hover:bg-[#EFF6FF]"
                        >
                          <Icon size={14} />
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={12} style={{ ...tdStyle, textAlign: 'center', padding: 40, color: '#94A3B8' }}>
                    No controls match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>
            Showing {filtered.length} of {CONTROLS.length} controls
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Prev', 'Next'].map(label => (
              <button key={label} style={{ fontSize: 13, color: '#64748B', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{`@keyframes ping { 0%,100%{opacity:1} 50%{opacity:0.3} }`}</style>
    </div>
  );
}
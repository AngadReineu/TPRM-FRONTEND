import { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Eye,
  Pencil,
  Play,
  Handshake,
  Truck,
  ShieldCheck,
  Scale,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

import type { Category, Personality } from '@/types/shared';
import { RiskBadge } from '@/components/common/RiskBadge';
import { PersonalityBadge } from '@/components/common/PersonalityBadge';
import { PiiFlowBadge } from '@/components/common/PiiFlowBadge';
import { SearchInput } from '@/components/common/SearchInput';
import { ToggleSwitch } from '@/components/common/ToggleSwitch';

import { getControls } from '../services/controls.data';
import { CategoryBadge } from '../components/CategoryBadge';
import { CoverageBar } from '../components/CoverageBar';
import { RelationalContext } from '../components/RelationalContext';
import { TruthMatchCell } from '../components/TruthMatchCell';

const CONTROLS = getControls();

/* ---- Table header / cell base classes ---- */
const thClass =
  'px-3.5 py-2.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left whitespace-nowrap bg-slate-50';
const tdClass = 'px-3.5 py-[11px] text-sm text-slate-700 align-middle';

export function ControlsPage() {
  const navigate = useNavigate();

  const [primaryTab, setPrimaryTab] = useState<'Process' | 'Document' | 'Technical'>('Process');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState<string>('All');
  const [personalityFilter, setPersonalityFilter] = useState<string>('All');
  const [activeToggles, setActiveToggles] = useState<Record<string, boolean>>(
    Object.fromEntries(CONTROLS.map(c => [c.id, c.active])),
  );

  const tabCategories: Record<string, Category[]> = {
    Process: ['Process'],
    Document: ['Document'],
    Technical: ['Technical', 'Expected Res.'],
  };

  const filtered = CONTROLS.filter(c => {
    const matchSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || c.category === catFilter;
    const matchPersonality = personalityFilter === 'All' || c.personality === personalityFilter;
    const matchTab = tabCategories[primaryTab].includes(c.category);
    return matchSearch && matchCat && matchPersonality && matchTab;
  });

  const truthGapCount = CONTROLS.filter(c => c.hasTruthGap).length;
  const validatorCount = CONTROLS.filter(c => c.truthValidator).length;

  const TABS: {
    id: 'Process' | 'Document' | 'Technical';
    label: string;
    icon: string;
    activeColor: string;
    count: number;
  }[] = [
    {
      id: 'Process',
      label: 'Process Controls',
      icon: '\u27F3',
      activeColor: '#10B981',
      count: CONTROLS.filter(c => c.category === 'Process').length,
    },
    {
      id: 'Document',
      label: 'Document Controls',
      icon: '\uD83D\uDCC4',
      activeColor: '#8B5CF6',
      count: CONTROLS.filter(c => c.category === 'Document').length,
    },
    {
      id: 'Technical',
      label: 'Technical Controls',
      icon: '\u2B21',
      activeColor: '#0EA5E9',
      count: CONTROLS.filter(c => ['Technical', 'Expected Res.'].includes(c.category)).length,
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Controls</h1>
          <p className="text-sm text-slate-500 mt-1 mb-0">
            {CONTROLS.length} controls &middot; {validatorCount} truth validators &middot;{' '}
            {truthGapCount > 0 ? (
              <span className="text-red-500 font-semibold">
                {truthGapCount} gap{truthGapCount > 1 ? 's' : ''} detected
              </span>
            ) : (
              <span className="text-emerald-500 font-semibold">all clear</span>
            )}
          </p>
        </div>
        <button
          onClick={() => navigate('/controls/create')}
          className="flex items-center gap-1.5 bg-sky-500 hover:bg-sky-600 text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer"
        >
          <Plus size={16} />
          Create Control
        </button>
      </div>

      {/* Intelligence Summary Strip */}
      <div className="grid grid-cols-4 gap-3">
        {([
          { label: 'Consulting Audits', value: CONTROLS.filter(c => c.personality === 'Consulting').length, color: '#0EA5E9', bg: '#EFF6FF', Icon: Handshake },
          { label: 'Operations Checks', value: CONTROLS.filter(c => c.personality === 'Operations').length, color: '#10B981', bg: '#ECFDF5', Icon: Truck },
          { label: 'Security Validators', value: CONTROLS.filter(c => c.personality === 'Security').length, color: '#8B5CF6', bg: '#F5F3FF', Icon: ShieldCheck },
          { label: 'Regulatory Monitors', value: CONTROLS.filter(c => c.personality === 'Regulatory').length, color: '#F59E0B', bg: '#FFFBEB', Icon: Scale },
        ] as const).map(({ label, value, color, bg, Icon }) => (
          <div
            key={label}
            className="bg-white border border-slate-200 rounded-[10px] px-4 py-3.5 flex items-center gap-3 shadow-[0_1px_3px_rgba(0,0,0,0.04)]"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: bg }}
            >
              <Icon size={18} color={color} />
            </div>
            <div>
              <div className="text-xl font-bold text-slate-900 leading-none">{value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Primary Tabs */}
      <div className="flex gap-0 bg-white border border-slate-200 rounded-[10px] p-1 self-start">
        {TABS.map(tab => {
          const sel = primaryTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setPrimaryTab(tab.id);
                setCatFilter('All');
              }}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-[7px] text-[13px] cursor-pointer border-none transition-all duration-150 ${sel ? 'font-bold text-white' : 'font-medium text-[#64748B]'}`}
              style={{
                backgroundColor: sel ? tab.activeColor : 'transparent',
              }}
            >
              <span>{tab.icon}</span>
              {tab.label}
              <span
                className={`text-[10px] font-bold px-[7px] py-px rounded-full ${sel ? 'bg-white/25 text-white' : 'bg-[#F1F5F9] text-[#94A3B8]'}`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Filters */}
      <div className="flex gap-2.5 flex-wrap items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search controls..."
          className="flex-1 min-w-[200px]"
        />

        {/* Category filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {['All', 'Process', 'Document', 'Technical', 'Expected Res.'].map(cat => (
            <button
              key={cat}
              onClick={() => setCatFilter(cat)}
              className={`px-3 py-[7px] rounded-lg text-xs font-medium cursor-pointer border ${catFilter === cat ? 'bg-[#0EA5E9] text-white border-[#0EA5E9]' : 'bg-white text-[#64748B] border-[#E2E8F0]'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Personality filter pills */}
        <div className="flex gap-1.5 flex-wrap">
          {(['All', 'Consulting', 'Operations', 'Security', 'Regulatory'] as const).map(p => {
            const sel = personalityFilter === p;
            const colors: Record<string, string> = {
              Consulting: '#0EA5E9',
              Operations: '#10B981',
              Security: '#8B5CF6',
              Regulatory: '#F59E0B',
              All: '#64748B',
            };
            return (
              <button
                key={p}
                onClick={() => setPersonalityFilter(p)}
                className="px-3 py-[7px] rounded-lg text-xs font-medium cursor-pointer"
                style={{
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

        <button className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-3.5 py-2 text-[13px] font-medium text-slate-700 cursor-pointer">
          <SlidersHorizontal size={14} />
          More Filters
        </button>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-200">
                <th className={thClass}>Control Name</th>
                <th className={`${thClass} !text-violet-500`}>Personality</th>
                <th className={`${thClass} !text-sky-500`}>Relational Context</th>
                <th className={thClass}>Category</th>
                <th className={`${thClass} !text-sky-500`}>PII Flow</th>
                <th className={`${thClass} !text-emerald-500`}>Truth Match</th>
                <th className={thClass}>Active</th>
                <th className={thClass}>Coverage</th>
                <th className={thClass}>Risk</th>
                <th className={thClass}>Last Evaluated</th>
                <th className={thClass}>Deps</th>
                <th className={thClass}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, idx) => (
                <tr
                  key={c.id}
                  className={`hover:bg-slate-50 ${idx < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                >
                  <td className={tdClass}>
                    <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">{c.desc}</div>
                  </td>
                  <td className={tdClass}>
                    <PersonalityBadge personality={c.personality} />
                  </td>
                  <td className={tdClass}>
                    <RelationalContext internal={c.internalSPOC} external={c.externalSPOC} />
                  </td>
                  <td className={tdClass}>
                    <CategoryBadge category={c.category} />
                  </td>
                  <td className={tdClass}>
                    <PiiFlowBadge flow={c.piiFlow} />
                  </td>
                  <td className={tdClass}>
                    <TruthMatchCell validator={c.truthValidator} gap={c.hasTruthGap} />
                  </td>
                  <td className={tdClass}>
                    <ToggleSwitch
                      on={activeToggles[c.id]}
                      onToggle={() => {
                        const next = !activeToggles[c.id];
                        setActiveToggles(prev => ({ ...prev, [c.id]: next }));
                        toast.success(`${c.name} ${next ? 'enabled' : 'disabled'}`);
                      }}
                    />
                  </td>
                  <td className={tdClass}>
                    <CoverageBar value={c.coverage} />
                  </td>
                  <td className={tdClass}>
                    <RiskBadge risk={c.risk} />
                  </td>
                  <td className={tdClass}>
                    <span className="text-xs text-slate-400">{c.lastEval}</span>
                  </td>
                  <td className={tdClass}>
                    <span className="text-[13px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {c.deps}
                    </span>
                  </td>
                  <td className={tdClass}>
                    <div className="flex gap-0.5">
                      {[
                        { Icon: Eye, title: 'View' },
                        { Icon: Pencil, title: 'Edit' },
                        { Icon: Play, title: 'Run' },
                      ].map(({ Icon, title }) => (
                        <button
                          key={title}
                          title={title}
                          onClick={() => toast(`${title}: ${c.name}`)}
                          className="p-1.5 rounded-md bg-transparent border-none text-slate-400 cursor-pointer hover:text-sky-500 hover:bg-sky-50"
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
                  <td colSpan={12} className={`${tdClass} text-center py-10 text-slate-400`}>
                    No controls match your filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span className="text-[13px] text-slate-500">
            Showing {filtered.length} of {CONTROLS.length} controls
          </span>
          <div className="flex gap-1.5">
            {['Prev', 'Next'].map(label => (
              <button
                key={label}
                className="text-[13px] text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-[5px] cursor-pointer"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

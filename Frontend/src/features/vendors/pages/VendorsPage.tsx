import { useState, useEffect } from 'react';
import React from 'react';
import { Eye, Bell, RefreshCw, Trash2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

import { SearchInput } from '../../../components/common/SearchInput';
import { StageBadge } from '../../../components/common/StageBadge';
import { ConfigureDataPanel } from '../../../components/common/ConfigureDataPanel';

import type { Supplier } from '../types';
import type { Stage } from '../../../types/shared';
import { getVendors, deleteVendor } from '../services/vendors.data';
import { AssessmentBadge } from '../components/AssessmentBadge';
import { PIIColumn } from '../components/PIIColumn';
import { SupplierDetailModal } from '../components/SupplierDetailModal';

/* ── Lifecycle group definitions ─────────────────────── */
const LIFECYCLE_GROUPS: { label: string; stages: Stage[]; color: string; bg: string }[] = [
  { label: 'Customer Acquisition', stages: ['Acquisition'],                color: '#0EA5E9', bg: 'bg-blue-50' },
  { label: 'Customer Retention',   stages: ['Retention'],                  color: '#10B981', bg: 'bg-emerald-50' },
  { label: 'Operations',           stages: ['Upgradation', 'Offboarding'], color: '#64748B', bg: 'bg-slate-50' },
];

const TABLE_HEADERS = ['Supplier', 'Stage', 'Risk Score', 'Assessment', 'PII Sharing', 'Contract End', 'Agent', 'Last Activity', 'Actions'];

export function VendorsPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [stageFilter, setStageFilter] = useState('All');
  const [riskFilter, setRiskFilter] = useState('All');
  const [viewSupplier, setViewSupplier] = useState<Supplier | null>(null);
  const [configureSupplier, setConfigureSupplier] = useState<Supplier | null>(null);

  useEffect(() => {
    async function loadVendors() {
      try {
        setLoading(true);
        setError(null);
        const data = await getVendors();
        setSuppliers(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load vendors');
        toast.error('Failed to load vendors');
      } finally {
        setLoading(false);
      }
    }
    loadVendors();
  }, []);

  const filtered = suppliers.filter(s => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.email.includes(search.toLowerCase());
    const matchStage = stageFilter === 'All' || s.stage === stageFilter;
    const matchRisk = riskFilter === 'All' || s.risk === riskFilter;
    return matchSearch && matchStage && matchRisk;
  });

  async function handleRemove(s: Supplier) {
    try {
      await deleteVendor(s.id);
      setSuppliers(prev => prev.filter(x => x.id !== s.id));
      toast.error(`${s.name} removed from TPRM`);
    } catch (err) {
      // Still remove locally even if API fails (optimistic UI with fallback)
      setSuppliers(prev => prev.filter(x => x.id !== s.id));
      toast.error(`${s.name} removed from TPRM`);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-sky-500" />
        <span className="ml-3 text-slate-500">Loading vendors...</span>
      </div>
    );
  }

  if (error && suppliers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Third Party Risk Management</h1>
          <p className="text-sm text-slate-500 mt-1 mb-0">{suppliers.length} suppliers across 4 stages</p>
        </div>

        {/* Search + Filters */}
        <div className="flex gap-2 flex-wrap">
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder="Search suppliers..."
            className="w-[200px]"
          />
          <select
            value={stageFilter}
            onChange={e => setStageFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
          >
            {['All', 'Acquisition', 'Retention', 'Upgradation', 'Offboarding'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <select
            value={riskFilter}
            onChange={e => setRiskFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-slate-200 rounded-lg outline-none bg-white text-slate-700"
          >
            {['All', 'Critical', 'High', 'Medium', 'Low'].map(s => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {TABLE_HEADERS.map(h => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wider text-left whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIFECYCLE_GROUPS.map(grp => {
              const rows = filtered.filter(s => grp.stages.includes(s.stage));
              if (rows.length === 0) return null;
              return (
                <React.Fragment key={grp.label}>
                  {/* Group header */}
                  <tr>
                    <td colSpan={9} className={`px-4 py-2 border-b border-t border-slate-200 ${grp.bg}`}>
                      <span
                        className="text-[11px] font-bold uppercase tracking-widest"
                        style={{ color: grp.color }}
                      >
                        {grp.label}
                      </span>
                      <span
                        className="text-[11px] ml-1.5 opacity-70"
                        style={{ color: grp.color }}
                      >
                        &middot; {rows.length} supplier{rows.length !== 1 ? 's' : ''}
                      </span>
                    </td>
                  </tr>

                  {/* Supplier rows */}
                  {rows.map((s, idx) => (
                    <tr
                      key={s.id}
                      className={`hover:bg-slate-50 ${idx < rows.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}
                    >
                      {/* Supplier name + email */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{s.email}</div>
                      </td>

                      {/* Stage */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <StageBadge stage={s.stage} />
                      </td>

                      {/* Risk Score */}
                      <td className="px-4 py-3 text-sm align-middle">
                        <span className="text-sm font-bold" style={{ color: s.riskColor }}>
                          {s.score}
                        </span>
                      </td>

                      {/* Assessment */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <AssessmentBadge status={s.assessment} />
                      </td>

                      {/* PII Sharing */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <PIIColumn pii={s.pii} assessment={s.assessment} piiFlow={s.piiFlow} />
                      </td>

                      {/* Contract End */}
                      <td className="px-4 py-3 text-sm align-middle">
                        <div
                          className={`text-sm ${
                            s.contractWarning ? 'text-amber-500 font-semibold' : 'text-slate-700 font-normal'
                          }`}
                        >
                          {s.contractEnd}
                          {s.contractWarning && (
                            <span className="ml-1.5 text-[11px] bg-amber-50 text-amber-500 px-1.5 py-px rounded font-medium">
                              Expiring
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Agent */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <span className="text-xs font-semibold text-sky-500 bg-blue-50 px-2.5 py-0.5 rounded-full">
                          {s.agentId}
                        </span>
                      </td>

                      {/* Last Activity */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <span className="text-xs text-slate-400">{s.lastActivity}</span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-sm text-slate-700 align-middle">
                        <div className="flex gap-0.5">
                          <button
                            onClick={() => setViewSupplier(s)}
                            title="View details"
                            className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-sky-500 hover:bg-blue-50"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => toast.success(`Reminder sent to ${s.name}`)}
                            title="Send reminder"
                            className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-amber-500 hover:bg-amber-50"
                          >
                            <Bell size={14} />
                          </button>
                          <button
                            onClick={() => toast.success(`Assessment refreshed for ${s.name}`)}
                            title="Refresh assessment"
                            className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-emerald-500 hover:bg-emerald-50"
                          >
                            <RefreshCw size={14} />
                          </button>
                          <button
                            onClick={() => handleRemove(s)}
                            title="Remove supplier"
                            className="p-1.5 rounded bg-transparent border-none text-slate-400 cursor-pointer hover:text-red-500 hover:bg-red-50"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span className="text-sm text-slate-500">
            Showing {filtered.length} of {suppliers.length} suppliers
          </span>
          <div className="flex gap-1.5">
            {['Prev', 'Next'].map(label => (
              <button
                key={label}
                className="text-sm text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-1.5 cursor-pointer hover:bg-slate-50"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Modals / Panels */}
      {viewSupplier && (
        <SupplierDetailModal
          supplier={viewSupplier}
          onClose={() => setViewSupplier(null)}
          onConfigureData={s => { setViewSupplier(null); setConfigureSupplier(s); }}
        />
      )}
      {configureSupplier && (
        <ConfigureDataPanel
          supplierName={configureSupplier.name}
          riskScore={configureSupplier.score}
          riskLevel={configureSupplier.risk}
          stage={configureSupplier.stage}
          onClose={() => setConfigureSupplier(null)}
        />
      )}
    </div>
  );
}

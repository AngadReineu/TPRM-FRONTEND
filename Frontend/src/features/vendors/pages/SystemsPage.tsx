import { useState, useEffect } from 'react';
import React from 'react';
import { Database, Plus, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

import { StageBadge } from '../../../components/common/StageBadge';
import type { Stage } from '../../../types/shared';
import type { SystemNode } from '../../library/types';
import type { Supplier } from '../types';
import { getSystems, getDivisions } from '../../library/services/library.data';
import { getVendors } from '../services/vendors.data';

/* ── Create System Modal ───────────────────────── */
function CreateSystemModal({
  onClose,
  onCreated,
  suppliers
}: {
  onClose: () => void;
  onCreated: (s: SystemNode) => void;
  suppliers: Supplier[];
}) {
  const [form, setForm] = useState({
    name: '',
    type: 'crm',
    supplierId: '',
    stage: 'Acquisition' as Stage,
  });
  const [submitting, setSubmitting] = useState(false);

  const isFormValid = form.name.trim().length > 0 && form.supplierId !== '';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isFormValid) return;

    setSubmitting(true);
    try {
      const { createSystem } = await import('../../library/services/library.data');
      const created = await createSystem({
        name: form.name.trim(),
        type: form.type as any,
        divisionId: 'default',
        linkedSupplierId: form.supplierId,
        stage: form.stage,
        dataSource: 'User Input',
      });
      toast.success(`System "${form.name}" created`);
      onCreated(created);
      onClose();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create system');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="p-4 border-b border-slate-100 flex justify-between">
          <h2 className="text-lg font-bold">Add Connected System</h2>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1">System Name</label>
            <input 
              type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm" placeholder="e.g. Salesforce Data" 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">System Type</label>
            <select 
              value={form.type} onChange={e => setForm(f => ({...f, type: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="crm">CRM</option>
              <option value="infra">Infrastructure</option>
              <option value="db">Database</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Linked Supplier</label>
            <select 
              value={form.supplierId} onChange={e => setForm(f => ({...f, supplierId: e.target.value}))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="">Select a supplier...</option>
              {suppliers.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Stage</label>
            <select 
              value={form.stage} onChange={e => setForm(f => ({...f, stage: e.target.value as Stage}))}
              className="w-full px-3 py-2 border rounded-lg text-sm"
            >
              <option value="Acquisition">Acquisition</option>
              <option value="Retention">Retention</option>
              <option value="Upgradation">Upgradation</option>
              <option value="Offboarding">Offboarding</option>
            </select>
          </div>
          <div className="flex gap-2 justify-end mt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded-lg text-sm font-medium">Cancel</button>
            <button type="submit" disabled={submitting || !isFormValid} className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm font-medium disabled:opacity-50">
              {submitting ? 'Creating...' : 'Add System'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function SystemsPage() {
  const [systems, setSystems] = useState<SystemNode[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSysCreateModal, setShowSysCreateModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [sysData, supData, divData] = await Promise.all([
          getSystems(),
          getVendors(),
          getDivisions()
        ]);
        setSystems(sysData);
        setSuppliers(supData);
        setDepartments(divData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load systems');
        toast.error('Failed to load systems');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
        <span className="ml-3 text-slate-500">Loading systems...</span>
      </div>
    );
  }

  if (error && systems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-violet-500 text-white rounded-lg hover:bg-violet-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 max-w-[1280px] w-full mx-auto">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Third Party Systems</h1>
          <p className="text-sm text-slate-500 mt-1 mb-0">Manage and monitor interconnected systems</p>
        </div>
        <button
          onClick={() => setShowSysCreateModal(true)}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-500 text-white text-sm font-medium rounded-lg hover:bg-violet-600 transition-colors"
        >
          <Plus size={16} />
          Add System
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-lg flex items-center justify-center">
              <Database size={18} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Third Party Systems</h2>
              <p className="text-xs text-slate-500 mt-0.5">Systems tracked across your supply chain</p>
            </div>
          </div>
          <span className="text-xs font-medium text-violet-600 bg-violet-50 px-2.5 py-1 rounded-full">
            {systems.length} systems
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['System', 'Type', 'Department', 'Linked Supplier', 'Stage', 'Vuln Score', 'PII Allowed'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium text-slate-400 uppercase tracking-wider text-left whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-sm text-slate-400">
                    No systems found
                  </td>
                </tr>
              ) : (
                systems.map((s, idx) => (
                  <tr key={s.id} className={`hover:bg-slate-50/80 ${idx < systems.length - 1 ? 'border-b border-slate-100' : ''}`}>
                    <td className="px-4 py-3 align-middle font-semibold text-slate-900 text-sm">
                      {s.name}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium uppercase">
                        {s.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-600">
                      {departments.find(d => d.id === s.divisionId)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 align-middle text-sm text-slate-600">
                      {suppliers.find(sup => sup.id === s.linkedSupplierId)?.name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <StageBadge stage={s.stage as Stage} />
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <span className="text-sm font-bold text-slate-700">{s.vulnScore ?? '--'}</span>
                    </td>
                    <td className="px-4 py-3 align-middle">
                      <div className="flex flex-wrap gap-1">
                        {s.authorizedPii?.map(pii => (
                          <span key={pii} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {pii}
                          </span>
                        ))}
                        {(!s.authorizedPii || s.authorizedPii.length === 0) && <span className="text-slate-400 text-xs">—</span>}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showSysCreateModal && (
        <CreateSystemModal
          suppliers={suppliers}
          onClose={() => setShowSysCreateModal(false)}
          onCreated={(newSys) => {
            setSystems(prev => [...prev, newSys]);
          }}
        />
      )}
    </div>
  );
}

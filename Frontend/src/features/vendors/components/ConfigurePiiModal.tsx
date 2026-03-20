import { useState } from 'react';
import { X, Check, Server, FileLock, Mail, Link as LinkIcon, MoveUpRight, MoveDownLeft, Repeat2, Loader2, Info } from 'lucide-react';
import type { Supplier } from '../types';
import type { PiiFlow } from '@/types/shared';

interface ConfigurePiiModalProps {
  supplier: Supplier;
  onClose: () => void;
  onSave: (supplierId: string, piiFlow: PiiFlow, method: string, icons: string[]) => Promise<void>;
}

const PII_CATEGORIES = [
  { id: 'Email', label: 'Email Address' },
  { id: 'Mobile', label: 'Phone Number' },
  { id: 'Name', label: 'Full Name' },
  { id: 'ID', label: 'National ID / SSN' },
  { id: 'Location', label: 'Physical Location' },
  { id: 'Financial', label: 'Financial Data' },
  { id: 'Health', label: 'Health Records' },
  { id: 'Doc', label: 'Identity Documents' },
];

const METHODS = [
  { id: 'API', label: 'Secure REST API', icon: Server },
  { id: 'SFTP', label: 'Encrypted SFTP', icon: FileLock },
  { id: 'Email', label: 'Secure Email', icon: Mail },
  { id: 'Portal', label: 'Supplier Portal', icon: LinkIcon },
];

const FLOWS: { id: PiiFlow; label: string; icon: typeof MoveUpRight; desc: string }[] = [
  { id: 'share', label: 'Share', icon: MoveUpRight, desc: 'We export data to the vendor' },
  { id: 'ingest', label: 'Ingest', icon: MoveDownLeft, desc: 'We receive data from the vendor' },
  { id: 'both', label: 'Both', icon: Repeat2, desc: 'Two-way bidirectional sync' },
];

export function ConfigurePiiModal({ supplier, onClose, onSave }: ConfigurePiiModalProps) {
  const [saving, setSaving] = useState(false);
  
  // Local state initialized carefully from supplier's existing details
  const [selectedFlow, setSelectedFlow] = useState<PiiFlow>(supplier.piiFlow || 'share');
  const [selectedMethod, setSelectedMethod] = useState<string>(
    supplier.pii?.method && supplier.pii.method !== 'configure' ? supplier.pii.method : 'API'
  );
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(
    new Set(supplier.pii?.icons || [])
  );

  const toggleCategory = (id: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    if (selectedCategories.size === 0) return;
    try {
      setSaving(true);
      await onSave(supplier.id, selectedFlow, selectedMethod, Array.from(selectedCategories));
      onClose();
    } catch (e) {
      console.error(e);
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 z-10 bg-white px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Configure Data Flow</h2>
            <p className="text-xs text-slate-500 mt-1">Mapping shared taxonomy for <span className="font-semibold text-slate-700">{supplier.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Data Direction */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">1. Data Direction</h3>
            <div className="grid grid-cols-3 gap-3">
              {FLOWS.map(flow => {
                const Icon = flow.icon;
                const active = selectedFlow === flow.id;
                return (
                  <button
                    key={flow.id}
                    onClick={() => setSelectedFlow(flow.id)}
                    className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                      active ? 'border-sky-500 bg-sky-50' : 'border-slate-100 bg-white hover:border-slate-200'
                    }`}
                  >
                    <Icon size={24} className={`mb-2 ${active ? 'text-sky-600' : 'text-slate-400'}`} />
                    <span className={`text-sm font-semibold ${active ? 'text-sky-700' : 'text-slate-700'}`}>{flow.label}</span>
                    <span className="text-[10px] text-slate-400 text-center mt-1 w-32">{flow.desc}</span>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Transfer Method */}
          <section>
            <h3 className="text-sm font-semibold text-slate-900 mb-3 uppercase tracking-wider">2. Transfer Implementation</h3>
            <div className="grid grid-cols-2 gap-3">
              {METHODS.map(method => {
                const Icon = method.icon;
                const active = selectedMethod === method.id;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      active ? 'border-sky-500 bg-white shadow-sm ring-1 ring-sky-500' : 'border-slate-200 bg-slate-50 hover:bg-white'
                    }`}
                  >
                    <div className={`p-2 rounded-md ${active ? 'bg-sky-100/50 text-sky-600' : 'bg-white text-slate-400 shadow-sm border border-slate-100'}`}>
                      <Icon size={18} />
                    </div>
                    <span className={`text-sm font-medium ${active ? 'text-sky-700' : 'text-slate-600'}`}>{method.label}</span>
                    {active && <Check size={16} className="text-sky-500 ml-auto mr-1" />}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Data Fields */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider">3. PII Fields Shared</h3>
              <span className="text-xs font-semibold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">{selectedCategories.size} selected</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
              {PII_CATEGORIES.map(category => {
                const checked = selectedCategories.has(category.id);
                return (
                  <label key={category.id} className={`flex items-start gap-2.5 p-2 rounded cursor-pointer transition-colors ${checked ? 'text-sky-900' : 'text-slate-600 hover:bg-slate-100'}`}>
                    <div className="mt-0.5 relative flex items-center justify-center w-4 h-4 shrink-0">
                      <input 
                        type="checkbox" 
                        checked={checked} 
                        onChange={() => toggleCategory(category.id)}
                        className="peer appearance-none w-4 h-4 border border-slate-300 rounded focus:ring-2 focus:ring-sky-500/20 checked:bg-sky-500 checked:border-sky-500 transition-all cursor-pointer"
                      />
                      <Check size={12} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth={3} />
                    </div>
                    <div>
                      <span className="block text-[13px] font-semibold">{category.id}</span>
                      <span className="block text-[10px] text-slate-400 break-words max-w-[100px] leading-tight mt-0.5">{category.label}</span>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        <div className="sticky bottom-0 bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-400">
            <Info size={14} />
            <span className="text-[11px]">Configurations update live data-gap monitors</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900">
              Cancel
            </button>
            <button 
              onClick={handleSave} 
              disabled={saving || selectedCategories.size === 0}
              className="flex items-center gap-2 px-6 py-2 bg-slate-900 text-white text-sm font-semibold rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-md"
            >
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              {saving ? 'Saving...' : 'Lock Implementation'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

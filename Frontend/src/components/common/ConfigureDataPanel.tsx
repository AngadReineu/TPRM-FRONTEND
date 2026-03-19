import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { toast } from 'sonner';

interface ConfigureDataPanelProps {
  supplierName: string;
  riskScore?: number;
  riskLevel?: string;
  stage?: string;
  onClose: () => void;
}

const PII_FIELDS = [
  { id: 'name', label: 'Full Name' },
  { id: 'aadhar', label: 'Aadhar / National ID' },
  { id: 'email', label: 'Email Address' },
  { id: 'pan', label: 'PAN Number' },
  { id: 'phone', label: 'Phone Number' },
  { id: 'financial', label: 'Financial Information' },
  { id: 'address', label: 'Physical Address' },
  { id: 'health', label: 'Health Records' },
  { id: 'biometric', label: 'Biometric Data' },
  { id: 'credentials', label: 'Login Credentials' },
];

const TRANSFER_METHODS = [
  { id: 'api', label: 'API Integration' },
  { id: 'excel', label: 'Excel Sheet' },
  { id: 'db', label: 'Database Dump' },
];

export function ConfigureDataPanel({
  supplierName,
  riskScore,
  riskLevel,
  stage,
  onClose,
}: ConfigureDataPanelProps) {
  const [selectedPII, setSelectedPII] = useState(new Set(['name', 'email', 'phone']));
  const [transferMethod, setTransferMethod] = useState('api');

  const togglePII = (id: string) => {
    setSelectedPII(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="fixed inset-0 z-[300]">
      <div onClick={onClose} className="absolute inset-0 bg-black/30" />
      <div className="absolute right-0 top-0 bottom-0 w-[560px] bg-white flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.12)]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-0.5">Configure Data Sharing</h2>
            <div className="text-sm text-slate-500">{supplierName}</div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={20} />
          </button>
        </div>

        {/* Risk banner */}
        {riskScore !== undefined && (
          <div className="px-6 py-2.5 bg-amber-50 border-b border-amber-200 text-sm text-amber-900 shrink-0">
            Risk Score: <strong>{riskScore}</strong> — {riskLevel} · Stage: {stage}
          </div>
        )}

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {/* PII Selection */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              What PII are we sending? *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {PII_FIELDS.map(f => (
                <label
                  key={f.id}
                  onClick={() => togglePII(f.id)}
                  className="flex items-center gap-2 cursor-pointer text-sm text-slate-700"
                >
                  <div
                    className={`w-4 h-4 rounded shrink-0 flex items-center justify-center border-2 ${
                      selectedPII.has(f.id)
                        ? 'border-sky-500 bg-sky-500'
                        : 'border-slate-300 bg-white'
                    }`}
                  >
                    {selectedPII.has(f.id) && <Check size={10} color="#fff" strokeWidth={3} />}
                  </div>
                  {f.label}
                </label>
              ))}
            </div>
          </div>

          {/* Auth + Role */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Authorized by *</label>
              <input className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Role</label>
              <select className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none">
                <option>Risk Manager</option>
                <option>DPO</option>
                <option>Compliance Officer</option>
              </select>
            </div>
          </div>

          {/* Transfer Method */}
          <div className="mb-5">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transfer Method *</label>
            <div className="grid grid-cols-3 gap-2.5">
              {TRANSFER_METHODS.map(m => (
                <div
                  key={m.id}
                  onClick={() => setTransferMethod(m.id)}
                  className={`py-3 px-2 rounded-[10px] text-center cursor-pointer ${
                    transferMethod === m.id
                      ? 'border-2 border-sky-500 bg-sky-50'
                      : 'border border-slate-200 bg-white'
                  }`}
                >
                  <div className="text-xs font-semibold text-slate-900">{m.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Frequency + Start Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transfer Frequency *</label>
              <select className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none appearance-none">
                <option>Real-time</option>
                <option>Daily</option>
                <option>Weekly</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Transfer Start Date *</label>
              <input type="date" className="w-full px-3 py-2 text-sm text-slate-700 border border-slate-200 rounded-lg outline-none" />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2.5 text-sm cursor-pointer hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              toast.success(`Data sharing configured for ${supplierName}`);
              onClose();
            }}
            className="bg-sky-500 text-white border-none rounded-lg px-4 py-2.5 text-sm font-semibold cursor-pointer hover:bg-sky-600"
          >
            Save Configuration
          </button>
        </div>
      </div>
    </div>
  );
}

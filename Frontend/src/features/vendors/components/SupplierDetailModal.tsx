import { X, Bell, RefreshCw, CheckCircle2, AlertTriangle, Clock } from 'lucide-react';
import { toast } from 'sonner';
import type { Supplier, AssessmentStatus } from '../types';

interface SupplierDetailModalProps {
  supplier: Supplier;
  onClose: () => void;
  onConfigureData: (s: Supplier) => void;
}

const ASSESSMENT_INFO: Record<
  AssessmentStatus,
  { icon: React.ReactNode; label: string; className: string }
> = {
  complete: {
    icon: <CheckCircle2 size={15} className="text-emerald-500" />,
    label: 'Assessment Complete',
    className: 'bg-emerald-50 text-emerald-500',
  },
  overdue: {
    icon: <AlertTriangle size={15} className="text-red-500" />,
    label: 'Assessment Overdue',
    className: 'bg-red-50 text-red-500',
  },
  pending: {
    icon: <Clock size={15} className="text-amber-500" />,
    label: 'Assessment Pending',
    className: 'bg-amber-50 text-amber-500',
  },
};

const RISK_BG: Record<string, string> = {
  Critical: 'bg-red-50',
  High: 'bg-amber-50',
  Low: 'bg-emerald-50',
};

export function SupplierDetailModal({ supplier, onClose, onConfigureData }: SupplierDetailModalProps) {
  const assessmentInfo = ASSESSMENT_INFO[supplier.assessment];
  const riskBgClass = RISK_BG[supplier.risk] ?? 'bg-slate-100';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      {/* Backdrop */}
      <div onClick={onClose} className="absolute inset-0 bg-black/40" />

      {/* Modal */}
      <div className="relative w-[680px] max-h-[88vh] bg-white rounded-2xl flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.2)] z-[1]">
        {/* Header */}
        <div className="px-7 pt-[22px] pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{supplier.name}</h2>
              <div className="text-sm text-slate-400">{supplier.email}</div>
            </div>
            <button onClick={onClose} className="text-slate-400 p-1 bg-transparent border-none cursor-pointer hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
          <div className="flex gap-2 mt-3 flex-wrap">
            <span
              className="text-xs font-semibold px-3 py-0.5 rounded-full"
              style={{ backgroundColor: supplier.stageColor + '20', color: supplier.stageColor }}
            >
              {supplier.stage}
            </span>
            <span className={`text-xs font-semibold px-3 py-0.5 rounded-full flex items-center gap-1 ${assessmentInfo.className}`}>
              {assessmentInfo.icon}{assessmentInfo.label}
            </span>
          </div>
        </div>

        {/* Risk banner */}
        <div className={`px-7 py-3.5 border-b border-slate-200 shrink-0 flex gap-8 ${riskBgClass}`}>
          {[
            { label: 'Risk Score', value: supplier.score.toString(), color: supplier.riskColor, big: true },
            { label: 'Risk Level', value: supplier.risk, color: supplier.riskColor },
            { label: 'Agent', value: supplier.agentId, color: '#0EA5E9' },
            { label: 'Contract', value: supplier.contractEnd, color: supplier.contractWarning ? '#F59E0B' : '#334155' },
          ].map(item => (
            <div key={item.label}>
              <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">
                {item.label}
              </div>
              <div
                className={`font-extrabold ${item.big ? 'text-[26px]' : 'text-[15px]'}`}
                style={{ color: item.color }}
              >
                {item.value}
              </div>
            </div>
          ))}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">
          {/* Details grid */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              Supplier Details
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              {([
                ['Email', supplier.email],
                ['Last Activity', supplier.lastActivity],
                ['Contract End', supplier.contractWarning ? `${supplier.contractEnd} \u26A0 Expiring` : supplier.contractEnd],
                ['Monitoring Agent', supplier.agentId],
              ] as const).map(([k, v]) => (
                <div key={k} className="bg-slate-50 rounded-lg px-3.5 py-2.5">
                  <div className="text-[11px] text-slate-400 font-medium mb-0.5">{k}</div>
                  <div className="text-sm font-semibold text-slate-700">{v}</div>
                </div>
              ))}
            </div>
          </div>

          {/* PII Sharing */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              PII Data Sharing
            </div>
            {supplier.pii.configured ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-[10px] px-4 py-3.5">
                <div className="flex items-center gap-1.5 mb-2">
                  <CheckCircle2 size={14} className="text-emerald-500" />
                  <span className="text-sm font-semibold text-emerald-600">
                    Configured &middot; Transfer via {supplier.pii.method}
                  </span>
                </div>
                <div className="flex gap-1 flex-wrap mb-2.5">
                  {supplier.pii.icons?.map(icon => (
                    <span key={icon} className="bg-white text-slate-700 text-[11px] px-2 py-0.5 rounded border border-emerald-100">
                      {icon}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => { onClose(); onConfigureData(supplier); }}
                  className="text-xs font-semibold text-sky-500 bg-transparent border-none cursor-pointer p-0 hover:text-sky-600"
                >
                  Edit Configuration &rarr;
                </button>
              </div>
            ) : supplier.assessment === 'complete' ? (
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3.5">
                <div className="text-sm text-amber-900 mb-3">
                  Assessment complete — PII data sharing not yet configured.
                </div>
                <button
                  onClick={() => { onClose(); onConfigureData(supplier); }}
                  className="bg-sky-500 text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-sky-600"
                >
                  Configure Data Sharing
                </button>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-[10px] px-4 py-3 text-sm text-slate-400">
                Available after supplier completes their assessment
              </div>
            )}
          </div>

          {/* Assessment action */}
          {(supplier.assessment === 'pending' || supplier.assessment === 'overdue') && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
                Assessment Actions
              </div>
              <div
                className={`rounded-[10px] px-4 py-3.5 border ${
                  supplier.assessment === 'overdue'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-amber-50 border-amber-200'
                }`}
              >
                <p
                  className={`text-sm m-0 mb-3 ${
                    supplier.assessment === 'overdue' ? 'text-red-900' : 'text-amber-900'
                  }`}
                >
                  {supplier.assessment === 'overdue'
                    ? 'Immediate follow-up required \u2014 assessment overdue.'
                    : 'Assessment portal sent. Awaiting supplier response.'}
                </p>
                <button
                  onClick={() => { toast.success(`Reminder sent to ${supplier.name}`); onClose(); }}
                  className={`text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer flex items-center gap-1.5 ${
                    supplier.assessment === 'overdue'
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'bg-amber-500 hover:bg-amber-600'
                  }`}
                >
                  <Bell size={13} /> Send Reminder
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-7 py-3.5 border-t border-slate-200 flex justify-between items-center shrink-0 bg-slate-50 rounded-b-2xl">
          <button
            onClick={() => { toast.success(`Assessment refreshed for ${supplier.name}`); onClose(); }}
            className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2 text-sm cursor-pointer flex items-center gap-1.5 hover:bg-slate-50"
          >
            <RefreshCw size={13} /> Refresh Assessment
          </button>
          <button
            onClick={onClose}
            className="bg-sky-500 text-white border-none rounded-lg px-5 py-2 text-sm font-semibold cursor-pointer hover:bg-sky-600"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

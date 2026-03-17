import { X, AlertTriangle } from 'lucide-react';
import type { Template, Severity } from '../types';
import { getSeverityColors } from '../services/templates.data';

const SEV_CLR = getSeverityColors();

interface AnomalyPreviewModalProps {
  tpl: Template;
  onClose: () => void;
}

export function AnomalyPreviewModal({ tpl, onClose }: AnomalyPreviewModalProps) {
  const Icon = tpl.icon;
  return (
    <div className="fixed inset-0 z-[700] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/50 backdrop-blur-[2px]" />
      <div className="relative w-[520px] max-h-[85vh] bg-white rounded-2xl flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.24)] animate-[scaleIn_0.18s_ease] overflow-hidden">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-[10px] flex items-center justify-center"
                style={{ backgroundColor: tpl.bg, border: `1px solid ${tpl.border}` }}
              >
                <Icon size={18} color={tpl.color} />
              </div>
              <div>
                <div className="text-base font-bold text-slate-900">{tpl.title} &mdash; AI Logic</div>
                <div className="text-xs text-slate-400">{tpl.subtitle}</div>
              </div>
            </div>
            <button onClick={onClose} className="w-[30px] h-[30px] bg-slate-100 border-none rounded-lg cursor-pointer flex items-center justify-center text-slate-500">
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Trigger list */}
        <div className="flex-1 overflow-y-auto px-6 py-4 flex flex-col gap-3">
          <div className="text-xs text-slate-500 mb-1">
            These are the specific anomaly patterns this agent personality is trained to detect and escalate:
          </div>
          {tpl.logic.map((row, i) => {
            const [bg, clr] = SEV_CLR[row.severity as Severity];
            return (
              <div key={i} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-3.5">
                <div className="flex items-center gap-2 mb-1.5">
                  <AlertTriangle size={13} color={clr} />
                  <span className="text-[13px] font-bold text-slate-900">{row.trigger}</span>
                  <span
                    className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full capitalize"
                    style={{ backgroundColor: bg, color: clr }}
                  >
                    {row.severity}
                  </span>
                </div>
                <div className="text-xs text-slate-500 leading-relaxed">{row.detail}</div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-200 shrink-0 bg-[#FAFBFC] flex justify-end">
          <button
            onClick={onClose}
            className="text-white border-none rounded-lg px-5 py-2 text-[13px] font-semibold cursor-pointer"
            style={{ backgroundColor: tpl.color }}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}

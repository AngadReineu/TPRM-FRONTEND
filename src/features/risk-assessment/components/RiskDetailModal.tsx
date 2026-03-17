import { useState } from 'react';
import { X, CheckCircle2, Check, AlertTriangle, TrendingDown } from 'lucide-react';
import { toast } from 'sonner';
import type { RiskEvent } from '../types';
import { getSeverityColors, getStatusColors, getEffortColors } from '../services/risk.data';

const severityColors = getSeverityColors();
const statusColors = getStatusColors();
const effortColors = getEffortColors();

export function RiskDetailModal({ event, onClose }: { event: RiskEvent; onClose: () => void }) {
  const [doneActions, setDoneActions] = useState<Set<string>>(new Set());
  const toggle = (id: string) => {
    const n = new Set(doneActions);
    if (n.has(id)) {
      n.delete(id);
    } else {
      n.add(id);
      const action = event.actions.find(a => a.id === id);
      if (action) toast.success(`Action completed: "${action.title}"`);
    }
    setDoneActions(n);
  };

  const totalReduction = event.actions.filter(a => doneActions.has(a.id)).reduce((s, a) => s + a.scoreReduction, 0);
  const projectedScore = Math.max(0, event.currentScore + totalReduction);
  const [sevBgClass, sevTextClass] = severityColors[event.severity] ?? ['bg-slate-100', 'text-slate-500'];
  const [stsBgClass, stsTextClass] = statusColors[event.status] ?? ['bg-slate-100', 'text-slate-500'];

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-black/45" />
      <div className="relative w-[720px] max-h-[90vh] bg-white rounded-2xl flex flex-col shadow-[0_24px_64px_rgba(0,0,0,0.2)] z-[1]">
        {/* Header */}
        <div className="px-7 pt-[22px] pb-4 border-b border-slate-200 shrink-0">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[5px] ${sevBgClass} ${sevTextClass}`}>
                  {event.severity}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-[5px] ${stsBgClass} ${stsTextClass}`}>
                  {event.status}
                </span>
                <span className="text-xs text-slate-400">{event.date}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">{event.supplier}</h2>
              <div className="text-[13px] text-slate-500">{event.desc}</div>
            </div>
            <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 p-1 shrink-0">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Score Banner */}
        <div className="grid grid-cols-3 border-b border-slate-200 shrink-0">
          <div className="px-6 py-3.5 border-r border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-1">Current Risk Score</div>
            <div className="text-[28px] font-extrabold text-red-500">{event.currentScore}</div>
          </div>
          <div className={`px-6 py-3.5 border-r border-slate-200 ${doneActions.size > 0 ? 'bg-emerald-50' : 'bg-slate-50'}`}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-1">Projected After Actions</div>
            <div className={`text-[28px] font-extrabold flex items-center gap-1.5 ${doneActions.size > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
              {projectedScore}
              {doneActions.size > 0 && <TrendingDown size={18} className="text-emerald-500" />}
            </div>
          </div>
          <div className="px-6 py-3.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-1">Max Possible Reduction</div>
            <div className="text-[28px] font-extrabold text-sky-500">
              {event.actions.reduce((s, a) => s + a.scoreReduction, 0)} pts
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-5">
          {/* What happened */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">What Happened</div>
            <p className="text-sm text-slate-700 m-0 leading-[1.65] bg-slate-50 px-4 py-3.5 rounded-[10px] border border-slate-200">
              {event.fullDetail}
            </p>
          </div>

          {/* Business Impact */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">Business Impact</div>
            <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex gap-2.5">
              <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[13px] text-amber-900 m-0 leading-[1.6]">{event.impact}</p>
            </div>
          </div>

          {/* Action Plan */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">
                Remediation Action Plan
              </div>
              {doneActions.size > 0 && (
                <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                  {doneActions.size}/{event.actions.length} completed · {totalReduction} pts reduced
                </span>
              )}
            </div>
            <div className="flex flex-col gap-2.5">
              {event.actions.map((action, i) => {
                const done = doneActions.has(action.id);
                const [efBgClass, efTextClass] = effortColors[action.effort];
                return (
                  <div
                    key={action.id}
                    className={`rounded-[10px] px-4 py-3.5 transition-all duration-200 border ${done ? 'border-emerald-300 bg-green-50' : 'border-slate-200 bg-white'}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        onClick={() => toggle(action.id)}
                        className={`w-[22px] h-[22px] rounded-[6px] shrink-0 cursor-pointer mt-px flex items-center justify-center border-2 ${done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white'}`}
                      >
                        {done && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-[11px] text-slate-400 font-semibold">{i + 1}</span>
                          <span className={`text-sm font-semibold ${done ? 'text-emerald-500 line-through' : 'text-slate-900'}`}>
                            {action.title}
                          </span>
                        </div>
                        <p className="text-[13px] text-slate-500 m-0 mb-2 leading-[1.5]">{action.detail}</p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[11px] font-semibold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-[5px]">
                            {action.scoreReduction} pts
                          </span>
                          <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[5px]">
                            Owner: {action.owner}
                          </span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-[5px] ${efBgClass} ${efTextClass}`}>
                            Effort: {action.effort}
                          </span>
                        </div>
                      </div>
                      {done && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-3.5 border-t border-slate-200 flex justify-between items-center shrink-0 bg-slate-50 rounded-b-2xl">
          <div className="text-[13px] text-slate-500">
            {doneActions.size === 0
              ? `${event.actions.length} actions available · up to ${event.actions.reduce((s, a) => s + a.scoreReduction, 0)} pts reduction`
              : `${doneActions.size} done · ${projectedScore} projected score`}
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="bg-white text-slate-700 border border-slate-200 rounded-lg px-4 py-2 text-[13px] cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={() => toast.success(`Action plan exported for ${event.supplier}`)}
              className="bg-sky-500 text-white border-none rounded-lg px-[18px] py-2 text-[13px] font-semibold cursor-pointer"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { X, CheckCircle2, Check, AlertTriangle, TrendingDown, Wand2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import type { RiskEvent } from '../types';
import { getSeverityColors, getStatusColors, getEffortColors, updateRiskEventStatus, updateRiskEventActions, executeRiskAction } from '../services/risk.data';

const severityColors = getSeverityColors();
const statusColors = getStatusColors();
const effortColors = getEffortColors();

interface Props {
  event: RiskEvent;
  onClose: () => void;
  onUpdate: (updated: RiskEvent) => void;
}

export function RiskDetailModal({ event, onClose, onUpdate }: Props) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const toggle = async (actionId: string) => {
    try {
      const updated = await executeRiskAction(event.id || '', actionId);
      toast.success("Action marked as completed");
      onUpdate(updated);
    } catch (e) {
      toast.error('Failed to complete action');
    }
  };

  const handleUpdateStatus = async (status: 'Open' | 'In Review' | 'Resolved') => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateRiskEventStatus(event.id || '', status);
      toast.success(`Status updated to ${status}`);
      onUpdate(updated);
    } catch (e) {
      toast.error('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const generatePlan = async () => {
    setIsGenerating(true);
    try {
      const prompt = `You are a TPRM Expert.
A risk event was detected for supplier: ${event.supplierName || event.supplier}.
Details: ${event.description || event.desc}
Full Output from Agent: ${event.fullDetail}

Please generate a 3-step remediation action plan for the risk manager.
Return ONLY a valid JSON array of objects with the following keys:
- "id": (string) e.g. "ai1", "ai2"
- "title": (string) short title
- "detail": (string) description
- "effort": (string) "Low", "Medium", or "High"
- "scoreReduction": (number) a negative integer e.g. -2, -5
Do NOT include any markdown blocks or formatting. Return exact JSON.`;

      const res = await fetch('http://localhost:11434/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'mistral',
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        })
      });
      const data = await res.json();
      let content = data.message.content.trim();
      
      content = content.replace(/```json/g, '').replace(/```/g, '');
      const newActions = JSON.parse(content);
      
      const updatedEvent = await updateRiskEventActions(event.id || '', newActions);
      toast.success('AI Remediation Plan generated successfully!');
      onUpdate(updatedEvent);
    } catch (e) {
      console.error(e);
      toast.error('Failed to generate AI plan. Is Mistral running locally?');
    } finally {
      setIsGenerating(false);
    }
  };

  const actions = event.actions || [];
  const doneActions = actions.filter(a => a.completed);
  const totalReduction = doneActions.reduce((s, a) => s + (a.scoreReduction || a.score_reduction || 0), 0);
  const currentScore = event.currentScore || 50;
  const projectedScore = Math.max(0, currentScore + totalReduction);
  
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
              <h2 className="text-xl font-bold text-slate-900 mb-1">{event.supplierName || event.supplier}</h2>
              <div className="text-[13px] text-slate-500">{event.description || event.desc}</div>
              
              {event.runId && (
                <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 mt-4 flex items-center gap-5 text-[12px] text-slate-600">
                  <div><strong className="text-slate-900 font-semibold">Run ID:</strong> {event.runId}</div>
                  <div><strong className="text-slate-900 font-semibold">Date:</strong> {event.runDate || event.date}</div>
                  <div><strong className="text-slate-900 font-semibold">Source Task:</strong> {event.taskName || 'System Detection'}</div>
                </div>
              )}
            </div>
            <button onClick={onClose} className="bg-transparent border-none cursor-pointer text-slate-400 p-1 shrink-0 hover:text-slate-800 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Score Banner */}
        <div className="grid grid-cols-3 border-b border-slate-200 shrink-0">
          <div className="px-6 py-3.5 border-r border-slate-200">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-1">Current Risk Score</div>
            <div className="text-[28px] font-extrabold text-red-500">{currentScore}</div>
          </div>
          <div className={`px-6 py-3.5 border-r border-slate-200 ${doneActions.length > 0 ? 'bg-emerald-50' : 'bg-slate-50'}`}>
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-1">Projected After Actions</div>
            <div className={`text-[28px] font-extrabold flex items-center gap-1.5 ${doneActions.length > 0 ? 'text-emerald-500' : 'text-slate-400'}`}>
              {projectedScore}
              {doneActions.length > 0 && <TrendingDown size={18} className="text-emerald-500" />}
            </div>
          </div>
          <div className="px-6 py-3.5">
            <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-[0.07em] mb-1">Max Possible Reduction</div>
            <div className="text-[28px] font-extrabold text-sky-500">
              {actions.reduce((s, a) => s + (a.scoreReduction || a.score_reduction || 0), 0)} pts
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-7 py-5 flex flex-col gap-6">
          {/* What happened */}
          <div>
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">What Happened</div>
            <p className="text-sm text-slate-700 m-0 leading-[1.65] bg-slate-50 px-4 py-3.5 rounded-[10px] border border-slate-200">
              {event.fullDetail}
            </p>
          </div>

          {/* Business Impact */}
          {event.impact && (
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em] mb-2">Business Impact</div>
              <div className="bg-amber-50 border border-amber-200 rounded-[10px] px-4 py-3 flex gap-2.5">
                <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-amber-900 m-0 leading-[1.6]">{event.impact}</p>
              </div>
            </div>
          )}

          {/* Action Plan */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.08em]">
                  Remediation Action Plan
                </div>
                {doneActions.length > 0 && (
                  <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                    {doneActions.length}/{actions.length} completed · {Math.abs(totalReduction)} pts reduced
                  </span>
                )}
              </div>
              
              <button 
                onClick={generatePlan} 
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 border border-indigo-200/50 rounded-lg text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                Generate AI Plan
              </button>
            </div>
            
            <div className="flex flex-col gap-3">
              {actions.map((action, i) => {
                const done = action.completed;
                const [efBgClass, efTextClass] = effortColors[action.effort] || effortColors['Low'];
                return (
                  <div
                    key={action.id || i}
                    className={`rounded-[10px] px-4 py-3.5 transition-all duration-200 border ${done ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200 bg-white shadow-sm'}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Checkbox */}
                      <div
                        onClick={() => { if (!done) toggle(action.id); }}
                        className={`w-[22px] h-[22px] rounded-[6px] shrink-0 ${done ? 'cursor-default' : 'cursor-pointer'} mt-px flex items-center justify-center border-2 ${done ? 'border-emerald-500 bg-emerald-500' : 'border-slate-300 bg-white hover:border-emerald-400'}`}
                      >
                        {done && <Check size={13} color="#fff" strokeWidth={3} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1.5">
                          <span className="text-[11px] text-slate-400 font-bold">{i + 1}</span>
                          <span className={`text-[13px] font-bold ${done ? 'text-emerald-600 line-through' : 'text-slate-900'}`}>
                            {action.title}
                          </span>
                        </div>
                        <p className={`text-[13px] m-0 mb-3 leading-[1.5] ${done ? 'text-emerald-600/70' : 'text-slate-500'}`}>
                          {action.detail}
                        </p>
                        <div className="flex gap-2 flex-wrap">
                          <span className="text-[11px] font-bold text-emerald-600 bg-emerald-100/50 px-2 py-0.5 rounded-[5px]">
                            {action.scoreReduction || action.score_reduction} pts
                          </span>
                          {/* <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-[5px]">
                            Owner: {action.owner}
                          </span> */}
                          <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[5px] ${efBgClass} ${efTextClass}`}>
                            Effort: {action.effort}
                          </span>
                        </div>
                      </div>
                      {done && <CheckCircle2 size={18} className="text-emerald-500 shrink-0" />}
                    </div>
                  </div>
                );
              })}
              {actions.length === 0 && (
                <div className="text-center py-6 border border-dashed border-slate-300 rounded-xl text-slate-400 text-[13px]">
                  No actions defined. Generate an AI remediation plan to proceed.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-7 py-4 border-t border-slate-200 flex justify-between items-center shrink-0 bg-slate-50 rounded-b-2xl">
          <div className="flex gap-2.5">
            <button
              onClick={() => handleUpdateStatus('In Review')}
              disabled={isUpdatingStatus || event.status === 'In Review'}
              className="bg-amber-100 text-amber-700 hover:bg-amber-200 border-none rounded-lg px-4 py-2 text-[13px] font-bold transition-colors disabled:opacity-50"
            >
              Mark In Review
            </button>
            <button
              onClick={() => handleUpdateStatus('Resolved')}
              disabled={isUpdatingStatus || event.status === 'Resolved'}
              className="bg-emerald-100 text-emerald-700 hover:bg-emerald-200 border-none rounded-lg px-4 py-2 text-[13px] font-bold transition-colors disabled:opacity-50"
            >
              Mark Resolved
            </button>
          </div>
          <div className="flex gap-2.5">
            <button
              onClick={onClose}
              className="bg-white text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-semibold transition-colors"
            >
              Close
            </button>
            <button
              onClick={() => toast.success(`Action plan exported for ${event.supplierName || event.supplier}`)}
              className="bg-sky-500 text-white border-none hover:bg-sky-600 rounded-lg px-5 py-2 text-[13px] font-bold transition-colors"
            >
              Export Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

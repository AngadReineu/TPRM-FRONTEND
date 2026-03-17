import { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CheckCircle2, ArrowRight, Zap, Clock, Eye,
  AlertTriangle, Plus, Pencil, ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { getTemplates } from '../services/templates.data';
import { AnomalyPreviewModal } from '../components/AnomalyPreviewModal';
import { DeployedOverlay } from '../components/DeployedOverlay';

const TEMPLATES = getTemplates();

export function TemplatesPage() {
  const navigate = useNavigate();
  const [deployed, setDeployed] = useState<string | null>(null);
  const [viewLogic, setViewLogic] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const handleDeploy = (tpl: (typeof TEMPLATES)[0]) => {
    setDeployed(tpl.id);
    setTimeout(() => {
      setDeployed(null);
      navigate('/agents', {
        state: {
          openCreateModal: true,
          templatePreset: { frequency: tpl.frequency, alertLevel: tpl.alertLevel, controls: tpl.controls, name: `${tpl.title} Agent` },
        },
      });
      toast.success(`${tpl.title} template deployed to Agent creation`);
    }, 1800);
  };

  const logicTpl = TEMPLATES.find(t => t.id === viewLogic);

  return (
    <div className="max-w-[1100px]">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 m-0">Agent Templates</h1>
        <p className="text-sm text-slate-500 mt-1.5">
          Pre-built agent personalities. Inspect the AI logic before deploying.
        </p>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-[repeat(auto-fill,minmax(460px,1fr))] gap-5">
        {TEMPLATES.map(tpl => {
          const Icon = tpl.icon;
          const isHov = hoveredId === tpl.id;
          return (
            <div
              key={tpl.id}
              onMouseEnter={() => setHoveredId(tpl.id)}
              onMouseLeave={() => setHoveredId(null)}
              className="bg-white rounded-2xl overflow-hidden flex flex-col transition-all duration-[180ms] ease-in-out"
              style={{
                border: `1px solid ${isHov ? tpl.color : '#E2E8F0'}`,
                boxShadow: isHov ? '0 8px 28px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <div className="h-1" style={{ backgroundColor: tpl.color }} />

              <div className="px-6 py-[22px] flex-1">
                <div className="flex items-start gap-3.5 mb-4">
                  <div
                    className="w-[52px] h-[52px] rounded-[14px] flex items-center justify-center shrink-0"
                    style={{ backgroundColor: tpl.bg, border: `1px solid ${tpl.border}` }}
                  >
                    <Icon size={24} color={tpl.color} strokeWidth={1.7} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-[3px]">
                      <span className="text-[17px] font-bold text-slate-900">{tpl.title}</span>
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: tpl.badgeBg, color: tpl.badgeColor }}
                      >
                        {tpl.badge}
                      </span>
                    </div>
                    <div className="text-[13px] text-slate-500">{tpl.subtitle}</div>
                  </div>
                </div>

                <p className="text-[13px] text-slate-600 leading-relaxed mb-[18px]">{tpl.description}</p>

                <div className="flex flex-col gap-1.5 mb-[18px]">
                  {tpl.capabilities.map(cap => (
                    <div key={cap} className="flex items-center gap-2">
                      <CheckCircle2 size={13} color={tpl.color} strokeWidth={2.5} />
                      <span className="text-[13px] text-slate-700">{cap}</span>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2 flex-wrap">
                  <div className="flex items-center gap-[5px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    <Clock size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500">{tpl.frequency}</span>
                  </div>
                  <div className="flex items-center gap-[5px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    <Zap size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500">Alert: {tpl.alertLevel}</span>
                  </div>
                  <div className="flex items-center gap-[5px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    <ShieldCheck size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500">{tpl.controls.length} controls</span>
                  </div>
                  <div className="flex items-center gap-[5px] bg-slate-50 border border-slate-200 rounded-full px-2.5 py-1">
                    <AlertTriangle size={11} className="text-slate-400" />
                    <span className="text-[11px] text-slate-500">{tpl.logic.length} triggers</span>
                  </div>
                </div>
              </div>

              {/* Footer -- View Logic + Deploy */}
              <div className="px-6 py-3.5 border-t border-slate-100 flex justify-between items-center bg-[#FAFBFC]">
                <button
                  onClick={() => setViewLogic(tpl.id)}
                  className="flex items-center gap-[5px] bg-white text-slate-500 border border-slate-200 rounded-lg px-3.5 py-[7px] text-[13px] cursor-pointer transition-all duration-150 hover:border-slate-400 hover:text-slate-700"
                >
                  <Eye size={13} /> View Logic
                </button>
                <button
                  onClick={() => handleDeploy(tpl)}
                  className="flex items-center gap-1.5 text-white border-none rounded-lg px-4 py-2 text-[13px] font-semibold cursor-pointer transition-opacity duration-150 hover:opacity-90"
                  style={{ backgroundColor: tpl.color }}
                >
                  Deploy <ArrowRight size={14} />
                </button>
              </div>
            </div>
          );
        })}

        {/* Custom Personality -- dashed card */}
        <div
          onMouseEnter={() => setHoveredId('custom')}
          onMouseLeave={() => setHoveredId(null)}
          onClick={() => navigate('/agents', { state: { openCreateModal: true, templatePreset: { name: 'Custom Agent' } } })}
          className={`rounded-2xl flex flex-col items-center justify-center px-6 py-12 cursor-pointer transition-all duration-[180ms] ease-in-out text-center min-h-[280px] border-2 border-dashed ${
            hoveredId === 'custom'
              ? 'bg-slate-50 border-slate-400'
              : 'bg-white border-slate-300'
          }`}
        >
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 transition-colors duration-150 ${
              hoveredId === 'custom' ? 'bg-slate-200' : 'bg-slate-100'
            }`}
          >
            <Pencil size={24} className="text-slate-400" strokeWidth={1.5} />
          </div>
          <div className="text-[17px] font-bold text-slate-700 mb-2">Create Custom Personality</div>
          <div className="text-[13px] text-slate-400 leading-relaxed max-w-[260px] mb-5">
            Define your own monitoring parameters, triggers, and anomaly detection rules from scratch.
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 border border-slate-200 rounded-lg px-4 py-2 text-[13px] font-semibold text-slate-500">
            <Plus size={14} /> Start from scratch
          </div>
        </div>
      </div>

      {/* Modals */}
      {deployed && (
        <DeployedOverlay
          title={TEMPLATES.find(t => t.id === deployed)?.title ?? ''}
          onClose={() => setDeployed(null)}
        />
      )}
      {viewLogic && logicTpl && (
        <AnomalyPreviewModal tpl={logicTpl} onClose={() => setViewLogic(null)} />
      )}

      <style>{`@keyframes scaleIn{from{opacity:0;transform:scale(0.93)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

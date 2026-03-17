import { CheckCircle2 } from 'lucide-react';

interface DeployedOverlayProps {
  title: string;
  onClose: () => void;
}

export function DeployedOverlay({ title, onClose }: DeployedOverlayProps) {
  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center">
      <div onClick={onClose} className="absolute inset-0 bg-slate-900/45 backdrop-blur-[2px]" />
      <div className="relative w-[380px] bg-white rounded-2xl px-8 py-10 text-center shadow-[0_24px_64px_rgba(0,0,0,0.22)] animate-[scaleIn_0.18s_ease]">
        <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 size={32} color="#10B981" strokeWidth={1.6} />
        </div>
        <div className="text-[22px] font-bold text-slate-900 mb-2">Template Deployed!</div>
        <div className="text-sm text-slate-500 mb-7 leading-relaxed">
          <strong className="text-slate-900">{title}</strong> template has been loaded into the Agent creation flow. Redirecting now&hellip;
        </div>
        <button
          onClick={onClose}
          className="bg-sky-500 text-white border-none rounded-[10px] px-7 py-[11px] text-sm font-semibold cursor-pointer"
        >
          Go to Agents &rarr;
        </button>
      </div>
    </div>
  );
}

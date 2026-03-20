import { MoveUpRight, MoveDownLeft, Repeat2 } from 'lucide-react';
import type { Supplier, AssessmentStatus } from '../types';
import type { PiiFlow } from '@/types/shared';

interface PIIColumnProps {
  pii: Supplier['pii'];
  assessment: AssessmentStatus;
  piiFlow?: PiiFlow;
  onConfigure?: () => void;
}

const FLOW_CONFIG: Record<PiiFlow, { icon: typeof MoveUpRight; color: string; label: string }> = {
  share:  { icon: MoveUpRight,  color: '#0EA5E9', label: 'Share' },
  ingest: { icon: MoveDownLeft,  color: '#10B981', label: 'Ingest' },
  both:   { icon: Repeat2,       color: '#8B5CF6', label: 'Both' },
};

function FlowIndicator({ piiFlow }: { piiFlow?: PiiFlow }) {
  if (!piiFlow) return null;
  const { icon: Icon, color, label } = FLOW_CONFIG[piiFlow];
  return (
    <div className="flex items-center gap-0.5 mt-0.5">
      <Icon size={11} color={color} />
      <span className="text-[10px]" style={{ color }}>{label}</span>
    </div>
  );
}

export function PIIColumn({ pii, assessment, piiFlow, onConfigure }: PIIColumnProps) {
  /* Not configured and not 'configure' method */
  if (!pii.configured && pii.method !== 'configure') {
    return (
      <div>
        <span className="text-xs text-slate-400">Assessment required</span>
        <FlowIndicator piiFlow={piiFlow} />
      </div>
    );
  }

  /* Configure button */
  if (pii.method === 'configure') {
    const canConfigure = assessment === 'complete';
    return (
      <div>
        <button
          disabled={!canConfigure}
          title={canConfigure ? 'Configure PII sharing' : 'Available after assessment is complete'}
          onClick={onConfigure}
          className={`text-xs font-semibold bg-transparent border-none p-0 ${
            canConfigure
              ? 'text-sky-500 cursor-pointer'
              : 'text-slate-300 cursor-not-allowed'
          }`}
        >
          Configure &rarr;
        </button>
        <FlowIndicator piiFlow={piiFlow} />
      </div>
    );
  }

  /* Configured with icons */
  return (
    <div>
      <div className="flex gap-0.5 flex-wrap mb-0.5">
        {pii.icons?.map(icon => (
          <span
            key={icon}
            className="bg-slate-100 text-slate-500 text-[10px] px-1.5 py-px rounded"
          >
            {icon}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[11px] text-slate-400">{pii.method}</span>
        {piiFlow && (
          <>
            <span className="text-slate-200">&middot;</span>
            <FlowIndicator piiFlow={piiFlow} />
          </>
        )}
      </div>
    </div>
  );
}

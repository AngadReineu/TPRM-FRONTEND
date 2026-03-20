import { ChevronLeft, ChevronRight, Check } from 'lucide-react';
import { useNavigate } from 'react-router';
import { usePortal } from '../context/PortalContext';

interface PortalFooterProps {
  currentStep: number;
  canProceed?: boolean;
  token?: string;
}

const STEP_PATHS: Record<number, string> = {
  1: 'step/1',
  2: 'step/2',
  3: 'step/3',
  4: 'step/4',
  5: 'step/5',
};

export function PortalFooter({ currentStep, canProceed = true, token }: PortalFooterProps) {
  const navigate = useNavigate();
  const { completion, savedStatus, triggerSave } = usePortal();

  const handleBack = () => {
    if (currentStep > 1) navigate(`/portal/${token}/${STEP_PATHS[currentStep - 1]}`);
  };

  const handleNext = () => {
    if (canProceed && currentStep < 5) navigate(`/portal/${token}/${STEP_PATHS[currentStep + 1]}`);
    if (canProceed && currentStep === 5) navigate(`/portal/${token}/success`);
  };

  return (
    <footer className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E2E8F0]" style={{ height: 72 }}>
      {/* Progress bar */}
      <div className="w-full h-1 bg-[#E2E8F0]">
        <div
          className="h-full bg-[#0EA5E9] transition-all duration-700"
          style={{ width: `${completion}%` }}
        />
      </div>

      <div className="flex items-center justify-between px-8 h-[68px]">
        {/* Left: Completion */}
        <div className="min-w-[200px]">
          <p style={{ fontSize: '13px', color: '#64748B' }}>
            Overall completion: <span style={{ fontWeight: 600, color: '#0EA5E9' }}>{completion}%</span>
          </p>
        </div>

        {/* Center: Save */}
        <div className="flex items-center">
          <button
            type="button"
            onClick={triggerSave}
            className={`px-4 py-2 rounded-lg border text-[13px] transition-all cursor-pointer ${
              savedStatus === 'saved'
                ? 'border-[#10B981] text-[#10B981] bg-[#ECFDF5]'
                : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            {savedStatus === 'saved' ? (
              <span className="flex items-center gap-1.5">
                <Check size={13} /> Saved
              </span>
            ) : savedStatus === 'saving' ? (
              'Saving...'
            ) : (
              'Save Progress'
            )}
          </button>
        </div>

        {/* Right: Back + Next */}
        <div className="flex items-center gap-3 min-w-[200px] justify-end">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg border text-[14px] transition-all cursor-pointer ${
              currentStep === 1
                ? 'opacity-40 cursor-not-allowed border-[#E2E8F0] text-[#94A3B8]'
                : 'border-[#E2E8F0] text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            <ChevronLeft size={15} />
            Back
          </button>

          {currentStep < 5 && (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canProceed}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-lg text-[14px] transition-all cursor-pointer ${
                !canProceed
                  ? 'opacity-40 cursor-not-allowed bg-[#0EA5E9] text-white'
                  : 'bg-[#0EA5E9] hover:bg-[#0284C7] text-white'
              }`}
            >
              Next
              <ChevronRight size={15} />
            </button>
          )}
        </div>
      </div>
    </footer>
  );
}
import { Check } from 'lucide-react';
import { useNavigate } from 'react-router';

const STEPS = [
  { id: 1, label: 'Company Info', sub: 'Basic details', path: '/step/1' },
  { id: 2, label: 'Upload Documents', sub: '5 required', path: '/step/2' },
  { id: 3, label: 'Historic & Compliance', sub: 'Compliance', path: '/step/3' },
  { id: 4, label: 'Security Questionnaire', sub: '67 questions', path: '/step/4' },
  { id: 5, label: 'Review & Submit', sub: 'Sign & submit', path: '/step/5' },
];

interface ProgressStepperProps {
  currentStep: number;
}

export function ProgressStepper({ currentStep }: ProgressStepperProps) {
  const navigate = useNavigate();

  return (
    <div
      className="fixed z-40 left-0 right-0 bg-white border-b border-[#E2E8F0] px-8"
      style={{ top: 64 }}
    >
      <div className="max-w-[860px] mx-auto flex items-start py-4">
        {STEPS.map((step, idx) => {
          const isCompleted = step.id < currentStep;
          const isCurrent = step.id === currentStep;

          return (
            <div key={step.id} className="flex items-start flex-1 last:flex-none">
              {/* Step item */}
              <button
                type="button"
                onClick={() => isCompleted && navigate(step.path)}
                className={`flex flex-col items-center gap-1 min-w-0 ${isCompleted ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {/* Badge */}
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0 ${
                    isCompleted
                      ? 'bg-[#10B981]'
                      : isCurrent
                      ? 'bg-[#0EA5E9]'
                      : 'bg-white border-2 border-[#E2E8F0]'
                  }`}
                >
                  {isCompleted ? (
                    <Check size={16} color="white" strokeWidth={2.5} />
                  ) : (
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: isCurrent ? 'white' : '#94A3B8',
                      }}
                    >
                      {step.id}
                    </span>
                  )}
                </div>

                {/* Labels */}
                <div className="text-center">
                  <div
                    style={{
                      fontSize: '12px',
                      fontWeight: isCompleted ? 500 : isCurrent ? 600 : 400,
                      color: isCompleted ? '#10B981' : isCurrent ? '#0EA5E9' : '#94A3B8',
                      whiteSpace: 'nowrap',
                    }}
                    className="hidden sm:block"
                  >
                    {step.label}
                  </div>
                  <div
                    style={{ fontSize: '11px', color: '#94A3B8', whiteSpace: 'nowrap' }}
                    className="hidden md:block"
                  >
                    {step.sub}
                  </div>
                </div>
              </button>

              {/* Connector — aligned to badge center (18px = half of 36px badge) */}
              {idx < STEPS.length - 1 && (
                <div className="flex-1 mx-2 sm:mx-3 min-w-4" style={{ marginTop: 18, height: 2 }}>
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      backgroundColor: isCompleted ? '#10B981' : '#E2E8F0',
                    }}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
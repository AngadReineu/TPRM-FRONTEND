import { Check } from 'lucide-react';

interface Step {
  id: number;
  label: string;
}

interface StepperBarProps {
  steps: Step[];
  currentStep: number;
}

export function StepperBar({ steps, currentStep }: StepperBarProps) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] px-6 py-5 mb-5">
      <div className="flex items-center">
        {steps.map((step, idx) => {
          const completed = step.id < currentStep;
          const active = step.id === currentStep;
          return (
            <div
              key={step.id}
              className={`flex items-center ${idx < steps.length - 1 ? 'flex-1' : 'flex-none'}`}
            >
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`flex items-center justify-center shrink-0 rounded-full w-8 h-8 ${
                    completed
                      ? 'bg-[#10B981]'
                      : active
                        ? 'bg-[#0EA5E9]'
                        : 'bg-white border-2 border-[#E2E8F0]'
                  }`}
                >
                  {completed ? (
                    <Check size={16} color="#fff" strokeWidth={2.5} />
                  ) : (
                    <span
                      className={`text-[13px] font-bold ${active ? 'text-white' : 'text-[#94A3B8]'}`}
                    >
                      {step.id}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[11px] whitespace-nowrap ${active ? 'font-semibold text-[#0EA5E9]' : 'font-normal text-[#94A3B8]'}`}
                >
                  {step.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 mx-1.5 mb-5 h-0.5 ${completed ? 'bg-[#10B981]' : 'bg-[#E2E8F0]'}`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

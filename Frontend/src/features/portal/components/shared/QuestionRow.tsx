import React from 'react';

interface QuestionRowProps {
  number: string;
  question: string;
  helper?: string;
  children: React.ReactNode;
  className?: string;
}

export function QuestionRow({ number, question, helper, children, className }: QuestionRowProps) {
  return (
    <div className={`py-4 border-b border-[#E2E8F0] last:border-0 ${className ?? ''}`}>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-start gap-2">
            <span className="text-[12px] font-semibold text-[#94A3B8] mt-0.5 shrink-0 w-7">{number}.</span>
            <div>
              <p className="text-[14px] font-medium text-[#334155] leading-snug">{question}</p>
              {helper && (
                <p className="text-[13px] text-[#64748B] mt-0.5">{helper}</p>
              )}
            </div>
          </div>
        </div>
        <div className="pl-9 sm:pl-0 sm:shrink-0">
          {children}
        </div>
      </div>
    </div>
  );
}

interface SectionHeaderProps {
  letter?: string;
  title: string;
}

export function SectionHeader({ letter, title }: SectionHeaderProps) {
  return (
    <div className="flex items-center gap-2 mb-4 pt-2">
      {letter && (
        <span className="text-[12px] font-semibold tracking-wider text-[#94A3B8] uppercase">{letter}.</span>
      )}
      <span className="text-[12px] font-semibold tracking-wider text-[#94A3B8] uppercase">{title}</span>
      <div className="flex-1 h-px bg-[#E2E8F0]" />
    </div>
  );
}

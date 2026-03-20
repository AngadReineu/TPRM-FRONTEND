import { useState } from 'react';
import { CheckCircle2, Copy, Check, Shield } from 'lucide-react';
import { motion } from 'motion/react';

const REFERENCE_ID = 'TPRM-2026-4821';
const SUPPLIER_EMAIL = 'supplier@company.com';

const NEXT_STEPS = [
  {
    num: '1',
    title: 'AI Analysis (1–2 days)',
    detail: 'Our AI engine will analyze your responses and uploaded documents for risk indicators.',
  },
  {
    num: '2',
    title: 'Risk Score Calculated',
    detail: 'You will receive an email with your preliminary risk score and initial findings.',
  },
  {
    num: '3',
    title: 'Organization Review',
    detail: 'The requesting organization will review your assessment and may contact you for clarification.',
  },
];

export function SuccessScreen() {
  const [copied, setCopied] = useState(false);

  const copyId = () => {
    navigator.clipboard.writeText(REFERENCE_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{ background: 'linear-gradient(135deg, #F8FAFC 0%, #ffffff 100%)' }}
    >
      {/* Logo / Brand */}
      <div className="flex items-center gap-2 mb-10">
        <Shield size={22} color="#0EA5E9" />
        <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>TPRM Platform</span>
      </div>

      {/* Success Card */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-white border border-[#E2E8F0] rounded-2xl p-10 text-center w-full max-w-[560px] shadow-sm"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 12 }}
          className="flex justify-center mb-5"
        >
          <div className="w-20 h-20 rounded-full bg-[#ECFDF5] flex items-center justify-center">
            <CheckCircle2 size={44} color="#10B981" />
          </div>
        </motion.div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, color: '#0F172A' }} className="mb-3">
          Assessment Submitted!
        </h1>
        <p style={{ fontSize: '16px', color: '#64748B' }} className="mb-6">
          Thank you for completing your security assessment.
        </p>

        {/* Reference ID Card */}
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-4 mb-6">
          <p style={{ fontSize: '12px', color: '#94A3B8', letterSpacing: '0.1em' }} className="uppercase mb-2">
            Your Reference ID
          </p>
          <div className="flex items-center justify-center gap-3">
            <span style={{ fontSize: '24px', fontWeight: 700, color: '#0F172A', letterSpacing: '0.02em' }}>
              {REFERENCE_ID}
            </span>
            <button
              type="button"
              onClick={copyId}
              className="p-2 rounded-lg hover:bg-[#E2E8F0] transition-colors cursor-pointer"
              title="Copy reference ID"
            >
              {copied ? (
                <Check size={16} color="#10B981" />
              ) : (
                <Copy size={16} color="#64748B" />
              )}
            </button>
          </div>
          {copied && (
            <p style={{ fontSize: '12px', color: '#10B981' }} className="mt-1">
              Copied to clipboard!
            </p>
          )}
        </div>

        {/* Email confirmation */}
        <p style={{ fontSize: '14px', color: '#64748B' }} className="mb-6">
          A confirmation has been sent to{' '}
          <span style={{ color: '#0F172A', fontWeight: 500 }}>{SUPPLIER_EMAIL}</span>
        </p>
      </motion.div>

      {/* What happens next */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-xl p-6 text-left w-full max-w-[560px] mt-5"
      >
        <h2 style={{ fontSize: '15px', fontWeight: 700, color: '#1E40AF' }} className="mb-4">
          What happens next?
        </h2>
        <div className="space-y-4">
          {NEXT_STEPS.map((step, idx) => (
            <motion.div
              key={step.num}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + idx * 0.12, duration: 0.35 }}
              className="flex items-start gap-4"
            >
              <div
                className="w-8 h-8 rounded-full bg-[#DBEAFE] flex items-center justify-center shrink-0"
              >
                <span style={{ fontSize: '13px', fontWeight: 700, color: '#2563EB' }}>{step.num}</span>
              </div>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: '#1E40AF' }}>{step.title}</p>
                <p style={{ fontSize: '13px', color: '#3B82F6' }}>{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <p style={{ fontSize: '13px', color: '#94A3B8' }} className="mt-8 text-center">
        You may close this window. Please keep your reference ID for future correspondence.
      </p>
    </div>
  );
}

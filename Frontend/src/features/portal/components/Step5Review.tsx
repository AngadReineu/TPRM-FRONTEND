import { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle2, AlertCircle, Clock, Copy, Check, Pencil } from 'lucide-react';
import { useNavigate, useParams } from 'react-router';
import { usePortal } from '../context/PortalContext';

const REFERENCE_ID = 'TPRM-2026-4821';
const SUPPLIER_EMAIL = 'supplier@company.com';

// ── Summary sections ─────────────────────────────────────────────────────
const SUMMARY_SECTIONS = [
  { id: 'A', label: 'Historic Information', step: 3, questions: 2 },
  { id: 'B', label: 'Mergers, Acquisitions & Subsidiaries', step: 3, questions: 4 },
  { id: 'C', label: 'Compliance', step: 3, questions: 4 },
  { id: 'D', label: 'Business Continuity Management', step: 3, questions: 9 },
  { id: 'E', label: 'Incident Management', step: 3, questions: 6 },
  { id: 'F', label: 'Supplier Relationships', step: 3, questions: 3 },
  { id: 'G', label: 'System Development & Maintenance', step: 4, questions: 3 },
  { id: 'H', label: 'Communications Security', step: 4, questions: 6 },
  { id: 'I', label: 'Operations Security', step: 4, questions: 7 },
  { id: 'L', label: 'Access Control', step: 4, questions: 12 },
  { id: 'Q', label: 'Technology Implementation', step: 4, questions: 25 },
  { id: 'V', label: 'Fund Transfer', step: 4, questions: 11 },
];

interface SectionCardProps {
  section: typeof SUMMARY_SECTIONS[0];
}

function SectionCard({ section }: SectionCardProps) {
  const [expanded, setExpanded] = useState(false);
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { answers } = usePortal();

  const answered = Object.keys(answers).filter(k => k.startsWith(`${section.id}_`) && answers[k] !== null && answers[k] !== undefined && answers[k] !== '').length;
  const isComplete = answered >= section.questions;

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
        onClick={() => setExpanded(!expanded)}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') setExpanded(!expanded); }}
      >
        <div className="flex items-center gap-3">
          <span
            className={`text-[12px] font-semibold px-2 py-0.5 rounded-full ${
              isComplete
                ? 'bg-[#ECFDF5] text-[#10B981]'
                : answered > 0
                ? 'bg-[#FFFBEB] text-[#F59E0B]'
                : 'bg-[#F1F5F9] text-[#94A3B8]'
            }`}
          >
            {section.id}
          </span>
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{section.label}</span>
          <span className="text-[12px] text-[#94A3B8] bg-[#F8FAFC] rounded-full px-2 py-0.5">
            {answered} / {section.questions} answered
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={e => { e.stopPropagation(); navigate(`/portal/${token}/step/${section.step}`); }}
            className="flex items-center gap-1 text-[12px] text-[#0EA5E9] hover:text-[#0284C7] px-2 py-1 rounded transition-colors cursor-pointer"
          >
            <Pencil size={11} />
            Edit
          </button>
          {expanded ? <ChevronDown size={16} color="#94A3B8" /> : <ChevronRight size={16} color="#94A3B8" />}
        </div>
      </div>

      {expanded && (
        <div className="border-t border-[#E2E8F0] px-5 py-4 space-y-3 bg-[#FAFBFC]">
          {answered === 0 ? (
            <p style={{ fontSize: '13px', color: '#94A3B8' }}>No answers recorded for this section.</p>
          ) : (
            Object.keys(answers)
              .filter(k => k.startsWith(`${section.id}_`))
              .slice(0, 8)
              .map(key => {
                const val = answers[key];
                if (val === null || val === undefined || val === '') return null;
                const label = key.replace(`${section.id}_`, '').replace(/_/g, ' ');
                const isYes = val === 'yes';
                const isNo = val === 'no';
                return (
                  <div key={key} className="flex items-start justify-between gap-3">
                    <span style={{ fontSize: '13px', color: '#64748B' }} className="capitalize">{label}</span>
                    {isYes || isNo ? (
                      <span className={`text-[12px] px-2.5 py-0.5 rounded-full font-medium shrink-0 ${isYes ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#FEF2F2] text-[#EF4444]'}`}>
                        {val === 'yes' ? 'Yes' : 'No'}
                      </span>
                    ) : (
                      <span style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }} className="text-right max-w-[60%] truncate">
                        {Array.isArray(val) ? val.join(', ') : String(val)}
                      </span>
                    )}
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

// ── Checklist ────────────────────────────────────────────────────────────
interface ChecklistItem {
  label: string;
  status: 'complete' | 'warning' | 'pending';
  detail: string;
}

function ChecklistRow({ item }: { item: ChecklistItem }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-[#E2E8F0] last:border-0">
      {item.status === 'complete' && <CheckCircle2 size={16} color="#10B981" className="mt-0.5 shrink-0" />}
      {item.status === 'warning' && <AlertCircle size={16} color="#F59E0B" className="mt-0.5 shrink-0" />}
      {item.status === 'pending' && <Clock size={16} color="#94A3B8" className="mt-0.5 shrink-0" />}
      <div className="flex-1 min-w-0">
        <p style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }}>{item.label}</p>
        <p style={{ fontSize: '12px', color: '#94A3B8' }}>{item.detail}</p>
      </div>
    </div>
  );
}

// ── Declaration block ─────────────────────────────────────────────────────
interface DeclarationProps {
  title: string;
  text: string;
  nameKey: string;
  orgKey: string;
  checkKey: string;
  index: number;
}

function Declaration({ title, text, nameKey, orgKey, checkKey, index }: DeclarationProps) {
  const { answers, setAnswer } = usePortal();

  return (
    <div className="border border-[#E2E8F0] rounded-xl p-5">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-[#EDE9FE] flex items-center justify-center shrink-0">
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#8B5CF6' }}>{index}</span>
        </div>
        <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{title}</span>
      </div>

      <p style={{ fontSize: '14px', color: '#334155', fontStyle: 'italic' }} className="mb-4 p-3 bg-[#F5F3FF] rounded-lg border border-[#EDE9FE]">
        "{text}"
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }} className="block mb-1.5">Full Name</label>
          <input
            type="text"
            value={answers[nameKey] ?? ''}
            onChange={e => setAnswer(nameKey, e.target.value)}
            placeholder="Your full name"
            className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
          />
        </div>
        <div>
          <label style={{ fontSize: '13px', fontWeight: 500, color: '#334155' }} className="block mb-1.5">Organization Name</label>
          <input
            type="text"
            value={answers[orgKey] ?? ''}
            onChange={e => setAnswer(orgKey, e.target.value)}
            placeholder="Your organization name"
            className="w-full border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
          />
        </div>
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={answers[checkKey] ?? false}
          onChange={e => setAnswer(checkKey, e.target.checked)}
          className="w-4 h-4 mt-0.5 rounded border-[#E2E8F0] accent-[#8B5CF6] cursor-pointer"
        />
        <span style={{ fontSize: '14px', color: '#334155' }}>
          I acknowledge and confirm this declaration
        </span>
      </label>
    </div>
  );
}

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function Step5Review() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const { answers, documents, requiredDocsUploaded } = usePortal();
  const [copied, setCopied] = useState(false);

  const decl1Complete = !!(answers['decl1_name'] && answers['decl1_org'] && answers['decl1_check']);
  const decl2Complete = !!(answers['decl2_name'] && answers['decl2_org'] && answers['decl2_check']);
  const bothDeclSigned = decl1Complete && decl2Complete;
  const allDocsUploaded = requiredDocsUploaded >= 5;
  // Validation removed for preview — always allow submit
  const canSubmit = true;

  const answeredTotal = Object.keys(answers).filter(k => {
    const val = answers[k];
    return val !== null && val !== undefined && val !== '' && !k.startsWith('decl') && !k.startsWith('fin');
  }).length;

  const uploadedOptional = Object.keys(documents).filter(k =>
    k.startsWith('doc_') && !['doc_info_security_policy', 'doc_data_privacy_policy', 'doc_bcp', 'doc_cyber_insurance', 'doc_iso_soc'].includes(k) && documents[k]?.status === 'uploaded'
  ).length;

  const checklist: ChecklistItem[] = [
    {
      label: 'Company Information',
      status: answers['s1_company_name'] ? 'complete' : 'warning',
      detail: answers['s1_company_name'] ? 'Complete' : 'Basic details missing',
    },
    {
      label: 'Documents Uploaded',
      status: allDocsUploaded ? 'complete' : 'warning',
      detail: `${requiredDocsUploaded}/5 required · ${uploadedOptional}/3 optional`,
    },
    {
      label: 'Historic & Compliance',
      status: answeredTotal > 10 ? 'complete' : 'warning',
      detail: `${Math.min(answeredTotal, 28)} / 28 questions answered`,
    },
    {
      label: 'Security Questionnaire',
      status: answeredTotal > 30 ? 'complete' : 'warning',
      detail: `${Math.min(Math.max(answeredTotal - 10, 0), 67)} / 67 answered`,
    },
    {
      label: 'Review & Submit',
      status: bothDeclSigned ? 'complete' : 'pending',
      detail: bothDeclSigned ? 'Declarations signed' : 'Pending',
    },
  ];

  const copyId = () => {
    navigator.clipboard.writeText(REFERENCE_ID).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Review & Submit</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }} className="mt-1">
          Review your answers before submitting. You can go back to edit any section.
        </p>
      </div>

      {/* Two-column layout */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        {/* Left: Answers summary */}
        <div className="flex-1 space-y-3 min-w-0">
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>Answers Summary</h2>
          {SUMMARY_SECTIONS.map(section => (
            <SectionCard key={section.id} section={section} />
          ))}
        </div>

        {/* Right: Submission checklist */}
        <div className="lg:w-72 shrink-0 space-y-4 lg:sticky lg:top-[160px]">
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-5">
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }} className="mb-4">Your Submission</h2>
            {checklist.map(item => (
              <ChecklistRow key={item.label} item={item} />
            ))}
          </div>

          {/* Reference ID */}
          <div className="bg-white rounded-xl border border-[#E2E8F0] p-4">
            <p style={{ fontSize: '12px', color: '#94A3B8', letterSpacing: '0.08em' }} className="uppercase mb-2">Your Reference ID</p>
            <div className="flex items-center justify-between bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg px-3 py-2">
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>{REFERENCE_ID}</span>
              <button type="button" onClick={copyId} className="text-[#64748B] hover:text-[#0EA5E9] transition-colors cursor-pointer p-1 rounded">
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
              </button>
            </div>
            <p style={{ fontSize: '13px', color: '#64748B' }} className="mt-3">
              A confirmation email will be sent to{' '}
              <span style={{ color: '#0F172A', fontWeight: 500 }}>{SUPPLIER_EMAIL}</span>
              {' '}upon submission.
            </p>
          </div>
        </div>
      </div>

      {/* Declaration Section */}
      <div className="bg-white border border-[#E2E8F0] rounded-xl p-6">
        <div className="flex items-start gap-2 mb-2">
          <div className="w-5 h-5 rounded bg-[#EDE9FE] flex items-center justify-center mt-0.5 shrink-0">
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#8B5CF6' }}>§</span>
          </div>
          <div>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0F172A' }}>Legal Declaration</h2>
            <p style={{ fontSize: '14px', color: '#64748B' }} className="mt-0.5">Both declarations must be signed before you can submit.</p>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          <Declaration
            index={1}
            title="Declaration of Accuracy"
            text='I __________ on behalf of __________ (Organization Name) declare that the information provided is true to its effect and acknowledged that it will be used "as is" by any third party.'
            nameKey="decl1_name"
            orgKey="decl1_org"
            checkKey="decl1_check"
          />
          <Declaration
            index={2}
            title="Consent to Share"
            text="I __________ on behalf of __________ (Organization Name) acknowledges and consents to the sharing and usage of the information with a third party who has signed a contract to protect confidentiality."
            nameKey="decl2_name"
            orgKey="decl2_org"
            checkKey="decl2_check"
          />
        </div>

        {/* Submit button */}
        <div className="mt-6">
          <button
            type="button"
            disabled={!canSubmit}
            onClick={() => canSubmit && navigate(`/portal/${token}/success`)}
            className={`w-full h-[52px] rounded-xl text-white transition-all ${
              canSubmit
                ? 'bg-[#0EA5E9] hover:bg-[#0284C7] cursor-pointer'
                : 'bg-[#0EA5E9] opacity-40 cursor-not-allowed'
            }`}
            style={{ fontSize: '16px', fontWeight: 700 }}
          >
            Submit Assessment
          </button>

          {!canSubmit && (
            <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }} className="mt-3">
              {!allDocsUploaded && !bothDeclSigned
                ? 'Please complete both declarations and upload all required documents to submit.'
                : !allDocsUploaded
                ? 'Please upload all required documents to submit.'
                : 'Please complete both declarations to submit.'}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
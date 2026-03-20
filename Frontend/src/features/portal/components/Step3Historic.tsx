import { usePortal, useAnswer } from '../context/PortalContext';
import { YesNoButtons } from './shared/YesNoButtons';
import { ConditionalReveal } from './shared/ConditionalReveal';
import { QuestionRow, SectionHeader } from './shared/QuestionRow';

function Textarea({ id, placeholder, value, onChange, rows = 3 }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <textarea
      id={id}
      rows={rows}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[14px] text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all resize-none"
    />
  );
}

function TextInput({ id, placeholder, value, onChange }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <input
      id={id}
      type="text"
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[14px] text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all"
    />
  );
}

function CheckboxGroup({ options, selectedKey }: { options: string[]; selectedKey: string }) {
  const { answers, setAnswer } = usePortal();
  const selected: string[] = answers[selectedKey] ?? [];
  const toggle = (opt: string) => {
    const next = selected.includes(opt) ? selected.filter(x => x !== opt) : [...selected, opt];
    setAnswer(selectedKey, next);
  };
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt} className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={selected.includes(opt)}
            onChange={() => toggle(opt)}
            className="w-4 h-4 rounded border-[#E2E8F0] text-[#0EA5E9] accent-[#0EA5E9] cursor-pointer"
          />
          <span style={{ fontSize: '14px', color: '#334155' }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

function SelectInput({ id, options, value, onChange }: {
  id: string; options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <select
      id={id}
      value={value ?? ''}
      onChange={e => onChange(e.target.value)}
      className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all bg-white cursor-pointer"
    >
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

// ─── SECTION A ───────────────────────────────────────────────────────────────
function SectionA() {
  const [q1, setQ1] = useAnswer('A_q1');
  const [q1_claim, setQ1_claim] = useAnswer('A_q1_claim');
  const [q1_detail, setQ1_detail] = useAnswer('A_q1_detail');
  const [q1_steps, setQ1_steps] = useAnswer('A_q1_steps');
  const [q1_systems, setQ1_systems] = useAnswer('A_q1_systems');
  const [q1_data, setQ1_data] = useAnswer('A_q1_data');
  const [q1_money, setQ1_money] = useAnswer('A_q1_money');
  const [q1_improvements, setQ1_improvements] = useAnswer('A_q1_improvements');
  const [q3, setQ3] = useAnswer('A_q3');
  const [q3_detail, setQ3_detail] = useAnswer('A_q3_detail');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="A" title="Historic Information" />

      <QuestionRow number="1" question="Has your organization experienced any cyber or security event in the last 5 years? (Data breach, DDoS, IT disruption, phishing, or fund transfer fraud?)" >
        <YesNoButtons value={q1} onChange={setQ1} />
      </QuestionRow>
      <ConditionalReveal show={q1 === 'yes'}>
        <div className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Describe the event in detail</label>
            <Textarea id="A_q1_detail" placeholder="Describe what happened..." value={q1_detail} onChange={setQ1_detail} rows={3} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Was an insurance claim made?</label>
            <YesNoButtons value={q1_claim} onChange={setQ1_claim} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">What steps were taken to address the incident?</label>
            <Textarea id="A_q1_steps" placeholder="Describe remediation steps..." value={q1_steps} onChange={setQ1_steps} rows={2} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Which systems were affected?</label>
            <Textarea id="A_q1_systems" placeholder="List affected systems..." value={q1_systems} onChange={setQ1_systems} rows={2} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Was any personal/sensitive data stored on affected systems?</label>
            <YesNoButtons value={q1_data} onChange={setQ1_data} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Was any money lost?</label>
            <YesNoButtons value={q1_money} onChange={setQ1_money} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">What improvements were made post-event?</label>
            <Textarea id="A_q1_improvements" placeholder="Describe improvements made..." value={q1_improvements} onChange={setQ1_improvements} rows={2} />
          </div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="3" question="Has your organization ever been investigated in relation to the safeguarding of personal information?">
        <YesNoButtons value={q3} onChange={setQ3} />
      </QuestionRow>
      <ConditionalReveal show={q3 === 'yes'}>
        <Textarea id="A_q3_detail" placeholder="Please describe the investigation..." value={q3_detail} onChange={setQ3_detail} rows={3} />
      </ConditionalReveal>
    </div>
  );
}

// ─── SECTION B ───────────────────────────────────────────────────────────────
function SectionB() {
  const [q1, setQ1] = useAnswer('B_q1');
  const [q1_detail, setQ1_detail] = useAnswer('B_q1_detail');
  const [q2, setQ2] = useAnswer('B_q2');
  const [q2_detail, setQ2_detail] = useAnswer('B_q2_detail');
  const [q3, setQ3] = useAnswer('B_q3');
  const [q4, setQ4] = useAnswer('B_q4');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="B" title="Mergers, Acquisitions & Subsidiaries" />

      <QuestionRow number="1" question="Do you have any planned mergers or acquisitions in the next 12 months?">
        <YesNoButtons value={q1} onChange={setQ1} />
      </QuestionRow>
      <ConditionalReveal show={q1 === 'yes'}>
        <Textarea id="B_q1_detail" placeholder="Please describe the planned activity..." value={q1_detail} onChange={setQ1_detail} rows={3} />
      </ConditionalReveal>

      <QuestionRow number="2" question="Have you undertaken any mergers or acquisitions in the last 5 years?">
        <YesNoButtons value={q2} onChange={setQ2} />
      </QuestionRow>
      <ConditionalReveal show={q2 === 'yes'}>
        <Textarea id="B_q2_detail" placeholder="Please describe the completed activity..." value={q2_detail} onChange={setQ2_detail} rows={3} />
      </ConditionalReveal>

      <QuestionRow number="3" question="Is IT security centralized for all subsidiaries?">
        <YesNoButtons value={q3} onChange={setQ3} />
      </QuestionRow>

      <QuestionRow number="4" question="Is there any network interconnection between your organization and covered entities?">
        <YesNoButtons value={q4} onChange={setQ4} />
      </QuestionRow>
      <ConditionalReveal show={q4 === 'yes'}>
        <CheckboxGroup
          selectedKey="B_q4_types"
          options={[
            'Shared internet connection',
            'Site-to-site VPN',
            'Direct network link (MPLS / leased line)',
            'Cloud-based shared services',
            'Other (describe)',
          ]}
        />
      </ConditionalReveal>
    </div>
  );
}

// ─── SECTION C ───────────────────────────────────────────────────────────────
function SectionC() {
  const [q2, setQ2] = useAnswer('C_q2');
  const [q2_detail, setQ2_detail] = useAnswer('C_q2_detail');
  const [q3, setQ3] = useAnswer('C_q3');
  const [q3_name, setQ3_name] = useAnswer('C_q3_name');
  const [q4, setQ4] = useAnswer('C_q4');
  const [q4_freq, setQ4_freq] = useAnswer('C_q4_freq');
  const [q4_date, setQ4_date] = useAnswer('C_q4_date');
  const [q4_scope, setQ4_scope] = useAnswer('C_q4_scope');
  const [q4_log4, setQ4_log4] = useAnswer('C_q4_log4');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="C" title="Compliance" />

      <QuestionRow number="1" question="Do you have procedures to comply with relevant privacy regulations?">
        <CheckboxGroup
          selectedKey="C_q1_regs"
          options={['GDPR (EU)', 'HIPAA (US Healthcare)', 'DPDPA (India)', 'SEBI Regulations', 'RBI Guidelines', 'IRDAI Guidelines', 'None of the above']}
        />
      </QuestionRow>

      <QuestionRow number="2" question="Do you have data retention and disposal guidelines?">
        <YesNoButtons value={q2} onChange={setQ2} />
      </QuestionRow>
      <ConditionalReveal show={q2 === 'yes'}>
        <Textarea id="C_q2_detail" placeholder="Describe your retention policy..." value={q2_detail} onChange={setQ2_detail} rows={3} />
      </ConditionalReveal>

      <QuestionRow number="3" question="Have you assigned a Data Privacy Officer (DPO)?">
        <YesNoButtons value={q3} onChange={setQ3} />
      </QuestionRow>
      <ConditionalReveal show={q3 === 'yes'}>
        <TextInput id="C_q3_name" placeholder="DPO name and contact information" value={q3_name} onChange={setQ3_name} />
      </ConditionalReveal>

      <QuestionRow number="4" question="Do you conduct regular VAPT / penetration testing?">
        <YesNoButtons value={q4} onChange={setQ4} />
      </QuestionRow>
      <ConditionalReveal show={q4 === 'yes'}>
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Frequency</label>
              <SelectInput id="C_q4_freq" options={['Quarterly', 'Semi-annual', 'Annual', 'Ad-hoc']} value={q4_freq} onChange={setQ4_freq} />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Last VAPT date</label>
              <input type="date" value={q4_date ?? ''} onChange={e => setQ4_date(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
            </div>
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Scope description</label>
            <Textarea id="C_q4_scope" placeholder="Describe the VAPT scope..." value={q4_scope} onChange={setQ4_scope} rows={2} />
          </div>
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Were Log4Shell / Apache vulnerabilities included in scope?</label>
            <YesNoButtons value={q4_log4} onChange={setQ4_log4} />
          </div>
        </div>
      </ConditionalReveal>
    </div>
  );
}

// ─── SECTION D ───────────────────────────────────────────────────────────────
function SectionD() {
  const [q1, setQ1] = useAnswer('D_q1');
  const [q1_date, setQ1_date] = useAnswer('D_q1_date');
  const [q2, setQ2] = useAnswer('D_q2');
  const [q3, setQ3] = useAnswer('D_q3');
  const [q3_freq, setQ3_freq] = useAnswer('D_q3_freq');
  const [q4, setQ4] = useAnswer('D_q4');
  const [q5, setQ5] = useAnswer('D_q5');
  const [q6_val, setQ6_val] = useAnswer('D_q6_val');
  const [q6_unit, setQ6_unit] = useAnswer('D_q6_unit');
  const [q7_val, setQ7_val] = useAnswer('D_q7_val');
  const [q7_unit, setQ7_unit] = useAnswer('D_q7_unit');
  const [q8, setQ8] = useAnswer('D_q8');
  const [q9_val, setQ9_val] = useAnswer('D_q9_val');
  const [q9_unit, setQ9_unit] = useAnswer('D_q9_unit');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="D" title="Business Continuity Management" />

      <QuestionRow number="1" question="Has a Business Impact Analysis (BIA) been conducted?">
        <YesNoButtons value={q1} onChange={setQ1} />
      </QuestionRow>
      <ConditionalReveal show={q1 === 'yes'}>
        <div>
          <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Date of last BIA</label>
          <input type="date" value={q1_date ?? ''} onChange={e => setQ1_date(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
        </div>
      </ConditionalReveal>

      <QuestionRow number="2" question="Do you have a board-approved BCM plan for cyber incidents?">
        <YesNoButtons value={q2} onChange={setQ2} />
      </QuestionRow>

      <QuestionRow number="3" question="Is your BCM / DR plan tested at least annually?">
        <YesNoButtons value={q3} onChange={setQ3} />
      </QuestionRow>
      <ConditionalReveal show={q3 === 'yes'}>
        <SelectInput id="D_q3_freq" options={['Quarterly', 'Semi-annual', 'Annual']} value={q3_freq} onChange={setQ3_freq} />
      </ConditionalReveal>

      <QuestionRow number="4" question="Do your information processing facilities have redundancy?">
        <YesNoButtons value={q4} onChange={setQ4} />
      </QuestionRow>

      <QuestionRow number="5" question="Describe your BCP testing process:" helper="Include roles involved, testing method, and steps taken">
        <div className="w-full mt-2">
          <Textarea id="D_q5" placeholder="Describe BCP testing process..." value={q5} onChange={setQ5} rows={3} />
        </div>
      </QuestionRow>

      <QuestionRow number="6" question="What is your RTO for critical systems?">
        <div className="flex items-center gap-2">
          <input type="number" value={q6_val ?? ''} onChange={e => setQ6_val(e.target.value)} placeholder="0" className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          <SelectInput id="D_q6_unit" options={['Hours', 'Days']} value={q6_unit} onChange={setQ6_unit} />
        </div>
      </QuestionRow>

      <QuestionRow number="7" question="What is your RTO for non-critical systems?">
        <div className="flex items-center gap-2">
          <input type="number" value={q7_val ?? ''} onChange={e => setQ7_val(e.target.value)} placeholder="0" className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          <SelectInput id="D_q7_unit" options={['Hours', 'Days']} value={q7_unit} onChange={setQ7_unit} />
        </div>
      </QuestionRow>

      <QuestionRow number="8" question="How are RTO and RPO determined?">
        <div className="w-full mt-2">
          <Textarea id="D_q8" placeholder="Describe how RTO and RPO are determined..." value={q8} onChange={setQ8} rows={2} />
        </div>
      </QuestionRow>

      <QuestionRow number="9" question="What is your average time to triage and contain a workstation security incident?">
        <div className="flex items-center gap-2">
          <input type="number" value={q9_val ?? ''} onChange={e => setQ9_val(e.target.value)} placeholder="0" className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          <SelectInput id="D_q9_unit" options={['Minutes', 'Hours']} value={q9_unit} onChange={setQ9_unit} />
        </div>
      </QuestionRow>
    </div>
  );
}

// ─── SECTION E ───────────────────────────────────────────────────────────────
function SectionE() {
  const [q1, setQ1] = useAnswer('E_q1');
  const [q1_ransom, setQ1_ransom] = useAnswer('E_q1_ransom');
  const [q2, setQ2] = useAnswer('E_q2');
  const [q3, setQ3] = useAnswer('E_q3');
  const [q4, setQ4] = useAnswer('E_q4');
  const [q4_detail, setQ4_detail] = useAnswer('E_q4_detail');
  const [q5, setQ5] = useAnswer('E_q5');
  const [q5_method, setQ5_method] = useAnswer('E_q5_method');
  const [q6, setQ6] = useAnswer('E_q6');
  const [q6_detail, setQ6_detail] = useAnswer('E_q6_detail');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="E" title="Information Security Incident Management" />

      <QuestionRow number="1" question="Do you have a board-approved incident response plan?">
        <YesNoButtons value={q1} onChange={setQ1} />
      </QuestionRow>
      <ConditionalReveal show={q1 === 'yes'}>
        <div>
          <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Does it include ransomware scenarios?</label>
          <YesNoButtons value={q1_ransom} onChange={setQ1_ransom} />
        </div>
      </ConditionalReveal>

      <QuestionRow number="2" question="Are all employees aware of escalation procedures?">
        <YesNoButtons value={q2} onChange={setQ2} />
      </QuestionRow>

      <QuestionRow number="3" question="Are employees required to report security weaknesses?">
        <YesNoButtons value={q3} onChange={setQ3} />
      </QuestionRow>

      <QuestionRow number="4" question="Is knowledge from past incidents used to prevent future ones?">
        <YesNoButtons value={q4} onChange={setQ4} />
      </QuestionRow>
      <ConditionalReveal show={q4 === 'yes'}>
        <Textarea id="E_q4_detail" placeholder="How is past incident knowledge applied?" value={q4_detail} onChange={setQ4_detail} rows={2} />
      </ConditionalReveal>

      <QuestionRow number="5" question="Do you have network segregation by business function or geography?">
        <YesNoButtons value={q5} onChange={setQ5} />
      </QuestionRow>
      <ConditionalReveal show={q5 === 'yes'}>
        <div className="space-y-3">
          <CheckboxGroup
            selectedKey="E_q5_types"
            options={['By business function', 'By geography', 'By security zone (DMZ / internal / guest)', 'By data classification']}
          />
          <TextInput id="E_q5_method" placeholder="Method used (VLAN / firewall rules / physical)" value={q5_method} onChange={setQ5_method} />
        </div>
      </ConditionalReveal>

      <QuestionRow number="6" question="Are data centers or networks shared between entities?">
        <YesNoButtons value={q6} onChange={setQ6} />
      </QuestionRow>
      <ConditionalReveal show={q6 === 'yes'}>
        <Textarea id="E_q6_detail" placeholder="Describe sharing arrangements..." value={q6_detail} onChange={setQ6_detail} rows={3} />
      </ConditionalReveal>
    </div>
  );
}

// ─── SECTION F ───────────────────────────────────────────────────────────────
function SectionF() {
  const [q1, setQ1] = useAnswer('F_q1');
  const [q2, setQ2] = useAnswer('F_q2');
  const [q3, setQ3] = useAnswer('F_q3');
  const [q3_detail, setQ3_detail] = useAnswer('F_q3_detail');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="F" title="Supplier Relationships" />

      <QuestionRow number="1" question="Are all important suppliers and vendors documented?">
        <YesNoButtons value={q1} onChange={setQ1} />
      </QuestionRow>

      <QuestionRow number="2" question="Do your third-party agreements include security level requirements?">
        <YesNoButtons value={q2} onChange={setQ2} />
      </QuestionRow>

      <QuestionRow number="3" question="Do you monitor third-party supplier activities for cyber security events?">
        <YesNoButtons value={q3} onChange={setQ3} />
      </QuestionRow>
      <ConditionalReveal show={q3 === 'yes'}>
        <Textarea id="F_q3_detail" placeholder="Describe your third-party monitoring process..." value={q3_detail} onChange={setQ3_detail} rows={3} />
      </ConditionalReveal>
    </div>
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────────────
export function Step3Historic() {
  return (
    <div className="space-y-6">
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Historic Information & Compliance</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }} className="mt-1">
          Please answer all questions honestly. This information is treated confidentially.
        </p>
      </div>
      <SectionA />
      <SectionB />
      <SectionC />
      <SectionD />
      <SectionE />
      <SectionF />
    </div>
  );
}

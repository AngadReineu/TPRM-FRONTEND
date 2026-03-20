import { useState } from 'react';
import { usePortal, useAnswer } from '../context/PortalContext';
import { YesNoButtons } from './shared/YesNoButtons';
import { ConditionalReveal } from './shared/ConditionalReveal';
import { QuestionRow, SectionHeader } from './shared/QuestionRow';

// ── Shared primitives ──────────────────────────────────────────────────────
function Textarea({ id, placeholder, value, onChange, rows = 2 }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void; rows?: number;
}) {
  return (
    <textarea id={id} rows={rows} value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[14px] text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all resize-none" />
  );
}

function TextInput({ id, placeholder, value, onChange }: {
  id: string; placeholder: string; value: string; onChange: (v: string) => void;
}) {
  return (
    <input id={id} type="text" value={value ?? ''} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      className="w-full border border-[#E2E8F0] rounded-lg px-4 py-3 text-[14px] text-[#334155] placeholder-[#94A3B8] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all" />
  );
}

function SelectInput({ id, options, value, onChange, className }: {
  id: string; options: string[]; value: string; onChange: (v: string) => void; className?: string;
}) {
  return (
    <select id={id} value={value ?? ''} onChange={e => onChange(e.target.value)}
      className={`border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all bg-white cursor-pointer ${className ?? ''}`}>
      <option value="">Select...</option>
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
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
          <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)}
            className="w-4 h-4 rounded border-[#E2E8F0] accent-[#0EA5E9] cursor-pointer" />
          <span style={{ fontSize: '14px', color: '#334155' }}>{opt}</span>
        </label>
      ))}
    </div>
  );
}

// ── SECTION G ─────────────────────────────────────────────────────────────
function SectionG() {
  const [g1, setG1] = useAnswer('G_q1');
  const [g2, setG2] = useAnswer('G_q2');
  const [g2d, setG2d] = useAnswer('G_q2_detail');
  const [g3, setG3] = useAnswer('G_q3');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="G" title="System Development & Maintenance" />
      <QuestionRow number="G1" question="Do your web servers use HTTPS encryption?"><YesNoButtons value={g1} onChange={setG1} /></QuestionRow>
      <QuestionRow number="G2" question="Is security testing integrated into the development lifecycle?"><YesNoButtons value={g2} onChange={setG2} /></QuestionRow>
      <ConditionalReveal show={g2 === 'yes'}><Textarea id="G_q2_detail" placeholder="Describe security testing approach..." value={g2d} onChange={setG2d} /></ConditionalReveal>
      <QuestionRow number="G3" question="Is confidentiality considered when using operational data in testing environments?"><YesNoButtons value={g3} onChange={setG3} /></QuestionRow>
    </div>
  );
}

// ── SECTION H ─────────────────────────────────────────────────────────────
function SectionH() {
  const [h1, setH1] = useAnswer('H_q1');
  const [h2, setH2] = useAnswer('H_q2');
  const [h3, setH3] = useAnswer('H_q3');
  const [h4, setH4] = useAnswer('H_q4');
  const [h5, setH5] = useAnswer('H_q5');
  const [h6, setH6] = useAnswer('H_q6');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="H" title="Communications Security" />
      <QuestionRow number="H1" question="Are all internet access points secured with firewalls?"><YesNoButtons value={h1} onChange={setH1} /></QuestionRow>
      <QuestionRow number="H2" question="Is your network continuously monitored for security events?"><YesNoButtons value={h2} onChange={setH2} /></QuestionRow>
      <QuestionRow number="H3" question="Are internet-accessible systems placed in a DMZ?"><YesNoButtons value={h3} onChange={setH3} /></QuestionRow>
      <QuestionRow number="H4" question="Are confidential communications encrypted (S/MIME or SMTP-TLS)?"><YesNoButtons value={h4} onChange={setH4} /></QuestionRow>
      <QuestionRow number="H5" question="Do you implement network segregation? (DMZ / InterVLAN / Guest VLAN)"><YesNoButtons value={h5} onChange={setH5} /></QuestionRow>
      <ConditionalReveal show={h5 === 'yes'}>
        <CheckboxGroup selectedKey="H_q5_types" options={['DMZ', 'InterVLAN', 'Guest VLAN', 'By data classification']} />
      </ConditionalReveal>
      <QuestionRow number="H6" question="Is RDP disabled or placed behind VPN with MFA?"><YesNoButtons value={h6} onChange={setH6} /></QuestionRow>
    </div>
  );
}

// ── SECTION I ─────────────────────────────────────────────────────────────
function SectionI() {
  const [i1, setI1] = useAnswer('I_q1');
  const [i2, setI2] = useAnswer('I_q2');
  const [i3, setI3] = useAnswer('I_q3');
  const [i4, setI4] = useAnswer('I_q4');
  const [i5, setI5] = useAnswer('I_q5');
  const [i5d, setI5d] = useAnswer('I_q5_detail');
  const [i6, setI6] = useAnswer('I_q6');
  const [i7, setI7] = useAnswer('I_q7');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="I" title="Operations Security" />
      <QuestionRow number="I1" question="Do you have change management procedures for critical systems?"><YesNoButtons value={i1} onChange={setI1} /></QuestionRow>
      <QuestionRow number="I2" question="Are development and test environments separated from production?"><YesNoButtons value={i2} onChange={setI2} /></QuestionRow>
      <QuestionRow number="I3" question="Is malware protection deployed on all endpoints and gateways?"><YesNoButtons value={i3} onChange={setI3} /></QuestionRow>
      <QuestionRow number="I4" question="Does your malware protection include advanced heuristic or behavioral detection?"><YesNoButtons value={i4} onChange={setI4} /></QuestionRow>
      <QuestionRow number="I5" question="Are event logs reviewed regularly (firewalls, domain controller)?"><YesNoButtons value={i5} onChange={setI5} /></QuestionRow>
      <ConditionalReveal show={i5 === 'yes'}><Textarea id="I_q5_detail" placeholder="How often and by whom?" value={i5d} onChange={setI5d} /></ConditionalReveal>
      <QuestionRow number="I6" question="Is there a centralized software installation process?"><YesNoButtons value={i6} onChange={setI6} /></QuestionRow>
      <QuestionRow number="I7" question="Are there controls preventing unauthorized software installation?"><YesNoButtons value={i7} onChange={setI7} /></QuestionRow>
    </div>
  );
}

// ── SECTION J ─────────────────────────────────────────────────────────────
function SectionJ() {
  const [j1, setJ1] = useAnswer('J_q1');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="J" title="Physical Security" />
      <QuestionRow number="J1" question="Is a personnel access list maintained and regularly reviewed?"><YesNoButtons value={j1} onChange={setJ1} /></QuestionRow>
      <ConditionalReveal show={j1 === 'yes'}>
        <CheckboxGroup selectedKey="J_q1_controls" options={['CCTV surveillance', 'Security guards', 'Keycards / access badges', 'Biometric access', 'Visitor logs']} />
      </ConditionalReveal>
    </div>
  );
}

// ── SECTION K ─────────────────────────────────────────────────────────────
function SectionK() {
  const [k1, setK1] = useAnswer('K_q1');
  const [k1r, setK1r] = useAnswer('K_q1_remote');
  const [k2, setK2] = useAnswer('K_q2');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="K" title="Cryptography" />
      <QuestionRow number="K1" question="Is data on mobile devices fully encrypted?"><YesNoButtons value={k1} onChange={setK1} /></QuestionRow>
      <ConditionalReveal show={k1 === 'yes'}>
        <div>
          <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Is there a remote wipe procedure for stolen/lost devices?</label>
          <YesNoButtons value={k1r} onChange={setK1r} />
        </div>
      </ConditionalReveal>
      <QuestionRow number="K2" question="Do you have a cryptographic key management policy?"><YesNoButtons value={k2} onChange={setK2} /></QuestionRow>
    </div>
  );
}

// ── SECTION L ─────────────────────────────────────────────────────────────
function SectionL() {
  const [l1, setL1] = useAnswer('L_q1');
  const [l2, setL2] = useAnswer('L_q2');
  const [l2s, setL2s] = useAnswer('L_q2_svc');
  const [l3, setL3] = useAnswer('L_q3');
  const [l4, setL4] = useAnswer('L_q4');
  const [l4f, setL4f] = useAnswer('L_q4_freq');
  const [l5, setL5] = useAnswer('L_q5');
  const [l5t, setL5t] = useAnswer('L_q5_timeframe');
  const [l6, setL6] = useAnswer('L_q6');
  const [l7, setL7] = useAnswer('L_q7');
  const [l7s, setL7s] = useAnswer('L_q7_solution');
  const [l7c, setL7c] = useAnswer('L_q7_coverage');
  const [l8, setL8] = useAnswer('L_q8');
  const [l8c, setL8c] = useAnswer('L_q8_single');
  const [l9, setL9] = useAnswer('L_q9');
  const [l10, setL10] = useAnswer('L_q10');
  const [l11, setL11] = useAnswer('L_q11');
  const { answers, setAnswer } = usePortal();

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="L" title="Access Control" />

      <QuestionRow number="L1" question="Is access restricted based on need-to-know / least privilege?"><YesNoButtons value={l1} onChange={setL1} /></QuestionRow>

      <QuestionRow number="L2" question="Is there a formal access provisioning and revocation process?"><YesNoButtons value={l2} onChange={setL2} /></QuestionRow>
      <ConditionalReveal show={l2 === 'yes'}>
        <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Do service accounts deny interactive logons?</label><YesNoButtons value={l2s} onChange={setL2s} /></div>
      </ConditionalReveal>

      <QuestionRow number="L3" question="Is local admin access prohibited on standard workstations?"><YesNoButtons value={l3} onChange={setL3} /></QuestionRow>

      <QuestionRow number="L4" question="Are user access rights reviewed at least annually?"><YesNoButtons value={l4} onChange={setL4} /></QuestionRow>
      <ConditionalReveal show={l4 === 'yes'}>
        <SelectInput id="L_q4_freq" options={['Monthly', 'Quarterly', 'Semi-annual', 'Annual']} value={l4f} onChange={setL4f} />
      </ConditionalReveal>

      <QuestionRow number="L5" question="Is access revoked within 24 hours of employee termination?"><YesNoButtons value={l5} onChange={setL5} /></QuestionRow>
      <ConditionalReveal show={l5 === 'no'}>
        <TextInput id="L_q5_timeframe" placeholder="What is your termination revocation timeframe?" value={l5t} onChange={setL5t} />
      </ConditionalReveal>

      <QuestionRow number="L6" question="Do you enforce a strong password policy?"><YesNoButtons value={l6} onChange={setL6} /></QuestionRow>
      <ConditionalReveal show={l6 === 'yes'}>
        <CheckboxGroup selectedKey="L_q6_policy" options={['Minimum 8 characters', 'Complexity required (upper/lower/numbers/symbols)', 'No dictionary words', 'Password expiry enforced', 'Password history enforced']} />
      </ConditionalReveal>

      <QuestionRow number="L7" question="Do you use a PIM/PAM (Privileged Identity/Access Management) solution?"><YesNoButtons value={l7} onChange={setL7} /></QuestionRow>
      <ConditionalReveal show={l7 === 'yes'}>
        <div className="space-y-3">
          <TextInput id="L_q7_solution" placeholder="Which solution?" value={l7s} onChange={setL7s} />
          <Textarea id="L_q7_coverage" placeholder="Coverage scope..." value={l7c} onChange={setL7c} />
        </div>
      </ConditionalReveal>

      <QuestionRow number="L8" question="Is MFA enforced across all systems?"><YesNoButtons value={l8} onChange={setL8} /></QuestionRow>
      <ConditionalReveal show={l8 === 'yes'}>
        <div className="space-y-3">
          <CheckboxGroup selectedKey="L_q8_systems" options={['VPN access', 'VDI / remote desktop', 'Email / O365', 'Cloud console access', 'Legacy protocols disabled (IMAP, POP3, SMTP auth)', 'No remote access without MFA', 'Contractor/third-party MFA enforced']} />
          <div>
            <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Would a single compromised device give access to multiple systems?</label>
            <YesNoButtons value={l8c} onChange={setL8c} />
          </div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="L9" question="Are any manufacturing or medical systems dependent on IT networks?"><YesNoButtons value={l9} onChange={setL9} /></QuestionRow>
      <QuestionRow number="L10" question="Is Single Sign-On (SSO) implemented where appropriate?"><YesNoButtons value={l10} onChange={setL10} /></QuestionRow>

      <QuestionRow number="L11" question="Are privileged accounts monitored in real-time?"><YesNoButtons value={l11} onChange={setL11} /></QuestionRow>
      <ConditionalReveal show={l11 === 'yes'}>
        <div className="space-y-3">
          <div className="flex items-center gap-3 flex-wrap">
            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Number of privileged accounts</label>
              <input type="number" value={answers['L_q11_count'] ?? ''} onChange={e => setAnswer('L_q11_count', e.target.value)} placeholder="0"
                className="w-28 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
            </div>
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">All have MFA?</label><YesNoButtons value={answers['L_q11_mfa'] ?? null} onChange={v => setAnswer('L_q11_mfa', v)} /></div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="L12" question="Describe your IAM and Active Directory practices:">
        <div className="w-full mt-2 space-y-3">
          <CheckboxGroup selectedKey="L_q12_ad" options={['AD auditing enabled', 'Service accounts follow least privilege', 'Permission reviews conducted regularly']} />
          <div className="flex gap-4 flex-wrap">
            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Domain Admin user accounts</label>
              <input type="number" value={answers['L_q12_admin_users'] ?? ''} onChange={e => setAnswer('L_q12_admin_users', e.target.value)} placeholder="0"
                className="w-28 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#334155] mb-1.5">Domain Admin service accounts</label>
              <input type="number" value={answers['L_q12_admin_svc'] ?? ''} onChange={e => setAnswer('L_q12_admin_svc', e.target.value)} placeholder="0"
                className="w-28 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
            </div>
          </div>
        </div>
      </QuestionRow>
    </div>
  );
}

// ── SECTION M ─────────────────────────────────────────────────────────────
function SectionM() {
  const [m1, setM1] = useAnswer('M_q1');
  const [m2, setM2] = useAnswer('M_q2');
  const [m3, setM3] = useAnswer('M_q3');
  const [m4, setM4] = useAnswer('M_q4');
  const [m5, setM5] = useAnswer('M_q5');
  const [m6, setM6] = useAnswer('M_q6');
  const [m7, setM7] = useAnswer('M_q7');
  const [m7c, setM7c] = useAnswer('M_q7_cloud');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="M" title="Asset Management" />
      <QuestionRow number="M1" question="Do you maintain an up-to-date software and hardware inventory?"><YesNoButtons value={m1} onChange={setM1} /></QuestionRow>
      <QuestionRow number="M2" question="Is all information classified by confidentiality level?"><YesNoButtons value={m2} onChange={setM2} /></QuestionRow>
      <QuestionRow number="M3" question="Is information labelling implemented?"><YesNoButtons value={m3} onChange={setM3} /></QuestionRow>
      <QuestionRow number="M4" question="Is there guidance on handling classified information?"><YesNoButtons value={m4} onChange={setM4} /></QuestionRow>
      <QuestionRow number="M5" question="Is removable media access restricted or encrypted?"><YesNoButtons value={m5} onChange={setM5} /></QuestionRow>
      <QuestionRow number="M6" question="Is sensitive media securely disposed of?"><YesNoButtons value={m6} onChange={setM6} /></QuestionRow>
      <QuestionRow number="M7" question="Do you maintain a comprehensive CMDB?"><YesNoButtons value={m7} onChange={setM7} /></QuestionRow>
      <ConditionalReveal show={m7 === 'yes'}>
        <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Does it include cloud assets and dependencies?</label><YesNoButtons value={m7c} onChange={setM7c} /></div>
      </ConditionalReveal>
    </div>
  );
}

// ── SECTION N ─────────────────────────────────────────────────────────────
function SectionN() {
  const [n1, setN1] = useAnswer('N_q1');
  const [n2, setN2] = useAnswer('N_q2');
  const [n2t, setN2t] = useAnswer('N_q2_tool');
  const [n3, setN3] = useAnswer('N_q3');
  const [n3f, setN3f] = useAnswer('N_q3_freq');
  const [n3r, setN3r] = useAnswer('N_q3_rate');
  const [n3d, setN3d] = useAnswer('N_q3_doc');
  const [n4, setN4] = useAnswer('N_q4');
  const [n4r, setN4r] = useAnswer('N_q4_report');
  const [n4d, setN4d] = useAnswer('N_q4_detail');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="N" title="Human Resource Security" />
      <QuestionRow number="N1" question="Do all employees undergo annual security awareness training?"><YesNoButtons value={n1} onChange={setN1} /></QuestionRow>
      <QuestionRow number="N2" question="Do you use a UEBA tool for behavioral anomaly detection?"><YesNoButtons value={n2} onChange={setN2} /></QuestionRow>
      <ConditionalReveal show={n2 === 'yes'}><TextInput id="N_q2_tool" placeholder="Which tool?" value={n2t} onChange={setN2t} /></ConditionalReveal>
      <QuestionRow number="N3" question="Do you conduct simulated phishing attacks?"><YesNoButtons value={n3} onChange={setN3} /></QuestionRow>
      <ConditionalReveal show={n3 === 'yes'}>
        <div className="space-y-3">
          <div className="flex gap-3 flex-wrap">
            <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Frequency</label>
              <select value={n3f ?? ''} onChange={e => setN3f(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
                <option value="">Select...</option>
                {['Monthly', 'Quarterly', 'Semi-annual', 'Annual'].map(o => <option key={o}>{o}</option>)}
              </select>
            </div>
            <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Success ratio (click rate %)</label>
              <input type="text" value={n3r ?? ''} onChange={e => setN3r(e.target.value)} placeholder="e.g., 5%" className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all w-28" />
            </div>
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Documented response process?</label><YesNoButtons value={n3d} onChange={setN3d} /></div>
        </div>
      </ConditionalReveal>
      <QuestionRow number="N4" question="Are emails from outside the organization tagged?"><YesNoButtons value={n4} onChange={setN4} /></QuestionRow>
      <ConditionalReveal show={n4 === 'yes'}>
        <div className="space-y-3">
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Is there a suspicious email reporting process?</label><YesNoButtons value={n4r} onChange={setN4r} /></div>
          <Textarea id="N_q4_detail" placeholder="Describe the reporting process..." value={n4d} onChange={setN4d} />
        </div>
      </ConditionalReveal>
    </div>
  );
}

// ── SECTION O ─────────────────────────────────────────────────────────────
function SectionO() {
  const [o1, setO1] = useAnswer('O_q1');
  const [o1t, setO1t] = useAnswer('O_q1_title');
  const [o2, setO2] = useAnswer('O_q2');
  const [o3, setO3] = useAnswer('O_q3');
  const [o5, setO5] = useAnswer('O_q5');
  const [o5s, setO5s] = useAnswer('O_q5_solution');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="O" title="Organization of Information Security" />
      <QuestionRow number="O1" question="Is a CISO or Head of Information Security assigned?"><YesNoButtons value={o1} onChange={setO1} /></QuestionRow>
      <ConditionalReveal show={o1 === 'yes'}><TextInput id="O_q1_title" placeholder="CISO title/role" value={o1t} onChange={setO1t} /></ConditionalReveal>
      <QuestionRow number="O2" question="Does the CISO have direct reporting from production IT teams?"><YesNoButtons value={o2} onChange={setO2} /></QuestionRow>
      <QuestionRow number="O3" question="Is there a contact list for authorities in case of a cyber incident?"><YesNoButtons value={o3} onChange={setO3} /></QuestionRow>
      <QuestionRow number="O4" question="Which security functions exist in your organization?">
        <div className="mt-2"><CheckboxGroup selectedKey="O_q4_functions" options={['SOC (Security Operations Center)', 'Threat Intelligence', 'Incident Response Team', 'Red Team', 'None of the above']} /></div>
      </QuestionRow>
      <QuestionRow number="O5" question="Do you have a Mobile Device Management (MDM) solution?"><YesNoButtons value={o5} onChange={setO5} /></QuestionRow>
      <ConditionalReveal show={o5 === 'yes'}><TextInput id="O_q5_solution" placeholder="Which MDM solution?" value={o5s} onChange={setO5s} /></ConditionalReveal>
    </div>
  );
}

// ── SECTION P ─────────────────────────────────────────────────────────────
function SectionP() {
  const [p1, setP1] = useAnswer('P_q1');
  const [p2, setP2] = useAnswer('P_q2');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="P" title="Information Security Policies" />
      <QuestionRow number="P1" question="Do you have a board-approved information security policy covering the entire organization?"><YesNoButtons value={p1} onChange={setP1} /></QuestionRow>
      <QuestionRow number="P2" question="Do you have a board-approved cloud security policy?"><YesNoButtons value={p2} onChange={setP2} /></QuestionRow>
    </div>
  );
}

// ── SECTION Q ─────────────────────────────────────────────────────────────
function SectionQ() {
  const { answers, setAnswer } = usePortal();
  const [q2, setQ2] = useAnswer('Q_q2');
  const [q3, setQ3] = useAnswer('Q_q3');
  const [q4, setQ4] = useAnswer('Q_q4');
  const [q5, setQ5] = useAnswer('Q_q5');
  const [q5i, setQ5i] = useAnswer('Q_q5_type');
  const [q5_247, setQ5_247] = useAnswer('Q_q5_247');
  const [q6, setQ6] = useAnswer('Q_q6');
  const [q7, setQ7] = useAnswer('Q_q7');
  const [q8, setQ8] = useAnswer('Q_q8');
  const [q9, setQ9] = useAnswer('Q_q9');
  const [q9s, setQ9s] = useAnswer('Q_q9_solution');
  const [q10, setQ10] = useAnswer('Q_q10');
  const [q11, setQ11] = useAnswer('Q_q11');
  const [q12, setQ12] = useAnswer('Q_q12');
  const [q12m, setQ12m] = useAnswer('Q_q12_mode');
  const [q13, setQ13] = useAnswer('Q_q13');
  const [q14, setQ14] = useAnswer('Q_q14');
  const [q15, setQ15] = useAnswer('Q_q15');
  const [q15s, setQ15s] = useAnswer('Q_q15_solution');
  const [q16, setQ16] = useAnswer('Q_q16');
  const [q17, setQ17] = useAnswer('Q_q17');
  const [q18, setQ18] = useAnswer('Q_q18');
  const [q19, setQ19] = useAnswer('Q_q19');
  const [q19sb, setQ19sb] = useAnswer('Q_q19_sandbox');
  const [q19fb, setQ19fb] = useAnswer('Q_q19_filetypes');
  const [q20, setQ20] = useAnswer('Q_q20');
  const [q21, setQ21] = useAnswer('Q_q21');
  const [q24, setQ24] = useAnswer('Q_q24');
  const [q25, setQ25] = useAnswer('Q_q25');
  const [q25d, setQ25d] = useAnswer('Q_q25_detail');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="Q" title="Technology Implementation" />

      <QuestionRow number="Q1" question="What is your patch management cadence?">
        <div className="flex items-center gap-2 flex-wrap">
          <select value={answers['Q_q1_freq'] ?? ''} onChange={e => setAnswer('Q_q1_freq', e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
            <option value="">Frequency...</option>
            {['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly'].map(o => <option key={o}>{o}</option>)}
          </select>
          <input type="text" value={answers['Q_q1_solution'] ?? ''} onChange={e => setAnswer('Q_q1_solution', e.target.value)} placeholder="Solution used" className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
        </div>
      </QuestionRow>

      <QuestionRow number="Q2" question="Are default passwords changed on all new systems and devices?"><YesNoButtons value={q2} onChange={setQ2} /></QuestionRow>
      <QuestionRow number="Q3" question="Do you have high availability for critical infrastructure?"><YesNoButtons value={q3} onChange={setQ3} /></QuestionRow>

      <QuestionRow number="Q4" question="Do you have a DR site?"><YesNoButtons value={q4} onChange={setQ4} /></QuestionRow>
      <ConditionalReveal show={q4 === 'yes'}>
        <div className="flex gap-4 flex-wrap">
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Number of data centers</label>
            <input type="number" value={answers['Q_q4_dcs'] ?? ''} onChange={e => setAnswer('Q_q4_dcs', e.target.value)} placeholder="0" className="w-28 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Last DR drill date</label>
            <input type="date" value={answers['Q_q4_drill'] ?? ''} onChange={e => setAnswer('Q_q4_drill', e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          </div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="Q5" question="Do you have a Security Operations Center (SOC)?"><YesNoButtons value={q5} onChange={setQ5} /></QuestionRow>
      <ConditionalReveal show={q5 === 'yes'}>
        <div className="space-y-3">
          <div className="flex gap-4">
            {['Internal', 'Outsourced', 'Hybrid'].map(opt => (
              <label key={opt} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="Q_q5_type" value={opt} checked={q5i === opt} onChange={() => setQ5i(opt)} className="accent-[#0EA5E9]" />
                <span className="text-[14px] text-[#334155]">{opt}</span>
              </label>
            ))}
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">24×7 operation?</label><YesNoButtons value={q5_247} onChange={setQ5_247} /></div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="Q6" question="Do you have a Network Access Control (NAC) solution?"><YesNoButtons value={q6} onChange={setQ6} /></QuestionRow>
      <QuestionRow number="Q7" question="Do you use deception tools or honeypots?"><YesNoButtons value={q7} onChange={setQ7} /></QuestionRow>
      <QuestionRow number="Q8" question="Are host-based firewalls deployed on endpoints and servers?"><YesNoButtons value={q8} onChange={setQ8} /></QuestionRow>

      <QuestionRow number="Q9" question="Do you have an EDR (Endpoint Detection & Response) solution?"><YesNoButtons value={q9} onChange={setQ9} /></QuestionRow>
      <ConditionalReveal show={q9 === 'yes'}>
        <div className="space-y-3">
          <TextInput id="Q_q9_solution" placeholder="Which EDR solution?" value={q9s} onChange={setQ9s} />
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Coverage % of endpoints</label>
            <input type="number" value={answers['Q_q9_coverage'] ?? ''} onChange={e => setAnswer('Q_q9_coverage', e.target.value)} placeholder="%" className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Enabled modules</label>
            <CheckboxGroup selectedKey="Q_q9_modules" options={['AV', 'EDR', 'DLP', 'Firewall', 'HIPS']} />
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Running in block/prevent mode?</label><YesNoButtons value={answers['Q_q9_block'] ?? null} onChange={v => setAnswer('Q_q9_block', v)} /></div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="Q10" question="Do you use application whitelisting?"><YesNoButtons value={q10} onChange={setQ10} /></QuestionRow>
      <QuestionRow number="Q11" question="Do you have IDS/IPS?"><YesNoButtons value={q11} onChange={setQ11} /></QuestionRow>

      <QuestionRow number="Q12" question="Do you have a DLP (Data Loss Prevention) tool?"><YesNoButtons value={q12} onChange={setQ12} /></QuestionRow>
      <ConditionalReveal show={q12 === 'yes'}>
        <div className="flex gap-4">
          {['Monitoring only', 'Active blocking'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="Q_q12_mode" value={opt} checked={q12m === opt} onChange={() => setQ12m(opt)} className="accent-[#0EA5E9]" />
              <span className="text-[14px] text-[#334155]">{opt}</span>
            </label>
          ))}
        </div>
      </ConditionalReveal>

      <QuestionRow number="Q13" question="Do you use NGFW/UTM with DPI and IPS?"><YesNoButtons value={q13} onChange={setQ13} /></QuestionRow>
      <QuestionRow number="Q14" question="Is VPN required for all remote access?"><YesNoButtons value={q14} onChange={setQ14} /></QuestionRow>

      <QuestionRow number="Q15" question="Do you have a SIEM solution?"><YesNoButtons value={q15} onChange={setQ15} /></QuestionRow>
      <ConditionalReveal show={q15 === 'yes'}>
        <div className="space-y-3">
          <CheckboxGroup selectedKey="Q_q15_coverage" options={['IT', 'OT', 'Cloud', 'Endpoints']} />
          <TextInput id="Q_q15_solution" placeholder="Which SIEM solution?" value={q15s} onChange={setQ15s} />
        </div>
      </ConditionalReveal>

      <QuestionRow number="Q16" question="Do you have Database Activity Monitoring (DAM)?"><YesNoButtons value={q16} onChange={setQ16} /></QuestionRow>
      <QuestionRow number="Q17" question="Do you have Anti-DDoS protection?"><YesNoButtons value={q17} onChange={setQ17} /></QuestionRow>
      <QuestionRow number="Q18" question="Do you use Breach and Attack Simulation (BAS) software?"><YesNoButtons value={q18} onChange={setQ18} /></QuestionRow>

      <QuestionRow number="Q19" question="Do you have an email filtering solution?"><YesNoButtons value={q19} onChange={setQ19} /></QuestionRow>
      <ConditionalReveal show={q19 === 'yes'}>
        <div className="space-y-3">
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Sandbox capability?</label><YesNoButtons value={q19sb} onChange={setQ19sb} /></div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">File type blocking?</label><YesNoButtons value={q19fb} onChange={setQ19fb} /></div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="Q20" question="Do you have an internal red team?"><YesNoButtons value={q20} onChange={setQ20} /></QuestionRow>
      <QuestionRow number="Q21" question="Is anti-malware updated per vendor recommendations?"><YesNoButtons value={q21} onChange={setQ21} /></QuestionRow>

      <QuestionRow number="Q22" question="When were your WAF rules last updated?">
        <div className="flex items-center gap-3 flex-wrap">
          <input type="date" value={answers['Q_q22_date'] ?? ''} onChange={e => setAnswer('Q_q22_date', e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1">Cover Log4j?</label><YesNoButtons value={answers['Q_q22_log4j'] ?? null} onChange={v => setAnswer('Q_q22_log4j', v)} /></div>
        </div>
      </QuestionRow>

      <QuestionRow number="Q23" question="When were Apache/Java applications last updated?">
        <input type="date" value={answers['Q_q23_date'] ?? ''} onChange={e => setAnswer('Q_q23_date', e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] focus:outline-none focus:border-[#0EA5E9] transition-all" />
      </QuestionRow>

      <QuestionRow number="Q24" question="What is your Zero Trust Architecture status?">
        <select value={q24 ?? ''} onChange={e => setQ24(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
          <option value="">Select status...</option>
          {['Not started', 'Planning', 'In progress', 'Implemented'].map(o => <option key={o}>{o}</option>)}
        </select>
      </QuestionRow>

      <QuestionRow number="Q25" question="Do you have an API security framework?"><YesNoButtons value={q25} onChange={setQ25} /></QuestionRow>
      <ConditionalReveal show={q25 === 'yes'}><Textarea id="Q_q25_detail" placeholder="Describe your API security framework..." value={q25d} onChange={setQ25d} /></ConditionalReveal>
    </div>
  );
}

// ── SECTION R ─────────────────────────────────────────────────────────────
function SectionR() {
  const { answers, setAnswer } = usePortal();
  const [r1, setR1] = useAnswer('R_q1');
  const [r2, setR2] = useAnswer('R_q2');
  const [r2d, setR2d] = useAnswer('R_q2_detail');
  const [r4, setR4] = useAnswer('R_q4');
  const [r5, setR5] = useAnswer('R_q5');
  const [r6, setR6] = useAnswer('R_q6');
  const [r7, setR7] = useAnswer('R_q7');
  const [r8, setR8] = useAnswer('R_q8');
  const [r9, setR9] = useAnswer('R_q9');
  const [r9s, setR9s] = useAnswer('R_q9_solution');

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="R" title="Cloud Exposure" />

      <QuestionRow number="R1" question="What is your cloud adoption status?">
        <select value={r1 ?? ''} onChange={e => setR1(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
          <option value="">Select...</option>
          {['No cloud', 'Hybrid', 'Mostly cloud', 'Fully cloud'].map(o => <option key={o}>{o}</option>)}
        </select>
      </QuestionRow>

      <QuestionRow number="R2" question="Do you use or provide SaaS services?"><YesNoButtons value={r2} onChange={setR2} /></QuestionRow>
      <ConditionalReveal show={r2 === 'yes'}><Textarea id="R_q2_detail" placeholder="List key SaaS services and data protection responsibilities..." value={r2d} onChange={setR2d} /></ConditionalReveal>

      <QuestionRow number="R3" question="Does your cloud provider hold security certifications?">
        <div className="mt-2"><CheckboxGroup selectedKey="R_q3_certs" options={['ISO 27001', 'ISO 27018', 'IRAP', 'SOC 2 Type II', 'None / Not applicable']} /></div>
      </QuestionRow>

      <QuestionRow number="R4" question="Does your cloud environment follow PCI DSS standards?"><YesNoButtons value={r4} onChange={setR4} /></QuestionRow>

      <QuestionRow number="R5" question="Do 3rd party vendors have access to your network?"><YesNoButtons value={r5} onChange={setR5} /></QuestionRow>
      <ConditionalReveal show={r5 === 'yes'}>
        <div className="flex gap-4 flex-wrap">
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Inbound API connections</label>
            <input type="number" value={answers['R_q5_inbound'] ?? ''} onChange={e => setAnswer('R_q5_inbound', e.target.value)} placeholder="0" className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          </div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Outbound API connections</label>
            <input type="number" value={answers['R_q5_outbound'] ?? ''} onChange={e => setAnswer('R_q5_outbound', e.target.value)} placeholder="0" className="w-24 border border-[#E2E8F0] rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:border-[#0EA5E9] transition-all" />
          </div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="R6" question="Are your APIs evaluated for OWASP Top 10 vulnerabilities?"><YesNoButtons value={r6} onChange={setR6} /></QuestionRow>
      <QuestionRow number="R7" question="Is source code analyzed before production deployment?"><YesNoButtons value={r7} onChange={setR7} /></QuestionRow>
      <QuestionRow number="R8" question="Is MFA enabled on your root or cloud admin account?"><YesNoButtons value={r8} onChange={setR8} /></QuestionRow>

      <QuestionRow number="R9" question="Do you use Cloud Security Posture Management (CSPM)?"><YesNoButtons value={r9} onChange={setR9} /></QuestionRow>
      <ConditionalReveal show={r9 === 'yes'}><TextInput id="R_q9_solution" placeholder="Which CSPM solution?" value={r9s} onChange={setR9s} /></ConditionalReveal>
    </div>
  );
}

// ── SECTION S ─────────────────────────────────────────────────────────────
function SectionS() {
  const [s1, setS1] = useAnswer('S_q1');
  const [s1t, setS1t] = useAnswer('S_q1_type');
  const [s2, setS2] = useAnswer('S_q2');
  const [s3, setS3] = useAnswer('S_q3');
  const [s3siem, setS3siem] = useAnswer('S_q3_siem');
  const [s4, setS4] = useAnswer('S_q4');
  const [s4t, setS4t] = useAnswer('S_q4_tested');
  const [s5, setS5] = useAnswer('S_q5');
  const [s6, setS6] = useAnswer('S_q6');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="S" title="System Failure" />
      <QuestionRow number="S1" question="Do you have redundancy for mission-critical systems?"><YesNoButtons value={s1} onChange={setS1} /></QuestionRow>
      <ConditionalReveal show={s1 === 'yes'}>
        <div className="flex gap-4">
          {['Hot site', 'Warm site', 'Cold site'].map(opt => (
            <label key={opt} className="flex items-center gap-2 cursor-pointer">
              <input type="radio" name="S_q1_type" value={opt} checked={s1t === opt} onChange={() => setS1t(opt)} className="accent-[#0EA5E9]" />
              <span className="text-[14px] text-[#334155]">{opt}</span>
            </label>
          ))}
        </div>
      </ConditionalReveal>
      <QuestionRow number="S2" question="Is in-house software tested before deployment with rollback procedures?"><YesNoButtons value={s2} onChange={setS2} /></QuestionRow>
      <QuestionRow number="S3" question="Do you have a documented DRP tested annually?"><YesNoButtons value={s3} onChange={setS3} /></QuestionRow>
      <ConditionalReveal show={s3 === 'yes'}><div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Is SIEM linked to DRP?</label><YesNoButtons value={s3siem} onChange={setS3siem} /></div></ConditionalReveal>
      <QuestionRow number="S4" question="Do you have a rollback procedure for failed patches?"><YesNoButtons value={s4} onChange={setS4} /></QuestionRow>
      <ConditionalReveal show={s4 === 'yes'}><div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Tested annually?</label><YesNoButtons value={s4t} onChange={setS4t} /></div></ConditionalReveal>
      <QuestionRow number="S5" question="Is infrastructure designed with redundancy (failover, dual networks)?"><YesNoButtons value={s5} onChange={setS5} /></QuestionRow>
      <QuestionRow number="S6" question="Do you have a secondary backup control system?"><YesNoButtons value={s6} onChange={setS6} /></QuestionRow>
    </div>
  );
}

// ── SECTION T ─────────────────────────────────────────────────────────────
function SectionT() {
  const { answers, setAnswer } = usePortal();
  const dataTypes = [
    { key: 'pii', label: 'PII (Personal data)' },
    { key: 'pci', label: 'PCI (Payment card data)' },
    { key: 'phi', label: 'PHI (Health / medical data)' },
    { key: 'ip', label: 'Intellectual Property' },
  ];
  const operations = ['Collect', 'Store', 'Process', 'Transmit'];

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="T" title="Type of Data Records Held" />
      <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
        <span style={{ fontSize: '13px', color: '#1E40AF' }}>For each data type, indicate whether you collect, store, process or transmit it, whether it is encrypted, and the approximate number of records.</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border border-[#E2E8F0] rounded-xl overflow-hidden">
          <thead>
            <tr className="bg-[#F8FAFC]">
              <th className="text-left px-4 py-3 text-[13px] text-[#64748B] font-medium border-b border-[#E2E8F0]">Data Type</th>
              {operations.map(op => <th key={op} className="px-3 py-3 text-[13px] text-[#64748B] font-medium border-b border-[#E2E8F0] text-center">{op}</th>)}
              <th className="px-3 py-3 text-[13px] text-[#64748B] font-medium border-b border-[#E2E8F0] text-center">Encrypted?</th>
              <th className="px-3 py-3 text-[13px] text-[#64748B] font-medium border-b border-[#E2E8F0] text-center">Approx. Records</th>
            </tr>
          </thead>
          <tbody>
            {dataTypes.map((dt, idx) => {
              const ops: string[] = answers[`T_${dt.key}_ops`] ?? [];
              const toggleOp = (op: string) => {
                const next = ops.includes(op) ? ops.filter(x => x !== op) : [...ops, op];
                setAnswer(`T_${dt.key}_ops`, next);
              };
              return (
                <tr key={dt.key} className={idx % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                  <td className="px-4 py-3 text-[13px] text-[#334155] font-medium border-b border-[#E2E8F0]">{dt.label}</td>
                  {operations.map(op => (
                    <td key={op} className="px-3 py-3 border-b border-[#E2E8F0] text-center">
                      <input type="checkbox" checked={ops.includes(op)} onChange={() => toggleOp(op)} className="w-4 h-4 accent-[#0EA5E9] cursor-pointer" />
                    </td>
                  ))}
                  <td className="px-3 py-3 border-b border-[#E2E8F0] text-center">
                    <div className="flex gap-1 justify-center">
                      {['yes', 'no'].map(v => (
                        <button key={v} type="button"
                          onClick={() => setAnswer(`T_${dt.key}_enc`, v)}
                          className={`px-2.5 py-1 rounded-full text-[12px] border transition-all cursor-pointer ${answers[`T_${dt.key}_enc`] === v ? (v === 'yes' ? 'bg-[#ECFDF5] border-[#10B981] text-[#10B981]' : 'bg-[#FEF2F2] border-[#EF4444] text-[#EF4444]') : 'bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#94A3B8]'}`}>
                          {v === 'yes' ? 'Yes' : 'No'}
                        </button>
                      ))}
                    </div>
                  </td>
                  <td className="px-3 py-3 border-b border-[#E2E8F0]">
                    <input type="number" value={answers[`T_${dt.key}_records`] ?? ''} onChange={e => setAnswer(`T_${dt.key}_records`, e.target.value)} placeholder="0"
                      className="w-full border border-[#E2E8F0] rounded px-2 py-1.5 text-[13px] text-center focus:outline-none focus:border-[#0EA5E9] transition-all" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SECTION U ─────────────────────────────────────────────────────────────
function SectionU() {
  const [u1, setU1] = useAnswer('U_q1');
  const [u1d, setU1d] = useAnswer('U_q1_detail');
  const [u2, setU2] = useAnswer('U_q2');
  const [u3, setU3] = useAnswer('U_q3');
  const [u4, setU4] = useAnswer('U_q4');
  const [u5, setU5] = useAnswer('U_q5');
  const [u5f, setU5f] = useAnswer('U_q5_freq');
  const [u6, setU6] = useAnswer('U_q6');
  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="U" title="Data Backups" />
      <QuestionRow number="U1" question="Do you take regular backups with more frequent backups for critical systems?"><YesNoButtons value={u1} onChange={setU1} /></QuestionRow>
      <ConditionalReveal show={u1 === 'yes'}><Textarea id="U_q1_detail" placeholder="Describe backup schedule..." value={u1d} onChange={setU1d} /></ConditionalReveal>
      <QuestionRow number="U2" question="Are backups replicated to multiple off-site locations?"><YesNoButtons value={u2} onChange={setU2} /></QuestionRow>
      <QuestionRow number="U3" question="Are backups encrypted?"><YesNoButtons value={u3} onChange={setU3} /></QuestionRow>
      <QuestionRow number="U4" question="Are offline (air-gapped) backups maintained?"><YesNoButtons value={u4} onChange={setU4} /></QuestionRow>
      <QuestionRow number="U5" question="Is backup integrity verified periodically?"><YesNoButtons value={u5} onChange={setU5} /></QuestionRow>
      <ConditionalReveal show={u5 === 'yes'}>
        <select value={u5f ?? ''} onChange={e => setU5f(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
          <option value="">Select frequency...</option>
          {['Weekly', 'Monthly', 'Quarterly'].map(o => <option key={o}>{o}</option>)}
        </select>
      </ConditionalReveal>
      <QuestionRow number="U6" question="Is backup access authenticated outside corporate Active Directory?"><YesNoButtons value={u6} onChange={setU6} /></QuestionRow>
    </div>
  );
}

// ── SECTION V ─────────────────────────────────────────────────────────────
function SectionV() {
  const { answers, setAnswer } = usePortal();
  const [v1, setV1] = useAnswer('V_q1');
  const [v2, setV2] = useAnswer('V_q2');
  const [v8, setV8] = useAnswer('V_q8');
  const [v9, setV9] = useAnswer('V_q9');
  const [v11, setV11] = useAnswer('V_q11');
  const currencies = ['INR', 'USD', 'GBP', 'EUR'];

  const MoneyField = ({ prefix, label }: { prefix: string; label: string }) => (
    <div className="flex items-center gap-2 flex-wrap">
      <div className="flex-1 min-w-[140px]">
        <label className="block text-[13px] font-medium text-[#334155] mb-1.5">{label}</label>
        <input type="number" value={answers[`${prefix}_val`] ?? ''} onChange={e => setAnswer(`${prefix}_val`, e.target.value)} placeholder="Amount" className="w-full border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0EA5E9] transition-all" />
      </div>
      <div className="mt-6">
        <select value={answers[`${prefix}_cur`] ?? ''} onChange={e => setAnswer(`${prefix}_cur`, e.target.value)} className="border border-[#E2E8F0] rounded-lg px-3 py-2.5 text-[14px] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
          <option value="">Currency</option>
          {currencies.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-xl border border-[#E2E8F0] p-6">
      <SectionHeader letter="V" title="Fund Transfer (Finance Team)" />
      <div className="bg-[#FFFBEB] border border-[#FDE68A] rounded-lg px-4 py-3 mb-5 flex items-start gap-2">
        <span style={{ fontSize: '13px', color: '#92400E' }}>⚠️ This section is only required if Fund Transfer cover is needed. If not applicable, you may skip this section.</span>
      </div>
      <QuestionRow number="V1" question="Do you have a dual-control process for all payment/money transfers?"><YesNoButtons value={v1} onChange={setV1} /></QuestionRow>
      <QuestionRow number="V2" question="Are payment detail changes verified via a separate channel (phone or email confirmation)?"><YesNoButtons value={v2} onChange={setV2} /></QuestionRow>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4 border-b border-[#E2E8F0]">
        <MoneyField prefix="V_q3" label="Annual value of own funds managed" />
        <MoneyField prefix="V_q4" label="Funds held in trust or under management" />
        <MoneyField prefix="V_q5" label="Maximum daily electronic transfer volume" />
        <MoneyField prefix="V_q6" label="Average daily electronic transfer volume" />
        <MoneyField prefix="V_q7" label="Maximum single transfer amount" />
      </div>

      <QuestionRow number="V8" question="How are payments loaded?">
        <select value={v8 ?? ''} onChange={e => setV8(e.target.value)} className="border border-[#E2E8F0] rounded-lg px-4 py-2.5 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] bg-white cursor-pointer">
          <option value="">Select...</option>
          {['Manual entry', 'File upload', 'API integration', 'Other'].map(o => <option key={o}>{o}</option>)}
        </select>
      </QuestionRow>

      <QuestionRow number="V9" question="Is there a documented procedure for electronic fund transfers?"><YesNoButtons value={v9} onChange={setV9} /></QuestionRow>
      <ConditionalReveal show={v9 === 'yes'}>
        <div className="space-y-3">
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Authorized personnel only?</label><YesNoButtons value={answers['V_q9_auth'] ?? null} onChange={v => setAnswer('V_q9_auth', v)} /></div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Dual authorization required?</label><YesNoButtons value={answers['V_q9_dual'] ?? null} onChange={v => setAnswer('V_q9_dual', v)} /></div>
          <div><label className="block text-[13px] font-medium text-[#334155] mb-1.5">Segregation of duties?</label><YesNoButtons value={answers['V_q9_seg'] ?? null} onChange={v => setAnswer('V_q9_seg', v)} /></div>
        </div>
      </ConditionalReveal>

      <QuestionRow number="V10" question="Are payment applications protected by MFA, password, or hardware token?">
        <div className="mt-2"><CheckboxGroup selectedKey="V_q10_protection" options={['MFA', 'Password', 'Hardware token', 'None']} /></div>
      </QuestionRow>

      <QuestionRow number="V11" question="Are special log-on passwords used for terminal identity verification?"><YesNoButtons value={v11} onChange={setV11} /></QuestionRow>
    </div>
  );
}

// ── CATEGORY TABS ─────────────────────────────────────────────────────────
const TABS = [
  { id: 'all', label: 'All' },
  { id: 'system-dev', label: 'System Dev' },
  { id: 'communications', label: 'Communications' },
  { id: 'operations', label: 'Operations' },
  { id: 'physical', label: 'Physical' },
  { id: 'cryptography', label: 'Cryptography' },
  { id: 'access-control', label: 'Access Control' },
  { id: 'asset-mgmt', label: 'Asset Mgmt' },
  { id: 'hr-security', label: 'HR Security' },
  { id: 'org-security', label: 'Org Security' },
  { id: 'policies', label: 'Policies' },
  { id: 'technology', label: 'Technology' },
  { id: 'cloud', label: 'Cloud' },
  { id: 'system-failure', label: 'System Failure' },
  { id: 'data-records', label: 'Data Records' },
  { id: 'backups', label: 'Backups' },
  { id: 'fund-transfer', label: 'Fund Transfer' },
];

const TAB_SECTIONS: Record<string, string[]> = {
  'all': ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'],
  'system-dev': ['G'],
  'communications': ['H'],
  'operations': ['I'],
  'physical': ['J'],
  'cryptography': ['K'],
  'access-control': ['L'],
  'asset-mgmt': ['M'],
  'hr-security': ['N'],
  'org-security': ['O'],
  'policies': ['P'],
  'technology': ['Q'],
  'cloud': ['R'],
  'system-failure': ['S'],
  'data-records': ['T'],
  'backups': ['U'],
  'fund-transfer': ['V'],
};

const SECTION_MAP: Record<string, () => JSX.Element> = {
  G: SectionG, H: SectionH, I: SectionI, J: SectionJ,
  K: SectionK, L: SectionL, M: SectionM, N: SectionN,
  O: SectionO, P: SectionP, Q: SectionQ, R: SectionR,
  S: SectionS, T: SectionT, U: SectionU, V: SectionV,
};

// ── MAIN COMPONENT ─────────────────────────────────────────────────────────
export function Step4Security() {
  const [activeTab, setActiveTab] = useState('all');
  const { answers } = usePortal();

  const answeredCount = Object.keys(answers).filter(k => {
    const kStart = k.charAt(0);
    const val = answers[k];
    return ['G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V'].includes(kStart) &&
      val !== null && val !== undefined && val !== '';
  }).length;

  const totalQ = 67;
  const displayed = Math.min(answeredCount, totalQ);

  const visibleSections = TAB_SECTIONS[activeTab] ?? TAB_SECTIONS['all'];

  return (
    <div className="space-y-5">
      {/* Step Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Security Questionnaire</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }} className="mt-1">
          Answer all questions about your technical security controls
        </p>
      </div>

      {/* Category Tabs */}
      <div className="bg-[#F8FAFC] rounded-xl p-1.5 flex gap-1 flex-wrap overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-[13px] transition-all cursor-pointer whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-[#0EA5E9] font-medium'
                : 'text-[#64748B] hover:text-[#334155]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Progress */}
      <div className="bg-[#F8FAFC] rounded-xl px-4 py-3 flex items-center gap-4">
        <p style={{ fontSize: '13px', color: '#64748B', whiteSpace: 'nowrap' }}>
          Questions answered: <span style={{ fontWeight: 600, color: '#0F172A' }}>{displayed} / {totalQ}</span>
        </p>
        <div className="flex-1 h-2 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#0EA5E9] rounded-full transition-all duration-500"
            style={{ width: `${(displayed / totalQ) * 100}%` }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#64748B' }}>{Math.round((displayed / totalQ) * 100)}%</span>
      </div>

      {/* Sections */}
      {visibleSections.map(section => {
        const Component = SECTION_MAP[section];
        return <Component key={section} />;
      })}
    </div>
  );
}

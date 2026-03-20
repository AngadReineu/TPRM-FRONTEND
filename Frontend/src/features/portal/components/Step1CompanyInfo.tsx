import { Upload, X, CheckCircle2, Info } from 'lucide-react';
import { useRef, useState } from 'react';
import { usePortal, useAnswer } from '../context/PortalContext';

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

function TextArea({ id, placeholder, value, onChange, rows = 3 }: {
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

function FieldLabel({ htmlFor, label, required }: { htmlFor: string; label: string; required?: boolean }) {
  return (
    <label htmlFor={htmlFor} className="block text-[14px] font-medium text-[#0F172A] mb-1.5">
      {label}
      {required && <span className="text-[#EF4444] ml-0.5">*</span>}
    </label>
  );
}

interface CertUploadProps {
  docKey: string;
  label: string;
}

function CertUpload({ docKey, label }: CertUploadProps) {
  const { documents, setDocument, removeDocument } = usePortal();
  const inputRef = useRef<HTMLInputElement>(null);
  const doc = documents[docKey];

  const handleFileChange = (file: File) => {
    setDocument(docKey, { status: 'uploading', name: file.name, size: formatSize(file.size), progress: 0 });
    let p = 0;
    const interval = setInterval(() => {
      p += 20;
      setDocument(docKey, { status: 'uploading', name: file.name, size: formatSize(file.size), progress: p });
      if (p >= 100) {
        clearInterval(interval);
        setDocument(docKey, { status: 'uploaded', name: file.name, size: formatSize(file.size), progress: 100 });
      }
    }, 200);
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  if (doc?.status === 'uploaded') {
    return (
      <div className="border border-[#10B981] rounded-lg p-4 bg-[#F0FDF4]">
        <div className="flex items-center gap-2">
          <CheckCircle2 size={18} color="#10B981" />
          <span className="text-[13px] font-medium text-[#334155] flex-1 truncate">{doc.name}</span>
          <span className="text-[12px] text-[#64748B]">{doc.size}</span>
          <button type="button" onClick={() => removeDocument(docKey)} className="text-[#64748B] hover:text-[#EF4444] ml-2 cursor-pointer transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
    );
  }

  if (doc?.status === 'uploading') {
    return (
      <div className="border border-[#E2E8F0] rounded-lg p-4">
        <p className="text-[13px] text-[#334155] mb-2 truncate">{doc.name}</p>
        <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
          <div className="h-full bg-[#0EA5E9] rounded-full transition-all duration-200" style={{ width: `${doc.progress}%` }} />
        </div>
        <p className="text-[12px] text-[#94A3B8] mt-1">Uploading...</p>
      </div>
    );
  }

  return (
    <div
      className="border-2 border-dashed border-[#E2E8F0] rounded-lg p-5 flex flex-col items-center gap-1.5 cursor-pointer hover:border-[#0EA5E9] hover:bg-[#EFF6FF] transition-all"
      onClick={() => inputRef.current?.click()}
    >
      <Upload size={18} color="#94A3B8" />
      <p className="text-[13px] text-[#64748B]">Click to upload or drag & drop</p>
      <p className="text-[12px] text-[#94A3B8]">PDF, JPG, PNG up to 10MB</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.jpg,.jpeg,.png"
        onChange={e => e.target.files?.[0] && handleFileChange(e.target.files[0])}
      />
    </div>
  );
}

export function Step1CompanyInfo() {
  const [companyName, setCompanyName] = useAnswer('s1_company_name');
  const [website, setWebsite] = useAnswer('s1_website');
  const [address, setAddress] = useAnswer('s1_address');
  const [description, setDescription] = useAnswer('s1_description');
  const [established, setEstablished] = useAnswer('s1_established');
  const [subsidiaries, setSubsidiaries] = useAnswer('s1_subsidiaries');
  const [isoScope, setIsoScope] = useAnswer('s1_iso_scope');

  // Financial table state
  const regions = ['India', 'US & Canada', 'Rest of World'];
  const fields = ['Annual Turnover (USD)', 'Number of Locations', 'Total Employees', 'Online Revenue (USD)'];
  const { answers, setAnswer } = usePortal();

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Company Information</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }} className="mt-1">Tell us about your organization</p>
      </div>

      {/* Basic Details */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8">
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em' }} className="uppercase mb-6">
          Basic Details
        </h2>
        <div className="space-y-5">
          <div>
            <FieldLabel htmlFor="company_name" label="Company Legal Name" required />
            <TextInput id="company_name" placeholder="Enter your company's registered legal name" value={companyName} onChange={setCompanyName} />
          </div>
          <div>
            <FieldLabel htmlFor="website" label="Website" />
            <TextInput id="website" placeholder="https://www.yourcompany.com" value={website} onChange={setWebsite} />
          </div>
          <div>
            <FieldLabel htmlFor="address" label="Address of Company and All Subsidiaries" required />
            <TextArea id="address" placeholder="Full registered address including all subsidiary locations" value={address} onChange={setAddress} rows={3} />
          </div>
          <div>
            <FieldLabel htmlFor="description" label="Business Description" required />
            <TextArea id="description" placeholder="Describe your core business activities and services..." value={description} onChange={setDescription} rows={4} />
          </div>
          <div>
            <FieldLabel htmlFor="established" label="Date of Establishment" required />
            <input
              id="established"
              type="date"
              value={established ?? ''}
              onChange={e => setEstablished(e.target.value)}
              className="border border-[#E2E8F0] rounded-lg px-4 py-3 text-[14px] text-[#334155] focus:outline-none focus:border-[#0EA5E9] focus:ring-2 focus:ring-[#0EA5E9]/20 transition-all w-full sm:w-auto"
            />
          </div>
          <div>
            <FieldLabel htmlFor="subsidiaries" label="List of Covered Entities / Subsidiaries" />
            <TextArea id="subsidiaries" placeholder="List all subsidiary companies and covered entities (if any)" value={subsidiaries} onChange={setSubsidiaries} rows={3} />
          </div>
        </div>
      </div>

      {/* Certifications */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8">
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em' }} className="uppercase mb-6">
          Certifications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
          <div>
            <FieldLabel htmlFor="pci_cert" label="PCI DSS Certificate" />
            <CertUpload docKey="cert_pci" label="PCI DSS Certificate" />
          </div>
          <div>
            <FieldLabel htmlFor="iso_cert" label="ISO 27001 Certificate" />
            <CertUpload docKey="cert_iso27001" label="ISO 27001 Certificate" />
          </div>
        </div>
        <div>
          <FieldLabel htmlFor="iso_scope" label="ISO 27001 Certification Scope (if certified)" />
          <TextInput
            id="iso_scope"
            placeholder="e.g., Cloud infrastructure and data processing operations"
            value={isoScope}
            onChange={setIsoScope}
          />
        </div>
      </div>

      {/* Financial & Size Data */}
      <div className="bg-white rounded-xl border border-[#E2E8F0] p-8">
        <h2 style={{ fontSize: '12px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em' }} className="uppercase mb-5">
          Financial & Size Data
        </h2>

        {/* Info banner */}
        <div className="flex items-start gap-3 bg-[#DBEAFE] border border-[#BFDBFE] rounded-lg px-4 py-3 mb-5">
          <Info size={16} color="#0EA5E9" className="mt-0.5 shrink-0" />
          <p style={{ fontSize: '13px', color: '#1E40AF' }}>
            This information is used for regulatory compliance assessment under GDPR and DPDPA. All data is encrypted and stored securely.
          </p>
        </div>

        {/* Financial Table */}
        <div className="overflow-x-auto rounded-xl border border-[#E2E8F0]">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#F8FAFC]">
                <th className="px-4 py-3 text-[13px] text-[#64748B] font-medium border-b border-[#E2E8F0] min-w-[180px]">Field</th>
                {regions.map(r => (
                  <th key={r} className="px-4 py-3 text-[13px] text-[#64748B] font-medium border-b border-[#E2E8F0] text-center min-w-[140px]">{r}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {fields.map((field, fi) => (
                <tr key={field} className={fi % 2 === 0 ? 'bg-white' : 'bg-[#F8FAFC]'}>
                  <td className="px-4 py-3 text-[13px] text-[#334155] border-b border-[#E2E8F0]">{field}</td>
                  {regions.map(region => {
                    const key = `fin_${fi}_${region.replace(/[^a-z]/gi, '_').toLowerCase()}`;
                    return (
                      <td key={region} className="px-3 py-2 border-b border-[#E2E8F0]">
                        <input
                          type="number"
                          value={answers[key] ?? ''}
                          onChange={e => setAnswer(key, e.target.value)}
                          placeholder="0"
                          className="w-full border border-[#E2E8F0] rounded px-2 py-2 text-[13px] text-[#334155] text-center focus:outline-none focus:border-[#0EA5E9] transition-all"
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

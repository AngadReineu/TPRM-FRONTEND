import { FileText, Upload, CheckCircle2, X, AlertCircle } from 'lucide-react';
import { useRef } from 'react';
import { usePortal } from '../context/PortalContext';

interface DocCard {
  key: string;
  name: string;
  required: boolean;
  accept?: string;
}

const DOCUMENTS: DocCard[] = [
  { key: 'doc_info_security_policy', name: 'Information Security Policy', required: true },
  { key: 'doc_data_privacy_policy', name: 'Data Privacy Policy', required: true },
  { key: 'doc_bcp', name: 'Business Continuity Plan', required: true },
  { key: 'doc_cyber_insurance', name: 'Cyber Insurance Certificate', required: true },
  { key: 'doc_iso_soc', name: 'ISO 27001 / SOC 2 Certificate', required: true },
  { key: 'doc_vapt', name: 'Latest VAPT / Audit Report', required: false },
  { key: 'doc_dpa', name: 'Data Processing Agreement (DPA)', required: false },
  { key: 'doc_financial', name: 'Financial Statements', required: false },
];

const REQUIRED_COUNT = DOCUMENTS.filter(d => d.required).length;

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function DocumentCard({ doc }: { doc: DocCard }) {
  const { documents, setDocument, removeDocument } = usePortal();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileDoc = documents[doc.key];

  const handleFile = (file: File) => {
    const name = file.name;
    const size = formatSize(file.size);
    setDocument(doc.key, { status: 'uploading', name, size, progress: 0 });

    let p = 0;
    const interval = setInterval(() => {
      p += Math.floor(Math.random() * 15) + 10;
      if (p >= 100) {
        clearInterval(interval);
        setDocument(doc.key, { status: 'uploaded', name, size, progress: 100 });
      } else {
        setDocument(doc.key, { status: 'uploading', name, size, progress: p });
      }
    }, 130);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`bg-white rounded-xl border p-5 transition-all ${
        fileDoc?.status === 'uploaded'
          ? 'border-[#10B981]'
          : 'border-[#E2E8F0]'
      }`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText size={18} color="#0EA5E9" />
          <span style={{ fontSize: '14px', fontWeight: 600, color: '#0F172A' }}>{doc.name}</span>
        </div>
        <span
          className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
            doc.required
              ? 'bg-[#FEF2F2] text-[#EF4444]'
              : 'bg-[#F8FAFC] text-[#94A3B8]'
          }`}
        >
          {doc.required ? 'Required' : 'Optional'}
        </span>
      </div>

      {/* Upload zone / progress / success */}
      {!fileDoc || fileDoc.status === 'empty' ? (
        <div
          className="border-2 border-dashed border-[#E2E8F0] rounded-lg flex flex-col items-center justify-center gap-1.5 cursor-pointer hover:border-[#0EA5E9] hover:bg-[#EFF6FF] transition-all"
          style={{ height: 80 }}
          onClick={() => inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={e => e.preventDefault()}
        >
          <Upload size={18} color="#94A3B8" />
          <p style={{ fontSize: '13px', color: '#64748B' }}>Click to upload or drag & drop</p>
          <p style={{ fontSize: '12px', color: '#94A3B8' }}>PDF, DOCX up to 25MB</p>
        </div>
      ) : fileDoc.status === 'uploading' ? (
        <div className="px-1 py-2">
          <p className="text-[13px] text-[#334155] mb-2 truncate">{fileDoc.name}</p>
          <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#0EA5E9] rounded-full transition-all duration-150"
              style={{ width: `${fileDoc.progress}%` }}
            />
          </div>
          <p className="text-[12px] text-[#94A3B8] mt-1">Uploading... {fileDoc.progress}%</p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-[#F0FDF4] rounded-lg px-3 py-2.5">
          <CheckCircle2 size={18} color="#10B981" className="shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-[13px] font-medium text-[#334155] truncate">{fileDoc.name}</p>
            <p className="text-[12px] text-[#64748B]">{fileDoc.size}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-[12px] text-[#64748B] hover:text-[#0EA5E9] px-2 py-1 rounded transition-colors cursor-pointer"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => removeDocument(doc.key)}
              className="text-[12px] text-[#64748B] hover:text-[#EF4444] px-2 py-1 rounded transition-colors cursor-pointer"
            >
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept=".pdf,.docx,.doc,.jpg,.jpeg,.png"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
    </div>
  );
}

export function Step2Documents() {
  const { documents } = usePortal();

  const uploadedRequired = DOCUMENTS.filter(
    d => d.required && documents[d.key]?.status === 'uploaded'
  ).length;

  const uploadedOptional = DOCUMENTS.filter(
    d => !d.required && documents[d.key]?.status === 'uploaded'
  ).length;

  const allRequiredUploaded = uploadedRequired === REQUIRED_COUNT;

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#0F172A' }}>Upload Documents</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }} className="mt-1">
          Please upload the required compliance documents
        </p>
      </div>

      {/* Required documents banner */}
      <div
        className={`flex items-center gap-3 rounded-lg px-4 py-3 border ${
          allRequiredUploaded
            ? 'bg-[#F0FDF4] border-[#A7F3D0]'
            : uploadedRequired === 0
            ? 'bg-[#FEF2F2] border-[#FECACA]'
            : 'bg-[#FFF7ED] border-[#FED7AA]'
        }`}
      >
        {allRequiredUploaded ? (
          <CheckCircle2 size={18} color="#10B981" />
        ) : (
          <AlertCircle size={18} color={uploadedRequired === 0 ? '#EF4444' : '#F59E0B'} />
        )}
        <p
          style={{
            fontSize: '14px',
            fontWeight: 500,
            color: allRequiredUploaded ? '#065F46' : uploadedRequired === 0 ? '#991B1B' : '#92400E',
          }}
        >
          {allRequiredUploaded
            ? `All ${REQUIRED_COUNT} required documents uploaded! ${uploadedOptional > 0 ? `+ ${uploadedOptional} optional` : ''}`
            : uploadedRequired === 0
            ? `${REQUIRED_COUNT} of ${REQUIRED_COUNT} required documents needed to proceed`
            : `${uploadedRequired} of ${REQUIRED_COUNT} required documents uploaded · ${REQUIRED_COUNT - uploadedRequired} remaining`}
        </p>
      </div>

      {/* Document Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DOCUMENTS.map(doc => (
          <DocumentCard key={doc.key} doc={doc} />
        ))}
      </div>

      {!allRequiredUploaded && (
        <p style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center' }}>
          Upload all required documents to proceed to the next step.
        </p>
      )}
    </div>
  );
}

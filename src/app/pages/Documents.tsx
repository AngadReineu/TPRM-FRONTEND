import { useState, useRef } from 'react';
import { Upload, Send, FileText, Bot } from 'lucide-react';

const documents = [
  { id: 1, name: 'XYZ_ISO27001_Certificate.pdf', category: 'Certification', supplier: 'XYZ Corporation', uploaded: 'Feb 20, 2026', expiry: 'Feb 20, 2027', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 2, name: 'ABC_SOC2_Report_2025.pdf', category: 'Compliance Report', supplier: 'ABC Services Ltd', uploaded: 'Jan 15, 2026', expiry: 'Jan 15, 2027', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 3, name: 'DEF_Privacy_Policy.docx', category: 'Policy', supplier: 'DEF Limited', uploaded: 'Feb 27, 2026', expiry: '—', aiStatus: 'Processing', aiColor: '#F59E0B' },
  { id: 4, name: 'GHI_Pentest_Report_Q4.pdf', category: 'Security Report', supplier: 'GHI Technologies', uploaded: 'Nov 10, 2025', expiry: '—', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 5, name: 'JKL_GDPR_DPA.pdf', category: 'DPA / Contract', supplier: 'JKL Consultancy', uploaded: 'Feb 01, 2026', expiry: 'Dec 31, 2027', aiStatus: 'Failed', aiColor: '#EF4444' },
];

const categoryColors: Record<string, [string, string]> = {
  Certification: ['#EFF6FF', '#0EA5E9'],
  'Compliance Report': ['#ECFDF5', '#10B981'],
  Policy: ['#F5F3FF', '#8B5CF6'],
  'Security Report': ['#FEF2F2', '#EF4444'],
  'DPA / Contract': ['#FFFBEB', '#F59E0B'],
};

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

const initialMessages: ChatMessage[] = [
  { role: 'ai', content: 'Hello! I can answer questions about your uploaded documents. Ask me about certifications, compliance reports, or any supplier documentation.' },
];

const aiResponses: Record<string, string> = {
  default: 'Based on the indexed documents, I found relevant information. XYZ Corporation holds a valid ISO 27001 certificate expiring Feb 2027. ABC Services Ltd has a SOC 2 Type II report from 2025.',
  iso: 'XYZ Corporation\'s ISO 27001 certificate was issued Feb 20, 2026 and expires Feb 20, 2027. The certificate covers information security management for cloud services. Citation: XYZ_ISO27001_Certificate.pdf',
  soc: 'ABC Services Ltd\'s SOC 2 report (2025) covers Trust Services Criteria: Security, Availability, and Confidentiality. No exceptions were noted. Citation: ABC_SOC2_Report_2025.pdf',
  gdpr: 'JKL Consultancy\'s GDPR Data Processing Agreement is active through Dec 31, 2027. Note: The document failed to index — manual review recommended. Citation: JKL_GDPR_DPA.pdf',
};

export function Documents() {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  function sendMessage() {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', content: input };
    const lower = input.toLowerCase();
    let response = aiResponses.default;
    if (lower.includes('iso')) response = aiResponses.iso;
    else if (lower.includes('soc')) response = aiResponses.soc;
    else if (lower.includes('gdpr') || lower.includes('dpa')) response = aiResponses.gdpr;

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'ai', content: response }]);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 800);
  }

  const card: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E2E8F0',
    borderRadius: 12,
    boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Document RAG</h1>
        <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Upload and query supplier documents with AI</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); }}
        style={{
          border: `2px dashed ${isDragging ? '#0EA5E9' : '#CBD5E1'}`,
          borderRadius: 12,
          padding: '28px 24px',
          textAlign: 'center',
          backgroundColor: isDragging ? '#EFF6FF' : '#F8FAFC',
          cursor: 'pointer',
          transition: 'all 0.15s',
        }}
      >
        <Upload size={28} color={isDragging ? '#0EA5E9' : '#94A3B8'} style={{ margin: '0 auto 8px' }} />
        <div style={{ fontSize: 14, fontWeight: 600, color: '#334155', marginBottom: 4 }}>
          Drop documents here or <span style={{ color: '#0EA5E9', cursor: 'pointer' }}>browse to upload</span>
        </div>
        <div style={{ fontSize: 12, color: '#94A3B8' }}>Supports PDF, DOCX, XLSX, TXT · Max 50MB per file</div>
        <div style={{ marginTop: 12, fontSize: 12, color: '#64748B' }}>
          Or forward documents to: <code style={{ backgroundColor: '#E2E8F0', padding: '2px 8px', borderRadius: 5, fontSize: 12 }}>docs@tprm.abcinsurance.in</code>
        </div>
      </div>

      {/* Two-column: Table + AI Chat */}
      <div style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 20 }}>

        {/* Document List */}
        <div style={card}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid #E2E8F0', fontSize: 16, fontWeight: 600, color: '#0F172A' }}>
            Documents ({documents.length})
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['Document', 'Category', 'Supplier', 'Uploaded', 'Expiry', 'AI Status'].map(h => (
                  <th key={h} style={{ padding: '9px 14px', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => {
                const [catBg, catColor] = categoryColors[doc.category] ?? ['#F1F5F9', '#64748B'];
                return (
                  <tr key={doc.id} style={{ borderBottom: idx < documents.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-[#F8FAFC]">
                    <td style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <FileText size={15} color="#94A3B8" />
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#0F172A', maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ backgroundColor: catBg, color: catColor, fontSize: 11, fontWeight: 500, padding: '2px 8px', borderRadius: 5 }}>{doc.category}</span>
                    </td>
                    <td style={{ padding: '10px 14px', fontSize: 13, color: '#334155' }}>{doc.supplier}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8' }}>{doc.uploaded}</td>
                    <td style={{ padding: '10px 14px', fontSize: 12, color: '#94A3B8' }}>{doc.expiry}</td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ backgroundColor: doc.aiColor + '20', color: doc.aiColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>{doc.aiStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Chat */}
        <div style={{ ...card, display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid #E2E8F0', display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={15} color="#0EA5E9" />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#0F172A' }}>Ask AI about Documents</div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 10, maxHeight: 380 }}>
            {messages.map((msg, idx) => (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '85%',
                  padding: '10px 12px',
                  borderRadius: msg.role === 'user' ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  backgroundColor: msg.role === 'user' ? '#0EA5E9' : '#F8FAFC',
                  border: msg.role === 'ai' ? '1px solid #E2E8F0' : 'none',
                  fontSize: 13,
                  color: msg.role === 'user' ? '#fff' : '#334155',
                  lineHeight: 1.5,
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '12px 14px', borderTop: '1px solid #E2E8F0', display: 'flex', gap: 8 }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about certifications, policies..."
              style={{ flex: 1, padding: '9px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none' }}
            />
            <button
              onClick={sendMessage}
              style={{ padding: '9px 14px', backgroundColor: '#0EA5E9', border: 'none', borderRadius: 8, cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center' }}
              className="hover:bg-[#0284C7]"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
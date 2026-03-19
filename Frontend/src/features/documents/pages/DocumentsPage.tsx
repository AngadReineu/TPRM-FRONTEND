import { useState, useRef } from 'react';
import { Upload, Send, FileText, Bot } from 'lucide-react';
import type { ChatMessage } from '../types';
import { getDocuments, getAiResponses, getCategoryColors } from '../services/documents.data';

const documents = getDocuments();
const aiResponses = getAiResponses();
const categoryColors = getCategoryColors();

const initialMessages: ChatMessage[] = [
  { role: 'ai', content: 'Hello! I can answer questions about your uploaded documents. Ask me about certifications, compliance reports, or any supplier documentation.' },
];

export function DocumentsPage() {
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

  return (
    <div className="flex flex-col gap-5 max-w-[1200px]">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 m-0">Document RAG</h1>
        <p className="text-sm text-slate-500 mt-1">Upload and query supplier documents with AI</p>
      </div>

      {/* Upload Zone */}
      <div
        onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={e => { e.preventDefault(); setIsDragging(false); }}
        className={`rounded-xl py-7 px-6 text-center cursor-pointer transition-all duration-150 border-2 border-dashed ${
          isDragging
            ? 'border-sky-500 bg-sky-50'
            : 'border-slate-300 bg-slate-50'
        }`}
      >
        <Upload size={28} className={`mx-auto mb-2 ${isDragging ? 'text-sky-500' : 'text-slate-400'}`} />
        <div className="text-sm font-semibold text-slate-700 mb-1">
          Drop documents here or <span className="text-sky-500 cursor-pointer">browse to upload</span>
        </div>
        <div className="text-xs text-slate-400">Supports PDF, DOCX, XLSX, TXT · Max 50MB per file</div>
        <div className="mt-3 text-xs text-slate-500">
          Or forward documents to: <code className="bg-slate-200 px-2 py-0.5 rounded text-xs">docs@tprm.abcinsurance.in</code>
        </div>
      </div>

      {/* Two-column: Table + AI Chat */}
      <div className="grid grid-cols-[60fr_40fr] gap-5">

        {/* Document List */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="px-5 py-4 border-b border-slate-200 text-base font-semibold text-slate-900">
            Documents ({documents.length})
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Document', 'Category', 'Supplier', 'Uploaded', 'Expiry', 'AI Status'].map(h => (
                  <th key={h} className="px-3.5 py-2 text-[11px] font-medium text-slate-500 uppercase tracking-wide text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc, idx) => {
                const [catBg, catColor] = categoryColors[doc.category] ?? ['#F1F5F9', '#64748B'];
                return (
                  <tr key={doc.id} className={`hover:bg-slate-50 ${idx < documents.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <td className="px-3.5 py-2.5">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-slate-400" />
                        <span className="text-[13px] font-semibold text-slate-900 max-w-[160px] overflow-hidden text-ellipsis whitespace-nowrap">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-3.5 py-2.5">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded" style={{ backgroundColor: catBg, color: catColor }}>{doc.category}</span>
                    </td>
                    <td className="px-3.5 py-2.5 text-[13px] text-slate-700">{doc.supplier}</td>
                    <td className="px-3.5 py-2.5 text-xs text-slate-400">{doc.uploaded}</td>
                    <td className="px-3.5 py-2.5 text-xs text-slate-400">{doc.expiry}</td>
                    <td className="px-3.5 py-2.5">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: doc.aiColor + '20', color: doc.aiColor }}>{doc.aiStatus}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Chat */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm flex flex-col">
          <div className="px-4 py-3.5 border-b border-slate-200 flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-sky-50 flex items-center justify-center">
              <Bot size={15} className="text-sky-500" />
            </div>
            <div className="text-[15px] font-semibold text-slate-900">Ask AI about Documents</div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-3.5 flex flex-col gap-2.5 max-h-[380px]">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] px-3 py-2.5 text-[13px] leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-sky-500 text-white rounded-xl rounded-br-sm'
                      : 'bg-slate-50 border border-slate-200 text-slate-700 rounded-xl rounded-bl-sm'
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="px-3.5 py-3 border-t border-slate-200 flex gap-2">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Ask about certifications, policies..."
              className="flex-1 px-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none"
            />
            <button
              onClick={sendMessage}
              className="px-3.5 py-2 bg-sky-500 border-none rounded-lg cursor-pointer text-white flex items-center hover:bg-sky-600"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

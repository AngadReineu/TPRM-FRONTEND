import { useState, useEffect, useRef } from 'react';
import { X, Send } from 'lucide-react';
import type { Agent } from '../types';
import { AgentAvatar } from './AgentAvatar';

const MOCK_RESPONSES = [
  "I'm monitoring all assigned controls and suppliers in real-time. Anything specific to investigate?",
  "I've detected 2 anomalies in the last 24 hours. Would you like a detailed report?",
  'Running analysis now... I\'ll have results shortly.',
  'All systems are operating within normal parameters.',
];

interface ChatMessage {
  from: 'agent' | 'user';
  text: string;
}

export function ChatModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  const [msgs, setMsgs] = useState<ChatMessage[]>([
    {
      from: 'agent',
      text: `Hello! I'm ${agent.name}. I'm monitoring ${agent.controls} controls and ${agent.suppliers} suppliers. How can I help?`,
    },
    { from: 'user', text: 'Show me the latest alerts' },
    {
      from: 'agent',
      text: 'Found 2 alerts in the last 24 hours. XYZ Corporation has a missing data event and GHI Technologies assessment is overdue.',
    },
  ]);
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    setMsgs((m) => [...m, { from: 'user', text: input.trim() }]);
    setInput('');
    setTimeout(
      () =>
        setMsgs((m) => [
          ...m,
          {
            from: 'agent',
            text: MOCK_RESPONSES[
              Math.floor(Math.random() * MOCK_RESPONSES.length)
            ],
          },
        ]),
      800,
    );
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  return (
    <div className="fixed inset-0 z-[600] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative w-[420px] h-[540px] bg-white rounded-2xl flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2.5 border-b border-slate-200 px-4 py-3.5">
          <AgentAvatar agent={agent} size={36} />
          <div className="flex-1">
            <div className="text-sm font-bold text-slate-900">
              {agent.name}
            </div>
            <div className="flex items-center gap-1 mt-px">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[11px] text-emerald-500">Online</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-transparent border-none cursor-pointer text-slate-400"
          >
            <X size={18} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50 flex flex-col gap-2.5">
          {msgs.map((m, i) => (
            <div
              key={i}
              className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.from === 'agent' && <AgentAvatar agent={agent} size={28} />}
              <div
                className={`max-w-[75%] rounded-xl text-[13px] leading-relaxed py-2.5 px-3.5 ${
                  m.from === 'user'
                    ? 'bg-[#0EA5E9] text-white'
                    : 'ml-2 bg-white text-[#334155] border border-[#E2E8F0]'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="flex gap-2 border-t border-slate-200 px-3.5 py-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') send();
            }}
            placeholder="Type a message..."
            className="flex-1 border border-slate-200 rounded-lg px-3 py-2 text-[13px] text-slate-700 outline-none"
          />
          <button
            onClick={send}
            className="w-[38px] h-[38px] bg-sky-500 border-none rounded-lg cursor-pointer flex items-center justify-center"
          >
            <Send size={15} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
}

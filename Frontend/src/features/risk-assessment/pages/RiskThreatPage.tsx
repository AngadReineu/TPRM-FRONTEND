import { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb } from 'lucide-react';
import type { RiskEvent } from '../types';
import { getRiskData, getRiskEvents, getAiRecommendations, getSeverityColors, getStatusColors } from '../services/risk.data';
import { RiskDetailModal } from '../components/RiskDetailModal';

const riskData = getRiskData();
const riskEvents = getRiskEvents();
const aiRecommendations = getAiRecommendations();
const severityColors = getSeverityColors();
const statusColors = getStatusColors();

export function RiskThreatPage() {
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 m-0">Risk Threat</h1>
        <p className="text-sm text-slate-500 mt-1 mb-0">Monitor risk trends and respond to threats</p>
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between mb-5">
          <div className="text-base font-semibold text-slate-900">Risk Score Trend — Aug 2025 to Feb 2026</div>
          <select className="px-3 py-1.5 text-[13px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700">
            <option>Last 7 months</option>
            <option>Last 12 months</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={riskData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748B' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13 }} labelStyle={{ color: '#0F172A', fontWeight: 600 }} />
            <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} iconType="circle" />
            <Line type="monotone" dataKey="overall" name="Overall Risk" stroke="#0EA5E9" strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="critical" name="Critical" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
            <Line type="monotone" dataKey="high" name="High" stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="4 2" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Events + AI Recommendations */}
      <div className="grid grid-cols-[60fr_40fr] gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center justify-between mb-4">
            <div className="text-base font-semibold text-slate-900">Risk Events Timeline</div>
            <div className="text-xs text-slate-400">Click a row to view details & action plan</div>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['Date', 'Supplier', 'Description', 'Severity', 'Score \u0394', 'Status'].map(h => (
                  <th key={h} className="px-3 py-2 text-[11px] font-medium text-slate-500 uppercase tracking-[0.05em] text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {riskEvents.map((evt, idx) => {
                const [sevBgClass, sevTextClass] = severityColors[evt.severity] ?? ['bg-slate-100', 'text-slate-500'];
                const [stsBgClass, stsTextClass] = statusColors[evt.status] ?? ['bg-slate-100', 'text-slate-500'];
                return (
                  <tr
                    key={idx}
                    onClick={() => setSelectedEvent(evt)}
                    className={`hover:bg-sky-50 cursor-pointer ${idx < riskEvents.length - 1 ? 'border-b border-slate-100' : ''}`}
                  >
                    <td className="px-3 py-2.5 text-xs text-slate-400 whitespace-nowrap">{evt.date}</td>
                    <td className="px-3 py-2.5 text-[13px] font-semibold text-sky-500 whitespace-nowrap underline decoration-dotted underline-offset-[3px]">{evt.supplier}</td>
                    <td className="px-3 py-2.5 text-[13px] text-slate-500 max-w-[200px]">{evt.desc}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[5px] ${sevBgClass} ${sevTextClass}`}>{evt.severity}</span>
                    </td>
                    <td className={`px-3 py-2.5 text-[13px] font-bold ${evt.scoreChange !== '0' ? 'text-red-500' : 'text-emerald-500'}`}>{evt.scoreChange}</td>
                    <td className="px-3 py-2.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-[5px] ${stsBgClass} ${stsTextClass}`}>{evt.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
              <Lightbulb size={16} className="text-sky-500" />
            </div>
            <div className="text-base font-semibold text-slate-900">AI Recommendations</div>
          </div>
          <div className="flex flex-col gap-3">
            {aiRecommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-2.5 px-3 py-2.5 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-5 h-5 rounded-full bg-sky-50 border-2 border-sky-500 flex items-center justify-center shrink-0 text-[11px] font-bold text-sky-500 mt-px">
                  {idx + 1}
                </div>
                <p className="text-[13px] text-slate-700 m-0 leading-[1.5]">{rec}</p>
              </div>
            ))}
          </div>
          <button className="w-full mt-3.5 py-2 bg-sky-50 border border-sky-100 rounded-lg text-sky-500 text-[13px] font-semibold cursor-pointer">
            Refresh Recommendations
          </button>
        </div>
      </div>

      {selectedEvent && <RiskDetailModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />}
    </div>
  );
}

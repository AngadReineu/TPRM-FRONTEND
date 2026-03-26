import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Lightbulb, Search, Filter } from 'lucide-react';
import type { RiskEvent } from '../types';
import { fetchRiskData, fetchRiskEvents, fetchAiRecommendations, getSeverityColors, getStatusColors, getRiskEvents } from '../services/risk.data';
import { RiskDetailModal } from '../components/RiskDetailModal';

const severityColors = getSeverityColors();
const statusColors = getStatusColors();

export function RiskThreatPage() {
  const [selectedEvent, setSelectedEvent] = useState<RiskEvent | null>(null);
  
  const [riskData, setRiskData] = useState<any[]>([]);
  const [riskEvents, setRiskEvents] = useState<RiskEvent[]>([]);
  const [aiRecommendations, setAiRecommendations] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [filters, setFilters] = useState({ supplier: '', severity: 'All', status: 'All' });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [trendRes, eventsRes, aiRes] = await Promise.all([
        fetchRiskData(),
        fetchRiskEvents(),
        fetchAiRecommendations()
      ]);
      setRiskData(trendRes);
      console.log('[RISK EVENTS]', eventsRes);
      setRiskEvents(eventsRes.length > 0 ? eventsRes : getRiskEvents());
      setAiRecommendations(aiRes);
    } catch (e) {
      console.error("Error loading risk data", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEvents = riskEvents.filter((ev) => {
    if (filters.supplier && !ev.supplier?.toLowerCase().includes(filters.supplier.toLowerCase()) && !ev.supplierName?.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
    if (filters.severity !== 'All' && ev.severity !== filters.severity) return false;
    if (filters.status !== 'All' && ev.status !== filters.status) return false;
    return true;
  });

  return (
    <div className="flex flex-col gap-6 max-w-[1200px]">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 m-0">Risk Threat</h1>
        <p className="text-sm text-slate-500 mt-1 mb-0">Monitor risk trends and respond to threats automatically flagged by Agents</p>
      </div>

      {/* Filter Bar */}
      <div className="flex gap-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm items-end">
        <div className="flex-1">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Search Supplier</label>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search by supplier name..." 
              value={filters.supplier}
              onChange={e => setFilters(f => ({ ...f, supplier: e.target.value }))}
              className="w-full h-9 pl-9 pr-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500 focus:bg-white transition-colors"
            />
          </div>
        </div>
        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Severity</label>
          <select 
            value={filters.severity}
            onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))}
            className="w-full h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
          >
            <option value="All">All Severities</option>
            <option value="Critical">Critical</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>
        </div>
        <div className="w-[180px]">
          <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Status</label>
          <select 
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value }))}
            className="w-full h-9 px-3 text-[13px] bg-slate-50 border border-slate-200 rounded-lg outline-none focus:border-sky-500"
          >
            <option value="All">All Statuses</option>
            <option value="Open">Open</option>
            <option value="In Review">In Review</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
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
      <div className="grid grid-cols-[65fr_35fr] gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="text-base font-semibold text-slate-900 flex items-center gap-2">
              Risk Events Timeline {isLoading && <span className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="text-xs text-slate-400">Click a row to view details & action plan</div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-y border-slate-200">
                  {['Date', 'Run ID', 'Supplier', 'Description', 'Severity', 'Score \u0394', 'Status'].map(h => (
                    <th key={h} className="px-3 py-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider text-left whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredEvents.map((evt, idx) => {
                  const [sevBgClass, sevTextClass] = severityColors[evt.severity] ?? ['bg-slate-100', 'text-slate-500'];
                  const [stsBgClass, stsTextClass] = statusColors[evt.status] ?? ['bg-slate-100', 'text-slate-500'];
                  return (
                    <tr
                      key={evt.id || idx}
                      onClick={() => setSelectedEvent(evt)}
                      className="hover:bg-slate-50 cursor-pointer border-b border-slate-100 transition-colors"
                    >
                      <td className="px-3 py-3 text-[13px] font-medium text-slate-700 whitespace-nowrap">{(evt.date || evt.runDate) ?? 'Unknown'}</td>
                      <td className="px-3 py-3 text-[13px] text-slate-500 whitespace-nowrap font-mono">{evt.runId ? `#${evt.runId}` : 'Manual'}</td>
                      <td className="px-3 py-3 text-[13px] font-bold text-sky-600 whitespace-nowrap underline decoration-sky-200 underline-offset-4">{evt.supplierName || evt.supplier}</td>
                      <td className="px-3 py-3 text-[13px] text-slate-600 max-w-[200px] truncate">{evt.description || evt.desc}</td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${sevBgClass} ${sevTextClass}`}>{evt.severity}</span>
                      </td>
                      <td className={`px-3 py-3 text-[13px] font-bold ${typeof evt.scoreChange === 'number' ? (evt.scoreChange > 0 ? 'text-red-500' : 'text-emerald-500') : (evt.scoreChange?.startsWith('+') ? 'text-red-500' : 'text-emerald-500')}`}>
                        {typeof evt.scoreChange === 'number' ? `${evt.scoreChange > 0 ? '+' : ''}${evt.scoreChange}` : evt.scoreChange}
                      </td>
                      <td className="px-3 py-3">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${stsBgClass} ${stsTextClass} whitespace-nowrap`}>{evt.status}</span>
                      </td>
                    </tr>
                  );
                })}
                {filteredEvents.length === 0 && !isLoading && (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-slate-500">
                      No risk events found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* AI Recommendations */}
        <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col">
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center shrink-0">
              <Lightbulb size={18} className="text-indigo-600" />
            </div>
            <div className="text-base font-bold text-slate-900">AI Recommendations</div>
          </div>
          <div className="flex flex-col gap-3 flex-1">
            {aiRecommendations.map((rec, idx) => (
              <div key={idx} className="flex gap-3 px-3.5 py-3 bg-slate-50/80 rounded-xl border border-slate-200/60 hover:border-slate-300 transition-colors">
                <div className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-[11px] font-bold text-indigo-700 mt-0.5">
                  {idx + 1}
                </div>
                <p className="text-[13px] text-slate-700 m-0 leading-relaxed font-medium">{rec}</p>
              </div>
            ))}
          </div>
          <button 
            onClick={() => loadData()}
            className="w-full mt-4 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/50 rounded-lg text-indigo-600 outline-none text-[13px] font-bold cursor-pointer transition-colors"
          >
            Refresh Insights
          </button>
        </div>
      </div>

      {selectedEvent && (
        <RiskDetailModal 
          event={selectedEvent} 
          onClose={() => setSelectedEvent(null)} 
          onUpdate={(updatedEvent) => {
            setRiskEvents(events => events.map(e => e.id === updatedEvent.id ? updatedEvent : e));
            setSelectedEvent(updatedEvent);
          }}
        />
      )}
    </div>
  );
}

import { useState } from 'react';
import { Download, Search } from 'lucide-react';
import { getLogs, getActionColors, getStatusColors, getUserColors } from '../services/audit.data';

const logs = getLogs();
const actionColors = getActionColors();
const statusColors = getStatusColors();
const userColors = getUserColors();

export function AuditLogsPage() {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-5 max-w-[1200px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Audit Logs</h1>
          <p className="text-sm text-slate-500 mt-1">Complete activity log for your TPRM platform</p>
        </div>
        <div className="flex gap-2">
          {['CSV', 'PDF', 'JSON'].map(fmt => (
            <button key={fmt} className="flex items-center gap-1.5 px-3.5 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-700 cursor-pointer font-medium">
              <Download size={14} />
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2.5 flex-wrap">
        <div className="relative">
          <Search size={15} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="pl-8 pr-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none w-[200px]"
          />
        </div>
        <input type="date" className="px-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none text-slate-700" />
        <select className="px-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700">
          <option>All Users</option>
          <option>Priya Sharma</option>
          <option>Raj Kumar</option>
          <option>System</option>
        </select>
        <select className="px-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700">
          <option>All Actions</option>
          <option>Control Updated</option>
          <option>Supplier Added</option>
          <option>Alert Triggered</option>
        </select>
        <select className="px-3 py-2 text-[13px] border border-slate-200 rounded-lg outline-none bg-white text-slate-700">
          <option>All Entities</option>
          <option>Controls</option>
          <option>Suppliers</option>
          <option>Agents</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Timestamp', 'User', 'Action', 'Entity', 'Description', 'IP', 'Status'].map(h => (
                <th key={h} className="px-3.5 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((log, idx) => {
              const [actBg, actColor] = actionColors[log.action] ?? ['#F1F5F9', '#64748B'];
              const [stsBg, stsColor] = statusColors[log.status] ?? ['#F1F5F9', '#64748B'];
              const avatarColor = userColors[log.id % userColors.length];
              const initials = log.user === 'System' ? 'SYS' : log.user.split(' ').map(n => n[0]).join('');
              return (
                <tr key={log.id} className={`hover:bg-slate-50 ${idx < filtered.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                  <td className="px-3.5 py-[11px] text-xs text-slate-400 whitespace-nowrap">{log.ts}</td>
                  <td className="px-3.5 py-[11px]">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0"
                        style={{
                          backgroundColor: log.user === 'System' ? '#F1F5F9' : avatarColor,
                          color: log.user === 'System' ? '#64748B' : '#fff',
                        }}
                      >
                        {initials}
                      </div>
                      <div>
                        <div className="text-[13px] font-semibold text-slate-900">{log.user}</div>
                        <div className="text-[11px] text-slate-400">{log.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3.5 py-[11px]">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded whitespace-nowrap" style={{ backgroundColor: actBg, color: actColor }}>{log.action}</span>
                  </td>
                  <td className="px-3.5 py-[11px] text-[13px] font-semibold text-slate-700">{log.entity}</td>
                  <td className="px-3.5 py-[11px] text-[13px] text-slate-500 max-w-[280px]">{log.desc}</td>
                  <td className="px-3.5 py-[11px] text-xs text-slate-400 font-mono">{log.ip}</td>
                  <td className="px-3.5 py-[11px]">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded" style={{ backgroundColor: stsBg, color: stsColor }}>{log.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 bg-slate-50">
          <span className="text-[13px] text-slate-500">Showing {filtered.length} of {logs.length} entries</span>
          <div className="flex gap-1.5">
            {['Prev', 'Next'].map(label => (
              <button key={label} className="text-[13px] text-slate-500 bg-white border border-slate-200 rounded-md px-3 py-1 cursor-pointer">{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Download, Search } from 'lucide-react';

const logs = [
  { id: 1, ts: 'Feb 27, 2026 · 14:32:10', user: 'Priya Sharma', role: 'Risk Manager', action: 'Control Updated', entity: 'MFA Enforcement', desc: 'Coverage threshold changed from 90% to 94%', ip: '10.0.1.45', status: 'Success' },
  { id: 2, ts: 'Feb 27, 2026 · 12:15:44', user: 'Raj Kumar', role: 'Compliance Officer', action: 'Supplier Added', entity: 'PQR Systems', desc: 'New supplier onboarded to Acquisition stage', ip: '10.0.1.22', status: 'Success' },
  { id: 3, ts: 'Feb 27, 2026 · 11:02:58', user: 'System', role: 'Agent', action: 'Alert Triggered', entity: 'Agent A1', desc: 'GHI Technologies — assessment overdue 32 days', ip: '—', status: 'Warning' },
  { id: 4, ts: 'Feb 26, 2026 · 17:45:20', user: 'Anita Nair', role: 'DPO', action: 'PII Configured', entity: 'XYZ Corporation', desc: 'Data sharing agreement activated — API daily', ip: '10.0.2.11', status: 'Success' },
  { id: 5, ts: 'Feb 26, 2026 · 15:30:05', user: 'System', role: 'Agent', action: 'Control Eval', entity: 'Encryption at Rest', desc: 'Coverage dropped below 70% threshold', ip: '—', status: 'Warning' },
  { id: 6, ts: 'Feb 25, 2026 · 10:14:32', user: 'Priya Sharma', role: 'Risk Manager', action: 'User Login', entity: 'Platform', desc: 'Successful login from Mumbai, India', ip: '10.0.1.45', status: 'Success' },
  { id: 7, ts: 'Feb 24, 2026 · 16:22:48', user: 'Mohan Das', role: 'Admin', action: 'Role Changed', entity: 'Analyst User', desc: 'Role upgraded from Viewer to Analyst', ip: '10.0.3.88', status: 'Success' },
  { id: 8, ts: 'Feb 24, 2026 · 09:05:11', user: 'System', role: 'Agent', action: 'Portal Sent', entity: 'DEF Limited', desc: 'Assessment portal link re-sent after 7 days', ip: '—', status: 'Info' },
];

const actionColors: Record<string, [string, string]> = {
  'Control Updated': ['#EFF6FF', '#0EA5E9'],
  'Supplier Added': ['#ECFDF5', '#10B981'],
  'Alert Triggered': ['#FEF2F2', '#EF4444'],
  'PII Configured': ['#F5F3FF', '#8B5CF6'],
  'Control Eval': ['#FFFBEB', '#F59E0B'],
  'User Login': ['#F1F5F9', '#64748B'],
  'Role Changed': ['#F5F3FF', '#8B5CF6'],
  'Portal Sent': ['#EFF6FF', '#0EA5E9'],
};

const statusColors: Record<string, [string, string]> = {
  Success: ['#ECFDF5', '#10B981'],
  Warning: ['#FFFBEB', '#F59E0B'],
  Info: ['#EFF6FF', '#0EA5E9'],
};

const userColors = ['#0EA5E9', '#10B981', '#8B5CF6', '#F59E0B', '#EF4444'];

export function AuditLogs() {
  const [search, setSearch] = useState('');

  const filtered = logs.filter(l =>
    l.user.toLowerCase().includes(search.toLowerCase()) ||
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.entity.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1200 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Audit Logs</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Complete activity log for your TPRM platform</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['CSV', 'PDF', 'JSON'].map(fmt => (
            <button key={fmt} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '8px 14px', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 8, fontSize: 13, color: '#334155', cursor: 'pointer', fontWeight: 500 }}>
              <Download size={14} />
              {fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ position: 'relative' }}>
          <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            style={{ paddingLeft: 32, paddingRight: 12, paddingTop: 8, paddingBottom: 8, fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', width: 200 }}
          />
        </div>
        <input type="date" style={{ padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', color: '#334155' }} />
        <select style={{ padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
          <option>All Users</option>
          <option>Priya Sharma</option>
          <option>Raj Kumar</option>
          <option>System</option>
        </select>
        <select style={{ padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
          <option>All Actions</option>
          <option>Control Updated</option>
          <option>Supplier Added</option>
          <option>Alert Triggered</option>
        </select>
        <select style={{ padding: '8px 12px', fontSize: 13, border: '1px solid #E2E8F0', borderRadius: 8, outline: 'none', backgroundColor: '#fff', color: '#334155' }}>
          <option>All Entities</option>
          <option>Controls</option>
          <option>Suppliers</option>
          <option>Agents</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
              {['Timestamp', 'User', 'Action', 'Entity', 'Description', 'IP', 'Status'].map(h => (
                <th key={h} style={{ padding: '10px 14px', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
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
                <tr key={log.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-[#F8FAFC]">
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#94A3B8', whiteSpace: 'nowrap' }}>{log.ts}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', backgroundColor: log.user === 'System' ? '#F1F5F9' : avatarColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: log.user === 'System' ? '#64748B' : '#fff', flexShrink: 0 }}>
                        {initials}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: '#0F172A' }}>{log.user}</div>
                        <div style={{ fontSize: 11, color: '#94A3B8' }}>{log.role}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ backgroundColor: actBg, color: actColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5, whiteSpace: 'nowrap' }}>{log.action}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontSize: 13, fontWeight: 600, color: '#334155' }}>{log.entity}</td>
                  <td style={{ padding: '11px 14px', fontSize: 13, color: '#64748B', maxWidth: 280 }}>{log.desc}</td>
                  <td style={{ padding: '11px 14px', fontSize: 12, color: '#94A3B8', fontFamily: 'monospace' }}>{log.ip}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ backgroundColor: stsBg, color: stsColor, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 5 }}>{log.status}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid #E2E8F0', backgroundColor: '#F8FAFC' }}>
          <span style={{ fontSize: 13, color: '#64748B' }}>Showing {filtered.length} of {logs.length} entries</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {['Prev', 'Next'].map(label => (
              <button key={label} style={{ fontSize: 13, color: '#64748B', backgroundColor: '#fff', border: '1px solid #E2E8F0', borderRadius: 6, padding: '5px 12px', cursor: 'pointer' }}>{label}</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
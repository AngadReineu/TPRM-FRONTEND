import { useState } from 'react';
import { Plus, Edit2 } from 'lucide-react';

/* ── Data ─────────────────────────────────────────────── */
const roles = ['Admin', 'Risk Manager', 'Compliance Officer', 'DPO', 'Analyst', 'Viewer'];
const modules = ['Dashboard', 'Controls', 'Agents', 'TPRM', 'Library', 'Risk Threat', 'Audit Logs', 'Documents', 'Roles', 'Settings'];

type Permission = 'full' | 'read' | 'none';

const permissions: Record<string, Record<string, Permission>> = {
  Admin: { Dashboard: 'full', Controls: 'full', Agents: 'full', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'full', Documents: 'full', Roles: 'full', Settings: 'full' },
  'Risk Manager': { Dashboard: 'full', Controls: 'full', Agents: 'full', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'read', Documents: 'full', Roles: 'read', Settings: 'read' },
  'Compliance Officer': { Dashboard: 'read', Controls: 'full', Agents: 'read', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'read', Documents: 'full', Roles: 'none', Settings: 'read' },
  DPO: { Dashboard: 'read', Controls: 'read', Agents: 'none', TPRM: 'full', Library: 'read', 'Risk Threat': 'read', 'Audit Logs': 'read', Documents: 'full', Roles: 'none', Settings: 'read' },
  Analyst: { Dashboard: 'read', Controls: 'read', Agents: 'read', TPRM: 'read', Library: 'read', 'Risk Threat': 'read', 'Audit Logs': 'read', Documents: 'read', Roles: 'none', Settings: 'none' },
  Viewer: { Dashboard: 'read', Controls: 'none', Agents: 'none', TPRM: 'read', Library: 'none', 'Risk Threat': 'read', 'Audit Logs': 'none', Documents: 'none', Roles: 'none', Settings: 'none' },
};

const users = [
  { id: 1, name: 'Priya Sharma', email: 'priya@abcinsurance.in', role: 'Risk Manager', lastLogin: '2 min ago', status: 'Active', avatar: '#0EA5E9' },
  { id: 2, name: 'Raj Kumar', email: 'raj@abcinsurance.in', role: 'Compliance Officer', lastLogin: '3 hrs ago', status: 'Active', avatar: '#10B981' },
  { id: 3, name: 'Anita Nair', email: 'anita@abcinsurance.in', role: 'DPO', lastLogin: '1 day ago', status: 'Active', avatar: '#8B5CF6' },
  { id: 4, name: 'Mohan Das', email: 'mohan@abcinsurance.in', role: 'Admin', lastLogin: '5 hrs ago', status: 'Active', avatar: '#F59E0B' },
  { id: 5, name: 'Sunita Reddy', email: 'sunita@abcinsurance.in', role: 'Analyst', lastLogin: '2 days ago', status: 'Active', avatar: '#EF4444' },
  { id: 6, name: 'Vikram Singh', email: 'vikram@abcinsurance.in', role: 'Viewer', lastLogin: '1 week ago', status: 'Inactive', avatar: '#64748B' },
];

/* ── Permission Cell ─────────────────────────────────── */
function PermCell({ perm }: { perm: Permission }) {
  if (perm === 'full') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          backgroundColor: '#ECFDF5', color: '#059669',
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5,
          whiteSpace: 'nowrap',
        }}>
          Full Access
        </span>
      </div>
    );
  }
  if (perm === 'read') {
    return (
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          backgroundColor: '#EFF6FF', color: '#2563EB',
          fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5,
          whiteSpace: 'nowrap',
        }}>
          View Only
        </span>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', justifyContent: 'center' }}>
      <span style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 600 }}>—</span>
    </div>
  );
}

const card: React.CSSProperties = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #E2E8F0',
  borderRadius: 12,
  boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
};

/* ── Role color pills ────────────────────────────────── */
const roleColors: Record<string, [string, string]> = {
  Admin: ['#FEF2F2', '#DC2626'],
  'Risk Manager': ['#EFF6FF', '#2563EB'],
  'Compliance Officer': ['#F5F3FF', '#7C3AED'],
  DPO: ['#ECFDF5', '#059669'],
  Analyst: ['#FFFBEB', '#D97706'],
  Viewer: ['#F8FAFC', '#64748B'],
};

export function Roles() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 1300 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#0F172A', margin: 0 }}>Roles & Access</h1>
          <p style={{ fontSize: 14, color: '#64748B', margin: '4px 0 0' }}>Manage user roles and module-level permissions</p>
        </div>
        <button
          style={{ display: 'flex', alignItems: 'center', gap: 6, backgroundColor: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 16px', fontSize: 14, fontWeight: 600, cursor: 'pointer' }}
          className="hover:bg-[#0284C7]"
        >
          <Plus size={16} /> {activeTab === 'roles' ? 'Add Role' : 'Invite User'}
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #E2E8F0', gap: 0 }}>
        {(['roles', 'users'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '10px 20px', fontSize: 14, fontWeight: 500, cursor: 'pointer',
              border: 'none', background: 'none',
              color: activeTab === tab ? '#0EA5E9' : '#64748B',
              borderBottom: activeTab === tab ? '2px solid #0EA5E9' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab === 'roles' ? 'Roles & Permissions' : 'Users'}
          </button>
        ))}
      </div>

      {activeTab === 'roles' ? (
        <div style={{ ...card, overflow: 'hidden' }}>
          {/* Legend */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #E2E8F0', backgroundColor: '#F8FAFC', display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Permission Levels:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ backgroundColor: '#ECFDF5', color: '#059669', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>Full Access</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>Can view and edit</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ backgroundColor: '#EFF6FF', color: '#2563EB', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 5 }}>View Only</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>Read access only</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ color: '#CBD5E1', fontSize: 14, fontWeight: 600 }}>—</span>
              <span style={{ fontSize: 12, color: '#64748B' }}>No access</span>
            </div>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                  <th style={{ padding: '12px 20px', fontSize: 11, fontWeight: 600, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap', minWidth: 160 }}>Role</th>
                  {modules.map(m => (
                    <th key={m} style={{ padding: '12px 10px', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center', whiteSpace: 'nowrap', minWidth: 100 }}>{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => {
                  const [bg, color] = roleColors[role] ?? ['#F1F5F9', '#64748B'];
                  return (
                    <tr key={role} style={{ borderBottom: idx < roles.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-[#F8FAFC]">
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{ backgroundColor: bg, color, fontSize: 12, fontWeight: 600, padding: '4px 12px', borderRadius: 6 }}>{role}</span>
                      </td>
                      {modules.map(m => (
                        <td key={m} style={{ padding: '14px 10px' }}>
                          <PermCell perm={permissions[role]?.[m] ?? 'none'} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div style={card}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#F8FAFC', borderBottom: '1px solid #E2E8F0' }}>
                {['User', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', fontSize: 11, fontWeight: 500, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'left', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const initials = u.name.split(' ').map(n => n[0]).join('');
                const [roleBg, roleColor] = roleColors[u.role] ?? ['#F1F5F9', '#64748B'];
                return (
                  <tr key={u.id} style={{ borderBottom: idx < users.length - 1 ? '1px solid #F1F5F9' : 'none' }} className="hover:bg-[#F8FAFC]">
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', backgroundColor: u.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0 }}>{initials}</div>
                        <span style={{ fontSize: 14, fontWeight: 600, color: '#0F172A' }}>{u.name}</span>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: '#64748B' }}>{u.email}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: roleBg, color: roleColor, fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 6 }}>{u.role}</span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#94A3B8' }}>{u.lastLogin}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{ backgroundColor: u.status === 'Active' ? '#ECFDF5' : '#F1F5F9', color: u.status === 'Active' ? '#10B981' : '#94A3B8', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 20 }}>{u.status}</span>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <button style={{ padding: 6, borderRadius: 6, background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }} className="hover:text-[#0EA5E9] hover:bg-[#EFF6FF]">
                        <Edit2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

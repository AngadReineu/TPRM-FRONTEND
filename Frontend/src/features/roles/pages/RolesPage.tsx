import { useState, useEffect } from 'react';
import { Plus, Edit2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { PermCell } from '../components/PermCell';
import {
  fetchRolesData,
  fetchUsers,
  updateUserRole,
  getRoles,
  getModules,
  getPermissions,
  getRoleColors,
  getUsers,
} from '../services/roles.data';
import type { RoleUser, RolesData } from '../types';

export function RolesPage() {
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [loading, setLoading] = useState(true);
  const [rolesData, setRolesData] = useState<RolesData>({
    roles: getRoles(),
    modules: getModules(),
    permissions: getPermissions(),
    roleColors: getRoleColors(),
  });
  const [users, setUsers] = useState<RoleUser[]>(getUsers());
  const [updatingUserId, setUpdatingUserId] = useState<number | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [rolesResult, usersResult] = await Promise.all([
          fetchRolesData(),
          fetchUsers(),
        ]);
        setRolesData(rolesResult);
        setUsers(usersResult);
      } catch (error) {
        console.error('Failed to load roles data:', error);
        toast.error('Failed to load roles data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleUpdateUserRole = async (userId: number, newRole: string) => {
    setUpdatingUserId(userId);
    try {
      const updatedUser = await updateUserRole(userId, { role: newRole });
      setUsers(prev => prev.map(u => (u.id === userId ? updatedUser : u)));
      toast.success('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      toast.error('Failed to update user role');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const { roles, modules, permissions, roleColors } = rolesData;

  if (loading) {
    return (
      <div className="flex flex-col gap-5 max-w-[1300px]">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 m-0">Roles &amp; Access</h1>
            <p className="text-sm text-slate-500 mt-1">Manage user roles and module-level permissions</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
          <span className="ml-3 text-slate-500">Loading roles data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 max-w-[1300px]">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 m-0">Roles &amp; Access</h1>
          <p className="text-sm text-slate-500 mt-1">Manage user roles and module-level permissions</p>
        </div>
        <button className="flex items-center gap-1.5 bg-sky-500 text-white border-none rounded-lg px-4 py-2 text-sm font-semibold cursor-pointer hover:bg-sky-600">
          <Plus size={16} /> {activeTab === 'roles' ? 'Add Role' : 'Invite User'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {(['roles', 'users'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 text-sm font-medium cursor-pointer border-none bg-transparent -mb-px ${
              activeTab === tab
                ? 'text-sky-500 border-b-2 border-sky-500'
                : 'text-slate-500 border-b-2 border-transparent'
            }`}
          >
            {tab === 'roles' ? 'Roles & Permissions' : 'Users'}
          </button>
        ))}
      </div>

      {activeTab === 'roles' ? (
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {/* Legend */}
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex items-center gap-5 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Permission Levels:</span>
            <div className="flex items-center gap-1.5">
              <span className="bg-emerald-50 text-emerald-600 text-[11px] font-semibold px-2.5 py-[3px] rounded">Full Access</span>
              <span className="text-xs text-slate-500">Can view and edit</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="bg-sky-50 text-blue-600 text-[11px] font-semibold px-2.5 py-[3px] rounded">View Only</span>
              <span className="text-xs text-slate-500">Read access only</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-300 text-sm font-semibold">&mdash;</span>
              <span className="text-xs text-slate-500">No access</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wide text-left whitespace-nowrap min-w-[160px]">Role</th>
                  {modules.map(m => (
                    <th key={m} className="px-2.5 py-3 text-[11px] font-medium text-slate-500 uppercase tracking-wide text-center whitespace-nowrap min-w-[100px]">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {roles.map((role, idx) => {
                  const [bg, color] = roleColors[role] ?? ['#F1F5F9', '#64748B'];
                  return (
                    <tr key={role} className={`hover:bg-slate-50 ${idx < roles.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                      <td className="px-5 py-3.5">
                        <span className="text-xs font-semibold px-3 py-1 rounded-md" style={{ backgroundColor: bg, color }}>{role}</span>
                      </td>
                      {modules.map(m => (
                        <td key={m} className="px-2.5 py-3.5">
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
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                {['User', 'Email', 'Role', 'Last Login', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-2.5 text-[11px] font-medium text-slate-500 uppercase tracking-wide text-left whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u, idx) => {
                const initials = u.name.split(' ').map(n => n[0]).join('');
                const [roleBg, roleColor] = roleColors[u.role] ?? ['#F1F5F9', '#64748B'];
                const isUpdating = updatingUserId === u.id;
                return (
                  <tr key={u.id} className={`hover:bg-slate-50 ${idx < users.length - 1 ? 'border-b border-[#F1F5F9]' : ''}`}>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0"
                          style={{ backgroundColor: u.avatar }}
                        >
                          {initials}
                        </div>
                        <span className="text-sm font-semibold text-slate-900">{u.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[13px] text-slate-500">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-semibold px-2.5 py-[3px] rounded-md" style={{ backgroundColor: roleBg, color: roleColor }}>{u.role}</span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">{u.lastLogin}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`text-xs font-semibold px-2.5 py-[3px] rounded-full ${
                          u.status === 'Active' ? 'bg-[#ECFDF5] text-[#10B981]' : 'bg-[#F1F5F9] text-[#94A3B8]'
                        }`}
                      >
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        className="p-1.5 rounded-md bg-transparent border-none text-slate-400 cursor-pointer hover:text-sky-500 hover:bg-sky-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isUpdating}
                      >
                        {isUpdating ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Edit2 size={14} />
                        )}
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

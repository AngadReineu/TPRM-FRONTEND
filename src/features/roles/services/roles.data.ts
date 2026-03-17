import type { Permission, RoleUser } from '../types';

const roles = ['Admin', 'Risk Manager', 'Compliance Officer', 'DPO', 'Analyst', 'Viewer'];

const modules = ['Dashboard', 'Controls', 'Agents', 'TPRM', 'Library', 'Risk Threat', 'Audit Logs', 'Documents', 'Roles', 'Settings'];

const permissions: Record<string, Record<string, Permission>> = {
  Admin: { Dashboard: 'full', Controls: 'full', Agents: 'full', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'full', Documents: 'full', Roles: 'full', Settings: 'full' },
  'Risk Manager': { Dashboard: 'full', Controls: 'full', Agents: 'full', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'read', Documents: 'full', Roles: 'read', Settings: 'read' },
  'Compliance Officer': { Dashboard: 'read', Controls: 'full', Agents: 'read', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'read', Documents: 'full', Roles: 'none', Settings: 'read' },
  DPO: { Dashboard: 'read', Controls: 'read', Agents: 'none', TPRM: 'full', Library: 'read', 'Risk Threat': 'read', 'Audit Logs': 'read', Documents: 'full', Roles: 'none', Settings: 'read' },
  Analyst: { Dashboard: 'read', Controls: 'read', Agents: 'read', TPRM: 'read', Library: 'read', 'Risk Threat': 'read', 'Audit Logs': 'read', Documents: 'read', Roles: 'none', Settings: 'none' },
  Viewer: { Dashboard: 'read', Controls: 'none', Agents: 'none', TPRM: 'read', Library: 'none', 'Risk Threat': 'read', 'Audit Logs': 'none', Documents: 'none', Roles: 'none', Settings: 'none' },
};

const users: RoleUser[] = [
  { id: 1, name: 'Priya Sharma', email: 'priya@abcinsurance.in', role: 'Risk Manager', lastLogin: '2 min ago', status: 'Active', avatar: '#0EA5E9' },
  { id: 2, name: 'Raj Kumar', email: 'raj@abcinsurance.in', role: 'Compliance Officer', lastLogin: '3 hrs ago', status: 'Active', avatar: '#10B981' },
  { id: 3, name: 'Anita Nair', email: 'anita@abcinsurance.in', role: 'DPO', lastLogin: '1 day ago', status: 'Active', avatar: '#8B5CF6' },
  { id: 4, name: 'Mohan Das', email: 'mohan@abcinsurance.in', role: 'Admin', lastLogin: '5 hrs ago', status: 'Active', avatar: '#F59E0B' },
  { id: 5, name: 'Sunita Reddy', email: 'sunita@abcinsurance.in', role: 'Analyst', lastLogin: '2 days ago', status: 'Active', avatar: '#EF4444' },
  { id: 6, name: 'Vikram Singh', email: 'vikram@abcinsurance.in', role: 'Viewer', lastLogin: '1 week ago', status: 'Inactive', avatar: '#64748B' },
];

const roleColors: Record<string, [string, string]> = {
  Admin: ['#FEF2F2', '#DC2626'],
  'Risk Manager': ['#EFF6FF', '#2563EB'],
  'Compliance Officer': ['#F5F3FF', '#7C3AED'],
  DPO: ['#ECFDF5', '#059669'],
  Analyst: ['#FFFBEB', '#D97706'],
  Viewer: ['#F8FAFC', '#64748B'],
};

export function getRoles() {
  return roles;
}

export function getModules() {
  return modules;
}

export function getPermissions() {
  return permissions;
}

export function getUsers() {
  return users;
}

export function getRoleColors() {
  return roleColors;
}

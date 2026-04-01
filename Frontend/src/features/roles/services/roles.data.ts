import { api } from '../../../lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { Permission, RoleUser, RolesData, UpdateUserRolePayload } from '../types';

// ─────────────────────────────────────────────────────────────────────────────
// Default Data (used as fallback when API unavailable)
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_ROLES = ['Admin', 'Risk Manager', 'Compliance Officer', 'DPO', 'Analyst', 'Viewer'];

const DEFAULT_MODULES = ['Dashboard', 'TPRM', 'Library', 'Risk Threat', 'Audit Logs', 'Roles', 'Settings'];

const DEFAULT_PERMISSIONS: Record<string, Record<string, Permission>> = {
  Admin: { Dashboard: 'full', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'full', Roles: 'full', Settings: 'full' },
  'Risk Manager': { Dashboard: 'full', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'read', Roles: 'read', Settings: 'read' },
  'Compliance Officer': { Dashboard: 'read', TPRM: 'full', Library: 'full', 'Risk Threat': 'full', 'Audit Logs': 'read', Roles: 'none', Settings: 'read' },
  DPO: { Dashboard: 'read', TPRM: 'full', Library: 'read', 'Risk Threat': 'read', 'Audit Logs': 'read', Roles: 'none', Settings: 'read' },
  Analyst: { Dashboard: 'read', TPRM: 'read', Library: 'read', 'Risk Threat': 'read', 'Audit Logs': 'read', Roles: 'none', Settings: 'none' },
  Viewer: { Dashboard: 'read', TPRM: 'read', Library: 'none', 'Risk Threat': 'read', 'Audit Logs': 'none', Roles: 'none', Settings: 'none' },
};

const DEFAULT_USERS: RoleUser[] = [];

const DEFAULT_ROLE_COLORS: Record<string, [string, string]> = {
  Admin: ['#FEF2F2', '#DC2626'],
  'Risk Manager': ['#EFF6FF', '#2563EB'],
  'Compliance Officer': ['#F5F3FF', '#7C3AED'],
  DPO: ['#ECFDF5', '#059669'],
  Analyst: ['#FFFBEB', '#D97706'],
  Viewer: ['#F8FAFC', '#64748B'],
};

// ─────────────────────────────────────────────────────────────────────────────
// Synchronous getters (for backward compatibility)
// ─────────────────────────────────────────────────────────────────────────────

export function getRoles() {
  return DEFAULT_ROLES;
}

export function getModules() {
  return DEFAULT_MODULES;
}

export function getPermissions() {
  return DEFAULT_PERMISSIONS;
}

export function getUsers() {
  return DEFAULT_USERS;
}

export function getRoleColors() {
  return DEFAULT_ROLE_COLORS;
}

// ─────────────────────────────────────────────────────────────────────────────
// API Service Functions (async with fallback)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Fetch all roles with their permissions from the API.
 */
export async function fetchRolesData(): Promise<RolesData> {
  return withFallback(
    async () => {
      const data = await api.get<RolesData>('/roles');
      return toCamelCase<RolesData>(data);
    },
    () => ({
      roles: DEFAULT_ROLES,
      modules: DEFAULT_MODULES,
      permissions: DEFAULT_PERMISSIONS,
      roleColors: DEFAULT_ROLE_COLORS,
    }),
    'Roles'
  );
}

/**
 * Fetch all users with their role assignments.
 */
export async function fetchUsers(): Promise<RoleUser[]> {
  return withFallback(
    async () => {
      const data = await api.get<RoleUser[]>('/roles/users');
      return toCamelCase<RoleUser[]>(data);
    },
    () => DEFAULT_USERS,
    'Roles/Users'
  );
}

/**
 * Update a user's role assignment.
 */
export async function updateUserRole(userId: number, payload: UpdateUserRolePayload): Promise<RoleUser> {
  const data = await api.patch<RoleUser>(`/roles/users/${userId}`, toSnakeCase(payload));
  return toCamelCase<RoleUser>(data);
}

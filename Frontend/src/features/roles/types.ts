export type Permission = 'full' | 'read' | 'none';

export interface RoleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
  avatar: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, Permission>;
  userCount?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface RolesData {
  roles: string[];
  modules: string[];
  permissions: Record<string, Record<string, Permission>>;
  roleColors: Record<string, [string, string]>;
}

export interface UpdateUserRolePayload {
  role: string;
}

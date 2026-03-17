export type Permission = 'full' | 'read' | 'none';

export interface RoleUser {
  id: number;
  name: string;
  email: string;
  role: string;
  lastLogin: string;
  status: string;
  avatar: string;
}

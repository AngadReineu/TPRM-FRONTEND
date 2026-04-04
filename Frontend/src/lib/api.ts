/**
 * API client with JWT authentication.
 *
 * Usage:
 *   import { api } from '@/lib/api';
 *   const data = await api.get<Supplier[]>('/vendors');
 */

import { useAuthStore } from '../stores/authStore';

// @ts-ignore
const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  skipAuth?: boolean;
}

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, skipAuth, ...rest } = options;

  const token = useAuthStore.getState().token;

  const authHeaders: Record<string, string> = {};
  if (token && !skipAuth) {
    authHeaders['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  // Handle 401 Unauthorized - clear auth state (React Router will handle redirect)
  if (res.status === 401 && !skipAuth) {
    useAuthStore.getState().logout();
    // Don't do hard reload - let React Router handle the redirect
    throw new ApiError(401, 'Session expired. Please login again.');
  }

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new ApiError(res.status, errorData.detail || `API Error: ${res.status} ${res.statusText}`);
  }

  // Handle 204 No Content
  if (res.status === 204) {
    return undefined as T;
  }

  return res.json() as Promise<T>;
}

export const api = {
  get:    <T>(url: string, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'GET' }),
  post:   <T>(url: string, body: unknown, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'POST', body }),
  put:    <T>(url: string, body: unknown, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'PUT', body }),
  patch:  <T>(url: string, body: unknown, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'PATCH', body }),
  delete: <T>(url: string, opts?: RequestOptions) => request<T>(url, { ...opts, method: 'DELETE' }),
};

// Auth-specific API calls (don't require token)
export const authApi = {
  login: (email: string, password: string) =>
    api.post<{ access_token: string; token_type: string }>('/auth/login', { email, password }, { skipAuth: true }),

  register: (name: string, email: string, password: string, role: string = 'Risk Manager') =>
    api.post<{ access_token: string; token_type: string }>('/auth/register', { name, email, password, role }, { skipAuth: true }),

  // me() accepts an optional token for use right after login (before store is updated)
  me: (token?: string) => {
    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return api.get<{ id: string; name: string; email: string; role: string; org_name?: string; industry?: string; avatar?: string; status: string }>(
      '/auth/me',
      { headers }
    );
  },
};

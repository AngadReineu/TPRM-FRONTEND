/**
 * API client placeholder.
 * When a backend is ready, configure the base URL and add interceptors here.
 *
 * Usage:
 *   import { api } from '@/lib/api';
 *   const data = await api.get<Supplier[]>('/suppliers');
 */

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api';

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers, ...rest } = options;

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  if (!res.ok) {
    throw new Error(`API Error: ${res.status} ${res.statusText}`);
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

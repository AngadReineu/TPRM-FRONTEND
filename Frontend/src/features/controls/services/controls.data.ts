import { api } from '../../../lib/api';
import { toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { Control } from '../types';

/** Get all controls from API */
export async function getControls(): Promise<Control[]> {
  const data = await api.get<unknown[]>('/controls');
  return toCamelCase<Control[]>(data);
}

/** Get a control by ID */
export function getControlById(controls: Control[], id: string): Control | undefined {
  return controls.find(c => c.id === id);
}

/** Toggle control active state */
export async function toggleControl(id: string): Promise<Control> {
  const result = await api.patch<Record<string, unknown>>(`/controls/${id}/toggle`, {});
  return toCamelCase<Control>(result);
}

/** Create a new control */
export async function createControl(control: Omit<Control, 'id'>): Promise<Control> {
  const payload = toSnakeCase(control);
  const result = await api.post<Record<string, unknown>>('/controls', payload);
  return toCamelCase<Control>(result);
}

/** Update a control */
export async function updateControl(id: string, control: Partial<Control>): Promise<Control> {
  const payload = toSnakeCase(control);
  const result = await api.patch<Record<string, unknown>>(`/controls/${id}`, payload);
  return toCamelCase<Control>(result);
}

/** Delete a control */
export async function deleteControl(id: string): Promise<void> {
  await api.delete(`/controls/${id}`);
}

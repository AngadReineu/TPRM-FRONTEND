import { api } from '../../../lib/api';
import { toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { Supplier } from '../types';

/**
 * Fetch all vendors from API.
 */
export async function getVendors(): Promise<Supplier[]> {
  try {
    return toCamelCase(await api.get('/vendors'));
  } catch (error) {
    console.error('Failed to fetch vendors:', error);
    return [];
  }
}

/**
 * Fetch a single vendor by ID.
 */
export async function getVendorById(id: string): Promise<Supplier | undefined> {
  try {
    return toCamelCase(await api.get(`/vendors/${id}`));
  } catch (error) {
    console.error('Failed to fetch vendor:', error);
    return undefined;
  }
}

/**
 * Create a new vendor.
 */
export async function createVendor(data: Partial<Supplier>): Promise<Supplier> {
  return toCamelCase(await api.post('/vendors', toSnakeCase(data)));
}

/**
 * Update an existing vendor.
 */
export async function updateVendor(id: string, data: Partial<Supplier>): Promise<Supplier> {
  return toCamelCase(await api.patch(`/vendors/${id}`, toSnakeCase(data)));
}

/**
 * Delete a vendor.
 */
export async function deleteVendor(id: string): Promise<void> {
  await api.delete(`/vendors/${id}`);
}

// Keep legacy getter for backward compatibility
export function getSuppliers(): Supplier[] {
  return [];
}

export function getSupplierById(id: string): Supplier | undefined {
  return undefined;
}

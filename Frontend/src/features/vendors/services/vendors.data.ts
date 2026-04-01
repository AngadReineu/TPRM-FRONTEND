import { api } from '../../../lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { Supplier } from '../types';

const DEFAULT_SUPPLIERS: Supplier[] = [];

/**
 * Fetch all vendors from API with fallback to empty array.
 */
export async function getVendors(): Promise<Supplier[]> {
  return withFallback(
    async () => toCamelCase(await api.get('/vendors')),
    DEFAULT_SUPPLIERS,
    'vendors'
  );
}

/**
 * Fetch a single vendor by ID.
 */
export async function getVendorById(id: string): Promise<Supplier | undefined> {
  return withFallback(
    async () => toCamelCase(await api.get(`/vendors/${id}`)),
    undefined,
    'vendor'
  );
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

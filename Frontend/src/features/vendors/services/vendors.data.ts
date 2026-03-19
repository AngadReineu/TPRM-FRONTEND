import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';
import type { Supplier } from '../types';

const MOCK_SUPPLIERS: Supplier[] = [
  {
    id: '1',
    name: 'XYZ Corporation',
    email: 'contact@xyz.com',
    stage: 'Acquisition',
    stageColor: '#0EA5E9',
    score: 78,
    risk: 'High',
    riskColor: '#F59E0B',
    assessment: 'complete',
    pii: { configured: true, icons: ['ID', 'Email', 'Mobile', 'Doc', 'Location'], method: 'API' },
    piiFlow: 'share',
    contractEnd: 'Mar 2026',
    contractWarning: true,
    agentId: 'A1',
    lastActivity: '2 min ago',
    internalSpoc: 'priya@abc.co',
    externalSpoc: 'john@xyz.com',
  },
  {
    id: '2',
    name: 'ABC Services Ltd',
    email: 'ops@abc.com',
    stage: 'Retention',
    stageColor: '#10B981',
    score: 42,
    risk: 'Low',
    riskColor: '#10B981',
    assessment: 'complete',
    pii: { configured: true, icons: ['Email', 'Mobile'], method: 'SFTP' },
    piiFlow: 'ingest',
    contractEnd: 'Dec 2027',
    agentId: 'A2',
    lastActivity: '1 hr ago',
    internalSpoc: 'raj@abc.co',
    externalSpoc: 'ops@abcsvc.com',
  },
  {
    id: '3',
    name: 'DEF Limited',
    email: 'info@def.com',
    stage: 'Upgradation',
    stageColor: '#F59E0B',
    score: 62,
    risk: 'Medium',
    riskColor: '#64748B',
    assessment: 'overdue',
    pii: { configured: false },
    piiFlow: 'both',
    contractEnd: 'Jun 2025',
    contractWarning: true,
    agentId: 'A3',
    lastActivity: '2 hrs ago',
    internalSpoc: 'anita@abc.co',
    externalSpoc: 'info@def.com',
  },
  {
    id: '4',
    name: 'GHI Technologies',
    email: 'bd@ghi.com',
    stage: 'Acquisition',
    stageColor: '#0EA5E9',
    score: 91,
    risk: 'Critical',
    riskColor: '#EF4444',
    assessment: 'overdue',
    pii: { configured: false },
    piiFlow: 'share',
    contractEnd: 'Sep 2026',
    agentId: 'A1',
    lastActivity: '5 hrs ago',
    internalSpoc: 'priya@abc.co',
    externalSpoc: 'bd@ghi.com',
  },
  {
    id: '5',
    name: 'JKL Consultancy',
    email: 'admin@jkl.com',
    stage: 'Retention',
    stageColor: '#10B981',
    score: 35,
    risk: 'Low',
    riskColor: '#10B981',
    assessment: 'complete',
    pii: { configured: true, icons: ['Email'], method: 'Email' },
    piiFlow: 'ingest',
    contractEnd: 'Jan 2028',
    agentId: 'A4',
    lastActivity: '3 hrs ago',
    internalSpoc: 'raj@abc.co',
    externalSpoc: 'admin@jkl.com',
  },
  {
    id: '6',
    name: 'MNO Partners',
    email: 'contact@mno.com',
    stage: 'Offboarding',
    stageColor: '#94A3B8',
    score: 55,
    risk: 'Medium',
    riskColor: '#64748B',
    assessment: 'pending',
    pii: { configured: false },
    contractEnd: 'Apr 2026',
    contractWarning: true,
    agentId: 'A2',
    lastActivity: '1 day ago',
  },
  {
    id: '7',
    name: 'PQR Systems',
    email: 'info@pqr.com',
    stage: 'Acquisition',
    stageColor: '#0EA5E9',
    score: 67,
    risk: 'Medium',
    riskColor: '#64748B',
    assessment: 'pending',
    pii: { configured: false },
    piiFlow: 'share',
    contractEnd: 'Nov 2027',
    agentId: 'A5',
    lastActivity: '6 hrs ago',
  },
  {
    id: '8',
    name: 'STU Analytics',
    email: 'hello@stu.com',
    stage: 'Upgradation',
    stageColor: '#F59E0B',
    score: 22,
    risk: 'Low',
    riskColor: '#10B981',
    assessment: 'complete',
    pii: { configured: false, method: 'configure' },
    piiFlow: 'both',
    contractEnd: 'Jul 2028',
    agentId: 'A2',
    lastActivity: '4 hrs ago',
  },
];

/**
 * Fetch all vendors from API with fallback to mock data.
 */
export async function getVendors(): Promise<Supplier[]> {
  return withFallback(
    async () => toCamelCase(await api.get('/vendors')),
    MOCK_SUPPLIERS,
    'vendors'
  );
}

/**
 * Fetch a single vendor by ID.
 */
export async function getVendorById(id: string): Promise<Supplier | undefined> {
  return withFallback(
    async () => toCamelCase(await api.get(`/vendors/${id}`)),
    MOCK_SUPPLIERS.find(s => s.id === id),
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
  return [...MOCK_SUPPLIERS];
}

export function getSupplierById(id: string): Supplier | undefined {
  return MOCK_SUPPLIERS.find(s => s.id === id);
}

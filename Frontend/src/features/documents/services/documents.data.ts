import { api } from '@/lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '@/lib/apiUtils';
import type { Document, DocumentUpload, AiQueryResponse } from '../types';

const MOCK_DOCUMENTS: Document[] = [
  { id: 1, name: 'XYZ_ISO27001_Certificate.pdf', category: 'Certification', supplier: 'XYZ Corporation', uploaded: 'Feb 20, 2026', expiry: 'Feb 20, 2027', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 2, name: 'ABC_SOC2_Report_2025.pdf', category: 'Compliance Report', supplier: 'ABC Services Ltd', uploaded: 'Jan 15, 2026', expiry: 'Jan 15, 2027', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 3, name: 'DEF_Privacy_Policy.docx', category: 'Policy', supplier: 'DEF Limited', uploaded: 'Feb 27, 2026', expiry: '\u2014', aiStatus: 'Processing', aiColor: '#F59E0B' },
  { id: 4, name: 'GHI_Pentest_Report_Q4.pdf', category: 'Security Report', supplier: 'GHI Technologies', uploaded: 'Nov 10, 2025', expiry: '\u2014', aiStatus: 'Indexed', aiColor: '#10B981' },
  { id: 5, name: 'JKL_GDPR_DPA.pdf', category: 'DPA / Contract', supplier: 'JKL Consultancy', uploaded: 'Feb 01, 2026', expiry: 'Dec 31, 2027', aiStatus: 'Failed', aiColor: '#EF4444' },
];

const aiResponses: Record<string, string> = {
  default: 'Based on the indexed documents, I found relevant information. XYZ Corporation holds a valid ISO 27001 certificate expiring Feb 2027. ABC Services Ltd has a SOC 2 Type II report from 2025.',
  iso: "XYZ Corporation's ISO 27001 certificate was issued Feb 20, 2026 and expires Feb 20, 2027. The certificate covers information security management for cloud services. Citation: XYZ_ISO27001_Certificate.pdf",
  soc: "ABC Services Ltd's SOC 2 report (2025) covers Trust Services Criteria: Security, Availability, and Confidentiality. No exceptions were noted. Citation: ABC_SOC2_Report_2025.pdf",
  gdpr: "JKL Consultancy's GDPR Data Processing Agreement is active through Dec 31, 2027. Note: The document failed to index \u2014 manual review recommended. Citation: JKL_GDPR_DPA.pdf",
};

const categoryColors: Record<string, [string, string]> = {
  Certification: ['#EFF6FF', '#0EA5E9'],
  'Compliance Report': ['#ECFDF5', '#10B981'],
  Policy: ['#F5F3FF', '#8B5CF6'],
  'Security Report': ['#FEF2F2', '#EF4444'],
  'DPA / Contract': ['#FFFBEB', '#F59E0B'],
};

/* ── Sync getters (backward compatibility) ── */

export function getDocuments() {
  return MOCK_DOCUMENTS;
}

export function getAiResponses() {
  return aiResponses;
}

export function getCategoryColors() {
  return categoryColors;
}

/* ── API Service Functions ── */

/**
 * Fetch all documents from API
 */
export async function fetchDocuments(): Promise<Document[]> {
  return withFallback(
    async () => toCamelCase(await api.get<unknown[]>('/documents')),
    MOCK_DOCUMENTS,
    'documents'
  );
}

/**
 * Upload a new document
 */
export async function uploadDocument(data: DocumentUpload): Promise<Document> {
  const formData = new FormData();
  formData.append('file', data.file);
  formData.append('category', data.category);
  formData.append('supplier', data.supplier);
  if (data.expiry) formData.append('expiry', data.expiry);

  const result = await api.post<Record<string, unknown>>('/documents/upload', formData);
  return toCamelCase<Document>(result);
}

/**
 * Delete a document
 */
export async function deleteDocument(id: number): Promise<void> {
  await api.delete<void>(`/documents/${id}`);
}

/**
 * Query documents with AI
 */
export async function queryDocumentsAi(query: string): Promise<AiQueryResponse> {
  const mockResponse = (): AiQueryResponse => {
    const q = query.toLowerCase();
    if (q.includes('iso')) return { response: aiResponses.iso, citations: ['XYZ_ISO27001_Certificate.pdf'] };
    if (q.includes('soc')) return { response: aiResponses.soc, citations: ['ABC_SOC2_Report_2025.pdf'] };
    if (q.includes('gdpr') || q.includes('dpa')) return { response: aiResponses.gdpr, citations: ['JKL_GDPR_DPA.pdf'] };
    return { response: aiResponses.default, citations: [] };
  };

  return withFallback(
    async () => toCamelCase(await api.post<unknown>('/documents/ai-query', toSnakeCase({ query }))),
    mockResponse(),
    'documents-ai-query'
  );
}

/**
 * Reindex a document for AI processing
 */
export async function reindexDocument(id: number): Promise<Document> {
  const result = await api.post<Record<string, unknown>>(`/documents/${id}/reindex`);
  return toCamelCase<Document>(result);
}

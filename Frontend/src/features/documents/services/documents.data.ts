import { api } from '../../../lib/api';
import { withFallback, toCamelCase, toSnakeCase } from '../../../lib/apiUtils';
import type { Document, DocumentUpload, AiQueryResponse } from '../types';

const categoryColors: Record<string, [string, string]> = {
  Certification: ['#EFF6FF', '#0EA5E9'],
  'Compliance Report': ['#ECFDF5', '#10B981'],
  Policy: ['#F5F3FF', '#8B5CF6'],
  'Security Report': ['#FEF2F2', '#EF4444'],
  'DPA / Contract': ['#FFFBEB', '#F59E0B'],
};

/* ── Sync getters (backward compatibility) ── */

export function getDocuments() {
  return [] as Document[];
}

export function getAiResponses() {
  return {} as Record<string, string>;
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
    [],
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
    return { response: '', citations: [] };
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

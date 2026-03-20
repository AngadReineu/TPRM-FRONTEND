import React, { createContext, useContext, useState, useCallback } from 'react';

export interface DocumentFile {
  name: string;
  size: string;
  status: 'empty' | 'uploading' | 'uploaded';
  progress: number;
}

interface PortalContextType {
  answers: Record<string, any>;
  setAnswer: (key: string, value: any) => void;
  documents: Record<string, DocumentFile>;
  setDocument: (key: string, doc: Partial<DocumentFile> & { status: DocumentFile['status'] }) => void;
  removeDocument: (key: string) => void;
  savedStatus: 'idle' | 'saving' | 'saved';
  triggerSave: () => void;
  completion: number;
  requiredDocsUploaded: number;
}

const REQUIRED_DOC_KEYS = [
  'doc_info_security_policy',
  'doc_data_privacy_policy',
  'doc_bcp',
  'doc_cyber_insurance',
  'doc_iso_soc',
];

const PortalContext = createContext<PortalContextType | null>(null);

export function PortalProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [documents, setDocuments] = useState<Record<string, DocumentFile>>({});
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const setAnswer = useCallback((key: string, value: any) => {
    setAnswers(prev => ({ ...prev, [key]: value }));
  }, []);

  const setDocument = useCallback((key: string, doc: Partial<DocumentFile> & { status: DocumentFile['status'] }) => {
    setDocuments(prev => ({
      ...prev,
      [key]: { name: '', size: '', progress: 0, ...prev[key], ...doc },
    }));
  }, []);

  const removeDocument = useCallback((key: string) => {
    setDocuments(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const triggerSave = useCallback(() => {
    setSavedStatus('saving');
    setTimeout(() => {
      setSavedStatus('saved');
      setTimeout(() => setSavedStatus('idle'), 2000);
    }, 500);
  }, []);

  const answeredCount = Object.keys(answers).filter(k => {
    const val = answers[k];
    if (val === null || val === undefined || val === '') return false;
    if (Array.isArray(val)) return val.length > 0;
    return true;
  }).length;

  const uploadedDocs = Object.values(documents).filter(d => d?.status === 'uploaded').length;
  const completion = Math.min(Math.round(((answeredCount * 0.7) + (uploadedDocs * 5)) / 85 * 100), 100);

  const requiredDocsUploaded = REQUIRED_DOC_KEYS.filter(
    k => documents[k]?.status === 'uploaded'
  ).length;

  return (
    <PortalContext.Provider value={{
      answers, setAnswer,
      documents, setDocument, removeDocument,
      savedStatus, triggerSave,
      completion,
      requiredDocsUploaded,
    }}>
      {children}
    </PortalContext.Provider>
  );
}

export function usePortal() {
  const ctx = useContext(PortalContext);
  if (!ctx) throw new Error('usePortal must be used within PortalProvider');
  return ctx;
}

export function useAnswer(key: string): [any, (val: any) => void] {
  const { answers, setAnswer } = usePortal();
  return [answers[key] ?? null, (val: any) => setAnswer(key, val)];
}

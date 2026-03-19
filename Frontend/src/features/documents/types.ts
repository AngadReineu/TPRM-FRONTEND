export interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export interface Document {
  id: number;
  name: string;
  category: string;
  supplier: string;
  uploaded: string;
  expiry: string;
  aiStatus: 'Indexed' | 'Processing' | 'Failed';
  aiColor: string;
}

export interface DocumentUpload {
  file: File;
  category: string;
  supplier: string;
  expiry?: string;
}

export interface AiQueryResponse {
  response: string;
  citations: string[];
}

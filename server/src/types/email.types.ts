// Email Types and Interfaces

export type EmailTone = 'formal' | 'friendly' | 'urgent' | 'casual';
export type EmailAction = 'generate' | 'shorten' | 'expand' | 'fix_grammar' | 'generate_subject';

export interface EmailGenerationRequest {
  originalText: string;
  tone: EmailTone;
  action: EmailAction;
  userId?: number;
  subject?: string;
}

export interface EmailGenerationResponse {
  success: boolean;
  data?: {
    generatedEmail: string;
    subject?: string;
    originalText: string;
    tone: EmailTone;
    action: EmailAction;
    wordCount?: {
      original: number;
      generated: number;
    };
  };
  error?: string;
  message?: string;
}

export interface EmailHistoryItem {
  id: number;
  originalText: string;
  generatedEmail: string;
  subject: string | null;
  tone: string;
  action: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EmailHistoryResponse {
  success: boolean;
  data?: EmailHistoryItem[];
  error?: string;
  pagination?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

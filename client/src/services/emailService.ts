// Email API Service - Frontend

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

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
  createdAt: string;
  updatedAt: string;
}

class EmailService {
  /**
   * Generate email using AI
   */
  async generateEmail(request: EmailGenerationRequest): Promise<EmailGenerationResponse> {
    try {
      const response = await fetch(`${API_URL}/email/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Email generation error:', error);
      return {
        success: false,
        error: 'Failed to connect to server',
      };
    }
  }

  /**
   * Get email history
   */
  async getHistory(userId: number, page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_URL}/email/history?userId=${userId}&page=${page}&limit=${limit}`
      );
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch history:', error);
      return {
        success: false,
        error: 'Failed to fetch history',
      };
    }
  }

  /**
   * Delete email from history
   */
  async deleteEmail(emailId: number, userId: number) {
    try {
      const response = await fetch(`${API_URL}/email/${emailId}?userId=${userId}`, {
        method: 'DELETE',
      });
      return await response.json();
    } catch (error) {
      console.error('Failed to delete email:', error);
      return {
        success: false,
        error: 'Failed to delete email',
      };
    }
  }
}

export const emailService = new EmailService();
export default emailService;

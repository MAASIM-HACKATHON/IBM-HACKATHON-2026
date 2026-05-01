import { useState } from 'react';
import emailService, { EmailTone, EmailAction, EmailGenerationResponse } from '../services/emailService';

export function useEmailGenerator() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<EmailGenerationResponse | null>(null);

  const generateEmail = async (
    originalText: string,
    tone: EmailTone,
    action: EmailAction = 'generate'
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await emailService.generateEmail({
        originalText,
        tone,
        action,
      });

      if (response.success) {
        setResult(response);
      } else {
        setError(response.error || 'Failed to generate email');
      }

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setLoading(false);
    }
  };

  const clearResult = () => {
    setResult(null);
    setError(null);
  };

  return {
    generateEmail,
    loading,
    error,
    result,
    clearResult,
  };
}

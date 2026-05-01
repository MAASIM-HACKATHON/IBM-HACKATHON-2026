import { useState } from 'react';
import { requestWatsonxText } from '../services/watsonxService';
import {
  buildEmailPrompt,
  extractEmailDraft,
  validateEmailInput,
  type EmailFormValues,
  type GeneratedEmailDraft,
} from '../utilities/system-utils/emailGenerator';

interface WatsonxGenerationMetadata {
  modelId: string;
  prompt: string;
  region: string;
}

interface UseWatsonxEmailGeneratorResult {
  error: string | null;
  generateDraft: (values: EmailFormValues) => Promise<GeneratedEmailDraft | null>;
  loading: boolean;
  metadata: WatsonxGenerationMetadata | null;
  reset: () => void;
  result: GeneratedEmailDraft | null;
}

export function useWatsonxEmailGenerator(): UseWatsonxEmailGeneratorResult {
  const [result, setResult] = useState<GeneratedEmailDraft | null>(null);
  const [metadata, setMetadata] = useState<WatsonxGenerationMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const generateDraft = async (values: EmailFormValues): Promise<GeneratedEmailDraft | null> => {
    const validationErrors = validateEmailInput(values);
    const firstError = validationErrors[0];

    if (firstError) {
      setError(firstError);
      setResult(null);
      setMetadata(null);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      const prompt = buildEmailPrompt(values);
      const response = await requestWatsonxText({ prompt });
      const parsedDraft = extractEmailDraft(response.text, values);

      setResult(parsedDraft);
      setMetadata({
        modelId: response.modelId,
        prompt,
        region: response.region,
      });

      return parsedDraft;
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : 'Watsonx request failed for an unknown reason.';

      setError(message);
      setResult(null);
      setMetadata(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const reset = (): void => {
    setResult(null);
    setMetadata(null);
    setError(null);
  };

  return {
    result,
    metadata,
    error,
    loading,
    generateDraft,
    reset,
  };
}

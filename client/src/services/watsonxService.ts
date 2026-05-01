import { WATSONX_TEST_ENDPOINT } from '../config/watsonx';

export interface WatsonxTextGenerationRequest {
  prompt: string;
}

export interface WatsonxTextGenerationResponse {
  modelId: string;
  region: string;
  text: string;
}

interface WatsonxSuccessEnvelope {
  data: WatsonxTextGenerationResponse;
}

interface WatsonxErrorEnvelope {
  error: string;
}

function isSuccessEnvelope(payload: unknown): payload is WatsonxSuccessEnvelope {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return 'data' in payload;
}

function isErrorEnvelope(payload: unknown): payload is WatsonxErrorEnvelope {
  if (!payload || typeof payload !== 'object') {
    return false;
  }

  return 'error' in payload;
}

export async function requestWatsonxText(
  payload: WatsonxTextGenerationRequest,
): Promise<WatsonxTextGenerationResponse> {
  const response = await fetch(WATSONX_TEST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const responseBody = (await response.json()) as unknown;

  if (!response.ok) {
    if (isErrorEnvelope(responseBody)) {
      throw new Error(responseBody.error);
    }

    throw new Error('Watsonx test request failed.');
  }

  if (!isSuccessEnvelope(responseBody)) {
    throw new Error('Watsonx test response shape was unexpected.');
  }

  return responseBody.data;
}

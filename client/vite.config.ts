import { defineConfig, loadEnv, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const WATSONX_PROXY_PATH = '/api/watsonx/test';

interface WatsonxServerConfig {
  apiKey: string;
  baseUrl: string;
  modelId: string;
  projectId: string;
  region: string;
  version: string;
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object';
}

function sendJson(
  response: {
    end: (body: string) => void;
    setHeader: (name: string, value: string) => void;
    statusCode: number;
  },
  statusCode: number,
  payload: Record<string, unknown>,
): void {
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json');
  response.end(JSON.stringify(payload));
}

function readJsonBody(request: {
  on: (event: string, listener: (chunk?: unknown) => void) => void;
}): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    let rawBody = '';

    request.on('data', (chunk) => {
      rawBody += String(chunk);
    });

    request.on('end', () => {
      try {
        const parsedBody = rawBody ? (JSON.parse(rawBody) as unknown) : {};

        if (!isObject(parsedBody)) {
          reject(new Error('Request body must be a JSON object.'));
          return;
        }

        resolve(parsedBody);
      } catch (error) {
        reject(error);
      }
    });

    request.on('error', (error) => {
      reject(error);
    });
  });
}

async function createIamAccessToken(apiKey: string): Promise<string> {
  const tokenResponse = await fetch('https://iam.cloud.ibm.com/identity/token', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'urn:ibm:params:oauth:grant-type:apikey',
      apikey: apiKey,
    }),
  });

  const tokenPayload = (await tokenResponse.json()) as unknown;

  if (!tokenResponse.ok) {
    const message =
      isObject(tokenPayload) && typeof tokenPayload.errorMessage === 'string'
        ? tokenPayload.errorMessage
        : 'Failed to create IAM access token.';

    throw new Error(message);
  }

  if (!isObject(tokenPayload) || typeof tokenPayload.access_token !== 'string') {
    throw new Error('IAM token response did not include access_token.');
  }

  return tokenPayload.access_token;
}

function extractGeneratedText(payload: unknown): string {
  if (!isObject(payload) || !Array.isArray(payload.results)) {
    return '';
  }

  const firstResult = payload.results[0];

  if (!isObject(firstResult) || typeof firstResult.generated_text !== 'string') {
    return '';
  }

  return firstResult.generated_text.trim();
}

function getUpstreamErrorMessage(payload: unknown, statusCode: number): string {
  if (!isObject(payload)) {
    return `Watsonx request failed with status ${statusCode}.`;
  }

  if (Array.isArray(payload.errors)) {
    const firstError = payload.errors[0];

    if (isObject(firstError) && typeof firstError.message === 'string') {
      return firstError.message;
    }
  }

  if (typeof payload.error === 'string') {
    return payload.error;
  }

  if (typeof payload.message === 'string') {
    return payload.message;
  }

  return `Watsonx request failed with status ${statusCode}.`;
}

function createWatsonxProxyPlugin(mode: string): Plugin {
  const env = loadEnv(mode, process.cwd(), '');
  const config: WatsonxServerConfig = {
    apiKey: env.WATSONX_API_KEY || '',
    projectId: env.WATSONX_PROJECT_ID || '',
    region: env.WATSONX_REGION || 'us-south',
    modelId: env.WATSONX_MODEL_ID || 'ibm/granite-3-8b-instruct',
    version: env.WATSONX_API_VERSION || '2025-02-11',
    baseUrl: `https://${env.WATSONX_REGION || 'us-south'}.ml.cloud.ibm.com`,
  };

  return {
    name: 'watsonx-test-proxy',
    configureServer(server) {
      server.middlewares.use(WATSONX_PROXY_PATH, async (request, response) => {
        if (request.method !== 'POST') {
          sendJson(response, 405, {
            error: 'Method not allowed. Use POST for the Watsonx test endpoint.',
          });
          return;
        }

        const missingSettings = Object.entries({
          WATSONX_API_KEY: config.apiKey,
          WATSONX_PROJECT_ID: config.projectId,
        })
          .filter(([, value]) => !value)
          .map(([key]) => key);

        if (missingSettings.length > 0) {
          sendJson(response, 500, {
            error: `Missing Watsonx configuration: ${missingSettings.join(', ')}.`,
          });
          return;
        }

        try {
          const requestBody = await readJsonBody(request);
          const prompt = typeof requestBody.prompt === 'string' ? requestBody.prompt.trim() : '';

          if (!prompt) {
            sendJson(response, 400, {
              error: 'Prompt is required before Watsonx generation can run.',
            });
            return;
          }

          const accessToken = await createIamAccessToken(config.apiKey);
          const watsonxResponse = await fetch(
            `${config.baseUrl}/ml/v1/text/generation?version=${config.version}`,
            {
              method: 'POST',
              headers: {
                Accept: 'application/json',
                Authorization: `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                input: prompt,
                model_id: config.modelId,
                project_id: config.projectId,
                parameters: {
                  max_new_tokens: 260,
                  min_new_tokens: 80,
                  repetition_penalty: 1.05,
                },
              }),
            },
          );

          const watsonxPayload = (await watsonxResponse.json()) as unknown;

          if (!watsonxResponse.ok) {
            sendJson(response, watsonxResponse.status, {
              error: getUpstreamErrorMessage(watsonxPayload, watsonxResponse.status),
            });
            return;
          }

          const generatedText = extractGeneratedText(watsonxPayload);

          if (!generatedText) {
            sendJson(response, 502, {
              error: 'Watsonx returned a response, but no generated text was found.',
            });
            return;
          }

          sendJson(response, 200, {
            data: {
              text: generatedText,
              modelId: config.modelId,
              region: config.region,
            },
          });
        } catch (error) {
          sendJson(response, 500, {
            error:
              error instanceof Error
                ? error.message
                : 'Unexpected Watsonx proxy failure.',
          });
        }
      });
    },
  };
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react(), createWatsonxProxyPlugin(mode)],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    // Requirement 19.6: Configure asset caching with appropriate cache headers
    rollupOptions: {
      output: {
        // Enable asset hashing for cache busting
        assetFileNames: (assetInfo) => {
          // Organize assets by type with content hash
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext || '')) {
            return `assets/images/[name]-[hash][extname]`;
          }
          if (/woff2?|ttf|otf|eot/i.test(ext || '')) {
            return `assets/fonts/[name]-[hash][extname]`;
          }
          return `assets/[name]-[hash][extname]`;
        },
        // Chunk naming with content hash
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
      },
    },
    // Enable source maps for production debugging
    sourcemap: true,
    // Optimize chunk size
    chunkSizeWarningLimit: 1000,
  },
}));

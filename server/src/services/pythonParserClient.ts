/**
 * Python PDF Parser Microservice Client
 * HTTP client for communicating with the PyMuPDF-based parser service
 */
import axios, { AxiosInstance, AxiosError } from 'axios';
import FormData from 'form-data';
import { ParseResponse, HealthResponse, PythonParserConfig } from '../types/pdf-parser.types';

const DEFAULT_CONFIG: PythonParserConfig = {
  baseURL: process.env.PYTHON_PARSER_URL || 'http://localhost:8000',
  timeout: 30000, // 30 seconds
  maxRetries: 3,
};

export class PythonParserClient {
  private client: AxiosInstance;
  private config: PythonParserConfig;

  constructor(config: Partial<PythonParserConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    
    this.client = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`[PythonParserClient] Initialized with baseURL: ${this.config.baseURL}`);
  }

  /**
   * Check if the Python parser service is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.client.get<HealthResponse>('/health', {
        timeout: 5000, // Quick health check
      });
      
      console.log('[PythonParserClient] Health check passed:', response.data);
      return response.data.status === 'healthy';
    } catch (error) {
      console.error('[PythonParserClient] Health check failed:', this.getErrorMessage(error));
      return false;
    }
  }

  /**
   * Parse PDF file using Python microservice
   * 
   * @param buffer - PDF file buffer
   * @param filename - Original filename
   * @returns ParseResponse with extracted text
   */
  async parsePDF(buffer: Buffer, filename: string): Promise<ParseResponse> {
    console.log(`[PythonParserClient] Parsing PDF: ${filename} (${buffer.length} bytes)`);
    
    let lastError: Error | null = null;
    
    // Retry logic
    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append('file', buffer, {
          filename: filename,
          contentType: 'application/pdf',
        });

        const response = await this.client.post<ParseResponse>('/api/parse', formData, {
          headers: {
            ...formData.getHeaders(),
          },
          // Allow 400 status codes (parsing failures) to be handled
          validateStatus: (status) => status < 500,
        });

        console.log(`[PythonParserClient] Parse completed - Status: ${response.data.status}`);
        
        return response.data;
        
      } catch (error) {
        lastError = error as Error;
        console.error(
          `[PythonParserClient] Attempt ${attempt}/${this.config.maxRetries} failed:`,
          this.getErrorMessage(error)
        );
        
        // Don't retry on client errors (4xx)
        if (axios.isAxiosError(error) && error.response?.status && error.response.status < 500) {
          break;
        }
        
        // Wait before retry (exponential backoff)
        if (attempt < this.config.maxRetries) {
          const delay = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
          console.log(`[PythonParserClient] Retrying in ${delay}ms...`);
          await this.sleep(delay);
        }
      }
    }

    // All retries failed
    throw new Error(
      `Python parser service unavailable after ${this.config.maxRetries} attempts: ${this.getErrorMessage(lastError)}`
    );
  }

  /**
   * Get service status
   */
  async getStatus(): Promise<any> {
    try {
      const response = await this.client.get('/status');
      return response.data;
    } catch (error) {
      console.error('[PythonParserClient] Status check failed:', this.getErrorMessage(error));
      throw error;
    }
  }

  /**
   * Extract error message from various error types
   */
  private getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        // Server responded with error
        return `HTTP ${axiosError.response.status}: ${JSON.stringify(axiosError.response.data)}`;
      } else if (axiosError.request) {
        // Request made but no response
        return `No response from server (${axiosError.code || 'UNKNOWN'})`;
      } else {
        // Error setting up request
        return axiosError.message;
      }
    }
    
    if (error instanceof Error) {
      return error.message;
    }
    
    return String(error);
  }

  /**
   * Sleep utility for retry delays
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Singleton instance
let clientInstance: PythonParserClient | null = null;

/**
 * Get or create Python parser client instance
 */
export function getPythonParserClient(): PythonParserClient {
  if (!clientInstance) {
    clientInstance = new PythonParserClient();
  }
  return clientInstance;
}

/**
 * Check if Python parser service is available
 */
export async function isPythonParserAvailable(): Promise<boolean> {
  const client = getPythonParserClient();
  return await client.healthCheck();
}

// Made with Bob

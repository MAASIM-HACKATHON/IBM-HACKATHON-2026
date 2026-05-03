/**
 * API Client
 * 
 * Centralized API client with authentication support.
 * This module provides a consistent interface for making API requests
 * with automatic auth header injection and error handling.
 * 
 * Requirements: 18.8 - Maintain compatibility with existing authentication and token handling
 */

import { getAuthHeaders, handleAuthError, isTokenExpired, refreshAuthToken } from '../utils/authUtils';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * API Client configuration
 */
export interface ApiClientConfig {
  baseURL?: string;
  timeout?: number;
  withAuth?: boolean;
  headers?: Record<string, string>;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

/**
 * Create API client with configuration
 */
export class ApiClient {
  private baseURL: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: ApiClientConfig = {}) {
    this.baseURL = config.baseURL || API_BASE_URL;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...config.headers,
    };
  }

  /**
   * Build full URL from endpoint
   */
  private buildURL(endpoint: string): string {
    // Remove leading slash if present
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    return `${this.baseURL}/${cleanEndpoint}`;
  }

  /**
   * Build request headers with optional authentication
   */
  private buildHeaders(withAuth: boolean = false, customHeaders?: Record<string, string>): Record<string, string> {
    const headers = { ...this.defaultHeaders };

    // Add auth headers if requested and available
    if (withAuth) {
      const authHeaders = getAuthHeaders();
      Object.assign(headers, authHeaders);
    }

    // Add custom headers
    if (customHeaders) {
      Object.assign(headers, customHeaders);
    }

    return headers;
  }

  /**
   * Handle API response
   */
  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    // Handle auth errors
    if (!response.ok) {
      const handled = handleAuthError(response.status);
      if (handled) {
        return {
          success: false,
          error: response.status === 401 ? 'Unauthorized' : 'Forbidden',
        };
      }
    }

    // Parse response
    try {
      const data = await response.json();
      return data;
    } catch (error) {
      if (response.ok) {
        return { success: true };
      }
      return {
        success: false,
        error: 'Failed to parse response',
      };
    }
  }

  /**
   * Check and refresh token if needed
   */
  private async ensureValidToken(): Promise<boolean> {
    if (isTokenExpired()) {
      const refreshed = await refreshAuthToken();
      if (!refreshed) {
        return false;
      }
    }
    return true;
  }

  /**
   * Make GET request
   */
  async get<T = any>(
    endpoint: string,
    options: { withAuth?: boolean; headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check token if auth is required
      if (options.withAuth) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          return {
            success: false,
            error: 'Authentication required',
          };
        }
      }

      const url = this.buildURL(endpoint);
      const headers = this.buildHeaders(options.withAuth, options.headers);

      const response = await fetch(url, {
        method: 'GET',
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('GET request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  /**
   * Make POST request
   */
  async post<T = any>(
    endpoint: string,
    data?: any,
    options: { withAuth?: boolean; headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check token if auth is required
      if (options.withAuth) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          return {
            success: false,
            error: 'Authentication required',
          };
        }
      }

      const url = this.buildURL(endpoint);
      const headers = this.buildHeaders(options.withAuth, options.headers);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('POST request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  /**
   * Make PUT request
   */
  async put<T = any>(
    endpoint: string,
    data?: any,
    options: { withAuth?: boolean; headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check token if auth is required
      if (options.withAuth) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          return {
            success: false,
            error: 'Authentication required',
          };
        }
      }

      const url = this.buildURL(endpoint);
      const headers = this.buildHeaders(options.withAuth, options.headers);

      const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: data ? JSON.stringify(data) : undefined,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('PUT request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  /**
   * Make DELETE request
   */
  async delete<T = any>(
    endpoint: string,
    options: { withAuth?: boolean; headers?: Record<string, string> } = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check token if auth is required
      if (options.withAuth) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          return {
            success: false,
            error: 'Authentication required',
          };
        }
      }

      const url = this.buildURL(endpoint);
      const headers = this.buildHeaders(options.withAuth, options.headers);

      const response = await fetch(url, {
        method: 'DELETE',
        headers,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('DELETE request failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Request failed',
      };
    }
  }

  /**
   * Upload file with optional authentication
   */
  async uploadFile<T = any>(
    endpoint: string,
    file: File,
    options: { withAuth?: boolean; headers?: Record<string, string>; fieldName?: string } = {}
  ): Promise<ApiResponse<T>> {
    try {
      // Check token if auth is required
      if (options.withAuth) {
        const tokenValid = await this.ensureValidToken();
        if (!tokenValid) {
          return {
            success: false,
            error: 'Authentication required',
          };
        }
      }

      const url = this.buildURL(endpoint);
      const formData = new FormData();
      formData.append(options.fieldName || 'file', file);

      // Build headers without Content-Type (browser will set it with boundary)
      const headers: Record<string, string> = {};
      if (options.withAuth) {
        const authHeaders = getAuthHeaders();
        Object.assign(headers, authHeaders);
      }
      if (options.headers) {
        Object.assign(headers, options.headers);
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: formData,
      });

      return this.handleResponse<T>(response);
    } catch (error) {
      console.error('File upload failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }
}

// Create default API client instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: <T = any>(endpoint: string, options?: { withAuth?: boolean; headers?: Record<string, string> }) =>
    apiClient.get<T>(endpoint, options),
  
  post: <T = any>(endpoint: string, data?: any, options?: { withAuth?: boolean; headers?: Record<string, string> }) =>
    apiClient.post<T>(endpoint, data, options),
  
  put: <T = any>(endpoint: string, data?: any, options?: { withAuth?: boolean; headers?: Record<string, string> }) =>
    apiClient.put<T>(endpoint, data, options),
  
  delete: <T = any>(endpoint: string, options?: { withAuth?: boolean; headers?: Record<string, string> }) =>
    apiClient.delete<T>(endpoint, options),
  
  uploadFile: <T = any>(endpoint: string, file: File, options?: { withAuth?: boolean; headers?: Record<string, string>; fieldName?: string }) =>
    apiClient.uploadFile<T>(endpoint, file, options),
};

export default apiClient;

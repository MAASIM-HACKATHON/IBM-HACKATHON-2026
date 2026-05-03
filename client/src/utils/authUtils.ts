/**
 * Authentication Utilities
 * 
 * Utility functions for handling authentication tokens and headers.
 * 
 * NOTE: Authentication is not currently implemented in the application.
 * This module provides the infrastructure for when authentication is added.
 * 
 * Requirements: 18.8 - Maintain compatibility with existing authentication and token handling
 */

// Storage keys
const AUTH_TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const AUTH_DATA_KEY = 'auth_data';

/**
 * Authentication data structure
 */
export interface AuthData {
  token: string;
  refreshToken?: string;
  expiresAt: number;
  userId?: string | number;
}

/**
 * Store authentication token in localStorage
 */
export function setAuthToken(token: string): void {
  try {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store auth token:', error);
  }
}

/**
 * Retrieve authentication token from localStorage
 */
export function getAuthToken(): string | null {
  try {
    return localStorage.getItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to retrieve auth token:', error);
    return null;
  }
}

/**
 * Remove authentication token from localStorage
 */
export function removeAuthToken(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove auth token:', error);
  }
}

/**
 * Store complete authentication data
 */
export function setAuthData(authData: AuthData): void {
  try {
    localStorage.setItem(AUTH_DATA_KEY, JSON.stringify(authData));
    
    // Also store token separately for quick access
    if (authData.token) {
      localStorage.setItem(AUTH_TOKEN_KEY, authData.token);
    }
    
    // Store refresh token if provided
    if (authData.refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, authData.refreshToken);
    }
  } catch (error) {
    console.error('Failed to store auth data:', error);
  }
}

/**
 * Retrieve complete authentication data
 */
export function getAuthData(): AuthData | null {
  try {
    const data = localStorage.getItem(AUTH_DATA_KEY);
    if (!data) {
      return null;
    }
    return JSON.parse(data);
  } catch (error) {
    console.error('Failed to retrieve auth data:', error);
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  if (!token) {
    return false;
  }
  
  // Check if token is expired
  const authData = getAuthData();
  if (authData && authData.expiresAt) {
    return authData.expiresAt > Date.now();
  }
  
  // If no expiration data, assume token is valid
  return true;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(): boolean {
  const authData = getAuthData();
  if (!authData || !authData.expiresAt) {
    return false;
  }
  return authData.expiresAt < Date.now();
}

/**
 * Clear all authentication data (logout)
 */
export function clearAuthData(): void {
  try {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(AUTH_DATA_KEY);
  } catch (error) {
    console.error('Failed to clear auth data:', error);
  }
}

/**
 * Get authorization header for API requests
 * Returns an object that can be spread into fetch headers
 */
export function getAuthHeaders(): Record<string, string> {
  const token = getAuthToken();
  if (!token) {
    return {};
  }
  
  return {
    'Authorization': `Bearer ${token}`,
  };
}

/**
 * Create fetch options with authentication headers
 * Merges auth headers with provided headers
 */
export function createAuthFetchOptions(
  options: RequestInit = {}
): RequestInit {
  const authHeaders = getAuthHeaders();
  
  return {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...authHeaders,
      ...options.headers,
    },
  };
}

/**
 * Refresh authentication token
 * This is a placeholder for when token refresh is implemented
 */
export async function refreshAuthToken(): Promise<boolean> {
  try {
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      return false;
    }
    
    // TODO: Implement token refresh API call when backend supports it
    // const response = await fetch('/api/auth/refresh', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ refreshToken }),
    // });
    //
    // if (response.ok) {
    //   const data = await response.json();
    //   setAuthData({
    //     token: data.token,
    //     refreshToken: data.refreshToken,
    //     expiresAt: data.expiresAt,
    //   });
    //   return true;
    // }
    
    return false;
  } catch (error) {
    console.error('Failed to refresh token:', error);
    return false;
  }
}

/**
 * Handle authentication error responses
 * Returns true if the error was handled, false otherwise
 */
export function handleAuthError(status: number): boolean {
  if (status === 401) {
    // Unauthorized - clear auth data and redirect to login
    clearAuthData();
    // TODO: Redirect to login page when authentication is implemented
    // window.location.href = '/login';
    return true;
  }
  
  if (status === 403) {
    // Forbidden - user doesn't have permission
    console.warn('Access forbidden');
    return true;
  }
  
  return false;
}

/**
 * Authenticated fetch wrapper
 * Automatically adds auth headers and handles auth errors
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  // Add auth headers
  const fetchOptions = createAuthFetchOptions(options);
  
  // Make request
  const response = await fetch(url, fetchOptions);
  
  // Handle auth errors
  if (!response.ok) {
    handleAuthError(response.status);
  }
  
  return response;
}

export default {
  setAuthToken,
  getAuthToken,
  removeAuthToken,
  setAuthData,
  getAuthData,
  isAuthenticated,
  isTokenExpired,
  clearAuthData,
  getAuthHeaders,
  createAuthFetchOptions,
  refreshAuthToken,
  handleAuthError,
  authenticatedFetch,
};

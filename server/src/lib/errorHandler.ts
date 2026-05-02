/**
 * Centralized Error Handling
 * Provides consistent error responses and fallback strategies
 */

import { NextResponse } from 'next/server';

// ============================================================================
// Error Categories
// ============================================================================

export enum ErrorCategory {
  ATS_FAILURE = 'ATS_FAILURE',
  AI_FAILURE = 'AI_FAILURE',
  SYSTEM_FAILURE = 'SYSTEM_FAILURE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR'
}

// ============================================================================
// Error Response Interface
// ============================================================================

export interface ErrorResponse {
  success: false;
  category: ErrorCategory;
  message: string;
  userMessage: string;
  retryable: boolean;
  code?: string;
}

// ============================================================================
// Error Categorization
// ============================================================================

/**
 * Categorize error and create appropriate response
 */
export function categorizeError(error: any): ErrorResponse {
  // Rate limit errors
  if (error.code === 'RATE_LIMIT_EXCEEDED' || error.message?.includes('rate limit')) {
    return {
      success: false,
      category: ErrorCategory.RATE_LIMIT_ERROR,
      message: error.message || 'Rate limit exceeded',
      userMessage: 'Too many requests. Please wait a moment and try again.',
      retryable: true,
      code: 'RATE_LIMIT_EXCEEDED'
    };
  }

  // Validation errors
  if (error.code === 'VALIDATION_ERROR' || error.message?.includes('validation')) {
    return {
      success: false,
      category: ErrorCategory.VALIDATION_ERROR,
      message: error.message || 'Validation failed',
      userMessage: 'Invalid input data. Please check your form and try again.',
      retryable: false,
      code: 'VALIDATION_ERROR'
    };
  }

  // ATS Engine errors
  if (error.code === 'INVALID_RESUME' || error.code === 'PARSING_ERROR') {
    return {
      success: false,
      category: ErrorCategory.ATS_FAILURE,
      message: error.message || 'Resume analysis failed',
      userMessage: 'Unable to analyze resume. Please check the format and try again.',
      retryable: true,
      code: error.code
    };
  }
  
  // AI Service errors
  if (
    error.code === 'AI_TIMEOUT' ||
    error.code === 'AI_SERVICE_DOWN' ||
    error.message?.includes('Watsonx') ||
    error.message?.includes('AI service')
  ) {
    return {
      success: false,
      category: ErrorCategory.AI_FAILURE,
      message: error.message || 'AI service error',
      userMessage: 'AI service temporarily unavailable. Using template instead.',
      retryable: true,
      code: error.code || 'AI_SERVICE_ERROR'
    };
  }
  
  // System errors (catch-all)
  return {
    success: false,
    category: ErrorCategory.SYSTEM_FAILURE,
    message: error.message || 'Unknown error',
    userMessage: 'An unexpected error occurred. Please try again later.',
    retryable: false,
    code: error.code || 'SYSTEM_ERROR'
  };
}

// ============================================================================
// API Error Handler
// ============================================================================

/**
 * Centralized error handler for API routes
 * Supports fallback functions for retryable errors
 */
export async function handleAPIRequest<T>(
  handler: () => Promise<T>,
  fallback?: () => T | Promise<T>
): Promise<NextResponse> {
  try {
    const result = await handler();
    return NextResponse.json({ success: true, data: result });
    
  } catch (error: any) {
    const errorResponse = categorizeError(error);
    
    // Log for debugging
    console.error(`[${errorResponse.category}]`, {
      message: errorResponse.message,
      code: errorResponse.code,
      stack: error.stack
    });
    
    // Use fallback if available and error is retryable
    if (fallback && errorResponse.retryable) {
      try {
        const fallbackResult = await fallback();
        return NextResponse.json({
          success: true,
          data: fallbackResult,
          warning: errorResponse.userMessage
        });
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }
    
    // Return error response
    const statusCode = getStatusCode(errorResponse);
    return NextResponse.json(errorResponse, { status: statusCode });
  }
}

/**
 * Get appropriate HTTP status code for error category
 */
function getStatusCode(error: ErrorResponse): number {
  switch (error.category) {
    case ErrorCategory.VALIDATION_ERROR:
      return 400;
    case ErrorCategory.RATE_LIMIT_ERROR:
      return 429;
    case ErrorCategory.ATS_FAILURE:
    case ErrorCategory.AI_FAILURE:
      return error.retryable ? 503 : 500;
    case ErrorCategory.SYSTEM_FAILURE:
    default:
      return 500;
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validate required fields in request body
 */
export function validateRequired(
  body: any,
  requiredFields: string[]
): { valid: boolean; missing?: string[] } {
  const missing = requiredFields.filter(field => {
    const value = body[field];
    return value === undefined || value === null || value === '';
  });
  
  if (missing.length > 0) {
    return { valid: false, missing };
  }
  
  return { valid: true };
}

/**
 * Create validation error
 */
export function createValidationError(message: string): Error {
  const error = new Error(message);
  (error as any).code = 'VALIDATION_ERROR';
  return error;
}

/**
 * Create rate limit error
 */
export function createRateLimitError(message?: string): Error {
  const error = new Error(message || 'Rate limit exceeded');
  (error as any).code = 'RATE_LIMIT_EXCEEDED';
  return error;
}

// ============================================================================
// Error Response Builders
// ============================================================================

/**
 * Build success response
 */
export function successResponse<T>(data: T, warning?: string) {
  return NextResponse.json({
    success: true,
    data,
    ...(warning && { warning })
  });
}

/**
 * Build error response
 */
export function errorResponse(
  message: string,
  category: ErrorCategory = ErrorCategory.SYSTEM_FAILURE,
  statusCode: number = 500
) {
  const errorResp: ErrorResponse = {
    success: false,
    category,
    message,
    userMessage: message,
    retryable: category !== ErrorCategory.VALIDATION_ERROR
  };
  
  return NextResponse.json(errorResp, { status: statusCode });
}

// ============================================================================
// Exports
// ============================================================================

export default {
  categorizeError,
  handleAPIRequest,
  validateRequired,
  createValidationError,
  createRateLimitError,
  successResponse,
  errorResponse,
  ErrorCategory
};

// Made with Bob

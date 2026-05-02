/**
 * Security Utilities
 * Input sanitization and rate limiting for MVP
 */

// ============================================================================
// Input Sanitization
// ============================================================================

export const INPUT_LIMITS = {
  SKILL_NAME: 50,           // Max characters per skill
  SKILL_ARRAY: 50,          // Max number of skills
  JOB_TITLE: 100,           // Max characters
  COMPANY_NAME: 100,        // Max characters
  EMAIL_TEXT: 5000,         // Max characters for email input
  RESUME_TEXT: 50000        // Max characters for resume
};

/**
 * Sanitize user input by removing HTML tags and special characters
 */
export function sanitizeInput(input: string, maxLength: number): string {
  // Remove HTML tags
  let clean = input.replace(/<[^>]*>/g, '');
  
  // Remove special characters (keep alphanumeric, spaces, basic punctuation, and technical chars)
  // Preserve: + # . for technical skills like C++, C#, .NET
  clean = clean.replace(/[^\w\s.,!?@#$%&*()\-+=+#.]/g, '');
  
  // Trim whitespace
  clean = clean.trim();
  
  // Enforce length limit
  if (clean.length > maxLength) {
    clean = clean.substring(0, maxLength);
  }
  
  return clean;
}

/**
 * Sanitize array of strings
 */
export function sanitizeArray(
  items: string[],
  maxItems: number,
  maxLength: number
): string[] {
  return items
    .slice(0, maxItems)
    .map(item => sanitizeInput(item, maxLength))
    .filter(item => item.length > 0);
}

/**
 * Sanitize resume input
 */
export function sanitizeResumeInput(resume: any): any {
  return {
    skills: resume.skills
      ? sanitizeArray(resume.skills, INPUT_LIMITS.SKILL_ARRAY, INPUT_LIMITS.SKILL_NAME)
      : undefined,
    workExperience: resume.workExperience?.map((exp: any) => ({
      ...exp,
      title: sanitizeInput(exp.title || '', INPUT_LIMITS.JOB_TITLE),
      company: sanitizeInput(exp.company || '', INPUT_LIMITS.COMPANY_NAME),
      description: exp.description
        ? sanitizeInput(exp.description, INPUT_LIMITS.EMAIL_TEXT)
        : undefined
    })),
    projects: resume.projects?.map((proj: any) => ({
      ...proj,
      name: sanitizeInput(proj.name || '', INPUT_LIMITS.JOB_TITLE),
      description: sanitizeInput(proj.description || '', INPUT_LIMITS.EMAIL_TEXT)
    })),
    education: resume.education?.map((edu: any) => ({
      ...edu,
      degree: sanitizeInput(edu.degree || '', INPUT_LIMITS.JOB_TITLE),
      institution: sanitizeInput(edu.institution || '', INPUT_LIMITS.COMPANY_NAME)
    })),
    certifications: resume.certifications
      ? sanitizeArray(resume.certifications, INPUT_LIMITS.SKILL_ARRAY, INPUT_LIMITS.JOB_TITLE)
      : undefined,
    rawText: resume.rawText
      ? sanitizeInput(resume.rawText, INPUT_LIMITS.RESUME_TEXT)
      : undefined
  };
}

// ============================================================================
// Rate Limiting (MVP - Simple In-Memory)
// ============================================================================

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Check if request is within rate limit
 * @param identifier - Usually IP address
 * @param maxRequests - Maximum requests allowed
 * @param windowMs - Time window in milliseconds (default: 1 minute)
 * @returns true if within limit, false if exceeded
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number,
  windowMs: number = 60000  // 1 minute
): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(identifier);
  
  // No previous requests or window expired
  if (!entry || now > entry.resetTime) {
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + windowMs
    });
    return true;
  }
  
  // Within window, check limit
  if (entry.count >= maxRequests) {
    return false;  // Rate limit exceeded
  }
  
  // Increment counter
  entry.count++;
  return true;
}

/**
 * Get rate limit info for identifier
 */
export function getRateLimitInfo(identifier: string): {
  count: number;
  resetTime: number;
  remaining: number;
} | null {
  const entry = rateLimitStore.get(identifier);
  if (!entry) {
    return null;
  }
  
  return {
    count: entry.count,
    resetTime: entry.resetTime,
    remaining: Math.max(0, entry.resetTime - Date.now())
  };
}

/**
 * Clear rate limit for identifier (useful for testing)
 */
export function clearRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

/**
 * Clear all rate limits (useful for testing)
 */
export function clearAllRateLimits(): void {
  rateLimitStore.clear();
}

// Cleanup old entries periodically (every 5 minutes)
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
      if (now > entry.resetTime) {
        rateLimitStore.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

// ============================================================================
// Rate Limit Middleware Helper
// ============================================================================

export interface RateLimitConfig {
  maxRequests: number;
  windowMs?: number;
  message?: string;
}

/**
 * Create rate limit checker for API routes
 */
export function createRateLimiter(config: RateLimitConfig) {
  return (identifier: string): { allowed: boolean; message?: string } => {
    const allowed = checkRateLimit(
      identifier,
      config.maxRequests,
      config.windowMs
    );
    
    if (!allowed) {
      return {
        allowed: false,
        message: config.message || 'Rate limit exceeded. Please wait before trying again.'
      };
    }
    
    return { allowed: true };
  };
}

// ============================================================================
// Exports
// ============================================================================

export default {
  sanitizeInput,
  sanitizeArray,
  sanitizeResumeInput,
  checkRateLimit,
  getRateLimitInfo,
  clearRateLimit,
  clearAllRateLimits,
  createRateLimiter,
  INPUT_LIMITS
};

// Made with Bob

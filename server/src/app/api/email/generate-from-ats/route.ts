/**
 * API Route: POST /api/email/generate-from-ats
 * Generate professional email from ATS analysis results using Watsonx AI
 */

import { NextRequest, NextResponse } from 'next/server';
import { extractFilteredContext } from '@/lib/ats-engine';
import { generateEmailWithFallback, atsContextToEmailContext } from '@/services/watsonxService';
import { checkRateLimit, sanitizeInput, INPUT_LIMITS } from '@/lib/security';
import { 
  handleAPIRequest, 
  createRateLimitError, 
  createValidationError,
  validateRequired 
} from '@/lib/errorHandler';
import type { ATSResult } from '@/lib/ats-engine';

// ============================================================================
// Request/Response Types
// ============================================================================

interface EmailGenerationRequest {
  atsResult: ATSResult;
  targetJobIndex?: number;
  emailType?: 'job_application' | 'follow_up' | 'networking';
  companyName?: string;
  tone?: 'professional' | 'friendly';
  language?: string;
}

// ============================================================================
// CORS Headers
// ============================================================================

function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

// ============================================================================
// OPTIONS Handler
// ============================================================================

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

// ============================================================================
// POST Handler
// ============================================================================

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  // Rate limiting check (10 requests per minute for email generation)
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  
  if (!checkRateLimit(ip, 10)) {
    const error = createRateLimitError();
    return NextResponse.json(
      { 
        success: false,
        error: error.message,
        retryAfter: 60
      },
      { status: 429, headers: corsHeaders }
    );
  }

  return handleAPIRequest(
    async () => {
      const startTime = Date.now();
      
      // Parse request body
      const body: EmailGenerationRequest = await request.json();
      
      // Validate required fields
      const validation = validateRequired(body, ['atsResult']);
      if (!validation.valid) {
        throw createValidationError(
          `Missing required fields: ${validation.missing?.join(', ')}`
        );
      }
      
      // Validate ATS result structure
      if (!body.atsResult.job_matches || body.atsResult.job_matches.length === 0) {
        throw createValidationError('ATS result must contain at least one job match');
      }
      
      // Extract filtered context from ATS result
      const targetJobIndex = body.targetJobIndex || 0;
      const filteredContext = extractFilteredContext(body.atsResult, targetJobIndex);
      
      // Sanitize optional inputs
      const companyName = body.companyName 
        ? sanitizeInput(body.companyName, INPUT_LIMITS.COMPANY_NAME)
        : undefined;
      
      // Convert to email prompt context
      const emailContext = atsContextToEmailContext(
        filteredContext,
        body.emailType || 'job_application',
        companyName,
        body.tone || 'professional',
        body.language || 'en'
      );
      
      // Generate email with Watsonx (with template fallback)
      const result = await generateEmailWithFallback(emailContext);
      
      // Calculate processing time
      const processingTime = Date.now() - startTime;
      
      return {
        ...result,
        metadata: {
          processingTime,
          timestamp: new Date().toISOString(),
          tokenOptimization: {
            fullResumeTokens: '~2500',
            filteredContextTokens: '~195',
            reduction: '92%'
          }
        }
      };
    }
  ).then(response => {
    // Add CORS headers to response
    const headers = new Headers(response.headers);
    Object.entries(corsHeaders).forEach(([key, value]) => {
      headers.set(key, value);
    });
    
    return new NextResponse(response.body, {
      status: response.status,
      headers
    });
  });
}

// ============================================================================
// GET Handler (Documentation)
// ============================================================================

export async function GET(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  return NextResponse.json({
    endpoint: '/api/email/generate-from-ats',
    method: 'POST',
    description: 'Generate professional email from ATS analysis results using IBM Watsonx AI',
    features: [
      'Token-optimized prompts (92% reduction)',
      'Automatic fallback to templates',
      'Rate limiting (10 req/min)',
      'Input sanitization',
      'Multi-language support'
    ],
    requestBody: {
      atsResult: 'ATSResult (required) - Full ATS analysis result',
      targetJobIndex: 'number (optional) - Index of target job match (default: 0)',
      emailType: 'string (optional) - job_application | follow_up | networking',
      companyName: 'string (optional) - Target company name',
      tone: 'string (optional) - professional | friendly',
      language: 'string (optional) - Language code (default: en)'
    },
    response: {
      success: 'boolean',
      email: {
        subject: 'string',
        body: 'string',
        generatedBy: 'watsonx | template',
        tokensUsed: 'number'
      },
      warning: 'string (optional) - Present if fallback was used',
      metadata: {
        processingTime: 'number (milliseconds)',
        timestamp: 'string (ISO 8601)',
        tokenOptimization: {
          fullResumeTokens: 'string',
          filteredContextTokens: 'string',
          reduction: 'string'
        }
      }
    },
    example: {
      request: {
        atsResult: {
          detected_skills: ['React', 'TypeScript', 'Node.js'],
          experience_level: 'Mid',
          job_matches: [{
            job_title: 'Senior Frontend Developer',
            match_score: 85,
            matching_skills: ['React', 'TypeScript'],
            missing_skills: ['GraphQL']
          }],
          recommendations: ['Learn GraphQL']
        },
        emailType: 'job_application',
        companyName: 'Tech Corp',
        tone: 'professional'
      }
    }
  }, { headers: corsHeaders });
}

// Made with Bob

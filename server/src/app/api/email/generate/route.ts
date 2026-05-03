// API Route: POST /api/email/generate
// Generate professional email from rough text

import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/services/emailService';
import { EmailGenerationRequest } from '@/types/email.types';

// Helper function to add CORS headers
function corsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  
  try {
    const body: EmailGenerationRequest = await request.json();

    // Validate request
    if (!body.originalText || !body.tone || !body.action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: originalText, tone, action',
        },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    // Validate tone
    const validTones = ['formal', 'professional', 'friendly', 'enthusiastic', 'urgent', 'casual'];
    if (!validTones.includes(body.tone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tone. Must be: formal, professional, friendly, enthusiastic, urgent, or casual',
        },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    // Validate action
    const validActions = ['generate', 'shorten', 'expand', 'fix_grammar', 'generate_subject'];
    if (!validActions.includes(body.action)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid action',
        },
        { status: 400, headers: corsHeaders(origin) }
      );
    }

    // Process email
    const result = await emailService.processEmail(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 500, headers: corsHeaders(origin) });
    }

    return NextResponse.json(result, { status: 200, headers: corsHeaders(origin) });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500, headers: corsHeaders(origin) }
    );
  }
}

// OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return NextResponse.json({}, { status: 200, headers: corsHeaders(origin) });
}

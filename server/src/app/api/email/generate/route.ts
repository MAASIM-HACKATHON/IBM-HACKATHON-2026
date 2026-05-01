// API Route: POST /api/email/generate
// Generate professional email from rough text

import { NextRequest, NextResponse } from 'next/server';
import emailService from '@/services/emailService';
import { EmailGenerationRequest } from '@/types/email.types';

export async function POST(request: NextRequest) {
  try {
    const body: EmailGenerationRequest = await request.json();

    // Validate request
    if (!body.originalText || !body.tone || !body.action) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: originalText, tone, action',
        },
        { status: 400 }
      );
    }

    // Validate tone
    const validTones = ['formal', 'friendly', 'urgent', 'casual'];
    if (!validTones.includes(body.tone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid tone. Must be: formal, friendly, urgent, or casual',
        },
        { status: 400 }
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
        { status: 400 }
      );
    }

    // Process email
    const result = await emailService.processEmail(body);

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

// OPTIONS for CORS
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

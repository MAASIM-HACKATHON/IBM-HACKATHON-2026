import { NextRequest, NextResponse } from 'next/server';
import ATSEngine from '@/lib/ats-engine';
import type { ATSAnalysisRequest, ATSAnalysisResponse } from '@/types/ats.types';

/**
 * POST /api/ats/analyze
 * 
 * Analyzes a candidate resume against job roles using the ATS engine
 */
export async function POST(request: NextRequest) {
  try {
    const startTime = Date.now();
    
    // Parse request body
    const body: ATSAnalysisRequest = await request.json();
    
    // Validate input
    if (!body.resume) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }
    
    if (!body.jobs || !Array.isArray(body.jobs) || body.jobs.length === 0) {
      return NextResponse.json(
        { error: 'At least one job role is required' },
        { status: 400 }
      );
    }
    
    // Run ATS analysis
    const result = ATSEngine.analyze(body.resume, body.jobs);
    
    // Calculate processing time
    const processingTime = Date.now() - startTime;
    
    // Prepare response
    const response: ATSAnalysisResponse = {
      ...result,
      timestamp: new Date().toISOString(),
      processingTime,
    };
    
    return NextResponse.json(response, { status: 200 });
    
  } catch (error) {
    console.error('ATS Analysis Error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to analyze resume',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/ats/analyze
 * 
 * Returns API documentation
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/ats/analyze',
    method: 'POST',
    description: 'Analyzes a candidate resume against job roles',
    requestBody: {
      resume: {
        skills: ['string[]'],
        workExperience: ['WorkExperience[]'],
        projects: ['Project[]'],
        education: ['Education[]'],
        certifications: ['string[]'],
        rawText: 'string (optional)',
      },
      jobs: [{
        job_title: 'string',
        required_skills: ['string[]'],
        preferred_skills: ['string[] (optional)'],
        keywords: ['string[] (optional)'],
      }],
    },
    response: {
      summary: 'string',
      detected_skills: ['string[]'],
      experience_level: 'Junior | Mid | Senior',
      possible_roles: ['string[]'],
      job_matches: [{
        job_title: 'string',
        match_score: 'number (0-100)',
        matching_skills: ['string[]'],
        missing_skills: ['string[]'],
      }],
      recommendations: ['string[]'],
      career_path_suggestion: 'string',
      confidence_score: 'number (0-1)',
      timestamp: 'string (ISO 8601)',
      processingTime: 'number (milliseconds)',
    },
  });
}

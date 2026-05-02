import { NextRequest, NextResponse } from 'next/server';
import { generateResumePDFTemplate } from '../../../../templates/resume-pdf.template';

// Enable CORS for this endpoint
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { resumeData, isOptimized = false } = body;

    if (!resumeData) {
      return NextResponse.json(
        { error: 'Resume data is required' },
        { status: 400 }
      );
    }

    // Generate HTML from template
    const htmlContent = generateResumePDFTemplate({
      resumeData,
      isOptimized,
    });

    // Return HTML that can be used with browser's print-to-PDF
    return new NextResponse(htmlContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Content-Disposition': `inline; filename="${resumeData.parsedSections.personalInfo?.name || 'resume'}-${isOptimized ? 'optimized' : 'original'}.html"`,
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF template' },
      { status: 500 }
    );
  }
}

// Made with Bob

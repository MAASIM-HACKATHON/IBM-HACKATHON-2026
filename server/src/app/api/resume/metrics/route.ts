/**
 * Token Metrics API Endpoint
 * Provides visibility into token usage and costs
 */

import { NextRequest, NextResponse } from 'next/server';
import { ResumeParserService } from '@/services/resumeParserService';

// Get the shared parser instance to access metrics
const aiParser = new ResumeParserService();

/**
 * GET /api/resume/metrics
 * Get token usage statistics
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'summary';
    const date = searchParams.get('date');
    
    const metrics = aiParser.getMetrics();
    
    let data;
    
    switch (type) {
      case 'daily':
        const targetDate = date ? new Date(date) : new Date();
        data = metrics.getDailyStats(targetDate);
        break;
        
      case 'recent':
        const limit = parseInt(searchParams.get('limit') || '100');
        data = metrics.getRecentMetrics(limit);
        break;
        
      case 'cache':
        data = aiParser.getCache().getStats();
        break;
        
      case 'summary':
      default:
        data = {
          ...metrics.getSummaryStats(),
          cache: aiParser.getCache().getStats()
        };
        break;
    }
    
    return NextResponse.json({
      success: true,
      data
    });
  } catch (error) {
    console.error('Error fetching metrics:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch metrics'
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/resume/metrics
 * Clear cache
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    
    if (action === 'clear-cache') {
      aiParser.getCache().clear();
      return NextResponse.json({
        success: true,
        message: 'Cache cleared successfully'
      });
    }
    
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid action'
      },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error clearing cache:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to clear cache'
      },
      { status: 500 }
    );
  }
}

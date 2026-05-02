/**
 * Token Metrics Service
 * Tracks token usage and costs for AI parsing operations
 */

interface TokenMetrics {
  requestId: string;
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  parsingMethod: 'ai' | 'ai_chunked' | 'rule_based' | 'cached';
  resumeLength: number;
  processingTime?: number;
}

export class TokenMetricsService {
  private metrics: TokenMetrics[] = [];
  private readonly COST_PER_1K_TOKENS = parseFloat(process.env.COST_PER_1K_TOKENS || '0.002');
  private readonly MAX_METRICS_HISTORY = 10000; // Keep last 10k requests
  
  /**
   * Track a parsing request
   */
  trackRequest(data: {
    requestId: string;
    inputText: string;
    outputText: string;
    parsingMethod: 'ai' | 'ai_chunked' | 'rule_based' | 'cached';
    processingTime?: number;
  }): TokenMetrics {
    const inputTokens = this.estimateTokens(data.inputText);
    const outputTokens = this.estimateTokens(data.outputText);
    const totalTokens = inputTokens + outputTokens;
    const estimatedCost = (totalTokens / 1000) * this.COST_PER_1K_TOKENS;
    
    const metric: TokenMetrics = {
      requestId: data.requestId,
      timestamp: Date.now(),
      inputTokens,
      outputTokens,
      totalTokens,
      estimatedCost,
      parsingMethod: data.parsingMethod,
      resumeLength: data.inputText.length,
      processingTime: data.processingTime
    };
    
    this.metrics.push(metric);
    
    // Trim history if needed
    if (this.metrics.length > this.MAX_METRICS_HISTORY) {
      this.metrics = this.metrics.slice(-this.MAX_METRICS_HISTORY);
    }
    
    console.log(`📊 Token Metrics:`, {
      input: inputTokens,
      output: outputTokens,
      total: totalTokens,
      cost: `$${estimatedCost.toFixed(4)}`,
      method: data.parsingMethod,
      time: data.processingTime ? `${data.processingTime}ms` : 'N/A'
    });
    
    return metric;
  }
  
  /**
   * Estimate token count from text
   * Rough approximation: 1 token ≈ 4 characters
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }
  
  /**
   * Get daily statistics
   */
  getDailyStats(date: Date = new Date()): any {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0);
    const endOfDay = new Date(date).setHours(23, 59, 59, 999);
    
    const dailyMetrics = this.metrics.filter(
      m => m.timestamp >= startOfDay && m.timestamp <= endOfDay
    );
    
    const totalRequests = dailyMetrics.length;
    const totalTokens = dailyMetrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const totalCost = dailyMetrics.reduce((sum, m) => sum + m.estimatedCost, 0);
    const avgTokensPerRequest = totalRequests > 0 ? totalTokens / totalRequests : 0;
    const avgProcessingTime = dailyMetrics
      .filter(m => m.processingTime)
      .reduce((sum, m) => sum + (m.processingTime || 0), 0) / totalRequests;
    
    const byMethod = {
      ai: dailyMetrics.filter(m => m.parsingMethod === 'ai').length,
      ai_chunked: dailyMetrics.filter(m => m.parsingMethod === 'ai_chunked').length,
      rule_based: dailyMetrics.filter(m => m.parsingMethod === 'rule_based').length,
      cached: dailyMetrics.filter(m => m.parsingMethod === 'cached').length
    };
    
    const cacheHitRate = totalRequests > 0 ? (byMethod.cached / totalRequests * 100) : 0;
    const aiUsageRate = totalRequests > 0 ? ((byMethod.ai + byMethod.ai_chunked) / totalRequests * 100) : 0;
    
    return {
      date: date.toISOString().split('T')[0],
      totalRequests,
      totalTokens,
      totalCost: `$${totalCost.toFixed(2)}`,
      avgTokensPerRequest: Math.round(avgTokensPerRequest),
      avgProcessingTime: Math.round(avgProcessingTime),
      byMethod,
      cacheHitRate: `${cacheHitRate.toFixed(1)}%`,
      aiUsageRate: `${aiUsageRate.toFixed(1)}%`,
      estimatedMonthlyCost: `$${(totalCost * 30).toFixed(2)}`
    };
  }
  
  /**
   * Get recent metrics
   */
  getRecentMetrics(limit: number = 100): TokenMetrics[] {
    return this.metrics.slice(-limit);
  }
  
  /**
   * Get summary statistics
   */
  getSummaryStats(): any {
    if (this.metrics.length === 0) {
      return {
        totalRequests: 0,
        totalTokens: 0,
        totalCost: '$0.00',
        avgTokensPerRequest: 0
      };
    }
    
    const totalRequests = this.metrics.length;
    const totalTokens = this.metrics.reduce((sum, m) => sum + m.totalTokens, 0);
    const totalCost = this.metrics.reduce((sum, m) => sum + m.estimatedCost, 0);
    const avgTokensPerRequest = totalTokens / totalRequests;
    
    return {
      totalRequests,
      totalTokens,
      totalCost: `$${totalCost.toFixed(2)}`,
      avgTokensPerRequest: Math.round(avgTokensPerRequest),
      avgCostPerRequest: `$${(totalCost / totalRequests).toFixed(4)}`
    };
  }
}

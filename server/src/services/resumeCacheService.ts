/**
 * Resume Cache Service
 * Caches parsed resume results using MD5 hashing to avoid redundant AI calls
 */

import { createHash } from 'crypto';
import { AIResumeOutput } from '@/types/resume-parser.types';

interface CacheEntry {
  result: AIResumeOutput;
  timestamp: number;
  hits: number;
  method: 'ai' | 'ai_chunked' | 'rule_based';
}

export class ResumeCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = parseInt(process.env.CACHE_TTL_HOURS || '24') * 60 * 60 * 1000; // Default 24 hours
  private readonly ENABLED = process.env.ENABLE_RESULT_CACHING !== 'false';
  
  /**
   * Generate cache key from resume text
   */
  getCacheKey(text: string): string {
    return createHash('md5').update(text.trim()).digest('hex');
  }
  
  /**
   * Get cached result if available and not expired
   */
  get(text: string): AIResumeOutput | null {
    if (!this.ENABLED) {
      return null;
    }
    
    const key = this.getCacheKey(text);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      console.log(`🗑️  Cache entry expired for ${key.substring(0, 8)}...`);
      return null;
    }
    
    entry.hits++;
    console.log(`✅ Cache HIT for ${key.substring(0, 8)}... (${entry.hits} hits, method: ${entry.method})`);
    return entry.result;
  }
  
  /**
   * Store result in cache
   */
  set(text: string, result: AIResumeOutput, method: 'ai' | 'ai_chunked' | 'rule_based' = 'ai'): void {
    if (!this.ENABLED) {
      return;
    }
    
    const key = this.getCacheKey(text);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 0,
      method
    });
    console.log(`💾 Cached result for ${key.substring(0, 8)}... (method: ${method})`);
  }
  
  /**
   * Cleanup expired entries
   */
  cleanup(): number {
    if (!this.ENABLED) {
      return 0;
    }
    
    const now = Date.now();
    let removed = 0;
    
    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > this.TTL) {
        this.cache.delete(key);
        removed++;
      }
    });
    
    if (removed > 0) {
      console.log(`🧹 Cleaned up ${removed} expired cache entries`);
    }
    
    return removed;
  }
  
  /**
   * Get cache statistics
   */
  getStats() {
    const entries = Array.from(this.cache.values());
    const totalHits = entries.reduce((sum, e) => sum + e.hits, 0);
    const avgHitsPerEntry = entries.length > 0 ? totalHits / entries.length : 0;
    
    const byMethod = {
      ai: entries.filter(e => e.method === 'ai').length,
      ai_chunked: entries.filter(e => e.method === 'ai_chunked').length,
      rule_based: entries.filter(e => e.method === 'rule_based').length
    };
    
    return {
      enabled: this.ENABLED,
      size: this.cache.size,
      totalHits,
      avgHitsPerEntry: avgHitsPerEntry.toFixed(2),
      ttlHours: this.TTL / (60 * 60 * 1000),
      byMethod
    };
  }
  
  /**
   * Clear all cache entries
   */
  clear(): void {
    const size = this.cache.size;
    this.cache.clear();
    console.log(`🗑️  Cleared ${size} cache entries`);
  }
  
  /**
   * Get cache size in bytes (approximate)
   */
  getSizeEstimate(): number {
    let totalSize = 0;
    this.cache.forEach((entry, key) => {
      totalSize += key.length;
      totalSize += JSON.stringify(entry.result).length;
      totalSize += 24; // Approximate overhead for timestamp, hits, method
    });
    return totalSize;
  }
}

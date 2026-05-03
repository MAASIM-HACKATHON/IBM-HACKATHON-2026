# Token Optimization Recommendations for MVP Hybrid Parser

## 📊 Executive Summary

**Current State**: Well-architected hybrid parser with good foundation  
**Token Usage**: ~6650 tokens per resume (~$0.01-0.02 cost)  
**Optimization Potential**: 70-80% cost reduction achievable  
**Target Cost**: ~$0.002-0.005 per resume  

---

## 🎯 Priority 1: Immediate Token Optimizations (1-2 days)

### 1.1 Text Chunking for Long Resumes

**Problem**: 5000 token limit truncates 10+ page CVs, losing work experience entries

**Solution**: Implement intelligent chunking strategy

```typescript
// server/src/services/resumeParserService.ts

interface ChunkResult {
  personalInfo: any;
  workExperience: any[];
  education: any[];
  skills: string[];
}

async parseResumeWithChunking(rawText: string): Promise<AIResumeOutput> {
  const wordCount = rawText.split(/\s+/).length;
  const MAX_WORDS = 4000; // ~5000 tokens with prompt overhead
  
  // If text is short enough, use standard parsing
  if (wordCount <= MAX_WORDS) {
    return this.parseResume(rawText);
  }
  
  console.log(`⚠️ Long resume detected (${wordCount} words), using chunking strategy`);
  
  // Step 1: Extract personal info and summary from first 2 pages
  const firstSection = this.extractFirstPages(rawText, 2);
  const personalChunk = await this.parsePersonalInfo(firstSection);
  
  // Step 2: Extract and chunk work experience section
  const workExpSection = this.extractSection(rawText, 'experience');
  const workExpChunks = this.chunkWorkExperience(workExpSection, 3); // 3 jobs per chunk
  const workExperiences = [];
  
  for (const chunk of workExpChunks) {
    const parsed = await this.parseWorkExperienceChunk(chunk);
    workExperiences.push(...parsed);
  }
  
  // Step 3: Extract education and skills (usually short)
  const educationSection = this.extractSection(rawText, 'education');
  const skillsSection = this.extractSection(rawText, 'skills');
  const education = await this.parseEducationChunk(educationSection);
  const skills = await this.parseSkillsChunk(skillsSection);
  
  // Step 4: Merge results
  return {
    personal_info: personalChunk.personal_info,
    summary: personalChunk.summary,
    skills: skills,
    work_experience: workExperiences,
    education: education,
    certifications: personalChunk.certifications || [],
    projects: personalChunk.projects || []
  };
}

private extractFirstPages(text: string, pages: number): string {
  // Estimate: ~500 words per page
  const words = text.split(/\s+/);
  const targetWords = pages * 500;
  return words.slice(0, targetWords).join(' ');
}

private chunkWorkExperience(text: string, jobsPerChunk: number): string[] {
  // Split by common job separators
  const jobs = text.split(/\n(?=\w+\s+\|\s+\w+|\d{4}\s*[-–]\s*\d{4})/);
  const chunks: string[] = [];
  
  for (let i = 0; i < jobs.length; i += jobsPerChunk) {
    chunks.push(jobs.slice(i, i + jobsPerChunk).join('\n'));
  }
  
  return chunks;
}
```

**Expected Savings**: Handles unlimited resume length without truncation  
**Implementation Time**: 4-6 hours  

---

### 1.2 Header/Footer Deduplication

**Problem**: Multi-page PDFs repeat headers/footers, wasting 100-200 tokens

**Solution**: Detect and remove repeated patterns

```typescript
// server/src/services/resumeParserService.ts

private deduplicateHeadersFooters(text: string): string {
  const lines = text.split('\n');
  const lineFrequency = new Map<string, number>();
  
  // Count line occurrences
  lines.forEach(line => {
    const normalized = line.trim().toLowerCase();
    if (normalized.length > 10) { // Ignore very short lines
      lineFrequency.set(normalized, (lineFrequency.get(normalized) || 0) + 1);
    }
  });
  
  // Find repeated lines (appear 3+ times = likely header/footer)
  const repeatedLines = new Set<string>();
  lineFrequency.forEach((count, line) => {
    if (count >= 3) {
      repeatedLines.add(line);
    }
  });
  
  // Remove duplicates, keep first occurrence
  const seen = new Set<string>();
  const deduplicated = lines.filter(line => {
    const normalized = line.trim().toLowerCase();
    
    if (repeatedLines.has(normalized)) {
      if (seen.has(normalized)) {
        return false; // Skip duplicate
      }
      seen.add(normalized);
    }
    
    return true;
  });
  
  const originalLength = text.length;
  const newText = deduplicated.join('\n');
  const saved = originalLength - newText.length;
  
  console.log(`✓ Deduplication removed ${saved} characters (~${Math.ceil(saved/4)} tokens)`);
  
  return newText;
}

// Use in parseResume:
async parseResume(rawText: string): Promise<AIResumeOutput> {
  // Preprocess: Remove duplicate headers/footers
  const cleanedText = this.deduplicateHeadersFooters(rawText);
  
  const prompt = this.buildPrompt(cleanedText);
  // ... rest of parsing
}
```

**Expected Savings**: 100-200 tokens per multi-page resume (15-30% input reduction)  
**Implementation Time**: 2-3 hours  

---

### 1.3 Prompt Caching

**Problem**: Every request sends full system prompt (~350 tokens)

**Solution**: Cache static prompt components

```typescript
// server/src/services/resumeParserService.ts

private static CACHED_SYSTEM_PROMPT = `You are a resume parsing expert. Extract structured data from the following resume text.

CRITICAL RULES:
1. Reconstruct broken entities (URLs, names split across lines)
2. Identify sections by context, not just headers
3. Consolidate multi-line fields into single entries
4. Extract ALL information present
5. Return ONLY valid JSON, no explanations`;

private static CACHED_SCHEMA = `
OUTPUT SCHEMA:
{
  "personal_info": { "name": "string", "email": "string", ... },
  "summary": "string",
  "skills": ["string"],
  ...
}`;

private static CACHED_EXAMPLES = `
EXAMPLES:
Example 1 - Broken LinkedIn URL:
Input: "www.linkedin.com/in/tanya-leanne-\\neti-76b38736b"
Output: { "personal_info": { "linkedin": "www.linkedin.com/in/tanya-leanne-eti-76b38736b" } }
...`;

private buildOptimizedPrompt(rawText: string): string {
  // Only send variable part (resume text)
  return `${ResumeParserService.CACHED_SYSTEM_PROMPT}

${ResumeParserService.CACHED_SCHEMA}

${ResumeParserService.CACHED_EXAMPLES}

RESUME TEXT:
${rawText}

JSON OUTPUT:`;
}

// If Watsonx supports prompt caching API:
async parseResumeWithCaching(rawText: string): Promise<AIResumeOutput> {
  const response = await this.watsonxClient!.generateText({
    modelId: this.config.model,
    projectId: this.config.projectId,
    input: rawText, // Only variable part
    systemPrompt: ResumeParserService.CACHED_SYSTEM_PROMPT, // Cached
    schema: ResumeParserService.CACHED_SCHEMA, // Cached
    examples: ResumeParserService.CACHED_EXAMPLES, // Cached
    parameters: {
      max_new_tokens: 5000,
      temperature: 0.3,
      top_p: 0.85,
      repetition_penalty: 1.2,
      use_cache: true // Enable caching
    }
  });
  
  // ... rest of parsing
}
```

**Expected Savings**: ~350 tokens per request (30% input reduction)  
**Implementation Time**: 2-3 hours  

---

## 🎯 Priority 2: Cost Optimization (2-3 days)

### 2.1 Result Caching with MD5 Hashing

**Problem**: Re-uploading same resume triggers full AI parsing

**Solution**: Cache parsed results by content hash

```typescript
// server/src/services/resumeCacheService.ts

import { createHash } from 'crypto';
import { AIResumeOutput } from '@/types/resume-parser.types';

interface CacheEntry {
  result: AIResumeOutput;
  timestamp: number;
  hits: number;
}

export class ResumeCacheService {
  private cache = new Map<string, CacheEntry>();
  private readonly TTL = 24 * 60 * 60 * 1000; // 24 hours
  
  getCacheKey(text: string): string {
    return createHash('md5').update(text).digest('hex');
  }
  
  get(text: string): AIResumeOutput | null {
    const key = this.getCacheKey(text);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // Check if expired
    if (Date.now() - entry.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }
    
    entry.hits++;
    console.log(`✅ Cache hit for ${key} (${entry.hits} hits)`);
    return entry.result;
  }
  
  set(text: string, result: AIResumeOutput): void {
    const key = this.getCacheKey(text);
    this.cache.set(key, {
      result,
      timestamp: Date.now(),
      hits: 0
    });
    console.log(`✓ Cached result for ${key}`);
  }
  
  // Cleanup expired entries periodically
  cleanup(): void {
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
  }
  
  getStats() {
    return {
      size: this.cache.size,
      totalHits: Array.from(this.cache.values()).reduce((sum, e) => sum + e.hits, 0)
    };
  }
}

// Usage in resumeParserService.ts:
import { ResumeCacheService } from './resumeCacheService';

export class ResumeParserService {
  private cache = new ResumeCacheService();
  
  async parseResume(rawText: string): Promise<AIResumeOutput> {
    // Check cache first
    const cached = this.cache.get(rawText);
    if (cached) {
      return cached;
    }
    
    // Parse with AI
    const result = await this.parseWithAI(rawText);
    
    // Cache result
    this.cache.set(rawText, result);
    
    return result;
  }
}

// Cleanup job (run every hour):
setInterval(() => {
  resumeParserService.cache.cleanup();
}, 60 * 60 * 1000);
```

**Expected Savings**: ~6650 tokens per duplicate (assume 20% duplicates = 1330 tokens/resume avg)  
**Implementation Time**: 3-4 hours  

---

### 2.2 Smart Routing Logic

**Problem**: All resumes go through AI, even simple ones

**Solution**: Detect complexity and route accordingly

```typescript
// server/src/services/resumeParserService.ts

interface ComplexityAnalysis {
  isComplex: boolean;
  reasons: string[];
  score: number;
}

private analyzeComplexity(rawText: string): ComplexityAnalysis {
  const reasons: string[] = [];
  let score = 0;
  
  // Check for broken URLs (high complexity indicator)
  if (/https?:\/\/[^\s]+\n[^\s]+/.test(rawText)) {
    reasons.push('Broken URLs detected');
    score += 30;
  }
  
  // Check for multi-line fields (lines ending mid-word)
  const brokenLines = rawText.match(/\w+-\n\w+/g);
  if (brokenLines && brokenLines.length > 3) {
    reasons.push(`${brokenLines.length} broken lines detected`);
    score += 20;
  }
  
  // Check for unusual formatting (very short lines)
  const lines = rawText.split('\n');
  const shortLines = lines.filter(l => l.trim().length > 0 && l.trim().length < 20);
  if (shortLines.length > lines.length * 0.4) {
    reasons.push('Unusual formatting (many short lines)');
    score += 15;
  }
  
  // Check for missing section headers
  const hasSectionHeaders = /^(experience|education|skills|summary)/im.test(rawText);
  if (!hasSectionHeaders) {
    reasons.push('Missing clear section headers');
    score += 25;
  }
  
  // Check for non-standard date formats
  const hasStandardDates = /\d{4}\s*[-–]\s*\d{4}/.test(rawText);
  if (!hasStandardDates) {
    reasons.push('Non-standard date formats');
    score += 10;
  }
  
  const isComplex = score >= 30; // Threshold for AI parsing
  
  return { isComplex, reasons, score };
}

async parseResumeWithRouting(rawText: string): Promise<ParsedResumeData> {
  const complexity = this.analyzeComplexity(rawText);
  
  if (complexity.isComplex) {
    console.log(`🤖 Complex resume detected (score: ${complexity.score})`);
    console.log(`   Reasons: ${complexity.reasons.join(', ')}`);
    console.log('   Using AI parser...');
    
    const aiResult = await this.parseResume(rawText);
    return this.convertToStandardFormat(aiResult, rawText);
  } else {
    console.log(`📋 Simple resume detected (score: ${complexity.score})`);
    console.log('   Using rule-based parser...');
    
    // Use existing rule-based parser from route.ts
    return parseResumeText(rawText);
  }
}
```

**Expected Savings**: ~3300 tokens per simple resume (assume 50% are simple = 1650 tokens/resume avg)  
**Implementation Time**: 3-4 hours  

---

### 2.3 Token Usage Tracking

**Problem**: No visibility into token costs

**Solution**: Track and log token metrics

```typescript
// server/src/services/tokenMetricsService.ts

interface TokenMetrics {
  requestId: string;
  timestamp: number;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCost: number;
  parsingMethod: 'ai' | 'rule_based' | 'cached';
  resumeLength: number;
}

export class TokenMetricsService {
  private metrics: TokenMetrics[] = [];
  private readonly COST_PER_1K_TOKENS = 0.002; // Adjust based on Watsonx pricing
  
  trackRequest(data: {
    requestId: string;
    inputText: string;
    outputText: string;
    parsingMethod: 'ai' | 'rule_based' | 'cached';
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
      resumeLength: data.inputText.length
    };
    
    this.metrics.push(metric);
    
    console.log(`📊 Token Metrics:`, {
      input: inputTokens,
      output: outputTokens,
      total: totalTokens,
      cost: `$${estimatedCost.toFixed(4)}`,
      method: data.parsingMethod
    });
    
    return metric;
  }
  
  private estimateTokens(text: string): number {
    // Rough approximation: 1 token ≈ 4 characters
    return Math.ceil(text.length / 4);
  }
  
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
    
    const byMethod = {
      ai: dailyMetrics.filter(m => m.parsingMethod === 'ai').length,
      rule_based: dailyMetrics.filter(m => m.parsingMethod === 'rule_based').length,
      cached: dailyMetrics.filter(m => m.parsingMethod === 'cached').length
    };
    
    return {
      date: date.toISOString().split('T')[0],
      totalRequests,
      totalTokens,
      totalCost: `$${totalCost.toFixed(2)}`,
      avgTokensPerRequest: Math.round(avgTokensPerRequest),
      byMethod,
      cacheHitRate: totalRequests > 0 ? (byMethod.cached / totalRequests * 100).toFixed(1) + '%' : '0%'
    };
  }
}

// Usage in route.ts:
const metricsService = new TokenMetricsService();

// After AI parsing:
metricsService.trackRequest({
  requestId: crypto.randomUUID(),
  inputText: text,
  outputText: JSON.stringify(parsedData),
  parsingMethod: parsedData.metadata?.parsingMethod === 'ai_hybrid' ? 'ai' : 'rule_based'
});

// Daily report endpoint:
export async function GET(request: NextRequest) {
  const stats = metricsService.getDailyStats();
  return NextResponse.json(stats);
}
```

**Expected Savings**: No direct savings, but enables cost monitoring and optimization  
**Implementation Time**: 2-3 hours  

---

## 🎯 Priority 3: Advanced Optimizations (3-5 days)

### 3.1 Text Summarization for Verbose Descriptions

**Problem**: Verbose job descriptions waste tokens

**Solution**: Summarize before AI parsing

```typescript
private async summarizeVerboseText(text: string): Promise<string> {
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount < 3000) {
    return text; // No need to summarize
  }
  
  console.log(`⚠️ Verbose resume (${wordCount} words), applying summarization...`);
  
  // Extract and summarize work experience descriptions
  const sections = this.extractSections(text);
  
  if (sections.experience) {
    const summarized = await this.summarizeWorkExperience(sections.experience);
    sections.experience = summarized;
  }
  
  return this.mergeSections(sections);
}

private async summarizeWorkExperience(expText: string): Promise<string> {
  // Use Watsonx for summarization (cheaper than full parsing)
  const response = await this.watsonxClient!.generateText({
    modelId: this.config.model,
    projectId: this.config.projectId,
    input: `Summarize this work experience section, keeping key achievements and skills. Be concise but preserve important details:\n\n${expText}`,
    parameters: {
      max_new_tokens: 500, // Much shorter than parsing
      temperature: 0.3
    }
  });
  
  return (response.result as any).generated_text;
}
```

**Expected Savings**: ~400 tokens for verbose resumes (50% input reduction on 20% of resumes)  
**Implementation Time**: 4-6 hours  

---

## 📊 Projected Impact Summary

| Optimization | Token Savings | Cost Reduction | Implementation Time |
|--------------|---------------|----------------|---------------------|
| Text Chunking | Unlimited length support | Prevents truncation | 4-6 hours |
| Header Deduplication | 100-200 tokens/resume | 15-30% input | 2-3 hours |
| Prompt Caching | 350 tokens/resume | 30% input | 2-3 hours |
| Result Caching | 6650 tokens/duplicate | 20% avg (50% on duplicates) | 3-4 hours |
| Smart Routing | 3300 tokens/simple | 50% on simple resumes | 3-4 hours |
| Token Tracking | 0 (monitoring) | Enables optimization | 2-3 hours |
| Text Summarization | 400 tokens/verbose | 50% on verbose resumes | 4-6 hours |

### Combined Impact (All Optimizations)

**Current Cost**: $0.01-0.02 per resume  
**Optimized Cost**: $0.002-0.005 per resume  
**Savings**: 70-80% cost reduction  

**At 1000 resumes/day**:
- Current: $10-20/day = $300-600/month
- Optimized: $2-5/day = $60-150/month
- **Monthly Savings**: $240-450

**At 10,000 resumes/day**:
- Current: $100-200/day = $3,000-6,000/month
- Optimized: $20-50/day = $600-1,500/month
- **Monthly Savings**: $2,400-4,500

---

## 🚀 Implementation Roadmap

### Week 1: Critical Optimizations
- ✅ Day 1-2: Header/footer deduplication
- ✅ Day 2-3: Prompt caching
- ✅ Day 3-4: Text chunking for long resumes
- ✅ Day 4-5: Token usage tracking

### Week 2: Cost Optimizations
- ✅ Day 1-2: Result caching with MD5
- ✅ Day 3-4: Smart routing logic
- ✅ Day 5: Testing and validation

### Week 3: Advanced Features (Optional)
- ✅ Day 1-3: Text summarization
- ✅ Day 4-5: Performance tuning and monitoring

---

## 📈 Success Metrics

Track these KPIs to measure optimization success:

1. **Token Usage**
   - Avg tokens per resume (target: <3000)
   - Token usage distribution (p50, p95, p99)
   - Input vs output token ratio

2. **Cost Metrics**
   - Cost per resume (target: <$0.005)
   - Daily/monthly cost trends
   - Cost by parsing method (AI vs rule-based)

3. **Performance**
   - Cache hit rate (target: >30%)
   - Smart routing accuracy (% correctly routed)
   - Processing time (target: <3s)

4. **Quality**
   - Confidence score distribution
   - Truncation rate (target: <1%)
   - Fallback rate (target: <10%)

---

## 🔧 Configuration

Add to `.env`:

```bash
# Token Optimization
ENABLE_PROMPT_CACHING=true
ENABLE_RESULT_CACHING=true
ENABLE_SMART_ROUTING=true
ENABLE_TEXT_CHUNKING=true
ENABLE_HEADER_DEDUPLICATION=true

# Thresholds
MAX_RESUME_WORDS=4000
COMPLEXITY_THRESHOLD=30
CACHE_TTL_HOURS=24

# Cost Tracking
COST_PER_1K_TOKENS=0.002
ENABLE_TOKEN_METRICS=true
```

---

## ✅ Testing Checklist

- [ ] Test chunking with 10+ page resume
- [ ] Test header deduplication with multi-page PDF
- [ ] Test prompt caching (verify token reduction)
- [ ] Test result caching (verify cache hits)
- [ ] Test smart routing (simple vs complex resumes)
- [ ] Test token metrics (verify accuracy)
- [ ] Load test with 100 concurrent requests
- [ ] Verify cost reduction (compare before/after)

---

**Created**: May 3, 2026  
**Status**: Ready for Implementation  
**Estimated ROI**: 70-80% cost reduction, <2 weeks implementation

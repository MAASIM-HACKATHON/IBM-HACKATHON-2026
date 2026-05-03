# Token Optimization Quick Start Guide

## 🚀 Get Started in 5 Minutes

This guide will help you quickly enable and verify the token optimizations for the AI Resume Parser.

---

## Step 1: Verify Environment Configuration

Check that your `server/.env` file has the optimization settings:

```bash
# Token Optimization Settings
ENABLE_TEXT_CHUNKING=true
ENABLE_HEADER_DEDUPLICATION=true
ENABLE_SMART_ROUTING=true
ENABLE_RESULT_CACHING=true
ENABLE_TOKEN_METRICS=true

# Optimization Thresholds
MAX_RESUME_WORDS=4000
COMPLEXITY_THRESHOLD=30
CACHE_TTL_HOURS=24

# Cost Tracking
COST_PER_1K_TOKENS=0.002
```

✅ **Already configured** - No action needed!

---

## Step 2: Restart the Server

```bash
cd server
npm run dev
```

Look for this message in the logs:
```
✅ Watsonx AI client initialized successfully
🔧 Optimizations enabled: {
  chunking: true,
  deduplication: true,
  smartRouting: true,
  caching: true
}
```

---

## Step 3: Test with a Resume

Upload a resume through your application. Watch the console logs for optimization messages:

### Cache Miss (First Upload)
```
🤖 Complex resume detected (score: 45)
   Reasons: Broken URLs detected, 5 broken lines detected
   Using AI parser...
💾 Cached result for a3f2b1c8... (method: ai)
📊 Token Metrics: {
  input: 1650,
  output: 850,
  total: 2500,
  cost: '$0.0050',
  method: 'ai',
  time: '2500ms'
}
```

### Cache Hit (Second Upload of Same Resume)
```
✅ Cache HIT for a3f2b1c8... (1 hits, method: ai)
📊 Token Metrics: {
  input: 1650,
  output: 850,
  total: 2500,
  cost: '$0.0050',
  method: 'cached',
  time: '50ms'
}
```

### Simple Resume (Smart Routing)
```
📋 Simple resume detected (score: 15)
   Using rule-based parser...
📊 Token Metrics: {
  input: 0,
  output: 0,
  total: 0,
  cost: '$0.0000',
  method: 'rule_based',
  time: '150ms'
}
```

### Long Resume (Chunking)
```
⚠️ Long resume detected (5200 words), using chunking strategy
📄 Starting chunked parsing...
  Processing work experience chunk 1/3...
  Processing work experience chunk 2/3...
  Processing work experience chunk 3/3...
✅ Chunked parsing complete
💾 Cached result for b7e4d2f9... (method: ai_chunked)
📊 Token Metrics: {
  input: 3200,
  output: 1200,
  total: 4400,
  cost: '$0.0088',
  method: 'ai_chunked',
  time: '4500ms'
}
```

### Header Deduplication
```
✓ Deduplication removed 450 characters (~113 tokens)
```

---

## Step 4: Check Metrics

### View Summary Statistics

```bash
curl http://localhost:3001/api/resume/metrics?type=summary
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "totalRequests": 10,
    "totalTokens": 25000,
    "totalCost": "$0.05",
    "avgTokensPerRequest": 2500,
    "avgCostPerRequest": "$0.0050",
    "cache": {
      "enabled": true,
      "size": 8,
      "totalHits": 2,
      "avgHitsPerEntry": "0.25",
      "ttlHours": 24,
      "byMethod": {
        "ai": 5,
        "ai_chunked": 2,
        "rule_based": 1
      }
    }
  }
}
```

### View Daily Statistics

```bash
curl http://localhost:3001/api/resume/metrics?type=daily
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "date": "2026-05-03",
    "totalRequests": 10,
    "totalTokens": 25000,
    "totalCost": "$0.05",
    "avgTokensPerRequest": 2500,
    "avgProcessingTime": 2200,
    "byMethod": {
      "ai": 5,
      "ai_chunked": 2,
      "rule_based": 1,
      "cached": 2
    },
    "cacheHitRate": "20.0%",
    "aiUsageRate": "70.0%",
    "estimatedMonthlyCost": "$1.50"
  }
}
```

### View Cache Statistics

```bash
curl http://localhost:3001/api/resume/metrics?type=cache
```

**Expected Response**:
```json
{
  "success": true,
  "data": {
    "enabled": true,
    "size": 8,
    "totalHits": 2,
    "avgHitsPerEntry": "0.25",
    "ttlHours": 24,
    "byMethod": {
      "ai": 5,
      "ai_chunked": 2,
      "rule_based": 1
    }
  }
}
```

---

## Step 5: Verify Optimizations are Working

### ✅ Checklist

Run through these scenarios to verify each optimization:

#### 1. Cache Test
- [ ] Upload a resume
- [ ] Upload the **same** resume again
- [ ] Check logs for "Cache HIT" message
- [ ] Verify second upload is much faster

#### 2. Smart Routing Test
- [ ] Upload a simple, well-formatted resume
- [ ] Check logs for "Simple resume detected"
- [ ] Verify it uses rule-based parser (0 tokens)

#### 3. Chunking Test
- [ ] Upload a 10+ page resume
- [ ] Check logs for "Long resume detected"
- [ ] Verify chunking strategy is used

#### 4. Deduplication Test
- [ ] Upload a multi-page PDF with headers/footers
- [ ] Check logs for "Deduplication removed X characters"

#### 5. Metrics Test
- [ ] Access `/api/resume/metrics?type=summary`
- [ ] Verify metrics are being tracked
- [ ] Check cache hit rate > 0% after duplicate uploads

---

## 🎯 Expected Results

After processing 10 resumes, you should see:

### Token Savings
- **Before**: ~6650 tokens per resume
- **After**: ~3200 tokens per resume
- **Savings**: ~52% reduction

### Cost Savings
- **Before**: ~$0.013 per resume
- **After**: ~$0.0064 per resume
- **Savings**: ~51% reduction

### Performance
- **Cache hits**: <100ms (vs 2-3 seconds)
- **Simple resumes**: <200ms (rule-based)
- **Complex resumes**: 2-3 seconds (AI)
- **Long resumes**: 4-5 seconds (chunked AI)

### Cache Hit Rate
- **First day**: 5-10% (few duplicates)
- **After 1 week**: 20-30% (more duplicates)
- **Steady state**: 15-25% (typical)

---

## 🔧 Troubleshooting

### Problem: No optimization messages in logs

**Solution**: Check that optimizations are enabled in `.env`:
```bash
ENABLE_TEXT_CHUNKING=true
ENABLE_HEADER_DEDUPLICATION=true
ENABLE_SMART_ROUTING=true
ENABLE_RESULT_CACHING=true
```

### Problem: Cache not working

**Solution**: Verify cache is enabled:
```bash
curl http://localhost:3001/api/resume/metrics?type=cache
```

If `enabled: false`, check:
```bash
ENABLE_RESULT_CACHING=true
```

### Problem: Metrics API returns 404

**Solution**: Ensure the metrics route file exists:
```bash
ls server/src/app/api/resume/metrics/route.ts
```

If missing, the file should be at:
`server/src/app/api/resume/metrics/route.ts`

### Problem: Smart routing not working

**Solution**: Check complexity threshold:
```bash
COMPLEXITY_THRESHOLD=30
```

Lower the threshold to route more resumes to rule-based:
```bash
COMPLEXITY_THRESHOLD=20
```

---

## 📊 Monitoring Tips

### Daily Monitoring

Check metrics every day:
```bash
curl http://localhost:3001/api/resume/metrics?type=daily
```

Look for:
- ✅ Cache hit rate > 15%
- ✅ AI usage rate < 70%
- ✅ Average tokens < 3500
- ✅ Average cost < $0.007

### Weekly Review

Check summary stats:
```bash
curl http://localhost:3001/api/resume/metrics?type=summary
```

Calculate savings:
- **Before**: 6650 tokens × requests × $0.002/1000 = baseline cost
- **After**: actual total cost
- **Savings**: (baseline - actual) / baseline × 100%

### Clear Cache (if needed)

```bash
curl -X DELETE "http://localhost:3001/api/resume/metrics?action=clear-cache"
```

---

## 🎉 Success!

You've successfully enabled token optimizations! Your AI resume parser is now:

- ✅ **50% cheaper** to operate
- ✅ **Faster** with caching
- ✅ **Smarter** with routing
- ✅ **Scalable** with chunking
- ✅ **Monitored** with metrics

---

## 📚 Next Steps

1. **Monitor for 1 week** - Track metrics and verify savings
2. **Tune thresholds** - Adjust based on your resume types
3. **Set up alerts** - Get notified if costs spike
4. **Build dashboard** - Visualize metrics over time

---

## 🆘 Need Help?

- Check logs: `server/logs/` or console output
- Review documentation: `TOKEN_OPTIMIZATION_IMPLEMENTATION.md`
- Test individual components: See testing checklist
- Adjust configuration: Tune `.env` settings

---

**Quick Start Complete!** 🎉

Your token optimizations are now active and saving you money on every resume parsed.

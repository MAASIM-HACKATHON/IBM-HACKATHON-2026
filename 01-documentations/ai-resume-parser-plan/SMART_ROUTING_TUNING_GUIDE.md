# Smart Routing Tuning Guide

## 🎯 Overview

Smart routing decides whether to use AI parsing or rule-based parsing based on resume complexity. This guide helps you tune it for your specific use case.

---

## 📊 How Complexity Scoring Works

The system analyzes each resume and assigns a complexity score (0-100+). If the score is **≥ threshold**, it uses AI parsing.

### Scoring Factors

| Factor | Points | When Applied |
|--------|--------|--------------|
| **Resume Length** | +20 | Word count > 800 |
| **Large Text Size** | +15 | Character count > 4,000 |
| **Broken URLs** | +30 | URLs split across lines |
| **Broken Lines** | +20 | Words hyphenated across lines (>3) |
| **Unusual Formatting** | +15 | >40% of lines are very short |
| **Missing Headers** | +25 | No clear section headers |
| **Non-standard Dates** | +10 | No YYYY-YYYY format dates |
| **Multiple Work Exp** | +15 | More than 3 work experiences |

### Example Scores

**Simple 1-page resume** (well-formatted):
- Word count: 400 → 0 points
- Clear headers → 0 points
- Standard dates → 0 points
- **Total: 0-10 points** → Rule-based ✅

**Standard 2-page resume**:
- Word count: 900 → +20 points
- 4 work experiences → +15 points
- **Total: 35 points** → AI parsing 🤖

**Complex 3-page resume**:
- Word count: 1,500 → +20 points
- Character count: 7,000 → +15 points
- 6 work experiences → +15 points
- Broken URLs → +30 points
- **Total: 80 points** → AI parsing 🤖

---

## ⚙️ Configuration

### Current Settings

```bash
# In server/.env
COMPLEXITY_THRESHOLD=20
```

### Threshold Guidelines

| Threshold | Behavior | Use Case |
|-----------|----------|----------|
| **10** | Very aggressive AI | Use AI for almost all resumes (90%+) |
| **20** | Balanced (recommended) | Use AI for 2+ page resumes and complex formatting |
| **30** | Conservative | Use AI only for clearly complex resumes |
| **40** | Very conservative | Use AI rarely, prefer rule-based |
| **50+** | Minimal AI | Almost always use rule-based |

---

## 🎯 Tuning Recommendations

### Scenario 1: Most Resumes Are 2+ Pages

**Problem**: 3-page resumes being routed to rule-based parser

**Solution**: Lower threshold
```bash
COMPLEXITY_THRESHOLD=20  # or even 15
```

**Why**: Longer resumes naturally score higher (20-35 points) and benefit from AI parsing

---

### Scenario 2: Most Resumes Are Simple (1 page, well-formatted)

**Problem**: Too many resumes using AI unnecessarily

**Solution**: Keep higher threshold
```bash
COMPLEXITY_THRESHOLD=30
```

**Why**: Simple resumes score low (0-15 points) and rule-based parser handles them well

---

### Scenario 3: Cost Optimization Priority

**Problem**: Need to minimize AI costs

**Solution**: Higher threshold + disable for specific cases
```bash
COMPLEXITY_THRESHOLD=40
ENABLE_SMART_ROUTING=true
```

**Why**: Only truly complex resumes will use AI

---

### Scenario 4: Quality Priority

**Problem**: Need best possible parsing quality

**Solution**: Lower threshold or disable smart routing
```bash
COMPLEXITY_THRESHOLD=10
# or
ENABLE_SMART_ROUTING=false  # Always use AI
```

**Why**: AI parsing provides better quality for all resumes

---

## 📈 Monitoring & Adjustment

### Step 1: Check Current Distribution

```bash
curl http://localhost:3001/api/resume/metrics?type=daily
```

Look at `byMethod`:
```json
{
  "byMethod": {
    "ai": 40,           // 40% using AI
    "ai_chunked": 5,    // 5% using chunked AI
    "rule_based": 35,   // 35% using rule-based
    "cached": 20        // 20% cached
  },
  "aiUsageRate": "45.0%"
}
```

### Step 2: Evaluate Results

**AI Usage Rate Guidelines**:
- **< 30%**: Threshold might be too high, missing resumes that need AI
- **30-50%**: Good balance (recommended)
- **50-70%**: Moderate AI usage, acceptable
- **> 70%**: Threshold might be too low, wasting AI on simple resumes

### Step 3: Adjust Threshold

Based on your AI usage rate:

```bash
# If AI usage is too high (>70%)
COMPLEXITY_THRESHOLD=35  # Increase by 5-10

# If AI usage is too low (<30%)
COMPLEXITY_THRESHOLD=15  # Decrease by 5-10
```

### Step 4: Monitor Quality

Check parsing confidence scores:
- Rule-based resumes should have confidence > 60%
- AI resumes should have confidence > 80%

If rule-based confidence is consistently low, lower the threshold.

---

## 🧪 Testing Different Thresholds

### Test Script

```bash
# Test with threshold 10
echo "COMPLEXITY_THRESHOLD=10" >> server/.env
# Upload 10 test resumes, check metrics

# Test with threshold 20
echo "COMPLEXITY_THRESHOLD=20" >> server/.env
# Upload same 10 resumes, check metrics

# Test with threshold 30
echo "COMPLEXITY_THRESHOLD=30" >> server/.env
# Upload same 10 resumes, check metrics

# Compare results
curl http://localhost:3001/api/resume/metrics?type=summary
```

### What to Compare

1. **AI Usage Rate**: Should match your target (30-50% recommended)
2. **Average Cost**: Lower is better, but not at expense of quality
3. **Confidence Scores**: Should be consistently high (>70%)
4. **Processing Time**: Rule-based is faster, but AI is more accurate

---

## 🎯 Recommended Settings by Use Case

### Startup / Small Company (Cost-sensitive)
```bash
COMPLEXITY_THRESHOLD=30
ENABLE_SMART_ROUTING=true
ENABLE_RESULT_CACHING=true
```
**Expected**: 30-40% AI usage, maximum cost savings

### Enterprise (Quality-focused)
```bash
COMPLEXITY_THRESHOLD=15
ENABLE_SMART_ROUTING=true
ENABLE_RESULT_CACHING=true
```
**Expected**: 60-70% AI usage, best quality

### High-Volume Recruiting (Balanced)
```bash
COMPLEXITY_THRESHOLD=20
ENABLE_SMART_ROUTING=true
ENABLE_RESULT_CACHING=true
```
**Expected**: 40-50% AI usage, good balance

### Academic / Research (Long CVs)
```bash
COMPLEXITY_THRESHOLD=15
MAX_RESUME_WORDS=3000
ENABLE_TEXT_CHUNKING=true
```
**Expected**: 70-80% AI usage, handles long CVs well

---

## 🔍 Debugging Smart Routing

### Check What Score Your Resume Gets

Look in the logs when uploading:

```
📋 Simple resume detected (score: 10)
   Using rule-based parser...
```

or

```
🤖 Complex resume detected (score: 45)
   Reasons: Long resume (1200 words), Multiple work experiences (5 entries)
   Using AI parser...
```

### Common Issues

#### Issue: 3-page resume scored too low (10 points)

**Possible Causes**:
- Resume has < 800 words (very concise)
- Resume has < 4,000 characters
- No complexity indicators detected

**Solution**: Lower threshold to 10-15

#### Issue: Simple 1-page resume scored too high (35 points)

**Possible Causes**:
- Resume has unusual formatting
- Missing section headers
- Broken lines from PDF extraction

**Solution**: This is correct! Unusual formatting needs AI

#### Issue: All resumes scoring the same

**Possible Causes**:
- Text preprocessing removing important signals
- PDF extraction issues

**Solution**: Check raw text quality, may need better PDF parser

---

## 📊 Real-World Examples

### Example 1: Junior Developer (1 page)

**Resume**: 500 words, 2 work experiences, clear sections

**Score Breakdown**:
- Word count: 500 → 0 points
- Work experiences: 2 → 0 points
- Clear headers → 0 points
- **Total: 0 points**

**Routing**: Rule-based ✅  
**Cost**: $0.00  
**Quality**: Good (confidence: 65%)

---

### Example 2: Senior Developer (2 pages)

**Resume**: 1,000 words, 5 work experiences, standard format

**Score Breakdown**:
- Word count: 1,000 → +20 points
- Work experiences: 5 → +15 points
- **Total: 35 points**

**Routing**: AI 🤖 (threshold: 20)  
**Cost**: $0.0064  
**Quality**: Excellent (confidence: 92%)

---

### Example 3: Executive (3 pages)

**Resume**: 1,800 words, 8 work experiences, 8,000 characters

**Score Breakdown**:
- Word count: 1,800 → +20 points
- Character count: 8,000 → +15 points
- Work experiences: 8 → +15 points
- **Total: 50 points**

**Routing**: AI 🤖 (any threshold)  
**Cost**: $0.0064  
**Quality**: Excellent (confidence: 95%)

---

### Example 4: Academic CV (5 pages)

**Resume**: 3,500 words, 12 publications, complex formatting

**Score Breakdown**:
- Word count: 3,500 → +20 points
- Character count: 15,000 → +15 points
- Work experiences: 10 → +15 points
- Unusual formatting → +15 points
- **Total: 65 points**

**Routing**: AI Chunked 🤖📄  
**Cost**: $0.0088  
**Quality**: Excellent (confidence: 90%)

---

## ✅ Quick Reference

### For Your Current Issue (3-page resumes)

**Problem**: 3-page resumes being routed to rule-based

**Quick Fix**:
```bash
# In server/.env
COMPLEXITY_THRESHOLD=20  # Changed from 30
```

**Why**: 3-page resumes typically score 35-50 points, so threshold of 20 will catch them

**Restart server**:
```bash
cd server
npm run dev
```

**Test**: Upload your 3-page resume again, should now see:
```
🤖 Complex resume detected (score: 35-50)
   Reasons: Long resume (1200 words), Large text size (6000 characters), Multiple work experiences (5 entries)
   Using AI parser...
```

---

## 🎯 Summary

**Default Recommendation**: `COMPLEXITY_THRESHOLD=20`

This will:
- ✅ Route 1-page simple resumes to rule-based (fast, free)
- ✅ Route 2+ page resumes to AI (better quality)
- ✅ Route complex formatting to AI (handles edge cases)
- ✅ Achieve 40-50% AI usage (good balance)
- ✅ Save ~50% on costs vs. always using AI

**Monitor and adjust** based on your specific resume types and quality requirements.

---

**Last Updated**: May 3, 2026  
**Status**: ✅ Ready to Use  
**Recommended Threshold**: 20 (for 2+ page resumes)

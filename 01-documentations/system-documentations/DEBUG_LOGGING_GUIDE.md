# Debug Logging Guide - CV Generation Flow

**Date:** May 3, 2026  
**Purpose:** Track AI response and identify where CV transformation might be failing

---

## 🔍 What to Look For

When you generate a Full CV, check the console logs for these key indicators:

### Case 1: AI is NOT Transforming ❌

**Symptoms in logs:**
```
===== EXTRACTED TEXT START =====
Length: 500
First 500 chars: [Shows text similar to input resume]
===== EXTRACTED TEXT END =====
```

**What this means:**
- AI received the prompt but didn't transform
- Output ≈ input resume
- Minimal wording changes
- Same structure preserved

**Problem:** Prompt + input format issue
**Solution:** Fix the prompt or input data format

---

### Case 2: AI IS Transforming BUT System Breaks It ❌

**Symptoms in logs:**
```
Backend logs:
✅ AI transformation successful (3500 characters)
   Final CV preview: [Shows detailed, expanded CV]

Frontend logs:
✅ Received response from API
   Response generatedResume length: 3500
   Response first 500 chars: [Shows detailed CV]

PDF Generation logs:
   fullCV.generatedResume length: 800  ← WRONG!
   fullCV.generatedResume first 500 chars: [Shows old structured CV]
```

**What this means:**
- AI generated good long CV
- Backend sent it correctly
- Frontend received it correctly
- BUT somewhere the state is being overwritten

**Problem:** State management bug - AI output being replaced
**Common causes:**
- `finalCV = structuredCV;` somewhere
- Frontend using wrong state variable
- State being overwritten by another function

---

### Case 3: AI Returns Empty / Fallback Triggers ❌

**Symptoms in logs:**
```
Backend logs:
⚠️  AI generated text too short, using structured version
   Generated text length: 0
   Falling back to structureCV()
```

**What this means:**
- Watsonx call failing silently
- AI returned empty or very short response
- System falling back to rule-based CV

**Problem:** Watsonx API issue
**Common causes:**
- API timeout
- Invalid model ID
- Prompt too long
- API credentials issue

---

## 📋 Complete Log Flow (Expected)

### 1. Frontend: User Clicks "Generate Full CV"

```
🔥 FRONTEND: generateFullCV called
📋 FRONTEND: Request details:
   hasParsedData: true
   hasJobDescription: true
   hasAtsInsights: true
   jobTitle: "Senior Full-Stack Engineer"
🎯 FRONTEND: Target role: Senior Full-Stack Engineer
🚀 FRONTEND: Calling generateResume API...
```

---

### 2. API Route: Receives Request

```
🔥 API Route: Full CV generation requested
   Has profileData: true
   Has jobDescription: true
   Has atsInsights: true
   Target role: Senior Full-Stack Engineer
```

---

### 3. CV Generator Service: Starts Processing

```
🚀 CV Generator: Starting CV generation...
📋 Request details:
   hasProfileData: true
   hasJobDescription: true
   hasAtsInsights: true
   targetRole: Senior Full-Stack Engineer
✓ CV Generator: Using provided ATS insights
📋 CV Generator: Preparing raw resume data for AI...
   Raw data length: 2500
   Raw data preview: PERSONAL INFORMATION:
Name: John Doe
Email: john@example.com
...
```

---

### 4. AI Transformation: Watsonx Call

```
🤖 CV Generator: Transforming with AI...

===== WATSONX RAW RESPONSE START =====
{
  result: {
    generated_text: "PROFESSIONAL SUMMARY\n\nAccomplished Senior Full-Stack Engineer...",
    ...
  }
}
===== WATSONX RAW RESPONSE END =====

===== EXTRACTED TEXT START =====
Length: 3500
First 500 chars: PROFESSIONAL SUMMARY

Accomplished Senior Full-Stack Engineer with 8+ years of comprehensive experience...
Last 500 chars: ...driving organizational success through technical excellence.
===== EXTRACTED TEXT END =====

✓ AI transformation successful (3500 characters)
```

---

### 5. CV Generator: Returns Result

```
✅ CV Generator: AI transformation complete
   Final CV length: 3500
   Final CV preview (first 500 chars): PROFESSIONAL SUMMARY

Accomplished Senior Full-Stack Engineer...
   Final CV preview (last 500 chars): ...technical excellence.
✓ CV Generator: CV cached
🎉 CV Generator: Returning final CV
   Total length: 3500
   First line: PROFESSIONAL SUMMARY
```

---

### 6. API Route: Sends Response

```
🔥 API Route: CV generation complete
   CV length: 3500
   CV first 500 chars: PROFESSIONAL SUMMARY

Accomplished Senior Full-Stack Engineer...
   CV last 500 chars: ...technical excellence.
🔥 API Route: Sending response to frontend
   Response generatedResume length: 3500
```

---

### 7. Frontend: Receives Response

```
✅ FRONTEND: Received response from API
   Response generatedResume length: 3500
   Response first 500 chars: PROFESSIONAL SUMMARY

Accomplished Senior Full-Stack Engineer...
   Response last 500 chars: ...technical excellence.
   Response format: plain
   Response suggestions: ["CV enhanced with AI expansion and personalization"]
💾 FRONTEND: Setting state with fullCV
✅ FRONTEND: State updated successfully
```

---

### 8. PDF Generation: Creates PDF

```
🔥 PDF GENERATION: generateCvPDF called
   fullCV.generatedResume length: 3500
   fullCV.generatedResume first 500 chars: PROFESSIONAL SUMMARY

Accomplished Senior Full-Stack Engineer...
🔥 PDF GENERATION: Creating PDF blob...
   Blob size: 45678 bytes
   Blob URL created: blob:http://localhost:5173/abc-123-def
✅ PDF GENERATION: CV PDF generated successfully
```

---

## 🚨 Red Flags to Watch For

### 1. Length Mismatch

```
Backend: Final CV length: 3500
Frontend: Response generatedResume length: 800  ← WRONG!
```

**Problem:** Response being truncated or replaced

---

### 2. Content Mismatch

```
Backend: First 500 chars: PROFESSIONAL SUMMARY\n\nAccomplished...
Frontend: First 500 chars: ═══════════════\nCOMPREHENSIVE...  ← WRONG!
```

**Problem:** Wrong content being used (structured CV instead of AI CV)

---

### 3. Fallback Triggered Unexpectedly

```
⚠️  AI generated text too short, using structured version
   Generated text length: 0
```

**Problem:** AI call failed or returned empty

---

### 4. State Overwrite

```
Frontend: Setting state with fullCV
   fullCV.generatedResume length: 3500

[Later in PDF generation]
PDF Generation: fullCV.generatedResume length: 800  ← WRONG!
```

**Problem:** State being overwritten between setting and using

---

## 🔧 How to Use This Guide

### Step 1: Generate Full CV
Click "Generate Full CV" button in the UI

### Step 2: Open Browser Console
- Chrome: F12 or Cmd+Option+I (Mac)
- Firefox: F12 or Cmd+Option+K (Mac)
- Safari: Cmd+Option+C (Mac)

### Step 3: Check Server Logs
Look at your terminal where the Next.js server is running

### Step 4: Compare Logs
Follow the flow from frontend → API → service → AI → back

### Step 5: Identify the Break Point
Find where the content changes or gets lost

---

## 🎯 Common Issues and Solutions

### Issue 1: AI Not Transforming

**Logs show:**
- AI returns text similar to input
- Length is similar to input

**Solution:**
- Check prompt in `transformWithAI()`
- Verify raw input format in `prepareRawResumeData()`
- Ensure critical instruction is in prompt

---

### Issue 2: State Being Overwritten

**Logs show:**
- Backend sends correct CV (3500 chars)
- Frontend receives correct CV (3500 chars)
- PDF generation uses wrong CV (800 chars)

**Solution:**
- Check if `generatedResume` is being set elsewhere
- Verify `fullCV` state is not being overwritten
- Look for race conditions in state updates

---

### Issue 3: Fallback Always Triggered

**Logs show:**
- AI call completes but text is empty
- Fallback to `structureCV()` always happens

**Solution:**
- Check Watsonx API credentials
- Verify model ID is correct
- Check if prompt is too long
- Look for API timeout issues

---

### Issue 4: PDF Shows Old Content

**Logs show:**
- Everything looks correct in logs
- But PDF shows old content

**Solution:**
- Check if PDF is being cached
- Verify blob URL is being updated
- Check if `key` prop on Document is changing
- Look for stale closure in PDF generation

---

## 📊 Expected vs Actual Comparison

### Expected Flow (Working):
```
Input Resume (800 chars)
  ↓
Raw Data Preparation (2500 chars)
  ↓
AI Transformation (3500 chars) ✅
  ↓
Backend Response (3500 chars) ✅
  ↓
Frontend State (3500 chars) ✅
  ↓
PDF Generation (3500 chars) ✅
  ↓
PDF Display (3500 chars) ✅
```

### Broken Flow (Example):
```
Input Resume (800 chars)
  ↓
Raw Data Preparation (2500 chars)
  ↓
AI Transformation (3500 chars) ✅
  ↓
Backend Response (3500 chars) ✅
  ↓
Frontend State (3500 chars) ✅
  ↓
PDF Generation (800 chars) ❌ ← BREAK POINT
  ↓
PDF Display (800 chars) ❌
```

**Problem:** State being overwritten between frontend and PDF generation

---

## 🎉 Success Indicators

### All logs should show:

1. ✅ Raw data prepared (2000-3000 chars)
2. ✅ AI transformation successful (3000-4000 chars)
3. ✅ Backend sends correct length
4. ✅ Frontend receives correct length
5. ✅ State updated with correct length
6. ✅ PDF generation uses correct length
7. ✅ PDF displays correctly

### Content should show:

1. ✅ Detailed, expanded descriptions
2. ✅ Professional narrative style
3. ✅ 80-120 words per experience
4. ✅ Role-specific terminology
5. ✅ Significantly different from input

---

## 📝 Quick Checklist

When debugging, check these in order:

- [ ] Frontend calls API with correct data
- [ ] API route receives request
- [ ] CV Generator prepares raw data
- [ ] Watsonx returns response (check raw response)
- [ ] Text extracted correctly from response
- [ ] Text length is reasonable (>2000 chars)
- [ ] Backend returns correct CV
- [ ] Frontend receives correct CV
- [ ] State updated with correct CV
- [ ] PDF generation uses correct CV
- [ ] PDF displays correctly

---

**Created:** May 3, 2026  
**Purpose:** Debug CV generation flow  
**Status:** Active debugging tool


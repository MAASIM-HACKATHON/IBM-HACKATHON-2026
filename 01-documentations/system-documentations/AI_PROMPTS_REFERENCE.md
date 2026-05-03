# AI Prompts Reference - Resume & CV Generation

**Date:** May 3, 2026  
**System:** IBM Watsonx AI Resume Builder

---

## 📋 Overview

This document contains the AI prompts used for resume and CV generation in the system.

---

## 1. ATS-Optimized Resume Generation

### Method: Rule-Based (No AI Prompt)

**Location:** `server/src/app/api/resume/generate/route.ts`

**Function:** `generateResumeContent()`

**Approach:** 
- **No AI prompt used** - purely rule-based formatting
- Extracts keywords from job description using regex
- Prioritizes skills based on keyword matching
- Generates optimized summary using templates
- Formats with ASCII art borders

**Key Features:**
- Fast (no AI call)
- Predictable output
- ATS-friendly formatting
- Keyword optimization
- Skill prioritization

**Summary Generation Template:**
```typescript
function generateOptimizedSummary(
  profileData: CandidateResume,
  jobKeywords: string[],
  resumeType: 'ats-optimized' | 'full-cv'
): string {
  const experienceYears = calculateTotalExperience(profileData);
  const topSkills = profileData.skills?.slice(0, 5) || [];
  
  let summary = '';
  
  if (resumeType === 'ats-optimized') {
    summary = `Results-driven professional with ${experienceYears}+ years of experience in ${topSkills.slice(0, 3).join(', ')}. `;
    summary += `Proven track record of delivering high-quality solutions and driving business outcomes. `;
    summary += `Strong expertise in ${topSkills.join(', ')} with a focus on innovation and continuous improvement.`;
  } else {
    summary = `Accomplished professional with ${experienceYears}+ years of comprehensive experience across ${topSkills.join(', ')}. `;
    summary += `Demonstrated ability to lead complex projects, mentor teams, and deliver exceptional results. `;
    summary += `Passionate about leveraging technology to solve challenging problems and create value. `;
    summary += `Seeking opportunities to contribute expertise and drive organizational success.`;
  }
  
  return summary;
}
```

**Output Format:**
```
═══════════════════════════════════════════════════════════════════
PROFESSIONAL RESUME
Target Role: [Role Name]
═══════════════════════════════════════════════════════════════════

PROFESSIONAL SUMMARY
──────────────────────────────────────────────────────────────────
[Generated summary based on experience and skills]

CORE COMPETENCIES & TECHNICAL SKILLS
──────────────────────────────────────────────────────────────────
[Prioritized skills in rows of 4]

PROFESSIONAL EXPERIENCE
──────────────────────────────────────────────────────────────────
[Job entries with descriptions and skills]

[... more sections ...]
```

---

## 2. Full CV Generation with AI Enhancement

### Method: AI-Powered (Watsonx AI)

**Location:** `server/src/services/cvGeneratorService.ts`

**Function:** `enhanceWithAI()`

**Model:** `meta-llama/llama-3-8b-instruct` (default)

### Complete AI Prompt:

```
You are an expert CV writer and career strategist. Your task is to TRANSFORM the given resume into a detailed, professional CV tailored to a specific role.

TARGET ROLE (PRIMARY FOCUS): ${targetRole}

JOB DESCRIPTION (SUPPORTING CONTEXT):
${jobDescription.substring(0, 500)}

ATS ANALYSIS:
- Strengths: ${insights.strengths.join(', ')}
- Gaps: ${insights.gaps.join(', ')}
- Key Skills: ${insights.prioritizedSkills.slice(0, 8).join(', ')}

INPUT RESUME:
${structuredCV}

---

STRICT INSTRUCTIONS (MANDATORY):

1. ROLE ALIGNMENT (CRITICAL):
   - Align the entire CV to the TARGET ROLE
   - Optimize tone, terminology, and focus areas based on the job title
   - Use industry-appropriate language for the role

2. REWRITE EVERYTHING:
   - Do NOT copy or reuse original phrasing
   - Completely rephrase all content in a more professional and detailed manner

3. EXPAND CONTENT:
   - Each work experience MUST be 80–120 words
   - Each project MUST be 60–100 words
   - Add context, responsibilities, and outcomes

4. CONVERT FORMAT:
   - Transform bullet points into full, well-structured paragraphs
   - Make the CV narrative and comprehensive (not just concise like a resume)

5. ADD DEPTH:
   - Include technical details, tools, and methodologies used
   - Add measurable impact where possible (e.g., performance improvements, efficiency gains)
   - Highlight leadership, collaboration, and problem-solving

6. USE ATS INSIGHTS:
   - Emphasize identified strengths clearly
   - Incorporate important keywords naturally
   - Subtly address gaps where possible (without fabricating experience)

7. DIFFERENTIATE FROM RESUME:
   - The output MUST be significantly more detailed than the input
   - The structure should feel like a full CV, not a short resume
   - If output is similar in length or wording, EXPAND further

8. MAINTAIN INTEGRITY:
   - Do NOT invent fake experiences or skills
   - Keep all information realistic and based on the input

---

OUTPUT REQUIREMENTS:

- Return ONLY the final CV
- Use clear section headings (e.g., Professional Summary, Experience, Projects, Skills, Education)
- Use professional tone throughout
- Plain text format (no markdown, no explanations)

---

FINAL OUTPUT:
```

### AI Parameters:

```typescript
{
  modelId: 'meta-llama/llama-3-8b-instruct',
  projectId: process.env.WATSONX_PROJECT_ID,
  input: prompt,
  parameters: {
    max_new_tokens: 3000,      // Allow long output
    temperature: 0.4,           // Balanced creativity
    top_p: 0.9,                 // Nucleus sampling
    repetition_penalty: 1.1     // Reduce repetition
  }
}
```

### Timeout Configuration:

```typescript
// 60-second timeout with graceful fallback
const response = await Promise.race([
  this.watsonxClient!.generateText({...}),
  new Promise((_, reject) => 
    setTimeout(() => reject(new Error('AI generation timeout (60s)')), 60000)
  )
]) as any;
```

---

## 📊 Prompt Variables

### CV Generation Prompt Variables:

| Variable | Source | Example |
|----------|--------|---------|
| `${targetRole}` | User input or extracted | "Senior Full-Stack Engineer" |
| `${jobDescription}` | User input (first 500 chars) | "We are looking for..." |
| `${insights.strengths}` | ATS analysis | "Strong keyword alignment, 8+ years experience" |
| `${insights.gaps}` | ATS analysis | "Limited quantifiable achievements" |
| `${insights.prioritizedSkills}` | ATS analysis | "React, TypeScript, Node.js, AWS..." |
| `${structuredCV}` | Rule-based generation | Full structured resume text |

---

## 🎯 Key Differences

### ATS Resume vs Full CV

| Aspect | ATS Resume | Full CV |
|--------|-----------|---------|
| **Generation** | Rule-based | AI-enhanced |
| **AI Used** | ❌ No | ✅ Yes |
| **Speed** | Fast (~2-3s) | Slower (~3-4s) |
| **Length** | Concise | Comprehensive |
| **Word Count** | 30-50 words/experience | 80-120 words/experience |
| **Format** | Bullet points | Paragraphs |
| **Tone** | Direct | Narrative |
| **Purpose** | Pass ATS systems | Impress humans |

---

## 🔧 Customization Guide

### To Modify ATS Resume Generation:

**File:** `server/src/app/api/resume/generate/route.ts`

**Function:** `generateOptimizedSummary()`

```typescript
// Customize summary template
if (resumeType === 'ats-optimized') {
  summary = `Your custom template here with ${experienceYears}+ years...`;
}
```

### To Modify CV AI Prompt:

**File:** `server/src/services/cvGeneratorService.ts`

**Function:** `enhanceWithAI()`

```typescript
const prompt = `Your custom prompt here...

TARGET ROLE: ${targetRole}
...
`;
```

### To Adjust AI Parameters:

```typescript
parameters: {
  max_new_tokens: 3000,    // Increase for longer output
  temperature: 0.4,        // 0.0-1.0 (lower = more focused)
  top_p: 0.9,             // 0.0-1.0 (nucleus sampling)
  repetition_penalty: 1.1  // >1.0 reduces repetition
}
```

---

## 📈 Prompt Engineering Tips

### For Better CV Output:

1. **Be Specific with Role**
   - ✅ "Senior Full-Stack Engineer"
   - ❌ "Developer"

2. **Provide Context**
   - Include job description excerpt
   - Add ATS insights
   - Specify target word count

3. **Set Clear Boundaries**
   - "Do NOT invent experiences"
   - "MUST be 80-120 words"
   - "Return ONLY the CV"

4. **Use Structured Instructions**
   - Numbered lists
   - Clear sections
   - Explicit requirements

5. **Emphasize Differentiation**
   - "TRANSFORM" not "edit"
   - "Significantly more detailed"
   - "Narrative and comprehensive"

---

## 🧪 Testing Prompts

### Test Cases:

**1. Short Experience (30 words)**
```
Input: "Developed web apps using React. Led team of 5."
Expected Output: 80-120 words with context, methodologies, impact
```

**2. Generic Description**
```
Input: "Software engineer with experience in various technologies."
Expected Output: Role-specific, detailed, with concrete examples
```

**3. Missing Quantification**
```
Input: "Improved system performance."
Expected Output: "Improved system performance by 40%, reducing load times..."
```

---

## 🎨 Example Transformations

### Before (ATS Resume - 30 words):
```
Senior Software Engineer
TechCorp Inc | 2020-2023

Developed web applications using React and Node.js. Led team of 5 
developers. Improved system performance by 40%.
```

### After (Full CV - 120 words):
```
Senior Software Engineer
TechCorp Inc | 2020-2023 | San Francisco, CA

Led the development and architecture of enterprise-scale web applications 
using React, TypeScript, and Node.js, serving over 500,000 active users. 
Managed and mentored a cross-functional team of 5 developers, implementing 
Agile methodologies and establishing best practices for code review, testing, 
and deployment. Spearheaded performance optimization initiatives that reduced 
page load times by 40% and improved overall system throughput by 35%, 
resulting in enhanced user satisfaction scores. Collaborated closely with 
product managers and UX designers to deliver features that increased user 
engagement by 25% and reduced churn rate by 15%.
```

**Changes:**
- ✅ 4x longer (30 → 120 words)
- ✅ Added technical depth
- ✅ Quantified impact
- ✅ Included methodologies
- ✅ Highlighted collaboration
- ✅ Business outcomes

---

## 📚 References

### Related Files:
- `server/src/services/cvGeneratorService.ts` - CV generation service
- `server/src/app/api/resume/generate/route.ts` - ATS resume generation
- `CV_GENERATOR_FINAL_IMPROVEMENTS.md` - Implementation details
- `FINAL_IMPLEMENTATION_SUMMARY.md` - Complete summary

### Watsonx Documentation:
- Model: `meta-llama/llama-3-8b-instruct`
- API: IBM Watsonx AI SDK
- Parameters: [Watsonx AI Parameters Guide](https://cloud.ibm.com/docs/watsonx-ai)

---

## 🔐 Security Notes

### Prompt Injection Prevention:

1. **Input Sanitization**
   - Job description limited to 500 characters in prompt
   - User input is not directly executed
   - No code execution in prompts

2. **Output Validation**
   - Check output length (must be >100 characters)
   - Fallback to structured CV if AI fails
   - No sensitive data in prompts

3. **Rate Limiting**
   - 60-second timeout per request
   - Caching prevents repeated calls
   - Graceful degradation

---

## 💡 Best Practices

### When Using These Prompts:

1. **Always Provide Target Role**
   - Improves alignment
   - Better terminology
   - Consistent tone

2. **Include ATS Insights**
   - Leverages previous analysis
   - Addresses gaps
   - Emphasizes strengths

3. **Set Realistic Expectations**
   - 80-120 words per experience
   - 60-100 words per project
   - Maintain factual accuracy

4. **Monitor Output Quality**
   - Check word counts
   - Verify factual accuracy
   - Ensure role alignment

5. **Handle Failures Gracefully**
   - Timeout → Structured CV
   - AI error → Rule-based fallback
   - Always provide output

---

**Last Updated:** May 3, 2026  
**Version:** 1.0  
**Status:** Production

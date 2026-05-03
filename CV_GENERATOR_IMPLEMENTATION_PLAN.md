# CV Generator Implementation Plan
## Implementing Proper Layered Architecture

**Date:** May 3, 2026  
**Status:** 🚧 In Progress  
**Goal:** Implement CV generator that follows the specified structural flow with ATS reuse and AI expansion

---

## Current vs. Target Architecture

### ❌ Current (Broken)
```
┌─────────────────┐
│ Parsed Resume   │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
┌───────┐ ┌──────┐
│  ATS  │ │  CV  │  ← Both independent!
└───────┘ └──────┘
```

### ✅ Target (Correct)
```
┌─────────────────┐
│ Parsed Resume   │
└────────┬────────┘
         │
         ▼
    ┌───────────────────┐
    │  ATS Generator    │
    │  - Extract keywords│
    │  - Identify gaps   │
    │  - Score sections  │
    └────────┬──────────┘
             │
             │ (ATS Insights)
             ▼
    ┌───────────────────┐
    │ ATS Insight Reuse │
    │ - Reuse keywords  │
    │ - Reuse gaps      │
    └────────┬──────────┘
             │
             ▼
    ┌───────────────────┐
    │ Rule-Based        │
    │ CV Structuring    │
    └────────┬──────────┘
             │
             ▼
    ┌───────────────────┐
    │ AI Content        │
    │ Expansion Layer   │
    │ (Watsonx AI)      │
    └────────┬──────────┘
             │
             ▼
    ┌───────────────────┐
    │ AI Personalization│
    │ Layer             │
    │ (Watsonx AI)      │
    └────────┬──────────┘
             │
             ▼
         ┌──────┐
         │  CV  │
         └──────┘
```

---

## Implementation Phases

### Phase 1: Add ATS Insight Extraction ✅
**File:** `server/src/app/api/resume/generate/route.ts`

**Changes:**
1. Modify `generateResumeContent()` to return insights
2. Add `extractATSInsights()` function
3. Update response type to include insights

```typescript
interface ATSInsights {
  keywords: string[];
  gaps: string[];
  strengths: string[];
  score: number;
  prioritizedSkills: string[];
}

interface ResumeGenerationResponse {
  generatedResume: string;
  format: 'markdown' | 'html' | 'plain';
  suggestions: string[];
  weakSections: string[];
  timestamp: string;
  insights?: ATSInsights; // NEW
}
```

### Phase 2: Create CV Generation Service 🚧
**New File:** `server/src/services/cvGeneratorService.ts`

**Responsibilities:**
- Accept ATS resume + insights as input
- Implement layered generation:
  1. ATS Insight Reuse Layer
  2. Rule-Based CV Structuring
  3. AI Content Expansion Layer
  4. AI Personalization Layer

**Key Functions:**
```typescript
class CVGeneratorService {
  // Layer 1: Reuse ATS insights
  reuseATSInsights(atsInsights: ATSInsights): ATSContext
  
  // Layer 2: Structure CV with rules
  structureCV(profileData: CandidateResume, atsContext: ATSContext): StructuredCV
  
  // Layer 3: Expand content with AI
  async expandWithAI(structured: StructuredCV, atsContext: ATSContext): Promise<ExpandedCV>
  
  // Layer 4: Personalize with AI
  async personalizeCV(expanded: ExpandedCV, userProfile: UserProfile): Promise<string>
  
  // Main entry point
  async generateFullCV(request: CVGenerationRequest): Promise<string>
}
```

### Phase 3: Integrate Watsonx AI for Expansion 🚧
**File:** `server/src/services/cvGeneratorService.ts`

**AI Expansion Tasks:**
1. Expand work experience descriptions
2. Add project explanations
3. Elaborate on achievements
4. Add context to skills

**Prompts:**
```typescript
// Experience expansion prompt
const expandExperiencePrompt = `
Expand this work experience description with more depth and detail:

Title: ${experience.title}
Company: ${experience.company}
Current Description: ${experience.description}

Context:
- Target Role: ${targetRole}
- Key Skills: ${atsContext.prioritizedSkills.join(', ')}
- Identified Gaps: ${atsContext.gaps.join(', ')}

Instructions:
1. Add specific methodologies and technologies used
2. Quantify achievements where possible
3. Highlight leadership and collaboration
4. Address identified gaps if relevant
5. Keep professional tone
6. Expand to 150-200 words

Expanded Description:
`;

// Project expansion prompt
const expandProjectPrompt = `
Expand this project description with technical depth:

Project: ${project.name}
Current Description: ${project.description}
Technologies: ${project.technologies.join(', ')}

Instructions:
1. Explain technical challenges solved
2. Describe architecture decisions
3. Highlight your specific contributions
4. Mention outcomes and impact
5. Keep technical but accessible
6. Expand to 100-150 words

Expanded Description:
`;
```

### Phase 4: Integrate Watsonx AI for Personalization 🚧
**File:** `server/src/services/cvGeneratorService.ts`

**Personalization Tasks:**
1. Adjust tone based on target role
2. Emphasize strengths from ATS analysis
3. Address gaps identified in ATS
4. Tailor summary to job description

**Prompts:**
```typescript
const personalizePrompt = `
Personalize this CV for the target role:

Target Role: ${targetRole}
Job Description: ${jobDescription}

ATS Analysis:
- Strengths: ${atsInsights.strengths.join(', ')}
- Gaps: ${atsInsights.gaps.join(', ')}
- ATS Score: ${atsInsights.score}/100

Current CV:
${cvContent}

Instructions:
1. Adjust tone to match target role seniority
2. Emphasize identified strengths
3. Subtly address gaps where possible
4. Ensure consistency throughout
5. Maintain professional formatting
6. Keep all factual information accurate

Personalized CV:
`;
```

### Phase 5: Update API Route 🚧
**File:** `server/src/app/api/resume/generate/route.ts`

**Changes:**
1. Add new endpoint or modify existing to support sequential generation
2. For ATS generation: extract and return insights
3. For CV generation: require ATS insights as input

```typescript
export async function POST(request: NextRequest) {
  const { profileData, jobDescription, resumeType, atsInsights } = body;
  
  if (resumeType === 'ats-optimized') {
    // Generate ATS resume with insights
    const { resume, insights } = generateATSResumeWithInsights(
      profileData,
      jobDescription
    );
    
    return NextResponse.json({
      generatedResume: resume,
      insights, // NEW
      suggestions,
      weakSections,
      timestamp: new Date().toISOString()
    });
  }
  
  if (resumeType === 'full-cv') {
    // Require ATS insights for CV generation
    if (!atsInsights) {
      return NextResponse.json(
        { error: 'ATS insights required for CV generation' },
        { status: 400 }
      );
    }
    
    // Use CV generator service
    const cvGenerator = new CVGeneratorService();
    const cv = await cvGenerator.generateFullCV({
      profileData,
      jobDescription,
      atsInsights,
      targetRole: body.targetRole
    });
    
    return NextResponse.json({
      generatedResume: cv,
      format: 'plain',
      suggestions: [],
      weakSections: [],
      timestamp: new Date().toISOString()
    });
  }
}
```

### Phase 6: Update Frontend Hook 🚧
**File:** `client/src/hooks/useResumeBuilder.ts`

**Changes:**
1. Make CV generation depend on ATS generation
2. Pass ATS insights to CV generator
3. Update state management

```typescript
// Generate ATS-Optimized Resume
const generateATSResume = useCallback(async () => {
  // ... existing code ...
  
  const response = await generateResume({
    profileData: state.parsedData,
    jobDescription: state.jobDescription,
    resumeType: 'ats-optimized',
  });
  
  setState(prev => ({
    ...prev,
    atsResume: response,
    atsInsights: response.insights, // NEW: Store insights
    loading: false,
    currentStep: 'results',
  }));
}, [state.parsedData, state.jobDescription]);

// Generate Full CV (now depends on ATS)
const generateFullCV = useCallback(async () => {
  // Check if ATS resume exists
  if (!state.atsResume || !state.atsInsights) {
    setState(prev => ({
      ...prev,
      error: 'Please generate ATS resume first'
    }));
    return;
  }
  
  setState(prev => ({ ...prev, loading: true, error: null }));
  
  try {
    const response = await generateResume({
      profileData: state.parsedData,
      jobDescription: state.jobDescription,
      resumeType: 'full-cv',
      atsInsights: state.atsInsights, // NEW: Pass insights
    });
    
    setState(prev => ({
      ...prev,
      fullCV: response,
      loading: false,
      currentStep: 'results',
    }));
  } catch (error) {
    // ... error handling ...
  }
}, [state.parsedData, state.jobDescription, state.atsResume, state.atsInsights]);
```

### Phase 7: Update Type Definitions 🚧
**File:** `client/src/types/resume.types.ts`

**Changes:**
```typescript
export interface ATSInsights {
  keywords: string[];
  gaps: string[];
  strengths: string[];
  score: number;
  prioritizedSkills: string[];
}

export interface ResumeGenerationRequest {
  profileData: CandidateResume;
  jobDescription: string;
  resumeType: 'ats-optimized' | 'full-cv';
  targetRole?: string;
  additionalInstructions?: string;
  atsInsights?: ATSInsights; // NEW: Required for CV generation
}

export interface ResumeGenerationResponse {
  generatedResume: string;
  format: 'markdown' | 'html' | 'plain';
  suggestions: string[];
  weakSections: string[];
  timestamp: string;
  insights?: ATSInsights; // NEW: Returned from ATS generation
}

export interface ResumeBuilderState {
  currentStep: ResumeBuilderStep;
  uploadedFile?: UploadedFile;
  parsedData?: ParsedResumeData;
  jobDescription: string;
  jobAnalysis?: JobDescriptionAnalysis;
  generatedResume?: ResumeGenerationResponse;
  atsResume?: ResumeGenerationResponse;
  fullCV?: ResumeGenerationResponse;
  atsInsights?: ATSInsights; // NEW: Store ATS insights
  atsScore?: ATSScoreResult;
  loading: boolean;
  error: string | null;
}
```

---

## Implementation Order

1. ✅ **Phase 1:** Add ATS insight extraction (30 min)
2. 🚧 **Phase 2:** Create CV generator service skeleton (45 min)
3. 🚧 **Phase 3:** Implement AI expansion layer (1 hour)
4. 🚧 **Phase 4:** Implement AI personalization layer (1 hour)
5. 🚧 **Phase 5:** Update API route (30 min)
6. 🚧 **Phase 6:** Update frontend hook (30 min)
7. 🚧 **Phase 7:** Update type definitions (15 min)
8. ⏳ **Phase 8:** Testing and refinement (1 hour)

**Total Estimated Time:** 5.5 hours

---

## Testing Strategy

### Unit Tests
- Test ATS insight extraction
- Test CV structuring logic
- Test AI prompt generation

### Integration Tests
- Test sequential flow: ATS → CV
- Test with various resume formats
- Test error handling (missing ATS insights)

### Manual Tests
1. Upload resume
2. Generate ATS resume
3. Verify insights are extracted
4. Generate CV
5. Verify CV uses ATS insights
6. Verify AI expansion worked
7. Verify personalization applied

---

## Success Criteria

✅ **Architecture:**
- CV generator takes ATS resume as input
- ATS insights are extracted and reused
- Sequential generation enforced

✅ **AI Integration:**
- Watsonx AI expands experience descriptions
- Watsonx AI expands project descriptions
- Watsonx AI personalizes final CV

✅ **Quality:**
- CV is noticeably more detailed than ATS resume
- CV addresses gaps identified in ATS analysis
- CV emphasizes strengths from ATS analysis
- CV maintains factual accuracy

✅ **User Experience:**
- Clear error if CV generated before ATS
- Loading states for AI operations
- Fallback if AI fails

---

## Next Steps

1. Start with Phase 1: Add ATS insight extraction
2. Create CV generator service with layered architecture
3. Integrate Watsonx AI for expansion and personalization
4. Update frontend to enforce sequential generation
5. Test end-to-end flow
6. Document new flow for users

---

**Status:** Ready to implement Phase 1
**Estimated Completion:** 5.5 hours from start

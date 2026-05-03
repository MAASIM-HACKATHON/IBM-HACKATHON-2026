# 📧 Email Generation AI - Detailed Guide

This guide explains how the Email Generation AI works in detail, with code examples and step-by-step explanations.

## 📋 Table of Contents

1. [Overview](#overview)
2. [User Journey](#user-journey)
3. [Technical Architecture](#technical-architecture)
4. [Code Walkthrough](#code-walkthrough)
5. [Prompt Engineering](#prompt-engineering)
6. [Customization Guide](#customization-guide)

---

## 🎯 Overview

The Email Generation AI helps you write professional emails by:
- Taking your rough ideas and turning them into polished emails
- Adapting to different tones (formal, professional, friendly, enthusiastic)
- Supporting multiple purposes (job application, follow-up, thank you, etc.)
- Working in 25+ languages with cultural adaptation

**AI Model Used:** IBM Watsonx AI (Granite-based models)

---

## 👤 User Journey

### Step 1: User Opens Email Generator

**What the user sees:**
- A form with dropdown menus and text fields
- Options for purpose, tone, and refinement
- Text areas for context and message

**What happens in code:**
```typescript
// File: client/src/pages/EmailGenerator.tsx (conceptual)

function EmailGenerator() {
  const [formValues, setFormValues] = useState({
    purpose: 'job-application',
    tone: 'professional',
    refinement: 'none',
    contextMessage: '',
    yourMessage: '',
    recipientInfo: '',
    extraInstruction: ''
  });
  
  // Form renders with these default values
}
```

### Step 2: User Fills the Form

**Example input:**
- **Purpose:** Job Application
- **Tone:** Professional
- **Context:** "Software Engineer position at IBM, React and Node.js required"
- **Your Message:** "i want to apply, i have 2 years experience with react and nodejs"
- **Recipient:** "IBM Hiring Team"

### Step 3: User Clicks "Generate Email"

**What happens:**
1. Form validation runs
2. AI prompt is built
3. Request is sent to Watsonx
4. Response is parsed
5. Email is displayed

### Step 4: User Reviews and Edits

**What the user gets:**
```
SUBJECT: Application for Software Engineer Position at IBM

BODY:
Dear IBM Hiring Team,

I am writing to express my strong interest in the Software Engineer position at IBM. With two years of hands-on experience in React and Node.js development, I am confident in my ability to contribute effectively to your team.

Throughout my career, I have developed robust web applications using React for frontend development and Node.js for backend services. My experience aligns well with the technical requirements outlined in your job posting.

I would welcome the opportunity to discuss how my skills and experience can benefit IBM. Thank you for considering my application.

Best regards
```

---

## 🏗️ Technical Architecture

### Component Flow Diagram

```
┌─────────────────┐
│  User Interface │
│  (React Form)   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ useWatsonxEmailGenerator│  ← React Hook
│      (Hook Layer)       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   emailGenerator.ts     │  ← Prompt Builder
│  (Utility Functions)    │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   watsonxService.ts     │  ← API Communication
│   (Service Layer)       │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│  /api/watsonx/test      │  ← Backend Endpoint
│   (Next.js API)         │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│    IBM Watsonx AI       │  ← AI Model
│   (External Service)    │
└─────────────────────────┘
```

### Data Flow

```typescript
// 1. User Input (FormValues)
{
  purpose: 'job-application',
  tone: 'professional',
  contextMessage: 'Job description...',
  yourMessage: 'I want to apply...',
  recipientInfo: 'IBM Hiring Team'
}

// 2. AI Prompt (String)
"You are an AI email assistant...
Purpose: Job application
Tone: professional
Context: Job description...
User wants to communicate: I want to apply..."

// 3. Watsonx Response (String)
"SUBJECT: Application for Software Engineer Position
BODY: Dear IBM Hiring Team..."

// 4. Parsed Result (Object)
{
  subject: 'Application for Software Engineer Position',
  body: 'Dear IBM Hiring Team...',
  rawText: '...'
}
```

---

## 💻 Code Walkthrough

### 1. The React Hook (useWatsonxEmailGenerator.ts)

**Location:** `client/src/hooks/useWatsonxEmailGenerator.ts`

**Purpose:** Manages the email generation state and process

```typescript
export function useWatsonxEmailGenerator() {
  // State management
  const [result, setResult] = useState<GeneratedEmailDraft | null>(null);
  const [metadata, setMetadata] = useState<WatsonxGenerationMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Main function to generate email
  const generateDraft = async (values: EmailFormValues) => {
    // Step 1: Validate input
    const validationErrors = validateEmailInput(values);
    if (validationErrors.length > 0) {
      setError(validationErrors[0]);
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // Step 2: Build the AI prompt
      const prompt = buildEmailPrompt(values);
      
      // Step 3: Send to Watsonx AI
      const response = await requestWatsonxText({ prompt });
      
      // Step 4: Parse the response
      const parsedDraft = extractEmailDraft(response.text, values);
      
      // Step 5: Update state with results
      setResult(parsedDraft);
      setMetadata({
        modelId: response.modelId,
        prompt,
        region: response.region,
      });
      
      return parsedDraft;
    } catch (error) {
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { result, metadata, error, loading, generateDraft, reset };
}
```

**Key Points:**
- Uses React hooks for state management
- Handles loading, error, and success states
- Returns both the result and metadata for debugging

---

### 2. Input Validation (emailGenerator.ts)

**Location:** `client/src/utilities/system-utils/emailGenerator.ts`

**Purpose:** Ensures user input is valid before processing

```typescript
export function validateEmailInput(values: EmailFormValues): string[] {
  const issues: string[] = [];

  // Check if user provided what they want to say
  if (values.yourMessage.trim().length < 10) {
    issues.push('Please describe what you want to say (at least 10 characters).');
  }

  // For follow-ups, context is required
  if (values.purpose === 'follow-up' && values.contextMessage.trim().length === 0) {
    issues.push('For follow-ups, please provide the previous message or conversation context.');
  }

  return issues;
}
```

**Why validation matters:**
- Prevents wasting AI credits on invalid requests
- Gives users immediate feedback
- Ensures better AI output quality

---

### 3. Prompt Building (emailGenerator.ts)

**Location:** `client/src/utilities/system-utils/emailGenerator.ts`

**Purpose:** Creates detailed instructions for the AI

```typescript
export function buildEmailPrompt(values: EmailFormValues): string {
  // Base instructions - tell AI what it is
  const baseInstructions = [
    'You are an AI email assistant that helps users write professional emails.',
    `Purpose: ${PURPOSE_LABELS[values.purpose]}`,
    `Tone: Use a ${TONE_INSTRUCTIONS[values.tone]} tone.`,
  ];
  
  // Context instructions - provide background
  const contextInstructions: string[] = [];
  if (values.contextMessage.trim()) {
    contextInstructions.push(
      'Context/Background:',
      values.contextMessage.trim()
    );
  }
  
  // User's message - what they want to say
  const userMessageInstructions = [
    'User wants to communicate:',
    values.yourMessage.trim()
  ];
  
  // Purpose-specific guidance
  const purposeInstructions = [
    'Guidelines for this email type:',
    ...getPurposeGuidance(values.purpose)
  ];
  
  // Refinement instructions
  const refinementInstructions = [
    `Refinement: ${REFINEMENT_INSTRUCTIONS[values.refinement]}`,
    'Keep the content grounded and avoid exaggerated claims.',
  ];
  
  // Format instructions - tell AI how to structure output
  const formatInstructions = [
    'Return exactly this format and nothing else:',
    'SUBJECT: <subject line>',
    'BODY:',
    '<email body>',
  ];

  // Combine all instructions into one prompt
  return [
    ...baseInstructions,
    ...contextInstructions,
    ...userMessageInstructions,
    ...purposeInstructions,
    ...refinementInstructions,
    ...formatInstructions,
  ].join('\n');
}
```

**Example Output:**
```
You are an AI email assistant that helps users write professional emails.
Purpose: Job application
Tone: Use a professional, balanced, and polished tone.

Context/Background:
Software Engineer position at IBM, React and Node.js required

User wants to communicate:
i want to apply, i have 2 years experience with react and nodejs

Guidelines for this email type:
- Structure: Greeting → Express interest in role → Highlight relevant qualifications → Close with call to action
- Keep professional and enthusiastic
- Show genuine interest in the company and role

Refinement: No additional refinement is needed beyond a clean first draft.
Keep the content grounded and avoid exaggerated claims.

Return exactly this format and nothing else:
SUBJECT: <subject line>
BODY:
<email body>
```

---

### 4. API Communication (watsonxService.ts)

**Location:** `client/src/services/watsonxService.ts`

**Purpose:** Sends requests to the Watsonx AI API

```typescript
export async function requestWatsonxText(
  payload: WatsonxTextGenerationRequest,
): Promise<WatsonxTextGenerationResponse> {
  // Send POST request to backend API
  const response = await fetch(WATSONX_TEST_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  // Parse response
  const responseBody = await response.json();

  // Handle errors
  if (!response.ok) {
    if (isErrorEnvelope(responseBody)) {
      throw new Error(responseBody.error);
    }
    throw new Error('Watsonx test request failed.');
  }

  // Validate response structure
  if (!isSuccessEnvelope(responseBody)) {
    throw new Error('Watsonx test response shape was unexpected.');
  }

  return responseBody.data;
}
```

**Response Structure:**
```typescript
{
  data: {
    text: "SUBJECT: ...\nBODY: ...",
    modelId: "ibm/granite-13b-chat-v2",
    region: "us-south"
  }
}
```

---

### 5. Response Parsing (emailGenerator.ts)

**Location:** `client/src/utilities/system-utils/emailGenerator.ts`

**Purpose:** Extracts subject and body from AI response

```typescript
export function extractEmailDraft(
  responseText: string,
  values: EmailFormValues,
): GeneratedEmailDraft {
  const rawText = responseText.trim();
  
  // Extract subject line using regex
  const subjectMatch = rawText.match(/SUBJECT:\s*(.+)/i);
  
  // Extract body using regex
  const bodyMatch = rawText.match(/BODY:\s*([\s\S]+)/i);

  // Get subject or create fallback
  const subject = subjectMatch?.[1]?.trim() || buildFallbackSubject(values);
  
  // Get body and clean it
  const bodySource = bodyMatch?.[1]?.trim() || rawText;
  const body = cleanEmailBody(bodySource);

  return {
    subject,
    body,
    rawText,
  };
}

function cleanEmailBody(body: string): string {
  return body
    .replace(/\r/g, '')                    // Remove carriage returns
    .replace(/[ \t]+\n/g, '\n')           // Remove trailing spaces
    .replace(/\n{3,}/g, '\n\n')           // Max 2 consecutive newlines
    .trim();
}
```

**Why cleaning is important:**
- AI sometimes adds extra whitespace
- Ensures consistent formatting
- Makes the email look professional

---

## 🎨 Prompt Engineering

### What is Prompt Engineering?

**Prompt engineering** is the art of writing instructions for AI to get the best results.

### Key Principles

#### 1. **Be Specific**

❌ Bad:
```
Write an email.
```

✅ Good:
```
You are an AI email assistant that helps users write professional emails.
Purpose: Job application
Tone: Professional
Write a job application email for a Software Engineer position.
```

#### 2. **Provide Context**

❌ Bad:
```
User wants to apply for a job.
```

✅ Good:
```
Context/Background:
Software Engineer position at IBM
Requirements: React, Node.js, 2+ years experience

User wants to communicate:
I have 2 years of experience with React and Node.js and want to apply.
```

#### 3. **Give Examples**

```
Guidelines for this email type:
- Structure: Greeting → Express interest → Highlight qualifications → Close
- Keep professional and enthusiastic
- Show genuine interest in the company
```

#### 4. **Specify Output Format**

```
Return exactly this format and nothing else:
SUBJECT: <subject line>
BODY:
<email body>
```

### Tone Instructions

Different tones require different instructions:

```typescript
const TONE_INSTRUCTIONS = {
  formal: 'formal, respectful, and recruiter-friendly',
  professional: 'professional, balanced, and polished',
  friendly: 'warm, conversational, and still professional',
  enthusiastic: 'enthusiastic, energetic, and passionate',
};
```

**How it affects output:**

**Formal:**
```
Dear Sir/Madam,

I am writing to formally express my interest in the Software Engineer position...

Respectfully yours,
```

**Friendly:**
```
Hi there,

I'm excited to apply for the Software Engineer position...

Looking forward to hearing from you!
Best regards,
```

---

## 🛠️ Customization Guide

### Adding a New Email Purpose

**Step 1:** Add to types
```typescript
// File: client/src/utilities/system-utils/emailGenerator.ts

export type EmailPurpose = 
  | 'job-application' 
  | 'follow-up' 
  | 'thank-you' 
  | 'networking' 
  | 'inquiry'
  | 'resignation';  // NEW
```

**Step 2:** Add label
```typescript
const PURPOSE_LABELS: Record<EmailPurpose, string> = {
  // ... existing ...
  'resignation': 'Resignation letter',  // NEW
};
```

**Step 3:** Add guidance
```typescript
function getPurposeGuidance(purpose: EmailPurpose): string[] {
  const guidance: Record<EmailPurpose, string[]> = {
    // ... existing ...
    'resignation': [  // NEW
      'Be professional and respectful',
      'Express gratitude for the opportunity',
      'Provide clear notice period',
      'Offer to help with transition',
      'Keep it positive and brief'
    ]
  };
  
  return guidance[purpose] || [];
}
```

**Step 4:** Add to UI options
```typescript
// File: client/src/config/watsonx.ts

export const EMAIL_PURPOSE_OPTIONS = [
  // ... existing ...
  {
    value: 'resignation',
    label: 'Resignation',
    description: 'Professional resignation letter with notice period',
  },
];
```

### Adding Custom Instructions

You can add domain-specific instructions:

```typescript
// For tech industry
const techIndustryInstructions = [
  'Mention specific technologies and frameworks',
  'Highlight technical achievements with metrics',
  'Show passion for technology and learning',
];

// For creative industry
const creativeIndustryInstructions = [
  'Showcase creative thinking and innovation',
  'Mention portfolio or creative projects',
  'Use engaging and expressive language',
];

// Add to prompt based on industry
if (values.industry === 'tech') {
  instructions.push(...techIndustryInstructions);
}
```

### Adding Email Templates

Create pre-filled templates for common scenarios:

```typescript
export const EMAIL_TEMPLATES = {
  'internship-application': {
    purpose: 'job-application',
    tone: 'enthusiastic',
    contextMessage: 'Summer internship program',
    yourMessage: 'I am a computer science student eager to gain practical experience',
    extraInstruction: 'Emphasize willingness to learn and academic achievements'
  },
  'senior-position': {
    purpose: 'job-application',
    tone: 'professional',
    contextMessage: 'Senior Software Engineer position',
    yourMessage: 'I have 8+ years of experience leading development teams',
    extraInstruction: 'Focus on leadership experience and technical expertise'
  }
};
```

---

## 🔍 Debugging Tips

### View the Prompt

The hook returns metadata including the prompt:

```typescript
const { result, metadata } = useWatsonxEmailGenerator();

console.log('Prompt sent to AI:', metadata?.prompt);
```

### Check Response

Log the raw AI response:

```typescript
console.log('Raw AI response:', result?.rawText);
```

### Common Issues

**Issue 1: AI doesn't follow format**
- **Solution:** Make format instructions more explicit
- Add: "Do not include any text before SUBJECT or after the email body"

**Issue 2: Email is too generic**
- **Solution:** Provide more context
- Add specific details about the job, company, or situation

**Issue 3: Wrong tone**
- **Solution:** Strengthen tone instructions
- Add examples of the desired tone

---

## 📊 Performance Optimization

### Caching Prompts

For repeated requests with similar inputs:

```typescript
const promptCache = new Map<string, string>();

function getCachedPrompt(values: EmailFormValues): string {
  const cacheKey = JSON.stringify(values);
  
  if (promptCache.has(cacheKey)) {
    return promptCache.get(cacheKey)!;
  }
  
  const prompt = buildEmailPrompt(values);
  promptCache.set(cacheKey, prompt);
  return prompt;
}
```

### Debouncing Requests

Prevent too many API calls:

```typescript
import { debounce } from 'lodash';

const debouncedGenerate = debounce(generateDraft, 1000);
```

---

## 🎓 Best Practices

### For Users

1. **Be specific** in your message
2. **Provide context** (job description, previous email, etc.)
3. **Review and personalize** the generated email
4. **Test different tones** to see what works best

### For Developers

1. **Validate input** before sending to AI
2. **Handle errors gracefully** with user-friendly messages
3. **Log prompts and responses** for debugging
4. **Test with various inputs** to ensure quality
5. **Monitor API usage** to control costs

---

## 🚀 Advanced Features

### Multi-Language Support

Already implemented! The system supports 25+ languages:

```typescript
// User selects language
const formValues = {
  // ... other fields ...
  targetLanguage: 'es',  // Spanish
  culturalAdaptation: true
};

// AI generates email in Spanish with cultural context
```

### Content Analysis

Auto-fill form fields by analyzing pasted content:

```typescript
// User pastes job description
const analysis = await analyzeContentWithWatsonx(pastedText);

// Form auto-fills:
// - Purpose: job-application
// - Job Role: Software Engineer
// - Company: IBM
// - Tone: professional
```

---

## 📝 Summary

The Email Generation AI:
- ✅ Uses IBM Watsonx AI for text generation
- ✅ Builds detailed prompts with context and instructions
- ✅ Supports multiple purposes, tones, and languages
- ✅ Parses and cleans AI responses
- ✅ Provides metadata for debugging
- ✅ Can be easily customized and extended

**Key Files:**
- `useWatsonxEmailGenerator.ts` - Main hook
- `emailGenerator.ts` - Prompt building & parsing
- `watsonxService.ts` - API communication
- `watsonx.ts` - Configuration

**Next Steps:**
- Read the main README for overview
- Check code examples for implementation details
- Experiment with different prompts and settings

Happy coding! 🎉
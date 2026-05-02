# Smart Career Intelligence System - MVP Integration Plan

## 1. Project Overview

The Smart Career Intelligence System is a hackathon MVP that helps job seekers optimize their applications through AI-powered resume analysis and personalized email generation.

**Core Value Proposition:** Upload your resume, get matched with jobs, and generate tailored professional emails using IBM Watsonx AI—all in one seamless flow.

**Tech Stack:** React frontend, Next.js API backend, SQLite database, IBM Watsonx (Granite models), and a custom ATS engine for resume analysis.

---

## 2. Core Features

### Feature 1: ATS Resume Analysis
- Upload resume (PDF/DOCX or manual input)
- Extract skills, experience, education
- Normalize and categorize skills
- Calculate experience level (Junior/Mid/Senior)

### Feature 2: Job Matching
- Compare resume against job descriptions
- Score matches based on skills overlap
- Identify missing skills and gaps
- Provide actionable recommendations

### Feature 3: AI Email Generation (Watsonx)
- Generate professional emails for:
  - Job applications
  - Follow-ups
  - Networking requests
- Personalized based on ATS results
- Multi-language support

### User Flow
1. User uploads resume or fills form
2. System analyzes resume (ATS Engine)
3. User selects target job role
4. System shows match score + recommendations
5. User generates tailored email (Watsonx AI)
6. User copies/downloads email

---

## 3. Simplified Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        USER BROWSER                         │
│                     (React Frontend)                        │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   NEXT.JS BACKEND                           │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐  │
│  │ API Routes   │  │  ATS Engine  │  │  AI Service     │  │
│  │ /api/ats     │──│  (embedded)  │  │  (Watsonx)      │  │
│  │ /api/email   │  │              │  │                 │  │
│  └──────────────┘  └──────────────┘  └─────────────────┘  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  SQLite Database │
              │  (Local File)    │
              └──────────────────┘
                         
                         │ HTTPS API
                         ▼
              ┌──────────────────────┐
              │   IBM Watsonx.ai     │
              │   (Granite Models)   │
              └──────────────────────┘
```

**Key Components:**
- **Frontend:** React + TypeScript + Tailwind CSS
- **Backend:** Next.js API routes (embedded in same project)
- **Database:** SQLite (single file, zero config)
- **ATS Engine:** TypeScript library (rule-based + semantic matching)
- **AI Service:** Watsonx API client (Granite 13B model)

---

## 4. System Flow

### Resume Analysis → Job Match → Email Generation

```
1. UPLOAD RESUME
   └─> POST /api/ats/analyze
       ├─> Parse resume (skills, experience, education)
       ├─> Normalize skills (e.g., "React.js" → "React")
       ├─> Calculate experience level
       └─> Return: ATSResult

2. JOB MATCHING
   └─> Frontend sends: resume + job_roles[]
       ├─> ATS Engine compares skills
       ├─> Semantic matching (cosine similarity)
       ├─> Score each job (0-100)
       └─> Return: match_score, missing_skills, recommendations

3. EMAIL GENERATION
   └─> POST /api/email/generate
       ├─> Extract ATS context (matched skills, gaps, level)
       ├─> Build optimized prompt (< 200 tokens)
       ├─> Call Watsonx API (Granite model)
       ├─> Fallback to template if AI fails
       └─> Return: generated email text
```

**Token Optimization Strategy:**
- ❌ Don't send full resume (2000+ tokens)
- ✅ Send filtered ATS results (< 200 tokens)
- **Savings:** 92% token reduction = faster + cheaper

---

## 5. API Design (Minimal)

### Endpoint 1: ATS Analysis

**POST** `/api/ats/analyze`

**Request:**
```json
{
  "resume": {
    "skills": ["React", "TypeScript", "Node.js"],
    "workExperience": [
      {
        "title": "Frontend Developer",
        "company": "Tech Corp",
        "duration_years": 2,
        "responsibilities": ["Built React apps", "Led team of 3"]
      }
    ],
    "education": [
      {
        "degree": "BS Computer Science",
        "institution": "State University",
        "graduation_year": 2022
      }
    ],
    "rawText": "Full resume text for keyword analysis..."
  },
  "job_roles": [
    {
      "job_title": "Senior Frontend Developer",
      "required_skills": ["React", "TypeScript", "GraphQL"],
      "preferred_skills": ["Next.js", "Testing"],
      "keywords": ["leadership", "scalability"]
    }
  ]
}
```

**Response:**
```json
{
  "detected_skills": ["React", "TypeScript", "Node.js"],
  "experience_level": "Mid-Level",
  "total_years": 2,
  "possible_roles": ["Frontend Developer", "Full Stack Developer"],
  "job_matches": [
    {
      "job_title": "Senior Frontend Developer",
      "match_score": 72,
      "matching_skills": ["React", "TypeScript"],
      "missing_skills": ["GraphQL"],
      "skill_gap_percentage": 33,
      "recommendations": [
        "Learn GraphQL to increase match score",
        "Highlight leadership experience"
      ]
    }
  ],
  "confidence_score": 0.85
}
```

---

### Endpoint 2: Email Generation

**POST** `/api/email/generate`

**Request:**
```json
{
  "emailType": "job_application",
  "context": {
    "targetRole": "Senior Frontend Developer",
    "companyName": "Tech Innovations Inc",
    "matchedSkills": ["React", "TypeScript"],
    "missingSkills": ["GraphQL"],
    "experienceLevel": "Mid-Level",
    "tone": "professional"
  },
  "language": "en"
}
```

**Response:**
```json
{
  "success": true,
  "email": {
    "subject": "Application for Senior Frontend Developer Position",
    "body": "Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Frontend Developer position at Tech Innovations Inc...",
    "generatedBy": "watsonx",
    "tokensUsed": 187
  }
}
```

---

## 6. Data Model (Simple)

### SQLite Schema

```sql
-- Users table (optional for MVP, can skip auth)
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE,
  name TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Resumes table
CREATE TABLE resumes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  skills TEXT,              -- JSON array
  experience_level TEXT,    -- Junior/Mid/Senior
  total_years INTEGER,
  raw_data TEXT,            -- Full JSON of resume
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Generated emails table
CREATE TABLE emails (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  resume_id INTEGER,
  email_type TEXT,          -- job_application, follow_up, etc.
  subject TEXT,
  body TEXT,
  target_role TEXT,
  generated_by TEXT,        -- watsonx or template
  tokens_used INTEGER,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (resume_id) REFERENCES resumes(id)
);

-- Jobs table (optional - for saving job postings)
CREATE TABLE jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT,
  company TEXT,
  required_skills TEXT,     -- JSON array
  description TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

**MVP Simplification:**
- No user authentication (can add later)
- No indexes (SQLite handles small datasets fine)
- No foreign key constraints enforcement (optional)
- Store JSON as TEXT (parse in application layer)

---

## 7. AI Integration (Watsonx)

### Model Selection
- **Primary:** IBM Granite 13B Chat
- **Fallback:** Template-based generation

### Prompt Strategy

**Optimized Prompt Template:**
```typescript
const prompt = `Generate a professional ${emailType} email.

Context:
- Role: ${targetRole}
- Company: ${companyName}
- Candidate Level: ${experienceLevel}
- Matched Skills: ${matchedSkills.join(', ')}
- Skills to Highlight: ${missingSkills.join(', ')}

Tone: ${tone}
Length: 150-200 words

Email:`;
```

**Token Budget:**
- Prompt: ~150 tokens
- Context: ~50 tokens
- Response: ~200 tokens
- **Total:** ~400 tokens per request

### Watsonx Configuration

```typescript
// watsonxService.ts
const watsonxConfig = {
  apiKey: process.env.WATSONX_API_KEY,
  projectId: process.env.WATSONX_PROJECT_ID,
  model: 'ibm/granite-13b-chat-v2',
  parameters: {
    max_new_tokens: 250,
    temperature: 0.7,
    top_p: 0.9,
    repetition_penalty: 1.1
  }
};
```

### Fallback Strategy

```typescript
async function generateEmail(context) {
  try {
    // Try Watsonx first
    return await watsonxGenerate(context);
  } catch (error) {
    console.error('Watsonx failed:', error);
    // Fallback to template
    return generateTemplateEmail(context);
  }
}

function generateTemplateEmail(context) {
  return {
    subject: `Application for ${context.targetRole}`,
    body: `Dear Hiring Manager,\n\nI am excited to apply for the ${context.targetRole} position at ${context.companyName}. With my experience in ${context.matchedSkills.join(', ')}, I am confident I can contribute to your team...\n\nBest regards`,
    generatedBy: 'template'
  };
}
```

---

## 8. Error Handling (Basic)

### API Failure Handling

```typescript
// Centralized error handler
export function handleAPIError(error: any) {
  if (error.response) {
    // API returned error response
    return {
      success: false,
      error: error.response.data.message || 'API request failed',
      code: error.response.status
    };
  } else if (error.request) {
    // No response received
    return {
      success: false,
      error: 'No response from server',
      code: 503
    };
  } else {
    // Request setup error
    return {
      success: false,
      error: error.message || 'Unknown error',
      code: 500
    };
  }
}
```

### Input Validation

```typescript
// Validate resume input
function validateResumeInput(resume: any) {
  if (!resume.skills || resume.skills.length === 0) {
    throw new Error('Resume must include at least one skill');
  }
  
  if (!resume.workExperience && !resume.rawText) {
    throw new Error('Resume must include work experience or raw text');
  }
  
  return true;
}

// Validate email generation input
function validateEmailInput(context: any) {
  if (!context.targetRole || !context.emailType) {
    throw new Error('Target role and email type are required');
  }
  
  return true;
}
```

### User-Facing Error Messages

```typescript
const ERROR_MESSAGES = {
  INVALID_RESUME: 'Please provide valid resume data with skills and experience',
  AI_SERVICE_DOWN: 'AI service temporarily unavailable. Using template instead.',
  RATE_LIMIT: 'Too many requests. Please wait a moment and try again.',
  INVALID_INPUT: 'Invalid input data. Please check your form and try again.'
};
```

---

## 9. Security (Minimal but Realistic)

### Input Sanitization

```typescript
import DOMPurify from 'isomorphic-dompurify';

// Sanitize user input
function sanitizeInput(input: string): string {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],  // Strip all HTML
    ALLOWED_ATTR: []
  });
}

// Apply to all user inputs
const sanitizedSkills = resume.skills.map(skill => sanitizeInput(skill));
```

### Rate Limiting (Basic)

```typescript
// Simple in-memory rate limiter
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const requests = rateLimitMap.get(ip) || [];
  
  // Remove old requests outside window
  const recentRequests = requests.filter(time => now - time < windowMs);
  
  if (recentRequests.length >= maxRequests) {
    throw new Error('Rate limit exceeded');
  }
  
  recentRequests.push(now);
  rateLimitMap.set(ip, recentRequests);
}
```

### Environment Variables

```bash
# .env.local
WATSONX_API_KEY=your_api_key_here
WATSONX_PROJECT_ID=your_project_id
DATABASE_URL=./data/app.db
NODE_ENV=development
```

**Security Rules:**
- ✅ Never commit `.env` files
- ✅ Use environment variables for secrets
- ✅ Sanitize all user inputs
- ✅ Basic rate limiting (10 req/min per IP)
- ❌ No authentication needed for MVP (add later)
- ❌ No HTTPS required for local dev (use in production)

---

## 10. Deployment Plan

### Single Deployment (Vercel - Recommended)

**Why Vercel:**
- Zero config for Next.js
- Free tier sufficient for hackathon
- Automatic HTTPS
- Environment variable management
- Deploy in < 5 minutes

**Deployment Steps:**

```bash
# 1. Install Vercel CLI
npm i -g vercel

# 2. Login
vercel login

# 3. Deploy
vercel --prod

# 4. Set environment variables
vercel env add WATSONX_API_KEY
vercel env add WATSONX_PROJECT_ID
```

**Alternative: Simple Node Server**

```bash
# Build frontend
cd client && npm run build

# Start backend
cd .. && npm run start

# Access at http://localhost:3000
```

**Database Handling:**
- **Local Dev:** SQLite file in `/data/app.db`
- **Production:** Use Vercel Postgres (free tier) or keep SQLite

**No Need For:**
- ❌ Docker containers
- ❌ Kubernetes
- ❌ CI/CD pipelines
- ❌ Load balancers
- ❌ Redis caching
- ❌ CDN setup

---

## 11. MVP Development Plan (48 Hours)

### Day 1: Core Foundation (24 hours)

#### Morning (0-6 hours)
- [ ] **Setup project structure** (1h)
  - Initialize Next.js + React + TypeScript
  - Setup Tailwind CSS
  - Create folder structure
  
- [ ] **Database setup** (1h)
  - Create SQLite database
  - Write schema
  - Test basic CRUD operations

- [ ] **ATS Engine implementation** (4h)
  - Skill detection & normalization
  - Experience classification
  - Semantic matching algorithm
  - Job scoring logic

#### Afternoon (6-12 hours)
- [ ] **Backend API routes** (3h)
  - `/api/ats/analyze` endpoint
  - Input validation
  - Error handling
  - Test with Postman

- [ ] **Watsonx integration** (3h)
  - Setup API client
  - Implement prompt templates
  - Test email generation
  - Add fallback templates

#### Evening (12-18 hours)
- [ ] **Frontend - Resume upload** (3h)
  - Resume form component
  - File upload (optional)
  - Form validation
  - Submit to ATS API

- [ ] **Frontend - Results display** (3h)
  - Show match scores
  - Display missing skills
  - Show recommendations
  - Basic styling

#### Night (18-24 hours)
- [ ] **Integration testing** (2h)
  - Test full flow: upload → analyze → results
  - Fix bugs
  - Handle edge cases

- [ ] **Buffer time** (2h)
  - Catch up on delays
  - Code cleanup

---

### Day 2: Polish & Demo (24 hours)

#### Morning (24-30 hours)
- [ ] **Email generation UI** (3h)
  - Email composer component
  - Connect to `/api/email/generate`
  - Display generated email
  - Copy to clipboard button

- [ ] **Language selector** (1h)
  - Add language dropdown
  - Implement multi-language support
  - Test with 2-3 languages

- [ ] **UI/UX polish** (2h)
  - Improve styling
  - Add loading states
  - Add success/error messages
  - Responsive design basics

#### Afternoon (30-36 hours)
- [ ] **End-to-end testing** (2h)
  - Test complete user journey
  - Test error scenarios
  - Test on mobile
  - Fix critical bugs

- [ ] **Performance optimization** (2h)
  - Optimize ATS algorithm
  - Reduce API response times
  - Minimize bundle size
  - Test with large resumes

#### Evening (36-42 hours)
- [ ] **Demo preparation** (3h)
  - Create sample resumes
  - Prepare demo script
  - Record demo video (backup)
  - Test on demo machine

- [ ] **Documentation** (1h)
  - Update README
  - Add API documentation
  - Create quick start guide

#### Night (42-48 hours)
- [ ] **Final polish** (2h)
  - Fix last-minute bugs
  - Improve error messages
  - Add loading animations

- [ ] **Deployment** (2h)
  - Deploy to Vercel
  - Test production build
  - Setup environment variables
  - Verify all features work

- [ ] **Buffer & sleep** (2h)
  - Final testing
  - Get rest before demo!

---

## 12. Success Metrics

### MVP Must-Haves (Demo-Ready)
- ✅ Resume upload/input works
- ✅ ATS analysis returns match score
- ✅ Email generation works (Watsonx or template)
- ✅ UI is clean and functional
- ✅ Deployed and accessible via URL

### Nice-to-Haves (If Time Permits)
- 🎯 File upload (PDF/DOCX parsing)
- 🎯 Save resume history
- 🎯 Multiple job comparisons
- 🎯 Email templates library
- 🎯 Dark mode

### Demo Talking Points
1. **Problem:** Job seekers struggle with resume optimization and email writing
2. **Solution:** AI-powered analysis + personalized email generation
3. **Tech:** IBM Watsonx (Granite), custom ATS engine, React
4. **Innovation:** Token-optimized AI prompts (92% reduction)
5. **Impact:** Saves 2-3 hours per job application

---

## 13. Risk Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| Watsonx API fails | High | Template-based fallback |
| ATS algorithm inaccurate | Medium | Use sample data for testing |
| Time overrun | High | Cut nice-to-haves, focus on core |
| Deployment issues | Medium | Test deploy early (Day 1 evening) |
| UI not polished | Low | Use Tailwind components library |

---

## 14. Team Roles (1-4 Developers)

### Solo Developer
- Focus on backend + ATS first
- Use component library for UI
- Skip file upload, use form input

### 2 Developers
- **Dev 1:** Backend + ATS + Watsonx
- **Dev 2:** Frontend + UI/UX

### 3-4 Developers
- **Dev 1:** ATS Engine + algorithms
- **Dev 2:** Backend API + Watsonx integration
- **Dev 3:** Frontend components + state management
- **Dev 4:** UI/UX polish + testing + deployment

---

## 15. Quick Start Commands

```bash
# Clone and setup
git clone <repo-url>
cd smart-career-system

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Add your Watsonx credentials

# Initialize database
npm run db:init

# Start development
npm run dev

# Open browser
open http://localhost:3000

# Run tests (if time permits)
npm run test

# Build for production
npm run build

# Deploy
vercel --prod
```

---

## Conclusion

This integration plan is designed for **rapid MVP development** in a hackathon setting. It prioritizes:

✅ **Simplicity** over complexity  
✅ **Working features** over perfect architecture  
✅ **Demo-ready** over production-ready  
✅ **Clear implementation** over abstract design  

**Key Success Factors:**
1. Start with backend/ATS (hardest part)
2. Test Watsonx integration early
3. Keep UI simple (use component library)
4. Deploy early and often
5. Focus on the demo story

**Remember:** A working demo with 3 core features beats a broken system with 10 planned features. Ship early, iterate fast, and nail the presentation!

Good luck! 🚀

# Resume Generator System - Complete Architecture Analysis

## Executive Summary

The Resume Generator is a **hybrid monolithic-microservices architecture** that combines AI-powered resume generation, deterministic ATS scoring, and multi-format document export capabilities. The system processes uploaded resumes, analyzes job descriptions, generates optimized content using IBM Watsonx AI, and produces both ATS-optimized resumes and comprehensive CVs.

**Architecture Style**: Hybrid (Monolithic Next.js backend with Python microservice for PDF parsing)

**Key Components**: 7 major subsystems
- Frontend (React + TypeScript)
- Backend API (Next.js)
- ATS Scoring Engine (Deterministic)
- AI Enhancement Layer (Watsonx Granite)
- PDF Parser Service (Python/PyMuPDF)
- Template & Export System
- Email Generator

---

## 1. High-Level System Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Port 5173)                        │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐│
│  │ Resume       │  │ Email        │  │ PDF          │  │ ATS Score   ││
│  │ Builder UI   │  │ Composer UI  │  │ Viewer       │  │ Display     ││
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘│
│         │                  │                  │                │         │
│         └──────────────────┴──────────────────┴────────────────┘         │
│                                    │                                      │
│                            React Services Layer                           │
│                    (resumeService, atsService, emailService)             │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │ HTTP/REST
                                      │
┌─────────────────────────────────────▼───────────────────────────────────┐
│                      API GATEWAY (Next.js - Port 3001)                   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────────┐ │
│  │ CORS       │  │ Rate       │  │ Input      │  │ Security         │ │
│  │ Handler    │  │ Limiter    │  │ Validator  │  │ Sanitizer        │ │
│  └────────────┘  └────────────┘  └────────────┘  └──────────────────┘ │
│                                                                           │
│  API Routes:                                                              │
│  ├─ /api/resume/parse          (File Upload & Parsing)                  │
│  ├─ /api/resume/analyze-jd     (Job Description Analysis)               │
│  ├─ /api/resume/generate       (Resume Generation)                      │
│  ├─ /api/resume/generate-pdf   (PDF Export)                             │
│  ├─ /api/ats/analyze           (ATS Scoring)                            │
│  ├─ /api/email/generate        (Email Generation)                       │
│  └─ /api/email/generate-from-ats (ATS-Enhanced Email)                   │
└─────────────────────────────────────┬───────────────────────────────────┘
                                      │
                    ┌─────────────────┼─────────────────┐
                    │                 │                 │
┌───────────────────▼──────┐  ┌──────▼──────┐  ┌──────▼──────────────────┐
│   CORE SERVICES          │  │  AI LAYER   │  │  EXTERNAL SERVICES      │
├──────────────────────────┤  ├─────────────┤  ├─────────────────────────┤
│                          │  │             │  │                         │
│ ┌──────────────────────┐ │  │ ┌─────────┐ │  │ ┌─────────────────────┐│
│ │ ATS Engine           │ │  │ │Watsonx  │ │  │ │ Python PDF Parser   ││
│ │ (Deterministic)      │ │  │ │AI       │ │  │ │ (PyMuPDF)           ││
│ │                      │ │  │ │Service  │ │  │ │                     ││
│ │ • Skill Matching     │ │  │ │         │ │  │ │ Port: 8000          ││
│ │ • Keyword Analysis   │ │  │ │ Granite │ │  │ │ FastAPI             ││
│ │ • Experience Scoring │ │  │ │ 3-8B    │ │  │ │                     ││
│ │ • Gap Detection      │ │  │ │ Instruct│ │  │ │ Endpoints:          ││
│ └──────────────────────┘ │  │ └─────────┘ │  │ │ • POST /api/parse   ││
│                          │  │             │  │ │ • GET /health       ││
│ ┌──────────────────────┐ │  │ ┌─────────┐ │  │ └─────────────────────┘│
│ │ Resume Parser        │ │  │ │ AI      │ │  │                         │
│ │ Service              │ │  │ │ Resume  │ │  │ ┌─────────────────────┐│
│ │                      │ │  │ │ Parser  │ │  │ │ Cache Layer         ││
│ │ • Text Chunking      │ │  │ │         │ │  │ │ (In-Memory)         ││
│ │ • Deduplication      │ │  │ │ • Smart │ │  │ │                     ││
│ │ • Smart Routing      │ │  │ │   Route │ │  │ │ • Resume Cache      ││
│ │ • Fallback Logic     │ │  │ │ • Chunk │ │  │ │ • Token Metrics     ││
│ └──────────────────────┘ │  │ │   Parse │ │  │ └─────────────────────┘│
│                          │  │ └─────────┘ │  │                         │
│ ┌──────────────────────┐ │  │             │  └─────────────────────────┘
│ │ Template Engine      │ │  │ ┌─────────┐ │
│ │                      │ │  │ │ Email   │ │
│ │ • ATS Formatter      │ │  │ │ Gen     │ │
│ │ • CV Formatter       │ │  │ │ Service │ │
│ │ • PDF Generator      │ │  │ │         │ │
│ │   (jsPDF)            │ │  │ │ Multi-  │ │
│ └──────────────────────┘ │  │ │ Tone    │ │
│                          │  │ └─────────┘ │
└──────────────────────────┘  └─────────────┘
```

---

## 2. Complete Data Flow Pipeline

### End-to-End Resume Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: INPUT & PARSING                          │
└─────────────────────────────────────────────────────────────────────────┘

User Upload (PDF/DOCX/TXT)
         │
         ▼
┌─────────────────────┐
│ Frontend Validation │
│ • File type check   │
│ • Size limit (10MB) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ POST /api/resume/parse                  │
│                                         │
│ 1. Receive multipart/form-data         │
│ 2. Convert to Buffer                   │
│ 3. Route to parser                     │
└──────────┬──────────────────────────────┘
           │
           ├─────────────────┐
           │                 │
           ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│ Python Parser    │  │ Fallback Parser  │
│ (Primary)        │  │ (pdf-parse)      │
│                  │  │                  │
│ • PyMuPDF        │  │ • Node.js native │
│ • Page-by-page   │  │ • Basic extract  │
│ • 100-500ms/page │  │ • Slower         │
└────────┬─────────┘  └────────┬─────────┘
         │                     │
         └──────────┬──────────┘
                    │
                    ▼
         ┌────────────────────┐
         │ Raw Text Extracted │
         │ • Total pages      │
         │ • Per-page text    │
         │ • Metadata         │
         └──────────┬─────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│ AI Resume Parser (Watsonx)              │
│                                         │
│ 1. Complexity Analysis                 │
│    • Word count check                  │
│    • Structure detection               │
│    • Smart routing decision            │
│                                         │
│ 2. Text Preprocessing                  │
│    • Header/footer deduplication       │
│    • Chunking (if >4000 words)         │
│    • Entity reconstruction             │
│                                         │
│ 3. AI Extraction                       │
│    • Personal info                     │
│    • Work experience                   │
│    • Skills                            │
│    • Education                         │
│    • Projects                          │
│    • Certifications                    │
│                                         │
│ 4. Cache Result (MD5 hash)             │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Structured JSON     │
│ (ParsedResumeData)  │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 2: JOB DESCRIPTION ANALYSIS                     │
└─────────────────────────────────────────────────────────────────────────┘

User Input (Job Description Text)
         │
         ▼
┌─────────────────────────────────────────┐
│ POST /api/resume/analyze-jd             │
│                                         │
│ 1. Text sanitization                   │
│ 2. Keyword extraction                  │
│ 3. Skill identification                │
│ 4. Experience level detection          │
│ 5. Technology parsing                  │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Job Analysis Result │
│ • Required skills   │
│ • Preferred skills  │
│ • Keywords          │
│ • Experience level  │
│ • Technologies      │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                      PHASE 3: ATS SCORING ENGINE                         │
└─────────────────────────────────────────────────────────────────────────┘

Parsed Resume + Job Analysis
         │
         ▼
┌─────────────────────────────────────────┐
│ POST /api/ats/analyze                   │
│                                         │
│ ATS Engine (Deterministic - No AI)     │
│                                         │
│ 1. Skill Normalization                 │
│    • ReactJS → React                   │
│    • NodeJS → Node.js                  │
│    • MySQL DB → MySQL                  │
│                                         │
│ 2. Keyword Matching (60% weight)       │
│    • Case-insensitive                  │
│    • Fuzzy matching                    │
│    • Context awareness                 │
│                                         │
│ 3. Skills Matching (30% weight)        │
│    • Required vs candidate             │
│    • Preferred bonus                   │
│    • Skill categorization              │
│                                         │
│ 4. Experience Matching (10% weight)    │
│    • Years calculation                 │
│    • Level classification              │
│    • Junior/Mid/Senior                 │
│                                         │
│ 5. Format Score                        │
│    • ATS-friendly check                │
│    • Section structure                 │
│    • Readability                       │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│ ATS Score Result    │
│ • Overall: 0-100%   │
│ • Matched skills    │
│ • Missing skills    │
│ • Recommendations   │
│ • Gap analysis      │
└──────────┬──────────┘
           │
           ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                   PHASE 4: AI RESUME GENERATION                          │
└─────────────────────────────────────────────────────────────────────────┘

User Selection: ATS-Optimized OR Full CV
         │
         ▼
┌─────────────────────────────────────────┐
│ POST /api/resume/generate               │
│                                         │
│ Input:                                  │
│ • Parsed resume data                   │
│ • Job description                      │
│ • Resume type (ats-optimized/full-cv)  │
│ • Target role                          │
│ • Additional instructions              │
└──────────┬──────────────────────────────┘
           │
           ├──────────────────────────────┐
           │                              │
           ▼                              ▼
┌──────────────────────┐      ┌──────────────────────┐
│ ATS Resume Generator │      │ Full CV Generator    │
│                      │      │                      │
│ Watsonx AI Prompt:   │      │ Watsonx AI Prompt:   │
│ • Keyword-rich       │      │ • Narrative style    │
│ • Bullet points      │      │ • Paragraph format   │
│ • Concise (1-2 pg)   │      │ • Detailed (3-5 pg)  │
│ • Metric-focused     │      │ • Story-based        │
│ • ATS-friendly       │      │ • Context-rich       │
│                      │      │                      │
│ Output: ~368 words   │      │ Output: ~1586 words  │
│         24 bullets   │      │         0 bullets    │
└──────────┬───────────┘      └──────────┬───────────┘
           │                              │
           └──────────────┬───────────────┘
                          │
                          ▼
                ┌──────────────────┐
                │ Generated Resume │
                │ (Plain Text)     │
                └──────────┬───────┘
                           │
                           ▼

┌─────────────────────────────────────────────────────────────────────────┐
│                    PHASE 5: TEMPLATE RENDERING & EXPORT                  │
└─────────────────────────────────────────────────────────────────────────┘

Generated Resume + Type
         │
         ▼
┌─────────────────────────────────────────┐
│ Template Engine (Type-Based Routing)    │
│                                         │
│ IF type === 'ats-optimized':           │
│    ├─ formatResumeContent()            │
│    │  • Bullet points (•)              │
│    │  • Line height: 1.4               │
│    │  • Font: 10pt                     │
│    │  • Compact spacing                │
│    └─ ATS-friendly structure           │
│                                         │
│ IF type === 'full-cv':                 │
│    ├─ formatCVContent()                │
│    │  • Narrative paragraphs           │
│    │  • Line height: 1.6               │
│    │  • Font: 10.5pt                   │
│    │  • Expanded spacing               │
│    └─ Professional CV layout           │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ PDF Generator (jsPDF)                   │
│                                         │
│ 1. Create PDF document                 │
│ 2. Apply formatting                    │
│ 3. Add sections                        │
│ 4. Generate blob                       │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Final PDF Output    │
│ • Download ready    │
│ • Print ready       │
│ • ATS compatible    │
└─────────────────────┘
```

### Email Generation Flow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      EMAIL GENERATION PIPELINE                           │
└─────────────────────────────────────────────────────────────────────────┘

User Input + ATS Context
         │
         ▼
┌─────────────────────────────────────────┐
│ POST /api/email/generate-from-ats       │
│                                         │
│ Input:                                  │
│ • Resume content                       │
│ • Job description                      │
│ • Email type (application/follow-up)   │
│ • Tone (professional/friendly/etc)     │
│ • Language (en/es/fr/de/zh)            │
│ • ATS context (filtered)               │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Context Filtering (Token Optimization)  │
│                                         │
│ Reduce ATS data from ~2500 to ~195 tok │
│ • Top 5 matched skills                 │
│ • Top 3 missing skills                 │
│ • Experience level                     │
│ • Target role                          │
│ • Top 1 recommendation                 │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Watsonx Email Generator                 │
│                                         │
│ Model: Granite 3-8B Instruct           │
│ Parameters:                             │
│ • max_tokens: 250                      │
│ • temperature: 0.7                     │
│ • top_p: 0.9                           │
│                                         │
│ Prompt includes:                        │
│ • Email type & tone                    │
│ • Target role & company                │
│ • Matched skills                       │
│ • Language preference                  │
└──────────┬──────────────────────────────┘
           │
           ▼
┌─────────────────────┐
│ Generated Email     │
│ • Subject line      │
│ • Body (150-200w)   │
│ • Professional tone │
│ • Skill highlights  │
└─────────────────────┘
```

---

## 3. Component Interaction Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT INTERACTION MAP                           │
└────────────────────────────────────────────────────────────────────────┘

Frontend Components
    │
    ├─ ResumeBuilderPage
    │   │
    │   ├─ FileUploadSection ──────┐
    │   │                           │
    │   ├─ JobDescriptionSection ───┼──┐
    │   │                           │  │
    │   ├─ ActionHub ───────────────┼──┼──┐
    │   │                           │  │  │
    │   ├─ ATSScoreCard ────────────┼──┼──┼──┐
    │   │                           │  │  │  │
    │   ├─ ResumePreview ───────────┼──┼──┼──┼──┐
    │   │                           │  │  │  │  │
    │   └─ EmailGeneratorModal ─────┼──┼──┼──┼──┼──┐
    │                               │  │  │  │  │  │
    └───────────────────────────────┼──┼──┼──┼──┼──┼───────┐
                                    │  │  │  │  │  │       │
                                    ▼  ▼  ▼  ▼  ▼  ▼       │
                            ┌────────────────────────┐     │
                            │   Service Layer        │     │
                            │                        │     │
                            │ • resumeService.ts     │     │
                            │ • atsService.ts        │     │
                            │ • emailService.ts      │     │
                            │ • pdfGenerationService │     │
                            └───────────┬────────────┘     │
                                        │                  │
                                        ▼                  │
                            ┌────────────────────────┐     │
                            │   HTTP Client          │     │
                            │   (fetch API)          │     │
                            └───────────┬────────────┘     │
                                        │                  │
════════════════════════════════════════│══════════════════│═══════════════
                                        │                  │
                                        ▼                  │
                            ┌────────────────────────┐     │
                            │   API Gateway          │     │
                            │   (Next.js)            │     │
                            │                        │     │
                            │ Middleware:            │     │
                            │ • CORS                 │     │
                            │ • Rate Limiting        │     │
                            │ • Input Validation     │     │
                            │ • Security Sanitizer   │     │
                            └───────────┬────────────┘     │
                                        │                  │
                    ┌───────────────────┼──────────────────┼────────┐
                    │                   │                  │        │
                    ▼                   ▼                  ▼        ▼
        ┌──────────────────┐  ┌──────────────┐  ┌──────────────┐  │
        │ Resume Routes    │  │ ATS Routes   │  │ Email Routes │  │
        │                  │  │              │  │              │  │
        │ /parse           │  │ /analyze     │  │ /generate    │  │
        │ /analyze-jd      │  │              │  │ /history     │  │
        │ /generate        │  │              │  │ /[id]        │  │
        │ /generate-pdf    │  │              │  │              │  │
        └────────┬─────────┘  └──────┬───────┘  └──────┬───────┘  │
                 │                   │                  │          │
                 │                   │                  │          │
    ┌────────────┼───────────────────┼──────────────────┼──────────┘
    │            │                   │                  │
    ▼            ▼                   ▼                  ▼
┌─────────┐  ┌─────────┐      ┌──────────┐      ┌──────────┐
│ Resume  │  │ Python  │      │   ATS    │      │ Watsonx  │
│ Parser  │  │ Parser  │      │  Engine  │      │   AI     │
│ Service │  │ Service │      │          │      │ Service  │
│         │  │         │      │          │      │          │
│ • AI    │  │ • PyMu  │      │ • Skill  │      │ • Email  │
│   Parse │  │   PDF   │      │   Match  │      │   Gen    │
│ • Cache │  │ • Fast  │      │ • Score  │      │ • Resume │
│ • Chunk │  │   API   │      │ • Gap    │      │   Gen    │
│         │  │         │      │   Detect │      │          │
└────┬────┘  └────┬────┘      └────┬─────┘      └────┬─────┘
     │            │                 │                 │
     │            │                 │                 │
     └────────────┼─────────────────┼─────────────────┘
                  │                 │
                  ▼                 ▼
         ┌──────────────┐    ┌──────────────┐
         │ Cache Layer  │    │ Template     │
         │              │    │ Engine       │
         │ • Resume     │    │              │
         │   Cache      │    │ • ATS Format │
         │ • Token      │    │ • CV Format  │
         │   Metrics    │    │ • PDF Gen    │
         └──────────────┘    └──────────────┘
```

---

## 4. Technology Stack & Dependencies

### Frontend Stack
```
React 18.x + TypeScript 5.x
├─ Build: Vite 5.x
├─ Styling: Tailwind CSS 3.x
├─ UI Components: shadcn/ui
├─ PDF Viewing: react-pdf
├─ State Management: React Hooks
├─ HTTP Client: Fetch API
└─ Form Handling: React Hook Form
```

### Backend Stack
```
Next.js 14.x (App Router)
├─ Runtime: Node.js 18+
├─ Language: TypeScript 5.x
├─ API: REST (Next.js API Routes)
├─ PDF Generation: jsPDF
├─ Security: Custom middleware
└─ Caching: In-memory (Map)
```

### AI & ML Stack
```
IBM Watsonx AI
├─ Model: Granite 3-8B Instruct
├─ SDK: @ibm-cloud/watsonx-ai
├─ Auth: IBM Cloud IAM
└─ Use Cases:
    ├─ Resume parsing
    ├─ Resume generation
    └─ Email generation
```

### External Services
```
Python PDF Parser (Microservice)
├─ Framework: FastAPI
├─ Library: PyMuPDF (fitz)
├─ Port: 8000
├─ Protocol: HTTP/REST
└─ Endpoints:
    ├─ POST /api/parse
    ├─ GET /health
    └─ GET /status
```

---

## 5. Security Architecture

### Input Validation & Sanitization
```
┌─────────────────────────────────────┐
│ Security Layers                     │
├─────────────────────────────────────┤
│                                     │
│ 1. File Upload Security             │
│    • Type validation (PDF/DOCX/TXT) │
│    • Size limit (10MB)              │
│    • MIME type check                │
│    • Virus scanning (TODO)          │
│                                     │
│ 2. Input Sanitization               │
│    • HTML entity encoding           │
│    • SQL injection prevention       │
│    • XSS protection                 │
│    • Command injection prevention   │
│                                     │
│ 3. Rate Limiting                    │
│    • IP-based throttling            │
│    • 20 req/min for ATS             │
│    • 10 req/min for AI generation   │
│    • Sliding window algorithm       │
│                                     │
│ 4. CORS Configuration               │
│    • Whitelist origins              │
│    • Credential handling            │
│    • Method restrictions            │
│                                     │
│ 5. API Key Protection               │
│    • Environment variables          │
│    • No client-side exposure        │
│    • Rotation policy (TODO)         │
└─────────────────────────────────────┘
```

### Data Protection
- No persistent storage of uploaded files
- In-memory processing only
- Cache expiration (1 hour)
- No PII logging
- HTTPS enforcement (production)

---

## 6. Performance Characteristics

### Latency Breakdown
```
Operation                    | Avg Time    | Max Time
─────────────────────────────┼─────────────┼──────────
PDF Upload (5MB)             | 200ms       | 500ms
Python Parser (per page)     | 100-500ms   | 1s
AI Resume Parsing            | 2-5s        | 10s
Job Description Analysis     | 500ms       | 2s
ATS Scoring                  | 50-100ms    | 200ms
AI Resume Generation         | 3-8s        | 15s
PDF Export                   | 500ms       | 2s
Email Generation             | 2-4s        | 8s
─────────────────────────────┴─────────────┴──────────
Total Pipeline (end-to-end)  | 8-15s       | 30s
```

### Scalability Considerations
```
Current Limitations:
├─ Single-instance deployment
├─ In-memory caching (not distributed)
├─ Synchronous AI calls
├─ No load balancing
└─ No horizontal scaling

Bottlenecks:
├─ AI API calls (3-8s each)
├─ PDF parsing for large files
├─ Synchronous processing
└─ Memory usage for large resumes

Optimization Opportunities:
├─ Implement Redis for distributed cache
├─ Add message queue (RabbitMQ/Redis)
├─ Parallel AI processing
├─ CDN for static assets
├─ Database for persistent storage
└─ Horizontal pod autoscaling
```

---

## 7. Error Handling & Resilience

### Fallback Mechanisms
```
┌─────────────────────────────────────────┐
│ Resilience Patterns                     │
├─────────────────────────────────────────┤
│                                         │
│ 1. PDF Parsing Fallback                │
│    Primary: Python PyMuPDF              │
│    Fallback: Node.js pdf-parse          │
│    Trigger: Service unavailable         │
│                                         │
│ 2. AI Service Fallback                 │
│    Primary: Watsonx AI                  │
│    Fallback: Template-based generation  │
│    Trigger: API timeout/error           │
│                                         │
│ 3. Cache Miss Handling                  │
│    Primary: Cache lookup                │
│    Fallback: Recompute                  │
│    Trigger: Cache expiration            │
│                                         │
│ 4. Retry Logic                          │
│    • Exponential backoff                │
│    • Max 3 retries                      │
│    • Circuit breaker pattern (TODO)     │
└─────────────────────────────────────────┘
```

### Error Propagation
```
Error Flow:
Service Error → API Route → Error Handler → HTTP Response → Client

Error Types:
├─ ValidationError (400)
├─ RateLimitError (429)
├─ ServiceUnavailableError (503)
├─ AITimeoutError (504)
└─ InternalServerError (500)

Client Handling:
├─ User-friendly messages
├─ Retry suggestions
├─ Fallback options
└─ Error logging
```

---

## 8. Deployment Architecture

### Current Setup
```
Development Environment:
├─ Client: http://localhost:5173 (Vite dev server)
├─ Server: http://localhost:3001 (Next.js dev)
└─ Python Parser: http://localhost:8000 (FastAPI)

Production Considerations:
├─ Client: Static hosting (Vercel/Netlify)
├─ Server: Serverless (Vercel) or Container (Docker)
├─ Python Parser: Container (Docker) + Cloud Run
└─ AI Service: IBM Cloud (managed)
```

### Recommended Production Architecture
```
┌─────────────────────────────────────────────────────────┐
│                    Load Balancer                         │
│                    (NGINX/CloudFlare)                    │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │ Next.js│  │ Next.js│  │ Next.js│
   │ Server │  │ Server │  │ Server │
   │ (Pod 1)│  │ (Pod 2)│  │ (Pod 3)│
   └────┬───┘  └────┬───┘  └────┬───┘
        │           │           │
        └───────────┼───────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
   ┌────────┐  ┌────────┐  ┌────────┐
   │ Redis  │  │ Python │  │Watsonx │
   │ Cache  │  │ Parser │  │   AI   │
   └────────┘  └────────┘  └────────┘
```

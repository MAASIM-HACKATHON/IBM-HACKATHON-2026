# AI Resume Builder & ATS Optimizer - Complete Guide

## Overview

The AI Resume Builder & ATS Optimizer is a comprehensive feature that helps job seekers create optimized resumes, analyze their compatibility with job descriptions, and generate professional application emails using IBM Watsonx AI.

## Features

### 1. **Resume Upload & Parsing**
- Upload resume files (PDF, DOCX, TXT)
- Automatic parsing of resume sections
- Extraction of skills, experience, education, and projects
- Support for LinkedIn PDF exports

### 2. **Job Description Analysis**
- Extract keywords and required skills from job postings
- Identify experience level requirements
- Detect technologies and qualifications
- Analyze company culture and industry

### 3. **AI-Powered Resume Generation**
- **ATS-Optimized Resume**: Simplified format optimized for Applicant Tracking Systems
- **Full CV**: Comprehensive resume with detailed sections
- Keyword optimization based on job description
- Skill prioritization for target roles

### 4. **ATS Scoring Engine** (Deterministic)
- Rule-based scoring without AI dependency
- Keyword matching analysis
- Skills gap identification
- Experience level classification
- Format compatibility check

### 5. **Application Email Generator**
- Generate professional application emails
- Multiple tones: Formal, Confident, Neutral, Enthusiastic
- Email types: Application, Follow-up, Thank You
- AI-powered personalization

### 6. **Resume Comparison**
- Side-by-side view of original vs. optimized resume
- Highlight improvements and changes
- Download and copy functionality

## Architecture

### Frontend Components

```
client/src/
├── pages/system-page/
│   └── ResumeBuilderPage.tsx          # Main page component
├── components/system-components/resume/
│   ├── FileUploadSection.tsx          # File upload UI
│   ├── JobDescriptionSection.tsx      # Job description input
│   ├── ActionHub.tsx                  # Action buttons
│   ├── ATSScoreCard.tsx              # ATS score display
│   ├── ResumePreview.tsx             # Resume comparison view
│   └── EmailGeneratorModal.tsx        # Email generation modal
├── hooks/
│   └── useResumeBuilder.ts            # State management hook
├── services/
│   ├── resumeService.ts               # Resume API calls
│   └── atsService.ts                  # ATS analysis API calls
└── types/
    └── resume.types.ts                # TypeScript definitions
```

### Backend API Routes

```
server/src/app/api/resume/
├── generate/route.ts                  # Resume generation
├── analyze-jd/route.ts               # Job description analysis
├── parse/route.ts                    # Resume file parsing
└── generate-email/route.ts           # Email generation
```

### Core Services

```
server/src/
├── lib/
│   └── ats-engine.ts                 # Deterministic ATS scoring
├── services/
│   └── aiService.ts                  # Watsonx AI integration
└── types/
    └── ats.types.ts                  # Shared type definitions
```

## User Workflow

### Step 1: Upload Resume
1. Click or drag-and-drop resume file (PDF, DOCX, or TXT)
2. System automatically parses the resume
3. Extracted data is displayed for review

### Step 2: Add Job Description
1. Paste the target job description
2. Click "Analyze Job Description"
3. System extracts keywords, skills, and requirements

### Step 3: Generate Resume
Choose one of two options:
- **Generate ATS-Optimized Resume**: Simplified, keyword-rich format
- **Generate Full CV**: Comprehensive, detailed format

### Step 4: Review ATS Score
- View overall match score (0-100%)
- See score breakdown by category
- Identify matching and missing skills
- Review recommendations

### Step 5: Generate Application Email (Optional)
1. Click "Generate Application Email"
2. Select email type and tone
3. Add additional context if needed
4. Copy or download the generated email

### Step 6: Download & Apply
- Download optimized resume
- Copy to clipboard
- Use generated email for application

## API Endpoints

### 1. Generate Resume
```http
POST /api/resume/generate
Content-Type: application/json

{
  "profileData": {
    "skills": ["React", "Node.js", "TypeScript"],
    "workExperience": [...],
    "projects": [...],
    "education": [...]
  },
  "jobDescription": "Job posting text...",
  "resumeType": "ats-optimized" | "full-cv",
  "targetRole": "Senior Software Engineer",
  "additionalInstructions": "Optional instructions..."
}
```

**Response:**
```json
{
  "generatedResume": "Resume content...",
  "format": "plain",
  "suggestions": [
    "Add quantifiable achievements",
    "Include relevant keywords"
  ],
  "weakSections": [],
  "timestamp": "2026-05-02T10:30:00.000Z"
}
```

### 2. Analyze Job Description
```http
POST /api/resume/analyze-jd
Content-Type: application/json

{
  "jobDescription": "Job posting text..."
}
```

**Response:**
```json
{
  "extractedKeywords": ["React", "Node.js", "AWS"],
  "requiredSkills": ["React", "JavaScript", "Node.js"],
  "preferredSkills": ["TypeScript", "Docker"],
  "technologies": ["React", "Node.js", "AWS"],
  "experienceLevel": "Mid",
  "responsibilities": [...],
  "qualifications": [...],
  "companyInfo": {
    "name": "Tech Company",
    "industry": "SaaS",
    "culture": "innovative, collaborative"
  }
}
```

### 3. Parse Resume File
```http
POST /api/resume/parse
Content-Type: multipart/form-data

file: [Resume file]
```

**Response:**
```json
{
  "rawText": "Resume text...",
  "parsedSections": {
    "personalInfo": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "(555) 123-4567",
      "linkedin": "linkedin.com/in/johndoe"
    },
    "skills": ["React", "Node.js", "TypeScript"],
    "workExperience": [...],
    "projects": [...],
    "education": [...],
    "certifications": [...]
  }
}
```

### 4. Run ATS Analysis
```http
POST /api/ats/analyze
Content-Type: application/json

{
  "resume": {
    "skills": ["React", "Node.js"],
    "workExperience": [...],
    "projects": [...],
    "education": [...]
  },
  "jobs": [
    {
      "job_title": "Frontend Developer",
      "required_skills": ["React", "JavaScript"],
      "preferred_skills": ["TypeScript"],
      "keywords": ["UI", "responsive"]
    }
  ]
}
```

**Response:**
```json
{
  "summary": "Mid-level professional with 8 detected skills...",
  "detected_skills": ["React", "Node.js", "TypeScript"],
  "experience_level": "Mid",
  "possible_roles": ["Frontend Developer", "Full-Stack Developer"],
  "job_matches": [
    {
      "job_title": "Frontend Developer",
      "match_score": 85,
      "matching_skills": ["React", "JavaScript"],
      "missing_skills": ["TypeScript"]
    }
  ],
  "recommendations": [
    "Consider learning: TypeScript, Next.js",
    "Add quantifiable achievements"
  ],
  "career_path_suggestion": "Consider specializing in...",
  "confidence_score": 0.85
}
```

### 5. Generate Application Email
```http
POST /api/resume/generate-email
Content-Type: application/json

{
  "resumeContent": "Resume text...",
  "jobDescription": "Job posting text...",
  "tone": "professional",
  "emailType": "application",
  "additionalContext": "Optional context..."
}
```

**Response:**
```json
{
  "subject": "Application for Senior Software Engineer Position",
  "body": "Dear Hiring Manager,\n\n...",
  "suggestions": [
    "Personalize with hiring manager's name",
    "Attach your resume"
  ]
}
```

## ATS Scoring Engine

The ATS Scoring Engine is a **deterministic, rule-based system** that works independently of AI services.

### Scoring Components

1. **Keyword Match (60% weight)**
   - Matches resume keywords with job description
   - Case-insensitive matching
   - Skill normalization (e.g., "ReactJS" → "React")

2. **Skills Match (30% weight)**
   - Required skills vs. candidate skills
   - Preferred skills bonus
   - Skill categorization (Frontend, Backend, DevOps, etc.)

3. **Experience Match (10% weight)**
   - Years of experience vs. job requirements
   - Experience level classification (Junior/Mid/Senior)

4. **Format Score**
   - ATS-friendly formatting check
   - Section structure validation
   - Readability assessment

### Skill Normalization

The engine normalizes skill variants:
- `ReactJS`, `React.js` → `React`
- `NodeJS`, `Node` → `Node.js`
- `MySQL DB` → `MySQL`

### Experience Classification

- **Junior**: 0-2 years
- **Mid**: 3-5 years
- **Senior**: 6+ years

## Integration with Watsonx AI

### Resume Generation

The system can integrate with IBM Watsonx AI for enhanced resume generation:

```typescript
// Example Watsonx prompt for resume generation
const prompt = `
Generate an ATS-optimized resume based on the following:

Profile Data:
${JSON.stringify(profileData)}

Target Job Description:
${jobDescription}

Requirements:
- Use simple, ATS-friendly formatting
- Prioritize keywords from job description
- Include quantifiable achievements
- Keep sections clear and organized
`;
```

### Email Generation

Watsonx AI can generate personalized application emails:

```typescript
const emailPrompt = `
Generate a ${tone} ${emailType} email for a job application.

Job Title: ${jobTitle}
Company: ${companyName}
Key Skills: ${keySkills.join(', ')}

Additional Context: ${additionalContext}

Requirements:
- Professional and engaging
- Highlight relevant experience
- Include call to action
`;
```

## Best Practices

### For Job Seekers

1. **Upload a Complete Resume**
   - Include all relevant experience
   - List technical and soft skills
   - Add quantifiable achievements

2. **Provide Detailed Job Description**
   - Copy the entire job posting
   - Include requirements and qualifications
   - Don't edit or summarize

3. **Review ATS Score**
   - Aim for 70%+ match score
   - Address missing skills if possible
   - Follow recommendations

4. **Customize for Each Application**
   - Generate new resume for each job
   - Tailor keywords to job description
   - Update email content

### For Developers

1. **Error Handling**
   - Implement fallback for AI failures
   - Validate file uploads
   - Handle parsing errors gracefully

2. **Performance**
   - Cache parsed resumes
   - Optimize file processing
   - Use streaming for large files

3. **Security**
   - Validate file types and sizes
   - Sanitize user input
   - Implement rate limiting

4. **Testing**
   - Test with various resume formats
   - Validate ATS scoring accuracy
   - Test email generation quality

## Troubleshooting

### Common Issues

**Issue: File upload fails**
- Check file size (max 10MB)
- Verify file type (PDF, DOCX, TXT only)
- Ensure file is not corrupted

**Issue: Low ATS score**
- Add more relevant keywords
- Include missing required skills
- Improve resume formatting

**Issue: Resume parsing incomplete**
- Use standard section headings
- Avoid complex formatting
- Ensure text is readable

**Issue: Email generation fails**
- Check API connectivity
- Verify input data completeness
- Review error logs

## Future Enhancements

1. **Advanced PDF Parsing**
   - Implement pdf-parse library
   - Extract formatting and layout
   - Handle multi-column resumes

2. **DOCX Support**
   - Integrate mammoth.js
   - Preserve formatting
   - Extract embedded images

3. **Resume Templates**
   - Multiple design templates
   - Customizable themes
   - Export to PDF with formatting

4. **Cover Letter Generation**
   - AI-powered cover letters
   - Template library
   - Customization options

5. **Interview Preparation**
   - Generate interview questions
   - Provide answer suggestions
   - Mock interview practice

6. **Job Matching**
   - Recommend suitable jobs
   - Track applications
   - Application status dashboard

## Testing

### Manual Testing

1. **Upload Test**
   ```bash
   # Test with sample resume
   curl -X POST http://localhost:3000/api/resume/parse \
     -F "file=@sample-resume.pdf"
   ```

2. **Generation Test**
   ```bash
   # Test resume generation
   curl -X POST http://localhost:3000/api/resume/generate \
     -H "Content-Type: application/json" \
     -d @test-data.json
   ```

3. **ATS Analysis Test**
   ```bash
   # Test ATS scoring
   curl -X POST http://localhost:3000/api/ats/analyze \
     -H "Content-Type: application/json" \
     -d @ats-test-data.json
   ```

### Automated Testing

Run the ATS engine tests:
```bash
cd server
npx tsx src/lib/ats-engine.test.ts
```

## Support

For issues or questions:
1. Check the documentation
2. Review error logs
3. Test with sample data
4. Contact development team

## License

Part of the IBM Hackathon 2026 project.

# ATS Scoring Engine

A comprehensive Applicant Tracking System (ATS) engine for analyzing candidate resumes against job roles. This engine can be used by both backend APIs and AI systems.

## Features

- **Skill Detection & Normalization**: Automatically detects and normalizes skills from resumes
- **Experience Classification**: Classifies candidates as Junior, Mid, or Senior level
- **Job Matching**: Matches candidates against multiple job roles with scoring (0-100)
- **Career Guidance**: Provides recommendations and career path suggestions
- **Flexible Input**: Accepts structured data or raw text resumes
- **Schema-Compliant Output**: Returns consistent, structured JSON output

## Installation

The engine is located at `server/src/lib/ats-engine.ts` and can be imported directly:

```typescript
import ATSEngine from '@/lib/ats-engine';
```

## Usage

### Basic Usage

```typescript
import ATSEngine from '@/lib/ats-engine';
import type { CandidateResume, JobRole } from '@/types/ats.types';

// Define candidate resume
const resume: CandidateResume = {
  skills: ['React', 'JavaScript', 'Node.js', 'MongoDB'],
  workExperience: [
    {
      title: 'Full-Stack Developer',
      company: 'Tech Corp',
      duration: '2 years',
      yearsOfExperience: 2,
      description: 'Built web applications using MERN stack',
      skills: ['React', 'Node.js', 'MongoDB'],
    },
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Built with React and Node.js',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      institution: 'Tech University',
      field: 'Computer Science',
      year: '2022',
    },
  ],
};

// Define job roles
const jobs: JobRole[] = [
  {
    job_title: 'Frontend Developer',
    required_skills: ['React', 'JavaScript', 'HTML', 'CSS'],
    preferred_skills: ['TypeScript', 'Next.js'],
    keywords: ['UI', 'responsive'],
  },
  {
    job_title: 'Full-Stack Developer',
    required_skills: ['React', 'Node.js', 'MongoDB'],
    preferred_skills: ['TypeScript', 'AWS'],
    keywords: ['MERN', 'API'],
  },
];

// Analyze
const result = ATSEngine.analyze(resume, jobs);
console.log(result);
```

### Using Raw Text Resume

```typescript
const resume: CandidateResume = {
  rawText: `
    John Doe
    Skills: React, JavaScript, Node.js, MongoDB, HTML, CSS
    
    Experience:
    Full-Stack Developer at Tech Corp (2021-2023)
    - Built web applications using MERN stack
    - Developed RESTful APIs
    
    Projects:
    - E-commerce Platform (React, Node.js, MongoDB)
    - Task Manager App (React, Express)
  `,
};

const result = ATSEngine.analyze(resume, jobs);
```

## API Endpoint

The engine is exposed via REST API at `/api/ats/analyze`:

### Request

```bash
POST /api/ats/analyze
Content-Type: application/json

{
  "resume": {
    "skills": ["React", "JavaScript", "Node.js"],
    "workExperience": [...],
    "projects": [...],
    "education": [...]
  },
  "jobs": [
    {
      "job_title": "Frontend Developer",
      "required_skills": ["React", "JavaScript"],
      "preferred_skills": ["TypeScript"],
      "keywords": ["UI", "web"]
    }
  ]
}
```

### Response

```json
{
  "summary": "Mid-level professional with 8 detected skills. Best suited for Full-Stack Developer roles.",
  "detected_skills": ["React", "JavaScript", "Node.js", "MongoDB", "HTML", "CSS", "Express", "Git"],
  "experience_level": "Mid",
  "possible_roles": ["Frontend Developer", "Backend Developer", "Full-Stack Developer"],
  "job_matches": [
    {
      "job_title": "Full-Stack Developer",
      "match_score": 85,
      "matching_skills": ["React", "Node.js", "MongoDB"],
      "missing_skills": ["TypeScript"]
    },
    {
      "job_title": "Frontend Developer",
      "match_score": 75,
      "matching_skills": ["React", "JavaScript", "HTML", "CSS"],
      "missing_skills": ["TypeScript", "Next.js"]
    }
  ],
  "recommendations": [
    "Consider learning: TypeScript, AWS, Docker",
    "Consider specializing in a specific domain or technology",
    "Take on leadership roles in projects"
  ],
  "career_path_suggestion": "As a Full-Stack Developer, consider specializing in advanced topics or transitioning into senior technical roles. Explore system design and architectural patterns.",
  "confidence_score": 0.85,
  "timestamp": "2026-05-02T10:30:00.000Z",
  "processingTime": 45
}
```

## Client-Side Usage

Use the provided service in your React application:

```typescript
import { analyzeResume, getSampleJobs } from '@/services/atsService';

// In your component
const handleAnalyze = async () => {
  try {
    const result = await analyzeResume(resume, jobs);
    console.log(result);
  } catch (error) {
    console.error('Analysis failed:', error);
  }
};
```

## Core Components

### 1. Skill Normalization

Normalizes skill variants into canonical forms:
- `ReactJS`, `React.js` → `React`
- `NodeJS`, `Node` → `Node.js`
- `MySQL DB` → `MySQL`

### 2. Experience Classification

Classifies candidates based on years of experience:
- **Junior**: 0-2 years
- **Mid**: 3-5 years
- **Senior**: 6+ years

### 3. Job Matching Algorithm

Calculates match scores using weighted scoring:
- **Required Skills**: 60% weight
- **Preferred Skills**: 30% weight
- **Keywords**: 10% weight

### 4. Skill Categories

Groups skills into categories:
- **Frontend**: React, Vue, Angular, HTML, CSS, JavaScript, TypeScript
- **Backend**: Node.js, Python, Java, Express, Django, Spring
- **Database**: MySQL, PostgreSQL, MongoDB, Redis
- **DevOps**: Docker, Kubernetes, AWS, Azure, CI/CD
- **AI/ML**: Machine Learning, TensorFlow, PyTorch, NLP

## Output Schema

```typescript
interface ATSResult {
  summary: string;                          // Brief candidate overview
  detected_skills: string[];                // Normalized skills
  experience_level: 'Junior' | 'Mid' | 'Senior';
  possible_roles: string[];                 // Suggested roles
  job_matches: JobMatch[];                  // Scored job matches
  recommendations: string[];                // Improvement suggestions
  career_path_suggestion: string;           // Career guidance
  confidence_score: number;                 // 0-1 confidence
}
```

## Examples

See `ats-engine.example.ts` for comprehensive examples:

1. **Junior Frontend Developer**: Entry-level candidate with basic skills
2. **Senior Full-Stack Developer**: Experienced professional with diverse skills
3. **Career Changer**: Raw text resume parsing
4. **ML Engineer**: Specialized AI/ML role matching

Run examples:
```bash
npx tsx server/src/lib/ats-engine.example.ts
```

## Extending the Engine

### Adding New Skills

Edit the `SKILL_NORMALIZATION_MAP` in `ats-engine.ts`:

```typescript
const SKILL_NORMALIZATION_MAP: Record<string, string> = {
  'your-skill-variant': 'Canonical Name',
  // ...
};
```

### Adding New Skill Categories

Edit the `SKILL_CATEGORIES` object:

```typescript
const SKILL_CATEGORIES: Record<string, string[]> = {
  'Your Category': ['Skill1', 'Skill2', 'Skill3'],
  // ...
};
```

### Customizing Scoring Weights

Modify the weights in `calculateMatchScore()`:

```typescript
const requiredWeight = 0.6;   // 60%
const preferredWeight = 0.3;  // 30%
const keywordWeight = 0.1;    // 10%
```

## Best Practices

1. **Provide Structured Data**: While raw text works, structured data yields better results
2. **Include Years of Experience**: Helps with accurate experience level classification
3. **Use Detailed Job Descriptions**: More keywords and skills improve matching accuracy
4. **Normalize Input**: Pre-normalize skills when possible for consistency
5. **Handle Missing Data**: The engine gracefully handles missing fields with fallbacks

## Integration with AI Systems

The engine can be used by AI systems for:
- Resume screening automation
- Candidate ranking
- Job recommendation systems
- Career counseling chatbots
- Skill gap analysis

Simply import and call `ATSEngine.analyze()` with the appropriate data.

## Testing

Test the API endpoint:

```bash
curl -X POST http://localhost:3000/api/ats/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resume": {
      "skills": ["React", "JavaScript", "Node.js"],
      "workExperience": [{
        "title": "Developer",
        "company": "Tech Corp",
        "duration": "2 years",
        "yearsOfExperience": 2
      }]
    },
    "jobs": [{
      "job_title": "Frontend Developer",
      "required_skills": ["React", "JavaScript"]
    }]
  }'
```

## License

Part of the BOB-compliant ATS system.

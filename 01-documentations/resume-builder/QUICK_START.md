# AI Resume Builder & ATS Optimizer - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- Client and server running
- Basic understanding of React and Next.js

### Step 1: Start the Application

```bash
# Terminal 1 - Start the server
cd server
npm install
npm run dev

# Terminal 2 - Start the client
cd client
npm install
npm run dev
```

### Step 2: Access the Resume Builder

1. Open your browser to `http://localhost:5173` (or your client port)
2. Navigate to the Resume Builder page
3. You should see the upload interface

### Step 3: Test the Features

#### Upload a Resume
1. Click the upload area or drag a file
2. Supported formats: PDF, DOCX, TXT
3. Max size: 10MB

#### Analyze a Job Description
1. Paste a job posting in the text area
2. Click "Analyze Job Description"
3. View extracted keywords and requirements

#### Generate Optimized Resume
1. Click "Generate ATS-Optimized Resume"
2. Wait for processing
3. View the optimized version

#### Check ATS Score
1. Click "Run ATS Analysis"
2. View your match score (0-100%)
3. See matching and missing skills

#### Generate Application Email
1. Click "Generate Application Email"
2. Select tone and email type
3. Copy the generated email

## 📁 Project Structure

```
├── client/src/
│   ├── pages/system-page/
│   │   └── ResumeBuilderPage.tsx          # Main page
│   ├── components/system-components/resume/
│   │   ├── FileUploadSection.tsx          # Upload UI
│   │   ├── JobDescriptionSection.tsx      # Job input
│   │   ├── ActionHub.tsx                  # Actions
│   │   ├── ATSScoreCard.tsx              # Score display
│   │   ├── ResumePreview.tsx             # Preview
│   │   └── EmailGeneratorModal.tsx        # Email modal
│   ├── hooks/
│   │   └── useResumeBuilder.ts            # State hook
│   ├── services/
│   │   ├── resumeService.ts               # Resume API
│   │   └── atsService.ts                  # ATS API
│   └── types/
│       └── resume.types.ts                # Types
│
└── server/src/
    ├── app/api/resume/
    │   ├── generate/route.ts              # Generate resume
    │   ├── analyze-jd/route.ts           # Analyze JD
    │   ├── parse/route.ts                # Parse file
    │   └── generate-email/route.ts       # Generate email
    ├── lib/
    │   └── ats-engine.ts                 # ATS scoring
    └── types/
        └── ats.types.ts                  # Shared types
```

## 🧪 Quick Test

### Test Resume Generation

```bash
curl -X POST http://localhost:3000/api/resume/generate \
  -H "Content-Type: application/json" \
  -d '{
    "profileData": {
      "skills": ["React", "Node.js", "TypeScript"],
      "workExperience": [{
        "title": "Software Engineer",
        "company": "Tech Corp",
        "duration": "2 years",
        "yearsOfExperience": 2
      }],
      "education": [{
        "degree": "BS Computer Science",
        "institution": "University",
        "year": "2022"
      }]
    },
    "jobDescription": "Looking for a React developer with Node.js experience",
    "resumeType": "ats-optimized"
  }'
```

### Test Job Description Analysis

```bash
curl -X POST http://localhost:3000/api/resume/analyze-jd \
  -H "Content-Type: application/json" \
  -d '{
    "jobDescription": "Senior Software Engineer position requiring React, Node.js, and AWS experience. 5+ years required."
  }'
```

### Test ATS Analysis

```bash
curl -X POST http://localhost:3000/api/ats/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "resume": {
      "skills": ["React", "Node.js", "TypeScript"],
      "workExperience": [{
        "title": "Developer",
        "company": "Tech Corp",
        "duration": "2 years",
        "yearsOfExperience": 2
      }]
    },
    "jobs": [{
      "job_title": "Frontend Developer",
      "required_skills": ["React", "JavaScript"],
      "preferred_skills": ["TypeScript"]
    }]
  }'
```

## 🎯 Key Features

### 1. File Upload & Parsing
- ✅ Drag-and-drop interface
- ✅ PDF, DOCX, TXT support
- ✅ Automatic section extraction
- ✅ Skill detection

### 2. Job Description Analysis
- ✅ Keyword extraction
- ✅ Required vs. preferred skills
- ✅ Experience level detection
- ✅ Technology identification

### 3. Resume Generation
- ✅ ATS-optimized format
- ✅ Full CV format
- ✅ Keyword optimization
- ✅ Skill prioritization

### 4. ATS Scoring (Deterministic)
- ✅ Rule-based scoring
- ✅ No AI dependency
- ✅ Keyword matching
- ✅ Skills gap analysis

### 5. Email Generation
- ✅ Multiple tones
- ✅ Multiple types
- ✅ AI-powered
- ✅ Customizable

## 🔧 Configuration

### Environment Variables

Create `.env` files:

**Server (.env)**
```env
# IBM Watsonx AI (Optional)
IBM_API_KEY=your_api_key
IBM_CLOUD_URL=your_cloud_url
IBM_PROJECT_ID=your_project_id

# Database (Optional)
DATABASE_URL=your_database_url
```

**Client (.env)**
```env
VITE_API_URL=http://localhost:3000
```

## 📊 Sample Data

### Sample Resume Data
```json
{
  "skills": ["React", "Node.js", "TypeScript", "AWS", "MongoDB"],
  "workExperience": [
    {
      "title": "Senior Software Engineer",
      "company": "Tech Company",
      "duration": "3 years",
      "yearsOfExperience": 3,
      "description": "Led development of microservices",
      "skills": ["React", "Node.js", "AWS"]
    }
  ],
  "projects": [
    {
      "name": "E-Commerce Platform",
      "description": "Built scalable e-commerce solution",
      "technologies": ["React", "Node.js", "MongoDB"]
    }
  ],
  "education": [
    {
      "degree": "Bachelor of Science",
      "institution": "University of Technology",
      "year": "2020",
      "field": "Computer Science"
    }
  ],
  "certifications": [
    "AWS Certified Solutions Architect",
    "MongoDB Certified Developer"
  ]
}
```

### Sample Job Description
```
Senior Software Engineer

Tech Company is looking for an experienced Senior Software Engineer to join our team.

Requirements:
- 5+ years of software development experience
- Strong proficiency in React and Node.js
- Experience with AWS cloud services
- Knowledge of MongoDB or similar NoSQL databases
- Excellent problem-solving skills

Preferred:
- TypeScript experience
- Docker and Kubernetes knowledge
- CI/CD pipeline experience

Responsibilities:
- Design and develop scalable web applications
- Lead technical discussions and code reviews
- Mentor junior developers
- Collaborate with product and design teams
```

## 🐛 Troubleshooting

### Issue: Port Already in Use
```bash
# Kill process on port 3000
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

### Issue: Module Not Found
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Issue: CORS Error
- Check API_URL in client .env
- Ensure server is running
- Verify CORS middleware in server

### Issue: File Upload Fails
- Check file size (max 10MB)
- Verify file type (PDF, DOCX, TXT)
- Check server logs for errors

## 📚 Next Steps

1. **Customize the UI**
   - Modify component styles
   - Add your branding
   - Adjust color scheme

2. **Enhance Parsing**
   - Integrate pdf-parse library
   - Add DOCX support with mammoth
   - Improve text extraction

3. **Add AI Integration**
   - Connect to Watsonx AI
   - Implement prompt templates
   - Add AI-powered suggestions

4. **Implement Storage**
   - Save resume history
   - Store generated resumes
   - Track applications

5. **Add Authentication**
   - User accounts
   - Resume library
   - Application tracking

## 🎓 Learning Resources

- [ATS Engine Documentation](./ATS_ENGINE.md)
- [Resume Builder Guide](./RESUME_BUILDER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Component Documentation](./COMPONENTS.md)

## 💡 Tips

1. **For Best Results**
   - Use complete, well-formatted resumes
   - Provide full job descriptions
   - Review and customize generated content

2. **Performance**
   - Cache parsed resumes
   - Optimize large file handling
   - Use lazy loading for components

3. **User Experience**
   - Show loading states
   - Provide clear error messages
   - Add helpful tooltips

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

- Documentation: Check the docs folder
- Issues: Create a GitHub issue
- Questions: Contact the development team

## ✅ Checklist

- [ ] Server running on port 3000
- [ ] Client running on port 5173
- [ ] Can upload resume files
- [ ] Can analyze job descriptions
- [ ] Can generate optimized resumes
- [ ] Can run ATS analysis
- [ ] Can generate application emails
- [ ] All API endpoints working

## 🎉 You're Ready!

Your AI Resume Builder & ATS Optimizer is now set up and ready to use!

Start by uploading a resume and exploring the features.

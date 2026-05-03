# 🚀 Quick Start Guide - AI Features

Get started with the AI features in 5 minutes!

## 📋 What You'll Learn

- How to use the Email Generator
- How to analyze resumes with ATS
- How to customize AI features
- Common troubleshooting tips

---

## ⚡ Quick Setup

### 1. Make Sure Everything is Running

```bash
# Terminal 1: Start the client (React app)
cd client
npm run dev

# Terminal 2: Start the server (Next.js backend)
cd server
npm run dev

# Terminal 3: Start the Python parser (PDF processing)
cd server/python-parser
python -m uvicorn app.main:app --reload
```

**Check if it's working:**
- Client: http://localhost:5173
- Server: http://localhost:3000
- Python Parser: http://localhost:8000

---

## 📧 Using the Email Generator

### Step 1: Navigate to Email Generator

Open your browser and go to the email generation page in your app.

### Step 2: Fill in the Form

**Minimum Required:**
- **Your Message:** What you want to say (at least 10 characters)

**Optional but Recommended:**
- **Purpose:** Job Application, Follow-up, Thank You, etc.
- **Tone:** Formal, Professional, Friendly, Enthusiastic
- **Context:** Job description or previous email
- **Recipient:** Company name or person's name

### Step 3: Generate!

Click "Generate Email" and wait 2-5 seconds.

### Example

**Input:**
```
Purpose: Job Application
Tone: Professional
Context: Software Engineer position at IBM, requires React and Node.js
Your Message: i want to apply, i have 2 years experience with react and nodejs
Recipient: IBM Hiring Team
```

**Output:**
```
SUBJECT: Application for Software Engineer Position at IBM

BODY:
Dear IBM Hiring Team,

I am writing to express my strong interest in the Software Engineer 
position at IBM. With two years of hands-on experience in React and 
Node.js development, I am confident in my ability to contribute 
effectively to your team.

Throughout my career, I have developed robust web applications using 
React for frontend development and Node.js for backend services. My 
experience aligns well with the technical requirements outlined in 
your job posting.

I would welcome the opportunity to discuss how my skills and experience 
can benefit IBM. Thank you for considering my application.

Best regards
```

---

## 🎯 Using the ATS Resume Analyzer

### Step 1: Prepare Your Resume

- Save your resume as a PDF
- Make sure it includes:
  - Your skills
  - Work experience
  - Projects
  - Education

### Step 2: Upload Resume

1. Click "Upload Resume" button
2. Select your PDF file
3. Wait for parsing (5-10 seconds)

### Step 3: Add Job Descriptions

1. Click "Add Job"
2. Enter job title (e.g., "Software Engineer")
3. Add required skills (e.g., JavaScript, React, Node.js)
4. Add preferred skills (optional)
5. Click "Save"

### Step 4: Analyze

Click "Analyze" and get your results:
- **Match Score:** 0-100% for each job
- **Matching Skills:** Skills you have
- **Missing Skills:** Skills you need
- **Recommendations:** How to improve

### Example

**Your Resume:**
- Skills: JavaScript, React, Node.js, MongoDB
- Experience: 3 years

**Job Requirements:**
- Required: JavaScript, React, Node.js, PostgreSQL
- Preferred: TypeScript, Docker

**Results:**
```
Match Score: 75%

Matching Skills:
✅ JavaScript
✅ React
✅ Node.js

Missing Skills:
❌ PostgreSQL (required)
❌ TypeScript (preferred)
❌ Docker (preferred)

Recommendations:
- Learn PostgreSQL to meet all required skills
- Consider learning TypeScript and Docker for bonus points
```

---

## 🛠️ Quick Customization

### Change Email Tone

Edit `client/src/config/watsonx.ts`:

```typescript
export const EMAIL_TONE_OPTIONS = [
  // Add your custom tone
  {
    value: 'humorous',
    label: 'Humorous',
    description: 'Light and fun while staying professional'
  }
];
```

Then add instructions in `client/src/utilities/system-utils/emailGenerator.ts`:

```typescript
const TONE_INSTRUCTIONS = {
  humorous: 'light-hearted, fun, and engaging while maintaining professionalism'
};
```

### Add New Skills to ATS

Edit `server/src/lib/ats-engine.ts`:

```typescript
const languages = [
  'javascript', 'typescript', 'python', 'java',
  'rust', 'go'  // Add new languages
];
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "Email generation failed"

**Possible Causes:**
- Backend server not running
- Invalid API endpoint
- Network error

**Solutions:**
1. Check if server is running: `http://localhost:3000`
2. Check browser console for errors (F12)
3. Restart the server

### Issue 2: "PDF parsing failed"

**Possible Causes:**
- Python parser not running
- Corrupted PDF file
- PDF is password-protected

**Solutions:**
1. Check if Python parser is running: `http://localhost:8000`
2. Try a different PDF file
3. Make sure PDF is not password-protected

### Issue 3: "Low match scores"

**Possible Causes:**
- Resume doesn't have enough skills
- Skills are named differently (e.g., "ReactJS" vs "React")
- Missing key experience

**Solutions:**
1. Add more skills to your resume
2. Use standard skill names
3. Include more projects and experience

### Issue 4: "AI response is weird"

**Possible Causes:**
- Prompt is unclear
- Input is too short
- AI model issue

**Solutions:**
1. Provide more context
2. Write longer, clearer messages
3. Try regenerating

---

## 💡 Pro Tips

### For Better Email Generation

1. **Be Specific:** Instead of "I want a job", write "I want to apply for the Senior Software Engineer position"
2. **Add Context:** Paste the job description in the context field
3. **Use Proper Names:** Include company name and recipient name
4. **Try Different Tones:** Experiment to find what works best

### For Better ATS Scores

1. **Use Keywords:** Include exact skill names from job description
2. **Quantify Experience:** "5 years" instead of "several years"
3. **List Technologies:** Be specific (React, not "frontend framework")
4. **Include Projects:** Show practical application of skills

### For Development

1. **Check Logs:** Look at browser console and server logs
2. **Test Prompts:** Try different prompt variations
3. **Monitor API Usage:** Keep track of AI API calls
4. **Cache Results:** Save generated content to avoid regenerating

---

## 📚 Next Steps

Now that you know the basics:

1. **Read the detailed guides:**
   - [Email Generation Guide](./EMAIL_GENERATION_GUIDE.md)
   - [ATS Analyzer Guide](./ATS_ANALYZER_GUIDE.md)
   - [Code Examples](./CODE_EXAMPLES.md)

2. **Experiment:**
   - Try different email purposes and tones
   - Test with various resumes and jobs
   - Customize the AI prompts

3. **Build Your Own Features:**
   - LinkedIn message generator
   - Cover letter writer
   - Interview question generator

---

## 🆘 Need Help?

- **Documentation:** Check the other guides in this folder
- **Code:** Look at the code examples
- **Issues:** Check the troubleshooting section
- **Community:** Ask in your team chat or forums

---

## ✅ Checklist

Before you start using the AI features:

- [ ] All services are running (client, server, Python parser)
- [ ] You can access the web interface
- [ ] You've read this quick start guide
- [ ] You understand the basic workflow
- [ ] You know where to find help

**You're ready to go! 🎉**

Start with the Email Generator - it's the easiest feature to try!
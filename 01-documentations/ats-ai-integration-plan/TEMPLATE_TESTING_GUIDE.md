# Multi-Template System - Testing Guide

**Date:** May 3, 2026  
**Purpose:** Quick testing guide for the multi-template resume system

---

## Quick Start Testing

### 1. Start the Application

```bash
# Terminal 1 - Start Server
cd server
npm run dev

# Terminal 2 - Start Client
cd client
npm run dev
```

### 2. Access the Application

Open browser: `http://localhost:3000/resume-builder`

---

## Test Scenarios

### Scenario 1: Basic Template Selection

**Steps:**
1. Upload a resume (PDF, DOCX, or TXT)
2. Wait for parsing to complete
3. Add a job description
4. Click "Analyze Job Description"
5. Scroll to Action Hub
6. **Verify:** Template selector shows "Minimal ATS-Friendly" by default
7. Change to "Professional Modern"
8. **Verify:** Description updates to show "Two-column layout..."

**Expected Result:**
- ✅ Template selector is visible
- ✅ Default is "Minimal ATS-Friendly"
- ✅ Can switch between templates
- ✅ Description text updates

---

### Scenario 2: Generate Resume with Minimal Template

**Steps:**
1. Complete Scenario 1
2. Select "Minimal ATS-Friendly" template
3. Click "Generate ATS-Optimized Resume"
4. Wait for generation
5. **Verify:** PDF preview appears
6. **Verify:** Resume has single-column layout
7. **Verify:** Black text on white background
8. **Verify:** All sections present (name, skills, experience, etc.)

**Expected Result:**
- ✅ PDF generates successfully
- ✅ Single-column layout
- ✅ Plain styling
- ✅ All content visible

---

### Scenario 3: Generate Resume with Professional Template

**Steps:**
1. Complete Scenario 1
2. Select "Professional Modern" template
3. Click "Generate ATS-Optimized Resume"
4. Wait for generation
5. **Verify:** PDF preview appears
6. **Verify:** Resume has two-column layout
7. **Verify:** Blue color accents
8. **Verify:** Skills in right sidebar
9. **Verify:** Experience in left main column

**Expected Result:**
- ✅ PDF generates successfully
- ✅ Two-column layout
- ✅ Professional styling
- ✅ Proper content distribution

---

### Scenario 4: Switch Templates After Generation

**Steps:**
1. Generate resume with Minimal template
2. Change template selector to Professional
3. Click "Generate ATS-Optimized Resume" again
4. **Verify:** New PDF uses Professional template
5. Change back to Minimal
6. Generate again
7. **Verify:** PDF switches back to Minimal template

**Expected Result:**
- ✅ Template changes apply to new generations
- ✅ No errors when switching
- ✅ Previous PDFs remain unchanged

---

### Scenario 5: Download PDFs

**Steps:**
1. Generate resume with Minimal template
2. Click "Download Optimized PDF"
3. **Verify:** File downloads
4. Open downloaded PDF
5. **Verify:** Content matches preview
6. Change to Professional template
7. Generate and download
8. **Verify:** New download uses Professional template

**Expected Result:**
- ✅ Downloads work for both templates
- ✅ Downloaded PDFs match previews
- ✅ Filenames are descriptive

---

## Visual Verification Checklist

### Minimal ATS Template
- [ ] Single column layout
- [ ] Black text (#000000)
- [ ] White background
- [ ] Arial/Helvetica font
- [ ] Standard section headers (UPPERCASE)
- [ ] Bullet points for achievements
- [ ] Contact info in header
- [ ] Skills listed horizontally
- [ ] Linear reading order

### Professional Modern Template
- [ ] Two-column layout (70/30 split)
- [ ] Blue headers (#1e40af)
- [ ] Blue accents (#3b82f6)
- [ ] Segoe UI font
- [ ] Left column: Summary, Experience, Projects
- [ ] Right column: Skills, Education, Certifications
- [ ] Skill badges with background color
- [ ] Professional spacing
- [ ] Clean, modern appearance

---

## API Testing

### Test API Endpoint Directly

```bash
# Test Minimal Template
curl -X POST http://localhost:3000/api/resume/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "resumeData": {
      "parsedSections": {
        "personalInfo": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "skills": ["JavaScript", "React", "Node.js"],
        "workExperience": [],
        "education": [],
        "projects": [],
        "certifications": []
      }
    },
    "templateId": "minimal"
  }'

# Test Professional Template
curl -X POST http://localhost:3000/api/resume/generate-pdf \
  -H "Content-Type: application/json" \
  -d '{
    "resumeData": {
      "parsedSections": {
        "personalInfo": {
          "name": "John Doe",
          "email": "john@example.com"
        },
        "skills": ["JavaScript", "React", "Node.js"],
        "workExperience": [],
        "education": [],
        "projects": [],
        "certifications": []
      }
    },
    "templateId": "professional"
  }'
```

**Expected Response:**
- Status: 200 OK
- Content-Type: text/html
- Body: HTML content with template applied

---

## Browser Console Testing

### Check for Errors

Open browser console (F12) and verify:
- [ ] No JavaScript errors
- [ ] No network errors
- [ ] API calls succeed (200 status)
- [ ] Template selection logs (if debugging enabled)

### Network Tab

Check API calls:
- [ ] POST to `/api/resume/generate-pdf`
- [ ] Request includes `templateId`
- [ ] Response is HTML
- [ ] Response time < 500ms

---

## Edge Cases to Test

### 1. Missing Data
- [ ] Resume with no skills
- [ ] Resume with no work experience
- [ ] Resume with minimal personal info
- [ ] Empty sections handled gracefully

### 2. Large Data
- [ ] Resume with 10+ skills
- [ ] Resume with 5+ work experiences
- [ ] Resume with long descriptions
- [ ] Content doesn't overflow

### 3. Special Characters
- [ ] Names with accents (José, François)
- [ ] Emails with special chars
- [ ] Skills with symbols (C++, C#)
- [ ] Proper encoding maintained

### 4. Template Switching
- [ ] Switch before generation
- [ ] Switch after generation
- [ ] Multiple switches in session
- [ ] State persists correctly

---

## Performance Testing

### Metrics to Check

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Template Selection | < 100ms | Browser DevTools |
| API Response | < 500ms | Network tab |
| PDF Generation | < 2s | Time from click to preview |
| Download | < 1s | Time to file save |

### Load Testing (Optional)

```bash
# Generate 10 PDFs rapidly
for i in {1..10}; do
  curl -X POST http://localhost:3000/api/resume/generate-pdf \
    -H "Content-Type: application/json" \
    -d @test-resume.json &
done
wait
```

---

## Validation Testing

### Content Validation

For each template, verify:
- [ ] Name appears in header
- [ ] Email is present
- [ ] Phone number is present
- [ ] All skills are listed
- [ ] Work experience titles visible
- [ ] Company names visible
- [ ] Education degrees visible
- [ ] Certifications listed

### ATS Compatibility

- [ ] Text is selectable (not images)
- [ ] Copy-paste works correctly
- [ ] Reading order is logical
- [ ] No overlapping text
- [ ] Standard fonts used
- [ ] No complex tables

---

## Troubleshooting

### Template Not Changing

**Symptoms:** PDF looks the same after switching templates

**Solutions:**
1. Check browser console for errors
2. Verify API request includes `templateId`
3. Clear browser cache
4. Regenerate resume after switching

### PDF Not Generating

**Symptoms:** Spinner keeps spinning, no PDF appears

**Solutions:**
1. Check server logs for errors
2. Verify API endpoint is running
3. Check network tab for failed requests
4. Verify resume data is valid

### Styling Issues

**Symptoms:** PDF looks broken or unstyled

**Solutions:**
1. Check HTML response in network tab
2. Verify CSS is included in HTML
3. Check for CSS syntax errors
4. Test in different browser

---

## Automated Testing (Future)

### Unit Tests

```typescript
describe('Template System', () => {
  it('generates minimal template', () => {
    const html = generateMinimalATSTemplate(mockData);
    expect(html).toContain(mockData.personalInfo.name);
    expect(html).toContain('<!DOCTYPE html>');
  });
  
  it('generates professional template', () => {
    const html = generateProfessionalTemplate(mockData);
    expect(html).toContain('class="container"');
    expect(html).toContain('grid-template-columns');
  });
});
```

### Integration Tests

```typescript
describe('PDF Generation API', () => {
  it('accepts templateId parameter', async () => {
    const response = await fetch('/api/resume/generate-pdf', {
      method: 'POST',
      body: JSON.stringify({
        resumeData: mockData,
        templateId: 'professional'
      })
    });
    expect(response.status).toBe(200);
  });
});
```

---

## Test Data

### Sample Resume Data

```json
{
  "parsedSections": {
    "personalInfo": {
      "name": "Jane Smith",
      "email": "jane.smith@example.com",
      "phone": "+1 (555) 123-4567",
      "location": "San Francisco, CA",
      "linkedin": "linkedin.com/in/janesmith"
    },
    "summary": "Experienced software engineer with 5+ years in full-stack development.",
    "skills": [
      "JavaScript", "TypeScript", "React", "Node.js", 
      "Python", "AWS", "Docker", "PostgreSQL"
    ],
    "workExperience": [
      {
        "title": "Senior Software Engineer",
        "company": "Tech Corp",
        "duration": "2021 - Present",
        "achievements": [
          "Led development of microservices architecture",
          "Improved system performance by 40%"
        ]
      }
    ],
    "education": [
      {
        "degree": "Bachelor of Science in Computer Science",
        "institution": "University of California",
        "year": "2018"
      }
    ],
    "certifications": [
      "AWS Certified Solutions Architect",
      "Google Cloud Professional"
    ]
  }
}
```

---

## Success Criteria

### ✅ All Tests Pass
- [ ] All scenarios complete successfully
- [ ] No console errors
- [ ] Both templates work correctly
- [ ] Downloads work for both templates
- [ ] Content validation passes
- [ ] Performance meets targets

### ✅ Ready for Demo
- [ ] Smooth user experience
- [ ] Fast generation times
- [ ] Professional appearance
- [ ] No bugs or glitches

---

## Reporting Issues

### Issue Template

```markdown
**Template:** Minimal / Professional
**Browser:** Chrome / Firefox / Safari
**Steps to Reproduce:**
1. 
2. 
3. 

**Expected Behavior:**

**Actual Behavior:**

**Screenshots:**

**Console Errors:**
```

---

**Document Status:** ✅ Complete  
**Last Updated:** May 3, 2026

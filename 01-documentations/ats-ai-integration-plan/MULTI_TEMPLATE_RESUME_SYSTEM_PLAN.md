# Multi-Template Resume System - MVP Plan

**Version:** 1.0.0 (Simplified for Hackathon)  
**Date:** May 2, 2026  
**Goal:** Working demo with 2 templates, fast implementation

---

## Overview

Simple multi-template system for generating ATS-compatible resumes. Focus on **working demo** over perfect architecture.

**Core Flow:**
```
Resume JSON → Template Function → HTML → PDF → Download
```

**2 Templates:**
1. **Minimal ATS** - Single column, plain text, 100% ATS-safe
2. **Professional** - Clean 2-column, 90%+ ATS-safe

---

## 1. System Architecture (Simplified)

### Current System
- Resume parsing: Watsonx AI → Structured JSON ✅
- PDF generation: HTML template → PDF ✅
- ATS scoring: Rule-based engine ✅

### What We're Adding
- Template selector (user picks Minimal or Professional)
- Second template function (Professional layout)
- Basic validation (text extraction check)

### What We're NOT Adding
- Template registry/metadata system
- Complex validation layers
- Caching/monitoring
- Extensibility framework
- Advanced customization

---

## 2. Template Design

### Template 1: Minimal ATS (Current)

**File:** [`server/src/templates/resume-pdf.template.ts`](server/src/templates/resume-pdf.template.ts:1)

**Keep as-is, just rename:**
- Function: `generateMinimalATSTemplate()`
- Layout: Single column
- Style: Plain, black text, system fonts
- ATS Score: 100%

**Key Features:**
- No colors, no decorations
- Linear top-to-bottom flow
- Standard section headers
- System fonts only

### Template 2: Professional Modern (New)

**File:** `server/src/templates/professional-modern.template.ts`

**Create new function:**
- Function: `generateProfessionalTemplate()`
- Layout: 2-column (70% main, 30% sidebar)
- Style: Clean, professional blue accents
- ATS Score: 90%+

**Key Features:**
- Left: Experience, Projects, Summary
- Right: Skills, Education, Certifications
- Professional color scheme (blues/grays)
- Modern fonts (Segoe UI, fallback to system)
- Careful reading order (left-to-right, top-to-bottom)

**ATS-Safe Rules:**
- No images
- Selectable text only
- No complex tables
- Linear reading order preserved
- Standard section headers

---

## 3. Implementation Plan

### Step 1: Create Professional Template (1-2 hours)

**File:** `server/src/templates/professional-modern.template.ts`

```typescript
interface ResumeData {
  personalInfo: { name, email, phone, location, linkedin };
  summary: string;
  skills: string[];
  workExperience: Array<{ title, company, duration, achievements }>;
  projects: Array<{ name, description, technologies }>;
  education: Array<{ degree, institution, year }>;
  certifications: string[];
}

export function generateProfessionalTemplate(data: ResumeData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        /* 2-column CSS Grid layout */
        /* Professional color scheme */
        /* Clean typography */
      </style>
    </head>
    <body>
      <div class="container">
        <main class="main-column">
          <!-- Header, Summary, Experience, Projects -->
        </main>
        <aside class="sidebar">
          <!-- Skills, Education, Certifications -->
        </aside>
      </div>
    </body>
    </html>
  `;
}
```

### Step 2: Add Template Selector (30 min)

**File:** `server/src/app/api/resume/generate-pdf/route.ts`

```typescript
export async function POST(request: Request) {
  const { resumeData, templateId } = await request.json();
  
  // Simple switch
  let html;
  if (templateId === 'professional') {
    html = generateProfessionalTemplate(resumeData);
  } else {
    html = generateMinimalATSTemplate(resumeData); // default
  }
  
  // Generate PDF (existing logic)
  const pdf = await generatePDF(html);
  return new Response(pdf);
}
```

### Step 3: Update Frontend (30 min)

**File:** `client/src/components/system-components/resume/ActionHub.tsx`

Add template selector dropdown:
```typescript
<select onChange={(e) => setTemplateId(e.target.value)}>
  <option value="minimal">Minimal ATS-Friendly</option>
  <option value="professional">Professional Modern</option>
</select>
```

### Step 4: Basic Validation (30 min)

**File:** `server/src/templates/validator.ts`

```typescript
export function validatePDF(pdfBuffer: Buffer, sourceData: ResumeData): boolean {
  // Extract text with PyMuPDF
  const extractedText = extractTextFromPDF(pdfBuffer);
  
  // Check key fields present
  const hasName = extractedText.includes(sourceData.personalInfo.name);
  const hasEmail = extractedText.includes(sourceData.personalInfo.email);
  const hasSkills = sourceData.skills.every(s => extractedText.includes(s));
  
  return hasName && hasEmail && hasSkills;
}
```

---

## 4. Template Specifications

### Minimal ATS Template

**Layout:**
```
┌─────────────────────────┐
│ NAME                    │
│ email | phone | location│
├─────────────────────────┤
│ PROFESSIONAL SUMMARY    │
│ ...                     │
├─────────────────────────┤
│ TECHNICAL SKILLS        │
│ • Skill 1  • Skill 2    │
├─────────────────────────┤
│ PROFESSIONAL EXPERIENCE │
│ Title @ Company         │
│ • Achievement 1         │
├─────────────────────────┤
│ EDUCATION               │
│ Degree - Institution    │
└─────────────────────────┘
```

**CSS Rules:**
- Font: Arial, Helvetica, sans-serif
- Colors: Black text on white
- Spacing: 1.5 line height
- Margins: 0.75in all sides

### Professional Modern Template

**Layout:**
```
┌──────────────────┬──────────┐
│ NAME             │          │
│ email | phone    │          │
├──────────────────┤  SKILLS  │
│ SUMMARY          │  • Skill │
│ ...              │  • Skill │
├──────────────────┤──────────┤
│ EXPERIENCE       │ EDUCATION│
│ Title @ Company  │ Degree   │
│ • Achievement    │ School   │
├──────────────────┤──────────┤
│ PROJECTS         │ CERTS    │
│ Project Name     │ • Cert 1 │
└──────────────────┴──────────┘
```

**CSS Rules:**
- Font: Segoe UI, system-ui, sans-serif
- Colors: #1e40af (blue), #4b5563 (gray)
- Layout: CSS Grid (70% / 30%)
- Spacing: 1.5 line height
- Margins: 0.75in all sides

---

## 5. ATS Compatibility Rules

### Must Have (Both Templates)
- ✅ Selectable text (no images)
- ✅ Linear reading order
- ✅ Standard section headers
- ✅ Clean text extraction

### Must Avoid (Both Templates)
- ❌ No images or graphics
- ❌ No text boxes
- ❌ No merged table cells
- ❌ No overlapping text

### Testing Checklist
- [ ] Extract text with PyMuPDF
- [ ] Verify name, email, phone present
- [ ] Verify all skills detected
- [ ] Verify section order preserved
- [ ] Verify text is selectable

---

## 6. File Structure

```
server/src/templates/
├── resume-pdf.template.ts          # Rename to minimal-ats.template.ts
├── professional-modern.template.ts # NEW - Professional template
└── validator.ts                    # NEW - Basic validation

server/src/app/api/resume/
└── generate-pdf/
    └── route.ts                    # UPDATE - Add template selector

client/src/components/system-components/resume/
└── ActionHub.tsx                   # UPDATE - Add template dropdown
```

---

## 7. Implementation Timeline

**Total Time: 3-4 hours**

| Task | Time | Priority |
|------|------|----------|
| Create Professional template | 1-2h | High |
| Add template selector API | 30m | High |
| Update frontend UI | 30m | High |
| Basic validation | 30m | Medium |
| Testing & fixes | 1h | High |

---

## 8. Demo Flow

1. **Upload Resume** → Parse with Watsonx
2. **Select Template** → Choose Minimal or Professional
3. **Preview** → Show HTML preview (optional)
4. **Generate PDF** → Click "Download PDF"
5. **Validate** → Check text extraction
6. **Download** → Save ATS-compatible PDF

---

## 9. Success Criteria

**Must Have:**
- [ ] 2 templates working
- [ ] Template selector functional
- [ ] PDF generation < 3s
- [ ] Text extraction accurate
- [ ] Demo-ready

**Nice to Have:**
- [ ] Preview before download
- [ ] Template comparison view
- [ ] ATS score display

---

## 10. Future Enhancements (Post-Hackathon)

**If time permits:**
- Add 3rd template (Creative)
- Color scheme selector
- Section reordering
- Template preview thumbnails

**Not for MVP:**
- Template registry system
- Advanced validation layers
- Caching/monitoring
- Extensibility framework
- A/B testing

---

## 11. Code Snippets

### Professional Template Structure

```typescript
export function generateProfessionalTemplate(data: ResumeData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${data.personalInfo.name} - Resume</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    
    @page { size: A4; margin: 0.75in; }
    
    body {
      font-family: 'Segoe UI', system-ui, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
    }
    
    .container {
      display: grid;
      grid-template-columns: 70% 30%;
      gap: 20px;
    }
    
    .main-column { /* Left side */ }
    .sidebar { /* Right side */ }
    
    h1 { font-size: 24pt; color: #1e40af; }
    h2 { font-size: 14pt; color: #1e40af; border-bottom: 2px solid #3b82f6; }
    
    .skill-item {
      background: #eff6ff;
      padding: 4px 8px;
      border-radius: 4px;
      display: inline-block;
      margin: 2px;
    }
  </style>
</head>
<body>
  <div class="container">
    <main class="main-column">
      <header>
        <h1>${data.personalInfo.name}</h1>
        <p>${data.personalInfo.email} | ${data.personalInfo.phone}</p>
      </header>
      
      <section>
        <h2>Professional Summary</h2>
        <p>${data.summary}</p>
      </section>
      
      <section>
        <h2>Professional Experience</h2>
        ${data.workExperience.map(exp => `
          <div>
            <h3>${exp.title} @ ${exp.company}</h3>
            <p>${exp.duration}</p>
            <ul>
              ${exp.achievements.map(a => `<li>${a}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </section>
    </main>
    
    <aside class="sidebar">
      <section>
        <h2>Skills</h2>
        ${data.skills.map(s => `<span class="skill-item">${s}</span>`).join('')}
      </section>
      
      <section>
        <h2>Education</h2>
        ${data.education.map(e => `
          <div>
            <p><strong>${e.degree}</strong></p>
            <p>${e.institution}</p>
            <p>${e.year}</p>
          </div>
        `).join('')}
      </section>
    </aside>
  </div>
</body>
</html>
  `.trim();
}
```

### Template Selector API

```typescript
// server/src/app/api/resume/generate-pdf/route.ts
import { generateMinimalATSTemplate } from '@/templates/minimal-ats.template';
import { generateProfessionalTemplate } from '@/templates/professional-modern.template';

export async function POST(request: Request) {
  const { resumeData, templateId = 'minimal' } = await request.json();
  
  // Select template
  const html = templateId === 'professional'
    ? generateProfessionalTemplate(resumeData)
    : generateMinimalATSTemplate(resumeData);
  
  // Generate PDF (existing Puppeteer logic)
  const pdf = await generatePDF(html);
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${resumeData.personalInfo.name}-resume.pdf"`
    }
  });
}
```

---

## 12. Testing Strategy

### Manual Testing
1. Upload sample resume
2. Select Minimal template → Generate → Verify PDF
3. Select Professional template → Generate → Verify PDF
4. Check text extraction for both
5. Verify ATS scoring works

### Automated Testing (Optional)
```typescript
describe('Template System', () => {
  it('generates minimal template', () => {
    const html = generateMinimalATSTemplate(mockData);
    expect(html).toContain(mockData.personalInfo.name);
  });
  
  it('generates professional template', () => {
    const html = generateProfessionalTemplate(mockData);
    expect(html).toContain('class="container"');
  });
});
```

---

## 13. Key Decisions

**What We're Doing:**
- ✅ 2 hardcoded templates
- ✅ Simple template selector
- ✅ Basic validation
- ✅ Fast implementation (3-4 hours)

**What We're NOT Doing:**
- ❌ Template registry/metadata
- ❌ Complex validation layers
- ❌ Caching/monitoring
- ❌ Extensibility framework
- ❌ Advanced customization

**Why:**
- Focus on working demo
- Hackathon time constraints
- Prove concept, not build system
- Can enhance post-hackathon

---

## Next Steps

1. **Review this simplified plan**
2. **Switch to Code mode**
3. **Implement in 3-4 hours:**
   - Create Professional template
   - Add template selector
   - Update frontend
   - Test & validate
4. **Demo ready!**

---

**Document Status:** ✅ Simplified for Hackathon  
**Implementation Time:** 3-4 hours  
**Focus:** Working demo over perfect system

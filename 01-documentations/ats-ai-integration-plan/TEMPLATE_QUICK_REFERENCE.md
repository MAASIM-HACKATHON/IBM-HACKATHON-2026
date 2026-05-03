# Multi-Template System - Quick Reference

**Last Updated:** May 3, 2026

---

## 🚀 Quick Start

### For Users
1. Upload resume
2. Add job description
3. Select template (Minimal or Professional)
4. Click "Generate ATS-Optimized Resume"
5. Download PDF

### For Developers
```typescript
// Import templates
import { generateMinimalATSTemplate } from '@/templates/minimal-ats.template';
import { generateProfessionalTemplate } from '@/templates/professional-modern.template';

// Use template
const html = templateId === 'professional'
  ? generateProfessionalTemplate({ resumeData, isOptimized })
  : generateMinimalATSTemplate({ resumeData, isOptimized });
```

---

## 📁 File Locations

### Backend
- `server/src/templates/minimal-ats.template.ts` - Minimal template
- `server/src/templates/professional-modern.template.ts` - Professional template
- `server/src/templates/validator.ts` - Validation utilities
- `server/src/app/api/resume/generate-pdf/route.ts` - API endpoint

### Frontend
- `client/src/components/system-components/resume/ActionHub.tsx` - Template selector
- `client/src/components/system-components/resume/ResumePreview.tsx` - PDF preview
- `client/src/pages/system-page/ResumeBuilderPage.tsx` - Main page
- `client/src/services/pdfGenerationService.ts` - PDF generation

---

## 🎨 Template Comparison

| Feature | Minimal ATS | Professional Modern |
|---------|-------------|---------------------|
| Layout | Single column | Two-column (70/30) |
| Colors | Black only | Blue accents |
| Fonts | Arial, Helvetica | Segoe UI |
| ATS Score | 100% | 90%+ |
| Best For | Maximum compatibility | Modern companies |

---

## 🔧 API Reference

### Generate PDF Endpoint

```http
POST /api/resume/generate-pdf
Content-Type: application/json

{
  "resumeData": ParsedResumeData,
  "isOptimized": boolean,
  "templateId": "minimal" | "professional"
}

Response: text/html (200 OK)
```

---

## 💻 Code Snippets

### Backend - Template Selection
```typescript
const html = templateId === 'professional'
  ? generateProfessionalTemplate({ resumeData, isOptimized })
  : generateMinimalATSTemplate({ resumeData, isOptimized });
```

### Frontend - Template State
```typescript
const [selectedTemplate, setSelectedTemplate] = useState<'minimal' | 'professional'>('minimal');
```

### Frontend - Generate PDF
```typescript
const blob = await generateResumePDFBlob(
  resumeData,
  'optimized',
  {},
  selectedTemplate
);
```

---

## 🎯 Template Features

### Minimal ATS Template
```
┌─────────────────────────┐
│ NAME                    │
│ email | phone | location│
├─────────────────────────┤
│ PROFESSIONAL SUMMARY    │
├─────────────────────────┤
│ TECHNICAL SKILLS        │
├─────────────────────────┤
│ PROFESSIONAL EXPERIENCE │
├─────────────────────────┤
│ EDUCATION               │
└─────────────────────────┘
```

### Professional Modern Template
```
┌──────────────────┬──────────┐
│ NAME             │          │
│ email | phone    │  SKILLS  │
├──────────────────┤          │
│ SUMMARY          │          │
├──────────────────┤──────────┤
│ EXPERIENCE       │ EDUCATION│
├──────────────────┤──────────┤
│ PROJECTS         │ CERTS    │
└──────────────────┴──────────┘
```

---

## ✅ Validation

### Check HTML Content
```typescript
import { validateHTMLContent } from '@/templates/validator';

const { valid, errors } = validateHTMLContent(html, resumeData);
if (!valid) {
  console.error('Validation errors:', errors);
}
```

### Check PDF Generation
```typescript
import { validatePDFGeneration } from '@/templates/validator';

const { valid, errors, warnings } = validatePDFGeneration(html, resumeData);
```

---

## 🐛 Common Issues

### Template Not Changing
**Fix:** Regenerate resume after switching templates

### PDF Not Generating
**Fix:** Check server logs and API endpoint

### Missing Content
**Fix:** Verify resume data structure

### Styling Issues
**Fix:** Check HTML response in network tab

---

## 📊 Performance Targets

- Template Generation: < 100ms
- API Response: < 500ms
- PDF Generation: < 2s
- Download: < 1s

---

## 🔮 Future Enhancements

### Phase 2
- [ ] 3rd template (Creative)
- [ ] Color scheme selector
- [ ] Font selection
- [ ] Section reordering

### Phase 3
- [ ] Template registry
- [ ] Custom template builder
- [ ] Template marketplace
- [ ] A/B testing

---

## 📝 Type Definitions

```typescript
type TemplateId = 'minimal' | 'professional';

interface ResumePDFTemplateProps {
  resumeData: ParsedResumeData;
  isOptimized?: boolean;
}

interface ActionHubProps {
  selectedTemplate?: TemplateId;
  onTemplateChange?: (template: TemplateId) => void;
  // ... other props
}
```

---

## 🎓 Best Practices

### When to Use Minimal Template
- Applying to traditional companies
- Maximum ATS compatibility needed
- Simple, clean presentation preferred
- Conservative industries (finance, legal)

### When to Use Professional Template
- Applying to tech companies
- Modern, creative industries
- Want to stand out visually
- Company values design

---

## 📞 Support

### Documentation
- Implementation Summary: `MULTI_TEMPLATE_IMPLEMENTATION_SUMMARY.md`
- Testing Guide: `TEMPLATE_TESTING_GUIDE.md`
- Original Plan: `MULTI_TEMPLATE_RESUME_SYSTEM_PLAN.md`

### Code Comments
All template files include inline documentation

---

## 🚦 Status Indicators

### ✅ Implemented
- 2 templates (Minimal, Professional)
- Template selector UI
- API endpoint with template support
- PDF generation with templates
- Download functionality
- Validation utilities

### ⏳ Planned
- Additional templates
- Customization options
- Advanced features

---

**Quick Links:**
- [Implementation Summary](./MULTI_TEMPLATE_IMPLEMENTATION_SUMMARY.md)
- [Testing Guide](./TEMPLATE_TESTING_GUIDE.md)
- [Original Plan](./MULTI_TEMPLATE_RESUME_SYSTEM_PLAN.md)

---

**Document Status:** ✅ Complete  
**Version:** 1.0.0

# File Upload & Drag-and-Drop Feature

## Overview

The Email Composer now supports **file upload and drag-and-drop** functionality, allowing users to upload documents in various formats. The system automatically extracts text content, analyzes it with Watsonx AI, and generates professional emails based on the file content.

## Features

### 1. **Multiple Upload Methods**
- **Browse Button**: Click to select files from your computer
- **Drag & Drop**: Drag files directly into the upload area
- **Paste Text**: Continue to paste text directly into the textarea

### 2. **Supported File Formats**

#### Text Files
- `.txt` - Plain text files
- `.md` - Markdown files
- `.html` - HTML files
- `.csv` - CSV files

#### Document Files
- `.pdf` - PDF documents
- `.doc` / `.docx` - Microsoft Word documents
- `.xls` / `.xlsx` - Microsoft Excel spreadsheets
- `.ppt` / `.pptx` - Microsoft PowerPoint presentations
- `.rtf` - Rich Text Format

#### Code Files
- `.json` - JSON files
- `.xml` - XML files
- `.js` / `.ts` - JavaScript/TypeScript files
- `.jsx` / `.tsx` - React component files

### 3. **File Size Limit**
- Maximum file size: **10MB**
- Files exceeding this limit will be rejected with an error message

### 4. **Automatic Processing**

When a file is uploaded:

1. **Text Extraction**: System extracts text content from the file
2. **Content Analysis**: Watsonx AI analyzes the extracted text
3. **Auto-Fill**: Form fields are automatically populated:
   - Purpose (job-application, follow-up, etc.)
   - Tone (formal, professional, friendly, enthusiastic)
   - Job Role
   - Company Name
   - Extra Instructions
   - Refinement options
4. **Language Detection**: Automatically detects the language (26 languages supported)
5. **Email Generation**: Ready to generate professional email based on file content

## User Interface

### Upload Area

```
┌─────────────────────────────────────────────────────────┐
│  📄  Upload or drag & drop a file          [Browse]     │
│      Supports: TXT, PDF, DOCX, JSON, CSV, and more      │
└─────────────────────────────────────────────────────────┘
```

### Visual States

1. **Default State**: Light border with upload icon
2. **Hover State**: Border becomes more visible
3. **Dragging State**: Cyan highlight with "Drop file here" message
4. **Processing State**: Loading indicator with file name
5. **Success State**: Shows uploaded file name with checkmark

## Usage Examples

### Example 1: Upload Job Description PDF

1. Click **Browse** or drag a job description PDF
2. System extracts text from PDF
3. AI analyzes and detects:
   - Purpose: "job-application"
   - Tone: "professional"
   - Job Role: "Senior Software Engineer"
   - Company: "IBM"
4. Generate email with one click

### Example 2: Upload Resume DOCX

1. Upload your resume in DOCX format
2. System extracts your experience and skills
3. AI generates a networking email or inquiry email
4. Customize and send

### Example 3: Upload Meeting Notes TXT

1. Upload meeting notes from a text file
2. AI analyzes the context
3. Generates appropriate follow-up or thank-you email

## Technical Implementation

### File Processing Service

Located at: `client/src/services/fileProcessingService.ts`

**Key Functions:**

```typescript
// Process uploaded file and extract text
processUploadedFile(file: File): Promise<FileProcessingResult>

// Format file size for display
formatFileSize(bytes: number): string
```

**Processing Flow:**

```
File Upload
    ↓
Validation (size, type)
    ↓
Text Extraction
    ↓
Content Cleaning
    ↓
Return Result
```

### Integration with Email Composer

**New State Variables:**
- `isDragging`: Tracks drag-and-drop state
- `uploadedFileName`: Stores uploaded file name
- `fileInputRef`: Reference to hidden file input

**New Handlers:**
- `handleFileUpload()`: Main file processing handler
- `handleFileInputChange()`: File input change handler
- `handleDragEnter()`: Drag enter handler
- `handleDragLeave()`: Drag leave handler
- `handleDragOver()`: Drag over handler
- `handleDrop()`: Drop handler
- `handleUploadClick()`: Trigger file input click

## Error Handling

### Common Errors

1. **File Too Large**
   - Error: "File size exceeds 10MB limit"
   - Solution: Use a smaller file or extract relevant text

2. **Unsupported File Type**
   - Error: "File type not supported"
   - Solution: Convert to supported format or copy/paste text

3. **No Text Extracted**
   - Error: "No text content could be extracted"
   - Solution: Ensure file contains readable text

4. **PDF Extraction Failed**
   - Error: "Unable to extract text from PDF"
   - Solution: Copy text from PDF and paste directly

## Best Practices

### For Users

1. **Use Clear Documents**: Upload documents with clear, readable text
2. **Check File Size**: Keep files under 10MB
3. **Verify Extracted Content**: Review the textarea after upload
4. **Customize as Needed**: AI auto-fill is a starting point - customize fields
5. **Multiple Languages**: System auto-detects language from file content

### For Developers

1. **File Validation**: Always validate file size and type
2. **Error Handling**: Provide clear error messages
3. **User Feedback**: Show loading states and success messages
4. **Content Cleaning**: Clean extracted text for better AI analysis
5. **Security**: Never execute code from uploaded files

## Future Enhancements

### Planned Features

1. **Advanced PDF Parsing**: Use pdf.js for better PDF text extraction
2. **OCR Support**: Extract text from scanned documents and images
3. **Batch Upload**: Upload multiple files at once
4. **File Preview**: Preview file content before processing
5. **Cloud Storage**: Integration with Google Drive, Dropbox, OneDrive
6. **File History**: Track previously uploaded files
7. **Template Detection**: Detect and apply email templates from files

### Potential Improvements

1. **Better Office Document Parsing**: Use mammoth.js for DOCX
2. **Excel Data Extraction**: Smart extraction from spreadsheets
3. **Image Upload**: Extract text from images using OCR
4. **URL Import**: Import content from web URLs
5. **Email Import**: Import existing emails for reference

## Accessibility

- **Keyboard Navigation**: Full keyboard support for file upload
- **Screen Reader Support**: Proper ARIA labels and announcements
- **Visual Feedback**: Clear visual states for all interactions
- **Error Messages**: Descriptive error messages for all scenarios

## Browser Compatibility

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## Security Considerations

1. **File Size Limit**: Prevents large file uploads
2. **Type Validation**: Only accepts specific file types
3. **Client-Side Processing**: Files processed in browser (no server upload)
4. **No Code Execution**: Text extraction only, no code execution
5. **Content Sanitization**: Extracted text is cleaned and sanitized

## Testing

### Manual Testing Checklist

- [ ] Upload TXT file
- [ ] Upload PDF file
- [ ] Upload DOCX file
- [ ] Upload JSON file
- [ ] Drag and drop file
- [ ] Upload file > 10MB (should fail)
- [ ] Upload unsupported file type (should fail)
- [ ] Upload empty file (should fail)
- [ ] Verify AI analysis after upload
- [ ] Verify language detection
- [ ] Verify form auto-fill
- [ ] Test on different browsers

### Test Files

Create test files in `client/src/assets/documents/` for testing:
- `sample-job-description.txt`
- `sample-resume.pdf`
- `sample-notes.md`

## Troubleshooting

### Issue: File upload not working

**Solution:**
1. Check browser console for errors
2. Verify file size is under 10MB
3. Ensure file type is supported
4. Try different file format

### Issue: No text extracted from PDF

**Solution:**
1. PDF might be scanned image (needs OCR)
2. Try copying text manually
3. Convert PDF to text format

### Issue: AI analysis fails

**Solution:**
1. Ensure extracted text is at least 50 characters
2. Check Watsonx AI connection
3. Verify API credentials

## Support

For issues or questions:
1. Check this documentation
2. Review console logs for errors
3. Contact development team
4. Submit issue on GitHub

## Changelog

### Version 1.0.0 (Current)
- Initial file upload feature
- Support for 10+ file formats
- Drag-and-drop functionality
- Automatic text extraction
- AI-powered content analysis
- Multi-language support
- File size validation
- Error handling

---

**Last Updated**: May 2, 2026  
**Feature Status**: ✅ Production Ready  
**Maintained By**: Development Team

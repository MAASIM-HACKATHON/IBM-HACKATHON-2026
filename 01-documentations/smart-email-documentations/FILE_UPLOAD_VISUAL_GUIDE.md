# File Upload Visual Guide

## 🎨 User Interface Overview

### Main Upload Area

```
╔═══════════════════════════════════════════════════════════════╗
║                    KEY MESSAGE POINTS                         ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │  📄  Upload or drag & drop a file        [Browse]       │ ║
║  │      Supports: TXT, PDF, DOCX, JSON, CSV, and more      │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  ┌─────────────────────────────────────────────────────────┐ ║
║  │                                                          │ ║
║  │  Paste job description, your notes, or key points       │ ║
║  │  here. Or upload a file above. Watsonx AI will          │ ║
║  │  auto-detect language and fill other fields for you!    │ ║
║  │                                                          │ ║
║  │                                                          │ ║
║  └─────────────────────────────────────────────────────────┘ ║
║                                                               ║
║  💡 Upload any file, paste text, and Watsonx AI will         ║
║     intelligently analyze and auto-fill fields               ║
╚═══════════════════════════════════════════════════════════════╝
```

---

## 🎭 Visual States

### 1. Default State (Ready for Upload)

```
┌─────────────────────────────────────────────────────────┐
│  📄  Upload or drag & drop a file          [Browse]     │
│      Supports: TXT, PDF, DOCX, JSON, CSV, and more      │
└─────────────────────────────────────────────────────────┘
```
- Light border (white/20)
- Upload icon visible
- Browse button on right

---

### 2. Hover State

```
┌─────────────────────────────────────────────────────────┐
│  📄  Upload or drag & drop a file          [Browse]     │ ← Brighter border
│      Supports: TXT, PDF, DOCX, JSON, CSV, and more      │
└─────────────────────────────────────────────────────────┘
```
- Border becomes more visible (white/30)
- Subtle background change
- Cursor changes to pointer

---

### 3. Dragging State (File Over Drop Zone)

```
╔═════════════════════════════════════════════════════════╗
║                                                         ║
║                    ⬇️  Drop file here                   ║
║                                                         ║
╚═════════════════════════════════════════════════════════╝
```
- Cyan highlight (cyan-300)
- Overlay with drop message
- Animated background
- Large drop icon

---

### 4. Processing State

```
┌─────────────────────────────────────────────────────────┐
│  ⏳  Processing job-description.pdf...    [Browse]      │
│      Please wait while we extract the text...           │
└─────────────────────────────────────────────────────────┘
```
- Loading spinner
- File name displayed
- Processing message
- Browse button disabled

---

### 5. Success State (File Uploaded)

```
┌─────────────────────────────────────────────────────────┐
│  ✅  job-description.pdf (245 KB)         [Browse]      │
│      File processed successfully!                       │
└─────────────────────────────────────────────────────────┘
```
- Checkmark icon
- File name and size
- Success message
- Green accent color

---

### 6. Error State

```
┌─────────────────────────────────────────────────────────┐
│  ❌  large-file.pdf (15 MB)               [Browse]      │
│      Error: File size exceeds 10MB limit                │
└─────────────────────────────────────────────────────────┘
```
- Error icon
- File name and size
- Error message
- Red accent color

---

## 🎬 User Flow Animations

### Flow 1: Click to Upload

```
Step 1: Initial State
┌─────────────────────────────────────┐
│  📄  Upload or drag & drop a file   │
│      [Browse] ← Click here          │
└─────────────────────────────────────┘
         ↓
Step 2: File Dialog Opens
┌─────────────────────────────────────┐
│  📁 Select File                     │
│  ┌───────────────────────────────┐ │
│  │ Documents/                    │ │
│  │ ├─ job-description.pdf        │ │
│  │ ├─ resume.docx                │ │
│  │ └─ notes.txt                  │ │
│  └───────────────────────────────┘ │
│           [Open] [Cancel]           │
└─────────────────────────────────────┘
         ↓
Step 3: Processing
┌─────────────────────────────────────┐
│  ⏳ Processing job-description.pdf  │
│     Extracting text...              │
└─────────────────────────────────────┘
         ↓
Step 4: Success
┌─────────────────────────────────────┐
│  ✅ job-description.pdf (245 KB)    │
│     File processed successfully!    │
└─────────────────────────────────────┘
```

---

### Flow 2: Drag and Drop

```
Step 1: Drag File Over Page
┌─────────────────────────────────────┐
│  📄  Upload or drag & drop a file   │
│      Normal state                   │
└─────────────────────────────────────┘
         ↓
Step 2: File Over Drop Zone
╔═════════════════════════════════════╗
║         🎯 Cyan Highlight           ║
║                                     ║
║        ⬇️  Drop file here           ║
║                                     ║
╚═════════════════════════════════════╝
         ↓
Step 3: File Dropped
┌─────────────────────────────────────┐
│  ⏳ Processing resume.docx          │
│     Extracting text...              │
└─────────────────────────────────────┘
         ↓
Step 4: Success
┌─────────────────────────────────────┐
│  ✅ resume.docx (180 KB)            │
│     File processed successfully!    │
└─────────────────────────────────────┘
```

---

## 🎨 Color Scheme

### Default Colors
- **Border**: `border-white/20` (Light gray)
- **Background**: `bg-slate-900/40` (Dark transparent)
- **Text**: `text-white` (White)
- **Icon**: `text-cyan-300` (Cyan)

### Hover Colors
- **Border**: `border-white/30` (Brighter gray)
- **Background**: `bg-slate-900/60` (Darker)

### Dragging Colors
- **Border**: `border-cyan-300` (Bright cyan)
- **Background**: `bg-cyan-300/10` (Cyan tint)
- **Overlay**: `bg-cyan-300/20` (Cyan overlay)

### Success Colors
- **Icon**: `text-emerald-400` (Green)
- **Border**: `border-emerald-300/20` (Green tint)
- **Background**: `bg-emerald-300/10` (Green background)

### Error Colors
- **Icon**: `text-rose-400` (Red)
- **Border**: `border-rose-300/25` (Red tint)
- **Background**: `bg-rose-400/10` (Red background)

---

## 📱 Responsive Design

### Desktop View (1024px+)

```
┌─────────────────────────────────────────────────────────────┐
│  📄  Upload or drag & drop a file              [Browse]     │
│      Supports: TXT, PDF, DOCX, JSON, CSV, and more          │
└─────────────────────────────────────────────────────────────┘
```
- Full width upload area
- Browse button on right
- All text visible

---

### Tablet View (768px - 1023px)

```
┌───────────────────────────────────────────────────┐
│  📄  Upload or drag & drop        [Browse]       │
│      Supports: TXT, PDF, DOCX, JSON, CSV         │
└───────────────────────────────────────────────────┘
```
- Slightly narrower
- Text may wrap
- Browse button remains visible

---

### Mobile View (< 768px)

```
┌─────────────────────────────────┐
│  📄  Upload file    [Browse]    │
│      TXT, PDF, DOCX, etc.       │
└─────────────────────────────────┘
```
- Compact layout
- Shortened text
- Stacked elements
- Touch-friendly buttons

---

## 🎯 Interactive Elements

### Browse Button

```
Default:
┌──────────┐
│ Browse   │  ← border-cyan-400/30, bg-cyan-400/10
└──────────┘

Hover:
┌──────────┐
│ Browse   │  ← border-cyan-400/50, bg-cyan-400/20
└──────────┘

Active:
┌──────────┐
│ Browse   │  ← Slightly darker
└──────────┘

Disabled:
┌──────────┐
│ Browse   │  ← Grayed out, cursor-not-allowed
└──────────┘
```

---

### Upload Icon

```
Default:
    ☁️
   ⬆️
   
Animated (Processing):
    ☁️
   ⬆️  ← Pulsing animation
```

---

### File Name Display

```
Before Upload:
📄  Upload or drag & drop a file

After Upload:
📄  job-description.pdf (245 KB)
    ↑           ↑            ↑
  Icon      File Name    File Size
```

---

## 🎪 Toast Notifications

### Processing Toast

```
┌─────────────────────────────────────┐
│  ⏳  Processing job-description.pdf │
└─────────────────────────────────────┘
```
- Blue background
- Loading spinner
- File name

---

### Success Toast

```
┌─────────────────────────────────────────────────┐
│  ✅  File processed: job-description.pdf (245KB)│
└─────────────────────────────────────────────────┘
```
- Green background
- Checkmark icon
- File details

---

### Analysis Toast

```
┌─────────────────────────────────────────────────┐
│  ✨  Auto-filled 5 fields (87% confidence)      │
└─────────────────────────────────────────────────┘
```
- Cyan background
- Sparkle icon
- Analysis results

---

### Error Toast

```
┌─────────────────────────────────────────────────┐
│  ❌  Error: File size exceeds 10MB limit        │
└─────────────────────────────────────────────────┘
```
- Red background
- Error icon
- Error message

---

## 🎨 Accessibility Features

### Keyboard Navigation

```
Tab Order:
1. Browse Button
2. Textarea
3. Other form fields

Keyboard Shortcuts:
- Tab: Navigate to upload area
- Enter/Space: Trigger file dialog
- Esc: Cancel file selection
```

---

### Screen Reader Announcements

```
On Upload Area Focus:
"Upload area. Click to browse or drag and drop files. 
 Supports text, PDF, and Office documents up to 10MB."

On File Upload:
"Processing file: job-description.pdf"

On Success:
"File processed successfully: job-description.pdf, 245 kilobytes"

On Error:
"Error: File size exceeds 10 megabyte limit"
```

---

### Visual Indicators

```
Focus State:
┌═════════════════════════════════════┐  ← Blue outline
║  📄  Upload or drag & drop a file   ║
║      [Browse]                       ║
└═════════════════════════════════════┘

High Contrast Mode:
┌─────────────────────────────────────┐
│  📄  Upload or drag & drop a file   │  ← Stronger borders
│      [Browse]                       │  ← Higher contrast
└─────────────────────────────────────┘
```

---

## 📊 File Type Icons

```
Text Files:     📄  .txt, .md, .csv
PDF Files:      📕  .pdf
Word Docs:      📘  .doc, .docx
Excel Files:    📗  .xls, .xlsx
PowerPoint:     📙  .ppt, .pptx
Code Files:     💻  .json, .xml, .js
```

---

## 🎬 Complete User Journey

```
┌─────────────────────────────────────────────────────────────┐
│                    EMAIL COMPOSER PAGE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: [Job Application ▼]    Tone: [Professional ▼]    │
│                                                             │
│  Job Role: [                ]    Company: [              ]  │
│                                                             │
│  Key message points:                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  📄  Upload or drag & drop a file      [Browse]       │ │
│  │      Supports: TXT, PDF, DOCX, JSON, CSV, and more    │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  [Textarea with extracted content]                    │ │
│  │                                                       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Generate test email]                                      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Toast: ✅ File processed: job-description.pdf (245 KB)     │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│  Toast: ✨ Auto-filled 5 fields (87% confidence)            │
└─────────────────────────────────────────────────────────────┘
         ↓
┌─────────────────────────────────────────────────────────────┐
│                    EMAIL COMPOSER PAGE                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Purpose: [Job Application ▼]    Tone: [Professional ▼]    │
│           ↑ Auto-filled                  ↑ Auto-filled     │
│                                                             │
│  Job Role: [Senior Data Analyst]  Company: [IBM]           │
│            ↑ Auto-filled                  ↑ Auto-filled    │
│                                                             │
│  Key message points:                                        │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  ✅ job-description.pdf (245 KB)       [Browse]       │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  We are seeking a Senior Data Analyst with 5+ years  │ │
│  │  of experience in Python, SQL, and data visualization│ │
│  │  ...                                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                             │
│  [Generate test email] ← Ready to generate!                 │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

**Visual Guide Complete! 🎨**

*This guide provides a comprehensive visual reference for the file upload feature.*

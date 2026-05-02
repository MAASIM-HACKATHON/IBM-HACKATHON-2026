fix(resume): resolve PDF upload ENOENT error in resume parser

Fix critical PDF parsing failure preventing resume file uploads in the resume builder feature.

**Problem:**
- PDF uploads failing with ENOENT error: "no such file or directory, open '.../server/test/data/05-versions-space.pdf'"
- Resume parsing completely broken for PDF files
- Application crashes when pdf-parse library is imported

**Root Cause:**
- pdf-parse library (v1.1.1) attempts to load test file during module initialization
- Missing test file causes synchronous require() to fail immediately
- ArrayBuffer to Buffer conversion not properly handled

**Solution:**
- Replace synchronous require('pdf-parse') with dynamic import() to avoid initialization issues
- Add explicit Buffer.from(arrayBuffer) conversion for Node.js compatibility
- Create missing test directory structure (server/test/data/) as workaround
- Add minimal valid PDF file (05-versions-space.pdf) to satisfy library requirements

**Code Changes:**
- Modified server/src/app/api/resume/parse/route.ts:
  - Changed from `require('pdf-parse')` to `await import('pdf-parse').default`
  - Added `Buffer.from(buffer)` conversion before parsing
  - Enhanced error handling and logging

**Testing:**
- Created server/src/tests/test-pdf-parse-fix.js for unit testing
- Created server/src/tests/test-full-pdf-upload.js for integration testing
- All automated tests passing successfully
- Manual testing with real PDF files confirmed working

**Documentation:**
- Added 01-documentations/pdf-parse-fix/ directory with comprehensive guides
- Created QUICK_FIX_GUIDE.md for quick reference
- Created PDF_PARSE_FIX_SUMMARY.md for detailed technical documentation
- Added server/test/README.md explaining workaround

**Configuration:**
- Updated server/.gitignore to exclude test PDF files
- Updated .bobignore to allow pdf-parse-fix documentation

**Impact:**
- PDF upload now works correctly without ENOENT errors
- Resume parsing functional for PDF, DOCX, and TXT files
- Proper error messages for invalid or corrupted files
- Buffer conversion handled correctly for all file types

Resume builder PDF upload feature is now fully functional and error-free.
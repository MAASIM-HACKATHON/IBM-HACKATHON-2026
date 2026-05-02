# Test Directory for pdf-parse Workaround

## Purpose
This directory exists as a workaround for a bug in the `pdf-parse` library (v1.1.1).

## Issue
The `pdf-parse` library attempts to load a test file (`test/data/05-versions-space.pdf`) during module initialization, which causes an ENOENT error if the file doesn't exist.

## Solution
We created this directory structure with a minimal PDF file to satisfy the library's initialization requirements.

## Files
- `data/05-versions-space.pdf` - Minimal valid PDF file (empty content)

## Note
This is a temporary workaround. Consider:
1. Upgrading to a newer version of pdf-parse if available
2. Using an alternative PDF parsing library
3. Submitting a bug report to the pdf-parse maintainers

## Related Code
The actual PDF parsing implementation is in:
- `src/app/api/resume/parse/route.ts`

The fix includes:
- Using dynamic import() instead of require()
- Converting ArrayBuffer to Node.js Buffer
- Proper error handling
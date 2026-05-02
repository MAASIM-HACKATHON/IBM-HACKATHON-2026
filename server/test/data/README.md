# PDF-Parse Test Data

## ⚠️ IMPORTANT: DO NOT DELETE THIS FILE

The file `05-versions-space.pdf` in this directory is **REQUIRED** for the application to work.

## Why This File Exists

The `pdf-parse` library (v1.1.1) has a bug where it attempts to load this test file during module initialization. Without this file, the application will crash with:

```
Error: ENOENT: no such file or directory, open '.../server/test/data/05-versions-space.pdf'
```

## File Details

- **Filename**: `05-versions-space.pdf`
- **Size**: ~311 bytes
- **Content**: Minimal valid PDF structure (empty document)
- **Purpose**: Satisfy pdf-parse library initialization requirements

## Version Control

This file **MUST** be committed to version control. The `.gitignore` has been configured to:
- Exclude other PDF files in this directory
- **Include** this specific file (exception rule)

## If File Is Missing

If you encounter the ENOENT error, run:

```bash
cd server
npm run setup
```

Or manually run:

```bash
cd server
node setup-pdf-workaround.js
```

This will recreate the required file.

## Automatic Setup

The file is automatically created when you run:
- `npm install` (via postinstall script)
- `npm run setup` (manual setup)

## Related Documentation

See `01-documentations/pdf-parse-fix/` for complete technical documentation.

## Future

This workaround may not be needed if:
1. pdf-parse library is updated to fix the bug
2. We switch to an alternative PDF parsing library
3. The library maintainers accept a patch

Until then, this file must remain in the repository.
# PyMuPDF PDF Parser - API Contract

## Overview

This document defines the API contract between the Node.js server and the Python PDF parser microservice.

## Base URL

- **Development**: `http://localhost:8000`
- **Production**: Configured via `PYTHON_PARSER_URL` environment variable

## Authentication

No authentication required (internal service communication).

## Endpoints

### 1. Parse PDF

Extract structured text from a PDF file.

**Endpoint**: `POST /api/parse`

**Request**:
```http
POST /api/parse HTTP/1.1
Content-Type: multipart/form-data
Host: localhost:8000

file: <binary PDF data>
```

**Request Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | PDF file to parse (max 10MB) |

**Success Response** (200 OK):
```json
{
  "file_name": "resume.pdf",
  "total_pages": 2,
  "raw_text": "John Doe\nSoftware Engineer\n\nExperience:\n...",
  "pages": [
    {
      "page_number": 1,
      "text": "John Doe\nSoftware Engineer..."
    },
    {
      "page_number": 2,
      "text": "Education\nBachelor of Science..."
    }
  ],
  "status": "success",
  "error": null
}
```

**Error Response** (400 Bad Request):
```json
{
  "file_name": "corrupted.pdf",
  "total_pages": 0,
  "raw_text": "",
  "pages": [],
  "status": "failed",
  "error": "Corrupted PDF: Unable to open file"
}
```

**Error Response** (413 Payload Too Large):
```json
{
  "detail": "File size (15728640 bytes) exceeds maximum (10485760 bytes)",
  "status_code": 413
}
```

**Error Response** (500 Internal Server Error):
```json
{
  "file_name": "resume.pdf",
  "total_pages": 0,
  "raw_text": "",
  "pages": [],
  "status": "failed",
  "error": "Internal server error: <error details>"
}
```

---

### 2. Health Check

Check if the service is running and healthy.

**Endpoint**: `GET /health`

**Request**:
```http
GET /health HTTP/1.1
Host: localhost:8000
```

**Success Response** (200 OK):
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "pymupdf_version": "1.23.8"
}
```

---

### 3. Service Status

Get detailed service status and configuration.

**Endpoint**: `GET /status`

**Request**:
```http
GET /status HTTP/1.1
Host: localhost:8000
```

**Success Response** (200 OK):
```json
{
  "service": "PDF Parser Microservice",
  "version": "1.0.0",
  "status": "operational",
  "environment": "development",
  "pymupdf_version": "1.23.8",
  "max_file_size_mb": 10,
  "cors_origins": [
    "http://localhost:3001",
    "http://localhost:5173"
  ]
}
```

---

### 4. Root Endpoint

Service information and available endpoints.

**Endpoint**: `GET /`

**Request**:
```http
GET / HTTP/1.1
Host: localhost:8000
```

**Success Response** (200 OK):
```json
{
  "service": "PDF Parser Microservice",
  "version": "1.0.0",
  "status": "running",
  "endpoints": {
    "health": "/health",
    "parse": "/api/parse",
    "docs": "/docs"
  }
}
```

---

## Response Schema

### ParseResponse

```typescript
interface ParseResponse {
  file_name: string;        // Original filename
  total_pages: number;      // Total pages in PDF
  raw_text: string;         // Complete extracted text
  pages: PageData[];        // Per-page text data
  status: 'success' | 'failed';  // Parse status
  error: string | null;     // Error message if failed
}
```

### PageData

```typescript
interface PageData {
  page_number: number;      // Page number (1-indexed)
  text: string;             // Extracted text from page
}
```

### HealthResponse

```typescript
interface HealthResponse {
  status: string;           // Service status
  version: string;          // Service version
  pymupdf_version: string;  // PyMuPDF library version
}
```

---

## Error Handling

### Error Types

| Error Type | Status Code | Description |
|------------|-------------|-------------|
| Invalid File Type | 400 | File is not a PDF |
| Corrupted PDF | 400 | PDF file is corrupted or unreadable |
| Empty Text | 400 | No text could be extracted from PDF |
| File Too Large | 413 | File exceeds 10MB limit |
| Service Error | 500 | Internal server error |

### Error Response Format

All errors return a structured response with:
- `status`: Always `"failed"`
- `error`: Descriptive error message
- `file_name`: Original filename
- `total_pages`: 0
- `raw_text`: Empty string
- `pages`: Empty array

---

## Integration Example

### Node.js Client

```typescript
import { getPythonParserClient } from '@/services/pythonParserClient';

// Parse PDF
const client = getPythonParserClient();
const buffer = Buffer.from(arrayBuffer);

try {
  const result = await client.parsePDF(buffer, 'resume.pdf');
  
  if (result.status === 'success') {
    console.log('Extracted text:', result.raw_text);
    console.log('Total pages:', result.total_pages);
  } else {
    console.error('Parse failed:', result.error);
  }
} catch (error) {
  console.error('Service unavailable:', error);
  // Fallback to pdf-parse
}
```

### cURL Example

```bash
# Parse PDF
curl -X POST http://localhost:8000/api/parse \
  -F "file=@resume.pdf"

# Health check
curl http://localhost:8000/health

# Service status
curl http://localhost:8000/status
```

---

## Performance Characteristics

- **Average Response Time**: 100-500ms per page
- **Memory Usage**: ~50-100MB per request
- **Concurrent Requests**: Supports multiple workers
- **Timeout**: 30 seconds (configurable)
- **Max File Size**: 10MB (configurable)

---

## CORS Configuration

The service allows requests from:
- `http://localhost:3001` (Node.js server)
- `http://localhost:5173` (React client)
- `http://localhost:3000` (Alternative Node.js port)

Additional origins can be configured via `CORS_ORIGINS` environment variable.

---

## API Documentation

Interactive API documentation available at:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

---

## Versioning

Current API version: **1.0.0**

The API follows semantic versioning. Breaking changes will increment the major version.

---

## Support

For issues or questions:
1. Check service logs
2. Verify service is running: `GET /health`
3. Review error messages in response

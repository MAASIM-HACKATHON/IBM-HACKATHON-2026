# PDF Parser Microservice

A FastAPI-based microservice for extracting structured text from PDF files using PyMuPDF (fitz).

## Features

- ✅ **PyMuPDF Integration** - Robust PDF text extraction
- ✅ **Structured Output** - Per-page text extraction with metadata
- ✅ **Error Handling** - Handles corrupted PDFs and empty text
- ✅ **UTF-8 Normalization** - Clean text output
- ✅ **File Validation** - Size limits and format checking
- ✅ **Health Checks** - Service monitoring endpoints
- ✅ **CORS Support** - Cross-origin requests enabled
- ✅ **API Documentation** - Auto-generated OpenAPI docs

## Requirements

- Python 3.9+
- pip or poetry for dependency management

## Installation

### 1. Create Virtual Environment

```bash
cd server/python-parser
python -m venv venv

# Activate virtual environment
# On macOS/Linux:
source venv/bin/activate

# On Windows:
venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env

# Edit .env with your settings (optional)
nano .env
```

## Running the Service

### Development Mode

```bash
# With auto-reload
uvicorn app.main:app --reload --port 8000

# Or using Python directly
python -m app.main
```

### Production Mode

```bash
# Using uvicorn with workers
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 4
```

## API Endpoints

### Parse PDF
```http
POST /api/parse
Content-Type: multipart/form-data

file: <PDF file>
```

**Response:**
```json
{
  "file_name": "resume.pdf",
  "total_pages": 2,
  "raw_text": "Full extracted text...",
  "pages": [
    {
      "page_number": 1,
      "text": "Page 1 content..."
    }
  ],
  "status": "success",
  "error": null
}
```

### Health Check
```http
GET /health
```

**Response:**
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "pymupdf_version": "1.23.8"
}
```

### Service Status
```http
GET /status
```

### API Documentation
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Testing

### Manual Testing with cURL

```bash
# Health check
curl http://localhost:8000/health

# Parse PDF
curl -X POST http://localhost:8000/api/parse \
  -F "file=@/path/to/resume.pdf"
```

### Python Testing

```bash
# Run tests (when implemented)
pytest tests/
```

## Configuration

Edit `.env` file or set environment variables:

| Variable | Default | Description |
|----------|---------|-------------|
| `HOST` | `0.0.0.0` | Server host |
| `PORT` | `8000` | Server port |
| `MAX_FILE_SIZE` | `10485760` | Max file size (10MB) |
| `LOG_LEVEL` | `INFO` | Logging level |
| `ENVIRONMENT` | `development` | Environment mode |

## Error Handling

The service handles various error scenarios:

- **Corrupted PDF**: Returns `status: "failed"` with error message
- **Empty Text**: Detects and reports PDFs with no extractable text
- **Invalid Format**: Validates PDF signature
- **File Too Large**: Enforces size limits
- **Service Errors**: Returns structured error responses

## Integration with Node.js

The Node.js server calls this microservice via HTTP:

```typescript
// Example integration
const response = await axios.post('http://localhost:8000/api/parse', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
  timeout: 30000
});
```

## Output Schema

Matches `core/pdf_parse_output_schema.json`:

```json
{
  "file_name": "string",
  "total_pages": "number",
  "raw_text": "string",
  "pages": [
    {
      "page_number": "number",
      "text": "string"
    }
  ],
  "status": "success | failed",
  "error": "string | null"
}
```

## Performance

- **Text Extraction**: ~100-500ms per page
- **Memory Usage**: ~50-100MB per request
- **Concurrent Requests**: Supports multiple workers

## Troubleshooting

### Import Errors
```bash
# Ensure dependencies are installed
pip install -r requirements.txt
```

### Port Already in Use
```bash
# Change port in .env or command line
uvicorn app.main:app --port 8001
```

### CORS Issues
```bash
# Add your origin to CORS_ORIGINS in .env
CORS_ORIGINS="http://localhost:3001,http://localhost:5173"
```

## Development

### Project Structure
```
python-parser/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI application
│   ├── parser.py        # PyMuPDF parser
│   ├── models.py        # Pydantic models
│   ├── utils.py         # Text utilities
│   └── config.py        # Configuration
├── tests/
│   └── __init__.py
├── requirements.txt
├── .env.example
└── README.md
```

### Adding Features

1. Update models in `app/models.py`
2. Add logic in `app/parser.py`
3. Create endpoint in `app/main.py`
4. Update tests in `tests/`

## License

Part of IBM Hackathon 2026 project.

## Support

For issues or questions, check the main project documentation in `01-documentations/`.
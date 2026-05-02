"""
PDF Parser Microservice - FastAPI Application
Provides HTTP API for PDF text extraction using PyMuPDF
"""
import fitz  # PyMuPDF
import logging
from fastapi import FastAPI, File, UploadFile, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time

from .config import settings
from .models import ParseResponse, HealthResponse, ErrorResponse
from .parser import get_parser

# Configure logging
logging.basicConfig(
    level=getattr(logging, settings.LOG_LEVEL),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title=settings.SERVICE_NAME,
    version=settings.SERVICE_VERSION,
    description="PDF text extraction service using PyMuPDF (fitz)",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get parser instance
parser = get_parser()


@app.get("/", tags=["Root"])
async def root():
    """Root endpoint - service information"""
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "status": "running",
        "endpoints": {
            "health": "/health",
            "parse": "/api/parse",
            "docs": "/docs"
        }
    }


@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """
    Health check endpoint
    Returns service status and version information
    """
    return HealthResponse(
        status="healthy",
        version=settings.SERVICE_VERSION,
        pymupdf_version=fitz.version[0]  # PyMuPDF version
    )


@app.get("/status", tags=["Health"])
async def status_check():
    """
    Detailed status endpoint
    Returns comprehensive service status
    """
    return {
        "service": settings.SERVICE_NAME,
        "version": settings.SERVICE_VERSION,
        "status": "operational",
        "environment": settings.ENVIRONMENT,
        "pymupdf_version": fitz.version[0],
        "max_file_size_mb": settings.MAX_FILE_SIZE / (1024 * 1024),
        "cors_origins": settings.CORS_ORIGINS
    }


@app.post(
    "/api/parse",
    response_model=ParseResponse,
    tags=["PDF Parsing"],
    responses={
        200: {"description": "PDF parsed successfully"},
        400: {"description": "Invalid PDF or parsing error"},
        413: {"description": "File too large"},
        500: {"description": "Internal server error"}
    }
)
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parse PDF file and extract structured text
    
    **Parameters:**
    - **file**: PDF file to parse (multipart/form-data)
    
    **Returns:**
    - ParseResponse with extracted text and metadata
    
    **Error Handling:**
    - Corrupted PDF files
    - Empty text extraction
    - Invalid file format
    - File size limits
    """
    start_time = time.time()
    
    logger.info(f"Received PDF parse request: {file.filename}")
    
    try:
        # Validate file type
        if not file.content_type == "application/pdf":
            logger.warning(f"Invalid content type: {file.content_type}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid file type. Expected application/pdf, got {file.content_type}"
            )
        
        # Read file content
        pdf_bytes = await file.read()
        file_size = len(pdf_bytes)
        
        logger.info(f"File size: {file_size} bytes ({file_size / 1024:.2f} KB)")
        
        # Validate file size
        if file_size > settings.MAX_FILE_SIZE:
            logger.warning(f"File too large: {file_size} bytes")
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File size ({file_size} bytes) exceeds maximum ({settings.MAX_FILE_SIZE} bytes)"
            )
        
        # Parse PDF
        result = parser.parse_pdf(pdf_bytes, file.filename or "unknown.pdf")
        
        # Calculate processing time
        processing_time = time.time() - start_time
        logger.info(
            f"PDF parsing completed in {processing_time:.2f}s - "
            f"Status: {result.status}, Pages: {result.total_pages}, "
            f"Text length: {len(result.raw_text)}"
        )
        
        # Return appropriate status code based on result
        if result.status == "failed":
            # Return 400 for parsing failures but with structured response
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content=result.model_dump()
            )
        
        return result
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
        
    except Exception as e:
        logger.error(f"Unexpected error during PDF parsing: {e}", exc_info=True)
        
        # Return structured error response
        error_response = ParseResponse(
            file_name=file.filename or "unknown.pdf",
            total_pages=0,
            raw_text="",
            pages=[],
            status="failed",
            error=f"Internal server error: {str(e)}"
        )
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response.model_dump()
        )


@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler for unhandled errors"""
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "detail": "Internal server error",
            "error": str(exc)
        }
    )


# Startup event
@app.on_event("startup")
async def startup_event():
    """Log startup information"""
    logger.info(f"Starting {settings.SERVICE_NAME} v{settings.SERVICE_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"PyMuPDF version: {fitz.version[0]}")
    logger.info(f"Max file size: {settings.MAX_FILE_SIZE / (1024 * 1024):.2f} MB")
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")


# Shutdown event
@app.on_event("shutdown")
async def shutdown_event():
    """Log shutdown information"""
    logger.info(f"Shutting down {settings.SERVICE_NAME}")


if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.ENVIRONMENT == "development",
        log_level=settings.LOG_LEVEL.lower()
    )

# Made with Bob

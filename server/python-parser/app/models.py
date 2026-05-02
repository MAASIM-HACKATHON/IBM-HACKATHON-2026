"""
Pydantic models for PDF parser API
Matches core/pdf_parse_output_schema.json
"""
from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class PageData(BaseModel):
    """Individual page data"""
    page_number: int = Field(..., description="Page number (1-indexed)")
    text: str = Field(..., description="Extracted text from the page")


class ParseResponse(BaseModel):
    """
    PDF parse response matching core/pdf_parse_output_schema.json
    """
    file_name: str = Field(..., description="Original filename")
    total_pages: int = Field(..., description="Total number of pages in PDF")
    raw_text: str = Field(..., description="Complete extracted text from all pages")
    pages: List[PageData] = Field(default_factory=list, description="Per-page text data")
    status: Literal["success", "failed"] = Field(..., description="Parse status")
    error: Optional[str] = Field(None, description="Error message if status is failed")

    class Config:
        json_schema_extra = {
            "example": {
                "file_name": "resume.pdf",
                "total_pages": 2,
                "raw_text": "John Doe\nSoftware Engineer...",
                "pages": [
                    {"page_number": 1, "text": "John Doe\nSoftware Engineer..."},
                    {"page_number": 2, "text": "Education\nBachelor of Science..."}
                ],
                "status": "success",
                "error": None
            }
        }


class ErrorResponse(BaseModel):
    """Error response for API errors"""
    detail: str = Field(..., description="Error message")
    status_code: int = Field(..., description="HTTP status code")

    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Invalid PDF file",
                "status_code": 400
            }
        }


class HealthResponse(BaseModel):
    """Health check response"""
    status: str = Field(..., description="Service status")
    version: str = Field(..., description="Service version")
    pymupdf_version: str = Field(..., description="PyMuPDF library version")

    class Config:
        json_schema_extra = {
            "example": {
                "status": "healthy",
                "version": "1.0.0",
                "pymupdf_version": "1.23.8"
            }
        }

# Made with Bob

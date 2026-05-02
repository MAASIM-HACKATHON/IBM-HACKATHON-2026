"""
PDF Parser using PyMuPDF (fitz)
Extracts structured text from PDF files with error handling
"""
import fitz  # PyMuPDF
import logging
from typing import Optional
from .models import ParseResponse, PageData
from .utils import clean_pdf_text, validate_text_content

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class PDFParseError(Exception):
    """Custom exception for PDF parsing errors"""
    pass


class PDFParser:
    """
    PDF parser using PyMuPDF (fitz) library
    Handles text extraction with proper error handling
    """
    
    def __init__(self, max_file_size: int = 10 * 1024 * 1024):
        """
        Initialize PDF parser
        
        Args:
            max_file_size: Maximum file size in bytes (default 10MB)
        """
        self.max_file_size = max_file_size
        logger.info(f"PDFParser initialized with max_file_size={max_file_size} bytes")
    
    def parse_pdf(self, pdf_bytes: bytes, filename: str) -> ParseResponse:
        """
        Parse PDF file and extract structured text
        
        Args:
            pdf_bytes: PDF file content as bytes
            filename: Original filename
            
        Returns:
            ParseResponse with extracted text or error
        """
        logger.info(f"Starting PDF parse for file: {filename} ({len(pdf_bytes)} bytes)")
        
        # Validate file size
        if len(pdf_bytes) > self.max_file_size:
            error_msg = f"File size ({len(pdf_bytes)} bytes) exceeds maximum ({self.max_file_size} bytes)"
            logger.error(error_msg)
            return ParseResponse(
                file_name=filename,
                total_pages=0,
                raw_text="",
                pages=[],
                status="failed",
                error=error_msg
            )
        
        # Validate PDF signature
        if not self._is_valid_pdf(pdf_bytes):
            error_msg = "Invalid PDF file: Missing PDF signature"
            logger.error(error_msg)
            return ParseResponse(
                file_name=filename,
                total_pages=0,
                raw_text="",
                pages=[],
                status="failed",
                error=error_msg
            )
        
        try:
            # Open PDF document
            logger.info("Opening PDF with PyMuPDF...")
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            # Extract metadata
            total_pages = len(doc)
            logger.info(f"PDF opened successfully. Total pages: {total_pages}")
            
            if total_pages == 0:
                doc.close()
                error_msg = "PDF contains no pages"
                logger.error(error_msg)
                return ParseResponse(
                    file_name=filename,
                    total_pages=0,
                    raw_text="",
                    pages=[],
                    status="failed",
                    error=error_msg
                )
            
            # Extract text from each page
            pages_data = []
            raw_text_parts = []
            
            for page_num in range(total_pages):
                try:
                    page = doc[page_num]
                    
                    # Extract text with layout preservation
                    # Using "text" mode for better reading order
                    page_text = page.get_text("text")
                    
                    # Clean and normalize text
                    cleaned_text = clean_pdf_text(page_text)
                    
                    # Store page data
                    pages_data.append(PageData(
                        page_number=page_num + 1,  # 1-indexed
                        text=cleaned_text
                    ))
                    
                    raw_text_parts.append(cleaned_text)
                    
                    logger.debug(f"Extracted {len(cleaned_text)} chars from page {page_num + 1}")
                    
                except Exception as page_error:
                    logger.warning(f"Error extracting text from page {page_num + 1}: {page_error}")
                    # Continue with other pages
                    pages_data.append(PageData(
                        page_number=page_num + 1,
                        text=""
                    ))
            
            # Close document
            doc.close()
            
            # Combine all page text
            raw_text = "\n\n".join(raw_text_parts)
            
            # Validate extracted text
            is_valid, validation_error = validate_text_content(raw_text)
            
            if not is_valid:
                logger.error(f"Text validation failed: {validation_error}")
                return ParseResponse(
                    file_name=filename,
                    total_pages=total_pages,
                    raw_text=raw_text,
                    pages=pages_data,
                    status="failed",
                    error=validation_error
                )
            
            logger.info(f"PDF parsing successful. Extracted {len(raw_text)} characters from {total_pages} pages")
            
            return ParseResponse(
                file_name=filename,
                total_pages=total_pages,
                raw_text=raw_text,
                pages=pages_data,
                status="success",
                error=None
            )
            
        except fitz.FileDataError as e:
            error_msg = f"Corrupted PDF: {str(e)}"
            logger.error(f"FileDataError: {error_msg}")
            return ParseResponse(
                file_name=filename,
                total_pages=0,
                raw_text="",
                pages=[],
                status="failed",
                error=error_msg
            )
            
        except fitz.EmptyFileError as e:
            error_msg = f"Empty PDF file: {str(e)}"
            logger.error(f"EmptyFileError: {error_msg}")
            return ParseResponse(
                file_name=filename,
                total_pages=0,
                raw_text="",
                pages=[],
                status="failed",
                error=error_msg
            )
            
        except Exception as e:
            error_msg = f"PDF parsing failed: {str(e)}"
            logger.error(f"Unexpected error: {error_msg}", exc_info=True)
            return ParseResponse(
                file_name=filename,
                total_pages=0,
                raw_text="",
                pages=[],
                status="failed",
                error=error_msg
            )
    
    def _is_valid_pdf(self, pdf_bytes: bytes) -> bool:
        """
        Validate PDF signature (magic bytes)
        
        Args:
            pdf_bytes: PDF file content
            
        Returns:
            True if valid PDF signature found
        """
        if len(pdf_bytes) < 4:
            return False
        
        # Check for PDF signature: %PDF
        return pdf_bytes[:4] == b'%PDF'
    
    def get_pdf_info(self, pdf_bytes: bytes) -> Optional[dict]:
        """
        Extract PDF metadata without full parsing
        
        Args:
            pdf_bytes: PDF file content
            
        Returns:
            Dictionary with PDF metadata or None if error
        """
        try:
            doc = fitz.open(stream=pdf_bytes, filetype="pdf")
            
            metadata = {
                "page_count": len(doc),
                "format": doc.metadata.get("format", "Unknown"),
                "title": doc.metadata.get("title", ""),
                "author": doc.metadata.get("author", ""),
                "subject": doc.metadata.get("subject", ""),
                "creator": doc.metadata.get("creator", ""),
                "producer": doc.metadata.get("producer", ""),
                "creation_date": doc.metadata.get("creationDate", ""),
                "modification_date": doc.metadata.get("modDate", ""),
            }
            
            doc.close()
            return metadata
            
        except Exception as e:
            logger.error(f"Error extracting PDF metadata: {e}")
            return None


# Singleton instance
_parser_instance: Optional[PDFParser] = None


def get_parser() -> PDFParser:
    """
    Get or create PDF parser singleton instance
    
    Returns:
        PDFParser instance
    """
    global _parser_instance
    if _parser_instance is None:
        _parser_instance = PDFParser()
    return _parser_instance

# Made with Bob

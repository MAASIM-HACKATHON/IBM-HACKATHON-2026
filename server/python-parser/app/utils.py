"""
Text processing utilities for PDF parsing
Handles UTF-8 normalization and text cleaning
"""
import re
import unicodedata
from typing import Optional


def normalize_utf8(text: str) -> str:
    """
    Normalize text to clean UTF-8 encoding
    
    Args:
        text: Raw text from PDF
        
    Returns:
        Normalized UTF-8 text
    """
    if not text:
        return ""
    
    # Normalize unicode characters (NFC form)
    text = unicodedata.normalize('NFC', text)
    
    # Ensure UTF-8 encoding
    text = text.encode('utf-8', errors='ignore').decode('utf-8')
    
    return text


def remove_control_chars(text: str) -> str:
    """
    Remove non-printable control characters except newlines and tabs
    
    Args:
        text: Input text
        
    Returns:
        Text without control characters
    """
    if not text:
        return ""
    
    # Keep newlines (\n), carriage returns (\r), and tabs (\t)
    # Remove other control characters
    cleaned = ''.join(
        char for char in text
        if char in '\n\r\t' or not unicodedata.category(char).startswith('C')
    )
    
    return cleaned


def normalize_whitespace(text: str) -> str:
    """
    Normalize whitespace while preserving paragraph structure
    
    Args:
        text: Input text
        
    Returns:
        Text with normalized whitespace
    """
    if not text:
        return ""
    
    # Replace multiple spaces with single space
    text = re.sub(r' +', ' ', text)
    
    # Replace multiple newlines with double newline (paragraph break)
    text = re.sub(r'\n\s*\n\s*\n+', '\n\n', text)
    
    # Remove trailing whitespace from each line
    lines = [line.rstrip() for line in text.split('\n')]
    text = '\n'.join(lines)
    
    return text.strip()


def validate_text_content(text: str, min_length: int = 100) -> tuple[bool, Optional[str]]:
    """
    Validate that extracted text is meaningful
    
    Args:
        text: Extracted text
        min_length: Minimum character count for valid text
        
    Returns:
        Tuple of (is_valid, error_message)
    """
    if not text or not text.strip():
        return False, "No text extracted from PDF"
    
    cleaned_text = text.strip()
    
    if len(cleaned_text) < min_length:
        return False, f"Extracted text too short ({len(cleaned_text)} chars, minimum {min_length})"
    
    # Check if text contains mostly printable characters
    printable_chars = sum(1 for c in cleaned_text if c.isprintable() or c in '\n\r\t')
    printable_ratio = printable_chars / len(cleaned_text)
    
    if printable_ratio < 0.8:
        return False, "Extracted text contains too many non-printable characters"
    
    return True, None


def clean_pdf_text(text: str) -> str:
    """
    Complete text cleaning pipeline for PDF text
    
    Args:
        text: Raw text from PDF
        
    Returns:
        Cleaned and normalized text
    """
    if not text:
        return ""
    
    # Step 1: Normalize UTF-8
    text = normalize_utf8(text)
    
    # Step 2: Remove control characters
    text = remove_control_chars(text)
    
    # Step 3: Normalize whitespace
    text = normalize_whitespace(text)
    
    return text


def extract_metadata_from_text(text: str) -> dict:
    """
    Extract basic metadata from text content
    
    Args:
        text: Cleaned text
        
    Returns:
        Dictionary with metadata
    """
    if not text:
        return {
            "char_count": 0,
            "word_count": 0,
            "line_count": 0,
            "paragraph_count": 0
        }
    
    lines = text.split('\n')
    words = text.split()
    paragraphs = [p for p in text.split('\n\n') if p.strip()]
    
    return {
        "char_count": len(text),
        "word_count": len(words),
        "line_count": len(lines),
        "paragraph_count": len(paragraphs)
    }

# Made with Bob

import { NextRequest, NextResponse } from 'next/server';
import { getPythonParserClient, isPythonParserAvailable } from '@/services/pythonParserClient';
import { ParseResponse as PythonParseResponse } from '@/types/pdf-parser.types';

// Cache pdf-parse import
let pdfParseCache: any = null;
async function getPdfParse() {
  if (!pdfParseCache) {
    // @ts-ignore - pdf-parse doesn't have TypeScript definitions
    pdfParseCache = (await import('pdf-parse')).default;
  }
  return pdfParseCache;
}

// Feature flags
const USE_PYTHON_PARSER = process.env.USE_PYTHON_PARSER !== 'false';

/**
 * Extract text from PDF files
 */
async function extractTextFromPDF(buffer: ArrayBuffer): Promise<string> {
  // Try Python parser first (PyMuPDF)
  if (USE_PYTHON_PARSER && isPythonParserAvailable()) {
    try {
      const pythonClient = getPythonParserClient();
      const nodeBuffer = Buffer.from(buffer);
      const pythonResponse: PythonParseResponse = await pythonClient.parsePDF(
        nodeBuffer,
        'document.pdf'
      );
      
      if (pythonResponse.success && pythonResponse.text) {
        console.log('✅ PDF parsed with Python parser (PyMuPDF)');
        return pythonResponse.text;
      }
    } catch (error) {
      console.warn('⚠️  Python parser failed, falling back to pdf-parse');
    }
  }
  
  // Fallback to pdf-parse
  const pdfParse = await getPdfParse();
  const nodeBuffer = Buffer.from(buffer);
  const result = await pdfParse(nodeBuffer);
  
  if (!result.text || result.text.length === 0) {
    throw new Error('PDF contains no extractable text. The PDF may be image-based or scanned.');
  }
  
  console.log('✅ PDF parsed with pdf-parse');
  return result.text;
}

/**
 * Extract text from various document types
 */
async function extractTextFromFile(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  // For PDF files
  if (mimeType === 'application/pdf') {
    return await extractTextFromPDF(buffer);
  }
  
  // For text-based files
  if (
    mimeType.startsWith('text/') ||
    mimeType === 'application/json' ||
    mimeType === 'application/xml' ||
    mimeType === 'application/javascript'
  ) {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }
  
  // For other document types, try to decode as text
  try {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  } catch (error) {
    throw new Error(`Unsupported file type: ${mimeType}`);
  }
}

/**
 * POST /api/document/parse
 * Parse document and extract text content
 */
export async function POST(request: NextRequest) {
  try {
    console.log('\n[Document Parse API] Processing request...');
    
    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }
    
    console.log(`[Document Parse API] File: ${file.name} (${file.type}, ${file.size} bytes)`);
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }
    
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    
    // Extract text
    const startTime = Date.now();
    const text = await extractTextFromFile(arrayBuffer, file.type);
    const extractionTime = Date.now() - startTime;
    
    console.log(`[Document Parse API] Extraction completed in ${extractionTime}ms`);
    console.log(`[Document Parse API] Extracted ${text.length} characters`);
    
    return NextResponse.json({
      success: true,
      content: text.trim(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      extractionTime,
    });
    
  } catch (error) {
    console.error('[Document Parse API] Error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to parse document',
      },
      { status: 500 }
    );
  }
}

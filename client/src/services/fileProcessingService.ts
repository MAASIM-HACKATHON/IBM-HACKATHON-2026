/**
 * File Processing Service
 * Handles file upload, text extraction, and content processing for email generation
 */

export interface FileProcessingResult {
  content: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  success: boolean;
  error?: string;
}

/**
 * Supported file types for text extraction
 */
const SUPPORTED_FILE_TYPES = {
  // Text files
  'text/plain': true,
  'text/html': true,
  'text/markdown': true,
  'text/csv': true,
  
  // Document files
  'application/pdf': true,
  'application/msword': true,
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': true,
  'application/vnd.ms-excel': true,
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': true,
  'application/vnd.ms-powerpoint': true,
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': true,
  
  // Code files
  'application/json': true,
  'application/xml': true,
  'text/xml': true,
  'application/javascript': true,
  'text/javascript': true,
  
  // Rich text
  'application/rtf': true,
};

/**
 * Extract text content from various file types
 */
async function extractTextFromFile(file: File): Promise<string> {
  const fileType = file.type || getFileTypeFromExtension(file.name);
  
  // For text-based files, read directly
  if (
    fileType.startsWith('text/') ||
    fileType === 'application/json' ||
    fileType === 'application/xml' ||
    fileType === 'application/javascript'
  ) {
    return await readTextFile(file);
  }
  
  // For PDF files, attempt to extract text
  if (fileType === 'application/pdf') {
    return await extractTextFromPDF(file);
  }
  
  // For Office documents, try to extract text
  if (
    fileType.includes('word') ||
    fileType.includes('excel') ||
    fileType.includes('powerpoint') ||
    fileType === 'application/rtf'
  ) {
    return await extractTextFromOfficeDocument(file);
  }
  
  // Fallback: try to read as text
  return await readTextFile(file);
}

/**
 * Read text file content
 */
function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content || '');
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsText(file);
  });
}

/**
 * Extract text from PDF files
 * Note: This is a basic implementation. For production, consider using pdf.js or similar library
 */
async function extractTextFromPDF(file: File): Promise<string> {
  try {
    // Try to read as text (works for some PDFs)
    const text = await readTextFile(file);
    
    if (text && text.trim().length > 0) {
      return cleanExtractedText(text);
    }
    
    // If direct text extraction fails, inform user
    throw new Error('PDF text extraction requires additional processing. Please copy and paste the text instead.');
  } catch (error) {
    throw new Error('Unable to extract text from PDF. Please copy and paste the content instead.');
  }
}

/**
 * Extract text from Office documents
 * Note: This is a placeholder. For production, consider using mammoth.js for DOCX or similar libraries
 */
async function extractTextFromOfficeDocument(file: File): Promise<string> {
  try {
    // Attempt to read as text (works for some formats)
    const text = await readTextFile(file);
    
    if (text && text.trim().length > 0) {
      return cleanExtractedText(text);
    }
    
    throw new Error('Office document text extraction requires additional processing. Please copy and paste the text instead.');
  } catch (error) {
    throw new Error('Unable to extract text from document. Please copy and paste the content instead.');
  }
}

/**
 * Clean extracted text by removing excessive whitespace and special characters
 */
function cleanExtractedText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/^\s+|\s+$/gm, '')
    .trim();
}

/**
 * Get file type from file extension
 */
function getFileTypeFromExtension(fileName: string): string {
  const extension = fileName.split('.').pop()?.toLowerCase();
  
  const extensionMap: Record<string, string> = {
    'txt': 'text/plain',
    'md': 'text/markdown',
    'html': 'text/html',
    'htm': 'text/html',
    'csv': 'text/csv',
    'json': 'application/json',
    'xml': 'application/xml',
    'js': 'application/javascript',
    'ts': 'text/plain',
    'jsx': 'text/plain',
    'tsx': 'text/plain',
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'ppt': 'application/vnd.ms-powerpoint',
    'pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'rtf': 'application/rtf',
  };
  
  return extensionMap[extension || ''] || 'text/plain';
}

/**
 * Validate file before processing
 */
function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size (max 10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'File size exceeds 10MB limit. Please use a smaller file.',
    };
  }
  
  // Check if file type is supported
  const fileType = file.type || getFileTypeFromExtension(file.name);
  if (!SUPPORTED_FILE_TYPES[fileType as keyof typeof SUPPORTED_FILE_TYPES] && !fileType.startsWith('text/')) {
    return {
      valid: false,
      error: `File type "${fileType}" is not supported. Please use text, PDF, or Office documents.`,
    };
  }
  
  return { valid: true };
}

/**
 * Process uploaded file and extract text content
 */
export async function processUploadedFile(file: File): Promise<FileProcessingResult> {
  try {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
      return {
        content: '',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        success: false,
        error: validation.error,
      };
    }
    
    // Extract text content
    const content = await extractTextFromFile(file);
    
    if (!content || content.trim().length === 0) {
      return {
        content: '',
        fileName: file.name,
        fileType: file.type,
        fileSize: file.size,
        success: false,
        error: 'No text content could be extracted from the file.',
      };
    }
    
    return {
      content: content.trim(),
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      success: true,
    };
  } catch (error) {
    return {
      content: '',
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process file',
    };
  }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

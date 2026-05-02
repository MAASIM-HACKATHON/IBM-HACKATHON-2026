import { NextRequest, NextResponse } from 'next/server';
import { getPythonParserClient, isPythonParserAvailable } from '@/services/pythonParserClient';
import { ParseResponse as PythonParseResponse } from '@/types/pdf-parser.types';
import { ResumeParserService } from '@/services/resumeParserService';
import { ResumeValidationService } from '@/services/resumeValidationService';

// Cache pdf-parse import to avoid repeated dynamic imports (performance optimization)
// @ts-ignore - pdf-parse doesn't have TypeScript definitions
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
const USE_AI_PARSER = process.env.USE_AI_PARSER !== 'false';

// Initialize AI services
const aiParser = new ResumeParserService();
const validator = new ResumeValidationService();

// Performance tracking
interface PerformanceMetrics {
  extractionTime: number;
  parsingTime: number;
  totalTime: number;
}

// Environment-based logging (reduce verbosity in production)
const isDevelopment = process.env.NODE_ENV !== 'production';
const log = {
  info: (...args: any[]) => isDevelopment && console.log(...args),
  error: (...args: any[]) => console.error(...args),
  debug: (...args: any[]) => isDevelopment && console.log(...args),
};

interface ParsedResumeData {
  rawText: string;
  parsedSections: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    summary?: string;
    skills: string[];
    workExperience: Array<{
      title: string;
      company: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      duration: string;
      yearsOfExperience?: number;
      description?: string;
      achievements?: string[];
      skills?: string[];
    }>;
    projects: Array<{
      name: string;
      description: string;
      role?: string;
      duration?: string;
      technologies?: string[];
      skills?: string[];
      achievements?: string[];
      link?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location?: string;
      year?: string;
      field?: string;
      gpa?: string;
      honors?: string[];
    }>;
    certifications: string[];
  };
  metadata?: {
    parsingMethod: 'ai_hybrid' | 'rule_based_fallback';
    confidence: number;
    warnings: string[];
    processingTime?: number;
  };
  skills?: string[];
  workExperience?: Array<any>;
  projects?: Array<any>;
  education?: Array<any>;
  certifications?: string[];
}

// CORS headers helper
function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const timestamp = new Date().toISOString();
  console.log(`\n${'='.repeat(80)}`);
  console.log(`[${timestamp}] 🖥️  SERVER: Resume Parse API Called`);
  console.log(`${'='.repeat(80)}`);
  
  const origin = request.headers.get('origin');
  console.log('Request origin:', origin);
  const corsHeaders = getCorsHeaders(origin);
  console.log('CORS headers set:', corsHeaders);

  try {
    console.log(`\n[${new Date().toISOString()}] 📦 STEP 1: Extracting FormData`);
    const formData = await request.formData();
    console.log('✓ FormData extracted');
    
    const file = formData.get('file') as File;
    console.log('File from FormData:', file ? 'Found' : 'Not found');

    if (!file) {
      console.error('❌ ERROR: No file provided in request');
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    console.log('📋 File Details:', {
      name: file.name,
      type: file.type,
      size: `${(file.size / 1024).toFixed(2)} KB`,
    });

    // Validate file type
    console.log(`\n[${new Date().toISOString()}] 🔍 STEP 2: Validating File Type`);
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    console.log('Valid types:', validTypes);
    console.log('Received type:', file.type);
    
    if (!validTypes.includes(file.type)) {
      console.error('❌ VALIDATION FAILED: Invalid file type');
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, or TXT file.' },
        { status: 400, headers: corsHeaders }
      );
    }
    console.log('✅ File type validation passed');

    // Validate file size (10MB)
    console.log(`\n[${new Date().toISOString()}] 🔍 STEP 3: Validating File Size`);
    console.log('File size:', `${(file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log('Max allowed:', '10 MB');
    
    if (file.size > 10 * 1024 * 1024) {
      console.error('❌ VALIDATION FAILED: File size exceeds limit');
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400, headers: corsHeaders }
      );
    }
    console.log('✅ File size validation passed');

    // Read file content
    console.log(`\n[${new Date().toISOString()}] 📖 STEP 4: Reading File Content`);
    const buffer = await file.arrayBuffer();
    console.log('✓ File buffer created, size:', buffer.byteLength, 'bytes');
    
    // STEP 4.5: Try Python Parser Service (PyMuPDF) for PDF files
    let text: string;
    let usedPythonParser = false;
    
    if (USE_PYTHON_PARSER && file.type === 'application/pdf') {
      console.log(`\n[${new Date().toISOString()}] 🐍 STEP 4.5: Attempting Python Parser (PyMuPDF)`);
      
      try {
        const pythonClient = getPythonParserClient();
        const nodeBuffer = Buffer.from(buffer);
        
        console.log('✓ Calling Python parser microservice...');
        const pythonStartTime = Date.now();
        
        const pythonResponse: PythonParseResponse = await pythonClient.parsePDF(
          nodeBuffer,
          file.name
        );
        
        const pythonEndTime = Date.now();
        console.log(`✓ Python parser completed in ${pythonEndTime - pythonStartTime}ms`);
        console.log(`  Status: ${pythonResponse.status}`);
        console.log(`  Pages: ${pythonResponse.total_pages}`);
        console.log(`  Text length: ${pythonResponse.raw_text.length} characters`);
        
        if (pythonResponse.status === 'success' && pythonResponse.raw_text) {
          text = pythonResponse.raw_text;
          usedPythonParser = true;
          console.log('✅ Using Python parser result');
        } else {
          console.warn('⚠️  Python parser returned failed status, falling back to pdf-parse');
          console.warn(`  Error: ${pythonResponse.error}`);
          throw new Error(pythonResponse.error || 'Python parser failed');
        }
        
      } catch (pythonError) {
        console.warn('⚠️  Python parser unavailable or failed, falling back to pdf-parse');
        console.warn('  Error:', pythonError instanceof Error ? pythonError.message : String(pythonError));
        
        // Fallback to pdf-parse
        console.log(`\n[${new Date().toISOString()}] 🔤 STEP 5 (Fallback): Extracting Text with pdf-parse`);
        const extractStartTime = Date.now();
        text = await extractTextFromFile(buffer, file.type);
        const extractEndTime = Date.now();
        console.log(`✓ Fallback extraction completed in ${extractEndTime - extractStartTime}ms`);
      }
    } else {
      // Use existing extraction for non-PDF files or if Python parser disabled
      console.log(`\n[${new Date().toISOString()}] 🔤 STEP 5: Extracting Text from File`);
      console.log('File type for extraction:', file.type);
      const extractStartTime = Date.now();
      
      text = await extractTextFromFile(buffer, file.type);
      
      const extractEndTime = Date.now();
      console.log(`✓ Text extraction completed in ${extractEndTime - extractStartTime}ms`);
    }
    
    // Log extraction summary
    console.log(`\n[${new Date().toISOString()}] ✅ Text Extraction Complete`);
    console.log(`  Parser used: ${usedPythonParser ? 'Python (PyMuPDF)' : 'pdf-parse'}`);
    console.log(`  Extracted text length: ${text.length} characters`);
    console.log(`  Text preview (first 500 chars):\n${text.substring(0, 500)}`);

    // STEP 6: AI-Powered Parsing with Hybrid Fallback
    let parsedData: ParsedResumeData;
    
    if (USE_AI_PARSER && aiParser.isAvailable()) {
      console.log(`\n[${new Date().toISOString()}] 🤖 STEP 6: AI-Powered Resume Parsing`);
      console.log('Using Watsonx Granite for intelligent parsing...');
      
      try {
        const aiStartTime = Date.now();
        
        // Step 6.1: AI structuring
        console.log('  [6.1] Calling Watsonx Granite AI...');
        const aiParsedData = await aiParser.parseResume(text);
        console.log('  ✓ AI parsing complete');
        
        // Step 6.2: Schema validation
        console.log('  [6.2] Validating schema...');
        const schemaValidation = validator.validateSchema(aiParsedData);
        if (!schemaValidation.isValid) {
          console.warn('  ⚠️  Schema validation failed:', schemaValidation.errors);
          throw new Error('AI parsing produced invalid schema');
        }
        console.log('  ✓ Schema validation passed');
        
        // Step 6.3: Data quality validation
        console.log('  [6.3] Validating data quality...');
        const qualityValidation = validator.validateDataQuality(aiParsedData);
        if (qualityValidation.warnings.length > 0) {
          console.log('  ⚠️  Quality warnings:', qualityValidation.warnings);
        }
        console.log('  ✓ Quality validation complete');
        
        // Step 6.4: Apply corrections
        console.log('  [6.4] Applying fallback corrections...');
        const correctedData = validator.applyFallbackCorrections(aiParsedData, text);
        console.log('  ✓ Corrections applied');
        
        // Step 6.5: Calculate confidence
        const confidence = validator.calculateConfidence(
          correctedData,
          schemaValidation.errors,
          qualityValidation.warnings
        );
        console.log(`  [6.5] Confidence score: ${confidence}%`);
        
        // Convert to standard format
        parsedData = aiParser.convertToStandardFormat(correctedData, text);
        parsedData.metadata = {
          parsingMethod: 'ai_hybrid',
          confidence,
          warnings: qualityValidation.warnings,
          processingTime: Date.now() - aiStartTime
        };
        
        const aiEndTime = Date.now();
        console.log(`✅ AI parsing complete in ${aiEndTime - aiStartTime}ms (confidence: ${confidence}%)`);
        
      } catch (aiError) {
        console.error('❌ AI parsing failed, using rule-based fallback');
        console.error('Error:', aiError instanceof Error ? aiError.message : String(aiError));
        
        // Fallback to rule-based parser
        console.log(`\n[${new Date().toISOString()}] 📋 STEP 6 (Fallback): Rule-Based Parsing`);
        const parseStartTime = Date.now();
        parsedData = parseResumeText(text);
        parsedData.metadata = {
          parsingMethod: 'rule_based_fallback',
          confidence: 60,
          warnings: ['AI parsing unavailable, used rule-based fallback'],
          processingTime: Date.now() - parseStartTime
        };
        const parseEndTime = Date.now();
        console.log(`✓ Rule-based parsing completed in ${parseEndTime - parseStartTime}ms`);
      }
    } else {
      // AI parser not available or disabled
      if (!USE_AI_PARSER) {
        console.log(`\n[${new Date().toISOString()}] 📋 STEP 6: Rule-Based Parsing (AI disabled)`);
      } else {
        console.log(`\n[${new Date().toISOString()}] 📋 STEP 6: Rule-Based Parsing (AI not configured)`);
      }
      
      const parseStartTime = Date.now();
      parsedData = parseResumeText(text);
      parsedData.metadata = {
        parsingMethod: 'rule_based_fallback',
        confidence: 60,
        warnings: [USE_AI_PARSER ? 'AI parser not configured' : 'AI parser disabled'],
        processingTime: Date.now() - parseStartTime
      };
      const parseEndTime = Date.now();
      console.log(`✓ Rule-based parsing completed in ${parseEndTime - parseStartTime}ms`);
    }
    
    console.log(`\n[${new Date().toISOString()}] 📊 STEP 7: Parsed Data Summary`);
    console.log('Parsing method:', parsedData.metadata?.parsingMethod || 'unknown');
    console.log('Confidence score:', parsedData.metadata?.confidence || 'N/A');
    console.log('Processing time:', parsedData.metadata?.processingTime || 'N/A', 'ms');
    console.log('Parsed sections:', {
      personalInfo: parsedData.parsedSections.personalInfo,
      summary: parsedData.parsedSections.summary ? 'Present' : 'None',
      skillsCount: parsedData.parsedSections.skills.length,
      skills: parsedData.parsedSections.skills,
      workExperienceCount: parsedData.parsedSections.workExperience.length,
      projectsCount: parsedData.parsedSections.projects.length,
      educationCount: parsedData.parsedSections.education.length,
      certificationsCount: parsedData.parsedSections.certifications.length,
    });
    if (parsedData.metadata?.warnings && parsedData.metadata.warnings.length > 0) {
      console.log('Warnings:', parsedData.metadata.warnings);
    }

    console.log(`\n[${new Date().toISOString()}] ✅ STEP 8: Returning Parsed Data`);
    console.log(`${'='.repeat(80)}`);
    console.log(`[${new Date().toISOString()}] ✅ SERVER: Resume Parse Completed Successfully`);
    console.log(`${'='.repeat(80)}\n`);

    return NextResponse.json(parsedData, { headers: corsHeaders });
  } catch (error) {
    const errorTimestamp = new Date().toISOString();
    console.error(`\n${'='.repeat(80)}`);
    console.error(`[${errorTimestamp}] ❌ SERVER ERROR`);
    console.error(`${'='.repeat(80)}`);
    console.error('Resume parsing error:', error);
    console.error('Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('Error message:', error instanceof Error ? error.message : String(error));
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error(`${'='.repeat(80)}\n`);
    
    return NextResponse.json(
      { error: 'Failed to parse resume file' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function extractTextFromFile(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  console.log(`\n[${new Date().toISOString()}] 🔤 extractTextFromFile: Starting text extraction`);
  console.log('MIME type:', mimeType);
  console.log('Buffer size:', buffer.byteLength, 'bytes');

  // For text files, directly convert
  if (mimeType === 'text/plain') {
    console.log('✓ Detected as text/plain - using direct decoding');
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(buffer);
    console.log('✓ Text decoded, length:', text.length, 'characters');
    return text;
  }

  // For PDF files - extract text using pdf-parse library (v1.x)
  if (mimeType === 'application/pdf') {
    console.log('✓ Detected as PDF - using pdf-parse v1.x library');
    try {
      // Optimize: Create Uint8Array view without copying data
      const uint8Array = new Uint8Array(buffer);
      
      // Fast PDF signature validation (only check first 4 bytes)
      if (uint8Array[0] !== 0x25 || uint8Array[1] !== 0x50 ||
          uint8Array[2] !== 0x44 || uint8Array[3] !== 0x46) {
        throw new Error('Invalid PDF file: Missing PDF signature');
      }
      console.log('✓ PDF signature validated');
      
      console.log('✓ Parsing PDF with pdf-parse v1.x...');
      
      // OPTIMIZED: Convert ArrayBuffer to Node.js Buffer efficiently
      // Buffer.from() with ArrayBuffer creates a view, not a copy (memory efficient)
      const nodeBuffer = Buffer.from(buffer);
      console.log('✓ Buffer ready, size:', nodeBuffer.length, 'bytes');
      
      // Use cached pdf-parse import for better performance
      const pdfParse = await getPdfParse();
      
      // Parse PDF - v1.x accepts Buffer directly and returns a promise
      const parseStartTime = Date.now();
      const result = await pdfParse(nodeBuffer);
      const parseEndTime = Date.now();
      
      console.log(`✓ PDF parsing completed in ${parseEndTime - parseStartTime}ms`);
      
      console.log('✓ PDF parsed successfully');
      console.log('  - Total pages:', result.numpages);
      console.log('  - Text length:', result.text.length, 'characters');
      console.log('  - Raw text preview (first 500 chars):', result.text.substring(0, 500));
      
      // OPTIMIZED VALIDATION: Ensure extracted text is valid and meaningful
      const extractedText = result.text?.trim() || '';
      const textLength = extractedText.length;
      const minValidTextLength = 100; // Minimum characters for a valid resume
      
      // Fast validation checks
      if (textLength === 0) {
        log.error('❌ VALIDATION FAILED: PDF parsed but no text extracted');
        throw new Error('PDF contains no extractable text. The PDF may be image-based or scanned.');
      }
      
      if (textLength < minValidTextLength) {
        log.error(`❌ VALIDATION FAILED: Extracted text too short (${textLength} chars, minimum ${minValidTextLength})`);
        log.debug('Extracted content:', extractedText);
        throw new Error(`PDF text extraction incomplete. Only ${textLength} characters extracted.`);
      }
      
      // Optimized: Single toLowerCase() call and early exit
      const lowerText = extractedText.toLowerCase();
      const errorIndicators = ['error parsing', 'corrupted', 'password-protected'];
      for (const indicator of errorIndicators) {
        if (lowerText.includes(indicator)) {
          log.error('❌ VALIDATION FAILED: Extracted text appears to be an error message');
          log.debug('Suspicious content:', extractedText.substring(0, 200));
          throw new Error('PDF text extraction returned invalid content');
        }
      }
      
      log.info('✅ PDF extraction complete and validated');
      log.debug(`   - Extracted ${textLength} characters`);
      log.debug(`   - Contains ${extractedText.split(/\s+/).length} words`);
      log.debug(`   - Contains ${extractedText.split(/\n/).length} lines`);
      
      return extractedText;
    } catch (error) {
      console.error('❌ PDF parsing error:', error);
      console.error('Error details:', error instanceof Error ? error.message : String(error));
      console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      
      // CRITICAL: Throw error instead of returning error message string
      // This ensures the error is properly handled and not treated as valid resume text
      throw new Error(
        error instanceof Error 
          ? `PDF parsing failed: ${error.message}` 
          : 'PDF parsing failed: Unknown error'
      );
    }
  }

  // For DOCX files - extract text from XML
  if (mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
    console.log('✓ Detected as DOCX - using XML extraction');
    try {
      const uint8Array = new Uint8Array(buffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      let text = decoder.decode(uint8Array);
      
      // Extract text from DOCX XML structure
      const textMatches = text.match(/<w:t[^>]*>([^<]+)<\/w:t>/g);
      if (textMatches) {
        text = textMatches.map(match => {
          const content = match.match(/>([^<]+)</);
          return content ? content[1] : '';
        }).join(' ');
      }
      
      const extractedText = text.trim();
      const minValidTextLength = 100;
      
      if (extractedText.length === 0) {
        console.error('❌ DOCX parsed but no text extracted');
        throw new Error('DOCX contains no extractable text');
      }
      
      if (extractedText.length < minValidTextLength) {
        console.error(`❌ DOCX text too short (${extractedText.length} chars)`);
        throw new Error(`DOCX text extraction incomplete. Only ${extractedText.length} characters extracted.`);
      }
      
      console.log('✅ DOCX extraction complete and validated');
      console.log(`   - Extracted ${extractedText.length} characters`);
      return extractedText;
    } catch (error) {
      console.error('❌ DOCX parsing error:', error);
      throw new Error(
        error instanceof Error 
          ? `DOCX parsing failed: ${error.message}` 
          : 'DOCX parsing failed: Unknown error'
      );
    }
  }

  throw new Error('Unsupported file format. Please upload TXT, PDF, or DOCX file.');
}

function parseResumeText(text: string): ParsedResumeData {
  console.log(`\n[${new Date().toISOString()}] 📝 parseResumeText: Starting resume parsing`);
  console.log('Input text length:', text.length, 'characters');
  
  // CRITICAL VALIDATION: Ensure input text is valid resume content
  const minValidTextLength = 100;
  const trimmedText = text.trim();
  
  if (trimmedText.length === 0) {
    console.error('❌ VALIDATION FAILED: Empty text provided to parser');
    throw new Error('Cannot parse empty resume text');
  }
  
  if (trimmedText.length < minValidTextLength) {
    console.error(`❌ VALIDATION FAILED: Text too short (${trimmedText.length} chars, minimum ${minValidTextLength})`);
    throw new Error(`Resume text too short for parsing: ${trimmedText.length} characters`);
  }
  
  // Check if text looks like an error message (defensive check)
  const errorIndicators = [
    'error parsing',
    'unable to extract',
    'corrupted',
    'password-protected',
    'unsupported file format',
    'please try uploading'
  ];
  
  const lowerText = trimmedText.toLowerCase();
  for (const indicator of errorIndicators) {
    if (lowerText.includes(indicator)) {
      console.error('❌ VALIDATION FAILED: Input appears to be an error message, not resume content');
      console.error('Suspicious content:', trimmedText.substring(0, 200));
      throw new Error('Invalid resume content: appears to be an error message');
    }
  }
  
  console.log('✅ Input validation passed');
  
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);
  console.log('✓ Split into', lines.length, 'non-empty lines');

  const parsedData: ParsedResumeData = {
    rawText: text,
    parsedSections: {
      skills: [],
      workExperience: [],
      projects: [],
      education: [],
      certifications: [],
    },
  };
  console.log('✓ Initialized parsedData structure');

  // Extract personal info (check first 10 lines for better coverage)
  console.log(`\n[${new Date().toISOString()}] 👤 Extracting personal info from first 10 lines...`);
  parsedData.parsedSections.personalInfo = extractPersonalInfo(lines.slice(0, 10).join('\n'));
  console.log('✓ Personal info extracted:', parsedData.parsedSections.personalInfo);

  // Extract sections
  console.log(`\n[${new Date().toISOString()}] 📑 Identifying resume sections...`);
  const sections = identifySections(lines);
  console.log('✓ Sections identified:', Object.keys(sections));
  console.log('Section details:', Object.entries(sections).map(([key, val]) => `${key}: ${val.length} lines`));

  // Parse skills (with fallback to extract from entire text)
  console.log(`\n[${new Date().toISOString()}] 🎯 Parsing skills section...`);
  if (sections.skills) {
    console.log('✓ Skills section found with', sections.skills.length, 'lines');
    parsedData.parsedSections.skills = parseSkills(sections.skills);
    console.log('✓ Parsed', parsedData.parsedSections.skills.length, 'skills from section');
  } else {
    console.log('⚠️ No skills section found');
  }
  
  // Fallback: Extract skills from entire text if none found
  if (parsedData.parsedSections.skills.length === 0) {
    console.log('⚠️ No skills parsed, attempting fallback extraction from entire text...');
    parsedData.parsedSections.skills = extractSkillsFromText(text);
    console.log('✓ Fallback extraction found', parsedData.parsedSections.skills.length, 'skills');
  }
  console.log('Final skills:', parsedData.parsedSections.skills);

  // Parse work experience
  console.log(`\n[${new Date().toISOString()}] 💼 Parsing work experience...`);
  if (sections.experience) {
    console.log('✓ Experience section found with', sections.experience.length, 'lines');
    parsedData.parsedSections.workExperience = parseWorkExperience(sections.experience);
    console.log('✓ Parsed', parsedData.parsedSections.workExperience.length, 'work experiences');
    parsedData.parsedSections.workExperience.forEach((exp, idx) => {
      console.log(`  [${idx + 1}]`, exp.title, 'at', exp.company);
    });
  } else {
    console.log('⚠️ No experience section found');
  }

  // Parse projects
  console.log(`\n[${new Date().toISOString()}] 🚀 Parsing projects...`);
  if (sections.projects) {
    console.log('✓ Projects section found with', sections.projects.length, 'lines');
    parsedData.parsedSections.projects = parseProjects(sections.projects);
    console.log('✓ Parsed', parsedData.parsedSections.projects.length, 'projects');
    parsedData.parsedSections.projects.forEach((proj, idx) => {
      console.log(`  [${idx + 1}]`, proj.name);
    });
  } else {
    console.log('⚠️ No projects section found');
  }

  // Parse education
  console.log(`\n[${new Date().toISOString()}] 🎓 Parsing education...`);
  if (sections.education) {
    console.log('✓ Education section found with', sections.education.length, 'lines');
    parsedData.parsedSections.education = parseEducation(sections.education);
    console.log('✓ Parsed', parsedData.parsedSections.education.length, 'education entries');
    parsedData.parsedSections.education.forEach((edu, idx) => {
      console.log(`  [${idx + 1}]`, edu.degree, 'at', edu.institution);
    });
  } else {
    console.log('⚠️ No education section found');
  }

  // Parse certifications (check multiple section names)
  console.log(`\n[${new Date().toISOString()}] 📜 Parsing certifications...`);
  if (sections.certifications) {
    console.log('✓ Certifications section found with', sections.certifications.length, 'lines');
    parsedData.parsedSections.certifications = parseCertifications(sections.certifications);
    console.log('✓ Parsed', parsedData.parsedSections.certifications.length, 'certifications');
  } else if (sections.trainings) {
    console.log('✓ Trainings section found with', sections.trainings.length, 'lines');
    parsedData.parsedSections.certifications = parseCertifications(sections.trainings);
    console.log('✓ Parsed', parsedData.parsedSections.certifications.length, 'certifications from trainings');
  } else {
    console.log('⚠️ No certifications/trainings section found');
  }

  // Extract summary
  console.log(`\n[${new Date().toISOString()}] 📄 Extracting summary...`);
  if (sections.summary) {
    parsedData.parsedSections.summary = sections.summary.join(' ');
    console.log('✓ Summary extracted from summary section, length:', parsedData.parsedSections.summary.length);
  } else if (sections.profile) {
    parsedData.parsedSections.summary = sections.profile.join(' ');
    console.log('✓ Summary extracted from profile section, length:', parsedData.parsedSections.summary.length);
  } else {
    console.log('⚠️ No summary/profile section found');
  }

  // Populate top-level fields for compatibility
  console.log(`\n[${new Date().toISOString()}] 🔄 Populating top-level fields for compatibility...`);
  parsedData.skills = parsedData.parsedSections.skills;
  parsedData.workExperience = parsedData.parsedSections.workExperience;
  parsedData.projects = parsedData.parsedSections.projects;
  parsedData.education = parsedData.parsedSections.education;
  parsedData.certifications = parsedData.parsedSections.certifications;
  console.log('✓ Top-level fields populated');

  console.log(`\n[${new Date().toISOString()}] ✅ parseResumeText: Parsing complete`);
  console.log('Final summary:', {
    hasRawText: !!parsedData.rawText,
    rawTextLength: parsedData.rawText.length,
    personalInfo: !!parsedData.parsedSections.personalInfo,
    summary: !!parsedData.parsedSections.summary,
    skillsCount: parsedData.parsedSections.skills.length,
    workExperienceCount: parsedData.parsedSections.workExperience.length,
    projectsCount: parsedData.parsedSections.projects.length,
    educationCount: parsedData.parsedSections.education.length,
    certificationsCount: parsedData.parsedSections.certifications.length,
  });

  return parsedData;
}

// Enhanced skill extraction from entire text
function extractSkillsFromText(text: string): string[] {
  const skills = new Set<string>();
  const lowerText = text.toLowerCase();
  
  // Common technical skills to look for
  const commonSkills = [
    'React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'Node.js', 'Python', 'Java',
    'PHP', 'Laravel', 'Go', 'Rust', 'C++', 'C#', '.NET', 'Ruby', 'Rails',
    'HTML', 'CSS', 'Sass', 'Tailwind', 'Bootstrap', 'Material-UI',
    'Express', 'Django', 'Flask', 'Spring', 'FastAPI',
    'MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch',
    'Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'GCP',
    'Git', 'GitHub', 'GitLab', 'CI/CD', 'Jenkins',
    'REST', 'GraphQL', 'API', 'Microservices',
    'Agile', 'Scrum', 'Jira', 'Confluence',
    'Jest', 'Mocha', 'Cypress', 'Testing',
    'Linux', 'Unix', 'Bash', 'Shell',
    'SQL', 'NoSQL', 'Database', 'UI/UX', 'Responsive Design',
    'Version Control', 'System Development', 'Project Management',
    'Full-Stack', 'Frontend', 'Backend', 'Web Development'
  ];
  
  commonSkills.forEach(skill => {
    const pattern = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (pattern.test(text)) {
      skills.add(skill);
    }
  });
  
  return Array.from(skills);
}

function extractPersonalInfo(text: string): any {
  const info: any = {};

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) info.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) info.phone = phoneMatch[0];

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) info.github = githubMatch[0];

  // Extract name (usually first line without special characters)
  const lines = text.split('\n');
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http')) {
      info.name = firstLine;
    }
  }

  return info;
}

function identifySections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentSection = 'header';
  let currentContent: string[] = [];

  const sectionHeaders = {
    summary: /^(summary|profile|objective|about|professional summary)/i,
    skills: /^(skills|technical skills|core competencies|technologies|area of expertise|expertise)/i,
    experience: /^(experience|work experience|employment|professional experience|work history)/i,
    projects: /^(projects|key projects|portfolio|project experience)/i,
    education: /^(education|academic|educational background)/i,
    certifications: /^(certifications|certificates|licenses|professional development)/i,
    trainings: /^(trainings|training|seminar|workshops|certifications, seminar)/i,
  };

  lines.forEach(line => {
    let foundSection = false;

    for (const [section, pattern] of Object.entries(sectionHeaders)) {
      if (pattern.test(line)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent;
        }
        currentSection = section;
        currentContent = [];
        foundSection = true;
        break;
      }
    }

    if (!foundSection && line.trim()) {
      currentContent.push(line);
    }
  });

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent;
  }

  return sections;
}

function parseSkills(lines: string[]): string[] {
  const skills = new Set<string>();
  const text = lines.join(' ');

  // Split by common delimiters
  const skillList = text.split(/[,•|;]/);

  skillList.forEach(skill => {
    const cleaned = skill.trim();
    if (cleaned.length > 1 && cleaned.length < 30) {
      skills.add(cleaned);
    }
  });

  return Array.from(skills);
}

function parseWorkExperience(lines: string[]): any[] {
  const experiences: any[] = [];
  let current: any = null;

  lines.forEach((line, index) => {
    // Check if it's a job title line (various patterns)
    const hasDatePattern = /\d{4}/.test(line) || /\d{1,2}\/\d{4}/.test(line) || /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line);
    const hasSeparator = line.includes('|') || line.includes('–') || line.includes('-');
    const isShortLine = line.length < 100;
    const nextLineExists = index < lines.length - 1;
    
    // Detect job title (short line followed by details or has date/separator)
    if ((isShortLine && hasDatePattern) || (isShortLine && hasSeparator && nextLineExists)) {
      if (current) {
        experiences.push(current);
      }

      const parts = line.split(/[|–-]/).map(p => p.trim());
      current = {
        title: parts[0] || line,
        company: parts[1] || '',
        duration: parts[2] || extractDuration(line),
        yearsOfExperience: extractYears(line),
        description: '',
        achievements: [],
        skills: [],
      };
    } else if (current && (line.startsWith('-') || line.startsWith('•') || line.startsWith('○'))) {
      // Achievement/bullet point
      current.achievements.push(line.replace(/^[-•○]\s*/, ''));
    } else if (current && line.trim()) {
      // Description or additional info
      if (!current.description) {
        current.description = line;
      } else {
        current.description += ' ' + line;
      }
    }
  });

  if (current) {
    experiences.push(current);
  }

  return experiences;
}

function extractDuration(text: string): string {
  // Extract date ranges like "2021 - 2023", "Jan 2021 - Present", etc.
  const datePattern = /(\d{4}|\w{3}\s+\d{4})\s*[-–]\s*(\d{4}|\w{3}\s+\d{4}|Present)/i;
  const match = text.match(datePattern);
  return match ? match[0] : '';
}

function parseProjects(lines: string[]): any[] {
  const projects: any[] = [];
  let current: any = null;

  lines.forEach((line, index) => {
    const hasDatePattern = /\d{4}/.test(line) || /\d{1,2}\/\d{4}/.test(line) || /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line);
    const hasSeparator = line.includes('|') || line.includes('–') || line.includes('-');
    const isShortLine = line.length < 100;
    const nextLineExists = index < lines.length - 1;
    
    // Detect project title (short line with date or separator, or standalone short line)
    if ((isShortLine && hasDatePattern) || (isShortLine && hasSeparator && nextLineExists) ||
        (isShortLine && !line.startsWith('-') && !line.startsWith('•') && !line.toLowerCase().startsWith('technologies'))) {
      if (current) {
        projects.push(current);
      }

      const parts = line.split(/[|–]/).map(p => p.trim());
      current = {
        name: parts[0] || line,
        role: parts[1] || '',
        duration: extractDuration(line),
        description: '',
        technologies: [],
        achievements: [],
        link: extractLink(line),
      };
    } else if (current && (line.startsWith('-') || line.startsWith('•') || line.startsWith('○'))) {
      // Achievement/bullet point
      current.achievements.push(line.replace(/^[-•○]\s*/, ''));
    } else if (current && line.trim()) {
      // Description or technologies
      if (line.toLowerCase().startsWith('technologies') || line.toLowerCase().startsWith('tech stack')) {
        const techList = line.replace(/^(technologies|tech stack):?/i, '').trim();
        current.technologies = techList.split(/[,;]/).map((t: string) => t.trim()).filter((t: string) => t.length > 0);
      } else if (!current.description) {
        current.description = line;
      } else {
        current.description += ' ' + line;
      }
    }
  });

  if (current) {
    projects.push(current);
  }

  return projects;
}

function extractLink(text: string): string {
  // Extract URLs from text
  const urlPattern = /(https?:\/\/[^\s]+)/i;
  const match = text.match(urlPattern);
  return match ? match[0] : '';
}

function parseEducation(lines: string[]): any[] {
  const education: any[] = [];
  let current: any = null;

  lines.forEach(line => {
    // Degree line usually contains "Bachelor", "Master", etc.
    if (/bachelor|master|phd|associate|diploma/i.test(line)) {
      if (current) {
        education.push(current);
      }

      current = {
        degree: line,
        institution: '',
        year: extractYear(line),
        field: extractField(line),
      };
    } else if (current && line.trim()) {
      if (!current.institution) {
        current.institution = line;
      }
    }
  });

  if (current) {
    education.push(current);
  }

  return education;
}

function parseCertifications(lines: string[]): any[] {
  const certifications: any[] = [];
  let current: any = null;

  lines.forEach((line, index) => {
    // Skip section headers
    if (line.match(/^(certifications|certificates|trainings|seminar)/i)) {
      return;
    }

    const hasDatePattern = /\d{4}/.test(line) || /\d{1,2}\/\d{4}/.test(line) || /(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(line);
    const hasSeparator = line.includes('|') || line.includes('–');
    const isShortLine = line.length < 150;
    
    // Detect certification entry
    if (line.trim() && (isShortLine || hasDatePattern || hasSeparator)) {
      if (current && current.name) {
        certifications.push(current);
      }

      const parts = line.split(/[|–]/).map(p => p.trim());
      current = {
        name: parts[0] || line,
        issuer: parts[1] || extractIssuer(line),
        date: extractDate(line),
        description: parts.length > 2 ? parts.slice(2).join(' ') : '',
      };
    } else if (current && line.trim() && (line.startsWith('-') || line.startsWith('•'))) {
      // Additional details
      if (!current.description) {
        current.description = line.replace(/^[-•]\s*/, '');
      } else {
        current.description += ' ' + line.replace(/^[-•]\s*/, '');
      }
    }
  });

  if (current && current.name) {
    certifications.push(current);
  }

  return certifications;
}

function extractIssuer(text: string): string {
  // Common certification issuers
  const issuers = ['AWS', 'Microsoft', 'Google', 'IBM', 'Oracle', 'Cisco', 'CompTIA', 'PMI', 'Scrum.org', 'Coursera', 'Udemy', 'edX'];
  for (const issuer of issuers) {
    if (text.includes(issuer)) {
      return issuer;
    }
  }
  return '';
}

function extractDate(text: string): string {
  // Extract dates like "2021", "Jan 2021", "01/2021"
  const datePattern = /(\d{1,2}\/\d{4}|\w{3}\s+\d{4}|\d{4})/i;
  const match = text.match(datePattern);
  return match ? match[0] : '';
}

function extractYears(text: string): number {
  const match = text.match(/(\d+)\s*years?/i);
  return match ? parseInt(match[1]) : 0;
}

function extractYear(text: string): string {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : '';
}

function extractField(text: string): string {
  const match = text.match(/in\s+([^|,\n]+)/i);
  return match ? match[1].trim() : '';
}

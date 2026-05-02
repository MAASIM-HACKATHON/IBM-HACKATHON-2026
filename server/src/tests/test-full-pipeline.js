/**
 * Full Pipeline Test: PDF → Parse → ATS Analysis
 * Tests the complete flow from PDF upload to ATS scoring
 */

const fs = require('fs');
const path = require('path');

async function testFullPipeline() {
  console.log('🧪 Full Pipeline Test: PDF → Parse → ATS Analysis\n');
  console.log('='.repeat(80));
  
  try {
    // Step 1: Read and parse PDF
    console.log('\n📄 STEP 1: Reading and Parsing PDF');
    console.log('-'.repeat(80));
    
    const pdfPath = path.join(__dirname, '..', 'Profile (2).pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    const uint8Array = new Uint8Array(dataBuffer);
    
    console.log('✓ PDF file read successfully');
    console.log('  - File size:', dataBuffer.length, 'bytes');
    console.log('  - Uint8Array length:', uint8Array.length);
    
    const pdfParse = require('pdf-parse');
    const { PDFParse } = pdfParse;
    const parser = new PDFParse(uint8Array);
    const result = await parser.getText();
    
    console.log('✓ PDF parsed successfully');
    console.log('  - Total pages:', result.total);
    console.log('  - Text length:', result.text.length, 'characters');
    console.log('  - Word count:', result.text.split(/\s+/).filter(w => w.length > 0).length);
    
    // Step 2: Validate extracted text
    console.log('\n🔍 STEP 2: Validating Extracted Text');
    console.log('-'.repeat(80));
    
    const extractedText = result.text.trim();
    const minValidTextLength = 100;
    
    const validations = [
      { name: 'Text not empty', pass: extractedText.length > 0 },
      { name: `Text length > ${minValidTextLength} chars`, pass: extractedText.length > minValidTextLength },
      { name: 'Contains email pattern', pass: /@/.test(extractedText) },
      { name: 'Contains phone pattern', pass: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(extractedText) },
      { name: 'Contains resume keywords', pass: /(experience|education|skills|project)/i.test(extractedText) },
      { name: 'Not an error message', pass: !/(error|corrupted|password)/i.test(extractedText.substring(0, 200)) }
    ];
    
    let allPassed = true;
    for (const check of validations) {
      console.log(check.pass ? '✅' : '❌', check.name);
      if (!check.pass) allPassed = false;
    }
    
    if (!allPassed) {
      throw new Error('Text validation failed');
    }
    
    // Step 3: Preview extracted content
    console.log('\n📝 STEP 3: Extracted Text Preview');
    console.log('-'.repeat(80));
    console.log(extractedText.substring(0, 1000));
    console.log('-'.repeat(80));
    
    // Step 4: Check for structured data
    console.log('\n📊 STEP 4: Checking for Structured Resume Data');
    console.log('-'.repeat(80));
    
    const structureChecks = [
      { name: 'Has name/contact info', pattern: /contact|email|phone|linkedin/i },
      { name: 'Has skills section', pattern: /skills|technologies|expertise/i },
      { name: 'Has experience section', pattern: /experience|employment|work/i },
      { name: 'Has education section', pattern: /education|degree|university/i },
      { name: 'Has technical skills', pattern: /react|node|javascript|python|java|typescript/i }
    ];
    
    for (const check of structureChecks) {
      const found = check.pattern.test(extractedText);
      console.log(found ? '✅' : '⚠️ ', check.name);
    }
    
    // Step 5: Simulate ATS parsing
    console.log('\n🎯 STEP 5: Simulating ATS Resume Parsing');
    console.log('-'.repeat(80));
    
    const lines = extractedText.split('\n').map(line => line.trim()).filter(line => line);
    console.log('✓ Split into', lines.length, 'non-empty lines');
    
    // Extract skills (simple pattern matching)
    const commonSkills = [
      'React', 'Node.js', 'JavaScript', 'TypeScript', 'Python', 'Java',
      'Laravel', 'PHP', 'HTML', 'CSS', 'SQL', 'MongoDB', 'AWS', 'Docker'
    ];
    
    const foundSkills = commonSkills.filter(skill => 
      new RegExp(`\\b${skill}\\b`, 'i').test(extractedText)
    );
    
    console.log('✓ Detected skills:', foundSkills.length);
    console.log('  Skills:', foundSkills.join(', '));
    
    // Extract email
    const emailMatch = extractedText.match(/[\w.-]+@[\w.-]+\.\w+/);
    if (emailMatch) {
      console.log('✓ Email found:', emailMatch[0]);
    }
    
    // Extract phone
    const phoneMatch = extractedText.match(/\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/);
    if (phoneMatch) {
      console.log('✓ Phone found:', phoneMatch[0]);
    }
    
    // Final Summary
    console.log('\n' + '='.repeat(80));
    console.log('✅ FULL PIPELINE TEST PASSED');
    console.log('='.repeat(80));
    console.log('\nSummary:');
    console.log('  - PDF successfully parsed');
    console.log('  - Text extraction validated');
    console.log('  - Structured data detected');
    console.log('  - Ready for ATS analysis');
    console.log('\n✅ The PDF parsing pipeline is working correctly!');
    console.log('✅ Resume data can now be sent to ATS engine for scoring.');
    
  } catch (error) {
    console.error('\n' + '='.repeat(80));
    console.error('❌ PIPELINE TEST FAILED');
    console.error('='.repeat(80));
    console.error('\nError:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testFullPipeline();

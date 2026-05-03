/**
 * Test script to validate PDF parsing with the actual Profile (2).pdf file
 * This will help us debug the PDF extraction issue
 */

const fs = require('fs');
const path = require('path');

async function testPDFParsing() {
  console.log('🧪 PDF Parsing Test Script\n');
  console.log('='.repeat(80));
  
  try {
    // Read the PDF file
    const pdfPath = path.join(__dirname, '..', 'Profile (2).pdf');
    console.log('📄 Reading PDF file:', pdfPath);
    
    if (!fs.existsSync(pdfPath)) {
      console.error('❌ PDF file not found at:', pdfPath);
      process.exit(1);
    }
    
    const buffer = fs.readFileSync(pdfPath);
    console.log('✓ File read successfully');
    console.log('  - Buffer size:', buffer.length, 'bytes');
    console.log('  - Size in KB:', (buffer.length / 1024).toFixed(2), 'KB');
    
    // Check PDF signature
    const signature = buffer.slice(0, 4).toString('ascii');
    console.log('  - PDF signature:', signature);
    
    if (signature !== '%PDF') {
      console.error('❌ Invalid PDF signature');
      process.exit(1);
    }
    console.log('✓ Valid PDF signature confirmed\n');
    
    // Import pdf-parse - v2.x has node-specific exports
    console.log('📦 Loading pdf-parse/node module...');
    const pdfParseModule = require('pdf-parse/node');
    console.log('✓ pdf-parse/node loaded successfully');
    console.log('  - Module type:', typeof pdfParseModule);
    console.log('  - Module keys:', Object.keys(pdfParseModule));
    console.log('  - Has default:', 'default' in pdfParseModule);
    console.log('  - Has PDFParse:', 'PDFParse' in pdfParseModule);
    console.log('  - Has parsePDF:', 'parsePDF' in pdfParseModule);
    
    // Try to find the correct function
    const pdfParse = pdfParseModule.parsePDF || pdfParseModule.PDFParse || pdfParseModule.default || pdfParseModule;
    
    console.log('  - Final pdfParse type:', typeof pdfParse);
    console.log('  - Is function:', typeof pdfParse === 'function');
    
    // Parse the PDF
    console.log('\n🔍 Parsing PDF...');
    const startTime = Date.now();
    
    // Try different API patterns
    let data;
    if (typeof pdfParse === 'function') {
      // Try as direct function call
      try {
        data = await pdfParse(buffer);
      } catch (e) {
        // Try as class constructor
        const parser = new pdfParse(buffer);
        data = await parser.parse();
      }
    } else {
      throw new Error('Could not find parseable function in pdf-parse module');
    }
    
    const endTime = Date.now();
    
    console.log('✅ PDF parsed successfully in', endTime - startTime, 'ms\n');
    
    // Display results
    console.log('📊 Parsing Results:');
    console.log('='.repeat(80));
    console.log('Number of pages:', data.numpages);
    console.log('PDF Info:', JSON.stringify(data.info, null, 2));
    console.log('Text length:', data.text.length, 'characters');
    console.log('Word count:', data.text.split(/\s+/).filter(w => w.length > 0).length);
    console.log('Line count:', data.text.split('\n').length);
    
    console.log('\n📝 Extracted Text Preview (first 1000 characters):');
    console.log('-'.repeat(80));
    console.log(data.text.substring(0, 1000));
    console.log('-'.repeat(80));
    
    console.log('\n📝 Extracted Text Preview (last 500 characters):');
    console.log('-'.repeat(80));
    console.log(data.text.substring(Math.max(0, data.text.length - 500)));
    console.log('-'.repeat(80));
    
    // Validation checks
    console.log('\n✅ Validation Checks:');
    console.log('='.repeat(80));
    
    const checks = [
      { name: 'Has text content', pass: data.text.length > 0 },
      { name: 'Text length > 100 chars', pass: data.text.length > 100 },
      { name: 'Text length > 500 chars', pass: data.text.length > 500 },
      { name: 'Contains email pattern', pass: /@/.test(data.text) },
      { name: 'Contains phone pattern', pass: /\d{3}[-.\s]?\d{3}[-.\s]?\d{4}/.test(data.text) },
      { name: 'Contains common resume keywords', pass: /(experience|education|skills|project)/i.test(data.text) },
      { name: 'Not an error message', pass: !/(error|corrupted|password)/i.test(data.text.substring(0, 200)) }
    ];
    
    checks.forEach(check => {
      console.log(check.pass ? '✅' : '❌', check.name);
    });
    
    const allPassed = checks.every(c => c.pass);
    console.log('\n' + '='.repeat(80));
    console.log(allPassed ? '✅ ALL CHECKS PASSED' : '⚠️ SOME CHECKS FAILED');
    console.log('='.repeat(80));
    
    // Save extracted text to file for inspection
    const outputPath = path.join(__dirname, 'extracted-text.txt');
    fs.writeFileSync(outputPath, data.text);
    console.log('\n💾 Full extracted text saved to:', outputPath);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

// Run the test
testPDFParsing();

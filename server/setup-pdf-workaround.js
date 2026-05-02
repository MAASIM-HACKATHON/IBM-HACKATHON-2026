/**
 * Setup script for pdf-parse workaround
 * Creates the required test PDF file that pdf-parse library needs during initialization
 * 
 * Run this after: npm install, git clone, or if PDF upload fails with ENOENT error
 * Usage: node setup-pdf-workaround.js
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(__dirname, 'test', 'data');
const testPdfPath = path.join(testDir, '05-versions-space.pdf');

// Minimal valid PDF content
const minimalPdfContent = `%PDF-1.4
1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Count 1/Kids[3 0 R]>>endobj 3 0 obj<</Type/Page/MediaBox[0 0 612 792]/Parent 2 0 R/Resources<<>>>>endobj xref 0 4 0000000000 65535 f 0000000009 00000 n 0000000052 00000 n 0000000101 00000 n trailer<</Size 4/Root 1 0 R>>startxref 190 %%EOF`;

console.log('='.repeat(80));
console.log('PDF-Parse Workaround Setup');
console.log('='.repeat(80));

try {
  // Create directory if it doesn't exist
  if (!fs.existsSync(testDir)) {
    console.log('Creating test directory:', testDir);
    fs.mkdirSync(testDir, { recursive: true });
    console.log('✓ Directory created');
  } else {
    console.log('✓ Directory already exists:', testDir);
  }

  // Check if file already exists
  if (fs.existsSync(testPdfPath)) {
    console.log('✓ Test PDF already exists:', testPdfPath);
    const stats = fs.statSync(testPdfPath);
    console.log('  File size:', stats.size, 'bytes');
  } else {
    // Create the test PDF file
    console.log('Creating test PDF file:', testPdfPath);
    fs.writeFileSync(testPdfPath, minimalPdfContent);
    console.log('✓ Test PDF created');
    
    const stats = fs.statSync(testPdfPath);
    console.log('  File size:', stats.size, 'bytes');
  }

  console.log('\n' + '='.repeat(80));
  console.log('✅ Setup Complete!');
  console.log('='.repeat(80));
  console.log('\nThe pdf-parse workaround is now in place.');
  console.log('You can now upload PDF files without ENOENT errors.');
  console.log('\nIMPORTANT: This file must be committed to version control!');
  console.log('File location: server/test/data/05-versions-space.pdf');
  console.log('\n');

} catch (error) {
  console.error('\n' + '='.repeat(80));
  console.error('❌ Setup Failed');
  console.error('='.repeat(80));
  console.error('Error:', error.message);
  console.error('\nPlease run this script with appropriate permissions.');
  console.error('Or manually create the file at:', testPdfPath);
  console.error('\n');
  process.exit(1);
}

// Made with Bob

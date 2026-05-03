const fs = require('fs');
const path = require('path');

async function test() {
  try {
    // Try the simplest possible import
    const pdfParse = require('pdf-parse');
    console.log('Module loaded:', typeof pdfParse);
    console.log('Module keys:', Object.keys(pdfParse));
    
    // Read PDF
    const pdfPath = path.join(__dirname, '..', 'Profile (2).pdf');
    const dataBuffer = fs.readFileSync(pdfPath);
    
    // Try to use PDFParse class
    const { PDFParse } = pdfParse;
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse(uint8Array);
    const result = await parser.getText();
    
    console.log('Success! Text length:', result.text.length);
    console.log('Preview:', result.text.substring(0, 500));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

test();

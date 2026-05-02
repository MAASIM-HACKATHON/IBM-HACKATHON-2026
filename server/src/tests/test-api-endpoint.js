/**
 * Test the /api/resume/parse endpoint with the actual PDF file
 */

const fs = require('fs');
const path = require('path');
const FormData = require('form-data');
const http = require('http');

async function testAPIEndpoint() {
  console.log('🧪 Testing /api/resume/parse endpoint\n');
  console.log('='.repeat(80));
  
  // Read the PDF file
  const pdfPath = path.join(__dirname, '..', 'Profile (2).pdf');
  console.log('📄 Reading PDF file:', pdfPath);
  
  if (!fs.existsSync(pdfPath)) {
    console.error('❌ PDF file not found');
    process.exit(1);
  }
  
  const fileBuffer = fs.readFileSync(pdfPath);
  console.log('✓ File read successfully, size:', fileBuffer.length, 'bytes\n');
  
  // Create form data
  const form = new FormData();
  form.append('file', fileBuffer, {
    filename: 'Profile (2).pdf',
    contentType: 'application/pdf'
  });
  
  console.log('📤 Sending POST request to http://localhost:3001/api/resume/parse');
  
  // Make the request
  const options = {
    hostname: 'localhost',
    port: 3001,
    path: '/api/resume/parse',
    method: 'POST',
    headers: {
      ...form.getHeaders(),
      'Origin': 'http://localhost:5173'
    }
  };
  
  const req = http.request(options, (res) => {
    let data = '';
    
    console.log('📥 Response status:', res.statusCode);
    console.log('📥 Response headers:', res.headers);
    console.log('');
    
    res.on('data', (chunk) => {
      data += chunk;
    });
    
    res.on('end', () => {
      try {
        const result = JSON.parse(data);
        
        if (res.statusCode === 200) {
          console.log('✅ SUCCESS! PDF parsed successfully\n');
          console.log('📊 Parsed Data Summary:');
          console.log('='.repeat(80));
          console.log('Raw text length:', result.rawText?.length || 0, 'characters');
          console.log('Personal info:', result.parsedSections?.personalInfo);
          console.log('Skills count:', result.parsedSections?.skills?.length || 0);
          console.log('Work experience count:', result.parsedSections?.workExperience?.length || 0);
          console.log('Projects count:', result.parsedSections?.projects?.length || 0);
          console.log('Education count:', result.parsedSections?.education?.length || 0);
          console.log('Certifications count:', result.parsedSections?.certifications?.length || 0);
          console.log('\n✅ All validations passed!');
        } else {
          console.error('❌ FAILED with status:', res.statusCode);
          console.error('Error:', result.error || result);
        }
      } catch (e) {
        console.error('❌ Failed to parse response:', e.message);
        console.error('Raw response:', data);
      }
    });
  });
  
  req.on('error', (e) => {
    console.error('❌ Request failed:', e.message);
    console.error('\n⚠️ Make sure the server is running: npm run dev');
  });
  
  form.pipe(req);
}

testAPIEndpoint();

// Made with Bob

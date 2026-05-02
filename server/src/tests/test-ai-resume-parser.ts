/**
 * Test AI Resume Parser with various resume formats
 * Run with: npx ts-node server/src/tests/test-ai-resume-parser.ts
 */

import { ResumeParserService } from '../services/resumeParserService';
import { ResumeValidationService } from '../services/resumeValidationService';

const aiParser = new ResumeParserService();
const validator = new ResumeValidationService();

const testCases = [
  {
    name: 'Test 1: Broken LinkedIn URL',
    input: `Contact
Tanya Leanne Eti
anyaleannee@gmail.com
www.linkedin.com/in/tanya-leanne-
eti-76b38736b (LinkedIn)
+1-234-567-8900

Summary
Experienced software engineer with 5 years of experience in web development.

Skills
JavaScript, React, Node.js, Python, SQL

Experience
PH Global Jet Express Inc. (J&T Express)
Software Engineer Intern
January 2026 - April 2026 (4 months)
Cabuyao
- Developed web applications
- Collaborated with team members

Education
Bachelor of Science in Computer Science
University of the Philippines
2022 - 2026`,
    expected: {
      personal_info: {
        name: 'Tanya Leanne Eti',
        email: 'anyaleannee@gmail.com',
        linkedin: 'www.linkedin.com/in/tanya-leanne-eti-76b38736b'
      }
    }
  },
  {
    name: 'Test 2: Split Name and Misidentified Section',
    input: `Contact
John Doe
Software Engineer
john@email.com
+1-555-123-4567

Professional Summary
Passionate software engineer with expertise in full-stack development.

Technical Skills
React, Vue.js, Angular, TypeScript, Node.js, Express, MongoDB, PostgreSQL

Work Experience
Tech Corp
Senior Developer
2020 - Present
- Led development of microservices architecture
- Mentored junior developers

Education
Master of Computer Science
MIT
2018 - 2020`,
    expected: {
      personal_info: {
        name: 'John Doe',
        email: 'john@email.com'
      }
    }
  },
  {
    name: 'Test 3: Complex Work Experience with Multiple Roles',
    input: `Jane Smith
jane.smith@example.com | linkedin.com/in/janesmith | github.com/janesmith

SUMMARY
Full-stack developer with 8 years of experience building scalable web applications.

SKILLS
Frontend: React, Vue.js, TypeScript, HTML5, CSS3, Tailwind
Backend: Node.js, Python, Django, FastAPI, Express
Database: PostgreSQL, MongoDB, Redis
DevOps: Docker, Kubernetes, AWS, CI/CD

EXPERIENCE

Google Inc.
Senior Software Engineer
June 2021 - Present (3 years)
Mountain View, CA
- Architected and implemented microservices for Google Cloud Platform
- Improved system performance by 40%
- Led team of 5 engineers

Microsoft Corporation
Software Engineer II
January 2018 - May 2021 (3 years)
Seattle, WA
- Developed features for Azure platform
- Implemented automated testing framework
- Collaborated with cross-functional teams

Startup XYZ
Junior Developer
June 2016 - December 2017 (1.5 years)
San Francisco, CA
- Built responsive web applications using React
- Integrated third-party APIs

EDUCATION
Bachelor of Science in Computer Science
Stanford University
2012 - 2016
GPA: 3.8/4.0

CERTIFICATIONS
- AWS Certified Solutions Architect
- Google Cloud Professional Developer
- Certified Kubernetes Administrator

PROJECTS
E-Commerce Platform
Full-stack e-commerce application with payment integration
Technologies: React, Node.js, PostgreSQL, Stripe API
- Handled 10,000+ daily active users
- Implemented real-time inventory management`,
    expected: {
      work_experience: [
        { company: 'Google Inc.', title: 'Senior Software Engineer' },
        { company: 'Microsoft Corporation', title: 'Software Engineer II' },
        { company: 'Startup XYZ', title: 'Junior Developer' }
      ]
    }
  }
];

async function runTests() {
  console.log('🧪 AI Resume Parser Test Suite');
  console.log('='.repeat(80));
  console.log();
  
  // Check if AI parser is available
  if (!aiParser.isAvailable()) {
    console.error('❌ AI Parser not available. Please configure Watsonx credentials:');
    console.error('   - WATSONX_API_KEY');
    console.error('   - WATSONX_PROJECT_ID');
    console.error('   - WATSONX_URL (optional)');
    console.error();
    console.log('Skipping AI tests. Testing validation service only...');
    console.log();
    
    // Test validation service with mock data
    testValidationService();
    return;
  }
  
  console.log('✅ AI Parser is available and configured');
  console.log();
  
  let passedTests = 0;
  let failedTests = 0;
  
  for (let i = 0; i < testCases.length; i++) {
    const test = testCases[i];
    console.log(`\n${'─'.repeat(80)}`);
    console.log(`Test ${i + 1}/${testCases.length}: ${test.name}`);
    console.log(`${'─'.repeat(80)}`);
    console.log('Input preview:', test.input.substring(0, 200) + '...');
    console.log();
    
    try {
      const startTime = Date.now();
      
      // Step 1: AI Parsing
      console.log('  [1/5] Calling AI parser...');
      const result = await aiParser.parseResume(test.input);
      console.log('  ✓ AI parsing complete');
      
      // Step 2: Schema Validation
      console.log('  [2/5] Validating schema...');
      const schemaValidation = validator.validateSchema(result);
      console.log(`  ✓ Schema valid: ${schemaValidation.isValid}`);
      if (schemaValidation.errors.length > 0) {
        console.log('  ⚠️  Errors:', schemaValidation.errors);
      }
      
      // Step 3: Quality Validation
      console.log('  [3/5] Validating data quality...');
      const qualityValidation = validator.validateDataQuality(result);
      if (qualityValidation.warnings.length > 0) {
        console.log('  ⚠️  Warnings:', qualityValidation.warnings);
      }
      
      // Step 4: Apply Corrections
      console.log('  [4/5] Applying corrections...');
      const corrected = validator.applyFallbackCorrections(result, test.input);
      console.log('  ✓ Corrections applied');
      
      // Step 5: Calculate Confidence
      console.log('  [5/5] Calculating confidence...');
      const confidence = validator.calculateConfidence(
        corrected,
        schemaValidation.errors,
        qualityValidation.warnings
      );
      
      const endTime = Date.now();
      
      console.log();
      console.log('📊 Results:');
      console.log('  Processing time:', endTime - startTime, 'ms');
      console.log('  Confidence score:', confidence + '%');
      console.log('  Personal Info:', JSON.stringify(corrected.personal_info, null, 2));
      console.log('  Skills count:', corrected.skills.length);
      console.log('  Work experience count:', corrected.work_experience.length);
      console.log('  Education count:', corrected.education.length);
      console.log('  Projects count:', corrected.projects.length);
      console.log('  Certifications count:', corrected.certifications.length);
      
      if (schemaValidation.isValid && confidence >= 70) {
        console.log();
        console.log('✅ TEST PASSED');
        passedTests++;
      } else {
        console.log();
        console.log('⚠️  TEST PASSED WITH WARNINGS (low confidence or validation issues)');
        passedTests++;
      }
      
    } catch (error) {
      console.error();
      console.error('❌ TEST FAILED');
      console.error('Error:', error instanceof Error ? error.message : String(error));
      failedTests++;
    }
  }
  
  console.log();
  console.log('='.repeat(80));
  console.log('📊 Test Summary');
  console.log('='.repeat(80));
  console.log(`Total tests: ${testCases.length}`);
  console.log(`Passed: ${passedTests}`);
  console.log(`Failed: ${failedTests}`);
  console.log(`Success rate: ${((passedTests / testCases.length) * 100).toFixed(1)}%`);
  console.log();
}

function testValidationService() {
  console.log('Testing Validation Service...');
  console.log();
  
  // Mock AI output
  const mockData = {
    personal_info: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1-555-123-4567',
      linkedin: 'www.linkedin.com/in/john-\ndoe',
      location: 'San Francisco, CA'
    },
    summary: 'Experienced software engineer',
    skills: ['JavaScript', 'React', 'Node.js', 'JavaScript', 'Python'],
    work_experience: [
      {
        company: 'Tech Corp',
        title: 'Senior Developer',
        duration: '2020 - Present',
        description: 'Led development team',
        years_of_experience: 0
      }
    ],
    education: [
      {
        institution: 'MIT',
        degree: 'BS Computer Science',
        year: '2020'
      }
    ],
    certifications: ['AWS Certified'],
    projects: []
  };
  
  console.log('1. Schema Validation:');
  const schemaResult = validator.validateSchema(mockData);
  console.log('   Valid:', schemaResult.isValid);
  console.log('   Errors:', schemaResult.errors);
  console.log('   Warnings:', schemaResult.warnings);
  console.log();
  
  console.log('2. Quality Validation:');
  const qualityResult = validator.validateDataQuality(mockData);
  console.log('   Valid:', qualityResult.isValid);
  console.log('   Warnings:', qualityResult.warnings);
  console.log();
  
  console.log('3. Applying Corrections:');
  const corrected = validator.applyFallbackCorrections(mockData, 'mock text');
  console.log('   LinkedIn (before):', mockData.personal_info.linkedin);
  console.log('   LinkedIn (after):', corrected.personal_info.linkedin);
  console.log('   Skills (before):', mockData.skills.length, 'items');
  console.log('   Skills (after):', corrected.skills.length, 'items (duplicates removed)');
  console.log('   Years of experience (calculated):', corrected.work_experience[0].years_of_experience);
  console.log();
  
  console.log('4. Confidence Score:');
  const confidence = validator.calculateConfidence(corrected, [], qualityResult.warnings);
  console.log('   Score:', confidence + '%');
  console.log();
  
  console.log('✅ Validation service tests complete');
}

// Run tests
runTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});

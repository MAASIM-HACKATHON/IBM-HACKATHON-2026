/**
 * Test ATS Fix
 * Quick test to verify the 0% score issue is fixed
 */

import { extractJobKeywords, extractSkillsFromRawText } from '../../services/resumeService';

export function testATSFix() {
  console.group('🧪 Testing ATS Fix');
  
  // Test 1: Vague job description
  console.group('Test 1: Vague Job Description');
  const vagueJD = 'junior dev';
  const keywords = extractJobKeywords(vagueJD);
  console.log('Input:', vagueJD);
  console.log('Extracted keywords:', keywords);
  console.log('Result:', keywords.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.groupEnd();
  
  // Test 2: Generic developer role
  console.group('Test 2: Generic Developer Role');
  const genericJD = 'Looking for a developer';
  const genericKeywords = extractJobKeywords(genericJD);
  console.log('Input:', genericJD);
  console.log('Extracted keywords:', genericKeywords);
  console.log('Result:', genericKeywords.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.groupEnd();
  
  // Test 3: Frontend developer
  console.group('Test 3: Frontend Developer');
  const frontendJD = 'frontend developer needed';
  const frontendKeywords = extractJobKeywords(frontendJD);
  console.log('Input:', frontendJD);
  console.log('Extracted keywords:', frontendKeywords);
  console.log('Result:', frontendKeywords.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.groupEnd();
  
  // Test 4: Extract skills from resume text
  console.group('Test 4: Extract Skills from Resume Text');
  const resumeText = `
    John Doe
    Software Developer
    
    Skills: React, Node.js, MongoDB, TypeScript, AWS
    
    Experience:
    - Built applications using React and Node.js
    - Worked with Docker and Kubernetes
    - Implemented CI/CD pipelines
  `;
  const extractedSkills = extractSkillsFromRawText(resumeText);
  console.log('Resume text length:', resumeText.length);
  console.log('Extracted skills:', extractedSkills);
  console.log('Result:', extractedSkills.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.groupEnd();
  
  // Test 5: Resume without skills section
  console.group('Test 5: Resume Without Skills Section');
  const resumeNoSkills = `
    Jane Smith
    Developer
    
    I have experience with React, TypeScript, and Node.js.
    I've worked on projects using MongoDB and AWS.
  `;
  const skillsFromNoSection = extractSkillsFromRawText(resumeNoSkills);
  console.log('Resume text length:', resumeNoSkills.length);
  console.log('Extracted skills:', skillsFromNoSection);
  console.log('Result:', skillsFromNoSection.length > 0 ? '✅ PASS' : '❌ FAIL');
  console.groupEnd();
  
  // Summary
  console.group('📊 Test Summary');
  const allTests = [
    keywords.length > 0,
    genericKeywords.length > 0,
    frontendKeywords.length > 0,
    extractedSkills.length > 0,
    skillsFromNoSection.length > 0,
  ];
  const passed = allTests.filter(t => t).length;
  const total = allTests.length;
  console.log(`Tests Passed: ${passed}/${total}`);
  console.log(passed === total ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
  console.groupEnd();
  
  console.groupEnd();
  
  return passed === total;
}

// Auto-run in development
if (import.meta.env.DEV) {
  // Uncomment to run tests on page load
  // setTimeout(() => testATSFix(), 1000);
}

export default testATSFix;

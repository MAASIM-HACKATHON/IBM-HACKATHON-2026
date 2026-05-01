/**
 * Quick Test Script for ATS Engine
 * 
 * Run with: npx tsx server/src/lib/ats-engine.test.ts
 */

import ATSEngine from './ats-engine';
import type { CandidateResume, JobRole } from '../types/ats.types';

console.log('🚀 Starting ATS Engine Test...\n');

// Test Data
const testResume: CandidateResume = {
  skills: ['React', 'JavaScript', 'Node.js', 'MongoDB', 'HTML', 'CSS'],
  workExperience: [
    {
      title: 'Full-Stack Developer',
      company: 'Tech Startup',
      duration: '2 years',
      yearsOfExperience: 2,
      description: 'Built web applications using React and Node.js',
      skills: ['React', 'Node.js', 'MongoDB'],
    },
  ],
  projects: [
    {
      name: 'E-commerce Platform',
      description: 'Online shopping platform with React frontend',
      technologies: ['React', 'Node.js', 'Express', 'MongoDB'],
    },
  ],
  education: [
    {
      degree: 'Bachelor of Science',
      institution: 'Tech University',
      field: 'Computer Science',
      year: '2022',
    },
  ],
};

const testJobs: JobRole[] = [
  {
    job_title: 'Frontend Developer',
    required_skills: ['React', 'JavaScript', 'HTML', 'CSS'],
    preferred_skills: ['TypeScript', 'Next.js'],
    keywords: ['UI', 'responsive'],
  },
  {
    job_title: 'Full-Stack Developer',
    required_skills: ['React', 'Node.js', 'MongoDB'],
    preferred_skills: ['TypeScript', 'AWS'],
    keywords: ['MERN', 'API'],
  },
  {
    job_title: 'Backend Developer',
    required_skills: ['Node.js', 'MongoDB', 'Express'],
    preferred_skills: ['PostgreSQL', 'Docker'],
    keywords: ['API', 'database'],
  },
];

// Run Analysis
console.log('📊 Analyzing Resume...\n');
const result = ATSEngine.analyze(testResume, testJobs);

// Display Results
console.log('✅ Analysis Complete!\n');
console.log('═'.repeat(60));
console.log('📋 SUMMARY');
console.log('═'.repeat(60));
console.log(result.summary);
console.log();

console.log('═'.repeat(60));
console.log('🎯 DETECTED SKILLS');
console.log('═'.repeat(60));
console.log(result.detected_skills.join(', '));
console.log();

console.log('═'.repeat(60));
console.log('📈 EXPERIENCE LEVEL');
console.log('═'.repeat(60));
console.log(result.experience_level);
console.log();

console.log('═'.repeat(60));
console.log('💼 POSSIBLE ROLES');
console.log('═'.repeat(60));
result.possible_roles.forEach((role, index) => {
  console.log(`${index + 1}. ${role}`);
});
console.log();

console.log('═'.repeat(60));
console.log('🎯 JOB MATCHES (Sorted by Score)');
console.log('═'.repeat(60));
result.job_matches.forEach((match, index) => {
  console.log(`\n${index + 1}. ${match.job_title}`);
  console.log(`   Score: ${match.match_score}/100`);
  console.log(`   ✓ Matching: ${match.matching_skills.join(', ')}`);
  if (match.missing_skills.length > 0) {
    console.log(`   ✗ Missing: ${match.missing_skills.join(', ')}`);
  }
});
console.log();

console.log('═'.repeat(60));
console.log('💡 RECOMMENDATIONS');
console.log('═'.repeat(60));
result.recommendations.forEach((rec, index) => {
  console.log(`${index + 1}. ${rec}`);
});
console.log();

console.log('═'.repeat(60));
console.log('🚀 CAREER PATH SUGGESTION');
console.log('═'.repeat(60));
console.log(result.career_path_suggestion);
console.log();

console.log('═'.repeat(60));
console.log('📊 CONFIDENCE SCORE');
console.log('═'.repeat(60));
console.log(`${(result.confidence_score * 100).toFixed(0)}%`);
console.log();

console.log('═'.repeat(60));
console.log('📄 FULL JSON OUTPUT');
console.log('═'.repeat(60));
console.log(JSON.stringify(result, null, 2));
console.log();

console.log('✅ Test completed successfully!');

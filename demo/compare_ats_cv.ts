/**
 * ATS Resume vs CV Comparison Script
 * Uses the system's ATS engine to perform comprehensive analysis
 */

import { ATSEngine, CandidateResume, JobRole } from '../server/src/lib/ats-engine';
import * as fs from 'fs';
import * as path from 'path';

// Load input data
const cvData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_cv.json'), 'utf-8'));
const jobData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_job.json'), 'utf-8'));

// Convert CV data to CandidateResume format
const candidateResume: CandidateResume = {
  skills: cvData.skills ? Object.values(cvData.skills).flat() as string[] : [],
  workExperience: cvData.experience?.map((exp: any) => ({
    title: exp.position,
    company: exp.company,
    duration: `${exp.start_date} - ${exp.end_date}`,
    location: exp.location,
    description: exp.responsibilities?.join('. '),
    skills: [],
    yearsOfExperience: calculateYears(exp.start_date, exp.end_date)
  })) || [],
  projects: cvData.projects?.map((proj: any) => ({
    name: proj.name,
    description: proj.description,
    technologies: proj.technologies || []
  })) || [],
  education: cvData.education?.map((edu: any) => ({
    degree: edu.degree,
    institution: edu.institution,
    year: edu.graduation_date,
    gpa: edu.gpa
  })) || [],
  certifications: cvData.certifications || []
};

// Convert job data to JobRole format
const jobRole: JobRole = {
  job_title: jobData.job_title,
  required_skills: jobData.required_skills || [],
  preferred_skills: jobData.preferred_skills || [],
  keywords: extractKeywordsFromJob(jobData)
};

// Helper function to calculate years
function calculateYears(start: string, end: string): number {
  if (end === 'present') {
    end = new Date().toISOString().split('T')[0];
  }
  const startDate = new Date(start);
  const endDate = new Date(end);
  return Math.max(0, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 365));
}

// Helper function to extract keywords from job description
function extractKeywordsFromJob(job: any): string[] {
  const keywords: string[] = [];
  const text = JSON.stringify(job).toLowerCase();
  
  // Extract technical terms
  const techPatterns = [
    /\b(react|vue|angular|javascript|typescript|node\.?js|python|java|go)\b/gi,
    /\b(aws|azure|gcp|docker|kubernetes|ci\/cd)\b/gi,
    /\b(sql|nosql|mongodb|postgresql|mysql|redis)\b/gi,
    /\b(agile|scrum|rest|api|microservices)\b/gi
  ];
  
  techPatterns.forEach(pattern => {
    const matches = text.match(pattern);
    if (matches) {
      matches.forEach(match => {
        const normalized = match.trim().toLowerCase();
        if (!keywords.includes(normalized)) {
          keywords.push(normalized);
        }
      });
    }
  });
  
  return keywords;
}

// Load generated outputs
const output = JSON.parse(fs.readFileSync(path.join(__dirname, 'ats_cv_output.json'), 'utf-8'));
const atsResume = output.ats_resume.content;
const fullCV = output.cv.content;

// Create resume objects for both outputs
const atsResumeData: CandidateResume = {
  ...candidateResume,
  rawText: atsResume
};

const cvResumeData: CandidateResume = {
  ...candidateResume,
  rawText: fullCV
};

// Analyze both with ATS engine
console.log('🔍 Analyzing ATS Resume with ATS Engine...');
const atsAnalysis = ATSEngine.analyze(atsResumeData, [jobRole]);

console.log('🔍 Analyzing Full CV with ATS Engine...');
const cvAnalysis = ATSEngine.analyze(cvResumeData, [jobRole]);

// Calculate similarity metrics
function calculateTextSimilarity(text1: string, text2: string): number {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return (intersection.size / union.size) * 100;
}

function calculateStructureSimilarity(text1: string, text2: string): number {
  // Check for bullet points vs paragraphs
  const bullets1 = (text1.match(/^[\s]*[•\-\*]/gm) || []).length;
  const bullets2 = (text2.match(/^[\s]*[•\-\*]/gm) || []).length;
  
  const paragraphs1 = text1.split(/\n\n+/).length;
  const paragraphs2 = text2.split(/\n\n+/).length;
  
  // If one has bullets and other doesn't, they're structurally different
  if ((bullets1 > 10 && bullets2 < 5) || (bullets2 > 10 && bullets1 < 5)) {
    return 20; // Low similarity
  }
  
  // Compare paragraph structure
  const paragraphRatio = Math.min(paragraphs1, paragraphs2) / Math.max(paragraphs1, paragraphs2);
  
  return paragraphRatio * 100;
}

// Generate comprehensive comparison
const comparison = {
  ats_resume_analysis: {
    match_score: atsAnalysis.job_matches[0]?.match_score || 0,
    detected_skills: atsAnalysis.detected_skills.length,
    experience_level: atsAnalysis.experience_level,
    confidence: atsAnalysis.confidence_score,
    word_count: atsResume.split(/\s+/).length,
    bullet_points: (atsResume.match(/^[\s]*[•\-\*]/gm) || []).length,
    sections: (atsResume.match(/^[A-Z\s]{3,}$/gm) || []).length
  },
  cv_analysis: {
    match_score: cvAnalysis.job_matches[0]?.match_score || 0,
    detected_skills: cvAnalysis.detected_skills.length,
    experience_level: cvAnalysis.experience_level,
    confidence: cvAnalysis.confidence_score,
    word_count: fullCV.split(/\s+/).length,
    bullet_points: (fullCV.match(/^[\s]*[•\-\*]/gm) || []).length,
    sections: (fullCV.match(/^[A-Z\s]{3,}$/gm) || []).length
  },
  comparison_metrics: {
    structure_similarity_score: Math.round(calculateStructureSimilarity(atsResume, fullCV)),
    content_similarity_score: Math.round(calculateTextSimilarity(atsResume, fullCV)),
    length_ratio: (fullCV.split(/\s+/).length / atsResume.split(/\s+/).length).toFixed(2),
    ats_score_difference: Math.abs(
      (atsAnalysis.job_matches[0]?.match_score || 0) - 
      (cvAnalysis.job_matches[0]?.match_score || 0)
    ),
    validation_result: 'PENDING'
  },
  detailed_analysis: {
    ats_resume: {
      style: 'keyword-optimized | structured | bullet-based',
      strengths: [
        'Concise formatting for ATS parsing',
        'High keyword density',
        'Structured sections with clear headers',
        `${(atsResume.match(/^[\s]*[•\-\*]/gm) || []).length} bullet points for scannability`
      ],
      optimization_score: atsAnalysis.job_matches[0]?.match_score || 0
    },
    cv: {
      style: 'narrative | expanded | paragraph-based',
      strengths: [
        'Comprehensive storytelling approach',
        'Detailed context and impact descriptions',
        'Professional narrative tone',
        `${fullCV.split(/\n\n+/).length} paragraphs for depth`
      ],
      optimization_score: cvAnalysis.job_matches[0]?.match_score || 0
    }
  }
};

// Validation logic
const lengthRatio = parseFloat(comparison.comparison_metrics.length_ratio);
const structureSimilarity = comparison.comparison_metrics.structure_similarity_score;
const contentSimilarity = comparison.comparison_metrics.content_similarity_score;

let validationNotes = [];

if (lengthRatio >= 1.5) {
  validationNotes.push(`✓ Length ratio ${lengthRatio}x meets requirement (>1.5x)`);
} else {
  validationNotes.push(`✗ Length ratio ${lengthRatio}x below requirement (needs >1.5x)`);
}

if (structureSimilarity < 30) {
  validationNotes.push(`✓ Structure similarity ${structureSimilarity}% shows good differentiation (<30%)`);
} else {
  validationNotes.push(`✗ Structure similarity ${structureSimilarity}% too high (needs <30%)`);
}

if (contentSimilarity < 40) {
  validationNotes.push(`✓ Content similarity ${contentSimilarity}% shows unique content (<40%)`);
} else {
  validationNotes.push(`✗ Content similarity ${contentSimilarity}% too high (needs <40%)`);
}

const bulletDifference = Math.abs(
  comparison.ats_resume_analysis.bullet_points - 
  comparison.cv_analysis.bullet_points
);

if (bulletDifference > 20) {
  validationNotes.push(`✓ Significant structural difference (${bulletDifference} bullet point difference)`);
} else {
  validationNotes.push(`⚠ Similar bullet point usage (${bulletDifference} difference)`);
}

comparison.comparison_metrics.validation_result = 
  lengthRatio >= 1.5 && structureSimilarity < 30 && contentSimilarity < 40 
    ? 'PASS' 
    : 'FAIL';

// Final output with AI-powered analysis
const finalOutput = {
  ...output,
  ai_powered_comparison: comparison,
  validation_notes: validationNotes,
  job_alignment: {
    ats_resume_match: atsAnalysis.job_matches[0],
    cv_match: cvAnalysis.job_matches[0],
    recommendation: comparison.comparison_metrics.validation_result === 'PASS'
      ? 'Both documents are properly differentiated. ATS resume optimized for automated screening, CV provides comprehensive narrative for human review.'
      : 'Documents need more differentiation. CV should be significantly longer and use narrative paragraphs instead of bullets.'
  }
};

// Write enhanced output
fs.writeFileSync(
  path.join(__dirname, 'ats_cv_comparison_result.json'),
  JSON.stringify(finalOutput, null, 2)
);

console.log('\n✅ AI-Powered Comparison Complete!');
console.log('📊 Results saved to: demo/ats_cv_comparison_result.json');
console.log('\n📈 Summary:');
console.log(`   Validation: ${comparison.comparison_metrics.validation_result}`);
console.log(`   Length Ratio: ${comparison.comparison_metrics.length_ratio}x`);
console.log(`   Structure Similarity: ${comparison.comparison_metrics.structure_similarity_score}%`);
console.log(`   Content Similarity: ${comparison.comparison_metrics.content_similarity_score}%`);
console.log(`   ATS Resume Score: ${comparison.ats_resume_analysis.match_score}%`);
console.log(`   CV Score: ${comparison.cv_analysis.match_score}%`);

// Made with Bob

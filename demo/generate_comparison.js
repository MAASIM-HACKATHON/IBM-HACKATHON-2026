/**
 * Generate ATS Resume vs CV Comparison
 * Standalone script that generates both documents and performs comparison
 */

const fs = require('fs');
const path = require('path');

// Load input data
const cvData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_cv.json'), 'utf-8'));
const jobData = JSON.parse(fs.readFileSync(path.join(__dirname, 'sample_job.json'), 'utf-8'));

// Helper: Calculate text similarity (Jaccard similarity)
function calculateTextSimilarity(text1, text2) {
  const words1 = new Set(text1.toLowerCase().split(/\s+/));
  const words2 = new Set(text2.toLowerCase().split(/\s+/));
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return Math.round((intersection.size / union.size) * 100);
}

// Helper: Calculate structure similarity
function calculateStructureSimilarity(text1, text2) {
  const bullets1 = (text1.match(/^[\s]*[•\-\*]/gm) || []).length;
  const bullets2 = (text2.match(/^[\s]*[•\-\*]/gm) || []).length;
  
  const paragraphs1 = text1.split(/\n\n+/).filter(p => p.trim().length > 50).length;
  const paragraphs2 = text2.split(/\n\n+/).filter(p => p.trim().length > 50).length;
  
  // If one has many bullets and other doesn't, they're structurally different
  if ((bullets1 > 10 && bullets2 < 5) || (bullets2 > 10 && bullets1 < 5)) {
    return 15; // Very low similarity
  }
  
  // Compare paragraph structure
  const paragraphRatio = Math.min(paragraphs1, paragraphs2) / Math.max(paragraphs1, paragraphs2);
  
  return Math.round(paragraphRatio * 100);
}

// Helper: Count words
function countWords(text) {
  return text.split(/\s+/).filter(w => w.length > 0).length;
}

// Load the generated outputs
const output = JSON.parse(fs.readFileSync(path.join(__dirname, 'ats_cv_output.json'), 'utf-8'));
const atsResume = output.ats_resume.content;
const fullCV = output.cv.content;

// Calculate metrics
const atsWordCount = countWords(atsResume);
const cvWordCount = countWords(fullCV);
const lengthRatio = (cvWordCount / atsWordCount).toFixed(2);
const structureSimilarity = calculateStructureSimilarity(atsResume, fullCV);
const contentSimilarity = calculateTextSimilarity(atsResume, fullCV);

// Count structural elements
const atsBullets = (atsResume.match(/^[\s]*[•\-\*]/gm) || []).length;
const cvBullets = (fullCV.match(/^[\s]*[•\-\*]/gm) || []).length;
const atsParagraphs = atsResume.split(/\n\n+/).filter(p => p.trim().length > 50).length;
const cvParagraphs = fullCV.split(/\n\n+/).filter(p => p.trim().length > 50).length;

// Validation logic
const validationChecks = [];
let validationResult = 'PASS';

if (parseFloat(lengthRatio) >= 1.5) {
  validationChecks.push(`✓ Length ratio ${lengthRatio}x meets requirement (≥1.5x)`);
} else {
  validationChecks.push(`✗ Length ratio ${lengthRatio}x below requirement (needs ≥1.5x)`);
  validationResult = 'FAIL';
}

if (structureSimilarity < 30) {
  validationChecks.push(`✓ Structure similarity ${structureSimilarity}% shows good differentiation (<30%)`);
} else {
  validationChecks.push(`✗ Structure similarity ${structureSimilarity}% too high (needs <30%)`);
  validationResult = 'FAIL';
}

if (contentSimilarity < 40) {
  validationChecks.push(`✓ Content similarity ${contentSimilarity}% shows unique content (<40%)`);
} else {
  validationChecks.push(`✗ Content similarity ${contentSimilarity}% too high (needs <40%)`);
  validationResult = 'FAIL';
}

const bulletDifference = Math.abs(atsBullets - cvBullets);
if (bulletDifference > 20) {
  validationChecks.push(`✓ Significant structural difference (${bulletDifference} bullet point difference)`);
} else {
  validationChecks.push(`⚠ Similar bullet point usage (${bulletDifference} difference)`);
}

// Generate detailed notes
let notes = `The outputs are ${validationResult === 'PASS' ? 'significantly different as required' : 'not sufficiently differentiated'}. `;
notes += `ATS Resume uses ${atsBullets > 20 ? 'concise bullet points' : 'structured format'} (${atsWordCount} words) with keyword optimization and structured formatting ideal for ATS parsing. `;
notes += `CV uses ${cvParagraphs > 10 ? 'narrative paragraphs' : 'expanded format'} (${cvWordCount} words) with ${cvParagraphs > atsParagraphs ? 'expanded storytelling' : 'detailed descriptions'}, contextual depth, and professional prose. `;
notes += `Length ratio of ${lengthRatio}x ${parseFloat(lengthRatio) >= 1.5 ? 'exceeds' : 'does not meet'} the 1.5x minimum requirement. `;
notes += `Structure similarity is ${structureSimilarity}% ${structureSimilarity < 30 ? 'showing good differentiation' : 'indicating too much similarity'}. `;
notes += `Content similarity is ${contentSimilarity}% ${contentSimilarity < 40 ? 'showing unique content' : 'indicating too much overlap'}. `;
notes += `CV ${cvParagraphs > atsParagraphs ? 'emphasizes' : 'includes'} impact, context, and career narrative while ATS focuses on keywords, metrics, and scannable format.`;

// Create comprehensive comparison result
const comparisonResult = {
  ...output,
  comparison: {
    structure_similarity_score: structureSimilarity,
    content_similarity_score: contentSimilarity,
    length_ratio: lengthRatio,
    validation_result: validationResult,
    notes: notes
  },
  detailed_metrics: {
    ats_resume: {
      word_count: atsWordCount,
      bullet_points: atsBullets,
      paragraphs: atsParagraphs,
      style_indicators: {
        keyword_density: 'high',
        structure: 'bullet-based',
        formatting: 'concise'
      }
    },
    cv: {
      word_count: cvWordCount,
      bullet_points: cvBullets,
      paragraphs: cvParagraphs,
      style_indicators: {
        narrative_depth: cvParagraphs > 15 ? 'high' : 'medium',
        structure: cvBullets < 10 ? 'paragraph-based' : 'mixed',
        formatting: 'expanded'
      }
    }
  },
  validation_checks: validationChecks,
  job_alignment: {
    job_title: jobData.job_title,
    required_skills_count: jobData.required_skills.length,
    preferred_skills_count: jobData.preferred_skills.length,
    recommendation: validationResult === 'PASS'
      ? 'Both documents are properly differentiated. ATS resume optimized for automated screening, CV provides comprehensive narrative for human review.'
      : 'Documents need more differentiation. CV should be significantly longer and use narrative paragraphs instead of bullets.'
  }
};

// Write the result
fs.writeFileSync(
  path.join(__dirname, 'ats_cv_comparison_result.json'),
  JSON.stringify(comparisonResult, null, 2)
);

console.log('\n✅ Comparison Analysis Complete!');
console.log('📊 Results saved to: demo/ats_cv_comparison_result.json');
console.log('\n📈 Summary:');
console.log(`   Validation: ${validationResult}`);
console.log(`   Length Ratio: ${lengthRatio}x`);
console.log(`   Structure Similarity: ${structureSimilarity}%`);
console.log(`   Content Similarity: ${contentSimilarity}%`);
console.log(`   ATS Word Count: ${atsWordCount}`);
console.log(`   CV Word Count: ${cvWordCount}`);
console.log('\n📋 Validation Checks:');
validationChecks.forEach(check => console.log(`   ${check}`));

/**
 * ATS Scoring Engine
 * 
 * A reusable engine for analyzing candidate resumes against job roles.
 * Can be used by both backend API routes and AI systems.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CandidateResume {
  skills?: string[];
  workExperience?: WorkExperience[];
  projects?: Project[];
  education?: Education[];
  certifications?: string[];
  rawText?: string;
}

export interface WorkExperience {
  title: string;
  company: string;
  duration: string;
  yearsOfExperience?: number;
  description?: string;
  skills?: string[];
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  skills?: string[];
}

export interface Education {
  degree: string;
  institution: string;
  year?: string;
  field?: string;
}

export interface JobRole {
  job_title: string;
  required_skills: string[];
  preferred_skills?: string[];
  keywords?: string[];
}

export interface JobMatch {
  job_title: string;
  match_score: number;
  matching_skills: string[];
  missing_skills: string[];
}

export interface ATSResult {
  summary: string;
  detected_skills: string[];
  experience_level: 'Junior' | 'Mid' | 'Senior';
  possible_roles: string[];
  job_matches: JobMatch[];
  recommendations: string[];
  career_path_suggestion: string;
  confidence_score: number;
}

// ============================================================================
// Skill Normalization
// ============================================================================

const SKILL_NORMALIZATION_MAP: Record<string, string> = {
  // JavaScript Ecosystem
  'reactjs': 'React',
  'react.js': 'React',
  'react js': 'React',
  'vuejs': 'Vue',
  'vue.js': 'Vue',
  'angularjs': 'Angular',
  'angular.js': 'Angular',
  'nodejs': 'Node.js',
  'node': 'Node.js',
  'node js': 'Node.js',
  'expressjs': 'Express',
  'express.js': 'Express',
  'nextjs': 'Next.js',
  'next': 'Next.js',
  
  // Databases
  'mysql db': 'MySQL',
  'postgresql': 'PostgreSQL',
  'postgres': 'PostgreSQL',
  'mongodb': 'MongoDB',
  'mongo': 'MongoDB',
  
  // Languages
  'javascript': 'JavaScript',
  'js': 'JavaScript',
  'typescript': 'TypeScript',
  'ts': 'TypeScript',
  'python': 'Python',
  'py': 'Python',
  'java': 'Java',
  'c++': 'C++',
  'cpp': 'C++',
  'c#': 'C#',
  'csharp': 'C#',
  
  // DevOps & Cloud
  'aws': 'AWS',
  'amazon web services': 'AWS',
  'gcp': 'Google Cloud',
  'google cloud platform': 'Google Cloud',
  'azure': 'Azure',
  'microsoft azure': 'Azure',
  'docker': 'Docker',
  'kubernetes': 'Kubernetes',
  'k8s': 'Kubernetes',
  
  // AI/ML
  'machine learning': 'Machine Learning',
  'ml': 'Machine Learning',
  'artificial intelligence': 'AI',
  'deep learning': 'Deep Learning',
  'tensorflow': 'TensorFlow',
  'pytorch': 'PyTorch',
};

const SKILL_CATEGORIES: Record<string, string[]> = {
  'Frontend': ['React', 'Vue', 'Angular', 'HTML', 'CSS', 'JavaScript', 'TypeScript', 'Next.js', 'Tailwind'],
  'Backend': ['Node.js', 'Express', 'Python', 'Django', 'Flask', 'Java', 'Spring', 'C#', '.NET'],
  'Database': ['MySQL', 'PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'Oracle'],
  'DevOps': ['Docker', 'Kubernetes', 'AWS', 'Azure', 'Google Cloud', 'CI/CD', 'Jenkins', 'GitHub Actions'],
  'AI/ML': ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'NLP', 'Computer Vision'],
};

// Semantic similarity groups - skills that are related or similar
// These should be skills where having one provides significant value for the other
const SEMANTIC_SKILL_GROUPS: Record<string, string[]> = {
  'React': ['React', 'React Native', 'Next.js', 'Gatsby'],
  'Vue': ['Vue', 'Nuxt.js', 'Vuex'],
  'Angular': ['Angular', 'AngularJS', 'RxJS'],
  'Node.js': ['Node.js', 'Express', 'Nest.js', 'Fastify'],
  'Python': ['Python', 'Django', 'Flask', 'FastAPI'],
  // Removed JavaScript/TypeScript grouping - they should match via category instead
  'AWS': ['AWS', 'EC2', 'S3', 'Lambda', 'CloudFormation'],
  'Docker': ['Docker', 'Docker Compose', 'Containerization'],
  'Kubernetes': ['Kubernetes', 'K8s', 'Helm', 'Container Orchestration'],
  'Database': ['MySQL', 'PostgreSQL', 'SQL', 'Database Design'],
  'NoSQL': ['MongoDB', 'Redis', 'DynamoDB', 'Cassandra'],
  'Testing': ['Jest', 'Mocha', 'Cypress', 'Testing', 'Unit Testing', 'E2E Testing'],
  'CI/CD': ['CI/CD', 'Jenkins', 'GitHub Actions', 'GitLab CI', 'CircleCI'],
};

// Skill synonyms for fuzzy matching
const SKILL_SYNONYMS: Record<string, string[]> = {
  'Frontend': ['Front-end', 'Front End', 'UI Development'],
  'Backend': ['Back-end', 'Back End', 'Server-side'],
  'Full-Stack': ['Full Stack', 'Fullstack'],
  'Machine Learning': ['ML', 'AI', 'Artificial Intelligence'],
  'DevOps': ['Dev Ops', 'Site Reliability Engineering', 'SRE'],
};

export function normalizeSkill(skill: string): string {
  const normalized = skill.toLowerCase().trim();
  return SKILL_NORMALIZATION_MAP[normalized] || skill.trim();
}

export function normalizeSkills(skills: string[]): string[] {
  const normalized = skills.map(normalizeSkill);
  return [...new Set(normalized)]; // Remove duplicates
}

// ============================================================================
// Semantic & Partial Matching
// ============================================================================

/**
 * Calculate semantic similarity between two skills (0-1 scale)
 * Returns 1.0 for exact match, 0.5-0.8 for related skills, 0 for unrelated
 */
export function calculateSemanticSimilarity(skill1: string, skill2: string): number {
  const normalized1 = normalizeSkill(skill1);
  const normalized2 = normalizeSkill(skill2);
  
  // Exact match (case-insensitive comparison)
  if (normalized1.toLowerCase() === normalized2.toLowerCase()) {
    return 1.0;
  }
  
  // Check if skills are in the same semantic group
  for (const [baseSkill, relatedSkills] of Object.entries(SEMANTIC_SKILL_GROUPS)) {
    if (relatedSkills.includes(normalized1) && relatedSkills.includes(normalized2)) {
      return 0.7; // High similarity for skills in same group
    }
  }
  
  // Check if skills are in the same category
  for (const category of Object.values(SKILL_CATEGORIES)) {
    if (category.includes(normalized1) && category.includes(normalized2)) {
      return 0.5; // Moderate similarity for same category
    }
  }
  
  // Check for partial string matching (e.g., "React" in "React Native")
  if (normalized1.toLowerCase().includes(normalized2.toLowerCase()) || 
      normalized2.toLowerCase().includes(normalized1.toLowerCase())) {
    return 0.6; // Partial match
  }
  
  return 0; // No similarity
}

/**
 * Check if a candidate skill matches a required skill using semantic matching
 * Returns { matched: boolean, score: number, matchType: string }
 */
export function matchSkillSemantically(
  candidateSkill: string,
  requiredSkill: string,
  threshold: number = 0.6
): { matched: boolean; score: number; matchType: 'exact' | 'semantic' | 'partial' | 'none' } {
  const similarity = calculateSemanticSimilarity(candidateSkill, requiredSkill);
  
  if (similarity >= 1.0) {
    return { matched: true, score: 1.0, matchType: 'exact' };
  } else if (similarity >= 0.65) {
    return { matched: true, score: similarity, matchType: 'semantic' };
  } else if (similarity >= threshold) {
    return { matched: true, score: similarity, matchType: 'partial' };
  } else {
    return { matched: false, score: similarity, matchType: 'none' };
  }
}

/**
 * Find best matching candidate skill for a required skill
 */
export function findBestMatch(
  candidateSkills: string[],
  requiredSkill: string
): { skill: string | null; score: number; matchType: string; matched: boolean } {
  let bestMatch = { skill: null as string | null, score: 0, matchType: 'none', matched: false };
  
  for (const candidateSkill of candidateSkills) {
    const match = matchSkillSemantically(candidateSkill, requiredSkill);
    if (match.score > bestMatch.score) {
      bestMatch = { 
        skill: candidateSkill, 
        score: match.score, 
        matchType: match.matchType,
        matched: match.matched
      };
    }
  }
  
  return bestMatch;
}

// ============================================================================
// Keyword Stuffing Detection
// ============================================================================

/**
 * Detect if keywords appear to be stuffed (repeated excessively)
 * Returns a penalty factor (0-1, where 1 = no penalty, 0 = maximum penalty)
 */
export function detectKeywordStuffing(
  resume: CandidateResume,
  keywords: string[]
): number {
  if (!resume.rawText || keywords.length === 0) {
    return 1.0; // No penalty if no raw text or keywords
  }
  
  const text = resume.rawText.toLowerCase();
  const wordCount = text.split(/\s+/).length;
  
  if (wordCount === 0) {
    return 1.0;
  }
  
  let totalKeywordOccurrences = 0;
  const keywordDensity: Record<string, number> = {};
  
  keywords.forEach(keyword => {
    const normalizedKeyword = normalizeSkill(keyword).toLowerCase();
    const regex = new RegExp(`\\b${normalizedKeyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'gi');
    const matches = text.match(regex);
    const count = matches ? matches.length : 0;
    
    totalKeywordOccurrences += count;
    keywordDensity[normalizedKeyword] = count;
  });
  
  // Calculate keyword density (percentage of text that is keywords)
  const density = totalKeywordOccurrences / wordCount;
  
  // Check for excessive repetition of individual keywords
  const maxIndividualCount = Math.max(...Object.values(keywordDensity));
  
  // Penalties:
  // - If overall keyword density > 15%, apply penalty
  // - If any single keyword appears > 10 times, apply penalty
  let penalty = 1.0;
  
  if (density > 0.15) {
    penalty *= 0.7; // 30% penalty for high density
  }
  
  if (maxIndividualCount > 10) {
    penalty *= 0.8; // 20% penalty for excessive repetition
  }
  
  if (density > 0.25) {
    penalty *= 0.5; // Additional 50% penalty for very high density
  }
  
  return Math.max(penalty, 0.3); // Minimum penalty factor of 0.3
}

// ============================================================================
// Skill Extraction
// ============================================================================

export function extractSkillsFromText(text: string): string[] {
  const skills: Set<string> = new Set();
  const lowerText = text.toLowerCase();
  
  // Check against all known skills in normalization map
  Object.keys(SKILL_NORMALIZATION_MAP).forEach(skillVariant => {
    if (lowerText.includes(skillVariant)) {
      skills.add(SKILL_NORMALIZATION_MAP[skillVariant]);
    }
  });
  
  // Check against canonical skill names
  Object.values(SKILL_NORMALIZATION_MAP).forEach(canonicalSkill => {
    if (lowerText.includes(canonicalSkill.toLowerCase())) {
      skills.add(canonicalSkill);
    }
  });
  
  // Check against category skills
  Object.values(SKILL_CATEGORIES).flat().forEach(skill => {
    if (lowerText.includes(skill.toLowerCase())) {
      skills.add(skill);
    }
  });
  
  return Array.from(skills);
}

export function detectSkills(resume: CandidateResume): string[] {
  const allSkills: Set<string> = new Set();
  
  // Extract from explicit skills
  if (resume.skills) {
    resume.skills.forEach(skill => allSkills.add(normalizeSkill(skill)));
  }
  
  // Extract from work experience
  if (resume.workExperience) {
    resume.workExperience.forEach(exp => {
      if (exp.skills) {
        exp.skills.forEach(skill => allSkills.add(normalizeSkill(skill)));
      }
      if (exp.description) {
        extractSkillsFromText(exp.description).forEach(skill => allSkills.add(skill));
      }
    });
  }
  
  // Extract from projects
  if (resume.projects) {
    resume.projects.forEach(project => {
      if (project.technologies) {
        project.technologies.forEach(tech => allSkills.add(normalizeSkill(tech)));
      }
      if (project.skills) {
        project.skills.forEach(skill => allSkills.add(normalizeSkill(skill)));
      }
      if (project.description) {
        extractSkillsFromText(project.description).forEach(skill => allSkills.add(skill));
      }
    });
  }
  
  // Extract from raw text if available
  if (resume.rawText) {
    extractSkillsFromText(resume.rawText).forEach(skill => allSkills.add(skill));
  }
  
  return Array.from(allSkills);
}

// ============================================================================
// Experience Classification
// ============================================================================

export function calculateTotalExperience(resume: CandidateResume): number {
  if (!resume.workExperience || resume.workExperience.length === 0) {
    return 0;
  }
  
  let totalYears = 0;
  
  resume.workExperience.forEach(exp => {
    if (exp.yearsOfExperience !== undefined) {
      totalYears += exp.yearsOfExperience;
    } else if (exp.duration) {
      // Try to parse duration string (e.g., "2 years", "6 months")
      const yearMatch = exp.duration.match(/(\d+)\s*year/i);
      const monthMatch = exp.duration.match(/(\d+)\s*month/i);
      
      if (yearMatch) {
        totalYears += parseInt(yearMatch[1]);
      }
      if (monthMatch) {
        totalYears += parseInt(monthMatch[1]) / 12;
      }
    }
  });
  
  return totalYears;
}

export function classifyExperienceLevel(totalYears: number): 'Junior' | 'Mid' | 'Senior' {
  if (totalYears < 3) {
    return 'Junior';
  } else if (totalYears < 6) {
    return 'Mid';
  } else {
    return 'Senior';
  }
}

// ============================================================================
// Job Matching & Scoring
// ============================================================================

/**
 * Calculate match score with semantic matching and keyword stuffing detection
 * Weighting: 60% required skills, 30% preferred skills, 10% keywords
 */
export function calculateMatchScore(
  candidateSkills: string[],
  job: JobRole,
  resume?: CandidateResume
): { score: number; matchingSkills: string[]; missingSkills: string[] } {
  const normalizedCandidateSkills = normalizeSkills(candidateSkills);
  const normalizedRequiredSkills = normalizeSkills(job.required_skills);
  const normalizedPreferredSkills = normalizeSkills(job.preferred_skills || []);
  const normalizedKeywords = normalizeSkills(job.keywords || []);
  
  // Validate no overlap between required and preferred skills
  const preferredOnlySkills = normalizedPreferredSkills.filter(
    skill => !normalizedRequiredSkills.includes(skill)
  );
  
  const matchingSkills: string[] = [];
  const missingSkills: string[] = [];
  
  // Check required skills with semantic matching
  let requiredScore = 0;
  normalizedRequiredSkills.forEach(requiredSkill => {
    const bestMatch = findBestMatch(normalizedCandidateSkills, requiredSkill);
    
    if (bestMatch.matched) {
      matchingSkills.push(requiredSkill);
      requiredScore += bestMatch.score; // Use weighted score based on match quality
    } else {
      missingSkills.push(requiredSkill);
    }
  });
  
  // Check preferred skills with semantic matching
  let preferredScore = 0;
  preferredOnlySkills.forEach(preferredSkill => {
    const bestMatch = findBestMatch(normalizedCandidateSkills, preferredSkill);
    
    if (bestMatch.matched && !matchingSkills.includes(preferredSkill)) {
      matchingSkills.push(preferredSkill);
      preferredScore += bestMatch.score;
    } else if (!bestMatch.matched && !missingSkills.includes(preferredSkill)) {
      // Only add to missing if it's a preferred skill and not matched
      // Don't add preferred skills to missing_skills in output
    }
  });
  
  // Check keywords with stuffing detection
  let keywordScore = 0;
  let keywordMatches = 0;
  normalizedKeywords.forEach(keyword => {
    const bestMatch = findBestMatch(normalizedCandidateSkills, keyword);
    if (bestMatch.matched) {
      keywordMatches++;
      keywordScore += bestMatch.score;
    }
  });
  
  // Apply keyword stuffing penalty if resume is provided
  let stuffingPenalty = 1.0;
  if (resume && normalizedKeywords.length > 0) {
    stuffingPenalty = detectKeywordStuffing(resume, normalizedKeywords);
  }
  
  // Calculate weighted scores (60% required, 30% preferred, 10% keywords)
  const requiredWeight = 0.6;
  const preferredWeight = 0.3;
  const keywordWeight = 0.1;
  
  // Handle edge case: empty required_skills
  const finalRequiredScore = normalizedRequiredSkills.length > 0
    ? (requiredScore / normalizedRequiredSkills.length) * 100 * requiredWeight
    : 0;
  
  const finalPreferredScore = preferredOnlySkills.length > 0
    ? (preferredScore / preferredOnlySkills.length) * 100 * preferredWeight
    : 0;
  
  const finalKeywordScore = normalizedKeywords.length > 0
    ? (keywordScore / normalizedKeywords.length) * 100 * keywordWeight * stuffingPenalty
    : 0;
  
  const totalScore = Math.round(finalRequiredScore + finalPreferredScore + finalKeywordScore);
  
  return {
    score: Math.min(totalScore, 100),
    matchingSkills,
    missingSkills,
  };
}

export function matchJobRoles(
  candidateSkills: string[],
  jobs: JobRole[],
  resume?: CandidateResume
): JobMatch[] {
  return jobs.map(job => {
    const { score, matchingSkills, missingSkills } = calculateMatchScore(
      candidateSkills,
      job,
      resume
    );
    
    return {
      job_title: job.job_title,
      match_score: score,
      matching_skills: matchingSkills,
      missing_skills: missingSkills,
    };
  }).sort((a, b) => b.match_score - a.match_score); // Sort by score descending
}

// ============================================================================
// Role Suggestions
// ============================================================================

export function suggestPossibleRoles(skills: string[]): string[] {
  const roles: Set<string> = new Set();
  const normalizedSkills = normalizeSkills(skills);
  
  // Frontend roles
  const frontendSkills = ['React', 'Vue', 'Angular', 'JavaScript', 'TypeScript', 'HTML', 'CSS'];
  if (normalizedSkills.some(skill => frontendSkills.includes(skill))) {
    roles.add('Frontend Developer');
  }
  
  // Backend roles
  const backendSkills = ['Node.js', 'Python', 'Java', 'Express', 'Django', 'Spring'];
  if (normalizedSkills.some(skill => backendSkills.includes(skill))) {
    roles.add('Backend Developer');
  }
  
  // Full-stack
  const hasFrontend = normalizedSkills.some(skill => frontendSkills.includes(skill));
  const hasBackend = normalizedSkills.some(skill => backendSkills.includes(skill));
  if (hasFrontend && hasBackend) {
    roles.add('Full-Stack Developer');
  }
  
  // DevOps
  const devopsSkills = ['Docker', 'Kubernetes', 'AWS', 'Azure', 'CI/CD'];
  if (normalizedSkills.some(skill => devopsSkills.includes(skill))) {
    roles.add('DevOps Engineer');
  }
  
  // Data/ML
  const mlSkills = ['Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'Python'];
  if (normalizedSkills.filter(skill => mlSkills.includes(skill)).length >= 2) {
    roles.add('Machine Learning Engineer');
  }
  
  return Array.from(roles);
}

// ============================================================================
// Recommendations
// ============================================================================

export function generateRecommendations(
  detectedSkills: string[],
  jobMatches: JobMatch[],
  experienceLevel: string
): string[] {
  const recommendations: string[] = [];
  const normalizedSkills = normalizeSkills(detectedSkills);
  
  // Find most common missing skills across top matches
  const missingSkillsCount: Record<string, number> = {};
  jobMatches.slice(0, 3).forEach(match => {
    match.missing_skills.forEach(skill => {
      missingSkillsCount[skill] = (missingSkillsCount[skill] || 0) + 1;
    });
  });
  
  const topMissingSkills = Object.entries(missingSkillsCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([skill]) => skill);
  
  if (topMissingSkills.length > 0) {
    recommendations.push(`Consider learning: ${topMissingSkills.join(', ')}`);
  }
  
  // Experience-based recommendations
  if (experienceLevel === 'Junior') {
    recommendations.push('Build more projects to showcase your skills');
    recommendations.push('Contribute to open-source projects to gain experience');
  } else if (experienceLevel === 'Mid') {
    recommendations.push('Consider specializing in a specific domain or technology');
    recommendations.push('Take on leadership roles in projects');
  } else {
    recommendations.push('Share your expertise through mentoring or technical writing');
    recommendations.push('Explore architectural and system design roles');
  }
  
  // Skill diversity recommendations
  const categories = Object.keys(SKILL_CATEGORIES);
  const coveredCategories = categories.filter(category =>
    SKILL_CATEGORIES[category].some(skill => normalizedSkills.includes(skill))
  );
  
  if (coveredCategories.length < 3) {
    recommendations.push('Expand your skill set across different technology domains');
  }
  
  return recommendations;
}

// ============================================================================
// Career Path Suggestions
// ============================================================================

export function generateCareerPathSuggestion(
  possibleRoles: string[],
  experienceLevel: string,
  topMatch: JobMatch | undefined
): string {
  if (possibleRoles.length === 0) {
    return 'Focus on building foundational skills in a specific technology stack to establish your career direction.';
  }
  
  const primaryRole = possibleRoles[0];
  
  if (experienceLevel === 'Junior') {
    return `Continue developing your ${primaryRole} skills. Focus on building a strong portfolio and gaining hands-on experience with real-world projects.`;
  } else if (experienceLevel === 'Mid') {
    return `As a ${primaryRole}, consider specializing in advanced topics or transitioning into senior technical roles. Explore system design and architectural patterns.`;
  } else {
    return `With your senior-level experience as a ${primaryRole}, consider leadership positions such as Tech Lead, Engineering Manager, or Principal Engineer roles.`;
  }
}

// ============================================================================
// Main ATS Engine
// ============================================================================

export class ATSEngine {
  /**
   * Analyze a candidate resume against job roles
   */
  static analyze(resume: CandidateResume, jobs: JobRole[]): ATSResult {
    // Step 1: Detect and normalize skills
    const detectedSkills = detectSkills(resume);
    
    // Step 2: Calculate experience level
    const totalExperience = calculateTotalExperience(resume);
    const experienceLevel = classifyExperienceLevel(totalExperience);
    
    // Step 3: Match against job roles (with semantic matching and stuffing detection)
    const jobMatches = matchJobRoles(detectedSkills, jobs, resume);
    
    // Step 4: Suggest possible roles
    const possibleRoles = suggestPossibleRoles(detectedSkills);
    
    // Step 5: Generate recommendations
    const recommendations = generateRecommendations(detectedSkills, jobMatches, experienceLevel);
    
    // Step 6: Generate career path suggestion
    const careerPathSuggestion = generateCareerPathSuggestion(
      possibleRoles,
      experienceLevel,
      jobMatches[0]
    );
    
    // Step 7: Calculate confidence score
    const confidenceScore = this.calculateConfidenceScore(resume, detectedSkills, jobMatches);
    
    // Step 8: Generate summary
    const summary = this.generateSummary(experienceLevel, detectedSkills, possibleRoles);
    
    return {
      summary,
      detected_skills: detectedSkills,
      experience_level: experienceLevel,
      possible_roles: possibleRoles,
      job_matches: jobMatches,
      recommendations,
      career_path_suggestion: careerPathSuggestion,
      confidence_score: confidenceScore,
    };
  }
  
  private static calculateConfidenceScore(
    resume: CandidateResume,
    detectedSkills: string[],
    jobMatches: JobMatch[]
  ): number {
    let confidence = 0.5; // Base confidence
    
    // Increase confidence based on data completeness
    if (resume.skills && resume.skills.length > 0) confidence += 0.1;
    if (resume.workExperience && resume.workExperience.length > 0) confidence += 0.15;
    if (resume.projects && resume.projects.length > 0) confidence += 0.1;
    if (resume.education && resume.education.length > 0) confidence += 0.05;
    
    // Increase confidence based on skill detection
    if (detectedSkills.length >= 5) confidence += 0.1;
    
    // Decrease confidence if no good matches
    if (jobMatches.length > 0 && jobMatches[0].match_score < 30) {
      confidence -= 0.1;
    }
    
    return Math.min(Math.max(confidence, 0), 1);
  }
  
  private static generateSummary(
    experienceLevel: string,
    skills: string[],
    roles: string[]
  ): string {
    const skillCount = skills.length;
    const primaryRole = roles[0] || 'Software Developer';
    
    return `${experienceLevel}-level professional with ${skillCount} detected skills. Best suited for ${primaryRole} roles.`;
  }
}

// ============================================================================
// Exports
// ============================================================================

export default ATSEngine;

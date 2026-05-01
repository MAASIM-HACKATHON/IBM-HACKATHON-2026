import type { EmailFormValues } from './emailGenerator';

interface AnalysisResult {
  purpose: EmailFormValues['purpose'];
  tone: EmailFormValues['tone'];
  jobRole: string;
  company: string;
  extraInstruction: string;
  refinement: EmailFormValues['refinement'];
  confidence: number;
}

/**
 * Analyzes pasted content to intelligently detect email context and auto-fill form fields
 */
export function analyzeContent(content: string): AnalysisResult | null {
  if (!content || content.trim().length < 20) {
    return null;
  }

  const lowerContent = content.toLowerCase();
  const lines = content.split('\n').filter(line => line.trim());
  
  // Initialize result with defaults
  const result: AnalysisResult = {
    purpose: 'job-application',
    tone: 'professional',
    jobRole: '',
    company: '',
    extraInstruction: '',
    refinement: 'none',
    confidence: 0,
  };

  let confidenceScore = 0;

  // ===== PURPOSE DETECTION =====
  
  // Job Application indicators
  const jobApplicationKeywords = [
    'apply', 'application', 'position', 'role', 'job', 'vacancy', 'opening',
    'resume', 'cv', 'curriculum vitae', 'hire', 'hiring', 'candidate',
    'interview', 'qualification', 'experience', 'skills', 'background'
  ];
  
  // Follow-up indicators
  const followUpKeywords = [
    'follow up', 'following up', 'check in', 'checking in', 'status update',
    'any update', 'heard back', 'previous email', 'earlier message', 'last week',
    'wondering if', 'wanted to follow', 'circling back'
  ];
  
  // Thank you indicators
  const thankYouKeywords = [
    'thank you', 'thanks', 'grateful', 'appreciate', 'gratitude',
    'thankful', 'much appreciated', 'many thanks'
  ];
  
  // Networking indicators
  const networkingKeywords = [
    'connect', 'network', 'coffee', 'meet', 'introduction', 'advice',
    'mentor', 'guidance', 'learn from', 'pick your brain', 'informational'
  ];
  
  // Inquiry indicators
  const inquiryKeywords = [
    'question', 'inquiry', 'ask', 'wondering', 'information about',
    'details about', 'clarification', 'could you', 'would you'
  ];

  const jobAppCount = jobApplicationKeywords.filter(kw => lowerContent.includes(kw)).length;
  const followUpCount = followUpKeywords.filter(kw => lowerContent.includes(kw)).length;
  const thankYouCount = thankYouKeywords.filter(kw => lowerContent.includes(kw)).length;
  const networkingCount = networkingKeywords.filter(kw => lowerContent.includes(kw)).length;
  const inquiryCount = inquiryKeywords.filter(kw => lowerContent.includes(kw)).length;

  if (jobAppCount >= 2) {
    result.purpose = 'job-application';
    confidenceScore += 20;
  } else if (followUpCount >= 1) {
    result.purpose = 'follow-up';
    confidenceScore += 20;
  } else if (thankYouCount >= 1) {
    result.purpose = 'thank-you';
    confidenceScore += 20;
  } else if (networkingCount >= 2) {
    result.purpose = 'networking';
    confidenceScore += 20;
  } else if (inquiryCount >= 1) {
    result.purpose = 'inquiry';
    confidenceScore += 15;
  }

  // ===== TONE DETECTION =====
  
  const formalIndicators = [
    'dear sir', 'dear madam', 'to whom it may concern', 'sincerely',
    'respectfully', 'kindly', 'hereby', 'pursuant', 'regarding'
  ];
  
  const friendlyIndicators = [
    'hi', 'hey', 'hope you', 'hope all is well', 'how are you',
    'excited', 'looking forward', 'would love to', 'happy to'
  ];
  
  const enthusiasticIndicators = [
    'thrilled', 'excited', 'passionate', 'eager', 'can\'t wait',
    'amazing', 'fantastic', 'incredible', 'love to', '!'
  ];

  const formalCount = formalIndicators.filter(ind => lowerContent.includes(ind)).length;
  const friendlyCount = friendlyIndicators.filter(ind => lowerContent.includes(ind)).length;
  const enthusiasticCount = enthusiasticIndicators.filter(ind => lowerContent.includes(ind)).length;
  const exclamationCount = (content.match(/!/g) || []).length;

  if (enthusiasticCount >= 2 || exclamationCount >= 3) {
    result.tone = 'enthusiastic';
    confidenceScore += 15;
  } else if (friendlyCount >= 2) {
    result.tone = 'friendly';
    confidenceScore += 15;
  } else if (formalCount >= 1) {
    result.tone = 'formal';
    confidenceScore += 15;
  } else {
    result.tone = 'professional';
    confidenceScore += 10;
  }

  // ===== JOB ROLE DETECTION =====
  
  const rolePatterns = [
    /(?:for|as|the|a)\s+([\w\s]{2,40}?)\s+(?:position|role|job|opening)/i,
    /(?:applying|apply)\s+(?:for|to)\s+(?:the|a)?\s*([\w\s]{2,40}?)\s+(?:position|role|at)/i,
    /(?:interested in|seeking)\s+(?:the|a)?\s*([\w\s]{2,40}?)\s+(?:position|role)/i,
  ];

  for (const pattern of rolePatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      result.jobRole = match[1].trim();
      confidenceScore += 20;
      break;
    }
  }

  // Common job titles
  const jobTitles = [
    'developer', 'engineer', 'designer', 'manager', 'analyst', 'consultant',
    'intern', 'associate', 'specialist', 'coordinator', 'director', 'lead',
    'senior', 'junior', 'frontend', 'backend', 'full stack', 'data scientist',
    'product manager', 'project manager', 'software engineer'
  ];

  if (!result.jobRole) {
    for (const title of jobTitles) {
      if (lowerContent.includes(title)) {
        result.jobRole = title.split(' ').map(w => 
          w.charAt(0).toUpperCase() + w.slice(1)
        ).join(' ');
        confidenceScore += 10;
        break;
      }
    }
  }

  // ===== COMPANY DETECTION =====
  
  const companyPatterns = [
    /(?:at|with|for|join)\s+([A-Z][A-Za-z0-9&\s]{1,30}?)(?:\s+(?:company|corporation|inc|llc|team))?(?:\.|,|\s+(?:as|in|to))/,
    /(?:company|organization|firm):\s*([A-Z][A-Za-z0-9&\s]{1,30})/,
  ];

  for (const pattern of companyPatterns) {
    const match = content.match(pattern);
    if (match && match[1]) {
      result.company = match[1].trim();
      confidenceScore += 15;
      break;
    }
  }

  // Well-known companies
  const knownCompanies = [
    'IBM', 'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta', 'Facebook',
    'Netflix', 'Tesla', 'Oracle', 'Salesforce', 'Adobe', 'Intel', 'Cisco'
  ];

  if (!result.company) {
    for (const company of knownCompanies) {
      const regex = new RegExp(`\\b${company}\\b`, 'i');
      if (regex.test(content)) {
        result.company = company;
        confidenceScore += 15;
        break;
      }
    }
  }

  // ===== EXTRA INSTRUCTION GENERATION =====
  
  const instructions: string[] = [];

  if (lowerContent.includes('team') || lowerContent.includes('collaborate')) {
    instructions.push('Emphasize teamwork and collaboration skills');
  }
  
  if (lowerContent.includes('learn') || lowerContent.includes('grow')) {
    instructions.push('Highlight willingness to learn and grow');
  }
  
  if (lowerContent.includes('passion') || lowerContent.includes('enthusiastic')) {
    instructions.push('Show genuine passion and enthusiasm');
  }
  
  if (lowerContent.includes('experience') && jobAppCount > 0) {
    instructions.push('Focus on relevant experience and achievements');
  }

  if (exclamationCount === 0 && result.tone !== 'formal') {
    instructions.push('Keep tone warm but professional');
  }

  if (instructions.length > 0) {
    result.extraInstruction = instructions.join('. ') + '.';
    confidenceScore += 10;
  }

  // ===== REFINEMENT DETECTION =====
  
  if (lowerContent.length < 100) {
    result.refinement = 'shorter';
  } else if (lowerContent.length > 300 || lines.length > 8) {
    result.refinement = 'longer';
  } else if (result.tone === 'formal') {
    result.refinement = 'more-formal';
  } else if (result.tone === 'friendly' || result.tone === 'enthusiastic') {
    result.refinement = 'more-casual';
  } else {
    result.refinement = 'none';
  }

  result.confidence = Math.min(confidenceScore, 100);

  // Only return if confidence is reasonable
  return result.confidence >= 30 ? result : null;
}

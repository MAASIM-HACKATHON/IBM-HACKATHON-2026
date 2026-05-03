/**
 * Resume Data Validation Service
 * Multi-stage validation pipeline for AI-parsed resume data
 */

import { ParsedResumeData, ValidationResult, AIResumeOutput } from '@/types/resume-parser.types';

export class ResumeValidationService {
  /**
   * Stage 1: Schema Validation
   * Ensures data structure matches expected format
   */
  validateSchema(data: AIResumeOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Required fields check
    if (!data.personal_info) {
      errors.push('Missing personal_info object');
    } else {
      if (!data.personal_info.email && !data.personal_info.name) {
        errors.push('Missing both email and name in personal info');
      }
    }
    
    // Array validations
    if (!Array.isArray(data.skills)) {
      errors.push('Skills must be an array');
    }
    if (!Array.isArray(data.work_experience)) {
      errors.push('Work experience must be an array');
    }
    if (!Array.isArray(data.education)) {
      errors.push('Education must be an array');
    }
    if (!Array.isArray(data.certifications)) {
      errors.push('Certifications must be an array');
    }
    if (!Array.isArray(data.projects)) {
      errors.push('Projects must be an array');
    }
    
    // Minimum data requirements
    if (Array.isArray(data.skills) && data.skills.length === 0) {
      warnings.push('No skills extracted');
    }
    if (Array.isArray(data.work_experience) && data.work_experience.length === 0) {
      warnings.push('No work experience found');
    }
    
    const confidenceScore = this.calculateConfidence(data, errors, warnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidenceScore
    };
  }
  
  /**
   * Stage 2: Data Quality Validation
   * Validates and corrects data quality issues
   */
  validateDataQuality(data: AIResumeOutput): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Email format validation
    if (data.personal_info?.email) {
      if (!this.isValidEmail(data.personal_info.email)) {
        errors.push('Invalid email format');
      }
    }
    
    // URL reconstruction validation
    if (data.personal_info?.linkedin) {
      const linkedin = data.personal_info.linkedin;
      if (linkedin.includes('\n') || linkedin.includes(' ')) {
        warnings.push('LinkedIn URL contains whitespace/newlines - will be cleaned');
      }
      if (!linkedin.includes('linkedin.com/in/')) {
        warnings.push('LinkedIn URL may be incomplete');
      }
    }
    
    // GitHub URL validation
    if (data.personal_info?.github) {
      const github = data.personal_info.github;
      if (!github.includes('github.com/')) {
        warnings.push('GitHub URL may be incomplete');
      }
    }
    
    // Work experience validation
    data.work_experience?.forEach((exp, idx) => {
      if (!exp.company) {
        warnings.push(`Work experience ${idx + 1}: Missing company name`);
      }
      if (!exp.title) {
        warnings.push(`Work experience ${idx + 1}: Missing job title`);
      }
      if (!exp.duration) {
        warnings.push(`Work experience ${idx + 1}: Missing duration`);
      }
    });
    
    // Education validation
    data.education?.forEach((edu, idx) => {
      if (!edu.institution) {
        warnings.push(`Education ${idx + 1}: Missing institution`);
      }
      if (!edu.degree) {
        warnings.push(`Education ${idx + 1}: Missing degree`);
      }
    });
    
    // Duplicate detection
    if (Array.isArray(data.skills)) {
      const duplicateSkills = this.findDuplicates(data.skills);
      if (duplicateSkills.length > 0) {
        warnings.push(`Found ${duplicateSkills.length} duplicate skills`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      confidenceScore: 0
    };
  }
  
  /**
   * Stage 3: Apply Fallback Corrections
   * Fix common issues and apply rule-based fallbacks
   */
  applyFallbackCorrections(aiData: AIResumeOutput, rawText: string): AIResumeOutput {
    const corrected = { ...aiData };
    
    // Fix broken URLs
    if (corrected.personal_info?.linkedin) {
      corrected.personal_info.linkedin = this.reconstructURL(corrected.personal_info.linkedin);
    }
    if (corrected.personal_info?.github) {
      corrected.personal_info.github = this.reconstructURL(corrected.personal_info.github);
    }
    if (corrected.personal_info?.portfolio) {
      corrected.personal_info.portfolio = this.reconstructURL(corrected.personal_info.portfolio);
    }
    
    // If AI missed critical fields, use regex extraction as fallback
    if (!corrected.personal_info?.email) {
      const email = this.extractEmailRegex(rawText);
      if (email) {
        corrected.personal_info = corrected.personal_info || {};
        corrected.personal_info.email = email;
      }
    }
    
    if (!corrected.personal_info?.phone) {
      const phone = this.extractPhoneRegex(rawText);
      if (phone) {
        corrected.personal_info = corrected.personal_info || {};
        corrected.personal_info.phone = phone;
      }
    }
    
    // Remove duplicate skills
    if (Array.isArray(corrected.skills)) {
      corrected.skills = this.removeDuplicates(corrected.skills);
    }
    
    // Calculate years of experience if missing
    corrected.work_experience?.forEach(exp => {
      if (!exp.years_of_experience && exp.duration) {
        exp.years_of_experience = this.calculateYears(exp.duration);
      }
    });
    
    return corrected;
  }
  
  /**
   * Stage 4: Calculate Confidence Score
   */
  calculateConfidence(data: AIResumeOutput, errors: string[], warnings: string[]): number {
    let score = 100;
    
    // Deduct for errors (critical)
    score -= errors.length * 15;
    
    // Deduct for warnings (minor)
    score -= warnings.length * 5;
    
    // Deduct for missing optional fields
    if (!data.personal_info?.phone) score -= 3;
    if (!data.personal_info?.linkedin) score -= 3;
    if (!data.personal_info?.name) score -= 5;
    if (!data.summary) score -= 5;
    if (!data.certifications || data.certifications.length === 0) score -= 3;
    if (!data.projects || data.projects.length === 0) score -= 3;
    
    // Bonus for rich data
    if (data.skills && data.skills.length > 10) score += 5;
    if (data.work_experience && data.work_experience.length > 2) score += 5;
    if (data.education && data.education.length > 0) score += 3;
    
    return Math.max(0, Math.min(100, score));
  }
  
  // ============================================================================
  // Helper Methods
  // ============================================================================
  
  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
  
  private reconstructURL(url: string): string {
    // Remove newlines and extra spaces
    return url.replace(/\n/g, '').replace(/\s+/g, '').trim();
  }
  
  private extractEmailRegex(text: string): string | null {
    const match = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    return match ? match[0] : null;
  }
  
  private extractPhoneRegex(text: string): string | null {
    const match = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    return match ? match[0] : null;
  }
  
  private calculateYears(duration: string): number {
    // Try to extract years from duration string
    const yearMatch = duration.match(/(\d+)\s*years?/i);
    if (yearMatch) {
      return parseInt(yearMatch[1]);
    }
    
    // Try to calculate from date range
    const dateMatch = duration.match(/(\d{4})\s*[-–]\s*(\d{4}|Present)/i);
    if (dateMatch) {
      const startYear = parseInt(dateMatch[1]);
      const endYear = dateMatch[2].toLowerCase() === 'present' 
        ? new Date().getFullYear() 
        : parseInt(dateMatch[2]);
      return Math.max(0, endYear - startYear);
    }
    
    return 0;
  }
  
  private findDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const duplicates = new Set<string>();
    
    arr.forEach(item => {
      const normalized = item.toLowerCase().trim();
      if (seen.has(normalized)) {
        duplicates.add(item);
      }
      seen.add(normalized);
    });
    
    return Array.from(duplicates);
  }
  
  private removeDuplicates(arr: string[]): string[] {
    const seen = new Set<string>();
    const result: string[] = [];
    
    arr.forEach(item => {
      const normalized = item.toLowerCase().trim();
      if (!seen.has(normalized)) {
        seen.add(normalized);
        result.push(item);
      }
    });
    
    return result;
  }
}

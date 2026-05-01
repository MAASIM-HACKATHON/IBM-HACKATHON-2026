import { describe, it, expect } from '@jest/globals';
import {
  normalizeSkill,
  normalizeSkills,
  detectSkills,
  calculateTotalExperience,
  classifyExperienceLevel,
  calculateMatchScore,
  matchJobRoles,
  suggestPossibleRoles,
  ATSEngine,
  calculateSemanticSimilarity,
  matchSkillSemantically,
  findBestMatch,
  detectKeywordStuffing,
  type CandidateResume,
  type JobRole,
} from './ats-engine';

describe('ATS Engine - Skill Normalization', () => {
  it('should normalize skill variants', () => {
    expect(normalizeSkill('ReactJS')).toBe('React');
    expect(normalizeSkill('react.js')).toBe('React');
    expect(normalizeSkill('NodeJS')).toBe('Node.js');
    expect(normalizeSkill('PostgreSQL')).toBe('PostgreSQL');
  });

  it('should remove duplicate skills', () => {
    const skills = ['React', 'ReactJS', 'react.js', 'Node.js', 'nodejs'];
    const normalized = normalizeSkills(skills);
    expect(normalized).toContain('React');
    expect(normalized).toContain('Node.js');
    expect(normalized.length).toBe(2);
  });
});

describe('ATS Engine - Semantic Matching', () => {
  it('should return 1.0 for exact matches', () => {
    expect(calculateSemanticSimilarity('React', 'React')).toBe(1.0);
    expect(calculateSemanticSimilarity('Node.js', 'Node.js')).toBe(1.0);
  });

  it('should return high similarity for related skills', () => {
    const similarity = calculateSemanticSimilarity('React', 'React Native');
    expect(similarity).toBeGreaterThanOrEqual(0.6);
    expect(similarity).toBeLessThan(1.0);
  });

  it('should return moderate similarity for same category skills', () => {
    const similarity = calculateSemanticSimilarity('React', 'Vue');
    expect(similarity).toBeGreaterThanOrEqual(0.5);
    expect(similarity).toBeLessThan(0.7);
  });

  it('should return 0 for unrelated skills', () => {
    expect(calculateSemanticSimilarity('React', 'Python')).toBe(0);
    expect(calculateSemanticSimilarity('Docker', 'MongoDB')).toBe(0);
  });

  it('should handle partial string matching', () => {
    const similarity = calculateSemanticSimilarity('React', 'React Native');
    expect(similarity).toBeGreaterThan(0);
  });
});

describe('ATS Engine - Partial Skill Matching', () => {
  it('should match skills semantically', () => {
    const match = matchSkillSemantically('React Native', 'React');
    expect(match.matched).toBe(true);
    expect(match.matchType).not.toBe('none');
  });

  it('should find best match from candidate skills', () => {
    const candidateSkills = ['React Native', 'Node.js', 'Python'];
    const bestMatch = findBestMatch(candidateSkills, 'React');
    
    expect(bestMatch.skill).toBe('React Native');
    expect(bestMatch.score).toBeGreaterThan(0.6);
  });

  it('should return null when no match found', () => {
    const candidateSkills = ['Python', 'Django'];
    const bestMatch = findBestMatch(candidateSkills, 'React');
    
    expect(bestMatch.skill).toBeNull();
    expect(bestMatch.score).toBeLessThan(0.6);
  });
});

describe('ATS Engine - Keyword Stuffing Detection', () => {
  it('should return 1.0 for normal keyword usage', () => {
    const resume: CandidateResume = {
      rawText: 'I have experience with React, Node.js, and Python. I built several projects using these technologies.',
      skills: ['React', 'Node.js', 'Python'],
    };
    const keywords = ['React', 'Node.js', 'Python'];
    
    const penalty = detectKeywordStuffing(resume, keywords);
    expect(penalty).toBeGreaterThanOrEqual(0.9);
  });

  it('should apply penalty for high keyword density', () => {
    const resume: CandidateResume = {
      rawText: 'React React React React React React React React React React',
      skills: ['React'],
    };
    const keywords = ['React'];
    
    const penalty = detectKeywordStuffing(resume, keywords);
    expect(penalty).toBeLessThan(0.9);
  });

  it('should apply penalty for excessive repetition', () => {
    const stuffedText = Array(15).fill('React').join(' ') + ' developer with experience';
    const resume: CandidateResume = {
      rawText: stuffedText,
      skills: ['React'],
    };
    const keywords = ['React'];
    
    const penalty = detectKeywordStuffing(resume, keywords);
    expect(penalty).toBeLessThan(1.0);
  });

  it('should return 1.0 when no raw text provided', () => {
    const resume: CandidateResume = {
      skills: ['React', 'Node.js'],
    };
    const keywords = ['React'];
    
    const penalty = detectKeywordStuffing(resume, keywords);
    expect(penalty).toBe(1.0);
  });
});

describe('ATS Engine - Skill Detection', () => {
  it('should detect skills from multiple sources', () => {
    const resume: CandidateResume = {
      skills: ['React', 'Node.js'],
      workExperience: [
        {
          title: 'Developer',
          company: 'Tech Co',
          duration: '2 years',
          skills: ['Python'],
          description: 'Worked with Docker and Kubernetes',
        },
      ],
      projects: [
        {
          name: 'Project 1',
          description: 'Built with TypeScript',
          technologies: ['MongoDB'],
        },
      ],
    };

    const skills = detectSkills(resume);
    expect(skills).toContain('React');
    expect(skills).toContain('Node.js');
    expect(skills).toContain('Python');
    expect(skills).toContain('Docker');
    expect(skills).toContain('Kubernetes');
    expect(skills).toContain('TypeScript');
    expect(skills).toContain('MongoDB');
  });
});

describe('ATS Engine - Experience Classification', () => {
  it('should classify Junior level (0-2 years)', () => {
    expect(classifyExperienceLevel(0)).toBe('Junior');
    expect(classifyExperienceLevel(1.5)).toBe('Junior');
    expect(classifyExperienceLevel(2.9)).toBe('Junior');
  });

  it('should classify Mid level (3-5 years)', () => {
    expect(classifyExperienceLevel(3)).toBe('Mid');
    expect(classifyExperienceLevel(4)).toBe('Mid');
    expect(classifyExperienceLevel(5.9)).toBe('Mid');
  });

  it('should classify Senior level (6+ years)', () => {
    expect(classifyExperienceLevel(6)).toBe('Senior');
    expect(classifyExperienceLevel(10)).toBe('Senior');
    expect(classifyExperienceLevel(15)).toBe('Senior');
  });

  it('should calculate total experience from work history', () => {
    const resume: CandidateResume = {
      workExperience: [
        {
          title: 'Developer',
          company: 'Company A',
          duration: '2 years',
          yearsOfExperience: 2,
        },
        {
          title: 'Senior Developer',
          company: 'Company B',
          duration: '3 years',
          yearsOfExperience: 3,
        },
      ],
    };

    const total = calculateTotalExperience(resume);
    expect(total).toBe(5);
  });
});

describe('ATS Engine - Job Matching with Semantic Matching', () => {
  it('should match jobs with semantic skill matching', () => {
    const candidateSkills = ['React Native', 'Node.js', 'MongoDB'];
    const job: JobRole = {
      job_title: 'Frontend Developer',
      required_skills: ['React', 'JavaScript'],
      preferred_skills: ['TypeScript'],
      keywords: ['UI', 'Frontend'],
    };

    const result = calculateMatchScore(candidateSkills, job);
    
    // Should match React Native to React semantically
    expect(result.score).toBeGreaterThan(0);
    expect(result.matchingSkills).toContain('React');
  });

  it('should handle empty required_skills edge case', () => {
    const candidateSkills = ['React', 'Node.js'];
    const job: JobRole = {
      job_title: 'Developer',
      required_skills: [],
      preferred_skills: ['React'],
      keywords: ['Developer'],
    };

    const result = calculateMatchScore(candidateSkills, job);
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it('should not count preferred skills that overlap with required', () => {
    const candidateSkills = ['React', 'Node.js', 'TypeScript'];
    const job: JobRole = {
      job_title: 'Full-Stack Developer',
      required_skills: ['React', 'Node.js'],
      preferred_skills: ['React', 'TypeScript'], // React overlaps
      keywords: [],
    };

    const result = calculateMatchScore(candidateSkills, job);
    
    // React should only be counted once in matching_skills
    const reactCount = result.matchingSkills.filter(s => s === 'React').length;
    expect(reactCount).toBe(1);
  });

  it('should apply keyword stuffing penalty', () => {
    const candidateSkills = ['React', 'Node.js'];
    const resume: CandidateResume = {
      skills: candidateSkills,
      rawText: Array(20).fill('React').join(' ') + ' developer',
    };
    const job: JobRole = {
      job_title: 'Developer',
      required_skills: ['React'],
      preferred_skills: [],
      keywords: ['React'],
    };

    const resultWithStuffing = calculateMatchScore(candidateSkills, job, resume);
    const resultWithoutStuffing = calculateMatchScore(candidateSkills, job);
    
    // Score with stuffing should be lower due to penalty
    expect(resultWithStuffing.score).toBeLessThanOrEqual(resultWithoutStuffing.score);
  });
});

describe('ATS Engine - Role Suggestions', () => {
  it('should suggest Frontend Developer for frontend skills', () => {
    const skills = ['React', 'JavaScript', 'HTML', 'CSS'];
    const roles = suggestPossibleRoles(skills);
    expect(roles).toContain('Frontend Developer');
  });

  it('should suggest Full-Stack Developer for mixed skills', () => {
    const skills = ['React', 'Node.js', 'JavaScript'];
    const roles = suggestPossibleRoles(skills);
    expect(roles).toContain('Full-Stack Developer');
  });

  it('should suggest DevOps Engineer for DevOps skills', () => {
    const skills = ['Docker', 'Kubernetes', 'AWS'];
    const roles = suggestPossibleRoles(skills);
    expect(roles).toContain('DevOps Engineer');
  });
});

describe('ATS Engine - Full Integration', () => {
  it('should produce valid ATS result', () => {
    const resume: CandidateResume = {
      skills: ['React', 'Node.js', 'MongoDB'],
      workExperience: [
        {
          title: 'Full-Stack Developer',
          company: 'Tech Corp',
          duration: '3 years',
          yearsOfExperience: 3,
          description: 'Built web applications with React and Node.js',
        },
      ],
      projects: [
        {
          name: 'E-commerce Platform',
          description: 'Built with React and Express',
          technologies: ['React', 'Express', 'MongoDB'],
        },
      ],
      education: [
        {
          degree: 'BS Computer Science',
          institution: 'University',
          year: '2020',
        },
      ],
    };

    const jobs: JobRole[] = [
      {
        job_title: 'Frontend Developer',
        required_skills: ['React', 'JavaScript'],
        preferred_skills: ['TypeScript'],
        keywords: ['UI', 'Frontend'],
      },
      {
        job_title: 'Backend Developer',
        required_skills: ['Node.js', 'MongoDB'],
        preferred_skills: ['Express'],
        keywords: ['API', 'Backend'],
      },
    ];

    const result = ATSEngine.analyze(resume, jobs);

    // Validate schema compliance
    expect(result).toHaveProperty('summary');
    expect(result).toHaveProperty('detected_skills');
    expect(result).toHaveProperty('experience_level');
    expect(result).toHaveProperty('possible_roles');
    expect(result).toHaveProperty('job_matches');
    expect(result).toHaveProperty('recommendations');
    expect(result).toHaveProperty('career_path_suggestion');
    expect(result).toHaveProperty('confidence_score');

    // Validate types
    expect(typeof result.summary).toBe('string');
    expect(Array.isArray(result.detected_skills)).toBe(true);
    expect(['Junior', 'Mid', 'Senior']).toContain(result.experience_level);
    expect(Array.isArray(result.possible_roles)).toBe(true);
    expect(Array.isArray(result.job_matches)).toBe(true);
    expect(Array.isArray(result.recommendations)).toBe(true);
    expect(typeof result.career_path_suggestion).toBe('string');
    expect(typeof result.confidence_score).toBe('number');
    expect(result.confidence_score).toBeGreaterThanOrEqual(0);
    expect(result.confidence_score).toBeLessThanOrEqual(1);

    // Validate job matches structure
    result.job_matches.forEach(match => {
      expect(match).toHaveProperty('job_title');
      expect(match).toHaveProperty('match_score');
      expect(match).toHaveProperty('matching_skills');
      expect(match).toHaveProperty('missing_skills');
      expect(match.match_score).toBeGreaterThanOrEqual(0);
      expect(match.match_score).toBeLessThanOrEqual(100);
    });

    // Validate skills detected
    expect(result.detected_skills.length).toBeGreaterThan(0);
    expect(result.detected_skills).toContain('React');
    expect(result.detected_skills).toContain('Node.js');
  });

  it('should handle empty resume gracefully', () => {
    const resume: CandidateResume = {};
    const jobs: JobRole[] = [
      {
        job_title: 'Developer',
        required_skills: ['React'],
        preferred_skills: [],
        keywords: [],
      },
    ];

    const result = ATSEngine.analyze(resume, jobs);

    expect(result.detected_skills).toEqual([]);
    expect(result.experience_level).toBe('Junior');
    expect(result.confidence_score).toBeLessThan(0.7);
  });

  it('should handle resume with no matching skills', () => {
    const resume: CandidateResume = {
      skills: ['Python', 'Django', 'PostgreSQL'],
      workExperience: [
        {
          title: 'Backend Developer',
          company: 'Company',
          duration: '2 years',
          yearsOfExperience: 2,
        },
      ],
    };

    const jobs: JobRole[] = [
      {
        job_title: 'Frontend Developer',
        required_skills: ['React', 'Vue', 'Angular'],
        preferred_skills: ['TypeScript'],
        keywords: ['UI'],
      },
    ];

    const result = ATSEngine.analyze(resume, jobs);

    expect(result.job_matches[0].match_score).toBeLessThan(50);
    expect(result.job_matches[0].missing_skills.length).toBeGreaterThan(0);
  });
});

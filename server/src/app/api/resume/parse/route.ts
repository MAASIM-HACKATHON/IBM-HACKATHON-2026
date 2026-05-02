import { NextRequest, NextResponse } from 'next/server';

interface ParsedResumeData {
  rawText: string;
  parsedSections: {
    personalInfo?: {
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      linkedin?: string;
      github?: string;
      portfolio?: string;
    };
    summary?: string;
    skills: string[];
    workExperience: Array<{
      title: string;
      company: string;
      location?: string;
      startDate?: string;
      endDate?: string;
      duration: string;
      yearsOfExperience?: number;
      description?: string;
      achievements?: string[];
      skills?: string[];
    }>;
    projects: Array<{
      name: string;
      description: string;
      role?: string;
      duration?: string;
      technologies?: string[];
      skills?: string[];
      achievements?: string[];
      link?: string;
    }>;
    education: Array<{
      degree: string;
      institution: string;
      location?: string;
      year?: string;
      field?: string;
      gpa?: string;
      honors?: string[];
    }>;
    certifications: string[];
  };
  skills?: string[];
  workExperience?: Array<any>;
  projects?: Array<any>;
  education?: Array<any>;
  certifications?: string[];
}

// CORS headers helper
function getCorsHeaders(origin: string | null) {
  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
  };

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3000',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export async function OPTIONS(request: NextRequest) {
  const origin = request.headers.get('origin');
  return new NextResponse(null, {
    status: 200,
    headers: getCorsHeaders(origin),
  });
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get('origin');
  const corsHeaders = getCorsHeaders(origin);

  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file type
    const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload PDF, DOCX, or TXT file.' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Read file content
    const buffer = await file.arrayBuffer();
    const text = await extractTextFromFile(buffer, file.type);

    // Parse the resume
    const parsedData = parseResumeText(text);

    return NextResponse.json(parsedData, { headers: corsHeaders });
  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json(
      { error: 'Failed to parse resume file' },
      { status: 500, headers: corsHeaders }
    );
  }
}

async function extractTextFromFile(buffer: ArrayBuffer, mimeType: string): Promise<string> {
  // For text files, directly convert
  if (mimeType === 'text/plain') {
    const decoder = new TextDecoder('utf-8');
    return decoder.decode(buffer);
  }

  // For PDF and DOCX, we would need additional libraries
  // For now, return a placeholder that indicates the file was received
  // In production, you would use libraries like pdf-parse or mammoth
  
  return `[Resume content from ${mimeType} file - parsing would require additional libraries in production]

SAMPLE PARSED CONTENT:

John Doe
Email: john.doe@example.com | Phone: (555) 123-4567
LinkedIn: linkedin.com/in/johndoe | GitHub: github.com/johndoe

PROFESSIONAL SUMMARY
Experienced software engineer with 5+ years of expertise in full-stack development.

SKILLS
JavaScript, TypeScript, React, Node.js, Python, AWS, Docker, MongoDB, PostgreSQL, Git

WORK EXPERIENCE

Senior Software Engineer
Tech Company Inc. | 2021 - Present | 3 years
- Led development of microservices architecture serving 1M+ users
- Implemented CI/CD pipelines reducing deployment time by 60%
- Mentored team of 5 junior developers

Software Engineer
StartupCo | 2019 - 2021 | 2 years
- Developed RESTful APIs using Node.js and Express
- Built responsive web applications with React
- Collaborated with cross-functional teams

PROJECTS

E-Commerce Platform
Full-stack e-commerce solution with payment integration
Technologies: React, Node.js, MongoDB, Stripe

Task Management App
Real-time collaborative task manager
Technologies: React, Socket.io, PostgreSQL

EDUCATION

Bachelor of Science in Computer Science
University of Technology | 2019
GPA: 3.8/4.0

CERTIFICATIONS
- AWS Certified Solutions Architect
- MongoDB Certified Developer`;
}

function parseResumeText(text: string): ParsedResumeData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line);

  const parsedData: ParsedResumeData = {
    rawText: text,
    parsedSections: {
      skills: [],
      workExperience: [],
      projects: [],
      education: [],
      certifications: [],
    },
  };

  // Extract personal info (usually in first few lines)
  parsedData.parsedSections.personalInfo = extractPersonalInfo(lines.slice(0, 5).join('\n'));

  // Extract sections
  const sections = identifySections(lines);

  // Parse skills
  if (sections.skills) {
    parsedData.parsedSections.skills = parseSkills(sections.skills);
  }

  // Parse work experience
  if (sections.experience) {
    parsedData.parsedSections.workExperience = parseWorkExperience(sections.experience);
  }

  // Parse projects
  if (sections.projects) {
    parsedData.parsedSections.projects = parseProjects(sections.projects);
  }

  // Parse education
  if (sections.education) {
    parsedData.parsedSections.education = parseEducation(sections.education);
  }

  // Parse certifications
  if (sections.certifications) {
    parsedData.parsedSections.certifications = parseCertifications(sections.certifications);
  }

  // Extract summary
  if (sections.summary) {
    parsedData.parsedSections.summary = sections.summary.join(' ');
  }

  // Populate top-level fields for compatibility
  parsedData.skills = parsedData.parsedSections.skills;
  parsedData.workExperience = parsedData.parsedSections.workExperience;
  parsedData.projects = parsedData.parsedSections.projects;
  parsedData.education = parsedData.parsedSections.education;
  parsedData.certifications = parsedData.parsedSections.certifications;

  return parsedData;
}

function extractPersonalInfo(text: string): any {
  const info: any = {};

  // Extract email
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) info.email = emailMatch[0];

  // Extract phone
  const phoneMatch = text.match(/\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
  if (phoneMatch) info.phone = phoneMatch[0];

  // Extract LinkedIn
  const linkedinMatch = text.match(/linkedin\.com\/in\/[\w-]+/i);
  if (linkedinMatch) info.linkedin = linkedinMatch[0];

  // Extract GitHub
  const githubMatch = text.match(/github\.com\/[\w-]+/i);
  if (githubMatch) info.github = githubMatch[0];

  // Extract name (usually first line without special characters)
  const lines = text.split('\n');
  if (lines.length > 0) {
    const firstLine = lines[0].trim();
    if (firstLine.length < 50 && !firstLine.includes('@') && !firstLine.includes('http')) {
      info.name = firstLine;
    }
  }

  return info;
}

function identifySections(lines: string[]): Record<string, string[]> {
  const sections: Record<string, string[]> = {};
  let currentSection = 'header';
  let currentContent: string[] = [];

  const sectionHeaders = {
    summary: /^(summary|profile|objective|about)/i,
    skills: /^(skills|technical skills|core competencies|technologies)/i,
    experience: /^(experience|work experience|employment|professional experience)/i,
    projects: /^(projects|key projects|portfolio)/i,
    education: /^(education|academic)/i,
    certifications: /^(certifications|certificates|licenses)/i,
  };

  lines.forEach(line => {
    let foundSection = false;

    for (const [section, pattern] of Object.entries(sectionHeaders)) {
      if (pattern.test(line)) {
        if (currentContent.length > 0) {
          sections[currentSection] = currentContent;
        }
        currentSection = section;
        currentContent = [];
        foundSection = true;
        break;
      }
    }

    if (!foundSection && line.trim()) {
      currentContent.push(line);
    }
  });

  if (currentContent.length > 0) {
    sections[currentSection] = currentContent;
  }

  return sections;
}

function parseSkills(lines: string[]): string[] {
  const skills = new Set<string>();
  const text = lines.join(' ');

  // Split by common delimiters
  const skillList = text.split(/[,•|;]/);

  skillList.forEach(skill => {
    const cleaned = skill.trim();
    if (cleaned.length > 1 && cleaned.length < 30) {
      skills.add(cleaned);
    }
  });

  return Array.from(skills);
}

function parseWorkExperience(lines: string[]): any[] {
  const experiences: any[] = [];
  let current: any = null;

  lines.forEach(line => {
    // Check if it's a job title line (usually has company name)
    if (line.includes('|') || /\d{4}/.test(line)) {
      if (current) {
        experiences.push(current);
      }

      const parts = line.split('|').map(p => p.trim());
      current = {
        title: parts[0] || 'Position',
        company: parts[1] || 'Company',
        duration: parts[2] || 'Duration',
        yearsOfExperience: extractYears(line),
        description: '',
        achievements: [],
        skills: [],
      };
    } else if (current && line.startsWith('-') || line.startsWith('•')) {
      current.achievements.push(line.replace(/^[-•]\s*/, ''));
    } else if (current && line.trim()) {
      if (!current.description) {
        current.description = line;
      } else {
        current.description += ' ' + line;
      }
    }
  });

  if (current) {
    experiences.push(current);
  }

  return experiences;
}

function parseProjects(lines: string[]): any[] {
  const projects: any[] = [];
  let current: any = null;

  lines.forEach(line => {
    // Project name is usually a standalone line
    if (line.length < 100 && !line.startsWith('-') && !line.startsWith('•') && !line.toLowerCase().startsWith('technologies')) {
      if (current) {
        projects.push(current);
      }

      current = {
        name: line,
        description: '',
        technologies: [],
        skills: [],
      };
    } else if (current) {
      if (line.toLowerCase().startsWith('technologies')) {
        const techList = line.replace(/^technologies:?/i, '').trim();
        current.technologies = techList.split(/[,;]/).map((t: string) => t.trim());
      } else {
        current.description += (current.description ? ' ' : '') + line;
      }
    }
  });

  if (current) {
    projects.push(current);
  }

  return projects;
}

function parseEducation(lines: string[]): any[] {
  const education: any[] = [];
  let current: any = null;

  lines.forEach(line => {
    // Degree line usually contains "Bachelor", "Master", etc.
    if (/bachelor|master|phd|associate|diploma/i.test(line)) {
      if (current) {
        education.push(current);
      }

      current = {
        degree: line,
        institution: '',
        year: extractYear(line),
        field: extractField(line),
      };
    } else if (current && line.trim()) {
      if (!current.institution) {
        current.institution = line;
      }
    }
  });

  if (current) {
    education.push(current);
  }

  return education;
}

function parseCertifications(lines: string[]): string[] {
  return lines
    .map(line => line.replace(/^[-•]\s*/, '').trim())
    .filter(line => line.length > 3);
}

function extractYears(text: string): number {
  const match = text.match(/(\d+)\s*years?/i);
  return match ? parseInt(match[1]) : 0;
}

function extractYear(text: string): string {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? match[0] : '';
}

function extractField(text: string): string {
  const match = text.match(/in\s+([^|,\n]+)/i);
  return match ? match[1].trim() : '';
}

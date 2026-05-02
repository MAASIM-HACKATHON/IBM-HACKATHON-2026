import { NextRequest, NextResponse } from 'next/server';

interface ApplicationEmailRequest {
  resumeContent: string;
  jobDescription: string;
  tone: 'formal' | 'confident' | 'neutral' | 'enthusiastic';
  emailType: 'application' | 'follow-up' | 'thank-you';
  additionalContext?: string;
}

interface ApplicationEmailResponse {
  subject: string;
  body: string;
  suggestions: string[];
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
    const body: ApplicationEmailRequest = await request.json();
    const { resumeContent, jobDescription, tone, emailType, additionalContext } = body;

    // Validate input
    if (!resumeContent || !jobDescription) {
      return NextResponse.json(
        { error: 'Resume content and job description are required' },
        { status: 400, headers: corsHeaders }
      );
    }

    // Generate email
    const email = generateApplicationEmail(
      resumeContent,
      jobDescription,
      tone,
      emailType,
      additionalContext
    );

    return NextResponse.json(email, { headers: corsHeaders });
  } catch (error) {
    console.error('Email generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate application email' },
      { status: 500, headers: corsHeaders }
    );
  }
}

function generateApplicationEmail(
  resumeContent: string,
  jobDescription: string,
  tone: 'formal' | 'confident' | 'neutral' | 'enthusiastic',
  emailType: 'application' | 'follow-up' | 'thank-you',
  additionalContext?: string
): ApplicationEmailResponse {
  // Extract key information
  const jobTitle = extractJobTitle(jobDescription);
  const companyName = extractCompanyName(jobDescription);
  const keySkills = extractKeySkills(resumeContent, jobDescription);

  // Generate subject line
  const subject = generateSubject(emailType, jobTitle, companyName);

  // Generate email body
  const body = generateEmailBody(
    emailType,
    tone,
    jobTitle,
    companyName,
    keySkills,
    additionalContext
  );

  // Generate suggestions
  const suggestions = generateEmailSuggestions(emailType, tone);

  return {
    subject,
    body,
    suggestions,
  };
}

function extractJobTitle(jobDescription: string): string {
  const lines = jobDescription.split('\n').filter(line => line.trim());
  
  // Common job title patterns
  const titlePatterns = [
    /^(senior|junior|mid-level|lead|principal|staff)?\s*(software|full[- ]?stack|front[- ]?end|back[- ]?end|web|mobile|data|devops|ml|ai)\s*(engineer|developer|architect|scientist)/i,
    /^(product|project|program)\s*manager/i,
    /^(ui|ux|product)\s*designer/i,
  ];

  for (const line of lines.slice(0, 5)) {
    for (const pattern of titlePatterns) {
      if (pattern.test(line)) {
        return line.trim();
      }
    }
  }

  return 'the position';
}

function extractCompanyName(jobDescription: string): string {
  const lines = jobDescription.split('\n').filter(line => line.trim());
  
  // Try to find company name in first few lines
  for (const line of lines.slice(0, 3)) {
    if (line.length < 50 && !line.toLowerCase().includes('job') && !line.toLowerCase().includes('position')) {
      // Check if it looks like a company name
      if (/^[A-Z][a-zA-Z\s&.,]+$/.test(line)) {
        return line.trim();
      }
    }
  }

  return 'your company';
}

function extractKeySkills(resumeContent: string, jobDescription: string): string[] {
  const skills: string[] = [];
  
  // Common technical skills
  const skillPatterns = [
    'React', 'Vue', 'Angular', 'Node.js', 'Python', 'Java', 'JavaScript', 'TypeScript',
    'AWS', 'Azure', 'Docker', 'Kubernetes', 'MongoDB', 'PostgreSQL', 'MySQL',
    'Machine Learning', 'AI', 'Data Science', 'DevOps', 'Agile', 'Scrum'
  ];

  const resumeLower = resumeContent.toLowerCase();
  const jobLower = jobDescription.toLowerCase();

  skillPatterns.forEach(skill => {
    const skillLower = skill.toLowerCase();
    if (resumeLower.includes(skillLower) && jobLower.includes(skillLower)) {
      skills.push(skill);
    }
  });

  return skills.slice(0, 5); // Top 5 matching skills
}

function generateSubject(
  emailType: 'application' | 'follow-up' | 'thank-you',
  jobTitle: string,
  companyName: string
): string {
  switch (emailType) {
    case 'application':
      return `Application for ${jobTitle} Position at ${companyName}`;
    case 'follow-up':
      return `Following Up: ${jobTitle} Application`;
    case 'thank-you':
      return `Thank You - ${jobTitle} Interview`;
    default:
      return `Regarding ${jobTitle} Position`;
  }
}

function generateEmailBody(
  emailType: 'application' | 'follow-up' | 'thank-you',
  tone: 'formal' | 'confident' | 'neutral' | 'enthusiastic',
  jobTitle: string,
  companyName: string,
  keySkills: string[],
  additionalContext?: string
): string {
  const greeting = getGreeting(tone);
  const opening = getOpening(emailType, tone, jobTitle, companyName);
  const body = getBody(emailType, tone, keySkills, additionalContext);
  const closing = getClosing(emailType, tone);
  const signature = getSignature(tone);

  return `${greeting}\n\n${opening}\n\n${body}\n\n${closing}\n\n${signature}`;
}

function getGreeting(tone: 'formal' | 'confident' | 'neutral' | 'enthusiastic'): string {
  const greetings = {
    formal: 'Dear Hiring Manager,',
    confident: 'Hello,',
    neutral: 'Dear Hiring Team,',
    enthusiastic: 'Hi there!',
  };
  return greetings[tone];
}

function getOpening(
  emailType: 'application' | 'follow-up' | 'thank-you',
  tone: string,
  jobTitle: string,
  companyName: string
): string {
  const openings = {
    application: {
      formal: `I am writing to express my strong interest in the ${jobTitle} position at ${companyName}. With my background and experience, I am confident that I would be a valuable addition to your team.`,
      confident: `I'm excited to apply for the ${jobTitle} role at ${companyName}. My experience and skills make me an excellent fit for this position.`,
      neutral: `I am applying for the ${jobTitle} position at ${companyName}. I believe my qualifications align well with your requirements.`,
      enthusiastic: `I'm thrilled to apply for the ${jobTitle} position at ${companyName}! This opportunity perfectly matches my skills and career goals.`,
    },
    'follow-up': {
      formal: `I am writing to follow up on my application for the ${jobTitle} position, which I submitted on [DATE]. I remain very interested in this opportunity.`,
      confident: `I wanted to follow up on my application for the ${jobTitle} role. I'm still very interested and would love to discuss how I can contribute to ${companyName}.`,
      neutral: `I am following up regarding my application for the ${jobTitle} position at ${companyName}.`,
      enthusiastic: `I wanted to check in on my application for the ${jobTitle} position! I'm still very excited about this opportunity.`,
    },
    'thank-you': {
      formal: `Thank you for taking the time to meet with me regarding the ${jobTitle} position at ${companyName}. I appreciated the opportunity to learn more about the role and your team.`,
      confident: `Thanks for the great conversation about the ${jobTitle} role. I'm even more excited about the opportunity after our discussion.`,
      neutral: `Thank you for the interview for the ${jobTitle} position. I enjoyed learning more about ${companyName} and the role.`,
      enthusiastic: `Thank you so much for the wonderful interview! I'm even more excited about joining ${companyName} as a ${jobTitle}.`,
    },
  };

  return openings[emailType][tone as keyof typeof openings.application];
}

function getBody(
  emailType: 'application' | 'follow-up' | 'thank-you',
  tone: string,
  keySkills: string[],
  additionalContext?: string
): string {
  const skillsText = keySkills.length > 0 
    ? `My experience with ${keySkills.slice(0, 3).join(', ')}${keySkills.length > 3 ? ', and more' : ''} aligns well with your requirements.`
    : 'My technical skills and experience align well with your requirements.';

  const bodies = {
    application: {
      formal: `${skillsText} I have a proven track record of delivering high-quality solutions and collaborating effectively with cross-functional teams.\n\nI am particularly drawn to this opportunity because of ${additionalContext || 'the innovative work your team is doing'}. I am confident that my skills and experience would enable me to make meaningful contributions to your organization.\n\nI have attached my resume for your review. I would welcome the opportunity to discuss how my qualifications match your needs in more detail.`,
      confident: `${skillsText} I've consistently delivered results in similar roles and I'm ready to bring that same energy and expertise to your team.\n\n${additionalContext || 'What excites me most about this role is the opportunity to work on challenging problems and make a real impact.'} I'm confident I can hit the ground running and start contributing from day one.\n\nMy resume is attached. I'd love to chat more about how I can help drive success for your team.`,
      neutral: `${skillsText} I have experience working on similar projects and collaborating with diverse teams.\n\n${additionalContext || 'I am interested in this role because it aligns with my career goals and offers opportunities for growth.'} I believe I can contribute effectively to your team's objectives.\n\nPlease find my resume attached. I would be happy to discuss my qualifications further.`,
      enthusiastic: `${skillsText} I've been following your company's work and I'm genuinely excited about the possibility of contributing to your mission!\n\n${additionalContext || 'What really draws me to this role is the chance to work on innovative projects and grow alongside a talented team.'} I'm eager to bring my passion and skills to help drive your success.\n\nI've attached my resume and would love the chance to chat more about this opportunity!`,
    },
    'follow-up': {
      formal: `I wanted to reiterate my strong interest in this position and my enthusiasm for the opportunity to contribute to your team. ${skillsText}\n\nIf you need any additional information or would like to schedule an interview, please do not hesitate to contact me. I am available at your convenience.`,
      confident: `I'm still very interested in this role and believe I'd be a great fit. ${skillsText}\n\nI'm happy to provide any additional information you might need or answer any questions. Looking forward to hearing from you.`,
      neutral: `I remain interested in this position. ${skillsText}\n\nPlease let me know if you need any additional information from me. I am available for an interview at your convenience.`,
      enthusiastic: `I'm still really excited about this opportunity! ${skillsText}\n\nI'd love to chat more about how I can contribute to your team. Let me know if you need anything else from me!`,
    },
    'thank-you': {
      formal: `Our discussion reinforced my interest in this position and my belief that my skills and experience would be a strong match for your needs. ${skillsText}\n\nI was particularly interested in learning about ${additionalContext || 'your team\'s approach to problem-solving and innovation'}. I am confident that I would be able to contribute effectively to your objectives.\n\nPlease do not hesitate to contact me if you need any additional information. I look forward to hearing from you regarding the next steps.`,
      confident: `Our conversation confirmed that this role is a perfect fit for my skills and career goals. ${skillsText}\n\n${additionalContext || 'I\'m particularly excited about the projects we discussed and the impact I could make.'} I'm ready to jump in and start contributing.\n\nLet me know if you need anything else from me. Looking forward to the next steps!`,
      neutral: `I appreciate the insights you shared about the role and the team. ${skillsText}\n\n${additionalContext || 'I believe my background aligns well with your needs.'} Please let me know if you require any additional information.\n\nI look forward to hearing about the next steps in the process.`,
      enthusiastic: `I'm even more excited about this opportunity after our conversation! ${skillsText}\n\n${additionalContext || 'Everything we discussed resonated with me, and I can\'t wait to potentially join your team!'} I'm ready to bring my energy and skills to help achieve your goals.\n\nThanks again, and I'm looking forward to hearing from you soon!`,
    },
  };

  return bodies[emailType][tone as keyof typeof bodies.application];
}

function getClosing(emailType: 'application' | 'follow-up' | 'thank-you', tone: string): string {
  const closings = {
    formal: 'Thank you for your time and consideration. I look forward to the opportunity to discuss my application further.',
    confident: 'Thanks for considering my application. I look forward to speaking with you soon.',
    neutral: 'Thank you for your consideration. I look forward to hearing from you.',
    enthusiastic: 'Thanks so much for your time! I can\'t wait to hear from you!',
  };

  return closings[tone as keyof typeof closings];
}

function getSignature(tone: string): string {
  const signatures = {
    formal: 'Sincerely,\n[Your Name]\n[Your Phone]\n[Your Email]\n[Your LinkedIn]',
    confident: 'Best regards,\n[Your Name]\n[Your Phone] | [Your Email]\n[Your LinkedIn]',
    neutral: 'Best regards,\n[Your Name]\n[Your Contact Information]',
    enthusiastic: 'Warmly,\n[Your Name]\n[Your Phone] | [Your Email]\n[Your LinkedIn]',
  };

  return signatures[tone as keyof typeof signatures];
}

function generateEmailSuggestions(
  emailType: 'application' | 'follow-up' | 'thank-you',
  tone: string
): string[] {
  const commonSuggestions = [
    'Replace [Your Name] and contact placeholders with your actual information',
    'Personalize the greeting with the hiring manager\'s name if known',
    'Proofread carefully before sending',
  ];

  const typeSuggestions = {
    application: [
      'Attach your resume and any requested documents',
      'Mention specific projects or achievements that relate to the job',
      'Research the company and reference something specific about them',
    ],
    'follow-up': [
      'Wait at least 1-2 weeks after applying before following up',
      'Keep it brief and professional',
      'Reiterate your interest without being pushy',
    ],
    'thank-you': [
      'Send within 24 hours of the interview',
      'Reference specific topics discussed in the interview',
      'Reaffirm your interest and qualifications',
    ],
  };

  return [...commonSuggestions, ...typeSuggestions[emailType]];
}

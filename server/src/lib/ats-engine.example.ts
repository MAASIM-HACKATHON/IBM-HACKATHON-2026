/**
 * ATS Engine Usage Examples
 * 
 * This file demonstrates how to use the ATS Engine
 * Run with: npx tsx server/src/lib/ats-engine.example.ts
 */

import ATSEngine from './ats-engine';
import type { CandidateResume, JobRole } from '../types/ats.types';

// ============================================================================
// Example 1: Junior Frontend Developer
// ============================================================================

function example1_JuniorFrontend() {
  console.log('\n=== Example 1: Junior Frontend Developer ===\n');
  
  const resume: CandidateResume = {
    skills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
    workExperience: [
      {
        title: 'Junior Developer',
        company: 'Tech Startup',
        duration: '1 year',
        yearsOfExperience: 1,
        description: 'Built responsive web applications using React and JavaScript',
        skills: ['React', 'JavaScript', 'CSS'],
      },
    ],
    projects: [
      {
        name: 'Portfolio Website',
        description: 'Personal portfolio built with React and Tailwind CSS',
        technologies: ['React', 'Tailwind', 'JavaScript'],
      },
    ],
    education: [
      {
        degree: 'Bachelor of Science',
        institution: 'University of Technology',
        field: 'Computer Science',
        year: '2023',
      },
    ],
  };
  
  const jobs: JobRole[] = [
    {
      job_title: 'Frontend Developer',
      required_skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      preferred_skills: ['TypeScript', 'Next.js'],
      keywords: ['UI', 'responsive'],
    },
    {
      job_title: 'Full-Stack Developer',
      required_skills: ['React', 'Node.js', 'MongoDB'],
      preferred_skills: ['TypeScript', 'Express'],
      keywords: ['MERN', 'API'],
    },
  ];
  
  const result = ATSEngine.analyze(resume, jobs);
  console.log(JSON.stringify(result, null, 2));
}

// ============================================================================
// Example 2: Senior Full-Stack Developer
// ============================================================================

function example2_SeniorFullStack() {
  console.log('\n=== Example 2: Senior Full-Stack Developer ===\n');
  
  const resume: CandidateResume = {
    skills: [
      'React', 'Node.js', 'TypeScript', 'MongoDB', 'PostgreSQL',
      'AWS', 'Docker', 'Kubernetes', 'Express', 'Next.js',
    ],
    workExperience: [
      {
        title: 'Senior Full-Stack Developer',
        company: 'Tech Corp',
        duration: '4 years',
        yearsOfExperience: 4,
        description: 'Led development of microservices architecture using Node.js and React',
        skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'Docker'],
      },
      {
        title: 'Full-Stack Developer',
        company: 'Startup Inc',
        duration: '3 years',
        yearsOfExperience: 3,
        description: 'Built scalable web applications with MERN stack',
        skills: ['React', 'Node.js', 'MongoDB', 'Express'],
      },
    ],
    projects: [
      {
        name: 'E-commerce Platform',
        description: 'Built a scalable e-commerce platform with microservices',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'Kubernetes'],
      },
      {
        name: 'Real-time Chat Application',
        description: 'WebSocket-based chat with React and Node.js',
        technologies: ['React', 'Node.js', 'Socket.io', 'Redis'],
      },
    ],
    education: [
      {
        degree: 'Master of Science',
        institution: 'Tech University',
        field: 'Software Engineering',
        year: '2017',
      },
    ],
    certifications: ['AWS Certified Solutions Architect', 'Kubernetes Administrator'],
  };
  
  const jobs: JobRole[] = [
    {
      job_title: 'Senior Full-Stack Developer',
      required_skills: ['React', 'Node.js', 'TypeScript', 'PostgreSQL'],
      preferred_skills: ['AWS', 'Docker', 'Kubernetes'],
      keywords: ['microservices', 'scalable', 'architecture'],
    },
    {
      job_title: 'Tech Lead',
      required_skills: ['React', 'Node.js', 'TypeScript', 'AWS'],
      preferred_skills: ['Kubernetes', 'System Design', 'Leadership'],
      keywords: ['leadership', 'architecture', 'mentoring'],
    },
    {
      job_title: 'DevOps Engineer',
      required_skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD'],
      preferred_skills: ['Terraform', 'Jenkins'],
      keywords: ['automation', 'infrastructure'],
    },
  ];
  
  const result = ATSEngine.analyze(resume, jobs);
  console.log(JSON.stringify(result, null, 2));
}

// ============================================================================
// Example 3: Career Changer with Raw Text Resume
// ============================================================================

function example3_CareerChanger() {
  console.log('\n=== Example 3: Career Changer (Raw Text) ===\n');
  
  const resume: CandidateResume = {
    rawText: `
      John Doe
      Email: john@example.com
      
      SUMMARY
      Transitioning from data analysis to software development. 
      Completed bootcamp and built several projects using React and Node.js.
      
      SKILLS
      Python, JavaScript, React, HTML, CSS, SQL, Git
      
      EXPERIENCE
      Data Analyst - Analytics Corp (2020-2023)
      - Analyzed data using Python and SQL
      - Created dashboards and reports
      - Automated data processing workflows
      
      PROJECTS
      - Task Manager App: Built with React and Node.js
      - Weather Dashboard: React application using external APIs
      - Portfolio Website: Responsive design with HTML, CSS, JavaScript
      
      EDUCATION
      Bachelor of Science in Mathematics - State University (2019)
      Full-Stack Web Development Bootcamp - Code Academy (2023)
    `,
  };
  
  const jobs: JobRole[] = [
    {
      job_title: 'Junior Frontend Developer',
      required_skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      preferred_skills: ['TypeScript', 'Git'],
      keywords: ['UI', 'web development'],
    },
    {
      job_title: 'Junior Full-Stack Developer',
      required_skills: ['React', 'Node.js', 'JavaScript'],
      preferred_skills: ['MongoDB', 'Express'],
      keywords: ['full-stack', 'MERN'],
    },
    {
      job_title: 'Data Analyst',
      required_skills: ['Python', 'SQL', 'Data Analysis'],
      preferred_skills: ['Pandas', 'Visualization'],
      keywords: ['analytics', 'reporting'],
    },
  ];
  
  const result = ATSEngine.analyze(resume, jobs);
  console.log(JSON.stringify(result, null, 2));
}

// ============================================================================
// Example 4: ML Engineer
// ============================================================================

function example4_MLEngineer() {
  console.log('\n=== Example 4: Machine Learning Engineer ===\n');
  
  const resume: CandidateResume = {
    skills: [
      'Python', 'TensorFlow', 'PyTorch', 'Machine Learning', 'Deep Learning',
      'NLP', 'Computer Vision', 'Pandas', 'NumPy', 'Scikit-learn',
      'Docker', 'AWS', 'Git',
    ],
    workExperience: [
      {
        title: 'ML Engineer',
        company: 'AI Solutions',
        duration: '3 years',
        yearsOfExperience: 3,
        description: 'Developed and deployed ML models for NLP and computer vision tasks',
        skills: ['Python', 'TensorFlow', 'PyTorch', 'AWS'],
      },
    ],
    projects: [
      {
        name: 'Image Classification System',
        description: 'CNN-based image classifier using PyTorch',
        technologies: ['Python', 'PyTorch', 'Computer Vision'],
      },
      {
        name: 'Sentiment Analysis API',
        description: 'NLP model for sentiment analysis deployed on AWS',
        technologies: ['Python', 'TensorFlow', 'NLP', 'AWS', 'Docker'],
      },
    ],
    education: [
      {
        degree: 'Master of Science',
        institution: 'Tech Institute',
        field: 'Artificial Intelligence',
        year: '2020',
      },
    ],
  };
  
  const jobs: JobRole[] = [
    {
      job_title: 'Machine Learning Engineer',
      required_skills: ['Python', 'TensorFlow', 'Machine Learning'],
      preferred_skills: ['PyTorch', 'AWS', 'Docker'],
      keywords: ['ML', 'AI', 'models'],
    },
    {
      job_title: 'Data Scientist',
      required_skills: ['Python', 'Machine Learning', 'Statistics'],
      preferred_skills: ['Deep Learning', 'Pandas', 'Visualization'],
      keywords: ['data', 'analytics', 'insights'],
    },
    {
      job_title: 'Full-Stack Developer',
      required_skills: ['React', 'Node.js', 'JavaScript'],
      preferred_skills: ['TypeScript', 'MongoDB'],
      keywords: ['web', 'full-stack'],
    },
  ];
  
  const result = ATSEngine.analyze(resume, jobs);
  console.log(JSON.stringify(result, null, 2));
}

// ============================================================================
// Run Examples
// ============================================================================

function runAllExamples() {
  example1_JuniorFrontend();
  example2_SeniorFullStack();
  example3_CareerChanger();
  example4_MLEngineer();
}

// Run if executed directly
if (require.main === module) {
  runAllExamples();
}

export {
  example1_JuniorFrontend,
  example2_SeniorFullStack,
  example3_CareerChanger,
  example4_MLEngineer,
  runAllExamples,
};

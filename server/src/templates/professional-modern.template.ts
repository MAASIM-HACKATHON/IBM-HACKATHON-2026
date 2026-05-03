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
    certifications: Array<string | {
      name: string;
      issuer?: string;
      date?: string;
      description?: string;
    }>;
  };
}

interface ResumePDFTemplateProps {
  resumeData: ParsedResumeData;
  isOptimized?: boolean;
}

export function generateProfessionalTemplate({ resumeData, isOptimized = false }: ResumePDFTemplateProps): string {
  const { parsedSections } = resumeData;
  const personalInfo = parsedSections.personalInfo;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo?.name || 'Resume'} - Professional Modern</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    @page {
      size: A4;
      margin: 0.75in;
    }

    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
    }

    .container {
      display: grid;
      grid-template-columns: 70% 30%;
      gap: 20px;
      max-width: 100%;
    }

    /* Header - Full Width */
    .header {
      grid-column: 1 / -1;
      padding-bottom: 20px;
      border-bottom: 3px solid #1e40af;
      margin-bottom: 20px;
    }

    .header h1 {
      font-size: 26pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: 0.3px;
    }

    .contact-info {
      display: flex;
      gap: 15px;
      flex-wrap: wrap;
      font-size: 10pt;
      color: #4b5563;
      margin-top: 8px;
    }

    .contact-info span {
      display: inline-flex;
      align-items: center;
      gap: 4px;
    }

    /* Main Column (Left - 70%) */
    .main-column {
      grid-column: 1;
    }

    /* Sidebar (Right - 30%) */
    .sidebar {
      grid-column: 2;
      padding-left: 15px;
      border-left: 2px solid #e5e7eb;
    }

    /* Section Styles */
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 13pt;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 5px;
      margin-bottom: 12px;
    }

    .sidebar .section-title {
      font-size: 12pt;
      border-bottom: 1px solid #3b82f6;
    }

    /* Summary */
    .summary {
      font-size: 10.5pt;
      line-height: 1.6;
      color: #374151;
      text-align: justify;
    }

    /* Experience & Projects */
    .entry {
      margin-bottom: 18px;
      page-break-inside: avoid;
    }

    .entry-header {
      margin-bottom: 6px;
    }

    .entry-title {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1f2937;
    }

    .entry-subtitle {
      font-size: 10.5pt;
      color: #4b5563;
      font-weight: 600;
      margin-top: 2px;
    }

    .entry-duration {
      font-size: 9.5pt;
      color: #6b7280;
      font-style: italic;
      margin-top: 2px;
    }

    .entry-description {
      font-size: 10pt;
      color: #374151;
      margin-top: 6px;
      margin-bottom: 6px;
      line-height: 1.5;
    }

    .achievements {
      list-style: none;
      padding-left: 0;
    }

    .achievements li {
      position: relative;
      padding-left: 18px;
      margin-bottom: 5px;
      font-size: 10pt;
      color: #374151;
      line-height: 1.5;
    }

    .achievements li:before {
      content: "▸";
      position: absolute;
      left: 0;
      color: #3b82f6;
      font-weight: bold;
    }

    /* Technologies */
    .tech-list {
      display: flex;
      flex-wrap: wrap;
      gap: 5px;
      margin-top: 6px;
    }

    .tech-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 9pt;
      border: 1px solid #93c5fd;
    }

    /* Sidebar - Skills */
    .skills-list {
      list-style: none;
      padding-left: 0;
    }

    .skill-item {
      background: #eff6ff;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 9.5pt;
      color: #1e40af;
      border: 1px solid #bfdbfe;
      margin-bottom: 6px;
      display: block;
    }

    /* Sidebar - Education */
    .education-entry {
      margin-bottom: 15px;
    }

    .degree {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1f2937;
      line-height: 1.3;
    }

    .institution {
      font-size: 9.5pt;
      color: #4b5563;
      margin-top: 3px;
    }

    .education-details {
      font-size: 9pt;
      color: #6b7280;
      margin-top: 3px;
    }

    /* Sidebar - Certifications */
    .cert-item {
      background: #f0fdf4;
      padding: 8px 10px;
      border-radius: 6px;
      border-left: 3px solid #10b981;
      margin-bottom: 8px;
    }

    .cert-name {
      font-size: 9.5pt;
      font-weight: 600;
      color: #065f46;
      line-height: 1.3;
    }

    .cert-issuer {
      font-size: 9pt;
      color: #047857;
      margin-top: 2px;
    }

    .cert-date {
      font-size: 8.5pt;
      color: #6b7280;
      margin-top: 2px;
    }

    /* Footer */
    .footer {
      grid-column: 1 / -1;
      margin-top: 20px;
      padding-top: 12px;
      border-top: 2px solid #e5e7eb;
      text-align: center;
      font-size: 9pt;
      color: #9ca3af;
    }

    /* Print Optimization */
    @media print {
      body {
        print-color-adjust: exact;
        -webkit-print-color-adjust: exact;
      }
      
      .section {
        page-break-inside: avoid;
      }
      
      .entry {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header - Full Width -->
    <div class="header">
      <h1>${personalInfo?.name || 'Professional Resume'}</h1>
      <div class="contact-info">
        ${personalInfo?.email ? `<span>✉ ${personalInfo.email}</span>` : ''}
        ${personalInfo?.phone ? `<span>📞 ${personalInfo.phone}</span>` : ''}
        ${personalInfo?.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
        ${personalInfo?.linkedin ? `<span>🔗 LinkedIn</span>` : ''}
        ${personalInfo?.github ? `<span>💻 GitHub</span>` : ''}
      </div>
    </div>

    <!-- Main Column (Left) -->
    <div class="main-column">
      ${parsedSections.summary ? `
      <!-- Summary -->
      <div class="section">
        <h2 class="section-title">Professional Summary</h2>
        <p class="summary">${parsedSections.summary}</p>
      </div>
      ` : ''}

      ${parsedSections.workExperience && parsedSections.workExperience.length > 0 ? `
      <!-- Work Experience -->
      <div class="section">
        <h2 class="section-title">Professional Experience</h2>
        ${parsedSections.workExperience.map((exp: any) => `
          <div class="entry">
            <div class="entry-header">
              <div class="entry-title">${exp.title || 'Position'}</div>
              <div class="entry-subtitle">${exp.company || 'Company'}${exp.location ? ` • ${exp.location}` : ''}</div>
              <div class="entry-duration">${exp.duration || ''}</div>
            </div>
            ${exp.description ? `<p class="entry-description">${exp.description}</p>` : ''}
            ${exp.achievements && exp.achievements.length > 0 ? `
              <ul class="achievements">
                ${exp.achievements.map((achievement: string) => `
                  <li>${achievement}</li>
                `).join('')}
              </ul>
            ` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${parsedSections.projects && parsedSections.projects.length > 0 ? `
      <!-- Projects -->
      <div class="section">
        <h2 class="section-title">Key Projects</h2>
        ${parsedSections.projects.map((project: any) => `
          <div class="entry">
            <div class="entry-header">
              <div class="entry-title">${project.name || 'Project'}</div>
              ${project.role ? `<div class="entry-subtitle">${project.role}</div>` : ''}
              ${project.duration ? `<div class="entry-duration">${project.duration}</div>` : ''}
            </div>
            ${project.description ? `<p class="entry-description">${project.description}</p>` : ''}
            ${project.achievements && project.achievements.length > 0 ? `
              <ul class="achievements">
                ${project.achievements.map((achievement: string) => `
                  <li>${achievement}</li>
                `).join('')}
              </ul>
            ` : ''}
            ${project.technologies && project.technologies.length > 0 ? `
              <div class="tech-list">
                ${project.technologies.map((tech: string) => `
                  <span class="tech-badge">${tech}</span>
                `).join('')}
              </div>
            ` : ''}
            ${project.link ? `<p style="margin-top: 6px; font-size: 9.5pt; color: #3b82f6;">🔗 ${project.link}</p>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}
    </div>

    <!-- Sidebar (Right) -->
    <div class="sidebar">
      ${parsedSections.skills && parsedSections.skills.length > 0 ? `
      <!-- Skills -->
      <div class="section">
        <h2 class="section-title">Skills</h2>
        <div class="skills-list">
          ${parsedSections.skills.map((skill: string) => `
            <div class="skill-item">${skill}</div>
          `).join('')}
        </div>
      </div>
      ` : ''}

      ${parsedSections.education && parsedSections.education.length > 0 ? `
      <!-- Education -->
      <div class="section">
        <h2 class="section-title">Education</h2>
        ${parsedSections.education.map((edu: any) => `
          <div class="education-entry">
            <div class="degree">${edu.degree || 'Degree'}</div>
            <div class="institution">${edu.institution || 'Institution'}</div>
            <div class="education-details">
              ${edu.year ? `${edu.year}` : ''}
              ${edu.gpa ? ` • GPA: ${edu.gpa}` : ''}
            </div>
            ${edu.honors && edu.honors.length > 0 ? `<div class="education-details">${edu.honors.join(', ')}</div>` : ''}
          </div>
        `).join('')}
      </div>
      ` : ''}

      ${parsedSections.certifications && parsedSections.certifications.length > 0 ? `
      <!-- Certifications -->
      <div class="section">
        <h2 class="section-title">Certifications</h2>
        ${parsedSections.certifications.map((cert: any) => {
          if (typeof cert === 'string') {
            return `
              <div class="cert-item">
                <div class="cert-name">${cert}</div>
              </div>
            `;
          }
          return `
            <div class="cert-item">
              <div class="cert-name">${cert.name || cert}</div>
              ${cert.issuer ? `<div class="cert-issuer">${cert.issuer}</div>` : ''}
              ${cert.date ? `<div class="cert-date">${cert.date}</div>` : ''}
            </div>
          `;
        }).join('')}
      </div>
      ` : ''}
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>${isOptimized ? 'ATS-Optimized' : 'Professional Modern'} Resume • Generated with IBM Watsonx AI</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

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

export function generateResumePDFTemplate({ resumeData, isOptimized = false }: ResumePDFTemplateProps): string {
  const { parsedSections } = resumeData;
  const personalInfo = parsedSections.personalInfo;

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personalInfo?.name || 'Resume'} - ${isOptimized ? 'ATS Optimized' : 'Original'}</title>
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
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a1a;
      background: white;
    }

    .container {
      max-width: 100%;
      margin: 0 auto;
    }

    /* Header Section */
    .header {
      text-align: center;
      padding-bottom: 20px;
      border-bottom: 3px solid #2563eb;
      margin-bottom: 25px;
    }

    .header h1 {
      font-size: 28pt;
      font-weight: 700;
      color: #1e40af;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }

    .contact-info {
      display: flex;
      justify-content: center;
      gap: 20px;
      flex-wrap: wrap;
      font-size: 10pt;
      color: #4b5563;
      margin-top: 10px;
    }

    .contact-info span {
      display: inline-flex;
      align-items: center;
      gap: 5px;
    }

    /* Section Styles */
    .section {
      margin-bottom: 25px;
      page-break-inside: avoid;
    }

    .section-title {
      font-size: 14pt;
      font-weight: 700;
      color: #1e40af;
      text-transform: uppercase;
      letter-spacing: 1px;
      border-bottom: 2px solid #3b82f6;
      padding-bottom: 6px;
      margin-bottom: 15px;
    }

    /* Summary */
    .summary {
      font-size: 10.5pt;
      line-height: 1.6;
      color: #374151;
      text-align: justify;
    }

    /* Skills */
    .skills-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      gap: 8px;
      margin-top: 10px;
    }

    .skill-item {
      background: #eff6ff;
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 10pt;
      color: #1e40af;
      border: 1px solid #bfdbfe;
    }

    /* Experience & Projects */
    .entry {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
      margin-bottom: 6px;
    }

    .entry-title {
      font-size: 12pt;
      font-weight: 700;
      color: #1f2937;
    }

    .entry-subtitle {
      font-size: 11pt;
      color: #4b5563;
      font-weight: 600;
      margin-bottom: 4px;
    }

    .entry-duration {
      font-size: 10pt;
      color: #6b7280;
      font-style: italic;
    }

    .entry-description {
      font-size: 10.5pt;
      color: #374151;
      margin-bottom: 8px;
      line-height: 1.5;
    }

    .achievements {
      list-style: none;
      padding-left: 0;
    }

    .achievements li {
      position: relative;
      padding-left: 20px;
      margin-bottom: 6px;
      font-size: 10.5pt;
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

    /* Education */
    .education-entry {
      margin-bottom: 15px;
    }

    .degree {
      font-size: 11.5pt;
      font-weight: 700;
      color: #1f2937;
    }

    .institution {
      font-size: 10.5pt;
      color: #4b5563;
      margin-top: 2px;
    }

    .education-details {
      font-size: 10pt;
      color: #6b7280;
      margin-top: 4px;
    }

    /* Certifications */
    .cert-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 12px;
    }

    .cert-item {
      background: #f0fdf4;
      padding: 10px 14px;
      border-radius: 8px;
      border-left: 3px solid #10b981;
    }

    .cert-name {
      font-size: 10.5pt;
      font-weight: 600;
      color: #065f46;
      margin-bottom: 4px;
    }

    .cert-issuer {
      font-size: 9.5pt;
      color: #047857;
    }

    .cert-date {
      font-size: 9pt;
      color: #6b7280;
      margin-top: 2px;
    }

    /* Technologies */
    .tech-list {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
      margin-top: 8px;
    }

    .tech-badge {
      background: #dbeafe;
      color: #1e40af;
      padding: 4px 10px;
      border-radius: 4px;
      font-size: 9.5pt;
      border: 1px solid #93c5fd;
    }

    /* Footer */
    .footer {
      margin-top: 30px;
      padding-top: 15px;
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
    <!-- Header -->
    <div class="header">
      <h1>${personalInfo?.name || 'Professional Resume'}</h1>
      <div class="contact-info">
        ${personalInfo?.email ? `<span>✉ ${personalInfo.email}</span>` : ''}
        ${personalInfo?.phone ? `<span>📞 ${personalInfo.phone}</span>` : ''}
        ${personalInfo?.location ? `<span>📍 ${personalInfo.location}</span>` : ''}
        ${personalInfo?.linkedin ? `<span>🔗 ${personalInfo.linkedin}</span>` : ''}
      </div>
    </div>

    ${parsedSections.summary ? `
    <!-- Summary -->
    <div class="section">
      <h2 class="section-title">Professional Summary</h2>
      <p class="summary">${parsedSections.summary}</p>
    </div>
    ` : ''}

    ${parsedSections.skills && parsedSections.skills.length > 0 ? `
    <!-- Skills -->
    <div class="section">
      <h2 class="section-title">Technical Skills</h2>
      <div class="skills-grid">
        ${parsedSections.skills.map((skill: string) => `
          <div class="skill-item">${skill}</div>
        `).join('')}
      </div>
    </div>
    ` : ''}

    ${parsedSections.workExperience && parsedSections.workExperience.length > 0 ? `
    <!-- Work Experience -->
    <div class="section">
      <h2 class="section-title">Professional Experience</h2>
      ${parsedSections.workExperience.map((exp: any) => `
        <div class="entry">
          <div class="entry-header">
            <div>
              <div class="entry-title">${exp.title || 'Position'}</div>
              <div class="entry-subtitle">${exp.company || 'Company'}</div>
            </div>
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
            <div>
              <div class="entry-title">${project.name || 'Project'}</div>
              ${project.role ? `<div class="entry-subtitle">${project.role}</div>` : ''}
            </div>
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
          ${project.link ? `<p style="margin-top: 6px; font-size: 10pt; color: #3b82f6;">🔗 ${project.link}</p>` : ''}
        </div>
      `).join('')}
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
            ${edu.honors ? ` • ${edu.honors}` : ''}
          </div>
        </div>
      `).join('')}
    </div>
    ` : ''}

    ${parsedSections.certifications && parsedSections.certifications.length > 0 ? `
    <!-- Certifications -->
    <div class="section">
      <h2 class="section-title">Certifications & Training</h2>
      <div class="cert-grid">
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
    </div>
    ` : ''}

    <!-- Footer -->
    <div class="footer">
      <p>${isOptimized ? 'ATS-Optimized Resume' : 'Professional Resume'} • Generated with IBM Watsonx AI</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

// Made with Bob

/**
 * PrettyPrinter Component
 * 
 * Sub-task 19.2: Format and display resume content with consistent typography and spacing
 * 
 * Requirements:
 * - 11.4: Format resume data with consistent typography, spacing, and section headers
 * - 11.5: Display work experience with title, company, duration, and achievements
 * - 11.6: Display education with degree, institution, field, and year
 * - 11.7: Round-trip property - parsing then formatting then parsing produces equivalent data
 * 
 * Features:
 * - Formats personal info, work experience, education, skills, projects, certifications
 * - Consistent section headers and spacing
 * - Professional typography
 * - ATS-friendly structure
 */

import { type ReactElement } from 'react';
import type { ParsedResumeData, WorkExperience, Education, Project } from '@/types/resume.types';
import { Badge } from '@/components/ui/badge';

interface PrettyPrinterProps {
  data: ParsedResumeData;
  className?: string;
}

/**
 * PrettyPrinter Component
 * Formats and displays resume content with professional styling
 */
function PrettyPrinter({ data, className = '' }: PrettyPrinterProps): ReactElement {
  const { parsedSections } = data;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Personal Info Section - Requirement 11.4 */}
      {parsedSections.personalInfo && (
        <section className="space-y-2 border-b border-border pb-6">
          {parsedSections.personalInfo.name && (
            <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
              {parsedSections.personalInfo.name}
            </h1>
          )}
          
          {/* Contact Information */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
            {parsedSections.personalInfo.email && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {parsedSections.personalInfo.email}
              </span>
            )}
            {parsedSections.personalInfo.phone && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {parsedSections.personalInfo.phone}
              </span>
            )}
            {parsedSections.personalInfo.location && (
              <span className="flex items-center gap-1">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {parsedSections.personalInfo.location}
              </span>
            )}
          </div>
          
          {/* Links */}
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
            {parsedSections.personalInfo.linkedin && (
              <a 
                href={parsedSections.personalInfo.linkedin} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2C4C82] hover:underline flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
                </svg>
                LinkedIn
              </a>
            )}
            {parsedSections.personalInfo.github && (
              <a 
                href={parsedSections.personalInfo.github} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2C4C82] hover:underline flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                GitHub
              </a>
            )}
            {parsedSections.personalInfo.portfolio && (
              <a 
                href={parsedSections.personalInfo.portfolio} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[#2C4C82] hover:underline flex items-center gap-1"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
                Portfolio
              </a>
            )}
          </div>
        </section>
      )}

      {/* Professional Summary - Requirement 11.4 */}
      {parsedSections.summary && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
            Professional Summary
          </h2>
          <p className="text-sm text-foreground leading-relaxed">
            {parsedSections.summary}
          </p>
        </section>
      )}

      {/* Technical Skills - Requirement 11.4 */}
      {parsedSections.skills.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
            Technical Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {parsedSections.skills.map((skill, index) => (
              <Badge 
                key={index} 
                variant="secondary"
                className="text-xs font-medium"
              >
                {skill}
              </Badge>
            ))}
          </div>
        </section>
      )}

      {/* Work Experience - Requirement 11.5 */}
      {parsedSections.workExperience.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
            Professional Experience
          </h2>
          <div className="space-y-5">
            {parsedSections.workExperience.map((exp: WorkExperience, index: number) => (
              <div key={index} className="space-y-2">
                {/* Title and Company - Requirement 11.5 */}
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {exp.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="font-medium">{exp.company}</span>
                    {exp.location && (
                      <>
                        <span>•</span>
                        <span>{exp.location}</span>
                      </>
                    )}
                    {/* Duration - Requirement 11.5 */}
                    {exp.duration && (
                      <>
                        <span>•</span>
                        <span>{exp.duration}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                {exp.description && (
                  <p className="text-sm text-foreground leading-relaxed">
                    {exp.description}
                  </p>
                )}

                {/* Achievements - Requirement 11.5 */}
                {exp.achievements && exp.achievements.length > 0 && (
                  <ul className="space-y-1 ml-4">
                    {exp.achievements.map((achievement, achIndex) => (
                      <li key={achIndex} className="text-sm text-foreground leading-relaxed list-disc">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}

                {/* Skills/Technologies */}
                {exp.skills && exp.skills.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {exp.skills.map((skill, skillIndex) => (
                      <Badge 
                        key={skillIndex} 
                        variant="outline"
                        className="text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Projects - Requirement 11.4 */}
      {parsedSections.projects.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
            Projects
          </h2>
          <div className="space-y-4">
            {parsedSections.projects.map((project: Project, index: number) => (
              <div key={index} className="space-y-2">
                <div className="space-y-1">
                  <h3 className="text-base font-semibold text-foreground">
                    {project.name}
                  </h3>
                  {project.role && (
                    <p className="text-sm text-muted-foreground">
                      {project.role}
                      {project.duration && ` • ${project.duration}`}
                    </p>
                  )}
                </div>

                <p className="text-sm text-foreground leading-relaxed">
                  {project.description}
                </p>

                {project.achievements && project.achievements.length > 0 && (
                  <ul className="space-y-1 ml-4">
                    {project.achievements.map((achievement, achIndex) => (
                      <li key={achIndex} className="text-sm text-foreground leading-relaxed list-disc">
                        {achievement}
                      </li>
                    ))}
                  </ul>
                )}

                {project.technologies && project.technologies.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {project.technologies.map((tech, techIndex) => (
                      <Badge 
                        key={techIndex} 
                        variant="outline"
                        className="text-xs"
                      >
                        {tech}
                      </Badge>
                    ))}
                  </div>
                )}

                {project.link && (
                  <a 
                    href={project.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-sm text-[#2C4C82] hover:underline inline-flex items-center gap-1"
                  >
                    View Project
                    <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Education - Requirement 11.6 */}
      {parsedSections.education.length > 0 && (
        <section className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
            Education
          </h2>
          <div className="space-y-4">
            {parsedSections.education.map((edu: Education, index: number) => (
              <div key={index} className="space-y-1">
                {/* Degree and Field - Requirement 11.6 */}
                <h3 className="text-base font-semibold text-foreground">
                  {edu.degree}
                  {edu.field && ` in ${edu.field}`}
                </h3>
                {/* Institution and Year - Requirement 11.6 */}
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                  <span className="font-medium">{edu.institution}</span>
                  {edu.location && (
                    <>
                      <span>•</span>
                      <span>{edu.location}</span>
                    </>
                  )}
                  {edu.year && (
                    <>
                      <span>•</span>
                      <span>{edu.year}</span>
                    </>
                  )}
                </div>
                {edu.gpa && (
                  <p className="text-sm text-muted-foreground">
                    GPA: {edu.gpa}
                  </p>
                )}
                {edu.honors && edu.honors.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {edu.honors.map((honor, honorIndex) => (
                      <Badge 
                        key={honorIndex} 
                        variant="secondary"
                        className="text-xs"
                      >
                        {honor}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Certifications - Requirement 11.4 */}
      {parsedSections.certifications.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground uppercase tracking-wide border-b border-border pb-2">
            Certifications
          </h2>
          <ul className="space-y-2">
            {parsedSections.certifications.map((cert, index) => (
              <li key={index} className="text-sm text-foreground flex items-start gap-2">
                <svg className="h-4 w-4 text-[#2C4C82] mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                </svg>
                <span>{cert}</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}

export default PrettyPrinter;

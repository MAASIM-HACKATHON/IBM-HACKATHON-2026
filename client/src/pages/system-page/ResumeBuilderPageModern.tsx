import { type ReactElement, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { FileText, Sparkles, Loader2, AlertCircle, Upload, Trash2, Search } from 'lucide-react';
import { FileUpload } from '@/components/ui/file-upload';
import { EmptyState } from '@/components/ui/empty-state';
import { parseResumeFile, analyzeJobDescription } from '@/services/resumeService';
import type { ParsedResumeData, JobDescriptionAnalysis } from '@/types/resume.types';
import { useAutoSave, loadFromLocalStorage, clearFromLocalStorage, formatRelativeTime } from '@/hooks/useAutoSave';

// localStorage key for resume builder draft
const RESUME_BUILDER_DRAFT_KEY = 'resume-builder-draft';

/**
 * Type definition for resume builder draft data
 */
interface ResumeBuilderDraft {
  jobDescription: string;
}

/**
 * ResumeBuilderPageModern Component
 * 
 * Sub-task 15.1: Two-column layout for resume building with:
 * - Input section on the left (file upload, job description)
 * - Results section on the right (ATS score, resume preview)
 * - Responsive stacking for mobile devices
 * 
 * Requirements:
 * - 8.1: Display two-column layout with input left and results right
 * - 13.5: Stack columns vertically on viewports below 768px
 * - 8.2: Provide file upload for existing resumes in PDF, DOCX, TXT formats
 * - 8.8: Integrate with Backend_API endpoints for resume parsing
 * - 22.2: Use consistent form field styles across all pages
 */
function ResumeBuilderPageModern(): ReactElement {
  // Form state
  const [jobDescription, setJobDescription] = useState<string>('');
  
  // File upload state - Sub-task 15.2
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  
  // Resume parsing state - Sub-task 15.3
  const [parsedResume, setParsedResume] = useState<ParsedResumeData | null>(null);
  const [parsingError, setParsingError] = useState<string | null>(null);
  
  // Job description analysis state - Sub-task 16.2
  const [jobAnalysis, setJobAnalysis] = useState<JobDescriptionAnalysis | null>(null);
  const [isAnalyzingJob, setIsAnalyzingJob] = useState<boolean>(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Validation errors
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Sub-task 15.1: Auto-save form values to localStorage with 1-second debounce
  const draftData: ResumeBuilderDraft = {
    jobDescription,
  };

  // Enable auto-save only when there's meaningful content
  const hasContent = Boolean(jobDescription.trim());
  useAutoSave(RESUME_BUILDER_DRAFT_KEY, draftData, 1000, hasContent);

  // Restore draft from localStorage on component mount
  useEffect(() => {
    const savedDraft = loadFromLocalStorage<ResumeBuilderDraft>(RESUME_BUILDER_DRAFT_KEY);
    
    if (savedDraft) {
      const { data, timestamp } = savedDraft;
      
      // Restore job description
      if (data.jobDescription) setJobDescription(data.jobDescription);

      // Display restoration notification with timestamp
      const relativeTime = formatRelativeTime(timestamp);
      toast.success(
        `📝 Draft restored from ${relativeTime}`,
        { duration: 4000 }
      );
    }
  }, []); // Empty dependency array - run only on mount

  /**
   * Sub-task 15.2: Handle file selection from FileUpload component
   * Requirements:
   * - 8.2: Support PDF, DOCX, TXT formats
   * - 7.1: Drag-and-drop file upload
   * - 7.2: Browse and select file upload
   */
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingFile(true);
    setParsingError(null);

    // Show processing toast
    toast.loading('📄 Processing resume...', { id: 'file-processing' });

    try {
      // Sub-task 15.3: Call backend API at /api/resume/parse
      // Requirements: 8.8, 11.1, 11.2, 18.2, 18.6
      const result = await parseResumeFile(file);

      // Store parsed resume data
      setParsedResume(result);

      // Display success message
      toast.success(
        `✅ Resume parsed successfully!`,
        { id: 'file-processing', duration: 4000 }
      );
    } catch (error) {
      console.error('Resume parsing error:', error);
      
      // Sub-task 15.3: Display parsing errors with retry option
      // Requirement 11.1, 11.2
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to parse resume. Please try again.';
      
      setParsingError(errorMessage);
      setParsedResume(null);
      
      toast.error(errorMessage, { id: 'file-processing' });
    } finally {
      setIsProcessingFile(false);
    }
  };

  /**
   * Sub-task 15.2: Handle file clear from FileUpload component
   */
  const handleFileClear = () => {
    setUploadedFile(null);
    setParsedResume(null);
    setParsingError(null);
  };

  /**
   * Handle job description change
   */
  const handleJobDescriptionChange = (value: string) => {
    setJobDescription(value);
    
    // Clear validation error for this field when user starts typing
    if (validationErrors.jobDescription) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.jobDescription;
        return newErrors;
      });
    }
    
    // Clear analysis error when user modifies job description
    if (analysisError) {
      setAnalysisError(null);
    }
  };

  /**
   * Sub-task 16.2: Analyze job description using backend API
   * Requirements: 8.8, 18.5, 18.6
   * 
   * Calls /api/resume/analyze-jd to extract:
   * - Required skills
   * - Experience level
   * - Job roles
   * - Technologies
   * - Responsibilities
   */
  const handleAnalyzeJobDescription = async () => {
    // Validate job description is not empty
    if (!jobDescription.trim()) {
      setValidationErrors(prev => ({
        ...prev,
        jobDescription: 'Job description is required for analysis'
      }));
      toast.error('Please enter a job description to analyze');
      return;
    }

    setIsAnalyzingJob(true);
    setAnalysisError(null);
    
    // Show loading toast
    toast.loading('🔍 Analyzing job description...', { id: 'job-analysis' });

    try {
      // Sub-task 16.2: Call backend API at /api/resume/analyze-jd
      // Requirements: 8.8, 18.5, 18.6
      const analysis = await analyzeJobDescription(jobDescription);
      
      // Store analysis results
      setJobAnalysis(analysis);
      
      // Display success message with key findings
      const skillsCount = analysis.requiredSkills.length + analysis.preferredSkills.length;
      toast.success(
        `✅ Analysis complete! Found ${skillsCount} skills and ${analysis.technologies.length} technologies`,
        { id: 'job-analysis', duration: 4000 }
      );
    } catch (error) {
      console.error('Job description analysis error:', error);
      
      // Sub-task 16.2: Display analysis errors
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Failed to analyze job description. Please try again.';
      
      setAnalysisError(errorMessage);
      setJobAnalysis(null);
      
      toast.error(errorMessage, { id: 'job-analysis' });
    } finally {
      setIsAnalyzingJob(false);
    }
  };

  /**
   * Handle clear draft
   * Requirement 9.5: Implement clear draft button and remove draft from localStorage
   */
  const handleClearDraft = () => {
    // Clear from localStorage
    clearFromLocalStorage(RESUME_BUILDER_DRAFT_KEY);

    // Reset all form fields to default values
    setJobDescription('');
    setUploadedFile(null);
    setParsedResume(null);
    setParsingError(null);
    setJobAnalysis(null);
    setAnalysisError(null);

    // Clear any errors
    setValidationErrors({});

    // Display confirmation message
    toast.success('🗑️ Draft cleared successfully', { duration: 3000 });
  };

  /**
   * Retry parsing after error
   * Sub-task 15.3: Display parsing errors with retry option
   */
  const handleRetryParsing = () => {
    if (uploadedFile) {
      handleFileSelect(uploadedFile);
    }
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header - Sub-task 15.1 */}
      <section className="space-y-4">
        <Badge 
          variant="outline" 
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium border-[#2C4C82]/20 bg-[#2C4C82]/5 text-[#2C4C82] dark:border-[#2C4C82]/30 dark:bg-[#2C4C82]/10 dark:text-[#2C4C82]/90"
        >
          <Sparkles className="h-4 w-4" />
          Powered by IBM Watsonx AI
        </Badge>

        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground">
            Resume Builder & ATS Optimizer
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Upload your resume and job description to get ATS-optimized content with detailed scoring and insights.
          </p>
        </div>
      </section>

      {/* Two-Column Layout - Sub-task 15.1 */}
      {/* 
        Grid layout that:
        - Shows two columns on desktop (lg:grid-cols-2)
        - Stacks vertically on mobile (default single column)
        - Provides consistent gap between columns
        - Requirement 8.1: Two-column layout with input left and results right
        - Requirement 13.5: Stack columns vertically on viewports below 768px
      */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Input Section */}
        <Card className="border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-[#2C4C82]" />
              Resume & Job Details
            </CardTitle>
            <CardDescription>
              Upload your resume and provide job description for optimization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Sub-task 15.2: File Upload Section */}
            {/* Requirements: 8.2, 7.1, 7.2 */}
            <div className="space-y-2">
              <Label htmlFor="resume-upload">
                Upload Resume
              </Label>
              <FileUpload
                id="resume-upload"
                file={uploadedFile}
                onFileSelect={handleFileSelect}
                onFileClear={handleFileClear}
                accept=".pdf,.docx,.txt"
                maxSize={10 * 1024 * 1024} // 10MB
                disabled={isProcessingFile}
                aria-describedby="resume-upload-help"
              />
              <p id="resume-upload-help" className="text-sm text-muted-foreground">
                Upload your resume in PDF, DOCX, or TXT format (max 10MB)
              </p>
            </div>

            {/* Sub-task 15.3: Display parsing errors with retry option */}
            {/* Requirement 11.1, 11.2 */}
            {parsingError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-3 flex-1">
                    <div className="space-y-1">
                      <p className="text-sm font-semibold text-destructive">
                        Resume Parsing Failed
                      </p>
                      <p className="text-sm text-destructive/90">
                        {parsingError}
                      </p>
                    </div>
                    {/* Retry Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRetryParsing}
                      disabled={isProcessingFile || !uploadedFile}
                      className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Retry Parsing
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-task 15.3: Display parsed resume sections */}
            {/* Requirement 11.1, 11.2: Extract personal info, summary, skills, experience, education */}
            {parsedResume && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium text-foreground">
                    Resume Parsed Successfully
                  </p>
                </div>
                
                <div className="space-y-2 text-sm text-muted-foreground">
                  {parsedResume.parsedSections.personalInfo?.name && (
                    <p>👤 Name: {parsedResume.parsedSections.personalInfo.name}</p>
                  )}
                  {parsedResume.parsedSections.skills.length > 0 && (
                    <p>🎯 Skills: {parsedResume.parsedSections.skills.length} found</p>
                  )}
                  {parsedResume.parsedSections.workExperience.length > 0 && (
                    <p>💼 Experience: {parsedResume.parsedSections.workExperience.length} positions</p>
                  )}
                  {parsedResume.parsedSections.education.length > 0 && (
                    <p>🎓 Education: {parsedResume.parsedSections.education.length} entries</p>
                  )}
                </div>
              </div>
            )}

            {/* Job Description Field - Requirement 8.3 */}
            {/* Sub-task 16.1: Job description textarea with analyze button */}
            {parsedResume && (
              <div className="space-y-2">
                <Label htmlFor="job-description">
                  Job Description
                </Label>
                <Textarea
                  id="job-description"
                  value={jobDescription}
                  onChange={(e) => handleJobDescriptionChange(e.target.value)}
                  placeholder="Paste the job description here to optimize your resume for ATS..."
                  className={`min-h-32 resize-y ${validationErrors.jobDescription ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-describedby="job-description-help"
                  aria-invalid={!!validationErrors.jobDescription}
                  disabled={isAnalyzingJob}
                />
                {validationErrors.jobDescription ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.jobDescription}
                  </p>
                ) : (
                  <p id="job-description-help" className="text-sm text-muted-foreground">
                    Provide the complete job description for better ATS optimization
                  </p>
                )}
                
                {/* Sub-task 16.1: Analyze button with loading state */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAnalyzeJobDescription}
                  disabled={!jobDescription.trim() || isAnalyzingJob}
                  className="w-full mt-2"
                >
                  {isAnalyzingJob ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Search className="mr-2 h-4 w-4" />
                      Analyze Job Description
                    </>
                  )}
                </Button>
              </div>
            )}

            {/* Sub-task 16.2: Display analysis error */}
            {analysisError && (
              <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 flex-1">
                    <p className="text-sm font-semibold text-destructive">
                      Analysis Failed
                    </p>
                    <p className="text-sm text-destructive/90">
                      {analysisError}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Sub-task 16.2: Display analysis results */}
            {jobAnalysis && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-4">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  <p className="text-sm font-medium text-foreground">
                    Job Description Analyzed
                  </p>
                </div>
                
                <div className="space-y-3">
                  {/* Experience Level */}
                  {jobAnalysis.experienceLevel && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Experience Level
                      </p>
                      <Badge variant="secondary" className="text-xs">
                        {jobAnalysis.experienceLevel}
                      </Badge>
                    </div>
                  )}
                  
                  {/* Required Skills */}
                  {jobAnalysis.requiredSkills.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Required Skills ({jobAnalysis.requiredSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {jobAnalysis.requiredSkills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {jobAnalysis.requiredSkills.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{jobAnalysis.requiredSkills.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Technologies */}
                  {jobAnalysis.technologies.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Technologies ({jobAnalysis.technologies.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {jobAnalysis.technologies.slice(0, 5).map((tech, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tech}
                          </Badge>
                        ))}
                        {jobAnalysis.technologies.length > 5 && (
                          <Badge variant="outline" className="text-xs">
                            +{jobAnalysis.technologies.length - 5} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Preferred Skills */}
                  {jobAnalysis.preferredSkills.length > 0 && (
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase">
                        Preferred Skills ({jobAnalysis.preferredSkills.length})
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {jobAnalysis.preferredSkills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {jobAnalysis.preferredSkills.length > 3 && (
                          <Badge variant="secondary" className="text-xs">
                            +{jobAnalysis.preferredSkills.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            {parsedResume && jobDescription.trim() && (
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  disabled={!jobAnalysis}
                  className="flex-1 bg-[#2C4C82] hover:bg-[#2C4C82]/90"
                  title={!jobAnalysis ? 'Please analyze job description first' : 'Generate ATS-optimized resume'}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize Resume
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearDraft}
                  disabled={!hasContent && !uploadedFile}
                  className="flex items-center gap-2"
                  title="Clear draft and reset form"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Results Section */}
        <Card className="border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2C4C82]" />
              ATS Analysis & Results
            </CardTitle>
            <CardDescription>
              Your ATS score and optimization results will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Task 25.3: Enhanced empty state with helpful guidance */}
            {/* Requirement 17.4: Display empty state with helpful guidance when page section has no content */}
            <EmptyState
              icon={FileText}
              title="Ready to analyze your resume"
              description="Upload your resume in PDF, DOCX, or TXT format, then add a job description to get started. You'll receive ATS optimization insights, skill matching analysis, and recommendations to improve your resume."
            />
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

export default ResumeBuilderPageModern;

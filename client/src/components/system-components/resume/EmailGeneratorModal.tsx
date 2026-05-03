/**
 * EmailGeneratorModal Component
 * 
 * Task 20: Create Email Generator Modal for Resume Builder
 * Sub-task 20.1: Build EmailGeneratorModal component
 * Sub-task 20.2: Add copy and close actions
 * 
 * Requirements:
 * - 8.4: Resume Builder SHALL provide email generator button
 * - 12.6: Component Library SHALL provide reusable dialog components for modals
 * - 14.6: Accessibility Features SHALL support Escape key to close modals
 * 
 * Features:
 * - Modal dialog with email generation form
 * - Pre-fill context with resume content and job description
 * - Integrate with email generation API
 * - Display generated email in modal
 * - Implement copy email button
 * - Add close button with Escape key support
 */

import { type ReactElement, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Sparkles, Loader2, Copy, AlertCircle } from 'lucide-react';
import { emailService, type EmailGenerationRequest, type EmailGenerationResponse } from '@/services/emailService';

/**
 * Props for EmailGeneratorModal component
 */
interface EmailGeneratorModalProps {
  /** Resume content to include in email context */
  resumeContent: string;
  /** Job description to include in email context */
  jobDescription: string;
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
}

/**
 * Email purpose options for job application context
 */
const EMAIL_PURPOSES = [
  {
    value: 'job-application',
    label: 'Job Application',
    helpText: 'Apply for the job position with your resume',
  },
  {
    value: 'follow-up',
    label: 'Follow-Up',
    helpText: 'Follow up on your application',
  },
  {
    value: 'thank-you',
    label: 'Thank You',
    helpText: 'Thank the interviewer after an interview',
  },
] as const;

/**
 * Email tone options
 */
const EMAIL_TONES = [
  {
    value: 'formal',
    label: 'Formal',
    helpText: 'Professional and respectful tone',
  },
  {
    value: 'friendly',
    label: 'Friendly',
    helpText: 'Warm and approachable tone',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    helpText: 'Direct and time-sensitive tone',
  },
  {
    value: 'casual',
    label: 'Casual',
    helpText: 'Relaxed and conversational tone',
  },
] as const;

/**
 * EmailGeneratorModal Component
 * 
 * A modal dialog for generating job application emails using AI.
 * Pre-fills context with resume content and job description.
 * 
 * @param props - Component props
 * @returns Modal component for email generation
 */
export function EmailGeneratorModal({
  resumeContent,
  jobDescription,
  open,
  onOpenChange,
}: EmailGeneratorModalProps): ReactElement {
  // Form state
  const [purpose, setPurpose] = useState<string>('job-application');
  const [tone, setTone] = useState<string>('formal');
  const [additionalContext, setAdditionalContext] = useState<string>('');

  // Email generation state
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generatedSubject, setGeneratedSubject] = useState<string>('');
  const [apiError, setApiError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setPurpose('job-application');
      setTone('formal');
      setAdditionalContext('');
      setGeneratedEmail('');
      setGeneratedSubject('');
      setApiError(null);
    }
  }, [open]);

  /**
   * Handle email generation
   * Sub-task 20.1: Integrate with email generation API
   * Requirement 8.4: Provide email generator button
   */
  const handleGenerateEmail = async () => {
    setIsGenerating(true);
    setApiError(null);

    // Show loading toast
    toast.loading('🤖 Generating your email...', { id: 'email-generation-modal' });

    try {
      // Build context message from resume and job description
      // Sub-task 20.1: Pre-fill context with resume content and job description
      const contextParts: string[] = [];
      
      // Add purpose context
      contextParts.push(`Purpose: ${purpose}`);
      
      // Add job description
      if (jobDescription.trim()) {
        contextParts.push(`Job Description:\n${jobDescription.trim()}`);
      }
      
      // Add resume content (truncate if too long)
      const maxResumeLength = 2000;
      const truncatedResume = resumeContent.length > maxResumeLength
        ? resumeContent.substring(0, maxResumeLength) + '...'
        : resumeContent;
      contextParts.push(`Resume Summary:\n${truncatedResume}`);
      
      // Add additional context if provided
      if (additionalContext.trim()) {
        contextParts.push(`Additional Instructions:\n${additionalContext.trim()}`);
      }

      // Build the request payload
      const requestPayload: EmailGenerationRequest = {
        originalText: contextParts.join('\n\n'),
        tone: tone as 'formal' | 'friendly' | 'urgent' | 'casual',
        action: 'generate',
      };

      // Call backend API
      const response: EmailGenerationResponse = await emailService.generateEmail(requestPayload);

      // Handle API response
      if (!response.success) {
        const errorMessage = response.error || 'Failed to generate email';
        setApiError(errorMessage);
        toast.error(errorMessage, { id: 'email-generation-modal' });
        return;
      }

      // Store generated email
      if (response.data?.generatedEmail) {
        setGeneratedEmail(response.data.generatedEmail);
        
        // Store subject if provided
        if (response.data.subject) {
          setGeneratedSubject(response.data.subject);
        }

        // Clear any previous errors
        setApiError(null);

        // Display success message
        toast.success('✅ Email generated successfully!', { 
          id: 'email-generation-modal',
          duration: 3000 
        });
      } else {
        const errorMessage = 'No email content received from server';
        setApiError(errorMessage);
        toast.error(errorMessage, { id: 'email-generation-modal' });
      }
    } catch (error) {
      console.error('Email generation error:', error);
      
      const errorMessage = error instanceof Error 
        ? `Network error: ${error.message}` 
        : 'Failed to generate email. Please check your connection and try again.';
      
      setApiError(errorMessage);
      toast.error(errorMessage, { id: 'email-generation-modal' });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Handle copy full email to clipboard
   * Sub-task 20.2: Implement copy email button
   * Requirement 8.4: Provide copy email action
   */
  const handleCopyEmail = async () => {
    try {
      // Build full email text with subject and body
      const fullEmailText = generatedSubject 
        ? `Subject: ${generatedSubject}\n\n${generatedEmail}`
        : generatedEmail;

      // Copy to clipboard
      await navigator.clipboard.writeText(fullEmailText);

      // Show success toast
      toast.success('✅ Email copied to clipboard!', { duration: 3000 });
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  /**
   * Handle regenerate email
   */
  const handleRegenerateEmail = () => {
    setGeneratedEmail('');
    setGeneratedSubject('');
    setApiError(null);
  };

  /**
   * Handle close modal
   * Sub-task 20.2: Add close button with Escape key support
   * Requirement 14.6: Support Escape key to close modals
   */
  const handleClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-[#2C4C82]" />
            Generate Application Email
          </DialogTitle>
          <DialogDescription>
            Create a professional email for your job application using AI
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Show form when no email is generated */}
          {!generatedEmail ? (
            <>
              {/* Email Purpose Selector */}
              <div className="space-y-2">
                <Label htmlFor="modal-email-purpose">
                  Email Purpose
                </Label>
                <Select value={purpose} onValueChange={(value) => setPurpose(value || '')}>
                  <SelectTrigger 
                    id="modal-email-purpose"
                    className="w-full"
                    aria-describedby="modal-purpose-help"
                  >
                    <SelectValue placeholder="Select email purpose" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_PURPOSES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p id="modal-purpose-help" className="text-sm text-muted-foreground">
                  {EMAIL_PURPOSES.find(p => p.value === purpose)?.helpText}
                </p>
              </div>

              {/* Email Tone Selector */}
              <div className="space-y-2">
                <Label htmlFor="modal-email-tone">
                  Email Tone
                </Label>
                <Select value={tone} onValueChange={(value) => setTone(value || '')}>
                  <SelectTrigger 
                    id="modal-email-tone"
                    className="w-full"
                    aria-describedby="modal-tone-help"
                  >
                    <SelectValue placeholder="Select email tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_TONES.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p id="modal-tone-help" className="text-sm text-muted-foreground">
                  {EMAIL_TONES.find(t => t.value === tone)?.helpText}
                </p>
              </div>

              {/* Additional Context Field */}
              <div className="space-y-2">
                <Label htmlFor="modal-additional-context">
                  Additional Instructions <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="modal-additional-context"
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any specific details you want to include in the email..."
                  className="min-h-24 resize-y"
                  aria-describedby="modal-context-help"
                />
                <p id="modal-context-help" className="text-sm text-muted-foreground">
                  Provide additional guidance to refine the generated email
                </p>
              </div>

              {/* Pre-filled Context Info */}
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <Sparkles className="h-4 w-4 text-[#2C4C82] mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-xs">
                    <p className="font-medium text-foreground">
                      Pre-filled Context
                    </p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>• Your resume content will be included automatically</p>
                      <p>• Job description will be used for context</p>
                      <p>• AI will generate a personalized email based on this information</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* API Error Display */}
              {apiError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-semibold text-destructive">
                        Email Generation Failed
                      </p>
                      <p className="text-sm text-destructive/90">
                        {apiError}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Display Generated Email */}
              <div className="space-y-4">
                {/* Subject Line Display */}
                {generatedSubject && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Subject</Label>
                    <div className="rounded-lg border border-border bg-muted/30 p-4">
                      <p className="text-sm font-semibold text-foreground">
                        {generatedSubject}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email Body Display */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Email Body</Label>
                  <div className="rounded-lg border border-border bg-background">
                    <div className="p-4 max-h-96 overflow-y-auto">
                      <div className="prose prose-sm dark:prose-invert max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                          {generatedEmail}
                        </pre>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Success Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs border-[#2C4C82]/30 bg-[#2C4C82]/5 text-[#2C4C82]">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Generated with AI
                  </Badge>
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          {!generatedEmail ? (
            <>
              {/* Sub-task 20.2: Close button with Escape key support */}
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {/* Generate Button */}
              <Button
                onClick={handleGenerateEmail}
                disabled={isGenerating}
                className="bg-[#2C4C82] hover:bg-[#2C4C82]/90"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Email
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Regenerate Button */}
              <Button variant="outline" onClick={handleRegenerateEmail}>
                Generate New
              </Button>
              {/* Sub-task 20.2: Copy email button */}
              <Button
                onClick={handleCopyEmail}
                className="bg-[#2C4C82] hover:bg-[#2C4C82]/90"
              >
                <Copy className="mr-2 h-4 w-4" />
                Copy Email
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default EmailGeneratorModal;

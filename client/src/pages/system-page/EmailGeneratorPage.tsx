import { type ReactElement, useState, type ClipboardEvent, useEffect, useRef, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Mail, Sparkles, Languages, Settings, Loader2, Copy, RefreshCw, AlertCircle, RotateCcw, Trash2 } from 'lucide-react';
import { analyzeContentWithWatsonx } from '@/services/contentAnalysisService';
import { detectLanguage, getLanguageName, isConfidentDetection } from '@/utilities/system-utils/languageDetector';
import { SUPPORTED_LANGUAGES } from '@/config/languages';
import type { SupportedLanguage } from '@/types/language.types';
import { LanguageSettingsModal } from '@/components/features';
import { FileUpload } from '@/components/ui/file-upload';
import { processUploadedFile } from '@/services/fileProcessingService';
import { emailService, type EmailGenerationRequest, type EmailGenerationResponse } from '@/services/emailService';
import { useAutoSave, loadFromLocalStorage, clearFromLocalStorage, formatRelativeTime } from '@/hooks/useAutoSave';

/**
 * Email purpose options with labels, help text, and context field configuration
 */
const EMAIL_PURPOSES = [
  {
    value: 'job-application',
    label: 'Job Application',
    helpText: 'Apply for a job position with a cover letter or introduction',
    contextLabel: 'Job Details and Your Background',
    contextPlaceholder: 'Paste the job description and share relevant details about your experience, skills, and why you\'re interested in this position...',
    contextHelpText: 'Include the job title, company name, key requirements, and your relevant qualifications',
  },
  {
    value: 'follow-up',
    label: 'Follow-Up',
    helpText: 'Follow up on a previous conversation or application',
    contextLabel: 'Previous Interaction Details',
    contextPlaceholder: 'Describe your previous conversation or application, when it occurred, and what you\'re following up about...',
    contextHelpText: 'Reference specific details from your previous interaction to show continuity',
  },
  {
    value: 'thank-you',
    label: 'Thank You',
    helpText: 'Express gratitude after an interview or meeting',
    contextLabel: 'Meeting or Interview Details',
    contextPlaceholder: 'Share details about the interview or meeting, who you met with, key discussion points, and what you appreciated...',
    contextHelpText: 'Mention specific topics discussed to personalize your thank you message',
  },
  {
    value: 'networking',
    label: 'Networking',
    helpText: 'Connect with professionals or request informational interviews',
    contextLabel: 'Connection Context and Goals',
    contextPlaceholder: 'Explain how you found this person, what you admire about their work, and what you hope to learn or discuss...',
    contextHelpText: 'Show genuine interest and be specific about why you want to connect',
  },
  {
    value: 'inquiry',
    label: 'Inquiry',
    helpText: 'Ask questions or request information',
    contextLabel: 'Your Question or Request',
    contextPlaceholder: 'Clearly state what information you need, why you need it, and any relevant background context...',
    contextHelpText: 'Be specific about what you\'re asking to get a more helpful response',
  },
] as const;

/**
 * Email tone options with labels and help text
 */
const EMAIL_TONES = [
  {
    value: 'formal',
    label: 'Formal',
    helpText: 'Professional and respectful tone for business communications',
  },
  {
    value: 'friendly',
    label: 'Friendly',
    helpText: 'Warm and approachable tone for casual professional settings',
  },
  {
    value: 'urgent',
    label: 'Urgent',
    helpText: 'Direct and time-sensitive tone for important matters',
  },
  {
    value: 'casual',
    label: 'Casual',
    helpText: 'Relaxed and conversational tone for informal communications',
  },
] as const;

/**
 * Email refinement options with labels and help text
 */
const EMAIL_REFINEMENTS = [
  {
    value: 'none',
    label: 'No refinement',
    helpText: 'Generate the first clean draft only',
  },
  {
    value: 'shorter',
    label: 'Make it shorter',
    helpText: 'Keep the message concise and easy to scan',
  },
  {
    value: 'longer',
    label: 'Make it longer',
    helpText: 'Expand with more details and context',
  },
  {
    value: 'more-formal',
    label: 'More formal',
    helpText: 'Polish the wording to sound more formal and executive',
  },
  {
    value: 'more-casual',
    label: 'More casual',
    helpText: 'Make the tone more relaxed and conversational',
  },
] as const;

// localStorage key for email generator draft
const EMAIL_GENERATOR_DRAFT_KEY = 'email-generator-draft';

/**
 * Type definition for email generator draft data
 */
interface EmailGeneratorDraft {
  purpose: string;
  tone: string;
  contextMessage: string;
  recipientInfo: string;
  extraInstructions: string;
  refinement: string;
  targetLanguage: SupportedLanguage;
  autoDetectLanguage: boolean;
  culturalAdaptation: boolean;
  localizedTone: string;
}

/**
 * EmailGeneratorPage Component
 * 
 * Modern two-column layout for email generation with:
 * - Form inputs on the left
 * - Generated output on the right
 * - Responsive stacking for mobile devices
 * 
 * Requirements:
 * - 5.1: Display only fields necessary for email generation
 * - 5.2: Support four email tones (Formal, Friendly, Urgent, Casual)
 * - 5.3: Organize form fields logically with clear labels and help text
 * - 13.5: Stack columns vertically on viewports below 768px
 * - 22.2: Use consistent form field styles across all pages
 * - 19.4: Debounce auto-save operations to reduce localStorage writes
 * - 9.2: Load draft from localStorage on mount
 * - 9.3: Display restoration notification with timestamp
 * - 9.5: Implement clear draft button and remove draft from localStorage
 */
function EmailGeneratorPage(): ReactElement {
  // Form state
  const [purpose, setPurpose] = useState<string>('');
  const [tone, setTone] = useState<string>('');
  const [contextMessage, setContextMessage] = useState<string>('');
  const [recipientInfo, setRecipientInfo] = useState<string>('');
  const [extraInstructions, setExtraInstructions] = useState<string>('');
  const [refinement, setRefinement] = useState<string>('none');

  // Language detection state - Requirement 6.4, 6.5, 21.6, 21.7
  const [autoDetectLanguage, setAutoDetectLanguage] = useState<boolean>(false);
  const [targetLanguage, setTargetLanguage] = useState<SupportedLanguage>('en');
  const [isDetecting, setIsDetecting] = useState<boolean>(false);
  
  // Cultural adaptation and localized tone state - Requirement 21.2, 21.4
  const [culturalAdaptation, setCulturalAdaptation] = useState<boolean>(false);
  const [localizedTone, setLocalizedTone] = useState<string>('');
  
  // Language settings modal state
  const [languageSettingsOpen, setLanguageSettingsOpen] = useState<boolean>(false);
  
  // File upload state - Requirement 7.1, 7.2, 7.5
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState<boolean>(false);
  
  // Email generation state - Task 12.1, Task 12.2
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [generatedSubject, setGeneratedSubject] = useState<string>('');
  
  // Error handling state - Task 12.4
  const [apiError, setApiError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  
  // Debounce timer ref for language detection
  const detectionTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sub-task 13.1: Auto-save form values to localStorage with 1-second debounce
  // Requirement 19.4: Debounce auto-save operations to reduce localStorage writes
  const draftData: EmailGeneratorDraft = {
    purpose,
    tone,
    contextMessage,
    recipientInfo,
    extraInstructions,
    refinement,
    targetLanguage,
    autoDetectLanguage,
    culturalAdaptation,
    localizedTone,
  };

  // Enable auto-save only when there's meaningful content
  const hasContent = Boolean(purpose || tone || contextMessage.trim() || recipientInfo.trim() || extraInstructions.trim());
  useAutoSave(EMAIL_GENERATOR_DRAFT_KEY, draftData, 1000, hasContent);

  // Sub-task 13.2: Restore draft from localStorage on component mount
  // Requirement 9.2: Load draft from localStorage on mount
  // Requirement 9.3: Display restoration notification with timestamp
  useEffect(() => {
    const savedDraft = loadFromLocalStorage<EmailGeneratorDraft>(EMAIL_GENERATOR_DRAFT_KEY);
    
    if (savedDraft) {
      const { data, timestamp } = savedDraft;
      
      // Restore all form fields
      if (data.purpose) setPurpose(data.purpose);
      if (data.tone) setTone(data.tone);
      if (data.contextMessage) setContextMessage(data.contextMessage);
      if (data.recipientInfo) setRecipientInfo(data.recipientInfo);
      if (data.extraInstructions) setExtraInstructions(data.extraInstructions);
      if (data.refinement) setRefinement(data.refinement);
      if (data.targetLanguage) setTargetLanguage(data.targetLanguage);
      if (data.autoDetectLanguage !== undefined) setAutoDetectLanguage(data.autoDetectLanguage);
      if (data.culturalAdaptation !== undefined) setCulturalAdaptation(data.culturalAdaptation);
      if (data.localizedTone) setLocalizedTone(data.localizedTone);

      // Display restoration notification with timestamp
      const relativeTime = formatRelativeTime(timestamp);
      toast.success(
        `📝 Draft restored from ${relativeTime}`,
        { duration: 4000 }
      );
    }
  }, []); // Empty dependency array - run only on mount

  // Get help text and context field configuration for selected purpose
  const selectedPurpose = EMAIL_PURPOSES.find(p => p.value === purpose);
  const selectedPurposeHelp = selectedPurpose?.helpText;
  const selectedToneHelp = EMAIL_TONES.find(t => t.value === tone)?.helpText;
  const selectedRefinementHelp = EMAIL_REFINEMENTS.find(r => r.value === refinement)?.helpText;

  /**
   * Handle paste event in context message field
   * Requirement 6.1: Analyze pasted content using Watsonx AI
   * Requirement 6.2: Auto-fill form fields if confidence > 30%
   * Requirement 6.3: Display success message with fields filled and confidence
   */
  const handleContextPaste = async (event: ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = event.clipboardData.getData('text');
    
    // Only analyze if pasted text is longer than 50 characters
    if (!pastedText || pastedText.trim().length <= 50) {
      return;
    }

    // Show loading toast
    toast.loading('🤖 Analyzing content with Watsonx AI...', { id: 'content-analysis' });

    try {
      const analysis = await analyzeContentWithWatsonx(pastedText);

      if (!analysis) {
        toast.error('Could not analyze content', { id: 'content-analysis' });
        return;
      }

      // Check if confidence is above 30%
      if (analysis.confidence < 30) {
        toast.error('Content analysis confidence too low', { id: 'content-analysis' });
        return;
      }

      // Count how many fields will be auto-filled
      let fieldsFilledCount = 0;
      const filledFields: string[] = [];

      // Auto-fill purpose if detected
      if (analysis.purpose) {
        setPurpose(analysis.purpose);
        fieldsFilledCount++;
        filledFields.push('Purpose');
      }

      // Auto-fill tone if detected
      if (analysis.tone) {
        setTone(analysis.tone);
        fieldsFilledCount++;
        filledFields.push('Tone');
      }

      // Auto-fill recipient info if detected (from job role or company)
      if (analysis.jobRole || analysis.company) {
        const recipientText = [analysis.jobRole, analysis.company]
          .filter(Boolean)
          .join(' at ');
        setRecipientInfo(recipientText);
        fieldsFilledCount++;
        filledFields.push('Recipient Info');
      }

      // Auto-fill refinement if detected
      if (analysis.refinement && analysis.refinement !== 'none') {
        setRefinement(analysis.refinement);
        fieldsFilledCount++;
        filledFields.push('Refinement');
      }

      // Auto-fill extra instructions if detected
      if (analysis.extraInstruction) {
        setExtraInstructions(analysis.extraInstruction);
        fieldsFilledCount++;
        filledFields.push('Extra Instructions');
      }

      // Display success message with fields filled and confidence
      if (fieldsFilledCount > 0) {
        toast.success(
          `✅ Auto-filled ${fieldsFilledCount} field${fieldsFilledCount > 1 ? 's' : ''} (${analysis.confidence}% confidence): ${filledFields.join(', ')}`,
          { id: 'content-analysis', duration: 5000 }
        );
      } else {
        toast.error('No fields could be auto-filled', { id: 'content-analysis' });
      }
    } catch (error) {
      console.error('Content analysis error:', error);
      toast.error('Failed to analyze content', { id: 'content-analysis' });
    }
  };

  /**
   * Detect language from context message
   * Requirement 6.4: Detect language when auto-detect is enabled and text > 30 characters
   * Requirement 6.5: Update target language field when high confidence detected
   * Requirement 21.6: Automatically detect input language when auto-detect is enabled
   * Requirement 21.7: Update language selector and notify user when detection completes
   */
  const detectLanguageFromContext = (text: string) => {
    // Only detect if auto-detect is enabled and text is longer than 30 characters
    if (!autoDetectLanguage || !text || text.trim().length <= 30) {
      return;
    }

    // Clear any existing timer
    if (detectionTimerRef.current) {
      clearTimeout(detectionTimerRef.current);
    }

    // Debounce detection by 500ms to avoid excessive calls
    detectionTimerRef.current = setTimeout(() => {
      setIsDetecting(true);

      try {
        const result = detectLanguage(text);

        // Check if confidence is high enough (>= 70%)
        if (isConfidentDetection(result)) {
          const languageName = getLanguageName(result.detectedLanguage);
          
          // Update target language field
          setTargetLanguage(result.detectedLanguage);

          // Display notification
          toast.success(
            `🌐 Language detected: ${languageName} (${result.confidence}% confidence)`,
            { duration: 4000 }
          );
        }
      } catch (error) {
        console.error('Language detection error:', error);
      } finally {
        setIsDetecting(false);
      }
    }, 500);
  };

  /**
   * Handle context message change with language detection
   */
  const handleContextMessageChange = (value: string) => {
    setContextMessage(value);
    detectLanguageFromContext(value);
    
    // Clear validation error for this field when user starts typing
    if (validationErrors.contextMessage) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.contextMessage;
        return newErrors;
      });
    }
  };

  /**
   * Cleanup detection timer on unmount
   */
  useEffect(() => {
    return () => {
      if (detectionTimerRef.current) {
        clearTimeout(detectionTimerRef.current);
      }
    };
  }, []);

  /**
   * Handle file selection from FileUpload component
   * Requirement 7.3: Accept TXT, PDF, DOCX, JSON, CSV, MD, HTML, XML, RTF formats
   * Requirement 7.4: Reject files > 10MB
   * Requirement 7.6: Extract text content and populate context message field
   * Requirement 7.7: Display error messages for failed uploads
   * Requirement 7.8: Integrate with Backend_API file processing endpoint
   */
  const handleFileSelect = async (file: File) => {
    setUploadedFile(file);
    setIsProcessingFile(true);

    // Show processing toast
    toast.loading('📄 Processing file...', { id: 'file-processing' });

    try {
      // Process the file and extract text content
      const result = await processUploadedFile(file);

      if (!result.success) {
        // Display error message for failed upload (Requirement 7.7)
        toast.error(result.error || 'Failed to process file', { id: 'file-processing' });
        setUploadedFile(null);
        return;
      }

      // Populate context message field with extracted content (Requirement 7.6)
      setContextMessage(result.content);

      // Display success message
      toast.success(
        `✅ File processed successfully! Extracted ${result.content.length} characters.`,
        { id: 'file-processing', duration: 4000 }
      );

      // Trigger language detection if auto-detect is enabled
      if (autoDetectLanguage && result.content.length > 30) {
        detectLanguageFromContext(result.content);
      }
    } catch (error) {
      console.error('File processing error:', error);
      toast.error('Failed to process file', { id: 'file-processing' });
      setUploadedFile(null);
    } finally {
      setIsProcessingFile(false);
    }
  };

  /**
   * Handle file clear from FileUpload component
   */
  const handleFileClear = () => {
    setUploadedFile(null);
    // Optionally clear context message if it was populated from file
    // setContextMessage('');
  };

  /**
   * Validate form fields and return validation errors
   * Task 12.4: Implement field-specific validation errors
   * Requirement 20.2: Display field-specific error messages when form validation fails
   */
  const validateForm = (): Record<string, string> => {
    const errors: Record<string, string> = {};

    if (!purpose) {
      errors.purpose = 'Please select an email purpose';
    }

    if (!tone) {
      errors.tone = 'Please select an email tone';
    }

    if (!contextMessage.trim()) {
      errors.contextMessage = 'Please provide context for your email';
    } else if (contextMessage.trim().length < 10) {
      errors.contextMessage = 'Context message must be at least 10 characters';
    }

    return errors;
  };

  /**
   * Handle form submission for email generation
   * Task 12.1: Implement email generation form submission
   * Task 12.4: Enhanced error handling with field-specific validation
   * Requirements:
   * - 5.5: Form submission triggers email generation
   * - 5.6: Display loading state during generation and clear error messages for API failures
   * - 5.8: Preserve form values on regeneration
   * - 17.3: Display error message with failure reason when API request fails
   * - 18.1: Backend API integration at /api/email/generate
   * - 18.6: Handle API responses correctly
   * - 20.1: Display error message with retry option when network request fails
   * - 20.2: Display field-specific error messages when form validation fails
   */
  const handleGenerateEmail = async (event?: FormEvent<HTMLFormElement>) => {
    // Prevent default form submission if event is provided
    if (event) {
      event.preventDefault();
    }

    // Clear previous errors (Task 12.4)
    setValidationErrors({});
    setApiError(null);

    // Validate required fields (Task 12.4 - Requirement 20.2)
    const errors = validateForm();
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      
      // Show first validation error in toast
      const firstError = Object.values(errors)[0];
      if (firstError) {
        toast.error(firstError);
      }
      return;
    }

    // Set loading state (Requirement 5.6)
    setIsGenerating(true);

    // Show loading toast
    toast.loading('🤖 Generating your email...', { id: 'email-generation' });

    try {
      // Build the request payload for Backend API (Requirement 18.1, 18.6)
      // Combine all form inputs into originalText
      const originalTextParts: string[] = [];
      
      // Add purpose context
      originalTextParts.push(`Purpose: ${purpose}`);
      
      // Add recipient info if provided
      if (recipientInfo.trim()) {
        originalTextParts.push(`Recipient: ${recipientInfo}`);
      }
      
      // Add main context message
      originalTextParts.push(`Context: ${contextMessage}`);
      
      // Add extra instructions if provided
      if (extraInstructions.trim()) {
        originalTextParts.push(`Additional Instructions: ${extraInstructions}`);
      }
      
      // Add refinement if not 'none'
      if (refinement && refinement !== 'none') {
        originalTextParts.push(`Refinement: ${refinement}`);
      }
      
      // Add language preference
      originalTextParts.push(`Target Language: ${targetLanguage}`);
      
      // Add cultural adaptation if enabled
      if (culturalAdaptation) {
        originalTextParts.push(`Cultural Adaptation: Enabled`);
      }
      
      // Add localized tone if provided
      if (localizedTone) {
        originalTextParts.push(`Localized Tone: ${localizedTone}`);
      }

      const requestPayload: EmailGenerationRequest = {
        originalText: originalTextParts.join('\n\n'),
        tone: tone as 'formal' | 'friendly' | 'urgent' | 'casual',
        action: 'generate',
      };

      // Call backend API (Requirement 18.1)
      const response: EmailGenerationResponse = await emailService.generateEmail(requestPayload);

      // Handle API response (Requirement 18.6, Task 12.4)
      if (!response.success) {
        // Store API error for retry option (Requirement 20.1)
        const errorMessage = response.error || 'Failed to generate email';
        setApiError(errorMessage);
        
        // Display error message with failure reason (Requirement 5.6, 17.3)
        toast.error(errorMessage, { id: 'email-generation' });
        return;
      }

      // Store generated email in state for display (Task 12.2 will handle the display)
      if (response.data?.generatedEmail) {
        setGeneratedEmail(response.data.generatedEmail);
        
        // Store subject if provided
        if (response.data.subject) {
          setGeneratedSubject(response.data.subject);
        }

        // Clear any previous API errors on success
        setApiError(null);

        // Display success message
        toast.success('✅ Email generated successfully!', { 
          id: 'email-generation',
          duration: 3000 
        });
      } else {
        const errorMessage = 'No email content received from server';
        setApiError(errorMessage);
        toast.error(errorMessage, { id: 'email-generation' });
      }

      // Form values are preserved automatically by React state (Requirement 5.8)
      // No need to clear or reset form fields
    } catch (error) {
      console.error('Email generation error:', error);
      
      // Handle network errors with retry option (Requirement 20.1)
      const errorMessage = error instanceof Error 
        ? `Network error: ${error.message}` 
        : 'Failed to generate email. Please check your connection and try again.';
      
      setApiError(errorMessage);
      toast.error(errorMessage, { id: 'email-generation' });
    } finally {
      // Clear loading state
      setIsGenerating(false);
    }
  };

  /**
   * Handle copy full email to clipboard
   * Task 12.3: Implement copy full email button
   * Requirement 5.4: Provide copy output action
   * 
   * Copies both subject and body to clipboard
   */
  const handleCopyFullEmail = async () => {
    try {
      // Build full email text with subject and body
      const fullEmailText = generatedSubject 
        ? `Subject: ${generatedSubject}\n\n${generatedEmail}`
        : generatedEmail;

      // Copy to clipboard
      await navigator.clipboard.writeText(fullEmailText);

      // Show success toast
      toast.success('✅ Full email copied to clipboard!', { duration: 3000 });
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  /**
   * Handle copy email body to clipboard
   * Task 12.3: Implement copy email body button (click-to-copy)
   * Requirement 5.4: Provide copy output action
   * 
   * Copies only the email body to clipboard
   */
  const handleCopyEmailBody = async () => {
    try {
      // Copy email body to clipboard
      await navigator.clipboard.writeText(generatedEmail);

      // Show success toast
      toast.success('✅ Email body copied to clipboard!', { duration: 3000 });
    } catch (error) {
      console.error('Copy to clipboard error:', error);
      toast.error('Failed to copy to clipboard');
    }
  };

  /**
   * Handle regenerate email
   * Task 12.3: Implement regenerate button
   * Requirement 5.4: Provide regenerate content action
   * Requirement 5.8: Preserve all user input in form fields
   * 
   * Re-submits the form while preserving all input values
   */
  const handleRegenerateEmail = () => {
    // Call handleGenerateEmail without event parameter
    // This re-submits the form with all current form values preserved
    handleGenerateEmail();
  };

  /**
   * Handle clear draft
   * Sub-task 13.3: Clear draft from localStorage and reset form
   * Requirement 9.5: Implement clear draft button and remove draft from localStorage
   * 
   * Clears the saved draft and resets all form fields to default values
   */
  const handleClearDraft = () => {
    // Clear from localStorage
    clearFromLocalStorage(EMAIL_GENERATOR_DRAFT_KEY);

    // Reset all form fields to default values
    setPurpose('');
    setTone('');
    setContextMessage('');
    setRecipientInfo('');
    setExtraInstructions('');
    setRefinement('none');
    setTargetLanguage('en');
    setAutoDetectLanguage(false);
    setCulturalAdaptation(false);
    setLocalizedTone('');

    // Clear generated email output
    setGeneratedEmail('');
    setGeneratedSubject('');

    // Clear any errors
    setValidationErrors({});
    setApiError(null);

    // Display confirmation message
    toast.success('🗑️ Draft cleared successfully', { duration: 3000 });
  };

  return (
    <div className="w-full space-y-8">
      {/* Page Header - Sub-task 9.1 */}
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
            Email Generator
          </h1>
          <p className="text-base md:text-lg text-muted-foreground max-w-3xl">
            Create professional emails with AI assistance. Perfect for job applications, networking, and business communications.
          </p>
        </div>
      </section>

      {/* Two-Column Layout - Sub-task 9.1 */}
      {/* 
        Grid layout that:
        - Shows two columns on desktop (lg:grid-cols-2)
        - Stacks vertically on mobile (default single column)
        - Provides consistent gap between columns
      */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Left Column - Form Section */}
        <Card className="border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-[#2C4C82]" />
              Email Details
            </CardTitle>
            <CardDescription>
              Fill in the details below to generate your email
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Form fields - Sub-task 9.2: Purpose and Tone Selectors */}
            <form onSubmit={handleGenerateEmail} className="space-y-4">
              {/* Email Purpose Selector */}
              <div className="space-y-2">
                <Label htmlFor="email-purpose">
                  Email Purpose
                </Label>
                <Select value={purpose} onValueChange={(value) => {
                  setPurpose(value || '');
                  // Clear validation error when user selects a value
                  if (validationErrors.purpose) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.purpose;
                      return newErrors;
                    });
                  }
                }}>
                  <SelectTrigger 
                    id="email-purpose"
                    className={`w-full ${validationErrors.purpose ? 'border-destructive focus:ring-destructive' : ''}`}
                    aria-describedby={purpose ? "purpose-help" : undefined}
                    aria-invalid={!!validationErrors.purpose}
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
                {validationErrors.purpose ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.purpose}
                  </p>
                ) : selectedPurposeHelp ? (
                  <p id="purpose-help" className="text-sm text-muted-foreground">
                    {selectedPurposeHelp}
                  </p>
                ) : null}
              </div>

              {/* Email Tone Selector */}
              <div className="space-y-2">
                <Label htmlFor="email-tone">
                  Email Tone
                </Label>
                <Select value={tone} onValueChange={(value) => {
                  setTone(value || '');
                  // Clear validation error when user selects a value
                  if (validationErrors.tone) {
                    setValidationErrors(prev => {
                      const newErrors = { ...prev };
                      delete newErrors.tone;
                      return newErrors;
                    });
                  }
                }}>
                  <SelectTrigger 
                    id="email-tone"
                    className={`w-full ${validationErrors.tone ? 'border-destructive focus:ring-destructive' : ''}`}
                    aria-describedby={tone ? "tone-help" : undefined}
                    aria-invalid={!!validationErrors.tone}
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
                {validationErrors.tone ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.tone}
                  </p>
                ) : selectedToneHelp ? (
                  <p id="tone-help" className="text-sm text-muted-foreground">
                    {selectedToneHelp}
                  </p>
                ) : null}
              </div>

              {/* Context Message Field - Sub-task 9.3 */}
              <div className="space-y-2">
                <Label htmlFor="context-message">
                  {selectedPurpose?.contextLabel || 'Context Message'}
                </Label>
                <Textarea
                  id="context-message"
                  value={contextMessage}
                  onChange={(e) => handleContextMessageChange(e.target.value)}
                  onPaste={handleContextPaste}
                  placeholder={selectedPurpose?.contextPlaceholder || 'Provide context for your email...'}
                  className={`min-h-32 resize-y ${validationErrors.contextMessage ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                  aria-describedby={selectedPurpose ? "context-help" : undefined}
                  aria-invalid={!!validationErrors.contextMessage}
                />
                {validationErrors.contextMessage ? (
                  <p className="text-sm text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {validationErrors.contextMessage}
                  </p>
                ) : selectedPurpose?.contextHelpText ? (
                  <p id="context-help" className="text-sm text-muted-foreground">
                    {selectedPurpose.contextHelpText}
                  </p>
                ) : null}
              </div>

              {/* File Upload Section - Sub-task 11.2 */}
              <div className="space-y-2">
                <Label htmlFor="file-upload">
                  Upload Document <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <FileUpload
                  id="file-upload"
                  file={uploadedFile}
                  onFileSelect={handleFileSelect}
                  onFileClear={handleFileClear}
                  accept=".txt,.pdf,.docx,.json,.csv,.md,.html,.xml,.rtf"
                  maxSize={10 * 1024 * 1024} // 10MB
                  disabled={isProcessingFile}
                  aria-describedby="file-upload-help"
                />
                <p id="file-upload-help" className="text-sm text-muted-foreground">
                  Upload a document to extract text content. Supports TXT, PDF, DOCX, JSON, CSV, MD, HTML, XML, and RTF files up to 10MB.
                </p>
              </div>

              {/* Recipient Info Field - Sub-task 9.4 */}
              <div className="space-y-2">
                <Label htmlFor="recipient-info">
                  Recipient Information
                </Label>
                <Input
                  id="recipient-info"
                  type="text"
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  placeholder="e.g., Hiring Manager, John Smith, Dr. Jane Doe"
                  aria-describedby="recipient-help"
                />
                <p id="recipient-help" className="text-sm text-muted-foreground">
                  Enter the recipient's name, title, or role to personalize your email
                </p>
              </div>

              {/* Extra Instructions Field - Sub-task 9.4 */}
              <div className="space-y-2">
                <Label htmlFor="extra-instructions">
                  Extra Instructions <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Textarea
                  id="extra-instructions"
                  value={extraInstructions}
                  onChange={(e) => setExtraInstructions(e.target.value)}
                  placeholder="Add any specific requirements, tone adjustments, or details you want included..."
                  className="min-h-24 resize-y"
                  aria-describedby="instructions-help"
                />
                <p id="instructions-help" className="text-sm text-muted-foreground">
                  Provide additional guidance to refine the generated email
                </p>
              </div>

              {/* Refinement Selector - Sub-task 9.5 */}
              <div className="space-y-2">
                <Label htmlFor="refinement">
                  Refinement <span className="text-muted-foreground font-normal">(Optional)</span>
                </Label>
                <Select value={refinement} onValueChange={(value) => setRefinement(value || 'none')}>
                  <SelectTrigger 
                    id="refinement"
                    className="w-full"
                    aria-describedby="refinement-help"
                  >
                    <SelectValue placeholder="Select refinement option" />
                  </SelectTrigger>
                  <SelectContent>
                    {EMAIL_REFINEMENTS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedRefinementHelp && (
                  <p id="refinement-help" className="text-sm text-muted-foreground">
                    {selectedRefinementHelp}
                  </p>
                )}
              </div>

              {/* Language Detection Section - Sub-task 10.2 */}
              <div className="space-y-4 rounded-lg border border-border bg-muted/30 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Languages className="h-5 w-5 text-[#2C4C82]" />
                    <h3 className="text-sm font-semibold text-foreground">
                      Language Settings
                    </h3>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setLanguageSettingsOpen(true)}
                    className="flex items-center gap-2"
                  >
                    <Settings className="h-4 w-4" />
                    Advanced
                  </Button>
                </div>

                {/* Auto-detect Language Toggle */}
                <div className="flex items-center justify-between space-x-2">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-detect-language" className="text-sm font-medium">
                      Auto-detect Language
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Automatically detect language from your input text
                    </p>
                  </div>
                  <Switch
                    id="auto-detect-language"
                    checked={autoDetectLanguage}
                    onCheckedChange={setAutoDetectLanguage}
                    aria-describedby="auto-detect-help"
                  />
                </div>
                <p id="auto-detect-help" className="text-xs text-muted-foreground">
                  When enabled, the system will detect the language from text longer than 30 characters
                </p>

                {/* Target Language Selector */}
                <div className="space-y-2">
                  <Label htmlFor="target-language" className="text-sm font-medium">
                    Target Language
                  </Label>
                  <Select 
                    value={targetLanguage} 
                    onValueChange={(value) => setTargetLanguage(value as SupportedLanguage)}
                    disabled={isDetecting}
                  >
                    <SelectTrigger 
                      id="target-language"
                      className="w-full"
                      aria-describedby="target-language-help"
                    >
                      <SelectValue placeholder="Select target language" />
                    </SelectTrigger>
                    <SelectContent>
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          <span className="flex items-center gap-2">
                            <span>{lang.flag}</span>
                            <span>{lang.name}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p id="target-language-help" className="text-xs text-muted-foreground">
                    {autoDetectLanguage 
                      ? 'Language will be auto-detected and updated based on your input'
                      : 'Select the language for your email generation'
                    }
                  </p>
                  {isDetecting && (
                    <p className="text-xs text-[#2C4C82] flex items-center gap-1">
                      <span className="animate-pulse">🔍</span>
                      Detecting language...
                    </p>
                  )}
                </div>

                {/* Cultural Adaptation Badge */}
                {culturalAdaptation && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Cultural Adaptation Enabled
                    </Badge>
                  </div>
                )}

                {/* Localized Tone Badge */}
                {localizedTone && (
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      Tone: {localizedTone}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Task 12.4: Field-Specific Validation Errors Display */}
              {/* Requirement 20.2: Display field-specific error messages when form validation fails */}
              {Object.keys(validationErrors).length > 0 && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-semibold text-destructive">
                        Please fix the following errors:
                      </p>
                      <ul className="text-sm text-destructive/90 space-y-1 list-disc list-inside">
                        {Object.entries(validationErrors).map(([field, error]) => (
                          <li key={field}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* Task 12.4: API Error Display with Retry Option */}
              {/* Requirement 5.6: Display clear error messages for API failures */}
              {/* Requirement 17.3: Display error message with failure reason when API request fails */}
              {/* Requirement 20.1: Display error message with retry option when network request fails */}
              {apiError && (
                <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div className="space-y-3 flex-1">
                      <div className="space-y-1">
                        <p className="text-sm font-semibold text-destructive">
                          Email Generation Failed
                        </p>
                        <p className="text-sm text-destructive/90">
                          {apiError}
                        </p>
                      </div>
                      {/* Retry Button - Requirement 20.1 */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRegenerateEmail}
                        disabled={isGenerating}
                        className="border-destructive/30 text-destructive hover:bg-destructive/10 hover:text-destructive"
                      >
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Retry Generation
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button - Task 12.1 */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="submit"
                  disabled={isGenerating || !purpose || !tone || !contextMessage.trim()}
                  className="flex-1 bg-[#2C4C82] hover:bg-[#2C4C82]/90"
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

                {/* Sub-task 13.3: Clear Draft Button */}
                {/* Requirement 9.5: Implement clear draft button and remove draft from localStorage */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClearDraft}
                  disabled={isGenerating || !hasContent}
                  className="flex items-center gap-2"
                  title="Clear draft and reset form"
                >
                  <Trash2 className="h-4 w-4" />
                  Clear Draft
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Right Column - Output Section */}
        <Card className="border-border h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#2C4C82]" />
              Generated Email
            </CardTitle>
            <CardDescription>
              Your AI-generated email will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Task 12.2: Email Output Display Component */}
            {generatedEmail ? (
              <div className="space-y-4">
                {/* Language and Cultural Adaptation Badges - Requirement 21.4 */}
                {(targetLanguage !== 'en' || culturalAdaptation) && (
                  <div className="flex flex-wrap gap-2">
                    {/* Language Indicator Badge - Show for non-English emails */}
                    {targetLanguage !== 'en' && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-[#2C4C82]/30 bg-[#2C4C82]/5 text-[#2C4C82]"
                      >
                        <Languages className="h-3 w-3 mr-1" />
                        {SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage)?.name || targetLanguage}
                      </Badge>
                    )}
                    
                    {/* Cultural Adaptation Badge - Show when enabled */}
                    {culturalAdaptation && (
                      <Badge 
                        variant="outline" 
                        className="text-xs border-[#2C4C82]/30 bg-[#2C4C82]/5 text-[#2C4C82]"
                      >
                        <Sparkles className="h-3 w-3 mr-1" />
                        Cultural Adaptation
                      </Badge>
                    )}
                  </div>
                )}

                {/* Subject Line Display - Requirement 5.7 */}
                {generatedSubject && (
                  <div className="rounded-lg border border-border bg-muted/30 p-4">
                    <div className="space-y-1">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Subject
                      </p>
                      <p className="text-base font-semibold text-foreground">
                        {generatedSubject}
                      </p>
                    </div>
                  </div>
                )}

                {/* Email Body Display - Requirement 5.7 */}
                <div className="rounded-lg border border-border bg-background">
                  <div className="p-4 border-b border-border">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Email Body
                    </p>
                  </div>
                  <div className="p-4 max-h-96 overflow-y-auto">
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                        {generatedEmail}
                      </pre>
                    </div>
                  </div>
                </div>

                {/* Action Buttons - Task 12.3: Copy and Regenerate Actions */}
                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  {/* Copy Full Email Button - Requirement 5.4 */}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyFullEmail}
                    disabled={isGenerating}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Full Email
                  </Button>
                  
                  {/* Copy Email Body Button - Requirement 5.4 */}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleCopyEmailBody}
                    disabled={isGenerating}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy Body
                  </Button>
                  
                  {/* Regenerate Button - Requirement 5.4, 5.8 */}
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={handleRegenerateEmail}
                    disabled={isGenerating || !purpose || !tone || !contextMessage.trim()}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Regenerate
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Empty state - shown when no email has been generated */
              <div className="space-y-4 rounded-lg border border-dashed border-border p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#2C4C82]/10">
                  <Mail className="h-6 w-6 text-[#2C4C82]" />
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Ready to generate your email
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Fill out the form and click generate to create your AI-powered email draft
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Language Settings Modal - Sub-task 10.3 */}
      <LanguageSettingsModal
        open={languageSettingsOpen}
        onOpenChange={setLanguageSettingsOpen}
        targetLanguage={targetLanguage}
        onTargetLanguageChange={setTargetLanguage}
        autoDetectLanguage={autoDetectLanguage}
        onAutoDetectLanguageChange={setAutoDetectLanguage}
        culturalAdaptation={culturalAdaptation}
        onCulturalAdaptationChange={setCulturalAdaptation}
        localizedTone={localizedTone}
        onLocalizedToneChange={setLocalizedTone}
      />
    </div>
  );
}

export default EmailGeneratorPage;

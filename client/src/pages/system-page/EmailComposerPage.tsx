import { useState, useEffect, type FormEvent, type ReactElement, type ClipboardEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  DEFAULT_EMAIL_FORM_VALUES,
  EMAIL_PURPOSE_OPTIONS,
  EMAIL_REFINEMENT_OPTIONS,
  EMAIL_TONE_OPTIONS,
} from '../../config/watsonx';
import { useWatsonxEmailGenerator } from '../../hooks/useWatsonxEmailGenerator';
import type { EmailFormValues } from '../../utilities/system-utils/emailGenerator';
import { analyzeContentWithWatsonx } from '../../services/contentAnalysisService';

const DRAFT_STORAGE_KEY = 'email-composer-draft';
const DRAFT_TIMESTAMP_KEY = 'email-composer-draft-timestamp';

function EmailComposerPage(): ReactElement {
  const navigate = useNavigate();
  const [formValues, setFormValues] = useState<EmailFormValues>(() => {
    // Load draft from localStorage on initial render
    try {
      const savedDraft = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (savedDraft) {
        const parsed = JSON.parse(savedDraft) as EmailFormValues;
        const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
        
        // Show toast notification if draft was loaded
        if (timestamp) {
          const savedDate = new Date(timestamp);
          setTimeout(() => {
            toast.success(`📝 Draft restored from ${savedDate.toLocaleString()}`, { duration: 4000 });
          }, 500);
        }
        
        return parsed;
      }
    } catch (error) {
      console.error('Failed to load draft:', error);
    }
    return DEFAULT_EMAIL_FORM_VALUES;
  });
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(() => {
    const timestamp = localStorage.getItem(DRAFT_TIMESTAMP_KEY);
    return timestamp ? new Date(timestamp) : null;
  });
  
  const { error, generateDraft, loading, metadata, reset, result } =
    useWatsonxEmailGenerator();

  // Auto-save draft to localStorage whenever form values change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(formValues));
        const now = new Date();
        localStorage.setItem(DRAFT_TIMESTAMP_KEY, now.toISOString());
        setLastSaved(now);
      } catch (error) {
        console.error('Failed to save draft:', error);
      }
    }, 1000); // Debounce for 1 second

    return () => clearTimeout(timeoutId);
  }, [formValues]);

  const updateField = <TField extends keyof EmailFormValues>(
    field: TField,
    value: EmailFormValues[TField],
  ): void => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const clearDraft = (): void => {
    try {
      localStorage.removeItem(DRAFT_STORAGE_KEY);
      localStorage.removeItem(DRAFT_TIMESTAMP_KEY);
      setLastSaved(null);
      toast.success('Draft cleared');
    } catch (error) {
      console.error('Failed to clear draft:', error);
    }
  };

  const handleKeyPointsPaste = async (event: ClipboardEvent<HTMLTextAreaElement>): Promise<void> => {
    const pastedText = event.clipboardData.getData('text');
    
    if (pastedText.length < 50) {
      return; // Too short to analyze
    }

    setIsAnalyzing(true);
    toast.loading('🤖 Analyzing content with Watsonx AI...', { id: 'analyze' });
    
    try {
      const analysis = await analyzeContentWithWatsonx(pastedText);
      
      if (analysis && analysis.confidence >= 30) {
        // Auto-fill detected fields
        const updates: Partial<EmailFormValues> = {};
        let fieldsUpdated = 0;
        
        if (analysis.purpose) {
          updates.purpose = analysis.purpose;
          fieldsUpdated++;
        }
        
        if (analysis.tone) {
          updates.tone = analysis.tone;
          fieldsUpdated++;
        }
        
        // Always update job role if detected by AI
        if (analysis.jobRole) {
          updates.jobRole = analysis.jobRole;
          fieldsUpdated++;
        }
        
        // Always update company if detected by AI
        if (analysis.company) {
          updates.company = analysis.company;
          fieldsUpdated++;
        }
        
        // Only update extra instruction if field is empty
        if (analysis.extraInstruction && !formValues.extraInstruction.trim()) {
          updates.extraInstruction = analysis.extraInstruction;
          fieldsUpdated++;
        }
        
        if (analysis.refinement) {
          updates.refinement = analysis.refinement;
          fieldsUpdated++;
        }

        setFormValues((current) => ({
          ...current,
          ...updates,
        }));

        toast.success(
          `✨ Auto-filled ${fieldsUpdated} field${fieldsUpdated !== 1 ? 's' : ''} (${analysis.confidence}% confidence)`,
          { id: 'analyze', duration: 4000 }
        );
      } else {
        toast.error(
          'Could not analyze content with sufficient confidence. Try adding more details.',
          { id: 'analyze', duration: 3000 }
        );
      }
    } catch (error) {
      console.error('Content analysis failed:', error);
      toast.error(
        'Failed to analyze content. Please try again or fill fields manually.',
        { id: 'analyze', duration: 3000 }
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault();
    toast.loading('Generating email with Watsonx AI...', { id: 'generate' });
    
    try {
      await generateDraft(formValues);
      toast.success('Email generated successfully!', { id: 'generate' });
    } catch {
      toast.error('Failed to generate email', { id: 'generate' });
    }
  };

  const handleReset = (): void => {
    setFormValues(DEFAULT_EMAIL_FORM_VALUES);
    reset();
    clearDraft();
    toast.success('Form reset successfully');
  };

  const handleRegenerateEmail = async (): Promise<void> => {
    toast.loading('Regenerating email with Watsonx AI...', { id: 'regenerate' });
    
    try {
      await generateDraft(formValues);
      toast.success('Email regenerated successfully!', { id: 'regenerate' });
    } catch {
      toast.error('Failed to regenerate email', { id: 'regenerate' });
    }
  };

  const handleCopyEmail = async (): Promise<void> => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(`${result.subject}\n\n${result.body}`);
      toast.success('Email copied to clipboard!');
    } catch {
      toast.error('Failed to copy email');
    }
  };

  const handleCopyEmailBody = async (): Promise<void> => {
    if (!result) return;
    
    try {
      await navigator.clipboard.writeText(result.body);
      toast.success('Email body copied to clipboard!');
    } catch {
      toast.error('Failed to copy email body');
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-b from-slate-50 to-slate-100 px-4 py-10 text-slate-900 dark:from-slate-900 dark:to-slate-950 dark:text-slate-100 sm:px-6 lg:px-10 xl:px-12">
      <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-8 pb-16">
        <section className="overflow-hidden rounded-[32px] border border-cyan-400/20 bg-white/80 shadow-[0_20px_70px_rgba(0,0,0,0.1)] backdrop-blur dark:bg-slate-950/70 dark:shadow-[0_30px_80px_rgba(7,14,26,0.45)]">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.3fr_0.9fr] lg:px-10 lg:py-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-emerald-700 dark:text-emerald-100">
                ✓ IBM watsonx AI Connected
              </div>

              <div className="space-y-4">
                <h1 className="max-w-3xl font-['IBM_Plex_Sans','Segoe_UI',sans-serif] text-4xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
                  Smart Email Composer powered by IBM Watsonx AI
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-slate-600 dark:text-slate-300 sm:text-base">
                  Generate professional emails using IBM's Granite AI model. Validates inputs, crafts 
                  personalized content, and delivers polished drafts in seconds—perfect for job applications 
                  and business communications.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/8">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Step 1</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Smart Validation</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Define purpose, tone, role, and key points. All inputs validated before AI processing.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/8">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Step 2</p>
                  <h2 className="mt-3 text-lg font-medium text-white">AI Generation</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Granite model analyzes requirements and generates professional email tailored to your needs.
                  </p>
                </article>
                <article className="rounded-2xl border border-white/10 bg-white/5 p-4 transition hover:border-cyan-400/30 hover:bg-white/8">
                  <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Step 3</p>
                  <h2 className="mt-3 text-lg font-medium text-white">Polished Output</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">
                    Complete email with subject and body, ready to send. Includes full metadata transparency.
                  </p>
                </article>
              </div>
            </div>

            <aside className="rounded-[28px] border border-emerald-300/20 bg-emerald-300/8 p-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-400/20">
                  <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-xs uppercase tracking-[0.25em] text-emerald-200">
                  System Status
                </p>
              </div>
              
              <div className="mt-4 space-y-2.5 text-sm leading-6 text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Watsonx Connected</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Granite 3.8B Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  <span>Region: US-South</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-cyan-300/15 bg-cyan-300/5 p-4 text-xs leading-6 text-slate-300">
                <p className="font-medium text-cyan-200">🤖 Watsonx AI Auto-Fill</p>
                <p className="mt-2">
                  Paste your content into "Key message points" and Watsonx AI will intelligently analyze 
                  and auto-fill Purpose, Tone, Job Role, Company, and other fields with high accuracy.
                </p>
              </div>

              <div className="mt-3 rounded-2xl border border-white/10 bg-slate-900/60 p-4 text-xs leading-6 text-slate-300">
                <p className="font-medium text-white">💡 Quick Tip</p>
                <p className="mt-2">
                  Click the email body to copy it instantly. Customize any auto-filled fields before generating.
                </p>
              </div>
            </aside>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <form
            className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(3,8,20,0.45)] backdrop-blur sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Input layer</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">Watsonx email test form</h2>
                {lastSaved && (
                  <p className="mt-2 text-xs text-slate-400">
                    💾 Draft auto-saved at {lastSaved.toLocaleTimeString()}
                  </p>
                )}
              </div>
              <button
                className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/30 hover:text-white"
                onClick={handleReset}
                type="button"
              >
                Reset
              </button>
            </div>

            <div className="mt-8 grid gap-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Purpose</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    onChange={(event) => updateField('purpose', event.target.value as EmailFormValues['purpose'])}
                    value={formValues.purpose}
                  >
                    {EMAIL_PURPOSE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-slate-400">
                    {
                      EMAIL_PURPOSE_OPTIONS.find((option) => option.value === formValues.purpose)
                        ?.description
                    }
                  </p>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Tone</span>
                  <select
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                    onChange={(event) => updateField('tone', event.target.value as EmailFormValues['tone'])}
                    value={formValues.tone}
                  >
                    {EMAIL_TONE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs leading-5 text-slate-400">
                    {EMAIL_TONE_OPTIONS.find((option) => option.value === formValues.tone)?.description}
                  </p>
                </label>
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Job role</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                    onChange={(event) => updateField('jobRole', event.target.value)}
                    placeholder="e.g., Data Analyst, Software Engineer, Product Manager"
                    type="text"
                    value={formValues.jobRole}
                  />
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-medium text-slate-200">Company</span>
                  <input
                    className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                    onChange={(event) => updateField('company', event.target.value)}
                    placeholder="e.g., IBM, Google, Microsoft"
                    type="text"
                    value={formValues.company}
                  />
                </label>
              </div>

              <label className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-200">Key message points</span>
                  {isAnalyzing && (
                    <span className="text-xs text-cyan-300 animate-pulse">🤖 Analyzing...</span>
                  )}
                </div>
                <textarea
                  className="min-h-40 w-full rounded-[24px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                  onChange={(event) => updateField('keyPoints', event.target.value)}
                  onPaste={handleKeyPointsPaste}
                  placeholder="Paste job description, your notes, or key points here. Watsonx AI will auto-detect and fill other fields for you!"
                  value={formValues.keyPoints}
                />
                <p className="text-xs leading-5 text-slate-400">
                  💡 Paste any text (job description, email draft, notes) and Watsonx AI will intelligently analyze and auto-fill Purpose, Tone, Role, Company, and more.
                </p>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Extra AI instruction</span>
                <textarea
                  className="min-h-28 w-full rounded-[24px] border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
                  onChange={(event) => updateField('extraInstruction', event.target.value)}
                  placeholder="Example: Avoid sounding too robotic. Mention teamwork and willingness to learn."
                  value={formValues.extraInstruction}
                />
                <p className="text-xs leading-5 text-slate-400">
                  This becomes an extra prompt instruction sent to Watsonx.
                </p>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-medium text-slate-200">Optional refinement</span>
                <select
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
                  onChange={(event) =>
                    updateField('refinement', event.target.value as EmailFormValues['refinement'])
                  }
                  value={formValues.refinement}
                >
                  {EMAIL_REFINEMENT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <p className="text-xs leading-5 text-slate-400">
                  {
                    EMAIL_REFINEMENT_OPTIONS.find(
                      (option) => option.value === formValues.refinement,
                    )?.description
                  }
                </p>
              </label>

              {error ? (
                <div className="rounded-2xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {error}
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <button
                  className="inline-flex items-center justify-center rounded-full bg-cyan-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-cyan-300/40"
                  disabled={loading}
                  type="submit"
                >
                  {loading ? 'Talking to watsonx...' : 'Generate test email'}
                </button>
              </div>
            </div>
          </form>

          <section className="rounded-[28px] border border-white/10 bg-slate-950/70 p-6 shadow-[0_20px_70px_rgba(3,8,20,0.45)] backdrop-blur sm:p-8">
            <p className="text-xs uppercase tracking-[0.25em] text-cyan-200">Output layer</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Generated email preview</h2>

            {result ? (
              <div className="mt-8 space-y-6">
                <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Subject Line</p>
                  <p className="mt-2 text-lg font-medium text-white">{result.subject}</p>
                </article>

                <article className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                  <div className="flex items-center justify-between">
                    <p className="text-xs uppercase tracking-[0.22em] text-slate-400">Email Body</p>
                    <p className="text-xs text-cyan-300">Click to copy</p>
                  </div>
                  <div 
                    className="mt-3 max-h-96 cursor-pointer overflow-y-auto rounded-xl border border-white/5 bg-slate-900/40 p-4 transition hover:border-cyan-300/30 hover:bg-slate-900/60"
                    onClick={handleCopyEmailBody}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleCopyEmailBody();
                      }
                    }}
                  >
                    <p className="whitespace-pre-wrap text-sm leading-7 text-slate-200">
                      {result.body}
                    </p>
                  </div>
                </article>

                {metadata ? (
                  <article className="rounded-[24px] border border-emerald-300/20 bg-emerald-300/8 p-5">
                    <p className="text-xs uppercase tracking-[0.22em] text-emerald-200">
                      Generation Metadata
                    </p>
                    <div className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-emerald-200">Model:</span>
                        <span>{metadata.modelId}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-emerald-200">Region:</span>
                        <span>{metadata.region}</span>
                      </div>
                      <details className="mt-3 rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                        <summary className="cursor-pointer font-medium text-slate-100 hover:text-cyan-200">
                          View Prompt Sent to Watsonx
                        </summary>
                        <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-white/5 bg-slate-900/60 p-3">
                          <pre className="whitespace-pre-wrap text-xs leading-6 text-slate-300">
                            {metadata.prompt}
                          </pre>
                        </div>
                      </details>
                    </div>
                  </article>
                ) : null}

                <div className="flex flex-wrap gap-3">
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-cyan-300/30 bg-cyan-300/10 px-5 py-2.5 text-sm font-medium text-cyan-100 transition hover:border-cyan-300/50 hover:bg-cyan-300/20"
                    onClick={handleCopyEmail}
                    type="button"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Full Email
                  </button>
                  <button
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm font-medium text-slate-200 transition hover:border-white/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                    onClick={handleRegenerateEmail}
                    type="button"
                    disabled={loading}
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    {loading ? 'Regenerating...' : 'Generate Another'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="mt-8 space-y-4 rounded-[24px] border border-dashed border-white/15 bg-white/3 p-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-cyan-400/10">
                  <svg className="h-8 w-8 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="space-y-2">
                  <p className="text-base font-medium text-white">
                    Ready to generate your email
                  </p>
                  <p className="text-sm leading-7 text-slate-300">
                    Fill out the form and click "Generate test email" to create your 
                    AI-powered email draft. The generated content will appear here.
                  </p>
                </div>
              </div>
            )}
          </section>
        </section>
      </div>
    </main>
  );
}

export default EmailComposerPage;

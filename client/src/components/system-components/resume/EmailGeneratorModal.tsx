import { type ReactElement, useState } from 'react';
import { generateApplicationEmail } from '../../../services/resumeService';
import type { ApplicationEmailResponse } from '../../../types/resume.types';

interface EmailGeneratorModalProps {
  resumeContent: string;
  jobDescription: string;
  onClose: () => void;
}

type EmailTone = 'formal' | 'confident' | 'neutral' | 'enthusiastic';
type EmailType = 'application' | 'follow-up' | 'thank-you';

function EmailGeneratorModal({
  resumeContent,
  jobDescription,
  onClose,
}: EmailGeneratorModalProps): ReactElement {
  const [tone, setTone] = useState<EmailTone>('professional' as EmailTone);
  const [emailType, setEmailType] = useState<EmailType>('application');
  const [additionalContext, setAdditionalContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState<ApplicationEmailResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateApplicationEmail({
        resumeContent,
        jobDescription,
        tone,
        emailType,
        additionalContext,
      });
      setGeneratedEmail(response);
    } catch (err) {
      // Fallback to basic email generation
      const fallbackEmail: ApplicationEmailResponse = {
        subject: `Application for ${emailType === 'application' ? 'Position' : 'Follow-up'}`,
        body: generateFallbackEmail(emailType, tone),
        suggestions: [
          'Personalize the greeting with the hiring manager\'s name',
          'Add specific examples from your experience',
          'Proofread before sending',
        ],
      };
      setGeneratedEmail(fallbackEmail);
    } finally {
      setLoading(false);
    }
  };

  const generateFallbackEmail = (type: EmailType, emailTone: EmailTone): string => {
    const greetings = {
      formal: 'Dear Hiring Manager,',
      confident: 'Hello,',
      neutral: 'Dear Hiring Team,',
      enthusiastic: 'Hi there!',
    };

    const closings = {
      formal: 'Sincerely,\n[Your Name]',
      confident: 'Best regards,\n[Your Name]',
      neutral: 'Thank you,\n[Your Name]',
      enthusiastic: 'Looking forward to hearing from you!\n[Your Name]',
    };

    const bodies = {
      application: `I am writing to express my strong interest in the position at your company. With my background and skills, I believe I would be a valuable addition to your team.

My experience aligns well with the requirements outlined in the job description, and I am excited about the opportunity to contribute to your organization's success.

I have attached my resume for your review. I would welcome the opportunity to discuss how my qualifications match your needs.`,
      'follow-up': `I wanted to follow up on my application for the position I submitted last week. I remain very interested in this opportunity and wanted to reiterate my enthusiasm for joining your team.

If you need any additional information or would like to schedule an interview, please don't hesitate to reach out.`,
      'thank-you': `Thank you for taking the time to meet with me regarding the position. I enjoyed our conversation and learning more about the role and your team.

I am very excited about the opportunity and believe my skills and experience would be a great fit. Please let me know if you need any additional information from me.`,
    };

    return `${greetings[emailTone]}\n\n${bodies[type]}\n\n${closings[emailTone]}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[24px] border border-white/10 bg-slate-950 shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 backdrop-blur px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-400/10">
                <svg className="h-5 w-5 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Generate Application Email</h2>
                <p className="text-sm text-slate-400">AI-powered email composer</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Error Display */}
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4">
              <p className="text-sm text-red-200">{error}</p>
            </div>
          )}

          {!generatedEmail ? (
            <>
              {/* Email Type */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Email Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['application', 'follow-up', 'thank-you'] as EmailType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setEmailType(type)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        emailType === type
                          ? 'border-emerald-400/50 bg-emerald-400/20 text-emerald-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                      type="button"
                    >
                      {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Tone</label>
                <div className="grid grid-cols-2 gap-2">
                  {(['formal', 'confident', 'neutral', 'enthusiastic'] as EmailTone[]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTone(t)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                        tone === t
                          ? 'border-purple-400/50 bg-purple-400/20 text-purple-100'
                          : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                      }`}
                      type="button"
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Context */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-white">Additional Context (Optional)</label>
                <textarea
                  value={additionalContext}
                  onChange={(e) => setAdditionalContext(e.target.value)}
                  placeholder="Add any specific details you want to include in the email..."
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-slate-500 focus:border-emerald-400/50 focus:outline-none focus:ring-2 focus:ring-emerald-400/20"
                  rows={4}
                />
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-950 border-t-transparent"></div>
                    Generating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Generate Email
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              {/* Generated Email */}
              <div className="space-y-4">
                {/* Subject */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Subject</label>
                  <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                    <p className="text-sm text-white">{generatedEmail.subject}</p>
                  </div>
                </div>

                {/* Body */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-white">Email Body</label>
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 max-h-[400px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm text-emerald-100 font-sans">
                      {generatedEmail.body}
                    </pre>
                  </div>
                </div>

                {/* Suggestions */}
                {generatedEmail.suggestions.length > 0 && (
                  <div className="rounded-xl border border-cyan-400/30 bg-cyan-400/10 p-4">
                    <h3 className="text-sm font-semibold text-cyan-100 mb-2">Tips</h3>
                    <ul className="space-y-1">
                      {generatedEmail.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm text-cyan-200/80">
                          <svg className="h-4 w-4 shrink-0 text-cyan-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`Subject: ${generatedEmail.subject}\n\n${generatedEmail.body}`);
                    }}
                    className="flex-1 rounded-xl bg-emerald-400 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-300"
                    type="button"
                  >
                    <span className="flex items-center justify-center gap-2">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      Copy Email
                    </span>
                  </button>

                  <button
                    onClick={() => setGeneratedEmail(null)}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-white/10"
                    type="button"
                  >
                    Generate New
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailGeneratorModal;

import type {
  EmailFormValues,
  EmailPurpose,
  EmailTone,
  RefinementOption,
} from '../utilities/system-utils/emailGenerator';

export const WATSONX_TEST_ENDPOINT = '/api/watsonx/test';

interface SelectOption<TValue extends string> {
  description: string;
  label: string;
  value: TValue;
}

export const EMAIL_PURPOSE_OPTIONS: SelectOption<EmailPurpose>[] = [
  {
    value: 'job-application',
    label: 'Job Application',
    description: 'Draft a job application email with strong opening context.',
  },
  {
    value: 'follow-up',
    label: 'Follow-up',
    description: 'Draft a polite follow-up after sending an application.',
  },
  {
    value: 'thank-you',
    label: 'Thank You',
    description: 'Express gratitude after an interview or conversation.',
  },
  {
    value: 'networking',
    label: 'Networking',
    description: 'Reach out to connect with professionals in your field.',
  },
  {
    value: 'inquiry',
    label: 'Inquiry',
    description: 'Draft an exploratory email asking about a role or opportunity.',
  },
];

export const EMAIL_TONE_OPTIONS: SelectOption<EmailTone>[] = [
  {
    value: 'formal',
    label: 'Formal',
    description: 'Careful and polished language for traditional professional settings.',
  },
  {
    value: 'professional',
    label: 'Professional',
    description: 'Balanced and polished tone suitable for most business contexts.',
  },
  {
    value: 'friendly',
    label: 'Friendly',
    description: 'Warm and conversational while maintaining professionalism.',
  },
  {
    value: 'enthusiastic',
    label: 'Enthusiastic',
    description: 'Energetic and passionate tone showing genuine excitement.',
  },
];

export const EMAIL_REFINEMENT_OPTIONS: SelectOption<RefinementOption>[] = [
  {
    value: 'none',
    label: 'No refinement',
    description: 'Generate the first clean draft only.',
  },
  {
    value: 'shorter',
    label: 'Make it shorter',
    description: 'Keep the message concise and easy to scan.',
  },
  {
    value: 'longer',
    label: 'Make it longer',
    description: 'Expand with more details and context.',
  },
  {
    value: 'more-formal',
    label: 'More formal',
    description: 'Polish the wording to sound more formal and executive.',
  },
  {
    value: 'more-casual',
    label: 'More casual',
    description: 'Make the tone more relaxed and conversational.',
  },
];

export const DEFAULT_EMAIL_FORM_VALUES: EmailFormValues = {
  purpose: 'job-application',
  tone: 'professional',
  refinement: 'none',
  contextMessage: '',
  yourMessage: '',
  recipientInfo: '',
  extraInstruction: '',
  // Multi-language defaults
  targetLanguage: 'en',
  autoDetectLanguage: true,
  culturalAdaptation: true,
  localizedTone: undefined,
};

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
    value: 'application',
    label: 'Application',
    description: 'Draft a job application email with strong opening context.',
  },
  {
    value: 'follow-up',
    label: 'Follow-up',
    description: 'Draft a polite follow-up after sending an application.',
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
    description: 'Careful and polished language for a traditional recruiter flow.',
  },
  {
    value: 'confident',
    label: 'Confident',
    description: 'Direct and assertive while staying professional.',
  },
  {
    value: 'casual',
    label: 'Casual',
    description: 'More relaxed wording for warm, human outreach.',
  },
];

export const EMAIL_REFINEMENT_OPTIONS: SelectOption<RefinementOption>[] = [
  {
    value: 'none',
    label: 'No extra refinement',
    description: 'Generate the first clean draft only.',
  },
  {
    value: 'shorten',
    label: 'Shorten',
    description: 'Keep the message tighter and easier to scan.',
  },
  {
    value: 'professional',
    label: 'More professional',
    description: 'Make the wording more polished and executive.',
  },
  {
    value: 'confident',
    label: 'More confident',
    description: 'Make the message sound more decisive and impact-focused.',
  },
];

export const DEFAULT_EMAIL_FORM_VALUES: EmailFormValues = {
  purpose: 'application',
  tone: 'formal',
  refinement: 'none',
  jobRole: 'Frontend Developer Intern',
  company: 'IBM',
  extraInstruction:
    'Keep it honest, polished, and suitable for a first contact with a recruiter.',
  keyPoints:
    'I am applying for the role and I have React + TypeScript experience.\nI built responsive projects and enjoy solving UX problems.\nI would like to contribute to an AI-focused team.',
};

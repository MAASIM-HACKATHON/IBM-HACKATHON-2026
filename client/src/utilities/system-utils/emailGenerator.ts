export type EmailPurpose = 'application' | 'follow-up' | 'inquiry';
export type EmailTone = 'formal' | 'casual' | 'confident';
export type RefinementOption = 'none' | 'shorten' | 'professional' | 'confident';

export interface EmailFormValues {
  company: string;
  extraInstruction: string;
  jobRole: string;
  keyPoints: string;
  purpose: EmailPurpose;
  refinement: RefinementOption;
  tone: EmailTone;
}

export interface GeneratedEmailDraft {
  body: string;
  rawText: string;
  subject: string;
}

const PURPOSE_LABELS: Record<EmailPurpose, string> = {
  application: 'Job application',
  'follow-up': 'Application follow-up',
  inquiry: 'Opportunity inquiry',
};

const TONE_INSTRUCTIONS: Record<EmailTone, string> = {
  formal: 'formal, respectful, and recruiter-friendly',
  casual: 'warm, conversational, and still professional',
  confident: 'confident, clear, and results-oriented',
};

const REFINEMENT_INSTRUCTIONS: Record<RefinementOption, string> = {
  none: 'No additional refinement is needed beyond a clean first draft.',
  shorten: 'Keep the email concise and easy to scan in under 180 words.',
  professional: 'Polish the language so it sounds more professional and executive-ready.',
  confident: 'Strengthen the confidence level while keeping the tone respectful.',
};

export function normalizeKeyPoints(keyPoints: string): string[] {
  return keyPoints
    .split(/\r?\n|;/)
    .map((point) => point.trim().replace(/^[\-\u2022*]\s*/, ''))
    .filter(Boolean);
}

export function validateEmailInput(values: EmailFormValues): string[] {
  const issues: string[] = [];

  if (values.jobRole.trim().length < 3) {
    issues.push('Add a clearer target job role before generating.');
  }

  if (values.company.trim().length < 2) {
    issues.push('Add the target company name before generating.');
  }

  if (normalizeKeyPoints(values.keyPoints).length === 0) {
    issues.push('Add at least one key message point so the AI has context.');
  }

  return issues;
}

function getTemplateSections(purpose: EmailPurpose): string[] {
  if (purpose === 'application') {
    return [
      'Greeting',
      'Opening that states the role and intent to apply',
      'Body that highlights 2 to 3 relevant strengths',
      'Closing with gratitude and interest in next steps',
    ];
  }

  if (purpose === 'follow-up') {
    return [
      'Greeting',
      'Opening that references a previous application or conversation',
      'Body that reaffirms fit and continued interest',
      'Closing that politely asks for an update',
    ];
  }

  return [
    'Greeting',
    'Opening that introduces the candidate and purpose of inquiry',
    'Body that asks about role fit or opportunities while showing value',
    'Closing that invites a response or connection',
  ];
}

export function buildEmailPrompt(values: EmailFormValues): string {
  const keyPoints = normalizeKeyPoints(values.keyPoints);
  const sections = getTemplateSections(values.purpose);
  const extraInstruction = values.extraInstruction.trim();

  return [
    'You are assisting with a lightweight career email generator.',
    'Write a realistic email draft for a job seeker.',
    `Purpose: ${PURPOSE_LABELS[values.purpose]}.`,
    `Tone instruction: Use a ${TONE_INSTRUCTIONS[values.tone]} tone.`,
    `Target role: ${values.jobRole.trim()}.`,
    `Target company: ${values.company.trim()}.`,
    'Key message points to incorporate:',
    ...keyPoints.map((point, index) => `${index + 1}. ${point}`),
    'Use this structure:',
    ...sections.map((section, index) => `${index + 1}. ${section}`),
    `Refinement request: ${REFINEMENT_INSTRUCTIONS[values.refinement]}`,
    ...(extraInstruction
      ? [`Additional instruction from the app user: ${extraInstruction}`]
      : []),
    'Keep the content grounded and avoid exaggerated claims.',
    'Return exactly this format and nothing else:',
    'SUBJECT: <subject line>',
    'BODY:',
    '<email body>',
  ].join('\n');
}

function buildFallbackSubject(values: EmailFormValues): string {
  const purpose = PURPOSE_LABELS[values.purpose];
  return `${purpose}: ${values.jobRole.trim()} at ${values.company.trim()}`;
}

function cleanEmailBody(body: string): string {
  return body
    .replace(/\r/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function extractEmailDraft(
  responseText: string,
  values: EmailFormValues,
): GeneratedEmailDraft {
  const rawText = responseText.trim();
  const subjectMatch = rawText.match(/SUBJECT:\s*(.+)/i);
  const bodyMatch = rawText.match(/BODY:\s*([\s\S]+)/i);

  const subject = subjectMatch?.[1]?.trim() || buildFallbackSubject(values);
  const bodySource = bodyMatch?.[1]?.trim() || rawText;
  const body = cleanEmailBody(bodySource);

  return {
    subject,
    body,
    rawText,
  };
}

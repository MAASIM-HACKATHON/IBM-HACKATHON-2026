import type { SupportedLanguage, CulturalContext } from '../../types/language.types';
import { getCulturalContext } from '../../config/languages';

export type EmailPurpose = 'job-application' | 'follow-up' | 'thank-you' | 'networking' | 'inquiry';
export type EmailTone = 'formal' | 'professional' | 'friendly' | 'enthusiastic';
export type RefinementOption = 'none' | 'shorter' | 'longer' | 'more-formal' | 'more-casual';

export interface EmailFormValues {
  company: string;
  extraInstruction: string;
  jobRole: string;
  keyPoints: string;
  purpose: EmailPurpose;
  refinement: RefinementOption;
  tone: EmailTone;
  // Multi-language support
  targetLanguage?: SupportedLanguage;
  autoDetectLanguage?: boolean;
  culturalAdaptation?: boolean;
  localizedTone?: string;
}

export interface GeneratedEmailDraft {
  body: string;
  rawText: string;
  subject: string;
}

const PURPOSE_LABELS: Record<EmailPurpose, string> = {
  'job-application': 'Job application',
  'follow-up': 'Application follow-up',
  'thank-you': 'Thank you email',
  'networking': 'Networking outreach',
  'inquiry': 'Opportunity inquiry',
};

const TONE_INSTRUCTIONS: Record<EmailTone, string> = {
  formal: 'formal, respectful, and recruiter-friendly',
  professional: 'professional, balanced, and polished',
  friendly: 'warm, conversational, and still professional',
  enthusiastic: 'enthusiastic, energetic, and passionate',
};

const REFINEMENT_INSTRUCTIONS: Record<RefinementOption, string> = {
  none: 'No additional refinement is needed beyond a clean first draft.',
  shorter: 'Keep the email concise and easy to scan, under 150 words.',
  longer: 'Expand the content with more details and context, around 250-300 words.',
  'more-formal': 'Polish the language to sound more formal and executive-ready.',
  'more-casual': 'Make the tone more relaxed and conversational while staying professional.',
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
  if (purpose === 'job-application') {
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

  if (purpose === 'thank-you') {
    return [
      'Greeting',
      'Opening that expresses gratitude for the opportunity or conversation',
      'Body that reinforces interest and highlights key takeaways',
      'Closing that looks forward to next steps',
    ];
  }

  if (purpose === 'networking') {
    return [
      'Greeting',
      'Opening that introduces yourself and explains the connection request',
      'Body that shows genuine interest and offers value',
      'Closing that suggests a specific next step (coffee, call, etc.)',
    ];
  }

  return [
    'Greeting',
    'Opening that introduces the candidate and purpose of inquiry',
    'Body that asks about role fit or opportunities while showing value',
    'Closing that invites a response or connection',
  ];
}

/**
 * Build cultural adaptation instructions based on target language
 */
function buildCulturalInstructions(
  language: SupportedLanguage,
  culturalContext: CulturalContext,
  localizedTone?: string
): string[] {
  const instructions: string[] = [];
  
  if (language !== 'en') {
    instructions.push(`IMPORTANT: Generate the email in ${getLanguageDisplayName(language)}.`);
    instructions.push('This is not a translation - write naturally in the target language.');
  }
  
  if (culturalContext.honorificsRequired) {
    instructions.push('Use appropriate honorifics and formal address as culturally expected.');
  }
  
  if (culturalContext.greetingStyle === 'hierarchical') {
    instructions.push('Use hierarchical greeting style showing proper respect for business relationships.');
  } else if (culturalContext.greetingStyle === 'indirect') {
    instructions.push('Use indirect greeting style with appropriate formality.');
  }
  
  if (culturalContext.lengthPreference === 'concise') {
    instructions.push('Keep the email concise and to the point, as preferred in this culture.');
  } else if (culturalContext.lengthPreference === 'detailed') {
    instructions.push('Provide appropriate detail and context, as expected in this culture.');
  }
  
  if (culturalContext.directnessLevel === 'indirect') {
    instructions.push('Use indirect communication style, avoiding overly direct statements.');
  } else if (culturalContext.directnessLevel === 'very-direct') {
    instructions.push('Use direct and clear communication style, as culturally appropriate.');
  }
  
  if (localizedTone) {
    instructions.push(`Apply the localized tone: ${localizedTone}`);
  }
  
  return instructions;
}

/**
 * Get display name for language
 */
function getLanguageDisplayName(language: SupportedLanguage): string {
  const names: Record<SupportedLanguage, string> = {
    'en': 'English',
    'es': 'Spanish (Español)',
    'fr': 'French (Français)',
    'de': 'German (Deutsch)',
    'it': 'Italian (Italiano)',
    'pt': 'Portuguese (Português)',
    'nl': 'Dutch (Nederlands)',
    'pl': 'Polish (Polski)',
    'ru': 'Russian (Русский)',
    'ja': 'Japanese (日本語)',
    'ko': 'Korean (한국어)',
    'zh-CN': 'Simplified Chinese (简体中文)',
    'zh-TW': 'Traditional Chinese (繁體中文)',
    'ar': 'Arabic (العربية)',
    'hi': 'Hindi (हिन्दी)',
    'tr': 'Turkish (Türkçe)',
    'sv': 'Swedish (Svenska)',
    'da': 'Danish (Dansk)',
    'no': 'Norwegian (Norsk)',
    'fi': 'Finnish (Suomi)',
    'cs': 'Czech (Čeština)',
    'el': 'Greek (Ελληνικά)',
    'he': 'Hebrew (עברית)',
    'th': 'Thai (ไทย)',
    'vi': 'Vietnamese (Tiếng Việt)',
    'fil': 'Filipino',
  };
  return names[language] || language;
}

export function buildEmailPrompt(values: EmailFormValues): string {
  const keyPoints = normalizeKeyPoints(values.keyPoints);
  const sections = getTemplateSections(values.purpose);
  const extraInstruction = values.extraInstruction.trim();
  
  // Multi-language support
  const targetLanguage = values.targetLanguage || 'en';
  const culturalAdaptation = values.culturalAdaptation !== false;
  const culturalContext = getCulturalContext(targetLanguage);
  
  const baseInstructions = [
    'You are assisting with a lightweight career email generator.',
    'Write a realistic email draft for a job seeker.',
    `Purpose: ${PURPOSE_LABELS[values.purpose]}.`,
    `Tone instruction: Use a ${TONE_INSTRUCTIONS[values.tone]} tone.`,
    `Target role: ${values.jobRole.trim()}.`,
    `Target company: ${values.company.trim()}.`,
  ];
  
  // Add cultural adaptation instructions
  const culturalInstructions = culturalAdaptation
    ? buildCulturalInstructions(targetLanguage, culturalContext, values.localizedTone)
    : [];
  
  const contentInstructions = [
    'Key message points to incorporate:',
    ...keyPoints.map((point, index) => `${index + 1}. ${point}`),
    'Use this structure:',
    ...sections.map((section, index) => `${index + 1}. ${section}`),
    `Refinement request: ${REFINEMENT_INSTRUCTIONS[values.refinement]}`,
    ...(extraInstruction
      ? [`Additional instruction from the app user: ${extraInstruction}`]
      : []),
    'Keep the content grounded and avoid exaggerated claims.',
  ];
  
  const formatInstructions = [
    'Return exactly this format and nothing else:',
    'SUBJECT: <subject line>',
    'BODY:',
    '<email body>',
  ];

  return [
    ...baseInstructions,
    ...culturalInstructions,
    ...contentInstructions,
    ...formatInstructions,
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

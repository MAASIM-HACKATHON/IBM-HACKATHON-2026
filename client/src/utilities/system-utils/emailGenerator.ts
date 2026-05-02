import type { SupportedLanguage, CulturalContext } from '../../types/language.types';
import { getCulturalContext } from '../../config/languages';

export type EmailPurpose = 'job-application' | 'follow-up' | 'thank-you' | 'networking' | 'inquiry';
export type EmailTone = 'formal' | 'professional' | 'friendly' | 'enthusiastic';
export type RefinementOption = 'none' | 'shorter' | 'longer' | 'more-formal' | 'more-casual';

export interface EmailFormValues {
  // Core fields
  purpose: EmailPurpose;
  tone: EmailTone;
  refinement: RefinementOption;
  
  // Generalized universal fields
  contextMessage: string;       // Previous email, job description, event details, etc.
  yourMessage: string;          // What user wants to communicate (rough draft)
  recipientInfo: string;        // Name, company, or any relevant details
  extraInstruction: string;     // Additional AI instructions
  
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

  // Universal validation - what user wants to say is always required
  if (values.yourMessage.trim().length < 10) {
    issues.push('Please describe what you want to say (at least 10 characters).');
  }

  // Context validation based on purpose
  if (values.purpose === 'follow-up' && values.contextMessage.trim().length === 0) {
    issues.push('For follow-ups, please provide the previous message or conversation context.');
  }

  // Helpful warnings (not blocking)
  if (values.contextMessage.trim().length === 0 && values.purpose === 'job-application') {
    // Context is helpful for job applications but not strictly required
    console.warn('Job description context would improve the email quality');
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

/**
 * Get purpose-specific AI guidance (not rigid templates)
 */
function getPurposeGuidance(purpose: EmailPurpose): string[] {
  const guidance: Record<EmailPurpose, string[]> = {
    'job-application': [
      'Structure: Greeting → Express interest in role → Highlight relevant qualifications → Close with call to action',
      'Keep professional and enthusiastic',
      'Show genuine interest in the company and role'
    ],
    'follow-up': [
      'Reference the previous communication naturally',
      'Be polite and respectful of their time',
      'Reaffirm interest without being pushy',
      'Keep it brief and to the point'
    ],
    'thank-you': [
      'Express genuine gratitude',
      'Reference specific points from the conversation',
      'Reinforce interest in next steps',
      'Keep it warm but professional'
    ],
    'networking': [
      'Be friendly but professional',
      'Show genuine interest in connecting',
      'Explain why you\'re reaching out',
      'Suggest a specific next step (call, coffee, etc.)'
    ],
    'inquiry': [
      'Be clear about what you\'re asking',
      'Provide relevant background briefly',
      'Make it easy for them to respond',
      'Show respect for their time'
    ]
  };
  
  return guidance[purpose] || [];
}

export function buildEmailPrompt(values: EmailFormValues): string {
  const extraInstruction = values.extraInstruction.trim();
  
  // Multi-language support
  const targetLanguage = values.targetLanguage || 'en';
  const culturalAdaptation = values.culturalAdaptation !== false;
  const culturalContext = getCulturalContext(targetLanguage);
  
  const baseInstructions = [
    'You are an AI email assistant that helps users write professional emails.',
    `Purpose: ${PURPOSE_LABELS[values.purpose]}`,
    `Tone: Use a ${TONE_INSTRUCTIONS[values.tone]} tone.`,
  ];
  
  // Add context if provided
  const contextInstructions: string[] = [];
  if (values.contextMessage.trim()) {
    contextInstructions.push(
      'Context/Background:',
      values.contextMessage.trim()
    );
  }
  
  // Add recipient info if provided
  if (values.recipientInfo.trim()) {
    contextInstructions.push(
      'Recipient Information:',
      values.recipientInfo.trim()
    );
  }
  
  // User's message (core content)
  const userMessageInstructions = [
    'User wants to communicate:',
    values.yourMessage.trim()
  ];
  
  // Purpose-specific guidance
  const purposeInstructions = [
    'Guidelines for this email type:',
    ...getPurposeGuidance(values.purpose)
  ];
  
  // Add cultural adaptation instructions
  const culturalInstructions = culturalAdaptation
    ? buildCulturalInstructions(targetLanguage, culturalContext, values.localizedTone)
    : [];
  
  // Refinement and extra instructions
  const refinementInstructions = [
    `Refinement: ${REFINEMENT_INSTRUCTIONS[values.refinement]}`,
    ...(extraInstruction ? [`Additional requirements: ${extraInstruction}`] : []),
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
    ...contextInstructions,
    ...userMessageInstructions,
    ...purposeInstructions,
    ...culturalInstructions,
    ...refinementInstructions,
    ...formatInstructions,
  ].join('\n');
}

function buildFallbackSubject(values: EmailFormValues): string {
  const purpose = PURPOSE_LABELS[values.purpose];
  
  // Try to extract key info from recipient info or context
  const recipientInfo = values.recipientInfo.trim();
  
  if (recipientInfo) {
    return `${purpose} - ${recipientInfo}`;
  }
  
  // Generic fallback
  return `${purpose}`;
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

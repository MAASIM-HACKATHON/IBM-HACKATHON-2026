/**
 * Multi-Language Support Types
 * Defines language options, cultural adaptations, and localized tone mappings
 */

export type SupportedLanguage =
  | 'en' // English
  | 'es' // Spanish
  | 'fr' // French
  | 'de' // German
  | 'it' // Italian
  | 'pt' // Portuguese
  | 'nl' // Dutch
  | 'pl' // Polish
  | 'ru' // Russian
  | 'ja' // Japanese
  | 'ko' // Korean
  | 'zh-CN' // Chinese (Simplified)
  | 'zh-TW' // Chinese (Traditional)
  | 'ar' // Arabic
  | 'hi' // Hindi
  | 'tr' // Turkish
  | 'sv' // Swedish
  | 'da' // Danish
  | 'no' // Norwegian
  | 'fi' // Finnish
  | 'cs' // Czech
  | 'el' // Greek
  | 'he' // Hebrew
  | 'th' // Thai
  | 'vi' // Vietnamese
  | 'fil'; // Filipino

export interface LanguageOption {
  code: SupportedLanguage;
  name: string;
  nativeName: string;
  flag: string;
  rtl?: boolean; // Right-to-left languages
}

export interface CulturalContext {
  formalityLevel: 'very-formal' | 'formal' | 'neutral' | 'casual';
  greetingStyle: 'direct' | 'indirect' | 'hierarchical';
  closingStyle: 'warm' | 'professional' | 'formal';
  honorificsRequired: boolean;
  lengthPreference: 'concise' | 'moderate' | 'detailed';
  directnessLevel: 'very-direct' | 'direct' | 'moderate' | 'indirect';
}

export interface LocalizedToneOption {
  value: string;
  label: string;
  description: string;
  culturalNotes?: string;
}

export interface LanguageDetectionResult {
  detectedLanguage: SupportedLanguage;
  confidence: number;
  alternativeLanguages?: Array<{
    language: SupportedLanguage;
    confidence: number;
  }>;
}

export interface MultiLanguageEmailFormValues {
  targetLanguage: SupportedLanguage;
  autoDetectLanguage: boolean;
  culturalAdaptation: boolean;
  localizedTone?: string;
}

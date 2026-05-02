/**
 * Language Detection Utility
 * Automatically detects input language from text content
 */

import type { SupportedLanguage, LanguageDetectionResult } from '../../types/language.types';

/**
 * Common words and patterns for language detection
 */
const LANGUAGE_PATTERNS: Record<SupportedLanguage, RegExp[]> = {
  'en': [/\b(the|and|is|are|was|were|have|has|will|would|should|could)\b/i],
  'es': [/\b(el|la|los|las|de|que|es|en|por|para|con|una?)\b/i, /[áéíóúñ]/],
  'fr': [/\b(le|la|les|de|et|est|dans|pour|avec|une?)\b/i, /[àâçéèêëîïôùûü]/],
  'de': [/\b(der|die|das|und|ist|in|zu|den|mit|eine?)\b/i, /[äöüß]/],
  'it': [/\b(il|la|di|e|che|per|con|una?|sono|della)\b/i, /[àèéìòù]/],
  'pt': [/\b(o|a|os|as|de|que|em|para|com|uma?)\b/i, /[ãáâàçéêíóôõú]/],
  'nl': [/\b(de|het|een|en|van|in|is|op|te|voor)\b/i, /\b(ij|aan|bij|naar)\b/i],
  'pl': [/\b(i|w|na|z|do|się|jest|że|to|nie)\b/i, /[ąćęłńóśźż]/],
  'ru': [/[а-яА-ЯёЁ]{3,}/, /\b(и|в|не|на|с|что|это|как|он|она)\b/],
  'ja': [/[\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]/],
  'ko': [/[\uAC00-\uD7AF\u1100-\u11FF\u3130-\u318F]/],
  'zh-CN': [/[\u4E00-\u9FFF]/, /[的了是我不在人有这个]/],
  'zh-TW': [/[\u4E00-\u9FFF]/, /[的了是我不在人有這個]/],
  'ar': [/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/, /\b(في|من|على|إلى|هذا|ذلك)\b/],
  'hi': [/[\u0900-\u097F]/, /\b(और|है|के|में|से|को|की|का)\b/],
  'tr': [/\b(ve|bir|bu|için|ile|de|da|var|olan)\b/i, /[çğıöşü]/],
  'sv': [/\b(och|är|en|ett|i|på|för|att|med|som)\b/i, /[åäö]/],
  'da': [/\b(og|er|en|et|i|på|for|at|med|som)\b/i, /[æøå]/],
  'no': [/\b(og|er|en|et|i|på|for|å|med|som)\b/i, /[æøå]/],
  'fi': [/\b(ja|on|ei|se|että|oli|olla|kun|niin)\b/i, /[äö]/],
  'cs': [/\b(a|je|v|na|se|s|do|že|to|pro)\b/i, /[áčďéěíňóřšťúůýž]/],
  'el': [/[\u0370-\u03FF\u1F00-\u1FFF]/, /\b(και|είναι|για|από|με|στο|του)\b/],
  'he': [/[\u0590-\u05FF]/, /\b(של|את|על|זה|לא|כל|אם)\b/],
  'th': [/[\u0E00-\u0E7F]/, /\b(และ|ใน|ที่|เป็น|ของ|มี|ได้)\b/],
  'vi': [/\b(và|là|của|có|được|trong|cho|với)\b/i, /[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/],
  'fil': [/\b(ang|ng|sa|at|na|ay|mga|para|kung|ako|ikaw|siya)\b/i, /\b(po|opo|hindi|oo|kayo|natin)\b/i],
};

/**
 * Character set detection for script-based languages
 */
function detectByCharacterSet(text: string): SupportedLanguage | null {
  // Japanese (Hiragana, Katakana, Kanji)
  if (/[\u3040-\u309F\u30A0-\u30FF]/.test(text)) {
    return 'ja';
  }
  
  // Korean (Hangul)
  if (/[\uAC00-\uD7AF]/.test(text)) {
    return 'ko';
  }
  
  // Arabic
  if (/[\u0600-\u06FF]/.test(text)) {
    return 'ar';
  }
  
  // Hebrew
  if (/[\u0590-\u05FF]/.test(text)) {
    return 'he';
  }
  
  // Thai
  if (/[\u0E00-\u0E7F]/.test(text)) {
    return 'th';
  }
  
  // Devanagari (Hindi)
  if (/[\u0900-\u097F]/.test(text)) {
    return 'hi';
  }
  
  // Greek
  if (/[\u0370-\u03FF]/.test(text)) {
    return 'el';
  }
  
  // Cyrillic (Russian)
  if (/[\u0400-\u04FF]/.test(text)) {
    return 'ru';
  }
  
  // Chinese (need to distinguish between Simplified and Traditional)
  if (/[\u4E00-\u9FFF]/.test(text)) {
    // Check for Traditional Chinese specific characters
    if (/[繁體這個]/.test(text)) {
      return 'zh-TW';
    }
    // Default to Simplified
    return 'zh-CN';
  }
  
  return null;
}

/**
 * Pattern-based language detection
 */
function detectByPatterns(text: string): Map<SupportedLanguage, number> {
  const scores = new Map<SupportedLanguage, number>();
  
  // Normalize text for better matching
  const normalizedText = text.toLowerCase();
  
  // Test each language pattern
  for (const [language, patterns] of Object.entries(LANGUAGE_PATTERNS)) {
    let score = 0;
    
    for (const pattern of patterns) {
      const matches = normalizedText.match(pattern);
      if (matches) {
        score += matches.length;
      }
    }
    
    if (score > 0) {
      scores.set(language as SupportedLanguage, score);
    }
  }
  
  return scores;
}

/**
 * Detect language from text input
 * Returns detected language with confidence score
 */
export function detectLanguage(text: string): LanguageDetectionResult {
  if (!text || text.trim().length < 10) {
    // Default to English for very short text
    return {
      detectedLanguage: 'en',
      confidence: 50,
    };
  }
  
  // First, try character set detection (most reliable for non-Latin scripts)
  const charSetLanguage = detectByCharacterSet(text);
  if (charSetLanguage) {
    return {
      detectedLanguage: charSetLanguage,
      confidence: 95,
    };
  }
  
  // Pattern-based detection for Latin-script languages
  const scores = detectByPatterns(text);
  
  if (scores.size === 0) {
    // No patterns matched, default to English
    return {
      detectedLanguage: 'en',
      confidence: 40,
    };
  }
  
  // Sort by score
  const sortedScores = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1]);
  
  const topLanguage = sortedScores[0];
  
  // Handle case where no language was detected
  if (!topLanguage) {
    return {
      detectedLanguage: 'en',
      confidence: 40,
    };
  }
  
  const totalScore = Array.from(scores.values()).reduce((sum, score) => sum + score, 0);
  
  // Calculate confidence (0-100)
  const confidence = Math.min(95, Math.round((topLanguage[1] / totalScore) * 100));
  
  // Get alternative languages
  const alternativeLanguages = sortedScores
    .slice(1, 4)
    .map(([language, score]) => ({
      language,
      confidence: Math.round((score / totalScore) * 100),
    }))
    .filter(alt => alt.confidence > 10);
  
  return {
    detectedLanguage: topLanguage[0],
    confidence,
    alternativeLanguages: alternativeLanguages.length > 0 ? alternativeLanguages : undefined,
  };
}

/**
 * Detect language from key points field
 * Optimized for email content detection
 */
export function detectLanguageFromKeyPoints(keyPoints: string): LanguageDetectionResult {
  // Remove URLs and email addresses for better detection
  const cleanedText = keyPoints
    .replace(/https?:\/\/[^\s]+/g, '')
    .replace(/[\w.-]+@[\w.-]+\.\w+/g, '')
    .trim();
  
  return detectLanguage(cleanedText);
}

/**
 * Check if detected language confidence is high enough
 */
export function isConfidentDetection(result: LanguageDetectionResult): boolean {
  return result.confidence >= 70;
}

/**
 * Get language name from code
 */
export function getLanguageName(code: SupportedLanguage): string {
  const languageNames: Record<SupportedLanguage, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'nl': 'Dutch',
    'pl': 'Polish',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh-CN': 'Chinese (Simplified)',
    'zh-TW': 'Chinese (Traditional)',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'tr': 'Turkish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
    'cs': 'Czech',
    'el': 'Greek',
    'he': 'Hebrew',
    'th': 'Thai',
    'vi': 'Vietnamese',
    'fil': 'Filipino',
  };
  
  return languageNames[code] || code;
}

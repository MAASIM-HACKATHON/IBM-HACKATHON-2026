/**
 * Multi-Language Support Configuration
 * Defines 20+ supported languages with cultural contexts
 */

import type { LanguageOption, CulturalContext, LocalizedToneOption, SupportedLanguage } from '../types/language.types';

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇵🇹' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷' },
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文', flag: '🇨🇳' },
  { code: 'zh-TW', name: 'Chinese (Traditional)', nativeName: '繁體中文', flag: '🇹🇼' },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', flag: '🇩🇰' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', flag: '🇳🇴' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', flag: '🇫🇮' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', flag: '🇨🇿' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', rtl: true },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'fil', name: 'Filipino', nativeName: 'Filipino', flag: '🇵🇭' },
];

/**
 * Cultural contexts for different languages
 * Defines communication norms and preferences
 */
export const CULTURAL_CONTEXTS: Record<SupportedLanguage, CulturalContext> = {
  'en': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'moderate',
    directnessLevel: 'direct',
  },
  'es': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'warm',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'fr': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'detailed',
    directnessLevel: 'indirect',
  },
  'de': {
    formalityLevel: 'very-formal',
    greetingStyle: 'direct',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'detailed',
    directnessLevel: 'very-direct',
  },
  'it': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'warm',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'pt': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'warm',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'nl': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'concise',
    directnessLevel: 'very-direct',
  },
  'pl': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'ru': {
    formalityLevel: 'formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'detailed',
    directnessLevel: 'moderate',
  },
  'ja': {
    formalityLevel: 'very-formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'indirect',
  },
  'ko': {
    formalityLevel: 'very-formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'indirect',
  },
  'zh-CN': {
    formalityLevel: 'formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'concise',
    directnessLevel: 'indirect',
  },
  'zh-TW': {
    formalityLevel: 'formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'indirect',
  },
  'ar': {
    formalityLevel: 'very-formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'detailed',
    directnessLevel: 'indirect',
  },
  'hi': {
    formalityLevel: 'formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'indirect',
  },
  'tr': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'sv': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'concise',
    directnessLevel: 'direct',
  },
  'da': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'concise',
    directnessLevel: 'direct',
  },
  'no': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'concise',
    directnessLevel: 'direct',
  },
  'fi': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'concise',
    directnessLevel: 'very-direct',
  },
  'cs': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'el': {
    formalityLevel: 'formal',
    greetingStyle: 'indirect',
    closingStyle: 'warm',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
  'he': {
    formalityLevel: 'neutral',
    greetingStyle: 'direct',
    closingStyle: 'professional',
    honorificsRequired: false,
    lengthPreference: 'moderate',
    directnessLevel: 'direct',
  },
  'th': {
    formalityLevel: 'very-formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'indirect',
  },
  'vi': {
    formalityLevel: 'formal',
    greetingStyle: 'hierarchical',
    closingStyle: 'formal',
    honorificsRequired: true,
    lengthPreference: 'moderate',
    directnessLevel: 'indirect',
  },
  'fil': {
    formalityLevel: 'neutral',
    greetingStyle: 'indirect',
    closingStyle: 'warm',
    honorificsRequired: false,
    lengthPreference: 'moderate',
    directnessLevel: 'moderate',
  },
};

/**
 * Localized tone options per language
 * Adapts tone descriptions to cultural norms
 */
export const LOCALIZED_TONE_OPTIONS: Record<SupportedLanguage, LocalizedToneOption[]> = {
  'en': [
    { value: 'formal', label: 'Formal', description: 'Professional and polished' },
    { value: 'professional', label: 'Professional', description: 'Balanced business tone' },
    { value: 'friendly', label: 'Friendly', description: 'Warm and approachable' },
    { value: 'enthusiastic', label: 'Enthusiastic', description: 'Energetic and passionate' },
  ],
  'ja': [
    { value: 'keigo', label: '敬語 (Keigo)', description: 'Respectful honorific language', culturalNotes: 'Use for superiors and formal business' },
    { value: 'teineigo', label: '丁寧語 (Teineigo)', description: 'Polite standard form', culturalNotes: 'Standard business communication' },
    { value: 'casual-polite', label: 'カジュアル丁寧', description: 'Casual but respectful', culturalNotes: 'For colleagues of similar rank' },
  ],
  'ko': [
    { value: 'jondaemal', label: '존댓말 (Jondaemal)', description: 'Formal honorific speech', culturalNotes: 'Required for superiors and clients' },
    { value: 'haeyo-che', label: '해요체 (Haeyo-che)', description: 'Polite informal', culturalNotes: 'Standard business communication' },
    { value: 'haera-che', label: '해라체 (Haera-che)', description: 'Casual informal', culturalNotes: 'Only for close colleagues' },
  ],
  'de': [
    { value: 'sie-form', label: 'Sie-Form', description: 'Formal address', culturalNotes: 'Always use for business unless invited to use Du' },
    { value: 'professional', label: 'Professionell', description: 'Standard business tone' },
    { value: 'du-form', label: 'Du-Form', description: 'Informal address', culturalNotes: 'Only after explicit permission' },
  ],
  'fr': [
    { value: 'vouvoiement', label: 'Vouvoiement', description: 'Formal "vous" form', culturalNotes: 'Standard for all business communication' },
    { value: 'professional', label: 'Professionnel', description: 'Polished business tone' },
    { value: 'tutoiement', label: 'Tutoiement', description: 'Informal "tu" form', culturalNotes: 'Only for close colleagues' },
  ],
  // Default professional tones for other languages
  'es': [
    { value: 'formal', label: 'Formal', description: 'Tono profesional y cortés' },
    { value: 'professional', label: 'Profesional', description: 'Tono empresarial equilibrado' },
    { value: 'friendly', label: 'Amigable', description: 'Cálido y accesible' },
  ],
  'it': [
    { value: 'formal', label: 'Formale', description: 'Professionale e cortese' },
    { value: 'professional', label: 'Professionale', description: 'Tono aziendale equilibrato' },
    { value: 'friendly', label: 'Amichevole', description: 'Caloroso e accessibile' },
  ],
  'pt': [
    { value: 'formal', label: 'Formal', description: 'Profissional e polido' },
    { value: 'professional', label: 'Profissional', description: 'Tom empresarial equilibrado' },
    { value: 'friendly', label: 'Amigável', description: 'Caloroso e acessível' },
  ],
  'nl': [
    { value: 'formal', label: 'Formeel', description: 'Professioneel en beleefd' },
    { value: 'professional', label: 'Professioneel', description: 'Zakelijke toon' },
    { value: 'friendly', label: 'Vriendelijk', description: 'Warm en toegankelijk' },
  ],
  'pl': [
    { value: 'formal', label: 'Formalny', description: 'Profesjonalny i uprzejmy' },
    { value: 'professional', label: 'Profesjonalny', description: 'Zrównoważony ton biznesowy' },
    { value: 'friendly', label: 'Przyjazny', description: 'Ciepły i przystępny' },
  ],
  'ru': [
    { value: 'formal', label: 'Формальный', description: 'Профессиональный и вежливый' },
    { value: 'professional', label: 'Профессиональный', description: 'Деловой тон' },
    { value: 'friendly', label: 'Дружелюбный', description: 'Теплый и доступный' },
  ],
  'zh-CN': [
    { value: 'formal', label: '正式', description: '专业礼貌' },
    { value: 'professional', label: '专业', description: '商务语气' },
    { value: 'friendly', label: '友好', description: '温暖亲切' },
  ],
  'zh-TW': [
    { value: 'formal', label: '正式', description: '專業禮貌' },
    { value: 'professional', label: '專業', description: '商務語氣' },
    { value: 'friendly', label: '友好', description: '溫暖親切' },
  ],
  'ar': [
    { value: 'formal', label: 'رسمي', description: 'احترافي ومهذب' },
    { value: 'professional', label: 'احترافي', description: 'نبرة عمل متوازنة' },
    { value: 'friendly', label: 'ودي', description: 'دافئ وودود' },
  ],
  'hi': [
    { value: 'formal', label: 'औपचारिक', description: 'पेशेवर और विनम्र' },
    { value: 'professional', label: 'पेशेवर', description: 'व्यावसायिक स्वर' },
    { value: 'friendly', label: 'मित्रवत', description: 'गर्मजोशी और सुलभ' },
  ],
  'tr': [
    { value: 'formal', label: 'Resmi', description: 'Profesyonel ve kibar' },
    { value: 'professional', label: 'Profesyonel', description: 'İş tonu' },
    { value: 'friendly', label: 'Samimi', description: 'Sıcak ve erişilebilir' },
  ],
  'sv': [
    { value: 'formal', label: 'Formell', description: 'Professionell och artig' },
    { value: 'professional', label: 'Professionell', description: 'Affärston' },
    { value: 'friendly', label: 'Vänlig', description: 'Varm och tillgänglig' },
  ],
  'da': [
    { value: 'formal', label: 'Formel', description: 'Professionel og høflig' },
    { value: 'professional', label: 'Professionel', description: 'Forretningstone' },
    { value: 'friendly', label: 'Venlig', description: 'Varm og tilgængelig' },
  ],
  'no': [
    { value: 'formal', label: 'Formell', description: 'Profesjonell og høflig' },
    { value: 'professional', label: 'Profesjonell', description: 'Forretningstone' },
    { value: 'friendly', label: 'Vennlig', description: 'Varm og tilgjengelig' },
  ],
  'fi': [
    { value: 'formal', label: 'Muodollinen', description: 'Ammattimainen ja kohtelias' },
    { value: 'professional', label: 'Ammattimainen', description: 'Liiketoimintasävy' },
    { value: 'friendly', label: 'Ystävällinen', description: 'Lämmin ja lähestyttävä' },
  ],
  'cs': [
    { value: 'formal', label: 'Formální', description: 'Profesionální a zdvořilý' },
    { value: 'professional', label: 'Profesionální', description: 'Obchodní tón' },
    { value: 'friendly', label: 'Přátelský', description: 'Vřelý a přístupný' },
  ],
  'el': [
    { value: 'formal', label: 'Επίσημο', description: 'Επαγγελματικό και ευγενικό' },
    { value: 'professional', label: 'Επαγγελματικό', description: 'Επιχειρηματικός τόνος' },
    { value: 'friendly', label: 'Φιλικό', description: 'Ζεστό και προσιτό' },
  ],
  'he': [
    { value: 'formal', label: 'רשמי', description: 'מקצועי ומנומס' },
    { value: 'professional', label: 'מקצועי', description: 'טון עסקי' },
    { value: 'friendly', label: 'ידידותי', description: 'חם ונגיש' },
  ],
  'th': [
    { value: 'formal', label: 'เป็นทางการ', description: 'มืออาชีพและสุภาพ' },
    { value: 'professional', label: 'มืออาชีพ', description: 'น้ำเสียงทางธุรกิจ' },
    { value: 'friendly', label: 'เป็นมิตร', description: 'อบอุ่นและเข้าถึงได้' },
  ],
  'vi': [
    { value: 'formal', label: 'Trang trọng', description: 'Chuyên nghiệp và lịch sự' },
    { value: 'professional', label: 'Chuyên nghiệp', description: 'Giọng điệu kinh doanh' },
    { value: 'friendly', label: 'Thân thiện', description: 'Ấm áp và dễ tiếp cận' },
  ],
  'fil': [
    { value: 'formal', label: 'Pormal', description: 'Propesyonal at magalang' },
    { value: 'professional', label: 'Propesyonal', description: 'Tono ng negosyo' },
    { value: 'friendly', label: 'Palakaibigan', description: 'Mainit at madaling lapitan' },
  ],
};

/**
 * Get language by code
 */
export function getLanguageByCode(code: SupportedLanguage): LanguageOption | undefined {
  return SUPPORTED_LANGUAGES.find(lang => lang.code === code);
}

/**
 * Get cultural context for language
 */
export function getCulturalContext(language: SupportedLanguage): CulturalContext {
  return CULTURAL_CONTEXTS[language];
}

/**
 * Get localized tone options for language
 */
export function getLocalizedTones(language: SupportedLanguage): LocalizedToneOption[] {
  return LOCALIZED_TONE_OPTIONS[language] || LOCALIZED_TONE_OPTIONS['en'];
}

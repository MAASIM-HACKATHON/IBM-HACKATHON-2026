/**
 * Language Selector Component
 * Allows users to select target language with auto-detection
 */

import { useState, useEffect, type ReactElement } from 'react';
import type { SupportedLanguage, LanguageDetectionResult } from '../../types/language.types';
import { SUPPORTED_LANGUAGES, getLocalizedTones } from '../../config/languages';
import { detectLanguageFromKeyPoints, getLanguageName, isConfidentDetection } from '../../utilities/system-utils/languageDetector';

interface LanguageSelectorProps {
  autoDetectLanguage: boolean;
  culturalAdaptation: boolean;
  keyPoints: string;
  localizedTone?: string;
  onAutoDetectChange: (enabled: boolean) => void;
  onCulturalAdaptationChange: (enabled: boolean) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onLocalizedToneChange: (tone: string) => void;
  targetLanguage: SupportedLanguage;
}

function LanguageSelector({
  autoDetectLanguage,
  culturalAdaptation,
  keyPoints,
  localizedTone,
  onAutoDetectChange,
  onCulturalAdaptationChange,
  onLanguageChange,
  onLocalizedToneChange,
  targetLanguage,
}: LanguageSelectorProps): ReactElement {
  const [detectionResult, setDetectionResult] = useState<LanguageDetectionResult | null>(null);
  const [showAllLanguages, setShowAllLanguages] = useState(false);

  // Auto-detect language when key points change
  useEffect(() => {
    if (autoDetectLanguage && keyPoints.trim().length > 20) {
      const result = detectLanguageFromKeyPoints(keyPoints);
      setDetectionResult(result);
      
      // Auto-apply if confident
      if (isConfidentDetection(result) && result.detectedLanguage !== targetLanguage) {
        onLanguageChange(result.detectedLanguage);
      }
    }
  }, [keyPoints, autoDetectLanguage, targetLanguage, onLanguageChange]);

  const localizedTones = getLocalizedTones(targetLanguage);
  const selectedLanguage = SUPPORTED_LANGUAGES.find(lang => lang.code === targetLanguage);
  
  // Popular languages for quick access
  const popularLanguages = SUPPORTED_LANGUAGES.filter(lang =>
    ['en', 'es', 'fr', 'de', 'ja', 'zh-CN', 'pt', 'it'].includes(lang.code)
  );
  
  const displayLanguages = showAllLanguages ? SUPPORTED_LANGUAGES : popularLanguages;

  return (
    <div className="space-y-4">
      {/* Language Selection Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-200">🌍 Target Language</span>
          {detectionResult && autoDetectLanguage && (
            <span className="text-xs text-cyan-300">
              {isConfidentDetection(detectionResult) ? (
                <>✓ Detected: {getLanguageName(detectionResult.detectedLanguage)} ({detectionResult.confidence}%)</>
              ) : (
                <>⚠ Low confidence ({detectionResult.confidence}%)</>
              )}
            </span>
          )}
        </div>
        
        <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
          <input
            checked={autoDetectLanguage}
            className="rounded border-white/10 bg-slate-900/80 text-cyan-400 focus:ring-cyan-300"
            onChange={(e) => onAutoDetectChange(e.target.checked)}
            type="checkbox"
          />
          Auto-detect
        </label>
      </div>

      {/* Language Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {displayLanguages.map((language) => (
          <button
            key={language.code}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition ${
              targetLanguage === language.code
                ? 'bg-cyan-400/20 border-2 border-cyan-400 text-white'
                : 'bg-slate-900/60 border border-white/10 text-slate-300 hover:border-cyan-400/50'
            }`}
            onClick={() => onLanguageChange(language.code)}
            type="button"
          >
            <span className="text-lg">{language.flag}</span>
            <span className="truncate">{language.name}</span>
          </button>
        ))}
      </div>

      {/* Show More/Less Toggle */}
      <button
        className="text-xs text-cyan-300 hover:text-cyan-200 transition"
        onClick={() => setShowAllLanguages(!showAllLanguages)}
        type="button"
      >
        {showAllLanguages ? '▲ Show less languages' : `▼ Show all ${SUPPORTED_LANGUAGES.length} languages`}
      </button>

      {/* Selected Language Info */}
      {selectedLanguage && (
        <div className="rounded-xl border border-white/10 bg-slate-900/40 p-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-2xl">{selectedLanguage.flag}</span>
            <div className="flex-1">
              <p className="font-medium text-white">{selectedLanguage.name}</p>
              <p className="text-xs text-slate-400">{selectedLanguage.nativeName}</p>
            </div>
            {selectedLanguage.rtl && (
              <span className="text-xs bg-purple-400/20 text-purple-200 px-2 py-1 rounded">
                RTL
              </span>
            )}
          </div>
        </div>
      )}

      {/* Cultural Adaptation Toggle */}
      <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-slate-900/40 p-4 cursor-pointer hover:border-cyan-400/30 transition">
        <input
          checked={culturalAdaptation}
          className="mt-0.5 rounded border-white/10 bg-slate-900/80 text-cyan-400 focus:ring-cyan-300"
          onChange={(e) => onCulturalAdaptationChange(e.target.checked)}
          type="checkbox"
        />
        <div className="flex-1">
          <p className="text-sm font-medium text-white">Cultural Adaptation</p>
          <p className="text-xs text-slate-400 mt-1">
            Adapt communication style, formality, and structure to match cultural norms and expectations
            for {selectedLanguage?.name || 'the selected language'}
          </p>
        </div>
      </label>

      {/* Localized Tone Options */}
      {culturalAdaptation && localizedTones.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-200">
            Localized Tone
          </label>
          <select
            className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none transition focus:border-cyan-300"
            onChange={(e) => onLocalizedToneChange(e.target.value)}
            value={localizedTone || ''}
          >
            <option value="">Use standard tone</option>
            {localizedTones.map((tone) => (
              <option key={tone.value} value={tone.value}>
                {tone.label}
              </option>
            ))}
          </select>
          {localizedTone && (
            <p className="text-xs text-slate-400">
              {localizedTones.find(t => t.value === localizedTone)?.description}
              {localizedTones.find(t => t.value === localizedTone)?.culturalNotes && (
                <span className="block mt-1 text-cyan-300">
                  💡 {localizedTones.find(t => t.value === localizedTone)?.culturalNotes}
                </span>
              )}
            </p>
          )}
        </div>
      )}

      {/* Alternative Detections */}
      {detectionResult?.alternativeLanguages && detectionResult.alternativeLanguages.length > 0 && (
        <details className="text-xs">
          <summary className="cursor-pointer text-slate-400 hover:text-slate-300">
            Alternative language detections
          </summary>
          <div className="mt-2 space-y-1 pl-4">
            {detectionResult.alternativeLanguages.map((alt) => (
              <button
                key={alt.language}
                className="block text-cyan-300 hover:text-cyan-200"
                onClick={() => onLanguageChange(alt.language)}
                type="button"
              >
                {getLanguageName(alt.language)} ({alt.confidence}%)
              </button>
            ))}
          </div>
        </details>
      )}
    </div>
  );
}

export default LanguageSelector;

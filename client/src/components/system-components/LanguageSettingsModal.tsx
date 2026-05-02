/**
 * Language Settings Modal Component
 * Modal dialog for multi-language configuration
 */

import { type ReactElement } from 'react';
import type { SupportedLanguage } from '../../types/language.types';
import LanguageSelector from './LanguageSelector';

interface LanguageSettingsModalProps {
  autoDetectLanguage: boolean;
  culturalAdaptation: boolean;
  isOpen: boolean;
  keyPoints: string;
  localizedTone?: string;
  onAutoDetectChange: (enabled: boolean) => void;
  onClose: () => void;
  onCulturalAdaptationChange: (enabled: boolean) => void;
  onLanguageChange: (language: SupportedLanguage) => void;
  onLocalizedToneChange: (tone: string) => void;
  targetLanguage: SupportedLanguage;
}

function LanguageSettingsModal({
  autoDetectLanguage,
  culturalAdaptation,
  isOpen,
  keyPoints,
  localizedTone,
  onAutoDetectChange,
  onClose,
  onCulturalAdaptationChange,
  onLanguageChange,
  onLocalizedToneChange,
  targetLanguage,
}: LanguageSettingsModalProps): ReactElement | null {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div
          className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-[32px] border border-cyan-400/20 bg-slate-950/95 shadow-[0_30px_80px_rgba(7,14,26,0.8)] backdrop-blur"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="sticky top-0 z-10 border-b border-white/10 bg-slate-950/95 px-8 py-6 backdrop-blur">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400/20">
                  <svg className="h-6 w-6 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Language Settings</h2>
                  <p className="mt-1 text-sm text-slate-400">
                    Configure multi-language support and cultural adaptation
                  </p>
                </div>
              </div>
              
              {/* Close Button */}
              <button
                className="rounded-full p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                onClick={onClose}
                type="button"
                aria-label="Close settings"
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-8 py-6">
            {/* Info Banner */}
            <div className="mb-6 rounded-2xl border border-cyan-300/20 bg-cyan-300/10 p-4">
              <div className="flex gap-3">
                <svg className="h-5 w-5 shrink-0 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-cyan-200">Multi-Language Support</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-300">
                    Generate professional emails in 25+ languages with automatic detection and cultural adaptation.
                    The AI will adapt communication style, formality, and structure to match cultural norms.
                  </p>
                </div>
              </div>
            </div>

            {/* Language Selector */}
            <LanguageSelector
              autoDetectLanguage={autoDetectLanguage}
              culturalAdaptation={culturalAdaptation}
              keyPoints={keyPoints}
              localizedTone={localizedTone}
              onAutoDetectChange={onAutoDetectChange}
              onCulturalAdaptationChange={onCulturalAdaptationChange}
              onLanguageChange={onLanguageChange}
              onLocalizedToneChange={onLocalizedToneChange}
              targetLanguage={targetLanguage}
            />

            {/* Quick Tips */}
            <div className="mt-6 space-y-3 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
              <p className="text-sm font-medium text-white">💡 Quick Tips</p>
              <ul className="space-y-2 text-xs leading-relaxed text-slate-300">
                <li className="flex gap-2">
                  <span className="text-cyan-300">•</span>
                  <span>Enable <strong>Auto-detect</strong> to automatically identify language from your key points</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-300">•</span>
                  <span>Enable <strong>Cultural Adaptation</strong> for professional international communication</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-300">•</span>
                  <span>Use <strong>Localized Tones</strong> for languages with specific honorific systems (Japanese, Korean, German)</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-300">•</span>
                  <span>Confidence scores above 70% are reliable for auto-detection</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 border-t border-white/10 bg-slate-950/95 px-8 py-5 backdrop-blur">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Settings are saved automatically
              </p>
              <button
                className="rounded-full bg-cyan-400 px-6 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                onClick={onClose}
                type="button"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default LanguageSettingsModal;

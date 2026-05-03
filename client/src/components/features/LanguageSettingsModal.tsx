import { type ReactElement, useState, useEffect, memo, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Languages, Info } from 'lucide-react';
import { SUPPORTED_LANGUAGES, getLocalizedTones, getCulturalContext } from '@/config/languages';
import type { SupportedLanguage } from '@/types/language.types';

/**
 * Props for LanguageSettingsModal component
 */
interface LanguageSettingsModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal open state changes */
  onOpenChange: (open: boolean) => void;
  /** Current target language */
  targetLanguage: SupportedLanguage;
  /** Callback when target language changes */
  onTargetLanguageChange: (language: SupportedLanguage) => void;
  /** Whether auto-detect language is enabled */
  autoDetectLanguage: boolean;
  /** Callback when auto-detect language changes */
  onAutoDetectLanguageChange: (enabled: boolean) => void;
  /** Whether cultural adaptation is enabled */
  culturalAdaptation: boolean;
  /** Callback when cultural adaptation changes */
  onCulturalAdaptationChange: (enabled: boolean) => void;
  /** Current localized tone */
  localizedTone?: string;
  /** Callback when localized tone changes */
  onLocalizedToneChange: (tone: string) => void;
}

/**
 * LanguageSettingsModal Component
 * 
 * A comprehensive modal for advanced language settings including:
 * - Language selector with 26 supported languages
 * - Auto-detect language toggle
 * - Cultural adaptation toggle
 * - Localized tone selector
 * 
 * Requirements:
 * - 21.2: Provide a language selector component
 * - 21.6: Automatically detect input language when auto-detect is enabled
 * - 19.3: Optimized with React.memo to avoid unnecessary re-renders
 * 
 * @param props - Component props
 * @returns Modal component for language settings
 */
export const LanguageSettingsModal = memo(function LanguageSettingsModal({
  open,
  onOpenChange,
  targetLanguage,
  onTargetLanguageChange,
  autoDetectLanguage,
  onAutoDetectLanguageChange,
  culturalAdaptation,
  onCulturalAdaptationChange,
  localizedTone,
  onLocalizedToneChange,
}: LanguageSettingsModalProps): ReactElement {
  // Local state for form values
  const [localLanguage, setLocalLanguage] = useState<SupportedLanguage>(targetLanguage);
  const [localAutoDetect, setLocalAutoDetect] = useState<boolean>(autoDetectLanguage);
  const [localCulturalAdaptation, setLocalCulturalAdaptation] = useState<boolean>(culturalAdaptation);
  const [localTone, setLocalTone] = useState<string>(localizedTone || '');

  // Get localized tones for selected language
  const localizedTones = getLocalizedTones(localLanguage);
  const culturalContext = getCulturalContext(localLanguage);

  // Sync local state with props when modal opens
  useEffect(() => {
    if (open) {
      setLocalLanguage(targetLanguage);
      setLocalAutoDetect(autoDetectLanguage);
      setLocalCulturalAdaptation(culturalAdaptation);
      setLocalTone(localizedTone || '');
    }
  }, [open, targetLanguage, autoDetectLanguage, culturalAdaptation, localizedTone]);

  /**
   * Handle save button click
   * Apply all settings and close modal
   * Requirement 19.3: Use useCallback to prevent unnecessary re-renders
   */
  const handleSave = useCallback(() => {
    onTargetLanguageChange(localLanguage);
    onAutoDetectLanguageChange(localAutoDetect);
    onCulturalAdaptationChange(localCulturalAdaptation);
    onLocalizedToneChange(localTone);
    onOpenChange(false);
  }, [localLanguage, localAutoDetect, localCulturalAdaptation, localTone, onTargetLanguageChange, onAutoDetectLanguageChange, onCulturalAdaptationChange, onLocalizedToneChange, onOpenChange]);

  /**
   * Handle cancel button click
   * Reset local state and close modal
   * Requirement 19.3: Use useCallback to prevent unnecessary re-renders
   */
  const handleCancel = useCallback(() => {
    setLocalLanguage(targetLanguage);
    setLocalAutoDetect(autoDetectLanguage);
    setLocalCulturalAdaptation(culturalAdaptation);
    setLocalTone(localizedTone || '');
    onOpenChange(false);
  }, [targetLanguage, autoDetectLanguage, culturalAdaptation, localizedTone, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]" showCloseButton={true}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Languages className="h-5 w-5 text-[#2C4C82]" />
            Language Settings
          </DialogTitle>
          <DialogDescription>
            Configure language preferences and cultural adaptations for email generation
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Language Selector */}
          <div className="space-y-2">
            <Label htmlFor="modal-target-language" className="text-sm font-medium">
              Target Language
            </Label>
            <Select 
              value={localLanguage} 
              onValueChange={(value) => setLocalLanguage(value as SupportedLanguage)}
            >
              <SelectTrigger 
                id="modal-target-language"
                className="w-full"
                aria-describedby="modal-language-help"
              >
                <SelectValue placeholder="Select target language" />
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <SelectItem key={lang.code} value={lang.code}>
                    <span className="flex items-center gap-2">
                      <span>{lang.flag}</span>
                      <span>{lang.name}</span>
                      <span className="text-muted-foreground text-xs">({lang.nativeName})</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p id="modal-language-help" className="text-xs text-muted-foreground">
              Select the language for your email generation ({SUPPORTED_LANGUAGES.length} languages supported)
            </p>
          </div>

          {/* Auto-detect Language Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="modal-auto-detect" className="text-sm font-medium">
                  Auto-detect Language
                </Label>
                <p className="text-xs text-muted-foreground">
                  Automatically detect language from your input text
                </p>
              </div>
              <Switch
                id="modal-auto-detect"
                checked={localAutoDetect}
                onCheckedChange={setLocalAutoDetect}
                aria-describedby="modal-auto-detect-help"
              />
            </div>
            <p id="modal-auto-detect-help" className="text-xs text-muted-foreground">
              When enabled, the system will detect the language from text longer than 30 characters and update the target language automatically
            </p>
          </div>

          {/* Cultural Adaptation Toggle */}
          <div className="space-y-2">
            <div className="flex items-center justify-between space-x-2">
              <div className="space-y-0.5">
                <Label htmlFor="modal-cultural-adaptation" className="text-sm font-medium">
                  Cultural Adaptation
                </Label>
                <p className="text-xs text-muted-foreground">
                  Adapt communication style to cultural norms
                </p>
              </div>
              <Switch
                id="modal-cultural-adaptation"
                checked={localCulturalAdaptation}
                onCheckedChange={setLocalCulturalAdaptation}
                aria-describedby="modal-cultural-help"
              />
            </div>
            {localCulturalAdaptation && (
              <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-[#2C4C82] mt-0.5 flex-shrink-0" />
                  <div className="space-y-1 text-xs">
                    <p className="font-medium text-foreground">
                      Cultural Context for {SUPPORTED_LANGUAGES.find(l => l.code === localLanguage)?.name}
                    </p>
                    <div className="space-y-1 text-muted-foreground">
                      <p>• Formality: <Badge variant="outline" className="ml-1 text-xs">{culturalContext.formalityLevel}</Badge></p>
                      <p>• Greeting style: <Badge variant="outline" className="ml-1 text-xs">{culturalContext.greetingStyle}</Badge></p>
                      <p>• Directness: <Badge variant="outline" className="ml-1 text-xs">{culturalContext.directnessLevel}</Badge></p>
                      <p>• Length preference: <Badge variant="outline" className="ml-1 text-xs">{culturalContext.lengthPreference}</Badge></p>
                      {culturalContext.honorificsRequired && (
                        <p>• Honorifics required: <Badge variant="outline" className="ml-1 text-xs">Yes</Badge></p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
            <p id="modal-cultural-help" className="text-xs text-muted-foreground">
              Adjust formality, greetings, and communication patterns to match cultural expectations
            </p>
          </div>

          {/* Localized Tone Selector */}
          <div className="space-y-2">
            <Label htmlFor="modal-localized-tone" className="text-sm font-medium">
              Localized Tone <span className="text-muted-foreground font-normal">(Optional)</span>
            </Label>
            <Select 
              value={localTone} 
              onValueChange={(value) => setLocalTone(value || '')}
            >
              <SelectTrigger 
                id="modal-localized-tone"
                className="w-full"
                aria-describedby="modal-tone-help"
              >
                <SelectValue placeholder="Select tone for this language" />
              </SelectTrigger>
              <SelectContent>
                {localizedTones.map((tone) => (
                  <SelectItem key={tone.value} value={tone.value}>
                    <div className="flex flex-col">
                      <span>{tone.label}</span>
                      <span className="text-xs text-muted-foreground">{tone.description}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {localTone && localizedTones.find(t => t.value === localTone)?.culturalNotes && (
              <div className="rounded-lg border border-border bg-muted/30 p-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium">Cultural Note:</span>{' '}
                  {localizedTones.find(t => t.value === localTone)?.culturalNotes}
                </p>
              </div>
            )}
            <p id="modal-tone-help" className="text-xs text-muted-foreground">
              Choose a tone that matches the cultural norms of the selected language
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Settings
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
});

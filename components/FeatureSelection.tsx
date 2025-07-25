import React from 'react';
import { LanguageStyle, VideoDuration, HookType } from '../types';
import { LANGUAGE_STYLE_OPTIONS, VIDEO_DURATION_OPTIONS, VOICEOVER_LANGUAGE_STYLE_OPTIONS, HOOK_TYPE_OPTIONS } from '../constants';
import Button from './Button';
import SelectInput from './SelectInput';
import Card from './Card';
import { Cog6ToothIcon, PencilSquareIcon } from '@heroicons/react/24/outline';

interface FeatureSelectionProps {
  languageStyle: LanguageStyle;
  onLanguageStyleChange: (style: LanguageStyle) => void;
  hookType: HookType;
  onHookTypeChange: (type: HookType) => void;
  voiceOverLanguageStyle: LanguageStyle;
  onVoiceOverLanguageStyleChange: (style: LanguageStyle) => void;
  videoDuration: VideoDuration;
  onVideoDurationChange: (duration: VideoDuration) => void;
  onGenerateContent: () => void;
  isLoading: boolean;
  isProductInfoAvailable: boolean;
}

const FeatureSelection: React.FC<FeatureSelectionProps> = ({
  languageStyle,
  onLanguageStyleChange,
  hookType,
  onHookTypeChange,
  voiceOverLanguageStyle,
  onVoiceOverLanguageStyleChange,
  videoDuration,
  onVideoDurationChange,
  onGenerateContent,
  isLoading,
  isProductInfoAvailable,
}) => {
  return (
    <Card 
        title="2. Preferensi Konten & Generate" 
        icon={<Cog6ToothIcon className="h-6 w-6" />}
        className="mb-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SelectInput
          label="Pilih Gaya Bahasa Konten (Umum)"
          options={LANGUAGE_STYLE_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))}
          value={languageStyle}
          onChange={(e) => onLanguageStyleChange(e.target.value as LanguageStyle)}
          id="languageStyle"
        />

        <SelectInput
          label="Jenis Hook Spesifik (Opsional)"
          options={HOOK_TYPE_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))}
          value={hookType}
          onChange={(e) => onHookTypeChange(e.target.value as HookType)}
          id="hookType"
        />

        <SelectInput
          label="Pilih Gaya Bahasa VoiceOver"
          options={VOICEOVER_LANGUAGE_STYLE_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))}
          value={voiceOverLanguageStyle}
          onChange={(e) => onVoiceOverLanguageStyleChange(e.target.value as LanguageStyle)}
          id="voiceOverLanguageStyle"
        />
        
        <SelectInput
          label="Target Durasi Video"
          options={VIDEO_DURATION_OPTIONS.map(opt => ({value: opt.value, label: opt.label}))}
          value={videoDuration}
          onChange={(e) => onVideoDurationChange(e.target.value as VideoDuration)}
          id="videoDuration"
        />
        
        <div className="md:col-span-2 pt-2">
          <Button 
            onClick={onGenerateContent} 
            isLoading={isLoading} 
            disabled={isLoading || !isProductInfoAvailable}
            className="w-full"
            leftIcon={!isLoading && <PencilSquareIcon className="h-5 w-5"/>}
            title={!isProductInfoAvailable ? "Harap dapatkan info produk terlebih dahulu (Langkah 1)" : "Generate Konten Afiliasi"}
          >
            {isLoading ? 'Menghasilkan Konten...' : 'Generate Konten Afiliasi'}
          </Button>
          {!isProductInfoAvailable && (
            <p className="text-xs text-center text-[var(--text-tertiary)] mt-2">
              Tombol akan aktif setelah informasi produk berhasil didapatkan dari Langkah 1.
            </p>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FeatureSelection;
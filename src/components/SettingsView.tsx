import React, { useState } from 'react';
import { UserSettings, ToastMessage } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import {
  Volume2,
  Sliders,
  Globe,
  RotateCcw,
  Save
} from 'lucide-react';

interface SettingsViewProps {
  settings: UserSettings;
  onSaveSettings: (settings: UserSettings) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings: initialSettings,
  onSaveSettings,
  addToast,
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<UserSettings>(initialSettings);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(settings);
    addToast({
      type: 'success',
      message: t('notif.settingsSaved'),
    });
  };

  const handleReset = () => {
    const defaults: UserSettings = {
      soundEnabled: true,
      autoAnalyze: false,
      minConfidence: 85,
      riskTolerance: 'balanced' as unknown as 'low' | 'medium' | 'high',
      targetMultiplierAlert: 2.0,
      defaultLanguage: 'fr',
    };
    setSettings(defaults);
    onSaveSettings(defaults);
    addToast({
      type: 'info',
      message: 'Valeurs par défaut rétablies.',
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-10 space-y-8 text-white">
      {/* Aviator Glass Settings Header */}
      <div className="p-8 aviator-glass-card rounded-2xl space-y-2 border border-[#D4AF37]/35">
        <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
          Préférences Télémétrie TOP GSS
        </span>
        <h1 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
          {t('settings.title')}
        </h1>
        <p className="text-xs text-white/70 font-sans">{t('settings.subtitle')}</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="p-8 aviator-glass-card rounded-2xl space-y-8 border border-[#D4AF37]/35">
          <h2 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-mono font-bold border-b border-[#D4AF37]/25 pb-4">
            {t('settings.general')}
          </h2>

          {/* Sound Alerts */}
          <div className="flex items-center justify-between p-5 border border-[#D4AF37]/30 rounded-xl bg-black/40">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('settings.soundNotifications')}</span>
              </div>
              <div className="text-xs text-white/60 font-sans">
                {t('settings.soundNotificationsDesc')}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => setSettings({ ...settings, soundEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-black/60 border border-[#D4AF37]/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#E30613]"></div>
            </label>
          </div>

          {/* Min Confidence Threshold */}
          <div className="p-5 border border-[#D4AF37]/30 rounded-xl bg-black/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#D4AF37]" />
                  <span>{t('settings.minConfidenceAlert')}</span>
                </div>
                <div className="text-xs text-white/60 font-sans">
                  {t('settings.minConfidenceDesc')}
                </div>
              </div>
              <span className="text-xl font-mono font-bold text-[#D4AF37]">
                {settings.minConfidence}%
              </span>
            </div>
            <input
              type="range"
              min="75"
              max="98"
              value={settings.minConfidence}
              onChange={(e) =>
                setSettings({ ...settings, minConfidence: parseInt(e.target.value, 10) })
              }
              className="w-full accent-[#E30613] bg-black/60 rounded-lg cursor-pointer"
            />
          </div>

          {/* Language Preference */}
          <div className="p-5 border border-[#D4AF37]/30 rounded-xl bg-black/40 space-y-4">
            <div className="space-y-1">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#D4AF37]" />
                <span>{t('settings.languagePreference')}</span>
              </div>
              <div className="text-xs text-white/60 font-sans">
                {t('settings.languagePreferenceDesc')}
              </div>
            </div>

            <LanguageSelector variant="inline" />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-6 py-4 border border-[#D4AF37]/40 rounded-xl text-xs uppercase tracking-widest font-semibold text-white/70 hover:text-white hover:border-[#D4AF37] flex items-center justify-center gap-2 transition-colors cursor-pointer bg-black/40"
          >
            <RotateCcw className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('settings.resetDefaults')}</span>
          </button>

          <button
            type="submit"
            id="btn-save-settings"
            className="w-full sm:w-auto px-8 py-4 bg-[#E30613] hover:bg-[#b8050f] text-white text-xs font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(227,6,19,0.5)] rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer border border-[#ff4d5a]/40"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{t('settings.saveSettings')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

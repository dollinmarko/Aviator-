import React from 'react';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { ShieldAlert } from 'lucide-react';
import { LanguageSelector } from './LanguageSelector.tsx';

export const Footer: React.FC = () => {
  const { t } = useTranslation();

  return (
    <footer className="w-full border-t border-[#D4AF37]/30 bg-black/80 backdrop-blur-md pt-12 pb-12 text-white/70">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Col 1: Brand & Aviator TOP GSS Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#E30613] border border-[#D4AF37] flex items-center justify-center text-white text-xs font-black tracking-tight shadow-[0_0_15px_rgba(227,6,19,0.5)]">
                AS
              </div>
              <span className="text-xl font-mono font-black tracking-tight uppercase text-white">
                AVIATOR <span className="text-[#D4AF37]">TOP GSS</span>
              </span>
            </div>
            <p className="text-xs text-white/70 max-w-sm leading-relaxed font-sans">
              {t('footer.tagline')}
            </p>
            <div className="flex items-center gap-4 pt-2">
              <LanguageSelector variant="compact" />
              <span className="text-[11px] uppercase tracking-widest text-[#D4AF37] font-mono font-semibold">
                {t('footer.languageNote')}
              </span>
            </div>
          </div>

          {/* Col 2: Responsible Gaming Box */}
          <div className="md:col-span-7 p-6 aviator-glass-card rounded-2xl border border-[#D4AF37]/35 space-y-2">
            <div className="flex items-center gap-2 text-[#E30613] text-[10px] font-bold uppercase tracking-[0.2em] font-mono">
              <ShieldAlert className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('footer.responsibleGaming')}</span>
            </div>
            <p className="text-xs text-white/70 leading-relaxed font-sans">
              {t('footer.responsibleGamingDesc')}
            </p>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-white/50">
          <div>
            © {new Date().getFullYear()} AVIATOR TOP GSS SIGNAL. {t('footer.rights')}
          </div>
          <div className="flex items-center gap-6 uppercase tracking-widest text-[10px] text-white/70">
            <span className="hover:text-[#D4AF37] cursor-pointer transition-colors">
              {t('footer.privacy')}
            </span>
            <span className="hover:text-[#D4AF37] cursor-pointer transition-colors">
              {t('footer.terms')}
            </span>
            <span className="hover:text-[#D4AF37] cursor-pointer transition-colors">
              {t('footer.support')}
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

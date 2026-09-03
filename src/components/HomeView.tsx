import React from 'react';
import { ActiveTab } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import {
  ArrowRight,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  Globe2,
  Users,
  Compass,
  CheckCircle2,
  Radio
} from 'lucide-react';

interface HomeViewProps {
  onNavigate: (tab: ActiveTab) => void;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-16 pb-20 text-white">
      {/* Editorial Hero Section */}
      <section className="relative pt-12 sm:pt-20 pb-12 border-b border-[#D4AF37]/30">
        <div className="max-w-4xl mx-auto text-center space-y-8 px-6">
          {/* Eyebrow / Category Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-[#D4AF37]/50 bg-black/60 text-xs font-semibold tracking-widest uppercase text-white shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <span className="w-2 h-2 rounded-full bg-[#E30613] animate-pulse shadow-[0_0_8px_#E30613]" />
            <span className="text-[10px] tracking-[0.25em] text-[#D4AF37] font-mono font-bold">
              {t('home.heroBadge')}
            </span>
          </div>

          {/* Luxury Display Heading */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-mono font-black text-white tracking-tight leading-[1.1] drop-shadow-[0_0_30px_rgba(255,255,255,0.3)]">
            {t('home.heroTitle')}
          </h1>

          {/* Subtitle with High-contrast Readability */}
          <p className="text-base sm:text-lg text-white/80 max-w-2xl mx-auto leading-relaxed font-sans">
            {t('home.heroSubtitle')}
          </p>

          {/* Luxury Aviation CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              type="button"
              id="hero-cta-analyze"
              onClick={() => onNavigate('analyzer')}
              className="w-full sm:w-auto px-10 py-4 bg-[#E30613] hover:bg-[#b8050f] active:scale-[0.99] text-white text-xs font-black uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 group rounded-xl shadow-[0_0_30px_rgba(227,6,19,0.55)] border border-[#ff4d5a]/60 cursor-pointer"
            >
              <span>🔴 {t('home.ctaStart')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              type="button"
              id="hero-cta-history"
              onClick={() => onNavigate('history')}
              className="w-full sm:w-auto px-8 py-4 border border-[#D4AF37]/50 rounded-xl text-xs font-bold tracking-widest hover:bg-[#D4AF37]/20 hover:border-[#D4AF37] transition-all uppercase text-white flex items-center justify-center gap-2 cursor-pointer bg-black/40"
            >
              <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{t('home.ctaExplore')}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Metrics Row - Luxury Glass Cards */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="aviator-glass-card rounded-2xl p-8 space-y-2 border border-[#D4AF37]/35">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">
              {t('home.statsActiveUsers')}
            </p>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
              18,450+
            </div>
            <p className="text-xs text-white/60 font-sans">Utilisateurs actifs en continu</p>
          </div>

          <div className="aviator-glass-card-gold rounded-2xl p-8 space-y-2">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">
              {t('home.statsAccuracy')}
            </p>
            <div className="text-4xl sm:text-5xl font-mono font-black text-emerald-400 tracking-tight">
              92.8%
            </div>
            <p className="text-xs text-white/60 font-sans">Taux de convergence validé</p>
          </div>

          <div className="aviator-glass-card rounded-2xl p-8 space-y-2 border border-[#D4AF37]/35">
            <p className="text-[10px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-bold">
              {t('home.statsSignalsToday')}
            </p>
            <div className="text-4xl sm:text-5xl font-mono font-bold text-white tracking-tight">
              1,248
            </div>
            <p className="text-xs text-white/60 font-sans">Cycles analysés aujourd'hui</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-6xl mx-auto px-6 space-y-10">
        <div className="text-center space-y-2">
          <p className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
            Capacités Analytiques
          </p>
          <h2 className="text-3xl sm:text-4xl font-mono font-bold text-white tracking-tight">
            {t('home.featuresTitle')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-8 aviator-glass-card rounded-2xl border border-[#D4AF37]/35 hover:border-[#D4AF37] transition-all space-y-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/50 bg-[#E30613]/20 flex items-center justify-center text-[#E30613]">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-mono font-bold text-white">{t('home.feature1Title')}</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">{t('home.feature1Desc')}</p>
          </div>

          <div className="p-8 aviator-glass-card rounded-2xl border border-[#D4AF37]/35 hover:border-[#D4AF37] transition-all space-y-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/50 bg-[#E30613]/20 flex items-center justify-center text-[#E30613]">
              <Shield className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-mono font-bold text-white">{t('home.feature2Title')}</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">{t('home.feature2Desc')}</p>
          </div>

          <div className="p-8 aviator-glass-card rounded-2xl border border-[#D4AF37]/35 hover:border-[#D4AF37] transition-all space-y-4">
            <div className="w-12 h-12 rounded-full border border-[#D4AF37]/50 bg-[#E30613]/20 flex items-center justify-center text-[#E30613]">
              <Globe2 className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <h3 className="text-lg font-mono font-bold text-white">{t('home.feature3Title')}</h3>
            <p className="text-xs text-white/70 leading-relaxed font-sans">{t('home.feature3Desc')}</p>
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="p-8 sm:p-12 aviator-glass-card rounded-2xl border border-[#D4AF37]/35 space-y-10">
          <div className="space-y-2">
            <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
              Méthodologie
            </span>
            <h2 className="text-2xl sm:text-3xl font-mono font-bold text-white">
              {t('home.howItWorksTitle')}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-3 border-l-4 border-[#E30613] pl-4">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#D4AF37] font-bold">Étape 01</span>
              <h3 className="text-base font-mono font-bold text-white">{t('home.step1Title')}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{t('home.step1Desc')}</p>
            </div>

            <div className="space-y-3 border-l-4 border-[#D4AF37] pl-4">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#D4AF37] font-bold">Étape 02</span>
              <h3 className="text-base font-mono font-bold text-white">{t('home.step2Title')}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{t('home.step2Desc')}</p>
            </div>

            <div className="space-y-3 border-l-4 border-emerald-500 pl-4">
              <span className="text-[10px] uppercase tracking-widest font-mono text-[#D4AF37] font-bold">Étape 03</span>
              <h3 className="text-base font-mono font-bold text-white">{t('home.step3Title')}</h3>
              <p className="text-xs text-white/70 leading-relaxed">{t('home.step3Desc')}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Trilingual Flag Showcase Banner */}
      <section className="max-w-6xl mx-auto px-6">
        <div className="p-6 aviator-glass-card rounded-2xl border border-[#D4AF37]/35 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2 text-2xl">
              <span>🇫🇷</span>
              <span>🇲🇬</span>
              <span>🇬🇧</span>
            </div>
            <div>
              <div className="font-mono font-bold text-base text-white">
                Français • Malagasy • English
              </div>
              <div className="text-xs text-white/60 mt-0.5">
                {t('footer.languageNote')}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-emerald-400 font-mono font-bold">
            <CheckCircle2 className="w-4 h-4" />
            <span>100% {t('common.active')}</span>
          </div>
        </div>
      </section>
    </div>
  );
};

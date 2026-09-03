import React, { useState } from 'react';
import { UserProfile, ToastMessage } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import {
  Mail,
  ShieldCheck,
  AlertTriangle,
  Globe,
  Award,
  BarChart2,
  Save
} from 'lucide-react';

interface ProfileViewProps {
  user: UserProfile | null;
  onUpdateUser: (user: UserProfile) => void;
  onOpenVerify: () => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  onUpdateUser,
  onOpenVerify,
  addToast,
}) => {
  const { t, language } = useTranslation();

  // Local editable fields
  const [username, setUsername] = useState(user?.username || 'CaptainAviator');
  const [email, setEmail] = useState(user?.email || 'pilot@aviator-signal.com');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const updated: UserProfile = {
      ...user,
      username,
      email,
      preferredLanguage: language,
    };

    onUpdateUser(updated);
    addToast({
      type: 'success',
      message: t('notif.profileUpdated'),
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-6 py-10 space-y-8 text-white">
      {/* Aviator Glass Profile Header */}
      <div className="p-8 aviator-glass-card rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border border-[#D4AF37]/35">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-full bg-[#E30613] border-2 border-[#D4AF37] flex items-center justify-center text-white text-2xl font-mono font-bold tracking-tight shadow-[0_0_20px_rgba(227,6,19,0.5)]">
            {username.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-tight">
                {username}
              </h1>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 text-[#D4AF37] font-mono uppercase tracking-widest font-bold">
                {user?.vipStatus || 'VIP GSS'}
              </span>
            </div>
            <p className="text-xs text-white/70 mt-1 flex items-center gap-1.5 font-sans">
              <Mail className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>{email}</span>
            </p>
          </div>
        </div>

        {/* Verification badge */}
        <div>
          {user?.isVerified ? (
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/60 bg-emerald-950/50 text-emerald-400 text-xs font-mono uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{t('auth.verifiedBadge')}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenVerify}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#D4AF37] bg-[#D4AF37]/20 text-white text-xs font-mono uppercase tracking-wider hover:bg-[#D4AF37]/30 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#E30613]" />
              <span>{t('auth.verifyNow')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Profile Form & Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form */}
        <div className="md:col-span-2 space-y-6">
          <form onSubmit={handleSave} className="p-8 aviator-glass-card rounded-2xl space-y-8 border border-[#D4AF37]/35">
            <div>
              <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
                Configuration Pilote
              </span>
              <h2 className="text-xl font-mono font-bold text-white mt-1">
                {t('profile.accountDetails')}
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                  {t('profile.username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/40 border-b-2 border-[#D4AF37]/50 focus:border-[#D4AF37] py-2 px-3 text-base font-mono text-white outline-none transition-colors"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                  {t('profile.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/40 border-b-2 border-[#D4AF37]/50 focus:border-[#D4AF37] py-2 px-3 text-base font-mono text-white outline-none transition-colors"
                />
              </div>
            </div>

            {/* Language Preference Section */}
            <div className="space-y-4 pt-4 border-t border-[#D4AF37]/20">
              <div>
                <label className="block text-xs uppercase tracking-widest font-semibold text-[#D4AF37] flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#E30613]" />
                  <span>{t('profile.preferredLang')}</span>
                </label>
                <p className="text-xs text-white/60 mt-1 font-sans">
                  {t('profile.preferredLangDesc')}
                </p>
              </div>

              {/* Inline Language Selector */}
              <LanguageSelector variant="inline" />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                id="btn-save-profile"
                className="px-8 py-4 bg-[#E30613] hover:bg-[#b8050f] text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer rounded-xl shadow-[0_0_20px_rgba(227,6,19,0.5)] border border-[#ff4d5a]/40"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{t('profile.saveChanges')}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Col: Stats */}
        <div className="space-y-6">
          <div className="p-8 aviator-glass-card rounded-2xl space-y-6 border border-[#D4AF37]/35">
            <h3 className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] font-mono font-bold flex items-center gap-2 border-b border-[#D4AF37]/25 pb-4">
              <BarChart2 className="w-3.5 h-3.5 text-[#E30613]" />
              <span>{t('profile.statistics')}</span>
            </h3>

            <div className="space-y-6">
              <div className="border-l-4 border-[#D4AF37] pl-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-mono">
                  {t('profile.totalAnalyses')}
                </div>
                <div className="text-3xl font-mono font-bold text-white">
                  {user?.totalAnalyses || 42}
                </div>
              </div>

              <div className="border-l-4 border-emerald-500 pl-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-mono">
                  {t('profile.successRate')}
                </div>
                <div className="text-3xl font-mono font-bold text-emerald-400">
                  {user?.accuracyRate || 94.2}%
                </div>
              </div>

              <div className="border-l-4 border-[#E30613] pl-4 space-y-1">
                <div className="text-[10px] uppercase tracking-widest text-white/60 font-mono">
                  {t('profile.vipLevel')}
                </div>
                <div className="text-base font-mono font-bold text-[#D4AF37] flex items-center gap-2">
                  <Award className="w-4 h-4 text-[#D4AF37]" />
                  <span>TOP GSS ELITE</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

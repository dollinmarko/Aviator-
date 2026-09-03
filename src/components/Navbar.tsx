import React, { useState } from 'react';
import { ActiveTab, UserProfile } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import { LanguageSelector } from './LanguageSelector.tsx';
import {
  LineChart,
  History,
  User,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  Home
} from 'lucide-react';

interface NavbarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  user: UserProfile | null;
  onOpenAuth: (mode: 'login' | 'signup' | 'verify') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: { id: ActiveTab; labelKey: string; icon: React.ReactNode }[] = [
    { id: 'home', labelKey: 'nav.home', icon: <Home className="w-3.5 h-3.5" /> },
    { id: 'analyzer', labelKey: 'nav.analyzer', icon: <LineChart className="w-3.5 h-3.5" /> },
    { id: 'history', labelKey: 'nav.history', icon: <History className="w-3.5 h-3.5" /> },
    { id: 'profile', labelKey: 'nav.profile', icon: <User className="w-3.5 h-3.5" /> },
    { id: 'settings', labelKey: 'nav.settings', icon: <Settings className="w-3.5 h-3.5" /> },
  ];

  const handleTabClick = (tab: ActiveTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#D4AF37]/35 bg-black/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-6 sm:px-10">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Luxury Aviator TOP GSS Identity */}
          <button
            type="button"
            id="nav-brand-logo"
            onClick={() => handleTabClick('home')}
            className="flex items-center gap-3.5 group text-left focus:outline-none cursor-pointer"
          >
            <div className="w-11 h-11 bg-gradient-to-br from-[#E30613] to-[#99000a] rounded-full flex items-center justify-center font-black text-white tracking-tighter text-sm shadow-[0_0_15px_rgba(227,6,19,0.5)] border-2 border-[#D4AF37] transition-transform group-hover:scale-105">
              GSS
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-mono font-black tracking-tight uppercase text-white group-hover:text-[#D4AF37] transition-colors">
                  Aviator Signal
                </span>
                <span className="text-[9px] px-2 py-0.5 rounded bg-[#D4AF37]/20 border border-[#D4AF37] text-[#D4AF37] font-mono font-bold">
                  TOP GSS
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-[0.25em] text-[#D4AF37] font-mono font-medium">
                Premium Aviation Telemetry
              </span>
            </div>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-xs uppercase tracking-widest font-semibold">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`relative py-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    isActive
                      ? 'text-[#D4AF37] font-bold opacity-100'
                      : 'text-white/70 hover:text-white hover:opacity-100'
                  }`}
                >
                  <span>{t(item.labelKey)}</span>
                  {isActive && (
                    <span className="absolute -bottom-1.5 left-0 right-0 h-[2px] bg-[#D4AF37] shadow-[0_0_8px_#D4AF37]" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Language Selector & User Auth */}
          <div className="hidden sm:flex items-center gap-4">
            {/* Language Selector */}
            <LanguageSelector variant="navbar" />

            {/* Auth Buttons / Profile info */}
            {user ? (
              <div className="flex items-center gap-3 pl-3 border-l border-[#D4AF37]/30">
                <button
                  type="button"
                  id="user-profile-badge"
                  onClick={() => handleTabClick('profile')}
                  className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-[#D4AF37]/50 bg-black/60 hover:bg-[#D4AF37]/15 transition-all text-left cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-[#E30613] border border-[#D4AF37] flex items-center justify-center text-white font-mono font-bold text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block text-xs">
                    <span className="font-bold text-white block truncate max-w-[90px]">
                      {user.username}
                    </span>
                    <span className="text-[9px] uppercase tracking-wider text-emerald-400 flex items-center gap-0.5 font-mono">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      {user.isVerified ? t('auth.verifiedBadge') : t('auth.unverifiedBadge')}
                    </span>
                  </div>
                </button>
                <button
                  type="button"
                  id="nav-logout-button"
                  onClick={onLogout}
                  title={t('nav.logout')}
                  className="p-2 rounded-full border border-[#D4AF37]/30 text-white/70 hover:text-[#E30613] hover:border-[#E30613] transition-all cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 pl-3 border-l border-[#D4AF37]/30">
                <button
                  type="button"
                  id="nav-login-btn"
                  onClick={() => onOpenAuth('login')}
                  className="px-3 py-2 text-xs uppercase tracking-widest text-white/80 hover:text-[#D4AF37] transition-colors cursor-pointer font-semibold"
                >
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  id="nav-signup-btn"
                  onClick={() => onOpenAuth('signup')}
                  className="px-4 py-2 bg-[#E30613] hover:bg-[#b8050f] text-white text-xs font-black uppercase tracking-widest rounded-full transition-all shadow-[0_0_15px_rgba(227,6,19,0.4)] cursor-pointer"
                >
                  {t('nav.signup')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile hamburger */}
          <div className="flex lg:hidden items-center gap-2">
            <LanguageSelector variant="compact" showLabel={false} />
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-black/60 border border-[#D4AF37]/40 text-white hover:border-[#D4AF37]"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-[#D4AF37]/35 bg-black/95 backdrop-blur-2xl px-6 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`mobile-nav-${item.id}`}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs uppercase tracking-widest font-semibold transition-all ${
                    isActive
                      ? 'bg-[#D4AF37]/20 text-[#D4AF37] border-l-4 border-[#D4AF37]'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {item.icon}
                    <span>{t(item.labelKey)}</span>
                  </div>
                  {isActive && <span className="w-2 h-2 rounded-full bg-[#E30613]" />}
                </button>
              );
            })}
          </div>

          <div className="pt-3 border-t border-[#D4AF37]/30 space-y-2">
            {user ? (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/60 border border-[#D4AF37]/40">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#E30613] border border-[#D4AF37] flex items-center justify-center text-white font-mono font-bold text-xs">
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">{user.username}</div>
                    <div className="text-[10px] text-white/50">{user.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="p-2 rounded text-white/60 hover:text-[#E30613]"
                  title={t('nav.logout')}
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth('login');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl border border-[#D4AF37]/50 text-white text-xs uppercase tracking-widest font-semibold text-center hover:bg-white/10"
                >
                  {t('nav.login')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onOpenAuth('signup');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-[#E30613] hover:bg-[#b8050f] text-white text-xs uppercase tracking-widest font-black text-center shadow-[0_0_15px_rgba(227,6,19,0.5)]"
                >
                  {t('nav.signup')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

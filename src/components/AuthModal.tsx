import React, { useState } from 'react';
import { UserProfile, ToastMessage } from '../types.ts';
import { useTranslation } from '../i18n/LanguageContext.tsx';
import {
  X,
  LogIn,
  UserPlus,
  MailCheck,
  KeyRound,
  Mail,
  User,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  initialMode: 'login' | 'signup' | 'verify';
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  pendingEmail?: string;
}

const DEMO_CODE = '849201';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode,
  onClose,
  onLoginSuccess,
  addToast,
  pendingEmail = 'aviator.pilot@example.com',
}) => {
  const { t, language } = useTranslation();
  const [mode, setMode] = useState<'login' | 'signup' | 'verify'>(initialMode);

  // Form states
  const [email, setEmail] = useState(pendingEmail);
  const [password, setPassword] = useState('secret123');
  const [username, setUsername] = useState('CaptainAviator');
  const [confirmPassword, setConfirmPassword] = useState('secret123');
  const [verificationCode, setVerificationCode] = useState(DEMO_CODE);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg(t('errors.requiredField'));
      return;
    }
    setErrorMsg(null);

    const user: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      username: username || email.split('@')[0],
      isVerified: true,
      preferredLanguage: language,
      createdAt: new Date().toLocaleDateString(),
      totalAnalyses: 42,
      accuracyRate: 94.2,
      vipStatus: 'pro',
    };

    onLoginSuccess(user);
    addToast({
      type: 'success',
      message: t('notif.loginSuccess'),
    });
    onClose();
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !username) {
      setErrorMsg(t('errors.requiredField'));
      return;
    }
    if (password.length < 6) {
      setErrorMsg(t('errors.passwordLength'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg(t('errors.passwordMatch'));
      return;
    }
    setErrorMsg(null);

    // Prompt user to email verification step
    setMode('verify');
    addToast({
      type: 'info',
      message: t('notif.registeredSuccess'),
    });
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.trim() !== DEMO_CODE && verificationCode.length !== 6) {
      setErrorMsg(t('notif.invalidCode'));
      return;
    }
    setErrorMsg(null);

    const user: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      username: username || 'AviatorUser',
      isVerified: true,
      preferredLanguage: language,
      createdAt: new Date().toLocaleDateString(),
      totalAnalyses: 1,
      accuracyRate: 100,
      vipStatus: 'basic',
    };

    onLoginSuccess(user);
    addToast({
      type: 'success',
      message: t('notif.codeVerified'),
    });
    onClose();
  };

  const handleResendCode = () => {
    setVerificationCode(DEMO_CODE);
    setErrorMsg(null);
    addToast({
      type: 'info',
      message: t('notif.codeResent'),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md aviator-glass-card border border-[#D4AF37]/50 rounded-2xl p-8 space-y-6 text-white shadow-[0_0_50px_rgba(0,0,0,0.8)]">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-6 right-6 p-1.5 border border-[#D4AF37]/40 rounded-full text-white/70 hover:text-white hover:border-[#D4AF37] hover:bg-[#D4AF37]/20 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Brand / Title Header */}
        <div className="space-y-1">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold font-mono">
            Identification Sécurisée TOP GSS
          </span>
          <h2 className="text-2xl font-mono font-bold text-white">
            {mode === 'login' && t('auth.loginTitle')}
            {mode === 'signup' && t('auth.signupTitle')}
            {mode === 'verify' && t('auth.verifyTitle')}
          </h2>
          <p className="text-xs text-white/70 font-sans">
            {mode === 'login' && t('auth.loginSubtitle')}
            {mode === 'signup' && t('auth.signupSubtitle')}
            {mode === 'verify' && t('auth.verifySubtitle')}
          </p>
        </div>

        {/* Mode switchers */}
        <div className="flex border-b border-[#D4AF37]/30 gap-6 text-xs uppercase tracking-widest font-mono">
          <button
            type="button"
            onClick={() => {
              setMode('login');
              setErrorMsg(null);
            }}
            className={`py-2 transition-colors relative cursor-pointer ${
              mode === 'login' ? 'text-white font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>{t('nav.login')}</span>
            {mode === 'login' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E30613]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
            }}
            className={`py-2 transition-colors relative cursor-pointer ${
              mode === 'signup' ? 'text-white font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>{t('nav.signup')}</span>
            {mode === 'signup' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E30613]" />}
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('verify');
              setErrorMsg(null);
            }}
            className={`py-2 transition-colors relative cursor-pointer ${
              mode === 'verify' ? 'text-white font-bold' : 'text-white/50 hover:text-white'
            }`}
          >
            <span>Vérification</span>
            {mode === 'verify' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#E30613]" />}
          </button>
        </div>

        {/* Error notice */}
        {errorMsg && (
          <div className="p-3 border border-[#E30613] bg-[#E30613]/20 text-white rounded-lg text-xs flex items-center gap-2 font-mono">
            <AlertCircle className="w-4 h-4 shrink-0 text-[#E30613]" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* MODE: LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-2.5 px-3 pr-8 text-sm font-mono text-white outline-none focus:border-[#D4AF37] transition-colors rounded-t"
                />
                <Mail className="w-4 h-4 text-[#D4AF37] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-2.5 px-3 pr-8 text-sm font-mono text-white outline-none focus:border-[#D4AF37] transition-colors rounded-t"
                />
                <KeyRound className="w-4 h-4 text-[#D4AF37] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <button
              type="submit"
              id="submit-login-btn"
              className="w-full py-4 bg-[#E30613] hover:bg-[#b8050f] text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(227,6,19,0.5)] rounded-xl border border-[#ff4d5a]/40"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t('auth.loginBtn')}</span>
            </button>

            <div className="p-3 border border-[#D4AF37]/25 bg-black/40 rounded-lg text-[10px] text-white/70 font-mono">
              <span>{t('auth.demoHint')}</span>
            </div>
          </form>
        )}

        {/* MODE: SIGNUP */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.usernameLabel')}
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-2 px-3 pr-8 text-sm font-mono text-white outline-none focus:border-[#D4AF37] transition-colors rounded-t"
                />
                <User className="w-4 h-4 text-[#D4AF37] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.emailLabel')}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-2 px-3 pr-8 text-sm font-mono text-white outline-none focus:border-[#D4AF37] transition-colors rounded-t"
                />
                <Mail className="w-4 h-4 text-[#D4AF37] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.passwordLabel')}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-2 px-3 pr-8 text-sm font-mono text-white outline-none focus:border-[#D4AF37] transition-colors rounded-t"
                />
                <KeyRound className="w-4 h-4 text-[#D4AF37] absolute right-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.confirmPasswordLabel')}
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-2 px-3 text-sm font-mono text-white outline-none focus:border-[#D4AF37] transition-colors rounded-t"
              />
            </div>

            <button
              type="submit"
              id="submit-signup-btn"
              className="w-full py-4 bg-[#E30613] hover:bg-[#b8050f] text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(227,6,19,0.5)] rounded-xl border border-[#ff4d5a]/40"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t('auth.signupBtn')}</span>
            </button>
          </form>
        )}

        {/* MODE: EMAIL VERIFICATION */}
        {mode === 'verify' && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div className="p-4 border border-[#D4AF37]/30 bg-black/40 rounded-xl space-y-1 font-mono text-xs">
              <div className="text-[10px] uppercase tracking-widest text-[#D4AF37]">{t('auth.codeSentTo')}</div>
              <div className="text-white font-bold">{email}</div>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] uppercase tracking-widest text-[#D4AF37] font-semibold">
                {t('auth.enterCode')}
              </label>
              <input
                type="text"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="849201"
                className="w-full bg-black/50 border-b-2 border-[#D4AF37]/50 py-3 text-white text-center font-mono text-2xl tracking-[0.3em] focus:outline-none focus:border-[#D4AF37] transition-colors rounded-t"
              />
            </div>

            <div className="flex items-center justify-between text-[11px] font-mono">
              <span className="text-white/60">{t('auth.verificationCodeDemo')}</span>
              <button
                type="button"
                onClick={handleResendCode}
                className="text-[#D4AF37] hover:underline uppercase tracking-wider font-bold cursor-pointer"
              >
                {t('auth.resendCode')}
              </button>
            </div>

            <button
              type="submit"
              id="submit-verify-btn"
              className="w-full py-4 bg-[#E30613] hover:bg-[#b8050f] text-white text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(227,6,19,0.5)] rounded-xl border border-[#ff4d5a]/40"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{t('auth.verifyBtn')}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

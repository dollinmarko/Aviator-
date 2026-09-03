import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { User, Phone, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'motion/react';
import { ADMIN_EMAIL } from '../types';

export const SignUpPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMessage) setErrorMessage(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    // Client validation
    if (!formData.username.trim()) {
      setErrorMessage('Le nom d’utilisateur est obligatoire.');
      return;
    }
    if (!formData.phone.trim()) {
      setErrorMessage('Le numéro de téléphone est obligatoire.');
      return;
    }
    if (!formData.email.trim()) {
      setErrorMessage('L’adresse e-mail est obligatoire.');
      return;
    }
    if (!formData.password) {
      setErrorMessage('Le mot de passe est obligatoire.');
      return;
    }
    if (formData.password.length < 8) {
      setErrorMessage('Le mot de passe doit comporter au moins 8 caractères.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setErrorMessage('Les mots de passe ne correspondent pas.');
      return;
    }

    setLoading(true);

    try {
      const res = await signUp(formData);
      if (!res.success) {
        setErrorMessage(res.error || 'Une erreur est survenue.');
      } else {
        const isAdminRegistering = formData.email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

        setSuccessMessage(
          res.message ||
            (isAdminRegistering
              ? 'Compte administrateur validé avec succès.'
              : `Votre inscription a été envoyée. L'administrateur (${ADMIN_EMAIL}) a été notifié pour confirmer votre compte.`)
        );

        setTimeout(() => {
          if (isAdminRegistering) {
            navigate('/app');
          } else {
            navigate('/compte-en-attente');
          }
        }, 2200);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#121212] border border-[#E50914]/40 rounded-2xl p-6 sm:p-8 shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
      >
        {/* TOP GSS Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.4)] text-3xl mb-3">
            ✈️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
            TOP GSS
          </h1>
          <p className="text-xs text-white/60 font-mono mt-1">
            Créer un compte TOP GSS
          </p>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-200">Inscription réussie !</p>
              <p className="mt-1 leading-relaxed">{successMessage}</p>
              <p className="mt-2 text-[10px] text-emerald-400 font-mono">Redirection automatique...</p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-[#E50914] text-[#ff8088] text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#E50914] shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nom utilisateur */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Nom d’utilisateur <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <User className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ex: Maverick99"
                required
                disabled={loading || Boolean(successMessage)}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Numéro téléphone */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Numéro de téléphone <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Phone className="w-4 h-4" />
              </div>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Ex: +33 6 12 34 56 78"
                required
                disabled={loading || Boolean(successMessage)}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Adresse e-mail <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="nom@exemple.com"
                required
                disabled={loading || Boolean(successMessage)}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Mot de passe (8 caractères min) <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
                minLength={8}
                disabled={loading || Boolean(successMessage)}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-white"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Confirmation du mot de passe */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Confirmation du mot de passe <span className="text-[#E50914]">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required
                disabled={loading || Boolean(successMessage)}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-white"
              >
                {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Note sur la validation administrateur */}
          <div className="p-3 bg-black/60 border border-[#E50914]/20 rounded-xl flex items-center gap-2.5 text-[11px] text-white/70">
            <ShieldCheck className="w-4 h-4 text-[#E50914] shrink-0" />
            <span>
              Validation requise : Chaque compte client est vérifié et confirmé par l'administrateur (<span className="text-[#ff8088] font-mono">{ADMIN_EMAIL}</span>).
            </span>
          </div>

          {/* Bouton Inscription */}
          <button
            type="submit"
            disabled={loading || Boolean(successMessage)}
            className="w-full mt-2 py-3.5 px-4 bg-[#E50914] hover:bg-[#b8050f] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.35)] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Création du compte...</span>
              </>
            ) : (
              <span>CRÉER MON COMPTE TOP GSS</span>
            )}
          </button>
        </form>

        {/* Footer link to Login */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/60">
          Vous avez déjà un compte ?{' '}
          <Link
            to="/connexion"
            className="text-[#E50914] font-bold hover:underline hover:text-[#ff3844] transition-colors"
          >
            Se connecter
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

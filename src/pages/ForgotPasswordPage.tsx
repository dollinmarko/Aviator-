import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage('Veuillez saisir votre adresse e-mail.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessMessage(res.message || 'E-mail envoyé avec succès.');
      } else {
        setErrorMessage(res.error || 'Une erreur est survenue.');
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
        <Link
          to="/connexion"
          className="inline-flex items-center gap-1.5 text-xs text-white/60 hover:text-white mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Retour à la connexion</span>
        </Link>

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-black border border-[#E50914] text-2xl mb-3 shadow-[0_0_15px_rgba(229,9,20,0.3)]">
            ✈️
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white">
            Mot de passe oublié
          </h1>
          <p className="text-xs text-white/60 mt-1">
            Entrez votre e-mail pour recevoir un lien de réinitialisation
          </p>
        </div>

        {successMessage && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm text-emerald-200">Instructions envoyées</p>
              <p className="mt-1 leading-relaxed">{successMessage}</p>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/60 border border-[#E50914] text-[#ff8088] text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-[#E50914] shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Adresse e-mail de votre compte
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nom@exemple.com"
                required
                disabled={loading}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 px-4 bg-[#E50914] hover:bg-[#b8050f] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.35)] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <span>ENVOYER LES INSTRUCTIONS</span>
            )}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

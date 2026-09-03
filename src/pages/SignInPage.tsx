import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { ADMIN_EMAIL } from '../types';

export const SignInPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [accountRejected, setAccountRejected] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setAccountRejected(false);

    if (!email.trim() || !password) {
      setErrorMessage('Veuillez renseigner votre e-mail et votre mot de passe.');
      return;
    }

    setLoading(true);

    try {
      const res = await signIn(email, password);

      if (!res.success) {
        setErrorMessage(res.error || 'Identifiants incorrects.');
      } else {
        // Evaluate status
        if (res.status === 'pending') {
          navigate('/compte-en-attente');
        } else if (res.status === 'rejected') {
          setAccountRejected(true);
        } else if (res.status === 'approved') {
          const from = (location.state as any)?.from?.pathname || '/app';
          navigate(from, { replace: true });
        } else {
          navigate('/app');
        }
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Une erreur est survenue lors de la connexion.');
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
        {/* Brand Logo */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.4)] text-3xl mb-3">
            ✈️
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white">
            TOP GSS
          </h1>
          <p className="text-xs text-white/60 font-mono mt-1">
            Connexion à l’espace membre
          </p>
        </div>

        {/* Account Rejected Notice */}
        {accountRejected && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-[#E50914] text-[#ff8088] text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm text-white">
              <ShieldAlert className="w-5 h-5 text-[#E50914]" />
              <span>Compte non validé</span>
            </div>
            <p className="text-white/80 leading-relaxed">
              Votre demande d'inscription n'a pas été acceptée par l’administrateur.
            </p>
            <div className="pt-2 border-t border-red-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <span className="text-white/60">Contact administrateur :</span>
              <a
                href={`mailto:${ADMIN_EMAIL}?subject=Demande%20de%20révision%20compte%20TOP%20GSS`}
                className="font-mono text-white underline hover:text-[#ff8088] break-all"
              >
                {ADMIN_EMAIL}
              </a>
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
          {/* E-mail */}
          <div>
            <label className="block text-xs font-semibold text-white/80 mb-1.5">
              Adresse e-mail
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
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-3 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-white/80">
                Mot de passe
              </label>
              <Link
                to="/mot-de-passe-oublie"
                className="text-[11px] text-[#E50914] hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-white/40">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full bg-[#1c1c1c] border border-white/15 focus:border-[#E50914] rounded-xl pl-10 pr-10 py-3 text-sm text-white placeholder-white/30 outline-none transition-all disabled:opacity-50"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-white/50 hover:text-white cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Bouton Se Connecter */}
          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 px-4 bg-[#E50914] hover:bg-[#b8050f] active:scale-[0.98] text-white font-bold rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(229,9,20,0.35)] disabled:opacity-60 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Connexion...</span>
              </>
            ) : (
              <span>SE CONNECTER</span>
            )}
          </button>
        </form>

        {/* Footer link to SignUp */}
        <div className="mt-6 pt-4 border-t border-white/10 text-center text-xs text-white/60">
          Vous n’avez pas encore de compte ?{' '}
          <Link
            to="/inscription"
            className="text-[#E50914] font-bold hover:underline hover:text-[#ff3844] transition-colors"
          >
            Créer un compte
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Clock, RefreshCw, LogOut, CheckCircle2, XCircle, ShieldAlert, Mail, Copy, Check } from 'lucide-react';
import { motion } from 'motion/react';
import { ADMIN_EMAIL } from '../types';

export const PendingAccountPage: React.FC = () => {
  const { user, profile, isApproved, isRejected, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [checking, setChecking] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);

  // If approved, redirect to /app
  useEffect(() => {
    if (isApproved) {
      navigate('/app', { replace: true });
    }
  }, [isApproved, navigate]);

  const handleRefresh = async () => {
    setChecking(true);
    await refreshProfile();
    setTimeout(() => {
      setChecking(false);
    }, 600);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/connexion', { replace: true });
  };

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(ADMIN_EMAIL);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const mailtoSubject = encodeURIComponent(`Confirmation compte TOP GSS - ${profile?.username || 'Client'}`);
  const mailtoBody = encodeURIComponent(
    `Bonjour Administrateur,\n\nJe viens de créer mon compte sur TOP GSS et je vous sollicite pour confirmer mon accès.\n\n- Nom d'utilisateur : ${profile?.username || ''}\n- E-mail : ${profile?.email || user?.email || ''}\n- Téléphone : ${profile?.phone || ''}\n\nMerci d'avance pour votre validation.\n`
  );

  return (
    <div className="min-h-screen bg-black text-white flex flex-col justify-center items-center px-4 py-8 sm:px-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-[#121212] border border-[#E50914]/40 rounded-2xl p-6 sm:p-8 text-center shadow-[0_10px_35px_rgba(0,0,0,0.85)]"
      >
        {/* Brand Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-black border-2 border-[#E50914] shadow-[0_0_20px_rgba(229,9,20,0.4)] text-3xl mb-4">
          ✈️
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-wider text-white mb-1">
          TOP GSS
        </h1>

        {isRejected ? (
          /* REJECTED STATE */
          <div className="my-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-red-950/60 border border-[#E50914] flex items-center justify-center text-[#E50914]">
              <XCircle className="w-9 h-9" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Compte refusé</h2>
              <p className="text-xs text-white/70 leading-relaxed max-w-xs mx-auto">
                Votre demande d'inscription n'a pas été acceptée.
              </p>
            </div>
            <div className="p-3.5 bg-black/60 rounded-xl border border-white/10 text-[11px] text-white/60 space-y-2">
              <p>Pour toute réclamation, contactez l’administrateur TOP GSS :</p>
              <div className="flex items-center justify-center gap-2 font-mono text-[#ff8088]">
                <Mail className="w-3.5 h-3.5 text-[#E50914]" />
                <span>{ADMIN_EMAIL}</span>
              </div>
            </div>
          </div>
        ) : (
          /* PENDING STATE */
          <div className="my-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-amber-950/40 border border-amber-500/60 flex items-center justify-center text-amber-400 relative">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white mb-1">Compte en attente de confirmation</h2>
              <p className="text-xs text-white/80 leading-relaxed max-w-xs mx-auto">
                Votre demande a été transmise à l'administrateur pour examen et validation.
              </p>
            </div>

            {/* Admin Reference Box */}
            <div className="p-3.5 bg-[#181818] rounded-xl border border-[#E50914]/40 text-left space-y-2">
              <div className="flex items-center justify-between text-[11px] text-white/60">
                <span className="flex items-center gap-1.5 font-medium text-white/80">
                  <Mail className="w-3.5 h-3.5 text-[#E50914]" />
                  E-mail de confirmation :
                </span>
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex items-center gap-1 text-[10px] text-[#ff8088] hover:text-white transition-colors cursor-pointer"
                  title="Copier l'e-mail de l'administrateur"
                >
                  {copiedEmail ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedEmail ? 'Copié' : 'Copier'}</span>
                </button>
              </div>
              <div className="text-xs font-mono font-bold text-[#E50914] bg-black/60 px-2.5 py-1.5 rounded-lg border border-white/5 break-all">
                {ADMIN_EMAIL}
              </div>
            </div>

            <div className="p-4 bg-black/60 rounded-xl border border-white/10 text-left text-xs space-y-2 font-mono">
              <div className="flex justify-between text-white/60 pb-1 border-b border-white/10">
                <span>Utilisateur :</span>
                <span className="text-white font-bold">{profile?.username || user?.email?.split('@')[0]}</span>
              </div>
              <div className="flex justify-between text-white/60 pb-1 border-b border-white/10">
                <span>Téléphone :</span>
                <span className="text-white">{profile?.phone || 'Non renseigné'}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Statut :</span>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold">
                  ⏳ En attente
                </span>
              </div>
            </div>

            {/* Direct Mailto to Admin */}
            <a
              href={`mailto:${ADMIN_EMAIL}?subject=${mailtoSubject}&body=${mailtoBody}`}
              className="w-full py-2.5 px-4 bg-[#1f1616] hover:bg-[#2c1b1b] border border-[#E50914]/50 text-[#ff8088] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer inline-flex"
            >
              <Mail className="w-4 h-4 text-[#E50914]" />
              <span>Écrire à l'administrateur ({ADMIN_EMAIL})</span>
            </a>

            <p className="text-[11px] text-white/50 leading-relaxed">
              Dès que l’administrateur valide votre compte, vous recevrez une notification et cette page s'actualisera automatiquement.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          {!isRejected && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={checking}
              className="w-full py-3 px-4 bg-[#1e1e1e] hover:bg-[#282828] border border-white/15 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RefreshCw className={`w-4 h-4 ${checking ? 'animate-spin text-[#E50914]' : ''}`} />
              <span>{checking ? 'Vérification en cours...' : 'Vérifier mon statut'}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSignOut}
            className="w-full py-3 px-4 bg-red-950/30 hover:bg-red-900/40 border border-[#E50914]/40 text-[#ff8088] font-semibold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Se déconnecter</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

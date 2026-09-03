import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageSquare, User, Shield, ChevronRight, Sparkles, Activity } from 'lucide-react';
import { motion } from 'motion/react';

export const DashboardPage: React.FC = () => {
  const { profile, user, isAdmin } = useAuth();
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Membre';

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-br from-[#1c0406] via-[#121212] to-black border border-[#E50914]/40 rounded-2xl p-5 shadow-lg relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#E50914]/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">✈️</span>
          <span className="text-xs font-mono uppercase tracking-widest text-[#E50914] font-bold">
            Espace Membre Officiel
          </span>
        </div>

        <h1 className="text-2xl font-black text-white tracking-tight">
          Bienvenue, <span className="text-[#E50914]">{displayName}</span>
        </h1>

        <p className="text-xs text-white/70 mt-1 leading-relaxed">
          Sélectionnez un module pour débuter vos sessions télémétriques ou échanger en direct avec la communauté.
        </p>

        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-white/60">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Statut : Compte Confirmé
          </span>
          <span className="text-white/40">VIP Access</span>
        </div>
      </motion.div>

      {/* 3 Main Action Cards */}
      <div className="space-y-3.5">
        {/* 1. 🗓️ PRÉDICTION */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            to="/prediction"
            className="flex items-center justify-between p-5 bg-[#121212] hover:bg-[#181818] border border-[#E50914]/40 hover:border-[#E50914] rounded-2xl shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-black border border-[#E50914]/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(229,9,20,0.3)] group-hover:scale-105 transition-transform">
                🗓️
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-wide text-white group-hover:text-[#E50914] transition-colors">
                    PRÉDICTION
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E50914]/20 text-[#ff5a64] border border-[#E50914]/40">
                    DIRECT
                  </span>
                </div>
                <p className="text-xs text-white/65 mt-0.5">
                  Accéder à la plateforme de prédiction
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* 2. 🗨️ GROUPE DE DISCUSSION */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            to="/discussion"
            className="flex items-center justify-between p-5 bg-[#121212] hover:bg-[#181818] border border-[#E50914]/40 hover:border-[#E50914] rounded-2xl shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-black border border-[#E50914]/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(229,9,20,0.3)] group-hover:scale-105 transition-transform relative">
                🗨️
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-black tracking-wide text-white group-hover:text-[#E50914] transition-colors">
                    GROUPE DE DISCUSSION
                  </h2>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40">
                    REALTIME
                  </span>
                </div>
                <p className="text-xs text-white/65 mt-0.5">
                  Discuter avec les membres TOP GSS
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* 3. 👤 PROFIL */}
        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Link
            to="/profil"
            className="flex items-center justify-between p-5 bg-[#121212] hover:bg-[#181818] border border-[#E50914]/40 hover:border-[#E50914] rounded-2xl shadow-md transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-13 h-13 rounded-2xl bg-black border border-[#E50914]/60 flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(229,9,20,0.3)] group-hover:scale-105 transition-transform">
                👤
              </div>
              <div className="text-left">
                <h2 className="text-base font-black tracking-wide text-white group-hover:text-[#E50914] transition-colors">
                  PROFIL
                </h2>
                <p className="text-xs text-white/65 mt-0.5">
                  Gérer votre compte
                </p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[#E50914] group-hover:translate-x-1 transition-all" />
          </Link>
        </motion.div>

        {/* 🛡️ ADMIN (Only if role === 'admin') */}
        {isAdmin && (
          <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
            <Link
              to="/admin"
              className="flex items-center justify-between p-5 bg-gradient-to-r from-[#200507] to-[#121212] border-2 border-[#E50914] rounded-2xl shadow-[0_0_20px_rgba(229,9,20,0.25)] transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-13 h-13 rounded-2xl bg-black border border-[#E50914] flex items-center justify-center text-2xl text-[#E50914]">
                  <Shield className="w-7 h-7 text-[#E50914]" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-black tracking-wide text-white group-hover:text-[#E50914] transition-colors">
                      TABLEAU ADMIN
                    </h2>
                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#E50914] text-white">
                      CONFIRMATIONS
                    </span>
                  </div>
                  <p className="text-xs text-white/70 mt-0.5">
                    Gérer les inscriptions en attente
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-[#E50914] group-hover:translate-x-1 transition-all" />
            </Link>
          </motion.div>
        )}
      </div>

      {/* Quick Security & Tips */}
      <div className="p-4 bg-black/60 rounded-2xl border border-white/10 text-xs text-white/60 space-y-1.5">
        <div className="flex items-center gap-1.5 text-white/90 font-semibold text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Conseil d'utilisation TOP GSS</span>
        </div>
        <p className="leading-relaxed">
          Pour une expérience optimale sur Android, installez l'application en cliquant sur le menu de votre navigateur puis <strong>« Ajouter à l'écran d'accueil »</strong>.
        </p>
      </div>
    </div>
  );
};

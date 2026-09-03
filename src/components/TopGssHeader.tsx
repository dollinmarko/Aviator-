import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LogOut,
  Shield,
  User as UserIcon,
  Database,
  CheckCircle2,
  AlertCircle,
  Settings
} from 'lucide-react';
import { saveSupabaseConfig, clearSupabaseConfig } from '../lib/supabaseClient';

export const TopGssHeader: React.FC = () => {
  const { user, profile, isAdmin, isConfigured, signOut } = useAuth();
  const navigate = useNavigate();
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [keyInput, setKeyInput] = useState('');

  const handleSignOut = async () => {
    await signOut();
    navigate('/connexion');
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput && keyInput) {
      saveSupabaseConfig(urlInput, keyInput);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-md border-b border-[#E50914]/30 px-4 py-3 transition-all">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo TOP GSS */}
          <Link to="/app" className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-black border border-[#E50914] flex items-center justify-center text-xl shadow-[0_0_12px_rgba(229,9,20,0.35)] group-hover:scale-105 transition-transform">
              ✈️
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-wider text-white font-sans flex items-center gap-1.5">
                TOP GSS
                <span className="text-[9px] uppercase px-1.5 py-0.2 rounded bg-[#E50914] text-white font-mono font-bold tracking-widest">
                  VIP
                </span>
              </span>
              <span className="text-[10px] text-white/50 font-mono tracking-tight">
                Plateforme Mobile Officielle
              </span>
            </div>
          </Link>

          {/* User info & quick actions */}
          <div className="flex items-center gap-2">
            {/* Supabase Status Indicator */}
            <button
              type="button"
              onClick={() => setShowConfigModal(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono border transition-all ${
                isConfigured
                  ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/40 hover:border-emerald-400'
                  : 'bg-amber-950/40 text-amber-300 border-amber-500/40 hover:border-amber-300'
              }`}
              title="Statut de connexion Supabase"
            >
              <Database className="w-3 h-3" />
              <span className="hidden sm:inline">
                {isConfigured ? 'Supabase Connecté' : 'Config Supabase'}
              </span>
              {isConfigured ? (
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
              ) : (
                <AlertCircle className="w-3 h-3 text-amber-300 animate-pulse" />
              )}
            </button>

            {user && (
              <>
                {/* Role badge */}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#E50914]/20 border border-[#E50914]/60 hover:bg-[#E50914] hover:text-white text-[#ff5a64] rounded-full text-[11px] font-mono font-bold transition-all"
                  >
                    <Shield className="w-3 h-3" />
                    <span>ADMIN</span>
                  </Link>
                )}

                {/* User avatar/name */}
                <Link
                  to="/profil"
                  className="flex items-center gap-1.5 px-2.5 py-1 bg-[#161616] hover:bg-[#222222] border border-white/10 rounded-full text-xs text-white transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5 text-[#E50914]" />
                  <span className="font-semibold max-w-[90px] sm:max-w-[120px] truncate">
                    {profile?.username || user.email?.split('@')[0]}
                  </span>
                </Link>

                {/* Sign out button */}
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-1.5 rounded-full text-white/60 hover:text-[#E50914] hover:bg-white/5 transition-colors cursor-pointer"
                  title="Se déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Supabase Connection Setup Modal */}
      {showConfigModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121212] border border-[#E50914]/40 rounded-2xl max-w-md w-full p-6 text-white space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-[#E50914]" />
                <h3 className="font-bold text-base">Configuration Supabase</h3>
              </div>
              <button
                onClick={() => setShowConfigModal(false)}
                className="text-white/60 hover:text-white text-xl font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs text-white/70 space-y-2">
              <p>
                L'application TOP GSS utilise <strong>Supabase</strong> pour l'authentification réelle,
                les profils (table <code className="text-[#ff5a64]">profiles</code>), le chat Realtime (table <code className="text-[#ff5a64]">messages</code>) et le panneau d'administration.
              </p>
              <div className="p-3 bg-black/50 rounded-lg border border-white/10 font-mono text-[11px] space-y-1">
                <div>Statut actuel : {isConfigured ? '🟢 Connecté' : '🟠 En attente de clés'}</div>
                <div>Variables : <span className="text-[#E50914]">VITE_SUPABASE_URL</span>, <span className="text-[#E50914]">VITE_SUPABASE_ANON_KEY</span></div>
              </div>
            </div>

            <form onSubmit={handleSaveConfig} className="space-y-3 text-xs">
              <div>
                <label className="block text-white/70 mb-1 font-mono">SUPABASE URL :</label>
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full bg-black border border-white/20 focus:border-[#E50914] rounded-lg p-2.5 text-white font-mono text-xs outline-none"
                />
              </div>

              <div>
                <label className="block text-white/70 mb-1 font-mono">SUPABASE ANON PUBLIC KEY :</label>
                <input
                  type="password"
                  value={keyInput}
                  onChange={(e) => setKeyInput(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full bg-black border border-white/20 focus:border-[#E50914] rounded-lg p-2.5 text-white font-mono text-xs outline-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#E50914] hover:bg-[#b8050f] text-white font-bold rounded-lg transition-all"
                >
                  Enregistrer & Connecter
                </button>
                {isConfigured && (
                  <button
                    type="button"
                    onClick={clearSupabaseConfig}
                    className="py-2.5 px-3 bg-red-950/40 border border-red-800 text-red-300 rounded-lg hover:bg-red-900/60"
                  >
                    Effacer
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

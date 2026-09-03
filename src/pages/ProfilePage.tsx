import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Phone,
  Mail,
  Shield,
  Clock,
  LogOut,
  Edit2,
  Check,
  Smartphone,
  Download,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export const ProfilePage: React.FC = () => {
  const { user, profile, updateProfile, signOut, isAdmin } = useAuth();
  const navigate = useNavigate();

  const [isEditing, setIsEditing] = useState(false);
  const [usernameInput, setUsernameInput] = useState(profile?.username || '');
  const [phoneInput, setPhoneInput] = useState(profile?.phone || '');
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim() || !phoneInput.trim()) {
      setErrorMsg('Tous les champs sont requis.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await updateProfile({
        username: usernameInput.trim(),
        phone: phoneInput.trim(),
      });

      if (res.success) {
        setSuccessMsg('Profil mis à jour avec succès !');
        setIsEditing(false);
      } else {
        setErrorMsg(res.error || 'Erreur lors de la mise à jour.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erreur inconnue.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/connexion');
  };

  const formattedDate = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      })
    : 'Récemment';

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      {/* Header Profile Avatar & Info */}
      <div className="bg-[#121212] border border-[#E50914]/40 rounded-2xl p-6 text-center shadow-lg relative overflow-hidden">
        <div className="w-20 h-20 mx-auto rounded-2xl bg-black border-2 border-[#E50914] flex items-center justify-center text-3xl shadow-[0_0_20px_rgba(229,9,20,0.35)] mb-3">
          ✈️
        </div>

        <h1 className="text-xl font-black text-white">
          {profile?.username || user?.email?.split('@')[0]}
        </h1>

        <p className="text-xs text-white/50 font-mono mt-0.5">{user?.email}</p>

        {/* Badges */}
        <div className="flex items-center justify-center gap-2 mt-3">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-mono font-bold border ${
              profile?.status === 'approved'
                ? 'bg-emerald-950/60 text-emerald-400 border-emerald-500/50'
                : profile?.status === 'pending'
                ? 'bg-amber-950/60 text-amber-300 border-amber-500/50'
                : 'bg-red-950/60 text-red-400 border-red-500/50'
            }`}
          >
            {profile?.status === 'approved'
              ? '✓ Compte Confirmé'
              : profile?.status === 'pending'
              ? '⏳ En attente'
              : '✕ Refusé'}
          </span>

          <span className="px-3 py-1 rounded-full text-[11px] font-mono font-bold bg-[#E50914]/20 text-[#ff616b] border border-[#E50914]/40">
            {isAdmin ? '🛡️ Administrateur' : '👤 Utilisateur VIP'}
          </span>
        </div>
      </div>

      {/* Alert notifications */}
      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3.5 rounded-xl bg-red-950/60 border border-[#E50914] text-[#ff8088] text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#E50914]" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Profile Details Card */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-white/10">
          <h2 className="text-xs font-mono uppercase tracking-widest text-white/70 font-bold">
            Informations du compte
          </h2>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => {
                setUsernameInput(profile?.username || '');
                setPhoneInput(profile?.phone || '');
                setIsEditing(true);
              }}
              className="text-xs text-[#E50914] hover:underline flex items-center gap-1 font-semibold"
            >
              <Edit2 className="w-3 h-3" />
              <span>Modifier</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-white/50 hover:text-white"
            >
              Annuler
            </button>
          )}
        </div>

        {isEditing ? (
          <form onSubmit={handleSave} className="space-y-3 text-xs">
            <div>
              <label className="block text-white/70 mb-1">Nom d’utilisateur</label>
              <input
                type="text"
                value={usernameInput}
                onChange={(e) => setUsernameInput(e.target.value)}
                required
                className="w-full bg-black border border-white/20 focus:border-[#E50914] rounded-lg p-2.5 text-white font-mono text-xs outline-none"
              />
            </div>
            <div>
              <label className="block text-white/70 mb-1">Numéro de téléphone</label>
              <input
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                required
                className="w-full bg-black border border-white/20 focus:border-[#E50914] rounded-lg p-2.5 text-white font-mono text-xs outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-[#E50914] hover:bg-[#b8050f] text-white font-bold rounded-lg text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Check className="w-3.5 h-3.5" />
              <span>{loading ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-white/50 flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-[#E50914]" /> Nom d’utilisateur
              </span>
              <span className="text-white font-semibold">{profile?.username || '—'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-white/50 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E50914]" /> Téléphone
              </span>
              <span className="text-white font-semibold">{profile?.phone || '—'}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-white/50 flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#E50914]" /> E-mail
              </span>
              <span className="text-white font-semibold truncate max-w-[180px]">{profile?.email || user?.email}</span>
            </div>

            <div className="flex items-center justify-between py-1.5 border-b border-white/5">
              <span className="text-white/50 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-[#E50914]" /> Date d'inscription
              </span>
              <span className="text-white/80">{formattedDate}</span>
            </div>
          </div>
        )}
      </div>

      {/* PWA & APK Installation Info */}
      <div className="bg-[#121212] border border-white/10 rounded-2xl p-5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2 text-white font-bold text-xs">
          <Smartphone className="w-4 h-4 text-[#E50914]" />
          <span>Application Mobile & APK Android</span>
        </div>
        <p className="text-xs text-white/60 leading-relaxed">
          TOP GSS est optimisé pour être installé directement sur votre smartphone Android sans passer par le store :
        </p>
        <div className="p-3 bg-black/60 rounded-xl border border-white/10 text-[11px] text-white/70 space-y-1 font-mono">
          <div>1. Ouvrez le menu de Google Chrome (⋮).</div>
          <div>2. Cliquez sur <strong>« Installer l'application »</strong> ou <strong>« Ajouter à l'écran d'accueil »</strong>.</div>
          <div>3. L'icône ✈️ TOP GSS apparaîtra sur votre écran comme une application native.</div>
        </div>
      </div>

      {/* Sign Out Button */}
      <button
        type="button"
        onClick={handleSignOut}
        className="w-full py-3.5 px-4 bg-red-950/40 hover:bg-red-900/60 border border-[#E50914]/50 text-[#ff8088] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm"
      >
        <LogOut className="w-4 h-4" />
        <span>SE DÉCONNECTER DE TOP GSS</span>
      </button>
    </div>
  );
};

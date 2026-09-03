import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Profile, ADMIN_EMAIL } from '../types';
import {
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  Users,
  Mail,
  Phone,
  Calendar,
  Loader2,
  RefreshCw,
  Terminal,
  Filter,
  Check,
  AlertCircle,
  Copy,
  UserCheck
} from 'lucide-react';
import { motion } from 'motion/react';

const LOCAL_STORAGE_PROFILES_KEY = 'topgss_local_profiles';

export const AdminPage: React.FC = () => {
  const { user, profile, isAdmin, isConfigured, simulateAdminStatusChange } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<string | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  const adminSqlScript = `UPDATE public.profiles
SET role = 'admin', status = 'approved'
WHERE email = '${ADMIN_EMAIL}';`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(adminSqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Fetch all profiles
  const fetchProfiles = async () => {
    setLoading(true);

    if (!isConfigured) {
      const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
      if (stored) {
        try {
          setProfiles(JSON.parse(stored));
        } catch (e) {
          setProfiles([]);
        }
      } else {
        // Mock profiles for testing admin capabilities immediately
        const mockProfiles: Profile[] = [
          {
            id: 'mock_1',
            username: 'Alex_Flight',
            phone: '+33 6 11 22 33 44',
            email: 'alex@example.com',
            role: 'user',
            status: 'pending',
            created_at: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: 'mock_2',
            username: 'Sarah_Vip',
            phone: '+33 6 55 66 77 88',
            email: 'sarah@example.com',
            role: 'user',
            status: 'approved',
            created_at: new Date(Date.now() - 86400000).toISOString(),
          },
          {
            id: 'mock_3',
            username: 'Marc_Aviateur',
            phone: '+33 6 99 88 77 66',
            email: 'marc@example.com',
            role: 'user',
            status: 'pending',
            created_at: new Date(Date.now() - 7200000).toISOString(),
          },
        ];
        if (profile) {
          mockProfiles.unshift(profile);
        }
        setProfiles(mockProfiles);
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(mockProfiles));
      }
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching admin profiles:', error.message);
      } else if (data) {
        setProfiles(data as Profile[]);
      }
    } catch (err) {
      console.error('Exception fetching profiles:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, [isConfigured]);

  // Handle Approve or Reject
  const handleUpdateStatus = async (targetUserId: string, newStatus: 'approved' | 'rejected') => {
    setActionInProgress(targetUserId);
    setNotificationStatus(null);

    const targetUser = profiles.find((p) => p.id === targetUserId);

    if (isConfigured) {
      try {
        const { error } = await supabase
          .from('profiles')
          .update({
            status: newStatus,
            updated_at: new Date().toISOString(),
          })
          .eq('id', targetUserId);

        if (error) {
          alert(`Erreur lors de la mise à jour : ${error.message}`);
        } else {
          // Trigger Edge Function notify-user if deployed
          try {
            if (targetUser) {
              await supabase.functions.invoke('notify-user', {
                body: {
                  email: targetUser.email,
                  username: targetUser.username,
                  type: newStatus,
                  appUrl: window.location.origin,
                },
              });
            }
          } catch (fnErr) {
            console.warn('Edge function not deployed yet, continuing:', fnErr);
          }

          setNotificationStatus(`Utilisateur ${newStatus === 'approved' ? 'confirmé' : 'refusé'} avec succès.`);
          await fetchProfiles();
        }
      } catch (err: any) {
        alert(err.message || 'Une erreur est survenue');
      } finally {
        setActionInProgress(null);
      }
      return;
    }

    // Local sandbox simulation
    if (simulateAdminStatusChange) {
      await simulateAdminStatusChange(targetUserId, newStatus);
    }
    const updated = profiles.map((p) =>
      p.id === targetUserId ? { ...p, status: newStatus } : p
    );
    setProfiles(updated);
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(updated));
    setNotificationStatus(
      `[Mode Sandbox] Utilisateur ${newStatus === 'approved' ? 'confirmé' : 'refusé'}. E-mail simulé vers ${targetUser?.email}.`
    );
    setActionInProgress(null);
  };

  // Filter and search
  const filteredProfiles = profiles.filter((item) => {
    if (filterStatus !== 'all' && item.status !== filterStatus) {
      return false;
    }
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const u = item.username?.toLowerCase() || '';
      const e = item.email?.toLowerCase() || '';
      const p = item.phone?.toLowerCase() || '';
      return u.includes(q) || e.includes(q) || p.includes(q);
    }
    return true;
  });

  const countPending = profiles.filter((p) => p.status === 'pending').length;
  const countApproved = profiles.filter((p) => p.status === 'approved').length;
  const countRejected = profiles.filter((p) => p.status === 'rejected').length;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#E50914]/30">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-black border-2 border-[#E50914] flex items-center justify-center text-2xl text-[#E50914] shadow-[0_0_15px_rgba(229,9,20,0.35)]">
            <Shield className="w-6 h-6 text-[#E50914]" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-wide text-white flex items-center gap-2">
              TABLEAU ADMIN
              <span className="text-[10px] px-2 py-0.5 rounded bg-[#E50914] text-white font-mono font-bold tracking-widest uppercase">
                GESTION
              </span>
            </h1>
            <p className="text-xs text-white/60 font-mono">
              Validation des inscriptions & membres TOP GSS
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={fetchProfiles}
            disabled={loading}
            className="p-2.5 rounded-xl bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 text-white transition-all cursor-pointer"
            title="Rafraîchir"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#E50914]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => setShowSqlGuide(!showSqlGuide)}
            className="flex items-center gap-1.5 px-3 py-2 bg-[#1a1a1a] hover:bg-[#252525] border border-white/10 rounded-xl text-xs font-mono text-white/80 transition-all cursor-pointer"
          >
            <Terminal className="w-3.5 h-3.5 text-[#E50914]" />
            <span>Script SQL Admin</span>
          </button>
        </div>
      </div>

      {/* Admin Email Identity Banner */}
      <div className="p-4 bg-[#141414] border border-[#E50914]/40 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black border border-[#E50914] flex items-center justify-center text-[#E50914] shrink-0 font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">Administrateur Référent</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Actif
              </span>
            </div>
            <p className="text-white/60 font-mono text-xs mt-0.5">
              E-mail de confirmation des demandes clients : <strong className="text-[#E50914]">{ADMIN_EMAIL}</strong>
            </p>
          </div>
        </div>

        <div className="text-[11px] text-white/50 bg-black/60 px-3 py-1.5 rounded-xl border border-white/5 font-mono">
          Toutes les notifications d'inscription et de validation sont associées à cet e-mail.
        </div>
      </div>

      {/* SQL First Admin Guide Banner */}
      {showSqlGuide && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="p-4 bg-[#141414] border border-[#E50914]/50 rounded-2xl space-y-3 text-xs"
        >
          <div className="flex items-center justify-between font-bold text-white">
            <span className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#E50914]" />
              Définition SQL directe de l'administrateur ({ADMIN_EMAIL})
            </span>
            <button
              type="button"
              onClick={() => setShowSqlGuide(false)}
              className="text-white/50 hover:text-white"
            >
              ✕
            </button>
          </div>
          <p className="text-white/70 leading-relaxed">
            Pour forcer ou réinitialiser les droits administrateurs dans votre base de données Supabase, exécutez la commande suivante dans votre <strong>Supabase SQL Editor</strong> :
          </p>
          <div className="relative">
            <pre className="p-3.5 bg-black rounded-xl border border-white/10 font-mono text-[11px] text-[#ff8088] select-all overflow-x-auto whitespace-pre">
              {adminSqlScript}
            </pre>
            <button
              type="button"
              onClick={handleCopySql}
              className="absolute top-2 right-2 px-2.5 py-1 rounded bg-[#202020] hover:bg-[#303030] text-[11px] font-mono text-white flex items-center gap-1.5 transition-colors cursor-pointer border border-white/10"
            >
              {copiedSql ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedSql ? 'Copié !' : 'Copier SQL'}</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Notifications */}
      {notificationStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>{notificationStatus}</span>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2 text-center font-mono">
        <button
          onClick={() => setFilterStatus('all')}
          className={`p-3 rounded-xl border transition-all ${
            filterStatus === 'all'
              ? 'bg-[#E50914]/20 border-[#E50914] text-white'
              : 'bg-[#121212] border-white/10 text-white/60 hover:text-white'
          }`}
        >
          <div className="text-lg font-black">{profiles.length}</div>
          <div className="text-[10px] uppercase tracking-wider">Total</div>
        </button>

        <button
          onClick={() => setFilterStatus('pending')}
          className={`p-3 rounded-xl border transition-all ${
            filterStatus === 'pending'
              ? 'bg-amber-950/40 border-amber-500 text-amber-300'
              : 'bg-[#121212] border-white/10 text-white/60 hover:text-amber-400'
          }`}
        >
          <div className="text-lg font-black text-amber-400">{countPending}</div>
          <div className="text-[10px] uppercase tracking-wider">En attente</div>
        </button>

        <button
          onClick={() => setFilterStatus('approved')}
          className={`p-3 rounded-xl border transition-all ${
            filterStatus === 'approved'
              ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300'
              : 'bg-[#121212] border-white/10 text-white/60 hover:text-emerald-400'
          }`}
        >
          <div className="text-lg font-black text-emerald-400">{countApproved}</div>
          <div className="text-[10px] uppercase tracking-wider">Confirmés</div>
        </button>

        <button
          onClick={() => setFilterStatus('rejected')}
          className={`p-3 rounded-xl border transition-all ${
            filterStatus === 'rejected'
              ? 'bg-red-950/40 border-red-500 text-red-300'
              : 'bg-[#121212] border-white/10 text-white/60 hover:text-red-400'
          }`}
        >
          <div className="text-lg font-black text-red-400">{countRejected}</div>
          <div className="text-[10px] uppercase tracking-wider">Refusés</div>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-white/40 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Rechercher par nom, e-mail ou téléphone..."
          className="w-full bg-[#141414] border border-white/10 focus:border-[#E50914] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-white/40 outline-none transition-all"
        />
      </div>

      {/* User Profiles List */}
      <div className="space-y-3">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-white/50 gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-[#E50914]" />
            <span className="text-xs font-mono">Chargement des utilisateurs...</span>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="p-8 text-center bg-[#121212] rounded-2xl border border-white/10 text-white/50 text-xs">
            Aucun utilisateur trouvé pour ce filtre.
          </div>
        ) : (
          filteredProfiles.map((p) => {
            const isProcessing = actionInProgress === p.id;
            const formattedDate = p.created_at
              ? new Date(p.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Récemment';

            return (
              <div
                key={p.id}
                className="p-4 bg-[#121212] border border-white/10 hover:border-[#E50914]/40 rounded-2xl shadow-sm space-y-3 transition-all"
              >
                {/* User Card Header */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-white">{p.username}</span>
                      {p.role === 'admin' && (
                        <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[9px] font-mono font-bold">
                          ADMIN
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-[11px] text-white/60 font-mono">
                      <span className="flex items-center gap-1">
                        <Mail className="w-3 h-3 text-[#E50914]" />
                        {p.email}
                      </span>
                      {p.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-[#E50914]" />
                          {p.phone}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                      p.status === 'approved'
                        ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/50'
                        : p.status === 'pending'
                        ? 'bg-amber-950/60 text-amber-300 border border-amber-500/50'
                        : 'bg-red-950/60 text-red-300 border border-red-500/50'
                    }`}
                  >
                    {p.status === 'approved'
                      ? '✓ Confirmé'
                      : p.status === 'pending'
                      ? '⏳ En attente'
                      : '✕ Refusé'}
                  </span>
                </div>

                {/* Footer details & Action Buttons */}
                <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="text-[10px] text-white/40 font-mono flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> Inscrit le {formattedDate}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* CONFIRMER BUTTON */}
                    {p.status !== 'approved' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.id, 'approved')}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        <span>CONFIRMER</span>
                      </button>
                    )}

                    {/* REFUSER BUTTON */}
                    {p.status !== 'rejected' && (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(p.id, 'rejected')}
                        disabled={isProcessing}
                        className="flex-1 sm:flex-initial px-3.5 py-1.5 bg-red-950 hover:bg-red-900 border border-[#E50914] text-[#ff8088] rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1 cursor-pointer disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        <span>REFUSER</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

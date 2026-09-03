import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { Profile, SignUpFormData, ADMIN_EMAIL } from '../types';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isApproved: boolean;
  isPending: boolean;
  isRejected: boolean;
  isConfigured: boolean;
  signUp: (data: SignUpFormData) => Promise<{ success: boolean; message?: string; error?: string }>;
  signIn: (email: string, password: string) => Promise<{ success: boolean; status?: string; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string; error?: string }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ success: boolean; error?: string }>;
  refreshProfile: () => Promise<void>;
  simulateAdminStatusChange?: (userId: string, newStatus: 'approved' | 'rejected') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = 'topgss_local_user';
const LOCAL_STORAGE_PROFILES_KEY = 'topgss_local_profiles';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isConfigured = isSupabaseConfigured();

  // Helper: fetch profile from Supabase
  const fetchProfile = useCallback(async (userId: string, userEmail?: string): Promise<Profile | null> => {
    if (!isConfigured) {
      // Local fallback profiles
      const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
      const profiles: Profile[] = stored ? JSON.parse(stored) : [];
      const found = profiles.find((p) => p.id === userId);
      return found || null;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching Supabase profile:', error.message);
        return null;
      }

      // If profile doesn't exist yet, attempt to create it from auth metadata
      const isEmailAdmin = userEmail?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

      if (!data && userEmail) {
        const defaultProfile: Partial<Profile> = {
          id: userId,
          email: userEmail,
          username: userEmail.split('@')[0],
          phone: '',
          role: isEmailAdmin ? 'admin' : 'user',
          status: isEmailAdmin ? 'approved' : 'pending',
          created_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('profiles')
          .insert(defaultProfile)
          .select()
          .maybeSingle();

        if (!insertErr && inserted) {
          return inserted as Profile;
        }
      }

      if (data) {
        const prof = data as Profile;
        if (isEmailAdmin && (prof.role !== 'admin' || prof.status !== 'approved')) {
          prof.role = 'admin';
          prof.status = 'approved';
          // Asynchronously update in DB to keep synchronized
          supabase
            .from('profiles')
            .update({ role: 'admin', status: 'approved' })
            .eq('id', userId)
            .then();
        }
        return prof;
      }

      return null;
    } catch (err) {
      console.error('Exception fetching profile:', err);
      return null;
    }
  }, [isConfigured]);

  // Refresh current user profile
  const refreshProfile = useCallback(async () => {
    if (user) {
      const prof = await fetchProfile(user.id, user.email);
      setProfile(prof);
    }
  }, [user, fetchProfile]);

  // Initial session check
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      setIsLoading(true);

      if (!isConfigured) {
        // Check local storage mock session
        const storedUser = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            if (mounted) {
              setUser(parsed.user);
              setProfile(parsed.profile);
            }
          } catch (e) {
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
          }
        }
        if (mounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        if (mounted) {
          setSession(initialSession);
          setUser(initialSession?.user ?? null);
        }

        if (initialSession?.user) {
          const prof = await fetchProfile(initialSession.user.id, initialSession.user.email);
          if (mounted) setProfile(prof);
        }
      } catch (err) {
        console.warn('Supabase getSession error:', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    initAuth();

    // Supabase auth state change listener
    let authListenerSubscription: { unsubscribe: () => void } | null = null;
    if (isConfigured) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
        if (!mounted) return;
        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          const prof = await fetchProfile(currentSession.user.id, currentSession.user.email);
          if (mounted) setProfile(prof);
        } else {
          setProfile(null);
        }
      });
      authListenerSubscription = subscription;
    }

    return () => {
      mounted = false;
      if (authListenerSubscription) {
        authListenerSubscription.unsubscribe();
      }
    };
  }, [isConfigured, fetchProfile]);

  // Listen to realtime status updates on profiles for the logged-in user
  useEffect(() => {
    if (!isConfigured || !user) return;

    const channel = supabase
      .channel(`profile-updates-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new as Profile);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isConfigured, user]);

  // Sign Up
  const signUp = async (data: SignUpFormData) => {
    const { username, phone, email, password, confirmPassword } = data;

    // Validation
    if (!username.trim() || !phone.trim() || !email.trim() || !password) {
      return { success: false, error: 'Tous les champs sont obligatoires.' };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Veuillez saisir une adresse e-mail valide.' };
    }

    if (password.length < 8) {
      return { success: false, error: 'Le mot de passe doit comporter au moins 8 caractères.' };
    }

    if (password !== confirmPassword) {
      return { success: false, error: 'Les mots de passe ne correspondent pas.' };
    }

    if (phone.replace(/[^0-9+]/g, '').length < 8) {
      return { success: false, error: 'Veuillez saisir un numéro de téléphone valide.' };
    }

    // 1. SUPABASE REAL REGISTRATION
    if (isConfigured) {
      try {
        // Check uniqueness in profiles table first
        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', username.trim())
          .maybeSingle();

        if (existingUser) {
          return { success: false, error: 'Ce nom utilisateur existe déjà.' };
        }

        const { data: existingPhone } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', phone.trim())
          .maybeSingle();

        if (existingPhone) {
          return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
        }

        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email: email.trim().toLowerCase(),
          password,
          options: {
            data: {
              username: username.trim(),
              phone: phone.trim(),
            },
          },
        });

        if (authErr) {
          if (authErr.message.toLowerCase().includes('already registered')) {
            return { success: false, error: 'Cet e-mail est déjà utilisé.' };
          }
          return { success: false, error: authErr.message };
        }

        const isUserAdmin = email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase();

        if (authData.user) {
          // Explicit profile insertion/upsert
          const newProfile: Profile = {
            id: authData.user.id,
            username: username.trim(),
            phone: phone.trim(),
            email: email.trim().toLowerCase(),
            role: isUserAdmin ? 'admin' : 'user',
            status: isUserAdmin ? 'approved' : 'pending',
            avatar_url: null,
            created_at: new Date().toISOString(),
          };

          const { error: profErr } = await supabase
            .from('profiles')
            .upsert(newProfile, { onConflict: 'id' });

          if (profErr) {
            console.warn('Profile upsert warning:', profErr.message);
          }

          setProfile(newProfile);
          setUser(authData.user);

          // If regular user, trigger notification to the administrator (myuantojah@gmail.com)
          if (!isUserAdmin) {
            try {
              await supabase.functions.invoke('notify-user', {
                body: {
                  type: 'new_registration',
                  adminEmail: ADMIN_EMAIL,
                  clientUsername: username.trim(),
                  clientEmail: email.trim().toLowerCase(),
                  clientPhone: phone.trim(),
                  appUrl: window.location.origin,
                },
              });
            } catch (fnErr) {
              console.warn('Notification to admin failed or edge function not ready:', fnErr);
            }
          }
        }

        if (isUserAdmin) {
          return {
            success: true,
            message: "Compte administrateur initialisé et confirmé avec succès. Bienvenue, Administrateur TOP GSS.",
          };
        }

        return {
          success: true,
          message:
            `Votre inscription a été envoyée. L'administrateur (${ADMIN_EMAIL}) a été notifié pour confirmer votre compte.`,
        };
      } catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue lors de l\'inscription.' };
      }
    }

    // 2. LOCAL SANDBOX FALLBACK (when Supabase credentials are pending)
    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    const profiles: Profile[] = stored ? JSON.parse(stored) : [];

    if (profiles.some((p) => p.username.toLowerCase() === username.toLowerCase().trim())) {
      return { success: false, error: 'Ce nom utilisateur existe déjà.' };
    }
    if (profiles.some((p) => p.email.toLowerCase() === email.toLowerCase().trim())) {
      return { success: false, error: 'Cet e-mail est déjà utilisé.' };
    }
    if (profiles.some((p) => p.phone === phone.trim())) {
      return { success: false, error: 'Ce numéro de téléphone est déjà utilisé.' };
    }

    const isSandboxAdmin =
      email.trim().toLowerCase() === ADMIN_EMAIL.toLowerCase() || profiles.length === 0;

    const newId = `usr_${Date.now()}`;
    const newProfile: Profile = {
      id: newId,
      username: username.trim(),
      phone: phone.trim(),
      email: email.trim().toLowerCase(),
      role: isSandboxAdmin ? 'admin' : 'user',
      status: isSandboxAdmin ? 'approved' : 'pending',
      avatar_url: null,
      created_at: new Date().toISOString(),
    };

    const mockUser: any = {
      id: newId,
      email: email.trim().toLowerCase(),
      user_metadata: { username: username.trim(), phone: phone.trim() },
    };

    profiles.push(newProfile);
    localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(profiles));
    localStorage.setItem(
      LOCAL_STORAGE_SESSION_KEY,
      JSON.stringify({ user: mockUser, profile: newProfile })
    );

    setUser(mockUser);
    setProfile(newProfile);

    if (isSandboxAdmin) {
      return {
        success: true,
        message: "Compte administrateur créé et activé automatiquement !",
      };
    }

    return {
      success: true,
      message:
        `Votre inscription a été envoyée. L'administrateur (${ADMIN_EMAIL}) a été notifié pour confirmer votre compte.`,
    };
  };

  // Sign In
  const signIn = async (email: string, password: string) => {
    if (!email.trim() || !password) {
      return { success: false, error: 'Veuillez saisir votre e-mail et votre mot de passe.' };
    }

    // 1. SUPABASE REAL AUTH
    if (isConfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password,
        });

        if (error) {
          return { success: false, error: 'Identifiants incorrects.' };
        }

        if (data.user) {
          setUser(data.user);
          setSession(data.session);
          const prof = await fetchProfile(data.user.id, data.user.email);
          setProfile(prof);

          return {
            success: true,
            status: prof?.status || 'pending',
          };
        }

        return { success: false, error: 'Impossible de récupérer la session.' };
      } catch (err: any) {
        return { success: false, error: err.message || 'Une erreur est survenue lors de la connexion.' };
      }
    }

    // 2. LOCAL SANDBOX FALLBACK
    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    const profiles: Profile[] = stored ? JSON.parse(stored) : [];
    const found = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase().trim());

    if (!found) {
      return { success: false, error: 'Identifiants incorrects.' };
    }

    const mockUser: any = {
      id: found.id,
      email: found.email,
      user_metadata: { username: found.username, phone: found.phone },
    };

    localStorage.setItem(
      LOCAL_STORAGE_SESSION_KEY,
      JSON.stringify({ user: mockUser, profile: found })
    );

    setUser(mockUser);
    setProfile(found);

    return {
      success: true,
      status: found.status,
    };
  };

  // Sign Out
  const signOut = async () => {
    if (isConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.warn('SignOut error:', e);
      }
    }
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  // Reset Password
  const resetPassword = async (email: string) => {
    if (!email.trim()) {
      return { success: false, error: 'Veuillez renseigner votre e-mail.' };
    }

    if (isConfigured) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/connexion`,
        });
        if (error) {
          return { success: false, error: error.message };
        }
        return { success: true, message: 'Un e-mail de réinitialisation a été envoyé à votre adresse.' };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    return {
      success: true,
      message: 'Un lien de réinitialisation vous a été transmis si l’adresse est valide.',
    };
  };

  // Update Profile
  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user || !profile) return { success: false, error: 'Non authentifié.' };

    if (isConfigured) {
      try {
        // Prevent altering role or status directly via profile update
        const safeUpdates = { ...updates };
        delete (safeUpdates as any).role;
        delete (safeUpdates as any).status;

        const { data, error } = await supabase
          .from('profiles')
          .update({ ...safeUpdates, updated_at: new Date().toISOString() })
          .eq('id', user.id)
          .select()
          .single();

        if (error) {
          return { success: false, error: error.message };
        }

        setProfile(data as Profile);
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local fallback
    const updated = { ...profile, ...updates };
    setProfile(updated);
    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (stored) {
      const list: Profile[] = JSON.parse(stored);
      const idx = list.findIndex((p) => p.id === user.id);
      if (idx !== -1) {
        list[idx] = updated;
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(list));
      }
    }
    localStorage.setItem(
      LOCAL_STORAGE_SESSION_KEY,
      JSON.stringify({ user, profile: updated })
    );
    return { success: true };
  };

  // Local helper to simulate admin validation in offline sandbox mode
  const simulateAdminStatusChange = async (userId: string, newStatus: 'approved' | 'rejected') => {
    if (isConfigured) {
      await supabase
        .from('profiles')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);
      return;
    }

    const stored = localStorage.getItem(LOCAL_STORAGE_PROFILES_KEY);
    if (stored) {
      const list: Profile[] = JSON.parse(stored);
      const idx = list.findIndex((p) => p.id === userId);
      if (idx !== -1) {
        list[idx].status = newStatus;
        localStorage.setItem(LOCAL_STORAGE_PROFILES_KEY, JSON.stringify(list));
      }
    }

    if (user && user.id === userId && profile) {
      const updated = { ...profile, status: newStatus };
      setProfile(updated);
      localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify({ user, profile: updated }));
    }
  };

  const isMainAdmin =
    user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase() ||
    profile?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase();

  const isAdmin = profile?.role === 'admin' || isMainAdmin;
  const isApproved = profile?.status === 'approved' || isMainAdmin;
  const isPending = !isMainAdmin && profile?.status === 'pending';
  const isRejected = !isMainAdmin && profile?.status === 'rejected';

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        isAdmin,
        isApproved,
        isPending,
        isRejected,
        isConfigured,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updateProfile,
        refreshProfile,
        simulateAdminStatusChange,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export type Language = 'fr' | 'mg' | 'en';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
  flag: string;
  short: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  isVerified: boolean;
  preferredLanguage: Language;
  createdAt: string;
  totalAnalyses: number;
  accuracyRate: number;
  vipStatus: 'basic' | 'pro' | 'elite';
}

export interface AnalysisInput {
  lastTime: string; // HH:MM:SS format
  lastMultiplier: number; // e.g. 5.89
  strategy?: 'conservative' | 'balanced' | 'aggressive' | 'rose';
  customNotes?: string;
}

export interface AnalysisResult {
  id: string;
  timestamp: string;
  inputTime: string;
  inputMultiplier: number;
  targetTime: string;
  targetMultiplierMin: number;
  targetMultiplierMax: number;
  confidenceScore: number; // e.g. 95%
  riskLevel: 'low' | 'medium' | 'high';
  recommendedCashout: number;
  patternDetected: string;
  status: 'pending' | 'success' | 'failed' | 'missed';
  isRoseSignal?: boolean; // Signal Rose (10x+ or Category Rose)
  categorie?: 'ROSE' | string;
  intervalle?: string;
  intervalleSecondes?: number;
  details?: {
    secondes_cible: number;
    valeur_temps: number;
    variation: number;
    coherence_temps: number;
    coherence_cote: number;
    cote_brute?: number;
  };
}

export interface UserSettings {
  soundEnabled: boolean;
  autoAnalyze: boolean;
  minConfidence: number;
  riskTolerance: 'low' | 'medium' | 'high';
  targetMultiplierAlert: number;
  defaultLanguage: Language;
}

export type ActiveTab = 'home' | 'analyzer' | 'history' | 'profile' | 'settings';

export type UserRole = 'user' | 'admin';
export type UserStatus = 'pending' | 'approved' | 'rejected';

// E-mail officiel de l'administrateur TOP GSS pour la confirmation des demandes clients
export const ADMIN_EMAIL = 'myuantojah@gmail.com';

export interface Profile {
  id: string;
  username: string;
  phone: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id: string;
  user_id: string;
  message: string;
  created_at: string;
  profile?: {
    id?: string;
    username: string;
    role: UserRole;
    avatar_url?: string | null;
    status?: UserStatus;
    email?: string;
    phone?: string;
    created_at?: string;
  };
  profiles?: {
    username: string;
    role: UserRole;
    avatar_url?: string | null;
  };
}

export interface SignUpFormData {
  username: string;
  phone: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
}

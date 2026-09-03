import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2, ShieldAlert } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requireAdmin = false }) => {
  const { user, profile, isLoading, isAdmin, isApproved } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-2 border-[#E50914] border-t-transparent animate-spin mb-4" />
        <p className="text-sm font-mono text-white/70 tracking-widest uppercase">Chargement TOP GSS...</p>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!user) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Require admin
  if (requireAdmin) {
    if (!isAdmin) {
      return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#E50914]/20 border border-[#E50914] flex items-center justify-center mb-4 text-[#E50914]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white mb-2">Accès refusé</h1>
          <p className="text-white/70 max-w-sm mb-6 text-sm">
            Cette section est strictement réservée aux administrateurs de TOP GSS.
          </p>
          <a
            href="/app"
            className="px-6 py-3 bg-[#E50914] hover:bg-[#b8050f] text-white font-bold rounded-xl text-sm transition-all"
          >
            Retour au Dashboard
          </a>
        </div>
      );
    }
    return <>{children}</>;
  }

  // Pending or Rejected user -> redirect to waiting page
  if (!isApproved) {
    return <Navigate to="/compte-en-attente" replace />;
  }

  return <>{children}</>;
};

import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageSquare, User, Shield, Home } from 'lucide-react';

export const MobileNavigation: React.FC = () => {
  const { user, isAdmin, isApproved } = useAuth();

  if (!user || !isApproved) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-black/95 backdrop-blur-lg border-t border-[#E50914]/30 px-3 py-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] transition-all">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Accueil */}
        <NavLink
          to="/app"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#E50914] font-bold scale-105'
                : 'text-white/60 hover:text-white'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-sans tracking-tight">Accueil</span>
        </NavLink>

        {/* 🗓️ Prédiction */}
        <NavLink
          to="/prediction"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#E50914] font-bold scale-105'
                : 'text-white/60 hover:text-white'
            }`
          }
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-sans tracking-tight">Prédiction</span>
        </NavLink>

        {/* 🗨️ Discussion */}
        <NavLink
          to="/discussion"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#E50914] font-bold scale-105'
                : 'text-white/60 hover:text-white'
            }`
          }
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5 mb-0.5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#E50914] animate-pulse" />
          </div>
          <span className="text-[11px] font-sans tracking-tight">Discussion</span>
        </NavLink>

        {/* 👤 Profil */}
        <NavLink
          to="/profil"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
              isActive
                ? 'text-[#E50914] font-bold scale-105'
                : 'text-white/60 hover:text-white'
            }`
          }
        >
          <User className="w-5 h-5 mb-0.5" />
          <span className="text-[11px] font-sans tracking-tight">Profil</span>
        </NavLink>

        {/* 🛡️ Admin (if admin) */}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              `flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-[#E50914] font-bold scale-105'
                  : 'text-white/60 hover:text-white'
              }`
            }
          >
            <Shield className="w-5 h-5 mb-0.5 text-[#ff5a64]" />
            <span className="text-[11px] font-sans tracking-tight text-[#ff5a64]">Admin</span>
          </NavLink>
        )}
      </div>
    </nav>
  );
};

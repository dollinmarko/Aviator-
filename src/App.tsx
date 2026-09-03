import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { TopGssHeader } from './components/TopGssHeader';
import { MobileNavigation } from './components/MobileNavigation';

// Pages
import { SignUpPage } from './pages/SignUpPage';
import { SignInPage } from './pages/SignInPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { PendingAccountPage } from './pages/PendingAccountPage';
import { DashboardPage } from './pages/DashboardPage';
import { PredictionPage } from './pages/PredictionPage';
import { DiscussionPage } from './pages/DiscussionPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminPage } from './pages/AdminPage';

// App Layout Shell for Protected Sections
const AuthenticatedShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans antialiased relative selection:bg-[#E50914] selection:text-white pb-20">
      {/* Discreet Dark Background with TOP GSS Jet Emblem */}
      <div
        className="fixed inset-0 -z-20 pointer-events-none opacity-20 bg-center bg-cover"
        style={{ backgroundImage: "url('/aviator_top_gss.jpg')" }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-black/85" />

      {/* Header */}
      <TopGssHeader />

      {/* Page Content */}
      <main className="flex-1 w-full relative z-10">{children}</main>

      {/* Fixed Bottom Navigation for Mobile Devices */}
      <MobileNavigation />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Authentication Pages */}
          <Route path="/inscription" element={<SignUpPage />} />
          <Route path="/connexion" element={<SignInPage />} />
          <Route path="/mot-de-passe-oublie" element={<ForgotPasswordPage />} />
          <Route path="/compte-en-attente" element={<PendingAccountPage />} />

          {/* Protected Routes (Require Approved User) */}
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <AuthenticatedShell>
                  <DashboardPage />
                </AuthenticatedShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/prediction"
            element={
              <ProtectedRoute>
                <AuthenticatedShell>
                  <PredictionPage />
                </AuthenticatedShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/discussion"
            element={
              <ProtectedRoute>
                <AuthenticatedShell>
                  <DiscussionPage />
                </AuthenticatedShell>
              </ProtectedRoute>
            }
          />

          <Route
            path="/profil"
            element={
              <ProtectedRoute>
                <AuthenticatedShell>
                  <ProfilePage />
                </AuthenticatedShell>
              </ProtectedRoute>
            }
          />

          {/* Protected Admin Route (Requires role = 'admin') */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute requireAdmin={true}>
                <AuthenticatedShell>
                  <AdminPage />
                </AuthenticatedShell>
              </ProtectedRoute>
            }
          />

          {/* Default Redirect to /app or /connexion */}
          <Route path="/" element={<Navigate to="/app" replace />} />
          <Route path="*" element={<Navigate to="/app" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

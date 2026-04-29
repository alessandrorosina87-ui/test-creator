import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RouterProvider, Routes, useRouter } from './Router.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import { LoginPage } from './components/auth/LoginPage.tsx'
import { AdminDashboard } from './components/admin/AdminDashboard.tsx'
import { ArchivioVerifiche } from './components/admin/ArchivioVerifiche.tsx'
import { VerificaDetail } from './components/admin/VerificaDetail.tsx'
import { EditVerifica } from './components/admin/EditVerifica.tsx'
import { PrivacyPolicy } from './components/PrivacyPolicy.tsx'
import { Contatti } from './components/Contatti.tsx'
import { SuperAdminDashboard } from './components/superadmin/SuperAdminDashboard.tsx'
import { GestioneUtenti } from './components/superadmin/GestioneUtenti.tsx'
import { DettaglioUtente } from './components/superadmin/DettaglioUtente.tsx'
import { onAuthStateChanged } from './services/authService.ts'
import { isCurrentUserAdmin } from './services/adminService.ts'
import type { User } from 'firebase/auth'

// ── Componente wrapper per le rotte utente protette ──
function ProtectedRoute({ component: Component, params }: { component: React.ComponentType<{ params: Record<string, string> }>; params: Record<string, string> }) {
  const { navigate } = useRouter();
  const [user, setUser] = useState<User | null | undefined>(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged((u) => setUser(u));
    return unsub;
  }, []);

  if (user === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    navigate('/login');
    return null;
  }

  return <Component params={params} />;
}

// ── Componente wrapper per le rotte SUPER ADMIN protette ──
function SuperAdminProtectedRoute({ component: Component, params }: { component: React.ComponentType<{ params: Record<string, string> }>; params: Record<string, string> }) {
  const { navigate } = useRouter();
  const [state, setState] = useState<'loading' | 'admin' | 'denied'>('loading');

  useEffect(() => {
    const unsub = onAuthStateChanged(async (u) => {
      if (!u) {
        navigate('/login');
        return;
      }
      const admin = await isCurrentUserAdmin();
      if (admin) {
        setState('admin');
      } else {
        setState('denied');
      }
    });
    return unsub;
  }, []);

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-red-200 border-t-red-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-slate-400">Verifica permessi admin...</p>
        </div>
      </div>
    );
  }

  if (state === 'denied') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 p-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl p-8 shadow-xl border border-slate-200 dark:border-slate-700 max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-500 mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
          </div>
          <h2 className="text-xl font-display font-bold dark:text-white mb-2">Accesso Negato</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            Non hai i permessi di amministratore per accedere a questa sezione.
          </p>
          <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-3 rounded-xl bg-primary-600 text-white font-bold hover:bg-primary-700 transition-colors shadow-sm">
            Torna alla tua Dashboard
          </button>
        </div>
      </div>
    );
  }

  return <Component params={params} />;
}

// Wrapper components for protected routes
function ProtectedDashboard({ params }: { params: Record<string, string> }) {
  return <ProtectedRoute component={AdminDashboard} params={params} />;
}
function ProtectedArchivio({ params }: { params: Record<string, string> }) {
  return <ProtectedRoute component={ArchivioVerifiche} params={params} />;
}
function ProtectedDetail({ params }: { params: Record<string, string> }) {
  return <ProtectedRoute component={VerificaDetail} params={params} />;
}
function ProtectedEdit({ params }: { params: Record<string, string> }) {
  return <ProtectedRoute component={EditVerifica} params={params} />;
}

// Super Admin wrappers
function ProtectedSuperDashboard({ params }: { params: Record<string, string> }) {
  return <SuperAdminProtectedRoute component={SuperAdminDashboard} params={params} />;
}
function ProtectedGestioneUtenti({ params }: { params: Record<string, string> }) {
  return <SuperAdminProtectedRoute component={GestioneUtenti} params={params} />;
}
function ProtectedDettaglioUtente({ params }: { params: Record<string, string> }) {
  return <SuperAdminProtectedRoute component={DettaglioUtente} params={params} />;
}

function AppRoutes() {
  return (
    <Routes
      routes={[
        { pattern: '/', component: LandingPage },
        { pattern: '/creator', component: App },
        { pattern: '/login', component: LoginPage },
        { pattern: '/privacy', component: PrivacyPolicy },
        { pattern: '/contatti', component: Contatti },
        { pattern: '/admin', component: LoginPage }, // Fallback for old /admin route
        { pattern: '/admin/dashboard', component: ProtectedDashboard },
        { pattern: '/admin/archivio', component: ProtectedArchivio },
        { pattern: '/admin/verifica/:codice', component: ProtectedDetail },
        { pattern: '/admin/modifica/:codice', component: ProtectedEdit },
        // ── Super Admin routes ──
        { pattern: '/superadmin', component: ProtectedSuperDashboard },
        { pattern: '/superadmin/utenti', component: ProtectedGestioneUtenti },
        { pattern: '/superadmin/utente/:uid', component: ProtectedDettaglioUtente },
      ]}
    />
  );
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider>
      <AppRoutes />
    </RouterProvider>
  </StrictMode>,
)

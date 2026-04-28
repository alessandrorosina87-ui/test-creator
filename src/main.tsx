import { StrictMode, useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { RouterProvider, Routes, useRouter } from './Router.tsx'
import { LandingPage } from './components/LandingPage.tsx'
import { LoginPage } from './components/auth/LoginPage.tsx'
import { RegisterPage } from './components/auth/RegisterPage.tsx'
import { AdminDashboard } from './components/admin/AdminDashboard.tsx'
import { ArchivioVerifiche } from './components/admin/ArchivioVerifiche.tsx'
import { VerificaDetail } from './components/admin/VerificaDetail.tsx'
import { EditVerifica } from './components/admin/EditVerifica.tsx'
import { PrivacyPolicy } from './components/PrivacyPolicy.tsx'
import { Contatti } from './components/Contatti.tsx'
import { onAuthStateChanged } from './services/authService.ts'
import type { User } from 'firebase/auth'

// ── Componente wrapper per le rotte admin protette ──
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
    // Redirect to login
    navigate('/login');
    return null;
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

function AppRoutes() {
  return (
    <Routes
      routes={[
        { pattern: '/', component: LandingPage },
        { pattern: '/creator', component: App },
        { pattern: '/login', component: LoginPage },
        { pattern: '/register', component: RegisterPage },
        { pattern: '/privacy', component: PrivacyPolicy },
        { pattern: '/contatti', component: Contatti },
        { pattern: '/admin', component: LoginPage }, // Fallback for old /admin route
        { pattern: '/admin/dashboard', component: ProtectedDashboard },
        { pattern: '/admin/archivio', component: ProtectedArchivio },
        { pattern: '/admin/verifica/:codice', component: ProtectedDetail },
        { pattern: '/admin/modifica/:codice', component: ProtectedEdit },
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

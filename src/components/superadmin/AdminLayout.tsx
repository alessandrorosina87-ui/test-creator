/**
 * AdminLayout.tsx
 * Layout wrapper con sidebar responsive per l'area Super Admin.
 */
import { useState } from 'react';
import {
  LayoutDashboard, Users, ArrowLeft, LogOut, Menu, X, Shield, Moon, Sun,
} from 'lucide-react';
import { useRouter } from '../../Router';
import { logout } from '../../services/authService';

interface AdminLayoutProps {
  children: React.ReactNode;
  activePage: 'dashboard' | 'utenti' | 'dettaglio';
}

export function AdminLayout({ children, activePage }: AdminLayoutProps) {
  const { navigate } = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('darkMode', String(next));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, path: '/superadmin' },
    { id: 'utenti' as const, label: 'Gestione Utenti', icon: Users, path: '/superadmin/utenti' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900 transition-colors">
      {/* ─── Overlay mobile ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ─── Sidebar ─── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col
      `}>
        {/* Header Sidebar */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center text-white shadow-lg">
                <Shield size={20} />
              </div>
              <div>
                <h2 className="font-display font-bold text-base dark:text-white">Admin Panel</h2>
                <p className="text-xs text-slate-400">VerifichePro</p>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700">
              <X size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => { navigate(item.path); setSidebarOpen(false); }}
              className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                ${activePage === item.id
                  ? 'bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 text-red-700 dark:text-red-400 shadow-sm border border-red-100 dark:border-red-900/30'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white'
                }
              `}
            >
              <item.icon size={18} />
              {item.label}
            </button>
          ))}
        </nav>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-700 space-y-1">
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? 'Modalità chiara' : 'Modalità scura'}
          </button>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all"
          >
            <ArrowLeft size={18} />
            Torna al sito
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <LogOut size={18} />
            Esci
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─── */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top bar mobile */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 lg:hidden">
          <div className="flex items-center justify-between px-4 h-16">
            <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
              <Menu size={20} className="text-slate-600 dark:text-slate-400" />
            </button>
            <div className="flex items-center gap-2">
              <Shield size={18} className="text-red-500" />
              <span className="font-display font-bold text-sm dark:text-white">Admin Panel</span>
            </div>
            <div className="w-9" /> {/* spacer */}
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

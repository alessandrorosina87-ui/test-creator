/**
 * SuperAdminDashboard.tsx
 * Dashboard principale dell'area amministratore con statistiche piattaforma.
 */
import { useState, useEffect } from 'react';
import { Users, FileText, Activity, TrendingUp, Clock, UserCheck } from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getPlatformStats, getAllUsers } from '../../services/adminService';
import type { UserProfile } from '../../types';

export function SuperAdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalVerifiche: 0, activeUsersMonth: 0, verificheToday: 0 });
  const [recentUsers, setRecentUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [platformStats, users] = await Promise.all([
        getPlatformStats(),
        getAllUsers(),
      ]);
      setStats(platformStats);
      setRecentUsers(users.slice(0, 8));
    } catch (e) {
      console.error('Errore caricamento dati admin:', e);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { label: 'Utenti Totali', value: stats.totalUsers, icon: Users, gradient: 'from-blue-500 to-indigo-500', shadow: 'shadow-blue-500/20' },
    { label: 'Verifiche Totali', value: stats.totalVerifiche, icon: FileText, gradient: 'from-emerald-500 to-teal-500', shadow: 'shadow-emerald-500/20' },
    { label: 'Utenti Attivi (mese)', value: stats.activeUsersMonth, icon: Activity, gradient: 'from-amber-500 to-orange-500', shadow: 'shadow-amber-500/20' },
    { label: 'Verifiche Oggi', value: stats.verificheToday, icon: TrendingUp, gradient: 'from-pink-500 to-rose-500', shadow: 'shadow-pink-500/20' },
  ];

  const Skeleton = () => <span className="inline-block w-14 h-8 bg-slate-100 dark:bg-slate-700 rounded animate-pulse" />;

  return (
    <AdminLayout activePage="dashboard">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-display font-bold dark:text-white">
            Dashboard Piattaforma
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">
            Panoramica generale dell'utilizzo di VerifichePro
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          {statCards.map(stat => (
            <div key={stat.label} className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">{stat.label}</p>
                  <p className="text-3xl font-display font-bold dark:text-white">
                    {loading ? <Skeleton /> : stat.value}
                  </p>
                </div>
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.gradient} flex items-center justify-center text-white shadow-lg ${stat.shadow}`}>
                  <stat.icon size={22} />
                </div>
              </div>
              <div className={`absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br ${stat.gradient} rounded-full opacity-5`} />
            </div>
          ))}
        </div>

        {/* Utenti Recenti */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                <UserCheck size={20} />
              </div>
              <h2 className="font-display font-bold text-lg dark:text-white">Utenti Registrati</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{stats.totalUsers} totali</span>
          </div>

          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-14 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : recentUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p>Nessun utente registrato</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {recentUsers.map(user => (
                <div key={user.uid} className="flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white
                      ${user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-primary-500 to-indigo-500'}`}
                    >
                      {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-sm dark:text-white truncate">
                        {user.displayName || 'Senza nome'}
                        {user.role === 'admin' && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 uppercase tracking-wider">
                            Admin
                          </span>
                        )}
                      </p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-6 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <FileText size={13} />
                      <span>{user.verifiche_count} verifiche</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} />
                      <span>{user.last_login ? new Date(user.last_login).toLocaleDateString('it-IT') : '—'}</span>
                    </div>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                      ${user.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}
                    `}>
                      {user.status === 'active' ? 'Attivo' : 'Bloccato'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

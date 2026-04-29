/**
 * DettaglioUtente.tsx
 * Pagina dettaglio singolo utente per l'area Super Admin.
 * Mostra profilo, statistiche di utilizzo, barra progresso e lista verifiche con codici.
 */
import { useState, useEffect } from 'react';
import {
  ArrowLeft, User, Mail, Calendar, Clock, FileText, Hash, Shield,
  Activity, Ban, Unlock, TrendingUp,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getUserProfile, getUserVerifiche, updateUserStatus, getPlatformStats } from '../../services/adminService';
import { useRouter } from '../../Router';
import type { UserProfile, VerificaDB } from '../../types';

export function DettaglioUtente({ params }: { params: Record<string, string> }) {
  const { navigate } = useRouter();
  const uid = params.uid || '';
  const [user, setUser] = useState<UserProfile | null>(null);
  const [verifiche, setVerifiche] = useState<VerificaDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [avgVerifiche, setAvgVerifiche] = useState(0);

  useEffect(() => {
    if (uid) loadData();
  }, [uid]);

  const loadData = async () => {
    try {
      const [profile, userVerifiche, stats] = await Promise.all([
        getUserProfile(uid),
        getUserVerifiche(uid),
        getPlatformStats(),
      ]);
      setUser(profile);
      setVerifiche(userVerifiche);
      // Calcola media verifiche per utente
      if (stats.totalUsers > 0) {
        setAvgVerifiche(Math.round(stats.totalVerifiche / stats.totalUsers));
      }
    } catch (e) {
      console.error('Errore caricamento dettaglio utente:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async () => {
    if (!user) return;
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'bloccare' : 'sbloccare';
    if (!window.confirm(`Sei sicuro di voler ${action} "${user.displayName || user.email}"?`)) return;
    try {
      await updateUserStatus(user.uid, newStatus);
      await loadData();
    } catch (e) {
      console.error(e);
      alert("Errore durante l'operazione.");
    }
  };

  // Calcolo percentuale utilizzo
  const userVerificheCount = verifiche.length;
  const usagePercentage = avgVerifiche > 0
    ? Math.min(Math.round((userVerificheCount / (avgVerifiche * 2)) * 100), 100)
    : (userVerificheCount > 0 ? 50 : 0);

  // Verifiche ultimo mese
  const now = new Date();
  const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString();
  const verificheUltimoMese = verifiche.filter(v => v.data_creazione > oneMonthAgo).length;

  if (loading) {
    return (
      <AdminLayout activePage="dettaglio">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse" />
          <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-2xl animate-pulse" />
        </div>
      </AdminLayout>
    );
  }

  if (!user) {
    return (
      <AdminLayout activePage="dettaglio">
        <div className="max-w-5xl mx-auto text-center py-20">
          <User size={48} className="mx-auto mb-4 text-slate-300" />
          <h2 className="text-xl font-bold dark:text-white mb-2">Utente non trovato</h2>
          <p className="text-slate-400 mb-6">Il profilo richiesto non esiste o è stato eliminato.</p>
          <button onClick={() => navigate('/superadmin/utenti')} className="text-primary-600 font-bold hover:underline">
            ← Torna alla lista utenti
          </button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout activePage="dettaglio">
      <div className="max-w-5xl mx-auto">
        {/* Back */}
        <button
          onClick={() => navigate('/superadmin/utenti')}
          className="flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 mb-6 transition-colors group text-sm font-medium"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Torna alla lista utenti
        </button>

        {/* Profilo Card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold text-white shadow-lg
                ${user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-primary-500 to-indigo-500'}`}
              >
                {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-display font-bold dark:text-white flex items-center gap-2 flex-wrap">
                  {user.displayName || 'Senza nome'}
                  {user.role === 'admin' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                      <Shield size={12} /> Admin
                    </span>
                  )}
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold
                    ${user.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
                  >
                    {user.status === 'active' ? 'Attivo' : 'Bloccato'}
                  </span>
                </h1>
                <p className="text-slate-400 text-sm font-mono mt-1">UID: {user.uid}</p>
              </div>
            </div>
            {user.role !== 'admin' && (
              <button
                onClick={handleToggleBlock}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shadow-sm
                  ${user.status === 'active'
                    ? 'bg-amber-600 text-white hover:bg-amber-700'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'}`}
              >
                {user.status === 'active' ? <><Ban size={16} /> Blocca Utente</> : <><Unlock size={16} /> Sblocca Utente</>}
              </button>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <Mail size={18} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email</p>
                <p className="text-sm font-medium dark:text-white truncate">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <Calendar size={18} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrato il</p>
                <p className="text-sm font-medium dark:text-white">
                  {user.created_at ? new Date(user.created_at).toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' }) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <Clock size={18} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ultimo accesso</p>
                <p className="text-sm font-medium dark:text-white">
                  {user.last_login ? new Date(user.last_login).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
              <FileText size={18} className="text-slate-400" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verifiche create</p>
                <p className="text-sm font-medium dark:text-white">{userVerificheCount}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Statistiche Utilizzo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Barra Utilizzo */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600">
                <Activity size={20} />
              </div>
              <h2 className="font-display font-bold dark:text-white">Utilizzo Piattaforma</h2>
            </div>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Livello attività</span>
                  <span className="text-sm font-bold dark:text-white">{usagePercentage}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-1000 ease-out
                      ${usagePercentage > 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                        usagePercentage > 30 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                          'bg-gradient-to-r from-red-500 to-pink-500'}`}
                    style={{ width: `${usagePercentage}%` }}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center">
                  <p className="text-2xl font-display font-bold dark:text-white">{userVerificheCount}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Totali</p>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 text-center">
                  <p className="text-2xl font-display font-bold dark:text-white">{verificheUltimoMese}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Ultimo mese</p>
                </div>
              </div>
            </div>
          </div>

          {/* Stats rapide */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600">
                <TrendingUp size={20} />
              </div>
              <h2 className="font-display font-bold dark:text-white">Riepilogo</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-sm text-slate-500">Media piattaforma</span>
                <span className="text-sm font-bold dark:text-white">{avgVerifiche} verifiche/utente</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-sm text-slate-500">Questo utente</span>
                <span className="text-sm font-bold dark:text-white">{userVerificheCount} verifiche</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-sm text-slate-500">Ultima creazione</span>
                <span className="text-sm font-bold dark:text-white">
                  {verifiche.length > 0 ? new Date(verifiche[0].data_creazione).toLocaleDateString('it-IT') : '—'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50">
                <span className="text-sm text-slate-500">Rispetto alla media</span>
                <span className={`text-sm font-bold ${userVerificheCount >= avgVerifiche ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {userVerificheCount >= avgVerifiche ? '↑ Sopra la media' : '↓ Sotto la media'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Lista Verifiche con Codici */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600">
                <Hash size={20} />
              </div>
              <h2 className="font-display font-bold dark:text-white">Codici Verifica Creati</h2>
            </div>
            <span className="text-xs text-slate-400 font-mono">{verifiche.length} totali</span>
          </div>

          {verifiche.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <FileText size={32} className="mx-auto mb-3 opacity-40" />
              <p>Questo utente non ha ancora creato verifiche</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {verifiche.map(v => (
                <button
                  key={v.codice_verifica}
                  onClick={() => navigate(`/admin/verifica/${v.codice_verifica}`)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors text-left group"
                >
                  <div className="flex items-center gap-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-gradient-to-r from-primary-50 to-indigo-50 dark:from-primary-900/20 dark:to-indigo-900/20 text-primary-700 dark:text-primary-400 text-xs font-bold font-mono border border-primary-100 dark:border-primary-900/30">
                      {v.codice_verifica}
                    </span>
                    <div>
                      <p className="font-bold text-sm dark:text-white group-hover:text-primary-600 transition-colors">{v.titolo}</p>
                      <p className="text-xs text-slate-400">{v.materia} — {v.classe}</p>
                    </div>
                  </div>
                  <div className="hidden sm:flex items-center gap-4 text-xs text-slate-400">
                    <span>{v.domande?.length || 0} domande</span>
                    <span>{new Date(v.data_creazione).toLocaleDateString('it-IT')}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

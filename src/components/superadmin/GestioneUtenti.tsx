/**
 * GestioneUtenti.tsx
 * Pagina di gestione utenti per l'area Super Admin.
 * Include tabella, ricerca, filtri, export CSV e azioni su ogni utente.
 */
import { useState, useEffect, useMemo } from 'react';
import {
  Search, Download, Eye, Ban, Unlock, Trash2, Users, Filter,
  FileText, Clock, Mail, ChevronDown,
} from 'lucide-react';
import { AdminLayout } from './AdminLayout';
import { getAllUsers, getUserVerifiche, updateUserStatus, deleteUserProfile } from '../../services/adminService';
import { useRouter } from '../../Router';
import type { UserProfile } from '../../types';

type FilterType = 'all' | 'active' | 'blocked' | 'new' | 'top';

export function GestioneUtenti() {
  const { navigate } = useRouter();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [verificheCounts, setVerificheCounts] = useState<Record<string, number>>({});

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const allUsers = await getAllUsers();
      setUsers(allUsers);
      // Carica conteggi verifiche per ogni utente
      const counts: Record<string, number> = {};
      await Promise.all(
        allUsers.map(async (user) => {
          try {
            const verifiche = await getUserVerifiche(user.uid);
            counts[user.uid] = verifiche.length;
          } catch { counts[user.uid] = user.verifiche_count || 0; }
        })
      );
      setVerificheCounts(counts);
    } catch (e) {
      console.error('Errore caricamento utenti:', e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleBlock = async (user: UserProfile) => {
    const newStatus = user.status === 'active' ? 'blocked' : 'active';
    const action = newStatus === 'blocked' ? 'bloccare' : 'sbloccare';
    if (!window.confirm(`Sei sicuro di voler ${action} l'utente "${user.displayName || user.email}"?`)) return;
    try {
      await updateUserStatus(user.uid, newStatus);
      await loadUsers();
    } catch (e) {
      console.error(e);
      alert(`Errore durante l'operazione.`);
    }
  };

  const handleDelete = async (user: UserProfile) => {
    if (!window.confirm(`⚠️ ATTENZIONE: Stai per eliminare il profilo di "${user.displayName || user.email}". Questa azione è irreversibile. Procedere?`)) return;
    try {
      await deleteUserProfile(user.uid);
      await loadUsers();
      alert('Profilo utente eliminato.');
    } catch (e) {
      console.error(e);
      alert("Errore durante l'eliminazione.");
    }
  };

  const exportCSV = () => {
    const header = 'Nome,Email,Ruolo,Stato,Data Registrazione,Ultimo Accesso,Verifiche Create\n';
    const rows = filteredUsers.map(u =>
      `"${u.displayName}","${u.email}","${u.role}","${u.status}","${u.created_at ? new Date(u.created_at).toLocaleDateString('it-IT') : ''}","${u.last_login ? new Date(u.last_login).toLocaleDateString('it-IT') : ''}","${verificheCounts[u.uid] || 0}"`
    ).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `utenti_verifichepro_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Filtro ricerca
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(u =>
        (u.displayName || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        u.uid.toLowerCase().includes(q)
      );
    }

    // Filtri rapidi
    const now = new Date();
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7).toISOString();

    switch (activeFilter) {
      case 'active': result = result.filter(u => u.status === 'active'); break;
      case 'blocked': result = result.filter(u => u.status === 'blocked'); break;
      case 'new': result = result.filter(u => u.created_at > sevenDaysAgo); break;
      case 'top': result = result.sort((a, b) => (verificheCounts[b.uid] || 0) - (verificheCounts[a.uid] || 0)); break;
    }

    return result;
  }, [users, searchQuery, activeFilter, verificheCounts]);

  const filters: { id: FilterType; label: string; count?: number }[] = [
    { id: 'all', label: 'Tutti', count: users.length },
    { id: 'active', label: 'Attivi', count: users.filter(u => u.status === 'active').length },
    { id: 'blocked', label: 'Bloccati', count: users.filter(u => u.status === 'blocked').length },
    { id: 'new', label: 'Nuovi (7gg)' },
    { id: 'top', label: 'Top Utenti' },
  ];

  return (
    <AdminLayout activePage="utenti">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-display font-bold dark:text-white">Gestione Utenti</h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm">{users.length} utenti registrati</p>
          </div>
          <button
            onClick={exportCSV}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-sm hover:bg-emerald-700 transition-colors shadow-sm"
          >
            <Download size={16} /> Esporta CSV
          </button>
        </div>

        {/* Search & Filters */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm mb-6">
          <div className="p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cerca per nome, email o UID..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none text-sm transition-all"
              />
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`inline-flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-medium transition-all
                ${showFilters ? 'border-primary-300 bg-primary-50 dark:bg-primary-900/20 text-primary-600' : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
            >
              <Filter size={16} />
              Filtri
              <ChevronDown size={14} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <div className="px-4 pb-4 flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
              {filters.map(f => (
                <button
                  key={f.id}
                  onClick={() => setActiveFilter(f.id)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all
                    ${activeFilter === f.id
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                >
                  {f.label}{f.count !== undefined ? ` (${f.count})` : ''}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-700 rounded-xl animate-pulse" />)}
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users size={32} className="mx-auto mb-3 opacity-40" />
              <p>Nessun utente trovato con i criteri di ricerca</p>
            </div>
          ) : (
            <>
              {/* Desktop Header */}
              <div className="hidden lg:grid lg:grid-cols-12 gap-4 px-6 py-3 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider">
                <div className="col-span-3">Utente</div>
                <div className="col-span-2">Email</div>
                <div className="col-span-1 text-center">Ruolo</div>
                <div className="col-span-1 text-center">Stato</div>
                <div className="col-span-1 text-center">Verifiche</div>
                <div className="col-span-2">Ultimo Accesso</div>
                <div className="col-span-2 text-right">Azioni</div>
              </div>

              <div className="divide-y divide-slate-100 dark:divide-slate-700">
                {filteredUsers.map(user => (
                  <div key={user.uid} className="lg:grid lg:grid-cols-12 gap-4 items-center px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                    {/* User Info */}
                    <div className="col-span-3 flex items-center gap-3 mb-2 lg:mb-0">
                      <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-bold text-white
                        ${user.role === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-500' : 'bg-gradient-to-br from-primary-500 to-indigo-500'}`}
                      >
                        {user.displayName ? user.displayName.charAt(0).toUpperCase() : '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-sm dark:text-white truncate">{user.displayName || 'Senza nome'}</p>
                        <p className="text-[11px] text-slate-400 font-mono truncate">{user.uid.substring(0, 12)}...</p>
                      </div>
                    </div>

                    {/* Email */}
                    <div className="col-span-2 flex items-center gap-1.5 mb-2 lg:mb-0">
                      <Mail size={13} className="text-slate-400 flex-shrink-0 hidden lg:block" />
                      <span className="text-sm text-slate-600 dark:text-slate-400 truncate">{user.email}</span>
                    </div>

                    {/* Ruolo */}
                    <div className="col-span-1 text-center mb-2 lg:mb-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${user.role === 'admin' ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'}`}
                      >
                        {user.role}
                      </span>
                    </div>

                    {/* Stato */}
                    <div className="col-span-1 text-center mb-2 lg:mb-0">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider
                        ${user.status === 'active' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'}`}
                      >
                        {user.status === 'active' ? 'Attivo' : 'Bloccato'}
                      </span>
                    </div>

                    {/* Verifiche */}
                    <div className="col-span-1 text-center mb-2 lg:mb-0">
                      <div className="flex items-center justify-center gap-1.5 text-sm">
                        <FileText size={13} className="text-slate-400" />
                        <span className="font-bold dark:text-white">{verificheCounts[user.uid] ?? user.verifiche_count ?? 0}</span>
                      </div>
                    </div>

                    {/* Ultimo Accesso */}
                    <div className="col-span-2 flex items-center gap-1.5 mb-2 lg:mb-0">
                      <Clock size={13} className="text-slate-400 flex-shrink-0 hidden lg:block" />
                      <span className="text-sm text-slate-500 dark:text-slate-400">
                        {user.last_login ? new Date(user.last_login).toLocaleString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </div>

                    {/* Azioni */}
                    <div className="col-span-2 flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => navigate(`/superadmin/utente/${user.uid}`)}
                        title="Dettaglio utente"
                        className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                      >
                        <Eye size={16} />
                      </button>
                      {user.role !== 'admin' && (
                        <>
                          <button
                            onClick={() => handleToggleBlock(user)}
                            title={user.status === 'active' ? 'Blocca utente' : 'Sblocca utente'}
                            className={`p-2 rounded-lg transition-colors ${user.status === 'active'
                              ? 'text-slate-400 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20'
                              : 'text-amber-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'}`}
                          >
                            {user.status === 'active' ? <Ban size={16} /> : <Unlock size={16} />}
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
                            title="Elimina profilo"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          >
                            <Trash2 size={16} />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}

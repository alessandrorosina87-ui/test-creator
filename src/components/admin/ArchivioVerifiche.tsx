/**
 * ArchivioVerifiche.tsx
 * Archivio completo con ricerca, filtri e azioni per ogni verifica.
 */
import { useState, useEffect, useMemo } from 'react';
import { Search, Eye, Edit3, Trash2, Copy, Download, FileText, ArrowLeft, BookOpen } from 'lucide-react';
import { useRouter } from '../../Router';
import { getVerifiche, eliminaVerifica, duplicaVerifica, getVerifica, verificaToTestDocument } from '../../services/verificheService';
import { generateTestPdf, generateTeacherPdf } from '../../utils/pdfGenerator';
import type { VerificaDB } from '../../types';

export function ArchivioVerifiche() {
  const { navigate } = useRouter();
  const [verifiche, setVerifiche] = useState<VerificaDB[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroMateria, setFiltroMateria] = useState('');
  const [filtroClasse, setFiltroClasse] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try { setVerifiche(await getVerifiche()); } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const materie = useMemo(() => [...new Set(verifiche.map(v => v.materia))].filter(Boolean), [verifiche]);
  const classi = useMemo(() => [...new Set(verifiche.map(v => v.classe))].filter(Boolean), [verifiche]);

  const filtered = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return verifiche.filter(v => {
      if (term && !v.codice_verifica.toLowerCase().includes(term) && !v.titolo.toLowerCase().includes(term) && !v.autore.toLowerCase().includes(term)) return false;
      if (filtroMateria && v.materia !== filtroMateria) return false;
      if (filtroClasse && v.classe !== filtroClasse) return false;
      return true;
    });
  }, [verifiche, searchTerm, filtroMateria, filtroClasse]);

  const handleDelete = async (codice: string) => {
    try { await eliminaVerifica(codice); setVerifiche(v => v.filter(x => x.codice_verifica !== codice)); setDeleteConfirm(null); }
    catch (e) { console.error(e); alert('Errore nell\'eliminazione.'); }
  };

  const handleDuplica = async (codice: string) => {
    try { const nuovo = await duplicaVerifica(codice); alert(`Verifica duplicata! Nuovo codice: ${nuovo}`); load(); }
    catch (e) { console.error(e); alert('Errore nella duplicazione.'); }
  };

  const handleDownloadStudente = async (codice: string) => {
    try {
      const data = await getVerifica(codice);
      if (!data) return;
      const doc = verificaToTestDocument(data.verifica, data.questions);
      generateTestPdf(doc.metadata, doc.questions, 'download', codice);
    } catch (e) { console.error(e); }
  };

  const handleDownloadDocente = async (codice: string) => {
    try {
      const data = await getVerifica(codice);
      if (!data) return;
      const doc = verificaToTestDocument(data.verifica, data.questions);
      generateTeacherPdf(doc.metadata, doc.questions, codice);
    } catch (e) { console.error(e); }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <button onClick={() => navigate('/admin/dashboard')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Torna alla Dashboard
        </button>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20"><BookOpen size={20} /></div>
          <div>
            <h1 className="text-2xl font-display font-bold dark:text-white">Archivio Verifiche</h1>
            <p className="text-slate-400 text-xs font-medium">{filtered.length} risultati</p>
          </div>
        </div>

        {/* Filtri */}
        <div className="premium-card dark:bg-slate-800 dark:border-slate-700 p-5 mb-6">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Cerca per codice, titolo o autore..." className="premium-input pl-10" />
            </div>
            <select value={filtroMateria} onChange={e => setFiltroMateria(e.target.value)} className="premium-input w-full md:w-44">
              <option value="">Tutte le materie</option>
              {materie.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={filtroClasse} onChange={e => setFiltroClasse(e.target.value)} className="premium-input w-full md:w-36">
              <option value="">Tutte le classi</option>
              {classi.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Tabella */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-16 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />)}</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16"><FileText size={48} className="mx-auto text-slate-200 dark:text-slate-700 mb-4" /><p className="text-slate-400">Nessuna verifica trovata.</p></div>
        ) : (
          <div className="space-y-3">
            {filtered.map(v => (
              <div key={v.codice_verifica} className="premium-card dark:bg-slate-800 dark:border-slate-700 p-4 md:p-5">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="badge-code shrink-0">{v.codice_verifica}</span>
                    <div className="min-w-0">
                      <p className="font-bold text-sm dark:text-white truncate">{v.titolo}</p>
                      <p className="text-xs text-slate-400">{v.materia} · {v.classe} · {v.autore} · {new Date(v.data_creazione).toLocaleDateString('it-IT')}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0 flex-wrap">
                    <button onClick={() => navigate(`/admin/verifica/${v.codice_verifica}`)} className="action-btn text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20" title="Visualizza soluzioni"><Eye size={15} /></button>
                    <button onClick={() => navigate(`/admin/modifica/${v.codice_verifica}`)} className="action-btn text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-900/20" title="Modifica"><Edit3 size={15} /></button>
                    <button onClick={() => handleDuplica(v.codice_verifica)} className="action-btn text-teal-600 hover:bg-teal-50 dark:hover:bg-teal-900/20" title="Duplica"><Copy size={15} /></button>
                    <button onClick={() => handleDownloadStudente(v.codice_verifica)} className="action-btn text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20" title="PDF Studente"><Download size={15} /></button>
                    <button onClick={() => handleDownloadDocente(v.codice_verifica)} className="action-btn text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20" title="PDF Docente"><FileText size={15} /></button>
                    {deleteConfirm === v.codice_verifica ? (
                      <div className="flex items-center gap-1 ml-1">
                        <button onClick={() => handleDelete(v.codice_verifica)} className="text-xs px-2 py-1 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors">Conferma</button>
                        <button onClick={() => setDeleteConfirm(null)} className="text-xs px-2 py-1 bg-slate-200 dark:bg-slate-600 rounded-lg font-bold hover:bg-slate-300 transition-colors dark:text-white">Annulla</button>
                      </div>
                    ) : (
                      <button onClick={() => setDeleteConfirm(v.codice_verifica)} className="action-btn text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20" title="Elimina"><Trash2 size={15} /></button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

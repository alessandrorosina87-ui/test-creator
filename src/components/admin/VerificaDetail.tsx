/**
 * VerificaDetail.tsx
 * Visualizzazione completa di una verifica con soluzioni evidenziate.
 */
import { useState, useEffect } from 'react';
import { ArrowLeft, Download, FileText, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from '../../Router';
import { getVerifica, verificaToTestDocument } from '../../services/verificheService';
import { generateTestPdf, generateTeacherPdf } from '../../utils/pdfGenerator';
import type { VerificaDB, Question } from '../../types';

export function VerificaDetail({ params }: { params: Record<string, string> }) {
  const { navigate } = useRouter();
  const codice = params.codice || '';
  const [verifica, setVerifica] = useState<VerificaDB | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (codice) loadVerifica();
  }, [codice]);

  const loadVerifica = async () => {
    try {
      const data = await getVerifica(codice);
      if (data) { setVerifica(data.verifica); setQuestions(data.questions); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  if (!verifica) return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <p className="text-slate-400 text-lg">Verifica non trovata.</p>
      <button onClick={() => navigate('/admin/archivio')} className="btn-secondary">Torna all'archivio</button>
    </div>
  );

  const doc = verificaToTestDocument(verifica, questions);
  const totalePunti = questions.reduce((s, q) => s + (q.punteggio || 1), 0);

  const getCorrectAnswerText = (q: Question): string => {
    switch (q.type) {
      case 'MULTIPLE_CHOICE':
        return q.correctAnswerIndex !== undefined ? `${String.fromCharCode(65 + q.correctAnswerIndex)}) ${q.options[q.correctAnswerIndex] || ''}` : 'Non impostata';
      case 'TRUE_FALSE':
        return q.correctAnswer === true ? 'Vero' : q.correctAnswer === false ? 'Falso' : 'Non impostata';
      case 'FILL_IN_BLANK':
        return q.correctAnswers.length > 0 ? q.correctAnswers.join(', ') : 'Non impostata';
      case 'OPEN_ENDED':
        return q.teacherSolution || 'Nessuna soluzione inserita';
    }
  };

  const typeLabels: Record<string, string> = {
    MULTIPLE_CHOICE: 'Scelta Multipla',
    TRUE_FALSE: 'Vero/Falso',
    FILL_IN_BLANK: 'Completamento',
    OPEN_ENDED: 'Risposta Aperta',
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin/archivio')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors mb-6 group">
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Torna all'archivio
        </button>

        {/* Header verifica */}
        <div className="premium-card dark:bg-slate-800 dark:border-slate-700 p-6 md:p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="badge-code text-base">{verifica.codice_verifica}</span>
                <span className="text-xs px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full font-bold">{totalePunti} punti totali</span>
              </div>
              <h1 className="text-2xl font-display font-bold dark:text-white">{verifica.titolo}</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => generateTestPdf(doc.metadata, doc.questions, 'download', codice)} className="btn-secondary text-sm py-2"><Download size={16} /> PDF Studente</button>
              <button onClick={() => generateTeacherPdf(doc.metadata, doc.questions, codice)} className="btn-primary text-sm py-2"><FileText size={16} /> PDF Docente</button>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            {[
              { label: 'Materia', value: verifica.materia },
              { label: 'Classe', value: verifica.classe },
              { label: 'Docente', value: verifica.autore },
              { label: 'Data', value: verifica.data_verifica },
            ].map(f => (
              <div key={f.label} className="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-xl">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{f.label}</p>
                <p className="font-bold dark:text-white">{f.value || '—'}</p>
              </div>
            ))}
          </div>

          {verifica.note && (
            <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
              <p className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase mb-1">Note Docente</p>
              <p className="text-sm text-amber-800 dark:text-amber-300">{verifica.note}</p>
            </div>
          )}

          <p className="text-xs text-slate-400 mt-4">Creata il {new Date(verifica.data_creazione).toLocaleString('it-IT')}</p>
        </div>

        {/* Domande con soluzioni */}
        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={q.id} className="premium-card dark:bg-slate-800 dark:border-slate-700 p-5 md:p-6">
              <div className="flex items-center gap-3 mb-3">
                <span className="w-8 h-8 rounded-full bg-slate-900 dark:bg-slate-600 text-white flex items-center justify-center text-sm font-bold">{i + 1}</span>
                <span className="text-[10px] px-2 py-0.5 bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400 rounded-full font-bold uppercase tracking-wider">{typeLabels[q.type]}</span>
                <span className="text-[10px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full font-bold">{q.punteggio || 1} pt</span>
              </div>

              <p className="font-medium text-base dark:text-white mb-4">{q.text}</p>

              {/* Opzioni per scelta multipla */}
              {q.type === 'MULTIPLE_CHOICE' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-4">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className={`flex items-center gap-2 p-2.5 rounded-xl border text-sm ${q.correctAnswerIndex === oi ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-300 dark:border-emerald-700' : 'bg-white dark:bg-slate-700/50 border-slate-100 dark:border-slate-600'}`}>
                      {q.correctAnswerIndex === oi ? <CheckCircle size={16} className="text-emerald-600 shrink-0" /> : <XCircle size={16} className="text-slate-300 dark:text-slate-500 shrink-0" />}
                      <span className="font-bold text-slate-400 dark:text-slate-500 text-xs">{String.fromCharCode(65 + oi)}</span>
                      <span className={q.correctAnswerIndex === oi ? 'font-bold text-emerald-700 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-300'}>{opt}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Risposta corretta evidenziata */}
              <div className="flex items-start gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700 rounded-xl">
                <CheckCircle size={16} className="text-emerald-600 dark:text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-0.5">Risposta Corretta</p>
                  <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">{getCorrectAnswerText(q)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * EditVerifica.tsx
 * Pagina di modifica verifica esistente — riutilizza i componenti QuestionEditor e TestHeader.
 */
import { useState, useEffect } from 'react';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { useRouter } from '../../Router';
import { getVerifica, aggiornaVerifica } from '../../services/verificheService';
import { TestHeader } from '../TestHeader';
import { QuestionEditor } from '../QuestionEditor';
import type { TestMetadata, Question } from '../../types';

export function EditVerifica({ params }: { params: Record<string, string> }) {
  const { navigate } = useRouter();
  const codice = params.codice || '';
  const [metadata, setMetadata] = useState<TestMetadata>({ title: '', class: '', subject: '', date: '', teacherName: '', note: '' });
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { if (codice) load(); }, [codice]);

  const load = async () => {
    try {
      const data = await getVerifica(codice);
      if (data) {
        setMetadata({
          title: data.verifica.titolo,
          subject: data.verifica.materia,
          class: data.verifica.classe,
          date: data.verifica.data_verifica,
          teacherName: data.verifica.autore,
          note: data.verifica.note,
        });
        setQuestions(data.questions);
      }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await aggiornaVerifica(codice, metadata, questions);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e: any) { console.error(e); alert(`Errore nel salvataggio: ${e.message || JSON.stringify(e)}`); }
    finally { setSaving(false); }
  };

  const updateQuestion = (index: number, q: Question) => {
    const nq = [...questions]; nq[index] = q; setQuestions(nq);
  };
  const deleteQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));
  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= questions.length) return;
    const nq = [...questions]; const [m] = nq.splice(from, 1); nq.splice(to, 0, m); setQuestions(nq);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-3 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => navigate('/admin/archivio')} className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-primary-600 transition-colors group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Torna all'archivio
          </button>
          <div className="flex items-center gap-3">
            <span className="badge-code">{codice}</span>
            <button onClick={handleSave} disabled={saving} className="btn-primary text-sm py-2">
              {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>{saved ? 'Salvato ✓' : 'Salva Modifiche'}</span>
            </button>
          </div>
        </div>

        <h1 className="text-2xl font-display font-bold mb-6 dark:text-white">Modifica Verifica</h1>

        <div className="premium-card dark:bg-slate-800 dark:border-slate-700 overflow-hidden mb-6">
          <TestHeader metadata={metadata} isPdfMode={false} onChange={setMetadata} />
        </div>

        <div className="premium-card dark:bg-slate-800 dark:border-slate-700 p-6 md:p-8">
          <div className="space-y-6">
            {questions.map((q, i) => (
              <QuestionEditor key={q.id} question={q} index={i} isPdfMode={false}
                onChange={(u) => updateQuestion(i, u)} onDelete={() => deleteQuestion(i)}
                onMoveUp={() => moveQuestion(i, i - 1)} onMoveDown={() => moveQuestion(i, i + 1)}
                isFirst={i === 0} isLast={i === questions.length - 1} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

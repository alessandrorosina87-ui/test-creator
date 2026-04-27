import { useState } from 'react';
import { TestHeader } from './components/TestHeader';
import { QuestionEditor } from './components/QuestionEditor';
import type { TestDocument, Question } from './types';
import { PlusCircle, Eye, Download, Save, FileText, Shield, Check, Loader2 } from 'lucide-react';
import { generateTestPdf, generateTeacherPdf } from './utils/pdfGenerator';
import { salvaVerifica, getNextCode } from './services/verificheService';
import { useRouter } from './Router';

function App() {
  const { navigate } = useRouter();
  const [testDoc, setTestDoc] = useState<TestDocument>({
    metadata: {
      title: '',
      class: '',
      subject: '',
      date: '',
      teacherName: '',
      note: '',
    },
    questions: [],
  });
  const [saving, setSaving] = useState(false);
  const [savedCode, setSavedCode] = useState<string | null>(null);

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'MULTIPLE_CHOICE',
      text: '',
      options: ['', '', '', ''],
      punteggio: 1,
    };
    setTestDoc({
      ...testDoc,
      questions: [...testDoc.questions, newQuestion],
    });
  };

  const updateQuestion = (index: number, updatedQuestion: Question) => {
    const newQuestions = [...testDoc.questions];
    newQuestions[index] = updatedQuestion;
    setTestDoc({ ...testDoc, questions: newQuestions });
  };

  const deleteQuestion = (index: number) => {
    const newQuestions = testDoc.questions.filter((_, i) => i !== index);
    setTestDoc({ ...testDoc, questions: newQuestions });
  };

  const moveQuestion = (from: number, to: number) => {
    if (to < 0 || to >= testDoc.questions.length) return;
    const newQuestions = [...testDoc.questions];
    const [moved] = newQuestions.splice(from, 1);
    newQuestions.splice(to, 0, moved);
    setTestDoc({ ...testDoc, questions: newQuestions });
  };

  // ── Salva su Firestore e genera codice ──
  const handleSave = async () => {
    if (testDoc.questions.length === 0) return;
    setSaving(true);
    try {
      const codice = await getNextCode();
      await salvaVerifica(testDoc.metadata, testDoc.questions, codice);
      setSavedCode(codice);
      setTestDoc({ ...testDoc, codiceVerifica: codice });
    } catch (e: any) {
      console.error('Errore salvataggio:', e);
      alert(`Errore nel salvataggio: ${e.message || JSON.stringify(e)}`);
    } finally {
      setSaving(false);
    }
  };

  // ── Nuova verifica ──
  const handleNew = () => {
    setTestDoc({
      metadata: { title: '', class: '', subject: '', date: '', teacherName: '', note: '' },
      questions: [],
    });
    setSavedCode(null);
  };

  return (
    <div className="min-h-screen py-12 px-4 selection:bg-indigo-100">
      
      {/* ─── Hero / Header ─── */}
      <div className="max-w-4xl mx-auto mb-12 text-center animate-in fade-in slide-in-from-top-4 duration-1000">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-xs font-bold tracking-wider uppercase">
            <PlusCircle size={14} />
            AI Powered Creator
          </div>
          <button
            onClick={() => navigate('/admin')}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-bold tracking-wider uppercase hover:bg-slate-200 transition-colors"
          >
            <Shield size={14} />
            Admin
          </button>
        </div>
        <h1 className="text-5xl md:text-6xl font-display font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-primary-600">
          Verifiche Strutturate
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto font-medium">
          Progetta test professionali in pochi minuti. <br/>
          Semplice, veloce, pronto per la stampa.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-10">

        {/* ─── Badge Codice Verifica (dopo salvataggio) ─── */}
        {savedCode && (
          <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center gap-4 p-6 bg-emerald-50 border-2 border-emerald-200 rounded-2xl">
            <div className="flex items-center gap-3">
              <Check size={28} className="text-emerald-600" />
              <span className="text-emerald-800 font-bold text-xl">Verifica salvata con successo - Codice:</span>
              <span className="px-3 py-1 bg-white text-emerald-700 border border-emerald-300 rounded-lg font-mono font-bold text-xl">{savedCode}</span>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3 mt-2">
              <button
                onClick={() => navigate('/admin')}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-colors shadow-sm"
              >
                <Shield size={18} /> Apri Archivio
              </button>
              <button
                onClick={() => generateTestPdf(testDoc.metadata, testDoc.questions, 'download', savedCode)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-emerald-700 border border-emerald-200 rounded-xl font-bold transition-colors shadow-sm"
              >
                <Download size={18} /> Scarica PDF
              </button>
              <button
                onClick={handleNew}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-colors shadow-sm"
              >
                <PlusCircle size={18} /> Nuova Verifica
              </button>
            </div>
          </div>
        )}

        {/* ─── Sezione: Intestazione Verifica ─── */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
              <Eye size={20} />
            </div>
            <h2 className="text-xl font-display font-bold">Configurazione Intestazione</h2>
          </div>
          <div className="premium-card overflow-hidden">
            <TestHeader
              metadata={testDoc.metadata}
              isPdfMode={false}
              onChange={(metadata) => setTestDoc({ ...testDoc, metadata })}
            />
          </div>
        </section>

        {/* ─── Sezione: Domande ─── */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/20">
                <PlusCircle size={20} />
              </div>
              <h2 className="text-xl font-display font-bold">Corpo della Verifica</h2>
            </div>
            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-lg text-sm font-bold">
              {testDoc.questions.length} Domande
            </span>
          </div>

          <div className="premium-card p-6 md:p-8">
            {testDoc.questions.length === 0 ? (
              <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                <p className="text-slate-400 font-medium">
                  Ancora nessuna domanda. Inizia cliccando il tasto qui sotto.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {testDoc.questions.map((q, index) => (
                  <QuestionEditor
                    key={q.id}
                    question={q}
                    index={index}
                    isPdfMode={false}
                    onChange={(updated) => updateQuestion(index, updated)}
                    onDelete={() => deleteQuestion(index)}
                    onMoveUp={() => moveQuestion(index, index - 1)}
                    onMoveDown={() => moveQuestion(index, index + 1)}
                    isFirst={index === 0}
                    isLast={index === testDoc.questions.length - 1}
                  />
                ))}
              </div>
            )}

            {/* ─── + Aggiungi domanda ─── */}
            <div className="mt-8">
              <button
                onClick={addQuestion}
                className="w-full flex items-center gap-2 bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary-500 hover:bg-primary-50 text-slate-500 hover:text-primary-600 px-6 py-5 rounded-2xl font-bold transition-all justify-center group"
              >
                <PlusCircle size={22} className="group-hover:scale-110 transition-transform" />
                <span>Aggiungi una nuova domanda</span>
              </button>
            </div>
          </div>
        </section>

        {/* ─── Pulsanti Azione ─── */}
        <div className="space-y-4 pt-6 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 pb-20">
          {/* Riga 1: Salva + Nuova */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSave}
              disabled={testDoc.questions.length === 0 || saving}
              className="btn-primary flex-1 py-4 text-lg"
            >
              {saving ? <Loader2 size={22} className="animate-spin" /> : <Save size={22} />}
              <span>{saving ? 'Salvataggio...' : savedCode ? 'Salva Nuova Versione' : 'Salva nel Database'}</span>
            </button>
            {savedCode && (
              <button onClick={handleNew} className="btn-secondary flex-1 py-4 text-lg">
                <PlusCircle size={22} />
                <span>Nuova Verifica</span>
              </button>
            )}
          </div>

          {/* Riga 2: PDF */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => generateTestPdf(testDoc.metadata, testDoc.questions, 'preview', savedCode || undefined)}
              disabled={testDoc.questions.length === 0}
              className="btn-secondary flex-1 py-4 text-lg"
            >
              <Eye size={22} />
              <span>Anteprima PDF</span>
            </button>
            <button
              onClick={() => generateTestPdf(testDoc.metadata, testDoc.questions, 'download', savedCode || undefined)}
              disabled={testDoc.questions.length === 0}
              className="btn-primary flex-1 py-4 text-lg"
            >
              <Download size={22} />
              <span>PDF Studente</span>
            </button>
            <button
              onClick={() => generateTeacherPdf(testDoc.metadata, testDoc.questions, savedCode || undefined)}
              disabled={testDoc.questions.length === 0}
              className="btn-secondary flex-1 py-4 text-lg border-purple-200 text-purple-700 hover:bg-purple-50 hover:border-purple-300"
            >
              <FileText size={22} />
              <span>PDF Docente</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;

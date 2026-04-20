import { useState } from 'react';
import { TestHeader } from './components/TestHeader';
import { QuestionEditor } from './components/QuestionEditor';
import type { TestDocument, Question } from './types';
import { PlusCircle, Eye, Download } from 'lucide-react';
import { generateTestPdf } from './utils/pdfGenerator';

function App() {
  const [testDoc, setTestDoc] = useState<TestDocument>({
    metadata: {
      title: '',
      class: '',
      subject: '',
      date: '',
      teacherName: '',
    },
    questions: [],
  });

  const addQuestion = () => {
    const newQuestion: Question = {
      id: crypto.randomUUID(),
      type: 'MULTIPLE_CHOICE',
      text: '',
      options: ['', '', '', ''],
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

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">

      {/* ─── Top Bar ─── */}
      <div className="max-w-4xl mx-auto mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Generatore Verifiche</h1>
          <p className="text-gray-500 text-sm">Crea e impagina verifiche per la tua classe</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">

        {/* ─── Sezione: Intestazione Verifica ─── */}
        <div className="mb-6">
          <div className="bg-blue-600 text-white px-5 py-3 rounded-t-lg font-semibold text-sm uppercase tracking-wide">
            Creazione Verifica
          </div>
          <TestHeader
            metadata={testDoc.metadata}
            isPdfMode={false}
            onChange={(metadata) => setTestDoc({ ...testDoc, metadata })}
          />
        </div>

        {/* ─── Sezione: Domande ─── */}
        <div className="mb-6">
          <div className="bg-gray-700 text-white px-5 py-3 rounded-t-lg font-semibold text-sm uppercase tracking-wide">
            Domande ({testDoc.questions.length})
          </div>
          <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-5">
            {testDoc.questions.length === 0 ? (
              <p className="text-gray-400 text-center py-8 italic">
                Nessuna domanda aggiunta. Clicca il pulsante qui sotto per iniziare.
              </p>
            ) : (
              <div className="space-y-4">
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
            <div className="mt-6">
              <button
                onClick={addQuestion}
                className="flex items-center gap-2 bg-white border-2 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 text-gray-600 hover:text-blue-600 px-6 py-3 rounded-xl font-medium transition-all w-full justify-center"
              >
                <PlusCircle size={22} />
                <span>Aggiungi Domanda</span>
              </button>
            </div>
          </div>
        </div>

        {/* ─── Pulsanti PDF ─── */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <button
            onClick={() => generateTestPdf(testDoc.metadata, testDoc.questions, 'preview')}
            disabled={testDoc.questions.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-5 py-3 rounded-lg font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Eye size={20} />
            <span>Anteprima PDF</span>
          </button>
          <button
            onClick={() => generateTestPdf(testDoc.metadata, testDoc.questions, 'download')}
            disabled={testDoc.questions.length === 0}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg font-medium shadow-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download size={20} />
            <span>Genera PDF Finale</span>
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;

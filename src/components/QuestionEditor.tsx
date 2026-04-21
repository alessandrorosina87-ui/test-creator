import React from 'react';
import { Trash2, ChevronUp, ChevronDown, Plus } from 'lucide-react';
import type { Question, QuestionType } from '../types';

interface QuestionEditorProps {
    question: Question;
    index: number;
    isPdfMode: boolean;
    onChange: (question: Question) => void;
    onDelete: () => void;
    onMoveUp: () => void;
    onMoveDown: () => void;
    isFirst: boolean;
    isLast: boolean;
}

const TYPE_LABELS: Record<QuestionType, string> = {
    MULTIPLE_CHOICE: 'Risposta Multipla',
    TRUE_FALSE: 'Vero o Falso',
    FILL_IN_BLANK: 'Completamento',
    OPEN_ENDED: 'Risposta Aperta',
};

export function QuestionEditor({
    question,
    index,
    isPdfMode,
    onChange,
    onDelete,
    onMoveUp,
    onMoveDown,
    isFirst,
    isLast,
}: QuestionEditorProps) {
    if (isPdfMode) return null; // PDF is rendered by jsPDF

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as QuestionType;
        let newQuestion: any = { id: question.id, type: newType, text: question.text };

        if (newType === 'MULTIPLE_CHOICE') {
            newQuestion = { ...newQuestion, options: ['', '', '', ''], correctAnswerIndex: undefined };
        } else if (newType === 'TRUE_FALSE') {
            newQuestion = { ...newQuestion, correctAnswer: undefined };
        } else if (newType === 'FILL_IN_BLANK') {
            newQuestion = { ...newQuestion, correctAnswers: [] };
        } else if (newType === 'OPEN_ENDED') {
            newQuestion = { ...newQuestion, lines: 4 };
        }
        onChange(newQuestion);
    };

    // ── Editor per ogni tipologia ──
    const renderEditor = () => {
        switch (question.type) {
            case 'MULTIPLE_CHOICE':
                return (
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-gray-500">
                                Opzioni (seleziona la corretta come promemoria)
                            </label>
                            <div className="space-x-1">
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...question, options: question.options.slice(0, 4) })}
                                    className={`text-xs px-2 py-0.5 rounded ${question.options.length === 4 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                                >4 opz.</button>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...question, options: [...question.options.slice(0, 4), '', ''].slice(0, 6) })}
                                    className={`text-xs px-2 py-0.5 rounded ${question.options.length === 6 ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-500'}`}
                                >6 opz.</button>
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            {question.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correctAnswerIndex === i}
                                        onChange={() => onChange({ ...question, correctAnswerIndex: i })}
                                        className="w-3.5 h-3.5 text-green-600 cursor-pointer"
                                        title="Risposta corretta"
                                    />
                                    <span className="text-xs font-bold text-gray-400 w-4">{String.fromCharCode(65 + i)})</span>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...question.options];
                                            newOptions[i] = e.target.value;
                                            onChange({ ...question, options: newOptions });
                                        }}
                                        placeholder={`Opzione ${String.fromCharCode(65 + i)}`}
                                        className="flex-1 border border-gray-200 rounded px-2.5 py-1.5 text-sm focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'TRUE_FALSE':
                return (
                    <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-1">Segna la risposta corretta (promemoria)</p>
                        <div className="flex gap-6">
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    checked={question.correctAnswer === true}
                                    onChange={() => onChange({ ...question, correctAnswer: true })}
                                    className="w-3.5 h-3.5"
                                />
                                Vero
                            </label>
                            <label className="flex items-center gap-1.5 cursor-pointer text-sm">
                                <input
                                    type="radio"
                                    checked={question.correctAnswer === false}
                                    onChange={() => onChange({ ...question, correctAnswer: false })}
                                    className="w-3.5 h-3.5"
                                />
                                Falso
                            </label>
                        </div>
                    </div>
                );

            case 'FILL_IN_BLANK':
                return (
                    <div className="mt-3">
                        <p className="text-xs text-gray-400 mb-2">
                            Usa ____ nel testo per gli spazi vuoti. Le parole qui sotto sono solo promemoria.
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                            {question.correctAnswers.map((ans, i) => (
                                <div key={i} className="flex items-center bg-gray-50 rounded border border-gray-200 text-sm">
                                    <span className="px-1.5 py-1 bg-gray-100 text-gray-400 font-mono text-xs">{i + 1}</span>
                                    <input
                                        type="text"
                                        value={ans}
                                        onChange={(e) => {
                                            const newAns = [...question.correctAnswers];
                                            newAns[i] = e.target.value;
                                            onChange({ ...question, correctAnswers: newAns });
                                        }}
                                        className="px-2 py-1 text-sm w-28 focus:outline-none bg-transparent"
                                        placeholder="Parola..."
                                    />
                                    <button
                                        onClick={() => onChange({ ...question, correctAnswers: question.correctAnswers.filter((_, idx) => idx !== i) })}
                                        className="px-1.5 text-gray-400 hover:text-red-500 text-xs"
                                    >×</button>
                                </div>
                            ))}
                            <button
                                onClick={() => onChange({ ...question, correctAnswers: [...question.correctAnswers, ''] })}
                                className="px-2 py-1 text-xs bg-blue-50 text-blue-600 rounded border border-blue-200 hover:bg-blue-100 flex items-center gap-1"
                            >
                                <Plus size={12} /> Aggiungi
                            </button>
                        </div>
                    </div>
                );

            case 'OPEN_ENDED':
                return (
                    <div className="mt-3">
                        <label className="text-xs text-gray-400 mr-2">Righe vuote nel PDF:</label>
                        <input
                            type="number"
                            min="1"
                            max="20"
                            value={question.lines}
                            onChange={(e) => onChange({ ...question, lines: parseInt(e.target.value) || 4 })}
                            className="w-14 border border-gray-200 rounded px-2 py-1 text-sm"
                        />
                    </div>
                );
        }
    };

    return (
        <div className="bg-slate-50/50 rounded-2xl border border-slate-200 p-6 relative group transition-all hover:border-primary-200 hover:bg-white active:scale-[0.995]">

            {/* ─── Toolbar ─── */}
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    {/* Reorder arrows */}
                    <div className="flex flex-col bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm">
                        <button
                            onClick={onMoveUp}
                            disabled={isFirst}
                            className="p-1 text-slate-400 hover:bg-slate-50 hover:text-primary-600 disabled:opacity-20 transition-colors"
                            title="Sposta su"
                        >
                            <ChevronUp size={14} />
                        </button>
                        <div className="h-[1px] bg-slate-100" />
                        <button
                            onClick={onMoveDown}
                            disabled={isLast}
                            className="p-1 text-slate-400 hover:bg-slate-50 hover:text-primary-600 disabled:opacity-20 transition-colors"
                            title="Sposta giù"
                        >
                            <ChevronDown size={14} />
                        </button>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-sm font-bold shadow-md shadow-slate-900/20">
                            {index + 1}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full font-bold uppercase tracking-wider">
                            {TYPE_LABELS[question.type]}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <select
                        value={question.type}
                        onChange={handleTypeChange}
                        className="text-xs font-bold border-slate-200 rounded-lg border py-1.5 pl-3 pr-8 text-slate-600 bg-white hover:border-primary-500 transition-colors cursor-pointer outline-none focus:ring-2 focus:ring-primary-500/10"
                    >
                        <option value="MULTIPLE_CHOICE">Risposta Multipla</option>
                        <option value="TRUE_FALSE">Vero o Falso</option>
                        <option value="FILL_IN_BLANK">Completamento</option>
                        <option value="OPEN_ENDED">Risposta Aperta</option>
                    </select>
                    <button
                        onClick={onDelete}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Elimina domanda"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
            </div>

            {/* ─── Question Text ─── */}
            <div className="space-y-1.5 mb-4">
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide ml-1">Testo della Domanda</label>
                <textarea
                    value={question.text}
                    onChange={(e) => onChange({ ...question, text: e.target.value })}
                    placeholder="Scrivi qui la tua domanda..."
                    className="w-full text-base font-medium border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 resize-none bg-white transition-all"
                    rows={2}
                />
            </div>

            {/* ─── Type-specific Editor ─── */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {renderEditor()}
            </div>
        </div>
    );
}

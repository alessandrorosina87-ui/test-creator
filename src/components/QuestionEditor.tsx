import React, { useRef } from 'react';
import { Trash2, ChevronUp, ChevronDown, Plus, ImagePlus, X } from 'lucide-react';
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
    const fileInputRef = useRef<HTMLInputElement>(null);

    if (isPdfMode) return null; // PDF is rendered by jsPDF

    const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newType = e.target.value as QuestionType;
        let newQuestion: any = { id: question.id, type: newType, text: question.text, images: question.images, punteggio: question.punteggio || 1 };

        if (newType === 'MULTIPLE_CHOICE') {
            newQuestion = { ...newQuestion, options: ['', '', '', ''], correctAnswerIndex: undefined };
        } else if (newType === 'TRUE_FALSE') {
            newQuestion = { ...newQuestion, correctAnswer: undefined };
        } else if (newType === 'FILL_IN_BLANK') {
            newQuestion = { ...newQuestion, correctAnswers: [] };
        } else if (newType === 'OPEN_ENDED') {
            newQuestion = { ...newQuestion, lines: 4, teacherSolution: '' };
        }
        onChange(newQuestion);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 600;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height *= MAX_WIDTH / width;
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx?.drawImage(img, 0, 0, width, height);
                
                const base64 = canvas.toDataURL('image/jpeg', 0.6);
                const currentImages = question.images || [];
                onChange({ ...question, images: [...currentImages, base64] });
            };
            img.src = event.target?.result as string;
        };
        reader.readAsDataURL(file);
        e.target.value = '';
    };

    const removeImage = (imgIndex: number) => {
        const newImages = (question.images || []).filter((_, i) => i !== imgIndex);
        onChange({ ...question, images: newImages });
    };

    // ── Editor per ogni tipologia ──
    const renderEditor = () => {
        switch (question.type) {
            case 'MULTIPLE_CHOICE':
                return (
                    <div className="mt-3">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-xs font-medium text-slate-500">
                                Opzioni (seleziona la corretta per promemoria)
                            </label>
                            <div className="flex gap-1">
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...question, options: question.options.slice(0, 4) })}
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${question.options.length === 4 ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >4 OPZ.</button>
                                <button
                                    type="button"
                                    onClick={() => onChange({ ...question, options: [...question.options.slice(0, 4), '', ''].slice(0, 6) })}
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all ${question.options.length === 6 ? 'bg-primary-600 text-white shadow-md shadow-primary-500/20' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                                >6 OPZ.</button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {question.options.map((opt, i) => (
                                <div key={i} className="flex items-center gap-3 bg-white p-2 rounded-xl border border-slate-100 shadow-sm transition-all hover:border-primary-100 group/opt">
                                    <input
                                        type="radio"
                                        name={`correct-${question.id}`}
                                        checked={question.correctAnswerIndex === i}
                                        onChange={() => onChange({ ...question, correctAnswerIndex: i })}
                                        className="w-4 h-4 text-primary-600 cursor-pointer border-slate-300 focus:ring-primary-500"
                                        title="Risposta corretta"
                                    />
                                    <span className="text-xs font-black text-slate-300 group-hover/opt:text-primary-300 transition-colors">{String.fromCharCode(65 + i)}</span>
                                    <input
                                        type="text"
                                        value={opt}
                                        onChange={(e) => {
                                            const newOptions = [...question.options];
                                            newOptions[i] = e.target.value;
                                            onChange({ ...question, options: newOptions });
                                        }}
                                        placeholder={`Opzione ${String.fromCharCode(65 + i)}`}
                                        className="flex-1 text-sm font-medium focus:outline-none bg-transparent text-slate-700"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                );

            case 'TRUE_FALSE':
                return (
                    <div className="mt-3 flex items-center gap-4 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2">Corretta:</p>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" checked={question.correctAnswer === true} onChange={() => onChange({ ...question, correctAnswer: true })} className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
                                <span className="text-sm font-bold text-slate-600 group-hover:text-primary-600 transition-colors">Vero</span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <input type="radio" checked={question.correctAnswer === false} onChange={() => onChange({ ...question, correctAnswer: false })} className="w-4 h-4 text-primary-600 border-slate-300 focus:ring-primary-500" />
                                <span className="text-sm font-bold text-slate-600 group-hover:text-primary-600 transition-colors">Falso</span>
                            </label>
                        </div>
                    </div>
                );

            case 'FILL_IN_BLANK':
                return (
                    <div className="mt-4">
                        <div className="flex items-center gap-2 mb-3">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Parole Chiave</label>
                            <span className="text-[10px] text-slate-300 font-medium">(Usa ____ nel testo della domanda)</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {question.correctAnswers.map((ans, i) => (
                                <div key={i} className="flex items-center bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden group/ans transition-all hover:border-primary-200">
                                    <span className="px-2 py-1.5 bg-slate-50 text-slate-400 font-bold text-[10px] border-r border-slate-100">{i + 1}</span>
                                    <input type="text" value={ans} onChange={(e) => { const newAns = [...question.correctAnswers]; newAns[i] = e.target.value; onChange({ ...question, correctAnswers: newAns }); }} className="px-3 py-1.5 text-sm font-bold w-32 focus:outline-none bg-transparent text-slate-700" placeholder="Parola..." />
                                    <button onClick={() => onChange({ ...question, correctAnswers: question.correctAnswers.filter((_, idx) => idx !== i) })} className="px-2 text-slate-300 hover:text-red-500 transition-colors"><X size={14} /></button>
                                </div>
                            ))}
                            <button onClick={() => onChange({ ...question, correctAnswers: [...question.correctAnswers, ''] })} className="px-4 py-2 text-xs font-bold bg-primary-50 text-primary-600 rounded-xl border border-primary-100 hover:bg-primary-100 transition-all flex items-center gap-2 shadow-sm">
                                <Plus size={14} /> Aggiungi
                            </button>
                        </div>
                    </div>
                );

            case 'OPEN_ENDED':
                return (
                    <div className="mt-3 space-y-3">
                        <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Righe Spaziate nel PDF:</label>
                            <div className="flex items-center gap-2">
                                <input type="number" min="1" max="20" value={question.lines} onChange={(e) => onChange({ ...question, lines: parseInt(e.target.value) || 4 })} className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-sm font-bold text-center focus:outline-none focus:border-primary-500" />
                                <span className="text-[10px] text-slate-300 uppercase font-black">Lines</span>
                            </div>
                        </div>
                        {/* Soluzione docente */}
                        <div className="space-y-1.5">
                            <label className="text-[11px] font-bold text-amber-500 uppercase tracking-wide ml-1">Soluzione Docente (riservata)</label>
                            <textarea
                                value={question.teacherSolution || ''}
                                onChange={(e) => onChange({ ...question, teacherSolution: e.target.value })}
                                placeholder="Inserisci la risposta attesa o la traccia di soluzione..."
                                className="w-full text-sm border border-amber-200 rounded-xl px-4 py-3 focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 resize-none bg-amber-50/50 transition-all"
                                rows={3}
                            />
                        </div>
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
                        <button onClick={onMoveUp} disabled={isFirst} className="p-1 text-slate-400 hover:bg-slate-50 hover:text-primary-600 disabled:opacity-20 transition-colors" title="Sposta su">
                            <ChevronUp size={14} />
                        </button>
                        <div className="h-[1px] bg-slate-100" />
                        <button onClick={onMoveDown} disabled={isLast} className="p-1 text-slate-400 hover:bg-slate-50 hover:text-primary-600 disabled:opacity-20 transition-colors" title="Sposta giù">
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
                    {/* Punteggio */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-2 py-1 shadow-sm">
                        <input
                            type="number"
                            min="0"
                            max="100"
                            value={question.punteggio}
                            onChange={(e) => onChange({ ...question, punteggio: parseInt(e.target.value) || 1 })}
                            className="w-10 text-xs font-bold text-center focus:outline-none bg-transparent text-slate-700"
                            title="Punteggio"
                        />
                        <span className="text-[9px] text-slate-400 font-bold uppercase">pt</span>
                    </div>
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

            {/* ─── Question Text & Image Control ─── */}
            <div className="space-y-4 mb-4">
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between px-1">
                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">Testo della Domanda</label>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest"
                        >
                            <ImagePlus size={14} />
                            Aggiungi Immagine
                        </button>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            onChange={handleImageUpload} 
                            accept="image/*" 
                            className="hidden" 
                        />
                    </div>
                    <textarea
                        value={question.text}
                        onChange={(e) => onChange({ ...question, text: e.target.value })}
                        placeholder="Scrivi qui la tua domanda..."
                        className="w-full text-base font-medium border border-slate-200 rounded-xl px-4 py-3 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 resize-none bg-white transition-all shadow-sm"
                        rows={2}
                    />
                </div>

                {/* ─── Image Gallery ─── */}
                {question.images && question.images.length > 0 && (
                    <div className="flex flex-wrap gap-3 animate-in fade-in zoom-in-95 duration-500">
                        {question.images.map((img, i) => (
                            <div key={i} className="relative group/img overflow-hidden rounded-xl border border-slate-200 shadow-sm aspect-video h-24 bg-slate-100">
                                <img src={img} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity text-white"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ─── Type-specific Editor ─── */}
            <div className="animate-in fade-in zoom-in-95 duration-300">
                {renderEditor()}
            </div>
        </div>
    );
}

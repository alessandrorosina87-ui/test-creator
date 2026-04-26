import type { TestMetadata } from '../types';

interface TestHeaderProps {
    metadata: TestMetadata;
    isPdfMode: boolean;
    onChange?: (metadata: TestMetadata) => void;
}

export function TestHeader({ metadata, isPdfMode, onChange }: TestHeaderProps) {
    if (isPdfMode) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        onChange?.({ ...metadata, [name]: value });
    };

    const fields: { label: string; name: keyof TestMetadata; placeholder: string }[] = [
        { label: 'Titolo verifica', name: 'title', placeholder: 'es. Verifica di Sistemi e Reti' },
        { label: 'Materia', name: 'subject', placeholder: 'es. Informatica' },
        { label: 'Classe', name: 'class', placeholder: 'es. 4A INFO' },
        { label: 'Docente', name: 'teacherName', placeholder: 'es. Prof. Mario Rossi' },
        { label: 'Data', name: 'date', placeholder: 'es. 05/03/2026' },
    ];

    return (
        <div className="p-8 bg-white dark:bg-slate-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-500 dark:text-slate-400 ml-1">
                            {f.label}
                        </label>
                        <input
                            type="text"
                            name={f.name}
                            value={metadata[f.name] || ''}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="premium-input dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>
                ))}
            </div>

            {/* Campo Note (opzionale, solo admin) */}
            <div className="mt-6 space-y-1.5">
                <label className="text-sm font-bold text-amber-500 ml-1">
                    Note Docente (riservate, non appaiono nel PDF studente)
                </label>
                <textarea
                    name="note"
                    value={metadata.note || ''}
                    onChange={handleChange}
                    placeholder="Eventuali note interne per il docente..."
                    className="w-full bg-amber-50/50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl px-4 py-2.5 transition-all outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 text-slate-700 dark:text-amber-300 resize-none"
                    rows={2}
                />
            </div>
        </div>
    );
}

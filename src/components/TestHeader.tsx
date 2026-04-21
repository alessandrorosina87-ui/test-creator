import type { TestMetadata } from '../types';

interface TestHeaderProps {
    metadata: TestMetadata;
    isPdfMode: boolean;
    onChange?: (metadata: TestMetadata) => void;
}

export function TestHeader({ metadata, isPdfMode, onChange }: TestHeaderProps) {
    if (isPdfMode) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
        <div className="p-8 bg-white">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {fields.map((f) => (
                    <div key={f.name} className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-500 ml-1">
                            {f.label}
                        </label>
                        <input
                            type="text"
                            name={f.name}
                            value={metadata[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="premium-input"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

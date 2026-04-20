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
        <div className="bg-white rounded-b-lg border border-gray-200 border-t-0 p-5">
            <div className="space-y-3">
                {fields.map((f) => (
                    <div key={f.name} className="flex items-center gap-4">
                        <label className="w-36 text-sm font-medium text-gray-700 text-right shrink-0">
                            {f.label}:
                        </label>
                        <input
                            type="text"
                            name={f.name}
                            value={metadata[f.name]}
                            onChange={handleChange}
                            placeholder={f.placeholder}
                            className="flex-1 border border-gray-200 bg-gray-50 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

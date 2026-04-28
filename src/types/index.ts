export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'OPEN_ENDED';

export interface BaseQuestion {
    id: string;
    type: QuestionType;
    text: string;
    images?: string[]; // base64 strings
    punteggio: number; // punteggio assegnato alla domanda
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'MULTIPLE_CHOICE';
    options: string[]; // typically 4 or 6
    correctAnswerIndex?: number;
}

export interface TrueFalseQuestion extends BaseQuestion {
    type: 'TRUE_FALSE';
    correctAnswer?: boolean;
}

export interface FillInBlankQuestion extends BaseQuestion {
    type: 'FILL_IN_BLANK';
    correctAnswers: string[]; // one for each blank
}

export interface OpenEndedQuestion extends BaseQuestion {
    type: 'OPEN_ENDED';
    lines: number; // how many lines to leave empty
    teacherSolution?: string; // soluzione/risposta attesa dal docente
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillInBlankQuestion | OpenEndedQuestion;

export interface TestMetadata {
    title: string;
    class: string;
    subject: string;
    date: string;
    teacherName: string;
    note?: string; // note interne per il docente
}

export interface TestDocument {
    metadata: TestMetadata;
    questions: Question[];
    codiceVerifica?: string; // VER-0001, VER-0002, ...
    user_id?: string;
}

// ── Interfaccia per il record salvato su Firestore ──
export interface VerificaDB {
    codice_verifica: string;
    titolo: string;
    materia: string;
    classe: string;
    data_creazione: string; // ISO timestamp
    data_verifica: string;
    autore: string;
    note: string;
    user_id?: string;
    domande: DomandaDB[];
}

export interface DomandaDB {
    id: string;
    tipo_domanda: QuestionType;
    testo_domanda: string;
    opzione_a?: string;
    opzione_b?: string;
    opzione_c?: string;
    opzione_d?: string;
    opzione_e?: string;
    opzione_f?: string;
    risposta_corretta: string;
    punteggio: number;
    soluzione_docente?: string;
    immagini?: string[];
}

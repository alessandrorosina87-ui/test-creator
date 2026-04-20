export type QuestionType = 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_IN_BLANK' | 'OPEN_ENDED';

export interface BaseQuestion {
    id: string;
    type: QuestionType;
    text: string;
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
}

export type Question = MultipleChoiceQuestion | TrueFalseQuestion | FillInBlankQuestion | OpenEndedQuestion;

export interface TestMetadata {
    title: string;
    class: string;
    subject: string;
    date: string;
    teacherName: string;
}

export interface TestDocument {
    metadata: TestMetadata;
    questions: Question[];
}

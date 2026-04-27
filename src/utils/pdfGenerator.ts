/**
 * pdfGenerator.ts
 * Genera PDF strutturati per verifiche scolastiche con jsPDF.
 * Le domande vengono raggruppate per sezione (tipo).
 * Supporta: PDF Studente (senza risposte), PDF Docente (con soluzioni).
 */
import { jsPDF } from 'jspdf';
import type { Question, TestMetadata } from '../types';

// ── Costanti di layout ──────────────────────────────────────────
const PAGE_W = 210;
const PAGE_H = 297;
const ML = 20;
const MR = 20;
const MT = 20;
const MB = 20;
const CONTENT_W = PAGE_W - ML - MR;
const MAX_Y = PAGE_H - MB;

// ── Helpers ─────────────────────────────────────────────────────
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > MAX_Y) { doc.addPage(); return MT; }
    return y;
}

function drawLine(doc: jsPDF, y: number): number {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PAGE_W - MR, y);
    return y + 4;
}

function getWrapped(doc: jsPDF, text: string, maxWidth: number): string[] {
    return doc.splitTextToSize(text, maxWidth) as string[];
}

// ── Sezioni ─────────────────────────────────────────────────────
const SECTION_LABELS: Record<string, string> = {
    MULTIPLE_CHOICE: 'SEZIONE — Risposta multipla',
    TRUE_FALSE: 'SEZIONE — Vero / Falso',
    FILL_IN_BLANK: 'SEZIONE — Completamento',
    OPEN_ENDED: 'SEZIONE — Risposta aperta',
};

// ── Intestazione comune ─────────────────────────────────────────
function renderHeader(doc: jsPDF, metadata: TestMetadata, codice?: string, isTeacher?: boolean): number {
    let y = MT;

    // Badge codice verifica (angolo destro)
    if (codice) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(codice, PAGE_W - MR, y, { align: 'right' });
        doc.setTextColor(0, 0, 0);
    }

    // Badge PDF Docente
    if (isTeacher) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(180, 50, 50);
        doc.text('CORRETTORE DOCENTE — RISERVATO', ML, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
    }

    // Titolo centrato
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    const titleLines = getWrapped(doc, metadata.title || 'Verifica', CONTENT_W);
    titleLines.forEach((line: string) => {
        doc.text(line, PAGE_W / 2, y, { align: 'center' });
        y += 7;
    });
    y += 2;

    // Metadati su due colonne
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(11);
    const metaLeft = [
        `Materia: ${metadata.subject || '____________________'}`,
        `Classe: ${metadata.class || '____________________'}`,
        `Codice: ${codice || '____________________'}`,
    ];
    const metaRight = [
        `Docente: ${metadata.teacherName || '____________________'}`,
        `Data: ${metadata.date || '____________________'}`,
        '', // vuoto per bilanciare le tre righe
    ];
    metaLeft.forEach((txt, i) => {
        doc.text(txt, ML, y);
        if (metaRight[i]) {
            doc.text(metaRight[i], PAGE_W / 2 + 5, y);
        }
        y += 6;
    });
    y += 4;

    if (!isTeacher) {
        doc.text('Nome e Cognome: _______________________________________________', ML, y);
        y += 8;
    }

    y = drawLine(doc, y);
    y += 2;
    return y;
}

// ── Renderizza immagini ─────────────────────────────────────────
function renderImages(doc: jsPDF, q: Question, y: number): number {
    if (q.images && q.images.length > 0) {
        for (const imgData of q.images) {
            try {
                const props = doc.getImageProperties(imgData);
                const ratio = props.height / props.width;
                const MAX_IMG_DIM = 50;
                let imgW = Math.min(MAX_IMG_DIM, props.width);
                let imgH = imgW * ratio;
                if (imgH > MAX_IMG_DIM) { imgH = MAX_IMG_DIM; imgW = imgH / ratio; }
                y = ensureSpace(doc, y, imgH + 5);
                const x = ML + (CONTENT_W - imgW) / 2;
                doc.addImage(imgData, 'JPEG', x, y, imgW, imgH);
                y += imgH + 6;
            } catch (e) { console.error('Errore rendering immagine nel PDF', e); }
        }
    }
    return y;
}

// ══════════════════════════════════════════════════════════════════
// ── PDF STUDENTE (senza risposte corrette) ──────────────────────
// ══════════════════════════════════════════════════════════════════
export function generateTestPdf(
    metadata: TestMetadata,
    questions: Question[],
    mode: 'preview' | 'download',
    codice?: string,
): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let y = renderHeader(doc, metadata, codice, false);

    const order: Question['type'][] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'OPEN_ENDED'];
    let globalNum = 1;

    for (const qType of order) {
        const group = questions.filter((q) => q.type === qType);
        if (group.length === 0) continue;

        y = ensureSpace(doc, y, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(SECTION_LABELS[qType], ML, y);
        y += 7;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        for (const q of group) {
            y = renderImages(doc, q, y);

            switch (q.type) {
                case 'MULTIPLE_CHOICE': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    const blockHeight = questionLines.length * 5 + q.options.length * 5 + 6;
                    y = ensureSpace(doc, y, blockHeight);
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
                    questionLines.forEach((line: string) => { doc.text(line, ML, y); y += 5; });
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
                    q.options.forEach((opt: string, oi: number) => {
                        const letter = String.fromCharCode(65 + oi);
                        doc.text(`     ${letter}) ${opt}`, ML, y); y += 5;
                    });
                    y += 4;
                    break;
                }
                case 'TRUE_FALSE': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    y = ensureSpace(doc, y, questionLines.length * 5 + 10);
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
                    questionLines.forEach((line: string) => { doc.text(line, ML, y); y += 5; });
                    doc.setFont('helvetica', 'normal');
                    const boxY = y - 0.5;
                    doc.rect(ML + 5, boxY - 3, 3.5, 3.5);
                    doc.text('Vero', ML + 10, y);
                    doc.rect(ML + 30, boxY - 3, 3.5, 3.5);
                    doc.text('Falso', ML + 35, y);
                    y += 7;
                    break;
                }
                case 'FILL_IN_BLANK': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    y = ensureSpace(doc, y, questionLines.length * 5 + 4);
                    doc.setFont('helvetica', 'normal'); doc.setFontSize(10);
                    questionLines.forEach((line: string) => { doc.text(line, ML, y); y += 5; });
                    y += 4;
                    break;
                }
                case 'OPEN_ENDED': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    const linesCount = q.lines || 3;
                    y = ensureSpace(doc, y, questionLines.length * 5 + linesCount * 7 + 4);
                    doc.setFont('helvetica', 'bold'); doc.setFontSize(10);
                    questionLines.forEach((line: string) => { doc.text(line, ML, y); y += 5; });
                    doc.setFont('helvetica', 'normal');
                    y += 2;
                    for (let l = 0; l < linesCount; l++) {
                        doc.setDrawColor(160); doc.setLineWidth(0.2);
                        doc.line(ML, y, PAGE_W - MR, y); y += 7;
                    }
                    y += 2;
                    break;
                }
            }
            globalNum++;
        }
        y += 2;
    }

    outputPdf(doc, metadata.title, mode, codice);
}

// ══════════════════════════════════════════════════════════════════
// ── PDF DOCENTE (con soluzioni e griglia punteggi) ──────────────
// ══════════════════════════════════════════════════════════════════
export function generateTeacherPdf(
    metadata: TestMetadata,
    questions: Question[],
    codice?: string,
): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let y = renderHeader(doc, metadata, codice, true);

    // ── Griglia punteggi riepilogativa ──
    y = ensureSpace(doc, y, 20);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('GRIGLIA PUNTEGGI', ML, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const totalePunti = questions.reduce((s, q) => s + (q.punteggio || 1), 0);
    doc.text(`Totale punti: ${totalePunti}`, ML, y);
    y += 5;

    // Tabellina: Domanda | Tipo | Punti
    const colW = [20, 60, 20];
    doc.setFont('helvetica', 'bold');
    doc.text('N.', ML, y); doc.text('Tipo', ML + colW[0], y); doc.text('Punti', ML + colW[0] + colW[1], y);
    y += 5;
    doc.setFont('helvetica', 'normal');
    
    const typeShort: Record<string, string> = { MULTIPLE_CHOICE: 'Sc. Multipla', TRUE_FALSE: 'V/F', FILL_IN_BLANK: 'Completam.', OPEN_ENDED: 'Aperta' };
    questions.forEach((q, i) => {
        y = ensureSpace(doc, y, 5);
        doc.text(`${i + 1}`, ML, y);
        doc.text(typeShort[q.type] || q.type, ML + colW[0], y);
        doc.text(`${q.punteggio || 1}`, ML + colW[0] + colW[1], y);
        y += 4.5;
    });
    y += 4;
    y = drawLine(doc, y);
    y += 4;

    // ── Domande con risposte corrette ──
    doc.setFontSize(10);
    questions.forEach((q, i) => {
        y = ensureSpace(doc, y, 25);
        y = renderImages(doc, q, y);

        // Domanda
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        const qLines = getWrapped(doc, `${i + 1}) ${q.text}`, CONTENT_W - 5);
        qLines.forEach((line: string) => { doc.text(line, ML, y); y += 5; });

        // Risposta corretta
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(0, 128, 0);
        let answer = '';
        switch (q.type) {
            case 'MULTIPLE_CHOICE':
                if (q.correctAnswerIndex !== undefined) {
                    answer = `✓ Risposta: ${String.fromCharCode(65 + q.correctAnswerIndex)}) ${q.options[q.correctAnswerIndex] || ''}`;
                } else { answer = '✓ Risposta: Non impostata'; }
                break;
            case 'TRUE_FALSE':
                answer = `✓ Risposta: ${q.correctAnswer === true ? 'VERO' : q.correctAnswer === false ? 'FALSO' : 'Non impostata'}`;
                break;
            case 'FILL_IN_BLANK':
                answer = `✓ Risposta: ${q.correctAnswers.join(', ') || 'Non impostata'}`;
                break;
            case 'OPEN_ENDED':
                answer = `✓ Soluzione docente: ${q.teacherSolution || 'Nessuna'}`;
                break;
        }
        const answerLines = getWrapped(doc, answer, CONTENT_W - 10);
        answerLines.forEach((line: string) => { doc.text(line, ML + 5, y); y += 4.5; });
        
        doc.setTextColor(100, 100, 100);
        doc.text(`[${q.punteggio || 1} pt]`, ML + 5, y);
        doc.setTextColor(0, 0, 0);
        y += 6;
    });

    // ── Spazio annotazioni docente ──
    y = ensureSpace(doc, y, 40);
    y += 4;
    y = drawLine(doc, y);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('ANNOTAZIONI DOCENTE', ML, y);
    y += 8;
    doc.setFont('helvetica', 'normal');
    for (let l = 0; l < 5; l++) {
        doc.setDrawColor(200); doc.setLineWidth(0.15);
        doc.line(ML, y, PAGE_W - MR, y); y += 8;
    }

    outputPdf(doc, metadata.title, 'download', codice, true);
}

// ── Output PDF ──────────────────────────────────────────────────
function outputPdf(doc: jsPDF, title: string, mode: 'preview' | 'download', codice?: string, isTeacher?: boolean) {
    let cleanTitle = (title || 'verifica')
        .replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '')
        .trim()
        .replace(/\s+/g, '_');
    if (!cleanTitle) cleanTitle = 'verifica';

    const suffix = isTeacher ? '_DOCENTE' : '';
    const prefix = codice ? `${codice}_` : '';
    const fileName = `${prefix}${cleanTitle}${suffix}.pdf`;

    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    if (mode === 'preview') {
        const win = window.open(url, '_blank');
        if (!win) alert('Per favore consenti i popup per visualizzare l\'anteprima.');
    } else {
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(url), 60000);
    }
}

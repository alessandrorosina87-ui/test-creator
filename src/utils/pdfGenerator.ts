/**
 * pdfGenerator.ts
 * Genera un PDF strutturato per verifiche scolastiche con jsPDF.
 * Le domande vengono raggruppate per sezione (tipo).
 * Le risposte corrette NON compaiono mai nel PDF.
 */
import { jsPDF } from 'jspdf';
import type { Question, TestMetadata } from '../types';

// ── Costanti di layout ──────────────────────────────────────────
const PAGE_W = 210;            // A4 width  mm
const PAGE_H = 297;            // A4 height mm
const ML = 20;                 // margine sinistro
const MR = 20;                 // margine destro
const MT = 20;                 // margine superiore
const MB = 20;                 // margine inferiore
const CONTENT_W = PAGE_W - ML - MR;
const MAX_Y = PAGE_H - MB;

// ── Helpers ─────────────────────────────────────────────────────
function ensureSpace(doc: jsPDF, y: number, needed: number): number {
    if (y + needed > MAX_Y) {
        doc.addPage();
        return MT;
    }
    return y;
}

function drawLine(doc: jsPDF, y: number): number {
    doc.setDrawColor(180);
    doc.setLineWidth(0.3);
    doc.line(ML, y, PAGE_W - MR, y);
    return y + 4;
}

/** Wraps text and returns the lines array */
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

// ── Generazione PDF ─────────────────────────────────────────────
export function generateTestPdf(
    metadata: TestMetadata,
    questions: Question[],
    mode: 'preview' | 'download',
): void {
    const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });
    let y = MT;

    // ─── INTESTAZIONE ──────────────────────────────────────────
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
    ];
    const metaRight = [
        `Docente: ${metadata.teacherName || '____________________'}`,
        `Data: ${metadata.date || '____________________'}`,
    ];

    metaLeft.forEach((txt, i) => {
        doc.text(txt, ML, y);
        doc.text(metaRight[i], PAGE_W / 2 + 5, y);
        y += 6;
    });

    y += 4;

    // Nome studente + Firma
    doc.text('Nome e Cognome: _______________________________________________', ML, y);
    y += 8;

    y = drawLine(doc, y);
    y += 2;

    // ─── RAGGRUPPA DOMANDE PER TIPO ─────────────────────────────
    const order: Question['type'][] = ['MULTIPLE_CHOICE', 'TRUE_FALSE', 'FILL_IN_BLANK', 'OPEN_ENDED'];
    let globalNum = 1;

    for (const qType of order) {
        const group = questions.filter((q) => q.type === qType);
        if (group.length === 0) continue;

        // Titolo sezione
        y = ensureSpace(doc, y, 14);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(11);
        doc.text(SECTION_LABELS[qType], ML, y);
        y += 7;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);

        for (const q of group) {
            // ── Renderizza Immagini se presenti ──
            if (q.images && q.images.length > 0) {
                for (const imgData of q.images) {
                    try {
                        const props = doc.getImageProperties(imgData);
                        const ratio = props.height / props.width;
                        
                        // Limite massimo di 5cm (50mm) per lato
                        const MAX_IMG_DIM = 50; 
                        let imgW = Math.min(MAX_IMG_DIM, props.width);
                        let imgH = imgW * ratio;

                        // Se dopo il ridimensionamento della larghezza l'altezza supera ancora i 5cm
                        if (imgH > MAX_IMG_DIM) {
                            imgH = MAX_IMG_DIM;
                            imgW = imgH / ratio;
                        }

                        y = ensureSpace(doc, y, imgH + 5);
                        const x = ML + (CONTENT_W - imgW) / 2;
                        doc.addImage(imgData, 'JPEG', x, y, imgW, imgH);
                        y += imgH + 6;
                    } catch (e) {
                        console.error('Errore nel rendering dell\'immagine nel PDF', e);
                    }
                }
            }

            switch (q.type) {
                case 'MULTIPLE_CHOICE': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    const blockHeight = questionLines.length * 5 + q.options.length * 5 + 6;
                    y = ensureSpace(doc, y, blockHeight);

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    questionLines.forEach((line: string) => {
                        doc.text(line, ML, y);
                        y += 5;
                    });

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    q.options.forEach((opt: string, oi: number) => {
                        const letter = String.fromCharCode(65 + oi);
                        doc.text(`     ${letter}) ${opt}`, ML, y);
                        y += 5;
                    });
                    y += 4;
                    break;
                }

                case 'TRUE_FALSE': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    const blockHeight = questionLines.length * 5 + 10;
                    y = ensureSpace(doc, y, blockHeight);

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    questionLines.forEach((line: string) => {
                        doc.text(line, ML, y);
                        y += 5;
                    });

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
                    const blockHeight = questionLines.length * 5 + 4;
                    y = ensureSpace(doc, y, blockHeight);

                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(10);
                    questionLines.forEach((line: string) => {
                        doc.text(line, ML, y);
                        y += 5;
                    });
                    y += 4;
                    break;
                }

                case 'OPEN_ENDED': {
                    const questionLines = getWrapped(doc, `${globalNum}) ${q.text}`, CONTENT_W - 5);
                    const linesCount = q.lines || 3;
                    const blockHeight = questionLines.length * 5 + linesCount * 7 + 4;
                    y = ensureSpace(doc, y, blockHeight);

                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(10);
                    questionLines.forEach((line: string) => {
                        doc.text(line, ML, y);
                        y += 5;
                    });

                    doc.setFont('helvetica', 'normal');
                    y += 2;
                    for (let l = 0; l < linesCount; l++) {
                        doc.setDrawColor(160);
                        doc.setLineWidth(0.2);
                        doc.line(ML, y, PAGE_W - MR, y);
                        y += 7;
                    }
                    y += 2;
                    break;
                }
            }

            globalNum++;
        }

        // Separatore tra sezioni
        y += 2;
    }

    // Normalizziamo il titolo per evitare caratteri speciali che potrebbero corrompere il nome file in macOS/Safari
    let cleanTitle = (metadata.title || 'verifica')
        .replace(/[^a-zA-Z0-9\u00C0-\u017F\s-]/g, '') // Permette alfanumerici, accenti, spazi e trattini
        .trim()
        .replace(/\s+/g, '_');
        
    if (!cleanTitle) cleanTitle = 'verifica';
    
    const fileName = `${cleanTitle}.pdf`;

    // Metodo estremamente stabile: generiamo esplicitamente un Blob formattato correttamente
    const pdfBlob = doc.output('blob');
    const url = URL.createObjectURL(pdfBlob);

    if (mode === 'preview') {
        const win = window.open(url, '_blank');
        if (!win) {
            alert('Per favore consenti i popup per visualizzare l\'anteprima.');
        }
    } else {
        // Forza il download con l'attributo download in modo programmatico e universale
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName; // Forza Chrome/Safari a mantenere il nome del file intatto
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Ritardiamo massicciamente la distruzione dell'oggetto (1 minuto) per evitare 
        // che Safari interrompa prematuramente il download di file "in memory"
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 60000);
    }
}

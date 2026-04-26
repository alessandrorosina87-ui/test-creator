/**
 * verificheService.ts
 * Servizio CRUD per le verifiche su Cloud Firestore.
 * Gestisce codici progressivi, salvataggio, ricerca, modifica, eliminazione e duplicazione.
 */
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  runTransaction,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '../firebase';
import type { Question, TestMetadata, VerificaDB, DomandaDB, TestDocument } from '../types';

const VERIFICHE_COLLECTION = 'verifiche';
const CONTATORE_DOC = '_contatore';

// ── Genera il prossimo codice VER-XXXX con transazione atomica ──
export async function getNextCode(): Promise<string> {
  const contatoreRef = doc(db, VERIFICHE_COLLECTION, CONTATORE_DOC);

  const newCode = await runTransaction(db, async (transaction) => {
    const contatoreDoc = await transaction.get(contatoreRef);
    let ultimo = 0;
    if (contatoreDoc.exists()) {
      ultimo = contatoreDoc.data().ultimo_numero || 0;
    }
    const prossimo = ultimo + 1;
    transaction.set(contatoreRef, { ultimo_numero: prossimo, _tipo: 'contatore' });
    return `VER-${String(prossimo).padStart(4, '0')}`;
  });

  return newCode;
}

// ── Converte Question[] → DomandaDB[] per Firestore ──
function questionsToDomande(questions: Question[]): DomandaDB[] {
  return questions.map((q) => {
    const base: DomandaDB = {
      id: q.id || crypto.randomUUID(),
      tipo_domanda: q.type,
      testo_domanda: q.text || '',
      risposta_corretta: '',
      punteggio: q.punteggio || 1,
      immagini: q.images || [],
    };

    switch (q.type) {
      case 'MULTIPLE_CHOICE':
        if (q.options) {
          q.options.forEach((opt, i) => {
            const key = `opzione_${String.fromCharCode(97 + i)}` as keyof DomandaDB;
            (base as any)[key] = opt || '';
          });
        }
        base.risposta_corretta =
          q.correctAnswerIndex !== undefined
            ? String.fromCharCode(65 + q.correctAnswerIndex)
            : '';
        break;
      case 'TRUE_FALSE':
        base.risposta_corretta =
          q.correctAnswer === true ? 'Vero' : q.correctAnswer === false ? 'Falso' : '';
        break;
      case 'FILL_IN_BLANK':
        base.risposta_corretta = q.correctAnswers.join(', ');
        break;
      case 'OPEN_ENDED':
        base.risposta_corretta = '';
        base.soluzione_docente = q.teacherSolution || '';
        break;
    }
    return base;
  });
}

// ── Converte DomandaDB[] → Question[] dal database ──
function domandeToQuestions(domande: DomandaDB[]): Question[] {
  return domande.map((d) => {
    const base = {
      id: d.id,
      text: d.testo_domanda,
      images: d.immagini,
      punteggio: d.punteggio || 1,
    };

    switch (d.tipo_domanda) {
      case 'MULTIPLE_CHOICE': {
        const options: string[] = [];
        for (let i = 0; i < 6; i++) {
          const key = `opzione_${String.fromCharCode(97 + i)}` as keyof DomandaDB;
          const val = d[key];
          if (val !== undefined && val !== '') options.push(val as string);
        }
        const correctIdx = d.risposta_corretta
          ? d.risposta_corretta.charCodeAt(0) - 65
          : undefined;
        return { ...base, type: 'MULTIPLE_CHOICE' as const, options, correctAnswerIndex: correctIdx };
      }
      case 'TRUE_FALSE':
        return {
          ...base,
          type: 'TRUE_FALSE' as const,
          correctAnswer: d.risposta_corretta === 'Vero' ? true : d.risposta_corretta === 'Falso' ? false : undefined,
        };
      case 'FILL_IN_BLANK':
        return {
          ...base,
          type: 'FILL_IN_BLANK' as const,
          correctAnswers: d.risposta_corretta ? d.risposta_corretta.split(', ') : [],
        };
      case 'OPEN_ENDED':
        return {
          ...base,
          type: 'OPEN_ENDED' as const,
          lines: 4,
          teacherSolution: d.soluzione_docente || '',
        };
      default:
        return { ...base, type: 'OPEN_ENDED' as const, lines: 4 };
    }
  });
}

// ── Salva una nuova verifica ──
export async function salvaVerifica(
  metadata: TestMetadata,
  questions: Question[],
  codice: string,
): Promise<void> {
  const verificaData: VerificaDB = {
    codice_verifica: codice,
    titolo: sanitize(metadata.title || ''),
    materia: sanitize(metadata.subject || ''),
    classe: sanitize(metadata.class || ''),
    data_creazione: new Date().toISOString(),
    data_verifica: sanitize(metadata.date || ''),
    autore: sanitize(metadata.teacherName || ''),
    note: sanitize(metadata.note || ''),
    domande: questionsToDomande(questions),
  };

  await setDoc(doc(db, VERIFICHE_COLLECTION, codice), verificaData);
}

// ── Ottieni tutte le verifiche (ordinamento) ──
export async function getVerifiche(): Promise<VerificaDB[]> {
  // Prendi tutti e filtra manualmente il contatore
  const snapshot = await getDocs(
    query(collection(db, VERIFICHE_COLLECTION), orderBy('codice_verifica'))
  );
  
  const risultati: VerificaDB[] = [];
  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    if (data._tipo !== 'contatore' && data.codice_verifica) {
      risultati.push(data as VerificaDB);
    }
  });
  return risultati;
}

// ── Ricerca verifiche con filtri ──
export async function cercaVerifiche(filtri: {
  codice?: string;
  titolo?: string;
  materia?: string;
  classe?: string;
  autore?: string;
}): Promise<VerificaDB[]> {
  // Ottieni tutte e filtra client-side (Firestore non supporta LIKE nativo)
  const tutte = await getVerifiche();
  
  return tutte.filter((v) => {
    if (filtri.codice && !v.codice_verifica.toLowerCase().includes(filtri.codice.toLowerCase()))
      return false;
    if (filtri.titolo && !v.titolo.toLowerCase().includes(filtri.titolo.toLowerCase()))
      return false;
    if (filtri.materia && !v.materia.toLowerCase().includes(filtri.materia.toLowerCase()))
      return false;
    if (filtri.classe && !v.classe.toLowerCase().includes(filtri.classe.toLowerCase()))
      return false;
    if (filtri.autore && !v.autore.toLowerCase().includes(filtri.autore.toLowerCase()))
      return false;
    return true;
  });
}

// ── Ottieni singola verifica ──
export async function getVerifica(codice: string): Promise<{ verifica: VerificaDB; questions: Question[] } | null> {
  const docSnap = await getDoc(doc(db, VERIFICHE_COLLECTION, codice));
  if (!docSnap.exists()) return null;
  
  const data = docSnap.data() as VerificaDB;
  return {
    verifica: data,
    questions: domandeToQuestions(data.domande),
  };
}

// ── Aggiorna verifica esistente ──
export async function aggiornaVerifica(
  codice: string,
  metadata: TestMetadata,
  questions: Question[],
): Promise<void> {
  const ref = doc(db, VERIFICHE_COLLECTION, codice);
  await updateDoc(ref, {
    titolo: sanitize(metadata.title || ''),
    materia: sanitize(metadata.subject || ''),
    classe: sanitize(metadata.class || ''),
    data_verifica: sanitize(metadata.date || ''),
    autore: sanitize(metadata.teacherName || ''),
    note: sanitize(metadata.note || ''),
    domande: questionsToDomande(questions),
  });
}

// ── Elimina verifica ──
export async function eliminaVerifica(codice: string): Promise<void> {
  await deleteDoc(doc(db, VERIFICHE_COLLECTION, codice));
}

// ── Duplica verifica con nuovo codice ──
export async function duplicaVerifica(codiceOrigine: string): Promise<string> {
  const originale = await getVerifica(codiceOrigine);
  if (!originale) throw new Error('Verifica originale non trovata');

  const nuovoCodice = await getNextCode();
  const { verifica } = originale;

  const nuovaVerifica: VerificaDB = {
    ...verifica,
    codice_verifica: nuovoCodice,
    titolo: `${verifica.titolo} (copia)`,
    data_creazione: new Date().toISOString(),
    domande: verifica.domande.map((d) => ({ ...d, id: crypto.randomUUID() })),
  };

  await setDoc(doc(db, VERIFICHE_COLLECTION, nuovoCodice), nuovaVerifica);
  return nuovoCodice;
}

// ── Conta verifiche totali ──
export async function contaVerifiche(): Promise<number> {
  const tutte = await getVerifiche();
  return tutte.length;
}

// ── Sanitizzazione input ──
function sanitize(input: string): string {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .trim();
}

// ── Utility: converti VerificaDB in TestDocument ──
export function verificaToTestDocument(verifica: VerificaDB, questions: Question[]): TestDocument {
  return {
    metadata: {
      title: verifica.titolo,
      subject: verifica.materia,
      class: verifica.classe,
      date: verifica.data_verifica,
      teacherName: verifica.autore,
      note: verifica.note,
    },
    questions,
    codiceVerifica: verifica.codice_verifica,
  };
}

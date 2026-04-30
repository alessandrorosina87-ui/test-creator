/**
 * ══════════════════════════════════════════════════════════════════
 *  BRUTE FORCE SIMULATOR — Versione corretta e didattica
 * ══════════════════════════════════════════════════════════════════
 *
 *  SCOPO: Simulare un attacco brute force sequenziale su una password,
 *  generando TUTTE le combinazioni possibili in ordine lessicografico
 *  fino a trovare quella corretta.
 *
 *  ALGORITMO: Contatore in base N
 *  - Il charset ha N caratteri (es. 26 lettere = base 26)
 *  - Ogni combinazione corrisponde a un numero intero
 *  - Convertiamo l'intero nella "base N" mappando ogni cifra al charset
 *
 *  ESEMPIO con charset = "abc" (base 3), lunghezza 2:
 *    i=0 → [0,0] → "aa"
 *    i=1 → [0,1] → "ab"
 *    i=2 → [0,2] → "ac"
 *    i=3 → [1,0] → "ba"
 *    i=4 → [1,1] → "bb"
 *    ...
 *    i=8 → [2,2] → "cc"
 *
 * ══════════════════════════════════════════════════════════════════
 */

// ── Charset disponibile ──
const CHARSET = 'abcdefghijklmnopqrstuvwxyz';

// ── Password da "craccare" (modificabile per i test) ──
const TARGET_PASSWORD = 'aa';

// ── Limite massimo di tentativi da stampare a schermo ──
const MAX_PRINT = 30;

/**
 * ════════════════════════════════════════════════════════════
 *  FUNZIONE CORE: Converte un intero in una stringa base-N
 * ════════════════════════════════════════════════════════════
 *
 *  Questa è la funzione che era BUGGATA nel codice originale.
 *
 *  ❌ BUG ORIGINALE (una delle varianti più comuni):
 *
 *     function indexToString(index, length, charset) {
 *       let attempt = '';
 *       for (let pos = 0; pos < length; pos++) {
 *         attempt += charset[0];   // ← Sempre il primo carattere!
 *       }                          //   L'indice `index` non viene MAI usato
 *       return attempt;
 *     }
 *
 *  Oppure:
 *
 *     function indexToString(index, length, charset) {
 *       let n = index;
 *       let chars = new Array(length).fill(charset[0]);
 *       // ← Manca completamente il loop di conversione!
 *       return chars.join('');
 *     }
 *
 *  Oppure (la più insidiosa):
 *
 *     function indexToString(index, length, charset) {
 *       let n = index;
 *       let result = '';
 *       for (let pos = 0; pos < length; pos++) {
 *         result += charset[n % charset.length];
 *         // ❌ MANCA: n = Math.floor(n / charset.length);
 *         // Senza questa riga, `n` non cambia mai → stessa cifra per tutte le posizioni
 *       }
 *       return result;
 *     }
 *
 *  ✅ VERSIONE CORRETTA (sotto):
 *
 *  L'algoritmo è identico alla conversione decimale → base N:
 *  - Prendi il resto (%) per ottenere la cifra meno significativa
 *  - Dividi per N (floor) per passare alla cifra successiva
 *  - Ripeti per ogni posizione
 *  - Costruisci la stringa da DESTRA a SINISTRA (LSB → MSB)
 *
 * @param {number} index   - L'indice della combinazione (0, 1, 2, ...)
 * @param {number} length  - La lunghezza della password da generare
 * @param {string} charset - I caratteri disponibili
 * @returns {string} La combinazione corrispondente
 */
function indexToString(index, length, charset) {
  const base = charset.length;
  let n = index;

  // Creiamo un array vuoto di `length` posizioni
  const chars = new Array(length);

  // Riempiamo DA DESTRA A SINISTRA (come la conversione di base)
  //
  // Perché da destra? Perché il modulo (%) ci dà la cifra MENO significativa,
  // che corrisponde all'ultimo carattere della stringa.
  //
  // Esempio: i=27, base=26, length=2
  //   Passo 1: 27 % 26 = 1  → charset[1] = 'b'  → posizione 1 (destra)
  //            27 / 26 = 1
  //   Passo 2:  1 % 26 = 1  → charset[1] = 'b'  → posizione 0 (sinistra)
  //   Risultato: "bb" ✅

  for (let pos = length - 1; pos >= 0; pos--) {
    chars[pos] = charset[n % base];  // ← Cifra corrente
    n = Math.floor(n / base);        // ← CRUCIALE: aggiorna n per la prossima cifra!
  }

  return chars.join('');
}

/**
 * ════════════════════════════════════════════════════════════
 *  SIMULAZIONE BRUTE FORCE
 * ════════════════════════════════════════════════════════════
 */
function bruteForceAttack(targetPassword) {
  const length = targetPassword.length;
  const base = CHARSET.length;
  const totalCombinations = Math.pow(base, length);

  console.log('');
  console.log('══════════════════════════════════════════════════');
  console.log('  🔓 BRUTE FORCE SIMULATOR');
  console.log('══════════════════════════════════════════════════');
  console.log(`  Password target  : ${'*'.repeat(length)} (${length} caratteri)`);
  console.log(`  Charset          : a-z (${base} simboli)`);
  console.log(`  Combinazioni     : ${base}^${length} = ${totalCombinations.toLocaleString()}`);
  console.log('══════════════════════════════════════════════════');
  console.log('');

  const startTime = performance.now();
  let found = false;
  let attempts = 0;
  let printed = 0;

  for (let i = 0; i < totalCombinations; i++) {
    // ┌──────────────────────────────────────────────────────┐
    // │  Genera la combinazione i-esima                      │
    // │  Questa è la riga che nel codice buggato restituiva  │
    // │  SEMPRE "aa" perché non convertiva correttamente     │
    // │  l'indice in stringa base-N                          │
    // └──────────────────────────────────────────────────────┘
    const attempt = indexToString(i, length, CHARSET);
    attempts++;

    // Stampa a schermo (con limite per non intasare il terminale)
    if (printed < MAX_PRINT) {
      console.log(`  [TRY #${String(attempts).padStart(4, '0')}]  ${attempt}  =>  Access Denied`);
      printed++;
    } else if (printed === MAX_PRINT) {
      console.log(`  ...`);
      console.log(`  (${totalCombinations - MAX_PRINT} tentativi restanti omessi per brevità)`);
      console.log(`  ...`);
      printed++;
    }

    // ── Confronto con la password target ──
    if (attempt === targetPassword) {
      found = true;
      const elapsed = (performance.now() - startTime).toFixed(2);

      console.log('');
      console.log('  ╔══════════════════════════════════════════╗');
      console.log(`  ║  ✅ PASSWORD TROVATA: "${attempt}"`.padEnd(46) + '║');
      console.log('  ╠══════════════════════════════════════════╣');
      console.log(`  ║  Tentativi: ${attempts.toLocaleString().padEnd(30)}║`);
      console.log(`  ║  Tempo    : ${elapsed} ms`.padEnd(46) + '║');
      console.log(`  ║  Velocità : ~${Math.round(attempts / (elapsed / 1000)).toLocaleString()} tentativi/sec`.padEnd(46) + '║');
      console.log('  ╚══════════════════════════════════════════╝');
      console.log('');
      break; // ← STOP! Non continuare dopo aver trovato la password
    }
  }

  if (!found) {
    console.log('\n  ❌ Password non trovata (fuori dal charset o lunghezza errata)\n');
  }

  return { found, attempts };
}

// ── Verifica correttezza del generatore (unit test rapido) ──
function selfTest() {
  console.log('── Self-test generatore ──');
  const tests = [
    { index: 0,   length: 2, expected: 'aa' },
    { index: 1,   length: 2, expected: 'ab' },
    { index: 25,  length: 2, expected: 'az' },
    { index: 26,  length: 2, expected: 'ba' },
    { index: 27,  length: 2, expected: 'bb' },
    { index: 675, length: 2, expected: 'zz' },
    { index: 0,   length: 3, expected: 'aaa' },
    { index: 1,   length: 3, expected: 'aab' },
  ];

  let allPassed = true;
  for (const t of tests) {
    const result = indexToString(t.index, t.length, CHARSET);
    const ok = result === t.expected;
    if (!ok) allPassed = false;
    console.log(`  i=${String(t.index).padStart(3)} len=${t.length}  →  "${result}"  ${ok ? '✅' : `❌ (atteso "${t.expected}")`}`);
  }
  console.log(allPassed ? '  ✅ Tutti i test passati!\n' : '  ❌ ERRORI nei test!\n');
  return allPassed;
}

// ══════════════════════════════════════════════════════════════
//  ESECUZIONE
// ══════════════════════════════════════════════════════════════

selfTest();
bruteForceAttack(TARGET_PASSWORD);
